'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, LogIn } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es obligatorio')
    .email('Ingresá un email válido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get('registered') === 'true'
  const callbackUrl = searchParams.get('callbackUrl') || '/'

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
        setError('Email o contraseña incorrectos')
        setLoading(false)
        return
      }

      // Redirigir al callbackUrl o a la raíz (el middleware redirigirá según rol)
      router.push(callbackUrl)
      router.refresh()
    } catch {
      setError('Ocurrió un error inesperado. Intentá de nuevo.')
      setLoading(false)
    }
  }

  return (
    <Card className="p-8">
      <h2 className="font-overpass font-bold text-xl text-brand-blue text-center mb-6">
        Iniciar sesión
      </h2>

      {registered && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          Cuenta creada exitosamente. Ya podés iniciar sesión.
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
            label="Contraseña"
            type="password"
            placeholder="••••••••"
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
            Olvidé mi contraseña
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

      <p className="mt-6 text-center text-sm text-gray-600">
        ¿No tenés cuenta?{' '}
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
