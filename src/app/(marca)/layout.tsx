import { Header, UserSidebar, SidebarProvider } from '@/compartido/componentes/layout'
import { Footer } from '@/compartido/componentes/layout/footer'
import { requiereRol } from '@/compartido/lib/permisos'
import { prisma } from '@/compartido/lib/prisma'

export default async function MarcaLayout({ children }: { children: React.ReactNode }) {
  const session = await requiereRol(['MARCA'])

  const marca = await prisma.marca.findFirst({
    where: { userId: session.user.id },
    select: {
      nombre: true,
    }
  })

  const userName = marca?.nombre || session.user.name || 'Mi Marca'

  const isMain = process.env.VERCEL_GIT_COMMIT_REF === 'main'
  const isLocal = !process.env.VERCEL_ENV
  const showPilotPill = !isMain && !isLocal

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header
          userName={userName}
          userRole="MARCA"
          showPilotPill={showPilotPill}
        />
        <div className="flex flex-1">
          <UserSidebar
            userRole="MARCA"
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
