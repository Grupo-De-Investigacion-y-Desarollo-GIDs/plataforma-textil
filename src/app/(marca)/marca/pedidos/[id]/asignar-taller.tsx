'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/modal'

const PROCESOS = ['Corte', 'Costura', 'Bordado', 'Estampado', 'Terminación', 'Lavado', 'Planchado']

const nivelColor: Record<string, string> = {
  BRONCE: 'bg-amber-100 text-amber-800',
  PLATA: 'bg-gray-100 text-gray-700',
  ORO: 'bg-yellow-100 text-yellow-800',
}

interface Taller {
  id: string
  nombre: string
  nivel: string
  ubicacion: string | null
  rating: number
  capacidadMensual: number
}

interface AsignarTallerProps {
  pedidoId: string
}

export function AsignarTaller({ pedidoId }: AsignarTallerProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'buscar' | 'form'>('buscar')
  const [talleres, setTalleres] = useState<Taller[]>([])
  const [cargando, setCargando] = useState(false)
  const [q, setQ] = useState('')
  const [tallerSeleccionado, setTallerSeleccionado] = useState<Taller | null>(null)
  const [proceso, setProceso] = useState(PROCESOS[0])
  const [precio, setPrecio] = useState('')
  const [plazo, setPlazo] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  async function buscarTalleres(query: string) {
    setCargando(true)
    try {
      const res = await fetch(`/api/talleres?limit=20&q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setTalleres(data.talleres ?? [])
    } catch {
      setTalleres([])
    } finally {
      setCargando(false)
    }
  }

  function abrirModal() {
    setStep('buscar')
    setTallerSeleccionado(null)
    setQ('')
    setTalleres([])
    setPrecio('')
    setPlazo('')
    setError('')
    setOpen(true)
    buscarTalleres('')
  }

  function seleccionarTaller(taller: Taller) {
    setTallerSeleccionado(taller)
    setStep('form')
  }

  async function confirmarAsignacion() {
    if (guardando) return
    if (!tallerSeleccionado || !precio) {
      setError('Completá el precio para continuar.')
      return
    }
    setGuardando(true)
    setError('')
    try {
      const moId = `MO-${new Date().getFullYear()}-${crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`
      const res = await fetch(`/api/pedidos/${pedidoId}/ordenes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moId,
          tallerId: tallerSeleccionado.id,
          proceso,
          estado: 'PENDIENTE',
          precio: Number(precio),
          plazoDias: plazo ? Number(plazo) : null,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Error al asignar el taller.')
        return
      }
      setOpen(false)
      router.refresh()
    } catch {
      setError('Error de red. Intentá de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <>
      <button
        onClick={abrirModal}
        className="inline-flex items-center gap-2 rounded-lg font-overpass font-semibold bg-brand-blue hover:bg-blue-800 text-white px-4 py-2.5 text-sm transition-colors"
      >
        + Asignar taller
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Asignar taller" size="lg">
        {step === 'buscar' && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Buscar taller por nombre..."
              value={q}
              onChange={(e) => {
                setQ(e.target.value)
                buscarTalleres(e.target.value)
              }}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
            {cargando && <p className="text-sm text-gray-500 text-center py-4">Buscando...</p>}
            {!cargando && talleres.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">Sin resultados.</p>
            )}
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {talleres.map((t) => (
                <button
                  key={t.id}
                  onClick={() => seleccionarTaller(t)}
                  className="w-full text-left rounded-lg border border-gray-200 p-4 hover:border-brand-blue hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-800 text-sm">{t.nombre}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${nivelColor[t.nivel] ?? 'bg-gray-100 text-gray-700'}`}>
                      {t.nivel}
                    </span>
                  </div>
                  <div className="flex gap-4 mt-1 text-xs text-gray-500">
                    {t.ubicacion && <span>{t.ubicacion}</span>}
                    <span>⭐ {t.rating.toFixed(1)}</span>
                    <span>{t.capacidadMensual} prendas/mes</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'form' && tallerSeleccionado && (
          <div className="space-y-4">
            <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-brand-blue text-sm">{tallerSeleccionado.nombre}</p>
                <p className="text-xs text-gray-500">{tallerSeleccionado.ubicacion}</p>
              </div>
              <button onClick={() => setStep('buscar')} className="text-xs text-brand-blue hover:underline">
                Cambiar
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proceso *</label>
                <select
                  value={proceso}
                  onChange={(e) => setProceso(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                >
                  {PROCESOS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio ($) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plazo (días)</label>
                <input
                  type="number"
                  min="1"
                  value={plazo}
                  onChange={(e) => setPlazo(e.target.value)}
                  placeholder="30"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarAsignacion}
                disabled={guardando}
                className="px-4 py-2 text-sm font-semibold text-white bg-brand-blue rounded-lg hover:bg-blue-800 disabled:opacity-50 transition-colors"
              >
                {guardando ? 'Asignando...' : 'Confirmar asignación'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
