'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, CheckCircle, XCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const schema = z
  .object({
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export default function RestablecerPage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setStatus('loading')
    try {
      const res = await fetch(`/api/auth/password-reset/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: data.password }),
      })
      const json = await res.json()
      if (!res.ok) {
        setErrorMsg(json.error || 'Error al restablecer')
        setStatus('error')
        return
      }
      setStatus('success')
      setTimeout(() => router.push('/login'), 3000)
    } catch {
      setErrorMsg('Error de conexión')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <Card className="p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="font-overpass font-bold text-xl text-brand-blue mb-2">Contraseña restablecida</h2>
        <p className="text-sm text-gray-600 mb-6">Tu contraseña fue actualizada. Redirigiendo al login...</p>
        <Link href="/login" className="text-sm font-semibold text-brand-blue hover:underline">
          Ir al login
        </Link>
      </Card>
    )
  }

  if (status === 'error') {
    return (
      <Card className="p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="font-overpass font-bold text-xl text-red-600 mb-2">Error</h2>
        <p className="text-sm text-gray-600 mb-6">{errorMsg}</p>
        <Link href="/olvide-contrasena" className="text-sm font-semibold text-brand-blue hover:underline">
          Solicitar nuevo enlace
        </Link>
      </Card>
    )
  }

  return (
    <Card className="p-8">
      <h2 className="font-overpass font-bold text-xl text-brand-blue text-center mb-2">Nueva contraseña</h2>
      <p className="text-sm text-gray-500 text-center mb-6">Ingresá tu nueva contraseña.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="relative">
          <Input
            label="Nueva contraseña"
            type="password"
            placeholder="Mínimo 6 caracteres"
            error={errors.password?.message}
            {...register('password')}
          />
          <Lock className="absolute right-3 top-[38px] w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        <Input
          label="Confirmar contraseña"
          type="password"
          placeholder="Repetir contraseña"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" className="w-full" size="lg" disabled={status === 'loading'}>
          {status === 'loading' ? 'Restableciendo...' : 'Restablecer contraseña'}
        </Button>
      </form>
    </Card>
  )
}
