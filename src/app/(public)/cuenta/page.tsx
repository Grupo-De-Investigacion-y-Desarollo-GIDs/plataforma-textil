export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Bell, User, ShieldCheck } from 'lucide-react'

export default async function CuentaPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=%2Fcuenta')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      createdAt: true,
      notificaciones: { where: { leida: false }, select: { id: true } },
    },
  })

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <h1 className="font-overpass font-bold text-3xl text-brand-blue">Mi Cuenta</h1>

      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="font-overpass font-bold text-lg text-brand-blue mb-4">Resumen</h2>
        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          <p><span className="text-gray-500">Nombre:</span> <span className="font-medium text-gray-800">{user.name || 'Sin nombre'}</span></p>
          <p><span className="text-gray-500">Email:</span> <span className="font-medium text-gray-800">{user.email}</span></p>
          <p><span className="text-gray-500">Telefono:</span> <span className="font-medium text-gray-800">{user.phone || '-'}</span></p>
          <p><span className="text-gray-500">Rol:</span> <span className="font-medium text-gray-800">{user.role}</span></p>
          <p><span className="text-gray-500">Alta:</span> <span className="font-medium text-gray-800">{new Date(user.createdAt).toLocaleDateString('es-AR')}</span></p>
          <p><span className="text-gray-500">No leidas:</span> <span className="font-medium text-gray-800">{user.notificaciones.length}</span></p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link href="/mi-cuenta" className="rounded-xl border border-gray-200 bg-white p-5 hover:border-brand-blue hover:shadow-card transition-all">
          <div className="flex items-center gap-3 mb-2">
            <User className="w-5 h-5 text-brand-blue" />
            <h2 className="font-overpass font-semibold text-brand-blue">Editar perfil y contrasena</h2>
          </div>
          <p className="text-sm text-gray-600">Actualiza tu nombre, telefono y credenciales.</p>
        </Link>

        <Link href="/cuenta/notificaciones" className="rounded-xl border border-gray-200 bg-white p-5 hover:border-brand-blue hover:shadow-card transition-all">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-5 h-5 text-brand-blue" />
            <h2 className="font-overpass font-semibold text-brand-blue">Notificaciones</h2>
          </div>
          <p className="text-sm text-gray-600">Revisa avisos recientes y marca como leidas.</p>
        </Link>
      </section>

      <section className="rounded-xl border border-brand-bg-light bg-brand-bg-light/40 p-5 text-sm text-gray-700 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-brand-blue mt-0.5" />
        <p>Todavia no se integran servicios externos en esta version interna. Las funciones locales de cuenta y notificaciones quedan habilitadas.</p>
      </section>
    </div>
  )
}