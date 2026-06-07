import { auth } from '@/compartido/lib/auth'
import { modoActivo } from '@/compartido/lib/roles'
import { prisma } from '@/compartido/lib/prisma'
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
    const userRole = (modoActivo(session.user) as 'TALLER' | 'MARCA' | 'ESTADO') || 'TALLER'

    // BUG A (QA #398): el sidebar de páginas (public) (ej. /cuenta) debe respetar el
    // activeMode — mostrar la entidad operativa (nombre/nivel/progreso), no la identidad
    // del user. Replica la lógica de los layouts (taller)/(marca). Roles operativos:
    // TALLER → taller, MARCA → marca; ESTADO/ADMIN/CONTENIDO no tienen entidad operativa.
    let userName = session.user.name || 'Usuario'
    let userProgress: number | undefined
    let userLevel: string | undefined

    if (userRole === 'TALLER') {
      const taller = await prisma.taller.findFirst({
        where: { userId: session.user.id },
        select: { nombre: true, nivel: true, puntaje: true },
      })
      userName = taller?.nombre || userName
      userLevel = taller?.nivel || 'BRONCE'
      userProgress = taller?.puntaje || 0
    } else if (userRole === 'MARCA') {
      const marca = await prisma.marca.findFirst({
        where: { userId: session.user.id },
        select: { nombre: true },
      })
      userName = marca?.nombre || userName
    }

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
              userProgress={userProgress}
              userLevel={userLevel}
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
