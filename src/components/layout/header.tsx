'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Globe, Search, Menu, X, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserSidebar } from './user-sidebar'

interface Tab {
  id: string
  label: string
  href: string
}

const tabsByRole: Record<string, Tab[]> = {
  TALLER: [
    { id: 'tablero', label: 'Tablero', href: '/taller' },
    { id: 'pedidos', label: 'Pedidos', href: '/taller/pedidos' },
    { id: 'formalizacion', label: 'Formalización', href: '/taller/formalizacion' },
    { id: 'perfil', label: 'Mi Perfil', href: '/taller/perfil' },
    { id: 'aprender', label: 'Academia', href: '/taller/aprender' },
  ],
  MARCA: [
    { id: 'directorio', label: 'Directorio', href: '/marca/directorio' },
    { id: 'pedidos', label: 'Pedidos', href: '/marca/pedidos' },
    { id: 'perfil', label: 'Mi Perfil', href: '/marca/perfil' },
  ],
  ESTADO: [
    { id: 'dashboard', label: 'Dashboard', href: '/estado' },
    { id: 'exportar', label: 'Exportar', href: '/estado/exportar' },
  ],
  ADMIN: [
    { id: 'dashboard', label: 'Dashboard', href: '/admin' },
    { id: 'usuarios', label: 'Usuarios', href: '/admin/usuarios' },
    { id: 'configuracion', label: 'Configuración', href: '/admin/configuracion' },
  ],
}

interface HeaderProps {
  activeTab?: string
  userName?: string
  userRole?: 'TALLER' | 'MARCA' | 'ESTADO' | 'ADMIN'
  userProgress?: number
  userLevel?: string
}

export function Header({
  userName = 'Usuario',
  userRole = 'TALLER',
  userProgress = 40,
  userLevel = 'Bronce'
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const tabs = tabsByRole[userRole] || tabsByRole.TALLER

  // Detectar tab activo por la ruta actual
  const activeTab = (() => {
    // Buscar match mas especifico primero (ordenar por longitud de href desc)
    const sorted = [...tabs].sort((a, b) => b.href.length - a.href.length)
    const match = sorted.find(tab => pathname.startsWith(tab.href))
    return match?.id || tabs[0]?.id || ''
  })()

  return (
    <>
      <UserSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole={userRole}
        userName={userName}
        userProgress={userProgress}
        userLevel={userLevel}
      />

      <header className="sticky top-0 z-50">
        <div className="bg-brand-topbar text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-10 text-sm">
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex items-center gap-2 hover:bg-white/10 px-3 py-1.5 rounded transition-colors"
                aria-label="Abrir menú personal"
              >
                <Menu className="w-4 h-4" />
                <span className="hidden sm:inline">Menú</span>
              </button>

              <div className="flex items-center gap-6">
                <button className="flex items-center gap-2 hover:text-blue-200 transition-colors">
                  <Globe className="w-4 h-4" />
                  <span className="hidden sm:inline">ESPAÑOL</span>
                </button>
                <nav className="hidden md:flex items-center gap-6">
                  <span className="text-green-400 font-semibold">V2.0</span>
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="hover:text-blue-200 transition-colors flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    {userName}
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>

      <div className="bg-brand-blue text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <Link href="/" className="w-14 h-14 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                <span className="font-overpass font-bold text-brand-blue text-lg">PDT</span>
              </Link>
              <div className="hidden sm:block">
                <h1 className="font-overpass font-bold text-xl">Plataforma Digital Textil</h1>
                {userName && <p className="text-blue-200 text-sm font-overpass">{userRole}: {userName}</p>}
              </div>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-brand-tabnav text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="hidden md:flex items-center justify-between">
            <div className="flex">
              {tabs.map((tab) => (
                <Link key={tab.id} href={tab.href}
                  className={cn(
                    'px-6 py-4 font-overpass font-medium transition-colors relative',
                    activeTab === tab.id ? 'bg-white text-brand-blue' : 'text-white hover:bg-white/10'
                  )}>
                  {tab.label}
                  {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-red" />}
                </Link>
              ))}
            </div>
            <button className="p-4 hover:bg-white/10 transition-colors">
              <Search className="w-5 h-5" />
            </button>
          </nav>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-brand-blue border-t border-white/20">
          <nav className="px-4 py-2">
            {tabs.map((tab) => (
              <Link key={tab.id} href={tab.href}
                className={cn(
                  'block px-4 py-3 font-overpass font-medium rounded-lg',
                  activeTab === tab.id ? 'bg-white text-brand-blue' : 'text-white hover:bg-white/10'
                )}>
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
      </header>
    </>
  )
}
