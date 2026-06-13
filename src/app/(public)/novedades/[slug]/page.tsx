import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { TipoNovedad } from '@prisma/client'
import { prisma } from '@/compartido/lib/prisma'
import { Breadcrumbs } from '@/compartido/componentes/ui/breadcrumbs'

export const dynamic = 'force-dynamic'

const TIPO_LABELS: Record<TipoNovedad, string> = {
  NOTICIA: 'Noticia',
  CASO: 'Caso de éxito',
  INDICADOR: 'Indicador',
}

const TIPO_COLOR: Record<TipoNovedad, string> = {
  NOTICIA: 'bg-green-100 text-green-800',
  CASO: 'bg-pastel-blue text-brand-blue',
  INDICADOR: 'bg-purple-100 text-purple-800',
}

export default async function NovedadDetallePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const novedad = await prisma.novedad.findFirst({
    where: { slug, publicado: true },
    select: {
      tipo: true,
      titulo: true,
      descripcion: true,
      imagenUrl: true,
      fecha: true,
    },
  })

  if (!novedad) notFound()

  const fechaFormateada = novedad.fecha.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumbs
        items={[
          { label: 'Inicio', href: '/' },
          { label: 'Novedades', href: '/novedades' },
          { label: novedad.titulo },
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-overpass font-bold uppercase tracking-wider ${TIPO_COLOR[novedad.tipo]}`}
        >
          {TIPO_LABELS[novedad.tipo]}
        </span>
        <time className="text-sm text-ink-secondary">{fechaFormateada}</time>
      </div>

      <h1 className="font-serif font-bold text-4xl lg:text-5xl text-ink-primary leading-tight mb-8">
        {novedad.titulo}
      </h1>

      {novedad.imagenUrl && (
        <div className="relative aspect-[16/9] w-full rounded-card overflow-hidden shadow-card mb-8 bg-gray-100">
          <Image
            src={novedad.imagenUrl}
            alt={novedad.titulo}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 768px, 100vw"
          />
        </div>
      )}

      <div className="prose prose-lg max-w-none text-ink-secondary leading-relaxed whitespace-pre-wrap">
        {novedad.descripcion}
      </div>
    </article>
  )
}
