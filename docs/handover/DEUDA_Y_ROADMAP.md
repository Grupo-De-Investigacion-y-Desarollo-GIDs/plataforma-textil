# Deuda técnica y roadmap post-entrega

> Backlog priorizado presentado como **roadmap post-entrega**. El **Bloque A (cumplimiento
> OIT y privacidad)** es el crítico y bloquea escalar más allá del piloto; el resto es deuda
> técnica y mejoras no bloqueantes.
>
> Fuente: `.claude/specs/V4_BACKLOG.md`. Estado a **2026-08-03**. Estimaciones en horas de
> desarrollo (no calendario); las **fechas propuestas** son sugerencias a validar con OIT.

## Cómo leer el roadmap

- **Estimación** = horas de trabajo técnico. **P-09/P-10** son entregables documentales (no
  código) de Sergio con plantillas de OIT.
- **Fecha propuesta** = ventana sugerida asumiendo dedicación continua; se ajusta según
  prioridades de OIT y disponibilidad del equipo.
- Bloquea el escalamiento del piloto: **sólo el Bloque A**.

---

## Bloque A — Cumplimiento OIT y privacidad de datos (CRÍTICO)

Origen: plantilla ISRA + Privacy Assessment recibida de OIT (abril 2026). Sin estos ítems la
plataforma **no puede escalar más allá del piloto**. Total: **~43 h** de código + 2
entregables documentales.

**Dependencia externa (bloqueante para arrancar):** copia oficial de **IGDS 456, IGDS 457 y
Risk Management Manual** de OIT.

| ID | Ítem | Estimación | Depende de | Responsable |
|----|------|-----------|-----------|-------------|
| **P-01** | Consentimiento explícito en registro (checkboxes obligatorios: términos, privacidad, visibilidad de datos) | 4 h | — | Gerardo |
| **P-02** | Páginas públicas de términos y privacidad editables por admin, linkeadas | 3 h | P-01 | Gerardo |
| **P-03** | Notificación de propósito al recolectar datos (pantalla previa al registro) | 4 h | P-02 | Gerardo |
| **P-04** | Derecho a descargar datos (portabilidad): "Descargar mis datos" → JSON completo | 6 h | — | Gerardo |
| **P-05** | Derecho a eliminar cuenta y datos (soft delete + hard delete a 30 d, doble confirmación) | 8 h | P-04 | Gerardo |
| **P-06** | Sistema de reporte de breach (`/admin/incidentes`) | 6 h | — | Gerardo |
| **P-07** | Política de retención configurable (UI admin + job nocturno) | 8 h | — | Gerardo |
| **P-08** | Sección admin "Privacidad y datos" (agrupa P-04..P-07 + métricas) | 4 h | P-04..P-07 | Gerardo |
| **P-09** | Documento ISRA completado (plantilla OIT) | documental | info técnica | Sergio |
| **P-10** | Documento Privacy Assessment / PIA (plantilla OIT) | documental | P-09 | Sergio |

**Fecha propuesta:** arrancar apenas OIT entregue IGDS 456/457. Camino crítico sugerido:
P-01→P-02→P-03 (consentimiento y transparencia, ~11 h) primero por ser lo más visible en
auditoría; luego P-04→P-05→P-08 (derechos ARCO, ~18 h); P-06 y P-07 en paralelo. ISRA/PIA
(Sergio) en paralelo con la implementación.

---

## Prioridad inmediata — endurecimiento previo al escalamiento

No están en un bloque del backlog pero salen del consolidado de seguridad
(`HALLAZGOS_SEGURIDAD.md`, entregado por canal seguro separado — no está en el repo) y conviene
cerrarlos antes/junto con el Bloque A:

| Ítem | Qué | Estimación | Estado | Ref |
|------|-----|-----------|--------|-----|
| CSP + security headers | `headers()` en `next.config.ts` (CSP report-only, HSTS, X-Frame-Options, etc.) | ~3 h | Pendiente | Hallazgo 4.1 |
| Re-scope `NEXTAUTH_SECRET` + `CRON_SECRET` | Separar los secrets por entorno (dashboard) | ~1 h | **CERRADO 2026-08-03** | Hallazgo 1.2 |
| Gate de registro para el evento OIT | Implementar allowlist + `MODO_EVENTO` | ~4 h | Pendiente | Hallazgo 3.1 · spec `v4-a-proteger-registro-dev.md` |
| Saneo de CUITs en PROD | Normalizar CUITs con guiones (3 tablas) en el próximo deploy grande | ~1 h | Pendiente | `RUNBOOK_PROMOCION_PROD.md` §7 |

---

## Checklist de transferencia del repositorio a OIT/UNTREF

Al transferir el repositorio a la cuenta que designe OIT (cuando OIT designe receptor):

- [ ] **Purga de documentos sensibles del historial de git.** `INVENTARIO_ACCESOS.md` y
  `HALLAZGOS_SEGURIDAD.md` se retiraron de `docs/handover/` (decisión de Sergio, 2026-08-03) y
  se entregan por canal seguro separado, pero **siguen presentes en commits previos del
  historial**. Antes o durante la transferencia, evaluar purgarlos con
  [`git filter-repo`](https://github.com/newren/git-filter-repo):
  ```bash
  git filter-repo --path docs/handover/INVENTARIO_ACCESOS.md \
                  --path docs/handover/HALLAZGOS_SEGURIDAD.md --invert-paths
  ```
  (reescribe el historial → requiere push forzado y coordinación; hacerlo en el momento de la
  transferencia, no antes, para no romper referencias del equipo actual).
- [ ] **Rotar todos los secretos** tras entregar los accesos (los valores no están en el repo,
  pero la titularidad de las cuentas cambia). Ver `RUNBOOK_RESCOPE_SECRETS.md`.
- [ ] **Reasignar la titularidad institucional** de cuentas (Vercel, Supabase, Resend, GitHub,
  dominio) — pendiente de definición OIT/UNTREF.

---

## Bloque B — Mobile y UX (~22 h)

| ID | Ítem | Estimación |
|----|------|-----------|
| M-01 | Auditoría mobile completa (320/375/768px, listar issues) | 6 h |
| M-02 | Reactivar tests E2E mobile (`mobile-safari`/`mobile-chrome` en Playwright + CI) | 4 h |
| M-03 | Mejoras de UX mobile (aplicar fixes de M-01) | 12 h |

> Nota: M-03 del flujo crítico del taller ya se atacó parcialmente en `develop` (#431). Este
> bloque es la cobertura mobile completa.

**Fecha propuesta:** tras el Bloque A, o antes si el uso mobile de los talleres lo prioriza.

---

## Bloque C — Mejoras al sistema de QA (~20 h)

| ID | Ítem | Estimación |
|----|------|-----------|
| Q-04 | Renombrar `logAccionAdmin` → `logAccionSensible` (semántica post-D-01) | 2 h |
| Q-05 | Auto-asignación de issues por verificador en el QA HTML | 4 h |
| Q-06 | Métricas de auditoría en el index (tiempo de resolución, tendencias) | 6 h |
| Q-07 | Auditoría en el preview de cada PR | 8 h |

**Fecha propuesta:** oportunista; mejora la productividad del propio proceso de QA.

---

## Bloque D — Deuda técnica de V3 (~41,5 h)

Ítems seleccionados (lista completa en `V4_BACKLOG.md`):

| ID | Ítem | Estimación |
|----|------|-----------|
| T-04 | Migrar `CI_BYPASS_TOKEN` a JWT firmado (sin secreto compartido en runtime) | 4 h |
| T-08 | Migrar ~57 endpoints al formato de error consistente `{ error: { code, message, digest } }` | 10 h |
| T-11 | Health check de variables de entorno críticas en el arranque | 2 h |
| T-13 | Migrar 4 `confirm()` nativos a dialogs del design system | 1 h |
| T-14 / T-15 | Detalle de recurso afectado y filtro por usuario en logs de auditoría | 5 h |
| T-16 | Unificar `NotaInterna` → `NotaSeguimiento` (eliminar sistema de notas legacy) | 4 h |
| T-17 | Refactor de E2E sin skip silencioso (assertions explícitas) | 6 h |
| T-05 / T-06 / T-09 / T-12 | Cleanup Redis `SCAN`, Vercel Auth + bypass CI, polling e2e vía Deployment API, Suspense en `/estado` | ~11,5 h |

> Cerrados en V3 (no cuentan): T-07 (cache headers de `/api/health/version`), T-10
> (pre-warming — causa raíz real era `DATABASE_URL` vacío en preview).

**Fecha propuesta:** continua, intercalada entre bloques funcionales. T-04 y T-11 tienen
valor de seguridad/robustez y conviene subirlos de prioridad.

---

## Resumen de esfuerzo

| Bloque | Foco | Estimación | Bloquea escalamiento |
|--------|------|-----------|----------------------|
| **A** | Cumplimiento OIT / privacidad | ~43 h + ISRA/PIA | **SÍ** |
| Endurecimiento inmediato | CSP, secrets, evento, saneo CUIT | ~9 h | Recomendado antes de escalar |
| B | Mobile y UX | ~22 h | No |
| C | Sistema de QA | ~20 h | No |
| D | Deuda técnica V3 | ~41,5 h | No |

**Orden recomendado post-entrega:** (1) endurecimiento inmediato + Bloque A en paralelo con
ISRA/PIA de Sergio → habilita escalar; (2) Bloque B (mobile) si el uso lo demanda; (3) D y C
de forma continua.

> Las estimaciones del backlog son de referencia y pueden variar al implementar (así lo
> aclara la "zona abierta para Gera" del análisis de Sergio).
