# U-01: Análisis funcional y técnico — Multi-rol Airbnb

> **Fecha:** 18 de mayo de 2026
> **Autor:** Gerardo Breard (decisiones) + Claude Code (análisis técnico)
> **Ref:** Master V4 §3.3, SPEC v4-u-01-analisis-multi-rol-airbnb.md
> **Output:** Documento de diseño — NO produce código de aplicación

---

## 1. Resumen ejecutivo

### Problema

Un mismo CUIT puede operar como taller y como marca. Hoy el sistema obliga a crear dos cuentas con datos duplicados, lo cual genera inconsistencia y fricción.

### Decisión

**Opción A: Array de roles + modo activo + CUIT centralizado.**

El schema actual ya tiene la estructura de perfiles separados (`Taller` y `Marca` como entidades 1:1 opcionales del `User`). Solo falta:

1. Cambiar `User.role` (valor único) por `User.roles` (array)
2. Agregar `User.activeMode` (modo activo persistente)
3. Centralizar CUIT en `User.cuit` (hoy vive en Taller y Marca por separado)

### Impacto medido

| Categoría | Cantidad |
|-----------|----------|
| Campos nuevos en schema | 3 (`roles`, `activeMode`, `cuit`) |
| API endpoints con enforcement de rol | 54 (9 con helper, 45 inline) |
| Páginas/layouts con lógica de rol | 30 |
| Type assertions `(session.user as {role?})` | 83 |
| Tests E2E afectados | 25 |
| Tests unitarios afectados | 17 |

### Estimación refinada total: 33h (vs 31h del master)

La diferencia viene de U-03 (auth refactor) que es más grande de lo estimado, y U-08 (tests) que tiene más cobertura de la esperada.

---

## 2. Decisiones de Gerardo (18-mayo-2026)

| ID | Decisión | Justificación |
|----|----------|---------------|
| D1 | Migración automática viable | Seed: 8 users sin conflictos. Producción: piloto chico, asumimos similar. Si hay sorpresas, ajustar en U-05 |
| D2 | CUIT centralizado en User | `User.cuit @unique`. Cada CUIT = una identidad = un User. Coherente con master V4 §3.3 |
| D3 | Registro: elegir rol, después activar otro | Un usuario elige su rol al registrarse. Después puede activar un segundo perfil |
| D4 | Toggle UX en header | Cambio de modo visible en el header |
| D5 | Usuarios existentes se migran automáticamente | Mantienen su rol original como `roles: [ROL_ACTUAL]` |

---

## 3. Diseño funcional

### Flujo 1: Registro nuevo (taller o marca)

```
1. Usuario llega al landing
2. Click "Soy taller" o "Soy marca"
3. Formulario de registro:
   - Email
   - Contraseña
   - CUIT (→ guardado en User.cuit)
4. Verificación de email (magic link o confirmación)
5. Wizard de perfil específico del rol elegido:
   - TALLER: 11 pasos (sam, prendas, maquinaria, etc.)
   - MARCA: datos básicos (nombre, tipo, volumen)
6. Cuenta activa con:
   - User.roles = [TALLER] o [MARCA]
   - User.activeMode = TALLER o MARCA
   - Relación Taller o Marca creada (1:1)
```

**Cambio respecto a hoy:** El CUIT se guarda en `User.cuit` en lugar de `Taller.cuit` o `Marca.cuit`. El campo `cuit` en Taller/Marca se mantiene por ahora como campo de display/legacy pero pierde el `@unique`.

### Flujo 2: Activar segundo perfil

```
1. Usuario logueado como TALLER
2. Accede a "Mi cuenta" → sección "Mis perfiles"
3. Ve su perfil activo (TALLER) y un botón:
   "También operar como marca"
4. Mini-wizard de datos de marca:
   - Nombre comercial
   - Tipo (diseño independiente, marca comercial, etc.)
   - Volumen mensual estimado
5. Al completar:
   - Se crea Marca vinculada al mismo User
   - User.roles actualizado: [TALLER, MARCA]
   - CUIT compartido (ya existe en User.cuit)
   - Toggle de modo aparece en el header
6. Redirige al dashboard del modo que estaba usando
```

**Nota:** El flujo inverso (Marca que quiere ser Taller) funciona igual pero con el wizard de taller.

### Flujo 3: Login con doble perfil

```
1. Login normal (email + contraseña)
2. Auth callback carga User.roles y User.activeMode
3. Modo activo se determina así:
   a) Si User.activeMode tiene valor → usar ese
   b) Si no → usar roles[0] (primer rol creado)
4. JWT token incluye: { roles: [...], activeMode: 'TALLER' }
5. Session incluye: { user: { roles, activeMode } }
6. Redirect a /{activeMode.toLowerCase()} dashboard
7. Toggle visible en header (solo si roles.length > 1)
```

### Flujo 4: Cambio de modo (toggle)

```
1. Usuario en modo TALLER ve toggle en header
2. Click en toggle → cambio inmediato (sin confirmación)
3. Acción:
   a) PATCH /api/auth/mode { activeMode: 'MARCA' }
   b) Actualiza User.activeMode en DB
   c) Actualiza cookie de sesión
4. Redirect a /marca (dashboard del nuevo modo)
5. Header re-renderiza con tabs de MARCA
6. Toda navegación posterior usa el nuevo modo
```

**Decisión UX:** Cambio inmediato sin confirmación. Es reversible (un click), no destructivo, y la analogía Airbnb funciona así.

### Resolución de los 8 casos borde

| # | Caso | Resolución |
|---|------|------------|
| 1 | **Eliminar perfil marca después de activar** | Permitir solo si no tiene pedidos activos ni cotizaciones pendientes como marca. Soft delete: `Marca.activo = false`, `roles` vuelve a `[TALLER]`. Los datos se preservan por si reactiva |
| 2 | **Marca quiere "convertirse en taller"** | Es Flujo 2 al revés. No es conversión, es activación de segundo perfil. `roles: [MARCA, TALLER]` |
| 3 | **CUIT ya existe (otro User intenta registrarse con mismo CUIT)** | `User.cuit @unique` impide duplicados. Error: "Este CUIT ya está registrado. Si es tu CUIT, iniciá sesión con tu cuenta existente." No hay merge automático de cuentas |
| 4 | **Doble perfil + membresía vence** | Nivel/puntaje son del Taller o Marca (no del User). Cada perfil mantiene su propio estado. Si Taller baja de nivel, no afecta perfil Marca |
| 5 | **Verificación ARCA del CUIT** | Se verifica una vez contra `User.cuit`. Resultado básico (`verificadoAfip: boolean`) se mueve a User. Datos detallados ARCA (categoría monotributo, actividades, domicilio fiscal, etc.) permanecen en Taller porque son parte del flujo de formalización, no del perfil de marca |
| 6 | **Notificaciones con doble perfil** | Notificaciones van al User (ya es así: `Notificacion.userId`). Visibles en ambos modos. Para V4 no se filtran por contexto — el usuario ve todas sus notificaciones sin importar el modo activo |
| 7 | **URLs: /taller/perfil vs /marca/perfil** | Son rutas distintas. Cada modo tiene sus propias rutas protegidas. Con multi-rol, el middleware permite acceso a ambos prefijos si `roles.includes(rol)`. El `activeMode` determina el dashboard por defecto y las tabs del header, pero el usuario puede navegar manualmente a rutas de su otro perfil |
| 8 | **Sesión entre devices** | `activeMode` persiste en DB (`User.activeMode`). Al login en otro device, se lee de DB. No hay sync real-time entre devices (aceptable para MVP). El último cambio de modo gana |

---

## 4. Análisis técnico

### 4.1 Schema actual

```prisma
model User {
  id               String    @id @default(cuid())
  email            String    @unique
  role             UserRole  @default(TALLER)    // ← VALOR ÚNICO (problema)
  // ... 15+ campos más
  taller           Taller?                        // ← 1:1 opcional (ya existe)
  marca            Marca?                         // ← 1:1 opcional (ya existe)
  // ... 13 relaciones más
}

enum UserRole {
  TALLER
  MARCA
  ESTADO
  ADMIN
  CONTENIDO
}

model Taller {
  userId  String  @unique
  cuit    String  @unique    // ← CUIT duplicado aquí
  // ... ~40 campos (wizard, ARCA, métricas)
}

model Marca {
  userId  String  @unique
  cuit    String  @unique    // ← CUIT duplicado aquí
  // ... ~14 campos
}
```

**Observación clave:** El schema YA soporta que un User tenga Taller? Y Marca? simultáneamente. Las relaciones son opcionales 1:1. El único impedimento es que `User.role` es un valor único.

### 4.2 Schema propuesto

```prisma
model User {
  // DEPRECADO — mantener temporalmente para backward compat en migración
  role             UserRole  @default(TALLER)

  // NUEVOS CAMPOS
  roles            UserRole[] @default([])          // Array de roles activos
  activeMode       UserRole?                         // Modo activo actual
  cuit             String?    @unique                // CUIT centralizado

  // El resto del modelo permanece igual
  taller           Taller?
  marca            Marca?
  // ...
}

model Taller {
  cuit    String    // ← pierde @unique, se mantiene como display/legacy
  // ...
}

model Marca {
  cuit    String    // ← pierde @unique, se mantiene como display/legacy
  // ...
}
```

**Transición:** `User.role` se mantiene durante U-02/U-03 para backward compatibility. Se elimina en U-08 (tests) cuando todo el código use `roles`.

### 4.3 Diff visual del cambio

```diff
 model User {
-  role             UserRole  @default(TALLER)
+  role             UserRole  @default(TALLER)    // DEPRECATED
+  roles            UserRole[] @default([])
+  activeMode       UserRole?
+  cuit             String?    @unique
 }

 model Taller {
-  cuit    String  @unique
+  cuit    String              // display only
 }

 model Marca {
-  cuit    String  @unique
+  cuit    String              // display only
 }
```

### 4.4 Inventario de código afectado

#### API endpoints (54 total)

| Patrón | Archivos | Líneas | Refactor |
|--------|----------|--------|----------|
| Usa `requiereRolApi()` helper | 9 | 17 | Auto: actualizar helper una vez |
| Inline `(session.user as {role?}).role` | ~30 | 66 | Manual: migrar a helper o `roles.includes()` |
| Inline `session.user.role` directo | ~15 | 25 | Manual: cambiar a `roles.includes()` |

**Estrategia:** Actualizar `permisos.ts` para leer `roles` en lugar de `role`. Los 9 endpoints con helper se arreglan automáticamente. Los 45 restantes se migran a usar el helper (uniforma el código + resuelve el problema).

#### Páginas y layouts (30 total)

| Grupo | Archivos | Patrón |
|-------|----------|--------|
| Group layouts (`(admin)`, `(taller)`, etc.) | 6 | `role !== 'X'` → `!roles.includes('X')` |
| Páginas admin | 10 | Inline role checks |
| Páginas taller/marca | 5 | Layout ya protege |
| Páginas estado | 4 | `requiereRol` |
| Páginas auth/public | 5 | Role-aware rendering |

#### Middleware (1 archivo, crítico)

`src/middleware.ts` — 162 líneas. Lee `req.auth?.user?.role` (valor único). Cambio necesario:

```
ANTES: userRole === 'TALLER' → permitir /taller
DESPUÉS: userRoles.includes('TALLER') → permitir /taller
```

Además, la redirección de `/` a dashboard cambia: usar `activeMode` en lugar de `role`.

#### Auth callbacks (1 archivo, crítico)

`src/compartido/lib/auth.config.ts` — callbacks JWT y session:

```
ANTES: token.role = user.role
DESPUÉS: token.roles = user.roles; token.activeMode = user.activeMode
```

#### Componentes UI (3)

| Componente | Cambio |
|------------|--------|
| `header.tsx` | Agregar toggle de modo. Prop `userRole` → `userRoles` + `activeMode` |
| `user-sidebar.tsx` | Mostrar ambos perfiles. Prop `userRole` → `userRoles` + `activeMode` |
| `permisos.ts` | Leer `roles` en lugar de `role` |

#### Type augmentation (1 archivo)

`src/compartido/types/next-auth.d.ts` — Agregar `roles: string[]` y `activeMode: string` a `Session['user']`.

### 4.5 Datos actuales en DB (seed)

| Rol | Usuarios | CUITs | Perfiles asociados |
|-----|----------|-------|--------------------|
| ADMIN | 1 | — | Ninguno |
| TALLER | 3 | 3 (todos distintos) | 3 Taller |
| MARCA | 2 | 2 (todos distintos) | 2 Marca |
| ESTADO | 1 | — | Ninguno |
| CONTENIDO | 1 | — | Ninguno |
| **Total** | **8** | **5** | **5** |

- Ningún usuario tiene ambos perfiles
- Ningún CUIT aparece en más de un usuario
- ADMIN, ESTADO y CONTENIDO no tienen CUIT (correcto — CUIT es para talleres y marcas)
- Migración de datos: trivial (copiar role → roles[role], copiar cuit de Taller/Marca → User)

---

## 5. Decisión: Opción A (array de roles)

### Comparativa

| Criterio | Opción A: Array de roles | Opción B: Perfiles separados |
|----------|--------------------------|------------------------------|
| **Complejidad schema** | Baja (3 campos nuevos) | Innecesaria (Taller/Marca YA son perfiles separados) |
| **Migración** | Simple (backfill array + cuit) | Restructuración completa (mover datos) |
| **Queries afectadas** | Mínimo (leer `roles` en vez de `role`) | Muchas (nuevos joins) |
| **Backward compat** | `role` coexiste con `roles` durante transición | Rompe todo de golpe |
| **Performance** | Igual (array en misma tabla) | Peor (join extra) |
| **Mantenibilidad** | Alta (modelo actual + extensión) | Alta pero innecesaria |

### Justificación

**Se recomienda Opción A** porque:

1. **Taller y Marca ya son perfiles separados.** Crear `PerfilTaller`/`PerfilMarca` duplica lo que `Taller`/`Marca` ya hacen. La Opción B del spec es, en la práctica, la arquitectura actual renombrada.

2. **El cambio mínimo es agregar `roles[]` + `activeMode` + `cuit` a User.** No reestructurar.

3. **Backward compatibility natural:** `roles[0]` equivale a `role` durante la transición. Se puede migrar incrementalmente sin downtime.

4. **Refactor predecible:** El patrón `role === 'X'` se reemplaza sistemáticamente por `roles.includes('X')`. No hay ambigüedad.

### Trade-offs aceptados

- `User.role` (deprecated) coexiste con `User.roles` durante U-02/U-03. Esto es deuda técnica temporal, eliminada en U-08.
- Los 45 endpoints con inline role checks necesitan refactor manual (no hay atajo).
- CUIT duplicado temporalmente en User + Taller/Marca hasta que se elimine de los perfiles.

---

## 6. Plan de migración

### Paso 1: Schema (U-02)

```sql
-- 1. Agregar campos nuevos
ALTER TABLE users ADD COLUMN roles text[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN active_mode text;
ALTER TABLE users ADD COLUMN cuit text;

-- 2. Backfill roles desde role
UPDATE users SET roles = ARRAY[role];

-- 3. Backfill cuit desde Taller
UPDATE users SET cuit = t.cuit
FROM talleres t WHERE t.user_id = users.id;

-- 4. Backfill cuit desde Marca (los que no tienen taller)
UPDATE users SET cuit = m.cuit
FROM marcas m WHERE m.user_id = users.id AND users.cuit IS NULL;

-- 5. Backfill activeMode = role actual
UPDATE users SET active_mode = role;

-- 6. Crear unique index en cuit
CREATE UNIQUE INDEX users_cuit_key ON users(cuit) WHERE cuit IS NOT NULL;

-- 7. Eliminar @unique de Taller.cuit y Marca.cuit
DROP INDEX IF EXISTS talleres_cuit_key;
DROP INDEX IF EXISTS marcas_cuit_key;
```

**Prisma migration:** Esto se traduce a un migration file de Prisma con los ALTER TABLE correspondientes.

### Paso 2: Auth core (U-03)

1. `auth.config.ts`: JWT callback carga `roles` y `activeMode`
2. `auth.ts`: authorize retorna `roles` y `activeMode`
3. `next-auth.d.ts`: tipo actualizado
4. `permisos.ts`: `requiereRol` y `requiereRolApi` leen `roles`
5. `middleware.ts`: lógica de acceso por `roles.includes()`
6. 6 group layouts actualizados
7. 45 endpoints con inline checks migrados a helper o `roles.includes()`

### Paso 3: UI (U-04)

1. Toggle de modo en `header.tsx`
2. Endpoint `PATCH /api/auth/mode`
3. Sección "Mis perfiles" en mi-cuenta
4. Flujo de activación de segundo perfil

### Paso 4: Datos producción (U-05)

1. Backup de DB antes de migrar
2. Ejecutar migration (Paso 1)
3. Verificar: cada user tiene `roles` correcto y `cuit` correcto
4. Smoke test: login funciona para todos los roles

### Paso 5: Lógica de negocio (U-06, U-07)

1. Clasificación de pedidos cuando user es TALLER+MARCA
2. Regla anti-incesto: no cotizar en propio pedido

### Paso 6: Tests (U-08)

1. Actualizar `loginAs` helper
2. Actualizar `auth.setup.ts`
3. Refactorizar 25 E2E specs
4. Refactorizar 17 unit tests
5. Agregar tests específicos de multi-rol
6. Eliminar `User.role` (campo deprecated)

### Rollback plan

| Escenario | Acción |
|-----------|--------|
| Migration SQL falla | `prisma migrate reset` + re-seed. `roles` y `cuit` no existían, nada se pierde |
| Código rompe post-deploy | `git revert` del PR. `User.role` sigue existiendo, el sistema funciona como antes |
| Datos corruptos en prod | Restaurar backup pre-migración. El backup se toma antes del Paso 4 |
| Tests fallan masivamente | No mergear. Arreglar en branch antes del PR |

### Verificación post-migración

- [ ] Cada user tiene `roles` que contiene su `role` original
- [ ] Cada user TALLER/MARCA tiene `cuit` correcto (verificar contra Taller.cuit/Marca.cuit)
- [ ] `activeMode` = `role` original para todos
- [ ] Login funciona para los 5 roles
- [ ] Middleware permite acceso correcto por prefijo
- [ ] Toggle no aparece para users con un solo rol
- [ ] Tests E2E pasan (loginAs funciona)

---

## 7. Estimaciones refinadas U-02 a U-08

| Spec | Descripción | Master | Refinada | Justificación |
|------|-------------|--------|----------|---------------|
| U-02 | Schema refactor | 8h | **5h** | Solo 3 campos nuevos + migration SQL con backfill. Schema simple, no reestructuración |
| U-03 | Auth refactor | 4h | **8h** | 54 endpoints (9 con helper + 45 inline), 6 layouts, middleware, callbacks. Más grande de lo estimado — 91 líneas de inline role checks |
| U-04 | Toggle UI | 4h | **4h** | Componente nuevo en header, endpoint PATCH, sección en mi-cuenta. Razonable |
| U-05 | Migración datos | 3h | **2h** | 8 users en seed, piloto chico en prod. Script trivial + verificación |
| U-06 | Clasificación pedidos | 4h | **3h** | Lógica aislada en creación de pedidos. Impacto limitado |
| U-07 | Regla anti-incesto | 2h | **2h** | Validación en cotización. Scope reducido y claro |
| U-08 | Tests E2E + cleanup | 6h | **9h** | 25 E2E + 17 unit tests + nuevos tests multi-rol + eliminar `User.role` deprecated |
| | **Total** | **31h** | **33h** | +2h por volumen real de inline role checks |

### Orden de implementación sugerido

```
U-02 (schema) ──→ U-03 (auth) ──→ U-04 (toggle) ──→ U-05 (migración prod)
                                        ↓
                                   U-06 (clasificación) ──→ U-07 (anti-incesto)
                                                                    ↓
                                                               U-08 (tests + cleanup)
```

**Dependencias:**
- U-02 es prerequisito de todo
- U-03 es prerequisito de U-04 (toggle necesita auth actualizado)
- U-04 es prerequisito de U-06 y U-07 (necesitan modo activo)
- U-08 va al final (testea todo + elimina deprecated)
- U-05 puede ejecutarse después de U-03 (no depende de UI)

---

## 8. Riesgos identificados

| # | Riesgo | Probabilidad | Impacto | Mitigación |
|---|--------|--------------|---------|------------|
| 1 | **Inline role checks olvidados** | Media | Alto | Grep exhaustivo post-U-03. CI con lint rule que detecte `session.user.role` (deprecated) |
| 2 | **Middleware edge case con multi-rol** | Baja | Alto | User TALLER+MARCA accede a `/taller` Y `/marca`. Verificar que no hay conflicto de redirect |
| 3 | **CUIT null para ADMIN/ESTADO/CONTENIDO** | Baja | Bajo | `User.cuit` es `String?` (nullable). Solo TALLER/MARCA tienen CUIT. Queries deben manejar null |
| 4 | **Toggle confuso para usuarios no técnicos** | Media | Medio | Texto claro: "Estás operando como Taller. Cambiar a Marca ↔". Piloto permite feedback |
| 5 | **Session stale después de cambio de modo** | Baja | Medio | PATCH /api/auth/mode actualiza JWT. Si hay tabs abiertas con session vieja, se actualizan en siguiente request |
| 6 | **Rollback parcial** | Baja | Alto | Si U-03 se mergea pero U-04 no, el toggle no existe pero roles[] sí. No es destructivo: users siguen con un solo rol, todo funciona como antes |
| 7 | **Tests flaky por timing de session** | Media | Bajo | loginAs ya maneja storageState. Agregar wait explícito si toggle cambia session |

---

## 9. Apéndice: Discovery completo del pre-flight

### A. Modelos del schema (44 total)

User, Account, Session, VerificationToken, Taller, Marca, ProcesoProductivo, TipoPrenda, PrendaProceso, TallerProceso, TallerPrenda, Maquinaria, TallerCertificacion, Pedido, Cotizacion, OrdenManufactura, PedidoInvitacion, Validacion, TipoDocumento, ReglaNivel, Coleccion, Video, Evaluacion, Certificado, ProgresoCapacitacion, IntentoEvaluacion, Auditoria, AccionCorrectiva, Denuncia, Notificacion, ConfiguracionSistema, ConfiguracionUpload, DocumentoRAG, LogActividad, NotaInterna, NotaSeguimiento, ConsultaArca, EscrowHito, MotivoNoMatch, ObservacionCampo, MensajeWhatsapp, MagicLink, Novedad, TallerPlantilla.

### B. Modelos que referencian User.id (13)

Account, Session, Taller, Marca, Notificacion (x2 relaciones), LogActividad, NotaInterna, Validacion, Auditoria, MensajeWhatsapp, MagicLink, NotaSeguimiento (x2), ObservacionCampo (x2).

### C. Campos de Taller (~40 campos)

id, userId, nombre, cuit, nivel, puntaje, rating, ubicacion, website, provincia, partido, ubicacionDetalle, descripcion, capacidadMensual, trabajadoresRegistrados, fundado, verificadoAfip, verificadoAfipAt, tipoInscripcionAfip, categoriaMonotributo, estadoCuitAfip, fechaInscripcionAfip, actividadesAfip, domicilioFiscalAfip, empleadosRegistradosSipa, empleadosSipaActualizadoAt, pedidosCompletados, ontimeRate, retrabajoRate, portfolioFotos, sam, prendaPrincipal, organizacion, metrosCuadrados, areas, polivalencia, horario, registroProduccion, escalabilidad, paradasFrecuencia, createdAt, updatedAt.

### D. Campos de Marca (~14 campos)

id, userId, nombre, cuit, ubicacion, tipo, website, volumenMensual, frecuenciaCompra, rating, pedidosRealizados, verificadoAfip, createdAt, updatedAt.

### E. Últimas 10 migraciones

```
20260428100000_agregar_aprobado_por_validacion
20260428100001_backfill_aprobado_por_validacion
20260428200000_tipos_documento_y_reglas_nivel
20260428200001_seed_reglas_nivel
20260505120000_add_notificacion_userId_leida_index
20260505140000_add_nota_seguimiento
20260505160000_add_observacion_campo
20260515200000_agregar_modelo_novedad
20260516120000_desglose_plantilla_taller
```

### F. Seed: usuarios creados

| Variable | Nombre | Email | Rol | CUIT |
|----------|--------|-------|-----|------|
| admin | Lucía Fernández | lucia.fernandez@pdt.org.ar | ADMIN | — |
| userBronce | Roberto Giménez | roberto.gimenez@pdt.org.ar | TALLER | 20-28345672-9 |
| userPlata | Graciela Sosa | graciela.sosa@pdt.org.ar | TALLER | 30-71589234-6 |
| userOro | Carlos Mendoza | carlos.mendoza@pdt.org.ar | TALLER | 30-71234567-8 |
| userMarcaChica | Valentina Ramos | valentina.ramos@pdt.org.ar | MARCA | 27-32456789-1 |
| userMarcaMediana | Martín Echevarría | martin.echevarria@pdt.org.ar | MARCA | 30-71890234-5 |
| userEstado | Ana Belén Torres | anabelen.torres@pdt.org.ar | ESTADO | — |
| (sin var) | Sofía Martínez | sofia.martinez@pdt.org.ar | CONTENIDO | — |

### G. Infraestructura de tests

| Framework | Directorio | Archivos | Activo |
|-----------|-----------|----------|--------|
| Vitest 4.x | `src/__tests__/` | 33 | Sí |
| Playwright 1.59 | `tests/e2e/` | 25 | Sí |
| Playwright (legacy) | `e2e/` | 16 | No (config apunta a `tests/e2e/`) |

`loginAs` helper actual: `'taller' | 'marca' | 'admin' | 'estado'` (4 roles).

### H. Flujo del rol en el sistema

```
DB (User.role)
  ↓ authorize()
JWT callback (token.role = user.role)
  ↓
Session callback (session.user.role = token.role)
  ↓
Middleware (req.auth.user.role → ruteo por prefijo)
  ↓
Página/API (session.user.role → lógica condicional)
```

**Con multi-rol:**

```
DB (User.roles[], User.activeMode)
  ↓ authorize()
JWT callback (token.roles = user.roles, token.activeMode = user.activeMode)
  ↓
Session callback (session.user.roles, session.user.activeMode)
  ↓
Middleware (req.auth.user.roles → permitir múltiples prefijos, activeMode → redirect)
  ↓
Página/API (session.user.roles.includes() → lógica, activeMode → UI)
```

---

*Fin del análisis U-01. Este documento es la base para los specs U-02 a U-08.*
