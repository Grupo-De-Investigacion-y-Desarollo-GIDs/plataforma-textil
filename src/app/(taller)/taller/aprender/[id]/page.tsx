export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AcademiaCliente } from './academia-cliente'

export default async function AcademiaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const session = await auth()
  if (!session?.user) redirect('/login')

  const taller = await prisma.taller.findFirst({
    where: { userId: session.user.id },
    select: { id: true },
  })
  if (!taller) redirect('/login')

  const coleccion = await prisma.coleccion.findUnique({
    where: { id, activa: true },
    include: {
      videos: { orderBy: { orden: 'asc' } },
      evaluacion: true,
    },
  })
  if (!coleccion) notFound()

  // Progreso actual del taller en esta colección
  const progreso = await prisma.progresoCapacitacion.findUnique({
    where: { tallerId_coleccionId: { tallerId: taller.id, coleccionId: id } },
  })

  // Certificado vigente
  const certificado = await prisma.certificado.findFirst({
    where: { tallerId: taller.id, coleccionId: id, revocado: false },
  })

  const videosVistos = progreso?.videosVistos ?? 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/taller/aprender"
        className="inline-flex items-center gap-1 text-sm text-brand-blue hover:underline"
      >
        <ArrowLeft className="w-4 h-4" /> Volver a Academia
      </Link>

      <div>
        <h1 className="font-overpass font-bold text-2xl text-brand-blue">{coleccion.titulo}</h1>
        {coleccion.institucion && (
          <p className="text-sm text-gray-500 mt-0.5">Contenido curado por {coleccion.institucion}</p>
        )}
        {coleccion.descripcion && (
          <p className="text-gray-600 text-sm mt-2">{coleccion.descripcion}</p>
        )}
      </div>

      <AcademiaCliente
        coleccionId={id}
        videos={coleccion.videos}
        evaluacion={
          coleccion.evaluacion
            ? {
                preguntas: coleccion.evaluacion.preguntas as Array<{
                  texto: string
                  opciones: string[]
                  correcta: number
                }>,
                puntajeMinimo: coleccion.evaluacion.puntajeMinimo,
              }
            : null
        }
        progresoInicial={videosVistos}
        certificadoExistente={!!certificado}
      />
    </div>
  )
}
