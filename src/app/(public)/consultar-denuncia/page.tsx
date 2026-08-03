import { notFound } from 'next/navigation'
import { getFeatureFlag } from '@/compartido/lib/features'
import { ConsultarDenunciaForm } from './consultar-denuncia-form'

// Gateado por el flag 'denuncias' (misma superficie que /denunciar y el API).
export default async function ConsultarDenunciaPage() {
  if (!await getFeatureFlag('denuncias')) notFound()
  return <ConsultarDenunciaForm />
}
