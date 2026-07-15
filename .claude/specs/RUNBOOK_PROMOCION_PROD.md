# RUNBOOK — Promoción de DEVELOP a PRODUCCIÓN

> **Estado: PREPARACIÓN CERRADA (no ejecutado).** Hoy solo se prepara. NO mergear a
> `main`, NO tocar prod, NO correr backfill. **Deploy confirmado: 2026-06-13 08:30**
> (OK de Sergio).
>
> Fecha de preparación: 2026-06-12 · Autor: Gerardo (asistido) · Deploy: **2026-06-13 08:30**
>
> **PRs de la preparación:**
> - **#422** — release `develop → main` (promoción). Abierto para que CI corra de noche. **NO MERGEAR** hasta el operativo.
> - **#421** — `feat: --exclude` en el backfill (garantía de la cuenta de smoke intocable). Mergear a develop antes del paso (f).
> - **#420** — este runbook (docs).

---

## 0. Hallazgo que cambia el tamaño del operativo (LEER PRIMERO)

**La promoción NO es un bump chico de "solo U-05". Es un release mayor.**

- **PROD corre `main`** (confirmado: el deployment de producción tiene alias
  `plataforma-textil-git-main-gbreards-projects.vercel.app`; aliases públicos
  `plataformatextil.com.ar`, `plataforma-textil.vercel.app`). Último deploy de
  producción: **Jun 01 2026** (`dpl_5qnT3ube...`, 11 días).
- **`develop` está 105 commits por delante de `main`.**
- **Migraciones pendientes contra prod: 6, NO una** (detalle en §2).
- **La landing pública cambia** (prod sirve la vieja; develop trae el rediseño
  X-06). Verificado empíricamente contra prod (§5).

Implicación: snapshot, smoke y rollback se dimensionan como release grande, no como
parche. El smoke de Sergio cubre features que entran por primera vez a prod (multi-rol,
formulario taller W-A, tipo de pedido, RLS, landing X-06, etc.).

---

## 1. Mecanismo de snapshot (condición 1 de Sergio)

**Objetivo:** backup completo de prod (schema + data) ANTES de migrar, restaurable y
verificado.

### Qué ofrece Supabase (a confirmar en dashboard)
- **Confirmar tier en**: Supabase → proyecto `nefbhacmjrzynnhvgfnl` → Settings →
  Database → Backups. Plan Pro = backups diarios automáticos (retención 7d) + PITR
  (add-on). Plan Free = sin backup on-demand fiable.
- Los backups automáticos diarios **no alcanzan** como condición de Sergio: necesitamos
  un punto de restauración **inmediatamente previo** al deploy, no el de la madrugada.

### Mecanismo elegido: `pg_dump` on-demand (tier-independiente, verificable)
Es el mecanismo del runbook porque no depende del plan y deja un artefacto local
verificable.

> ⚠️ **Versión de pg_dump: el servidor Supabase es PostgreSQL 17.6.** `pg_dump` debe ser
> **≥ 17** o aborta con `server version mismatch`. El cliente por defecto de Ubuntu 22.04
> es v14 y **falla** (verificado). Hay que instalar `postgresql-client-17` desde el repo
> PGDG. **Ya instalado y verificado en esta WSL** (pg_dump 17.10): un `--schema-only`
> contra DEV devolvió exit 0, 80 tablas, sin errores.

```bash
# Pre-requisito YA RESUELTO en esta máquina (pg_dump 17.10). Para reproducir en otra:
#   sudo install -d /usr/share/postgresql-common/pgdg
#   sudo curl -fsSL -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc \
#     https://www.postgresql.org/media/keys/ACCC4CF8.asc
#   echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] \
#     http://apt.postgresql.org/pub/repos/apt $(. /etc/os-release; echo $VERSION_CODENAME)-pgdg main" \
#     | sudo tee /etc/apt/sources.list.d/pgdg.list
#   sudo apt-get -o Acquire::ForceIPv4=true update && \
#     sudo apt-get -o Acquire::ForceIPv4=true install -y postgresql-client-17
#   (ForceIPv4: en esta red apt.postgresql.org no resuelve por IPv6)

# Credenciales prod (NO commitear): traer a un archivo gitignored
vercel env pull --environment=production .env.prod      # trae DIRECT_URL de prod

# Dump custom-format (comprimido, restaurable selectivamente). Usar el DIRECT_URL de
# prod: debe ser el **session pooler, puerto 5432** (el de DEV lo es y pg_dump funciona;
# NO usar el transaction pooler 6543, que rompe pg_dump).
source .env.prod
pg_dump "$DIRECT_URL" --no-owner --no-acl -Fc \
  -f "prod_snapshot_$(date +%Y%m%d_%H%M).dump"

# Verificación de integridad (sin restaurar): el listado debe abrir y mostrar las
# ~44 tablas de public.* + datos; exit 0.
pg_restore --list prod_snapshot_*.dump | grep -c "TABLE DATA"   # > 0
pg_restore --list prod_snapshot_*.dump | tail -5                # cierra limpio
```

- **Destino**: archivo `.dump` fuera del repo (gitignored), copiado a un segundo lugar
  (disco local + nube privada). No subir a ningún servicio público.
- **Restore de emergencia** (solo si hace falta): `pg_restore --clean --if-exists -d "$DIRECT_URL" prod_snapshot_*.dump`.
- **NO ejecutar hoy.** El comando y el pre-requisito (pg_dump 17) ya están listos.

---

## 2. Pipeline develop → main

### Cómo se promueve
- **Promoción = merge `develop` → `main`.** Vercel auto-deploya `main` a producción
  (Production Branch = `main`).
- **Las migraciones las aplica el BUILD de Vercel**, no un paso manual:
  `package.json#build = "prisma migrate deploy && prisma generate && next build"`.
  → al mergear, el build corre `prisma migrate deploy` contra prod (`DATABASE_URL` de
  prod) y aplica las 6 migraciones pendientes **antes** de publicar.
  - Propiedad de seguridad: si una migración falla, el build falla y **prod queda en el
    deployment viejo** (no se publica a medias). Cada migración corre en su transacción.
- **Branch protection en `main`: NINGUNA** (verificado: `gh api .../branches/main/protection`
  → 404 "Branch not protected"). Técnicamente se podría promover con push directo, pero la
  promoción se hace **vía PR `develop → main` (#422)** para tener CI + revisión. El PR ya
  está abierto (CI corre de noche); el merge es el acto del operativo de las 08:30.

### ⚠️ Migraciones pendientes contra prod — son 6, NO solo U-05 (DESTACADO)
El supuesto "solo U-05" es incorrecto: `main` está 105 commits atrás. `prisma migrate
deploy` aplicará, en orden:

| # | Migración | Tipo | Aditiva / riesgo |
|---|---|---|---|
| 1 | `20260519200000_agregar_multirol_y_arca_a_user` | DDL + backfill | Cols nuevas en `users` (nullable / con default). Dropea 2 unique index (`talleres_cuit_key`, `marcas_cuit_key`) y crea `users_cuit_key`. Backfills de datos. **Aditiva** para el código viejo. |
| 2 | `20260525180000_agregar_campos_formulario_taller` | DDL + update | 3 cols nullable en `talleres` + limpieza de `escalabilidad`. Aditiva. |
| 3 | `20260526000000_agregar_imagen_coleccion` | DDL | `colecciones.imagenUrl` nullable. Aditiva. |
| 4 | `20260601120000_agregar_tipo_pedido` | DDL + backfill | enum `TipoPedido` + `pedidos.tipo NOT NULL DEFAULT 'COMERCIAL'`. Aditiva (default cubre inserts viejos). Backfill hoy toca 0 filas. |
| 5 | `20260603120000_k01_rls_revoke_anon` | DDL (seguridad) | ENABLE RLS en 44 tablas + REVOKE a anon/authenticated. **Side-effect mayor: cierra el leak K-01 en PROD (Fase 3 efectiva).** Prisma/Storage usan rol owner/service_role que bypassa RLS → no afecta a la app (ya probado en dev). |
| 6 | `20260610120000_u05_backfill_roles_activemode` | data only | Re-sincroniza `roles[]`/`activeMode`. Idempotente, guardado. Aditiva. |

> **Destacar a Gerardo/Sergio:** entran a prod por primera vez multi-rol (#1), formulario
> taller W-A (#2), imagen colección (#3), tipo de pedido (#4) y **el endurecimiento RLS
> K-01 (#5)**. El #5 es lo más sensible operativamente: verificar post-deploy que la app
> sigue leyendo (paso d).

### Env vars de prod (verificado con `vercel env ls production`)
- **`UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`: PRESENTES** ✅
  → el rate-limit **no** falla abierto en prod (`ratelimit.ts` cae a "permite todo" solo
  si faltan). Bien para C4 y demás límites.
- **`CI_BYPASS_TOKEN`: AUSENTE** ✅ (confirmado: no figura en la lista de Production)
  → el header `x-ci-bypass` no saltea rate-limit en prod. Correcto.
- `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
  `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `RESEND_API_KEY`, `AFIP_*`/`ARCA_*`: presentes.
- Nada pendiente de cargar para que el deploy levante.

---

## 3. Runbook paso a paso (con horarios)

> **Deploy confirmado 2026-06-13 08:30** (OK de Sergio). Smoke de Sergio desde las 10:00.

| Hora | Paso | Detalle | Gate |
|---|---|---|---|
| **08:15** | **a. Snapshot** | `pg_dump` (≥17) de prod (§1) + verificación de integridad (`pg_restore --list`). Copiar el `.dump` a 2 destinos. | No avanzar sin dump verificado. |
| **08:25** | **b. Cuenta de smoke INTOCABLE** | Anotar el email de smoke de Sergio para excluirlo del backfill del paso (f). ✅ **Resuelto:** el script ya tiene `--exclude <email>` (#421). Pre-mergear #421 a develop para tenerlo disponible. | Email de Sergio confirmado. |
| **08:30** | **c. Promoción** | **Mergear el PR #422** (`develop → main`). Vercel buildea: `prisma migrate deploy` aplica las 6 migraciones → `next build` → publica. | Build verde en Vercel. Si el build falla → prod sigue en el deploy viejo, investigar antes de reintentar. |
| **08:40** | **d. Verificación técnica nuestra** | Ver checklist (d) abajo. | Todo OK antes de habilitar a Sergio. |
| **10:00–10:45** | **e. Smoke de Sergio** | Checklist ampliado (§5). | Veredicto de Sergio. |
| **post-OK** | **f. Backfill validaciones D-02** | `ALLOW_PROD=1 npx tsx scripts/u05-backfill-validaciones.ts --exclude <email-smoke>` (dry-run) → revisar reporte (debe loguear `EXCLUIDO: <email-smoke>`) → **solo con OK explícito de Gerardo** → agregar `--apply`. Timestamp en `DAILY.md` (condición 3 de Sergio). | OK explícito de Gerardo para el `--apply`. |
| n/a | **g. Rollback** | Ver §4. | — |

### Checklist (d) — verificación técnica post-deploy
```bash
# Prod arriba + login
curl -s -o /dev/null -w "%{http_code}\n" https://plataformatextil.com.ar/        # 200
# (login manual con una cuenta real → entra al dashboard del rol)

# Hotfix de anónimos: los GET sensibles deben dar 401 sin sesión
for ep in /api/marcas/ID /api/talleres/ID /api/colecciones/ID; do
  curl -s -o /dev/null -w "$ep -> %{http_code}\n" "https://plataformatextil.com.ar$ep"
done                                                                              # 401 c/u

# Migración multi-rol aplicada (query de control contra prod, read-only):
#   users con roles=[] -> debe ser 0 (o solo los esperados)
#   SELECT count(*) FROM users WHERE cardinality(roles)=0;          -> 0
#   SELECT count(*) FROM users WHERE "activeMode" IS NULL;          -> 0
# Verificación D-02 (tipos_documento / reglas_nivel / niveles):
#   psql "$DIRECT_URL" -f scripts/verificar-migracion-d02.sql
# RLS K-01 aplicada y la app NO se rompió: el login/dashboard del paso anterior
#   ya lo prueba (la app lee vía rol owner que bypassa RLS).
```
- **+ Sección de landing (§5):** `/` carga el rediseño X-06, CTAs del hero llevan a
  registro, G-20 resuelto.

---

## 4. Rollback

**Veredicto: rollback SIMPLE.** El código viejo de `main` funciona contra la DB con las
6 migraciones ya aplicadas, porque todas son **aditivas o data-only**:
- Cols nuevas son nullable o tienen DEFAULT (el código viejo no las escribe ni las lee).
- `pedidos.tipo` tiene `DEFAULT 'COMERCIAL'` → inserts del código viejo no fallan.
- Drop de unique index en `talleres.cuit`/`marcas.cuit`: el código viejo sigue
  insertando; solo se pierde una garantía de unicidad (no es un error).
- RLS K-01 (#5): Prisma/Storage usan el rol owner/service_role que **bypassa RLS** (ya
  validado en dev, donde la migración ya está aplicada y la app funciona). El código
  viejo usa la misma conexión → no se ve afectado.

**Procedimiento de rollback (solo código, la DB queda migrada):**
```bash
git checkout main && git revert --no-edit <SHA_merge>   # o reset al deploy previo
git push origin main                                     # Vercel redeploya
# El build re-corre "prisma migrate deploy": es NO-OP (no hay migraciones nuevas y
# nunca des-aplica). No se revierte la DB y no hace falta.
```
- **No se necesita revertir la DB** para volver al código viejo.
- Único rollback de DB documentado (si alguna vez hiciera falta deshacer RLS):
  `.claude/specs/k-01-rls-supabase.md` §8. **No** es parte de un rollback de código.

> Verificado contra el schema (no asumido): el código viejo no lee `roles[]`/`activeMode`/
> `tipo`/cols nuevas, y ningún `NOT NULL` nuevo carece de default. Por eso es "rollback
> simple" y no "rollback con procedimiento de DB".

---

## 5. Verificación de la landing (ejecutado hoy — punto 5)

**Develop y prod DIFIEREN.** Prod sirve la landing vieja; develop trae el rediseño X-06
(hero + audiencias). Verificado empíricamente: `curl` a prod → 0 hits de
`hero-taller.png`, presentes "Marcas registradas" / "El registro es gratuito…" (markers
de la vieja). Commits del rediseño en develop y no en prod: `e775a95` (X-06), `e6afe8e`
(X-06b copy), `35be814` (X-06b FINAL), `36e439f` (leyenda OIT).

**G-20 ("no se encuentra cómo registrarse") → RESUELTO en la versión de develop:** el
registro es accesible desde el hero (`hero.ctaTaller/ctaMarca → /registro?rol=TALLER|MARCA`,
`institutional.ts:57-58`) y desde `HeaderPublic` (Iniciar sesión + ambos CTAs de registro).

### (d) — verificación técnica de la landing post-deploy
- [ ] `/` carga sin error (versión nueva = rediseño X-06: hero con imagen + audiencias)
- [ ] CTAs del hero: "Soy taller" → `/registro?rol=TALLER`, "Soy marca" → `/registro?rol=MARCA`
- [ ] `HeaderPublic` presente con "Iniciar sesión" (`/login`) + ambos CTAs de registro
- [ ] **G-20 verificado resuelto:** registro accesible desde la landing sin buscar (hero + header)
- [ ] Imagen del hero (`/images/landing/hero-taller.png`) y logo PNG cargan

### Smoke de Sergio — checklist AMPLIADO (release mayor)
Porque es un release de 105 commits, no un parche: el smoke cubre las features que entran
**por primera vez** a prod. Su checklist habitual + estos ítems:

**Público / acceso**
- [ ] **Landing pública: se ve bien, los CTA del hero llevan a donde deben** (registro taller/marca + login) — bug G-20
- [ ] Registro nuevo (taller y marca) funciona; el flujo de CUIT/ARCA responde
- [ ] Login de cada rol (taller, marca, estado, admin) entra a su dashboard

**Multi-rol (U-03/04/05)**
- [ ] Un user con taller y marca puede **togglear el modo activo** y la app lo lleva al dashboard del modo elegido
- [ ] Un user de un solo rol no ve el toggle / sigue operando normal

**Taller**
- [ ] Formulario de taller W-A: los **campos nuevos** (organización, disponibilidad, roles funcionales) se guardan y se ven
- [ ] Mi recorrido / niveles (bronce/plata/oro) se muestran sin error
- [ ] Documentos / validaciones: el checklist aparece (post-backfill del paso f)

**Marca / pedidos / cotización**
- [ ] Crear pedido; el **tipo de pedido** (comercial / subcontratación) se setea y muestra
- [ ] Un taller **cotiza** un pedido publicado (flujo comercial)
- [ ] **Subir imagen en una cotización** funciona para el taller elegible y **falla (sin acceso) para un pedido ajeno** (fix C5)

**Contenido / navegación**
- [ ] Colección con **imagen** (J-05) se ve en academia/colecciones
- [ ] Navegación F1+F3: sidebar personal, tabs del header y dropdown del avatar funcionan

**Transversal**
- [ ] Nada que antes funcionaba se rompió (revisar las pantallas core de su checklist habitual)

---

## 6. Decisiones — estado al cierre de la preparación

1. ✅ **Exclusión de la cuenta de smoke en el backfill.** RESUELTO: flag `--exclude <email>`
   en `u05-backfill-validaciones.ts` (PR **#421**, con unit test). Repetible/CSV, en dry-run
   y `--apply`, loguea `EXCLUIDO:` y avisa typos. **Pendiente:** mergear #421 a develop antes
   del paso (f) y confirmar el email exacto de la cuenta de smoke de Sergio.
2. ⏳ **Tier de Supabase / PITR** — confirmar en dashboard si hay backup on-demand nativo.
   Igual el runbook va 100% con `pg_dump` (no depende del tier).
3. ✅ **`postgresql-client`** — RESUELTO: instalado `postgresql-client-17` (pg_dump 17.10) y
   verificado contra DEV (`--schema-only` → exit 0, 80 tablas). El servidor es PG 17.6, por
   eso hace falta ≥17 (el v14 de Ubuntu falla).
4. ✅ **Branch protection en `main`** — RESUELTO: no hay ninguna. Promoción vía PR #422 igual
   (CI + revisión), merge en el operativo.
5. ⏳ **Conciencia del tamaño del release** — 105 commits / 6 migraciones / landing nueva /
   RLS K-01 a prod. Confirmar que Sergio dimensiona el smoke ampliado (§5) en consecuencia.
6. ✅ **Horario** — CONFIRMADO 2026-06-13 **08:30** (OK de Sergio).

### Qué queda abierto para mañana (además del snapshot y el merge)
- Confirmar el **email exacto** de la cuenta de smoke de Sergio (para el `--exclude`).
- **Mergear #421** a develop (queda disponible el flag para el paso f).
- Confirmar el **tier de Supabase** (decisión 2) — opcional, el `pg_dump` cubre.
- Que Sergio confirme que correrá el **smoke ampliado** (§5), no solo el habitual.

---

## 7. ⏳ PRÓXIMO deploy — saneo one-time de CUITs (PR-3 circuito CUIT, 2026-07)

> El seed guardó CUITs **con guiones** y el `@unique` de `cuit` compara strings exactos →
> `"20-X..."` y `"20X..."` coexistirían como cuentas distintas del mismo CUIT. El código nuevo
> (PR-3 `fix/cuit-normalizacion`) normaliza a dígitos en `consultarPadron` y en el registro,
> pero las filas viejas de PROD quedan sucias hasta este saneo. **En DEV ya se corrió**
> (2026-07-13: 5 talleres + 3 marcas normalizados, 0 colisiones). Correr en PROD **después**
> de que el deploy aplique el código de PR-3.

> **Cubre TRES tablas:** `talleres`, `marcas` y `users` (`users.cuit` es el "CUIT centralizado"
> de U-02/D2, también `@unique`; en DEV está sin poblar — 0 de 16 — pero en PROD puede tener
> datos del backfill multi-rol, por eso va defensivo).

```sql
-- 1) DIAGNÓSTICO (read-only): ¿cuántas filas sucias hay?
SELECT id, cuit, "verificadoAfip", "estadoCuenta" FROM "talleres"
WHERE cuit IS NOT NULL AND cuit !~ '^[0-9]{11}$';
SELECT id, cuit FROM "marcas"
WHERE cuit IS NOT NULL AND cuit !~ '^[0-9]{11}$';
SELECT id, email, cuit FROM "users"
WHERE cuit IS NOT NULL AND cuit !~ '^[0-9]{11}$';

-- 2) COLISIONES (read-only): deben dar 0 filas las SEIS antes de tocar nada.
--    (a) la forma normalizada ya existe en otra fila limpia:
SELECT t1.id, t1.cuit FROM "talleres" t1
WHERE t1.cuit !~ '^[0-9]{11}$' AND EXISTS (
  SELECT 1 FROM "talleres" t2 WHERE t2.id <> t1.id AND t2.cuit = regexp_replace(t1.cuit, '\D', '', 'g'));
SELECT m1.id, m1.cuit FROM "marcas" m1
WHERE m1.cuit !~ '^[0-9]{11}$' AND EXISTS (
  SELECT 1 FROM "marcas" m2 WHERE m2.id <> m1.id AND m2.cuit = regexp_replace(m1.cuit, '\D', '', 'g'));
SELECT u1.id, u1.cuit FROM "users" u1
WHERE u1.cuit !~ '^[0-9]{11}$' AND EXISTS (
  SELECT 1 FROM "users" u2 WHERE u2.id <> u1.id AND u2.cuit = regexp_replace(u1.cuit, '\D', '', 'g'));
--    (b) dos filas sucias que normalizan a lo mismo:
SELECT regexp_replace(cuit,'\D','','g') AS norm, count(*) FROM "talleres"
WHERE cuit !~ '^[0-9]{11}$' GROUP BY 1 HAVING count(*) > 1;
SELECT regexp_replace(cuit,'\D','','g') AS norm, count(*) FROM "marcas"
WHERE cuit !~ '^[0-9]{11}$' GROUP BY 1 HAVING count(*) > 1;
SELECT regexp_replace(cuit,'\D','','g') AS norm, count(*) FROM "users"
WHERE cuit !~ '^[0-9]{11}$' GROUP BY 1 HAVING count(*) > 1;

-- 3) UPDATE (solo si 2 dio 0 filas en todas — si hay colisión, resolver a mano ANTES):
UPDATE "talleres" SET cuit = regexp_replace(cuit,'\D','','g')
WHERE cuit IS NOT NULL AND cuit !~ '^[0-9]{11}$';
UPDATE "marcas" SET cuit = regexp_replace(cuit,'\D','','g')
WHERE cuit IS NOT NULL AND cuit !~ '^[0-9]{11}$';
UPDATE "users" SET cuit = regexp_replace(cuit,'\D','','g')
WHERE cuit IS NOT NULL AND cuit !~ '^[0-9]{11}$';

-- 4) VERIFICACIÓN post-saneo: las tres deben dar 0.
SELECT count(*) FROM "talleres" WHERE cuit IS NOT NULL AND cuit !~ '^[0-9]{11}$';
SELECT count(*) FROM "marcas" WHERE cuit IS NOT NULL AND cuit !~ '^[0-9]{11}$';
SELECT count(*) FROM "users" WHERE cuit IS NOT NULL AND cuit !~ '^[0-9]{11}$';
```

⚠️ **Si corrés esto por script Node/Prisma** (no en el editor SQL de Supabase): escapar el
patrón como `'\\D'` — en un template literal de JS, `\D` llega al SQL como `D` y el
regexp_replace borra letras D en vez de no-dígitos (nos pasó en DEV; en el editor SQL va `\D`
tal cual).
