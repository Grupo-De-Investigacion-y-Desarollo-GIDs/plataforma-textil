import { redirect } from 'next/navigation'
import { auth } from '@/compartido/lib/auth'

// /recursos se descontinuó (decisión de Sergio al aprobar B1): era una página vacía
// "Próximamente" que el banner del taller inactivo prometía — promesa incumplida. No se
// elimina "a secas" para no romper links viejos ni menciones en emails ya enviados:
// redirige a la sección de cursos.
//
// Redirect CONTEXTUAL: un taller logueado va a su Academia (/taller/aprender); cualquier
// otro caso (incluido anónimo) a la Academia pública. Es TEMPORAL (no permanente) a
// propósito: como el destino depende de la sesión, un 308 cacheado por el browser
// mandaría siempre al mismo lugar y rompería el contexto (un anónimo cachearía
// /academia-publica y no re-evaluaría al loguearse como taller).
export const dynamic = 'force-dynamic'

export default async function RecursosPage() {
  const session = await auth()
  redirect(session?.user?.role === 'TALLER' ? '/taller/aprender' : '/academia-publica')
}
