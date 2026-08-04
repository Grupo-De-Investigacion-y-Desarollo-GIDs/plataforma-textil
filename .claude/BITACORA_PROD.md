# Bitácora de Producción — PDT

Registro cronológico de **deploys, incidentes y aprendizajes** de producción.
Es la lectura previa de la **revisión semanal** del piloto (pedido de Sergio:
"si algo se rompe en el piloto necesito poder verlo").

- Una entrada por **deploy a prod** o por **incidente** (caída, error de runtime,
  bug reportado por un taller, alerta de uptime).
- Lo táctico/granular (cada commit) vive en `DAILY.md`. Acá va lo que importa para
  operar el piloto: qué cambió en prod, qué se rompió, cómo se resolvió, qué se
  aprendió.
- La observabilidad que alimenta esta bitácora (uptime, alertas, health-check)
  está documentada en `.claude/specs/RUNBOOK_OBSERVABILIDAD.md`.

> ⚠️ **Gate del próximo deploy a prod:** el setup externo de observabilidad
> (UptimeRobot + Telegram + confirmar notificaciones de Vercel) está **PENDIENTE**
> y es **prerrequisito del próximo deploy según Sergio**. Hacerlo **ANTES** de
> coordinar la ventana de deploy, no después. Detalle y pasos: `OBS-01` en
> `.claude/DEUDA_TECNICA.md` + `RUNBOOK_OBSERVABILIDAD.md`.

## Severidades

| Sev | Significado | Ejemplo |
|-----|-------------|---------|
| **S1 — Crítico** | App caída o función core inutilizable para todos | login roto, 500 en home, DB caída |
| **S2 — Alto** | Función importante rota para algunos | un rol no puede cotizar, email no sale |
| **S3 — Medio** | Bug visible pero con workaround / no bloqueante | desborde mobile, label mal mapeado |
| **S4 — Bajo** | Cosmético o interno | typo, log ruidoso |

## Plantilla de entrada

```
## YYYY-MM-DD — <título corto>

- **Tipo:** Deploy | Incidente
- **Severidad:** S1 | S2 | S3 | S4 (N/A para deploys sin incidente)
- **Qué pasó:** <descripción factual: qué se observó, dónde, desde cuándo>
- **Detección:** <cómo nos enteramos: alerta de uptime / reporte de taller / CI / manual>
- **Impacto:** <quién/qué se vio afectado y por cuánto tiempo>
- **Cómo se resolvió:** <acción concreta + SHA/PR/deploy si aplica>
- **Qué se aprendió / acción de seguimiento:** <prevención; link a DEUDA_TECNICA si abre deuda>
```

---

## 2026-06-13 — Deploy a PROD (release mayor: develop → main)

- **Tipo:** Deploy
- **Severidad:** N/A (sin incidente)
- **Qué pasó:** Primer release mayor a producción tras casi dos semanas. Merge
  `develop` → `main` vía PR #422 (merge commit `3333016`, preserva historia).
  Release de 105 commits; prod no se actualizaba desde el 01-jun. Deploy de Vercel
  `plataforma-textil-rrld0fe3i` → ● Ready. Cambió la landing.
- **Detección:** N/A (deploy planificado).
- **Impacto:** Producción al día con `develop`. 4 migraciones pendientes aplicadas
  en la DB durante el build (`agregar_imagen_coleccion`, `agregar_tipo_pedido`,
  `k01_rls_revoke_anon`, `u05_backfill_roles_activemode`); las otras 2
  (`multirol_y_arca`, `formulario_taller`) ya estaban en prod desde mayo →
  `migrate deploy` solo aplicó las pendientes. "All migrations successfully
  applied", sin error.
- **Cómo se resolvió:** N/A — deploy exitoso. Detalle granular en `DAILY.md`
  (sección 2026-06-13) y runbook en `.claude/specs/RUNBOOK_PROMOCION_PROD.md`.
- **Qué se aprendió / acción de seguimiento:**
  - Pendiente post-deploy (sin correr, requiere OK de Gerardo): crear cuenta de
    Sergio en prod (faltan email + rol) + su smoke, y backfill de validaciones
    D-02 con `--exclude <email-smoke>`.
  - Este deploy es el motivo de montar observabilidad **antes** del piloto: con
    105 commits acumulados, una caída habría sido difícil de diagnosticar sin
    alertas. Ver `RUNBOOK_OBSERVABILIDAD.md`.
