'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Eye, X } from 'lucide-react'

// Banner del dashboard del taller que invita a revisar/mostrar la vidriera
// (Etapa 2.2-B, §5.4). Dos audiencias según `modeloB_revisado`:
//   - revisado=false (taller NUEVO): "Tenés datos que podés mostrar a las marcas".
//     Persiste mientras el flag siga en false (es privacy-by-default; aún no mostró nada).
//   - revisado=true (taller EXISTENTE): nudge "Revisá qué muestra tu vidriera",
//     descartable con un dismiss liviano en localStorage (D6).
//
// CTA: por ahora apunta a "Mi vidriera" (vista read-only de lo que ve la marca).
// El panel de "Configuración de visibilidad" para activar/ocultar bloques llega
// en 2.2-C; este banner queda funcional (link a una ruta existente, no roto).

const DISMISS_KEY = 'pdt:banner-vidriera-revisar-dismissed'

export function BannerVidriera({ revisado }: { revisado: boolean }) {
  const [mostrar, setMostrar] = useState(false)

  useEffect(() => {
    // El banner de "nuevos" se muestra siempre; el de "existentes" respeta el dismiss.
    if (!revisado) {
      setMostrar(true)
      return
    }
    try {
      setMostrar(localStorage.getItem(DISMISS_KEY) !== '1')
    } catch {
      setMostrar(true)
    }
  }, [revisado])

  if (!mostrar) return null

  const descartar = () => {
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      /* sin localStorage: el banner reaparece, no es crítico */
    }
    setMostrar(false)
  }

  return (
    <div className="border-l-4 border-l-brand-blue bg-brand-blue/5 rounded-card p-4 flex items-start gap-3">
      <Eye className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className="font-overpass font-bold text-brand-blue mb-1">
          {revisado ? 'Revisá qué muestra tu vidriera' : 'Tenés datos que podés mostrar a las marcas'}
        </p>
        <p className="text-sm text-gray-600">
          {revisado
            ? 'Controlá qué información ven las marcas que visitan tu perfil en el directorio.'
            : 'Tu vidriera arranca privada. Revisá tu información cargada y preparate para elegir qué mostrar.'}
        </p>
        <Link
          href="/taller/perfil/vidriera"
          className="inline-flex items-center gap-1 mt-2 text-sm font-semibold text-brand-blue hover:underline"
        >
          Ver mi vidriera →
        </Link>
      </div>
      {revisado && (
        <button
          type="button"
          onClick={descartar}
          aria-label="Descartar aviso"
          className="text-gray-400 hover:text-gray-600 shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
