import { notFound } from 'next/navigation'
import { DemoLogin } from './demo-login'

// Página de acceso del EVENTO (QR de las tablets). Gateada por MODO_EVENTO=on: fuera del
// evento (o si la env var no está seteada) la ruta no existe (404). En prod MODO_EVENTO
// no se setea → invisible. El acceso directo por tarjeta reutiliza el patrón de
// /acceso-rapido (signIn con credenciales del seed), sin formulario ni credenciales a la vista.
export const dynamic = 'force-dynamic'

export default function DemoPage() {
  if (process.env.MODO_EVENTO !== 'on') notFound()
  return <DemoLogin />
}
