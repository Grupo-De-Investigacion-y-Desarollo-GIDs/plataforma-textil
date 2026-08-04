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
    <form onSubmit={handleMagicLink} className="mt-3 flex flex-col sm:flex-row gap-2">
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
      <h2 className="font-serif font-bold text-xl text-brand-blue text-center mb-6">
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

      {/* Boton "Continuar con Google" oculto temporalmente (#305): el provider
          de Google solo se registra si hay GOOGLE_CLIENT_ID/SECRET (auth.ts), y
          esas vars no estan configuradas en ningun entorno, asi que signIn('google')
          fallaba silenciosamente. Reactivar al configurar OAuth real. Ver DECISIONS.md #25. */}

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
