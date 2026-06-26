'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Badge } from '@/compartido/componentes/ui/badge'
import { Button } from '@/compartido/componentes/ui/button'
import { BadgeArca } from '@/compartido/componentes/badge-arca'
import { MapPin } from 'lucide-react'

// Etapa 2.2-A — contenedor "Mi taller": cabecera común + sub-tabs.
// 3 sub-tabs en orden secuencial: Datos básicos (índice) → Mi gestión productiva
// → Mi vidriera (obligatorio → productivo → curatorial). Cabecera (nombre + etapa
// + ARCA) y sub-tabs viven sobre las 3 vistas. En los formularios (editar /
// completar) el cromo se oculta — molde de `taller/pedidos/layout.tsx` (PR #374).

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

export function PerfilHeaderTabs({
  nombre,
  etapa,
  verificadoAfip,
  provincia,
  partido,
  ubicacionDetalle,
}: {
  nombre: string
  etapa: string
  verificadoAfip: boolean
  provincia: string | null
  partido: string | null
  ubicacionDetalle: string | null
}) {
  const pathname = usePathname()
  if (!mostrarCromo(pathname)) return null

  return (
    <div className="space-y-4">
      {/* Cabecera común — nombre + etapa actual (nivelAEtapa) + ARCA verificado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="font-serif font-bold text-3xl text-ink-primary break-words">{nombre}</h1>
            <Badge variant="default">{etapa}</Badge>
          </div>
          <div className="mb-1">
            <BadgeArca verificado={verificadoAfip} />
          </div>
          {provincia && (
            <p className="flex items-center gap-1 text-gray-600">
              <MapPin className="w-4 h-4 shrink-0" /> {provincia}
              {partido ? `, ${partido}` : ''}
              {ubicacionDetalle && <span className="text-gray-400"> · {ubicacionDetalle}</span>}
            </p>
          )}
          {/* PII del responsable (nombre/email/teléfono) vive en "Mi gestión productiva"
              (privado), no en la cabecera común — minimización de datos (OIT IGDS 457). */}
        </div>

        {/* "Editar datos básicos" vive SOLO en el tab "Datos básicos" (QA #442):
            la edición de identidad pertenece a esa pestaña, no a gestión/vidriera.
            "Ver cómo me ve el directorio" → "Mi vidriera"; "Completar perfil
            productivo" → "Mi gestión productiva". */}
        {pathname === '/taller/perfil' && (
          <div className="flex flex-col gap-2 sm:items-end shrink-0">
            <Link href="/taller/perfil/editar">
              <Button variant="secondary" size="sm">Editar datos básicos</Button>
            </Link>
          </div>
        )}
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
