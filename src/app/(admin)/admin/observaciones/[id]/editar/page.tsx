export const dynamic = 'force-dynamic'

import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import { Breadcrumbs } from '@/compartido/componentes/ui/breadcrumbs'
import { FormularioObservacion } from '../../formulario-observacion'
import { EliminarObservacion } from './eliminar-observacion'

export default async function EditarObservacionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { id } = await params

  const observacion = await prisma.observacionCampo.findUnique({
    where: { id },
    include: {
      autor: { select: { id: true, name: true } },
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  })

  if (!observacion) notFound()

  const canEdit = session.user.role === 'ADMIN' || observacion.autorId === session.user.id

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: 'Observaciones', href: '/admin/observaciones' },
        { label: 'Editar observacion' },
      ]} />
      <div className="flex items-center justify-between">
        <h1 className="font-overpass font-bold text-2xl text-brand-blue">Editar observacion</h1>
        {canEdit && <EliminarObservacion observacionId={id} />}
      </div>
      {canEdit ? (
        <FormularioObservacion
          observacionId={id}
          initial={{
            userId: observacion.userId,
            tipo: observacion.tipo,
            fuente: observacion.fuente,
            sentimiento: observacion.sentimiento,
            importancia: observacion.importancia,
            titulo: observacion.titulo,
            contenido: observacion.contenido,
            tags: observacion.tags,
            fechaEvento: observacion.fechaEvento.toISOString(),
            ubicacion: observacion.ubicacion,
          }}
        />
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
          Solo el autor o un ADMIN puede editar esta observacion.
          Registrada por: {observacion.autor?.name ?? 'Autor desconocido'}
        </div>
      )}
    </div>
  )
}
