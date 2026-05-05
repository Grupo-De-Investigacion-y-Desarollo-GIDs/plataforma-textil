import { prisma } from '@/compartido/lib/prisma'
import { logActividad } from './log'
import { generarMensajeWhatsapp } from './whatsapp'
import type { NivelTaller, ReglaNivel } from '@prisma/client'

export type { NivelTaller }

export interface ResultadoNivel {
  nivel: NivelTaller
  puntaje: number
}

export interface ProximoNivelInfo {
  nivelActual: NivelTaller
  nivelProximo: NivelTaller | null
  puntosActuales: number
  puntosObjetivo: number
  puntosFaltantes: number
  documentosFaltantes: {
    id: string
    nombre: string
    label: string
    nivelMinimo: NivelTaller
    puntos: number
    requerido: boolean
  }[]
  requiereAfip: boolean
  tieneAfip: boolean
  certificadosFaltantes: number
  beneficiosProximoNivel: string[]
}

// --- Cache in-memory con TTL 60s (mismo patron S-03) ---

interface TipoDocCache {
  id: string
  nombre: string
  label: string
  nivelMinimo: NivelTaller
  requerido: boolean
  puntosOtorgados: number
}

const cacheReglas = new Map<string, { data: ReglaNivel[]; expira: number }>()
const cacheTipos = new Map<string, { data: TipoDocCache[]; expira: number }>()
const CACHE_TTL_MS = 60_000

async function getReglasNivel(): Promise<ReglaNivel[]> {
  const cached = cacheReglas.get('all')
  if (cached && cached.expira > Date.now()) return cached.data
  const data = await prisma.reglaNivel.findMany({ orderBy: { puntosMinimos: 'desc' } })
  cacheReglas.set('all', { data, expira: Date.now() + CACHE_TTL_MS })
  return data
}

async function getTiposActivos(): Promise<TipoDocCache[]> {
  const cached = cacheTipos.get('all')
  if (cached && cached.expira > Date.now()) return cached.data
  const data = await prisma.tipoDocumento.findMany({
    where: { activo: true, requerido: true },
    select: { id: true, nombre: true, label: true, nivelMinimo: true, requerido: true, puntosOtorgados: true },
  })
  cacheTipos.set('all', { data, expira: Date.now() + CACHE_TTL_MS })
  return data
}

export function invalidarCacheNivel() {
  cacheReglas.clear()
  cacheTipos.clear()
}

// --- Helpers ---

const ORDEN_NIVEL: Record<string, number> = { BRONCE: 0, PLATA: 1, ORO: 2 }

function nivelesIncluyenHasta(nivel: NivelTaller): NivelTaller[] {
  if (nivel === 'BRONCE') return ['BRONCE']
  if (nivel === 'PLATA') return ['BRONCE', 'PLATA']
  return ['BRONCE', 'PLATA', 'ORO']
}

function siguienteNivel(nivel: NivelTaller): NivelTaller | null {
  if (nivel === 'BRONCE') return 'PLATA'
  if (nivel === 'PLATA') return 'ORO'
  return null
}

// --- Calculo de nivel ---

export async function calcularNivel(tallerId: string): Promise<ResultadoNivel> {
  const [reglas, taller, todosLosTipos] = await Promise.all([
    getReglasNivel(),
    prisma.taller.findUniqueOrThrow({
      where: { id: tallerId },
      include: {
        validaciones: {
          where: { estado: 'COMPLETADO' },
          include: { tipoDocumento: { select: { id: true, puntosOtorgados: true } } },
        },
        certificados: { where: { revocado: false }, select: { id: true } },
      },
    }),
    getTiposActivos(),
  ])

  // Sumar puntosOtorgados de cada validacion COMPLETADO + bonus AFIP
  const puntaje = taller.validaciones.reduce(
    (sum, v) => sum + v.tipoDocumento.puntosOtorgados, 0
  ) + (taller.verificadoAfip ? 10 : 0)

  const certificados = taller.certificados.length
  const tiposCompletados = new Set(taller.validaciones.map(v => v.tipoDocumento.id))

  // Evaluar reglas de mayor a menor — el primer match gana
  for (const regla of reglas) {
    const cumplePuntos = puntaje >= regla.puntosMinimos
    const cumpleAfip = !regla.requiereVerificadoAfip || taller.verificadoAfip
    const cumpleCertificados = certificados >= regla.certificadosAcademiaMin
    const niveles = nivelesIncluyenHasta(regla.nivel)
    const tiposRequeridos = todosLosTipos.filter(t => niveles.includes(t.nivelMinimo))
    const cumpleDocumentos = tiposRequeridos.every(t => tiposCompletados.has(t.id))

    if (cumplePuntos && cumpleAfip && cumpleCertificados && cumpleDocumentos) {
      return { nivel: regla.nivel, puntaje }
    }
  }

  return { nivel: 'BRONCE', puntaje }
}

export async function aplicarNivel(tallerId: string, userId?: string): Promise<ResultadoNivel> {
  const tallerActual = await prisma.taller.findUnique({
    where: { id: tallerId },
    select: { nivel: true },
  })
  const nivelAnterior = tallerActual?.nivel ?? 'BRONCE'

  const resultado = await calcularNivel(tallerId)

  await prisma.taller.update({
    where: { id: tallerId },
    data: { nivel: resultado.nivel, puntaje: resultado.puntaje },
  })

  if (nivelAnterior !== resultado.nivel) {
    const accion = ORDEN_NIVEL[resultado.nivel] > ORDEN_NIVEL[nivelAnterior] ? 'NIVEL_SUBIDO' : 'NIVEL_BAJADO'
    logActividad(accion, userId, {
      tallerId,
      nivelAnterior,
      nivelNuevo: resultado.nivel,
    })

    // F-02: Notificacion + WhatsApp solo si SUBIO
    if (accion === 'NIVEL_SUBIDO') {
      const tallerUser = await prisma.taller.findUnique({
        where: { id: tallerId },
        select: { userId: true },
      })
      if (tallerUser) {
        prisma.notificacion.create({
          data: {
            userId: tallerUser.userId,
            tipo: 'NIVEL',
            titulo: `Subiste a nivel ${resultado.nivel}!`,
            mensaje: `Felicitaciones! Ahora sos nivel ${resultado.nivel}.`,
            canal: 'PLATAFORMA',
            link: '/taller',
          },
        }).catch(() => {})

        generarMensajeWhatsapp({
          userId: tallerUser.userId,
          template: 'nivel_subido',
          datos: { nivel: resultado.nivel, beneficios: [] },
          destino: '/taller',
        }).catch(err => console.error('[F-02] Error WhatsApp nivel_subido:', err))
      }
    }
  }

  return resultado
}

// --- Proximo nivel (para dashboard taller y F-01) ---

export async function calcularProximoNivel(tallerId: string): Promise<ProximoNivelInfo> {
  const [reglas, taller, todosLosTipos] = await Promise.all([
    getReglasNivel(),
    prisma.taller.findUniqueOrThrow({
      where: { id: tallerId },
      include: {
        validaciones: {
          where: { estado: 'COMPLETADO' },
          include: { tipoDocumento: { select: { id: true, puntosOtorgados: true } } },
        },
        certificados: { where: { revocado: false }, select: { id: true } },
      },
    }),
    getTiposActivos(),
  ])

  const puntosActuales = taller.validaciones.reduce(
    (sum, v) => sum + v.tipoDocumento.puntosOtorgados, 0
  ) + (taller.verificadoAfip ? 10 : 0)

  const certificados = taller.certificados.length
  const tiposCompletados = new Set(taller.validaciones.map(v => v.tipoDocumento.id))

  // Determinar nivel actual
  let nivelActual: NivelTaller = 'BRONCE'
  for (const regla of reglas) {
    const niveles = nivelesIncluyenHasta(regla.nivel)
    const tiposRequeridos = todosLosTipos.filter(t => niveles.includes(t.nivelMinimo))
    const cumple = puntosActuales >= regla.puntosMinimos
      && (!regla.requiereVerificadoAfip || taller.verificadoAfip)
      && certificados >= regla.certificadosAcademiaMin
      && tiposRequeridos.every(t => tiposCompletados.has(t.id))
    if (cumple) { nivelActual = regla.nivel; break }
  }

  const proximo = siguienteNivel(nivelActual)
  if (!proximo) {
    return {
      nivelActual,
      nivelProximo: null,
      puntosActuales,
      puntosObjetivo: puntosActuales,
      puntosFaltantes: 0,
      documentosFaltantes: [],
      requiereAfip: false,
      tieneAfip: taller.verificadoAfip,
      certificadosFaltantes: 0,
      beneficiosProximoNivel: [],
    }
  }

  const reglaProximo = reglas.find(r => r.nivel === proximo)!
  const nivelesProximo = nivelesIncluyenHasta(proximo)
  const tiposRequeridosProximo = todosLosTipos.filter(t => nivelesProximo.includes(t.nivelMinimo))

  const documentosFaltantes = tiposRequeridosProximo
    .filter(t => !tiposCompletados.has(t.id))
    .map(t => ({
      id: t.id,
      nombre: t.nombre,
      label: t.label,
      nivelMinimo: t.nivelMinimo,
      puntos: t.puntosOtorgados,
      requerido: t.requerido,
    }))

  const certsFaltantes = Math.max(0, reglaProximo.certificadosAcademiaMin - certificados)

  return {
    nivelActual,
    nivelProximo: proximo,
    puntosActuales,
    puntosObjetivo: reglaProximo.puntosMinimos,
    puntosFaltantes: Math.max(0, reglaProximo.puntosMinimos - puntosActuales),
    documentosFaltantes,
    requiereAfip: reglaProximo.requiereVerificadoAfip,
    tieneAfip: taller.verificadoAfip,
    certificadosFaltantes: certsFaltantes,
    beneficiosProximoNivel: reglaProximo.beneficios,
  }
}
