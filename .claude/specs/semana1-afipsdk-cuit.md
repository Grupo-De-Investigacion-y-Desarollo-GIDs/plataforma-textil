# Spec: AfipSDK — Verificacion CUIT

- **Semana:** 1
- **Asignado a:** Gerardo
- **Dependencias:** AFIP_SDK_TOKEN y AFIP_SDK_ENV configurados en .env.local y Vercel (ya estan)

---

## 1. Contexto

El registro actual acepta cualquier CUIT sin verificar. Hay que conectar AfipSDK para que al ingresar el CUIT se consulte ARCA en tiempo real — si es invalido el registro se bloquea, si es valido se autocompletan los datos. El campo `verificadoAfip` existe en el modelo Taller pero nunca se setea en `true`. En el modelo Marca no existe — hay que agregarlo.

---

## 2. Que construir

- Funcion `verificarCuit()` que consulta AfipSDK
- El paso 3 del registro llama a la funcion al salir del campo CUIT
- Si el CUIT es invalido o inactivo en ARCA → mensaje de error, no avanza
- Si es valido → autocompleta razon social y domicilio en el formulario
- El backend bloquea el registro si el CUIT no pasa la verificacion
- Al crear el Taller/Marca, `verificadoAfip` se setea en `true`

---

## 3. Datos

**Migracion necesaria:** Agregar `verificadoAfip` al modelo Marca.

```prisma
// En el modelo Marca, agregar:
verificadoAfip    Boolean     @default(false)
```

Correr: `npx prisma migrate dev --name agregar_verificado_afip_marca`

El campo `verificadoAfip` ya existe en el modelo Taller (linea 181 del schema). No requiere cambio.

**Variable de entorno nueva:**

Agregar a `.env.local` y `.env.example`:
```
AFIP_CUIT_PLATAFORMA=XXXXXXXXXX
```

Valor provisorio: CUIT de Gerardo. Migrar a CUIT de UNTREF (30-68525606-8) antes del escalamiento.

Agregar a Vercel para todos los entornos.

---

## 4. Prescripciones tecnicas

### Paso previo — instalar dependencia

```bash
npm install @afipsdk/afip.js
```

### Nota critica — verificar response antes de implementar

Gerardo debe probar `getTaxpayerDetails` con el CUIT de UNTREF (30-68525606-8) en modo development antes de implementar. Ejecutar:

```javascript
const Afip = require('@afipsdk/afip.js')
const afip = new Afip({
  CUIT: process.env.AFIP_CUIT_PLATAFORMA,
  production: false,
  access_token: process.env.AFIP_SDK_TOKEN,
})
const data = await afip.RegisterScopeTen.getTaxpayerDetails(30685256068)
console.log(JSON.stringify(data, null, 2))
```

Verificar la estructura real del response y adaptar el mapeo de campos en `afip.ts`. Los campos pueden estar dentro de `datosGenerales` u otra estructura anidada.

### Archivo nuevo — `src/compartido/lib/afip.ts`

```typescript
import Afip from '@afipsdk/afip.js'

let _afip: InstanceType<typeof Afip> | null = null

function getAfip() {
  if (!_afip) {
    const cuit = process.env.AFIP_CUIT_PLATAFORMA
    const token = process.env.AFIP_SDK_TOKEN
    if (!cuit || !token) throw new Error('AFIP_CUIT_PLATAFORMA y AFIP_SDK_TOKEN son requeridos')
    _afip = new Afip({
      CUIT: cuit,
      production: process.env.AFIP_SDK_ENV === 'production',
      access_token: token,
    })
  }
  return _afip
}

export type AfipResult = {
  valid: boolean
  razonSocial?: string
  domicilio?: string
  esEmpleador?: boolean
  error?: string
}

export async function verificarCuit(cuit: string): Promise<AfipResult> {
  try {
    const cuitNumero = parseInt(cuit.replace(/-/g, ''))
    const data = await getAfip().RegisterScopeTen.getTaxpayerDetails(cuitNumero)

    // ADAPTAR ESTOS CAMPOS despues de verificar el response real (ver nota critica arriba)
    if (!data) {
      return { valid: false, error: 'CUIT inexistente en ARCA' }
    }

    // Verificar que el CUIT este activo
    // El campo exacto depende del response real — puede ser data.estadoClave o data.datosGenerales.estadoClave
    const estado = data.estadoClave ?? data.datosGenerales?.estadoClave
    if (estado && estado !== 'ACTIVO') {
      return { valid: false, error: 'CUIT inactivo en ARCA' }
    }

    return {
      valid: true,
      razonSocial: data.denominacion ?? data.datosGenerales?.denominacion,
      domicilio: data.domicilioFiscal?.direccion ?? data.datosGenerales?.domicilioFiscal?.direccion,
      esEmpleador: (data.indicadorEmpleador ?? data.datosGenerales?.indicadorEmpleador) === 'S',
    }
  } catch (err) {
    console.error('Error al verificar CUIT en ARCA:', err)
    return { valid: false, error: 'No se pudo verificar el CUIT. Intenta de nuevo.' }
  }
}
```

### Archivo nuevo — `src/app/api/auth/verificar-cuit/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { verificarCuit } from '@/compartido/lib/afip'

// GET /api/auth/verificar-cuit?cuit=XXXXXXXXXXX
// No requiere autenticacion — se usa durante el registro
// Rate limit implicito: AfipSDK plan Free tiene 1k requests/mes
export async function GET(req: NextRequest) {
  try {
    const cuit = req.nextUrl.searchParams.get('cuit')
    if (!cuit || cuit.replace(/-/g, '').length !== 11) {
      return NextResponse.json({ valid: false, error: 'CUIT invalido' }, { status: 400 })
    }
    const result = await verificarCuit(cuit)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ valid: false, error: 'Error interno' }, { status: 500 })
  }
}
```

### Archivo a modificar — `src/app/(auth)/registro/page.tsx`

En el paso 3, despues del campo CUIT:

- Estado local: `const [cuitVerificado, setCuitVerificado] = useState(false)`
- Estado local: `const [cuitData, setCuitData] = useState<{razonSocial?: string, domicilio?: string} | null>(null)`
- Estado local: `const [cuitLoading, setCuitLoading] = useState(false)`
- Estado local: `const [cuitError, setCuitError] = useState('')`
- Al hacer `onBlur` en el campo CUIT, si tiene formato valido (11 digitos):
  - `setCuitLoading(true)` → llamar a `GET /api/auth/verificar-cuit?cuit=X`
  - Si `valid: true` → `setCuitVerificado(true)`, `setCuitData({razonSocial, domicilio})`, mostrar badge verde "Verificado en ARCA" con razon social
  - Si `valid: false` → `setCuitError(result.error)`, `setCuitVerificado(false)`
- El boton "Crear cuenta" del paso 3 solo se habilita si `cuitVerificado === true`
- Si AfipSDK no responde (error de red) → mostrar advertencia amarilla "No se pudo verificar", permitir continuar (no bloquear)

### Archivo a modificar — `src/app/api/auth/registro/route.ts`

Agregar verificacion server-side antes de crear el usuario (despues de la validacion Zod):

```typescript
import { verificarCuit } from '@/compartido/lib/afip'

// Despues de const data = parsed.data:
const cuitToVerify = data.tallerData?.cuit || data.marcaData?.cuit
if (cuitToVerify) {
  const afipResult = await verificarCuit(cuitToVerify)
  if (!afipResult.valid) {
    return NextResponse.json(
      { error: afipResult.error || 'CUIT invalido o inactivo en ARCA' },
      { status: 400 }
    )
  }
}
```

En el create de Taller (lineas 70-81), agregar:

```typescript
verificadoAfip: true,
```

En el create de Marca (lineas 82-93), agregar:

```typescript
verificadoAfip: true,
```

---

## 5. Casos borde

- **CUIT invalido** (no existe en ARCA) → mensaje "CUIT inexistente en ARCA", boton bloqueado
- **CUIT con estado INACTIVO** en ARCA → mensaje "CUIT inactivo en ARCA", boton bloqueado
- **AfipSDK no responde** (timeout/error de red) → mensaje amarillo "No se pudo verificar", permitir continuar con advertencia. El backend tambien intenta verificar — si falla, deja pasar con `verificadoAfip: false`
- **CUIT ya registrado en la plataforma** → el check de Prisma P2002 ya maneja esto con mensaje "El CUIT ingresado ya esta registrado"
- **CUIT de marca ingresado como taller** → se acepta, el rol lo define el usuario no el CUIT
- **Plan Free agotado** (1k requests/mes) → mismo comportamiento que timeout, advertencia sin bloqueo

---

## 6. Criterio de aceptacion

- [ ] `npm install @afipsdk/afip.js` completado, package.json actualizado
- [ ] `AFIP_CUIT_PLATAFORMA` configurado en `.env.local`, `.env.example` y Vercel
- [ ] Migracion `agregar_verificado_afip_marca` ejecutada sin errores
- [ ] `src/compartido/lib/afip.ts` existe y exporta `verificarCuit()`
- [ ] `GET /api/auth/verificar-cuit?cuit=30685256068` retorna `{ valid: true, razonSocial: "UNIVERSIDAD NACIONAL DE TRES DE FEBRERO" }`
- [ ] Al ingresar CUIT valido en el registro → aparece razon social con badge verde "Verificado en ARCA"
- [ ] Al ingresar CUIT invalido → mensaje de error rojo, boton "Crear cuenta" deshabilitado
- [ ] Si AfipSDK no responde → advertencia amarilla, se puede continuar
- [ ] El backend rechaza el registro si el CUIT no pasa verificacion (400)
- [ ] `verificadoAfip` queda en `true` para talleres y marcas registrados con CUIT valido
- [ ] Build pasa sin errores

---

## 7. Tests (verificacion manual)

1. Ejecutar script de prueba con CUIT de UNTREF (30-68525606-8) → verificar estructura del response y adaptar mapeo
2. Registrar taller con CUIT valido → debe autocompletar razon social con badge verde
3. Registrar taller con CUIT invalido (20-00000000-0) → debe mostrar error y bloquear
4. Desconectar internet y registrar → debe mostrar advertencia amarilla y dejar continuar
5. Verificar en Supabase que `verificadoAfip = true` despues del registro exitoso (tanto en taller como en marca)
6. Verificar que `GET /api/auth/verificar-cuit` sin parametro retorna 400
