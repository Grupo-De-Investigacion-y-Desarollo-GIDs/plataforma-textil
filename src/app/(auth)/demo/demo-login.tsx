'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Factory, ShoppingBag, Clock, Award, PackageCheck, Store } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type Cuenta = {
  email: string
  nombre: string
  flujo: string
  tablet?: string
  redirect: string
  icon: LucideIcon
  color: string
}

// Password única del seed para todas las cuentas demo. NO se muestra al visitante:
// el botón loguea directo (respaldo documentado en docs/EVENTO_DEMO.md, no en pantalla).
const PASSWORD = 'pdt2026'

// Solo TALLERES y MARCAS (público del evento). Coordinación/multi-rol NO van acá:
// se muestran, si el presentador quiere, entrando por /acceso-rapido. 6 + 5 = 11 tarjetas.
const TALLERES: Cuenta[] = [
  { email: 'demo.taller1@pdt.org.ar', nombre: 'Confecciones Belgrano', flujo: 'Taller verificado — cotizá un pedido disponible', tablet: 'Tablet 1', redirect: '/taller', icon: Factory, color: 'bg-orange-500' },
  { email: 'demo.taller2@pdt.org.ar', nombre: 'Textil Avellaneda', flujo: 'Taller verificado — cotizá un pedido disponible', tablet: 'Tablet 2', redirect: '/taller', icon: Factory, color: 'bg-orange-500' },
  { email: 'demo.taller3@pdt.org.ar', nombre: 'Taller Lanús', flujo: 'Taller verificado — cotizá un pedido disponible', tablet: 'Tablet 3', redirect: '/taller', icon: Factory, color: 'bg-orange-500' },
  { email: 'demo.taller4@pdt.org.ar', nombre: 'Corte Ramos Mejía', flujo: 'Taller verificado — cotizá un pedido disponible', tablet: 'Tablet 4', redirect: '/taller', icon: Factory, color: 'bg-orange-500' },
  { email: 'demo.gracia@pdt.org.ar', nombre: 'Costura del Oeste', flujo: 'Taller en período de gracia — CUIT sin verificar (banner y acceso limitado)', redirect: '/taller', icon: Clock, color: 'bg-amber-500' },
  { email: 'carlos.mendoza@pdt.org.ar', nombre: 'Corte Sur SRL', flujo: 'Taller consolidado (Oro) — formalización completa y órdenes en curso', redirect: '/taller', icon: Award, color: 'bg-yellow-600' },
]

const MARCAS: Cuenta[] = [
  { email: 'demo.marca1@pdt.org.ar', nombre: 'Indumentaria Aurora', flujo: 'Publicá un pedido y recibí cotizaciones', tablet: 'Tablet A', redirect: '/marca', icon: ShoppingBag, color: 'bg-blue-500' },
  { email: 'demo.marca2@pdt.org.ar', nombre: 'Moda Delta', flujo: 'Publicá un pedido y recibí cotizaciones', tablet: 'Tablet B', redirect: '/marca', icon: ShoppingBag, color: 'bg-blue-500' },
  { email: 'demo.marca3@pdt.org.ar', nombre: 'Textiles del Plata', flujo: 'Publicá un pedido y recibí cotizaciones', tablet: 'Tablet C', redirect: '/marca', icon: ShoppingBag, color: 'bg-blue-500' },
  { email: 'valentina.ramos@pdt.org.ar', nombre: 'Amapola', flujo: 'Marca con un pedido publicado recibiendo cotizaciones', redirect: '/marca', icon: Store, color: 'bg-indigo-500' },
  { email: 'martin.echevarria@pdt.org.ar', nombre: 'Urbano Textil', flujo: 'Marca con producción en curso — órdenes en ejecución', redirect: '/marca', icon: PackageCheck, color: 'bg-indigo-500' },
]

function Grupo({ titulo, cuentas, onLogin, loading }: { titulo: string; cuentas: Cuenta[]; onLogin: (c: Cuenta) => void; loading: string | null }) {
  return (
    <section className="mb-8">
      <h2 className="font-overpass font-bold text-sm uppercase tracking-wide text-gray-500 mb-3">{titulo}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {cuentas.map(c => {
          const Icon = c.icon
          const isLoading = loading === c.email
          return (
            <button
              key={c.email}
              onClick={() => onLogin(c)}
              disabled={!!loading}
              className="text-left rounded-xl border-2 border-gray-200 p-4 hover:border-brand-blue hover:shadow-md transition-all disabled:opacity-50"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-full ${c.color} flex items-center justify-center shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-overpass font-bold text-brand-blue text-sm">{c.nombre}</p>
                  {c.tablet && <p className="text-xs font-semibold text-gray-500">{c.tablet}</p>}
                </div>
              </div>
              <p className="text-xs text-gray-500">{c.flujo}</p>
              <p className="text-xs text-brand-blue mt-2 font-semibold">
                {isLoading ? 'Ingresando…' : `Entrar como ${c.nombre} →`}
              </p>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export function DemoLogin() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(c: Cuenta) {
    setLoading(c.email)
    setError(null)
    try {
      const result = await signIn('credentials', { email: c.email, password: PASSWORD, redirect: false })
      if (result?.ok) {
        router.push(c.redirect)
        router.refresh()
      } else {
        setError(`No se pudo entrar como ${c.nombre}. Si venías probando varias veces, esperá unos minutos (demasiados intentos) y reintentá.`)
        setLoading(null)
      }
    } catch {
      setError('Demasiados intentos — esperá unos minutos y reintentá.')
      setLoading(null)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <p className="text-center text-gray-500 text-sm mb-8">Tocá una cuenta para entrar directo y recorrer la plataforma.</p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 text-center">
          {error}
        </div>
      )}

      <Grupo titulo="Talleres" cuentas={TALLERES} onLogin={handleLogin} loading={loading} />
      <Grupo titulo="Marcas" cuentas={MARCAS} onLogin={handleLogin} loading={loading} />

      <p className="text-center text-xs text-gray-400 mt-4">Entorno de demostración — datos de prueba.</p>
    </div>
  )
}
