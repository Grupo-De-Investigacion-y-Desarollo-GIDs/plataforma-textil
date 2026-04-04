'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/compartido/componentes/ui/button'
import { Input } from '@/compartido/componentes/ui/input'
import { Select } from '@/compartido/componentes/ui/select'
import { Modal } from '@/compartido/componentes/ui/modal'
import { Plus } from 'lucide-react'

const tiposAuditoria = [
  { value: 'PRIMERA_VISITA', label: 'Primera visita' },
  { value: 'VERIFICACION', label: 'Verificacion de habilitaciones' },
  { value: 'SEGUIMIENTO', label: 'Seguimiento' },
  { value: 'RE_AUDITORIA', label: 'Re-auditoria' },
]

export default function AuditoriasClient({ talleres }: { talleres: { id: string; nombre: string }[] }) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ tallerId: '', fecha: '', tipo: 'PRIMERA_VISITA' })

  async function handleSubmit() {
    if (!form.tallerId || !form.fecha) {
      setError('Taller y fecha son obligatorios')
      return
    }

    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/auditorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tallerId: form.tallerId,
          fecha: form.fecha,
          tipo: form.tipo,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Error al crear auditoria')
        return
      }

      setModalOpen(false)
      setForm({ tallerId: '', fecha: '', tipo: 'PRIMERA_VISITA' })
      router.refresh()
    } catch {
      setError('Error de conexion')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Button icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
        Programar Auditoria
      </Button>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Programar Nueva Auditoria" size="lg">
        <div className="space-y-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <Select
            label="Taller a auditar *"
            value={form.tallerId}
            onChange={e => setForm(f => ({ ...f, tallerId: e.target.value }))}
            options={[
              { value: '', label: 'Seleccionar taller...' },
              ...talleres.map(t => ({ value: t.id, label: t.nombre })),
            ]}
          />

          <Input
            label="Fecha y hora *"
            type="datetime-local"
            value={form.fecha}
            onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
          />

          <Select
            label="Tipo de auditoria *"
            value={form.tipo}
            onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
            options={tiposAuditoria}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? 'Guardando...' : 'Programar Auditoria'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
