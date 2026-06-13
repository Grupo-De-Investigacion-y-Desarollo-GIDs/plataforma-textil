# SPEC U-09: Flujo "Agregar segundo rol" (single-rol → multi-rol)

> **Plantilla V4** — Discovery + diseño. NO implementar hasta aprobación de Gerardo.
> **SECCION 0 es BLOQUEANTE.** **SECCION 13 NO SE MODIFICA** durante implementacion.

---

## 0. Pre-flight checks (BLOQUEANTE)

> Hallazgos reales del repo al 2026-06-05. Re-verificar al arrancar.

### 0.1 Verificacion de dependencias
- [x] **U-04 mergeado** (`0fcf5b1`) — toggle + endpoint `active-mode` + rama `jwt trigger==='update'`. U-09 reusa la sesión normalizada y el toggle.
- [x] **U-03 mergeado** — gating por membresía en `roles[]`, primitivas `rolesEfectivos`/`modoActivo`.
- [x] **U-07 (anti-incesto) presente** — `pedidos/[id]/invitaciones/route.ts:45` compara `taller.user.id === pedido.marca.userId`. **Ya cubre el caso same-user** que U-09 habilita a escala (ver §7/§12).
- [ ] **Develop actualizado** al arrancar.

### 0.2 Verificacion de schema y datos
- [x] `User.roles UserRole[] @default([])`, `User.activeMode UserRole?` — existen (U-02).
- [x] `Taller.cuit String` y `Marca.cuit String` — **NO son `@unique`** (schema:248, 326). Solo `User.cuit` es `@unique` (schema:161, pero el registro no lo setea). ⟹ **el mismo CUIT puede existir en un Taller y una Marca** sin violar constraints (habilita decisión 4).
- [x] **NO se necesita cambio de schema.** U-09 es el primer flujo que *expande* `roles[]` en runtime.

### 0.3 Discovery de impacto tecnico — resultado (ver §5/§6 para detalle)
- **Ningún endpoint escribe `roles[]` hoy** (grep en `src/app/api` = 0). U-09 es el primer escritor.
- El endpoint U-04 `PATCH /api/usuarios/me/active-mode` **solo cambia `activeMode`/`role` y valida contra `roles[]` existente — NO agrega roles.** U-09 necesita un endpoint nuevo.
- La creación de entidad (Taller/Marca) + verificación CUIT vive **inline y duplicada** en 3 rutas (`registro`, `registro/completar`, parcialmente `verificar-cuit`). Conviene **extraer un helper** reusable.

### 0.4 Hallazgo crítico de datos (arrastrado de U-04)
Los users single-rol pre-U04 tienen **`roles=[]` en DB** (el callback `jwt` deriva `[activeMode]` al vuelo). ⟹ al agregar el 2do rol **NO se puede hacer `roles: { push: nuevoRol }`** (quedaría `[nuevoRol]`, perdiendo el rol original que vive en `User.role` pero no en `roles[]`). Hay que **setear explícitamente** `roles = rolesEfectivos(user) ∪ {nuevoRol}`.

### 0.5 Reporte pre-flight
- Sin cambio de schema, sin migración.
- 1 helper extraído (refactor sin cambio de comportamiento) + 1 endpoint nuevo + 1 sección UI en `/cuenta` (+ link opcional en el ModoToggle).
- Riesgo principal: normalización de `roles[]` (§0.4) y que el nuevo rol cree una entidad mínima válida (la app asume que el Taller/Marca existe). Mitigaciones en §6/§12.

---

## 1. Metadata

| Campo | Valor |
|---|---|
| ID | U-09 |
| Título | Flujo "Agregar segundo rol" (single → multi-rol) |
| Bloque | U (multi-rol) — spec NUEVO (no estaba en MASTER_V4; lo pidió Sergio en QA de #397) |
| Depende de | U-04 (done), U-03 (done), U-02 (done) |
| Relación | U-05 (migración) va DESPUÉS; U-08 (tests) al final |
| Estimación | 5–7 h (ver §14) |
| Estado | DISCOVERY — pendiente aprobación |

---

## 2. Contexto

### Por que existe este spec
Sergio, en el QA de #397 (U-04): *"Hoy el único modo de que un user tenga 2 roles es vía seed o Prisma Studio manual. Falta el flujo 'agregar segundo rol' para que un user single existente pueda volverse multi-rol."* U-04 dejó el toggle y el cambio de modo, pero **el toggle solo aparece si `roles.length > 1`** — y nada en la app le permite a un single-rol llegar a 2 roles. U-09 cierra ese hueco.

### Que resuelve
Permite que un usuario **TALLER** sume un perfil de **MARCA** (o viceversa), creando la entidad correspondiente y poblando `roles[]` en DB — el primer caso real de multi-rol generado por el propio usuario, no por seed/manual.

### Documentacion de referencia
- `.claude/specs/v4-u-04-toggle-multi-rol.md` (toggle + endpoint active-mode + rama jwt update).
- `.claude/specs/v4-u-03-auth-multirol.md` (membresía, primitivas de roles).
- `.claude/specs/v4-u-07-anti-incesto.md` (auto-contratación: ya cubre same-user).
- `src/app/api/auth/registro/completar/route.ts` (patrón analogo casi exacto).

---

## 3. Validacion interdisciplinaria
- **UX (Sergio)**: la acción debe ser descubrible para un single-rol (que NO ve el toggle). Copy claro: "Sumá tu perfil de Marca" / "Sumá tu perfil de Taller". El usuario debe entender que sigue siendo la misma cuenta.
- **Seguridad (U-03)**: agregar un rol SÍ otorga permisos nuevos (a diferencia de U-04, que solo elegía entre roles ya poseídos). Por eso U-09 **crea una entidad real verificada por CUIT** — no es un click vacío. El rol agregado se limita a TALLER/MARCA (los de equipo no se auto-asignan).
- **Producto**: caso real del piloto — emprendedores que son taller y marca a la vez. Anti-incesto (U-07) ya impide que se autocontraten.

---

## 4. Que construir

### Funcionalidades
1. **Sección "Agregar rol" en `/cuenta`** (Mi cuenta) — visible para single-rol TALLER o MARCA. Muestra el rol que le falta del par y un CTA.
2. **Mini-formulario** (modal o sub-página): `nombre` de la entidad + `CUIT` (pre-llenado con el CUIT actual, editable). Verificación CUIT contra ARCA, igual que el registro.
3. Al confirmar: crea la entidad (Taller con sus `validaciones`, o Marca), agrega el rol a `roles[]`, setea `activeMode` al nuevo rol, redirige a su dashboard + toast.
4. **(Opcional)** link "Agregar otro rol" al pie del dropdown `ModoToggle` (para el que ya es multi-rol y quisiera… aunque con el par TALLER/MARCA completo ya no aplica; ver decisión 3).

### Wireframes o referencias visuales
No hay mockup. Seguir design-system (cards de `/cuenta`, `Input`, `Button`, tokens `brand-blue`/`terra`). El mini-form replica el paso 2 del wizard de `/registro` pero reducido a nombre + CUIT (como `registro/completar`).

### Consideraciones de lenguaje
- "Sumá tu perfil de Marca" / "Sumá tu perfil de Taller".
- Toast: "¡Listo! Ahora también operás como Marca (Nombre)". Redirige a `/marca`.
- Aclarar bajo el CTA: "Es la misma cuenta. Vas a poder cambiar entre tus perfiles desde el menú."

---

## 5. Datos (schema, modelos, queries)

### Cambios en schema Prisma
**Ninguno.**

### Migraciones SQL
**Ninguna.**

### Queries / mutaciones nuevas
- Leer: `prisma.user.findUnique({ where:{id}, include:{ taller:true, marca:true } })` (chequear qué entidad ya tiene).
- Crear entidad (helper §6): `taller.create` (+ `validacion.createMany` NO_INICIADO) o `marca.create`, en `$transaction` con el `user.update`.
- Actualizar user: `user.update({ where:{id}, data:{ roles: nuevosRoles, role: nuevoRol, activeMode: nuevoRol } })` — `nuevosRoles` calculado explícitamente (§0.4).

### Seed o data inicial
Sin cambios. El user dual-role del seed (Julieta, U-04) sigue sirviendo. Para QA de U-09 conviene un user **single-rol "fresco"** (cualquiera del seed: `roberto.gimenez` TALLER) para sumarle MARCA.

---

## 6. Prescripciones tecnicas

### Refactor previo (sin cambio de comportamiento)
1. **Extraer helper** `crearEntidadParaRol(tx, { userId, role, nombre, cuit, datosArca? })` en `src/compartido/lib/` (server-only):
   - Para TALLER: `taller.create` con campos AFIP + `validacion.createMany` de `tipoDocumento` activos en `NO_INICIADO` (replica `registro/route.ts:137-153`).
   - Para MARCA: `marca.create`.
   - Recibe la `tx` para componer dentro de una transacción.
   - **Reusar en `registro/completar`** (y, si conviene sin riesgo, en `registro`) para no duplicar. Si el refactor de `registro` (que es más grande) agrega riesgo, dejarlo y solo compartir con `completar`. **Prudencia > completitud.**

### Archivos a crear
2. **`src/app/api/usuarios/me/roles/route.ts`** — `POST` (agregar rol).
   - `apiHandler` + `auth()` + `errorAuthRequired`.
   - Body `{ role: 'TALLER'|'MARCA', nombre, cuit }` (zod). **Rechazar** cualquier rol fuera de `{TALLER, MARCA}` → 400 (los de equipo no se auto-asignan).
   - Leer user con `taller`/`marca`. Si **ya tiene** el rol solicitado (entidad existe o `rolesEfectivos(user).includes(role)`) → 409.
   - Verificar CUIT con `consultarPadron` (arca.ts) — **mismo path que el registro primario** (no `afip.ts`, ver §12 inconsistencia). Si `errorBloqueaRegistro` → 400.
   - `$transaction([ crearEntidadParaRol(...), user.update({ roles, role, activeMode }) ])` con `roles` calculado explícito (§0.4): `const roles = Array.from(new Set([...rolesEfectivos(user), role]))`.
   - Responder `{ ok: true, activeMode: role, roles }`.
3. **UI en `/cuenta`** (`src/app/(public)/cuenta/page.tsx` + componente client nuevo `agregar-rol-card.tsx`):
   - Server: calcular `rolesEfectivos(session.user)`; si incluye ambos TALLER y MARCA → no mostrar nada. Si single → render del card con el rol faltante.
   - Client: mini-form (nombre + CUIT pre-llenado), `fetch POST /api/usuarios/me/roles`, en éxito `await update({ activeMode: role })` (rama jwt U-04) → `toast` → `router.push('/'+role.toLowerCase())` + `router.refresh()`.

### Archivos a modificar
4. `src/app/api/auth/registro/completar/route.ts` — usar el helper extraído (refactor).
5. **(Opcional)** `src/compartido/componentes/layout/modo-toggle.tsx` — link "Agregar otro rol" al pie (solo si la decisión 3 lo amerita; con el par completo, normalmente no).

### Librerias / convenciones
- Reusar `consultarPadron`/`DatosArca` (arca.ts), `apiHandler`/`errorResponse` (api-errors), `useToast`, `useSession().update`.
- Server components por defecto; el card de agregar rol es `'use client'`.

---

## 7. Edge cases
1. **roles[] vacío (single pre-U04)**: setear `roles` explícito = `rolesEfectivos(user) ∪ {nuevoRol}`, no `push` (§0.4).
2. **Ya tiene la entidad** (ej. tiene Taller, pide TALLER): 409, sin crear nada.
3. **CUIT no verificable / ARCA caído**: igual que el registro — modo defensivo (crear sin verificación si ARCA no responde; bloquear solo si el error invalida). Definir copy.
4. **Mismo CUIT para taller y marca**: permitido (schema no lo bloquea). Es el caso default (misma persona). Pre-llenar editable.
5. **Anti-incesto (U-07)**: un user taller+marca NO puede invitarse a cotizar su propio pedido — **ya cubierto** por `invitaciones/route.ts:45` (compara `userId`). U-09 no agrega lógica acá; **sí debe testear** que el caso sigue bloqueado (§10).
6. **Transacción a medias**: si la creación de entidad falla, el `user.update` no se aplica (atomicidad de `$transaction`). El user queda single-rol consistente.
7. **El nuevo Taller arranca con perfil mínimo**: dashboards/vidriera muestran EmptyState; el perfil se completa después con el wizard existente (`/taller/perfil/editar`). Aceptable (el registro primario también arranca mínimo).

---

## 8. Validacion sectorial
- **Emprendedor taller+marca** (caso piloto): suma su segundo perfil en < 1 min, queda operativo, y el toggle (U-04) le aparece para alternar. Validar copy con Sergio.

---

## 9. Criterios de aceptacion
- [ ] Un single-rol TALLER ve en `/cuenta` la opción "Sumá tu perfil de Marca" (y MARCA ve la de Taller). Un multi-rol completo no ve nada.
- [ ] Al completar el mini-form: se crea la Marca (o Taller+validaciones), `roles[]` queda `['TALLER','MARCA']` en DB, `activeMode` y `role` = nuevo rol.
- [ ] Tras agregar: redirige al dashboard del nuevo rol, toast de confirmación, y el toggle de U-04 ahora aparece.
- [ ] El endpoint rechaza: rol fuera de TALLER/MARCA (400), rol ya poseído (409), sin sesión (401), CUIT inválido (400 si bloquea).
- [ ] La invariante `role == activeMode` se mantiene.
- [ ] Anti-incesto sigue bloqueando que el user se autocontrate (regresión U-07).
- [ ] `unit` + `e2e` verdes.

---

## 10. Tests (QAs basados en flujos)

### Flujo 1 (e2e): single → dual
- Login `roberto.gimenez` (TALLER). En `/cuenta` clic "Sumá tu perfil de Marca" → completar nombre+CUIT → redirige a `/marca`, aparece el toggle, y `/cuenta` ya no ofrece sumar Marca.

### Flujo 2 (unit, endpoint)
- Agregar MARCA a un TALLER sin marca → 200, `roles` = ['TALLER','MARCA'], entidad creada (mock prisma + tx).
- Pedir un rol ya poseído → 409, sin crear.
- Pedir ADMIN/ESTADO → 400.
- Sin sesión → 401.
- `roles[]` vacío en DB → resultado normaliza a `[original, nuevo]` (no `[nuevo]`).

### Flujo 3 (unit/regresión): anti-incesto
- User taller+marca: su marca publica pedido; su taller NO puede ser invitado a cotizar (sigue 400/`No podés invitarte…`).

---

## 11. Impacto en handover
Documentar en `.claude/specs/handover/`:
- Primer flujo que expande `roles[]` en runtime; la regla de normalización (§0.4).
- El helper `crearEntidadParaRol` y qué rutas lo comparten.
- Que U-09 habilita el caso same-user taller+marca → confirmado compatible con anti-incesto (U-07).

---

## 12. Riesgos y mitigaciones

| Riesgo | Sev. | Mitigación |
|---|---|---|
| `push` sobre `roles=[]` pierde el rol original | Alta | Setear `roles` explícito = `rolesEfectivos(user) ∪ {nuevo}`. Test Flujo 2. |
| Crear rol sin entidad rompe la app (dashboards asumen Taller/Marca) | Alta | El mini-form **crea entidad real** (decisión 1=B); no hay "rol vacío". |
| Inconsistencia de verificación CUIT (3 paths: arca/afip/verificar-cuit) | Media | U-09 usa `consultarPadron` (arca.ts), el del registro primario. No introducir un 4to path. (Limpieza de los 3 → fuera de alcance, anotar.) |
| Refactor de `registro` (grande) introduce regresión | Media | Compartir helper solo con `completar` si tocar `registro` agrega riesgo. Prudencia. |
| Self-dealing al ser taller+marca | Media | **Ya mitigado** por U-07 (`userId` check). Cubrir con test de regresión (Flujo 3). |
| Agregar rol = escalar permisos sin control | Media | Limitado a TALLER/MARCA + entidad verificada por CUIT. Los roles de equipo no se auto-asignan. |

### Rollback
Revertir el PR. Sin migración. Un `roles[]` ya expandido queda como dato válido (la app lo soporta desde U-03/04). Para "deshacer" un rol agregado en un user puntual: Prisma Studio.

---

## 13. Selectores criticos (NO MODIFICAR en implementacion)
- `data-testid="agregar-rol-card"` — card en `/cuenta`.
- `data-testid="agregar-rol-submit"` — botón de confirmar en el mini-form.
- Endpoint: `POST /api/usuarios/me/roles`, body `{ role, nombre, cuit }`, respuesta `{ ok, activeMode, roles }`.

---

## 14. Plan de implementacion (incremental, sin big-bang)

1. **Helper** `crearEntidadParaRol` + reuso en `registro/completar` + unit. *(~1.5h)*
2. **Endpoint** `POST /api/usuarios/me/roles` (validación rol, 409 ya-poseído, CUIT, tx, normalización roles[]) + unit (Flujo 2). *(~2h)*
3. **UI** card "Agregar rol" en `/cuenta` + mini-form → endpoint → update()+redirect+toast. *(~1.5h)*
4. **Regresión anti-incesto** + e2e single→dual (Flujo 1, 3). *(~1.5h)*
5. **QA Sergio** (copy/flujo) + ajustes. *(~0.5h)*

**Dependencias / orden:**
- Requiere **U-04 (done)** — usa el toggle y la rama `jwt update`.
- **U-05 (migración) va DESPUÉS**: U-05 probablemente backfilea `roles[]`/`activeMode` de los users existentes en DB. U-09 funciona con o sin U-05 (calcula desde `rolesEfectivos`), pero conviene mergear U-09 antes para que el flujo exista cuando U-05 normalice los datos.
- **U-08 (tests)** consolida al final.
