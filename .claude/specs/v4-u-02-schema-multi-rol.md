# SPEC V4 — U-02: Schema refactor multi-rol

> **TEMPLATE_SPEC_V4_v2 oficial** (pre-flight bloqueante + selectores críticos).
> **Base:** U-01 v2 aprobado por Gerardo (18-mayo-2026).
> **Output:** Schema actualizado + migración SQL + backfill de datos.
> **NO TOCA código de la app** (solo Prisma + migración).

---

## 0. Pre-flight checks (BLOQUEANTE)

### 0.1 Verificar entorno

- [ ] CI verde en develop (post X-07a merge)
- [ ] U-01 v2 commiteado en `.claude/specs/U-01_multi-rol-airbnb_v2-tipos-corregidos.md`
- [ ] X-07a mergeado (SHA 2d914d6)
- [ ] Develop al día
- [ ] Branch nuevo: `feature/u-02-schema-multi-rol`

### 0.2 Confirmar estructura actual de Prisma

```bash
# Verificar definición ACTUAL de User
sed -n '/^model User /,/^}/p' prisma/schema.prisma

# Verificar definición de Taller (campos ARCA)
sed -n '/^model Taller /,/^}/p' prisma/schema.prisma | head -80

# Verificar definición de Marca
sed -n '/^model Marca /,/^}/p' prisma/schema.prisma

# Verificar enum UserRole
grep -A 10 "enum UserRole" prisma/schema.prisma
```

**REPORTAR exactamente:**
- Campos actuales de User (lista completa)
- Tipos PostgreSQL de los 10 campos ARCA en Taller (para migrar)
- Tipos de cuit en Taller y Marca
- Índices únicos actuales

### 0.3 Verificar estado de migraciones

```bash
# Última migración
ls prisma/migrations/ | tail -5

# Verificar que no hay migraciones pendientes
npx prisma migrate status 2>&1 | head -20
```

**REPORTAR:**
- Última migración ejecutada
- Si hay migraciones pendientes (debería estar limpio)
- Nombre sugerido para nueva migración

### 0.4 Verificar datos seed actuales

```bash
# Verificar seed
grep -n "rol.*TALLER\|rol.*MARCA" prisma/seed.ts | head -20

# Verificar campos ARCA en seed
grep -A 5 "verificadoAfip\|categoriaMonotributo" prisma/seed.ts | head -30
```

**REPORTAR:**
- Cuántos users TALLER se crean en seed con datos ARCA
- Cuántas Marcas tienen verificadoAfip = true
- Estructura de datos ARCA en el seed (categoría, actividades, etc.)

### 0.5 Verificar TODOS los lugares que referencian campos a migrar

```bash
# Referencias a Taller.cuit (debería seguir funcionando como display)
grep -rn "taller\.cuit\|Taller.*cuit" src/ --include="*.ts" --include="*.tsx" | head -20

# Referencias a Marca.cuit
grep -rn "marca\.cuit\|Marca.*cuit" src/ --include="*.ts" --include="*.tsx" | head -20

# Referencias a Taller.verificadoAfip
grep -rn "verificadoAfip" src/ --include="*.ts" --include="*.tsx" | head -30

# Referencias a campos ARCA
grep -rn "categoriaMonotributo\|tipoInscripcionAfip\|estadoCuitAfip" src/ --include="*.ts" --include="*.tsx" | head -20
```

**REPORTAR:**
- Cuántos archivos referencian `taller.cuit` o `marca.cuit`
- Cuántos referencian `taller.verificadoAfip` (estos van a romperse temporalmente)
- Estimación de archivos a refactorizar en U-03

### 0.6 Verificar tests que pueden romperse

```bash
# Tests que crean Taller o Marca
grep -rn "create.*[Tt]aller\|create.*[Mm]arca" tests/ src/__tests__/ | head -10

# Tests que verifican verificadoAfip
grep -rn "verificadoAfip" tests/ src/__tests__/ | head -10
```

**REPORTAR:**
- Cuántos tests pueden romperse al cambiar el schema
- Si hay fixtures/mocks que usan campos ARCA directamente en Taller

### 0.7 Output bloqueante

PAUSAR. Reportar a Gerardo:

1. **Confirmación de schema actual** (todo según U-01 v2 esperaba)
2. **Tipos exactos** de los 10 campos ARCA (necesario para migración SQL)
3. **Archivos que se rompen temporalmente** (estimación)
4. **Confirmación de seed limpio** (8 users, sin sorpresas)
5. **Plan de migración SQL validado** (los 11 pasos del U-01 v2)
6. **Decisiones puntuales pendientes:**
   - ¿Eliminar columnas ARCA de Taller en U-02 o dejar para U-08?
   - ¿Backfill `activeMode` = role o = NULL inicialmente?
   - Nombre de la migración

**NO avanzar sin aprobación.**

---

## 1. Metadata

| Campo | Valor |
|---|---|
| **ID** | U-02 |
| **Versión** | v4 |
| **Slug** | schema-multi-rol |
| **Estimación** | 6h |
| **Riesgo** | Medio (cambio de schema, migración de datos) |
| **Dependencias** | U-01 v2 aprobado y commiteado |
| **Bloquea** | U-03 (auth), U-04 (UI), todo el bloque U |
| **Branch** | `feature/u-02-schema-multi-rol` |

---

## 2. Contexto

### Decisiones aplicadas de U-01 v2

| ID | Decisión | Impacto en U-02 |
|----|----------|-----------------|
| D1 | Opción A: array de roles + activeMode | `User.roles UserRole[]`, `User.activeMode UserRole?` |
| D2 | CUIT centralizado | `User.cuit String? @unique` |
| D5 | Migración automática | Backfill SQL incluido |
| D7 | ARCA centralizado en User | 10 campos ARCA migrados de Taller → User |

### Lo que NO hace U-02

- ❌ Cambiar código de la app (auth, endpoints, UI) → U-03 y siguientes
- ❌ Eliminar `User.role` (deprecated, queda hasta U-08)
- ❌ Eliminar columnas ARCA de Taller (opcional, decidir en pre-flight)
- ❌ Validaciones de negocio (ej: "no operar sin ARCA verificado") → U-03

### Lo que SÍ hace U-02

- ✅ Agregar 13 campos nuevos a User (3 multi-rol + 10 ARCA)
- ✅ Eliminar `@unique` de Taller.cuit y Marca.cuit
- ✅ Crear migración SQL con backfill completo
- ✅ Actualizar `prisma/schema.prisma`
- ✅ Verificar que los 8 users seed migran correctamente
- ✅ Mantener backward compat: `User.role` sigue funcionando

---

## 3. Qué construir

### 3.1 Cambios en schema.prisma

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique

  // DEPRECATED — mantener hasta U-08
  role      UserRole @default(TALLER)

  // NUEVOS: Multi-rol
  roles      UserRole[] @default([])
  activeMode UserRole?

  // NUEVOS: CUIT centralizado
  cuit       String?    @unique

  // NUEVOS: Data ARCA centralizada (10 campos)
  verificadoAfip               Boolean   @default(false)
  verificadoAfipAt             DateTime?
  tipoInscripcionAfip          String?
  categoriaMonotributo         String?
  estadoCuitAfip               String?
  fechaInscripcionAfip         DateTime?
  actividadesAfip              Json?
  domicilioFiscalAfip          Json?
  empleadosRegistradosSipa     Int?
  empleadosSipaActualizadoAt   DateTime?

  // Sin cambios (resto de campos y relaciones)
  // ...
  taller     Taller?
  marca      Marca?
  // ...
}

model Taller {
  // ...
  cuit  String              // PIERDE @unique, queda como cache/display
  // ...
  // Los 10 campos ARCA SE MANTIENEN en U-02 (backward compat)
  // Se pueden eliminar en U-08 después de verificar
  verificadoAfip               Boolean   @default(false)
  verificadoAfipAt             DateTime?
  // ... etc (los 10 campos siguen)
}

model Marca {
  // ...
  cuit            String              // PIERDE @unique
  verificadoAfip  Boolean   @default(false)  // se mantiene por backward compat
  // ...
}
```

### 3.2 Migración SQL (orden exacto)

```sql
-- Migration: add_multirol_arca_to_user

-- A. Agregar campos multi-rol a User
ALTER TABLE users ADD COLUMN roles "UserRole"[] DEFAULT ARRAY[]::"UserRole"[];
ALTER TABLE users ADD COLUMN active_mode "UserRole";

-- B. Agregar CUIT centralizado
ALTER TABLE users ADD COLUMN cuit TEXT;

-- C. Agregar 10 campos ARCA a User
ALTER TABLE users ADD COLUMN verificado_afip BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN verificado_afip_at TIMESTAMP(3);
ALTER TABLE users ADD COLUMN tipo_inscripcion_afip TEXT;
ALTER TABLE users ADD COLUMN categoria_monotributo TEXT;
ALTER TABLE users ADD COLUMN estado_cuit_afip TEXT;
ALTER TABLE users ADD COLUMN fecha_inscripcion_afip TIMESTAMP(3);
ALTER TABLE users ADD COLUMN actividades_afip JSONB;
ALTER TABLE users ADD COLUMN domicilio_fiscal_afip JSONB;
ALTER TABLE users ADD COLUMN empleados_registrados_sipa INTEGER;
ALTER TABLE users ADD COLUMN empleados_sipa_actualizado_at TIMESTAMP(3);

-- D. Backfill: roles desde role
UPDATE users SET roles = ARRAY[role];

-- E. Backfill: activeMode desde role  
UPDATE users SET active_mode = role;

-- F. Backfill: CUIT desde Taller (prioridad)
UPDATE users
   SET cuit = t.cuit
  FROM talleres t
 WHERE t.user_id = users.id;

-- G. Backfill: CUIT desde Marca (si no hay taller)
UPDATE users
   SET cuit = m.cuit
  FROM marcas m
 WHERE m.user_id = users.id
   AND users.cuit IS NULL;

-- H. Backfill: data ARCA desde Taller (los 10 campos)
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

-- I. Backfill: verificadoAfip desde Marca (si no hay Taller)
UPDATE users
   SET verificado_afip = m.verificado_afip
  FROM marcas m
 WHERE m.user_id = users.id
   AND users.verificado_afip = false;

-- J. Crear unique index en User.cuit (partial: solo si no es NULL)
CREATE UNIQUE INDEX users_cuit_key ON users(cuit) WHERE cuit IS NOT NULL;

-- K. Eliminar @unique de Taller.cuit y Marca.cuit
DROP INDEX IF EXISTS talleres_cuit_key;
DROP INDEX IF EXISTS marcas_cuit_key;
```

### 3.3 Actualizar seed.ts (opcional)

Como `User.role` sigue siendo el campo principal hasta U-08, el seed actual **sigue funcionando** sin cambios. El backfill automático se encarga de poblar los campos nuevos.

**Decisión:** NO modificar seed.ts en U-02. Se ajusta en U-03 cuando los nuevos campos se usen en código.

---

## 4. Prescripciones técnicas

### 4.1 — Nombre de la migración

Sugerencia: `20260518_agregar_multirol_y_arca_a_user`

Verificar con timestamp actual:
```bash
echo "20$(date +%y%m%d%H%M%S)_agregar_multirol_y_arca_a_user"
```

### 4.2 — Cómo crear la migración

```bash
# Opción 1: Generar migration desde schema.prisma actualizado
npx prisma migrate dev --name agregar_multirol_y_arca_a_user --create-only
# Después editar el SQL generado para agregar los backfills

# Opción 2: Crear migration SQL manual
mkdir -p prisma/migrations/$(date +%Y%m%d%H%M%S)_agregar_multirol_y_arca_a_user
# Pegar SQL manualmente
```

**Recomendación:** Opción 1 (generar con Prisma) y agregar los UPDATE de backfill al SQL generado.

### 4.3 — Validación post-migración

```bash
# Reset DB de dev y aplicar nueva migración + seed
npx prisma migrate reset --force --skip-seed
npx prisma migrate deploy
npx prisma db seed

# Verificar que los users tienen los nuevos campos correctos
# (esto debería hacerse via Prisma Studio o queries SQL directas)

# Smoke test mínimo
echo "Verificar roles array poblado:"
# SELECT id, email, role, roles, active_mode, cuit, verificado_afip FROM users;
```

### 4.4 — Backward compatibility durante el deploy

```
ANTES de mergear U-02:
- User.role existe y se usa en todo el código
- Los nuevos campos no están

DESPUÉS de mergear U-02:
- User.role SIGUE existiendo (con su valor original)
- User.roles, User.activeMode, User.cuit, ARCA TAMBIÉN existen
- El código sigue usando User.role (no se rompe nada)
- En U-03 se migra el código a usar User.roles
```

**IMPORTANTE:** después de U-02 el sistema debe seguir funcionando exactamente igual. Los campos nuevos están pero no se usan todavía.

---

## 5. Casos borde

| # | Caso | Resolución |
|---|------|------------|
| 1 | Migration falla a la mitad | Prisma hace rollback automático. Manual: `prisma migrate reset` |
| 2 | User existe sin Taller ni Marca (admin, estado, contenido) | `cuit` queda NULL, `verificadoAfip` queda false. Correcto |
| 3 | User con datos ARCA inconsistentes entre Taller y Marca | Backfill prioriza Taller. Si Marca tiene `verificadoAfip = true` pero Taller no, queda con true (paso I del SQL) |
| 4 | Cantidad de roles diferente al esperado | El backfill copia `role` único a `roles = ARRAY[role]`. Siempre 1 rol inicial |
| 5 | activeMode null vs role | `activeMode` se setea = role. Si después U-03 prefiere null como default, se ajusta |

---

## 6. Criterios de aceptación

### Schema
- [ ] `prisma/schema.prisma` actualizado con los 13 campos nuevos en User
- [ ] `Taller.cuit` y `Marca.cuit` pierden `@unique`
- [ ] Los 10 campos ARCA SIGUEN en Taller (no se eliminan en U-02)
- [ ] `User.role` SIGUE existiendo (deprecated)

### Migración
- [ ] Archivo `prisma/migrations/.../migration.sql` creado
- [ ] SQL incluye 11 pasos según U-01 v2 §6
- [ ] `npx prisma migrate dev` ejecuta sin errores
- [ ] `npx prisma migrate reset --force` + seed funciona

### Datos
- [ ] Los 8 users seed tienen `roles` poblado correctamente
- [ ] Los 5 users TALLER/MARCA tienen `cuit` poblado
- [ ] Los 3 users TALLER tienen `verificadoAfip` migrado
- [ ] ADMIN/ESTADO/CONTENIDO tienen `cuit = NULL`, `verificadoAfip = false`

### Build y tests
- [ ] `npm run build` pasa
- [ ] Tests E2E pasan (NO deberían romperse porque User.role sigue existiendo)
- [ ] Tests unit pasan
- [ ] CI verde

### Backward compat
- [ ] Login funciona para los 5 roles seed
- [ ] Acceso a dashboards funciona (no se rompió nada)
- [ ] No hay errores de tipo TypeScript

---

## 7. Tests manuales post-implementación

### Test 1 — Reset y seed limpio

```bash
npx prisma migrate reset --force
npx prisma db seed
```

Verificar:
- [ ] Reset OK sin errores
- [ ] Seed crea 8 users
- [ ] No hay errores en console

### Test 2 — Login funciona

```
1. npm run dev
2. Abrir http://localhost:3000
3. Login como admin (lucia.fernandez@pdt.org.ar / pdt2026)
4. Verificar acceso a /admin
5. Login como taller (roberto.gimenez@pdt.org.ar / pdt2026)
6. Verificar acceso a /taller
```

### Test 3 — Verificar datos migrados (Prisma Studio)

```bash
npx prisma studio
```

En tabla `users`:
- [ ] Cada user tiene `roles` con 1 elemento (igual a `role`)
- [ ] Cada user TALLER/MARCA tiene `cuit` poblado
- [ ] Roberto Giménez: verificadoAfip = true (taller verificado en seed)
- [ ] Carlos Mendoza (Oro): tiene datos ARCA completos
- [ ] Valentina Ramos (Marca): tiene `cuit`, NO tiene datos ARCA detallados

---

## 8. Riesgos

| # | Riesgo | Mitigación |
|---|--------|------------|
| 1 | Migration falla en algún UPDATE | Prisma hace rollback. Verificar SQL en dev primero |
| 2 | Datos ARCA en Taller con tipos distintos a los esperados | Pre-flight 0.2 reporta tipos exactos |
| 3 | Test de seed falla por cambio de schema | Seed sigue usando `role`, no se rompe. Si se rompe: ajustar |
| 4 | Producción tiene users sin CUIT que necesitarían tener | Pre-flight 0.4 valida datos. Si hay sorpresas: documentar |
| 5 | Migration tarda mucho con datos reales en prod | En dev con 8 users: milisegundos. En prod del piloto: segundos máx |
| 6 | Conflicto con migración paralela (Sergio mergea algo) | Coordinar: U-02 sin paralelo con otros schema changes |

---

## 9. Plan de implementación

### Fase 1: Pre-flight (15-20 min)
Ejecutar Sección 0 completa. Reportar y esperar OK de Gerardo.

### Fase 2: Modificar schema.prisma (15 min)
Agregar los 13 campos a User según §3.1.
Eliminar `@unique` de Taller.cuit y Marca.cuit.

### Fase 3: Generar migración con Prisma (15 min)
```bash
npx prisma migrate dev --name agregar_multirol_y_arca_a_user --create-only
```

### Fase 4: Editar SQL para agregar backfill (45 min)
Abrir el `migration.sql` generado y agregar los pasos D-I del U-01 v2.

### Fase 5: Aplicar y verificar (30 min)
```bash
npx prisma migrate reset --force
npx prisma migrate deploy
npx prisma db seed
```
Verificar datos en Prisma Studio.

### Fase 6: Build y tests (30 min)
```bash
npm run build
npx tsc --noEmit
npx playwright test --grep "smoke"
```

### Fase 7: Commit y PR (15 min)
```bash
git add prisma/
git commit -m "feat(u-02): schema multi-rol con CUIT y ARCA centralizados

Cambios:
- User: + roles[], activeMode, cuit, 10 campos ARCA
- Taller.cuit y Marca.cuit pierden @unique
- Migration con backfill automático de los 8 users seed
- User.role mantenido (deprecated hasta U-08)

Refs: U-01 v2 (decisiones D1, D2, D5, D7)"

git push -u origin feature/u-02-schema-multi-rol
gh pr create --title "feat: U-02 schema multi-rol con CUIT y ARCA centralizados" \
  --body "Implementa los cambios de schema de U-01 v2.

Refs: .claude/specs/U-01_multi-rol-airbnb_v2-tipos-corregidos.md"
```

### Fase 8: Esperar CI y mergear
Tras CI verde y aprobación de Gerardo.

**Total estimado: 6h**

---

## 10. Definición de "Done"

- [ ] PR mergeado a develop
- [ ] CI verde
- [ ] Migración aplicada exitosamente en preview
- [ ] Los 8 users seed migrados correctamente
- [ ] User.role coexiste con User.roles (backward compat)
- [ ] Build TypeScript pasa
- [ ] Tests E2E pasan (no deberían cambiar)
- [ ] U-03 listo para arrancar

---

## 11. Selectores críticos (a completar en pre-flight)

[A COMPLETAR EN SECCIÓN 0]

Posibles puntos sensibles:
- `prisma.user.findUnique({ where: { cuit } })` — NUEVO en U-03 (no aplica en U-02)
- Foreign keys que apuntan a User
- Tests que crean Talleres con `cuit` específico

---

**Fin del SPEC U-02 — Schema refactor multi-rol**

> Spec contenido y focalizado. Solo schema + migración.
> Después de U-02 mergeado: arrancar U-03 (auth refactor).
> El código NO se toca en este spec (sigue funcionando con User.role).
