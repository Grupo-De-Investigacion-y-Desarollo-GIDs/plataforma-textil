'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FileUpload } from '@/compartido/componentes/ui/file-upload'
import { uploadImagen } from '@/compartido/lib/upload-imagen'

interface Props {
  marcaId: string
  procesos: { id: string; nombre: string }[]
}

export function NuevoPedidoForm({ marcaId, procesos }: Props) {
  const router = useRouter()
  const [tipoPrenda, setTipoPrenda] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [fechaObjetivo, setFechaObjetivo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [procesosSeleccionados, setProcesosSeleccionados] = useState<string[]>([])
  const [imagenesFiles, setImagenesFiles] = useState<File[]>([])
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleProceso(id: string) {
    setProcesosSeleccionados(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setGuardando(true)

    try {
      // 1. Subir imagenes primero
      const imagenesUrls: string[] = []
      for (const file of imagenesFiles) {
        const url = await uploadImagen(file, 'pedido', marcaId)
        imagenesUrls.push(url)
      }

      // 2. Crear el pedido
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipoPrenda,
          cantidad: parseInt(cantidad),
          fechaObjetivo: fechaObjetivo || null,
          descripcion: descripcion || null,
          procesosRequeridos: procesosSeleccionados,
          imagenes: imagenesUrls,
        }),
      })

      if (res.ok) {
        router.push('/marca/pedidos?created=1')
      } else {
        const data = await res.json()
        setError(data.error ?? 'Error al crear el pedido')
      }
    } catch {
      setError('Error de conexion')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-overpass font-bold text-3xl text-brand-blue">Nuevo Pedido</h1>
          <p className="text-gray-600 mt-2">Crea una orden para iniciar tu flujo de produccion.</p>
        </div>
        <Link
          href="/marca/pedidos"
          className="inline-flex items-center justify-center rounded-lg font-overpass font-semibold transition-colors bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2.5 text-sm"
        >
          Volver
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-status-error/30 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="tipoPrenda" className="block text-sm font-overpass font-medium text-brand-blue mb-1.5">
              Tipo de prenda
            </label>
            <input
              id="tipoPrenda"
              value={tipoPrenda}
              onChange={e => setTipoPrenda(e.target.value)}
              required
              placeholder="Ej: Jean, Remera, Camisa"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="cantidad" className="block text-sm font-overpass font-medium text-brand-blue mb-1.5">
              Cantidad
            </label>
            <input
              id="cantidad"
              value={cantidad}
              onChange={e => setCantidad(e.target.value)}
              type="number"
              min="1"
              required
              placeholder="500"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="fechaObjetivo" className="block text-sm font-overpass font-medium text-brand-blue mb-1.5">
              Fecha objetivo
            </label>
            <input
              id="fechaObjetivo"
              value={fechaObjetivo}
              onChange={e => setFechaObjetivo(e.target.value)}
              type="date"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label htmlFor="descripcion" className="block text-sm font-overpass font-medium text-brand-blue mb-1.5">
            Descripcion
          </label>
          <textarea
            id="descripcion"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            placeholder="Especificaciones tecnicas: tela, talles, terminaciones..."
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
          />
        </div>

        {procesos.length > 0 && (
          <div>
            <label className="block text-sm font-overpass font-medium text-brand-blue mb-1.5">
              Procesos requeridos
            </label>
            <div className="flex flex-wrap gap-2">
              {procesos.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleProceso(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                    procesosSeleccionados.includes(p.id)
                      ? 'bg-brand-blue text-white border-brand-blue'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-brand-blue'
                  }`}
                >
                  {p.nombre}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-overpass font-medium text-brand-blue mb-1.5">
            Imagenes de referencia <span className="text-gray-400 font-normal">(opcional, max 5)</span>
          </label>
          <FileUpload
            accept="image/jpeg,image/png,image/webp"
            maxSizeMB={5}
            maxFiles={5}
            showPreviews={true}
            onChange={setImagenesFiles}
          />
        </div>

        <button
          type="submit"
          disabled={guardando}
          className="inline-flex items-center justify-center rounded-lg font-overpass font-semibold transition-colors bg-brand-blue hover:bg-brand-blue-hover text-white px-5 py-2.5 text-sm disabled:opacity-50"
        >
          {guardando ? 'Creando pedido...' : 'Crear pedido'}
        </button>
      </form>
    </div>
  )
}
