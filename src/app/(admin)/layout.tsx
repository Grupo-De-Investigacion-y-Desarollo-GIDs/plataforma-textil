import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import {
  LayoutDashboard, BookOpen, Users, Building2, ShoppingCart, ClipboardCheck,
  Settings, Shield, Database, BarChart3, FileText, Bell, Award, HelpCircle,
  Plug, UserCheck, Briefcase
} from 'lucide-react'

const sidebarItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Usuarios', href: '/admin/usuarios', icon: Users },
  { label: 'Talleres', href: '/admin/talleres', icon: Building2 },
  { label: 'Marcas', href: '/admin/marcas', icon: Briefcase },
  { label: 'Pedidos', href: '/admin/pedidos', icon: ShoppingCart },
  { label: 'Colecciones', href: '/admin/colecciones', icon: BookOpen },
  { label: 'Evaluaciones', href: '/admin/evaluaciones', icon: ClipboardCheck },
  { label: 'Certificados', href: '/admin/certificados', icon: Award },
  { label: 'Procesos', href: '/admin/procesos', icon: UserCheck },
  { label: 'Auditorías', href: '/admin/auditorias', icon: ClipboardCheck },
  { label: 'Documentos', href: '/admin/documentos', icon: FileText },
  { label: 'Reportes', href: '/admin/reportes', icon: BarChart3 },
  { label: 'Notificaciones', href: '/admin/notificaciones', icon: Bell },
  { label: 'FAQ', href: '/admin/faq', icon: HelpCircle },
  { label: 'Integraciones', href: '/admin/integraciones', icon: Plug },
  { label: 'Configuración', href: '/admin/configuracion', icon: Settings },
  { label: 'Roles', href: '/admin/roles', icon: Shield },
  { label: 'Seguridad', href: '/admin/logs', icon: Shield },
  { label: 'Base de datos', href: '/admin/database', icon: Database },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }
  if (session.user.role !== 'ADMIN') {
    redirect('/unauthorized')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-brand-blue text-white sticky top-0 z-50">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <span className="font-overpass font-bold text-brand-blue text-sm">PDT</span>
            </div>
            <span className="font-overpass font-bold text-lg">Admin Panel</span>
          </div>
          <Link href="/" className="text-sm hover:text-blue-200 transition-colors">Volver al sitio</Link>
        </div>
      </header>
      <div className="flex">
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] hidden lg:block">
          <nav className="p-4 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-overpass text-gray-700 hover:bg-brand-bg-light hover:text-brand-blue transition-colors">
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
