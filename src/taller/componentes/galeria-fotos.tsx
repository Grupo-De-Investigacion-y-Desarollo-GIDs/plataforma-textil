'use client'

import { useState } from 'react'
import { ImageLightbox } from '@/compartido/componentes/ui/image-lightbox'

export function GaleriaFotos({ fotos }: { fotos: string[] }) {
  const [imagenAmpliada, setImagenAmpliada] = useState<string | null>(null)
  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {fotos.map((url, i) => (
          <img
            key={i}
            src={url}
            alt={`Trabajo ${i + 1}`}
            loading="lazy"
            className="w-full aspect-square object-cover rounded-lg cursor-pointer hover:opacity-90"
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
