'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'

export function SyncArcaButton() {
  const router = useRouter()
  const [sincronizando, setSincronizando] = useState(false)
  const [resultado, setResultado] = useState<{ verificados: number; fallidos: number; total: number } | null>(null)

  async function handleSync() {
    setSincronizando(true)
    setResultado(null)
    try {
      const res = await fetch('/api/estado/arca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: false }),
      })
      if (res.ok) {
        const data = await res.json()
        setResultado({ verificados: data.verificados, fallidos: data.fallidos, total: data.total })
        router.refresh()
      }
    } catch {
      setResultado({ verificados: 0, fallidos: 0, total: 0 })
    } finally {
      setSincronizando(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleSync}
        disabled={sincronizando}
        className="flex items-center gap-2 px-3 py-1.5 bg-brand-blue text-white rounded-lg text-xs font-semibold hover:bg-brand-blue/90 disabled:opacity-50"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${sincronizando ? 'animate-spin' : ''}`} />
        {sincronizando ? 'Sincronizando...' : 'Sincronizar todos con ARCA'}
      </button>
      {resultado && (
        <span className="text-xs text-gray-500">
          {resultado.verificados}/{resultado.total} verificados
          {resultado.fallidos > 0 && ` · ${resultado.fallidos} fallidos`}
        </span>
      )}
    </div>
  )
}
