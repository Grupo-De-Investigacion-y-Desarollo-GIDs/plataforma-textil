import { Header } from '@/compartido/componentes/layout'
import { Footer } from '@/compartido/componentes/layout/footer'
import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { redirect } from 'next/navigation'

export default async function TallerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }
  if (session.user.role !== 'TALLER') {
    redirect('/unauthorized')
  }

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
  const userProgress = taller?.puntaje || 0

  const isMain = process.env.VERCEL_GIT_COMMIT_REF === 'main'
  const isLocal = !process.env.VERCEL_ENV
  const showPilotPill = !isMain && !isLocal

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header
        userName={userName}
        userRole="TALLER"
        userProgress={userProgress}
        userLevel={userLevel}
        showPilotPill={showPilotPill}
      />
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      <Footer />
    </div>
  )
}
