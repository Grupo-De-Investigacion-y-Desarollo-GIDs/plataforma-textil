export const dynamic = 'force-dynamic'

import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import { Breadcrumbs } from '@/compartido/componentes/ui/breadcrumbs'
import { AcademiaCliente } from '@/taller/componentes/academia-cliente'
import { AsistenteChat } from '@/taller/componentes/asistente-chat'
import { getFeatureFlag } from '@/compartido/lib/features'

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

  const ragHabilitado = await getFeatureFlag('asistente_rag')

  // Certificado vigente
  const certificado = await prisma.certificado.findFirst({
    where: { tallerId: taller.id, coleccionId: id, revocado: false },
  })

  const videosVistos = progreso?.videosVistos ?? 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Breadcrumbs items={[
        { label: 'Taller', href: '/taller' },
        { label: 'Academia', href: '/taller/aprender' },
        { label: coleccion.titulo },
      ]} />

      <div className="mt-2">
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
                preguntas: (coleccion.evaluacion.preguntas as Array<{
                  pregunta?: string
                  texto?: string
                  opciones: string[]
                  correcta: number
                }>).map(p => ({
                  texto: p.texto ?? p.pregunta ?? '',
                  opciones: p.opciones,
                  correcta: p.correcta,
                })),
                puntajeMinimo: coleccion.evaluacion.puntajeMinimo,
              }
            : null
        }
        progresoInicial={videosVistos}
        certificadoId={certificado?.id ?? null}
      />

      {ragHabilitado && <AsistenteChat />}
    </div>
  )
}
