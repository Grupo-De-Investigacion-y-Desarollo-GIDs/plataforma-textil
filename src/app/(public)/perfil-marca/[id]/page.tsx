export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { prisma } from '@/compartido/lib/prisma'
import { Card } from '@/compartido/componentes/ui/card'
import { Badge } from '@/compartido/componentes/ui/badge'
import Link from 'next/link'
import { MapPin, Star, Package, ArrowLeft } from 'lucide-react'

const estadoVariant: Record<string, 'success' | 'warning' | 'default'> = {
  COMPLETADO: 'success',
  EN_EJECUCION: 'warning',
  BORRADOR: 'default',
  CANCELADO: 'default',
}

const estadoLabel: Record<string, string> = {
  COMPLETADO: 'Completado',
  EN_EJECUCION: 'En ejecución',
  BORRADOR: 'Borrador',
  CANCELADO: 'Cancelado',
}

export default async function PerfilMarcaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const marca = await prisma.marca.findUnique({
    where: { id },
    include: {
      user: { select: { phone: true, createdAt: true } },
      pedidos: {
        select: { tipoPrenda: true, cantidad: true, estado: true, fechaCreacion: true },
        orderBy: { fechaCreacion: 'desc' },
        take: 5,
      },
    },
  })

  if (!marca) notFound()

  const iniciales = marca.nombre
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  const waLink = marca.user.phone
    ? `https://wa.me/${marca.user.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola, te contacto desde la Plataforma Digital Textil. Vi el perfil de ${marca.nombre}.`)}`
    : null

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
      <Link
        href="/directorio"
        className="inline-flex items-center gap-1 text-sm text-brand-blue hover:underline"
      >
        <ArrowLeft className="w-4 h-4" /> Volver
      </Link>

      {/* Encabezado */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-brand-blue flex items-center justify-center flex-shrink-0">
          <span className="text-white font-overpass font-bold text-xl">{iniciales}</span>
        </div>
        <div>
          <h1 className="font-overpass font-bold text-2xl text-brand-blue">{marca.nombre}</h1>
          {marca.ubicacion && (
            <p className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
              <MapPin className="w-3.5 h-3.5" /> {marca.ubicacion}
            </p>
          )}
          {marca.website && (
            <a
              href={marca.website.startsWith('http') ? marca.website : `https://${marca.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-brand-blue hover:underline mt-0.5 block"
            >
              {marca.website}
            </a>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="text-center p-4">
          <Star className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
          <p className="font-overpass font-bold text-2xl text-brand-blue">
            {marca.rating > 0 ? marca.rating.toFixed(1) : '—'}
          </p>
          <p className="text-xs text-gray-500">Rating</p>
        </Card>
        <Card className="text-center p-4">
          <Package className="w-5 h-5 text-brand-blue mx-auto mb-1" />
          <p className="font-overpass font-bold text-2xl text-brand-blue">
            {marca.pedidosRealizados}
          </p>
          <p className="text-xs text-gray-500">Pedidos</p>
        </Card>
        <Card className="text-center p-4">
          <span className="text-2xl block mb-1">🏷️</span>
          <p className="font-overpass font-bold text-sm text-brand-blue">
            {marca.tipo ?? '—'}
          </p>
          <p className="text-xs text-gray-500">Tipo</p>
        </Card>
      </div>

      {/* Sobre la marca */}
      <Card title="Sobre la marca">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt className="text-gray-500">Tipo</dt>
            <dd className="font-medium text-gray-800">{marca.tipo ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Ubicación</dt>
            <dd className="font-medium text-gray-800">{marca.ubicacion ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Volumen mensual</dt>
            <dd className="font-medium text-gray-800">
              {marca.volumenMensual > 0 ? `${marca.volumenMensual.toLocaleString()} prendas` : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Frecuencia de compra</dt>
            <dd className="font-medium text-gray-800">{marca.frecuenciaCompra ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">CUIT</dt>
            <dd className="font-medium text-gray-800">
              {marca.cuit}{' '}
              <Badge variant="success" className="text-xs ml-1">verificado</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">En la plataforma desde</dt>
            <dd className="font-medium text-gray-800">
              {new Date(marca.user.createdAt).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
            </dd>
          </div>
        </dl>
      </Card>

      {/* Pedidos recientes */}
      {marca.pedidos.length > 0 && (
        <Card title="Pedidos recientes">
          <div className="divide-y divide-gray-100">
            {marca.pedidos.map((p, i) => (
              <div key={i} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {p.cantidad.toLocaleString()} {p.tipoPrenda}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(p.fechaCreacion).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <Badge variant={estadoVariant[p.estado] ?? 'default'}>
                  {estadoLabel[p.estado] ?? p.estado}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Contacto */}
      {waLink ? (
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
        >
          Contactar por WhatsApp
        </a>
      ) : (
        <p className="text-sm text-gray-400">Esta marca no tiene teléfono de contacto registrado.</p>
      )}
    </div>
  )
}
