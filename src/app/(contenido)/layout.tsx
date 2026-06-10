import { requiereRol } from '@/compartido/lib/permisos'
import Link from 'next/link'
import { LogoutButton } from '@/compartido/componentes/ui/logout-button'
import { ContenidoSidebar } from './contenido-sidebar'

export default async function ContenidoLayout({ children }: { children: React.ReactNode }) {
  await requiereRol(['CONTENIDO', 'ADMIN'])

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
            {/* F-02: CONTENIDO usa este header propio, sin el dropdown del Header
                compartido. Sin este link, /cuenta solo era accesible por URL. */}
            <Link href="/cuenta" className="text-sm hover:text-white/70 transition-colors">
              Mi cuenta
            </Link>
            <Link href="/" className="text-sm hover:text-white/70 transition-colors">
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
