import { Header, UserSidebar, SidebarProvider } from '@/compartido/componentes/layout'
import { Footer } from '@/compartido/componentes/layout/footer'
import { requiereRol, modoActivo } from '@/compartido/lib/permisos'
import { construirEntidadesModo } from '@/compartido/lib/entidades-modo'

export default async function EstadoLayout({ children }: { children: React.ReactNode }) {
  const session = await requiereRol(['ESTADO', 'ADMIN'])

  const modo = modoActivo(session.user)
  const userName = session.user.name || (modo === 'ADMIN' ? 'Administrador' : 'Ente Estatal')

  // U-04: datos para el toggle multi-rol (no-op si single-role).
  const entidades = await construirEntidadesModo(session.user.id, session.user.roles)

  const isMain = process.env.VERCEL_GIT_COMMIT_REF === 'main'
  const isLocal = !process.env.VERCEL_ENV
  const showPilotPill = !isMain && !isLocal

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header
          userName={userName}
          userRole="ESTADO"
          showPilotPill={showPilotPill}
          roles={session.user.roles}
          activeMode={session.user.activeMode ?? undefined}
          entidades={entidades}
        />
        <div className="flex flex-1">
          <UserSidebar
            userRole="ESTADO"
            userName={userName}
          />
          <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
        </div>
        <Footer />
      </div>
    </SidebarProvider>
  )
}
