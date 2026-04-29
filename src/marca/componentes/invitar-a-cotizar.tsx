'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus } from 'lucide-react'
import { Modal } from '@/compartido/componentes/ui/modal'

interface Taller {
  id: string
  nombre: string
  ubicacion: string | null
  capacidadMensual: number
}

export function InvitarACotizar({ pedidoId }: { pedidoId: string }) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [paso, setPaso] = useState<'buscar' | 'confirmar'>('buscar')
  const [query, setQuery] = useState('')
  const [talleres, setTalleres] = useState<Taller[]>([])
  const [seleccionados, setSeleccionados] = useState<Taller[]>([])
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  // Debounce del fetch de busqueda
  useEffect(() => {
    if (query.length < 2) { setTalleres([]); return }
    const timer = setTimeout(() => {
      fetch(`/api/talleres?q=${encodeURIComponent(query)}&limit=10`)
        .then(r => r.json())
        .then(data => setTalleres(data.talleres ?? []))
        .catch(() => setTalleres([]))
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  function toggleSeleccion(taller: Taller) {
    setSeleccionados(prev =>
      prev.some(t => t.id === taller.id)
        ? prev.filter(t => t.id !== taller.id)
        : [...prev, taller]
    )
  }

  async function handleInvitar() {
    if (!seleccionados.length) return
    setEnviando(true)
    setError('')
    try {
      const res = await fetch(`/api/pedidos/${pedidoId}/invitaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tallerIds: seleccionados.map(t => t.id) }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Error al invitar')
        return
      }
      setAbierto(false)
      setSeleccionados([])
      setPaso('buscar')
      setQuery('')
      router.refresh()
    } catch {
      setError('Error de conexion')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        className="flex items-center gap-2 border border-brand-blue text-brand-blue px-4 py-2 rounded-lg hover:bg-brand-blue/5 text-sm font-medium"
      >
        <UserPlus className="w-4 h-4" />
        Invitar a cotizar
      </button>

      <Modal open={abierto} onClose={() => setAbierto(false)} title="Invitar talleres a cotizar" size="md">
        {paso === 'buscar' ? (
          <div className="space-y-3">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar taller por nombre..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />

            <div className="max-h-80 overflow-y-auto space-y-2">
              {talleres.map(t => {
                const isSelected = seleccionados.some(s => s.id === t.id)
                return (
                  <label
                    key={t.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected ? 'border-brand-blue bg-blue-50/50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSeleccion(t)}
                      className="accent-brand-blue"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{t.nombre}</p>
                      <p className="text-xs text-gray-500">
                        {t.ubicacion} · {t.capacidadMensual} prendas/mes
                      </p>
                    </div>
                  </label>
                )
              })}
              {query.length >= 2 && talleres.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">Sin resultados</p>
              )}
            </div>

            {seleccionados.length > 0 && (
              <p className="text-xs text-brand-blue font-semibold">
                {seleccionados.length} taller{seleccionados.length !== 1 ? 'es' : ''} seleccionado{seleccionados.length !== 1 ? 's' : ''}
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setAbierto(false)}
                className="flex-1 border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => setPaso('confirmar')}
                disabled={!seleccionados.length}
                className="flex-1 bg-brand-blue text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
              >
                Continuar ({seleccionados.length})
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Se invitara a estos talleres a cotizar el pedido:</p>
            <div className="space-y-2">
              {seleccionados.map(t => (
                <div key={t.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg">
                  <span>{t.nombre}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400">Solo los talleres invitados veran este pedido.</p>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setPaso('buscar')}
                className="flex-1 border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm"
              >
                Volver
              </button>
              <button
                onClick={handleInvitar}
                disabled={enviando}
                className="flex-1 bg-brand-blue text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
              >
                {enviando ? 'Invitando...' : 'Invitar a cotizar'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
