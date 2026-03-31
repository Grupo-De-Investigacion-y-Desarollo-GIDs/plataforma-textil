import { prisma } from '@/lib/prisma'

export type NivelTaller = 'BRONCE' | 'PLATA' | 'ORO'

export interface ResultadoNivel {
  nivel: NivelTaller
  puntaje: number
}

export interface DatosTaller {
  verificadoAfip: boolean
  tiposValidacionCompletados: string[]
  numCertificadosActivos: number
}

// Validaciones requeridas para cada nivel
// Deben coincidir con tiposValidacion en /taller/formalizacion/page.tsx
export const VALIDACIONES_PLATA = ['CUIT_MONOTRIBUTO', 'HABILITACION_MUNICIPAL', 'ART']
export const VALIDACIONES_ORO = [
  ...VALIDACIONES_PLATA,
  'INSCRIPCION_EMPLEADOR',
  'HABILITACION_BOMBEROS',
  'SEGURIDAD_HIGIENE',
  'LIBRO_SUELDOS',
]

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

  // Determinar nivel
  let nivel: NivelTaller = 'BRONCE'

  const tienePlata =
    datos.verificadoAfip &&
    VALIDACIONES_PLATA.every((v) => tiposCompletados.has(v)) &&
    numCertificados >= 1

  if (tienePlata) {
    nivel = 'PLATA'

    const tieneOro = VALIDACIONES_ORO.every((v) => tiposCompletados.has(v))
    if (tieneOro) {
      nivel = 'ORO'
    }
  }

  return { nivel, puntaje }
}

export async function calcularNivel(tallerId: string): Promise<ResultadoNivel> {
  const taller = await prisma.taller.findUnique({
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
  })

  if (!taller) throw new Error(`Taller ${tallerId} no encontrado`)

  return calcularNivelPuro({
    verificadoAfip: taller.verificadoAfip,
    tiposValidacionCompletados: taller.validaciones.map((v) => v.tipo),
    numCertificadosActivos: taller.certificados.length,
  })
}

export async function aplicarNivel(tallerId: string): Promise<ResultadoNivel> {
  const resultado = await calcularNivel(tallerId)

  await prisma.taller.update({
    where: { id: tallerId },
    data: {
      nivel: resultado.nivel,
      puntaje: resultado.puntaje,
    },
  })

  return resultado
}
