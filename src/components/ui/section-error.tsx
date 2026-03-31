'use client'

import { AlertCircle } from 'lucide-react'

export function SectionError({ section, reset }: { section: string; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
      <h2 className="font-overpass font-bold text-xl text-gray-800 mb-2">
        Error en {section}
      </h2>
      <p className="text-sm text-gray-500 mb-6 max-w-md">
        Ocurrio un error cargando esta seccion. Podes reintentar o volver al inicio.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-brand-blue text-white rounded-lg font-overpass font-semibold text-sm hover:bg-blue-800 transition-colors"
        >
          Reintentar
        </button>
        <a
          href="/"
          className="px-5 py-2.5 border border-gray-300 text-gray-600 rounded-lg font-overpass font-semibold text-sm hover:bg-gray-50 transition-colors"
        >
          Ir al inicio
        </a>
      </div>
    </div>
  )
}
