'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, ClipboardList, Bell } from 'lucide-react'

const sidebarItems = [
  { label: 'Colecciones', href: '/contenido/colecciones', icon: BookOpen },
  { label: 'Evaluaciones', href: '/contenido/evaluaciones', icon: ClipboardList },
  { label: 'Notificaciones', href: '/contenido/notificaciones', icon: Bell },
]

export function ContenidoSidebar() {
  const pathname = usePathname()
  return (
    <nav className="p-4 space-y-1">
      {sidebarItems.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-overpass transition-colors ${
              pathname.startsWith(item.href)
                ? 'bg-brand-blue text-white'
                : 'text-gray-700 hover:bg-brand-bg-light hover:text-brand-blue'
            }`}
          >
            <Icon className="w-5 h-5" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
