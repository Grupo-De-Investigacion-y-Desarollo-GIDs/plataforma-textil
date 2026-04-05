'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, LogIn } from 'lucide-react'
import { Input } from '@/compartido/componentes/ui/input'
import { Button } from '@/compartido/componentes/ui/button'
import { Card } from '@/compartido/componentes/ui/card'

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es obligatorio')
    .email('Ingresa un email valido'),
  password: z
    .string()
    .min(6, 'La contrasena debe tener al menos 6 caracteres'),
})

type LoginFormData = z.infer<typeof loginSchema>

function MagicLinkForm() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setSending(true)
    await signIn('email', { email, callbackUrl: '/', redirect: false })
    setSent(true)
    setSending(false)
  }

  if (sent) {
    return (
      <div className="mt-3 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700">
        Enviamos un link de acceso a <strong>{email}</strong>. Revisa tu bandeja de entrada.
      </div>
    )
  }

  return (
    <form onSubmit={handleMagicLink} className="mt-3 flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Tu email para recibir un link"
        className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
        required
      />
      <Button type="submit" loading={sending} size="sm">
        Enviar link
      </Button>
    </form>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get('registered') === 'true'
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const errorParam = searchParams.get('error')

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginFormData) {
    setError(null)
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Email o contrasena incorrectos')
        setLoading(false)
        return
      }

      // Redirigir al callbackUrl o a la raiz (el middleware redirigira segun rol)
      router.push(callbackUrl)
      router.refresh()
    } catch {
      setError('Ocurrio un error inesperado. Intenta de nuevo.')
      setLoading(false)
    }
  }

  return (
    <Card className="p-8">
      <h2 className="font-overpass font-bold text-xl text-brand-blue text-center mb-6">
        Iniciar sesion
      </h2>

      {registered && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          Cuenta creada exitosamente. Ya podes iniciar sesion.
        </div>
      )}

      {errorParam === 'OAuthAccountNotLinked' && (
        <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
          Ya tenes una cuenta con email y contrasena. Usa tu contrasena para ingresar, o solicita un link de acceso.
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="relative">
          <Input
            label="Email"
            type="email"
            placeholder="tu@email.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Mail className="absolute right-3 top-[38px] w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        <div className="relative">
          <Input
            label="Contrasena"
            type="password"
            placeholder="........"
            error={errors.password?.message}
            {...register('password')}
          />
          <Lock className="absolute right-3 top-[38px] w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        <div className="text-right">
          <Link
            href="/olvide-contrasena"
            className="text-sm text-brand-blue hover:underline"
          >
            Olvide mi contrasena
          </Link>
        </div>

        <Button
          type="submit"
          loading={loading}
          icon={<LogIn className="w-4 h-4" />}
          className="w-full"
          size="lg"
        >
          Ingresar
        </Button>
      </form>

      {/* Separador */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">O continua con</span>
        </div>
      </div>

      {/* Google */}
      <button
        type="button"
        onClick={() => signIn('google', { callbackUrl: '/' })}
        className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-overpass font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continuar con Google
      </button>

      {/* Magic link */}
      <MagicLinkForm />

      <p className="mt-6 text-center text-sm text-gray-600">
        No tenes cuenta?{' '}
        <Link
          href="/registro"
          className="font-semibold text-brand-blue hover:underline"
        >
          Crear cuenta
        </Link>
      </p>
    </Card>
  )
}
