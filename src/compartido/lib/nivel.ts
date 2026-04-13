import { prisma } from '@/compartido/lib/prisma'
import { logActividad } from './log'

export type NivelTaller = 'BRONCE' | 'PLATA' | 'ORO'

export interface ResultadoNivel {
  nivel: NivelTaller
  puntaje: number
}

export interface DatosTaller {
  verificadoAfip: boolean
  tiposValidacionCompletados: string[]
  numCertificadosActivos: number
  tiposPlata: string[]
  tiposOro: string[]
}

// Puntaje
export const PTS_VERIFICADO_AFIP = 10
export const PTS_POR_VALIDACION = 10
export const PTS_POR_CERTIFICADO = 15
export const PUNTAJE_MAX = 100

/** Pure function: calcula nivel y puntaje sin acceder a la DB */
export function calcularNivelPuro(datos: DatosTaller): ResultadoNivel {
  const tiposCompletados = new Set(datos.tiposValidacionCompletados)
  const numValidaciones = datos.tiposValidacionCompletados.length
  const numCertificados = datos.numCertificadosActivos

  // Calcular puntaje
  let puntaje = 0
  if (datos.verificadoAfip) puntaje += PTS_VERIFICADO_AFIP
  puntaje += numValidaciones * PTS_POR_VALIDACION
  puntaje += numCertificados * PTS_POR_CERTIFICADO
  puntaje = Math.min(puntaje, PUNTAJE_MAX)

  // Determinar nivel usando los parámetros
  let nivel: NivelTaller = 'BRONCE'

  const tienePlata =
    datos.verificadoAfip &&
    datos.tiposPlata.every((v) => tiposCompletados.has(v)) &&
    numCertificados >= 1

  if (tienePlata) {
    nivel = 'PLATA'

    // Para ORO se requieren TODOS los de PLATA + TODOS los de ORO
    const tieneOro = [...datos.tiposPlata, ...datos.tiposOro].every((v) =>
      tiposCompletados.has(v)
    )
    if (tieneOro) {
      nivel = 'ORO'
    }
  }

  return { nivel, puntaje }
}

export async function calcularNivel(tallerId: string): Promise<ResultadoNivel> {
  const [taller, tiposRequeridos] = await Promise.all([
    prisma.taller.findUnique({
      where: { id: tallerId },
      select: {
        verificadoAfip: true,
        validaciones: {
          where: { estado: 'COMPLETADO' },
          select: { tipo: true },
        },
        certificados: {
          where: { revocado: false },
          select: { id: true },
        },
      },
    }),
    prisma.tipoDocumento.findMany({
      where: { requerido: true, activo: true },
      select: { nombre: true, nivelMinimo: true },
    }),
  ])

  if (!taller) throw new Error(`Taller ${tallerId} no encontrado`)

  const tiposPlata = tiposRequeridos
    .filter(t => t.nivelMinimo === 'PLATA')
    .map(t => t.nombre)
  const tiposOro = tiposRequeridos
    .filter(t => t.nivelMinimo === 'ORO')
    .map(t => t.nombre)

  return calcularNivelPuro({
    verificadoAfip: taller.verificadoAfip,
    tiposValidacionCompletados: taller.validaciones.map((v) => v.tipo),
    numCertificadosActivos: taller.certificados.length,
    tiposPlata,
    tiposOro,
  })
}

export async function aplicarNivel(tallerId: string, userId?: string): Promise<ResultadoNivel> {
  // Leer nivel actual antes del calculo
  const tallerActual = await prisma.taller.findUnique({
    where: { id: tallerId },
    select: { nivel: true },
  })
  const nivelAnterior = tallerActual?.nivel ?? 'BRONCE'

  const resultado = await calcularNivel(tallerId)

  await prisma.taller.update({
    where: { id: tallerId },
    data: {
      nivel: resultado.nivel,
      puntaje: resultado.puntaje,
    },
  })

  // Loguear si el nivel cambio
  if (nivelAnterior !== resultado.nivel) {
    const orden: Record<string, number> = { BRONCE: 0, PLATA: 1, ORO: 2 }
    const accion = orden[resultado.nivel] > orden[nivelAnterior] ? 'NIVEL_SUBIDO' : 'NIVEL_BAJADO'
    logActividad(accion, userId, {
      tallerId,
      nivelAnterior,
      nivelNuevo: resultado.nivel,
    })
  }

  return resultado
}
