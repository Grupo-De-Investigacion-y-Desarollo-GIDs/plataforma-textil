import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET /api/colecciones/[id]/evaluacion — devuelve evaluacion existente (admin)
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const role = (session.user as { role?: string }).role
    if (role !== 'ADMIN') return NextResponse.json({ error: 'Solo admin' }, { status: 403 })

    const { id: coleccionId } = await params
    const evaluacion = await prisma.evaluacion.findUnique({ where: { coleccionId } })
    return NextResponse.json(evaluacion ?? null)
  } catch (error) {
    console.error('Error en GET /api/colecciones/[id]/evaluacion:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PUT /api/colecciones/[id]/evaluacion — crea o actualiza evaluacion (admin)
// Body: { preguntas: Pregunta[], puntajeMinimo: number }
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const role = (session.user as { role?: string }).role
    if (role !== 'ADMIN') return NextResponse.json({ error: 'Solo admin' }, { status: 403 })

    const { id: coleccionId } = await params
    const { preguntas, puntajeMinimo } = await req.json()

    const evaluacion = await prisma.evaluacion.upsert({
      where: { coleccionId },
      create: { coleccionId, preguntas, puntajeMinimo: puntajeMinimo ?? 60 },
      update: { preguntas, puntajeMinimo: puntajeMinimo ?? 60 },
    })
    return NextResponse.json(evaluacion)
  } catch (error) {
    console.error('Error en PUT /api/colecciones/[id]/evaluacion:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST /api/colecciones/[id]/evaluacion
// Body: { respuestas: number[] }  (índice de opción elegida por pregunta)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const taller = await prisma.taller.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (!taller) return NextResponse.json({ error: 'Taller no encontrado' }, { status: 404 })

    const { id: coleccionId } = await params

    const coleccion = await prisma.coleccion.findUnique({
      where: { id: coleccionId },
      include: { evaluacion: true },
    })
    if (!coleccion) return NextResponse.json({ error: 'Colección no encontrada' }, { status: 404 })
    if (!coleccion.evaluacion) {
      return NextResponse.json({ error: 'Esta colección no tiene evaluación' }, { status: 400 })
    }

    // Verificar que no tenga certificado vigente
    const certExistente = await prisma.certificado.findFirst({
      where: { tallerId: taller.id, coleccionId, revocado: false },
    })
    if (certExistente) {
      return NextResponse.json({ aprobado: true, calificacion: certExistente.calificacion, certificadoId: certExistente.id, yaExiste: true })
    }

    const body = await req.json()
    const { respuestas } = body as { respuestas: number[] }

    // Corregir respuestas
    const preguntas = coleccion.evaluacion.preguntas as Array<{ correcta: number }>
    let correctas = 0
    preguntas.forEach((p, i) => {
      if (respuestas[i] === p.correcta) correctas++
    })
    const calificacion = Math.round((correctas / preguntas.length) * 100)
    const aprobado = calificacion >= coleccion.evaluacion.puntajeMinimo

    if (aprobado) {
      // Generar certificado
      const codigo = `PDT-${taller.id.slice(0, 6).toUpperCase()}-${coleccionId.slice(0, 6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`
      const certificado = await prisma.certificado.create({
        data: { tallerId: taller.id, coleccionId, codigo, calificacion },
      })
      // Marcar progreso como 100%
      await prisma.progresoCapacitacion.upsert({
        where: { tallerId_coleccionId: { tallerId: taller.id, coleccionId } },
        create: { tallerId: taller.id, coleccionId, porcentajeCompletado: 100 },
        update: { porcentajeCompletado: 100 },
      })
      return NextResponse.json({ aprobado: true, calificacion, certificadoId: certificado.id, codigo: certificado.codigo })
    }

    return NextResponse.json({ aprobado: false, calificacion, puntajeMinimo: coleccion.evaluacion.puntajeMinimo })
  } catch (error) {
    console.error('Error en POST /api/colecciones/[id]/evaluacion:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
