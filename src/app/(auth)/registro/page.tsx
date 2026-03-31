'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Building2,
  ShoppingBag,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Factory,
  Hash,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select } from '@/components/ui/select'

type Role = 'TALLER' | 'MARCA'

// Valida CUIT argentino: XX-XXXXXXXX-X o XXXXXXXXXXX (sin guiones)
function validarCuit(val: string) {
  const limpio = val.replace(/-/g, '')
  return /^\d{11}$/.test(limpio)
}

// --- Zod schemas ---

const personalInfoSchema = z
  .object({
    nombre: z.string().min(1, 'El nombre es obligatorio'),
    email: z.string().min(1, 'El email es obligatorio').email('Ingresá un email válido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirmá tu contraseña'),
    phone: z.string().optional(),
    terminos: z.boolean().refine(v => v === true, 'Debés aceptar los términos y condiciones'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

const tallerInfoSchema = z.object({
  nombreTaller: z.string().min(1, 'El nombre del taller es obligatorio'),
  cuit: z.string().refine(validarCuit, 'El CUIT debe tener 11 dígitos (ej: 20-12345678-9)'),
  ubicacion: z.string().min(1, 'La ubicación es obligatoria'),
  capacidadMensual: z
    .string()
    .min(1, 'La capacidad mensual es obligatoria')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Ingresá un número válido mayor a 0',
    }),
})

const marcaInfoSchema = z.object({
  nombreMarca: z.string().min(1, 'El nombre de la marca es obligatorio'),
  cuit: z.string().refine(validarCuit, 'El CUIT debe tener 11 dígitos (ej: 20-12345678-9)'),
  ubicacion: z.string().min(1, 'La ubicación es obligatoria'),
  tipo: z.string().min(1, 'Seleccioná el tipo de empresa'),
})

type PersonalInfoData = z.infer<typeof personalInfoSchema>
type TallerInfoData = z.infer<typeof tallerInfoSchema>
type MarcaInfoData = z.infer<typeof marcaInfoSchema>

// --- Step indicator ---

function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = [1, 2, 3]
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center gap-2">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-overpass font-bold transition-colors ${
              step < currentStep
                ? 'bg-brand-blue text-white'
                : step === currentStep
                  ? 'bg-brand-blue text-white ring-4 ring-blue-200'
                  : 'bg-gray-200 text-gray-500'
            }`}
          >
            {step < currentStep ? <Check className="w-4 h-4" /> : step}
          </div>
          {index < steps.length - 1 && (
            <div className={`w-12 h-0.5 ${step < currentStep ? 'bg-brand-blue' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// --- Step 1: Role selection ---

function StepRole({ onSelect }: { onSelect: (role: Role) => void }) {
  return (
    <div>
      <h2 className="font-overpass font-bold text-xl text-brand-blue text-center mb-2">
        Crear cuenta
      </h2>
      <p className="text-sm text-gray-500 text-center mb-6">
        Seleccioná tu rol en la plataforma
      </p>
      <div className="grid grid-cols-1 gap-4">
        <button
          type="button"
          onClick={() => onSelect('TALLER')}
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
          onClick={() => onSelect('MARCA')}
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
    </div>
  )
}

// --- Step 2: Personal info ---

function StepPersonalInfo({
  onNext,
  onBack,
  defaultValues,
}: {
  onNext: (data: PersonalInfoData) => void
  onBack: () => void
  defaultValues?: Partial<PersonalInfoData>
}) {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<PersonalInfoData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: { terminos: false, ...defaultValues },
  })

  const terminosValue = watch('terminos')

  return (
    <div>
      <h2 className="font-overpass font-bold text-xl text-brand-blue text-center mb-2">
        Datos personales
      </h2>
      <p className="text-sm text-gray-500 text-center mb-6">
        Completá tu información personal
      </p>

      <form onSubmit={handleSubmit(onNext)} className="space-y-4">
        <div className="relative">
          <Input
            label="Nombre completo"
            placeholder="Juan Pérez"
            error={errors.nombre?.message}
            {...register('nombre')}
          />
          <User className="absolute right-3 top-[38px] w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

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
            label="Contraseña (mínimo 8 caracteres)"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <Lock className="absolute right-3 top-[38px] w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        <div className="relative">
          <Input
            label="Confirmar contraseña"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Lock className="absolute right-3 top-[38px] w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        <div className="relative">
          <Input
            label="Teléfono (opcional)"
            type="tel"
            placeholder="+54 11 1234-5678"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <Phone className="absolute right-3 top-[38px] w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        <label className={`flex items-start gap-3 cursor-pointer rounded-lg border p-3 transition-colors ${terminosValue ? 'border-brand-blue bg-blue-50/40' : 'border-gray-200'}`}>
          <input
            type="checkbox"
            className="mt-0.5 accent-[var(--color-brand-blue)]"
            {...register('terminos')}
          />
          <span className="text-sm text-gray-600">
            Acepto los{' '}
            <a href="/terminos" target="_blank" className="text-brand-blue font-semibold hover:underline">
              términos y condiciones
            </a>{' '}
            de la Plataforma Digital Textil
          </span>
        </label>
        {errors.terminos && (
          <p className="text-xs text-red-500 -mt-2">{errors.terminos.message}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onBack} icon={<ArrowLeft className="w-4 h-4" />} className="flex-1">
            Atrás
          </Button>
          <Button type="submit" icon={<ArrowRight className="w-4 h-4" />} className="flex-1">
            Siguiente
          </Button>
        </div>
      </form>
    </div>
  )
}

// --- Step 3: Role-specific info (Taller) ---

function StepTallerInfo({
  onSubmit,
  onBack,
  loading,
  defaultValues,
}: {
  onSubmit: (data: TallerInfoData) => void
  onBack: () => void
  loading: boolean
  defaultValues?: Partial<TallerInfoData>
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<TallerInfoData>({
    resolver: zodResolver(tallerInfoSchema),
    defaultValues,
  })

  return (
    <div>
      <h2 className="font-overpass font-bold text-xl text-brand-blue text-center mb-2">
        Datos del taller
      </h2>
      <p className="text-sm text-gray-500 text-center mb-6">
        Contanos sobre tu taller textil
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="relative">
          <Input
            label="Nombre del taller"
            placeholder="Taller La Costura"
            error={errors.nombreTaller?.message}
            {...register('nombreTaller')}
          />
          <Building2 className="absolute right-3 top-[38px] w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        <div className="relative">
          <Input
            label="CUIT"
            placeholder="20-12345678-9"
            error={errors.cuit?.message}
            {...register('cuit')}
          />
          <Hash className="absolute right-3 top-[38px] w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        <div className="relative">
          <Input
            label="Ubicación"
            placeholder="Ciudad, Provincia"
            error={errors.ubicacion?.message}
            {...register('ubicacion')}
          />
          <MapPin className="absolute right-3 top-[38px] w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        <div className="relative">
          <Input
            label="Capacidad mensual (prendas)"
            type="number"
            placeholder="500"
            error={errors.capacidadMensual?.message}
            {...register('capacidadMensual')}
          />
          <Factory className="absolute right-3 top-[38px] w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onBack} icon={<ArrowLeft className="w-4 h-4" />} className="flex-1">
            Atrás
          </Button>
          <Button type="submit" loading={loading} icon={<Check className="w-4 h-4" />} className="flex-1">
            Crear cuenta
          </Button>
        </div>
      </form>
    </div>
  )
}

// --- Step 3: Role-specific info (Marca) ---

function StepMarcaInfo({
  onSubmit,
  onBack,
  loading,
  defaultValues,
}: {
  onSubmit: (data: MarcaInfoData) => void
  onBack: () => void
  loading: boolean
  defaultValues?: Partial<MarcaInfoData>
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<MarcaInfoData>({
    resolver: zodResolver(marcaInfoSchema),
    defaultValues,
  })

  return (
    <div>
      <h2 className="font-overpass font-bold text-xl text-brand-blue text-center mb-2">
        Datos de la marca
      </h2>
      <p className="text-sm text-gray-500 text-center mb-6">
        Contanos sobre tu marca
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="relative">
          <Input
            label="Nombre de la marca"
            placeholder="Mi Marca"
            error={errors.nombreMarca?.message}
            {...register('nombreMarca')}
          />
          <ShoppingBag className="absolute right-3 top-[38px] w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        <div className="relative">
          <Input
            label="CUIT"
            placeholder="20-12345678-9"
            error={errors.cuit?.message}
            {...register('cuit')}
          />
          <Hash className="absolute right-3 top-[38px] w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        <div className="relative">
          <Input
            label="Ubicación"
            placeholder="Ciudad, Provincia"
            error={errors.ubicacion?.message}
            {...register('ubicacion')}
          />
          <MapPin className="absolute right-3 top-[38px] w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        <Select
          label="Tipo de empresa"
          placeholder="Seleccioná el tipo"
          error={errors.tipo?.message}
          options={[
            { value: 'Micro', label: 'Micro' },
            { value: 'Pequeña', label: 'Pequeña' },
            { value: 'Mediana', label: 'Mediana' },
            { value: 'Grande', label: 'Grande' },
          ]}
          {...register('tipo')}
        />

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onBack} icon={<ArrowLeft className="w-4 h-4" />} className="flex-1">
            Atrás
          </Button>
          <Button type="submit" loading={loading} icon={<Check className="w-4 h-4" />} className="flex-1">
            Crear cuenta
          </Button>
        </div>
      </form>
    </div>
  )
}

// --- Main page ---

export default function RegistroPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [step, setStep] = useState(1)
  const [role, setRole] = useState<Role | null>(null)

  // Pre-seleccionar rol si viene de la landing (?rol=TALLER o ?rol=MARCA)
  useEffect(() => {
    const rolParam = searchParams.get('rol')
    if (rolParam === 'TALLER' || rolParam === 'MARCA') {
      setRole(rolParam)
      setStep(2)
    }
  }, [searchParams])
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoData | null>(null)
  const [tallerInfo, setTallerInfo] = useState<TallerInfoData | null>(null)
  const [marcaInfo, setMarcaInfo] = useState<MarcaInfoData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleRoleSelect(selectedRole: Role) {
    setRole(selectedRole)
    setStep(2)
  }

  function handlePersonalInfoNext(data: PersonalInfoData) {
    setPersonalInfo(data)
    setStep(3)
  }

  async function handleTallerSubmit(data: TallerInfoData) {
    if (!personalInfo || !role) return
    setTallerInfo(data)
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: personalInfo.nombre,
          email: personalInfo.email,
          password: personalInfo.password,
          phone: personalInfo.phone || undefined,
          role,
          tallerData: {
            nombre: data.nombreTaller,
            cuit: data.cuit,
            ubicacion: data.ubicacion,
            capacidadMensual: Number(data.capacidadMensual),
          },
        }),
      })

      const body = await res.json()
      if (!res.ok) {
        setError(body.error || 'Error al crear la cuenta')
        setLoading(false)
        return
      }
      router.push('/login?registered=true')
    } catch {
      setError('Ocurrió un error inesperado. Intentá de nuevo.')
      setLoading(false)
    }
  }

  async function handleMarcaSubmit(data: MarcaInfoData) {
    if (!personalInfo || !role) return
    setMarcaInfo(data)
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: personalInfo.nombre,
          email: personalInfo.email,
          password: personalInfo.password,
          phone: personalInfo.phone || undefined,
          role,
          marcaData: {
            nombre: data.nombreMarca,
            cuit: data.cuit,
            ubicacion: data.ubicacion,
            tipo: data.tipo,
          },
        }),
      })

      const body = await res.json()
      if (!res.ok) {
        setError(body.error || 'Error al crear la cuenta')
        setLoading(false)
        return
      }
      router.push('/login?registered=true')
    } catch {
      setError('Ocurrió un error inesperado. Intentá de nuevo.')
      setLoading(false)
    }
  }

  return (
    <Card className="p-8">
      <StepIndicator currentStep={step} />

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {step === 1 && <StepRole onSelect={handleRoleSelect} />}

      {step === 2 && (
        <StepPersonalInfo
          onNext={handlePersonalInfoNext}
          onBack={() => setStep(1)}
          defaultValues={personalInfo ?? undefined}
        />
      )}

      {step === 3 && role === 'TALLER' && (
        <StepTallerInfo
          onSubmit={handleTallerSubmit}
          onBack={() => setStep(2)}
          loading={loading}
          defaultValues={tallerInfo ?? undefined}
        />
      )}

      {step === 3 && role === 'MARCA' && (
        <StepMarcaInfo
          onSubmit={handleMarcaSubmit}
          onBack={() => setStep(2)}
          loading={loading}
          defaultValues={marcaInfo ?? undefined}
        />
      )}

      <p className="mt-6 text-center text-sm text-gray-600">
        ¿Ya tenés cuenta?{' '}
        <Link href="/login" className="font-semibold text-brand-blue hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </Card>
  )
}
