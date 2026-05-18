export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/compartido/lib/prisma'
import { EmptyState } from '@/compartido/componentes/ui/empty-state'
import { Breadcrumbs } from '@/compartido/componentes/ui/breadcrumbs'
import { Newspaper, Plus, Edit } from 'lucide-react'
import type { TipoNovedad } from '@prisma/client'

const TIPO_LABELS: Record<TipoNovedad, string> = {
  NOTICIA: 'Noticia',
  CASO: 'Caso de éxito',
  INDICADOR: 'Indicador',
}

const TIPO_COLOR: Record<TipoNovedad, string> = {
  NOTICIA: 'bg-green-100 text-green-800',
  CASO: 'bg-blue-100 text-brand-blue',
  INDICADOR: 'bg-purple-100 text-purple-800',
}

export default async function NovedadesPage() {
  const novedades = await prisma.novedad.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Novedades' }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-overpass font-bold text-2xl text-brand-blue">Novedades</h1>
          <p className="text-sm text-gray-500 mt-1">Gestionar novedades del landing</p>
        </div>
        <Link
          href="/contenido/novedades/nueva"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-overpass font-semibold bg-brand-blue hover:bg-blue-800 text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva novedad
        </Link>
      </div>

      {novedades.length === 0 ? (
        <EmptyState
          icon={<Newspaper className="w-8 h-8 text-brand-blue" />}
          titulo="Aún no hay novedades"
          mensaje="Creá la primera novedad para que aparezca en el landing."
          accion={{ texto: 'Crear novedad', href: '/contenido/novedades/nueva' }}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-overpass font-bold uppercase text-gray-600">Imagen</th>
                <th className="text-left px-4 py-3 text-xs font-overpass font-bold uppercase text-gray-600">Tipo</th>
                <th className="text-left px-4 py-3 text-xs font-overpass font-bold uppercase text-gray-600">Título</th>
                <th className="text-left px-4 py-3 text-xs font-overpass font-bold uppercase text-gray-600">Fecha</th>
                <th className="text-left px-4 py-3 text-xs font-overpass font-bold uppercase text-gray-600">Estado</th>
                <th className="text-right px-4 py-3 text-xs font-overpass font-bold uppercase text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {novedades.map(n => (
                <tr key={n.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {n.imagenUrl ? (
                      <Image
                        src={n.imagenUrl}
                        alt=""
                        width={64}
                        height={48}
                        className="w-16 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-12 bg-gray-100 rounded flex items-center justify-center">
                        <Newspaper className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded text-[10px] font-overpass font-bold uppercase ${TIPO_COLOR[n.tipo]}`}>
                      {TIPO_LABELS[n.tipo]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{n.titulo}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {n.fecha.toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded text-[10px] font-overpass font-bold uppercase ${n.publicado ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {n.publicado ? 'Publicado' : 'Borrador'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/contenido/novedades/${n.id}/editar`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-brand-blue hover:bg-blue-50 rounded transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
