'use client'

import { useState } from 'react'
import { ImageLightbox } from '@/compartido/componentes/ui/image-lightbox'

export function CotizacionImagenes({ imagenes }: { imagenes: string[] }) {
  const [imagenAmpliada, setImagenAmpliada] = useState<string | null>(null)

  return (
    <>
      <div className="flex gap-2 mt-3">
        {imagenes.map((url, i) => (
          <img
            key={i}
            src={url}
            alt={`Trabajo similar ${i + 1}`}
            loading="lazy"
            className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-90"
            onClick={() => setImagenAmpliada(url)}
          />
        ))}
      </div>
      {imagenAmpliada && (
        <ImageLightbox src={imagenAmpliada} onClose={() => setImagenAmpliada(null)} />
      )}
    </>
  )
}
