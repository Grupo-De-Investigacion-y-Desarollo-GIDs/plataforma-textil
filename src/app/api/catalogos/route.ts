import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/catalogos — devuelve procesos productivos y tipos de prenda
export async function GET() {
  try {
    const [procesos, prendas] = await Promise.all([
      prisma.procesoProductivo.findMany({ orderBy: { nombre: 'asc' } }),
      prisma.tipoPrenda.findMany({ orderBy: { nombre: 'asc' } }),
    ])
    return NextResponse.json({ procesos, prendas })
  } catch (error) {
    console.error('Error en GET /api/catalogos:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
