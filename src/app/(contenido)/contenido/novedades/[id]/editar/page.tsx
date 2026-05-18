import { notFound } from 'next/navigation'
import { prisma } from '@/compartido/lib/prisma'
import { Breadcrumbs } from '@/compartido/componentes/ui/breadcrumbs'
import { FormularioNovedad } from '../../formulario-novedad'

export default async function EditarNovedadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const novedad = await prisma.novedad.findUnique({ where: { id } })

  if (!novedad) notFound()

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: 'Novedades', href: '/contenido/novedades' },
        { label: 'Editar novedad' },
      ]} />
      <h1 className="font-serif font-bold text-2xl text-brand-blue">Editar novedad</h1>
      <FormularioNovedad novedad={novedad} />
    </div>
  )
}
