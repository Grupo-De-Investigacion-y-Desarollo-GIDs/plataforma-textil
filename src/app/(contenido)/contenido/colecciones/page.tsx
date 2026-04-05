import { Card } from '@/compartido/componentes/ui/card'
import { BookOpen } from 'lucide-react'

export default function ContenidoColeccionesPage() {
  return (
    <div>
      <h1 className="font-overpass font-bold text-2xl text-brand-blue mb-4">Colecciones</h1>
      <Card>
        <div className="flex items-center gap-3 text-gray-400">
          <BookOpen className="w-6 h-6" />
          <p className="text-sm">En construccion — conectar datos en spec siguiente.</p>
        </div>
      </Card>
    </div>
  )
}
