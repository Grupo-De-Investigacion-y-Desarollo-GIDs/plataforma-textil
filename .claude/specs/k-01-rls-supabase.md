# SPEC K-01 — RLS Supabase: cerrar leak de dev + blindar prod

> **Bloque:** K (Seguridad)
> **Prioridad:** ALTA — incidente activo en dev (leak confirmado), hardening en prod
> **Fecha alerta original:** 21-mayo-2026 (Supabase Security Advisor)
> **Verificacion empirica del leak:** 02-junio-2026 (anon key lee datos reales en dev)
> **Estado:** Pendiente de implementacion (discovery completo)

---

## 1. Contexto

### 1.1 Que cambio respecto del diagnostico original

El spec base (21-may) asumia que **NO habia leak tecnico** porque el rol `anon`
no tenia grants ("la proteccion es accidental"). **Esa conclusion quedo refutada
empiricamente el 02-jun.** El estado real, verificado con la anon key publica
contra PostgREST (`/rest/v1/<tabla>`), es:

| Entorno | ref | anon lee tablas sensibles | Estado real |
|---------|-----|---------------------------|-------------|
| **dev** (`plataforma-textil-dev`) | `fjddgukwydsdcrqoxvns` | ✅ **SI** — devuelve filas reales (HTTP 200) | 🔴 **LEAK ACTIVO** |
| **prod** (`plataforma-textil`) | `nefbhacmjrzynnhvgfnl` | ❌ NO — `42501 permission denied for schema public` | 🟢 PROTEGIDA (accidental) |

> El audit de la tabla original (linea "Grants a anon: 0") era incorrecto o el
> estado cambio despues. **Hoy dev SI tiene grants efectivos al rol `anon`** y
> RLS sigue OFF, lo que produce el leak.

### 1.2 Alcance del leak en dev (evidencia 02-jun)

Con la anon key publica, en dev se leyeron datos reales de:

| Tabla | Filas leidas por anon | Contenido sensible expuesto |
|-------|----------------------:|-----------------------------|
| `users` | 13 | emails + **hashes bcrypt** de contraseña, nombres, CUITs |
| `talleres` | 6 | datos comerciales, CUIT, domicilio |
| `marcas` | 4 | datos comerciales |
| `cotizaciones` | 87 | toda la actividad comercial |
| `pedidos` | 98 | flujo de pedidos completo |
| `notificaciones` | 173 | mensajeria interna |

Muestra confirmada: `cp.alanplummer@gmail.com` con hash `$2b$10$BMdR4H/...`.
**Cualquiera con la anon key (publica por diseño) puede descargar todo esto.**

### 1.3 Por que dev filtra y prod no (PASO 4 — investigado)

**No hay ninguna migracion que toque grants/RLS.** Se revisaron las 31
migraciones en `prisma/migrations/`: la unica coincidencia de "anon" es la
columna `"anonima" BOOLEAN` de denuncias (init migration, linea 381), no un
`GRANT ... TO anon`. Prisma nunca emite `GRANT`/`REVOKE`/`ENABLE ROW LEVEL
SECURITY`.

Conclusion: **la asimetria es un setting de proyecto Supabase, no codigo.**
- **dev** = config Supabase **por defecto**: el bootstrap de Supabase otorga
  `USAGE ON SCHEMA public` + `ALTER DEFAULT PRIVILEGES ... GRANT SELECT` a
  `anon`/`authenticated`. Con tablas nuevas heredando esos grants y **RLS OFF**,
  PostgREST sirve todo → leak. Es el footgun clasico de Supabase.
- **prod** = config **endurecida** (anomalia): el esquema `public` NO esta
  expuesto al Data API. Evidencia: incluso `service_role` via PostgREST recibe
  `42501 permission denied for schema public`. Eso solo pasa si se revoco
  `USAGE ON SCHEMA public` a los roles del API (o se deshabilito el Data API /
  se quito `public` de "Exposed schemas"). Nadie documento cuando ni por que.

> **Implicancia:** la proteccion de prod es real (deny duro) pero **fragil y no
> versionada**. Depende de la ausencia de un grant, no de RLS. Un cambio de
> defaults, re-exponer el Data API, o un `GRANT USAGE` accidental, y prod se
> vuelve dev. Por eso prod tambien necesita RLS como defensa en profundidad.

---

## 2. Mapa de acceso a la DB (PASO 2 — CRITICO, define si RLS rompe algo)

Se auditaron todos los caminos de acceso a datos. **Resultado: la app NUNCA
toca la DB como `anon`/`authenticated`.**

| Camino | Como accede | Rol efectivo | ¿Afectado por RLS? |
|--------|-------------|--------------|--------------------|
| **App → DB** (todas las queries) | Prisma (`src/compartido/lib/prisma.ts`, unico `PrismaClient`) | `postgres` (via pooler `postgres.<ref>`, **dueño de las tablas → bypassa RLS**) | ❌ NO |
| **App → Storage** (buckets/upload/signed-url) | Supabase JS (`src/compartido/lib/storage.ts`) con `SUPABASE_SERVICE_ROLE_KEY` | `service_role` (bypassa RLS) — y ademas opera sobre `storage.*`, no `public.*` | ❌ NO |
| **Paginas publicas** (landing, directorio, perfil/[id]) | Prisma **server-side** en server components | `postgres` | ❌ NO |
| **Cliente Supabase JS con anon/authenticated** | **NO EXISTE** | — | — |
| **Supabase Auth (`auth.uid()`)** | **NO EXISTE** — auth es NextAuth v5 con adapter Prisma propio | — | — |

Confirmaciones empiricas:
- `grep createClient` → unica ocurrencia en `storage.ts`, con `SERVICE_ROLE_KEY`.
- No hay `NEXT_PUBLIC_SUPABASE_*` ni anon key en `src/` ni en `.env.local`.
- No hay `@supabase/ssr` ni cliente browser.
- Prisma corrio counts contra prod (donde anon y service_role-via-REST dan
  42501), probando que el camino Prisma (rol `postgres`) es **independiente** de
  la capa de grants/RLS que bloquea a PostgREST. → Prisma seguira funcionando
  con RLS ON.

> **CONCLUSION CLAVE (bloqueante para el diseño): habilitar RLS y revocar grants
> a anon NO rompe la app.** Todo el acceso productivo es via `postgres`
> (dueño, bypassa RLS) o `service_role` (bypassa RLS, y solo Storage). No hace
> falta NINGUNA policy de lectura publica, porque las paginas "publicas" leen
> via Prisma server-side, no via anon.

---

## 3. Inventario de tablas (PASO 3)

44 modelos Prisma (`@@map`) en `public.*`, mas tablas internas
(`_prisma_migrations`, y `auth.*` / `storage.*` que ya gestiona Supabase).

### 3.1 Clasificacion por sensibilidad

**Criticas (PII / credenciales):**
`users`, `sessions`, `accounts`, `magic_links`, `verification_tokens`,
`consultas_arca`

**Sensibles (datos comerciales / legales / confidenciales):**
`talleres`, `marcas`, `denuncias`, `validaciones`, `notas_internas`,
`observaciones_campo`, `notas_seguimiento`

**Negocio:**
`pedidos`, `cotizaciones`, `ordenes_manufactura`, `log_actividad`,
`notificaciones`, `colecciones`, `novedades`

**Catalogos (riesgo bajo, proteger igual):**
`tipos_prenda`, `procesos_productivos`, `tipos_documento`, `reglas_nivel`,
`configuracion_sistema`, etc.

### 3.2 ¿Hay datos que la app expone publicamente? ¿Necesitan policy para anon?

**SI hay datos publicos, pero NO necesitan policy para anon.** Las paginas
publicas los sirven via Prisma server-side, no via anon key:

| Pagina publica | Lee | Como | ¿Necesita policy anon? |
|----------------|-----|------|------------------------|
| `/` (landing) | `talleres` (verificados), `marcas`, `colecciones` (activas), `novedades` (publicadas), counts | `prisma.*` en `src/app/page.tsx` (server) | ❌ NO |
| `/directorio` | `talleres` + filtros | `prisma.taller.findMany` server | ❌ NO |
| `/perfil/[id]` | `taller` + validaciones | `prisma.taller.findUnique` server | ❌ NO |

> Cuando se quiso "datos publicos" la respuesta de Supabase tipica es "creale una
> policy de SELECT a anon". **Aca NO aplica**: el filtrado de que es publico
> (`verificadoAfip`, `activa`, `publicado`) ya vive en el `where` de Prisma del
> lado servidor. Exponer esas tablas a anon seria volver a abrir el leak.

---

## 4. Estrategia (corregida vs spec original)

Tres capas, en este orden:

### Capa A — `ENABLE ROW LEVEL SECURITY` en las 44 tablas de `public.*`
RLS ON + sin policies = deny por defecto para `anon`/`authenticated`.
`postgres` (dueño) y `service_role` siguen pasando. Cierra el vector aunque los
grants sigan ahi.

### Capa B — `REVOKE` de grants a `anon`/`authenticated` (belt-and-suspenders)
```sql
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE USAGE ON SCHEMA public FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;
```
Esto lleva a dev al mismo estado endurecido que prod hoy (`42501`). Capa A sola
ya alcanza; B elimina la dependencia de RLS-por-tabla y hace el deny explicito y
versionado.

### Capa C — Policies explicitas: **NINGUNA necesaria**
No se crea ninguna policy de lectura publica (ver §2 y §3.2). Las policies con
`auth.uid()` del spec original **se descartan**: no hay Supabase Auth en este
proyecto.

> **NO incluido en K-01 (va aparte):** la rotacion de las 13 contraseñas de dev.
> Los hashes bcrypt se filtraron; cerrar el leak no los des-filtra. Se trackea
> como tarea de respuesta a incidente separada (reset de passwords de cuentas
> dev + invalidar sesiones). K-01 cierra el vector; no remedia lo ya expuesto.

---

## 5. Orden de aplicacion

1. **DEV primero** (`fjddgukwydsdcrqoxvns`) — tapa el leak activo. Aplicar Capa A
   + B. Verificar con tests de §7.
2. **PROD despues** (`nefbhacmjrzynnhvgfnl`) — hardening. Ya esta protegida por
   ausencia de grants, pero aplicar Capa A + B deja la proteccion **versionada y
   explicita** (no dependiente del setting no documentado) y limpia el Security
   Advisor. Prod tiene datos minimos (1 user, 1 marca) → riesgo de regresion casi
   nulo.

---

## 6. Prescripciones tecnicas

- **Versionar via migracion Prisma** con SQL crudo (NO tocar el dashboard de
  Supabase — no queda en control de versiones). Carpeta nueva en
  `prisma/migrations/` con `migration.sql` que contenga los `ALTER TABLE ...
  ENABLE ROW LEVEL SECURITY` (44) + el bloque `REVOKE`/`ALTER DEFAULT PRIVILEGES`.
- `prisma migrate diff` **no** genera RLS/grants → el SQL se escribe a mano. Por
  eso la migracion es "manual" (carpeta + `migration.sql` + entrada en
  `_prisma_migrations` al aplicar con `prisma migrate deploy`).
- Aplicar con `prisma migrate deploy` apuntando primero a dev (`.env.local` /
  `DATABASE_URL` de dev), luego a prod. **Ojo:** hoy `.env` local apunta a PROD;
  fijar la connection string correcta por entorno antes de cada deploy.
- Las tablas internas de Supabase (`auth.*`, `storage.*`) **no se tocan** —
  Supabase ya las gestiona. K-01 es solo `public.*`.
- Generar la lista de 44 `ALTER TABLE` a partir de los `@@map` del schema (no
  hardcodear nombres a mano; derivarlos del schema para no omitir ninguna).

---

## 7. Plan de testing

### 7.1 Antes de aplicar (baseline)
- Dev: `curl /rest/v1/users` con anon key → confirma HTTP 200 + filas (leak).

### 7.2 Despues de aplicar en dev
- **Seguridad:** `curl /rest/v1/{users,talleres,marcas,cotizaciones,pedidos,
  notificaciones}` con anon key → debe dar `42501 permission denied` (o `[]`
  para tabla vacia, pero idealmente deny de schema). NINGUNA debe devolver filas.
- **App no rota (4 flujos):**
  1. Login (NextAuth + Prisma) — un usuario entra.
  2. Marca crea pedido (`POST /api/pedidos`) — escribe via Prisma.
  3. Paginas publicas (`/`, `/directorio`, `/perfil/[id]`) renderizan con datos.
  4. Upload a Storage (validaciones/colecciones) — service_role sigue operando.
- **CI:** `unit` (Vitest) + `e2e` (Playwright) verdes en el PR.

### 7.3 Despues de aplicar en prod
- Repetir 7.2 contra prod. Confirmar Security Advisor sin alertas de RLS.

---

## 8. Rollback

Reversible sin perdida de datos:
```sql
-- revertir RLS
ALTER TABLE public.<tabla> DISABLE ROW LEVEL SECURITY;  -- x44
-- re-otorgar (solo si algo dependiera de anon, que NO es el caso)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
```
Como la app no usa anon/authenticated, **no se espera necesitar rollback**. Si
un flujo se rompe, el culpable no seria RLS (Prisma bypassa) — investigar antes
de revertir.

---

## 9. Casos borde

- **Realtime / cliente JS futuro:** si algun dia se usa Supabase Realtime o el
  cliente JS con anon, RLS + policies pasan a ser obligatorias. Hoy no aplica;
  documentado para que no sorprenda.
- **`prisma db pull` despues de RLS:** introspeccionar no deberia traerse las
  policies como modelos; verificar que el schema Prisma no cambie tras aplicar.
- **Tabla nueva futura:** con `ALTER DEFAULT PRIVILEGES` revocado, las tablas
  nuevas NO heredan grants a anon. Pero **RLS no se auto-habilita** en tablas
  nuevas → agregar `ENABLE ROW LEVEL SECURITY` en cada migracion que cree tabla
  (o un check en CI). Anotar en la checklist de "paginas/tablas nuevas".
- **`_prisma_migrations`:** no exponerla; queda cubierta por el revoke de schema.
- **Pooler vs conexion directa:** confirmar que tanto `DATABASE_URL` (pooler)
  como `DIRECT_URL` conectan como rol que bypassa RLS (dueño/postgres). El deploy
  de la migracion usa `DIRECT_URL`.

---

## 10. Criterio de aceptacion

- [ ] Las 44 tablas de `public.*` tienen RLS = ON (dev y prod)
- [ ] `anon` NO lee ninguna tabla sensible en dev (antes leia 13 users c/ hashes)
- [ ] `anon` sigue sin leer en prod
- [ ] Grants a `anon`/`authenticated` revocados + default privileges revocados
- [ ] Migracion versionada en `prisma/migrations/` (cero cambios via dashboard)
- [ ] 4 flujos manuales OK en dev (login, crear pedido, paginas publicas, upload)
- [ ] `unit` + `e2e` verdes
- [ ] Supabase Security Advisor sin alertas de RLS (dev y prod)
- [ ] (Fuera de K-01, trackeado aparte) passwords de dev rotadas / sesiones
      invalidadas por el leak de hashes

---

## 11. Notas

- El bucket "documentos" publico en prod va en **K-02** (separado).
- Estimacion: investigacion ya hecha (este discovery). Implementacion + testing
  ~8-10h (escribir SQL de 44 tablas + revoke, deploy dev, test, deploy prod).
- Decision pendiente de Gerardo: ¿se rota la connection del `.env` local a dev
  antes de aplicar, o se corre el deploy desde un entorno con las dos strings?
