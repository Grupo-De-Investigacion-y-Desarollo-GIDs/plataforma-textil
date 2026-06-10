import { Header, UserSidebar, SidebarProvider } from '@/compartido/componentes/layout'
import { Footer } from '@/compartido/componentes/layout/footer'
import { requiereRol } from '@/compartido/lib/permisos'
import { prisma } from '@/compartido/lib/prisma'
import { construirEntidadesModo } from '@/compartido/lib/entidades-modo'
import { porcentajeFormalizacion } from '@/compartido/lib/nivel'

export default async function TallerLayout({ children }: { children: React.ReactNode }) {
  const session = await requiereRol(['TALLER'])

  const taller = await prisma.taller.findFirst({
    where: { userId: session.user.id },
    select: {
      nombre: true,
      nivel: true,
      puntaje: true,
    }
  })

  const userName = taller?.nombre || session.user.name || 'Mi Taller'
  const userLevel = taller?.nivel || 'BRONCE'
  // F-01: el sidebar muestra esto como "Formalización X%" + barra de progreso, así
  // que debe ser un porcentaje 0-100 (capado), no el score crudo `puntaje`.
  const userProgress = await porcentajeFormalizacion(taller?.puntaje ?? 0)

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
          userRole="TALLER"
          showPilotPill={showPilotPill}
          roles={session.user.roles}
          activeMode={session.user.activeMode ?? undefined}
          entidades={entidades}
        />
        <div className="flex flex-1">
          <UserSidebar
            userRole="TALLER"
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
