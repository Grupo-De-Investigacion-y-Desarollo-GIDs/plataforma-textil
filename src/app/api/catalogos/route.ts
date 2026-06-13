import { NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'

// GET /api/catalogos — devuelve procesos productivos y tipos de prenda
export async function GET() {
  try {
    // K-05: select explicito — el wizard de completar perfil solo usa
    // {id, nombre, descripcion} de procesos y {id, nombre} de prendas.
    const [procesos, prendas] = await Promise.all([
      prisma.procesoProductivo.findMany({
        select: { id: true, nombre: true, descripcion: true },
        orderBy: { nombre: 'asc' },
      }),
      prisma.tipoPrenda.findMany({
        select: { id: true, nombre: true },
        orderBy: { nombre: 'asc' },
      }),
    ])
    return NextResponse.json({ procesos, prendas })
  } catch (error) {
    console.error('Error en GET /api/catalogos:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
