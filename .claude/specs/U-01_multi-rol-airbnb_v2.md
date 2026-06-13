# U-01 v2: Análisis funcional y técnico — Multi-rol Airbnb

> **Versión:** v2 (consolidada con todas las decisiones de Gerardo)
> **Fecha:** 18 de mayo de 2026
> **Autor:** Gerardo Breard (decisiones) + Claude (análisis y consolidación)
> **Ref:** Master V4 §3.3, SPEC v4-u-01-analisis-multi-rol-airbnb.md
> **Reemplaza:** U-01 v1 (18-mayo-2026, mañana)
> **Output:** Documento de diseño — NO produce código de aplicación

---

## 1. Resumen ejecutivo

### Problema

Un mismo CUIT puede operar como taller y como marca. Hoy el sistema obliga a crear dos cuentas con datos duplicados, generando inconsistencia y fricción.

### Solución

**Opción A: Array de roles + modo activo + CUIT y datos ARCA centralizados.**

Cambios al modelo `User`:

1. `User.roles UserRole[]` — array de roles activos (reemplaza `User.role` único)
2. `User.activeMode UserRole?` — modo activo actual (persistente)
3. `User.cuit String? @unique` — CUIT centralizado
4. **TODOS los datos ARCA** centralizados (10 campos, ver §4.2)

El schema actual ya tiene `Taller?` y `Marca?` como relaciones opcionales 1:1, así que la base estructural ya existe. Solo se modifica `User` y se ajustan los uniques.

### Impacto medido

| Categoría | Cantidad |
|-----------|----------|
| Campos nuevos en `User` | 13 (3 multi-rol + 10 ARCA) |
| Campos eliminados en `Taller` | 10 (ARCA) |
| API endpoints con enforcement de rol | 54 (todos migrados a helper) |
| Páginas/layouts con lógica de rol | 30 |
| Type assertions `(session.user as {role?})` | 83 |
| Tests E2E afectados | 25 |
| Tests unitarios afectados | 17 |
| Pantalla nueva: selector de modo al login | 1 |
| Modal nuevo: advertencia activación segundo perfil | 1 |
| Componente nuevo: pestañas tipo Notion (toggle) | 1 |
| Wizard nuevo: activar segundo perfil (taller o marca) | 1 |

### Estimación refinada total: 35h (vs 31h del master)

| Spec | Master | v1 | v2 (final) | Justificación |
|------|--------|----|----|---------------|
| U-02 schema | 8h | 5h | **6h** | +10 campos ARCA a migrar |
| U-03 auth | 4h | 8h | **8h** | 54 endpoints a helper uniforme |
| U-04 toggle UI | 4h | 4h | **6h** | + pantalla selector + modal + wizard |
| U-05 migración | 3h | 2h | **2h** | Sin cambio |
| U-06 clasificación | 4h | 3h | **3h** | Sin cambio |
| U-07 anti-incesto | 2h | 2h | **2h** | Sin cambio |
| U-08 tests | 6h | 9h | **9h** | Sin cambio |
| **Total** | **31h** | **33h** | **35h** | +2h por pantalla intermedia + modal + wizard |

---

## 2. Decisiones de Gerardo (18-mayo-2026)

| ID | Decisión | Justificación |
|----|----------|---------------|
| **D1** | Schema = Opción A (array de roles + activeMode + CUIT centralizado) | El schema YA tiene perfiles separados (`Taller?`, `Marca?`). Solo falta el array de roles |
| **D2** | CUIT centralizado en `User.cuit @unique` | Cada CUIT = una identidad = un User. Coherente con master V4 §3.3 |
| **D3** | Registro: usuario elige rol, después puede activar segundo perfil | Reduce fricción inicial. Patrón Airbnb |
| **D4** | Toggle UX = Pestañas grandes tipo Notion (workspace-style) | Cambio de modo visible y deliberado, no escondido |
| **D5** | Migración automática de los 8 users seed | Sin conflictos, migración trivial |
| **D6** | Eliminar perfil = NO existe (caso borde #1 eliminado) | Modal de advertencia al activar segundo perfil avisa que es permanente |
| **D7** | TODA la data ARCA centralizada en User | Una sola verificación por CUIT, ambos roles requieren ARCA para operar |
| **D8** | 45 endpoints inline → migrar TODOS a helper | Código uniforme, mantenibilidad |
| **D9** | Modal de advertencia antes de activar segundo perfil | Decisión permanente, mejor informar de más |
| **D10** | Login con doble perfil → pantalla "¿Cómo operás hoy?" cada vez | No recuerda último modo. Cada login pregunta explícitamente |

---

## 3. Reglas de negocio derivadas

### RN-1: ARCA es prerequisito para operar

```
User.verificadoAfip = false → NO PUEDE:
- Aparecer en directorio de talleres/marcas
- Crear pedidos (si es marca)
- Cotizar pedidos (si es taller)
- Activar segundo perfil
- Cualquier operación comercial

Solo PUEDE:
- Ver dashboard limitado
- Completar verificación ARCA
- Ver pantalla de "Tu cuenta está pendiente de verificación"
```

### RN-2: CUIT es inmutable

```
- Una vez verificado con ARCA, el CUIT no se puede cambiar
- Si necesita corregir CUIT: contactar soporte (manual)
- El registro inicial usa el CUIT que se va a verificar
```

### RN-3: Roles son acumulables, no intercambiables

```
- User puede tener [TALLER] o [MARCA] o [TALLER, MARCA]
- Activar segundo perfil = AGREGAR rol (no convertir)
- ADMIN, ESTADO, CONTENIDO NO se pueden combinar con TALLER/MARCA
- Esos 3 roles son administrativos, no comerciales
```

### RN-4: Activación de segundo perfil es permanente

```
- Sin "eliminar perfil"
- Si arrepentido: contactar soporte (caso por caso)
- Modal de advertencia previo lo deja claro
```

### RN-5: Datos ARCA se heredan entre roles

```
- Si User activa segundo perfil:
  - CUIT ya verificado → hereda automáticamente
  - Categoría monotributo, actividades, etc. → mismas
  - NO se vuelve a consultar ARCA
- Los datos ARCA son del User, no del rol específico
```

### RN-6: Membresía/nivel es por rol

```
- Cada rol (Taller, Marca) tiene su propio:
  - Nivel (Bronce/Plata/Oro)
  - Puntaje
  - Histórico de pedidos
  - Métricas
- No se mezclan entre roles
```

---

## 4. Diseño funcional

### Flujo 1: Registro nuevo (taller o marca)

```
1. Usuario llega al landing
2. Click "Soy taller" o "Soy marca"
3. Formulario de registro:
   - Email
   - Contraseña
   - CUIT
4. Submit:
   - Crea User con role temporal = rol elegido
   - User.cuit = cuit ingresado
   - User.verificadoAfip = false (todavía)
5. Verificación de email (magic link)
6. Verificación ARCA del CUIT (automática)
   - Si verifica OK:
     - User.verificadoAfip = true
     - Datos ARCA se guardan en User (categoría, actividades, etc.)
   - Si falla:
     - Cuenta queda en estado "pendiente"
     - Mostrar pantalla "Tu CUIT no se pudo verificar"
7. Si OK: wizard de perfil específico
   - TALLER: 11 pasos
   - MARCA: 4-5 campos básicos
8. Cuenta activa:
   - User.roles = [ROL_ELEGIDO]
   - User.activeMode = ROL_ELEGIDO
   - Relación Taller o Marca creada (1:1)
```

### Flujo 2: Activar segundo perfil

```
1. Usuario logueado como TALLER (o MARCA)
2. Accede a "Mi cuenta" → sección "Mis perfiles"
3. Ve:
   - Perfil activo: TALLER ✅
   - Botón: "Activar perfil de marca"
4. Click → Modal de advertencia:
   
   ┌──────────────────────────────────────────────────────┐
   │ Activar perfil de marca                              │
   │                                                       │
   │ Estás por activar un perfil de marca asociado a tu  │
   │ CUIT 20-12345678-9.                                  │
   │                                                       │
   │ ⚠️ Importante:                                       │
   │ Una vez activado, este perfil queda asociado a tu   │
   │ cuenta de forma permanente. Para gestionar la baja, │
   │ deberás contactar soporte.                          │
   │                                                       │
   │ Tu CUIT ya está verificado con ARCA. Los datos      │
   │ fiscales se heredan automáticamente al nuevo perfil.│
   │                                                       │
   │           [Cancelar]  [Continuar con activación]    │
   └──────────────────────────────────────────────────────┘
   
5. Click "Continuar":
   - Mini-wizard de marca (4-5 campos):
     - Nombre comercial
     - Tipo (diseño independiente, marca comercial, etc.)
     - Volumen mensual estimado
     - Frecuencia de compra
6. Al completar:
   - Se crea Marca vinculada al mismo User
   - User.roles actualizado: [TALLER, MARCA]
   - CUIT y datos ARCA compartidos (ya están en User)
   - Pestañas de toggle aparecen en header
7. Redirect al dashboard del NUEVO modo activado (Marca)
```

### Flujo 3: Login con doble perfil

```
1. Usuario hace login (email + password) normal
2. Auth carga User.roles
3. ¿Cuántos roles tiene?
   
   CASO A: Un solo rol (roles.length === 1)
   → Redirect directo a /{role.toLowerCase()}
   → Comportamiento idéntico al actual

   CASO B: Doble rol (roles.length > 1)
   → Pantalla intermedia "¿Cómo querés operar hoy?"
   
   ┌──────────────────────────────────────────────────────┐
   │ Hola, Roberto                                         │
   │                                                       │
   │ ¿Cómo querés operar hoy?                             │
   │                                                       │
   │  ┌────────────────────┐  ┌────────────────────┐    │
   │  │      🔧            │  │       🏢            │    │
   │  │                    │  │                    │    │
   │  │     Taller         │  │      Marca         │    │
   │  │                    │  │                    │    │
   │  │  Producir prendas  │  │  Buscar talleres   │    │
   │  └────────────────────┘  └────────────────────┘    │
   │                                                       │
   └──────────────────────────────────────────────────────┘
   
4. Click en un modo:
   - PATCH /api/auth/mode { activeMode: 'TALLER' }
   - Cookie/JWT actualizado
5. Redirect a /{modo.toLowerCase()} dashboard
6. Header muestra pestañas de toggle (porque tiene doble perfil)
```

### Flujo 4: Cambio de modo (toggle pestañas tipo Notion)

```
Header con doble perfil:

┌─────────────────────────────────────────────────────────────────┐
│ ┌────────────┐  ┌────────────┐                                  │
│ │ 🔧 Taller  │  │ 🏢 Marca   │                  👤 Roberto ▾   │
│ └════════════┘  └────────────┘                                  │
│  (activo)        (inactivo)                                     │
├─────────────────────────────────────────────────────────────────┤
│ 🔵 PDT  Plataforma Digital Textil                              │
│ [Tablero] [Mis pedidos] [Mi formalización] [Mi perfil]         │
└─────────────────────────────────────────────────────────────────┘

1. Click en pestaña "Marca":
2. PATCH /api/auth/mode { activeMode: 'MARCA' }
3. Cookie/JWT actualizado
4. Redirect a /marca (dashboard del nuevo modo)
5. Pestañas se invierten (Marca activa, Taller inactiva)
6. Tabs del header cambian (las de marca)
7. Cero confirmación, click directo
```

### Diseño visual del toggle (Notion-style)

```
PRINCIPIO: las pestañas son visibles y deliberadas, no escondidas
- Ancho: ocupan parte superior del header (banda)
- Fondo: pestaña activa con color sólido + sombra suave
- Fondo: pestaña inactiva más clara, sin sombra
- Hover: cursor pointer, leve highlight
- Mobile: las dos pestañas en la parte superior, full width

Estados visuales:
- ACTIVA: bg-white, border-bottom: terra-600 (2px), font-bold
- INACTIVA: bg-gray-50, text-gray-600, hover:bg-gray-100
- DISABLED: no aplicable (siempre clickeable si tiene el rol)
```

### Resolución de casos borde (actualizada)

| # | Caso | Resolución v2 |
|---|------|---------------|
| 1 | ~~Eliminar perfil después de activar~~ | **ELIMINADO** — No existe. Modal de advertencia previo lo aclara |
| 2 | Marca quiere "convertirse en taller" | Es Flujo 2 (activación de segundo perfil), no conversión |
| 3 | CUIT ya existe en otro User | `User.cuit @unique` impide duplicados. Error claro: "Este CUIT ya está registrado" |
| 4 | Doble perfil + membresía vence | Cada rol mantiene su propio nivel/puntaje (RN-6) |
| 5 | Verificación ARCA del CUIT | UNA vez en registro. Datos guardados en User. Heredados al segundo perfil (RN-5) |
| 6 | Notificaciones con doble perfil | Van al User (ya es así). Visibles en ambos modos sin filtro |
| 7 | URLs `/taller/perfil` vs `/marca/perfil` | Rutas distintas. Middleware permite ambas si `roles.includes()`. activeMode determina dashboard default |
| 8 | Sesión entre devices | `User.activeMode` en DB. Si se loguea en otro device, ve pantalla selector de modo (Flujo 3) |

---

## 5. Análisis técnico

### 5.1 Schema actual

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  role      UserRole @default(TALLER)
  // ... 15+ campos más
  taller    Taller?
  marca     Marca?
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
  userId                       String   @unique
  cuit                         String   @unique
  verificadoAfip               Boolean  @default(false)
  verificadoAfipAt             DateTime?
  tipoInscripcionAfip          String?
  categoriaMonotributo         String?
  estadoCuitAfip               String?
  fechaInscripcionAfip         DateTime?
  actividadesAfip              Json?
  domicilioFiscalAfip          Json?
  empleadosRegistradosSipa     Int?
  empleadosSipaActualizadoAt   DateTime?
  // ... ~30 campos más
}

model Marca {
  userId           String  @unique
  cuit             String  @unique
  verificadoAfip   Boolean @default(false)
  // ... ~12 campos más
}
```

### 5.2 Schema propuesto v2

```prisma
model User {
  id                           String     @id @default(cuid())
  email                        String     @unique

  // NUEVOS: Multi-rol
  roles                        UserRole[] @default([])
  activeMode                   UserRole?

  // NUEVOS: CUIT centralizado
  cuit                         String?    @unique

  // NUEVOS: Data ARCA centralizada
  verificadoAfip               Boolean    @default(false)
  verificadoAfipAt             DateTime?
  tipoInscripcionAfip          String?
  categoriaMonotributo         String?
  estadoCuitAfip               String?
  fechaInscripcionAfip         DateTime?
  actividadesAfip              Json?
  domicilioFiscalAfip          Json?
  empleadosRegistradosSipa     Int?
  empleadosSipaActualizadoAt   DateTime?

  // DEPRECATED: mantener para backward compat durante U-02/U-03
  role                         UserRole   @default(TALLER)

  // Sin cambios
  taller                       Taller?
  marca                        Marca?
  // ... resto
}

model Taller {
  userId  String @unique
  cuit    String              // pierde @unique, queda como cache/display
  // ELIMINADOS: 10 campos ARCA (movidos a User)
  // ... resto sin cambios (campos productivos)
}

model Marca {
  userId         String  @unique
  cuit           String              // pierde @unique
  verificadoAfip Boolean @default(false)  // ELIMINADO (queda en User)
  // ... resto sin cambios
}
```

### 5.3 Diff visual

```diff
 model User {
+  // Multi-rol
+  roles                        UserRole[] @default([])
+  activeMode                   UserRole?
+  
+  // CUIT centralizado
+  cuit                         String?    @unique
+  
+  // Data ARCA centralizada
+  verificadoAfip               Boolean    @default(false)
+  verificadoAfipAt             DateTime?
+  tipoInscripcionAfip          String?
+  categoriaMonotributo         String?
+  estadoCuitAfip               String?
+  fechaInscripcionAfip         DateTime?
+  actividadesAfip              Json?
+  domicilioFiscalAfip          Json?
+  empleadosRegistradosSipa     Int?
+  empleadosSipaActualizadoAt   DateTime?

   role  UserRole @default(TALLER)  // DEPRECATED hasta U-08
 }

 model Taller {
-  cuit                         String   @unique
+  cuit                         String   // legacy/display
-  verificadoAfip               Boolean  @default(false)
-  verificadoAfipAt             DateTime?
-  tipoInscripcionAfip          String?
-  categoriaMonotributo         String?
-  estadoCuitAfip               String?
-  fechaInscripcionAfip         DateTime?
-  actividadesAfip              Json?
-  domicilioFiscalAfip          Json?
-  empleadosRegistradosSipa     Int?
-  empleadosSipaActualizadoAt   DateTime?
 }

 model Marca {
-  cuit                         String   @unique
+  cuit                         String   // legacy/display
-  verificadoAfip               Boolean  @default(false)
 }
```

### 5.4 Inventario de código afectado (sin cambios respecto v1)

| Patrón | Archivos | Líneas | Refactor |
|--------|----------|--------|----------|
| Usa `requiereRolApi()` helper | 9 | 17 | Auto: actualizar helper |
| Inline `(session.user as {role?}).role` | ~30 | 66 | **MIGRAR TODOS a helper (D8)** |
| Inline `session.user.role` directo | ~15 | 25 | **MIGRAR TODOS a helper (D8)** |
| Páginas con role checks | 30 | - | Layout-level + ajustes |
| Middleware | 1 | 162 | Refactor a `roles.includes()` + `activeMode` |
| Auth callbacks | 1 | - | JWT + Session con `roles` y `activeMode` |
| Componentes UI | 3 | - | header (toggle), sidebar, permisos.ts |
| Type augmentation | 1 | - | next-auth.d.ts |

### 5.5 Componentes nuevos UI

```
1. PantallaSelectorModo (post-login con doble perfil)
   - Ruta: /elegir-modo (intermedia)
   - Si roles.length > 1: render
   - Si roles.length === 1: redirect directo

2. PestanasToggle (en header)
   - Solo visible si roles.length > 1
   - 2 pestañas grandes (Taller / Marca)
   - Active state visual

3. ModalAdvertenciaActivacion
   - Texto fijo con CUIT del usuario
   - Botones: Cancelar / Continuar
   - Aparece antes del wizard de activación

4. MiniWizardSegundoPerfil
   - 4-5 campos (los específicos del rol que activa)
   - Re-usa componentes del wizard original
```

---

## 6. Plan de migración

### Paso 1: Schema (U-02)

```sql
-- A. Agregar campos multi-rol a User
ALTER TABLE users ADD COLUMN roles "UserRole"[] DEFAULT ARRAY[]::"UserRole"[];
ALTER TABLE users ADD COLUMN active_mode "UserRole";

-- B. Agregar CUIT centralizado a User
ALTER TABLE users ADD COLUMN cuit TEXT;

-- C. Agregar data ARCA centralizada a User
ALTER TABLE users ADD COLUMN verificado_afip BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN verificado_afip_at TIMESTAMP;
ALTER TABLE users ADD COLUMN tipo_inscripcion_afip TEXT;
ALTER TABLE users ADD COLUMN categoria_monotributo TEXT;
ALTER TABLE users ADD COLUMN estado_cuit_afip TEXT;
ALTER TABLE users ADD COLUMN fecha_inscripcion_afip TIMESTAMP;
ALTER TABLE users ADD COLUMN actividades_afip JSONB;
ALTER TABLE users ADD COLUMN domicilio_fiscal_afip JSONB;
ALTER TABLE users ADD COLUMN empleados_registrados_sipa INTEGER;
ALTER TABLE users ADD COLUMN empleados_sipa_actualizado_at TIMESTAMP;

-- D. Backfill multi-rol desde role actual
UPDATE users SET roles = ARRAY[role];
UPDATE users SET active_mode = role;

-- E. Backfill CUIT desde Taller (prioridad)
UPDATE users
   SET cuit = t.cuit
  FROM talleres t
 WHERE t.user_id = users.id;

-- F. Backfill CUIT desde Marca (si no hay taller)
UPDATE users
   SET cuit = m.cuit
  FROM marcas m
 WHERE m.user_id = users.id
   AND users.cuit IS NULL;

-- G. Backfill data ARCA desde Taller
UPDATE users
   SET verificado_afip               = t.verificado_afip,
       verificado_afip_at            = t.verificado_afip_at,
       tipo_inscripcion_afip         = t.tipo_inscripcion_afip,
       categoria_monotributo         = t.categoria_monotributo,
       estado_cuit_afip              = t.estado_cuit_afip,
       fecha_inscripcion_afip        = t.fecha_inscripcion_afip,
       actividades_afip              = t.actividades_afip,
       domicilio_fiscal_afip         = t.domicilio_fiscal_afip,
       empleados_registrados_sipa    = t.empleados_registrados_sipa,
       empleados_sipa_actualizado_at = t.empleados_sipa_actualizado_at
  FROM talleres t
 WHERE t.user_id = users.id;

-- H. Backfill verificadoAfip desde Marca (si no hay taller)
UPDATE users
   SET verificado_afip = m.verificado_afip
  FROM marcas m
 WHERE m.user_id = users.id
   AND users.verificado_afip = false;

-- I. Crear unique index en User.cuit
CREATE UNIQUE INDEX users_cuit_key ON users(cuit) WHERE cuit IS NOT NULL;

-- J. Eliminar @unique de Taller.cuit y Marca.cuit
DROP INDEX IF EXISTS talleres_cuit_key;
DROP INDEX IF EXISTS marcas_cuit_key;

-- K. Eliminar columnas ARCA de Taller (NOTA: solo después de validar backfill)
-- Esto se puede dejar para U-08 si queremos hacer migración no destructiva
-- En U-02 los mantenemos por backward compat
```

### Paso 2: Auth core (U-03)

```
1. auth.config.ts:
   - JWT callback: token.roles = user.roles, token.activeMode = user.activeMode
   - Session callback: idem
2. auth.ts: authorize() retorna roles y activeMode
3. next-auth.d.ts: tipos actualizados (roles: UserRole[], activeMode: UserRole)
4. permisos.ts: requiereRol y requiereRolApi leen roles
5. middleware.ts: lógica de acceso por roles.includes(), redirect a activeMode
6. 6 group layouts actualizados
7. 54 endpoints (todos) migrados a helper requiereRolApi() — D8
8. Type assertions (83) eliminadas (al pasar a helper)
```

### Paso 3: UI multi-rol (U-04)

```
1. Pantalla intermedia /elegir-modo (Flujo 3)
   - Component: PantallaSelectorModo
   - Solo redirige a aquí si roles.length > 1
2. Pestañas Notion-style en header (Flujo 4)
   - Component: PestanasToggle
   - PATCH /api/auth/mode endpoint
3. Sección "Mis perfiles" en mi-cuenta
4. Modal de advertencia activación (Flujo 2)
   - Component: ModalAdvertenciaActivacion
5. Mini-wizard de segundo perfil (Flujo 2)
   - Component: MiniWizardSegundoPerfil
```

### Paso 4: Datos producción (U-05)

```
1. Backup de DB antes de migrar
2. Ejecutar migration (Paso 1)
3. Verificar: cada user tiene roles, cuit, verificadoAfip correctos
4. Smoke test: login funciona para todos
5. Verificar pantalla intermedia (si hay doble perfil) - en seed no aplica
```

### Paso 5: Lógica de negocio (U-06, U-07)

```
U-06: Clasificación pedidos cuando user es TALLER+MARCA
U-07: Regla anti-incesto (no cotizar en propio pedido)
```

### Paso 6: Tests + cleanup (U-08)

```
1. Actualizar loginAs helper
2. Refactorizar 25 E2E + 17 unit tests
3. Tests nuevos: multi-rol, pantalla selector, toggle, modal
4. Eliminar User.role (campo deprecated)
5. Eliminar columnas ARCA de Taller/Marca (opcional, no destructivo)
```

### Rollback plan

| Escenario | Acción |
|-----------|--------|
| Migration SQL falla | `prisma migrate reset` + re-seed |
| Código rompe post-deploy | `git revert` del PR |
| Datos corruptos en prod | Restaurar backup pre-migración |
| Tests fallan masivamente | No mergear |

### Verificación post-migración

- [ ] Cada user tiene `roles` correcto
- [ ] Cada user con TALLER o MARCA tiene `cuit` correcto
- [ ] `activeMode` = `role` original para todos
- [ ] `verificadoAfip` migrado correctamente
- [ ] Datos ARCA migrados (verificar contra Taller original)
- [ ] Login funciona para los 5 roles
- [ ] Middleware permite acceso correcto
- [ ] Toggle NO aparece para roles.length === 1
- [ ] Pantalla intermedia NO aparece para roles.length === 1
- [ ] Tests E2E pasan

---

## 7. Riesgos identificados

| # | Riesgo | Probabilidad | Impacto | Mitigación |
|---|--------|--------------|---------|------------|
| 1 | Inline role checks olvidados | Baja (D8 migra todos) | Alto | Lint rule post-U-03 + grep exhaustivo |
| 2 | Migración ARCA pierde datos | Media | Alto | Backup pre-migración, NO eliminar columnas Taller/Marca en U-02 |
| 3 | Middleware edge case multi-rol | Baja | Alto | Tests específicos para user TALLER+MARCA |
| 4 | Pantalla intermedia molesta a usuarios single-role | Baja | Bajo | Solo aparece si roles.length > 1 (verificación explícita) |
| 5 | Pestañas tipo Notion no funcionan bien en mobile | Media | Medio | Diseñar mobile-first, validar con Sergio |
| 6 | Modal de advertencia ignorado | Baja | Medio | Texto claro, botones explícitos |
| 7 | Tests flaky por timing de session change | Media | Bajo | loginAs maneja storageState. Agregar wait si toggle cambia |
| 8 | CUIT verificado pero User no operativo | Baja | Bajo | RN-1 implementada correctamente en checks |

---

## 8. Casos borde resueltos (resumen)

| # | Caso | Resolución |
|---|------|------------|
| 1 | ~~Eliminar perfil~~ | NO existe. Modal advierte permanencia. Contactar soporte si arrepentido |
| 2 | Marca quiere ser taller | Es Flujo 2 (activar segundo perfil) |
| 3 | CUIT duplicado al registrarse | `User.cuit @unique` + error claro |
| 4 | Membresía con doble perfil | Cada rol mantiene su nivel (RN-6) |
| 5 | ARCA con doble perfil | Centralizado en User. Heredado al segundo (RN-5) |
| 6 | Notificaciones doble perfil | Al User, sin filtro por modo |
| 7 | URLs /taller vs /marca | Ambas accesibles si tiene el rol. activeMode = default |
| 8 | Sesión entre devices | Cada device pasa por pantalla intermedia (Flujo 3) |

---

## 9. Componentes nuevos UI a construir (U-04)

### 9.1 PantallaSelectorModo

```typescript
// /app/elegir-modo/page.tsx
// Server component (lee session)
// Si roles.length === 1 → redirect a /{role.toLowerCase()}
// Si roles.length > 1 → render 2 cards grandes
// Cada card: click → PATCH /api/auth/mode + redirect
```

### 9.2 PestanasToggle (header)

```typescript
// /compartido/componentes/layout/pestanas-toggle.tsx
// Server component que lee session
// Si roles.length <= 1 → return null
// Si roles.length > 1 → render banda con 2 pestañas
// onClick → PATCH + redirect
```

### 9.3 ModalAdvertenciaActivacion

```typescript
// /compartido/componentes/ui/modal-advertencia-activacion.tsx
// Props: { cuit: string, rolNuevo: 'TALLER' | 'MARCA', onConfirm, onCancel }
// Texto fijo con CUIT inyectado
// Botones: Cancelar + Continuar
```

### 9.4 MiniWizardSegundoPerfil

```typescript
// /app/mi-cuenta/activar-perfil/page.tsx
// Form de 4-5 campos según rol
// Submit → crea Taller o Marca + actualiza User.roles
// Redirect al dashboard del nuevo modo
```

---

## 10. Apéndice: Discovery del pre-flight (sin cambios respecto v1)

### A. Modelos del schema (44 total)

User, Account, Session, VerificationToken, Taller, Marca, ProcesoProductivo, TipoPrenda, PrendaProceso, TallerProceso, TallerPrenda, Maquinaria, TallerCertificacion, Pedido, Cotizacion, OrdenManufactura, PedidoInvitacion, Validacion, TipoDocumento, ReglaNivel, Coleccion, Video, Evaluacion, Certificado, ProgresoCapacitacion, IntentoEvaluacion, Auditoria, AccionCorrectiva, Denuncia, Notificacion, ConfiguracionSistema, ConfiguracionUpload, DocumentoRAG, LogActividad, NotaInterna, NotaSeguimiento, ConsultaArca, EscrowHito, MotivoNoMatch, ObservacionCampo, MensajeWhatsapp, MagicLink, Novedad, TallerPlantilla.

### B. Seed: usuarios creados

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

### C. Infraestructura de tests

| Framework | Directorio | Archivos | Activo |
|-----------|-----------|----------|--------|
| Vitest 4.x | `src/__tests__/` | 33 | Sí |
| Playwright 1.59 | `tests/e2e/` | 25 | Sí |

`loginAs` helper actual: `'taller' | 'marca' | 'admin' | 'estado'` (4 roles).

---

## 11. Próximos pasos

1. **Gerardo aprueba este documento** (U-01 v2)
2. **Commit del documento a develop:**
   - `docs/analisis/U-01_multi-rol-airbnb.md` (reemplaza v1)
3. **Arrancar U-02** (schema refactor, 6h)
4. **Después de U-02 mergeado:** U-03 (auth, 8h)
5. **Después de U-03:** U-04 (toggle UI + pantalla intermedia, 6h)
6. **Después de U-04:** U-05, U-06, U-07 en paralelo
7. **U-08 al final:** tests y cleanup

**Total Bloque U: ~35h** (5 días de trabajo continuo o ~2 semanas con ritmo realista).

---

*Fin de U-01 v2. Este documento es la base aprobada para los specs U-02 a U-08.*
