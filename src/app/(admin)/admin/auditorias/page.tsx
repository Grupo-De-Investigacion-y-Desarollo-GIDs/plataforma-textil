'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Modal } from '@/components/ui/modal'
import { StatCard } from '@/components/ui/stat-card'
import { Plus, Calendar, Edit, X, AlertTriangle } from 'lucide-react'

interface Auditoria {
  id: number
  fecha: string
  hora: string
  taller: string
  direccion: string
  auditor: string
  tipo: string
  estado: 'programada' | 'realizada' | 'pendiente_informe'
}

const mockAuditorias: Auditoria[] = [
  { id: 1, fecha: '12/02/26', hora: '10:00', taller: 'Corte Sur SRL', direccion: 'Av. Belgrano 1234, La Matanza', auditor: 'Juan García', tipo: 'Verificación de habilitaciones', estado: 'programada' },
  { id: 2, fecha: '18/02/26', hora: '14:00', taller: 'Coop. 8 de Marzo', direccion: 'Calle 50 #123, Florencio Varela', auditor: 'María López', tipo: 'Primera visita', estado: 'programada' },
  { id: 3, fecha: '01/02/26', hora: '09:00', taller: 'Taller La Aguja', direccion: 'Calle 7 #456', auditor: 'Juan García', tipo: 'Seguimiento', estado: 'pendiente_informe' },
]

const tiposAuditoria = ['Primera visita', 'Verificación de habilitaciones', 'Seguimiento', 'Re-auditoría']

export default function AdminAuditoriasPage() {
  const [auditorias] = useState<Auditoria[]>(mockAuditorias)
  const [modalOpen, setModalOpen] = useState(false)

  const programadas = auditorias.filter(a => a.estado === 'programada').length
  const realizadas = auditorias.filter(a => a.estado === 'realizada').length
  const pendientes = auditorias.filter(a => a.estado === 'pendiente_informe').length

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-overpass font-bold text-2xl text-brand-blue mb-1">Auditorías</h1>
          <p className="text-gray-500 text-sm">Programación y seguimiento de auditorías presenciales</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>Programar Auditoría</Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard value={String(programadas)} label="Programadas este mes" variant="success" />
        <StatCard value={String(realizadas)} label="Realizadas este mes" variant="muted" />
        <StatCard value={String(pendientes)} label="Pendientes informe" variant="warning" />
      </div>

      <Card className="mb-6">
        <h2 className="font-overpass font-bold text-brand-blue mb-3">Calendario</h2>
        <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-500">
          <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p>Febrero 2026</p>
          <p className="text-xs mt-1">Calendario interactivo (próximamente)</p>
        </div>
      </Card>

      <h2 className="font-overpass font-bold text-lg text-brand-blue mb-3">Próximas Auditorías</h2>
      <div className="space-y-3 mb-6">
        {auditorias.filter(a => a.estado === 'programada').map(a => (
          <Card key={a.id}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-blue" /> {a.fecha} - {a.hora}
                </p>
                <p className="text-sm mt-1">Taller: <strong>{a.taller}</strong></p>
                <p className="text-xs text-gray-500">{a.direccion}</p>
                <p className="text-xs text-gray-500">Auditor: {a.auditor} | {a.tipo}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button className="p-1 hover:bg-gray-100 rounded"><Edit className="w-4 h-4 text-gray-500" /></button>
                <button className="p-1 hover:bg-gray-100 rounded"><X className="w-4 h-4 text-gray-400" /></button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {pendientes > 0 && (
        <>
          <h2 className="font-overpass font-bold text-lg text-brand-blue mb-3">Pendientes de Informe</h2>
          {auditorias.filter(a => a.estado === 'pendiente_informe').map(a => (
            <Card key={a.id} className="border-l-4 border-l-yellow-400">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" /> {a.fecha} - {a.taller}
                  </p>
                  <p className="text-xs text-gray-500">Auditor: {a.auditor} | Sin informe</p>
                </div>
                <Button size="sm" variant="secondary">Cargar informe</Button>
              </div>
            </Card>
          ))}
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Programar Nueva Auditoría" size="lg">
        <div className="space-y-4">
          <Select label="Taller a auditar *" value="" onChange={() => {}}
            options={[{ value: '', label: 'Buscar taller...' }, { value: '1', label: 'Corte Sur SRL' }, { value: '2', label: 'Taller La Aguja' }]} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Fecha *" type="date" />
            <Select label="Hora *" value="" onChange={() => {}}
              options={['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map(h => ({ value: h, label: h }))} />
          </div>
          <Select label="Auditor asignado *" value="" onChange={() => {}}
            options={[{ value: '', label: 'Seleccionar...' }, { value: 'juan', label: 'Juan García' }, { value: 'maria', label: 'María López' }]} />
          <Select label="Tipo de auditoría *" value="" onChange={() => {}}
            options={tiposAuditoria.map(t => ({ value: t, label: t }))} />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Notas (opcional)</label>
            <textarea rows={2} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={() => setModalOpen(false)}>Programar Auditoría</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
