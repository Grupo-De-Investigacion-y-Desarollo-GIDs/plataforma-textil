'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, CheckCircle, AlertCircle } from 'lucide-react'

interface Coleccion {
  id: string
  titulo: string
}

interface Pregunta {
  texto: string
  opciones: string[]
  correcta: number
  explicacion?: string
}

export default function AdminEvaluacionesPage() {
  const [colecciones, setColecciones] = useState<Coleccion[]>([])
  const [coleccionId, setColeccionId] = useState('')
  const [preguntas, setPreguntas] = useState<Pregunta[]>([])
  const [puntajeMinimo, setPuntajeMinimo] = useState('60')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)
  const [tieneEval, setTieneEval] = useState(false)

  // Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [editIdx, setEditIdx] = useState<number | null>(null)
  const [editPregunta, setEditPregunta] = useState<Pregunta>({ texto: '', opciones: ['', '', ''], correcta: 0, explicacion: '' })

  // Cargar colecciones al montar
  useEffect(() => {
    fetch('/api/colecciones?limit=100')
      .then(r => r.ok ? r.json() : { colecciones: [] })
      .then((data: { colecciones: Coleccion[] }) => {
        const lista = data.colecciones ?? []
        setColecciones(lista)
        if (lista.length > 0) setColeccionId(lista[0].id)
      })
      .catch(() => {})
  }, [])

  // Cargar evaluacion al cambiar coleccion
  useEffect(() => {
    if (!coleccionId) return
    setLoading(true)
    setMsg(null)
    fetch(`/api/colecciones/${coleccionId}/evaluacion`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setPreguntas(data.preguntas ?? [])
          setPuntajeMinimo(String(data.puntajeMinimo ?? 60))
          setTieneEval(true)
        } else {
          setPreguntas([])
          setPuntajeMinimo('60')
          setTieneEval(false)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [coleccionId])

  function abrirNueva() {
    setEditIdx(null)
    setEditPregunta({ texto: '', opciones: ['', '', ''], correcta: 0, explicacion: '' })
    setModalOpen(true)
  }

  function abrirEditar(idx: number) {
    setEditIdx(idx)
    setEditPregunta({ ...preguntas[idx], opciones: [...preguntas[idx].opciones] })
    setModalOpen(true)
  }

  function eliminarPregunta(idx: number) {
    setPreguntas(prev => prev.filter((_, i) => i !== idx))
  }

  function guardarPreguntaLocal() {
    if (!editPregunta.texto.trim()) return
    if (editPregunta.opciones.some(o => !o.trim())) return
    if (editIdx !== null) {
      setPreguntas(prev => prev.map((p, i) => i === editIdx ? editPregunta : p))
    } else {
      setPreguntas(prev => [...prev, editPregunta])
    }
    setModalOpen(false)
  }

  async function handleGuardar() {
    if (!coleccionId) return
    if (preguntas.length === 0) { setMsg({ type: 'error', text: 'Agregá al menos una pregunta' }); return }
    setSaving(true)
    setMsg(null)
    try {
      const res = await fetch(`/api/colecciones/${coleccionId}/evaluacion`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preguntas, puntajeMinimo: parseInt(puntajeMinimo) || 60 }),
      })
      if (res.ok) {
        setMsg({ type: 'ok', text: 'Evaluación guardada correctamente' })
        setTieneEval(true)
      } else {
        const body = await res.json()
        setMsg({ type: 'error', text: body.error || 'Error al guardar' })
      }
    } catch {
      setMsg({ type: 'error', text: 'Error de conexión' })
    } finally {
      setSaving(false)
    }
  }

  const coleccionNombre = colecciones.find(c => c.id === coleccionId)?.titulo ?? ''

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-overpass font-bold text-2xl text-brand-blue">Evaluaciones</h1>
        {tieneEval && <Badge variant="success">Evaluación activa</Badge>}
        {coleccionId && !tieneEval && !loading && <Badge variant="default">Sin evaluación</Badge>}
      </div>
      <p className="text-gray-500 text-sm mb-6">Gestioná los quiz de cada colección de capacitación</p>

      <Select
        label="Colección"
        value={coleccionId}
        onChange={e => setColeccionId(e.target.value)}
        options={colecciones.map(c => ({ value: c.id, label: c.titulo }))}
        className="mb-6"
      />

      {loading && (
        <div className="animate-pulse space-y-3 mb-6">
          <div className="h-20 bg-gray-100 rounded-xl" />
          <div className="h-32 bg-gray-100 rounded-xl" />
        </div>
      )}

      {!loading && coleccionId && (
        <>
          <Card className="mb-6">
            <h2 className="font-overpass font-bold text-brand-blue mb-3">Configuración</h2>
            <Input
              label="Puntaje mínimo para aprobar (%)"
              type="number"
              value={puntajeMinimo}
              onChange={e => setPuntajeMinimo(e.target.value)}
              className="max-w-xs"
            />
          </Card>

          <div className="flex items-center justify-between mb-3">
            <h2 className="font-overpass font-bold text-lg text-brand-blue">
              Preguntas ({preguntas.length})
            </h2>
            <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={abrirNueva}>
              Agregar Pregunta
            </Button>
          </div>

          {preguntas.length === 0 ? (
            <Card className="text-center py-10 text-gray-500 text-sm mb-6">
              No hay preguntas. Agregá la primera.
            </Card>
          ) : (
            <Card className="mb-6">
              <div className="divide-y divide-gray-100">
                {preguntas.map((p, i) => (
                  <div key={i} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-sm">{i + 1}. {p.texto}</p>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => abrirEditar(i)} className="p-1 hover:bg-gray-100 rounded">
                          <Edit className="w-4 h-4 text-gray-500" />
                        </button>
                        <button onClick={() => eliminarPregunta(i)} className="p-1 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 space-y-1 ml-4">
                      {p.opciones.map((o, j) => (
                        <div key={j} className={`text-sm flex items-center gap-1.5 ${j === p.correcta ? 'text-green-700 font-semibold' : 'text-gray-500'}`}>
                          <span>{j === p.correcta ? '●' : '○'}</span>
                          <span>{o}</span>
                          {j === p.correcta && <span className="text-xs text-green-600">(correcta)</span>}
                        </div>
                      ))}
                    </div>
                    {p.explicacion && (
                      <p className="text-xs text-gray-400 ml-4 mt-1 italic">{p.explicacion}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {msg && (
            <div className={`mb-4 rounded-lg border px-4 py-3 text-sm flex items-center gap-2 ${msg.type === 'ok' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
              {msg.type === 'ok' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {msg.text}
            </div>
          )}

          <Button className="w-full" onClick={handleGuardar} disabled={saving}>
            {saving ? 'Guardando...' : tieneEval ? `Actualizar evaluación de "${coleccionNombre}"` : `Crear evaluación para "${coleccionNombre}"`}
          </Button>
        </>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editIdx !== null ? 'Editar Pregunta' : 'Nueva Pregunta'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Pregunta *"
            value={editPregunta.texto}
            onChange={e => setEditPregunta({ ...editPregunta, texto: e.target.value })}
            placeholder="¿Qué significa...?"
          />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Opciones — marcá la correcta con el radio
            </label>
            {editPregunta.opciones.map((o, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <input
                  type="radio"
                  name="correcta"
                  checked={editPregunta.correcta === i}
                  onChange={() => setEditPregunta({ ...editPregunta, correcta: i })}
                  className="accent-[var(--color-brand-blue)] shrink-0"
                />
                <input
                  type="text"
                  value={o}
                  onChange={e => {
                    const nuevas = [...editPregunta.opciones]
                    nuevas[i] = e.target.value
                    setEditPregunta({ ...editPregunta, opciones: nuevas })
                  }}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  placeholder={`Opción ${i + 1}`}
                />
                {editPregunta.opciones.length > 2 && (
                  <button
                    onClick={() => {
                      const nuevas = editPregunta.opciones.filter((_, j) => j !== i)
                      const nuevaCorrecta = editPregunta.correcta >= nuevas.length ? 0 : editPregunta.correcta
                      setEditPregunta({ ...editPregunta, opciones: nuevas, correcta: nuevaCorrecta })
                    }}
                    className="text-gray-400 hover:text-red-500 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {editPregunta.opciones.length < 4 && (
              <button
                onClick={() => setEditPregunta({ ...editPregunta, opciones: [...editPregunta.opciones, ''] })}
                className="text-sm text-brand-blue hover:underline mt-1"
              >
                + Agregar opción
              </button>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Explicación (opcional — se muestra al rendir)
            </label>
            <textarea
              value={editPregunta.explicacion ?? ''}
              onChange={e => setEditPregunta({ ...editPregunta, explicacion: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
              placeholder="El SAM es... porque..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button
              onClick={guardarPreguntaLocal}
              disabled={!editPregunta.texto.trim() || editPregunta.opciones.some(o => !o.trim())}
            >
              {editIdx !== null ? 'Actualizar' : 'Agregar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
