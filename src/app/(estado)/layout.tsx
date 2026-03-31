import { Header } from '@/components/layout'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function EstadoLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  // Si no hay sesión, redirigir a login
  if (!session?.user) {
    redirect('/login')
  }
  if (session.user.role !== 'ESTADO') {
    redirect('/unauthorized')
  }

  const userName = session.user.name || 'Ente Estatal'

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        activeTab="dashboard"
        userName={userName}
        userRole="ESTADO"
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  )
}
