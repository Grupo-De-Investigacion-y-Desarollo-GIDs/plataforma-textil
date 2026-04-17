import Link from 'next/link'
import { auth } from '@/compartido/lib/auth'

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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
