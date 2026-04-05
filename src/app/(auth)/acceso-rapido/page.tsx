'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Card } from '@/compartido/componentes/ui/card'
import { Factory, ShoppingBag, BarChart3, Shield, BookOpen } from 'lucide-react'

const usuarios = [
  {
    email: 'lucia.fernandez@pdt.org.ar',
    password: 'pdt2026',
    nombre: 'Lucia Fernandez',
    rol: 'ADMIN',
    descripcion: 'Acceso completo al panel de administracion',
    redirect: '/admin',
    icon: Shield,
    color: 'bg-red-500',
  },
  {
    email: 'roberto.gimenez@pdt.org.ar',
    password: 'pdt2026',
    nombre: 'Roberto Gimenez',
    rol: 'TALLER BRONCE',
    descripcion: 'Taller La Aguja — Florencio Varela',
    redirect: '/taller',
    icon: Factory,
    color: 'bg-orange-500',
  },
  {
    email: 'graciela.sosa@pdt.org.ar',
    password: 'pdt2026',
    nombre: 'Graciela Sosa',
    rol: 'TALLER PLATA',
    descripcion: 'Cooperativa Hilos del Sur — La Matanza',
    redirect: '/taller',
    icon: Factory,
    color: 'bg-gray-400',
  },
  {
    email: 'carlos.mendoza@pdt.org.ar',
    password: 'pdt2026',
    nombre: 'Carlos Mendoza',
    rol: 'TALLER ORO',
    descripcion: 'Corte Sur SRL — Avellaneda',
    redirect: '/taller',
    icon: Factory,
    color: 'bg-yellow-500',
  },
  {
    email: 'martin.echevarria@pdt.org.ar',
    password: 'pdt2026',
    nombre: 'Martin Echevarria',
    rol: 'MARCA',
    descripcion: 'Moda Urbana BA — Marca mediana',
    redirect: '/marca',
    icon: ShoppingBag,
    color: 'bg-blue-500',
  },
  {
    email: 'anabelen.torres@pdt.org.ar',
    password: 'pdt2026',
    nombre: 'Ana Belen Torres',
    rol: 'ESTADO',
    descripcion: 'Organismo publico — Dashboard del sector',
    redirect: '/estado',
    icon: BarChart3,
    color: 'bg-green-600',
  },
  {
    email: 'sofia.martinez@pdt.org.ar',
    password: 'pdt2026',
    nombre: 'Sofia Martinez',
    rol: 'CONTENIDO',
    descripcion: 'Gestion de colecciones, evaluaciones y notificaciones',
    redirect: '/contenido/colecciones',
    icon: BookOpen,
    color: 'bg-purple-500',
  },
]

export default function AccesoRapidoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(user: typeof usuarios[0]) {
    setLoading(user.email)
    setError(null)
    try {
      const result = await signIn('credentials', {
        email: user.email,
        password: user.password,
        redirect: false,
      })
      if (result?.ok) {
        router.push(user.redirect)
        router.refresh()
      } else {
        setError(`Error al ingresar como ${user.nombre}`)
        setLoading(null)
      }
    } catch {
      setError('Error de conexion')
      setLoading(null)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-brand-blue flex items-center justify-center mx-auto mb-4">
          <span className="font-overpass font-bold text-white text-xl">PDT</span>
        </div>
        <h1 className="font-overpass font-bold text-2xl text-brand-blue">Acceso rapido</h1>
        <p className="text-gray-500 text-sm mt-1">Selecciona un usuario para ingresar al sistema</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 text-center">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {usuarios.map(user => {
          const Icon = user.icon
          const isLoading = loading === user.email
          return (
            <button
              key={user.email}
              onClick={() => handleLogin(user)}
              disabled={!!loading}
              className="text-left rounded-xl border-2 border-gray-200 p-4 hover:border-brand-blue hover:shadow-md transition-all disabled:opacity-50"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-full ${user.color} flex items-center justify-center shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-overpass font-bold text-brand-blue text-sm">{user.nombre}</p>
                  <p className="text-xs text-gray-500">{user.rol}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400">{user.descripcion}</p>
              {isLoading && <p className="text-xs text-brand-blue mt-1 font-medium">Ingresando...</p>}
            </button>
          )
        })}
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">
        Todos los usuarios usan password <span className="font-mono">pdt2026</span> — datos del seed de desarrollo
      </p>
    </div>
  )
}
