export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function generateOmId() {
  const year = new Date().getFullYear()
  const code = crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()
  return `OM-${year}-${code}`
}

async function createPedido(formData: FormData) {
  'use server'

  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'MARCA') {
    redirect('/unauthorized')
  }

  const marca = await prisma.marca.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })

  if (!marca) {
    redirect('/unauthorized')
  }

  const tipoPrenda = String(formData.get('tipoPrenda') || '').trim()
  const cantidadRaw = String(formData.get('cantidad') || '').trim()
  const fechaObjetivoRaw = String(formData.get('fechaObjetivo') || '').trim()
  const montoTotalRaw = String(formData.get('montoTotal') || '').trim()

  const cantidad = Number(cantidadRaw)
  const montoTotal = Number(montoTotalRaw || '0')

  if (!tipoPrenda || !Number.isFinite(cantidad) || cantidad <= 0) {
    redirect('/marca/pedidos/nuevo?error=1')
  }

  await prisma.pedido.create({
    data: {
      omId: generateOmId(),
      marcaId: marca.id,
      tipoPrenda,
      cantidad: Math.round(cantidad),
      fechaObjetivo: fechaObjetivoRaw ? new Date(fechaObjetivoRaw) : undefined,
      montoTotal: Number.isFinite(montoTotal) && montoTotal >= 0 ? montoTotal : 0,
      estado: 'BORRADOR',
    },
  })

  revalidatePath('/marca/pedidos')
  redirect('/marca/pedidos?created=1')
}

export default async function MarcaNuevoPedidoPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }> | { error?: string }
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {})
  const hasError = resolvedSearchParams.error === '1'

  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=%2Fmarca%2Fpedidos%2Fnuevo')
  }

  if (session.user.role !== 'MARCA') {
    redirect('/unauthorized')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-overpass font-bold text-3xl text-brand-blue">Nuevo Pedido</h1>
          <p className="text-gray-600 mt-2">Crea una orden para iniciar tu flujo de produccion.</p>
        </div>
        <Link
          href="/marca/pedidos"
          className="inline-flex items-center justify-center rounded-lg font-overpass font-semibold transition-colors bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2.5 text-sm"
        >
          Volver
        </Link>
      </div>

      {hasError && (
        <div className="rounded-lg border border-status-error/30 bg-red-50 px-4 py-3 text-sm text-red-700">
          Completá los campos requeridos correctamente.
        </div>
      )}

      <form action={createPedido} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="tipoPrenda" className="block text-sm font-overpass font-medium text-brand-blue mb-1.5">
              Tipo de prenda
            </label>
            <input
              id="tipoPrenda"
              name="tipoPrenda"
              required
              placeholder="Ej: Jean, Remera, Camisa"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="cantidad" className="block text-sm font-overpass font-medium text-brand-blue mb-1.5">
              Cantidad
            </label>
            <input
              id="cantidad"
              name="cantidad"
              type="number"
              min="1"
              required
              placeholder="500"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="fechaObjetivo" className="block text-sm font-overpass font-medium text-brand-blue mb-1.5">
              Fecha objetivo
            </label>
            <input
              id="fechaObjetivo"
              name="fechaObjetivo"
              type="date"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="montoTotal" className="block text-sm font-overpass font-medium text-brand-blue mb-1.5">
              Monto total estimado
            </label>
            <input
              id="montoTotal"
              name="montoTotal"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
            />
          </div>
        </div>

        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-lg font-overpass font-semibold transition-colors bg-brand-blue hover:bg-blue-800 text-white px-5 py-2.5 text-sm"
        >
          Crear pedido
        </button>
      </form>
    </div>
  )
}

