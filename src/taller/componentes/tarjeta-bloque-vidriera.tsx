'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Check, Plus } from 'lucide-react'
import { Card } from '@/compartido/componentes/ui/card'
import { Modal } from '@/compartido/componentes/ui/modal'
import { Button } from '@/compartido/componentes/ui/button'
import { useToast } from '@/compartido/componentes/ui/toast'
import { bloqueVisibleVidriera, type BloqueVidriera } from '@/compartido/lib/visibilidad-vidriera'
import { actualizarVisibilidadVidriera } from '@/taller/componentes/visibilidad-vidriera-action'

// Tarjeta de un bloque TOGGLE-LIBRE de "Mi vidriera" (Etapa 2.2-C1, 2a vuelta).
// Toggle INLINE: cada card lleva su switch on/off, que dispara el server action
// `actualizarVisibilidadVidriera` (REUSADO tal cual: manda solo { [bloque]: valor },
// el endpoint rellena el mapa completo + anti-footgun + flag).
//
// 3 estados de descubribilidad:
//   - sin datos   → placeholder "Sumá [X]" + link al tab/wizard donde se carga (sin toggle)
//   - cargado+OFF → placeholder gris "Oculto a las marcas" + toggle para mostrar
//   - cargado+ON  → card normal con el contenido (children) + toggle para ocultar
//
// El aviso de confirmación (oculto→visible) se dispara desde la card (§5.5).
//
// `contenidoSiempre`: para Portfolio (que se EDITA acá vía PortfolioManager) — el
// contenido se renderiza siempre (incluso oculto/sin-datos) con un banner de estado,
// para no perder el acceso de edición. Los demás bloques se editan en otro tab, así
// que ocultarlos por placeholder no quita funcionalidad.

interface Props {
  bloque: BloqueVidriera
  titulo: string
  visibilidadInicial: unknown
  modeloBRevisado: boolean
  tieneDatos: boolean
  /** Texto del placeholder sin-datos, ej. "Sumá tus procesos productivos". */
  sinDatosTexto: string
  /** Destino donde se carga el dato (tab/wizard). */
  wizardHref: string
  wizardCta: string
  /** Portfolio: render del contenido siempre, con banner de estado. */
  contenidoSiempre?: boolean
  children?: React.ReactNode
}

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

export function TarjetaBloqueVidriera({
  bloque,
  titulo,
  visibilidadInicial,
  modeloBRevisado,
  tieneDatos,
  sinDatosTexto,
  wizardHref,
  wizardCta,
  contenidoSiempre = false,
  children,
}: Props) {
  const { toast } = useToast()
  const [pending, startTransition] = useTransition()
  const tallerRef = { visibilidadVidriera: visibilidadInicial, modeloB_revisado: modeloBRevisado }
  const [visible, setVisible] = useState(() => bloqueVisibleVidriera(tallerRef, bloque))
  const [confirmando, setConfirmando] = useState(false)

  function persistir(valor: boolean) {
    startTransition(async () => {
      const res = await actualizarVisibilidadVidriera({ bloques: { [bloque]: valor } })
      if (res.ok) {
        setVisible(valor)
        toast({ mensaje: valor ? `${titulo} ahora es visible para las marcas` : `${titulo} oculto a las marcas`, tipo: 'success' })
      } else {
        toast({ mensaje: res.error ?? 'No se pudo guardar', tipo: 'error' })
      }
    })
  }

  function onToggle() {
    if (!visible) {
      setConfirmando(true) // activar (oculto→visible): pide confirmación
      return
    }
    persistir(false) // ocultar: directo
  }

  const Toggle = (
    <div className="flex items-center gap-2 shrink-0">
      <span className={`text-xs flex items-center gap-1 ${visible ? 'text-brand-blue' : 'text-gray-400'}`}>
        {visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </span>
      <Switch checked={visible} disabled={pending} onChange={onToggle} label={`Mostrar ${titulo} a las marcas`} />
    </div>
  )

  const ConfirmModal = (
    <Modal open={confirmando} onClose={() => setConfirmando(false)} title="Mostrar a las marcas" size="sm">
      <p className="text-sm text-gray-600 mb-5">
        Al activar esto, los datos de <strong>{titulo}</strong> van a ser visibles para
        las marcas que vean tu vidriera. ¿Confirmás?
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={() => setConfirmando(false)}>Cancelar</Button>
        <Button size="sm" onClick={() => { setConfirmando(false); persistir(true) }}>
          <Check className="w-4 h-4 mr-1" /> Sí, mostrar
        </Button>
      </div>
    </Modal>
  )

  // ESTADO sin-datos: placeholder + link (sin toggle). Portfolio (contenidoSiempre)
  // no usa este branch: se edita inline.
  if (!tieneDatos && !contenidoSiempre) {
    return (
      <Card>
        <div className="flex flex-col gap-2 py-2">
          <p className="text-sm font-medium text-gray-700">{titulo}</p>
          <p className="text-sm text-gray-400">{sinDatosTexto}</p>
          <Link href={wizardHref} className="inline-flex items-center gap-1 text-sm text-brand-blue hover:underline w-fit">
            <Plus className="w-3.5 h-3.5" /> {wizardCta}
          </Link>
        </div>
      </Card>
    )
  }

  // Portfolio: contenido siempre presente (editable), con header de estado.
  if (contenidoSiempre) {
    return (
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h3 className="font-overpass font-bold text-gray-800">{titulo}</h3>
          {tieneDatos && Toggle}
        </div>
        {tieneDatos && !visible && (
          <p className="flex items-center gap-1 text-xs text-gray-500 mb-3 rounded bg-gray-50 px-2 py-1 w-fit">
            <EyeOff className="w-3.5 h-3.5" /> Oculto a las marcas
          </p>
        )}
        {children}
        {ConfirmModal}
      </Card>
    )
  }

  // ESTADO cargado + OFF: placeholder gris "Oculto a las marcas" + toggle.
  if (!visible) {
    return (
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-overpass font-bold text-gray-400">{titulo}</h3>
          {Toggle}
        </div>
        <p className="flex items-center gap-1.5 text-sm text-gray-400 mt-2">
          <EyeOff className="w-4 h-4" /> Oculto a las marcas
        </p>
        {ConfirmModal}
      </Card>
    )
  }

  // ESTADO cargado + ON: card normal con contenido + toggle.
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h3 className="font-overpass font-bold text-gray-800">{titulo}</h3>
        {Toggle}
      </div>
      {children}
      {ConfirmModal}
    </Card>
  )
}
