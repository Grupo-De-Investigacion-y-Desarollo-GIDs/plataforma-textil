'use client'

import { useState } from 'react'
import { Button } from '@/compartido/componentes/ui/button'
import { useToast } from '@/compartido/componentes/ui/toast'
import { normalizarTelefonoArgentino } from '@/compartido/lib/whatsapp'
import { MessageSquare } from 'lucide-react'

interface CuentaWhatsappFormProps {
  phoneInicial: string | null
  whatsappActivo: boolean
}

export function CuentaWhatsappForm({ phoneInicial, whatsappActivo }: CuentaWhatsappFormProps) {
  const [phone, setPhone] = useState(phoneInicial ?? '')
  const [whatsapp, setWhatsapp] = useState(whatsappActivo)
  const [guardando, setGuardando] = useState(false)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const { toast } = useToast()

  function validarPhone(valor: string) {
    if (!valor.trim()) {
      setPhoneError(null)
      return
    }
    const normalizado = normalizarTelefonoArgentino(valor)
    if (!normalizado) {
      setPhoneError('Formato invalido. Ingresa 10 digitos (ej: 11 2345 6789)')
    } else {
      setPhoneError(null)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (phone.trim() && !normalizarTelefonoArgentino(phone)) {
      setPhoneError('Formato invalido. Ingresa 10 digitos (ej: 11 2345 6789)')
      return
    }

    setGuardando(true)
    try {
      const res = await fetch('/api/cuenta', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.trim(),
          notificacionesWhatsapp: whatsapp,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error?.message ?? 'Error al guardar')
      }

      toast('Datos de WhatsApp actualizados', 'success')
    } catch (err) {
      toast({
        mensaje: err instanceof Error ? err.message : 'Error al guardar',
        tipo: 'error',
      })
    } finally {
      setGuardando(false)
    }
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-green-600" />
        <h2 className="font-overpass font-bold text-lg text-brand-blue">WhatsApp</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Telefono
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={e => {
              setPhone(e.target.value)
              validarPhone(e.target.value)
            }}
            placeholder="Ej: 11 2345 6789"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none"
          />
          {phoneError && (
            <p className="text-xs text-status-error mt-1">{phoneError}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Sin 0 ni 15. Solo los 10 digitos (codigo de area + numero).
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={whatsapp}
            onChange={e => setWhatsapp(e.target.checked)}
            className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
          />
          Recibir notificaciones por WhatsApp
        </label>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={guardando}
            disabled={!!phoneError}
          >
            Guardar
          </Button>
        </div>
      </form>
    </section>
  )
}
