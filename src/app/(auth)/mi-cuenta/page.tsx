'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Phone, Lock, Save, CheckCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'

const profileSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  phone: z.string().optional(),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Ingresá tu contraseña actual'),
  newPassword: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string().min(1, 'Confirmá tu nueva contraseña'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

type ProfileData = z.infer<typeof profileSchema>
type PasswordData = z.infer<typeof passwordSchema>

export default function MiCuentaPage() {
  const { data: session, update: updateSession } = useSession()
  const { toast } = useToast()
  const [profileMsg, setProfileMsg] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const profileForm = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', phone: '' },
  })

  const passwordForm = useForm<PasswordData>({
    resolver: zodResolver(passwordSchema),
  })

  // Pre-cargar datos reales del usuario (incluye teléfono)
  useEffect(() => {
    fetch('/api/auth/mi-cuenta')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return
        profileForm.reset({ name: data.name || '', phone: data.phone || '' })
      })
      .catch(() => {})
  }, [profileForm])

  async function onProfileSubmit(data: ProfileData) {
    setProfileError(null)
    setProfileMsg(null)
    setProfileLoading(true)
    try {
      const res = await fetch('/api/auth/mi-cuenta', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json()
        setProfileError(body.error || 'Error al actualizar')
      } else {
        setProfileMsg('Perfil actualizado correctamente')
        toast('Perfil actualizado')
        // Refrescar sesión para que el nombre se actualice en el header
        await updateSession({ name: data.name })
      }
    } catch {
      setProfileError('Error de conexión')
    } finally {
      setProfileLoading(false)
    }
  }

  async function onPasswordSubmit(data: PasswordData) {
    setPasswordError(null)
    setPasswordMsg(null)
    setPasswordLoading(true)
    try {
      const res = await fetch('/api/auth/mi-cuenta', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json()
        setPasswordError(body.error || 'Error al cambiar contraseña')
      } else {
        setPasswordMsg('Contraseña actualizada correctamente')
        toast('Contrasena actualizada')
        passwordForm.reset()
      }
    } catch {
      setPasswordError('Error de conexión')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="font-overpass font-bold text-2xl text-brand-blue mb-6">Mi Cuenta</h1>

      <Card title="Información de la cuenta" className="mb-6">
        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
          <span className="text-sm text-gray-500">Email:</span>
          <span className="font-semibold">{session?.user?.email}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Rol:</span>
          <Badge>{session?.user?.role || 'N/A'}</Badge>
        </div>
      </Card>

      <Card title="Editar perfil" className="mb-6">
        {profileMsg && (
          <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> {profileMsg}
          </div>
        )}
        {profileError && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {profileError}
          </div>
        )}
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
          <div className="relative">
            <Input
              label="Nombre"
              error={profileForm.formState.errors.name?.message}
              {...profileForm.register('name')}
            />
            <User className="absolute right-3 top-[38px] w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <Input
              label="Teléfono"
              error={profileForm.formState.errors.phone?.message}
              {...profileForm.register('phone')}
            />
            <Phone className="absolute right-3 top-[38px] w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <Button type="submit" loading={profileLoading} icon={<Save className="w-4 h-4" />}>
            Guardar cambios
          </Button>
        </form>
      </Card>

      <Card title="Cambiar contraseña">
        {passwordMsg && (
          <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> {passwordMsg}
          </div>
        )}
        {passwordError && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {passwordError}
          </div>
        )}
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
          <div className="relative">
            <Input
              label="Contraseña actual"
              type="password"
              error={passwordForm.formState.errors.currentPassword?.message}
              {...passwordForm.register('currentPassword')}
            />
            <Lock className="absolute right-3 top-[38px] w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <Input
              label="Nueva contraseña"
              type="password"
              error={passwordForm.formState.errors.newPassword?.message}
              {...passwordForm.register('newPassword')}
            />
            <Lock className="absolute right-3 top-[38px] w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <Input
              label="Confirmar nueva contraseña"
              type="password"
              error={passwordForm.formState.errors.confirmPassword?.message}
              {...passwordForm.register('confirmPassword')}
            />
            <Lock className="absolute right-3 top-[38px] w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <Button type="submit" loading={passwordLoading} icon={<Lock className="w-4 h-4" />}>
            Cambiar contraseña
          </Button>
        </form>
      </Card>
    </div>
  )
}
