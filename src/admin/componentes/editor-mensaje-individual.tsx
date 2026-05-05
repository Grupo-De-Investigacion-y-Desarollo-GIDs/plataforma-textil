'use client'

import { useState, useMemo } from 'react'
import { Modal } from '@/compartido/componentes/ui/modal'
import { Input } from '@/compartido/componentes/ui/input'
import { Badge } from '@/compartido/componentes/ui/badge'
import { Button } from '@/compartido/componentes/ui/button'
import { useToast } from '@/compartido/componentes/ui/toast'

interface Props {
  destinatarioId: string
  destinatarioNombre: string
  destinatarioRol: 'TALLER' | 'MARCA' | 'ADMIN' | 'ESTADO' | 'CONTENIDO'
  destinatarioTienePhone: boolean
  onCerrar: () => void
}

export function EditorMensajeIndividual({
  destinatarioId,
  destinatarioNombre,
  destinatarioRol,
  destinatarioTienePhone,
  onCerrar,
}: Props) {
  const [titulo, setTitulo] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [incluirLink, setIncluirLink] = useState(false)
  const [link, setLink] = useState('')
  const [enviarPorWhatsapp, setEnviarPorWhatsapp] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const { toast } = useToast()

  const sugerenciasLinks = useMemo(() => {
    if (destinatarioRol === 'TALLER') {
      return [
        { label: 'Su perfil', url: '/taller/perfil' },
        { label: 'Su formalizacion', url: '/taller/formalizacion' },
        { label: 'Su dashboard', url: '/taller' },
      ]
    }
    if (destinatarioRol === 'MARCA') {
      return [
        { label: 'Sus pedidos', url: '/marca/pedidos' },
        { label: 'Su panel', url: '/marca' },
      ]
    }
    return []
  }, [destinatarioRol])

  async function enviar() {
    setEnviando(true)
    try {
      const res = await fetch('/api/admin/mensajes-individuales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinatarioId,
          titulo,
          mensaje,
          link: incluirLink ? link : '',
          enviarPorWhatsapp,
        }),
      })

      if (res.status === 429) {
        toast({ mensaje: 'Limite de envio alcanzado', tipo: 'warning', description: 'Maximo 50 mensajes por hora' })
        return
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast(data?.error?.message ?? 'Error al enviar mensaje', 'error')
        return
      }

      toast('Mensaje enviado', 'success')
      onCerrar()
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Modal open onClose={onCerrar} title={`Mensaje a ${destinatarioNombre}`} size="lg">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="muted">{destinatarioRol}</Badge>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Titulo <span className="text-red-500">*</span>
          </label>
          <Input
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            maxLength={120}
            placeholder="Ej: Pedido de informacion sobre tu CUIT"
          />
          <p className="text-xs text-zinc-500 mt-1">{titulo.length}/120</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Mensaje <span className="text-red-500">*</span>
          </label>
          <textarea
            value={mensaje}
            onChange={e => setMensaje(e.target.value)}
            maxLength={2000}
            rows={6}
            placeholder="Escribi el mensaje al usuario. Acepta texto plano."
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
          <p className="text-xs text-zinc-500 mt-1">{mensaje.length}/2000</p>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={incluirLink}
              onChange={e => setIncluirLink(e.target.checked)}
              className="rounded border-zinc-300"
            />
            Adjuntar link a pagina especifica de la plataforma
          </label>

          {incluirLink && (
            <div className="mt-2">
              <Input
                value={link}
                onChange={e => setLink(e.target.value)}
                placeholder="/taller/formalizacion"
              />
              {sugerenciasLinks.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {sugerenciasLinks.map(s => (
                    <button
                      key={s.url}
                      type="button"
                      onClick={() => setLink(s.url)}
                      className="text-xs bg-zinc-100 hover:bg-zinc-200 px-2 py-1 rounded"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {destinatarioTienePhone && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={enviarPorWhatsapp}
              onChange={e => setEnviarPorWhatsapp(e.target.checked)}
              className="rounded border-zinc-300"
            />
            Enviar tambien por WhatsApp (el destinatario tambien lo vera en su bandeja)
          </label>
        )}

        {!destinatarioTienePhone && (
          <p className="text-xs text-zinc-500">
            El destinatario no tiene telefono cargado, solo se enviara por la plataforma.
          </p>
        )}

        <PreviewMensaje titulo={titulo} mensaje={mensaje} link={incluirLink ? link : null} />
      </div>

      <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
        <Button variant="ghost" onClick={onCerrar}>Cancelar</Button>
        <Button
          onClick={enviar}
          loading={enviando}
          disabled={titulo.length < 3 || mensaje.length < 10 || enviando}
        >
          Enviar mensaje
        </Button>
      </div>
    </Modal>
  )
}

function PreviewMensaje({ titulo, mensaje, link }: { titulo: string; mensaje: string; link: string | null }) {
  return (
    <div className="border rounded-lg p-4 bg-zinc-50 mt-4">
      <p className="text-xs text-zinc-500 mb-2">Vista previa de como lo vera el destinatario:</p>

      <div className="bg-white rounded p-3 border">
        <h3 className="font-semibold text-sm">{titulo || '[Titulo]'}</h3>
        <p className="text-sm text-zinc-700 mt-2 whitespace-pre-wrap">
          {mensaje || '[Contenido del mensaje]'}
        </p>
        {link && (
          <span className="text-violet-600 text-sm underline mt-2 inline-block">
            Ver detalles →
          </span>
        )}
      </div>
    </div>
  )
}
