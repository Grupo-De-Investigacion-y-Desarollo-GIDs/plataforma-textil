# Spec — P-01 + P-02 (recortado) + P-03: Consentimiento, páginas legales y aviso de propósito

**Autor:** Gerardo · **Implementa:** Sergio · **Fecha:** 2026-08-04
**Backlog:** `V4_BACKLOG.md` filas P-01 (4h), P-02 (3h), P-03 (4h) · **Bloque A** (cumplimiento/privacidad)

> **Decisiones de arquitectura (tomadas por Gerardo — no re-decidir):**
> 1. **Persistencia del consentimiento = tabla `Consentimiento`** (auditable y versionable).
> 2. **P-03 = bloque de transparencia arriba del form de `/registro`** (misma pantalla, no una ruta previa ni modal).
> 3. **P-02 RECORTADO:** `/terminos` y `/privacidad` publican el contenido de `docs/legal/*.md` con **render estático desde el repo** (la fuente vive con el código, decisión de Sergio). **SIN edición por admin** — eso queda para P-04–P-08.
> 4. **Coherencia de versión:** lo que el usuario acepta **es** lo que se muestra. La `version` del consentimiento referencia la versión legal publicada, expuesta por una constante única.

---

## 1. Contexto

Hoy `/registro` tiene **un solo checkbox** (`terminos`) validado con zod que **no se persiste**: no queda registro de quién aceptó qué ni cuándo. Las páginas `/terminos` y `/privacidad` son JSX hardcodeado con el texto de **febrero 2026** (desactualizado). No existe aviso de qué datos se piden ni para qué.

Este spec cierra los tres ítems de privacidad del Bloque A que dependen del equipo:
- **P-01** — consentimiento explícito y **auditable** en el registro.
- **P-02 (recortado)** — publicar los textos legales **revisados** (ya en el repo, `docs/legal/*.md`, PR #461) en las páginas públicas.
- **P-03** — aviso de propósito ("qué datos, para qué, quién los ve") antes de completar el registro.

Los tres se entregan juntos porque comparten la misma pantalla y la misma noción de "versión legal vigente".

---

## 2. Qué construir

### 2.1 P-02 — páginas legales desde los `.md` (dependencia de P-01)
- `/terminos` renderiza `docs/legal/TERMINOS_Y_CONDICIONES.md`.
- `/privacidad` renderiza `docs/legal/POLITICA_DE_PRIVACIDAD.md`.
- Render con **`react-markdown`** (ya instalado, `^10.1.0`) dentro del contenedor `prose` existente.
- Cada página muestra **"Última actualización: {LEGAL_VERSION}"** (ver §4.1).
- **Sin** panel de edición admin (fuera de alcance).

### 2.2 P-03 — bloque de transparencia arriba de `/registro`
Un bloque visible al tope del form (antes de los campos) que explica, en lenguaje claro:
- **Qué datos** se piden (nombre, email, CUIT, datos de la entidad).
- **Para qué** (verificar identidad vía ARCA, login, avisos, matching con marcas).
- **Quién los ve** (el equipo de la plataforma; ciertos datos son **visibles para marcas** en el directorio).
- Link **"ver detalle"** → `/privacidad`.

### 2.3 P-01 — checkboxes obligatorios + persistencia
- Al final del form, **3 checkboxes obligatorios**, cada uno con link a su página:
  1. Acepto los **términos y condiciones** → `/terminos`
  2. Acepto la **política de privacidad** → `/privacidad`
  3. Acepto la **visibilidad de mis datos para marcas** → `/privacidad` (sección visibilidad)
- No se puede enviar el registro sin los 3 (zod refine, igual que el `terminos` actual).
- Al crear el usuario, **persistir 3 filas en `Consentimiento`** (una por tipo) con `version = LEGAL_VERSION`.
- Aplica a **ambos** flujos de alta: registro directo (`/api/auth/registro`) y completar registro OAuth/magic-link (`/api/auth/registro/completar`).

---

## 3. Datos (Prisma — **lo aplica Gerardo**, Sergio NO toca el schema)

Gerardo agrega al `schema.prisma` y crea la migración. Sergio implementa el código de la app **contra** este modelo ya migrado.

```prisma
enum TipoConsent {
  TERMINOS
  PRIVACIDAD
  VISIBILIDAD
}

model Consentimiento {
  id         String      @id @default(cuid())
  userId     String
  tipo       TipoConsent
  version    String      // referencia a LEGAL_VERSION vigente al aceptar, p.ej. "2026-08"
  aceptadoEn DateTime    @default(now())
  user       User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, tipo, version])
  @@index([userId])
  @@map("consentimientos")
}

// en model User, agregar la relación inversa:
//   consentimientos Consentimiento[]
```

> El `@@unique([userId, tipo, version])` hace idempotente el alta (re-submit no duplica). El `onDelete: Cascade` limpia al borrar el usuario.

---

## 4. Prescripciones técnicas

### 4.1 Versión legal — fuente única
Crear **`src/compartido/lib/legal.ts`**:
- `export const LEGAL_VERSION = '2026-08'` (bumpear a mano cuando cambien los textos).
- Helper de lectura de los `.md`:
  ```ts
  import { readFile } from 'node:fs/promises'
  import path from 'node:path'
  export async function leerDocLegal(nombre: 'TERMINOS_Y_CONDICIONES' | 'POLITICA_DE_PRIVACIDAD') {
    const ruta = path.join(process.cwd(), 'docs', 'legal', `${nombre}.md`)
    return readFile(ruta, 'utf-8')
  }
  ```
- **Importante (Vercel):** para que los `.md` estén disponibles en runtime serverless, agregar en `next.config.ts` el tracing de esos archivos:
  ```ts
  outputFileTracingIncludes: { '/terminos': ['./docs/legal/**'], '/privacidad': ['./docs/legal/**'] }
  ```
  Verificar en el preview que la página no dé error de "file not found".

### 4.2 P-02 — páginas
- `src/app/(public)/terminos/page.tsx` y `.../privacidad/page.tsx` pasan a **server components `async`**:
  - `const md = await leerDocLegal(...)`.
  - Renderizar con `<ReactMarkdown>` de `react-markdown` dentro de `<div className="prose max-w-none">`.
  - Encabezado: título + `Última actualización: {LEGAL_VERSION}`.
  - Caso borde (§5): si `leerDocLegal` tira, mostrar un fallback simple ("No se pudo cargar el documento") y `console.error`, sin romper la ruta.

### 4.3 P-03 + P-01 — form de registro
- Modificar **`src/app/(auth)/registro/page.tsx`** (client, react-hook-form + zod):
  - **Bloque de transparencia (P-03)** arriba del form (componente propio, p.ej. `AvisoProposito`, en el mismo archivo o `registro/aviso-proposito.tsx`).
  - **Extender el schema zod** del paso final: agregar `privacidad` y `visibilidad` como `z.boolean().refine(v => v === true, '...')`, junto al `terminos` existente. Replicar el patrón de UI del checkbox actual (líneas ~184-192) para los dos nuevos, cada uno con su link.
  - Enviar los 3 flags en el body del POST a `/api/auth/registro` (hoy ya manda `terminos` implícito; asegurar que los 3 viajan o, mejor, que el backend los asume `true` porque el front ya los exige — ver §4.4).

### 4.4 Persistencia del consentimiento
- En **`src/app/api/auth/registro/route.ts`**, dentro de la misma operación donde se hace `prisma.user.create`, envolver en `prisma.$transaction` y crear los 3 consentimientos:
  ```ts
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ /* ...igual que hoy... */ })
    await tx.consentimiento.createMany({
      data: (['TERMINOS','PRIVACIDAD','VISIBILIDAD'] as const).map(tipo => ({
        userId: user.id, tipo, version: LEGAL_VERSION,
      })),
      skipDuplicates: true,
    })
    return user
  })
  ```
- Replicar la escritura de consentimientos en **`src/app/api/auth/registro/completar/route.ts`** (flujo OAuth/magic-link), en el punto donde el usuario queda con `registroCompleto: true`.
- Importar `LEGAL_VERSION` de `@/compartido/lib/legal`.

### 4.5 Qué NO tocar
- El schema lo aplica Gerardo (§3). Sergio programa contra el modelo ya migrado.
- Sin edición admin de los textos (P-04–P-08).
- No cambiar las rutas: siguen siendo `/terminos` y `/privacidad` (no `/terminos-de-uso`).

---

## 5. Casos borde
- **Falta un checkbox:** el submit se bloquea con el mensaje del `refine` (igual que hoy con `terminos`). No llega al backend.
- **Re-submit / doble alta:** `@@unique([userId,tipo,version])` + `skipDuplicates` → no duplica filas.
- **Registro OAuth/magic-link:** el consentimiento se escribe al **completar** (`registro/completar`), no en el primer touch OAuth (ahí todavía no aceptó nada).
- **`.md` no disponible en runtime:** la página muestra fallback y loguea; no rompe el deploy. Verificar el `outputFileTracingIncludes` en preview.
- **Cambio de versión legal futuro:** los usuarios viejos quedan con su `version`; el re-consentimiento al bumpear `LEGAL_VERSION` es alcance de P-04–P-08, **fuera de este spec**.

---

## 6. Criterio de aceptación
- [ ] `/terminos` y `/privacidad` muestran el contenido de `docs/legal/*.md` (react-markdown) + "Última actualización: 2026-08".
- [ ] `/registro` muestra el bloque de transparencia (qué/para qué/quién) arriba, con link a `/privacidad`.
- [ ] `/registro` tiene 3 checkboxes obligatorios (términos, privacidad, visibilidad), cada uno linkeado; el submit se bloquea sin los 3.
- [ ] Tras un alta directa, existen **3 filas** en `consentimientos` para ese `userId` (tipos TERMINOS/PRIVACIDAD/VISIBILIDAD, `version='2026-08'`, `aceptadoEn`).
- [ ] Tras completar un alta OAuth/magic-link, existen las mismas 3 filas.
- [ ] Los links de los checkboxes abren las páginas ya actualizadas (lo que se acepta = lo que se muestra).

---

## 7. Tests (parte del entregable, antes del PR)
- **Vitest (unit):**
  - `POST /api/auth/registro` crea el user **y** 3 `Consentimiento` con `LEGAL_VERSION` (mock de prisma / db de test).
  - `registro/completar` escribe los 3 consentimientos al completar.
  - `leerDocLegal('TERMINOS_Y_CONDICIONES')` devuelve contenido no vacío.
  - El schema zod rechaza el submit si falta cualquiera de los 3 booleanos.
- **Playwright (e2e):**
  - Alta completa marcando los 3 tildes → llega al estado post-registro.
  - Intentar enviar con un tilde faltante → botón/validación lo impide.
  - `/terminos` y `/privacidad` renderizan un heading y texto provenientes de los `.md` (assert de un fragmento conocido).
