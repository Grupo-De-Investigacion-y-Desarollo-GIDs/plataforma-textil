'use client'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-brand-bg-light flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-status-error flex items-center justify-center mx-auto mb-6">
          <span className="font-overpass font-bold text-white text-2xl">!</span>
        </div>
        <h1 className="font-overpass font-bold text-3xl text-brand-blue mb-2">Algo salió mal</h1>
        <p className="text-gray-600 mb-8">Ocurrió un error inesperado. Por favor, intentá de nuevo.</p>
        <button onClick={reset}
          className="inline-flex items-center px-6 py-3 bg-brand-blue text-white rounded-lg font-overpass font-semibold hover:bg-blue-800 transition-colors">
          Reintentar
        </button>
      </div>
    </div>
  )
}
