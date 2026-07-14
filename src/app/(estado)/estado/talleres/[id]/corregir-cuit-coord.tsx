'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Loader2 } from 'lucide-react'

// Pieza B del circuito CUIT V4 — override de COORD. Extiende el panel ARCA de ESTADO con la
// comparación LADO A LADO que pidió Sergio: el CUIT declarado (el que falla) frente a un campo
// para el CUIT corregido que COORD copia del PDF de la constancia que tiene a la vista. Usa el
// MISMO endpoint que el self-service del taller (auth dual): POST /api/arca/corregir-cuit/[id].
export function CorregirCuitCoord({ tallerId, cuitDeclarado }: { tallerId: string; cuitDeclarado: string }) {
  const router = useRouter()
  const [cuit, setCuit] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null)

  async function handleVerificar() {
    setLoading(true)
    setMsg(null)
    try {
      const res = await fetch(`/api/arca/corregir-cuit/${tallerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cuit }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.exitosa) {
        setMsg({ ok: true, texto: 'CUIT corregido y verificado. El taller quedó reactivado.' })
        setTimeout(() => router.refresh(), 1200)
        return
      }
      setMsg({ ok: false, texto: data.mensaje || 'No se pudo verificar el CUIT.' })
    } catch {
      setMsg({ ok: false, texto: 'Error de conexión.' })
    } finally {
      setLoading(false)
    }
  }

  const cuitValido = /^\d{11}$/.test(cuit.replace(/-/g, ''))

  return (
    <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <p className="text-sm font-semibold text-gray-700 mb-3">Corregir CUIT contra la constancia</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">CUIT declarado (falla en ARCA)</label>
          <input
            type="text"
            value={cuitDeclarado || '—'}
            readOnly
            className="w-full border border-gray-200 bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-500"
          />
        </div>
        <div>
          <label htmlFor="cuit-coord" className="block text-xs font-semibold text-gray-500 mb-1">CUIT corregido (del PDF)</label>
          <input
            id="cuit-coord"
            type="text"
            inputMode="numeric"
            value={cuit}
            onChange={(e) => setCuit(e.target.value)}
            disabled={loading}
            placeholder="11 dígitos, sin guiones"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 disabled:opacity-50"
          />
        </div>
      </div>
      <div className="flex items-center gap-3 mt-3">
        <button
          onClick={handleVerificar}
          disabled={loading || !cuitValido}
          className="flex items-center gap-2 px-3 py-1.5 bg-brand-blue text-white rounded-lg text-xs font-semibold hover:bg-brand-blue/90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
          {loading ? 'Verificando...' : 'Verificar CUIT corregido contra ARCA'}
        </button>
        {msg && (
          <span className={`text-xs ${msg.ok ? 'text-green-600' : 'text-amber-600'}`}>{msg.texto}</span>
        )}
      </div>
    </div>
  )
}
