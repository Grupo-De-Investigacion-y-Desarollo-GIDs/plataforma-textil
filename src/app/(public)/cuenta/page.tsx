export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { rolesEfectivos } from '@/compartido/lib/roles'
import { Bell, User, ShieldCheck, Building2, ShoppingBag, ArrowRight } from 'lucide-react'
import { CuentaWhatsappForm } from '@/compartido/componentes/cuenta-whatsapp-form'
import { AgregarRolCard } from '@/compartido/componentes/agregar-rol-card'

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
      roles: true,
      activeMode: true,
      createdAt: true,
      notificacionesWhatsapp: true,
      notificacionesRecibidas: { where: { leida: false }, select: { id: true } },
    },
  })

  if (!user) {
    redirect('/login')
  }

  // Perfiles operativos del USUARIO (puede tener 1 o 2). /cuenta es del user, no del
  // rol activo: mostramos TODOS sus perfiles, sea cual sea el activeMode.
  const [taller, marca] = await Promise.all([
    prisma.taller.findFirst({ where: { userId: user.id }, select: { cuit: true, nombre: true, puntaje: true } }),
    prisma.marca.findFirst({ where: { userId: user.id }, select: { cuit: true, nombre: true } }),
  ])

  // U-09: ofrecer "agregar segundo rol" solo a un single user-rol (tiene exactamente
  // una de las dos entidades). El CUIT existente pre-llena el formulario.
  const rolFaltante: 'TALLER' | 'MARCA' | null =
    taller && !marca ? 'MARCA' : marca && !taller ? 'TALLER' : null
  const cuitActual = taller?.cuit ?? marca?.cuit ?? null

  // FIX C (QA #398 r2): "Roles: lista" + "Rol activo: X" en líneas separadas para
  // multi-rol; "Rol: X" (singular) para single-rol. El rol activo es user.role
  // (== activeMode por invariante).
  const rolesEfec = rolesEfectivos({ roles: user.roles, role: user.role })
  const esMultiRol = rolesEfec.length > 1

  // ¿Es un rol operativo (TALLER/MARCA) con perfiles, o un rol de equipo sin perfiles?
  const tienePerfilesOperativos = Boolean(taller || marca)

  return (
    <div className="space-y-6">
      <h1 className="font-overpass font-bold text-3xl text-brand-blue">Mi cuenta</h1>

      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="font-overpass font-bold text-lg text-brand-blue mb-4">Datos personales</h2>
        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          <p><span className="text-gray-500">Nombre:</span> <span className="font-medium text-gray-800">{user.name || 'Sin nombre'}</span></p>
          <p><span className="text-gray-500">Email:</span> <span className="font-medium text-gray-800">{user.email}</span></p>
          <p><span className="text-gray-500">Telefono:</span> <span className="font-medium text-gray-800">{user.phone || '-'}</span></p>
          <p><span className="text-gray-500">Alta:</span> <span className="font-medium text-gray-800">{new Date(user.createdAt).toLocaleDateString('es-AR')}</span></p>
          {esMultiRol ? (
            <>
              <p><span className="text-gray-500">Roles:</span> <span className="font-medium text-gray-800">{rolesEfec.join(', ')}</span></p>
              <p><span className="text-gray-500">Rol activo:</span> <span className="font-medium text-gray-800">{user.role}</span></p>
            </>
          ) : (
            <p><span className="text-gray-500">Rol:</span> <span className="font-medium text-gray-800">{user.role}</span></p>
          )}
        </div>
      </section>

      {/* Tus perfiles activos: cards de Taller/Marca con link a su área. Solo para
          roles operativos; los roles de equipo (ADMIN/ESTADO/CONTENIDO) no tienen. */}
      {tienePerfilesOperativos && (
        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="font-overpass font-bold text-lg text-brand-blue mb-4">Tus perfiles</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {taller && (
              <div className="rounded-lg border border-gray-200 p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-brand-blue" />
                  <h3 className="font-overpass font-semibold text-gray-800 truncate">{taller.nombre}</h3>
                </div>
                <p className="text-sm text-gray-500">Formalización: <span className="font-medium text-gray-700">{taller.puntaje ?? 0}%</span></p>
                <Link href="/taller" className="mt-1 inline-flex items-center gap-1 text-sm font-overpass font-semibold text-brand-blue hover:underline">
                  Ir al taller <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
            {marca && (
              <div className="rounded-lg border border-gray-200 p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-terra-600" />
                  <h3 className="font-overpass font-semibold text-gray-800 truncate">{marca.nombre}</h3>
                </div>
                <p className="text-sm text-gray-500">Formalización: <span className="font-medium text-gray-700">—</span></p>
                <Link href="/marca" className="mt-1 inline-flex items-center gap-1 text-sm font-overpass font-semibold text-terra-600 hover:underline">
                  Ir a la marca <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      <CuentaWhatsappForm
        phoneInicial={user.phone}
        whatsappActivo={user.notificacionesWhatsapp}
      />

      {rolFaltante && (
        <AgregarRolCard rolFaltante={rolFaltante} cuitActual={cuitActual} />
      )}

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
