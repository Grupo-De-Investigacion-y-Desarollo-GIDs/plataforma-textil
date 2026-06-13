# SPEC V4 — U-01: Análisis funcional + técnico multi-rol Airbnb

> **Spec con TEMPLATE_SPEC_V4_v2 oficial** (pre-flight bloqueante + selectores críticos).
> **Este spec NO implementa código.** Produce decisiones para U-02 a U-08.
> **Salida:** documento de diseño + análisis de impacto + plan de migración + estimaciones refinadas.

---

## 0. Pre-flight checks (BLOQUEANTE)

### 0.1 Verificar entorno

- [ ] CI verde en develop
- [ ] X-07a status (mergeado o pendiente OK de Sergio)
- [ ] Develop al día

### 0.2 Discovery del schema actual

```bash
# Schema completo de User
grep -A 30 "^model User " prisma/schema.prisma

# Modelos relacionados a User
grep -B 2 -A 20 "model Account\|model Session\|model Taller\|model Marca\|model PerfilTaller\|model PerfilMarca" prisma/schema.prisma

# Foreign keys que apuntan a User
grep -B 1 -A 2 "userId\|user_id" prisma/schema.prisma | grep "@relation\|userId" | head -30

# Enum de roles actual
grep -A 10 "enum Rol\|enum Role\|enum UserRole" prisma/schema.prisma

# Migraciones recientes que tocaron User/Taller/Marca
ls prisma/migrations/ | tail -10
```

**REPORTAR:**
- Estructura exacta de `User` (todos los campos)
- Relación actual User ↔ Taller (¿1 a 1? ¿1 a muchos?)
- Relación actual User ↔ Marca
- Cuántos modelos referencian a `User.id`
- Valores actuales del enum de rol

### 0.3 Discovery de datos en DB

```bash
# Si dev DB es accesible:
# Conteo de usuarios por rol
# Cantidad con datos completos vs incompletos

# O verificar seed para saber qué crea:
grep -A 20 "rol.*TALLER\|rol.*MARCA" prisma/seed.ts | head -50
wc -l prisma/seed.ts
```

**REPORTAR:**
- Cuántos usuarios crea el seed por rol
- Si hay usuarios con datos ambiguos
- Si hay constraints que pueden romper migración

### 0.4 Discovery de endpoints/UI afectados

```bash
# Endpoints que usan rol del usuario
grep -rn "session.user.rol\|session.user.role" src/app/api/ | head -20

# Páginas que renderean según rol
grep -rn "rol === 'TALLER'\|rol === 'MARCA'" src/app/ | head -20

# Middleware actual (lógica de rol)
cat src/middleware.ts | head -80

# Componentes que dependen del rol
grep -rln "session?.user?.rol\|useSession.*rol" src/compartido/
```

**REPORTAR:**
- Cuántos endpoints chequean rol
- Cuántas páginas tienen lógica condicional por rol
- Componentes de UI que dependen del rol
- Estimación de impacto del refactor

### 0.5 Discovery de tests

```bash
# Tests que dependen de roles
grep -rn "loginAs('taller')\|loginAs('marca')" tests/e2e/ | head -10
grep -rn "rol.*TALLER\|rol.*MARCA" tests/ | head -10
```

**REPORTAR:**
- Cuántos tests usan loginAs y con qué roles
- Tests que pueden romperse con cambio de schema

### 0.6 Output bloqueante

PAUSAR. Reportar a Gerardo:

1. **Estructura actual del schema** (qué hay que cambiar)
2. **Cantidad real de usuarios a migrar** (validar decisión #3)
3. **Cantidad de endpoints/UI afectados** (estimar refactor)
4. **¿Hay constraints o datos ambiguos?** (riesgo de migración)
5. **Tests E2E afectados** (estimar fixes)
6. **Decisión técnica clave para resolver en U-01:** ¿perfiles separados (PerfilTaller + PerfilMarca) o array de roles?

**NO avanzar a implementación sin aprobación.**

---

## 1. Metadata

| Campo | Valor |
|---|---|
| **ID** | U-01 |
| **Versión** | v4 |
| **Slug** | analisis-multi-rol-airbnb |
| **Estimación** | 4h (análisis, no implementación) |
| **Riesgo** | Bajo (es solo análisis y diseño) |
| **Output** | Documento de diseño + plan de migración + lista U-02 a U-08 refinada |
| **Dependencias** | Master V4 §3.3 |

---

## 2. Contexto y motivación

### Decisión 3.3 del Master V4

> "Un mismo CUIT puede operar como taller y marca."
> "Modelo elegido: Airbnb adaptado, permisivo con visibilidad institucional."

### Decisiones de Gerardo (18-mayo-2026)

1. **Registro:** usuario elige rol al registrarse, después puede activar otro perfil
2. **Toggle UX:** en el header (cambio de modo activo)
3. **Usuarios existentes:** se migran automáticamente manteniendo su rol
4. **Sergio:** no necesita estar involucrado en este spec

### Por qué este spec es crítico

```
Bloque U = MVP no negociable
Sin esto, talleres+marca abren 2 cuentas con datos sucios
U-01 = base de U-02 a U-08 (35h total del bloque)

Si U-01 se hace mal:
→ U-02 a U-08 salen mal
→ Migración rompe datos del piloto
→ Refactor sin fin

Si U-01 se hace bien:
→ U-02 a U-08 fluyen
→ Migración predecible
→ Refactor ordenado
```

---

## 3. Qué construir (este spec produce documentos, no código)

### Output #1 — Diseño funcional

Documento que responde:
1. ¿Cómo se registra un usuario nuevo?
2. ¿Cómo activa un segundo perfil (taller → marca o viceversa)?
3. ¿Cómo cambia entre modos (toggle)?
4. ¿Qué ve en cada modo?
5. ¿Cómo se aplica la regla "anti-incesto"?
6. ¿Qué pasa con CUIT (compartido entre modos)?
7. ¿Qué pasa con verificación ARCA (compartida)?
8. ¿Qué pasa con membresía vigente (única)?

### Output #2 — Análisis técnico del código actual

Documento que responde:
1. ¿Cómo está modelado hoy User/Taller/Marca?
2. ¿Cuántas referencias hay a `User.rol`?
3. ¿Cuántos endpoints chequean rol?
4. ¿Cuántas páginas/componentes dependen del rol?
5. ¿Hay datos ambiguos en DB actual?

### Output #3 — Decisión técnica clave

**¿Perfiles separados o array de roles?**

**Opción A — Array de roles (más simple):**
```prisma
model User {
  id    String   @id
  email String   @unique
  cuit  String   @unique
  roles UserRole[] // [TALLER] o [MARCA] o [TALLER, MARCA]
  // ... datos taller inline (campos opcionales)
  // ... datos marca inline (campos opcionales)
}
```

**Opción B — Perfiles separados (más limpio):**
```prisma
model User {
  id           String        @id
  email        String        @unique
  cuit         String        @unique
  perfilTaller PerfilTaller?
  perfilMarca  PerfilMarca?
}

model PerfilTaller {
  id     String @id
  userId String @unique
  user   User @relation(fields: [userId], references: [id])
  // ... campos específicos de taller
}

model PerfilMarca {
  id     String @id
  userId String @unique
  user   User @relation(fields: [userId], references: [id])
  // ... campos específicos de marca
}
```

**El análisis decide cuál basado en:**
- Complejidad de migración
- Impacto en queries existentes
- Mantenibilidad a futuro
- Performance (joins vs columnas opcionales)

### Output #4 — Plan de migración

Documento con:
1. Pasos secuenciales de migración
2. Datos a preservar
3. Rollback plan
4. Cómo coordinar con downtime (si aplica)
5. Verificación post-migración

### Output #5 — Estimación refinada de U-02 a U-08

Lista actualizada con tiempo real estimado tras análisis:

| Spec | Estimación master | Estimación refinada U-01 |
|---|---|---|
| U-02 — Refactor schema | 8h | ? |
| U-03 — Refactor auth | 4h | ? |
| U-04 — Toggle UI | 4h | ? |
| U-05 — Migración datos | 3h | ? |
| U-06 — Clasificación auto pedidos | 4h | ? |
| U-07 — Regla anti-incesto | 2h | ? |
| U-08 — Tests E2E | 6h | ? |

---

## 4. Prescripciones del análisis

### 4.1 — Análisis del schema actual

Claude Code va a:
1. Leer `prisma/schema.prisma` completo
2. Listar TODAS las tablas relacionadas (User, Account, Session, Taller, Marca, etc.)
3. Mapear las FK actuales
4. Identificar duplicación entre Taller/Marca (campos comunes)
5. Identificar campos exclusivos de cada uno

### 4.2 — Análisis de uso del rol en código

Claude Code va a:
1. Grepear `session.user.rol` y similares
2. Listar cada endpoint y qué hace con el rol
3. Listar cada página y cómo cambia su UI según rol
4. Identificar componentes que cambian render por rol

### 4.3 — Análisis de datos actuales en DB

Claude Code va a:
1. Verificar el seed para entender qué crea
2. Si la DB es accesible, hacer queries de:
   - Count de usuarios por rol
   - Usuarios con campos críticos vacíos
   - Usuarios con datos inconsistentes
3. Si NO es accesible: documentar y pedir a Gerardo verificar manualmente

### 4.4 — Diseño de flujos UX

Para cada flujo, redactar paso a paso:

**Flujo 1: Registro nuevo como taller**
```
1. Usuario llega a landing
2. Click "Soy taller"
3. Llena form de registro (email, password, CUIT)
4. Verifica email (magic link)
5. Wizard de perfil de taller
6. Activa cuenta
```

**Flujo 2: Taller activa perfil marca**
```
1. Usuario logueado como taller
2. Click en "Configuración" o equivalente
3. "¿Querés también operar como marca?"
4. Completar datos de marca
5. Toggle activado en header
6. Puede cambiar entre modos
```

**Flujo 3: Login con doble perfil**
```
1. Login normal
2. ¿Qué modo se activa por default?
   → Opción A: último modo usado (cookie/session)
   → Opción B: el primero creado
   → Opción C: pregunta cada vez
3. Toggle visible en header
```

**Flujo 4: Cambio de modo**
```
1. Usuario en modo TALLER
2. Click en toggle del header
3. ¿Confirmación o cambio inmediato?
4. Re-render del dashboard al modo MARCA
5. URL puede o no cambiar (decisión)
```

### 4.5 — Análisis comparativo: Opción A vs Opción B

Tabla detallada:

| Criterio | Opción A (array) | Opción B (perfiles separados) |
|---|---|---|
| Complejidad migración | Baja (1 tabla) | Alta (3 tablas) |
| Queries actuales afectadas | Pocas | Muchas (joins) |
| Campos opcionales | Muchos en User | Pocos (separados) |
| Validaciones por rol | Más complejas | Más naturales |
| Performance | Más rápido | Levemente más lento (join) |
| Mantenibilidad | Media | Alta |
| Riesgo de bugs | Alto si campos no se respetan | Bajo |
| Recomendación master | (no especifica) | (no especifica) |

### 4.6 — Plan de migración detallado

Paso a paso con SQL/Prisma específico tras decidir Opción A o B.

### 4.7 — Estimación de U-02 a U-08 con análisis real

Basándose en datos del discovery, refinar estimaciones.

---

## 5. Casos borde a considerar

| # | Caso | Resolución a definir en U-01 |
|---|------|-------------------------------|
| 1 | Usuario taller que activa marca pero después quiere eliminar perfil marca | ¿Permitir? ¿Cómo? |
| 2 | Marca que quiere "convertirse en taller" (no agregar, transformar) | ¿Es posible? Probablemente no |
| 3 | CUIT que ya existe como marca, otro usuario intenta registrarse como taller con mismo CUIT | Conflicto: ¿qué hacer? |
| 4 | Usuario con doble perfil que vence membresía | ¿Vence en ambos modos? |
| 5 | Verificación ARCA del CUIT | ¿Se verifica una vez? |
| 6 | Notificaciones cuando hay doble perfil | ¿Llegan al "modo activo" o a ambos? |
| 7 | URL: /taller/perfil vs /marca/perfil | ¿Cambia según modo activo o son rutas distintas? |
| 8 | Sesión: ¿el modo persiste entre devices? | Decisión técnica |

---

## 6. Riesgos identificados

| # | Riesgo | Mitigación en U-01 |
|---|--------|---------------------|
| 1 | Decidir Opción A pero queda mal con uso real | Análisis profundo del código actual antes de decidir |
| 2 | Migración rompe datos del piloto chico | Plan de migración con rollback explícito |
| 3 | Toggle UX confuso para usuarios | Mockup en U-01 antes de implementar |
| 4 | Endpoints quedan en estado inconsistente durante migración | Estrategia de deploy (blue-green o downtime) |
| 5 | Tests E2E muy invasivos de cambiar | Lista priorizada de qué tests refactorizar |

---

## 7. Criterios de aceptación

U-01 está hecho cuando:

- [ ] Pre-flight ejecutado y aprobado
- [ ] Output #1: diseño funcional con 4+ flujos detallados
- [ ] Output #2: análisis técnico con números concretos
- [ ] Output #3: decisión Opción A vs B con justificación
- [ ] Output #4: plan de migración paso a paso
- [ ] Output #5: estimaciones refinadas de U-02 a U-08
- [ ] Documento revisado y aprobado por Gerardo
- [ ] Decisiones registradas en DECISIONS.md

---

## 8. Plan de implementación

### Fase 0: Pre-flight (15-20 min)

Claude Code ejecuta sección 0 completa y reporta.

### Fase 1: Análisis técnico (45 min)

- Discovery del schema completo
- Análisis de uso del rol en código
- Discovery de datos actuales

### Fase 2: Diseño funcional (1h)

- Redactar 4 flujos UX paso a paso
- Resolver 8 casos borde
- Validar coherencia con master V4 §3.3

### Fase 3: Decisión técnica (45 min)

- Comparar Opción A vs Opción B con datos reales
- Tomar decisión justificada
- Documentar trade-offs

### Fase 4: Plan de migración (45 min)

- Pasos secuenciales con SQL/Prisma específico
- Rollback explícito
- Verificación post-migración

### Fase 5: Estimación U-02 a U-08 (15 min)

- Refinar cada estimación con datos del análisis

### Fase 6: Documento final (30 min)

- Consolidar todo en `.claude/specs/U-01_multi-rol-airbnb_v2-tipos-corregidos.md`
- Commit + push (NO PR, es solo documentación)

**Total estimado: 4h**

---

## 9. Definición de "Done"

- [ ] Documento `.claude/specs/U-01_multi-rol-airbnb_v2-tipos-corregidos.md` commiteado
- [ ] Gerardo revisó y aprobó las decisiones
- [ ] DECISIONS.md actualizado con:
  - Decisión schema (Opción A o B)
  - Decisión UX toggle
  - Decisión migración
- [ ] U-02 listo para empezar con spec definido

---

## 10. Selectores críticos (a completar en pre-flight)

[A COMPLETAR EN SECCIÓN 0]

Posibles selectores que pueden requerir cuidado en U-02 a U-08:
- `session.user.rol` en código
- `loginAs(role)` en tests E2E
- Endpoints con check de rol
- Middleware con rutas por rol

---

**Fin del SPEC U-01 — Análisis funcional + técnico multi-rol Airbnb**

> Este es un spec de ANÁLISIS, no de implementación.
> Su valor está en las decisiones que produce para U-02 a U-08.
> Después de U-01, los siguientes 7 specs fluyen con claridad.
