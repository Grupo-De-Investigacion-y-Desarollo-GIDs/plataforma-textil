'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const ESTADOS = [
  { value: 'PROGRAMADA', label: 'Programada' },
  { value: 'EN_CURSO', label: 'En curso' },
  { value: 'COMPLETADA', label: 'Completada' },
  { value: 'CANCELADA', label: 'Cancelada' },
]

interface AccionCorrectiva {
  id: string
  descripcion: string
  estado: string
  plazo: string | null
}

interface AuditoriaInformeClientProps {
  auditoriaId: string
  estadoInicial: string
  resultadoInicial: string | null
  hallazgosInicial: unknown
  acciones: AccionCorrectiva[]
}

function NuevaAccionForm({ auditoriaId }: { auditoriaId: string }) {
  const router = useRouter()
  const [descripcion, setDescripcion] = useState('')
  const [plazo, setPlazo] = useState('')
  const [guardando, setGuardando] = useState(false)

  async function handleAgregar() {
    if (!descripcion.trim()) return
    setGuardando(true)
    await fetch(`/api/auditorias/${auditoriaId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nuevaAccion: { descripcion, plazo: plazo || null } }),
    })
    setDescripcion('')
    setPlazo('')
    setGuardando(false)
    router.refresh()
  }

  return (
    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
      <p className="text-xs font-medium text-gray-500">Agregar accion correctiva</p>
      <input
        type="text"
        value={descripcion}
        onChange={e => setDescripcion(e.target.value)}
        placeholder="Descripcion de la accion..."
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
      />
      <div className="flex gap-2">
        <input
          type="date"
          value={plazo}
          onChange={e => setPlazo(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
        <button
          onClick={handleAgregar}
          disabled={!descripcion.trim() || guardando}
          className="bg-brand-blue text-white px-3 py-2 rounded-lg text-xs hover:bg-brand-blue/90 disabled:opacity-50"
        >
          {guardando ? 'Agregando...' : 'Agregar'}
        </button>
      </div>
    </div>
  )
}

export function AuditoriaInformeClient({
  auditoriaId,
  estadoInicial,
  resultadoInicial,
  hallazgosInicial,
  acciones,
}: AuditoriaInformeClientProps) {
  const router = useRouter()
  const [estado, setEstado] = useState(estadoInicial)
  const [resultado, setResultado] = useState(resultadoInicial ?? '')
  const [hallazgos, setHallazgos] = useState(
    hallazgosInicial ? JSON.stringify(hallazgosInicial, null, 2) : ''
  )
  const [guardando, setGuardando] = useState(false)
  const [exito, setExito] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGuardar() {
    setGuardando(true)
    setExito(false)
    setError(null)

    let hallazgosParsed = null
    if (hallazgos.trim()) {
      try {
        hallazgosParsed = JSON.parse(hallazgos)
      } catch {
        setError('El JSON de hallazgos no es valido. Verifica el formato.')
        setGuardando(false)
        return
      }
    }

    try {
      const res = await fetch(`/api/auditorias/${auditoriaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado,
          resultado: resultado || null,
          hallazgos: hallazgosParsed,
        }),
      })
      if (res.ok) {
        setExito(true)
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error ?? 'Error al guardar el informe')
      }
    } catch {
      setError('Error de conexion. Intenta de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
      <h2 className="font-overpass font-bold text-gray-800">Informe de auditoria</h2>

      <div>
        <label className="text-sm font-medium text-gray-700">Estado</label>
        <select value={estado} onChange={e => setEstado(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
          {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Resultado</label>
        <textarea value={resultado} onChange={e => setResultado(e.target.value)}
          placeholder="Describi el resultado general de la auditoria..."
          rows={4}
          className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none" />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Hallazgos (JSON opcional)</label>
        <textarea value={hallazgos} onChange={e => setHallazgos(e.target.value)}
          placeholder='{"incumplimientos": [], "observaciones": []}'
          rows={4}
          className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono resize-none" />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      {exito && (
        <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
          Informe guardado correctamente
        </p>
      )}

      <button onClick={handleGuardar} disabled={guardando}
        className="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-blue/90 disabled:opacity-50">
        {guardando ? 'Guardando...' : 'Guardar informe'}
      </button>

      {/* Acciones correctivas existentes */}
      <div className="mt-4 border-t pt-4">
        <h3 className="font-medium text-gray-700 mb-2">Acciones correctivas</h3>
        {acciones.length > 0 && (
          <div className="space-y-2 mb-4">
            {acciones.map(accion => (
              <div key={accion.id} className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
                <span className="font-medium">{accion.estado}</span> — {accion.descripcion}
              </div>
            ))}
          </div>
        )}

        {/* Agregar nueva acción */}
        <NuevaAccionForm auditoriaId={auditoriaId} />
      </div>
    </div>
  )
}
