'use client'

import { useState } from 'react'
import { Button } from '@/compartido/componentes/ui/button'
import { Modal } from '@/compartido/componentes/ui/modal'
import { useToast } from '@/compartido/componentes/ui/toast'
import { MessageSquare, Copy, ExternalLink, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'

interface MensajeWizard {
  id: string
  phone: string
  mensaje: string
  enlaceProfundo: string | null
  user: { name: string | null }
}

interface WhatsAppWizardProps {
  mensajes: MensajeWizard[]
  onClose: () => void
}

export function WhatsAppWizard({ mensajes, onClose }: WhatsAppWizardProps) {
  const [paso, setPaso] = useState(0)
  const [enviados, setEnviados] = useState<Set<string>>(new Set())
  const [marcando, setMarcando] = useState(false)
  const { toast } = useToast()

  const total = mensajes.length
  const terminado = paso >= total
  const actual = terminado ? null : mensajes[paso]

  async function marcarEnviado(id: string) {
    setMarcando(true)
    try {
      const res = await fetch('/api/admin/whatsapp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error?.message ?? 'Error al marcar como enviado')
      }
      setEnviados(prev => new Set(prev).add(id))
      toast('Marcado como enviado', 'success')
    } catch (err) {
      toast({
        mensaje: err instanceof Error ? err.message : 'Error al marcar como enviado',
        tipo: 'error',
      })
    } finally {
      setMarcando(false)
    }
  }

  function abrirChat() {
    if (!actual) return
    const url = `https://wa.me/${actual.phone}?text=${encodeURIComponent(actual.mensaje)}`
    window.open(url, '_blank', 'noopener')
  }

  async function copiarMensaje() {
    if (!actual) return
    try {
      await navigator.clipboard.writeText(actual.mensaje)
      toast('Mensaje copiado al portapapeles', 'success')
    } catch {
      toast({ mensaje: 'No se pudo copiar al portapapeles', tipo: 'error' })
    }
  }

  return (
    <Modal open onClose={onClose} title="Enviar WhatsApp" size="lg">
      {terminado ? (
        <div className="text-center py-6 space-y-4">
          <CheckCircle className="w-12 h-12 text-status-success mx-auto" />
          <h3 className="font-overpass font-bold text-lg text-brand-blue">
            Proceso completado
          </h3>
          <p className="text-sm text-gray-600">
            Enviados: {enviados.size} de {total}
          </p>
          <Button variant="primary" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      ) : actual ? (
        <div className="space-y-4">
          {/* Paso counter */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span className="font-medium">
              Paso {paso + 1} de {total}
            </span>
            <span>
              {enviados.size} enviado{enviados.size !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-brand-blue h-1.5 rounded-full transition-all"
              style={{ width: `${((paso + 1) / total) * 100}%` }}
            />
          </div>

          {/* Destinatario */}
          <div className="rounded-lg border border-gray-200 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-green-600" />
              <span className="font-overpass font-semibold text-gray-800">
                {actual.user.name ?? 'Sin nombre'}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Tel: {actual.phone}
            </p>
          </div>

          {/* Vista previa del mensaje */}
          <div className="rounded-lg bg-green-50 border border-green-200 p-4">
            <p className="text-xs font-medium text-green-700 mb-2">Vista previa del mensaje</p>
            <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
              {actual.mensaje}
            </p>
          </div>

          {/* Acciones */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="success"
              size="sm"
              icon={<ExternalLink className="w-4 h-4" />}
              onClick={abrirChat}
            >
              Abrir chat
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<Copy className="w-4 h-4" />}
              onClick={copiarMensaje}
            >
              Copiar mensaje
            </Button>
          </div>

          {/* Marcar como enviado */}
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={enviados.has(actual.id)}
              disabled={marcando || enviados.has(actual.id)}
              onChange={() => marcarEnviado(actual.id)}
              className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
            />
            Marcar como enviado
          </label>

          {/* Navegacion */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <Button
              variant="ghost"
              size="sm"
              icon={<ChevronLeft className="w-4 h-4" />}
              disabled={paso === 0}
              onClick={() => setPaso(p => p - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<ChevronRight className="w-4 h-4" />}
              onClick={() => setPaso(p => p + 1)}
            >
              {paso === total - 1 ? 'Finalizar' : 'Siguiente'}
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  )
}
