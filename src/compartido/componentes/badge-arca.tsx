import { ShieldCheck, ShieldAlert } from 'lucide-react'

function tiempoRelativo(fecha: Date): string {
  const dias = Math.floor((Date.now() - new Date(fecha).getTime()) / (1000 * 60 * 60 * 24))
  if (dias === 0) return 'hoy'
  if (dias === 1) return 'ayer'
  if (dias < 30) return `hace ${dias} dias`
  const meses = Math.floor(dias / 30)
  return `hace ${meses} ${meses === 1 ? 'mes' : 'meses'}`
}

export function BadgeArca({ verificado, fecha }: { verificado: boolean; fecha?: Date | null }) {
  if (verificado) {
    return (
      <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
        <ShieldCheck className="w-3 h-3" />
        Verificado por ARCA
        {fecha && (
          <span className="text-blue-400 font-normal">
            ({tiempoRelativo(fecha)})
          </span>
        )}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-medium">
      <ShieldAlert className="w-3 h-3" />
      Pendiente de verificacion
    </span>
  )
}
