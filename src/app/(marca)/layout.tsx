import { Header } from '@/components/layout'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function MarcaLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  // Si no hay sesión, redirigir a login
  if (!session?.user) {
    redirect('/login')
  }
  if (session.user.role !== 'MARCA') {
    redirect('/unauthorized')
  }

  // Obtener datos de la marca desde la base de datos
  const marca = await prisma.marca.findFirst({
    where: { userId: session.user.id },
    select: {
      nombre: true,
    }
  })

  const userName = marca?.nombre || session.user.name || 'Mi Marca'

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        activeTab="directorio"
        userName={userName}
        userRole="MARCA"
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  )
}
