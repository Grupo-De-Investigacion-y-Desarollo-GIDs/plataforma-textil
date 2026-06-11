# B-05 — Fix del race de clobbering de cookie en rolling JWT session

> **Estado:** IMPLEMENTADO (branch `feature/b-05-fix-race-sesion`). Decisiones de Gerardo cerradas (ver §8). NO mergeado — es auth, queda para revisión final + smoke manual.
>
> **Decisiones cerradas (Gerardo):**
> 1. Alcance: **A + B** (middleware read-only + cookie server-side en los 2 endpoints).
> 2. Trade-off sliding-expiry: **ACEPTADO**, condicionado al gate del PASO 0 (verificado: toda ruta autenticada monta `useSession` vía `SessionProvider` en el root layout + `FeedbackWidget` global + `Header` en taller/marca/estado).
> 3. `update()` cliente: **queda redundante** (propaga al SessionProvider/broadcast multi-tab); su eliminación es follow-up.
> 4. Test multi-tab: **SÍ, en este PR** (en `u-04-toggle-multi-rol.spec.ts`, serial + afterEach reset julieta).
> 5. `updateAge`: queda en config (inerte); **comentario corregido** en `auth.config.ts`.
> 6. `getToken` vs `decode`: **`decode` manual** (helper único `session-cookie.ts`, reusado por `n/[token]`) + unit test de round-trip y anti-escalación.
> **Severidad:** MEDIA-ALTA. Reproducible en flujo normal (toggle a Marca → navegar → cae en Taller). Determinístico 3/3 en CI. El usuario queda pisado hasta re-login.
> **Test de aceptación (ya escrito):** `tests/e2e/u-04-toggle-multi-rol.spec.ts` → `test.fixme('el modo activo persiste…')`. Des-fixmearlo y que pase estable = criterio de éxito.

---

## 1. Contexto

### El síntoma
Un usuario multi-rol (Julieta: `roles=[TALLER, MARCA]`, `activeMode=TALLER`) abre el toggle "Operando como…", elige **Marca**, es redirigido a `/marca` correctamente. Pero al navegar a `/` (o recargar), el middleware lo manda de vuelta a `/taller`. La DB tiene `activeMode=MARCA`; la **cookie de sesión** quedó pisada en `TALLER`. No se auto-cura: solo el re-login lo arregla (porque `authorize()` relee la DB).

### El mecanismo (verificado en código fuente, no inferido)
Estrategia de sesión: **JWT** + rolling (`maxAge 7d`, `updateAge 24h`) — `src/compartido/lib/auth.config.ts:29-33`.

**Hallazgo central del discovery (PASO 1):** con `strategy: 'jwt'`, Auth.js v5 **re-encripta y re-emite la cookie de sesión en CADA lectura de sesión, incondicionalmente**. No hay ningún chequeo de `updateAge` en la rama JWT.

Fuente: `node_modules/next-auth/node_modules/@auth/core/lib/actions/session.js`, rama `sessionStrategy === "jwt"` (líneas 21-64):

```js
// Refresh JWT expiry by re-signing it, with an updated expiry date
const newToken = await jwt.encode({ ...jwt, token, salt });
// Set cookie, to also update expiry date on cookie
const sessionCookies = sessionStore.chunk(newToken, { expires: newExpires });
response.cookies?.push(...sessionCookies);   // ← SIEMPRE, sin gate de updateAge
```

`updateAge` **solo** se respeta en la rama de **database-session** (líneas 77-92), y aún ahí solo throttlea el *write a la DB* — la cookie igual se re-emite. **Conclusión: nuestro `updateAge: 24h` es config muerta bajo JWT, y el comentario de `auth.config.ts:32` ("renueva cada 24h si hay actividad") es engañoso.** Esto es **comportamiento esperado de Auth.js v5, NO un bug de configuración nuestro.**

### Por qué el `updateAge` no nos salva (responde la pregunta clave del PASO 1)
La hipótesis previa era: "si `updateAge=24h`, ¿por qué Set-Cookie en cada GET?". **Respuesta: porque para JWT `updateAge` no gobierna la re-emisión; v5 hace sliding-window re-firmando el token en cada lectura.** No es un bug nuestro ni hay un flag para apagarlo. Esto **descarta** la "OPCIÓN A original" (config / honrar updateAge) como fix de bajo costo, y reorienta el espacio de soluciones (ver §3).

### La vía dominante de re-emisión: el middleware
`src/middleware.ts` envuelve **todas** las navegaciones de página con `export default auth((req) => {…})`. El wrapper de v5, tras correr nuestro handler, **mergea la cookie re-emitida sobre el `NextResponse`** (incluso sobre un `NextResponse.next()`). Por eso cada navegación re-emite la cookie firmando el token que **esa request transportó**.

> El matcher excluye `/api`, así que `/api/auth/session` (el endpoint de `update()` y del polling de `useSession`) **no** pasa por middleware. La re-emisión problemática viene de las **navegaciones de página**, que son la mayoría del tráfico autenticado.

### La ventana de race (paso a paso del flujo del test)
1. `cambiarModo('MARCA')` → `PATCH /api/usuarios/me/active-mode` → **DB = MARCA**. (`modo-toggle.tsx:59`)
2. `await update({ activeMode: 'MARCA' })` → `POST /api/auth/session` (trigger `update`) → callback `jwt` setea `token.activeMode=MARCA` → **Set-Cookie(MARCA)**. La cookie del browser debería quedar en MARCA. (`modo-toggle.tsx:70`)
3. `router.push('/marca')` + `router.refresh()` (`modo-toggle.tsx:81-82`) → requests de navegación **a través del middleware**. Next.js además dispara **prefetches RSC** automáticos. Cualquiera de esas requests que haya salido con la cookie **previa (TALLER)** —porque se despachó antes de que el Set-Cookie del paso 2 se committeara al cookie jar— al pasar por el middleware **re-emite Set-Cookie(TALLER)** → **pisa la cookie MARCA** (last-write-wins en el jar).
4. `page.goto('/')` → el middleware lee la cookie (ahora **TALLER** pisada) → redirige a `/taller`. El gate lee la cookie, **no la DB**, así que re-navegar no recupera.

### Decisiones de arquitectura que aplican
- Gating por **membresía en `roles[]`** (`tieneAlgunRol` / `modoActivo`), no por el escalar — el race es sobre `activeMode`, que decide el dashboard, no sobre permisos. **No hay escalada de privilegios** acá: el peor caso es "veo el dashboard del rol equivocado", ambos roles ya son míos.
- `auth.config.ts` debe seguir siendo Edge-safe (sin Prisma): el middleware corre en Edge.
- Invariante U-03: `role == activeMode` en el token.

### Flujos afectados
- **Toggle de modo** (`modo-toggle.tsx` → `update({ activeMode })`).
- **Agregar rol** (`agregar-rol-card.tsx` → `update({ activeMode, roles })`) — mismo mecanismo, además expande `roles[]` en la cookie; un clobber acá puede devolver el JWT a single-rol y mandar a `/unauthorized`.

---

## 2. Qué construir (resumen; el detalle técnico está en §4)

Eliminar la posibilidad de que una lectura de sesión concurrente pise la cookie recién actualizada por un cambio de modo/rol. Dos palancas independientes y combinables:

- **A — Middleware read-only:** que el middleware **lea** el JWT sin re-emitir Set-Cookie. Remueve la vía dominante de clobbering (toda navegación). **Fix núcleo recomendado.**
- **B — Set de cookie server-side en los endpoints de mutación:** que `active-mode` y `me/roles` re-firmen el token y seteen la cookie **en la misma response que el cliente espera**, en vez de depender del `update()` cliente posterior. Hardening; complementa A. Precedente en repo: `src/app/n/[token]/route.ts`.

El **criterio de éxito** es des-fixmear `u-04 'el modo activo persiste'` y que pase estable (no flaky), sin romper ningún e2e existente.

---

## 3. Opciones evaluadas (mínimo 3)

### OPCIÓN A — Middleware read-only (decode sin re-emitir) — **RECOMENDADA (núcleo)**
**Qué cambia:** reemplazar `export default auth((req) => {…})` por un `export default function middleware(req)` que lea el token con `getToken`/`decode` de `next-auth/jwt` (lectura pura, **sin** Set-Cookie), y construya el `FuenteRoles` desde el token decodificado para alimentar la lógica de gating **idéntica** que ya existe.

- **Qué resuelve:** elimina al **único** escritor de cookie en la ruta de navegación. Tras el `update()` del paso 2, nada vuelve a re-emitir en los pasos 3-4 → la cookie MARCA sobrevive. **Des-fixmea el test de forma determinística.**
- **Qué NO resuelve (honestidad):** dos llamadas concurrentes a `/api/auth/session` (p.ej. dos refetch de `useSession` alrededor del `update()`) podrían todavía pisarse entre sí. Es una ventana mucho menor, no está en la ruta de navegación, y `SessionProvider` de next-auth sincroniza pestañas por broadcast/storage events. Multi-tab queda mitigado, no demostrado al 100%.
- **Riesgo:** es middleware de auth. Hay que (i) pasar `cookieName` (`__Secure-authjs.session-token` / `authjs.session-token`) y `secret` (`NEXTAUTH_SECRET`) correctos a `getToken`; (ii) reconstruir el shape `{ roles, role, activeMode, registroCompleto }` desde el token; (iii) perder el refresh de expiry sliding que daba el middleware.
- **Mitigación del (iii):** `useSession` vive en `header.tsx` (layout, todas las páginas autenticadas) → `SessionProvider` (`src/app/providers.tsx`) sigue pegándole a `/api/auth/session`, que **sí** re-emite y refresca la expiry. La ventana sliding se preserva por el cliente, no por el middleware. **A confirmar** que toda página autenticada monta el header (ver §8).
- **Esfuerzo:** ~0.5 día (reescritura del read del middleware + regresión de auth).
- **Validación:** des-fixmea u-04 + suite e2e completa (gating por rol) + chequeo manual de login/logout/expiry.

### OPCIÓN B — Set de cookie server-side en `active-mode` y `me/roles` — **RECOMENDADA (hardening)**
**Qué cambia:** los endpoints, tras confirmar la DB, **re-firman** el token (con el `activeMode`/`roles[]` nuevos) usando `encode` de `next-auth/jwt` y setean la cookie de sesión en la **misma** `NextResponse` (`response.cookies.set`). El `update()` cliente pasa a ser redundante (se puede eliminar o dejar como cinturón-y-tiradores).

- **Viabilidad:** **probada en repo.** `src/app/n/[token]/route.ts:42-66` ya hace exactamente esto para el magic-link: `encode({ token, secret: NEXTAUTH_SECRET, salt: cookieName })` + `response.cookies.set({ name: cookieName, … })`. El patrón es conocido y funciona con nuestras cookies custom.
- **Qué resuelve:** el estado autoritativo aterriza en la cookie **dentro de la response que el `fetch` del cliente espera** → desaparece el round-trip separado de `update()` que se interleavaba con las navegaciones. Para "agregar rol" garantiza que `roles[]` expandido viaja en la cookie sin depender del `update()`.
- **Qué NO resuelve por sí sola:** **no** detiene la re-emisión del middleware. Si el middleware sigue con el wrapper `auth()`, una navegación/prefetch stale aún puede pisar. **B sola NO elimina el race** — necesita A (o que A ya esté).
- **Riesgo:** re-implementa el firmado del token de Auth.js fuera de la librería (acoplamiento a internals/versión). Hay que mantener el payload del token en lockstep con el callback `jwt` (id, role, roles, activeMode, registroCompleto, email, name, sub). Mitigado por: extraer un helper único `firmarSessionToken()` reutilizado por `n/[token]` y los dos endpoints (single source).
- **Esfuerzo:** ~0.5 día (helper compartido + cablear 2 endpoints + decidir si se borra el `update()` cliente).
- **Validación:** misma que A; además verificar que tras el PATCH la cookie ya trae el estado nuevo (test de doble-contexto).

### OPCIÓN C — Mitigación cliente: drenar/serializar lecturas antes de navegar — **RECHAZADA como primaria**
**Qué cambia:** tras `update()`, bloquear la navegación hasta confirmar la cookie nueva (p.ej. re-fetch de `/api/auth/session` y verificar `activeMode`, o un pequeño delay/guard antes de `router.push`).

- **Qué NO resuelve:** los **prefetches RSC automáticos** que Next dispara (hover/viewport) no pasan por este guard; tampoco cubre multi-tab; es timing-dependiente y frágil. El código ya `await`-ea `update()` antes de `push` y aun así el race ocurre, justamente por las lecturas concurrentes fuera del control del componente.
- **Esfuerzo:** bajo, pero **no es un fix**, es un parche que reduce probabilidad sin cerrar la causa raíz.
- **Veredicto:** sirve como racionalización del problema, no como solución. Descartada.

### OPCIÓN D — Combinación recomendada: **A (núcleo) + B (hardening)**
A hace determinístico el flujo testeado (remueve el clobber de navegación). B cierra el residual de concurrencia en `/api/auth/session` y multi-tab, y hace que el estado autoritativo viaje en la response esperada. Con A+B se puede **eliminar el `update()` cliente** (o dejarlo inerte). Es el camino con mejor relación robustez/riesgo.

---

## 4. Prescripciones técnicas

> El alcance final (A-sola vs A+B) lo decide Gerardo en §8. Acá se prescribe cada pieza; el implementador no improvisa arquitectura.

### Pieza A — `src/middleware.ts`
- **Quitar** el wrapper `export default auth((req) => {…})` y el `const { auth } = NextAuth(authConfig)`.
- **Usar** `export default async function middleware(req: NextRequest)` (o `proxy.ts` si se migra; ver CLAUDE.md — **no** migrar en este PR salvo decisión explícita).
- Leer el token con `getToken` de `next-auth/jwt`:
  ```ts
  import { getToken } from 'next-auth/jwt'
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET!,
    secureCookie: process.env.NODE_ENV === 'production',
    cookieName: process.env.NODE_ENV === 'production'
      ? '__Secure-authjs.session-token'
      : 'authjs.session-token',
    salt: ... // ver nota de versión abajo
  })
  ```
  - **Nota de versión (a validar en implementación):** la firma exacta de `getToken` en `next-auth@5.0.0-beta.30` puede requerir `salt` = `cookieName`. Si `getToken` no expone la firma esperada en esta beta, usar `decode` de `next-auth/jwt` directamente leyendo `req.cookies.get(cookieName)?.value` (mismo patrón que `n/[token]` usa con `encode`). El criterio: **lectura pura, cero `Set-Cookie`.**
- Reconstruir el `FuenteRoles` desde el token decodificado: `{ roles: token.roles, role: token.role, activeMode: token.activeMode }`. Reemplaza `req.auth?.user`.
- `isLoggedIn = !!token`. `registroCompleto = token?.registroCompleto`.
- **La lógica de gating (rutas públicas, redirects por rol, `/` → dashboard) NO cambia** — solo cambia de dónde sale el `sessionUser`/`isLoggedIn`. Cero cambios en `tieneAlgunRol`/`modoActivo`.
- Mantener `auth.config.ts` como está (lo usan `auth.ts` y los endpoints vía `auth()`); el middleware deja de instanciarlo.

### Pieza B — helper de firmado + endpoints
- **Crear** `src/compartido/lib/session-cookie.ts` con un único `firmarSessionToken(payload)` + `nombreCookieSesion()` + `opcionesCookieSesion()`, extrayendo la lógica hoy inline en `n/[token]/route.ts` (DRY: refactorizar también `n/[token]` para que lo use — single source del salt/secret/cookieName).
- En `src/app/api/usuarios/me/active-mode/route.ts`: tras el `prisma.user.update`, leer el token actual (decode de la cookie entrante), mutar `activeMode`/`role`, re-firmar y `response.cookies.set(...)` en la respuesta. Devolver `NextResponse` con la cookie seteada.
- En `src/app/api/usuarios/me/roles/route.ts`: ídem, con `roles[]` expandido + `activeMode`/`role` nuevos.
- **Mantener el invariante** `role == activeMode` y el payload del token en lockstep con el callback `jwt` de `auth.config.ts` (id, sub, email, name, role, roles, activeMode, registroCompleto).
- **Cliente:** decidir (§8) si se elimina `update({…})` en `modo-toggle.tsx` y `agregar-rol-card.tsx` (ya no necesario si B setea la cookie) o se deja como redundancia inofensiva. `router.refresh()`/`router.push()` se mantienen.

### Qué NO tocar
- El schema de Prisma (no aplica).
- `auth.ts` / `authorize()` (el login sigue igual).
- La lógica de negocio de gating.
- `updateAge`/`maxAge`: **opcional** corregir el comentario engañoso de `auth.config.ts:32` y/o eliminar `updateAge` (es inerte bajo JWT) — decisión en §8, no bloqueante.

---

## 5. Casos borde

| Caso | Comportamiento esperado | Cubierto por |
|---|---|---|
| Toggle Taller→Marca→navegar a `/` | Queda en `/marca` (cookie = DB) | u-04 des-fixmeado |
| Agregar 2º rol y navegar | JWT trae `roles[]` expandido; no cae en `/unauthorized` | u-09 e2e + nuevo |
| Multi-tab: tab A togglea, tab B tiene `useSession` | Tab B se sincroniza (broadcast) o, con B, su próxima lectura ve cookie nueva | nuevo test doble-contexto (§7) |
| Sesión expirada / token inválido | Middleware read-only: `getToken`/`decode` → `null` → trata como no logueado → redirect `/login` | e2e existente + manual |
| Logout | `signOut` limpia cookie; middleware lee `null` → `/login` | e2e + manual |
| Magic-link (`n/[token]`) | Sigue funcionando; si se refactoriza al helper compartido, mismo resultado | e2e/manual del magic-link |
| Usuario OAuth/registro incompleto | `token.registroCompleto === false` → redirect `/registro/completar` (lógica intacta) | e2e existente |
| Token de magic-link sin `roles[]` | (Aside, fuera de scope B-05) el callback `jwt` solo puebla `roles` `if (user)`; magic-link arma token mínimo. Anotar como deuda separada, no resolver acá. | — |

---

## 6. Criterio de aceptación

- [ ] `tests/e2e/u-04-toggle-multi-rol.spec.ts` → `test('el modo activo persiste…')` **des-fixmeado** y verde **estable** (sin flaky; correr el run varias veces / mirar contador flaky).
- [ ] Ningún e2e existente roto (auth.setup de los 4 roles + u-04 + u-09 + suite completa).
- [ ] El middleware **no** emite `Set-Cookie` en navegaciones de página (verificable por trace/inspección de headers en una navegación autenticada).
- [ ] (Si B) Tras `PATCH /me/active-mode`, la response trae `Set-Cookie` con el token re-firmado; el `activeMode` de la cookie coincide con la DB sin pasar por `update()`.
- [ ] Login, logout y redirect de registro-incompleto siguen funcionando (manual + e2e).
- [ ] Sin regresión de gating por rol (un TALLER no entra a `/marca`, etc.).
- [ ] (Opcional, si se decide) comentario de `updateAge` corregido o `updateAge` removido.

---

## 7. Tests

- **Aceptación (existente, des-fixmear):** u-04 "el modo activo persiste". Es la prueba canónica del fix.
- **Regresión:** suite e2e completa vía CI (corre contra el preview/DEV). Atención al **contador de flaky** (skill playwright-e2e §5): un verde por retry no es verde.
- **Nuevo — doble contexto / multi-tab (recomendado):** `tests/e2e/u-04-sesion-multitab.spec.ts`:
  - Dos `browser.newContext()` (o dos páginas en el mismo context que comparten cookie jar) del mismo usuario `dual`.
  - Contexto A togglea a Marca; contexto B (con `useSession` montado) navega; assert que B no fuerza un re-emit que pise a A. Honestidad: si compartido cookie jar, valida el clobbering real; si contexts separados, valida aislamiento.
  - **Decisión de alcance en §8:** ¿este test entra en el PR del fix o como follow-up?
- **Unit (si B):** test del helper `firmarSessionToken()` — round-trip `encode`/`decode` preserva `activeMode`/`roles[]` y respeta el salt = cookieName.

> Recordatorio (memoria de proyecto): tests automatizados son parte del entregable del spec, no opcionales.

---

## 8. Decisiones que necesito de Gerardo

1. **Alcance del fix:** ¿**A sola** (mínimo que des-fixmea el test, ~0.5 día), **A+B** (robusto, cierra residual de concurrencia/multi-tab, ~1 día), o **B sola** (no recomendado: no cierra el clobber de navegación)?
2. **OPCIÓN A — sliding expiry:** ¿se acepta perder el refresh de expiry vía middleware, apoyándose en que `useSession` (header, `SessionProvider` en `providers.tsx`) refresca por `/api/auth/session`? **Necesito confirmar** que toda página autenticada monta el header (¿hay alguna ruta autenticada sin layout con header?).
3. **OPCIÓN B — `update()` cliente:** si vamos con B, ¿se **elimina** `update({…})` en `modo-toggle.tsx`/`agregar-rol-card.tsx`, o se deja como redundancia inofensiva?
4. **Test multi-tab:** ¿el nuevo e2e de doble-contexto entra en **este** PR o como follow-up?
5. **`updateAge` muerto:** ¿corregimos/eliminamos el `updateAge: 24h` + su comentario engañoso (`auth.config.ts:32`) en este PR, o lo dejamos para no ampliar el diff de auth?
6. **`getToken` vs `decode` en la beta:** si la firma de `getToken` en `next-auth@5.0.0-beta.30` no encaja con nuestras cookies custom, ¿OK con usar `decode` + lectura manual de la cookie (mismo patrón que `n/[token]`)? (Es detalle de implementación, pero toca auth — lo dejo explícito.)

---

## 9. Riesgos de tocar auth y cómo se cubren

- **Es el core de sesión.** Un error rompe login/logout/gating para todos. Cobertura: A mantiene la lógica de gating **byte-idéntica** (solo cambia el origen de `req.auth`); la suite e2e con los 4 roles + flujos U es la red de seguridad; chequeo manual de logout y expiry.
- **Acoplamiento a internals de Auth.js (B):** firmar el token a mano puede romperse en un upgrade de `next-auth`. Mitigado por: helper único compartido con `n/[token]` (que ya depende de `encode`), y un unit test de round-trip que falla si el formato cambia.
- **Edge runtime:** `getToken`/`decode` deben correr en Edge (lo hacen). `auth.config.ts` sigue Edge-safe.
- **Magic-link:** si se refactoriza `n/[token]` al helper, re-testear ese flujo (no regresión del auto-login por WhatsApp).
- **Pérdida de sliding expiry por middleware (A):** mitigado por `useSession`/`SessionProvider`; riesgo residual si existe una página autenticada sin header (decisión #2).

---

## Apéndice — evidencia del discovery

- Re-emisión incondicional JWT: `node_modules/next-auth/node_modules/@auth/core/lib/actions/session.js` rama `jwt` (líneas 21-64; `jwt.encode` + `response.cookies.push` sin gate de `updateAge`). `updateAge` solo en rama DB (líneas 77-92).
- Middleware envuelve toda navegación: `src/middleware.ts` (`export default auth(...)`, matcher excluye `/api`).
- Mutación de modo: `src/app/api/usuarios/me/active-mode/route.ts` (DB autoritativa, sin set de cookie) + `src/compartido/componentes/layout/modo-toggle.tsx:59-82` (`fetch` + `update()` + `push`/`refresh`).
- Mutación de rol: `src/app/api/usuarios/me/roles/route.ts` + `src/compartido/componentes/agregar-rol-card.tsx:43-64`.
- Precedente de set de cookie server-side: `src/app/n/[token]/route.ts:1-66` (`encode` de `next-auth/jwt`, `salt: cookieName`, `secret: NEXTAUTH_SECRET`, `response.cookies.set`).
- Config de sesión: `src/compartido/lib/auth.config.ts:29-33` (`strategy jwt`, `maxAge 7d`, `updateAge 24h` — inerte), callbacks `jwt`/`session` (líneas 58-132).
- Test de aceptación: `tests/e2e/u-04-toggle-multi-rol.spec.ts:61-82` (`test.fixme`).
- `SessionProvider`: `src/app/providers.tsx`; `useSession` en `src/compartido/componentes/layout/header.tsx`.
