export const dynamic = 'force-dynamic'

import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/compartido/componentes/ui/card'
import { Search, ShoppingBag, ClipboardList, User } from 'lucide-react'

export default async function MarcaDashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const marca = await prisma.marca.findFirst({
    where: { userId: session.user.id },
    select: {
      id: true,
      nombre: true,
      tipo: true,
      ubicacion: true,
      volumenMensual: true,
      pedidosRealizados: true,
    },
  })

  const [totalPedidos, pedidosActivos, cotizacionesRecibidas] = await Promise.all([
    prisma.pedido.count({ where: { marca: { userId: session.user.id } } }),
    prisma.pedido.count({ where: { marca: { userId: session.user.id }, estado: { in: ['EN_EJECUCION', 'PUBLICADO'] } } }),
    marca ? prisma.cotizacion.count({ where: { pedido: { marcaId: marca.id }, estado: 'ENVIADA' } }) : 0,
  ])

  const perfilCompleto = !!(marca?.tipo && marca?.ubicacion && marca?.volumenMensual > 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-overpass font-bold text-3xl text-brand-blue">
          Bienvenido, {marca?.nombre ?? session.user.name}
        </h1>
        <p className="text-gray-500 mt-1">Tu panel de gestion de produccion</p>
      </div>

      {!perfilCompleto && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm font-medium text-amber-800">Completa tu perfil para poder contactar talleres</p>
          <p className="text-xs text-amber-600 mt-1">Te faltan: {!marca?.tipo ? 'tipo de marca, ' : ''}{!marca?.ubicacion ? 'ubicacion, ' : ''}{!marca?.volumenMensual ? 'volumen mensual' : ''}</p>
          <Link href="/marca/perfil" className="text-xs text-brand-blue font-semibold hover:underline mt-2 block">
            Completar perfil →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="text-center">
          <ShoppingBag className="w-6 h-6 text-brand-blue mx-auto mb-1" />
          <p className="font-overpass font-bold text-3xl text-brand-blue">{totalPedidos}</p>
          <p className="text-xs text-gray-500">Pedidos creados</p>
        </Card>
        <Card className="text-center">
          <ClipboardList className="w-6 h-6 text-green-600 mx-auto mb-1" />
          <p className="font-overpass font-bold text-3xl text-brand-blue">{pedidosActivos}</p>
          <p className="text-xs text-gray-500">Pedidos activos</p>
        </Card>
        <Card className="text-center">
          <User className="w-6 h-6 text-amber-500 mx-auto mb-1" />
          <p className="font-overpass font-bold text-3xl text-brand-blue">{cotizacionesRecibidas}</p>
          <p className="text-xs text-gray-500">Cotizaciones pendientes</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/marca/directorio">
          <Card className="hover:shadow-card-hover transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-blue/10 rounded-lg flex items-center justify-center">
                <Search className="w-6 h-6 text-brand-blue" />
              </div>
              <div>
                <p className="font-overpass font-bold text-brand-blue">Buscar talleres</p>
                <p className="text-sm text-gray-500">Encontra proveedores verificados por nivel y proceso</p>
              </div>
            </div>
          </Card>
        </Link>
        <Link href="/marca/pedidos/nuevo">
          <Card className="hover:shadow-card-hover transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-overpass font-bold text-brand-blue">Crear pedido</p>
                <p className="text-sm text-gray-500">Publica tu pedido y recibe cotizaciones de talleres</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {cotizacionesRecibidas > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm font-medium text-blue-800">
            Tenes {cotizacionesRecibidas} cotizacion{cotizacionesRecibidas > 1 ? 'es' : ''} pendiente{cotizacionesRecibidas > 1 ? 's' : ''} de revision
          </p>
          <Link href="/marca/pedidos" className="text-xs text-brand-blue font-semibold hover:underline mt-1 block">
            Ver mis pedidos →
          </Link>
        </div>
      )}
    </div>
  )
}
