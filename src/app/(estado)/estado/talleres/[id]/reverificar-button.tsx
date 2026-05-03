'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'

export function ReverificarButton({ tallerId }: { tallerId: string }) {
  const router = useRouter()
  const [verificando, setVerificando] = useState(false)
  const [resultado, setResultado] = useState<{ exitosa: boolean; error?: string } | null>(null)

  async function handleReverificar() {
    setVerificando(true)
    setResultado(null)
    try {
      const res = await fetch(`/api/estado/arca/reverificar/${tallerId}`, { method: 'POST' })
      const data = await res.json()
      setResultado({ exitosa: data.exitosa, error: data.error })
      if (data.exitosa) router.refresh()
    } catch {
      setResultado({ exitosa: false, error: 'Error de conexion' })
    } finally {
      setVerificando(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleReverificar}
        disabled={verificando}
        className="flex items-center gap-2 px-3 py-1.5 bg-brand-blue text-white rounded-lg text-xs font-semibold hover:bg-brand-blue/90 disabled:opacity-50"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${verificando ? 'animate-spin' : ''}`} />
        {verificando ? 'Verificando...' : 'Re-verificar contra ARCA'}
      </button>
      {resultado && (
        <span className={`text-xs ${resultado.exitosa ? 'text-green-600' : 'text-amber-600'}`}>
          {resultado.exitosa ? 'Verificacion exitosa' : resultado.error || 'Error al verificar'}
        </span>
      )}
    </div>
  )
}
