import { Card } from '@/compartido/componentes/ui/card'
import { Bell } from 'lucide-react'

export default function ContenidoNotificacionesPage() {
  return (
    <div>
      <h1 className="font-overpass font-bold text-2xl text-brand-blue mb-4">Notificaciones</h1>
      <Card>
        <div className="flex items-center gap-3 text-gray-400">
          <Bell className="w-6 h-6" />
          <p className="text-sm">En construccion — conectar datos en spec siguiente.</p>
        </div>
      </Card>
    </div>
  )
}
