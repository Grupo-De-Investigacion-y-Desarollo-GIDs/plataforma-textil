'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { LogoPDT } from '@/compartido/componentes/ui/logo-pdt'
import { NotificacionesBell } from './notificaciones-bell'
import { UserSidebar } from './user-sidebar'
import { INSTITUTIONAL, TABS_BY_ROLE } from '@/compartido/lib/content/institutional'

interface HeaderProps {
  userName?: string
  userRole?: 'TALLER' | 'MARCA' | 'ESTADO'
  userLevel?: string
  userProgress?: number
  showPilotPill?: boolean
}

export function Header({
  userName = 'Usuario',
  userRole = 'TALLER',
  userProgress = 0,
  userLevel = 'Bronce',
  showPilotPill = false,
}: HeaderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

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

      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        {/* Banda 1: topbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Izquierda: menu + logo + nombre */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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

              <button
                onClick={() => setSidebarOpen(true)}
                className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-overpass font-bold text-xs">
                  {initials}
                </div>
                <span className="hidden lg:inline text-sm font-medium text-ink-primary font-overpass">
                  {userName}
                </span>
              </button>
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
    </>
  )
}
