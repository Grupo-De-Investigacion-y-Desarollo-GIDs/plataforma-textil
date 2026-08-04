import Link from 'next/link'
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react'
import {
  descripcionVidrieraOk,
  ubicacionVidrieraOk,
  fotoVidrieraOk,
  tallerElegibleDirectorio,
  DESCRIPCION_MIN_CHARS,
  FOTO_OBLIGATORIA,
} from '@/compartido/lib/visibilidad-vidriera'

// Aviso de "vidriera mínima" (Etapa 2.3-A): le dice al taller si aparece o no en el
// directorio, y qué le falta para aparecer. Server component (sin estado): se calcula
// con los mismos helpers que el gate del directorio, así nunca se desincroniza.
//
// Reglas que evalúa (todas deben cumplirse para aparecer):
//   - CUIT verificado (verificadoAfip) — gate SQL del directorio
//   - Descripción ≥ DESCRIPCION_MIN_CHARS
//   - Ubicación declarada (provincia + partido)
//   - ≥1 proceso/prenda visible (R-DIR)
//   - Foto: SOLO se exige si FOTO_OBLIGATORIA (piloto: opcional → no se lista)

type TallerAviso = {
  verificadoAfip?: boolean
  descripcion?: string | null
  provincia?: string | null
  partido?: string | null
  portfolioFotos?: unknown[]
  visibilidadVidriera?: unknown
  modeloB_revisado?: boolean
  procesos?: unknown[]
  prendas?: unknown[]
}

const EDITAR = '/taller/perfil/editar'
const GESTION = '/taller/perfil/gestion'
const DATOS_BASICOS = '/taller/perfil'

export function VidrieraMinimaAviso({ taller }: { taller: TallerAviso }) {
  const reqs = [
    {
      ok: !!taller.verificadoAfip,
      label: 'CUIT verificado en ARCA',
      href: DATOS_BASICOS,
      cta: 'Verificar CUIT',
    },
    {
      ok: descripcionVidrieraOk(taller),
      label: `Descripción de al menos ${DESCRIPCION_MIN_CHARS} caracteres`,
      href: EDITAR,
      cta: 'Editar descripción',
    },
    {
      ok: ubicacionVidrieraOk(taller),
      label: 'Ubicación declarada (provincia y partido)',
      href: EDITAR,
      cta: 'Completar ubicación',
    },
    {
      ok: tallerElegibleDirectorio(taller),
      label: 'Al menos un proceso o prenda visible',
      href: GESTION,
      cta: 'Gestionar procesos y prendas',
    },
    // Foto: solo es requisito si FOTO_OBLIGATORIA (post-piloto). En el piloto no se lista.
    ...(FOTO_OBLIGATORIA
      ? [{
          ok: fotoVidrieraOk(taller),
          label: 'Una foto del taller',
          href: GESTION,
          cta: 'Subir foto',
        }]
      : []),
  ]

  const aparece = reqs.every((r) => r.ok)

  if (aparece) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
        <p className="text-sm text-green-800">
          <span className="font-medium">Tu taller aparece en el directorio.</span>{' '}
          Las marcas pueden encontrarte cuando buscan proveedores.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <p className="text-sm font-medium text-amber-900 mb-2">
        Tu taller todavía no aparece en el directorio
      </p>
      <p className="text-xs text-amber-800 mb-3">
        Para que las marcas puedan encontrarte, completá lo que falta:
      </p>
      <ul className="space-y-2">
        {reqs.map((r) => (
          <li key={r.label} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            {r.ok ? (
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span className={r.ok ? 'text-gray-500 line-through' : 'text-gray-700'}>{r.label}</span>
            {!r.ok && (
              <Link
                href={r.href}
                className="inline-flex items-center gap-0.5 text-xs font-medium text-brand-blue hover:underline"
              >
                {r.cta} <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
