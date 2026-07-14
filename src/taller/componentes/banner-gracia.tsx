import Link from 'next/link'
import { AlertTriangle, Clock } from 'lucide-react'
import { clasificarGracia } from '@/compartido/lib/gracia'

// Banner de gracia de CUIT en el dashboard del taller (Etapa 2.3-B0). Reemplaza al
// banner generico "en proceso de formalizacion": misma poblacion (talleres sin CUIT
// verificado), pero con el copy por estado de Sergio y el countdown de dias.
//
// Server component sin estado: se computa en vivo con `clasificarGracia` (mismo helper
// que usara el cron de B1), asi el banner refleja la realidad AUN sin el cron (que
// todavia no corre en B0). Para un taller verificado devuelve null (no aplica gracia).
//
// Coexistencia con 2.2-B: el BannerVidriera se muestra SOLO para verificados; este,
// SOLO para no verificados. Son mutuamente excluyentes por `verificadoAfip` -> nunca
// aparecen los dos juntos.

export function BannerGracia({
  taller,
}: {
  taller: { verificadoAfip: boolean; inicioGracia: Date | null }
}) {
  const { estado, diasRestantes } = clasificarGracia(taller, new Date())

  // Verificado / sin reloj de gracia -> sin banner (su foco no es la gracia).
  if (estado === 'NO_APLICA') return null

  if (estado === 'INACTIVA') {
    return (
      <div className="border-l-4 border-l-red-400 bg-red-50 rounded-card p-4">
        <p className="flex items-center gap-1.5 font-overpass font-bold text-red-800 mb-1">
          <AlertTriangle className="w-4 h-4 shrink-0" /> Tu cuenta está inactiva
        </p>
        <p className="text-sm text-red-700">
          Verificá tu CUIT para reactivarla y aparecer en el directorio. Mientras tanto,
          seguís teniendo acceso a la Academia y a explorar la red de talleres.
        </p>
        <Link
          href="/taller/formalizacion#verificar-cuit"
          className="inline-flex items-center gap-1 mt-2 text-sm font-semibold text-red-800 hover:underline"
        >
          Verificar mi CUIT →
        </Link>
      </div>
    )
  }

  // EN_GRACIA / VENCE_PRONTO -> countdown (tono estimulante).
  const dias = diasRestantes === 1 ? 'queda 1 día' : `quedan ${diasRestantes} días`
  return (
    <div className="border-l-4 border-l-amber-400 bg-amber-50 rounded-card p-4">
      <p className="flex items-center gap-1.5 font-overpass font-bold text-amber-800 mb-1">
        <Clock className="w-4 h-4 shrink-0" /> Te {dias} para verificar tu CUIT y aparecer en el directorio
      </p>
      <p className="text-sm text-amber-700">
        Una vez verificado tu CUIT vas a poder cotizar pedidos y aparecer en el directorio.
        Mientras tanto, podés capacitarte en la Academia y explorar la red de talleres.
      </p>
      <Link
        href="/taller/formalizacion#verificar-cuit"
        className="inline-flex items-center gap-1 mt-2 text-sm font-semibold text-amber-800 hover:underline"
      >
        Verificar mi CUIT →
      </Link>
    </div>
  )
}
