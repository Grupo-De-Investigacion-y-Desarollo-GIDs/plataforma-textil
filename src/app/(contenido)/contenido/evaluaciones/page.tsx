import { Card } from '@/compartido/componentes/ui/card'
import { ClipboardList } from 'lucide-react'

export default function ContenidoEvaluacionesPage() {
  return (
    <div>
      <h1 className="font-overpass font-bold text-2xl text-brand-blue mb-4">Evaluaciones</h1>
      <Card>
        <div className="flex items-center gap-3 text-gray-400">
          <ClipboardList className="w-6 h-6" />
          <p className="text-sm">En construccion — conectar datos en spec siguiente.</p>
        </div>
      </Card>
    </div>
  )
}
