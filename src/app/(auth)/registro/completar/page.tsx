'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Factory, ShoppingBag, Building2, Hash, ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { Input } from '@/compartido/componentes/ui/input'
import { Button } from '@/compartido/componentes/ui/button'
import { Card } from '@/compartido/componentes/ui/card'

type Role = 'TALLER' | 'MARCA'

function validarCuit(val: string) {
  return /^\d{11}$/.test(val.replace(/-/g, ''))
}

export default function CompletarRegistroPage() {
  const router = useRouter()
  const [step, setStep] = useState<0 | 1>(0)
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Paso 1 fields
  const [nombre, setNombre] = useState('')
  const [cuit, setCuit] = useState('')
  const [cuitVerificado, setCuitVerificado] = useState(false)
  const [cuitLoading, setCuitLoading] = useState(false)
  const [cuitData, setCuitData] = useState<{ razonSocial?: string } | null>(null)
  const [cuitError, setCuitError] = useState('')

  async function verificarCuitOnBlur() {
    const limpio = cuit.replace(/-/g, '')
    if (limpio.length !== 11) return

    setCuitLoading(true)
    setCuitError('')
    setCuitData(null)
    setCuitVerificado(false)

    try {
      const res = await fetch(`/api/auth/verificar-cuit?cuit=${limpio}`)
      const data = await res.json()
      if (data.valid) {
        setCuitVerificado(true)
        setCuitData({ razonSocial: data.razonSocial })
      } else {
        setCuitError(data.error || 'CUIT invalido')
      }
    } catch {
      setCuitError('')
      setCuitVerificado(true)
      setCuitData(null)
    } finally {
      setCuitLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!role || !nombre.trim() || !validarCuit(cuit)) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/registro/completar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, nombre: nombre.trim(), cuit }),
      })

      const body = await res.json()
      if (!res.ok) {
        setError(body.error || 'Error al completar el registro')
        setLoading(false)
        return
      }

      router.push(role === 'TALLER' ? '/taller' : '/marca/directorio')
      router.refresh()
    } catch {
      setError('Ocurrio un error inesperado. Intenta de nuevo.')
      setLoading(false)
    }
  }

  return (
    <Card className="p-8">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-overpass font-bold transition-colors ${
              (step === 0 && i === 0) || (step === 1 && i <= 1)
                ? i < step ? 'bg-brand-blue text-white' : 'bg-brand-blue text-white ring-4 ring-blue-200'
                : 'bg-gray-200 text-gray-500'
            }`}>
              {i < step ? <Check className="w-4 h-4" /> : s}
            </div>
            {i < 1 && <div className={`w-12 h-0.5 ${step > 0 ? 'bg-brand-blue' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <h2 className="font-overpass font-bold text-xl text-brand-blue text-center mb-2">
        Completa tu registro
      </h2>
      <p className="text-sm text-gray-500 text-center mb-6">
        {step === 0 ? 'Selecciona tu rol en la plataforma' : `Datos de tu ${role === 'TALLER' ? 'taller' : 'marca'}`}
      </p>

      {/* Paso 0: seleccion de rol */}
      {step === 0 && (
        <div className="grid grid-cols-1 gap-4">
          <button
            type="button"
            onClick={() => { setRole('TALLER'); setStep(1) }}
            className="group flex items-center gap-4 rounded-xl border-2 border-gray-200 p-5 text-left transition-all hover:border-brand-blue hover:shadow-md"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50 text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors">
              <Factory className="w-6 h-6" />
            </div>
            <div>
              <p className="font-overpass font-bold text-brand-blue text-lg">Taller</p>
              <p className="text-sm text-gray-500">Soy un taller textil y quiero ofrecer mis servicios</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => { setRole('MARCA'); setStep(1) }}
            className="group flex items-center gap-4 rounded-xl border-2 border-gray-200 p-5 text-left transition-all hover:border-brand-blue hover:shadow-md"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50 text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="font-overpass font-bold text-brand-blue text-lg">Marca</p>
              <p className="text-sm text-gray-500">Soy una marca y busco talleres para producir</p>
            </div>
          </button>
        </div>
      )}

      {/* Paso 1: datos entidad */}
      {step === 1 && role && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              label={role === 'TALLER' ? 'Nombre del taller' : 'Nombre de la marca'}
              placeholder={role === 'TALLER' ? 'Taller La Costura' : 'Mi Marca'}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
            <Building2 className="absolute right-3 top-[38px] w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <Input
              label="CUIT"
              placeholder="20-12345678-9"
              value={cuit}
              onChange={(e) => setCuit(e.target.value)}
              onBlur={verificarCuitOnBlur}
              error={cuitError}
              required
            />
            <Hash className="absolute right-3 top-[38px] w-4 h-4 text-gray-400 pointer-events-none" />
            {cuitLoading && (
              <p className="text-xs text-gray-400 mt-1">Verificando CUIT en ARCA...</p>
            )}
            {cuitVerificado && cuitData?.razonSocial && (
              <div className="flex items-center gap-1.5 mt-1">
                <Check className="w-3.5 h-3.5 text-green-600" />
                <span className="text-xs text-green-700 font-semibold">Verificado por ARCA</span>
                <span className="text-xs text-gray-500">— {cuitData.razonSocial}</span>
              </div>
            )}
            {cuitVerificado && !cuitData?.razonSocial && (
              <p className="text-xs text-amber-600 mt-1">
                No se pudo verificar en ARCA. Podes continuar igualmente.
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setStep(0)} icon={<ArrowLeft className="w-4 h-4" />} className="flex-1">
              Atras
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={!cuitVerificado && !cuitLoading && cuit.replace(/-/g, '').length === 11}
              icon={<Check className="w-4 h-4" />}
              className="flex-1"
            >
              Completar registro
            </Button>
          </div>
        </form>
      )}
    </Card>
  )
}
