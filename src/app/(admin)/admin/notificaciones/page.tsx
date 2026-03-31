'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Plus, Mail, Eye } from 'lucide-react'

interface Envio {
  id: number
  asunto: string
  fecha: string
  destinatarios: number
  abiertos: number
  clicks: number
}

const mockEnvios: Envio[] = [
  { id: 1, asunto: 'Nuevo curso disponible', fecha: '01/02/26', destinatarios: 24, abiertos: 18, clicks: 12 },
  { id: 2, asunto: 'Recordatorio: documentos por vencer', fecha: '28/01/26', destinatarios: 5, abiertos: 5, clicks: 3 },
]

export default function AdminNotificacionesPage() {
  const [mostrarForm, setMostrarForm] = useState(false)
  const [asunto, setAsunto] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [segmento, setSegmento] = useState('todos')
  const [canal, setCanal] = useState('email')

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-overpass font-bold text-2xl text-brand-blue mb-1">Centro de Notificaciones</h1>
          <p className="text-gray-500 text-sm">Envío de comunicaciones a usuarios</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setMostrarForm(!mostrarForm)}>Nueva Notificación</Button>
      </div>

      <h2 className="font-overpass font-bold text-lg text-brand-blue mb-3">Envíos Recientes</h2>
      <div className="space-y-3 mb-6">
        {mockEnvios.map(e => (
          <Card key={e.id}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-sm flex items-center gap-2"><Mail className="w-4 h-4 text-brand-blue" /> {e.asunto}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Enviado: {e.fecha} | Destinatarios: {e.destinatarios} |
                  Abiertos: {e.abiertos} ({Math.round(e.abiertos / e.destinatarios * 100)}%) |
                  Clicks: {e.clicks} ({Math.round(e.clicks / e.destinatarios * 100)}%)
                </p>
              </div>
              <button className="p-1 hover:bg-gray-100 rounded"><Eye className="w-4 h-4 text-gray-500" /></button>
            </div>
          </Card>
        ))}
      </div>

      {mostrarForm && (
        <>
          <h2 className="font-overpass font-bold text-lg text-brand-blue mb-3">Crear Notificación</h2>
          <Card>
            <div className="space-y-4">
              <Input label="Asunto *" value={asunto} onChange={e => setAsunto(e.target.value)} placeholder="Nuevo curso disponible: Control de calidad" />
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mensaje *</label>
                <textarea value={mensaje} onChange={e => setMensaje(e.target.value)} rows={5}
                  placeholder="Hola {nombre}, ..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent" />
                <p className="text-xs text-gray-400 mt-1">Variables: {'{nombre}'}, {'{empresa}'}, {'{boton:texto:url}'}</p>
              </div>

              <h3 className="font-overpass font-bold text-brand-blue text-sm">Destinatarios</h3>
              <div className="space-y-2">
                {[
                  { value: 'todos', label: 'Todos los usuarios' },
                  { value: 'talleres', label: 'Solo talleres' },
                  { value: 'marcas', label: 'Solo marcas' },
                ].map(opt => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="segmento" checked={segmento === opt.value} onChange={() => setSegmento(opt.value)} />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>

              {segmento === 'talleres' && (
                <Select label="Nivel" value="" onChange={() => {}}
                  options={[{ value: '', label: 'Todos' }, { value: 'BRONCE', label: 'Bronce' }, { value: 'PLATA', label: 'Plata' }, { value: 'ORO', label: 'Oro' }]} />
              )}

              <h3 className="font-overpass font-bold text-brand-blue text-sm">Canal de Envío</h3>
              <div className="flex gap-4">
                {[
                  { value: 'email', label: 'Email' },
                  { value: 'whatsapp', label: 'WhatsApp' },
                  { value: 'inapp', label: 'Notificación in-app' },
                ].map(opt => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={canal === opt.value} onChange={() => setCanal(opt.value)} className="rounded" />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="secondary">Vista previa</Button>
                <Button variant="secondary">Programar</Button>
                <Button>Enviar ahora</Button>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
