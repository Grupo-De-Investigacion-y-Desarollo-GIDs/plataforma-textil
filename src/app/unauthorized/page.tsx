import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'
import { auth } from '@/compartido/lib/auth'

const panelByRole: Record<string, { label: string; href: string }> = {
  TALLER: { label: 'Ir al panel', href: '/taller' },
  MARCA: { label: 'Ir al panel', href: '/marca' },
  ESTADO: { label: 'Ir al panel', href: '/estado' },
  ADMIN: { label: 'Ir al panel', href: '/admin' },
  CONTENIDO: { label: 'Ir al panel', href: '/contenido' },
}

export default async function UnauthorizedPage() {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role || ''
  const panel = panelByRole[role]

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-brand-blue text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <span className="font-overpass font-bold text-brand-blue text-sm">PDT</span>
            </div>
            <span className="font-overpass font-bold">Plataforma Digital Textil</span>
          </Link>
          {session?.user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-blue-200">{session.user.name}</span>
              {panel && (
                <Link href={panel.href} className="text-sm hover:text-blue-200 transition-colors font-overpass font-semibold">
                  {panel.label}
                </Link>
              )}
            </div>
          ) : (
            <Link href="/login" className="text-sm hover:text-blue-200 transition-colors font-overpass">
              Iniciar sesión
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <ShieldAlert className="w-10 h-10 text-red-600" />
            </div>
          </div>

          <h1 className="font-overpass font-bold text-3xl text-brand-blue mb-3">
            Acceso No Autorizado
          </h1>

          <p className="text-gray-600 mb-8">
            No tenes permiso para acceder a esta sección de la plataforma.
            Verificá tu rol de usuario o contactá al administrador.
          </p>

          <div className="space-y-3">
            {panel ? (
              <Link
                href={panel.href}
                className="block w-full bg-brand-blue text-white font-overpass font-semibold py-3 px-6 rounded-lg hover:bg-brand-blue-hover transition-colors"
              >
                Volver a mi panel
              </Link>
            ) : (
              <Link
                href="/"
                className="block w-full bg-brand-blue text-white font-overpass font-semibold py-3 px-6 rounded-lg hover:bg-brand-blue-hover transition-colors"
              >
                Volver al inicio
              </Link>
            )}

            <Link
              href="/ayuda"
              className="block w-full border-2 border-gray-300 text-gray-700 font-overpass font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Contactar Soporte
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
