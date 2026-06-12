# RUNBOOK — Promoción de DEVELOP a PRODUCCIÓN

> **Estado: PREPARACIÓN (no ejecutado).** Hoy solo se prepara. NO mergear a `main`,
> NO tocar prod, NO correr backfill. La ejecución es mañana, **pendiente del OK de
> Sergio** (y de su confirmación de horario por el cambio de hora).
>
> Fecha de preparación: 2026-06-12 · Autor: Gerardo (asistido) · Deploy objetivo: ~08:30

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

```bash
# Pre-requisito: postgresql-client. OJO: pg_dump NO está instalado en esta WSL
#   (verificado: "pg_dump: command not found"). Instalar antes:
#   sudo apt-get install -y postgresql-client-16
# o correr el dump desde una máquina/imagen que ya lo tenga.

# Credenciales prod (NO commitear): traer a un archivo gitignored
vercel env pull --environment=production .env.prod      # trae DIRECT_URL de prod

# Dump custom-format (comprimido, restaurable selectivamente) usando la conexión
# DIRECTA (no el pooler) — DIRECT_URL, puerto 5432:
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
- **NO ejecutar hoy.** Hoy solo dejamos el comando y el pre-requisito (instalar
  `postgresql-client`) listos.

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
- Branch protection en `main`: confirmar en GitHub si exige PR/checks. Si los exige, la
  promoción es un PR `develop → main` (no push directo).

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

> Horarios tentativos. **Deploy 08:30 pendiente del OK de Sergio** (cambio de hora).
> Smoke de Sergio desde las 10:00.

| Hora | Paso | Detalle | Gate |
|---|---|---|---|
| **08:15** | **a. Snapshot** | `pg_dump` de prod (§1) + verificación de integridad (`pg_restore --list`). Copiar el `.dump` a 2 destinos. | No avanzar sin dump verificado. |
| **08:25** | **b. Cuenta de smoke INTOCABLE** | Registrar el email de smoke de Sergio como excluido del backfill/normalización del paso (f). ⚠️ El script `u05-backfill-validaciones.ts` **no tiene flag de exclusión** hoy → ver "Decisiones pendientes". | Email de Sergio confirmado y anotado. |
| **08:30** | **c. Promoción** | Merge `develop → main` (PR si hay branch protection). Vercel buildea: `prisma migrate deploy` aplica las 6 migraciones → `next build` → publica. | Build verde en Vercel. Si el build falla → prod sigue en el deploy viejo, investigar antes de reintentar. |
| **08:40** | **d. Verificación técnica nuestra** | Ver checklist (d) abajo. | Todo OK antes de habilitar a Sergio. |
| **10:00–10:45** | **e. Smoke de Sergio** | Su checklist habitual + la línea de landing (§5). | Veredicto de Sergio. |
| **post-OK** | **f. Backfill validaciones D-02** | `ALLOW_PROD=1 npx tsx scripts/u05-backfill-validaciones.ts` (dry-run) → revisar reporte → **solo con OK explícito de Gerardo** → `--apply`. Excluir la cuenta de Sergio. Timestamp en `DAILY.md` (condición 3 de Sergio). | OK explícito de Gerardo para el `--apply`. |
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

### Smoke de Sergio — línea a agregar a su checklist
- [ ] **Landing pública: se ve bien, los CTA llevan a donde deben** (registro taller/marca + login)

---

## 6. Decisiones pendientes antes de mañana

1. **Exclusión de la cuenta de smoke en el backfill (paso f).** `u05-backfill-validaciones.ts`
   **no** tiene flag para excluir un email. Opciones: (a) agregar `--exclude <email>` al
   script antes de mañana; (b) correr el backfill **antes** de que Sergio use su cuenta;
   (c) confirmar en el dry-run que su cuenta no aparece entre los talleres tocados.
   **Decidir cuál.**
2. **Tier de Supabase / PITR** — confirmar en dashboard si hay backup on-demand nativo o
   si vamos 100% con `pg_dump` (este runbook asume `pg_dump`).
3. **Instalar `postgresql-client`** en la máquina que hará el snapshot (no está en esta WSL).
4. **Branch protection en `main`** — confirmar si la promoción es push directo o PR.
5. **Conciencia del tamaño del release** — 105 commits / 6 migraciones / landing nueva /
   RLS K-01 a prod. Confirmar que Sergio dimensiona el smoke en consecuencia.
6. **Horario 08:30** — pendiente del OK de Sergio por el cambio de hora.
