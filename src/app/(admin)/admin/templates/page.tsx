'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Edit, Eye } from 'lucide-react'

interface Template {
  id: string
  nombre: string
  asunto: string
  descripcion: string
  body: string
}

const mockTemplates: Template[] = [
  { id: '1', nombre: 'Bienvenida', asunto: 'Bienvenido/a a la Plataforma Digital Textil', descripcion: 'Se envía al registrarse', body: 'Hola {nombre},\n\nTe damos la bienvenida a la PDT...' },
  { id: '2', nombre: 'Verificar email', asunto: 'Verificá tu email - PDT', descripcion: 'Verificación de correo electrónico', body: 'Hola {nombre},\n\nHacé click en el siguiente enlace...' },
  { id: '3', nombre: 'Recuperar contraseña', asunto: 'Restablecer contraseña - PDT', descripcion: 'Recuperación de contraseña', body: 'Hola {nombre},\n\nRecibimos una solicitud...' },
  { id: '4', nombre: 'Certificado emitido', asunto: 'Tu certificado está listo', descripcion: 'Notificación de certificado', body: 'Hola {nombre},\n\nFelicitaciones! Completaste...' },
  { id: '5', nombre: 'Documentos por vencer', asunto: 'Recordatorio: documentos próximos a vencer', descripcion: 'Recordatorio automático', body: 'Hola {nombre},\n\nTe recordamos que los siguientes documentos...' },
  { id: '6', nombre: 'Auditoría programada', asunto: 'Auditoría programada para tu taller', descripcion: 'Notificación de auditoría', body: 'Hola {nombre},\n\nTe informamos que se programó...' },
]

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>(mockTemplates)
  const [editando, setEditando] = useState<Template | null>(null)
  const [preview, setPreview] = useState<Template | null>(null)

  function handleSave() {
    if (!editando) return
    setTemplates(templates.map(t => t.id === editando.id ? editando : t))
    setEditando(null)
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <h1 className="font-overpass font-bold text-2xl text-brand-blue mb-1">Templates de Email</h1>
      <p className="text-gray-500 text-sm mb-6">Editá los templates de emails automáticos</p>

      <div className="space-y-3">
        {templates.map(t => (
          <Card key={t.id}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-overpass font-bold text-brand-blue">{t.nombre}</h2>
                <p className="text-sm text-gray-500">{t.descripcion}</p>
                <p className="text-xs text-gray-400 mt-1">Asunto: {t.asunto}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => setPreview(t)} className="p-1 hover:bg-gray-100 rounded"><Eye className="w-4 h-4 text-gray-500" /></button>
                <button onClick={() => setEditando({ ...t })} className="p-1 hover:bg-gray-100 rounded"><Edit className="w-4 h-4 text-gray-500" /></button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={!!editando} onClose={() => setEditando(null)} title="Editar Template" size="lg">
        {editando && (
          <div className="space-y-4">
            <Input label="Nombre" value={editando.nombre} onChange={e => setEditando({ ...editando, nombre: e.target.value })} />
            <Input label="Asunto del email" value={editando.asunto} onChange={e => setEditando({ ...editando, asunto: e.target.value })} />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Cuerpo del email</label>
              <textarea value={editando.body} onChange={e => setEditando({ ...editando, body: e.target.value })} rows={10}
                className="w-full font-mono text-sm rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent" />
              <p className="text-xs text-gray-400 mt-1">Variables: {'{nombre}'}, {'{empresa}'}, {'{enlace}'}, {'{fecha}'}</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setEditando(null)}>Cancelar</Button>
              <Button onClick={handleSave}>Guardar</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!preview} onClose={() => setPreview(null)} title="Vista Previa" size="lg">
        {preview && (
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="bg-white rounded-lg shadow-sm p-6 max-w-md mx-auto">
              <div className="text-center mb-4">
                <p className="font-overpass font-bold text-brand-blue text-lg">PDT</p>
                <p className="text-xs text-gray-400">Plataforma Digital Textil</p>
              </div>
              <hr className="mb-4" />
              <p className="text-sm font-semibold mb-2">{preview.asunto}</p>
              <div className="text-sm text-gray-600 whitespace-pre-wrap">{preview.body.replace(/{nombre}/g, 'Juan').replace(/{empresa}/g, 'Corte Sur SRL')}</div>
              <hr className="mt-4 mb-2" />
              <p className="text-xs text-gray-400 text-center">© 2026 PDT - OIT Argentina</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
