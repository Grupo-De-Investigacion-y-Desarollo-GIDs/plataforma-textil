import Link from 'next/link'
import { auth } from '@/compartido/lib/auth'
import { Header } from '@/compartido/componentes/layout'

const panelByRole: Record<string, { label: string; href: string }> = {
  TALLER: { label: 'Ir al panel', href: '/taller' },
  MARCA: { label: 'Ir al panel', href: '/marca' },
  ESTADO: { label: 'Ir al panel', href: '/estado' },
  ADMIN: { label: 'Ir al panel', href: '/admin' },
  CONTENIDO: { label: 'Ir al panel', href: '/contenido' },
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role || ''
  const panel = panelByRole[role]

  // Logged in: Header global with NotificacionesBell, sidebar, tabs
  if (session?.user) {
    const userName = session.user.name || 'Usuario'
    const userRole = (role as 'TALLER' | 'MARCA' | 'ESTADO' | 'ADMIN') || 'TALLER'

    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          userName={userName}
          userRole={userRole}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>
    )
  }

  // Anonymous: minimal header for public pages
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
          <Link href="/login" className="text-sm hover:text-blue-200 transition-colors font-overpass">
            Iniciar sesion
          </Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
