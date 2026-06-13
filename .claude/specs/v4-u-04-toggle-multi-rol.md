# SPEC U-04: Toggle multi-rol ("Operando como…") en el header

> **Plantilla V4** — Discovery + diseño. NO implementar hasta merge de PR2b (#396) y aprobación de Gerardo.
> **SECCION 0 es BLOQUEANTE.** **SECCION 13 NO SE MODIFICA** durante implementacion.

---

## 0. Pre-flight checks (BLOQUEANTE)

> Ejecutar ANTES de escribir una sola linea de codigo. El discovery de abajo (secciones 5 y 6) ya
> recoge los hallazgos reales del repo al 2026-06-05. Re-verificar tras el merge de PR2b.

### 0.1 Verificacion de dependencias

- [ ] **U-03 PR2b (#396) mergeado a develop** — U-04 depende de la sesión normalizada (`roles[]` + `activeMode`) y del helper por membresía. PR2b cierra el burn-down; no bloquea técnicamente pero se espera su merge para arrancar limpio.
- [x] U-03 PR1 (#391, `93ff5ef`) mergeado — sesión expone `roles[]` + `activeMode`.
- [x] U-03 PR2a (#393, `2e03066`) mergeado — endpoints gatean por membresía.
- [x] U-02 schema mergeado — `User.roles UserRole[]` + `User.activeMode UserRole?` existen en `prisma/schema.prisma` (líneas 157-158).
- [ ] Branch base (`develop`) actualizada.

### 0.2 Verificacion de schema y datos

- [x] `User.roles UserRole[] @default([])` — existe (schema:157).
- [x] `User.activeMode UserRole?` — existe (schema:158).
- [x] Enum `UserRole`: `TALLER | MARCA | ESTADO | ADMIN | CONTENIDO` (schema:15-21).
- [x] **NO se necesita cambio de schema.** Ambas columnas ya existen (U-02). U-04 es la primera funcionalidad que las **escribe** post-login.

### 0.3 Discovery de impacto tecnico — resultado

- **Header**: `src/compartido/componentes/layout/header.tsx` — client component. Recibe `userName`, `userRole: 'TALLER'|'MARCA'|'ESTADO'`, `showPilotPill`. **NO recibe `roles[]` ni `activeMode` hoy.** Ya tiene un dropdown de avatar (líneas 114-157) con "Mi cuenta" + "Cerrar sesión".
- **Invocación del Header**: 3 layouts server-component, cada uno **hardcodea** `userRole`:
  - `src/app/(taller)/layout.tsx:29` → `userRole="TALLER"`
  - `src/app/(marca)/layout.tsx:25` → `userRole="MARCA"`
  - `src/app/(estado)/layout.tsx:18` → `userRole="ESTADO"`
- **Gate de layout por membresía**: `requiereRol(['TALLER'])` usa `tieneAlgunRol` (permisos.ts:14-23). ⟹ **un usuario dual-role `[TALLER, MARCA]` pasa los gates de `/taller` Y `/marca`.** No hay que tocar los gates.
- **Middleware** (`src/middleware.ts:133-140`): redirige `/` al dashboard de `modoActivo(sessionUser)`. Ya respeta el modo activo.
- **Endpoint de self-update existente** (modelo a copiar): `src/app/api/cuenta/route.ts` PUT — `apiHandler` + `auth()` + `errorAuthRequired()` + `prisma.user.update({ where: { id: session.user.id }, data })`. **No existe** ningún endpoint que escriba `activeMode`.
- **SessionProvider**: existe en `src/app/providers.tsx` ⟹ `useSession().update()` disponible client-side.

### 0.4 GAP TÉCNICO CRÍTICO (el corazón de U-04)

El callback `jwt` (`src/compartido/lib/auth.config.ts:59-87`) **solo procesa `if (user)`** (rama de login). **NO tiene rama `trigger === 'update'`.** Hoy `activeMode` se deriva una sola vez, al autenticar.

⟹ Para que el toggle cambie el modo **sin re-login**, hay que **AGREGAR una rama `trigger === 'update'`** al callback `jwt` que re-derive `token.activeMode`, `token.roles` y `token.role` desde el `session` payload del `update()`. Sin esto, `useSession().update()` no refleja el cambio en la sesión viva. Este es el único cambio no trivial de auth en U-04.

### 0.5 Reporte pre-flight

- Sin cambio de schema. Sin migración SQL.
- Cambio de auth acotado: 1 rama nueva en `jwt` (validada contra `roles[]` en DB, ver §6).
- 1 endpoint nuevo. 1 componente nuevo (toggle) + paso de props en 3 layouts + Header.
- Riesgo principal: que la rama `update` de `jwt` confíe en input cliente. Mitigación en §6/§12: re-leer `roles[]` de DB y validar membresía server-side.

---

## 1. Metadata

| Campo | Valor |
|---|---|
| ID | U-04 |
| Título | Toggle multi-rol "Operando como…" en el header |
| Bloque | U (multi-rol) |
| Depende de | U-03 (PR1+PR2a+PR2b), U-02 (schema) |
| Habilita | U-05 (otorgar segundo rol), U-08 (e2e multi-rol) |
| Estimación | 6–8 h (ver §14) |
| Autor spec | Gerardo |
| Estado | DISCOVERY — pendiente aprobación |

---

## 2. Contexto

### Por que existe este spec
Decisión 3.3 del MASTER_V4 ("patrón Airbnb adaptado") + narrativa V4 de Sergio §4.4 + backlog V4 fila 12. Un usuario puede tener más de un rol (ej. dueño de taller que además opera una marca). U-03 ya dejó la base de auth (sesión con `roles[]` + `activeMode`, gates por membresía). Falta la pieza visible: el control para **cambiar de modo** y la **diferenciación visual** del modo activo.

### Que resuelve
- Da al usuario dual-role un toggle explícito "Operando como Taller / Marca".
- Persiste el modo elegido (`User.activeMode`) y lo refleja en la sesión viva sin re-login.
- Redirige al dashboard del nuevo modo y deja el resto de la app (layouts, middleware, helpers) operando con el modo correcto — eso ya funciona por membresía desde U-03.

### Documentacion de referencia
- `.claude/specs/narrativa-V4-consolidado-niveles-1-a-4.md` §4.4 (diseño de Sergio) + fila 12 de la tabla de decisiones (línea 574).
- `.claude/specs/v4-u-03-auth-multirol.md` (base de auth).
- `.claude/specs/v4-u-02-schema-multi-rol.md` (columnas `roles`/`activeMode`).

---

## 3. Validacion interdisciplinaria

- **UX (Sergio)**: el toggle debe leerse como "estado de identidad", no como un menú más. Diferenciación visual fuerte (color de acento por rol) para que el usuario nunca dude en qué modo está operando. Copy en español neutro rioplatense.
- **Seguridad (U-03)**: el cambio de modo **no otorga permisos nuevos** — solo elige entre roles que el usuario YA tiene en `roles[]`. El endpoint debe rechazar cualquier modo fuera de `roles[]` (no confiar en el cliente). El gate real sigue siendo por membresía (U-03), el `activeMode` es solo "cuál de mis roles estoy usando ahora".
- **Producto**: en el piloto la mayoría son single-role ⟹ el toggle no debe aparecer ni molestar a quien tiene un solo rol.

---

## 4. Que construir

### Funcionalidades

1. **Toggle en el header, al lado del avatar** (patrón Airbnb). Botón/pill que abre un dropdown:
   ```
   Operando como:
     ● Taller (Taller La Aguja)
       Marca (Amapola Indumentaria)
   ```
   - Solo visible si `roles.length > 1`. Single-role: no se renderiza nada.
   - El rol activo marcado (●) y deshabilitado para click (ya estás en él).
   - Click en otro rol → cambia de modo (ver flujo abajo).

2. **Diferenciación visual del modo activo** (§4.4 de Sergio):
   - Pill al lado del logo: "Modo Taller" / "Modo Marca".
   - Acento de color: `brand-blue` para Taller, `terra` (terracotta) para Marca.
   - Borde inferior del header 3–4px del color del rol activo.
   - Avatar con borde del color del rol activo.

3. **Cambio de modo**:
   - PATCH a endpoint nuevo → escribe `User.activeMode`.
   - `useSession().update()` → re-emite el JWT con el nuevo `activeMode` (requiere la rama `trigger==='update'` del §0.4).
   - Toast: *"Ahora estás operando como Marca (Amapola Indumentaria)"*.
   - Redirect al dashboard del nuevo modo (`/taller`, `/marca`, `/estado`).

### Wireframes o referencias visuales
Narrativa V4 §4.4 (texto ASCII arriba). No hay mockup pixel-perfect; seguir el design-system (tokens `brand-blue`, `terra-600`, `font-overpass`).

### Consideraciones de lenguaje
- "Operando como:" (header del dropdown).
- "Modo Taller" / "Modo Marca" / "Modo Ente" (pill).
- Toast: "Ahora estás operando como {Rol amable} ({nombre de la entidad})".
- Nombres amables, no enums crudos: TALLER→"Taller", MARCA→"Marca", ESTADO→"Ente".

---

## 5. Datos (schema, modelos, queries)

### Cambios en schema Prisma
**Ninguno.** `User.roles` y `User.activeMode` ya existen (U-02, schema:157-158).

### Migraciones SQL
**Ninguna.**

### Queries o relaciones nuevas
- En el endpoint: `prisma.user.update({ where: { id }, data: { activeMode } })`.
- En el endpoint (validación): `prisma.user.findUnique({ where: { id }, select: { roles: true } })` para verificar membresía server-side (no confiar en `session.user.roles`, ya que el cliente disparó el `update`). Ver §6.
- Para el dropdown necesitamos el **nombre de la entidad** por rol (Taller La Aguja / Amapola Indumentaria). Query del lado server (en el layout o en el endpoint que alimenta el toggle): `prisma.taller.findFirst({ where: { userId } })` / `prisma.marca.findFirst({ where: { userId } })`. **Decisión D2 (ver §4 decisiones)**: empezar con el nombre del rol solo, y enriquecer con el nombre de la entidad si el layout ya lo tiene a mano (el taller layout ya hace `taller.findFirst`).

### Seed o data inicial
Hoy el seed setea solo `role`, nunca `roles[]`/`activeMode` (seed.ts:67-95). Todos los usuarios quedan single-role (jwt deriva `[activeMode]`).

**Para testing de U-04** (ver §10): agregar al seed **un usuario dual-role** explícito, ej.:
```
roles: ['TALLER', 'MARCA'], activeMode: 'TALLER', role: 'TALLER'
```
con su `Taller` y su `Marca` asociados (mismo `userId`). Alternativa manual documentada: Prisma Studio → editar `roles` de un user existente. **No** hace falta el flujo de "agregar segundo rol" (eso es U-05).

---

## 6. Prescripciones tecnicas

### Archivos a crear
1. **`src/app/api/cuenta/modo/route.ts`** (endpoint PATCH).
   - Patrón: copiar la estructura de `src/app/api/cuenta/route.ts` (`apiHandler` + `auth()` + `errorAuthRequired` + `errorResponse`).
   - Body: `{ modo: UserRole }`.
   - **Validación de seguridad (OBLIGATORIA)**: re-leer `roles[]` desde DB (`prisma.user.findUnique({ where: { id: session.user.id }, select: { roles: true, role: true } })`), normalizar igual que el jwt (si `roles` está vacío, derivar `[role]`), y rechazar con 403 `INVALID_INPUT`/`FORBIDDEN` si `modo` NO está en ese set. **NUNCA** confiar en `session.user.roles` para autorizar el cambio.
   - `prisma.user.update({ where: { id }, data: { activeMode: modo } })`.
   - Responder `{ ok: true, activeMode: modo }`.

2. **`src/compartido/componentes/layout/modo-toggle.tsx`** (client component, nuevo).
   - Props: `roles: UserRole[]`, `activeMode: UserRole`, `entidades?: Partial<Record<UserRole, string>>` (nombres amables de entidad).
   - Si `roles.length <= 1` → `return null`.
   - Dropdown con la lista; click en otro rol → `fetch('/api/cuenta/modo', { method: 'PATCH', body })` → `await update()` (de `useSession`) → `toast` → `router.push('/' + modo.toLowerCase())` + `router.refresh()`.
   - Usar `useToast` de `@/compartido/componentes/ui/toast` (NO `alert`).

### Archivos a modificar
3. **`src/compartido/lib/auth.config.ts`** — callback `jwt`: AGREGAR rama `trigger === 'update'`.
   - Firma actual: `async jwt({ token, user })` → pasar a `async jwt({ token, user, trigger, session })`.
   - Nueva rama (pseudocódigo, validar contra DB NO es posible en Edge/jwt sin Prisma → el jwt callback corre en el server de auth.ts que SÍ tiene Prisma; pero por simplicidad y para no meter Prisma en la config Edge, la **validación de membresía vive en el endpoint** (paso 1), y el `update()` solo transporta el `activeMode` ya validado):
     ```
     if (trigger === 'update' && session?.activeMode) {
       const nuevo = session.activeMode as UserRole
       // roles ya están en el token (no cambian); solo si nuevo ∈ token.roles
       if ((token.roles as UserRole[])?.includes(nuevo)) {
         token.activeMode = nuevo
         token.role = nuevo   // mantener invariante role == activeMode
       }
     }
     ```
   - **Defensa en profundidad**: el endpoint valida contra DB (autoritativo); el jwt revalida contra `token.roles`. Doble check, sin meter Prisma en la config Edge.
   - **Invariante a preservar**: `token.role == token.activeMode` (back-compat U-03). Si se rompe, gates sin migrar ven el modo equivocado.

4. **`src/compartido/componentes/layout/header.tsx`** — aceptar props nuevas `roles: UserRole[]`, `activeMode: UserRole`, `entidades?`, y:
   - Renderizar `<ModoToggle>` junto al avatar (antes del bloque avatar, dentro del `div` derecho líneas 104-158).
   - Aplicar el color de acento del modo activo: borde inferior del header + borde del avatar (clases condicionales por `activeMode`).
   - Renderizar la pill "Modo {X}" junto al logo (banda 1, izquierda, después del `<Link>` del logo).
   - **No romper** la firma actual: las props nuevas son opcionales; si no llegan, comportamiento idéntico (single-role).

5. **`src/app/(taller)/layout.tsx`**, **`src/app/(marca)/layout.tsx`**, **`src/app/(estado)/layout.tsx`** — pasar `roles={session.user.roles}`, `activeMode={session.user.activeMode ?? session.user.role}`, y `entidades` (al menos el nombre de la propia entidad que el layout ya consulta) al `<Header>`.

### Librerias o paquetes nuevos
Ninguno. `useSession`/`update` de `next-auth/react` ya disponible. `lucide-react` para íconos ya en uso.

### Convenciones del proyecto a mantener
- `font-overpass`, tokens `brand-blue`/`terra-600`, `Badge`/pill existentes.
- Toast V3 (`useToast`), NO `alert`.
- Server components por defecto; el toggle es `'use client'` (necesita `useSession`/`fetch`/`router`).
- Sin emojis en código (los `●`/🌐 del diseño son ilustrativos; usar íconos lucide o un dot CSS).

---

## 7. Edge cases

1. **Single-role** (`roles.length <= 1`): el toggle no se renderiza; la pill puede mostrarse o no (decisión D6) pero sin diferenciación que confunda. Comportamiento idéntico al actual.
2. **`activeMode` no está en `roles[]`** (estado corrupto): el endpoint rechaza el cambio; el header debe defaultear a `roles[0]` para no crashear. Loguear inconsistencia.
3. **Modo no válido en el body** (ej. `ADMIN` o un rol que el user no tiene): 403 desde el endpoint, sin tocar DB.
4. **`update()` falla o el JWT no refleja el cambio**: tras el PATCH OK, si el `update()` no propaga, el redirect a `/marca` igual funciona (layout gatea por membresía), pero `activeMode` en sesión quedaría desfasado hasta el próximo refresh. Mitigación: hacer `router.refresh()` además del `update()`; en server components el `auth()` re-lee el token actualizado.
5. **Trabajo a medio hacer** (form sucio al cambiar de modo): el cambio es navegación explícita; se acepta pérdida de estado no guardado. **Fuera de alcance** un guard de "cambios sin guardar" (se puede agregar después). Documentar como decisión.
6. **Usuario `ESTADO`/`ADMIN` con multi-rol**: el toggle es genérico sobre `roles[]`; soporta cualquier combinación. La diferenciación de color cubre TALLER/MARCA; para ESTADO usar un tercer acento (definir token) o el neutro.
7. **Race**: dos pestañas cambian de modo. Última escritura gana en DB; cada pestaña refleja su propio `update()`. Aceptable.

---

## 8. Validacion sectorial
- **Taller/Marca dual** (caso real del piloto): el usuario entiende de inmediato en qué modo opera y cambia sin fricción. Validar con Sergio el copy y los colores antes de cerrar.

---

## 9. Criterios de aceptacion

- [ ] Un usuario con `roles=['TALLER','MARCA']` ve el toggle "Operando como…" al lado del avatar.
- [ ] Un usuario single-role NO ve el toggle.
- [ ] Al cambiar a Marca: (a) `User.activeMode` queda `MARCA` en DB, (b) la sesión viva refleja `activeMode=MARCA` sin re-login, (c) toast "Ahora estás operando como Marca (…)", (d) redirect a `/marca`.
- [ ] La diferenciación visual (pill "Modo X" + acento de color + borde header/avatar) cambia con el modo.
- [ ] El endpoint rechaza con 403 un `modo` que no está en `roles[]` del usuario (verificado contra DB, no contra la sesión).
- [ ] La invariante `session.user.role == session.user.activeMode` se mantiene tras el cambio.
- [ ] Single-role conserva comportamiento idéntico al actual (sin regresiones en header).
- [ ] `unit` + `e2e` verdes (CI).

---

## 10. Tests (QAs basados en flujos)

### Flujo 1: Cambio de modo (e2e, Playwright)
1. Login como el usuario dual-role del seed (`roles=['TALLER','MARCA']`, `activeMode='TALLER'`).
2. Verificar que aterriza en `/taller` y ve pill "Modo Taller".
3. Abrir el toggle → click en "Marca".
4. Verificar: toast, URL `/marca`, pill "Modo Marca", acento terracotta.
5. Reload → sigue en modo Marca (persistencia en DB).

### Flujo 2: Endpoint de modo (unit, Vitest — route handler)
- PATCH con `modo` ∈ `roles[]` → 200 + `activeMode` actualizado (mock prisma).
- PATCH con `modo` ∉ `roles[]` (DB) → 403, sin `user.update`.
- PATCH sin sesión → 401.
- PATCH con body inválido → 400.

### Flujo 3: jwt update branch (unit)
- `trigger==='update'` con `session.activeMode` ∈ `token.roles` → `token.activeMode` y `token.role` cambian, `token.roles` intacto.
- `trigger==='update'` con modo ∉ `token.roles` → token sin cambios.

### Flujo 4: Visibilidad del toggle (unit, componente)
- `roles.length === 1` → `ModoToggle` renderiza `null`.
- `roles.length > 1` → renderiza dropdown con N entradas, la activa marcada/disabled.

### Datos de prueba
- Extender `prisma/seed.ts` con 1 usuario dual-role (TALLER+MARCA) + su Taller + su Marca.
- Doc manual (handover): cómo otorgar un segundo rol vía Prisma Studio para QA exploratorio.

---

## 11. Impacto en handover
Documentar en `.claude/specs/handover/`:
- La rama `trigger==='update'` del jwt callback (primer uso de `useSession().update()` en el proyecto) y por qué la validación de membresía vive en el endpoint (DB autoritativa).
- Que `User.activeMode` ahora se **escribe** post-login (antes solo se leía al autenticar).
- Cómo crear un usuario dual-role para testing.

---

## 12. Riesgos y mitigaciones

| Riesgo | Severidad | Mitigación |
|---|---|---|
| El cliente fuerza un `modo` fuera de `roles[]` y escala permisos | Alta | El endpoint valida **contra DB** (no contra la sesión); el jwt revalida contra `token.roles`. Doble check. El gate real sigue siendo por membresía (U-03) — cambiar `activeMode` no abre rutas nuevas. |
| Romper la invariante `role==activeMode` y desincronizar gates sin migrar | Media | En la rama `update` setear SIEMPRE `token.role = token.activeMode`. Test Flujo 3 lo cubre. |
| `update()` no propaga y `activeMode` queda desfasado | Media | `router.refresh()` además de `update()`; layouts re-leen `auth()`. |
| Meter Prisma en `auth.config.ts` (Edge) y romper el límite de 1MB del middleware | Alta | La validación DB va en el **endpoint** (server full), NO en la config Edge. La rama jwt solo valida contra `token.roles` (en memoria). |
| Header existente regresiona para single-role | Media | Props nuevas opcionales; si no llegan, comportamiento idéntico. Test Flujo 4. |

### Rollback
Revertir el PR. Sin migración ⟹ sin rollback de DB. `User.activeMode` ya escrito queda como dato inocuo (la app pre-U04 lo ignora salvo en login, donde ya lo respetaba).

---

## 13. Selectores criticos (NO MODIFICAR en implementacion)

- `data-testid="modo-toggle"` — botón que abre el dropdown del toggle.
- `data-testid="modo-toggle-option-{ROL}"` — cada opción de rol en el dropdown.
- `data-testid="modo-pill"` — pill "Modo X" junto al logo.
- Endpoint: `PATCH /api/cuenta/modo`, body `{ modo: UserRole }`, respuesta `{ ok, activeMode }`.

---

## 14. Plan de implementacion

Incremental, sin big-bang. Cada paso compila y testea por separado:

1. **Endpoint** `PATCH /api/cuenta/modo` + unit tests (Flujo 2). Validación contra DB. *(~1.5h)*
2. **Rama `trigger==='update'`** en `jwt` callback + unit tests (Flujo 3). *(~1h)*
3. **Componente `ModoToggle`** (sin estilo final): dropdown funcional, llama endpoint + `update()` + redirect + toast. Unit test visibilidad (Flujo 4). *(~1.5h)*
4. **Integración en Header**: props nuevas, render del toggle, pill, acentos de color. Pasar props desde los 3 layouts. *(~1.5h)*
5. **Seed dual-role** + e2e (Flujo 1). *(~1.5h)*
6. **QA visual con Sergio** (colores/copy §4.4) + ajustes. *(~1h)*

**Orden vs otros specs del bloque U:**
- U-04 **no** crea el flujo de otorgar segundo rol → eso es **U-05** (o donde se decida). U-04 asume que el segundo rol ya existe en `roles[]` (poblado por seed/manual para testing).
- U-08 (e2e multi-rol completo) consume U-04.

**Dependencia dura**: merge de U-03 PR2b (#396) antes de arrancar.
