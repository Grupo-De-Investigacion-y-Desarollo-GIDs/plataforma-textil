import Link from 'next/link'
import { CheckCircle2, Circle } from 'lucide-react'
import type { PasoOnboarding } from '@/compartido/lib/onboarding'

interface Props {
  pasos: PasoOnboarding[]
  /** Etapa de formalización actual (nivelAEtapa). Se muestra como subtítulo del
   *  recorrido dentro de la card — movido desde el header del dashboard (QA #442). */
  etapa?: string
}

export function ChecklistOnboarding({ pasos, etapa }: Props) {
  const primerPendiente = pasos.find(p => !p.completado)
  const completados = pasos.filter(p => p.completado).length

  return (
    <div className="rounded-xl border border-brand-blue/20 bg-brand-blue/5 p-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h2 className="font-overpass font-bold text-lg text-brand-blue">
            Tus primeros pasos en la plataforma
          </h2>
          {etapa && (
            <p className="text-sm text-gray-500 mt-0.5">
              Tu recorrido de formalización: <span className="font-semibold">{etapa}</span>
            </p>
          )}
        </div>
        <span className="text-xs text-gray-500 font-medium shrink-0">
          {completados}/{pasos.length} completados
        </span>
      </div>

      <div className="space-y-2">
        {pasos.map(paso => (
          <div key={paso.id} className="flex items-center gap-3">
            {paso.completado ? (
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-gray-300 shrink-0" />
            )}
            <span className={`text-sm ${paso.completado ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
              {paso.texto}
            </span>
          </div>
        ))}
      </div>

      {primerPendiente && (
        <Link
          href={primerPendiente.href}
          className="mt-4 inline-flex items-center gap-1 text-sm font-overpass font-semibold text-brand-blue hover:underline"
        >
          Continuar paso siguiente →
        </Link>
      )}
    </div>
  )
}
