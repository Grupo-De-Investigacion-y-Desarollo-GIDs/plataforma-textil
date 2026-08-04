import { notFound } from 'next/navigation'
import { getFeatureFlag } from '@/compartido/lib/features'
import { DenunciarForm } from './denunciar-form'

// El flag 'denuncias' gatea toda la superficie publica del modulo (pagina + API).
// Si esta OFF, la pagina no existe (404), no solo el POST devuelve 503.
export default async function DenunciarPage() {
  if (!await getFeatureFlag('denuncias')) notFound()
  return <DenunciarForm />
}
