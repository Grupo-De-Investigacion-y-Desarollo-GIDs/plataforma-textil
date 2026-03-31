import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-bg-light flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-brand-blue flex items-center justify-center mx-auto mb-6">
          <span className="font-overpass font-bold text-white text-2xl">404</span>
        </div>
        <h1 className="font-overpass font-bold text-3xl text-brand-blue mb-2">Página no encontrada</h1>
        <p className="text-gray-600 mb-8">La página que buscás no existe o fue movida.</p>
        <Link href="/"
          className="inline-flex items-center px-6 py-3 bg-brand-blue text-white rounded-lg font-overpass font-semibold hover:bg-blue-800 transition-colors">
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
