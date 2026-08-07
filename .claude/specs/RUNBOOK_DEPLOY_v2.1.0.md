# RUNBOOK — 2º Deploy a PRODUCCIÓN · v2.1.0 (semana del 06-ago)

Runbook de ejecución para promover **develop → main** con todo lo de esta semana.
**Estilo martes:** corto, ordenado, con estado verificado. **PREPARADO, no ejecutado** — se
corre si Gerardo/Sergio deciden que sí. Complementa `RUNBOOK_DEPLOY_2026-08-04.md`.

- **Prod DB:** ref `nefbhacmjrzynnhvgfnl` · `sa-east-1`.
- **Dominio prod:** https://plataformatextil.com.ar
- **Tag objetivo:** **`v2.1.0`** (minor sobre `v2.0.0` del 04-ago).

---

## 0. Qué entra + estado verificado (06-ago)

**Contenido del deploy** (features de la semana):
- **P-01/P-02/P-03** — consentimiento auditable (tabla `Consentimiento`), páginas legales
  `/terminos` y `/privacidad` (render solo-cuerpo desde `docs/legal/*.md` + remark-gfm),
  aviso de propósito + 3 checkboxes en registro. *(#465)*
- **Filtro `/api/talleres` por rol** — MARCA/público solo verificados; ADMIN/ESTADO todos. *(#463)*
- **Gate de registro** por ambiente + allowlist (spec v4-a) — cierra el registro abierto de dev. *(#466)*
- **Auditorías** retirada del menú de Coordinación + ruta 404. *(#468)*
- **Docs:** PIA + HARDENING *(#467, ya en develop)*, scripts + anexo de migración del piloto *(#464, ya en develop)*.

**Migraciones pendientes contra prod = 1** (aditiva, no destructiva):
- `20260805120000_add_consentimiento` (crea enum `TipoConsent` + tabla `consentimientos`).
- Prod está en `20260702120000_etapa2_3b0_gracia` (aplicada el 04-ago). Verificado vía `_prisma_migrations`.

**La data del piloto YA está en prod** (migración por script el 05-06-ago: 23 users / 13 talleres /
10 marcas). El deploy **no** la re-migra; solo trae el código que la usa.

| Ítem | Estado |
|------|--------|
| Migraciones pendientes | **1** (`add_consentimiento`), aditiva |
| Env vars nuevas en PROD | **Ninguna.** `REGISTRO_ALLOWLIST`/`MODO_EVENTO` son de Preview/Dev (en prod el gate es no-op); `LEGAL_VERSION` es código |
| Saneo de CUITs | No-op (0 sucios; re-verificar) |
| Denuncias | Sigue OFF en prod (flag) — sin cambio |

---

## 1. Pre-requisito — todo en develop con CI verde

Antes de promover, **mergear a develop** (con Actions restaurado, merge normal + QA de Sergio):
`#463` (filtro), `#465` (P-01/02/03), `#466` (gate registro), `#468` (auditorías).
`#464` y `#467` ya están en develop.

```bash
git checkout develop && git pull
git log --oneline -8   # confirmar que están los 4 merges + #464/#467
```

## 2. Snapshot de prod (condición de Sergio)

`pg_dump` custom-format, verificado sin restaurar. **El connection string NO sale por
`vercel env pull`** (Sensitive) → tomarlo del **dashboard de Supabase** (session pooler **:5432**).

```bash
export PROD_DIRECT_URL='postgresql://postgres.nefbhacmjrzynnhvgfnl:<pass>@aws-1-sa-east-1.pooler.supabase.com:5432/postgres'
pg_dump "$PROD_DIRECT_URL" -Fc -f "backup-prod-v2.1.0-<ts>.dump"
pg_restore -l "backup-prod-v2.1.0-<ts>.dump" | head   # ~80 tablas + exit 0
unset PROD_DIRECT_URL
```
> DNS del pooler es flaky en esta red: reintentar el `pg_dump` 2-3 veces si da "could not translate host name".

## 3. Promover develop → main (dispara el deploy + la migración)

**NO es fast-forward** (main tiene el release de junio + el hotfix #455). Usar **merge commit**.

```bash
git checkout main && git pull
git merge --no-ff origin/develop -m "release: v2.1.0 — P-01/02/03 + filtro + gate registro + auditorías off + docs"
git push origin main
```
Vercel toma el push a `main`, corre `prisma migrate deploy` (aplica `add_consentimiento`), `generate`, `build`. Si `migrate deploy` falla, el deploy se aborta y prod queda en v2.0.0.

## 4. Verificación post-deploy

```bash
# 1. Prod arriba + migración aplicada
curl -s https://plataformatextil.com.ar/api/health          # {"status":"ok","db":"up"}
#    (opcional) confirmar en _prisma_migrations que add_consentimiento quedó finished.
# 2. Legales publican SOLO el cuerpo (título + Última actualización + secciones), con tablas:
#    /terminos y /privacidad → 200, sin "Nota de estado" ni apéndices; §8/§10 con tablas (remark-gfm).
# 3. Registro: /registro muestra el aviso de propósito + 3 checkboxes; un alta nueva escribe
#    3 filas en `consentimientos` (tipo TERMINOS/PRIVACIDAD/VISIBILIDAD, version=LEGAL_VERSION).
# 4. Filtro: /api/talleres a una MARCA sigue devolviendo solo verificados (6).
# 5. Gate registro: en prod es NO-OP (VERCEL_ENV=production) → registro abierto igual que hoy.
# 6. Auditorías: /estado/auditorias → 404; el tab ya no aparece en el menú de Coordinación.
# 7. Denuncias: /denunciar → sigue 404 (flag OFF, sin cambio).
# 8. Diagnóstico CUITs (read-only, esperado 0):
#    SELECT count(*) FROM "talleres" WHERE cuit IS NOT NULL AND cuit !~ '^[0-9]{11}$';  (idem marcas/users)
```

## 5. Retag `v2.1.0`

**Después** de verificar prod sano.
```bash
git checkout main && git pull
git tag -a v2.1.0 -m "Release v2.1.0 — consentimiento (P-01/02/03) + filtro talleres + gate registro + auditorías off + PIA/HARDENING (deploy semana 06-ago)"
git push origin v2.1.0
```

## 6. Cierre
- [ ] #463/#465/#466/#468 en develop, CI verde (§1)
- [ ] Snapshot `.dump` verificado (§2)
- [ ] develop→main mergeado (merge commit), build OK, `add_consentimiento` aplicada (§3)
- [ ] Verificación §4 OK (legales, registro+consentimiento, filtro, auditorías 404, denuncias 404, gate no-op)
- [ ] Diagnóstico CUITs = 0
- [ ] Tag `v2.1.0` pusheado
- [ ] Registrar en bitácora (insumo ISRA/PIA)

> **Rollback:** las migraciones son aditivas → revertir `main` (Vercel redeploya v2.0.0) sin tocar la
> DB; `migrate deploy` en el re-build es no-op. La tabla `consentimientos` queda huérfana pero inocua.
