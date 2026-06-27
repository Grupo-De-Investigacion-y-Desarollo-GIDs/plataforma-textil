'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Etapa 2.2-A — contenedor "Mi taller": cabecera + sub-tabs.
// Modelo de distribución de Sergio (QA combinado, 2026-06-27): la cabecera
// compartida queda con SOLO el nombre del taller + los pills de navegación.
// La metadata de identidad vive donde corresponde por contexto:
//   - ubicación → "Datos básicos" (card "Información del taller")
//   - etapa + ARCA → Inicio (card "Tu recorrido"), Mi recorrido, y Credenciales
//     de Mi vidriera (esto último es 2.2-B/C).
// En los formularios (editar / completar) el cromo se oculta — molde de
// `taller/pedidos/layout.tsx` (PR #374).

const subTabs = [
  { label: 'Datos básicos', href: '/taller/perfil' },
  { label: 'Mi gestión productiva', href: '/taller/perfil/gestion' },
  { label: 'Mi vidriera', href: '/taller/perfil/vidriera' },
]

function mostrarCromo(pathname: string) {
  return (
    pathname === '/taller/perfil' ||
    pathname === '/taller/perfil/gestion' ||
    pathname === '/taller/perfil/vidriera'
  )
}

export function PerfilHeaderTabs({ nombre }: { nombre: string }) {
  const pathname = usePathname()
  if (!mostrarCromo(pathname)) return null

  return (
    <div className="space-y-4">
      {/* Cabecera = SOLO el nombre del taller (sin etapa/ARCA/ubicación — se
          distribuyen por contexto, modelo Sergio QA combinado). */}
      <div className="min-w-0">
        <h1 className="font-serif font-bold text-3xl text-ink-primary break-words">{nombre}</h1>
      </div>

      {/* Sub-tabs (pills): Datos básicos | Mi gestión productiva | Mi vidriera.
          Pills con contraste fuerte (activo = azul lleno) para que se lean como
          navegación, no como texto. Responsive: overflow-x-auto + nowrap en 320/375. */}
      <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Secciones de Mi taller">
        {subTabs.map((tab) => {
          const isActive =
            tab.href === '/taller/perfil'
              ? pathname === '/taller/perfil'
              : pathname.startsWith(tab.href)

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? 'page' : undefined}
              className={`px-4 py-2 rounded-lg text-sm font-overpass font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-brand-blue text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
