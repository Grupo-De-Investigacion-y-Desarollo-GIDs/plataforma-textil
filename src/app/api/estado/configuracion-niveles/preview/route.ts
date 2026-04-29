import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { requiereRolApi } from '@/compartido/lib/permisos'
import type { NivelTaller } from '@prisma/client'

function nivelesIncluyenHasta(nivel: NivelTaller): NivelTaller[] {
  if (nivel === 'BRONCE') return ['BRONCE']
  if (nivel === 'PLATA') return ['BRONCE', 'PLATA']
  return ['BRONCE', 'PLATA', 'ORO']
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requiereRolApi(['ESTADO'])
    if (authResult instanceof NextResponse) return authResult

    const body = await req.json()
    // body: { reglas: [{ nivel, puntosMinimos, requiereVerificadoAfip, certificadosAcademiaMin }] }
    const reglasProposadas = body.reglas as {
      nivel: NivelTaller
      puntosMinimos: number
      requiereVerificadoAfip: boolean
      certificadosAcademiaMin: number
    }[]

    if (!reglasProposadas || !Array.isArray(reglasProposadas)) {
      return NextResponse.json({ error: 'Formato invalido' }, { status: 400 })
    }

    // Obtener todos los talleres con sus datos
    const talleres = await prisma.taller.findMany({
      include: {
        validaciones: {
          where: { estado: 'COMPLETADO' },
          include: { tipoDocumento: { select: { id: true, puntosOtorgados: true } } },
        },
        certificados: { where: { revocado: false }, select: { id: true } },
      },
    })

    const tiposRequeridos = await prisma.tipoDocumento.findMany({
      where: { activo: true, requerido: true },
      select: { id: true, nivelMinimo: true },
    })

    // Ordenar reglas de mayor a menor
    const reglasOrdenadas = [...reglasProposadas].sort((a, b) => b.puntosMinimos - a.puntosMinimos)

    const cambios: { tallerId: string; nombre: string; nivelActual: NivelTaller; nivelNuevo: NivelTaller }[] = []

    for (const taller of talleres) {
      const puntaje = taller.validaciones.reduce(
        (sum, v) => sum + v.tipoDocumento.puntosOtorgados, 0
      ) + (taller.verificadoAfip ? 10 : 0)

      const certificados = taller.certificados.length
      const tiposCompletados = new Set(taller.validaciones.map(v => v.tipoDocumento.id))

      let nivelNuevo: NivelTaller = 'BRONCE'
      for (const regla of reglasOrdenadas) {
        const cumplePuntos = puntaje >= regla.puntosMinimos
        const cumpleAfip = !regla.requiereVerificadoAfip || taller.verificadoAfip
        const cumpleCertificados = certificados >= regla.certificadosAcademiaMin
        const niveles = nivelesIncluyenHasta(regla.nivel)
        const tiposNivel = tiposRequeridos.filter(t => niveles.includes(t.nivelMinimo))
        const cumpleDocumentos = tiposNivel.every(t => tiposCompletados.has(t.id))

        if (cumplePuntos && cumpleAfip && cumpleCertificados && cumpleDocumentos) {
          nivelNuevo = regla.nivel
          break
        }
      }

      if (nivelNuevo !== taller.nivel) {
        cambios.push({
          tallerId: taller.id,
          nombre: taller.nombre,
          nivelActual: taller.nivel,
          nivelNuevo,
        })
      }
    }

    return NextResponse.json({
      totalTalleres: talleres.length,
      talleresAfectados: cambios.length,
      suben: cambios.filter(c => c.nivelNuevo > c.nivelActual).length,
      bajan: cambios.filter(c => c.nivelNuevo < c.nivelActual).length,
      detalle: cambios,
    })
  } catch (error) {
    console.error('Error en POST /api/estado/configuracion-niveles/preview:', error)
    return NextResponse.json({ error: 'Error al calcular preview' }, { status: 500 })
  }
}
