'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Check } from 'lucide-react'
import type { UserRole } from '@prisma/client'
import { useToast } from '@/compartido/componentes/ui/toast'

interface ModoToggleProps {
  roles: UserRole[]
  activeMode: UserRole
  /** Nombre amable de la entidad por rol (ej. { TALLER: 'Taller La Aguja' }). */
  entidades?: Partial<Record<UserRole, string>>
  /** Callback al cambiar de modo (ej. cerrar el dropdown del avatar). */
  onCambio?: () => void
}

// Nombres amables (no enums crudos), per narrativa V4 §4.4.
const NOMBRE_AMABLE: Record<UserRole, string> = {
  TALLER: 'Taller',
  MARCA: 'Marca',
  ESTADO: 'Ente',
  ADMIN: 'Admin',
  CONTENIDO: 'Contenido',
}

// Acento de color por rol (azul brand = Taller, terracotta = Marca).
const ACENTO: Partial<Record<UserRole, string>> = {
  TALLER: 'text-brand-blue',
  MARCA: 'text-terra-600',
}

const DASHBOARD: Partial<Record<UserRole, string>> = {
  TALLER: '/taller',
  MARCA: '/marca',
  ESTADO: '/estado',
}

/**
 * U-04: toggle "Operando como…" estilo Airbnb. Solo se renderiza si el usuario
 * tiene 2+ roles. Cambiar de modo persiste en DB (endpoint), refleja el cambio
 * en la sesión viva (useSession().update → rama jwt trigger==='update') y
 * redirige al dashboard del nuevo modo.
 */
export function ModoToggle({ roles, activeMode, entidades, onCambio }: ModoToggleProps) {
  const router = useRouter()
  const { update } = useSession()
  const { toast } = useToast()
  const [cambiando, setCambiando] = useState<UserRole | null>(null)

  // Single-role: no se muestra nada.
  if (!roles || roles.length <= 1) return null

  async function cambiarModo(modo: UserRole) {
    if (modo === activeMode || cambiando) return
    setCambiando(modo)
    try {
      const res = await fetch('/api/usuarios/me/active-mode', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modo }),
      })
      if (!res.ok) {
        toast({ mensaje: 'No se pudo cambiar de modo', tipo: 'error' })
        setCambiando(null)
        return
      }
      // Refleja el cambio en la sesión viva sin re-login.
      await update({ activeMode: modo })

      const amable = NOMBRE_AMABLE[modo] ?? modo
      const entidad = entidades?.[modo]
      toast({
        mensaje: entidad
          ? `Ahora estás operando como ${amable} (${entidad})`
          : `Ahora estás operando como ${amable}`,
        tipo: 'success',
      })
      onCambio?.()
      router.push(DASHBOARD[modo] ?? '/')
      router.refresh()
    } catch {
      toast({ mensaje: 'No se pudo cambiar de modo', tipo: 'error' })
      setCambiando(null)
    }
  }

  return (
    <div className="px-2 py-2 border-b border-gray-100" data-testid="modo-toggle">
      <p className="px-2 pb-1.5 text-[11px] font-overpass font-semibold uppercase tracking-wider text-ink-secondary">
        Operando como
      </p>
      <ul className="flex flex-col gap-0.5">
        {roles.map((modo) => {
          const activo = modo === activeMode
          const amable = NOMBRE_AMABLE[modo] ?? modo
          const entidad = entidades?.[modo]
          const acento = ACENTO[modo] ?? 'text-ink-primary'
          return (
            <li key={modo}>
              <button
                type="button"
                data-testid={`modo-toggle-option-${modo}`}
                disabled={activo || cambiando !== null}
                onClick={() => cambiarModo(modo)}
                className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-left transition-colors ${
                  activo ? 'bg-gray-50 cursor-default' : 'hover:bg-gray-50'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    activo ? `bg-current ${acento}` : 'border border-gray-300'
                  }`}
                />
                <span className="flex-1 min-w-0">
                  <span
                    className={`block text-sm font-overpass font-semibold ${
                      activo ? acento : 'text-ink-primary'
                    }`}
                  >
                    Modo {amable}
                  </span>
                  {entidad && (
                    <span className="block text-xs font-overpass text-ink-secondary truncate">
                      {entidad}
                    </span>
                  )}
                </span>
                {activo && <Check className={`w-4 h-4 shrink-0 ${acento}`} />}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
