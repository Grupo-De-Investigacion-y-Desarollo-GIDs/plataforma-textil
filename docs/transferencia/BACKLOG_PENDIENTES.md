# BACKLOG de Pendientes — PDT (para el equipo receptor de la CIA)

> **Estado:** BORRADOR para revisión de Gerardo.
> **Fecha:** 2026-08-25.
> **Propósito:** que el equipo de la CIA lea este archivo y sepa **exactamente qué recibe y qué le queda por delante**. Es el inventario consolidado y priorizado de todo lo pendiente al cierre del ciclo de desarrollo.

## Cómo leer este documento

- **Prioridad:** `🔴 Crítico` (legal/compliance o exposición activa; bloquea escalar más allá del piloto) · `🟡 Importante` (seguridad con mitigación parcial, o bug que bloquea acción real de un usuario del piloto) · `🟢 Mejora` (UX, pulido, features nice-to-have).
- **Esfuerzo:** en horas de desarrollo cuando está estimado en el doc de origen; `doc` = entregable documental; `OIT` = decisión/entregable institucional; `human`/`infra` = setup externo que no es código.
- **Origen:** dónde está especificado (path o issue de GitHub), para que el receptor amplíe.
- Los ítems marcados **⚠️ reconciliar** requieren verificación del equipo receptor porque hay una contradicción o el dato vive fuera del repo.

## Advertencias de nomenclatura (leer antes de repartir trabajo)

1. **Colisión de etiquetas `P-0x` / `T-0x`.** "P-01..P-10" en `V4_BACKLOG.md` / `DEUDA_Y_ROADMAP.md` = **bloque de cumplimiento/ARCO**. Pero `.claude/DEUDA_TECNICA.md` tiene además "P-01/P-02" (producto) y "T-08" (helper roto) que son **trabajo distinto con el mismo token**. Este documento desambigua por origen.
2. **ISRA fuera del repo.** La ISRA autoritativa (con los riesgos N° 67/68 y posiblemente "MFA privilegiados" y "desactivación no bloquea login") está en **canal seguro separado, no en este repo**. Lo que está acá son sus compañeros in-repo (PIA, HARDENING). "MFA para usuarios privilegiados" **no tiene ninguna referencia en el repo** — reconciliar contra la ISRA de canal separado.

---

## 🔴 CRÍTICO — bloquea escalar más allá del piloto / exposición activa

### Bloque A — Cumplimiento OIT / derechos ARCO (P-04..P-10)

Origen: `.claude/specs/V4_BACKLOG.md`, `docs/handover/DEUDA_Y_ROADMAP.md`, `docs/handover/ESPECIFICACIONES_CONTINUIDAD.md`. Encabezado del bloque: *"Sin estos ítems la plataforma no puede escalar más allá del piloto."* **P-01/P-02/P-03 ya están HECHOS** (consentimiento + PIA). Lo pendiente:

| ID | Qué | Por qué importa | Esfuerzo |
|----|-----|-----------------|----------|
| **P-04** | Descargar mis datos (portabilidad): botón → JSON completo (perfil, cotizaciones, mensajes, validaciones) | Derecho ARCO; hoy solo por email manual | 6 h |
| **P-05** | Eliminar cuenta y datos: soft delete inmediato + hard delete a 30 d, doble confirmación, email con link de cancelación | Derecho ARCO | 8 h (dep. P-04) |
| **P-06** | Reporte de brechas: pantalla admin `/admin/incidentes` (fecha, tipo, datos/personas afectadas, acciones, notificación a OIT, histórico) | Obligación de notificación de brechas | 6 h |
| **P-07** | Política de retención configurable: UI admin por tipo de dato + job nocturno de borrado por antigüedad | Hoy no hay borrado automático; definición pendiente de OIT | 8 h |
| **P-08** | Sección admin "Privacidad y datos": agrupa P-04..P-07 + métricas | UI paraguas | 4 h (dep. P-04..P-07) |
| **P-09** | Documento ISRA completado (plantilla OIT) — **entregable de Sergio** | Entregable de compliance | doc |
| **P-10** | Documento PIA (plantilla OIT) — **entregable de Sergio** (borrador v1.0 ya en `docs/legal/PIA.md`) | Entregable de compliance | doc |

**Total código ≈ 43 h.** **Bloqueante externo para arrancar:** OIT debe entregar copias oficiales de **IGDS 456, IGDS 457 y el Risk Management Manual** (`DEUDA_Y_ROADMAP.md`). Camino sugerido: P-04 → P-05 → P-08 (~18 h), con P-06 y P-07 en paralelo.

### Rotación de secretos y transferencia del repo (al momento del traspaso)

| Item | Por qué importa | Origen | Esfuerzo |
|------|-----------------|--------|----------|
| **Rotar `RESEND_API_KEY`** | Clave expuesta (canal, 08-ago). ⚠️ No revocar sin redeploy: rompe emails de verificación | issue **#478** | ~1 h |
| **Purga de historia git + rotación integral + reasignar titularidad** | `INVENTARIO_ACCESOS.md` y `HALLAZGOS_SEGURIDAD.md` viven en el historial; cuentas en manos personales (riesgo 68) | `DEUDA_Y_ROADMAP.md`, `HARDENING.md §7` | ver **SPEC_TRANSFERENCIA** F1.5/F2/F3 |

> Estos dos están cubiertos operativamente por `SPEC_TRANSFERENCIA.md` (F0 y F1.5/F2/F3). Se listan acá para que el receptor los vea como deuda de seguridad, no solo como pasos del traspaso.

---

## 🟡 IMPORTANTE — seguridad con mitigación parcial, legal, o bugs que bloquean al piloto

### Seguridad / endurecimiento

| Item | Qué / por qué | Origen | Esfuerzo |
|------|---------------|--------|----------|
| **CSP + security headers** | Hoy sin CSP en `next.config.ts`. Directivas requeridas: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `HSTS max-age ≥ 31536000` | `HARDENING.md §7` (Hallazgo 4.1), `PIA §7`, `ESPECIFICACIONES_CONTINUIDAD` | ~3 h |
| **DMARC `p=none` → `quarantine`** | SPF+DKIM+DMARC ya activos en monitoreo; falta endurecer contra spoofing | `HARDENING.md §5`, `PIA §7` | bajo (config) |
| **`User.active` no bloquea login** | Un usuario desactivado todavía puede autenticarse (`auth.ts:37-58`) | `v4-etapa2-3-discovery:220` | bajo |
| **MFA para usuarios privilegiados** ⚠️ reconciliar | Nombrado en la ISRA; **sin referencia en el repo** — verificar alcance contra la ISRA de canal separado | ISRA (canal separado) | ? |
| **#353 RLS completa en 45 tablas** | Defensa en profundidad. ⚠️ El leak práctico ya está mitigado (`anon` revocado en `public.*` en prod, jun-2026); queda el ideal de RLS por tabla | issue **#353**, `HARDENING.md §2` | — |

### Legal / institucional (varias son decisión/entregable de OIT)

| Item | Qué / por qué | Origen | Esfuerzo |
|------|---------------|--------|----------|
| **Publicar textos legales revisados** ⚠️ reconciliar | Las páginas públicas de términos/privacidad servirían aún las versiones preliminares de feb-2026, que declaran derechos de supresión/portabilidad sin vía de ejercicio (P-04/P-05 no existen). Unificar además el correo de privacidad | `ESPECIFICACIONES_CONTINUIDAD:602`, #478 | bajo |
| **Fila de Cloudflare en Política §8** | Divulgación de subprocesador (exactitud legal) | issue **#478** | bajo |
| **DPA con AfipSDK (o justificación legal)** | Único de 9 proveedores sin DPA público | `PIA §7` | OIT |
| **DPA/justificación con Supabase (transferencia AR→BR)** — riesgo ISRA N° 68 | Transferencia transfronteriza de datos | `PIA §6/§8`, `POLITICA_DE_PRIVACIDAD`, `ESPECIFICACIONES_CONTINUIDAD:615` | OIT |
| **Protocolo formal de notificación de brechas** — riesgo ISRA N° 67 | Plazos, canales, responsables (distinto de la herramienta P-06) | `POLITICA_DE_PRIVACIDAD`, `ESPECIFICACIONES_CONTINUIDAD:614` | OIT |
| **Política de retención (= P-07)** | Definición institucional pendiente de OIT | `PIA §7` | OIT |

### Operación / infraestructura

| Item | Qué / por qué | Origen | Esfuerzo |
|------|---------------|--------|----------|
| **`CRON_SECRET` en Vercel (Prod + Preview)** | Sin él, el cron de gracia CUIT 60d **no corre** (falla silenciosa) | `v4-etapa2-3-discovery:195` | ~0 |
| **Email de lanzamiento de gracia (one-off, manual)** | `POST /api/cron/gracia-lanzamiento?confirmar=SI`, coordinado con Sergio al lanzar | `v4-etapa2-3-discovery:195` | manual |
| **MODO_EVENTO rollback (preview)** | Cierra el registro de preview post-evento, restaura rate limits | issue **#478**, `BITACORA_PROD` | ~0.5 h |
| **OBS-01 — observabilidad externa** | **Bloquea el próximo deploy a prod.** 3 piezas humanas: monitor UptimeRobot en `/api/health` (keyword `"db":"up"`), canal de alerta (Telegram), confirmar notificaciones de deploy-failure de Vercel. Código ya mergeado (#436) | `.claude/DEUDA_TECNICA.md:235` | human |
| **Saneo de CUITs en PROD** | Normalizar CUITs con guiones en 3 tablas; corre en el próximo gran deploy | `DEUDA_Y_ROADMAP`, `RUNBOOK_PROMOCION_PROD §7` | ~1 h |
| **DEPLOY-01 — fix de labels W-A** | Ya mergeado a develop (#427), espera el próximo deploy a prod; hoy visible en prod | `.claude/DEUDA_TECNICA.md` | viaja en el deploy |

### Bugs del piloto (issues abiertos que bloquean acciones reales)

| # | Qué | Por qué |
|---|-----|---------|
| **#447** | "Soy de federación, no me deja crear cuenta" | Bloquea alta real |
| **#368** | "Olvidé mi contraseña" no funciona / tarda mucho | Recuperación de acceso rota |
| **#369** | "Tengo CUIT y no lo reconoce" | Falla de verificación ARCA |
| **#376** | Dos CUIT se pueden registrar | Integridad de datos (CUIT duplicado) |
| **#355** | Carga de novedades que aparecen mal | Bug de contenido |
| **#394** | No existe `/admin/documentos`, borrar link | Link roto |
| **#360** | `estado/talleres` sin link directo de ingreso | Hueco de navegación |

### Deuda técnica con valor de robustez/seguridad (Bloque D — selectivo)

Origen: `DEUDA_Y_ROADMAP.md`, `V4_BACKLOG.md` bloque D. El doc recomienda subir la prioridad de **T-04** y **T-11**:

| ID | Qué | Esfuerzo |
|----|-----|----------|
| **T-04** | CI bypass token → JWT firmado | 4 h |
| **T-11** | Health check de env vars críticas | 2 h |
| **T-08 (D)** | Migrar ~57 endpoints a formato de error consistente | 10 h |

### Mobile (Bloque B) — subir prioridad si crece el uso móvil

Origen: `DEUDA_Y_ROADMAP.md`. M-01 auditoría mobile (6 h) · M-02 reactivar E2E mobile (4 h) · M-03 fixes UX mobile (12 h; parcialmente atacado en #431). **Total ~22 h.**

---

## 🟢 MEJORA — UX, pulido, features nice-to-have

### Perfil, directorio y contenido (issues del piloto)

| # / ID | Qué | Nota |
|--------|-----|------|
| **#306 / G-12** | Foto/logo de marca en el perfil | El modelo `Marca` no tiene campo de logo; los **5 logos demo ya están archivados** en `scripts/seed-evento-assets/` (`NOTA_LOGOS_MARCA.md`). Si se agrega `Marca.logoUrl`, `seed-evento-imagenes.ts` los asigna con un cambio menor (~4 h) |
| **#308** | Redes sociales en el perfil | Campo de perfil |
| **#309 / I-05** | Filtro por provincia/ciudad en el directorio | ~6 h |
| **#311 / G-13** | Cursos para marcas (Academia para marcas) | ~3 h |
| **#332** | Marca ingresa y va directo a Directorio | Flujo UX |
| **#425** | Validación sectorial del formulario W-A (taller) | Validación de producto |
| **#361** | Página feature-v4-x (preview) | Solo preview |

### Copy institucional

| # | Qué |
|---|-----|
| **#350** | Quitar banner de acompañamiento institucional |
| **#351** | Copy "Plataforma pública de OIT y UNTREF…" |
| **#352** | Actualizar niveles de formalización |
| **#365 / #366 / #367** | Tarjetas de gráficos de progreso: mostrar valor y etiqueta |

### Sistema de QA (Bloque C, ~20 h)

Q-04 rename `logAccionAdmin`→`logAccionSensible` (2 h) · Q-05 auto-asignación de issues (4 h) · Q-06 métricas de auditoría (6 h) · Q-07 auditoría en preview de cada PR (8 h). Origen: `DEUDA_Y_ROADMAP.md`.

### Deuda técnica menor (`.claude/DEUDA_TECNICA.md`)

| ID | Qué | Esfuerzo |
|----|-----|----------|
| **F-06** | `ProgressRing` desborda label ≤320px | ~30 min |
| **F-07** | Mapeo requisito→curso de Academia (depende de curaduría de Matías) | 2-4 h |
| **B-01** | Unificar 3 paths de verificación de CUIT (`arca.ts`/`afip.ts`/endpoint) | 2-3 h |
| **B-06** | Pill de modo desincronizado entre pestañas (estado correcto, cosmético) | bajo |
| **T-08 (DEUDA_TECNICA)** | `limpiarPedidoTest` NO-OP (helper llama DELETE inexistente; mitigado #439a) | bajo |
| **T-01** | Toolchain local roto en WSL `/mnt/d` (CI es el validador) | investigar |
| **P-01 (producto)** | Notificaciones multi-rol sin definir ("98 no leídas" en ambos modos) | spec |
| **CI shared-DB** | Polución potencial entre runs de CI; ideal DB por preview o tests stateless | — |

### Etapa 2 (visibilidad) y Etapa 3 — features incompletas / bloqueadas por OIT

- **Etapa 2 está CERRADA** (2.1–2.5, incl. vidriera + gracia CUIT). **Pendiente de UI** (schema/helper ya mergeados): toggles de visibilidad, botón "Ver cómo me ve el directorio", "Mi gestión productiva"; visibilidad de marca y Formación por-badge **diferidas** (JSONB las soporta sin migración). Origen: `v4-etapa2-visibilidad-schema-propuesta.md`.
- **Etapa 3 — Gobernanza estructural + Academia para marcas (V4.5):** no implementada, solo copy/referencia. Incluye el rename **COORD → GOBERNANZA** (G-16), **bloqueado por decisión de OIT**. Origen: `v4-narrativa-etapas-2-3-copy.md`.

### Diferidos por decisión (no acción salvo que cambie el contexto)

- **Sentry** — diferido deliberadamente para el piloto; montar solo si aparece un bug no reproducible en logs (`.claude/DEUDA_TECNICA.md:250`, `RUNBOOK_OPERATIVO`, #436 mergeado).
- **T-07 / G-14** — e2e de denuncia, bloqueado por la decisión institucional de desactivar denuncias.
- **GET muertos** de `/api/marcas/[id]` y `/api/talleres/[id]` — handlers de lectura sin uso; "eliminar por completo" diferido a la evaluación K-05 (`v4-k-01-auditoria-endpoints.md:376`).

---

## Notas para el equipo receptor (re-priorizar según apetito de riesgo de OIT)

1. **Verificar qué textos legales están vivos en prod** antes de cerrar cualquier ítem de privacidad — hay una contradicción documentada entre el spec P-01/02/03 (render desde `docs/legal/*.md`, hecho) y `ESPECIFICACIONES_CONTINUIDAD:602` (dice que prod sirve aún los textos de feb-2026).
2. **La ISRA autoritativa está fuera del repo.** Reconciliar contra ella: MFA privilegiados, y los riesgos N° 67 (protocolo de brechas) y N° 68 (DPA/transferencia Supabase).
3. **`docs/Otros/issues-abiertos-v4.md`** (issues #297–304 del formulario W-A) es **histórico**: esos issues ya se cerraron/implementaron y **no** figuran en la lista viva de GitHub. Tratarlo como insumo histórico, no como backlog vigente.
4. Criterio de prioridad usado: legal/compliance y exposición activa = **Crítico**; seguridad con mitigación parcial o bug que bloquea a un usuario del piloto = **Importante**; pulido/copy/feature nice-to-have = **Mejora**. Ajustar según OIT.
