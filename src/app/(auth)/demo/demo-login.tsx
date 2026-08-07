'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Factory, ShoppingBag, BarChart3, Clock, Award, Repeat, PackageCheck, Store } from 'lucide-react'
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
// el botón loguea directo (respaldo documentado aparte, no en pantalla).
const PASSWORD = 'pdt2026'

// 7 cuentas de ESCRITURA (una por tablet) + 6 de showcase = 13 tarjetas.
const TALLERES: Cuenta[] = [
  { email: 'demo.taller1@pdt.org.ar', nombre: 'Confecciones Belgrano', flujo: 'Taller verificado — cotizá un pedido disponible', tablet: 'Tablet 1', redirect: '/taller', icon: Factory, color: 'bg-orange-500' },
  { email: 'demo.taller2@pdt.org.ar', nombre: 'Textil Avellaneda', flujo: 'Taller verificado — cotizá un pedido disponible', tablet: 'Tablet 2', redirect: '/taller', icon: Factory, color: 'bg-orange-500' },
  { email: 'demo.taller3@pdt.org.ar', nombre: 'Taller Lanús', flujo: 'Taller verificado — cotizá un pedido disponible', tablet: 'Tablet 3', redirect: '/taller', icon: Factory, color: 'bg-orange-500' },
  { email: 'demo.taller4@pdt.org.ar', nombre: 'Corte Ramos Mejía', flujo: 'Taller verificado — cotizá un pedido disponible', tablet: 'Tablet 4', redirect: '/taller', icon: Factory, color: 'bg-orange-500' },
  { email: 'demo.gracia@pdt.org.ar', nombre: 'Costura del Oeste', flujo: 'Taller en período de gracia — CUIT sin verificar (banner + acceso limitado)', redirect: '/taller', icon: Clock, color: 'bg-amber-500' },
  { email: 'carlos.mendoza@pdt.org.ar', nombre: 'Corte Sur SRL (Carlos Mendoza)', flujo: 'Taller consolidado ORO — validaciones completas, academia y órdenes en curso', redirect: '/taller', icon: Award, color: 'bg-yellow-600' },
  { email: 'julieta.benitez@pdt.org.ar', nombre: 'Julieta Benítez', flujo: 'Multi-rol — opera como taller y marca (toggle "Operando como…")', redirect: '/taller', icon: Repeat, color: 'bg-teal-600' },
]

const MARCAS: Cuenta[] = [
  { email: 'demo.marca1@pdt.org.ar', nombre: 'Indumentaria Aurora', flujo: 'Publicá un pedido y recibí cotizaciones', tablet: 'Tablet A', redirect: '/marca', icon: ShoppingBag, color: 'bg-blue-500' },
  { email: 'demo.marca2@pdt.org.ar', nombre: 'Moda Delta', flujo: 'Publicá un pedido y recibí cotizaciones', tablet: 'Tablet B', redirect: '/marca', icon: ShoppingBag, color: 'bg-blue-500' },
  { email: 'demo.marca3@pdt.org.ar', nombre: 'Textiles del Plata', flujo: 'Publicá un pedido y recibí cotizaciones', tablet: 'Tablet C', redirect: '/marca', icon: ShoppingBag, color: 'bg-blue-500' },
  { email: 'valentina.ramos@pdt.org.ar', nombre: 'Amapola (Valentina Ramos)', flujo: 'Marca con pedido publicado recibiendo cotizaciones', redirect: '/marca', icon: Store, color: 'bg-indigo-500' },
  { email: 'martin.echevarria@pdt.org.ar', nombre: 'Urbano Textil (Martín Echevarría)', flujo: 'Marca con producción en curso — órdenes en ejecución', redirect: '/marca', icon: PackageCheck, color: 'bg-indigo-500' },
]

const COORDINACION: Cuenta[] = [
  { email: 'anabelen.torres@pdt.org.ar', nombre: 'Ana Belén Torres', flujo: 'Coordinación / Estado — dashboard del sector, talleres, auditorías', redirect: '/estado', icon: BarChart3, color: 'bg-green-600' },
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
                {isLoading ? 'Ingresando…' : `Entrar como ${c.nombre.split(' (')[0]} →`}
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
        setError(`No se pudo entrar como ${c.nombre}. Si probaste varias veces seguidas, esperá unos segundos y reintentá.`)
        setLoading(null)
      }
    } catch {
      setError('Error de conexión. Reintentá en unos segundos.')
      setLoading(null)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-brand-blue flex items-center justify-center mx-auto mb-4">
          <span className="font-overpass font-bold text-white text-xl">PDT</span>
        </div>
        <h1 className="font-overpass font-bold text-2xl text-ink-primary">Plataforma Digital Textil — Demo</h1>
        <p className="text-gray-500 text-sm mt-1">Tocá una cuenta para entrar directo y recorrer la plataforma.</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 text-center">
          {error}
        </div>
      )}

      <Grupo titulo="Talleres" cuentas={TALLERES} onLogin={handleLogin} loading={loading} />
      <Grupo titulo="Marcas" cuentas={MARCAS} onLogin={handleLogin} loading={loading} />
      <Grupo titulo="Coordinación" cuentas={COORDINACION} onLogin={handleLogin} loading={loading} />

      <p className="text-center text-xs text-gray-400 mt-4">Entorno de demostración — datos de prueba.</p>
    </div>
  )
}
