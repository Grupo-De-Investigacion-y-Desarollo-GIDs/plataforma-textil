'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  X,
  User,
  Bell,
  Settings,
  HelpCircle,
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
  userLevel?: string
  /**
   * U-09 (QA #398): en páginas DEL USUARIO (ej. /cuenta) el sidebar muestra la
   * identidad del user, sin "Formalización X%" (que es del perfil Taller, no del
   * user). Default true para no afectar los layouts (taller)/(marca)/(estado).
   */
  mostrarFormalizacion?: boolean
}

// F3: solo accesos personales para los 3 roles operativos.
// Items de seccion viven en TABS_BY_ROLE del header (sin duplicacion).
const menuItemsByRole: Record<string, MenuItem[]> = {
  TALLER: [
    { id: 'notificaciones', label: 'Notificaciones', href: '/cuenta/notificaciones', icon: Bell },
    { id: 'cuenta', label: 'Mi cuenta', href: '/cuenta', icon: Settings },
    { id: 'ayuda', label: 'Ayuda', href: '/ayuda', icon: HelpCircle },
  ],
  MARCA: [
    { id: 'notificaciones', label: 'Notificaciones', href: '/cuenta/notificaciones', icon: Bell },
    { id: 'cuenta', label: 'Mi cuenta', href: '/cuenta', icon: Settings },
    { id: 'ayuda', label: 'Ayuda', href: '/ayuda', icon: HelpCircle },
  ],
  ESTADO: [
    { id: 'notificaciones', label: 'Notificaciones', href: '/cuenta/notificaciones', icon: Bell },
    { id: 'cuenta', label: 'Mi cuenta', href: '/cuenta', icon: Settings },
    { id: 'ayuda', label: 'Ayuda', href: '/ayuda', icon: HelpCircle },
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
  userLevel = 'Bronce',
  mostrarFormalizacion = true
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
                  {!mostrarFormalizacion && 'Mi cuenta'}
                  {mostrarFormalizacion && userRole === 'TALLER' && 'Taller'}
                  {mostrarFormalizacion && userRole === 'MARCA' && 'Marca'}
                  {mostrarFormalizacion && userRole === 'ESTADO' && 'Ente Estatal'}
                  {mostrarFormalizacion && userRole === 'ADMIN' && 'Administrador'}
                </p>
              </div>
            </div>
            {/* "Formalización X%" + barra de progreso ELIMINADAS (degamificación V4,
                coherente con la limpieza del dashboard #439b): el % de formalización
                no se muestra como gráfico. El recorrido se comunica por etapa/badges. */}
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

        </div>
      </aside>
    </>
  )
}
