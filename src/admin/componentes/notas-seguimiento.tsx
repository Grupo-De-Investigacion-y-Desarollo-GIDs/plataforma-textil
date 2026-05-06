'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/compartido/componentes/ui/button'
import { useToast } from '@/compartido/componentes/ui/toast'
import { Plus } from 'lucide-react'

interface Nota {
  id: string
  contenido: string
  createdAt: string
  autor: { name: string | null; role: string }
}

interface Props {
  userId: string
}

export function NotasSeguimiento({ userId }: Props) {
  const [notas, setNotas] = useState<Nota[]>([])
  const [cargando, setCargando] = useState(true)
  const [nuevaNota, setNuevaNota] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [mostrarForm, setMostrarForm] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetch(`/api/admin/notas-seguimiento?userId=${userId}`)
      .then(r => r.json())
      .then(data => setNotas(data.notas ?? []))
      .catch(() => toast('Error al cargar notas', 'error'))
      .finally(() => setCargando(false))
  }, [userId, toast])

  async function guardarNota() {
    if (nuevaNota.trim().length < 3) return
    setGuardando(true)
    try {
      const res = await fetch('/api/admin/notas-seguimiento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, contenido: nuevaNota.trim() }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setNotas(prev => [data.nota, ...prev])
      setNuevaNota('')
      setMostrarForm(false)
      toast('Nota guardada', 'success')
    } catch {
      toast('Error al guardar la nota', 'error')
    } finally {
      setGuardando(false)
    }
  }

  function tiempoRelativo(fecha: string): string {
    const diff = Date.now() - new Date(fecha).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'ahora'
    if (mins < 60) return `hace ${mins}m`
    const horas = Math.floor(mins / 60)
    if (horas < 24) return `hace ${horas}h`
    const dias = Math.floor(horas / 24)
    return `hace ${dias}d`
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-overpass font-bold text-lg text-gray-800">Notas de seguimiento</h3>
        <Button size="sm" variant="secondary" onClick={() => setMostrarForm(!mostrarForm)}>
          <Plus className="w-3.5 h-3.5 mr-1" />
          Agregar nota
        </Button>
      </div>

      {mostrarForm && (
        <div className="mb-4 space-y-2">
          <textarea
            value={nuevaNota}
            onChange={e => setNuevaNota(e.target.value)}
            placeholder="Ej: Llamada de 10 min. Roberto tenia dudas sobre el monotributo..."
            rows={3}
            maxLength={2000}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{nuevaNota.length}/2000</span>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => { setMostrarForm(false); setNuevaNota('') }}>
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={guardarNota}
                disabled={nuevaNota.trim().length < 3}
                loading={guardando}
              >
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}

      {cargando ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse space-y-2">
              <div className="h-3 bg-gray-200 rounded w-1/3" />
              <div className="h-2.5 bg-gray-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : notas.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Sin notas de seguimiento todavia</p>
      ) : (
        <div className="space-y-3">
          {notas.map(nota => (
            <div key={nota.id} className="border-l-2 border-gray-200 pl-4 py-2">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <span>{tiempoRelativo(nota.createdAt)}</span>
                <span>—</span>
                <span className="font-medium text-gray-600">{nota.autor.name ?? 'Admin'} ({nota.autor.role})</span>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{nota.contenido}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
