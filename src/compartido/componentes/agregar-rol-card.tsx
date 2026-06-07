'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/compartido/componentes/ui/button'
import { useToast } from '@/compartido/componentes/ui/toast'
import { Building2, ShoppingBag } from 'lucide-react'

type RolFaltante = 'TALLER' | 'MARCA'

interface AgregarRolCardProps {
  /** Rol que el usuario NO tiene todavía (el opuesto al actual). */
  rolFaltante: RolFaltante
  /** CUIT de la entidad existente, para pre-llenar (editable). */
  cuitActual?: string | null
}

const LABEL: Record<RolFaltante, string> = { TALLER: 'Taller', MARCA: 'Marca' }
const DASHBOARD: Record<RolFaltante, string> = { TALLER: '/taller', MARCA: '/marca' }

export function AgregarRolCard({ rolFaltante, cuitActual }: AgregarRolCardProps) {
  const router = useRouter()
  const { update } = useSession()
  const { toast } = useToast()
  const [nombre, setNombre] = useState('')
  const [cuit, setCuit] = useState(cuitActual ?? '')
  const [error, setError] = useState<string | null>(null)
  const [creando, setCreando] = useState(false)

  const amable = LABEL[rolFaltante]
  const Icono = rolFaltante === 'TALLER' ? Building2 : ShoppingBag

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!nombre.trim() || !cuit.trim()) {
      setError('Completá el nombre y el CUIT')
      return
    }
    setCreando(true)
    try {
      const res = await fetch('/api/usuarios/me/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rol: rolFaltante, nombre: nombre.trim(), cuit: cuit.trim() }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data?.error?.message ?? 'No se pudo crear el perfil')
        setCreando(false)
        return
      }
      // Reflejar el nuevo modo en la sesión viva (rama jwt trigger==='update' de U-04).
      await update({ activeMode: rolFaltante })
      toast({ mensaje: `Se creó tu perfil de ${amable}`, tipo: 'success' })
      router.push(DASHBOARD[rolFaltante])
      router.refresh()
    } catch {
      setError('No se pudo crear el perfil')
      setCreando(false)
    }
  }

  return (
    <section
      data-testid="agregar-rol-card"
      className="rounded-xl border border-gray-200 bg-white p-6"
    >
      <div className="flex items-center gap-2 mb-2">
        <Icono className="w-5 h-5 text-brand-blue" />
        <h2 className="font-overpass font-bold text-lg text-brand-blue">
          Sumá tu perfil de {amable}
        </h2>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Es la misma cuenta. Vas a poder cambiar entre tus perfiles desde el menú del avatar.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="rol-nombre" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre {rolFaltante === 'TALLER' ? 'del taller' : 'de la marca'}
          </label>
          <input
            id="rol-nombre"
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder={rolFaltante === 'TALLER' ? 'Taller La Costura' : 'Mi Marca'}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none"
          />
        </div>

        <div>
          <label htmlFor="rol-cuit" className="block text-sm font-medium text-gray-700 mb-1">
            CUIT
          </label>
          <input
            id="rol-cuit"
            type="text"
            value={cuit}
            onChange={e => setCuit(e.target.value)}
            placeholder="20-12345678-9"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Pre-cargamos tu CUIT actual. Si usás otro CUIT para tu {amable.toLowerCase()}, lo verificaremos contra ARCA.
          </p>
        </div>

        {error && <p className="text-sm text-status-error">{error}</p>}

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={creando}
            data-testid="agregar-rol-submit"
          >
            Crear perfil de {amable}
          </Button>
        </div>
      </form>
    </section>
  )
}
