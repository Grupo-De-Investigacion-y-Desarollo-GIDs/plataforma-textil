'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const schema = z.object({
  email: z.string().min(1, 'El email es obligatorio').email('Ingresá un email válido'),
})

type FormData = z.infer<typeof schema>

export default function OlvideContrasenaPage() {
  const [enviado, setEnviado] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      await fetch('/api/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      })
    } catch {
      // Silently handle - don't reveal if email exists
    }
    setEnviado(true)
    setLoading(false)
  }

  if (enviado) {
    return (
      <Card className="p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="font-overpass font-bold text-xl text-brand-blue mb-2">Email enviado</h2>
        <p className="text-sm text-gray-600 mb-6">
          Te enviamos un email con instrucciones para restablecer tu contraseña. Revisá tu bandeja de entrada.
        </p>
        <Link href="/login" className="text-sm font-semibold text-brand-blue hover:underline">
          Volver a iniciar sesión
        </Link>
      </Card>
    )
  }

  return (
    <Card className="p-8">
      <h2 className="font-overpass font-bold text-xl text-brand-blue text-center mb-2">
        Recuperar contraseña
      </h2>
      <p className="text-sm text-gray-500 text-center mb-6">
        Ingresá tu email y te enviaremos instrucciones para restablecer tu contraseña.
      </p>

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

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar instrucciones'}
        </Button>
      </form>

      <p className="mt-6 text-center">
        <Link href="/login" className="inline-flex items-center gap-1 text-sm text-brand-blue hover:underline">
          <ArrowLeft className="w-4 h-4" /> Volver a iniciar sesión
        </Link>
      </p>
    </Card>
  )
}
