# Handover Package — Plataforma Digital Textil (PDT)

> **Documento maestro de entrega.** Versión **1.0** — **2026-08-03**.
> Preparado para la Organización Internacional del Trabajo (OIT) y la Universidad Nacional de
> Tres de Febrero (UNTREF).

## Propósito y estrategia de esta entrega

Este documento es **la entrega**: recorre la estructura estándar de handover de OIT (puntos
**a** a **j**) y, para cada punto, indica **(i)** qué se entrega hoy y **dónde** (ruta /
link exacto), **(ii)** los ítems **N/A por diseño** del stack serverless (con su
justificación) y **(iii)** los **gaps** con responsable y fecha comprometida. Todos los
demás documentos del paquete cuelgan de acá.

**Estrategia v1.0 (entrega de hoy):** se entrega **todo lo que existe** + los gaps
**declarados** con responsable y fecha. Es una entrega honesta y completa en cobertura, no
un documento aspiracional. La v1.1+ refina los gaps a medida que se cierran.

> **Nota de proceso — merges del 06-ago con CI indisponible.** Algunos PRs (#464 scripts+anexo,
> #467 PIA+HARDENING; y #463/#465 al llegar el QA de Sergio) se mergearon con **merge
> administrativo** porque **GitHub Actions estuvo caído por un incidente oficial**
> (githubstatus.com, activo desde las **15:22 UTC del 2026-08-06**, sin resolución al cierre del
> día) — no fue quota, billing ni el código. **Validación aplicada en su lugar:** suite de tests
> local **completa 806/806 verde** (2026-08-06), **previews de Vercel verdes** (deploys por PR),
> y **QA funcional de Sergio** en #463/#465. **✅ Validación retroactiva EJECUTADA:** Actions se
> restauró el **2026-08-07 (~00:50 UTC)**; al mergear #463 a `develop` (commit `4cfd421`) corrió la
> **suite completa en CI — Unit ✅ + E2E ✅**
> ([run](https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/actions/runs/31137979978)).
> Como los merges administrativos de ayer (#464/#467) están en ese mismo estado de `develop`, el
> mismo run los **retro-valida**. Círculo cerrado.

### Nota sobre el stack (por qué hay "N/A por diseño")

El PDT se construyó intencionalmente sobre un stack **managed serverless** (Vercel +
Supabase). Varios ítems del checklist genérico de OIT asumen despliegue tradicional (infra
propia, contenedores, binarios). Esos ítems se entregan **adaptados** o se declaran
explícitamente **N/A por diseño**, con la justificación en cada punto. El análisis base de
esta decisión está en `docs/handover-oit-analisis-y-division.md` (autor: Sergio).

### Mapa del paquete

| Documento | Ubicación | Cubre puntos |
|-----------|-----------|--------------|
| **Este documento (maestro)** | `docs/handover/HANDOVER_PACKAGE.md` | a–j |
| Análisis y división de tareas | `docs/handover-oit-analisis-y-division.md` | a–j (origen) |
| CONTRIBUTING | `CONTRIBUTING.md` (raíz) | a |
| CHANGELOG | `CHANGELOG.md` (raíz) | a, c |
| Guía de desarrollo | `docs/handover/GUIA_DESARROLLO.md` | f |
| Arquitectura de deploy | `docs/handover/ARQUITECTURA_DEPLOY.md` | b |
| Runbook operativo consolidado | `docs/handover/RUNBOOK_OPERATIVO.md` | b, d |
| Backup y restore | `docs/handover/BACKUP_RESTORE.md` | e |
| Reporte de licencias + SaaS | `docs/handover/REPORTE_LICENCIAS.md` | h |
| Cobertura de tests | `docs/handover/COBERTURA_TESTS.md` | g |
| Deuda técnica y roadmap | `docs/handover/DEUDA_Y_ROADMAP.md` | i, backlog |
| Runbooks fuente | `.claude/specs/RUNBOOK_*.md` | b, d, e |
| Condiciones de producción (Sergio) | `docs/handover/CONDICIONES_PRODUCCION.md` | b |
| Decisiones técnicas (Sergio) | `docs/handover/DECISIONES_TECNICAS.md` | b, f |
| Especificaciones de continuidad (Sergio) | `docs/handover/ESPECIFICACIONES_CONTINUIDAD.md` | f, i |
| Manual de operación (Sergio) | `docs/operacion/MANUAL_OPERACION.md` | f |
| Manual de administración (Sergio) | `docs/operacion/MANUAL_ADMINISTRACION.md` | f |
| Términos y condiciones (Sergio) | `docs/legal/TERMINOS_Y_CONDICIONES.md` | i |
| Política de privacidad (Sergio) | `docs/legal/POLITICA_DE_PRIVACIDAD.md` | i |
| PIA — evaluación de impacto en privacidad | `docs/legal/PIA.md` | i |
| Hardening — controles aplicados | `docs/seguridad/HARDENING.md` | g |
| ISRA — evaluación de riesgo | **canal seguro separado** (no en el repo) | g |
| Hallazgos de seguridad | **canal seguro separado** (no en el repo) | g |
| Inventario de accesos | **canal seguro separado** (no en el repo) | d |

> **Nota de seguridad (decisión de Sergio, 2026-08-03).** `HALLAZGOS_SEGURIDAD.md` (consolidado
> de hallazgos y superficie de ataque) e `INVENTARIO_ACCESOS.md` (mapa de qué credencial vive en
> qué proveedor) **se retiraron del repositorio** y se entregan a OIT/UNTREF **por un canal seguro
> separado**. Motivo: el repositorio se transfiere a la cuenta que designe OIT y desde ahí la
> decisión de abrirlo deja de ser del equipo; estos dos documentos no deben viajar con el código.
> Quedan en el **historial de git** de commits previos: la transferencia final debe contemplar la
> opción de **purga con `git filter-repo`** (anotado en el checklist de transferencia de
> `DEUDA_Y_ROADMAP.md`).

### Convención de responsables y estado

- **Gera** = Gerardo (técnico). **Sergio** = coordinación / administrativo / legal.
- Estado de cada punto: **ENTREGADO** (completo hoy) · **PARCIAL** (núcleo entregado + gaps
  con fecha) · **COORDINACIÓN** (depende de una definición institucional de OIT/UNTREF).

---

## a) Código y repositorios — ENTREGADO

**(i) Qué se entrega hoy:**
- Repositorio GitHub activo: `Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil`.
- Historial Git completo (desde 2026-01-08), ramas `main` (producción) y `develop` (preview).
- **`README.md`** (raíz) + **`CLAUDE.md`** (convenciones internas).
- **`CONTRIBUTING.md`** (raíz) — flujo de contribución, convenciones, Conventional Commits, flujo de ramas/PR.
- **`CHANGELOG.md`** (raíz) — release notes por versión, reconstruidas del historial de PRs.
- **Tag de release `v1.0.0`** sobre el commit de producción `3333016` (ver punto c).

**(iii) Gaps:** ninguno bloqueante. Las release notes futuras se mantienen en `CHANGELOG.md`
al promover (Gera, continuo).

---

## b) Infraestructura y despliegue — ENTREGADO

**(i) Qué se entrega hoy:**
- **`docs/handover/ARQUITECTURA_DEPLOY.md`** — arquitectura descriptiva: Vercel (región
  `gru1`), Supabase (dev/prod, sa-east-1, PG 17.6), GitHub Actions (3 workflows), mapping
  rama→entorno, variables de entorno, cron jobs.
- **`docs/handover/RUNBOOK_OPERATIVO.md`** — runbook consolidado con escenarios: promoción a
  prod, caída de Vercel/Supabase, migración fallida, rotación de secret, modo evento.
- Runbooks fuente detallados: `.claude/specs/RUNBOOK_PROMOCION_PROD.md`,
  `RUNBOOK_RESCOPE_SECRETS.md`, `RUNBOOK_OBSERVABILIDAD.md`.
- Endpoint de salud: `/api/health` (200 si DB ok, 503 si no).

**(ii) N/A por diseño:**
- **Infra-as-Code (IaC):** Vercel/Supabase son PaaS/BaaS; la infra vive en las UIs de los
  proveedores.
- **Manifiestos de contenedores (Dockerfile/K8s):** arquitectura serverless, no hay
  contenedores.
- **Scripts propios de despliegue/rollback:** Vercel automatiza el deploy; el rollback es
  revert de `main` (Vercel redeploya) o desde la UI. Se entrega **procedimiento
  documentado**, no scripts.

**(iii) Gaps:** confirmar tier de Supabase y detalle de DNS/dominio (ver punto d). Gera,
tras definición de titularidad.

---

## c) Artefactos ejecutables — ENTREGADO (adaptado)

**(i) Qué se entrega hoy:**
- **Tag de release `v1.0.0`** → commit `3333016` (deploy 2026-06-13). Release 1.0 (piloto inicial).
- **Tag de release `v2.0.0`** → commit `4fa2979` (deploy 2026-08-04). Etapa 2 + circuito CUIT +
  pre-deploy. **Es el artefacto identificable vigente en producción.**
- Cada commit es identificable por SHA; el estado desplegado es reproducible desde el tag.

**(ii) N/A por diseño:** no se generan tarballs ni hashes de binario — en serverless el
artefacto es el **commit + tag**, no un ejecutable. Si OIT lo pide explícitamente, se genera
un tarball del árbol en el tag.

**(iii) Gaps:** `v2.0.0` **ya está en producción** (deploy 04-ago). El próximo tag será
**`v2.1.0`** al promover el trabajo de esta semana (P-01/02/03 + filtro + gate registro +
auditorías off), si el 2º deploy se ejecuta — runbook `.claude/specs/RUNBOOK_DEPLOY_v2.1.0.md`.

---

## d) Configuración, acceso y credenciales — PARCIAL / COORDINACIÓN

**(i) Qué se entrega hoy:**
- **`INVENTARIO_ACCESOS.md`** — inventario técnico: qué cuenta/servicio vive dónde, tabla de
  variables de entorno por scope (**sin valores**), proyectos Supabase, DNS/dominios, contactos
  de escalamiento. **Se entrega por canal seguro separado, no está en el repositorio** (decisión
  de Sergio, 2026-08-03; ver nota de seguridad en el "Mapa del paquete").
- **`.claude/specs/RUNBOOK_RESCOPE_SECRETS.md`** — procedimiento de re-scope y rotación de
  secretos (NEXTAUTH_SECRET, ARCA_PROVIDER, CRON_SECRET, etc.).
- `.env.example` en el repo lista todas las variables necesarias.

**(ii) Cambia por stack:** no hay secretos custom; todos son API keys de SaaS de terceros.
La rotación se hace desde el dashboard de cada proveedor.

**(iii) Gaps — COORDINACIÓN (Sergio con Matías y OIT):**
- **Titularidad institucional** de cada cuenta (Vercel, Supabase, dominio, Google OAuth,
  etc.): a qué email/cuenta de OIT/UNTREF se transfieren. **Responsable: Sergio.**
- Registrador y propietario del dominio + inventario DNS completo. **Gera, tras titularidad.**
- Política y calendario de rotación de credenciales. **Gera, tras titularidad.**
- **Fecha:** depende de la definición institucional de OIT/UNTREF. El inventario técnico ya
  está listo para ejecutar la transferencia apenas se defina el receptor.

---

## e) Datos y migraciones — ENTREGADO

**(i) Qué se entrega hoy:**
- `prisma/schema.prisma` completo, **37 migraciones versionadas** en `prisma/migrations/`,
  `prisma/seed.ts`, scripts SQL de verificación.
- **`docs/handover/BACKUP_RESTORE.md`** — estrategia de backup (automático de Supabase +
  `pg_dump` on-demand), procedimiento de restore, política de retención.

**(ii) Cambia por stack:** backups automáticos gestionados por Supabase; se documenta el
**procedimiento de restore**, no se arma un mecanismo propio. Plan de migración a otra infra:
N/A.

**(iii) Gaps:** confirmar tier de Supabase PROD (retención); formalizar backup del Storage;
automatizar el snapshot pre-deploy (hoy manual). Gera. Ver los "gaps declarados" del doc.

---

## f) Documentación técnica y funcional — ENTREGADO (parte Gera) / PARCIAL (manuales de Sergio)

**(i) Qué se entrega hoy (parte técnica, Gera):**
- **`docs/handover/GUIA_DESARROLLO.md`** — levantar local, estructura, DB, tests, CI/CD,
  troubleshooting.
- **`CONTRIBUTING.md`** — convenciones y flujo de trabajo.
- **`CHANGELOG.md`** — release notes consolidadas.
- Documentación técnica y funcional existente: `docs/03_tecnico/` (arquitectura,
  integraciones AFIP/ARCA/ANSES, API contract, design system), `docs/02_funcional/`
  (wireframes, casos de uso, historias), `mvp_2/` (70 wireframes + design system).

**(iii) Gaps:**
- **Manual de operación** (día a día: crear usuarios, resetear cuentas, incidencias) —
  **Sergio.**
- **Manual de administración** (uso del panel `/admin`, gestión de contenido) — **Sergio.**
- **Fecha:** a coordinar con Sergio; la guía de desarrollo y las convenciones (parte Gera)
  ya están entregadas.

---

## g) Calidad, pruebas y seguridad — ENTREGADO / PARCIAL

**(i) Qué se entrega hoy:**
- **`docs/handover/COBERTURA_TESTS.md`** — **55 suites unitarias** (Vitest) + **37 specs
  E2E** (Playwright), agrupadas por área; CI como gate de merge.
- **`HALLAZGOS_SEGURIDAD.md`** — consolidado de hallazgos con estado (gestión de secretos,
  incidente ARCA, K-01 RLS, IDOR, rate limiting/CORS, evento OIT). **Se entrega por canal seguro
  separado, no está en el repositorio** (decisión de Sergio, 2026-08-03; describe la superficie
  de ataque — ver nota de seguridad en el "Mapa del paquete").
- CORS y rate limiting (Upstash) implementados y testeados. `docs/seguridad/cookies.md`.

**(ii) Cambia por stack:** el hardening tradicional (nginx, firewall, patcheo del SO) no
aplica — lo gestiona Vercel. El hardening aplicable es Next.js + Vercel + Supabase RLS.

**(iii) Gaps:**
- **CSP + headers de seguridad** en `next.config.ts` (hoy no configurados) — **Gera, ~3 h**
  (ver Hallazgo 4.1 y roadmap).
- **Reporte de cobertura con % de líneas** — instalar `@vitest/coverage-v8` — **Gera.**
- **Matriz de riesgos** formal vs. pragmática — **decisión de Sergio** con Gera. El
  documento de hallazgos es la base pragmática.
- ~~Re-scope de `NEXTAUTH_SECRET` (Hallazgo 1.2)~~ — **CERRADO 2026-08-03** (junto con `CRON_SECRET`, separados por entorno).

---

## h) Licencias y propiedad intelectual — ENTREGADO / PARCIAL

**(i) Qué se entrega hoy:**
- **`LICENSE`** (raíz) — **MIT**, Copyright 2026 OIT + UNTREF.
- **`docs/handover/REPORTE_LICENCIAS.md`** — reporte de `license-checker` (deps de
  producción: ~427 de 434 permisivas MIT/ISC/Apache/BSD; `UNLICENSED` = el propio `pdt`
  privado; 2 LGPL transitivas de `sharp` marcadas para revisión) + **tabla de componentes
  SaaS** (Vercel, Supabase, Resend, Google OAuth, AFIP SDK, Anthropic, Voyage, Upstash,
  GitHub) con rol, plan y titularidad.

**(ii) Cambia por stack:** la sección de "componentes de terceros / SaaS" es más gruesa que
en un stack tradicional; es central en esta entrega.

**(iii) Gaps:**
- Confirmar la **licencia definitiva** del proyecto con UNTREF/OIT + **documento de cesión
  de derechos** — **Sergio.**
- Confirmar planes/tiers y titularidad de cada SaaS — **Sergio (titularidad) / Gera
  (planes).**

---

## i) Cumplimiento y legal — PARCIAL / COORDINACIÓN (roadmap comprometido)

**(i) Qué se entrega hoy:**
- Páginas `/terminos`, `/privacidad`, `/accesibilidad` (contenido a revisar legalmente).
- Auth con roles y RBAC; RLS (K-01) en camino a PROD con el próximo deploy.
- **`docs/handover/DEUDA_Y_ROADMAP.md`** — **Bloque A** (P-01 a P-10) con estimaciones,
  dependencias y fechas propuestas.

**(iii) Gaps — camino crítico de cumplimiento (Bloque A, ~43 h + ISRA/PIA):**
- **P-01 a P-08** (consentimiento, portabilidad, borrado, breach, retención, sección admin)
  — **Gera** (implementación).
- **P-09 ISRA** y **P-10 PIA** (plantillas OIT) — **Sergio.**
- **Dependencia externa bloqueante:** copia oficial de **IGDS 456, IGDS 457 y Risk
  Management Manual** de OIT para arrancar.
- Revisión legal de términos y privacidad — **Sergio** con UNTREF/OIT.
- **Fecha:** arranca apenas OIT entregue las IGDS; roadmap y orden en `DEUDA_Y_ROADMAP.md`.

---

## j) Transferencia operativa — CUBIERTO por otros puntos

**(i)** La transferencia operativa se cubre con:
- Los **manuales de operación y administración** (punto f, Sergio) — suplen las sesiones de
  transferencia formales.
- La **lista de contactos de escalamiento** y el **calendario de rotación** (punto d,
  `INVENTARIO_ACCESOS.md` — entregado por canal seguro separado).
- La **guía de desarrollo** y los **runbooks** (puntos b y f) para el equipo técnico
  receptor.

**(ii) N/A por diseño:** sesiones de transferencia formales presenciales — cubiertas por la
documentación anterior; se agendan si OIT las requiere.

**(iii) Gaps:** completar los manuales de operación/administración (Sergio, ver punto f).

---

## Cierre de la semana y estado de la entrega (2026-08-07)

Cierre del grueso del trabajo de ingeniería del piloto.

**Lo que se hizo esta semana:**
- **Deploy `v2.0.0` a producción** (04-ago, `4fa2979`): Etapa 2 + circuito CUIT + pre-deploy
  (dominio `.com.ar`, LICENSE Apache-2.0, denuncias OFF, docs sensibles fuera del repo).
- **Migración del piloto dev→prod** (05-06 ago): 23 usuarios reales en prod, `verificadoAfip`
  **por evidencia** de `consultas_arca`, export documental de dev (canal separado). Ver anexo.
- **8 PRs de la semana** a `develop`: `#462` spec consentimiento · `#463` filtro talleres por
  rol · `#464` scripts+anexo migración · `#465` P-01/P-02/P-03 (consentimiento + legales +
  registro) · `#466` gate de registro (v4-a) · `#467` PIA + HARDENING · `#468` auditorías off
  · `#469` runbook v2.1.0. *(#465 pendiente de merge tras el re-QA de Sergio.)*
- **ISRA / PIA entregados:** `PIA.md` + `HARDENING.md` (repo) + actualización del ISRA (canal
  separado) — 9 proveedores con tabla de DPA (8 con DPA + AFIP SDK gap), Google OAuth
  planificada/no-operativa.
- **Incidente de GitHub Actions** (06-ago): algunos merges con merge administrativo + **validación
  retroactiva verde** al restaurarse el servicio (ver "Nota de proceso" al inicio).

**Artefacto de la entrega (tag) — dos variantes según se ejecute el 2º deploy hoy:**
- **CON 2º deploy → `v2.1.0`:** P-01/02/03 + filtro + gate registro + auditorías off + PIA/HARDENING.
  Runbook `.claude/specs/RUNBOOK_DEPLOY_v2.1.0.md` (1 migración aditiva `add_consentimiento`).
- **SIN 2º deploy → `v2.0.0`** (04-ago, `4fa2979`) sigue siendo el artefacto identificable en prod;
  el trabajo de esta semana queda en `develop` (no liberado) para el próximo deploy.

**Freeze:** desde la entrega, **congelamiento de código** — no se toca salvo hotfix crítico,
alineado con el freeze del cronograma. El evento corre sobre el entorno de demo con datos sintéticos.

---

## Resumen de estado por punto

| Punto | Título | Estado | Gaps principales (responsable) |
|-------|--------|--------|-------------------------------|
| a | Código y repositorios | **ENTREGADO** | — |
| b | Infraestructura y despliegue | **ENTREGADO** | DNS/tier (Gera, tras titularidad) |
| c | Artefactos ejecutables | **ENTREGADO** | v2.0.0 en prod (04-ago); tag v2.1.0 al 2º deploy (Gera) |
| d | Config, acceso, credenciales | **COORDINACIÓN** | Titularidad institucional (Sergio) |
| e | Datos y migraciones | **ENTREGADO** | tier/Storage/automatizar snapshot (Gera) |
| f | Documentación técnica/funcional | **PARCIAL** | Manuales en repo; falta conciliar admin (Sergio) |
| g | Calidad, pruebas y seguridad | **PARCIAL** | PIA+HARDENING entregados; pendiente CSP+headers, coverage % (Gera) |
| h | Licencias y PI | **PARCIAL** | Licencia **Apache-2.0 definida**; falta cesión de derechos (Sergio) |
| i | Cumplimiento y legal | **PARCIAL / COORDINACIÓN** | P-01/02/03 hechos + PIA; Bloque A ahora **P-04..P-08** (Gera) + IGDS de OIT |
| j | Transferencia operativa | **CUBIERTO** | Manuales (Sergio) |

**Bloqueante para escalar más allá del piloto:** únicamente el **Bloque A** (punto i), que a
su vez depende de que OIT entregue las plantillas IGDS. Todo lo demás está entregado o tiene
gap con responsable y fecha.

---

## Anexo — Migración del piloto a producción (2026-08-05)

Registro del traslado de los usuarios reales del piloto de **DEV → PROD** (el hueco que
faltaba documentar). Read-only sobre el diagnóstico, escritura controlada por script.

**Qué migró (14 usuarios, lista congelada por Gerardo; +1 el 06-ago):** 8 talleres + 5 marcas + 1 rol,
más **paoguerschuny** (marca "Estudio praline", registrada después del padrón — migrada individual el 06-ago).
- **Conteos prod:** users 9→**23** · talleres 5→13 · marcas 3→**10**.
- **`cp.alanplummer`** (ya MARCA en prod): **MERGE** — se le sumó el rol TALLER a su user
  existente (no se duplicó identidad; no tenía entidad en dev).
- **`solve.vtt`** multi-rol: migró taller **y** marca.

**Criterio de `verificadoAfip` — POR EVIDENCIA, no por el flag de dev:** se consultó
`consultas_arca` de dev buscando una **consulta ARCA real exitosa** (duración >200 ms; el
mock responde en ~1-50 ms y siempre con nombre "TALLER MOCK SRL"). 
- **4 verificados** (evidencia real): jointexcooperativa, monibasterrechea (talleres →
  ACTIVA), monicagodoyleiva, csamaniego (marcas → verificadoAfip=true).
- **El resto → sin verificar:** talleres a `EN_GRACIA` con `inicioGracia=NOW()` (circuito de
  re-verificación real); marcas a `verificadoAfip=false` (sin reloj de gracia). Incluye 4
  talleres que en dev figuraban `verificadoAfip=true` por el **mock** pero sin evidencia real.
- **Invariante verificada:** `/api/talleres` a una MARCA sigue mostrando **solo verificados**
  (6 en prod); ningún taller EN_GRACIA migrado se filtra al directorio.

**Qué NO migró (y por qué):** sesiones, notificaciones, `log_actividad`, cotizaciones/órdenes
y el historial `consultas_arca` (ruido operativo de dev). Documentos de storage: 0 (los
talleres del piloto no habían subido ninguno). Certificados/progreso: fuera de la 1ª tanda.

**Cierre de dev:** los 14 se **eliminaron de dev** (sus copias viven en prod); el seed+demo
quedó intacto (11 `@pdt.org.ar` + roles ADMIN/ESTADO/CONTENIDO) y el directorio de dev **no
muestra personas reales**. Conteos dev: users 26→12 · talleres 14→6 · marcas 10→4.

**Export documental de dev (registro histórico de la actividad del piloto):** `pg_dump`
custom-format con timestamp, verificado con `pg_restore -l` (80 tablas). **Decisión de Sergio:
export documentado, no instancia viva.** El archivo (`backup-dev-piloto-<ts>.dump`) **NO va al
repositorio** (contiene PII real) — se guarda en almacenamiento seguro junto al inventario de
accesos (canal separado). Snapshot de prod pre-migración conservado igual (`backup-prod-<ts>.dump`).

**Herramientas (en el repo):** `scripts/migracion-piloto/` — `dry-run.ts` (diagnóstico
read-only), `migrar.ts` (migración con las ramas MERGE/verdict/remap-catálogos), `README.md`.
El veredicto por email vive en `migrar.ts` (`VERIFICADOS`).

---

*Versión 1.0 · 2026-08-03 (entrega inicial) · Anexo de migración 2026-08-05 · **Cierre de la
semana 2026-08-07** (v2.0.0 en producción, v2.1.0 preparado, freeze). Los gaps se cierran en
versiones sucesivas de este paquete.*
