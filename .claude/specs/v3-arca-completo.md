# Spec: Integracion completa con ARCA/AFIP

- **Version:** V3
- **Origen:** V3_BACKLOG INT-01 + INT-02 (unificados)
- **Asignado a:** Gerardo
- **Prioridad:** Alta — pieza institucional clave: datos verificados por el Estado, no autodeclarados

---

## ANTES DE ARRANCAR

- [ ] V3_BACKLOG I-01 mergeado (ambientes separados)
- [ ] V3_BACKLOG D-01 mergeado (ESTADO valida documentos)
- [ ] Decision tomada: contratar plan Pro de AfipSDK ($25/mes) o equivalente
- [ ] **Confirmar con soporte AfipSDK antes del deploy:** el plan Pro ($25/mes) dice "10 CUITs/mes" y "10.000 requests/mes". Necesitamos saber que significa exactamente "10 CUITs": si son 10 CUITs **distintos** por mes, el plan Pro NO alcanza para 25 talleres del piloto y hay que contratar Growth ($80/mes). Si son 10 consultas unicas con repetidas que no cuentan, puede alcanzar. Si el limite de 10 CUITs aplica solo a la API REST y no al SDK SOAP directo, tampoco aplica. **Blocker:** no deployar sin esta confirmacion.
- [ ] Soporte de AfipSDK respondio sobre el endpoint correcto (ticket del 21/04/2026)
- [ ] Primera consulta exitosa con plan Pro para validar la estructura real del response (los campos en `afip.ts:38-48` estan marcados como "ADAPTAR" — no han sido verificados con un response real)

---

## 1. Contexto

**Estado actual (cerrado V2 con fix defensivo):**

1. **AfipSDK intermitente** — el SDK habla SOAP directo con `aws.afip.gov.ar` y funciona cuando AFIP esta arriba. El incidente del 21/04/2026 donde la API devolvia HTML probablemente era del proxy REST de AfipSDK (no del SDK directo). El codigo actual en `afip.ts:30` usa el SDK SOAP correctamente.
2. **Solo verificamos existencia del CUIT** — el helper `verificarCuit()` en `afip.ts` retorna `{ valid, razonSocial, domicilio, esEmpleador }` pero no trae tipo de inscripcion, actividades AFIP, ni empleados de SIPA. Todo eso es autodeclarado.
3. **Plan Free agotado** — cuota insuficiente para 25 talleres en piloto real.
4. **Trazabilidad confusa** — los talleres con `verificadoAfip: false` se mezclan con los verificados, sin diferenciacion visual clara.

**Lo que OIT necesita y hoy no tenemos:**

La diferenciacion entre **dato autodeclarado** (lo que el taller dice) y **dato verificado por el Estado** (lo que ARCA confirma). Esta diferenciacion es el corazon de la propuesta de valor de la plataforma:

- Si un taller dice "tengo monotributo activo", el ESTADO necesita poder confirmarlo automaticamente
- Si un taller dice "tengo 5 empleados registrados", el ESTADO debe poder ver los empleados reales en SIPA
- Si un taller dice "estoy inscripto en IVA", ARCA es la unica fuente de verdad

Sin esto la plataforma no agrega valor sobre un directorio web cualquiera.

**Lo que vamos a hacer en V3:**

Resolver los dos problemas tecnicos (INT-02) y simultaneamente expandir la integracion (INT-01). Hacer ambos juntos porque tienen la misma raiz: un cliente AfipSDK que funcione bien y traiga mas datos.

---

## 2. Que construir

1. **Ampliar el helper existente `verificarCuit()`** — o crear `consultarPadron()` paralelo que retorne todos los campos de `DatosArca`
2. **Cliente robusto `arca.ts`** — encapsula toda la logica de consulta a ARCA con cache, retry y fallback
3. **Pre-carga automatica al registrarse** — el flujo actual ya llama `verificarCuit()`, ampliar para que traiga datos completos
4. **Sincronizacion periodica** — actualizar datos de ARCA cada 30 dias para talleres activos
5. **Visualizacion con badges** — el taller, ESTADO y admin ven que dato es verificado vs autodeclarado
6. **Re-verificacion manual desde ESTADO** — boton para forzar re-consulta cuando ARCA estaba caida

---

## 3. Datos a obtener de ARCA

### 3.1 — El SDK y sus variantes

> **Importante:** el proyecto usa `@afipsdk/afip.js@1.2.3` que habla **SOAP directo** con los servidores de AFIP (`aws.afip.gov.ar`). NO usa la API REST de AfipSDK (proxy HTTP en `api.afipsdk.com`). El incidente de V2 donde se recibia HTML probablemente era del proxy REST, no del SDK directo.

El SDK tiene 4 variantes de padron, cada una con distinto nivel de detalle:

| Clase SDK | Servicio AFIP | Datos que trae | Uso |
|-----------|--------------|----------------|-----|
| `RegisterScopeFour` | `ws_sr_padron_a4` | Mas completo: datos generales, actividades, domicilios, regimenes, relaciones | Si se necesita todo |
| `RegisterScopeFive` | `ws_sr_padron_a5` | **Deprecated** — no usar | Eliminado en futuras versiones |
| `RegisterScopeTen` | `ws_sr_padron_a10` | Basico: datos generales, estado, denominacion | Uso actual |
| `RegisterScopeThirteen` | `ws_sr_padron_a13` | Intermedio: mas datos que A10, menos que A4 | Alternativa |

**El codigo actual usa A10** (`RegisterScopeTen.getTaxpayerDetails`). Si A10 no trae los campos requeridos por este spec (actividades AFIP, domicilio fiscal detallado, categoria monotributo), hay que evaluar cambiar a **A13 o A4**. Esto se confirma al hacer la primera consulta real exitosa con plan Pro.

**Firma del metodo (confirmada en source del SDK):**

```javascript
// RegisterScopeTen.js (y variantes)
async getTaxpayerDetails(identifier)  // identifier: number (CUIT sin guiones)
// Retorna: res.persona (objeto parseado del SOAP) o null si no existe
```

El codigo actual en `afip.ts:29-30` lo usa correctamente:
```typescript
const cuitNumero = parseInt(cuit.replace(/-/g, ''), 10)
const data = await getAfip().RegisterScopeTen.getTaxpayerDetails(cuitNumero)
```

### 3.2 — Campos a guardar

Datos a guardar en el modelo `Taller`:

| Campo | Tipo | Origen ARCA | Existe hoy |
|-------|------|-------------|------------|
| `verificadoAfip` | Boolean | flag de resultado | **SI** (linea 193 del schema) |
| `verificadoAfipAt` | DateTime? | timestamp de consulta exitosa | NO — agregar |
| `tipoInscripcionAfip` | Enum | `categoriaIva` del response | NO — agregar + enum nuevo |
| `categoriaMonotributo` | String? | `categoriaMonotributo` del response | NO — agregar |
| `actividadesAfip` | String[] | codigos AFIP de actividad | NO — agregar |
| `domicilioFiscalAfip` | Json? | provincia, localidad, calle | NO — agregar |
| `estadoCuitAfip` | Enum | `estado` (activo/inactivo/baja) | NO — agregar + enum nuevo |
| `fechaInscripcionAfip` | DateTime? | `fechaInscripcion` | NO — agregar |
| `empleadosRegistradosSipa` | Int? | total de SIPA | NO — agregar (ver nota) |
| `empleadosSipaActualizadoAt` | DateTime? | ultima actualizacion SIPA | NO — agregar |

> **Nota sobre `empleadosRegistradosSipa` vs `trabajadoresRegistrados`:** ya existe `trabajadoresRegistrados Int @default(0)` (linea 191 del schema) que es el dato **autodeclarado** por el taller. El nuevo `empleadosRegistradosSipa` es el dato **verificado de SIPA**. Mantener ambos: la diferencia "declarado vs real" es informacion valiosa para el ESTADO (ej: el taller dice 5 empleados pero SIPA dice 2 — ESTADO puede investigar).

### 3.3 — Endpoint secundario: empleados (SIPA)

Verificar disponibilidad con AfipSDK — puede requerir plan Growth o A4/A13.

### 3.4 — Decision sobre datos sensibles

**No traemos:**
- Datos de facturacion (montos, frecuencia)
- Estado de deudas con AFIP
- Datos del responsable (DNI, direccion particular)

Razon: privacidad. Solo traemos informacion que el taller declararia igual al inscribirse en la plataforma.

---

## 4. Modelo de datos

### 4.1 — Modificacion de `Taller`

```prisma
model Taller {
  // ... campos existentes (NO modificar)
  // verificadoAfip ya existe (linea 193): Boolean @default(false)
  // trabajadoresRegistrados ya existe (linea 191): Int @default(0) — dato autodeclarado

  // INT-01: campos NUEVOS — datos verificados por ARCA
  verificadoAfipAt              DateTime?
  tipoInscripcionAfip           TipoInscripcionAfip?
  categoriaMonotributo          String?
  estadoCuitAfip                EstadoCuit?
  fechaInscripcionAfip          DateTime?
  actividadesAfip               String[]                // codigos AFIP
  domicilioFiscalAfip           Json?                   // { provincia, localidad, calle }
  empleadosRegistradosSipa      Int?                    // dato verificado de SIPA (distinto de trabajadoresRegistrados autodeclarado)
  empleadosSipaActualizadoAt    DateTime?
}
```

> **Enums nuevos** (no existen en el schema actual):

```prisma
enum TipoInscripcionAfip {
  RESPONSABLE_INSCRIPTO
  MONOTRIBUTO
  EXENTO
  NO_INSCRIPTO
}

enum EstadoCuit {
  ACTIVO
  INACTIVO
  BAJA
  SUSPENDIDO
}
```

### 4.2 — Tabla nueva `ConsultaArca`

Registra cada consulta a ARCA para trazabilidad y debugging.

```prisma
model ConsultaArca {
  id            String   @id @default(cuid())
  tallerId      String?           // opcional: null en pre-registro
  taller        Taller?  @relation(fields: [tallerId], references: [id], onDelete: Cascade)

  cuit          String
  endpoint      String   // 'padron-a10' | 'padron-a13' | 'sipa'

  exitosa       Boolean
  respuesta     Json?    // payload completo de ARCA (limpio de datos sensibles)
  error         String?  // si fallo, que error

  duracionMs    Int      // tiempo de respuesta de la API

  createdAt     DateTime @default(now())

  @@index([tallerId])
  @@index([createdAt])
  @@map("consultas_arca")
}
```

> **Nota:** `tallerId` es opcional (`String?`) porque en el flujo de pre-registro (seccion 6.1) el taller aun no existe. La `ConsultaArca` se crea sin `tallerId` y se puede linkear despues si el registro tiene exito, o dejar huerfana si el usuario abandona el formulario.

---

## 5. Cliente `arca.ts`

Archivo nuevo: `src/compartido/lib/arca.ts`

### 5.1 — Configuracion

```typescript
import Afip from '@afipsdk/afip.js'
import { prisma } from './prisma'

interface ArcaConfig {
  enabled: boolean
  provider: 'afipsdk' | 'mock'
  cuitPlataforma: string
  accessToken: string
  production: boolean
}

const config: ArcaConfig = {
  enabled: process.env.ARCA_ENABLED === 'true',
  provider: (process.env.ARCA_PROVIDER as any) ?? 'afipsdk',
  cuitPlataforma: process.env.AFIP_CUIT_PLATAFORMA ?? '',
  accessToken: process.env.AFIP_SDK_TOKEN ?? '',
  production: process.env.AFIP_SDK_ENV === 'production',
}

// Cliente lazy-inicializado
let cliente: any = null

function getCliente() {
  if (!cliente && config.enabled && config.provider === 'afipsdk') {
    cliente = new Afip({
      CUIT: config.cuitPlataforma,
      production: config.production,
      access_token: config.accessToken,
    })
  }
  return cliente
}
```

### 5.2 — Funcion principal: `consultarPadron`

> **Estado de los campos del response:** el codigo actual en `afip.ts:38-48` tiene un comentario explicito: "ADAPTAR ESTOS CAMPOS despues de verificar el response real". Los paths de campo (`data.estadoClave`, `data.denominacion`, `data.datosGenerales?.estadoClave`) son especulativos — nadie los ha validado contra un response real de plan Pro. La funcion `mapearRespuesta()` debajo asume una estructura que debe verificarse con la primera consulta exitosa. Si la estructura difiere, actualizar `mapearRespuesta()` sin cambiar la interface `DatosArca`.

```typescript
export interface DatosArca {
  cuit: string
  nombre: string
  tipoInscripcion: TipoInscripcionAfip
  categoriaMonotributo?: string
  estadoCuit: EstadoCuit
  fechaInscripcion?: Date
  actividades: string[]
  domicilioFiscal?: { provincia?: string; localidad?: string; calle?: string }
}

export interface ResultadoConsulta {
  exitosa: boolean
  datos?: DatosArca
  error?: string
  duracionMs: number
}

export async function consultarPadron(cuit: string, tallerId?: string): Promise<ResultadoConsulta> {
  const inicio = Date.now()

  // Si esta deshabilitado, retornar mock
  if (!config.enabled) {
    return mockConsulta(cuit)
  }

  try {
    const sdk = getCliente()
    if (!sdk) {
      throw new Error('Cliente AfipSDK no inicializado')
    }

    const cuitNumero = parseInt(cuit.replace(/-/g, ''), 10)

    // Usa RegisterScopeTen (A10) por defecto
    // Si A10 no trae campos suficientes (actividades, domicilio detallado),
    // cambiar a RegisterScopeThirteen (A13) o RegisterScopeFour (A4)
    const respuesta = await sdk.RegisterScopeTen.getTaxpayerDetails(cuitNumero)

    // getTaxpayerDetails retorna null si el CUIT no existe
    if (!respuesta) {
      await registrarConsulta(tallerId, cuit, 'padron-a10', false, null, 'CUIT inexistente', inicio)
      return { exitosa: false, error: 'CUIT_INVALIDO', duracionMs: Date.now() - inicio }
    }

    // Si el response es string (HTML), algo salio mal con la autenticacion
    if (typeof respuesta === 'string') {
      throw new Error('Respuesta invalida de ARCA — verificar token y plan')
    }

    const datos = mapearRespuesta(cuit, respuesta)

    await registrarConsulta(tallerId, cuit, 'padron-a10', true, limpiarDatosSensibles(respuesta), null, inicio)

    return { exitosa: true, datos, duracionMs: Date.now() - inicio }

  } catch (error: any) {
    await registrarConsulta(tallerId, cuit, 'padron-a10', false, null, error.message, inicio)

    return {
      exitosa: false,
      error: clasificarError(error),
      duracionMs: Date.now() - inicio,
    }
  }
}

async function registrarConsulta(
  tallerId: string | undefined,
  cuit: string,
  endpoint: string,
  exitosa: boolean,
  respuesta: any,
  error: string | null,
  inicio: number,
) {
  prisma.consultaArca.create({
    data: {
      tallerId: tallerId ?? null,
      cuit,
      endpoint,
      exitosa,
      respuesta,
      error,
      duracionMs: Date.now() - inicio,
    }
  }).catch((err) => console.error('Error registrando consulta ARCA:', err))
}

function mapearRespuesta(cuit: string, data: any): DatosArca {
  // IMPORTANTE: estos paths de campo NO han sido validados con un response real
  // El response de ws_sr_padron_a10 puede tener estructura distinta
  // Verificar con la primera consulta exitosa de plan Pro y actualizar
  return {
    cuit,
    nombre: data.denominacion ?? data.datosGenerales?.denominacion ?? '',
    tipoInscripcion: mapearTipoInscripcion(data.categoriaIva ?? data.datosGenerales?.categoriaIva),
    categoriaMonotributo: data.categoriaMonotributo ?? data.datosGenerales?.categoriaMonotributo ?? undefined,
    estadoCuit: mapearEstadoCuit(data.estadoClave ?? data.datosGenerales?.estadoClave),
    fechaInscripcion: data.fechaInscripcion ? new Date(data.fechaInscripcion) : undefined,
    actividades: Array.isArray(data.actividades)
      ? data.actividades.map((a: any) => a.idActividad ?? a.codigo ?? String(a))
      : [],
    domicilioFiscal: data.domicilioFiscal ? {
      provincia: data.domicilioFiscal.descripcionProvincia,
      localidad: data.domicilioFiscal.localidad,
      calle: data.domicilioFiscal.direccion,
    } : undefined,
  }
}

function mapearTipoInscripcion(valor: string | undefined): 'MONOTRIBUTO' | 'RESPONSABLE_INSCRIPTO' | 'EXENTO' | 'NO_INSCRIPTO' {
  if (!valor) return 'NO_INSCRIPTO'
  const v = valor.toUpperCase()
  if (v.includes('MONOTRIBUTO')) return 'MONOTRIBUTO'
  if (v.includes('RESPONSABLE INSCRIPTO') || v.includes('IVA')) return 'RESPONSABLE_INSCRIPTO'
  if (v.includes('EXENTO')) return 'EXENTO'
  return 'NO_INSCRIPTO'
}

function mapearEstadoCuit(valor: string | undefined): 'ACTIVO' | 'INACTIVO' | 'BAJA' | 'SUSPENDIDO' {
  if (!valor) return 'ACTIVO'
  const v = valor.toUpperCase()
  if (v === 'ACTIVO') return 'ACTIVO'
  if (v === 'INACTIVO') return 'INACTIVO'
  if (v.includes('BAJA')) return 'BAJA'
  return 'SUSPENDIDO'
}

function clasificarError(error: any): string {
  if (error.message?.includes('Unauthorized') || error.message?.includes('401')) {
    return 'Error de autenticacion con AFIP — token invalido o plan vencido'
  }
  if (error.message?.includes('ECONNREFUSED') || error.message?.includes('timeout')) {
    return 'AFIP no disponible — reintentar mas tarde'
  }
  if (error.message?.includes('No existe') || error.code === 'CUIT_NOT_FOUND') {
    return 'CUIT_INVALIDO'
  }
  return 'No se pudo verificar el CUIT — el servicio puede estar caido'
}
```

### 5.3 — Mock para desarrollo

```typescript
function mockConsulta(cuit: string): ResultadoConsulta {
  // Para tests y dev sin tocar AfipSDK
  return {
    exitosa: true,
    datos: {
      cuit,
      nombre: 'TALLER MOCK SRL',
      tipoInscripcion: 'MONOTRIBUTO',
      categoriaMonotributo: 'A',
      estadoCuit: 'ACTIVO',
      actividades: ['181000', '181100'],  // Confeccion de prendas
      domicilioFiscal: { provincia: 'Buenos Aires', localidad: 'Quilmes', calle: 'San Martin 1234' },
    },
    duracionMs: 50,
  }
}
```

### 5.4 — Sincronizacion periodica

```typescript
export async function sincronizarTaller(tallerId: string, force = false): Promise<boolean> {
  const taller = await prisma.taller.findUnique({
    where: { id: tallerId },
    select: { id: true, cuit: true, verificadoAfipAt: true }
  })

  if (!taller?.cuit) return false

  // Solo re-sincronizar si pasaron mas de 30 dias o si force=true
  if (!force && taller.verificadoAfipAt) {
    const diasDesdeUltima = (Date.now() - taller.verificadoAfipAt.getTime()) / (1000 * 60 * 60 * 24)
    if (diasDesdeUltima < 30) return true  // ya esta al dia
  }

  const resultado = await consultarPadron(taller.cuit, taller.id)

  if (!resultado.exitosa || !resultado.datos) {
    return false
  }

  await prisma.taller.update({
    where: { id: tallerId },
    data: {
      verificadoAfip: true,
      verificadoAfipAt: new Date(),
      tipoInscripcionAfip: resultado.datos.tipoInscripcion,
      categoriaMonotributo: resultado.datos.categoriaMonotributo ?? null,
      estadoCuitAfip: resultado.datos.estadoCuit,
      fechaInscripcionAfip: resultado.datos.fechaInscripcion ?? null,
      actividadesAfip: resultado.datos.actividades,
      domicilioFiscalAfip: resultado.datos.domicilioFiscal ?? null,
    }
  })

  return true
}
```

---

## 6. Integracion en flujos existentes

### 6.1 — Registro

> **Estado actual del flujo:** `api/auth/registro/route.ts` (170 lineas) ya hace casi todo:
> - Linea 65: llama `verificarCuit(cuit)` del helper `afip.ts`
> - Lineas 60-83: fix defensivo completo — solo rechaza si AFIP dice explicitamente invalido/inexistente/inactivo
> - Linea 107: setea `verificadoAfip: cuitVerificado` al crear el taller
>
> **Lo que falta NO es reescribir el route** — es ampliar el helper. Dos opciones:

**Opcion A (preferida):** crear `consultarPadron()` en `arca.ts` como reemplazo de `verificarCuit()` en `afip.ts`. El route importa la nueva funcion y usa los datos extendidos:

```typescript
// api/auth/registro/route.ts — cambios minimos
import { consultarPadron } from '@/compartido/lib/arca'  // reemplaza import de afip.ts

// Linea 65 — reemplazar verificarCuit() por consultarPadron()
const resultado = await consultarPadron(cuitToVerify)  // sin tallerId (pre-registro)

if (resultado.exitosa && resultado.datos) {
  cuitVerificado = true
  datosArca = resultado.datos  // guardar para usar al crear taller
} else if (resultado.error === 'CUIT_INVALIDO') {
  return NextResponse.json({ error: 'El CUIT no existe en ARCA' }, { status: 400 })
}
// Cualquier otro error → permitir registro sin verificacion (fix defensivo existente)

// Linea 101-108 — ampliar la creacion del taller con datos de ARCA
taller: {
  create: {
    nombre: datosArca?.nombre || data.tallerData.nombre,  // preferir ARCA, fallback a autodeclarado
    cuit: data.tallerData.cuit,
    verificadoAfip: cuitVerificado,
    verificadoAfipAt: cuitVerificado ? new Date() : null,
    tipoInscripcionAfip: datosArca?.tipoInscripcion ?? null,
    categoriaMonotributo: datosArca?.categoriaMonotributo ?? null,
    estadoCuitAfip: datosArca?.estadoCuit ?? null,
    actividadesAfip: datosArca?.actividades ?? [],
    domicilioFiscalAfip: datosArca?.domicilioFiscal ?? null,
    // ... resto de campos existentes
  },
}
```

> **Nota sobre tallerId en pre-registro:** `consultarPadron(cuit)` se llama sin `tallerId` porque el taller aun no existe. La `ConsultaArca` se crea con `tallerId: null`. Si el registro tiene exito, la consulta queda huerfana (sin linkear al taller). Esto es aceptable — la `ConsultaArca` tiene el CUIT como referencia y se puede consultar por fecha. No vale la pena el update posterior para un campo de trazabilidad.

**Opcion B:** mantener `verificarCuit()` para el check basico y llamar `consultarPadron()` solo si el check basico pasa. Mas conservador pero duplica la llamada a AFIP.

Ir con opcion A.

### 6.2 — Sincronizacion periodica via boton manual

Para que los datos no envejezcan, sincronizar cada 30 dias los talleres activos:

**V3: manual**
- Boton en `/estado/talleres` "Sincronizar todos con ARCA"
- ESTADO clickea cuando lo necesita
- 25 talleres x 1 segundo por consulta = 25 segundos

**V4: automatico**
- Cron job de Vercel diario
- Sincroniza talleres con `verificadoAfipAt` mayor a 30 dias

Para V3 vamos con boton manual — mas simple y suficiente para 25 talleres.

### 6.3 — Boton "re-verificar" individual

En `/estado/talleres/[id]` aparece un boton cuando `verificadoAfip: false`:

```
[Re-verificar contra ARCA]
```

Click llama a `sincronizarTaller(tallerId, force=true)`. Util para los talleres que se registraron mientras AFIP estaba caida en V2.

---

## 7. Visualizacion: badges y diferenciacion

### 7.1 — Componente `BadgeArca`

```tsx
function BadgeArca({ verificado, fecha }: { verificado: boolean; fecha?: Date }) {
  if (verificado) {
    return (
      <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
        Verificado por ARCA
        {fecha && (
          <span className="text-blue-500">
            ({tiempoRelativo(fecha)})
          </span>
        )}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded">
      Pendiente de verificacion
    </span>
  )
}
```

### 7.2 — Aplicacion

Cada campo verificable en la UI muestra el badge:

- **Perfil del taller** (`/taller/perfil`): nombre, CUIT, tipo inscripcion, domicilio
- **Detalle ESTADO** (`/estado/talleres/[id]`): todos los campos verificados
- **Directorio publico** (`/directorio` y `/perfil/[id]`): badge en el card del taller
- **Admin** (`/admin/talleres/[id]`): mismo que ESTADO pero mas completo

### 7.3 — Diferenciacion visual en el directorio

> **Estado actual del directorio** (`src/app/(public)/directorio/page.tsx`):
> - **Filtros existentes:** `q` (busqueda texto en nombre/ubicacion/provincia), `nivel` (BRONCE/PLATA/ORO), `proceso`, `prenda` — ningun filtro toca `verificadoAfip`
> - **Orden actual:** `orderBy: { puntaje: 'desc' }` (linea 61) — un solo criterio
> - **Query:** usa `include` (no `select`), asi que `verificadoAfip` ya esta disponible en los resultados sin cambiar la query
> - **Card del taller:** muestra nombre, nivel, ubicacion, rating, trabajadores, capacidad, procesos. No muestra `verificadoAfip`.

**Cambio necesario en el orden (linea 61):**

```typescript
// Antes (V2):
orderBy: { puntaje: 'desc' }

// Despues (V3):
orderBy: [{ verificadoAfip: 'desc' }, { puntaje: 'desc' }]
```

Verificados van primero, luego ordenados por puntaje dentro de cada grupo. **No rompe ningun filtro existente** — los filtros construyen el `where`, el `orderBy` es independiente.

**Agregar BadgeArca al card del taller** (alrededor de linea 158) — cambio visual puro, no toca logica de filtros ni paginacion:

```tsx
{/* Dentro del card, al lado del badge de nivel */}
{taller.verificadoAfip && <BadgeArca verificado={true} />}
```

Talleres `verificadoAfip: false` siguen en el directorio pero sin la distincion. En el perfil publico (`/perfil/[id]`) agregar el badge en el header del perfil.

---

## 8. UI nueva en `/estado/talleres`

### 8.1 — Stats de verificacion

Card al inicio del listado:

```
+----------------------------------------------+
| Estado de verificacion con ARCA               |
|                                                |
| 18 talleres verificados                       |
| 7 talleres sin verificar                      |
| Ultima sincronizacion masiva: hace 5 dias     |
|                                                |
| [Sincronizar todos]                           |
+----------------------------------------------+
```

### 8.2 — Filtros

- "Solo verificados"
- "Solo sin verificar"
- "Verificados hace mas de 30 dias" (candidatos a re-sincronizar)

---

## 9. Casos borde

- **Plan AfipSDK no contratado al deployar** — la variable `ARCA_ENABLED=false` desactiva la integracion. El comportamiento es identico al fix defensivo de V2: el taller se registra sin verificacion. Permite hacer deploy sin esperar el upgrade del plan.

- **Token expira durante el piloto** — la primera consulta falla con error 401, queda registrada en `ConsultaArca`. El admin recibe notificacion (via F-07 mensajes individuales) "Renova el token de AfipSDK". El sistema cae en modo defensivo automaticamente.

- **CUIT de prueba en dev/preview** — en ambiente que no es produccion, el cliente usa modo `mock` siempre — no consume requests reales del plan.

- **Taller cambia su tipo de inscripcion** — la sincronizacion mensual lo detecta. Si pasa de Monotributo a RI puede afectar requisitos de documentos. ESTADO ve el cambio en el detalle y decide si revisa documentacion.

- **CUIT activo pero sin actividades textiles** — la plataforma no rechaza, el ESTADO ve la lista de actividades AFIP y puede decidir si invita al taller o no. Permite el caso de "el taller declaro otra actividad pero esta empezando con textil".

- **Empleados SIPA ≠ empleados declarados** — el taller declara 5 (`trabajadoresRegistrados`), ARCA dice 2 (`empleadosRegistradosSipa`). ESTADO ve ambos numeros y puede investigar. No se bloquea automaticamente porque puede haber empleados informales legitimos en proceso de regularizacion (justamente el problema que la plataforma busca atacar).

- **Domicilio fiscal ≠ provincia declarada para directorio** — el taller pone "Buenos Aires" para el directorio pero su CUIT esta en "Salta". Se permite (un taller puede operar en otra provincia) pero ESTADO ve la discrepancia.

- **Privacidad: no exponer datos de ARCA al taller mismo** — los datos verificados se muestran al taller en su perfil, pero `domicilioFiscalAfip` y `actividadesAfip` quedan mas visibles para ESTADO/admin. El taller no necesita ver "tu actividad AFIP es 181100" — eso es para uso interno.

- **A10 no trae todos los campos** — si `RegisterScopeTen` no retorna actividades o domicilio detallado, cambiar a `RegisterScopeThirteen` (A13) en `consultarPadron()`. Solo requiere cambiar la linea `sdk.RegisterScopeTen.getTaxpayerDetails` por `sdk.RegisterScopeThirteen.getTaxpayerDetails` y actualizar `mapearRespuesta()` para la estructura de A13.

- **ConsultaArca huerfana (sin tallerId)** — las consultas de pre-registro quedan sin `tallerId`. Son utiles para debugging (tienen CUIT y timestamp) pero no se pueden filtrar por taller. Aceptable para V3.

---

## 10. Variables de entorno

```bash
# Habilitar/deshabilitar la integracion
ARCA_ENABLED=true                 # 'false' usa mock siempre

# Provider (extensible para V4)
ARCA_PROVIDER=afipsdk              # 'afipsdk' | 'mock'

# Credenciales AfipSDK
AFIP_CUIT_PLATAFORMA=20282165733
AFIP_SDK_TOKEN=...                 # token del plan Pro
AFIP_SDK_ENV=production            # 'production' | 'sandbox'
```

En Vercel:
- Production: todas las variables con valores reales
- Preview: `ARCA_PROVIDER=mock` y el resto puede tener cualquier valor (no se usa)
- Local (`.env.local`): igual a Preview

---

## 11. Costos

**Plan Pro de AfipSDK:** $25/mes
- 10 CUITs por mes (pendiente confirmar significado exacto — ver ANTES DE ARRANCAR)
- 10.000 requests/mes

> **BLOCKER de pricing:** "10 CUITs/mes" es ambiguo:
> - Si son **10 CUITs distintos** por mes → plan Pro NO alcanza para 25 talleres → contratar Growth ($80/mes)
> - Si son **10 consultas unicas** con repetidas que no cuentan → alcanza si cacheamos
> - Si el limite de CUITs aplica solo a la **API REST** y no al SDK SOAP directo → no nos afecta
>
> Confirmar con soporte antes del deploy. Si no alcanza, presupuestar Growth ($80/mes) desde el inicio.

**Volumen estimado piloto (asumiendo que el plan alcanza):**
- 25 talleres x 1 verificacion al registrarse = 25 requests
- 25 talleres x 1 sincronizacion mensual = 25 requests
- Re-verificaciones manuales: ~10 por mes
- Total: ~60 requests/mes — muy debajo del limite de 10.000

---

## 12. Migracion de datos existentes

Talleres registrados en V2 con `verificadoAfip: false`:

1. Despues de deployar V3 con plan Pro, correr script `tools/sincronizar-arca.ts`
2. Para cada taller con `verificadoAfip: false`, llamar `sincronizarTaller(id, force=true)`
3. Reportar al final cuantos se verificaron exitosamente vs cuales siguen pendientes

```bash
npx tsx tools/sincronizar-arca.ts --dry-run  # ver que pasaria
npx tsx tools/sincronizar-arca.ts            # ejecutar
```

---

## 13. Criterios de aceptacion

- [ ] Plan Pro (o Growth) de AfipSDK contratado y token funcional
- [ ] Confirmado con soporte el significado de "10 CUITs/mes"
- [ ] Variables de entorno configuradas en Vercel
- [ ] Migracion aplicada con 9 campos nuevos en `Taller` y 2 enums nuevos
- [ ] `verificadoAfip` existente NO se toca (ya funciona)
- [ ] Tabla `ConsultaArca` creada con `tallerId` opcional
- [ ] Cliente `arca.ts` implementado con mock para dev
- [ ] Funcion `consultarPadron(cuit, tallerId?)` con tallerId opcional para pre-registro
- [ ] Estructura del response real de ARCA validada y `mapearRespuesta()` actualizada
- [ ] Funcion `sincronizarTaller` con check de 30 dias
- [ ] Integracion en flujo de registro (ampliar helper, no reescribir route)
- [ ] Boton "Sincronizar todos" en `/estado/talleres`
- [ ] Boton "Re-verificar" individual en `/estado/talleres/[id]`
- [ ] Componente `BadgeArca` con dos estados
- [ ] Aplicacion del badge en perfil taller, detalle ESTADO, directorio publico, admin
- [ ] Directorio publico: `orderBy: [{ verificadoAfip: 'desc' }, { puntaje: 'desc' }]` (linea 61)
- [ ] Stats de verificacion en `/estado/talleres`
- [ ] Mock funcionando en dev/preview (no consume API real)
- [ ] Script `tools/sincronizar-arca.ts` con `--dry-run`
- [ ] Build sin errores de TypeScript

---

## 14. Tests

| # | Que testear | Como | Verificador |
|---|-------------|------|-------------|
| 1 | Registro con CUIT valido pre-llena datos de ARCA | Registrar nuevo taller en produccion | QA |
| 2 | Registro con CUIT invalido muestra error claro | Usar CUIT inexistente | QA |
| 3 | Registro con ARCA caida permite continuar (modo defensivo) | Setear `ARCA_ENABLED=false`, registrar | DEV |
| 4 | Boton "Sincronizar todos" actualiza datos | Click en `/estado/talleres` | QA |
| 5 | Re-verificacion manual funciona | Click en taller con `verificadoAfip: false` | QA |
| 6 | Badge se muestra correctamente | Verificar visual en 4 ubicaciones | QA |
| 7 | Directorio publico prioriza verificados | Ver orden con mix de verificados y no verificados | QA |
| 8 | Mock no consume requests reales en preview | Setear preview, hacer requests, verificar dashboard AfipSDK | DEV |
| 9 | ConsultaArca se persiste en cada llamada (con y sin tallerId) | Verificar tabla despues de registro y sincronizacion | DEV |
| 10 | Errores 401 (token vencido) se loguean correctamente | Setear token invalido, verificar | DEV |
| 11 | trabajadoresRegistrados (autodeclarado) y empleadosRegistradosSipa (ARCA) coexisten | Verificar que ESTADO ve ambos valores | QA |

---

## 15. Validacion de dominio (perfiles interdisciplinarios)

**Politologo:**
- La integracion con ARCA refuerza la legitimidad institucional de la plataforma?
- El uso de "verificado por ARCA" puede generar false sense of security en marcas?

**Economista:**
- Los datos de SIPA (empleados registrados) son metrica util para el matching marca-taller?
- La diferenciacion verificado/no-verificado crea incentivos correctos?

**Sociologo:**
- Los talleres no-verificados se sienten estigmatizados en el directorio?
- El badge "Verificado por ARCA" es comprensible para usuarios no fiscales?
- La diferenciacion crea exclusion social no deseada?

**Contador:**
- Los datos que traemos son los correctos segun el padron nacional?
- `tipoInscripcion` cubre todos los casos reales (incluyendo Regimen Simplificado para PyMEs)?
- La sincronizacion mensual es suficiente o algunos cambios requieren deteccion mas rapida (ej: baja de monotributo)?

---

## 16. Referencias

- V3_BACKLOG -> INT-01 + INT-02
- AfipSDK docs: https://docs.afipsdk.com
- SDK SOAP services: `ws_sr_padron_a10` (basico), `ws_sr_padron_a13` (intermedio), `ws_sr_padron_a4` (completo)
- V2 ticket de soporte AfipSDK del 21/04/2026 sobre la API que devolvia HTML
- D-01 — el ESTADO es quien usa esta integracion (no ADMIN)
- Codigo existente: `src/compartido/lib/afip.ts` (helper `verificarCuit()` a reemplazar por `arca.ts`)
