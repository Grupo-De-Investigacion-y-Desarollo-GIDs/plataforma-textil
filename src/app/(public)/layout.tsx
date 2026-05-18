import { auth } from '@/compartido/lib/auth'
import { Header } from '@/compartido/componentes/layout'
import { HeaderPublic } from '@/compartido/componentes/layout/header-public'
import { Footer } from '@/compartido/componentes/layout/footer'
import { getShowPilotPill } from '@/compartido/lib/env'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role || ''

  const showPilotPill = getShowPilotPill()

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

  // Anonymous: HeaderPublic + Footer for marketing pages
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <HeaderPublic showPilotPill={showPilotPill} />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  )
}
