import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-red-600" />
          </div>
        </div>
        
        <h1 className="font-overpass font-bold text-3xl text-brand-blue mb-3">
          Acceso No Autorizado
        </h1>
        
        <p className="text-gray-600 mb-8">
          No tienes permiso para acceder a esta sección de la plataforma.
          Por favor, verifica tu rol de usuario o contacta al administrador.
        </p>
        
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-brand-blue text-white font-overpass font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver al Inicio
          </Link>
          
          <Link
            href="/ayuda"
            className="block w-full border-2 border-gray-300 text-gray-700 font-overpass font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Contactar Soporte
          </Link>
        </div>
      </div>
    </div>
  )
}
