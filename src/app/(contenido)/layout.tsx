import { auth } from '@/compartido/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogoutButton } from '@/compartido/componentes/ui/logout-button'
import { ContenidoSidebar } from './contenido-sidebar'

export default async function ContenidoLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const role = (session.user as { role?: string }).role
  if (role !== 'CONTENIDO' && role !== 'ADMIN') {
    redirect('/unauthorized')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-brand-blue text-white sticky top-0 z-50">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <span className="font-overpass font-bold text-brand-blue text-sm">PDT</span>
            </div>
            <span className="font-overpass font-bold text-lg">Panel de Contenidos</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm hover:text-blue-200 transition-colors">
              Volver al sitio
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      <div className="flex">
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] hidden lg:block">
          <ContenidoSidebar />
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
