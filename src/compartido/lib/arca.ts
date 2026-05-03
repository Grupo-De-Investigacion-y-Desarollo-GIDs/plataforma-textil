import Afip from '@afipsdk/afip.js'
import { prisma } from './prisma'
import { logActividad } from './log'
import type { TipoInscripcionAfip, EstadoCuit } from '@prisma/client'

// ---------------------------------------------------------------------------
// Configuración
// ---------------------------------------------------------------------------

function getConfig() {
  return {
    enabled: process.env.ARCA_ENABLED !== 'false',
    provider: (process.env.ARCA_PROVIDER as 'afipsdk' | 'mock') ?? 'afipsdk',
    cuitPlataforma: process.env.AFIP_CUIT_PLATAFORMA ?? '',
    accessToken: process.env.AFIP_SDK_TOKEN ?? '',
    production: process.env.AFIP_SDK_ENV?.trim() === 'production',
    cert: process.env.AFIP_CERT ?? '',
    key: process.env.AFIP_KEY ?? '',
  }
}

let cliente: InstanceType<typeof Afip> | null = null

function getCliente(): InstanceType<typeof Afip> {
  if (!cliente) {
    const config = getConfig()
    if (!config.cuitPlataforma || !config.accessToken) {
      throw new Error('AFIP_CUIT_PLATAFORMA y AFIP_SDK_TOKEN son requeridos')
    }
    cliente = new Afip({
      CUIT: config.cuitPlataforma,
      production: config.production,
      access_token: config.accessToken,
      ...(config.cert && config.key ? { cert: config.cert, key: config.key } : {}),
    })
  }
  return cliente
}

// ---------------------------------------------------------------------------
// Tipos públicos
// ---------------------------------------------------------------------------

export interface DatosArca {
  cuit: string
  nombre: string
  tipoInscripcion: TipoInscripcionAfip
  categoriaMonotributo?: string
  estadoCuit: EstadoCuit
  fechaInscripcion?: Date
  actividades: string[]
  domicilioFiscal?: { provincia?: string; localidad?: string; calle?: string }
}

export interface ResultadoConsulta {
  exitosa: boolean
  datos?: DatosArca
  error?: string
  duracionMs: number
}

// Placeholder para mensajes al usuario — se define [contacto-pdt] después
const CONTACTO_PDT = '[contacto-pdt]'

// Mensajes de error orientados al usuario
export const MENSAJES_ERROR = {
  CUIT_INEXISTENTE: 'No encontramos este CUIT en ARCA. Verifica los numeros — son 11 digitos sin guiones.',
  CUIT_INACTIVO: `Tu CUIT figura como inactivo o dado de baja en ARCA. Si necesitas regularizar tu situacion fiscal, escribinos a ${CONTACTO_PDT} y te acompanamos.`,
  CUIT_SIN_ACTIVIDAD: `Tu CUIT existe pero no tiene actividad economica registrada en ARCA. Para usar la plataforma como taller, necesitas tener actividad economica vigente. Escribinos a ${CONTACTO_PDT} para asesorarte.`,
  ARCA_NO_RESPONDE: 'ARCA no esta respondiendo en este momento. Te dejamos continuar con el registro — vamos a verificar tu CUIT automaticamente cuando ARCA este disponible. Mientras tanto, podes navegar la plataforma y subir documentos.',
  AFIPSDK_ERROR: 'No se pudo verificar el CUIT en este momento. Te dejamos continuar — vamos a verificar automaticamente mas tarde.',
} as const

// Códigos de error internos
export type CodigoErrorArca =
  | 'CUIT_INEXISTENTE'
  | 'CUIT_INACTIVO'
  | 'CUIT_SIN_ACTIVIDAD'
  | 'ARCA_NO_RESPONDE'
  | 'AFIPSDK_ERROR'

// ---------------------------------------------------------------------------
// Función principal: consultarPadron
// ---------------------------------------------------------------------------

export async function consultarPadron(cuit: string, tallerId?: string): Promise<ResultadoConsulta> {
  const inicio = Date.now()
  const config = getConfig()

  if (!config.enabled || config.provider === 'mock') {
    return mockConsulta(cuit)
  }

  try {
    const sdk = getCliente()
    const cuitNumero = parseInt(cuit.replace(/-/g, ''), 10)

    // Timeout de 10 segundos para no bloquear registro si ARCA tarda
    const respuesta = await Promise.race([
      sdk.RegisterScopeThirteen.getTaxpayerDetails(cuitNumero),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout: ARCA no respondio en 10s')), 10_000)
      ),
    ])

    if (!respuesta) {
      await registrarConsulta(tallerId, cuit, 'padron-a13', false, null, 'CUIT_INEXISTENTE', inicio)
      logAfipVerificacion(tallerId, cuit, false, 'CUIT_INEXISTENTE')
      return { exitosa: false, error: 'CUIT_INEXISTENTE', duracionMs: Date.now() - inicio }
    }

    if (typeof respuesta === 'string') {
      throw new Error('Respuesta invalida de ARCA — verificar token y plan')
    }

    const datos = mapearRespuesta(cuit, respuesta)

    // Verificar estado del CUIT
    if (datos.estadoCuit === 'INACTIVO' || datos.estadoCuit === 'BAJA') {
      await registrarConsulta(tallerId, cuit, 'padron-a13', true, limpiarDatosSensibles(respuesta), 'CUIT_INACTIVO', inicio)
      logAfipVerificacion(tallerId, cuit, false, 'CUIT_INACTIVO')
      return { exitosa: false, error: 'CUIT_INACTIVO', datos, duracionMs: Date.now() - inicio }
    }

    // Verificar actividades económicas
    if (datos.actividades.length === 0) {
      await registrarConsulta(tallerId, cuit, 'padron-a13', true, limpiarDatosSensibles(respuesta), 'CUIT_SIN_ACTIVIDAD', inicio)
      logAfipVerificacion(tallerId, cuit, false, 'CUIT_SIN_ACTIVIDAD')
      return { exitosa: false, error: 'CUIT_SIN_ACTIVIDAD', datos, duracionMs: Date.now() - inicio }
    }

    await registrarConsulta(tallerId, cuit, 'padron-a13', true, limpiarDatosSensibles(respuesta), null, inicio)
    logAfipVerificacion(tallerId, cuit, true, null)

    return { exitosa: true, datos, duracionMs: Date.now() - inicio }
  } catch (error: unknown) {
    const codigo = clasificarError(error)
    await registrarConsulta(tallerId, cuit, 'padron-a13', false, null, codigo, inicio)
    logAfipVerificacion(tallerId, cuit, false, codigo)

    return {
      exitosa: false,
      error: codigo,
      duracionMs: Date.now() - inicio,
    }
  }
}

// ---------------------------------------------------------------------------
// Sincronización de taller existente
// ---------------------------------------------------------------------------

export async function sincronizarTaller(tallerId: string, force = false): Promise<ResultadoConsulta> {
  const taller = await prisma.taller.findUnique({
    where: { id: tallerId },
    select: { id: true, cuit: true, verificadoAfipAt: true },
  })

  if (!taller?.cuit) {
    return { exitosa: false, error: 'Taller sin CUIT', duracionMs: 0 }
  }

  // Solo re-sincronizar si pasaron más de 30 días o si force=true
  if (!force && taller.verificadoAfipAt) {
    const diasDesdeUltima = (Date.now() - taller.verificadoAfipAt.getTime()) / (1000 * 60 * 60 * 24)
    if (diasDesdeUltima < 30) {
      return { exitosa: true, duracionMs: 0 }
    }
  }

  const resultado = await consultarPadron(taller.cuit, taller.id)

  if (resultado.exitosa && resultado.datos) {
    await prisma.taller.update({
      where: { id: tallerId },
      data: {
        verificadoAfip: true,
        verificadoAfipAt: new Date(),
        tipoInscripcionAfip: resultado.datos.tipoInscripcion,
        categoriaMonotributo: resultado.datos.categoriaMonotributo ?? null,
        estadoCuitAfip: resultado.datos.estadoCuit,
        fechaInscripcionAfip: resultado.datos.fechaInscripcion ?? null,
        actividadesAfip: resultado.datos.actividades,
        domicilioFiscalAfip: resultado.datos.domicilioFiscal ?? undefined,
      },
    })
  } else if (resultado.error === 'CUIT_INACTIVO' || resultado.error === 'CUIT_INEXISTENTE') {
    // Marcar como no verificado si ARCA dice explicitamente que no es valido
    await prisma.taller.update({
      where: { id: tallerId },
      data: {
        verificadoAfip: false,
        verificadoAfipAt: new Date(),
        estadoCuitAfip: resultado.datos?.estadoCuit ?? 'INACTIVO',
      },
    })
  }
  // Si es ARCA_NO_RESPONDE o AFIPSDK_ERROR, no tocamos el estado actual

  return resultado
}

// ---------------------------------------------------------------------------
// Mapeo de respuesta ARCA → DatosArca
// ---------------------------------------------------------------------------

function mapearRespuesta(cuit: string, data: Record<string, unknown>): DatosArca {
  // IMPORTANTE: estos paths se basan en la documentación de ws_sr_padron_a10
  // y deben validarse con la primera consulta real exitosa con plan Pro
  const dg = (data.datosGenerales ?? data) as Record<string, unknown>

  return {
    cuit,
    nombre: (dg.razonSocial ?? dg.denominacion ?? data.denominacion ?? '') as string,
    tipoInscripcion: mapearTipoInscripcion(dg.categoriaIva as string | undefined),
    categoriaMonotributo: (dg.categoriaMonotributo as string) ?? undefined,
    estadoCuit: mapearEstadoCuit((dg.estadoClave ?? data.estadoClave) as string | undefined),
    fechaInscripcion: dg.fechaInscripcion ? new Date(dg.fechaInscripcion as string) : undefined,
    actividades: mapearActividades(data.actividades ?? dg.actividades),
    domicilioFiscal: mapearDomicilio(data.domicilioFiscal ?? dg.domicilioFiscal),
  }
}

function mapearTipoInscripcion(valor: string | undefined): TipoInscripcionAfip {
  if (!valor) return 'NO_INSCRIPTO'
  const v = valor.toUpperCase()
  if (v.includes('MONOTRIBUTO')) return 'MONOTRIBUTO'
  if (v.includes('RESPONSABLE INSCRIPTO') || v.includes('IVA')) return 'RESPONSABLE_INSCRIPTO'
  if (v.includes('EXENTO')) return 'EXENTO'
  return 'NO_INSCRIPTO'
}

function mapearEstadoCuit(valor: string | undefined): EstadoCuit {
  if (!valor) return 'ACTIVO'
  const v = valor.toUpperCase()
  if (v === 'ACTIVO') return 'ACTIVO'
  if (v === 'INACTIVO') return 'INACTIVO'
  if (v.includes('BAJA')) return 'BAJA'
  return 'SUSPENDIDO'
}

function mapearActividades(valor: unknown): string[] {
  if (!Array.isArray(valor)) return []
  return valor.map((a: Record<string, unknown>) =>
    String(a.idActividad ?? a.codigo ?? a)
  )
}

function mapearDomicilio(valor: unknown): DatosArca['domicilioFiscal'] {
  if (!valor || typeof valor !== 'object') return undefined
  const d = valor as Record<string, unknown>
  return {
    provincia: (d.descripcionProvincia ?? d.provincia) as string | undefined,
    localidad: d.localidad as string | undefined,
    calle: (d.direccion ?? d.calle) as string | undefined,
  }
}

// ---------------------------------------------------------------------------
// Registro y logging
// ---------------------------------------------------------------------------

async function registrarConsulta(
  tallerId: string | undefined,
  cuit: string,
  endpoint: string,
  exitosa: boolean,
  respuesta: unknown,
  error: string | null,
  inicio: number,
) {
  prisma.consultaArca.create({
    data: {
      tallerId: tallerId ?? null,
      cuit,
      endpoint,
      exitosa,
      respuesta: respuesta as object ?? undefined,
      error,
      duracionMs: Date.now() - inicio,
    },
  }).catch((err) => console.error('Error registrando consulta ARCA:', err))
}

function logAfipVerificacion(tallerId: string | undefined, cuit: string, exitosa: boolean, error: string | null) {
  logActividad('AFIP_VERIFICACION', null, {
    tallerId: tallerId ?? null,
    cuit,
    exitosa,
    error,
  })
}

// ---------------------------------------------------------------------------
// Clasificación de errores
// ---------------------------------------------------------------------------

function clasificarError(error: unknown): CodigoErrorArca {
  const msg = error instanceof Error ? error.message : String(error)
  if (msg.includes('Unauthorized') || msg.includes('401') || msg.includes('token')) {
    return 'AFIPSDK_ERROR'
  }
  if (msg.includes('ECONNREFUSED') || msg.includes('timeout') || msg.includes('ETIMEDOUT') || msg.includes('503')) {
    return 'ARCA_NO_RESPONDE'
  }
  if (msg.includes('No existe') || msg.includes('not found')) {
    return 'CUIT_INEXISTENTE'
  }
  return 'AFIPSDK_ERROR'
}

function limpiarDatosSensibles(data: Record<string, unknown>): object {
  const copia = { ...data }
  // No incluir datos personales del representante legal
  delete copia.representante
  delete copia.datosPersonales
  return copia
}

// ---------------------------------------------------------------------------
// Mock para desarrollo / tests
// ---------------------------------------------------------------------------

function mockConsulta(cuit: string): ResultadoConsulta {
  // CUITs específicos para testing de errores
  if (cuit.replace(/-/g, '') === '00000000000') {
    return { exitosa: false, error: 'CUIT_INEXISTENTE', duracionMs: 10 }
  }
  if (cuit.replace(/-/g, '') === '11111111111') {
    return { exitosa: false, error: 'CUIT_INACTIVO', duracionMs: 10, datos: {
      cuit, nombre: 'TALLER INACTIVO SRL', tipoInscripcion: 'MONOTRIBUTO',
      estadoCuit: 'INACTIVO', actividades: ['181000'], domicilioFiscal: { provincia: 'Buenos Aires' },
    }}
  }

  return {
    exitosa: true,
    datos: {
      cuit,
      nombre: 'TALLER MOCK SRL',
      tipoInscripcion: 'MONOTRIBUTO',
      categoriaMonotributo: 'A',
      estadoCuit: 'ACTIVO',
      actividades: ['181000', '181100'],
      domicilioFiscal: { provincia: 'Buenos Aires', localidad: 'Quilmes', calle: 'San Martin 1234' },
    },
    duracionMs: 50,
  }
}

// Helpers para obtener mensaje de error orientado al usuario
export function mensajeErrorArca(codigo: string): string {
  return MENSAJES_ERROR[codigo as keyof typeof MENSAJES_ERROR] ?? MENSAJES_ERROR.AFIPSDK_ERROR
}

// Helper para verificar si el error bloquea el registro
export function errorBloqueaRegistro(codigo: string): boolean {
  return codigo === 'CUIT_INEXISTENTE' || codigo === 'CUIT_INACTIVO' || codigo === 'CUIT_SIN_ACTIVIDAD'
}
