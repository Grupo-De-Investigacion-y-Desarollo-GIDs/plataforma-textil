import Link from 'next/link'
import { auth } from '@/compartido/lib/auth'
import { Header } from '@/compartido/componentes/layout'
import { Footer } from '@/compartido/componentes/layout/footer'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role || ''

  const isMain = process.env.VERCEL_GIT_COMMIT_REF === 'main'
  const isLocal = !process.env.VERCEL_ENV
  const showPilotPill = !isMain && !isLocal

  // Logged in: Header global with tabs, sidebar, bell
  if (session?.user) {
    const userName = session.user.name || 'Usuario'
    const userRole = (role as 'TALLER' | 'MARCA' | 'ESTADO') || 'TALLER'

    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header
          userName={userName}
          userRole={userRole}
          showPilotPill={showPilotPill}
        />
        <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <Footer />
      </div>
    )
  }

  // Anonymous: minimal header for public pages
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-blue flex items-center justify-center">
              <span className="font-overpass font-bold text-white text-xs">PDT</span>
            </div>
            <span className="font-serif font-bold text-ink-primary text-sm hidden sm:inline">
              Plataforma Digital Textil
            </span>
          </Link>
          <Link href="/login" className="text-sm hover:text-brand-blue transition-colors font-overpass text-ink-secondary">
            Iniciar sesion
          </Link>
        </div>
      </header>
      <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Footer />
    </div>
  )
}
