'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  X,
  Home,
  User,
  ClipboardCheck,
  Bell,
  Settings,
  BookOpen,
  HelpCircle,
  LogOut,
  Search,
  FileText,
  Building2,
  BarChart3,
  ClipboardList
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MenuItem {
  id: string
  label: string
  href: string
  icon: React.ElementType
  badge?: number
}

interface UserSidebarProps {
  isOpen: boolean
  onClose: () => void
  userRole?: 'TALLER' | 'MARCA' | 'ESTADO' | 'ADMIN'
  userName?: string
  userProgress?: number
  userLevel?: string
}

const menuItemsByRole: Record<string, MenuItem[]> = {
  TALLER: [
    { id: 'tablero', label: 'Mi Tablero', href: '/taller', icon: Home },
    { id: 'perfil', label: 'Mi Perfil', href: '/taller/perfil', icon: User },
    { id: 'formalizacion', label: 'Mi Formalización', href: '/taller/formalizacion', icon: ClipboardCheck },
    { id: 'academia', label: 'Academia', href: '/taller/aprender', icon: BookOpen },
    { id: 'notificaciones', label: 'Notificaciones', href: '/cuenta/notificaciones', icon: Bell, badge: 0 },
    { id: 'cuenta', label: 'Mi Cuenta', href: '/cuenta', icon: Settings },
  ],
  MARCA: [
    { id: 'directorio', label: 'Directorio Talleres', href: '/marca/directorio', icon: Search },
    { id: 'pedidos', label: 'Mis Pedidos', href: '/marca/pedidos', icon: ClipboardList },
    { id: 'perfil', label: 'Mi Perfil', href: '/marca/perfil', icon: Building2 },
    { id: 'notificaciones', label: 'Notificaciones', href: '/cuenta/notificaciones', icon: Bell, badge: 0 },
    { id: 'cuenta', label: 'Mi Cuenta', href: '/cuenta', icon: Settings },
  ],
  ESTADO: [
    { id: 'dashboard', label: 'Dashboard', href: '/estado', icon: Home },
    { id: 'reportes', label: 'Reportes', href: '/estado/reportes', icon: BarChart3 },
    { id: 'exportar', label: 'Exportar Datos', href: '/estado/exportar', icon: FileText },
    { id: 'notificaciones', label: 'Notificaciones', href: '/cuenta/notificaciones', icon: Bell, badge: 0 },
    { id: 'cuenta', label: 'Mi Cuenta', href: '/cuenta', icon: Settings },
  ],
  ADMIN: [
    { id: 'dashboard', label: 'Dashboard', href: '/admin', icon: Home },
    { id: 'usuarios', label: 'Usuarios', href: '/admin/usuarios', icon: User },
    { id: 'configuracion', label: 'Configuración', href: '/admin/configuracion', icon: Settings },
  ]
}

export function UserSidebar({
  isOpen,
  onClose,
  userRole = 'TALLER',
  userName = 'Usuario',
  userProgress = 0,
  userLevel = 'Bronce'
}: UserSidebarProps) {
  const pathname = usePathname()
  const menuItems = menuItemsByRole[userRole] || menuItemsByRole.TALLER

  // Bloquear scroll del body cuando está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Cerrar con ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Menú de navegación personal"
      >
        <div className="flex flex-col h-full">
          {/* Header del sidebar */}
          <div className="bg-brand-blue text-white p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Avatar y nombre */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 border-2 border-white/30">
                <span className="font-overpass font-bold text-white text-2xl">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-overpass font-bold text-lg truncate">{userName}</h2>
                <p className="text-blue-200 text-sm">
                  {userRole === 'TALLER' && `${userLevel} - ${userProgress}%`}
                  {userRole === 'MARCA' && 'Marca'}
                  {userRole === 'ESTADO' && 'Ente Estatal'}
                  {userRole === 'ADMIN' && 'Administrador'}
                </p>
              </div>
            </div>

            {/* Progress bar (solo para talleres) */}
            {userRole === 'TALLER' && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-blue-100">
                  <span>Progreso de formalización</span>
                  <span className="font-semibold">{userProgress}%</span>
                </div>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-red rounded-full transition-all duration-500"
                    style={{ width: `${userProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Navigation menu */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg font-overpass font-medium text-sm transition-colors relative group',
                        isActive
                          ? 'bg-brand-bg-light text-brand-blue'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-brand-blue'
                      )}
                    >
                      <Icon className={cn(
                        'w-5 h-5 flex-shrink-0',
                        isActive ? 'text-brand-blue' : 'text-gray-400 group-hover:text-brand-blue'
                      )} />
                      <span className="flex-1">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-2 py-0.5 bg-brand-red text-white text-xs font-bold rounded-full">
                          {item.badge}
                        </span>
                      )}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand-blue rounded-r-full" />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 space-y-1">
            <Link
              href="/ayuda"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 rounded-lg font-overpass font-medium text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-blue transition-colors group"
            >
              <HelpCircle className="w-5 h-5 text-gray-400 group-hover:text-brand-blue" />
              <span>Ayuda y Soporte</span>
            </Link>
            <button
              onClick={() => { onClose(); signOut({ callbackUrl: '/login' }); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-overpass font-medium text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors group"
            >
              <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-600" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
