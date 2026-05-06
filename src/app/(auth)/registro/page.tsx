'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn } from 'next-auth/react'
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
  Factory,
  Hash,
} from 'lucide-react'
import { Input } from '@/compartido/componentes/ui/input'
import { Button } from '@/compartido/componentes/ui/button'
import { Card } from '@/compartido/componentes/ui/card'

type Role = 'TALLER' | 'MARCA'

function validarCuit(val: string) {
  const limpio = val.replace(/-/g, '')
  return /^\d{11}$/.test(limpio)
}

// --- Zod schemas ---

const personalInfoSchema = z
  .object({
    nombre: z.string().min(1, 'El nombre es obligatorio'),
    email: z.string().min(1, 'El email es obligatorio').email('Ingresa un email valido'),
    password: z.string().min(8, 'La contrasena debe tener al menos 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirma tu contrasena'),
    phone: z.string().optional(),
    terminos: z.boolean().refine(v => v === true, 'Debes aceptar los terminos y condiciones'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contrasenas no coinciden',
    path: ['confirmPassword'],
  })

const entidadInfoSchema = z.object({
  nombreEntidad: z.string().min(1, 'El nombre es obligatorio'),
  cuit: z.string().refine(validarCuit, 'El CUIT debe tener 11 digitos (ej: 20-12345678-9)'),
})

type PersonalInfoData = z.infer<typeof personalInfoSchema>
type EntidadInfoData = z.infer<typeof entidadInfoSchema>

// --- Step indicator ---

function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1)
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

// --- Step 0: Role selection ---

function StepRole({ onSelect }: { onSelect: (role: Role) => void }) {
  return (
    <div>
      <h2 className="font-overpass font-bold text-xl text-brand-blue text-center mb-2">
        Crear cuenta
      </h2>
      <p className="text-sm text-gray-500 text-center mb-6">
        Selecciona tu rol en la plataforma
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

// --- Step 1: Personal info ---

function StepPersonalInfo({
  onNext,
  onBack,
  showBack,
  defaultValues,
  loading,
}: {
  onNext: (data: PersonalInfoData) => void
  onBack: () => void
  showBack: boolean
  defaultValues?: Partial<PersonalInfoData>
  loading?: boolean
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
        Completa tu informacion personal
      </p>

      <form onSubmit={handleSubmit(onNext)} className="space-y-4">
        <div className="relative">
          <Input label="Nombre completo" placeholder="Juan Perez" error={errors.nombre?.message} {...register('nombre')} />
          <User className="absolute right-3 top-[38px] w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <Input label="Email" type="email" placeholder="tu@email.com" error={errors.email?.message} {...register('email')} />
          <Mail className="absolute right-3 top-[38px] w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <Input label="Contrasena (minimo 8 caracteres)" type="password" placeholder="........" error={errors.password?.message} {...register('password')} />
          <Lock className="absolute right-3 top-[38px] w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <Input label="Confirmar contrasena" type="password" placeholder="........" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
          <Lock className="absolute right-3 top-[38px] w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <Input label="Telefono WhatsApp (opcional)" type="tel" placeholder="Ej: 11 2345 6789" error={errors.phone?.message} {...register('phone')} />
          <p className="text-xs text-gray-400 mt-1 ml-1">Te enviamos avisos importantes por WhatsApp (pedidos, aprobaciones)</p>
          <Phone className="absolute right-3 top-[38px] w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        <label className={`flex items-start gap-3 cursor-pointer rounded-lg border p-3 transition-colors ${terminosValue ? 'border-brand-blue bg-blue-50/40' : 'border-gray-200'}`}>
          <input type="checkbox" className="mt-0.5 accent-[var(--color-brand-blue)]" {...register('terminos')} />
          <span className="text-sm text-gray-600">
            Acepto los{' '}
            <a href="/terminos" target="_blank" className="text-brand-blue font-semibold hover:underline">terminos y condiciones</a>
            {' '}de la Plataforma Digital Textil
          </span>
        </label>
        {errors.terminos && <p className="text-xs text-red-500 -mt-2">{errors.terminos.message}</p>}

        <div className="flex gap-3 pt-2">
          {showBack && (
            <Button type="button" variant="secondary" onClick={onBack} icon={<ArrowLeft className="w-4 h-4" />} className="flex-1">
              Atras
            </Button>
          )}
          <Button type="submit" loading={loading} icon={<ArrowRight className="w-4 h-4" />} className="flex-1">
            Siguiente
          </Button>
        </div>
      </form>
    </div>
  )
}

// --- Step 2: Entity info (unified for taller and marca) ---

function StepEntidadInfo({
  role,
  onSubmit,
  onBack,
  loading,
  defaultValues,
}: {
  role: 'TALLER' | 'MARCA'
  onSubmit: (data: EntidadInfoData) => void
  onBack: (current: Partial<EntidadInfoData>) => void
  loading: boolean
  defaultValues?: Partial<EntidadInfoData>
}) {
  const { register, handleSubmit, getValues, watch, formState: { errors } } = useForm<EntidadInfoData>({
    resolver: zodResolver(entidadInfoSchema),
    defaultValues,
  })

  const [cuitVerificado, setCuitVerificado] = useState(false)
  const [cuitPendiente, setCuitPendiente] = useState(false)
  const [cuitLoading, setCuitLoading] = useState(false)
  const [cuitData, setCuitData] = useState<{ razonSocial?: string } | null>(null)
  const [cuitError, setCuitError] = useState('')

  const cuitValue = watch('cuit')

  // Errores que indican que el CUIT es realmente invalido (no que el servicio fallo)
  const ERRORES_CUIT_INVALIDO = ['inexistente', 'inactivo', 'invalido']

  async function verificarCuitOnBlur() {
    const limpio = (cuitValue || '').replace(/-/g, '')
    if (limpio.length !== 11) return

    setCuitLoading(true)
    setCuitError('')
    setCuitData(null)
    setCuitVerificado(false)
    setCuitPendiente(false)

    try {
      const res = await fetch(`/api/auth/verificar-cuit?cuit=${limpio}`)
      const data = await res.json()
      if (data.valid) {
        setCuitVerificado(true)
        setCuitData({ razonSocial: data.razonSocial })
      } else {
        const errorMsg = (typeof data.error === 'string' ? data.error : data.error?.message || '').toLowerCase()
        const esCuitInvalido = ERRORES_CUIT_INVALIDO.some(e => errorMsg.includes(e))
        if (esCuitInvalido) {
          setCuitError(typeof data.error === 'string' ? data.error : data.error?.message || 'CUIT invalido')
        } else {
          // Servicio no disponible — permitir continuar
          setCuitPendiente(true)
        }
      }
    } catch {
      // Error de red — permitir continuar
      setCuitPendiente(true)
    } finally {
      setCuitLoading(false)
    }
  }

  const titulo = role === 'TALLER' ? 'Datos del taller' : 'Datos de la marca'
  const subtitulo = role === 'TALLER' ? 'Contanos sobre tu taller textil' : 'Contanos sobre tu marca'
  const placeholderNombre = role === 'TALLER' ? 'Taller La Costura' : 'Mi Marca'
  const IconoNombre = role === 'TALLER' ? Building2 : ShoppingBag

  return (
    <div>
      <h2 className="font-overpass font-bold text-xl text-brand-blue text-center mb-2">{titulo}</h2>
      <p className="text-sm text-gray-500 text-center mb-6">{subtitulo}</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="relative">
          <Input
            label={role === 'TALLER' ? 'Nombre del taller' : 'Nombre de la marca'}
            placeholder={placeholderNombre}
            error={errors.nombreEntidad?.message}
            {...register('nombreEntidad')}
          />
          <IconoNombre className="absolute right-3 top-[38px] w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        <div className="relative">
          <Input
            label="CUIT"
            placeholder="20-12345678-9"
            error={errors.cuit?.message || cuitError}
            {...register('cuit')}
            onBlur={verificarCuitOnBlur}
          />
          <Hash className="absolute right-3 top-[38px] w-4 h-4 text-gray-400 pointer-events-none" />
          {cuitLoading && <p className="text-xs text-gray-400 mt-1">Verificando CUIT en ARCA...</p>}
          {cuitVerificado && cuitData?.razonSocial && (
            <div className="flex items-center gap-1.5 mt-1">
              <Check className="w-3.5 h-3.5 text-green-600" />
              <span className="text-xs text-green-700 font-semibold">Verificado por ARCA</span>
              <span className="text-xs text-gray-500">— {cuitData.razonSocial}</span>
            </div>
          )}
          {cuitPendiente && (
            <p className="text-xs text-amber-600 mt-1">
              No pudimos verificar tu CUIT en este momento. Podes continuar pero tu perfil quedara pendiente de verificacion.
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={() => onBack(getValues())} icon={<ArrowLeft className="w-4 h-4" />} className="flex-1">
            Atras
          </Button>
          <Button type="submit" loading={loading} disabled={!cuitVerificado && !cuitPendiente && !cuitLoading} icon={<Check className="w-4 h-4" />} className="flex-1">
            Crear cuenta
          </Button>
        </div>
      </form>
    </div>
  )
}

// --- Main page ---

function RegistroContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rolParam = searchParams.get('rol')

  const [step, setStep] = useState(
    rolParam === 'TALLER' || rolParam === 'MARCA' ? 1 : 0
  )
  const [role, setRole] = useState<Role | null>(
    rolParam === 'TALLER' ? 'TALLER' : rolParam === 'MARCA' ? 'MARCA' : null
  )
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoData | null>(null)
  const [entidadInfo, setEntidadInfo] = useState<EntidadInfoData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkingEmail, setCheckingEmail] = useState(false)

  const totalSteps = rolParam ? 2 : 3
  const indicatorStep = rolParam ? step : step + 1

  function handleRoleSelect(selectedRole: Role) {
    setRole(selectedRole)
    setStep(1)
  }

  async function handlePersonalInfoNext(data: PersonalInfoData) {
    setError(null)
    setCheckingEmail(true)
    try {
      const res = await fetch(`/api/auth/verificar-email?email=${encodeURIComponent(data.email)}`)
      const body = await res.json()
      if (!body.disponible) {
        setError('El email ya esta registrado. Si ya tenes cuenta, podes iniciar sesion.')
        return
      }
    } catch {
      // Si falla la verificacion, dejamos continuar — el API de registro lo atrapara
    } finally {
      setCheckingEmail(false)
    }
    setPersonalInfo(data)
    setStep(2)
  }

  async function handleEntidadSubmit(data: EntidadInfoData) {
    if (!personalInfo || !role) return
    setEntidadInfo(data)
    setError(null)
    setLoading(true)

    try {
      const entidadPayload = { nombre: data.nombreEntidad, cuit: data.cuit }
      const res = await fetch('/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: personalInfo.nombre,
          email: personalInfo.email,
          password: personalInfo.password,
          phone: personalInfo.phone || undefined,
          role,
          ...(role === 'TALLER' ? { tallerData: entidadPayload } : { marcaData: entidadPayload }),
        }),
      })

      const body = await res.json()
      if (!res.ok) {
        setError(typeof body.error === 'string' ? body.error : body.error?.message || 'Error al crear la cuenta')
        setLoading(false)
        return
      }

      const loginResult = await signIn('credentials', {
        email: personalInfo.email,
        password: personalInfo.password,
        redirect: false,
      })

      if (loginResult?.ok) {
        router.push(role === 'TALLER' ? '/taller' : '/marca')
        router.refresh()
      } else {
        router.push('/login?registered=true')
      }
    } catch {
      setError('Ocurrio un error inesperado. Intenta de nuevo.')
      setLoading(false)
    }
  }

  return (
    <Card className="p-8">
      <StepIndicator currentStep={indicatorStep} totalSteps={totalSteps} />

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {step === 0 && <StepRole onSelect={handleRoleSelect} />}

      {step === 1 && (
        <StepPersonalInfo
          onNext={handlePersonalInfoNext}
          onBack={() => setStep(0)}
          showBack={!rolParam}
          defaultValues={personalInfo ?? undefined}
          loading={checkingEmail}
        />
      )}

      {step === 2 && role && (
        <StepEntidadInfo
          role={role}
          onSubmit={handleEntidadSubmit}
          onBack={(current) => { setEntidadInfo(prev => ({ ...prev, ...current } as EntidadInfoData)); setStep(1) }}
          loading={loading}
          defaultValues={entidadInfo ?? undefined}
        />
      )}

      <p className="mt-6 text-center text-sm text-gray-600">
        ¿Ya tenes cuenta?{' '}
        <Link href="/login" className="font-semibold text-brand-blue hover:underline">
          Iniciar sesion
        </Link>
      </p>
    </Card>
  )
}

export default function RegistroPage() {
  return (
    <Suspense>
      <RegistroContent />
    </Suspense>
  )
}
