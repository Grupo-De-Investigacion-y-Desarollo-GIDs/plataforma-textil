'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { label: 'Recibidos', href: '/taller/pedidos' },
  { label: 'Disponibles', href: '/taller/pedidos/disponibles' },
]

/** Tabs visibles solo en las páginas índice, no en detalle [id] */
function showTabs(pathname: string) {
  return pathname === '/taller/pedidos' || pathname === '/taller/pedidos/disponibles'
}

export default function PedidosLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <>
      {showTabs(pathname) && (
        <nav className="flex gap-1 border-b border-gray-200 mb-6">
          {tabs.map(tab => {
            const isActive =
              tab.href === '/taller/pedidos'
                ? pathname === '/taller/pedidos'
                : pathname.startsWith(tab.href)

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-4 py-2.5 text-sm font-overpass font-semibold border-b-2 transition-colors -mb-px ${
                  isActive
                    ? 'border-brand-blue text-brand-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>
      )}
      {children}
    </>
  )
}
