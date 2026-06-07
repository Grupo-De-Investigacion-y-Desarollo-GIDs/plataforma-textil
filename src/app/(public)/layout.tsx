import { auth } from '@/compartido/lib/auth'
import { modoActivo } from '@/compartido/lib/roles'
import { construirEntidadesModo } from '@/compartido/lib/entidades-modo'
import { Header, UserSidebar, SidebarProvider } from '@/compartido/componentes/layout'
import { HeaderPublic } from '@/compartido/componentes/layout/header-public'
import { Footer } from '@/compartido/componentes/layout/footer'
import { getShowPilotPill } from '@/compartido/lib/env'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  const showPilotPill = getShowPilotPill()

  // Logged in: Header global with tabs + sidebar visible en desktop
  if (session?.user) {
    // FIX A replanteado (QA #398 r2): las páginas (public) — sobre todo /cuenta —
    // son DEL USUARIO, no del perfil/rol activo. El sidebar muestra la identidad del
    // user (nombre propio, sin "Formalización X%" del taller). El Header sí conserva
    // el modo activo para tabs + Pill + ModoToggle (contexto global de operación).
    const userName = session.user.name || 'Usuario'
    const userRole = (modoActivo(session.user) as 'TALLER' | 'MARCA' | 'ESTADO') || 'TALLER'

    // U-04: contexto multi-rol para el toggle + pill "Modo X" (no-op si single-role).
    const entidades = await construirEntidadesModo(session.user.id, session.user.roles)

    return (
      <SidebarProvider>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Header
            userName={userName}
            userRole={userRole}
            showPilotPill={showPilotPill}
            roles={session.user.roles}
            activeMode={session.user.activeMode ?? undefined}
            entidades={entidades}
          />
          <div className="flex flex-1">
            <UserSidebar
              userRole={userRole}
              userName={userName}
              mostrarFormalizacion={false}
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
