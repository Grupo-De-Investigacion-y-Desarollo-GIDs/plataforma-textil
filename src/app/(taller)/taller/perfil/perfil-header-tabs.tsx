'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Badge } from '@/compartido/componentes/ui/badge'
import { Button } from '@/compartido/componentes/ui/button'
import { BadgeArca } from '@/compartido/componentes/badge-arca'
import { MapPin, ExternalLink } from 'lucide-react'

// Etapa 2.1 — contenedor "Mi taller": cabecera común + sub-tabs.
// Cabecera (nombre + etapa actual + ARCA verificado) y sub-tabs viven sobre
// ambas vistas (vidriera / gestión). En los formularios (editar / completar)
// el cromo se oculta — molde tomado de `taller/pedidos/layout.tsx` (PR #374).

const subTabs = [
  { label: 'Mi vidriera', href: '/taller/perfil' },
  { label: 'Mi gestión productiva', href: '/taller/perfil/gestion' },
]

function mostrarCromo(pathname: string) {
  return pathname === '/taller/perfil' || pathname === '/taller/perfil/gestion'
}

export function PerfilHeaderTabs({
  nombre,
  etapa,
  verificadoAfip,
  provincia,
  partido,
  ubicacionDetalle,
  email,
  phone,
  tallerId,
  samCompletado,
}: {
  nombre: string
  etapa: string
  verificadoAfip: boolean
  provincia: string | null
  partido: string | null
  ubicacionDetalle: string | null
  email: string
  phone: string | null
  tallerId: string
  samCompletado: boolean
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
          <p className="text-sm text-gray-500 mt-1 break-words">
            {email}
            {phone && ` · ${phone}`}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:items-end shrink-0">
          <Link href={`/perfil/${tallerId}`} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
            <Button variant="secondary" size="sm" icon={<ExternalLink className="w-4 h-4" />} className="w-full sm:w-auto">
              Ver cómo me ve el directorio
            </Button>
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link href="/taller/perfil/editar">
              <Button variant="secondary" size="sm">Editar datos básicos</Button>
            </Link>
            <Link href="/taller/perfil/completar">
              <Button variant="ghost" size="sm">
                {samCompletado ? 'Actualizar perfil productivo' : 'Completar perfil productivo'}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Sub-tabs: Mi vidriera | Mi gestión productiva */}
      <nav className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {subTabs.map((tab) => {
          const isActive =
            tab.href === '/taller/perfil'
              ? pathname === '/taller/perfil'
              : pathname.startsWith(tab.href)

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-4 py-2.5 text-sm font-overpass font-semibold border-b-2 transition-colors -mb-px whitespace-nowrap ${
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
    </div>
  )
}
