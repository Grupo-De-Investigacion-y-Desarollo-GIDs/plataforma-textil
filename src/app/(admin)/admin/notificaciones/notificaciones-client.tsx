'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/compartido/componentes/ui/button'
import { Input } from '@/compartido/componentes/ui/input'
import { Modal } from '@/compartido/componentes/ui/modal'
import { Plus } from 'lucide-react'

export default function NotificacionesClient() {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({
    asunto: '',
    mensaje: '',
    segmento: 'todos' as string,
    canal: 'PLATAFORMA' as string,
    link: '',
  })

  async function handleSubmit() {
    if (!form.asunto.trim() || !form.mensaje.trim()) {
      setError('Asunto y mensaje son obligatorios')
      return
    }

    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admin/notificaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: form.asunto,
          mensaje: form.mensaje,
          tipo: 'ADMIN_ENVIO',
          canal: form.canal,
          segmento: form.segmento,
          link: form.link || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Error al enviar')
        return
      }

      setSent(true)
      setTimeout(() => {
        setModalOpen(false)
        setSent(false)
        setForm({ asunto: '', mensaje: '', segmento: 'todos', canal: 'PLATAFORMA' as string, link: '' })
        router.refresh()
      }, 1500)
    } catch {
      setError('Error de conexion')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Button icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
        Nueva Notificacion
      </Button>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Enviar Notificacion" size="lg">
        <div className="space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          {sent && <p className="text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">Notificacion enviada correctamente</p>}

          <Input
            label="Asunto *"
            value={form.asunto}
            onChange={e => setForm(f => ({ ...f, asunto: e.target.value }))}
            placeholder="Nuevo curso disponible: Control de calidad"
          />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Mensaje *</label>
            <textarea
              value={form.mensaje}
              onChange={e => setForm(f => ({ ...f, mensaje: e.target.value }))}
              rows={4}
              placeholder="Escribi el mensaje de la notificacion..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Link de destino <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              type="url"
              value={form.link}
              onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
              placeholder="/taller/aprender o https://..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-1">
              Si completas este campo, los usuarios pueden hacer click en la notificacion para ir al destino
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Destinatarios</label>
            <div className="space-y-2">
              {[
                { value: 'todos', label: 'Todos los usuarios' },
                { value: 'talleres', label: 'Todos los talleres' },
                { value: 'talleres_bronce', label: 'Talleres Bronce' },
                { value: 'talleres_plata', label: 'Talleres Plata' },
                { value: 'talleres_oro', label: 'Talleres Oro' },
                { value: 'marcas', label: 'Todas las marcas' },
              ].map(opt => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="segmento"
                    checked={form.segmento === opt.value}
                    onChange={() => setForm(f => ({ ...f, segmento: opt.value }))}
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Canal</label>
            <div className="space-y-2">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="canal"
                  value="PLATAFORMA"
                  checked={form.canal === 'PLATAFORMA'}
                  onChange={() => setForm(f => ({ ...f, canal: 'PLATAFORMA' }))}
                  className="mt-1"
                />
                <div>
                  <span className="text-sm font-medium">Solo en plataforma</span>
                  <p className="text-xs text-gray-400">Aparece en la bandeja del usuario. No se envia email.</p>
                </div>
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="canal"
                  value="EMAIL"
                  checked={form.canal === 'EMAIL'}
                  onChange={() => setForm(f => ({ ...f, canal: 'EMAIL' }))}
                  className="mt-1"
                />
                <div>
                  <span className="text-sm font-medium">Email + plataforma</span>
                  <p className="text-xs text-gray-400">Se envia por email y tambien queda en la bandeja.</p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={saving || sent}>
              {saving ? 'Enviando...' : 'Enviar Notificacion'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
