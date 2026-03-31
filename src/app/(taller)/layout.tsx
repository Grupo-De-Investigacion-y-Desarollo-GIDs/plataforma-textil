import { Header } from '@/components/layout'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function TallerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  // Si no hay sesión, redirigir a login (aunque el middleware ya debería manejarlo)
  if (!session?.user) {
    redirect('/login')
  }
  if (session.user.role !== 'TALLER') {
    redirect('/unauthorized')
  }

  // Obtener datos del taller desde la base de datos
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        activeTab="tablero"
        userName={userName}
        userRole="TALLER"
        userProgress={userProgress}
        userLevel={userLevel}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  )
}
