'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Loader2 } from 'lucide-react'
import { Button } from '@/compartido/componentes/ui/button'
import { useToast } from '@/compartido/componentes/ui/toast'

interface Props {
  tallerId: string
  cuitActual: string
  // Estado de gracia para adaptar el copy (banner de INACTIVA vs EN_GRACIA).
  inactiva: boolean
}

// Pieza A del circuito CUIT V4 — self-service del taller. Vive en /taller/formalizacion, anclado
// desde el CTA "Verificar mi CUIT" de los banners de gracia/inactiva. Doble uso en la misma UI:
// corregir el número mal cargado O reintentar el mismo (el caso "mi CUIT está bien, ARCA estaba
// caído al registrarme"). Solo se renderiza si el taller NO está verificado (gating server-side
// en la página + en el endpoint).
export function CorregirCuitForm({ tallerId, cuitActual, inactiva }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [cuit, setCuit] = useState(cuitActual ?? '')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleVerificar() {
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await fetch(`/api/arca/corregir-cuit/${tallerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cuit }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.exitosa) {
        toast('¡CUIT verificado! Tu cuenta se reactivó y ya aparecés en el directorio.')
        setTimeout(() => router.refresh(), 1200)
        return
      }
      const mensaje = data.mensaje || 'No se pudo verificar el CUIT. Intentá de nuevo.'
      setErrorMsg(mensaje)
      toast(mensaje, 'error')
    } catch {
      const mensaje = 'Error de conexión. Intentá de nuevo en un momento.'
      setErrorMsg(mensaje)
      toast(mensaje, 'error')
    } finally {
      setLoading(false)
    }
  }

  const cuitNorm = cuit.replace(/-/g, '')
  const cuitValido = /^\d{11}$/.test(cuitNorm)

  return (
    <div
      id="verificar-cuit"
      className="border-l-4 border-l-brand-blue bg-pastel-blue/40 rounded-card p-4 scroll-mt-24"
    >
      <p className="flex items-center gap-1.5 font-overpass font-bold text-brand-blue mb-1">
        <ShieldCheck className="w-4 h-4 shrink-0" />
        {inactiva
          ? 'Verificá tu CUIT para reactivar tu cuenta'
          : 'Verificá tu CUIT para aparecer en el directorio'}
      </p>
      <p className="text-sm text-gray-600 mb-3">
        El CUIT que tenés cargado todavía no pudo verificarse contra ARCA. Corregilo si está mal, o
        volvé a intentar si es correcto (a veces ARCA no responde en el momento del registro). En
        cuanto se verifique, tu cuenta {inactiva ? 'se reactiva' : 'aparece en el directorio'} y vas
        a poder cotizar pedidos.
      </p>

      <label htmlFor="cuit-input" className="block text-xs font-semibold text-gray-500 mb-1">
        CUIT (11 dígitos, sin guiones)
      </label>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          id="cuit-input"
          type="text"
          inputMode="numeric"
          value={cuit}
          onChange={(e) => setCuit(e.target.value)}
          disabled={loading}
          placeholder="20123456789"
          className="w-full sm:flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 disabled:opacity-50"
        />
        <Button
          onClick={handleVerificar}
          disabled={loading || !cuitValido}
          icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          className="w-full sm:w-auto"
        >
          {loading ? 'Verificando...' : 'Verificar contra ARCA'}
        </Button>
      </div>

      {errorMsg && <p className="text-sm text-red-600 mt-2">{errorMsg}</p>}
    </div>
  )
}
