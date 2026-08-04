# RUNBOOK — Deploy a PRODUCCIÓN · martes 4 de agosto de 2026

Runbook de ejecución para el deploy de **Etapa 2 completa + circuito CUIT + pre-deploy** a
producción. Complementa a `RUNBOOK_PROMOCION_PROD.md` (mecánica de snapshot, rollback y detalle
histórico). **Este documento es la lista ordenada a ejecutar a la mañana.**

- **Fecha:** martes 4/8/2026, a la mañana.
- **Ejecuta:** Gerardo.
- **Prod DB (Supabase):** ref `nefbhacmjrzynnhvgfnl` · región `sa-east-1`.
- **Dominio prod:** https://plataformatextil.com.ar (custom, live) — `NEXTAUTH_URL` ya apunta ahí.

---

## 0. Estado verificado el 2026-08-03 (antes del deploy)

Todo esto se chequeó ayer contra prod; sirve para no ejecutar a ciegas:

| Ítem | Estado verificado | Fuente |
|------|-------------------|--------|
| Migraciones aplicadas en prod | hasta `20260610120000_u05...` (release 13-jun) | `_prisma_migrations` |
| **Migraciones pendientes** | **exactamente 3** (ver §2) | git develop vs prod DB |
| CUITs sucios en prod (3 tablas) | **0** — el saneo §7 es no-op hoy | diagnóstico SQL |
| Flag `denuncias` en prod | `valor='true'` → hay que apagarlo (§4) | `configuracion_sistema` |
| `NEXTAUTH_URL` prod | `https://plataformatextil.com.ar` ✅ | `vercel env pull` |
| `CRON_SECRET` prod | presente (Production, separado de Preview) ✅ | `vercel env ls` |
| `NEXTAUTH_SECRET` prod | presente, separado por entorno ✅ | `vercel env ls` |
| `GOOGLE_CLIENT_ID/SECRET` prod | **ausentes** → Google OAuth NO operativo (esperado) | `vercel env ls` |

> El PR pre-deploy (#459: dominio `.com.ar`, denuncias OFF en seed, LICENSE Apache-2.0, docs
> sensibles fuera del repo) **debe estar mergeado a develop ANTES** de arrancar el paso 1.

---

## 1. Snapshot de prod (condición de Sergio) — ANTES de merged develop→main

`pg_dump` custom-format del prod, verificado sin restaurar. Ver `RUNBOOK_PROMOCION_PROD.md` §1
para el detalle (instalación de `pg_dump 17`, uso del **session pooler puerto 5432**, credenciales
a archivo gitignored). Resumen:

```bash
# Traer credenciales prod a un archivo gitignored (NO commitear)
vercel env pull .env.prod --environment=production
# Dump (usar DIRECT_URL de prod = session pooler :5432, NO el :6543)
pg_dump "$PROD_DIRECT_URL" -Fc -f "backup-prod-2026-08-04.dump"
# Verificar integridad sin restaurar (debe listar ~44 tablas + exit 0)
pg_restore -l "backup-prod-2026-08-04.dump" | head
shred -u .env.prod   # borrar credenciales
```

✅ No avanzar al paso 2 sin el `.dump` verificado.

---

## 2. Promover develop → main (dispara el deploy y las migraciones)

El merge `develop → main` dispara el build de Vercel, que corre
`prisma migrate deploy && prisma generate && next build`. Las migraciones se aplican **en el
build**, contra el prod DB, automáticamente.

**Las 3 migraciones pendientes** (todas > `20260610120000`, ninguna es destructiva):

1. `20260621120000_agregar_visibilidad_vidriera`
2. `20260624120000_agregar_modelob_revisado`
3. `20260702120000_etapa2_3b0_gracia_estado_cuenta`

```bash
# (opcional pre-check, read-only, contra prod): confirmar que son 3
npx prisma migrate status   # con .env apuntando a prod DIRECT_URL, luego revertir a dev

git checkout main && git pull
git merge --ff-only origin/develop   # o el mecanismo de PR develop→main del repo
git push origin main
```

> Vercel toma el push a `main` y hace el build+deploy. Seguir el build en el dashboard;
> si `prisma migrate deploy` falla, el deploy se aborta y prod queda en la versión anterior
> (ver Rollback, `RUNBOOK_PROMOCION_PROD.md` §4).

---

## 3. Post-deploy: acciones one-time en el prod DB

Correr en el **SQL editor de Supabase** (prod), **después** de que el deploy termine OK.

### 3.1 Apagar el flag `denuncias` (el row existe como `true`)

```sql
UPDATE configuracion_sistema SET valor = 'false' WHERE clave = 'denuncias';
-- verificar:
SELECT clave, valor FROM configuracion_sistema WHERE clave = 'denuncias';  -- debe dar 'false'
```

Tras esto: `/denunciar` y `/consultar-denuncia` dan 404, el API tracking 503, y la sección de
denuncias de `/ayuda` desaparece (gate por código ya mergeado).

### 3.2 Saneo de CUITs (§7 del runbook viejo) — hoy no-op, re-verificar igual

El 2026-08-03 el diagnóstico dio **0 filas sucias** en `talleres`, `marcas` y `users`. Igual
correr el **diagnóstico** post-deploy y solo el UPDATE si aparece algo:

```sql
-- diagnóstico (debe dar 0 en las tres; si >0, ver colisiones y UPDATE en RUNBOOK_PROMOCION_PROD.md §7)
SELECT count(*) FROM "talleres" WHERE cuit IS NOT NULL AND cuit !~ '^[0-9]{11}$';
SELECT count(*) FROM "marcas"   WHERE cuit IS NOT NULL AND cuit !~ '^[0-9]{11}$';
SELECT count(*) FROM "users"    WHERE cuit IS NOT NULL AND cuit !~ '^[0-9]{11}$';
```

---

## 4. Verificación técnica post-deploy (checklist d)

```bash
# 1. Prod arriba + versión correcta
curl -s https://plataformatextil.com.ar/api/health | head
# 2. Login manual con una cuenta real de cada rol → entra al dashboard
# 3. Anónimos: GET sensibles dan 401 sin sesión (hotfix K-01)
# 4. Certificado: emitir/ver uno → el QR y el texto impreso deben apuntar ambos a
#    plataformatextil.com.ar/verificar?code=... (coinciden porque NEXTAUTH_URL = ese dominio)
# 5. Denuncias apagadas: https://plataformatextil.com.ar/denunciar debe dar 404
# 6. Cron gracia CUIT: verificar que el cron corre (CRON_SECRET presente) — ver logs Vercel
```

Migración multi-rol y RLS ya estaban aplicadas en el release de junio; las 3 nuevas no tocan
esos invariantes. Consultas de control read-only en `RUNBOOK_PROMOCION_PROD.md` §3 si se quiere
doble-check.

---

## 5. Retag `v2.0.0` (artefacto de la entrega del viernes)

**Después** de verificar que prod está sano. El tag `v1.0.0` apunta al release de junio
(`3333016`); `v2.0.0` debe apuntar al commit de main recién deployado.

```bash
git checkout main && git pull
git tag -a v2.0.0 -m "Release v2.0.0 — Etapa 2 completa + circuito CUIT + pre-deploy (deploy 2026-08-04)"
git push origin v2.0.0
```

Ese tag + su SHA es el artefacto identificable que se entrega el viernes 7 (punto c del Handover).

---

## 6. Cierre

- [ ] Snapshot `.dump` verificado y guardado (paso 1)
- [ ] develop→main mergeado, build Vercel OK, 3 migraciones aplicadas (paso 2)
- [ ] `denuncias='false'` en prod + verificado (paso 3.1)
- [ ] diagnóstico CUITs = 0 (o saneo corrido) (paso 3.2)
- [ ] checklist técnico d OK, incluido `/denunciar`→404 y QR del certificado (paso 4)
- [ ] tag `v2.0.0` pusheado (paso 5)
- [ ] Registrar lo verificado (bitácora) — insumo para el ISRA/PIA y la verificación del miércoles 5

> **Freeze desde el viernes 7.** Después de este deploy hay una semana de rodaje antes del
> evento del martes 11. No tocar código salvo hotfix crítico.
