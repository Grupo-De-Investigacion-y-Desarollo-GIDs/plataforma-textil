'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Modal } from '@/components/ui/modal'
import { Plus, Edit, GripVertical } from 'lucide-react'

interface FaqItem {
  id: number
  pregunta: string
  respuesta: string
  categoria: string
}

const categorias = ['Registro', 'Formalización', 'Capacitación', 'Plataforma']

const mockFaqs: FaqItem[] = [
  { id: 1, pregunta: '¿Cómo me registro en la plataforma?', respuesta: 'Hacé click en "Registrarse"...', categoria: 'Registro' },
  { id: 2, pregunta: '¿Qué pasa si no tengo CUIT?', respuesta: 'Podés iniciar el trámite...', categoria: 'Registro' },
  { id: 3, pregunta: '¿Qué significan los niveles Bronce/Plata/Oro?', respuesta: 'Los niveles reflejan tu grado de formalización...', categoria: 'Formalización' },
  { id: 4, pregunta: '¿Cómo subo de nivel?', respuesta: 'Completando los requisitos...', categoria: 'Formalización' },
  { id: 5, pregunta: '¿Los certificados tienen validez oficial?', respuesta: 'Sí, están avalados por...', categoria: 'Capacitación' },
]

export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>(mockFaqs)
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState<FaqItem | null>(null)

  const grouped = categorias
    .filter(cat => !filtroCategoria || cat === filtroCategoria)
    .map(cat => ({
      categoria: cat,
      items: faqs.filter(f => f.categoria === cat),
    }))
    .filter(g => g.items.length > 0)

  function handleEdit(item: FaqItem) {
    setEditando(item)
    setModalOpen(true)
  }

  function handleNew() {
    setEditando({ id: Date.now(), pregunta: '', respuesta: '', categoria: categorias[0] })
    setModalOpen(true)
  }

  function handleSave() {
    if (!editando) return
    const exists = faqs.find(f => f.id === editando.id)
    if (exists) {
      setFaqs(faqs.map(f => f.id === editando.id ? editando : f))
    } else {
      setFaqs([...faqs, editando])
    }
    setModalOpen(false)
    setEditando(null)
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-overpass font-bold text-2xl text-brand-blue mb-1">Gestionar FAQ</h1>
          <p className="text-gray-500 text-sm">Editá las preguntas frecuentes de la plataforma</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={handleNew}>Nueva Pregunta</Button>
      </div>

      <Select
        value={filtroCategoria}
        onChange={e => setFiltroCategoria(e.target.value)}
        options={[{ value: '', label: 'Todas las categorías' }, ...categorias.map(c => ({ value: c, label: c }))]}
        className="mb-4"
      />

      {grouped.map(group => (
        <div key={group.categoria} className="mb-6">
          <h2 className="font-overpass font-bold text-brand-blue mb-2">{group.categoria.toUpperCase()}</h2>
          <Card>
            <div className="divide-y divide-gray-100">
              {group.items.map(item => (
                <div key={item.id} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
                  <GripVertical className="w-4 h-4 text-gray-300 cursor-grab shrink-0" />
                  <span className="text-sm flex-1">{item.pregunta}</span>
                  <button onClick={() => handleEdit(item)} className="p-1 hover:bg-gray-100 rounded shrink-0">
                    <Edit className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ))}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editando?.pregunta ? 'Editar Pregunta' : 'Nueva Pregunta'} size="lg">
        {editando && (
          <div className="space-y-4">
            <Input label="Pregunta *" value={editando.pregunta} onChange={e => setEditando({ ...editando, pregunta: e.target.value })} />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Respuesta * (Soporta Markdown)</label>
              <textarea
                value={editando.respuesta}
                onChange={e => setEditando({ ...editando, respuesta: e.target.value })}
                rows={5}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
              />
            </div>
            <Select
              label="Categoría"
              value={editando.categoria}
              onChange={e => setEditando({ ...editando, categoria: e.target.value })}
              options={categorias.map(c => ({ value: c, label: c }))}
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave}>Guardar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
