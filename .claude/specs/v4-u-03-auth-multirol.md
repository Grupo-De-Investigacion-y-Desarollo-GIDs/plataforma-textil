# SPEC V4 — U-03: Refactor de auth y sesiones para multi-rol

> **Estado:** PENDIENTE de implementación
> **Rama:** `feature/u-03-auth-multirol`
> **Depende de:** U-02 (schema multi-rol, MERGEADO — `User.roles[]` + `User.activeMode` existen y están backfilleados)
> **Habilita:** U-04 (toggle de modo en UI), U-08 (tests e2e multi-rol)
> **Decisiones aplicadas:** D1 (Opción A: array `roles[]` + `activeMode`), D8 (helper uniforme `requiereRol`/`requiereRolApi`)

---

## 0. Pre-flight checks (BLOQUEANTE)

Antes de tocar código, Sergio debe correr estos comandos y confirmar que los números coinciden con la "Superficie real" (sección 2). Si difieren mucho, parar y avisar a Gerardo — significa que la base cambió desde que se escribió el spec.

```bash
# Entorno
git checkout feature/u-03-auth-multirol
git rev-parse --short HEAD   # debe partir de develop f3375d5 o posterior

# Confirmar que el schema YA tiene las columnas (no se tocan en U-03)
grep -n "roles\s*UserRole\|activeMode" prisma/schema.prisma

# Superficie de lectura de rol
grep -rn "session\.user\.role\|user\.role\b" src/ --include="*.ts" --include="*.tsx" | wc -l   # ~34
grep -rln "await auth()" src/app/api | wc -l        # ~63 archivos
grep -rln "requiereRolApi" src/app/api | wc -l      # ~8 (adopción actual)
grep -rln "requiereRol" src/app --include="*.tsx" | wc -l   # ~4 pages
```

### 0.1 Output bloqueante del pre-flight
- [ ] Las columnas `roles` y `activeMode` existen en `prisma/schema.prisma` (U-02 mergeado)
- [ ] Los conteos de superficie están dentro del ±15% de la sección 2
- [ ] `npm run build` pasa en verde ANTES de empezar (línea base sana)
- [ ] La suite e2e pasa en verde ANTES de empezar (línea base sana)

---

## 1. Contexto

### El problema
U-02 agregó `User.roles UserRole[]` y `User.activeMode UserRole?` al schema y los backfilleó (`roles = [role]`, `activeMode = role`). Pero **son columnas huérfanas**: hoy ningún gate las lee. TODO el control de acceso sigue gateando por el escalar `User.role`:

- La sesión (JWT + callbacks) solo carga y expone `role`.
- El middleware decide por `req.auth.user.role`.
- Los 6 layouts redirigen por `session.user.role`.
- ~58 de 83 API routes chequean `session.user.role` (mayoría inline, no por helper).

Mientras el código gatee por `role`, un usuario con `roles = [TALLER, MARCA]` solo puede actuar como su `role` escalar. Multi-rol no funciona aunque el dato exista.

### Objetivo de U-03
Que **la sesión exponga `roles[]` + `activeMode`** y que **todos los gates migren a usarlos**, manteniendo `role` en sync para back-compat mientras dura la migración. No se construye UI de cambio de modo (eso es U-04).

### Decisiones aplicadas
| Dec | Qué | Implicancia en U-03 |
|-----|-----|---------------------|
| D1 | Opción A: `roles[]` + `activeMode` | La sesión carga ambos; el gate de "área permitida" usa `roles[]`, el de "modo actual" usa `activeMode` |
| D8 | Helper uniforme `requiereRol`/`requiereRolApi` | El helper YA existe en `src/compartido/lib/permisos.ts` pero (a) lee solo `role` escalar y (b) está poco adoptado. U-03 lo extiende y lo adopta en toda la superficie |

### Riesgo clave declarado
**"Media migración"** — un endpoint olvidado que siga gateando por `role` con un valor stale = agujero de permisos. La estrategia (sección 3) lo neutraliza manteniendo `role` sincronizado con `activeMode`, de modo que ningún gate sin migrar se rompe ni se abre.

---

## 2. Superficie real (medida, no estimada)

Medido sobre `feature/u-03-auth-multirol` (base develop `f3375d5`):

| Superficie | Conteo | Detalle |
|-----------|--------|---------|
| Lecturas de `session.user.role` / `user.role` | **34** | Across `.ts` + `.tsx` |
| API route files totales | **83** | `src/app/api/**/route.ts` |
| API route files que mencionan `role` | **58** | Superficie de gating en API |
| API routes con `await auth()` directo | **63** | Obtienen sesión sin helper |
| API routes usando `requiereRolApi` (helper) | **8** | Adopción actual del helper |
| Chequeos inline en API: `includes(...role...)` | **11** | |
| Chequeos inline en API: `role ===` / `role !==` | **17** | |
| Layouts con gate de rol | **6** | `(admin)`, `(contenido)`, `(estado)`, `(marca)`, `(public)`, `(taller)` |
| Pages usando `requiereRol` (helper) | **4** | Las 4 de `(estado)` |
| Type assertions `as { role }` / `user as` | **88** | Casts defensivos redundantes (la `d.ts` ya tipa `role`) |
| Usos de `activeMode` en código | **0** | Columna huérfana |
| Usos de `.roles` (array) en código | **1** | Columna huérfana |

**Archivos núcleo del refactor (capa de sesión):**
- `src/compartido/lib/auth.ts` — `authorize()` arma el objeto user (línea ~48: retorna `role`, falta `roles`/`activeMode`)
- `src/compartido/lib/auth.config.ts` — callbacks `jwt` y `session` (cargan/exponen solo `role`)
- `src/compartido/types/next-auth.d.ts` — tipos de `User`, `Session.user`, `JWT` (solo `role`)
- `src/compartido/lib/permisos.ts` — helpers `requiereRol` (server comp) + `requiereRolApi` (API)
- `src/middleware.ts` — gate por prefijo de ruta + redirect de home por rol

---

## 3. Qué construir — estrategia incremental (sin big-bang)

El backfill de U-02 (`activeMode = role`, `roles = [role]`) es lo que permite migrar incremental: en todo momento `role`, `activeMode` y `roles[]` son **consistentes**, así que se puede cambiar la capa de sesión y migrar gates uno por uno sin ventana de inconsistencia.

### Invariante de back-compat (la clave anti-agujero)
> Mientras dure la migración, **`token.role` y `session.user.role` SIEMPRE reflejan `activeMode`** (que en U-03 == `role` de DB, porque no hay toggle todavía). Cualquier gate NO migrado que lea `session.user.role` sigue viendo el valor correcto. Ningún gate sin migrar se rompe ni se abre.

### Paso 3a — La sesión expone `roles[]` + `activeMode` (capa de sesión)
Cambio **aditivo**: se agregan campos, no se quita `role`.

1. **`auth.ts` `authorize()`** — al retornar el user, agregar `roles: user.roles` y `activeMode: user.activeMode ?? user.role`. Mantener `role` (= `activeMode`) para back-compat.
2. **`auth.config.ts` callback `jwt`** — al crear el token (`if (user)`), copiar `token.roles = user.roles` y `token.activeMode = user.activeMode ?? user.role`. Setear `token.role = token.activeMode` (sync invariante).
3. **`auth.config.ts` callback `session`** — exponer `session.user.roles` y `session.user.activeMode`; mantener `session.user.role = token.activeMode`.
4. **`next-auth.d.ts`** — agregar `roles?: UserRole[]` y `activeMode?: UserRole` a `User`, `Session.user` y `JWT`. Mantener `role`.

> Importante: estos callbacks corren en Edge (middleware los usa vía `auth.config.ts`). No agregar imports de Prisma/Node acá. Los datos vienen del `user` que ya armó `authorize()` en `auth.ts`.

### Paso 3b — Extender el helper de permisos
En `src/compartido/lib/permisos.ts`, extender `requiereRol` y `requiereRolApi` para que la decisión de acceso use `roles[]` (membresía) en vez del escalar `role`, con `activeMode` como el "modo actuante":

- Semántica de acceso a un área (`requiereRol(['ESTADO','ADMIN'])`):
  pasa si **`roles[]` intersecta** con los roles permitidos. (Un usuario MARCA+TALLER puede entrar a `/taller` y `/marca`.)
- ADMIN mantiene su bypass donde hoy lo tiene.
- Fallback: si `roles[]` viene vacío/undefined (sesión vieja en tránsito), usar `[activeMode ?? role]`. Garantiza que sesiones emitidas antes del deploy no queden bloqueadas.
- Agregar helpers de lectura reutilizables (sin redirect) para usar en componentes y branches:
  - `tieneAlgunRol(session, roles[]): boolean`
  - `modoActivo(session): UserRole` (= `activeMode ?? role`)

> No se cambia la firma pública de `requiereRol`/`requiereRolApi` (siguen recibiendo `RolPermitido[]`). Solo cambia su lógica interna y se amplía `RolPermitido` si hace falta.

### Paso 3c — Migrar los gates al helper (burn-down mecánico)
Orden de migración (de menos a más riesgo, cada uno verificable por separado):

1. **Middleware** (`src/middleware.ts`) — reemplazar `userRole === 'X'` por chequeo de membresía contra `roles[]`, y el `switch` de redirect de home por `activeMode`. Es el gate más amplio; migrarlo primero da cobertura base.
2. **6 layouts** — reemplazar el bloque inline `if (session.user.role !== 'X') redirect('/unauthorized')` por `await requiereRol([...])`. `(public)` es lectura (no redirect), adaptarlo a `modoActivo()`.
3. **API routes** — reemplazar los ~28 chequeos inline (`includes(session.user.role)`, `role ===/!==`) por `requiereRolApi([...])`. Ir directorio por directorio (`/api/admin`, `/api/taller`, ...) y dejar el grep en 0.
4. **Lecturas restantes** (componentes server, branches de UI) — pasar de `session.user.role` a `modoActivo(session)` donde representen "el modo en que actúa el usuario".

### Cómo se evita la "media migración" (agujero de permisos)
1. **Invariante de sync** (3a): `role` siempre == `activeMode`. Un gate sin migrar nunca ve un valor stale ni se abre. Esto convierte la migración en *segura por construcción*, no por completitud.
2. **Grep como burn-down con criterio de cierre**: el PR no se mergea hasta que
   ```bash
   grep -rn "session\.user\.role\|user\.role\b" src/app --include="*.ts" --include="*.tsx" | grep -v "permisos.ts"
   ```
   devuelva **0** fuera de `permisos.ts` (única excepción permitida: el propio helper y el sync en callbacks).
3. **Lint rule (opcional, recomendado)**: regla `no-restricted-syntax` que prohíba `session.user.role` fuera de `permisos.ts` y los callbacks de auth. Hace imposible reintroducir el patrón viejo.
4. **Tests de gating** (sección 7): un test parametrizado que recorre cada prefijo de ruta protegida con cada rol y verifica 200/403 esperado. Detecta el endpoint olvidado.

---

## 4. Qué entra en U-03 vs qué queda para U-04 / U-08

| Item | U-03 | U-04 | U-08 |
|------|:----:|:----:|:----:|
| Sesión expone `roles[]` + `activeMode` | ✅ | | |
| Helper `requiereRol`/`requiereRolApi` lee `roles[]`/`activeMode` | ✅ | | |
| Migrar middleware + 6 layouts + ~58 API a helper | ✅ | | |
| Back-compat `role` == `activeMode` en sync | ✅ | | |
| Tests unit de los helpers + test de matriz de gating | ✅ | | |
| **UI de toggle de modo** (botón "actuar como…") | | ✅ | |
| **Endpoint PATCH** que persiste `activeMode` en DB + re-emite sesión | | ✅ | |
| Redirect al dashboard del nuevo modo tras el toggle | | ✅ | |
| **Matriz e2e completa** de usuarios multi-rol (login → switch → acceso) | | | ✅ |

> U-03 deja `activeMode` igual a `role` siempre (no hay forma de cambiarlo todavía). El valor de U-03 es: la *infraestructura* de permisos lee los campos correctos, así que cuando U-04 agregue el toggle, NADA de gating hay que tocar.

---

## 5. Casos borde

| # | Caso | Comportamiento esperado |
|---|------|------------------------|
| 1 | Usuario single-role (la mayoría) | `roles = [role]`, `activeMode = role`. Todo idéntico a hoy. |
| 2 | Usuario sin `activeMode` (NULL inesperado) | Helper usa fallback `activeMode ?? role`. Nunca bloquea por NULL. |
| 3 | Usuario con `roles = []` (vacío) | Fallback a `[activeMode ?? role]`. No queda sin acceso a su propia área. |
| 4 | ADMIN | Mantiene bypass donde hoy lo tiene (middleware `/admin`, helpers). Verificar que no se pierde. |
| 5 | CONTENIDO en `/admin/evaluaciones` | Caso especial actual del middleware: preservarlo explícitamente al migrar. |
| 6 | Sesión vieja emitida antes del deploy (sin `roles`/`activeMode` en JWT) | Fallback: el helper usa `[role]` del token viejo. No se fuerza re-login. |
| 7 | ESTADO accede a área TALLER | Solo pasa si `TALLER ∈ roles[]`. Si no, `/unauthorized` (igual que hoy). |
| 8 | Multi-rol real (`roles=[TALLER,MARCA]`) accediendo a `/marca` mientras `activeMode=TALLER` | En U-03: **pasa** (membresía en `roles[]`). El "modo activo" recién se usa para defaults de navegación; el acceso es por membresía. (Refinar en U-04 si se decide gatear por modo.) |

> **Decisión a confirmar con Gerardo (caso 8):** ¿el acceso a un área se gatea por *membresía en `roles[]`* (un multi-rol entra a todas sus áreas siempre) o por *`activeMode`* (solo entra al área del modo activo, debe togglear primero)? El spec asume **membresía** para U-03 (más simple, no rompe nada). Si se prefiere gating-por-modo, es trivial cambiarlo en el helper, pero requiere el toggle de U-04 para ser usable.

---

## 6. Prescripciones técnicas

- **NO tocar `prisma/schema.prisma`** — las columnas ya existen (U-02). Si hace falta un cambio de schema, parar y avisar a Gerardo.
- **NO correr migraciones** — U-03 es solo código de aplicación. (GUARD: Prisma CLI local roto / `.env` apunta a prod.)
- Capa de sesión: editar **solo** `auth.ts`, `auth.config.ts`, `next-auth.d.ts`. Los callbacks de `auth.config.ts` corren en Edge → **sin imports de Prisma/Node**.
- Helper: toda la lógica nueva de permisos vive en `src/compartido/lib/permisos.ts`. No duplicar lógica de rol en otros archivos.
- Patrón de API: server route → `const guard = await requiereRolApi([...]); if (guard instanceof NextResponse) return guard;` y usar `guard.userId` / `guard.role`. (Patrón ya existente, solo ampliar adopción.)
- Patrón de page/layout: `const session = await requiereRol([...])`.
- Eliminar los casts redundantes `(session.user as { role?: string })` a medida que se migra cada archivo (la `d.ts` ya tipa los campos). No es obligatorio para los 88, pero sí en los archivos que se tocan.
- Errores: mantener el formato de `requiereRolApi` (401 sin sesión, 403 `INSUFFICIENT_ROLE` con `rolesRequeridos`). No inventar formatos nuevos.

---

## 7. Plan de testing

### Unit (Vitest)
- `permisos.test.ts`:
  - `requiereRolApi` retorna 401 sin sesión, 403 si `roles[]` no intersecta, OK si intersecta.
  - Fallback: `roles=[]` → usa `[activeMode ?? role]`.
  - ADMIN bypass donde corresponda.
  - `modoActivo()` y `tieneAlgunRol()` con single-role, multi-rol, NULL.

### Matriz de gating (el anti-"media-migración")
- Test parametrizado: para cada prefijo protegido (`/admin`, `/taller`, `/marca`, `/estado`, `/contenido`) × cada rol, afirmar acceso/redirect esperado. Cubre middleware + layouts.
- Para API: un test que recorre una lista de endpoints representativos por área y verifica 403 con rol ajeno, 200 con rol propio.

### e2e (Playwright, corre en CI)
- Login single-role de cada tipo → llega a su dashboard (no regresión).
- Usuario seed multi-rol (si existe; si no, crear uno en el fixture) → puede cargar `/taller` y `/marca` con `roles=[TALLER,MARCA]`.
- Sesión vieja simulada (token sin `roles`) → fallback no bloquea.

> La matriz e2e *completa* de multi-rol (con toggle) es U-08. Acá solo el subconjunto que prueba que el gating por `roles[]` no rompió nada.

---

## 8. Criterios de aceptación

- [ ] La sesión expone `session.user.roles` (array) y `session.user.activeMode`, tipados en `next-auth.d.ts`.
- [ ] `session.user.role` sigue presente y == `activeMode` (back-compat).
- [ ] `requiereRol`/`requiereRolApi` deciden por membresía en `roles[]` con fallback a `[activeMode ?? role]`.
- [ ] Middleware migrado a `roles[]`/`activeMode` (incluido el caso CONTENIDO→evaluaciones y el redirect de home).
- [ ] Los 6 layouts usan el helper (no chequeo inline de `role`).
- [ ] `grep -rn "session\.user\.role\|user\.role\b" src/app` devuelve 0 fuera de `permisos.ts`.
- [ ] Casts redundantes `as { role }` eliminados en todo archivo tocado.
- [ ] `npm run build` verde.
- [ ] Suite unit + e2e verde en CI.
- [ ] Un usuario single-role se comporta exactamente igual que antes (sin regresión).
- [ ] (Opcional) lint rule que prohíbe `session.user.role` fuera del helper.

---

## 9. Riesgos + rollback

| Riesgo | Mitigación | Rollback |
|--------|-----------|----------|
| "Media migración" deja un agujero | Invariante `role`==`activeMode` (3a) hace que ningún gate sin migrar se abra; grep+lint+matriz cierran completitud | Revertir el PR; los gates sin migrar siguen funcionando por `role` |
| Callback de Edge importa algo de Node y rompe el middleware | Regla estricta: los callbacks no importan Prisma/Node; los datos vienen de `authorize()` | Revertir `auth.config.ts` |
| Sesiones vivas viejas (sin `roles` en JWT) quedan bloqueadas | Fallback a `[role]` del token viejo; `maxAge` 7d rota solo | Hotfix en el fallback del helper |
| Cambio de semántica de acceso (caso 8) altera comportamiento esperado | Default = membresía (no rompe nada); decisión confirmada con Gerardo antes de implementar | Cambiar una condición en el helper |
| Regresión silenciosa en un área | Matriz de gating parametrizada en CI | — |

Rollback global: el PR es 100% código de aplicación (sin migración), así que `git revert` del merge restaura el estado anterior sin tocar datos.

---

## 10. Estimación realista

El discovery global estimó **8h**. Con la superficie medida (58 API files con gating, 6 layouts, middleware, 34 lecturas, 88 casts):

| Bloque | Estimación |
|--------|-----------|
| 3a — capa de sesión (auth.ts + config + d.ts) | 1.5 h |
| 3b — extender helper + helpers de lectura + unit tests | 1.5 h |
| 3c.1 — middleware | 1 h |
| 3c.2 — 6 layouts | 1 h |
| 3c.3 — ~58 API routes (burn-down dir por dir) | 4–5 h |
| 3c.4 — lecturas restantes + limpieza de casts | 1.5 h |
| Matriz de gating + e2e | 2 h |
| Build, CI, fixes | 1 h |
| **Total** | **~13–14 h (≈ 2 días)** |

**Las 8h del discovery global subestiman.** El grueso es el burn-down de ~58 API routes, que es mecánico pero voluminoso y debe quedar en grep 0. Recomendación: dividir en 2 PRs si se quiere mergear incremental — PR1 = capa de sesión + helper + middleware + layouts (la parte que habilita multi-rol y es segura por el invariante), PR2 = burn-down de API + limpieza. Ambos preservan back-compat.

---

## 11. Metadata

```
Spec: U-03 — Refactor auth y sesiones multi-rol
Bloque: U (multi-rol Airbnb)
Depende de: U-02 (mergeado)
Habilita: U-04, U-08
Decisiones: D1, D8
Archivos núcleo: auth.ts, auth.config.ts, next-auth.d.ts, permisos.ts, middleware.ts
Schema: NO se toca (columnas ya existen)
Migraciones: NINGUNA
Estimación: ~13–14h (2 días)
```
