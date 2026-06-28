'use client'

import { useState, useTransition } from 'react'
import { Eye, EyeOff, Lock, Check } from 'lucide-react'
import { Card } from '@/compartido/componentes/ui/card'
import { Modal } from '@/compartido/componentes/ui/modal'
import { Button } from '@/compartido/componentes/ui/button'
import { useToast } from '@/compartido/componentes/ui/toast'
import {
  bloqueVisibleVidriera,
  badgeFormacionVisible,
  type BloqueVidriera,
  type VisibilidadInput,
} from '@/compartido/lib/visibilidad-vidriera'
import { actualizarVisibilidadVidriera } from '@/taller/componentes/visibilidad-vidriera-action'

// Panel "Configuración de visibilidad" (Etapa 2.2-C1, §7 / Opción A): vive en "Mi
// gestión productiva". Un toggle on/off por bloque TOGGLE-LIBRE; los FORZADO-VISIBLE y
// FORZADO-PRIVADO se muestran informativos (sin control). Cada activación (oculto→
// visible) pide confirmación (§5.5). El guardado escribe el MAPA COMPLETO + flag
// (anti-footgun, §5.3) vía la server action.

interface BloqueMeta {
  key: BloqueVidriera
  label: string
  tieneDatos: boolean
}

interface CertificadoMeta {
  id: string
  titulo: string
}

interface Props {
  /** JSON crudo de `Taller.visibilidadVidriera`. */
  visibilidadInicial: unknown
  modeloBRevisado: boolean
  /** Bloques toggle-libre (sin `formacion`, que es master granular aparte). */
  bloques: BloqueMeta[]
  /** Badges de Academia para el toggle granular de Formación. */
  certificados: CertificadoMeta[]
  /** ¿El taller tiene contenido de Academia (master `formacion`)? */
  tieneFormacion: boolean
}

type Pendiente =
  | { tipo: 'bloque'; key: BloqueVidriera; label: string }
  | { tipo: 'formacion'; label: string }
  | { tipo: 'badge'; id: string; label: string }

function Switch({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean
  onChange: () => void
  disabled?: boolean
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
        checked ? 'bg-brand-blue' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

export function ConfiguracionVisibilidad({
  visibilidadInicial,
  modeloBRevisado,
  bloques,
  certificados,
  tieneFormacion,
}: Props) {
  const { toast } = useToast()
  const [pending, startTransition] = useTransition()

  const tallerRef = { visibilidadVidriera: visibilidadInicial, modeloB_revisado: modeloBRevisado }

  // Estado efectivo inicial por bloque (mismo helper que el render público).
  const [estado, setEstado] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    for (const b of bloques) init[b.key] = bloqueVisibleVidriera(tallerRef, b.key)
    init['formacion'] = bloqueVisibleVidriera(tallerRef, 'formacion')
    return init
  })
  const [badges, setBadges] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    for (const c of certificados) init[c.id] = badgeFormacionVisible(tallerRef, c.id)
    return init
  })

  const [pendiente, setPendiente] = useState<Pendiente | null>(null)

  function persistir(nextEstado: Record<string, boolean>, nextBadges: Record<string, boolean>) {
    const input: VisibilidadInput = {
      bloques: nextEstado as Partial<Record<BloqueVidriera, boolean>>,
      formacionBadges: nextBadges,
    }
    startTransition(async () => {
      const res = await actualizarVisibilidadVidriera(input)
      if (res.ok) {
        toast({ mensaje: 'Visibilidad actualizada', tipo: 'success' })
      } else {
        toast({ mensaje: res.error ?? 'No se pudo guardar', tipo: 'error' })
      }
    })
  }

  // Aplica un cambio. Si es activación (oculto→visible) pide confirmación primero.
  function cambiarBloque(key: BloqueVidriera, label: string) {
    const activando = !estado[key]
    if (activando) {
      setPendiente({ tipo: 'bloque', key, label })
      return
    }
    const next = { ...estado, [key]: false }
    setEstado(next)
    persistir(next, badges)
  }

  function cambiarFormacion(label: string) {
    const activando = !estado['formacion']
    if (activando) {
      setPendiente({ tipo: 'formacion', label })
      return
    }
    const next = { ...estado, formacion: false }
    setEstado(next)
    persistir(next, badges)
  }

  function cambiarBadge(id: string, label: string) {
    const activando = !badges[id]
    if (activando) {
      setPendiente({ tipo: 'badge', id, label })
      return
    }
    const next = { ...badges, [id]: false }
    setBadges(next)
    persistir(estado, next)
  }

  function confirmar() {
    if (!pendiente) return
    if (pendiente.tipo === 'bloque') {
      const next = { ...estado, [pendiente.key]: true }
      setEstado(next)
      persistir(next, badges)
    } else if (pendiente.tipo === 'formacion') {
      const next = { ...estado, formacion: true }
      setEstado(next)
      persistir(next, badges)
    } else {
      const next = { ...badges, [pendiente.id]: true }
      setBadges(next)
      persistir(estado, next)
    }
    setPendiente(null)
  }

  const formacionVisible = estado['formacion']

  return (
    <Card title="Configuración de visibilidad">
      <p className="text-sm text-gray-600 mb-4">
        Elegí qué bloques de tu vidriera ven las marcas. Las credenciales (etapa, ARCA,
        ubicación) siempre se muestran; tus datos privados (CUIT, responsable, tiempos)
        nunca se exponen.
      </p>

      {/* TOGGLE-LIBRE: el taller decide */}
      <div className="space-y-1">
        {bloques.map((b) => (
          <div
            key={b.key}
            className="flex items-center justify-between gap-3 py-2.5 border-b border-gray-100 last:border-0"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800">{b.label}</p>
              {!b.tieneDatos && (
                <p className="text-xs text-gray-400">Sin datos cargados todavía</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-xs ${estado[b.key] ? 'text-brand-blue' : 'text-gray-400'}`}>
                {estado[b.key] ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </span>
              <Switch
                checked={!!estado[b.key]}
                disabled={pending}
                onChange={() => cambiarBloque(b.key, b.label)}
                label={`Mostrar ${b.label}`}
              />
            </div>
          </div>
        ))}

        {/* Formación: master + sub-toggles por badge */}
        {tieneFormacion && (
          <div className="py-2.5 border-b border-gray-100 last:border-0">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-gray-800">Academia (cursos PDT)</p>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs ${formacionVisible ? 'text-brand-blue' : 'text-gray-400'}`}>
                  {formacionVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </span>
                <Switch
                  checked={!!formacionVisible}
                  disabled={pending}
                  onChange={() => cambiarFormacion('Academia (cursos PDT)')}
                  label="Mostrar Academia"
                />
              </div>
            </div>
            {formacionVisible && certificados.length > 0 && (
              <div className="mt-2 ml-3 pl-3 border-l-2 border-gray-100 space-y-1.5">
                {certificados.map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-3">
                    <p className="text-xs text-gray-600 min-w-0 truncate">{c.titulo}</p>
                    <Switch
                      checked={!!badges[c.id]}
                      disabled={pending}
                      onChange={() => cambiarBadge(c.id, c.titulo)}
                      label={`Mostrar ${c.titulo}`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FORZADO-PRIVADO: informativo, sin control */}
      <div className="mt-4 rounded-lg bg-gray-50 p-3">
        <p className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1">
          <Lock className="w-3.5 h-3.5" /> Nunca visible para las marcas
        </p>
        <p className="text-xs text-gray-400">
          CUIT, datos del responsable (nombre, email, teléfono) y tiempos de producción
          (SAM) quedan siempre privados.
        </p>
      </div>

      {/* Confirmación al activar (§5.5) */}
      <Modal
        open={!!pendiente}
        onClose={() => setPendiente(null)}
        title="Mostrar a las marcas"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-5">
          Al activar esto, los datos de <strong>{pendiente?.label}</strong> van a ser
          visibles para las marcas que vean tu vidriera. ¿Confirmás?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => setPendiente(null)}>
            Cancelar
          </Button>
          <Button size="sm" onClick={confirmar}>
            <Check className="w-4 h-4 mr-1" /> Sí, mostrar
          </Button>
        </div>
      </Modal>
    </Card>
  )
}
