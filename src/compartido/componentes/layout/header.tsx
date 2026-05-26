'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, User, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { LogoPDT } from '@/compartido/componentes/ui/logo-pdt'
import { NotificacionesBell } from './notificaciones-bell'
import { useSidebar } from './sidebar-context'
import { INSTITUTIONAL, TABS_BY_ROLE } from '@/compartido/lib/content/institutional'

interface HeaderProps {
  userName?: string
  userRole?: 'TALLER' | 'MARCA' | 'ESTADO'
  showPilotPill?: boolean
}

export function Header({
  userName = 'Usuario',
  userRole = 'TALLER',
  showPilotPill = false,
}: HeaderProps) {
  const { open } = useSidebar()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Tabs segun rol
  const tabs = TABS_BY_ROLE[userRole] ?? []

  // Tab activo: match mas especifico primero (ordenar por longitud de href desc)
  const sortedTabs = [...tabs].sort((a, b) => b.href.length - a.href.length)
  const activeTab = sortedTabs.find(
    tab => pathname === tab.href || pathname.startsWith(tab.href + '/')
  )

  // Iniciales del usuario para avatar
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'

  // Avatar click: mobile abre sidebar, desktop abre dropdown
  function handleAvatarClick() {
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches
    if (isDesktop) {
      setMenuOpen(prev => !prev)
    } else {
      open()
    }
  }

  // Cerrar dropdown al click afuera o ESC
  useEffect(() => {
    if (!menuOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [menuOpen])

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
      {/* Banda 1: topbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Izquierda: menu + logo + nombre */}
          <div className="flex items-center gap-3">
            <button
              onClick={open}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5 text-ink-primary" />
            </button>
            <Link href={`/${userRole.toLowerCase()}`} className="flex items-center gap-2.5">
              <LogoPDT variant="icon" size="sm" />
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="font-serif font-bold text-sm text-ink-primary">
                  {INSTITUTIONAL.brandName}
                </span>
                <span className="font-overpass font-bold text-[9px] text-terra-600 uppercase tracking-wider mt-0.5">
                  {INSTITUTIONAL.brandSubtitle}
                </span>
              </div>
            </Link>
          </div>

          {/* Derecha: pill ambiente + bell + avatar */}
          <div className="flex items-center gap-3">
            {showPilotPill && (
              <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-overpass font-medium bg-pastel-yellow text-amber-900">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                Ambiente piloto
              </span>
            )}

            <NotificacionesBell />

            <div className="relative" ref={menuRef}>
              <button
                onClick={handleAvatarClick}
                className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Menú de usuario"
                aria-expanded={menuOpen}
                aria-haspopup="true"
              >
                <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-overpass font-bold text-xs">
                  {initials}
                </div>
                <span className="hidden lg:inline text-sm font-medium text-ink-primary font-overpass">
                  {userName}
                </span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-overpass font-semibold text-ink-primary truncate">{userName}</p>
                    <p className="text-xs font-overpass text-ink-secondary mt-0.5">
                      {userRole === 'TALLER' && 'Taller'}
                      {userRole === 'MARCA' && 'Marca'}
                      {userRole === 'ESTADO' && 'Ente Estatal'}
                    </p>
                  </div>
                  <Link
                    href="/cuenta"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-overpass text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-4 h-4 text-gray-400" />
                    Mi cuenta
                  </Link>
                  <button
                    onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/login' }) }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-overpass text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-gray-400" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Banda 2: tabs */}
      {tabs.length > 0 && (
        <nav className="border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ul className="flex gap-1 overflow-x-auto">
              {tabs.map(tab => {
                const isActive = activeTab?.href === tab.href
                return (
                  <li key={tab.href}>
                    <Link
                      href={tab.href}
                      className={`
                        inline-flex items-center px-4 py-3 text-sm font-overpass font-semibold whitespace-nowrap
                        border-b-2 transition-colors
                        ${isActive
                          ? 'border-brand-blue text-brand-blue'
                          : 'border-transparent text-ink-secondary hover:text-ink-primary hover:border-gray-300'
                        }
                      `}
                    >
                      {tab.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </nav>
      )}
    </header>
  )
}
