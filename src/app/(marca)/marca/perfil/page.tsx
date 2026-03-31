export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Save } from 'lucide-react'
import { Suspense } from 'react'
import { SaveToast } from '@/components/ui/save-toast'

async function updateMarca(formData: FormData) {
  'use server'

  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=%2Fmarca%2Fperfil')
  }

  const nombre = String(formData.get('nombre') || '').trim()
  const ubicacion = String(formData.get('ubicacion') || '').trim()
  const tipo = String(formData.get('tipo') || '').trim()
  const website = String(formData.get('website') || '').trim()
  const frecuenciaCompra = String(formData.get('frecuenciaCompra') || '').trim()
  const volumenMensualRaw = String(formData.get('volumenMensual') || '').trim()

  const volumenMensual = Number(volumenMensualRaw)
  const volumenValue = Number.isFinite(volumenMensual) && volumenMensual >= 0 ? volumenMensual : 0

  if (!nombre) {
    return
  }

  await prisma.marca.update({
    where: { userId: session.user.id },
    data: {
      nombre,
      ubicacion: ubicacion || null,
      tipo: tipo || null,
      website: website || null,
      frecuenciaCompra: frecuenciaCompra || null,
      volumenMensual: volumenValue,
    },
  })

  redirect('/marca/perfil?saved=1')
}

export default async function MarcaPerfilPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=%2Fmarca%2Fperfil')
  }

  const marca = await prisma.marca.findUnique({
    where: { userId: session.user.id },
    select: {
      nombre: true,
      cuit: true,
      ubicacion: true,
      tipo: true,
      website: true,
      frecuenciaCompra: true,
      volumenMensual: true,
      rating: true,
      pedidosRealizados: true,
    },
  })

  if (!marca) {
    return (
      <div className="space-y-6">
        <h1 className="font-overpass font-bold text-3xl text-brand-blue">Mi Perfil de Marca</h1>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-gray-700">No encontramos datos de marca para este usuario.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Suspense><SaveToast message="Perfil actualizado" /></Suspense>
      <h1 className="font-overpass font-bold text-3xl text-brand-blue">Mi Perfil de Marca</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">CUIT</p>
          <p className="font-overpass font-semibold text-brand-blue mt-1">{marca.cuit}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Pedidos realizados</p>
          <p className="font-overpass font-semibold text-brand-blue mt-1">{marca.pedidosRealizados}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Rating</p>
          <p className="font-overpass font-semibold text-brand-blue mt-1">{marca.rating.toFixed(1)}</p>
        </div>
      </div>

      <form action={updateMarca} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="nombre" className="block text-sm font-overpass font-medium text-brand-blue mb-1.5">Nombre de la marca</label>
            <input id="nombre" name="nombre" defaultValue={marca.nombre} required className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent" />
          </div>
          <div>
            <label htmlFor="tipo" className="block text-sm font-overpass font-medium text-brand-blue mb-1.5">Tipo</label>
            <input id="tipo" name="tipo" defaultValue={marca.tipo || ''} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent" />
          </div>
          <div>
            <label htmlFor="ubicacion" className="block text-sm font-overpass font-medium text-brand-blue mb-1.5">Ubicacion</label>
            <input id="ubicacion" name="ubicacion" defaultValue={marca.ubicacion || ''} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent" />
          </div>
          <div>
            <label htmlFor="website" className="block text-sm font-overpass font-medium text-brand-blue mb-1.5">Website</label>
            <input id="website" name="website" defaultValue={marca.website || ''} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent" />
          </div>
          <div>
            <label htmlFor="frecuenciaCompra" className="block text-sm font-overpass font-medium text-brand-blue mb-1.5">Frecuencia de compra</label>
            <input id="frecuenciaCompra" name="frecuenciaCompra" defaultValue={marca.frecuenciaCompra || ''} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent" />
          </div>
          <div>
            <label htmlFor="volumenMensual" className="block text-sm font-overpass font-medium text-brand-blue mb-1.5">Volumen mensual</label>
            <input id="volumenMensual" name="volumenMensual" type="number" min="0" defaultValue={marca.volumenMensual} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent" />
          </div>
        </div>

        <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-brand-blue px-5 py-2.5 text-sm font-overpass font-semibold text-white hover:bg-blue-800 transition-colors">
          <Save className="w-4 h-4" />
          Guardar cambios
        </button>
      </form>
    </div>
  )
}