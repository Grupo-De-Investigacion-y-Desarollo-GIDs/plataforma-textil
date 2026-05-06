export const dynamic = 'force-dynamic'

import { Breadcrumbs } from '@/compartido/componentes/ui/breadcrumbs'
import { FormularioObservacion } from '../formulario-observacion'

export default function NuevaObservacionPage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: 'Observaciones', href: '/admin/observaciones' },
        { label: 'Nueva observacion' },
      ]} />
      <h1 className="font-overpass font-bold text-2xl text-brand-blue">Nueva observacion</h1>
      <p className="text-sm text-gray-500">
        Esta info se usa para el reporte a OIT. No incluyas datos sensibles que no quieras compartir.
      </p>
      <FormularioObservacion />
    </div>
  )
}
