export const dynamic = 'force-dynamic'

import { requiereRol } from '@/compartido/lib/permisos'
import { calcularStatsAgregadas, generarRecomendaciones, obtenerDetallePorCategoria, obtenerTalleresCerca } from '@/compartido/lib/demanda-insatisfecha'
import { Card } from '@/compartido/componentes/ui/card'
import { Badge } from '@/compartido/componentes/ui/badge'
import Link from 'next/link'
import { TrendingDown, Users, Factory, Lightbulb, Download } from 'lucide-react'
import { Breadcrumbs } from '@/compartido/componentes/ui/breadcrumbs'
import type { MotivoCategoria } from '@prisma/client'

const CATEGORIA_LABELS: Record<string, { label: string; color: string }> = {
  SIN_TALLERES_NIVEL: { label: 'Sin talleres del nivel requerido', color: 'bg-amber-500' },
  SIN_TALLERES_CAPACIDAD: { label: 'Sin capacidad suficiente', color: 'bg-orange-500' },
  SIN_TALLERES_PROCESO: { label: 'Proceso no disponible', color: 'bg-red-500' },
  OTROS: { label: 'Otros', color: 'bg-gray-400' },
}

interface PageProps {
  searchParams: Promise<{
    motivoCategoria?: string
    vista?: string
    desde?: string
    hasta?: string
  }>
}

export default async function DemandaInsatisfechaPage({ searchParams }: PageProps) {
  await requiereRol(['ESTADO', 'ADMIN'])
  const params = await searchParams

  const ahora = new Date()
  const hace30d = new Date(ahora)
  hace30d.setDate(hace30d.getDate() - 30)

  const desde = params.desde ? new Date(params.desde) : hace30d
  const hasta = params.hasta ? new Date(params.hasta) : ahora

  // Vista: detalle por categoria
  if (params.motivoCategoria && Object.keys(CATEGORIA_LABELS).includes(params.motivoCategoria)) {
    const detalle = await obtenerDetallePorCategoria(
      params.motivoCategoria as MotivoCategoria,
      desde,
      hasta,
    )
    const catInfo = CATEGORIA_LABELS[params.motivoCategoria]

    return (
      <div className="space-y-6">
        <div>
          <Breadcrumbs items={[
            { label: 'Estado', href: '/estado' },
            { label: 'Demanda insatisfecha', href: '/estado/demanda-insatisfecha' },
            { label: catInfo.label },
          ]} />
          <h1 className="font-overpass font-bold text-2xl text-brand-blue mt-2">
            Pedidos sin matchear: {catInfo.label}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {detalle.length} pedidos en los ultimos 30 dias
          </p>
        </div>

        {detalle.length === 0 ? (
          <Card>
            <p className="text-gray-500 text-center py-8">No hay pedidos sin matchear en esta categoria para el periodo seleccionado.</p>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-semibold text-gray-600">ID</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-600">Tipo prenda</th>
                    <th className="text-right py-3 px-2 font-semibold text-gray-600">Cantidad</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-600">Marca</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-600">Procesos</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-600">Talleres cerca</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-600">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {detalle.map(p => {
                    const talleresCerca = p.talleresCerca as Array<{ nombre: string }> | undefined
                    return (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="py-3 px-2 font-mono text-xs">{p.omId}</td>
                        <td className="py-3 px-2">{p.tipoPrenda}</td>
                        <td className="py-3 px-2 text-right">{p.cantidad.toLocaleString('es-AR')}</td>
                        <td className="py-3 px-2">{p.marca}</td>
                        <td className="py-3 px-2">
                          {p.procesosRequeridos.length > 0
                            ? p.procesosRequeridos.join(', ')
                            : <span className="text-gray-400">-</span>}
                        </td>
                        <td className="py-3 px-2">
                          {talleresCerca && talleresCerca.length > 0
                            ? <Badge variant="muted" className="text-xs py-1 px-2">{talleresCerca.length} talleres</Badge>
                            : <span className="text-gray-400">-</span>}
                        </td>
                        <td className="py-3 px-2 text-xs text-gray-500">
                          {p.createdAt.toLocaleDateString('es-AR')}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        <div className="flex justify-end">
          <a
            href={`/api/estado/exportar?tipo=demanda&formato=csv&desde=${desde.toISOString()}&hasta=${hasta.toISOString()}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-lg text-sm hover:bg-brand-blue/90 transition-colors"
          >
            <Download className="w-4 h-4" /> Exportar CSV
          </a>
        </div>
      </div>
    )
  }

  // Vista: talleres cerca de matchear
  if (params.vista === 'talleres-cerca') {
    const talleres = await obtenerTalleresCerca(desde, hasta)

    return (
      <div className="space-y-6">
        <div>
          <Breadcrumbs items={[
            { label: 'Estado', href: '/estado' },
            { label: 'Demanda insatisfecha', href: '/estado/demanda-insatisfecha' },
            { label: 'Talleres cerca' },
          ]} />
          <h1 className="font-overpass font-bold text-2xl text-brand-blue mt-2">
            Talleres cerca de poder matchear
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Talleres que cumplen casi todas las condiciones excepto una
          </p>
        </div>

        {talleres.length === 0 ? (
          <Card>
            <p className="text-gray-500 text-center py-8">No se identificaron talleres cerca de matchear en el periodo seleccionado.</p>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-semibold text-gray-600">Taller</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-600">Falta para</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-600">Detalle</th>
                    <th className="text-right py-3 px-2 font-semibold text-gray-600">Pedidos que matchearia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {talleres.map(t => (
                    <tr key={t.tallerId} className="hover:bg-gray-50">
                      <td className="py-3 px-2 font-semibold">{t.nombre}</td>
                      <td className="py-3 px-2">
                        <Badge variant="warning" className="text-xs py-1 px-2">
                          {t.faltaPara.replace('subir_a_', 'Subir a ').replace('ya_en_maximo', 'Ya en maximo')}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-gray-600">{t.detalle}</td>
                      <td className="py-3 px-2 text-right font-semibold">{t.pedidosQueMatchearia}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    )
  }

  // Vista principal: resumen
  const [stats, recomendaciones] = await Promise.all([
    calcularStatsAgregadas(desde, hasta),
    generarRecomendaciones(desde, hasta),
  ])

  const totalMotivos = Object.values(stats.motivosBreakdown).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-overpass font-bold text-3xl text-brand-blue">
            Demanda insatisfecha
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Ultimos 30 dias — pedidos publicados sin cotizaciones
          </p>
        </div>
        <a
          href={`/api/estado/exportar?tipo=demanda&formato=csv&desde=${desde.toISOString()}&hasta=${hasta.toISOString()}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-lg text-sm hover:bg-brand-blue/90 transition-colors"
        >
          <Download className="w-4 h-4" /> Exportar CSV
        </a>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center">
          <TrendingDown className="w-6 h-6 text-red-500 mx-auto mb-1" />
          <p className="font-overpass font-bold text-3xl text-brand-blue">{stats.pedidosTotales}</p>
          <p className="text-xs text-gray-500">Pedidos sin cotizaciones</p>
        </Card>
        <Card className="text-center">
          <Factory className="w-6 h-6 text-orange-500 mx-auto mb-1" />
          <p className="font-overpass font-bold text-3xl text-brand-blue">
            {stats.unidadesTotales.toLocaleString('es-AR')}
          </p>
          <p className="text-xs text-gray-500">Unidades de produccion potencial</p>
        </Card>
        <Card className="text-center">
          <Users className="w-6 h-6 text-brand-blue mx-auto mb-1" />
          <p className="font-overpass font-bold text-3xl text-brand-blue">{stats.marcasAfectadas}</p>
          <p className="text-xs text-gray-500">Marcas afectadas</p>
        </Card>
      </div>

      {/* Motivos principales */}
      {stats.pedidosTotales > 0 ? (
        <Card title="Motivos principales">
          <div className="space-y-4">
            {Object.entries(CATEGORIA_LABELS).map(([key, { label, color }]) => {
              const count = stats.motivosBreakdown[key] ?? 0
              const pct = totalMotivos > 0 ? Math.round((count / totalMotivos) * 100) : 0
              return (
                <Link
                  key={key}
                  href={`/estado/demanda-insatisfecha?motivoCategoria=${key}`}
                  className="block hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors"
                >
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{label}</span>
                    <span className="font-semibold text-gray-600">{pct}% ({count})</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </Link>
              )
            })}
          </div>

          {stats.pedidosConPresupuesto > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100 text-sm text-gray-500">
              Demanda con presupuesto declarado: ${stats.demandaPesos.toLocaleString('es-AR')}
              <span className="text-xs text-gray-400 ml-1">
                (sobre {stats.pedidosConPresupuesto} de {stats.pedidosTotales} pedidos que declararon presupuesto)
              </span>
            </div>
          )}
        </Card>
      ) : (
        <Card>
          <div className="text-center py-8">
            <TrendingDown className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold">No hay demanda insatisfecha registrada</p>
            <p className="text-sm text-gray-400 mt-1">
              Los motivos se registran automaticamente cuando un pedido publicado no encuentra talleres compatibles.
            </p>
          </div>
        </Card>
      )}

      {/* Recomendaciones */}
      {recomendaciones.length > 0 && (
        <Card title={
          <span className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Oportunidades de intervencion
          </span>
        }>
          <div className="space-y-4">
            {recomendaciones.map((rec, i) => (
              <div key={i} className="border-l-4 border-l-amber-300 pl-4 py-2">
                <p className="font-semibold text-gray-700">{rec.titulo}</p>
                <p className="text-sm text-gray-500 mt-1">{rec.descripcion}</p>
                <Link
                  href={rec.accionUrl}
                  className="text-xs text-brand-blue hover:underline mt-1 inline-block"
                >
                  Ver detalles →
                </Link>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
