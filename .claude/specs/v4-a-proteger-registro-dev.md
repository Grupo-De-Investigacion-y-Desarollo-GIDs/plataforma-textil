# SPEC A — Proteger el registro en DEV: allowlist + MODO_EVENTO

> **Bloque:** Seguridad / Handoff — ítem "proteger dev"
> **Prioridad:** ALTA — hoy el registro del preview está completamente abierto
> **Estado:** ESCRITA — pendiente de implementación. NO implementar hasta OK de Gerardo.
> **Fecha:** 2026-07-16
> **Asignado a:** (a definir — Sergio o Gerardo)
> **Rama sugerida:** `feature/proteger-registro-dev`

---

## 1. Contexto

### 1.1 El problema

El endpoint `POST /api/auth/registro` **no tiene ningún gate de ambiente ni de identidad**. En el preview (que apunta a la base DEV y tiene URL pública) cualquiera crea una cuenta TALLER o MARCA. Así entró `csamaniego@ciaindumentaria.com.ar` sin intervención. No hay allowlist, ni feature-flag, ni bloqueo por entorno.

Esto es un problema por dos motivos:

1. **Higiene de DEV:** el ambiente donde Sergio y los 4 compañeros validan se llena de cuentas no controladas.
2. **Superficie de seguridad:** combinado con el `NEXTAUTH_SECRET` compartido (ver `RUNBOOK_RESCOPE_SECRETS.md`), el registro abierto en DEV es el primer eslabón de una escalada cross-ambiente. Cerrar el secret es la mitad; cerrar el registro es la otra.

### 1.2 La restricción: el evento OIT de agosto

En agosto hay un evento público de la OIT donde el ambiente de demo (probablemente DEV) se abre a **público general desde tablets**, con datos sintéticos. El diseño de "proteger dev" **debe nacer con esa excepción**, no parchearla después. Por eso este spec no bloquea el registro a secas: lo pone detrás de una **allowlist por defecto** y un **flag `MODO_EVENTO`** que la relaja durante una ventana.

> **Decisión abierta (Sergio, Etapa 0 del plan):** si el evento de agosto va sobre un **tercer entorno demo** aislado en vez de sobre DEV, `MODO_EVENTO` sigue siendo útil (se activa en ese entorno) pero la allowlist de DEV puede ser más estricta. Este spec funciona en las dos arquitecturas.

### 1.3 Qué NO rompe (verificado)

- **CI e2e:** los tests usan cuentas seed existentes (`*.@pdt.org.ar`, password `pdt2026`) y **loguean, no registran**. La allowlist no los toca. (Confirmado: `.github/workflows/e2e.yml` corre login por CSRF + credenciales, no `POST /api/auth/registro`.)
- **Feedback-widget de Sergio:** hace POST autenticado a `/api/feedback`, no registra usuarios. No afectado.
- **PROD:** el gate se activa **solo cuando `VERCEL_ENV !== 'production'`**. En producción el registro sigue exactamente igual que hoy. Cero cambio de comportamiento en el piloto.

---

## 2. Qué construir

### 2.1 Comportamiento por ambiente y flag

| `VERCEL_ENV` | `MODO_EVENTO` | Comportamiento del registro |
|---|---|---|
| `production` | (ignorado) | **Abierto** — igual que hoy, sin cambios |
| `preview` / `development` | `off` o ausente | **Allowlist** — solo emails/dominios en `REGISTRO_ALLOWLIST` pueden registrarse; el resto recibe 403 con mensaje claro |
| `preview` / `development` | `on` | **Abierto (modo evento)** — cualquiera se registra; el registro se marca como sintético (ver §2.4) |

### 2.2 Variables de entorno nuevas

| Variable | Scope | Formato | Default |
|---|---|---|---|
| `REGISTRO_ALLOWLIST` | Preview + Development | CSV de emails y/o dominios: `ana@oit.org, @ciaindumentaria.com.ar, sergio@...` | vacío = nadie salvo que MODO_EVENTO esté on |
| `MODO_EVENTO` | Preview + Development | `"on"` para activar; cualquier otro valor o ausente = off | ausente (off) |

> Ambas **NO** se setean en Production (el gate no las lee ahí). Documentar en `CLAUDE.md` §"Env vars en Vercel".

### 2.3 Regla de match de la allowlist

- Cada entrada del CSV se normaliza (`trim().toLowerCase()`).
- Una entrada que **empieza con `@`** es un **dominio**: matchea si el email del registro termina con ella (`ana@oit.org` matchea `@oit.org`).
- Una entrada **sin `@` inicial** es un **email exacto**: matchea por igualdad completa.
- El email del registro ya viene normalizado (`trim().toLowerCase()`) en la ruta actual — reusar ese valor.
- Allowlist vacía + `MODO_EVENTO` off ⇒ **nadie** pasa el gate en DEV (comportamiento seguro por defecto). Loguear un warning al arrancar si esto pasa, para que no sea una sorpresa silenciosa.

### 2.4 Marca de registro sintético (MODO_EVENTO)

Cuando `MODO_EVENTO=on` deja pasar un registro, marcarlo para poder limpiarlo después del evento:

- Emitir `logActividad('REGISTRO_MODO_EVENTO', user.id, { email, role })` tras crear el usuario.
- **No** se agrega columna nueva al schema (Gerardo es el único que toca Prisma, y esto no lo amerita). La traza de `logActividad` alcanza para un barrido de limpieza post-evento (`WHERE accion = 'REGISTRO_MODO_EVENTO'`).

---

## 3. Prescripciones técnicas

### 3.1 Helper nuevo — `src/compartido/lib/registro-gate.ts`

Función pura, testeable sin red ni DB:

```ts
export type ModoRegistro = 'abierto' | 'allowlist' | 'evento'

// Decide el modo según ambiente + flag. No lee la request, solo el entorno.
export function modoRegistro(env = process.env): ModoRegistro {
  if (env.VERCEL_ENV === 'production') return 'abierto'
  if (env.MODO_EVENTO === 'on') return 'evento'
  return 'allowlist'
}

// true si el email pasa la allowlist. Vacía ⇒ false (deny by default).
export function emailPermitido(email: string, csv = process.env.REGISTRO_ALLOWLIST ?? ''): boolean {
  const e = email.trim().toLowerCase()
  const entradas = csv.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
  return entradas.some(entrada =>
    entrada.startsWith('@') ? e.endsWith(entrada) : e === entrada
  )
}
```

> `VERCEL_ENV` es la misma variable que usa `AmbienteBanner` (`src/compartido/componentes/ambiente-banner.tsx`) — Vercel la auto-setea (`production` / `preview` / `development`). No inventar variable propia de ambiente.

### 3.2 Integración en `src/app/api/auth/registro/route.ts`

Insertar el gate **después del parse de zod** (para tener `data.email` normalizado) y **antes de la llamada a ARCA** (no gastar una consulta al padrón en un registro que se va a rechazar). Punto exacto: entre `const data = parsed.data` y `// Verificar CUIT con ARCA`.

```ts
import { modoRegistro, emailPermitido } from '@/compartido/lib/registro-gate'
// ...
const data = parsed.data

// Gate de registro por ambiente (solo fuera de production). En production el modo
// es 'abierto' y esto es un no-op. Ver spec v4-a-proteger-registro-dev.
const modo = modoRegistro()
if (modo === 'allowlist' && !emailPermitido(data.email)) {
  return errorResponse({
    code: 'REGISTRO_RESTRINGIDO',
    message: 'El registro en este ambiente de pruebas esta limitado. Escribi a soporte si necesitas acceso.',
    status: 403,
  })
}
// modo 'evento' y 'abierto' continuan sin gate.
```

Y tras crear el usuario (donde ya se emite `logActividad`), agregar la marca de evento:

```ts
if (modo === 'evento') {
  logActividad('REGISTRO_MODO_EVENTO', user.id, { email: data.email, role: data.role })
}
```

### 3.3 UI del formulario de registro

El formulario cliente (`src/app/(auth)/registro/…`) debe manejar el `403 REGISTRO_RESTRINGIDO` mostrando el `message` del error con el sistema de toast/error existente (NO `alert()`). No hace falta ocultar el formulario: el gate es server-side y autoritativo; la UI solo comunica el rechazo. Reusar el mismo patrón de manejo de error que ya tiene el form para el `409 email ya registrado`.

### 3.4 Lo que NO se toca

- Schema de Prisma (exclusivo de Gerardo — este spec no lo necesita).
- El middleware (`middleware.ts`) — `/registro` sigue siendo ruta pública; el gate vive en el endpoint, no en el gating de navegación.
- El comportamiento de PROD (verificado no-op vía `VERCEL_ENV`).
- La lógica de ARCA / normalización de CUIT (ya cerrada en el circuito CUIT).

---

## 4. Casos borde

- **`REGISTRO_ALLOWLIST` vacía en DEV, `MODO_EVENTO` off:** nadie se registra. Es el default seguro. El warning de arranco (§2.3) evita que sea una sorpresa.
- **`MODO_EVENTO=on` olvidado después del evento:** el registro queda abierto en DEV. Mitigación: (a) la marca `REGISTRO_MODO_EVENTO` deja rastro auditable; (b) agregar al checklist post-evento "apagar `MODO_EVENTO`". No es un fallo de seguridad de PROD (el flag no se lee en production), pero sí de higiene de DEV.
- **Valor raro en `MODO_EVENTO`** (`"true"`, `"1"`, `"ON"`): el helper solo acepta el literal `"on"`. Cualquier otro valor ⇒ allowlist. Documentado.
- **Email con mayúsculas o espacios:** normalizado en ambos lados (registro ya hace `trim().toLowerCase()`; el helper repite la normalización defensivamente).
- **Dominio en la allowlist sin `@` inicial** (`oit.org` en vez de `@oit.org`): se trata como email exacto y no matchea ningún email → no pasa. Documentar el formato con `@` en el ejemplo de la env var.
- **Registro de segundo rol (`/api/usuarios/me/roles`):** ese flujo requiere sesión ya iniciada (el usuario ya pasó el gate al registrarse). NO se le agrega allowlist — no es una entrada nueva de identidad. Fuera de alcance.

---

## 5. Criterios de aceptación

- [ ] En `production` (o sin `VERCEL_ENV`), el registro funciona igual que hoy — ningún email rechazado por el gate
- [ ] En preview con allowlist cargada, un email **en** la lista se registra; uno **fuera** recibe 403 `REGISTRO_RESTRINGIDO`
- [ ] En preview con dominio `@x.com` en la lista, `alguien@x.com` pasa y `alguien@y.com` no
- [ ] Con `MODO_EVENTO=on` en preview, cualquier email se registra y queda `logActividad('REGISTRO_MODO_EVENTO')`
- [ ] La allowlist vacía + `MODO_EVENTO` off en preview rechaza todo y loguea el warning
- [ ] El form de registro muestra el mensaje del 403 con toast/error (no `alert`)
- [ ] El gate corre **antes** de la llamada a ARCA (un registro rechazado no consulta el padrón)
- [ ] CI e2e sigue verde (no registra, usa cuentas seed)

---

## 6. Tests

Archivo nuevo `src/__tests__/registro-gate.test.ts` (Vitest, unit — el helper es puro):

| # | Qué testea |
|---|---|
| 1 | `modoRegistro` → `'abierto'` con `VERCEL_ENV='production'` |
| 2 | `modoRegistro` → `'evento'` con `MODO_EVENTO='on'` y env no-prod |
| 3 | `modoRegistro` → `'allowlist'` con env no-prod y sin flag |
| 4 | `emailPermitido` email exacto: match y no-match |
| 5 | `emailPermitido` dominio `@x.com`: match por sufijo y no-match |
| 6 | `emailPermitido` allowlist vacía ⇒ `false` |
| 7 | `emailPermitido` normaliza mayúsculas/espacios en email y en CSV |
| 8 | `MODO_EVENTO` con valor ≠ `'on'` ⇒ `'allowlist'` |

Extender `src/__tests__/registro-*.test.ts` (o el que cubre el endpoint) con:

| # | Qué testea |
|---|---|
| 9 | POST registro con email fuera de allowlist en preview ⇒ 403 `REGISTRO_RESTRINGIDO`, **sin** llamada a `consultarPadron` (mock del padrón no invocado) |
| 10 | POST registro con email en allowlist ⇒ pasa al flujo normal (ARCA + create) |
| 11 | POST registro con `VERCEL_ENV='production'` ⇒ ignora allowlist (no-op) |

> Los tests del endpoint mockean `process.env` por caso (`vi.stubEnv`) y el `consultarPadron` de `arca` para aislar el gate.

---

## 7. Relación con el resto del plan de seguridad

Este spec es la **Etapa 3** del handoff. Complementa:

- **Etapa 2 — separar `NEXTAUTH_SECRET`** (`RUNBOOK_RESCOPE_SECRETS.md` §1): cerrar el registro abierto reduce la superficie; separar el secret cierra la escalada cross-ambiente. Los dos juntos cierran el vector completo. Ninguno depende del otro para implementarse, pero el valor de seguridad es mayor con ambos.
- **Etapa 4 — entorno de agosto:** si Sergio elige tercer entorno demo, `MODO_EVENTO` se activa ahí; si elige DEV, se activa en DEV por la ventana. El código es el mismo.

---

## 8. Referencias

- `src/app/api/auth/registro/route.ts` — endpoint a modificar (insertar gate tras parse, antes de ARCA)
- `src/compartido/componentes/ambiente-banner.tsx` — precedente de uso de `VERCEL_ENV`
- `.claude/specs/RUNBOOK_RESCOPE_SECRETS.md` — Etapa 1/2 del mismo handoff
- `.github/workflows/e2e.yml` — confirma que CI loguea, no registra (allowlist no lo afecta)
- Issue #447 (federación no puede crear cuenta) — recordatorio de que el registro es sensible a cambios; probar el flujo feliz tras el gate
