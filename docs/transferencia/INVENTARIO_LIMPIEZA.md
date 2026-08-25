# Inventario de limpieza del repo (F1.5 / PASO 1) — CHECKPOINT

> **Estado:** ⛔ **CHECKPOINT — requiere OK de Gerardo antes de borrar/mover nada.**
> **Fecha:** 2026-08-25.
> **Regla de oro:** *nada se borra sin clasificar, nada se clasifica sin verificar que no rompe.*
>
> Este documento es el **PASO 1** de la limpieza pre-transferencia: la clasificación propuesta de todo el árbol. **No se ejecutó ningún borrado ni movimiento.** El PASO 2 (eliminar C, archivar B en `docs/archivo/`, correr suite+build+preview) recién arranca cuando Gerardo aprueba esta lista.

**Total de archivos trackeados:** 1086. Método: `git ls-files` como set autoritativo, cruzado con `.gitignore` y lectura de encabezados de archivos ambiguos.

## ✅ Hallazgo de seguridad (bueno): el repo está limpio de secretos

**Ningún `*.dump`, `.env` real, ni clave está trackeado.** Los 4 backups `.dump` y los `.env`/`.env.local`/`.env.migracion`/`.env.test-local` existen en disco pero están correctamente gitignored (`.env*` + `*.dump`). Solo se trackean las plantillas `.env.example` y `.env.test.example`. Confirmado también contra la **historia completa** (ver `AUDITORIA_HISTORIA_GIT.md`): no se commiteó nunca un secreto real.

---

## A. VIVO (usado por el sistema / desarrollo activo) — se queda

- **Configs raíz:** `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `vitest.config.ts`, `playwright.config.ts`, `vercel.json`, `.vercelignore`, `.gitignore`
- **Plantillas de entorno:** `.env.example`, `.env.test.example`
- **Docs raíz vigentes:** `CLAUDE.md`, `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `LICENSE`, `DAILY.md` (lo actualiza el hook PostToolUse — vivo)
- **Código y datos del sistema (unidades):** `src/` (480), `prisma/` (schema + 42 migraciones + seed), `public/` (22), `tests/e2e/` + `tests/fixtures/` (50)
- **Scripts referenciados por package.json / seed / CI:** `scripts/check-db-ref.ts`, `scripts/seed-cursos.ts` (+`seed-cursos-evaluaciones.json`), `scripts/seed-evento.ts`, `scripts/seed-evento-imagenes.ts`, `scripts/seed-evento-assets/`, `scripts/indexar-corpus.ts`, `scripts/sincronizar-arca.ts`, `scripts/u05-*.ts`, `scripts/migracion-piloto/` ⚠️ (ver categoría D — contiene PII real), `scripts/verificar-migracion-d0{1,2}.sql`
- **tools/:** `generate-qa.js` (+test), `perf-check.js`, `recalcular-niveles.ts`, `sincronizar-arca.ts`
- **CI:** `.github/workflows/{e2e,qa-pages,test}.yml`
- **Infra `.claude/` activa:** `hooks/post_tool_use.py`, `settings.json`, `skills/` (7 skills + README), `BITACORA_PROD.md`, `DEUDA_TECNICA.md` (⚠️ solapa parcialmente con `docs/handover/DEUDA_Y_ROADMAP.md`)
- **Docs vigentes:** `docs/handover/*` (12), `docs/legal/*` (+`web/`), `docs/seguridad/*`, `docs/operacion/*`, `docs/EVENTO_DEMO.md`, `docs/README.md`, y ahora `docs/transferencia/*` (este paquete)

---

## B. HISTÓRICO CON VALOR — archivar en `docs/archivo/` con índice (NO borrar)

- **Specs ejecutadas:** `.claude/specs/*.md` (~140: semana1-4, v2-*, v3-*, v4-*, u-0x, w-*, x-0x, k-0x, runbooks, planificaciones). Incluye `ORDEN_IMPLEMENTACION.md` (canónico, citado por CLAUDE.md — ⚠️ ver nota), `V3_*`, `V4_*`
- **QA / REVIEW de PRs mergeados:** `.claude/auditorias/*.md` (QA_v2/V3/V4, REVIEW_v3-*, `TEMPLATE_QA.md`, `PRUEBAS_PENDIENTES.md`)
- **Handover viejo (superseded por `docs/handover/`):** `.claude/specs/handover/` (ARCHITECTURE, DECISIONS, DEPLOY, HOW_TO_*, KNOWN_ISSUES, README, AUDITORIA_OPERABILIDAD_2026-05-16) — jun-2026
- **Código aparcado:** `.claude/pendiente/` (README + 9 `.tsx` fuera del MVP, documentados con motivo/fase)
- **Prototipo estático original:** `prototipo/` (44 HTML/JS/CSS + `NAVEGACION_POR_BARRERAS.md`, `data.js`). No lo corre Next; CLAUDE.md lo cita como referencia (es el `textil/` renombrado)
- **Planificación/arquitectura previa:** `docs/01_estrategia/`, `docs/02_funcional/`, `docs/03_tecnico/`, `docs/04_operacional/`, `docs/auditoria/`, `docs/Otros/issues-abiertos-v4.md`, `docs/Otros/Documentacion/*.pdf`, `docs/handover-oit-analisis-y-division.md`, `docs/v4-input-institucional.md`, `docs/Diseño/*.md` + material extraído de diseño
- **Estado/checklist raíz históricos:** `ESTADO_PROYECTO.md` (feb-2026, obsoleto), `ORDEN_IMPLEMENTACION_V3.md` (snapshot V3), `CHECKLIST.md`, `KNOWN_ISSUES.md` (mayormente resueltos)

> ⚠️ **Ojo antes de archivar (verificación PASO 2):** `docs/02_funcional/PANTALLAS_MVP.md` y `docs/03_tecnico/DESIGN_SYSTEM.md` están citados como referencia viva en `CLAUDE.md` (como `mvp_2/…`). Y `.claude/specs/ORDEN_IMPLEMENTACION.md` lo referencia CLAUDE.md. Si se archivan, hay que actualizar esas referencias o dejarlos en su lugar. El PASO 2 debe grepear estos paths antes de mover.

---

## C. DESCARTABLE — candidatos a borrar (recupera ~35+ MB)

| Item | Motivo |
|---|---|
| `handover-pendiente/` (8 archivos) | Borradores ya consolidados; `01-README` = `README.md` raíz ya aplicado; el resto duplica `docs/handover/`. Nombres con espacios (`02 -LICENSE`) = staging manual abandonado. **Contiene un LICENSE MIT viejo (ver duplicados).** |
| `docs/Diseño/propuesta-visual-pdt-v4.zip` (**27 MB**) | Duplica byte-a-byte la carpeta ya extraída homónima |
| `.claude/specs/skills-v4.zip` | Duplica `.claude/skills/` ya versionadas; un spec nunca es un zip |
| `docs/Diseño/MASTER_V4.md.pdf` (816 K) + `MASTER_V4.md-v2.pdf` (944 K) | PDFs renderizados de un `.md`; `-v2` supersede a v1; ambos redundantes con la fuente |
| 6× `docs/Diseño/propuesta-visual-pdt-v4/.../ChatGPT Image 8 may 2026, *.png` | Iteraciones throwaway; el `.gitignore` intenta excluir `ChatGPT Image*.png` pero quedaron por estar anidadas |
| `.claude/reportes/resumen-20260420.csv` + `resumen-issues-20260420.xls` | Exports intermedios fechados, sin uso |
| `.claude/scheduled_tasks.lock` | Lock de runtime; no debería versionarse |

> `docs/Diseño/` trackea **~56 MB** — principal fuente de bloat del repo (el zip de 27 MB + PNGs pesados son C).

**Artefactos de test/build:** `test-results/`, `playwright-report/`, `blob-report/`, `.next/`, `coverage/` — ya gitignored, **no** trackeados. Solo informativo.

---

## D. NO DEBERÍA ESTAR EN EL REPO

**Trackeados críticos (secretos): NINGUNO.** Verificado en tree e historia.

**Decisión humana (⚠️) — verificado a mano:**

| Item | Verificación | Decisión sugerida |
|---|---|---|
| `docs/Otros/Documentacion/plataforma-textil_10d78fb5c073a49.crt` | **Certificado AFIP público** (issuer `O=AFIP, C=AR`), **0 líneas de PRIVATE KEY** en toda su historia. La clave privada NO lo acompaña. `.gitignore` excluye `*.pem`/`*.key` pero **no `*.crt`** | No es secreto; **sacarlo del repo por higiene** (es material de identidad AFIP de la plataforma). Sin rotación. Agregar `*.crt` al `.gitignore` |
| `scripts/migracion-piloto/lista.txt` (+ `migrar.ts`, `README.md`) | **PII real: 14 emails de participantes del piloto** (gmail personales + emails de empresa, incl. `@ciaindumentaria.com.ar`). Trackeado + en historia desde `a7cb8b1` (#464) | **Decisión de protección de datos** (ver `AUDITORIA_HISTORIA_GIT.md` §4). Es el ítem que probablemente amerite scrub (working-tree + `filter-repo`) o transferir-con-nota. **No** es rotación de claves |
| `docs/Otros/ILO_ISRA_Template.xlsx` | Coincide con el patrón "ISRA". Aparenta ser la **plantilla ILO en blanco** (no un inventario de accesos) | Abrir y confirmar que no tiene datos sensibles antes de transferir |

**Untracked en disco (NO están en el repo — solo para conciencia al entregar la máquina):** `backup-*.dump` (×4), `.env`, `.env.local`, `.env.migracion`, `.env.test-local`. Todos gitignored. Borrarlos/moverlos localmente antes de entregar el equipo físico.

---

## Duplicados detectados

| Par | Canónico | Otra copia | Nota |
|---|---|---|---|
| `README.md` raíz vs `handover-pendiente/01-README.md` | `README.md` raíz | handover-pendiente → C | Ya consolidado |
| `LICENSE` raíz (**Apache-2.0**) vs `handover-pendiente/02 -LICENSE` (**MIT**) | `LICENSE` raíz | handover-pendiente → C | ⚠️ **Incoherencia de licencia** — ver abajo |
| `CHECKLIST.md` raíz (mar-2026) vs `docs/04_operacional/CHECKLIST.md` (feb-2026) | raíz (más nuevo) | docs/ → B | Casi idénticos |
| `KNOWN_ISSUES.md` raíz (165 líneas) vs `.claude/specs/handover/KNOWN_ISSUES.md` (53) | raíz (superset) | specs/handover → B | El de specs es extracto viejo |
| `ORDEN_IMPLEMENTACION_V3.md` raíz vs `.claude/specs/ORDEN_IMPLEMENTACION.md` | `.claude/specs/…` (citado por CLAUDE.md) | raíz V3 → B | Son distintos: specs = grafo vivo; raíz = snapshot V3 |
| `docs/handover/` (v1.0 ago) vs `.claude/specs/handover/` (jun) vs `handover-pendiente/` (may) | `docs/handover/` (→ A) | specs/handover → B; handover-pendiente → C | Tres generaciones; solo `docs/handover/` es actual |
| `docs/Diseño/propuesta-visual-pdt-v4.zip` vs carpeta extraída | carpeta extraída (→ B) | zip 27 MB → C | Byte-idéntico |

### ⚠️ Incoherencia de licencia — Apache-2.0 vs MIT (resolver)

- **Canónico:** `LICENSE` (raíz) es **Apache-2.0** y `package.json` dice `"license": "Apache-2.0"` — coincide con el copyright OIT+UNTREF del Handover Package.
- **Desactualizado:** `README.md` dice **MIT en 5 lugares** (badge, tabla, comentario del árbol, sección "Forks", sección "Licencia"). El borrador `handover-pendiente/02 -LICENSE` es un LICENSE MIT viejo.
- **Acción (ya en curso):** el rewrite del README de esta PR corrige MIT→Apache-2.0. `handover-pendiente/` cae como C.

---

## Resumen accionable (para tu OK, Gerardo)

1. **Borrado seguro (C):** `handover-pendiente/`, 2 zips (27 MB + skills), 2 PDFs `MASTER_V4`, 6 PNGs ChatGPT, `.claude/reportes/*`, `.claude/scheduled_tasks.lock`. → PASO 2, tras tu OK.
2. **Archivar (B) en `docs/archivo/` con índice:** `.claude/specs/` + `.claude/auditorias/` + `.claude/pendiente/` + `prototipo/` + docs de planificación `docs/0x_*`/`auditoria`/`Diseño` (.md) + 4 archivos de estado/checklist raíz. → PASO 2, con grep previo de referencias vivas.
3. **Decisión humana (D):** (a) el `.crt` AFIP → sacar por higiene; (b) **`scripts/migracion-piloto/*` con PII real → decidir scrub vs nota** (ver auditoría de historia); (c) abrir el `.xlsx` ISRA y confirmar; (d) resolver Apache-2.0 vs MIT (README ya se corrige).
4. **Repo limpio de secretos:** confirmado en tree e historia.

**⛔ No se ejecuta nada de esto hasta tu OK.**
