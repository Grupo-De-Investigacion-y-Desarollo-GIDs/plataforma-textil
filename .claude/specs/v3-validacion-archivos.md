# Spec: Validación server-side de archivos — configurable desde admin

- **Versión:** V3
- **Origen:** V3_BACKLOG S-03
- **Asignado a:** Gerardo
- **Prioridad:** Alta — sin esto, cambiar tipos aceptados requiere deploy

---

## ANTES DE ARRANCAR

- [ ] V3_BACKLOG I-01 mergeado (ambientes separados)
- [ ] V3_BACKLOG S-02 mergeado (rate limiting) — aplica al endpoint de configuración

---

## 1. Contexto

Hoy los tipos de archivo aceptados (PDF, imágenes) y el tamaño máximo (5 MB) están hardcodeados en el código. Si el Estado decide aceptar videos cortos para mostrar proceso productivo, hay que:

1. Modificar el código
2. Ensayar en Preview
3. Deployar a producción

Esto es demasiado rígido para una plataforma institucional. El admin debe poder ajustar la configuración sin esperar a Gerardo.

Este spec hace dos cosas simultáneamente:

1. **Validación real de archivos** (server-side, por magic bytes) — lo que evita malware disfrazado
2. **Configuración desde admin** — el admin define por tipo de contexto qué tipos de archivo acepta y qué tamaño máximo

> **Nota sobre runtime:** Next.js 16.1.6 usa Node.js como runtime default para API routes — no requiere declarar `export const runtime = 'nodejs'` explícitamente. Los 2 endpoints de upload existentes ya usan `Buffer.from()` sin declaración de runtime y funcionan correctamente.

---

## 2. Qué construir

1. **Nuevo modelo `ConfiguracionUpload` en Prisma** — define reglas por contexto de upload
2. **Seed inicial con los valores actuales hardcodeados** — migración sin sorpresas
3. **UI en `/admin/configuracion`** — nueva pestaña "Archivos" con CRUD de configuraciones
4. **Helper de validación que lee de DB** — con cache en memoria (1 minuto) para evitar query en cada upload
5. **Aplicación en los 2 endpoints de upload existentes (con 4 contextos)**
6. **Logs de intentos bloqueados** — para `/admin/logs`

---

## 3. Modelo de datos

### Tabla `ConfiguracionUpload`

```prisma
model ConfiguracionUpload {
  id                String   @id @default(cuid())

  // Contexto: qué endpoint usa esta config
  contexto          String   @unique   // 'documentos-formalizacion', 'imagenes-portfolio', 'imagenes-pedido', etc

  // Nombre legible para el admin
  nombre            String               // 'Documentos de formalización'
  descripcion       String?              // 'PDFs y fotos que el taller sube como prueba'

  // Validación
  tiposPermitidos   String[]             // ['pdf', 'jpeg', 'png']
  tamanoMaximoMB    Int                  // 5
  activo            Boolean  @default(true)

  // Metadata
  actualizadoPor    String?              // userId del admin que modificó
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@map("configuraciones_upload")
}
```

### Seed inicial

```typescript
// prisma/seed.ts
await prisma.configuracionUpload.createMany({
  data: [
    {
      contexto: 'documentos-formalizacion',
      nombre: 'Documentos de formalización',
      descripcion: 'Documentos que el taller sube para validar su nivel (ART, monotributo, habilitaciones)',
      tiposPermitidos: ['pdf', 'jpeg', 'png'],
      tamanoMaximoMB: 5,
    },
    {
      contexto: 'imagenes-portfolio',
      nombre: 'Imágenes de portfolio del taller',
      descripcion: 'Fotos de trabajo y producción del taller',
      tiposPermitidos: ['jpeg', 'png', 'webp'],
      tamanoMaximoMB: 5,
    },
    {
      contexto: 'imagenes-pedido',
      nombre: 'Imágenes de referencia de pedidos',
      descripcion: 'Fotos que la marca adjunta al crear un pedido',
      tiposPermitidos: ['jpeg', 'png', 'webp'],
      tamanoMaximoMB: 5,
    },
    {
      contexto: 'imagenes-cotizacion',
      nombre: 'Imágenes de referencia de cotizaciones',
      descripcion: 'Fotos que el taller adjunta al enviar una cotización',
      tiposPermitidos: ['jpeg', 'png', 'webp'],
      tamanoMaximoMB: 5,
    },
  ],
  skipDuplicates: true,
})
```

---

## 4. Tipos de archivo soportados por la plataforma

La plataforma soporta 6 tipos de archivo con validación por magic bytes:

| ID | Extensión | Magic bytes | Descripción |
|----|-----------|-------------|-------------|
| `pdf` | `.pdf` | `25 50 44 46` | Documento PDF |
| `jpeg` | `.jpg`, `.jpeg` | `FF D8 FF` | Imagen JPEG |
| `png` | `.png` | `89 50 4E 47 0D 0A 1A 0A` | Imagen PNG |
| `webp` | `.webp` | `52 49 46 46 ... 57 45 42 50` | Imagen WebP |
| `mp4` | `.mp4` | `66 74 79 70` offset 4 | Video MP4 |
| `mov` | `.mov` | `66 74 79 70` / `6D 6F 6F 76` offset 4 | Video QuickTime |

**Nota sobre XLSX/DOCX:** No están soportados en V3. Ambos formatos comparten magic bytes con ZIP genérico (`50 4B 03 04`). Validar que un archivo con esos bytes es realmente un Excel o Word (y no un ZIP renombrado, JAR o APK) requiere inspección del contenido interno — verificar que existe el archivo `[Content_Types].xml` dentro del ZIP, que es obligatorio en Office Open XML. Esto se implementa en V4 con `jszip`. Por ahora, la plataforma soporta 6 tipos: pdf, jpeg, png, webp, mp4, mov.

**Nota sobre videos:** MP4 y MOV tienen múltiples variantes. La detección verifica los primeros 8-12 bytes típicos. Archivos con encoders raros pueden dar falso rechazo.

En la UI de admin, el select de tipos muestra solo esta lista fija de 6 — el admin no puede inventar tipos nuevos. Si en el futuro OIT necesita aceptar Excel, Word, u otros formatos, se agrega al código como nueva entrada con su validación correspondiente.

---

## 5. Prescripciones técnicas

### 5.1 — Migración

```bash
npx prisma migrate dev --name agregar_configuracion_upload
```

### 5.2 — Helper de validación con cache

Archivo nuevo: `src/compartido/lib/file-validation.ts`

```typescript
import { prisma } from './prisma'
import type { ConfiguracionUpload } from '@prisma/client'

export type TipoArchivoSoportado =
  | 'pdf' | 'jpeg' | 'png' | 'webp'
  | 'mp4' | 'mov'

const MAGIC_BYTES: Record<TipoArchivoSoportado, (buffer: Buffer) => boolean> = {
  pdf: (b) => b.slice(0, 4).toString('hex') === '25504446',
  jpeg: (b) => b.slice(0, 3).toString('hex') === 'ffd8ff',
  png: (b) => b.slice(0, 8).toString('hex') === '89504e470d0a1a0a',
  webp: (b) =>
    b.slice(0, 4).toString('ascii') === 'RIFF' &&
    b.slice(8, 12).toString('ascii') === 'WEBP',
  mp4: (b) => b.slice(4, 8).toString('ascii') === 'ftyp',
  mov: (b) => {
    const type = b.slice(4, 8).toString('ascii')
    return type === 'ftyp' || type === 'moov' || type === 'mdat'
  },
}

// Cache de configuraciones en memoria (1 minuto)
const cacheConfigs = new Map<string, { data: ConfiguracionUpload; expira: number }>()
const CACHE_TTL_MS = 60 * 1000

async function obtenerConfig(contexto: string): Promise<ConfiguracionUpload | null> {
  const ahora = Date.now()
  const cached = cacheConfigs.get(contexto)

  if (cached && cached.expira > ahora) {
    return cached.data
  }

  const config = await prisma.configuracionUpload.findUnique({
    where: { contexto },
  })

  if (config) {
    cacheConfigs.set(contexto, { data: config, expira: ahora + CACHE_TTL_MS })
  }

  return config
}

export interface FileValidationResult {
  valid: boolean
  error?: string
  tipoDetectado?: TipoArchivoSoportado
}

/**
 * Valida un archivo según la configuración de su contexto.
 * Fail-closed: si no hay config para el contexto, rechaza por defecto.
 */
export async function validarArchivo(
  file: File,
  contexto: string
): Promise<FileValidationResult> {
  const config = await obtenerConfig(contexto)

  if (!config || !config.activo) {
    return {
      valid: false,
      error: 'Subida de archivos no habilitada para este contexto. Contactá al administrador.',
    }
  }

  // Validar tamaño
  const tamanoMaximoBytes = config.tamanoMaximoMB * 1024 * 1024
  if (file.size > tamanoMaximoBytes) {
    return {
      valid: false,
      error: `El archivo supera el tamaño máximo de ${config.tamanoMaximoMB} MB`,
    }
  }

  if (file.size === 0) {
    return { valid: false, error: 'El archivo está vacío' }
  }

  // Leer primeros 16 bytes
  const buffer = Buffer.from(await file.slice(0, 16).arrayBuffer())

  // Detectar tipo real
  let tipoDetectado: TipoArchivoSoportado | undefined
  for (const tipo of config.tiposPermitidos) {
    if (tipo in MAGIC_BYTES && MAGIC_BYTES[tipo as TipoArchivoSoportado](buffer)) {
      tipoDetectado = tipo as TipoArchivoSoportado
      break
    }
  }

  if (!tipoDetectado) {
    const permitidos = config.tiposPermitidos.join(', ').toUpperCase()
    return {
      valid: false,
      error: `Formato no soportado. Aceptamos: ${permitidos}`,
    }
  }

  // Validar nombre
  if (!esNombreSeguro(file.name)) {
    return {
      valid: false,
      error: 'El nombre del archivo contiene caracteres no permitidos',
    }
  }

  return { valid: true, tipoDetectado }
}

export function sanitizarNombreArchivo(nombre: string): string {
  return nombre
    .replace(/[\/\\]/g, '')
    .replace(/\.\./g, '')
    .replace(/[\x00-\x1f\x7f]/g, '')
    .replace(/[<>:"|?*]/g, '_')
    .trim()
    .slice(0, 200)
}

function esNombreSeguro(nombre: string): boolean {
  if (nombre.includes('/') || nombre.includes('\\') || nombre.includes('..')) return false
  if (/^[\s\.]+$/.test(nombre)) return false
  if (!/[a-zA-Z0-9]/.test(nombre)) return false
  return true
}

/**
 * Invalida el cache de configuraciones.
 * Llamar desde el endpoint PUT después de actualizar una config.
 */
export function invalidarCacheConfigs() {
  cacheConfigs.clear()
}
```

### 5.3 — UI de admin

Archivo nuevo: `src/app/(admin)/admin/configuracion/archivos/page.tsx`

Tab nuevo dentro de `/admin/configuracion` llamado **"Archivos"**.

**Vista de lista:**
- Tabla con columnas: Contexto, Nombre, Tipos permitidos (badges), Tamaño máximo, Activo (toggle)
- Botón "Editar" por fila
- Sin botón "Crear nuevo" — los contextos son fijos, definidos por el código

**Vista de edición (modal):**
- Select múltiple de tipos permitidos (lista fija de 6 opciones con iconos)
- Input numérico de tamaño máximo en MB (1 a 100)
- Toggle de activo/inactivo
- Al guardar, invalida cache y muestra toast de confirmación

### 5.4 — Endpoints de configuración

```
GET  /api/admin/configuracion-upload          → lista todas las configs
PUT  /api/admin/configuracion-upload/[id]    → actualiza una config
```

Ambos requieren rol ADMIN. El PUT dispara `invalidarCacheConfigs()` después del update.

### 5.5 — Integración en endpoints de upload

Existen 2 endpoints de upload con 4 contextos:

| Endpoint | Contextos |
|----------|-----------|
| `POST /api/upload/imagenes` | `imagenes-portfolio`, `imagenes-pedido`, `imagenes-cotizacion` (según parámetro `contexto` del FormData) |
| `POST /api/validaciones/[id]/upload` | `documentos-formalizacion` (fijo) |

Ejemplo de integración:

```typescript
// src/app/api/validaciones/[id]/upload/route.ts
import { validarArchivo, sanitizarNombreArchivo } from '@/compartido/lib/file-validation'
import { logActividad } from '@/compartido/lib/log'

const validacion = await validarArchivo(file, 'documentos-formalizacion')

if (!validacion.valid) {
  logActividad('UPLOAD_REJECTED', session.user.id, {
    contexto: 'documentos-formalizacion',
    motivo: validacion.error,
    nombreArchivo: file.name,
    tamano: file.size,
  })
  return NextResponse.json({ error: validacion.error }, { status: 400 })
}

const nombreSeguro = sanitizarNombreArchivo(file.name)
// ... resto del upload
```

Para `/api/upload/imagenes`, el contexto se lee del FormData y se mapea:

```typescript
// src/app/api/upload/imagenes/route.ts
const contexto = formData.get('contexto') as string  // 'portfolio', 'pedido', 'cotizacion'
const configContexto = `imagenes-${contexto}`         // 'imagenes-portfolio', etc.

const validacion = await validarArchivo(file, configContexto)
// ... mismo patrón
```

---

## 6. Casos borde

- **Admin desactiva un contexto mientras hay uploads en curso** — los uploads actuales se completan, pero nuevos se rechazan con 400.

- **Cache desactualizado entre instancias serverless** — la invalidación funciona en la instancia que hizo el update. Otras instancias tienen cache viejo hasta 1 minuto. Para V3 es aceptable. Para V4 evaluar Redis como cache compartido.

- **Admin borra un record en DB manualmente** — el endpoint devuelve "no habilitado" (fail-closed).

- **Tipos permitidos vacíos** — la UI no permite guardar lista vacía. Mínimo 1 tipo.

- **Tamaño 0 o negativo** — la UI valida mínimo 1 MB, máximo 100 MB.

- **PDFs con contenido malicioso (JS embebido)** — Magic bytes solo verifican formato, no contenido. Riesgo residual aceptable para V3 por la siguiente razón: los PDFs se sirven desde el origin de Supabase (`xxx.supabase.co`), no desde el origin de la aplicación. Cualquier JS embebido en un PDF corre en el contexto de Supabase, sin acceso a las cookies de sesión de la plataforma ni al DOM de la aplicación. El peor caso es redirección o phishing visual dentro de la pestaña del PDF, no exfiltración de sesión. Para V4 evaluar `Content-Disposition: attachment` en signed URLs para forzar descarga en vez de render inline.

- **Videos con encoders raros** — MP4 y MOV tienen múltiples variantes de header. La detección por magic bytes cubre los encoders más comunes, pero archivos con variantes inusuales pueden dar falso rechazo. El usuario puede reintentar con un archivo re-encodado.

---

## 7. Criterios de aceptación

- [ ] Migración `agregar_configuracion_upload` corre sin errores
- [ ] Seed crea 4 configuraciones iniciales (documentos-formalizacion, imagenes-portfolio, imagenes-pedido, imagenes-cotizacion)
- [ ] UI `/admin/configuracion/archivos` existe con tabla de configuraciones
- [ ] Admin puede editar tipos permitidos (6 opciones: pdf, jpeg, png, webp, mp4, mov) y tamaño máximo
- [ ] Admin puede activar/desactivar un contexto
- [ ] Cambios se reflejan en uploads siguientes (dentro de 1 minuto)
- [ ] Helper `validarArchivo()` lee de DB con cache de 1 minuto
- [ ] 2 endpoints de upload (4 contextos) usan el helper
- [ ] Archivos con magic bytes inválidos son rechazados con 400
- [ ] Nombres con path traversal son sanitizados o rechazados
- [ ] Intentos bloqueados aparecen en `/admin/logs`
- [ ] Fail-closed: si no hay config para un contexto, el upload es rechazado
- [ ] Build sin errores de TypeScript

---

## 8. Tests

| # | Qué testear | Cómo | Verificador |
|---|-------------|------|-------------|
| 1 | PDF válido pasa en formalización | Subir PDF real como TALLER | QA |
| 2 | Ejecutable renombrado .pdf es rechazado | Renombrar .exe a .pdf y subir | DEV |
| 3 | Archivo >5 MB es rechazado | Subir archivo grande | QA |
| 4 | Admin cambia límite a 10 MB — archivo de 8 MB pasa | Editar config desde admin, reintentar | QA |
| 5 | Admin desactiva contexto — upload es rechazado | Desactivar toggle, intentar subir | QA |
| 6 | Contexto inexistente en DB = upload rechazado | Borrar record en DB, reintentar | DEV |
| 7 | Cache se invalida al guardar | Editar config, subir archivo, verificar valores nuevos | DEV |
| 8 | Logs de rechazo aparecen en /admin/logs | Después de test 2, verificar log | QA |
| 9 | UI no permite lista vacía de tipos | Intentar guardar sin tipos | QA |
| 10 | Imagen válida pasa en contexto cotizacion | Subir JPEG como TALLER en cotización | QA |

---

## 9. Referencias

- V3_BACKLOG → S-03
- OWASP File Upload Cheat Sheet
- Magic numbers: https://en.wikipedia.org/wiki/List_of_file_signatures
