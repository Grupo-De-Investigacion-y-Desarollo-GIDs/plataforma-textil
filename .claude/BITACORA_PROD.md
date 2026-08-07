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

> 🗓️ **Recordatorio post-evento (miércoles 12) — rollback `MODO_EVENTO`:** para el evento
> del martes 11 se seteó `MODO_EVENTO=on` en **Vercel → Preview (branch `develop`)** (07-ago).
> Esto (a) abre el registro en el preview y (b) habilita la página `/demo`. **El miércoles hay
> que quitarla:** `vercel env rm MODO_EVENTO preview develop --yes` (o borrarla del dashboard),
> y redeployar `develop`. Solo afecta **dev/preview**; prod nunca la tiene (el gate es no-op en
> production). Barrido de altas sintéticas del evento: logs `REGISTRO_MODO_EVENTO` (spec v4-a §2.4).

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

---

## 2026-08-07 — Deploy a PROD (v2.1.0 — 2º deploy, develop → main)

- **Tipo:** Deploy
- **Severidad:** N/A (sin incidente)
- **Qué pasó:** 2º release a prod tras `v2.0.0` (04-ago). Merge `develop` → `main`
  (`--no-ff`, dos commits: `786a783` release + `b3e4be1` gate copy), **tag `v2.1.0`**
  sobre `b3e4be1`. Contenido: consentimiento **P-01/02/03** + páginas legales `_WEB`
  depuradas + filtro `/api/talleres` por rol + gate de registro (con redirección a prod)
  + Auditorías retirada + fix `admin/usuarios` (límite/contadores) + PIA/HARDENING.
  **1 migración aditiva** `add_consentimiento` (enum `TipoConsent` + tabla `consentimientos`).
- **Detección:** N/A (deploy planificado, runbook `.claude/specs/RUNBOOK_DEPLOY_v2.1.0.md`).
- **Impacto:** prod al día con develop. Migración aplicada (tabla `consentimientos` existe).
  **`NEXTAUTH_SECRET` de Production rotado** antes del merge (Gerardo) → horneado en el build;
  **sesiones vigentes invalidadas = esperado** (todos re-login). Estado: 23 users / 13 talleres
  / 10 marcas; 11 talleres verificados + 2 EN_GRACIA (el cron reverificó/reactivó el resto).
- **Cómo se resolvió:** N/A — exitoso (Vercel dep `b3e4be18` = success). Snapshot previo
  `backup-prod-v2.1.0-20260807-150357.dump` (verificado). Verificación post-deploy: health
  `ok/up`; legales `_WEB` sin marcadores/controles/nombres-de-cookies (2 tablas); `admin/usuarios`
  Total=23; CUITs malformados = 0; auditorías/denuncias OFF.
- **Verificaciones diferidas** (necesitan cuenta/alta real, no automatizables):
  - **Login post-rotación:** lo hace **Sergio con su cuenta** (07-ago). A nivel infra el auth
    no da errores de descifrado con el secret nuevo (`session`/`csrf`/`providers` OK, `/login`
    200); falta el login humano end-to-end.
  - **Persistencia de consentimiento:** la valida el **primer alta real** (escribe 3 filas en
    `consentimientos`: TERMINOS/PRIVACIDAD/VISIBILIDAD, `version=LEGAL_VERSION`). Pampa Textil /
    Pura Sangre en camino (redirigidos al registro de producción).
- **Qué se aprendió / acción de seguimiento:**
  - **Saneo de roles (escalar `role` legacy):** 6 usuarios MARCA migrados quedaron con
    `users.role = TALLER` (causa: `migrar.ts` no seteaba el escalar → `@default(TALLER)`).
    **Cosmético** (auth resuelve por `activeMode`/`roles`; nadie perdió acceso). Saneado en prod
    el 07-ago con `UPDATE users SET role="activeMode" WHERE "activeMode" IS NOT NULL AND role<>"activeMode"`
    (**6 filas**; verificado por SELECT antes/después). Fix del script + evidencia:
    `scripts/migracion-piloto/README.md` §Post-mortem.
  - **CI y PRs con conflicto:** un PR con conflicto de merge NO dispara los workflows
    `pull_request` (GitHub no crea el merge-ref → el checkout falla). Resolver el conflicto
    (mergear base a la rama) ANTES de esperar CI. Costó dos triggers perdidos en `#465`.

---

## 2026-08-07 — Incidente: registros de Pampa Textil / Pura Sangre "perdidos"

- **Tipo:** Incidente
- **Severidad:** S3 (confusión de usuario; sin pérdida de datos ni caída)
- **Qué pasó:** dos altas (`Pampa Textil` taller, `Pura Sangre` marca, ~11:03 UTC) no
  aparecían en prod. **Diagnóstico:** se hicieron en **`dev.plataformatextil.com.ar`**
  (preview de `develop`, base DEV) y el **gate #466 las rechazó con HTTP 403**
  (`REGISTRO_RESTRINGIDO`; modo `allowlist`, `MODO_EVENTO` off, emails fuera de la allowlist).
  No se creó nada — ni en dev ni en prod. Prod **nunca** recibió esos POST.
- **Detección:** Gerardo (SQL en prod: cero filas por fecha y por nombre).
- **Impacto:** 2 personas creyeron haberse registrado y no quedaron. El link de **dev**
  circuló durante el piloto. Cero pérdida de datos (las altas nunca se materializaron).
- **Cómo se resolvió:** logs de Vercel Production confirmaron 2 `POST /api/auth/registro`
  → **403 `REGISTRO_RESTRINGIDO`**, `branch=develop`, deployment preview alias
  `dev.plataformatextil.com.ar`. Las 7 `consultas_arca` de esa mañana eran del **cron
  `gracia-cuit`** (reverificación del piloto), no de estos registros. Acciones: (a) se les
  mandó el link de **producción** `https://plataformatextil.com.ar/registro`; (b) **PR #473**
  — el 403 ahora **redirige a producción** en el copy (evita repetir la confusión).
- **Qué se aprendió / acción de seguimiento:** el gate operó **por diseño** (cerró el
  registro abierto en dev), pero el mensaje no redirigía. `dev.plataformatextil.com.ar`
  queda operativo **con** la restricción (gate + redirección) como ambiente de pruebas del
  receptor documentado; su retiro es decisión del receptor post-transferencia (ver inventario
  de accesos).
