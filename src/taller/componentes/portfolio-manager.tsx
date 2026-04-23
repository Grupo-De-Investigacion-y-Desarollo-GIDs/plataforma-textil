'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ImageIcon, Plus } from 'lucide-react'
import { FileUpload } from '@/compartido/componentes/ui/file-upload'
import { ImageLightbox } from '@/compartido/componentes/ui/image-lightbox'
import { Button } from '@/compartido/componentes/ui/button'
import { uploadImagen } from '@/compartido/lib/upload-imagen'

interface Props {
  tallerId: string
  fotosActuales: string[]
}

export function PortfolioManager({ tallerId, fotosActuales }: Props) {
  const router = useRouter()
  const [subiendo, setSubiendo] = useState(false)
  const [mostrarUploader, setMostrarUploader] = useState(false)
  const [imagenAmpliada, setImagenAmpliada] = useState<string | null>(null)

  const maxFotos = 10
  const puedeAgregar = fotosActuales.length < maxFotos

  async function handleUpload(files: File[]) {
    if (files.length === 0) return
    setSubiendo(true)
    try {
      const nuevasUrls: string[] = []
      for (const file of files) {
        const url = await uploadImagen(file, 'portfolio', tallerId)
        nuevasUrls.push(url)
      }
      await fetch(`/api/talleres/${tallerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolioFotos: [...fotosActuales, ...nuevasUrls],
        }),
      })
      router.refresh()
    } catch (err) {
      console.error('[portfolio] Error subiendo fotos:', err)
    } finally {
      setSubiendo(false)
      setMostrarUploader(false)
    }
  }

  async function eliminarFoto(urlAEliminar: string) {
    const nuevas = fotosActuales.filter(url => url !== urlAEliminar)
    await fetch(`/api/talleres/${tallerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ portfolioFotos: nuevas }),
    })
    router.refresh()
  }

  if (fotosActuales.length === 0 && !mostrarUploader) {
    return (
      <div className="text-center py-6">
        <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Agrega fotos de tus trabajos</p>
        <p className="text-xs text-gray-400 mt-1">
          Los talleres con portfolio reciben 3x mas contactos
        </p>
        <Button
          onClick={() => setMostrarUploader(true)}
          variant="secondary"
          size="sm"
          className="mt-3"
          icon={<Plus className="w-4 h-4" />}
        >
          Agregar fotos
        </Button>
      </div>
    )
  }

  return (
    <div>
      {fotosActuales.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
          {fotosActuales.map((url, i) => (
            <div key={i} className="relative group aspect-square">
              <img
                src={url}
                alt={`Trabajo ${i + 1}`}
                loading="lazy"
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90"
                onClick={() => setImagenAmpliada(url)}
              />
              <button
                onClick={() => eliminarFoto(url)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}

      {puedeAgregar && (
        mostrarUploader ? (
          <div className="space-y-3">
            <FileUpload
              accept="image/jpeg,image/png,image/webp"
              maxSizeMB={5}
              maxFiles={maxFotos - fotosActuales.length}
              showPreviews={true}
              onChange={handleUpload}
            />
            {subiendo && <p className="text-sm text-gray-500">Subiendo fotos...</p>}
          </div>
        ) : (
          <Button
            onClick={() => setMostrarUploader(true)}
            variant="secondary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
          >
            Agregar fotos ({fotosActuales.length}/{maxFotos})
          </Button>
        )
      )}

      {imagenAmpliada && (
        <ImageLightbox src={imagenAmpliada} onClose={() => setImagenAmpliada(null)} />
      )}
    </div>
  )
}
