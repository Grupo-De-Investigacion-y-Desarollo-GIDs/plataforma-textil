# Handover Package — Plataforma Digital Textil (PDT)

Paquete de entrega para **OIT / UNTREF**. Versión **1.0** — 2026-08-03.

**Empezá por el documento maestro:** [`HANDOVER_PACKAGE.md`](./HANDOVER_PACKAGE.md) — recorre
la estructura estándar de OIT (puntos a–j) y enlaza cada entregable.

## Índice

| Documento | Cubre |
|-----------|-------|
| [HANDOVER_PACKAGE.md](./HANDOVER_PACKAGE.md) | **Maestro** — estructura a–j, qué se entrega, N/A, gaps |
| [ARQUITECTURA_DEPLOY.md](./ARQUITECTURA_DEPLOY.md) | b — Vercel + Supabase + GitHub Actions |
| [RUNBOOK_OPERATIVO.md](./RUNBOOK_OPERATIVO.md) | b, d — escenarios operativos consolidados |
| [BACKUP_RESTORE.md](./BACKUP_RESTORE.md) | e — backup/restore + retención |
| [GUIA_DESARROLLO.md](./GUIA_DESARROLLO.md) | f — levantar local, tests, convenciones |
| [COBERTURA_TESTS.md](./COBERTURA_TESTS.md) | g — 55 unit + 37 e2e + CI |
| [HALLAZGOS_SEGURIDAD.md](./HALLAZGOS_SEGURIDAD.md) | g — hallazgos consolidados + estado |
| [REPORTE_LICENCIAS.md](./REPORTE_LICENCIAS.md) | h — licencias de deps + tabla SaaS |
| [INVENTARIO_ACCESOS.md](./INVENTARIO_ACCESOS.md) | d — cuentas, env vars (sin valores), DNS |
| [DEUDA_Y_ROADMAP.md](./DEUDA_Y_ROADMAP.md) | i + backlog — Bloque A y roadmap post-entrega |

Documentos relacionados fuera de esta carpeta:
- `../handover-oit-analisis-y-division.md` — análisis base y división de tareas (Sergio).
- `../../CONTRIBUTING.md`, `../../CHANGELOG.md`, `../../LICENSE` — en la raíz del repo.
- `../../.claude/specs/RUNBOOK_*.md` — runbooks fuente detallados.

## Estado de la entrega

Entrega **v1.0**: todo lo existente + gaps declarados con responsable y fecha. Ver la tabla
"Resumen de estado por punto" en el documento maestro. El único bloqueante para escalar más
allá del piloto es el **Bloque A** (cumplimiento/privacidad), que depende de las plantillas
IGDS de OIT.
