'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  X,
  User,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
} from 'lucide-react'
import { cn } from '@/compartido/lib/utils'
import { useSidebar } from './sidebar-context'

interface MenuItem {
  id: string
  label: string
  href: string
  icon: React.ElementType
  badge?: number
}

interface UserSidebarProps {
  userRole?: 'TALLER' | 'MARCA' | 'ESTADO' | 'ADMIN'
  userName?: string
  userProgress?: number
  userLevel?: string
}

// F3: solo accesos personales para los 3 roles operativos.
// Items de seccion viven en TABS_BY_ROLE del header (sin duplicacion).
const menuItemsByRole: Record<string, MenuItem[]> = {
  TALLER: [
    { id: 'notificaciones', label: 'Notificaciones', href: '/cuenta/notificaciones', icon: Bell },
    { id: 'cuenta', label: 'Mi cuenta', href: '/cuenta', icon: Settings },
  ],
  MARCA: [
    { id: 'notificaciones', label: 'Notificaciones', href: '/cuenta/notificaciones', icon: Bell },
    { id: 'cuenta', label: 'Mi cuenta', href: '/cuenta', icon: Settings },
  ],
  ESTADO: [
    { id: 'notificaciones', label: 'Notificaciones', href: '/cuenta/notificaciones', icon: Bell },
    { id: 'cuenta', label: 'Mi cuenta', href: '/cuenta', icon: Settings },
  ],
  ADMIN: [
    { id: 'dashboard', label: 'Dashboard', href: '/admin', icon: User },
    { id: 'usuarios', label: 'Usuarios', href: '/admin/usuarios', icon: User },
    { id: 'configuracion', label: 'Configuración', href: '/admin/configuracion', icon: Settings },
  ],
}

export function UserSidebar({
  userRole = 'TALLER',
  userName = 'Usuario',
  userProgress = 0,
  userLevel = 'Bronce'
}: UserSidebarProps) {
  const pathname = usePathname()
  const { isOpen, close } = useSidebar()
  const menuItems = menuItemsByRole[userRole] || menuItemsByRole.TALLER
  const [badgeCount, setBadgeCount] = useState(0)

  // Fetch badge on mount (desktop sidebar nunca hace isOpen=true)
  // + re-fetch when mobile drawer opens
  useEffect(() => {
    const fetchBadge = () => {
      fetch('/api/notificaciones?limit=1')
        .then(r => r.json())
        .then(data => setBadgeCount(data.sinLeer ?? 0))
        .catch(() => {})
    }
    fetchBadge()
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetch('/api/notificaciones?limit=1')
        .then(r => r.json())
        .then(data => setBadgeCount(data.sinLeer ?? 0))
        .catch(() => {})
    }
  }, [isOpen])

  const menuItemsConBadge = menuItems.map(item =>
    item.id === 'notificaciones' ? { ...item, badge: badgeCount } : item
  )

  // Body scroll lock: SOLO en mobile cuando drawer esta abierto
  useEffect(() => {
    if (isOpen) {
      const isDesktop = window.matchMedia('(min-width: 1024px)').matches
      if (!isDesktop) {
        document.body.style.overflow = 'hidden'
      }
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Cerrar con ESC (solo mobile — en desktop sidebar siempre visible)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        const isDesktop = window.matchMedia('(min-width: 1024px)').matches
        if (!isDesktop) {
          close()
        }
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, close])

  return (
    <>
      {/* Overlay — solo mobile */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity duration-300 lg:hidden',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={close}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={cn(
          // Mobile: drawer fixed
          'fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-[60] transform transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: static sidebar en flex flow
          'lg:static lg:translate-x-0 lg:w-64 lg:shadow-none lg:z-auto lg:h-auto lg:transform-none',
          'lg:border-r lg:border-gray-200 lg:min-h-[calc(100vh-7rem)]'
        )}
        aria-label="Menú principal"
      >
        <div className="flex flex-col h-full">
          {/* Header del sidebar */}
          <div className="bg-brand-blue text-white p-6 relative">
            {/* Cerrar — solo mobile */}
            <button
              onClick={close}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors lg:hidden"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Avatar y nombre */}
            <div className="flex items-center gap-4 mb-4 lg:mb-2">
              <div className="w-16 h-16 lg:w-12 lg:h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 border-2 border-white/30">
                <span className="font-overpass font-bold text-white text-2xl lg:text-lg">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-overpass font-bold text-lg lg:text-base truncate">{userName}</h2>
                <p className="text-white/70 text-sm lg:text-xs">
                  {userRole === 'TALLER' && `Formalización ${userProgress}%`}
                  {userRole === 'MARCA' && 'Marca'}
                  {userRole === 'ESTADO' && 'Ente Estatal'}
                  {userRole === 'ADMIN' && 'Administrador'}
                </p>
              </div>
            </div>

            {/* Progress bar (solo para talleres) */}
            {userRole === 'TALLER' && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-white/60">
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
              {menuItemsConBadge.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      onClick={close}
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
              onClick={close}
              className="flex items-center gap-3 px-4 py-3 rounded-lg font-overpass font-medium text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-blue transition-colors group"
            >
              <HelpCircle className="w-5 h-5 text-gray-400 group-hover:text-brand-blue" />
              <span>Ayuda</span>
            </Link>
            <button
              onClick={() => { close(); signOut({ callbackUrl: '/login' }); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-overpass font-medium text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors group"
            >
              <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-600" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
