'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/compartido/componentes/ui/input'
import { Button } from '@/compartido/componentes/ui/button'
import { FileUpload } from '@/compartido/componentes/ui/file-upload'
import { uploadImagen } from '@/compartido/lib/upload-imagen'
import { Send } from 'lucide-react'
import { useToast } from '@/compartido/componentes/ui/toast'

export function CotizarForm({ pedidoId }: { pedidoId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [precio, setPrecio] = useState('')
  const [plazoDias, setPlazoDias] = useState('')
  const [proceso, setProceso] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [imagenesFiles, setImagenesFiles] = useState<File[]>([])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Subir imagenes primero
      const imagenesUrls: string[] = []
      for (const file of imagenesFiles) {
        const url = await uploadImagen(file, 'cotizacion', pedidoId)
        imagenesUrls.push(url)
      }

      const res = await fetch('/api/cotizaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pedidoId,
          precio: parseFloat(precio),
          plazoDias: parseInt(plazoDias),
          proceso,
          mensaje: mensaje || undefined,
          imagenes: imagenesUrls,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 409) {
          toast({ mensaje: 'Ya tenes una cotizacion activa', tipo: 'warning', description: 'Si queres actualizarla, editala desde tu lista de pedidos.' })
        } else {
          const msg = typeof data.error === 'string' ? data.error : data.error?.message
          setError(msg || 'Error al enviar la cotizacion.')
        }
        setLoading(false)
        return
      }
      toast('Cotizacion enviada', 'success')
      router.push('/taller/pedidos')
      router.refresh()
    } catch {
      setError('Error de conexion. Intenta de nuevo.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Precio ($)" type="number" min="1" step="0.01" placeholder="50000" value={precio} onChange={e => setPrecio(e.target.value)} required />
        <Input label="Plazo (dias)" type="number" min="1" placeholder="15" value={plazoDias} onChange={e => setPlazoDias(e.target.value)} required />
      </div>
      <Input label="Proceso" placeholder="Ej: Corte y confeccion de remeras" value={proceso} onChange={e => setProceso(e.target.value)} required />
      <div>
        <label className="block text-sm font-overpass font-semibold text-gray-700 mb-1">Mensaje (opcional)</label>
        <textarea value={mensaje} onChange={e => setMensaje(e.target.value)} placeholder="Detalle adicional sobre tu cotizacion..." rows={3}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent" />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">
          Fotos de trabajos similares <span className="text-gray-400">(opcional, max 3)</span>
        </label>
        <FileUpload
          accept="image/jpeg,image/png,image/webp"
          maxSizeMB={5}
          maxFiles={3}
          showPreviews={true}
          onChange={setImagenesFiles}
          className="mt-2"
        />
      </div>
      <Button type="submit" loading={loading} icon={<Send className="w-4 h-4" />} className="w-full" data-action="enviar-cotizacion">
        Enviar cotizacion
      </Button>
    </form>
  )
}
