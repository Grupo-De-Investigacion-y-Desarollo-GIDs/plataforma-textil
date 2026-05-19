import { Breadcrumbs } from '@/compartido/componentes/ui/breadcrumbs'
import { FormularioNovedad } from '../formulario-novedad'

export default function NuevaNovedadPage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: 'Novedades', href: '/contenido/novedades' },
        { label: 'Nueva novedad' },
      ]} />
      <h1 className="font-serif font-bold text-2xl text-ink-primary">Nueva novedad</h1>
      <p className="text-sm text-gray-500">
        La novedad se publicará inmediatamente en el landing.
      </p>
      <FormularioNovedad />
    </div>
  )
}
