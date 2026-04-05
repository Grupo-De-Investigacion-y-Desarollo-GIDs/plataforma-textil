# Spec: Registro rediseñado — 3 pasos

- **Semana:** 1
- **Asignado a:** Sergio
- **Dependencias:** semana1-afipsdk-cuit (Gerardo debe haber mergeado primero)

---

## ANTES DE ARRANCAR

Verificar que estos commits estan en develop antes de tocar codigo:

- [ ] semana1-infra-contenido (Gerardo) — commit con mensaje `feat: agregar rol CONTENIDO`
- [ ] semana1-afipsdk-cuit (Gerardo) — commit con mensaje `feat: integrar AfipSDK`

Si no estan mergeados, NO arrancar. Avisarle a Gerardo.

---

## 1. Contexto

El registro actual tiene 3 pasos pero el paso 1 (elegir rol) es redundante porque la landing ya manda con `?rol=` en la URL. Hay que simplificar el flujo, integrar la verificacion AfipSDK del spec anterior y agregar auto-login post-registro. El objetivo es que un taller pueda registrarse en menos de 3 minutos desde el celular.

---

## 2. Que construir

- El registro arranca directo en paso 1 (datos personales) si viene con `?rol=` desde la landing
- Si no viene con `?rol=`, muestra la seleccion de rol como paso 0 (mantener compatibilidad)
- **Paso 1** — datos personales: nombre, email, password, confirmPassword, phone (opcional), checkbox terminos
- **Paso 2** — datos de la entidad (componente unificado para taller y marca): nombre taller/marca + campo CUIT con verificacion AfipSDK en tiempo real
  - Al ingresar CUIT valido: badge verde "Verificado por ARCA" + autocomplete razon social
  - Al ingresar CUIT invalido: mensaje de error rojo, boton bloqueado
- Post-registro exitoso: auto-login automatico → redirect al dashboard segun rol
- Fallback: si auto-login falla → redirect a `/login?registered=true`

**Marca ya no pide ubicacion ni tipo en el registro.** Esos campos se completan despues en `/marca/perfil` (la pagina ya existe y permite editarlos). En un spec posterior se implementara un modal de primer uso que invite a la marca a completar su perfil la primera vez que intente contactar un taller.

---

## 3. Datos

- No hay cambios de schema — todo viene del spec semana1-afipsdk-cuit
- El payload al API no cambia estructuralmente: `{ nombre, email, password, phone?, role, tallerData o marcaData }`
- Para marca, el payload ahora manda solo `{ nombre, cuit }` sin ubicacion ni tipo — la API ya los acepta como null (son `.optional().nullable()` en el schema server-side)
- El campo `verificadoAfip` lo setea la API, no el frontend

---

## 4. Prescripciones tecnicas

### Archivo a modificar — `src/app/(auth)/registro/page.tsx`

#### Cambio 1 — logica de pasos

Reemplazar la inicializacion actual de `step` y `role`:

```typescript
const rolParam = searchParams.get('rol')
const [step, setStep] = useState(
  rolParam === 'TALLER' || rolParam === 'MARCA' ? 1 : 0
)
const [role, setRole] = useState<'TALLER' | 'MARCA' | null>(
  rolParam === 'TALLER' ? 'TALLER' : rolParam === 'MARCA' ? 'MARCA' : null
)
```

Eliminar el `useEffect` que lee `searchParams` — ya no es necesario porque la logica esta en el `useState` inicial.

Los pasos quedan:
- **Paso 0** (solo si no viene `?rol=`): seleccion de rol → al elegir, setea role y avanza a paso 1
- **Paso 1**: datos personales (componente `StepPersonalInfo` existente, sin cambios)
- **Paso 2**: datos de entidad (componente nuevo `StepEntidadInfo`)

#### Cambio 2 — adaptar StepIndicator

Modificar `StepIndicator` para recibir el total de pasos:

```typescript
function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1)
  // ... misma logica de render, usando steps dinamico
}
```

Uso en el render:
- Si viene con `?rol=` (paso 0 salteado): `<StepIndicator currentStep={step} totalSteps={2} />`
- Si no viene con `?rol=`: `<StepIndicator currentStep={step} totalSteps={3} />`

Implementar asi:

```typescript
const totalSteps = rolParam ? 2 : 3
// El currentStep para el indicador es step si no hay rolParam, o step - 1 si hay rolParam
// (porque paso 1 es el primer paso visible cuando hay rolParam)
const displayStep = rolParam ? step : step
```

Nota: cuando `rolParam` existe, `step` va de 1 a 2 (2 pasos visibles). Cuando no existe, `step` va de 0 a 2 (3 pasos visibles). Para el indicador visual:
- Con `rolParam`: paso 1 → circulo 1 activo, paso 2 → circulo 2 activo
- Sin `rolParam`: paso 0 → circulo 1 activo, paso 1 → circulo 2 activo, paso 2 → circulo 3 activo

Calcular el display step asi:

```typescript
const indicatorStep = rolParam ? step : step + 1
```

Pasar a StepIndicator: `<StepIndicator currentStep={indicatorStep} totalSteps={totalSteps} />`

#### Cambio 3 — componente unificado StepEntidadInfo

Eliminar los componentes `StepTallerInfo` y `StepMarcaInfo`. Crear un unico componente `StepEntidadInfo` en el mismo archivo:

```typescript
const entidadInfoSchema = z.object({
  nombreEntidad: z.string().min(1, 'El nombre es obligatorio'),
  cuit: z.string().refine(validarCuit, 'El CUIT debe tener 11 digitos (ej: 20-12345678-9)'),
})

type EntidadInfoData = z.infer<typeof entidadInfoSchema>

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
  const [cuitLoading, setCuitLoading] = useState(false)
  const [cuitData, setCuitData] = useState<{ razonSocial?: string } | null>(null)
  const [cuitError, setCuitError] = useState('')

  const cuitValue = watch('cuit')

  async function verificarCuitOnBlur() {
    const limpio = (cuitValue || '').replace(/-/g, '')
    if (limpio.length !== 11) return

    setCuitLoading(true)
    setCuitError('')
    setCuitData(null)
    setCuitVerificado(false)

    try {
      const res = await fetch(`/api/auth/verificar-cuit?cuit=${limpio}`)
      const data = await res.json()
      if (data.valid) {
        setCuitVerificado(true)
        setCuitData({ razonSocial: data.razonSocial })
      } else {
        setCuitError(data.error || 'CUIT invalido')
      }
    } catch {
      // AfipSDK no responde — advertencia sin bloqueo
      setCuitError('')
      setCuitVerificado(true) // permitir continuar
      setCuitData(null)
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
      <h2 className="font-overpass font-bold text-xl text-brand-blue text-center mb-2">
        {titulo}
      </h2>
      <p className="text-sm text-gray-500 text-center mb-6">
        {subtitulo}
      </p>

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
          {cuitLoading && (
            <p className="text-xs text-gray-400 mt-1">Verificando CUIT en ARCA...</p>
          )}
          {cuitVerificado && cuitData?.razonSocial && (
            <div className="flex items-center gap-1.5 mt-1">
              <Check className="w-3.5 h-3.5 text-green-600" />
              <span className="text-xs text-green-700 font-semibold">Verificado por ARCA</span>
              <span className="text-xs text-gray-500">— {cuitData.razonSocial}</span>
            </div>
          )}
          {cuitVerificado && !cuitData?.razonSocial && (
            <p className="text-xs text-amber-600 mt-1">
              No se pudo verificar en ARCA. Podes continuar igualmente.
            </p>
          )}
          {cuitError && (
            <p className="text-xs text-red-500 mt-1">{cuitError}</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={() => onBack(getValues())} icon={<ArrowLeft className="w-4 h-4" />} className="flex-1">
            Atras
          </Button>
          <Button type="submit" loading={loading} disabled={!cuitVerificado && !cuitLoading} icon={<Check className="w-4 h-4" />} className="flex-1">
            Crear cuenta
          </Button>
        </div>
      </form>
    </div>
  )
}
```

Nota: el `cuitError` inline del campo se muestra via el prop `error` del Input. Si el componente Input ya muestra `errors.cuit?.message` de Zod, el `cuitError` del API se muestra separado debajo. Verificar que no se dupliquen mensajes — si Zod muestra error de formato, no llamar a `verificarCuitOnBlur`.

#### Cambio 4 — handlers de submit unificados

Reemplazar `handleTallerSubmit` y `handleMarcaSubmit` con un unico handler:

```typescript
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
      setError(body.error || 'Error al crear la cuenta')
      setLoading(false)
      return
    }

    // Auto-login
    const loginResult = await signIn('credentials', {
      email: personalInfo.email,
      password: personalInfo.password,
      redirect: false,
    })

    if (loginResult?.ok) {
      router.push(role === 'TALLER' ? '/taller' : '/marca/directorio')
      router.refresh()
    } else {
      router.push('/login?registered=true')
    }
  } catch {
    setError('Ocurrio un error inesperado. Intenta de nuevo.')
    setLoading(false)
  }
}
```

Reemplazar los states `tallerInfo` y `marcaInfo` por un unico `entidadInfo`:

```typescript
const [entidadInfo, setEntidadInfo] = useState<EntidadInfoData | null>(null)
```

Eliminar los schemas `tallerInfoSchema`, `marcaInfoSchema` y sus types.

#### Cambio 5 — importar signIn

Agregar al bloque de imports:

```typescript
import { signIn } from 'next-auth/react'
```

#### Cambio 6 — render del paso 2

Reemplazar los dos bloques condicionales de paso 3 (taller y marca) con uno solo para paso 2:

```typescript
{step === 2 && role && (
  <StepEntidadInfo
    role={role}
    onSubmit={handleEntidadSubmit}
    onBack={(current) => { setEntidadInfo(prev => ({ ...prev, ...current } as EntidadInfoData)); setStep(1) }}
    loading={loading}
    defaultValues={entidadInfo ?? undefined}
  />
)}
```

#### Cambio 7 — ajustar navegacion de StepPersonalInfo

El boton "Atras" de `StepPersonalInfo` debe volver a paso 0 (si no habia `?rol=`):

```typescript
{step === 1 && (
  <StepPersonalInfo
    onNext={handlePersonalInfoNext}
    onBack={() => setStep(0)}
    defaultValues={personalInfo ?? undefined}
  />
)}
```

Si `step` baja a 0 y hay `rolParam`, el paso 0 no se renderiza — agregar guarda:

```typescript
// El boton "Atras" de paso 1 solo aparece si no hay rolParam
// Modificar StepPersonalInfo para recibir showBack prop
```

Pasar `showBack={!rolParam}` a `StepPersonalInfo` y condicionar el boton "Atras" con ese prop. Si `showBack` es false, el boton no se renderiza y el layout usa un solo boton "Siguiente" a ancho completo.

---

## 5. Casos borde

- **Usuario llega a `/registro` sin `?rol=`** → ve seleccion de rol primero (paso 0), indicador muestra 3 pasos
- **Usuario llega a `/registro?rol=TALLER`** → arranca en paso 1 directo, indicador muestra 2 pasos, sin boton "Atras" en paso 1
- **CUIT invalido** → boton "Crear cuenta" deshabilitado, no puede avanzar
- **AfipSDK no responde** → advertencia amarilla "No se pudo verificar en ARCA. Podes continuar igualmente.", permite continuar con `cuitVerificado = true`
- **Auto-login falla** → redirect a `/login?registered=true` con mensaje de exito existente
- **CUIT ya registrado** → mensaje "El CUIT ingresado ya esta registrado" (ya existe en la API, mantener)
- **Email ya registrado** → mensaje existente, mantener
- **Marca registrada sin ubicacion ni tipo** → quedan null en la DB. Las vistas existentes (`/perfil-marca/[id]`, `/admin/marcas/[id]`, `/marca/perfil`) ya manejan null con `?? '—'` o condicionales. La marca los completa despues en `/marca/perfil`. El modal de primer uso que invite a completar el perfil se implementa en un spec posterior — no es parte de este spec.

---

## 6. Criterio de aceptacion

- [ ] Llegar a `/registro?rol=TALLER` arranca en paso 1 sin mostrar seleccion de rol, indicador muestra 2 pasos
- [ ] Llegar a `/registro` sin parametros muestra seleccion de rol, indicador muestra 3 pasos
- [ ] En paso 1 con `?rol=`, no hay boton "Atras"
- [ ] En paso 1 sin `?rol=`, hay boton "Atras" que vuelve a seleccion de rol
- [ ] CUIT valido muestra badge verde "Verificado por ARCA" y razon social autocompletada
- [ ] CUIT invalido muestra error rojo y bloquea el boton "Crear cuenta"
- [ ] Si AfipSDK no responde, muestra advertencia amarilla y permite continuar
- [ ] Registro exitoso loguea automaticamente y redirige al dashboard segun rol
- [ ] Si auto-login falla, redirige a `/login?registered=true`
- [ ] Marca no pide ubicacion ni tipo en el registro
- [ ] El componente `StepEntidadInfo` se usa tanto para taller como para marca
- [ ] Los componentes `StepTallerInfo` y `StepMarcaInfo` fueron eliminados
- [ ] Build pasa sin errores

---

## 7. Tests (verificacion manual)

1. Entrar a `/registro?rol=TALLER` → debe arrancar en paso 1, indicador de 2 pasos, sin boton "Atras"
2. Entrar a `/registro` → debe mostrar seleccion de rol, indicador de 3 pasos
3. Completar registro taller con CUIT de UNTREF (30-68525606-8) → debe mostrar badge verde con razon social
4. Completar registro exitoso → debe quedar logueado y llegar a `/taller` sin pasar por login
5. Completar registro marca exitoso → debe quedar logueado y llegar a `/marca/directorio`
6. Registrar con CUIT duplicado → debe mostrar mensaje de error claro
7. Registrar marca → no debe pedir ubicacion ni tipo
8. Simular fallo de AfipSDK (cortar red) → debe mostrar advertencia amarilla y dejar continuar
9. Simular fallo de auto-login → debe redirigir a `/login?registered=true`
