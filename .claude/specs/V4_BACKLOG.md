# V4 Backlog — Plataforma Digital Textil (PDT)

**Versión:** Borrador inicial
**Fecha:** 2026-04-28
**Contexto:** Backlog post-piloto. Recoge mejoras, deudas técnicas y nuevos requerimientos identificados durante la implementación de V3 y la operación del piloto.

---

## Bloque A — Cumplimiento OIT y privacidad de datos

Origen: plantilla ISRA + Privacy Assessment recibida de OIT (abril 2026). Sin estos specs la plataforma no puede escalar más allá del piloto.

| ID | Spec | Descripción | Estimación | Bloquea |
|----|------|-------------|------------|---------|
| P-01 | Consentimiento explícito en registro | Checkboxes obligatorios al final del registro: aceptar términos, política de privacidad, visibilidad de datos para marcas. Texto explicativo de cada uno | 4h | Cumplimiento legal |
| P-02 | Páginas públicas de términos y privacidad | Crear `/terminos-de-uso` y `/politica-de-privacidad` con contenido editable por admin. Linkeadas desde registro y footer | 3h | P-01 |
| P-03 | Notificación de propósito al recolectar datos | Pantalla previa al registro que explica qué datos se piden, para qué, y quién los va a ver. Visible cada vez que se piden datos sensibles nuevos | 4h | P-02 |
| P-04 | Derecho a descargar datos (data portability) | Botón en perfil del usuario "Descargar mis datos" → genera JSON con todo lo que la plataforma sabe de él (perfil, cotizaciones, mensajes, validaciones) | 6h | — |
| P-05 | Derecho a eliminar cuenta y datos | Botón "Eliminar mi cuenta" en perfil. Soft delete inmediato, hard delete a 30 días. Doble confirmación. Email de confirmación con link de cancelación | 8h | P-04 |
| P-06 | Sistema de reporte de breach | Pantalla admin `/admin/incidentes` para registrar breaches: fecha, tipo, datos afectados, cantidad de personas, acciones tomadas, notificación a OIT. Listado histórico | 6h | — |
| P-07 | Política de retención configurable | UI admin para configurar tiempos de retención por tipo de dato (talleres inactivos, marcas inactivas, logs, cotizaciones cerradas). Job nocturno que aplica las políticas | 8h | — |
| P-08 | Sección admin "Privacidad y datos" | Agrupar P-04, P-05, P-06, P-07 + dashboard con métricas (cuentas eliminadas mes, breaches reportados, próximas eliminaciones automáticas) | 4h | P-04..P-07 |
| P-09 | Documento ISRA completado | Llenar plantilla oficial OIT con toda la info técnica de la plataforma. Entregable, no código | (no técnico) | Auditoría OIT |
| P-10 | Documento Privacy Assessment (PIA) | Llenar plantilla PIA de OIT específica para datos personales. Entregable, no código | (no técnico) | P-09 |

**Total estimado Bloque A:** ~43h + documentación

**Dependencia externa:** Necesitamos copia oficial de IGDS 456, IGDS 457 y Risk Management Manual de OIT antes de empezar.

---

## Bloque B — Mobile y UX

Origen: durante V3 quitamos `mobile-safari` del config de Playwright porque no aportaba al piloto. Pero mobile es crítico para los talleres que usan el celular.

| ID | Spec | Descripción | Estimación |
|----|------|-------------|------------|
| M-01 | Auditoría mobile completa | Revisar las 30+ pantallas en breakpoints 320px, 375px, 768px. Listar issues | 6h |
| M-02 | Reactivar tests E2E mobile | Volver a agregar `mobile-safari` y `mobile-chrome` al `playwright.config.ts`. Instalar en CI. Ajustar tests existentes | 4h |
| M-03 | Mejoras de UX mobile | Aplicar fixes detectados en M-01 | 12h |

**Total estimado Bloque B:** ~22h

---

## Bloque C — Mejoras al sistema de QA

Origen: aprendizajes durante implementación V3.

| ID | Spec | Descripción | Estimación |
|----|------|-------------|------------|
| Q-04 | Renombrar `logAccionAdmin` a `logAccionSensible` | Aclaración semántica: el helper también lo usan ESTADO y CONTENIDO post-D-01, no solo ADMIN | 2h |
| Q-05 | Auto-asignación de issues por verificador | Cuando se reporta un issue desde el QA HTML, asignar automáticamente al verificador correspondiente (Sergio para `verificador: qa`, dev para `verificador: dev`) | 4h |
| Q-06 | Métricas de auditoría en index | Agregar al panel global del index: tiempo promedio de resolución de issues, top 5 QAs con más issues abiertos, gráfico de tendencia | 6h |
| Q-07 | Auditoría en preview de cada PR | Cada Pull Request genera un deploy preview y publica los QAs HTML actualizados con esa versión. Permite auditar antes del merge | 8h |

**Total estimado Bloque C:** ~20h

---

## Bloque D — Deuda técnica de V3

Origen: decisiones tomadas durante V3 que conviene revisar.

| ID | Spec | Descripción | Estimación |
|----|------|-------------|------------|
| T-04 | Migrar bypass token a JWT firmado | El `CI_BYPASS_TOKEN` actual es un secreto compartido. Migrar a JWT firmado con clave pública/privada para que no requiera env var en runtime | 4h |
| T-05 | Cambiar `redis.keys()` a `redis.scan()` en cleanup | El helper de cleanup de tests usa `KEYS` que es peligroso en Redis con DBs grandes. Migrar a `SCAN` cuando la DB de tests crezca | 2h |
| T-06 | Reactivar Vercel Authentication con bypass para CI | Hoy desactivamos Vercel Auth porque bloqueaba el CI. Reactivarlo con un bypass token específico para tener una capa más de protección | 4h |
| T-07 | Endpoint `/api/health/version` con cache headers explícitos | Confirmar que el endpoint usado por el polling del CI tiene `Cache-Control: no-store` correctamente configurado | 1h |

**Total estimado Bloque D:** ~11h

---

## Bloque E — Integraciones externas adicionales

Origen: pedidos durante el piloto.

| ID | Spec | Descripción | Estimación |
|----|------|-------------|------------|
| I-02 | Integración con AFIP/ARCA Padrón A5 | Verificar adicional contra base de datos AFIP de actividad económica (no solo CUIT existe, sino que está activo en rubro textil) | 8h |
| I-03 | Integración con MercadoPago para pagos | Permitir que talleres cobren a marcas vía la plataforma. Comisión configurable | 16h |
| I-04 | Integración con Andreani/Correo Argentino | Tracking de envíos de prendas entre taller y marca | 12h |

**Total estimado Bloque E:** ~36h (depende de prioridades del piloto)

---

## Bloque F — Internacionalización

Origen: posible escalamiento a otros países (Uruguay, Paraguay, Bolivia).

| ID | Spec | Descripción | Estimación |
|----|------|-------------|------------|
| L-01 | i18n completo (español como default) | Refactorizar todas las strings hardcodeadas a archivos de traducción. Soportar es-AR, es-UY, es-PY, es-BO | 16h |
| L-02 | Soporte multi-país (configuración por país) | Cada país tiene su propio AFIP/CUIT, monedas, formatos de fecha, etc. Configuración por instancia | 12h |
| L-03 | Multi-tenant (varios países en una instancia) | Más ambicioso: una sola instancia sirve a varios países, cada uno con sus datos aislados | 24h |

**Total estimado Bloque F:** ~52h (solo si se escala internacionalmente)

---

## Bloque G — Mejoras del piloto (post-feedback)

Origen: cosas que vamos a aprender durante el piloto. **Este bloque está vacío hoy y se llena con feedback real.**

| ID | Spec | Descripción | Estimación |
|----|------|-------------|------------|
| G-01 | Boton filtro "Ver pendientes" en dashboard ESTADO | Agregar boton `data-filter="con-pendientes"` en dashboard ESTADO que linkee a `/estado/talleres?pendientes=con`. Hoy la ruta de filtro existe pero no hay acceso directo desde el dashboard | 1h |
| (TBD) | (Pendiente de feedback de talleres) | | |
| (TBD) | (Pendiente de feedback de marcas) | | |
| (TBD) | (Pendiente de feedback de OIT) | | |
| (TBD) | (Pendiente de feedback de Sergio sobre auditorías) | | |

---

## Resumen ejecutivo de V4

| Bloque | Specs | Estimación | Prioridad |
|--------|-------|------------|-----------|
| A — Cumplimiento OIT | 10 specs | 43h + docs | Alta (bloquea escalamiento) |
| B — Mobile y UX | 3 specs | 22h | Alta (talleres usan celular) |
| C — Mejoras de QA | 4 specs | 20h | Media |
| D — Deuda técnica V3 | 4 specs | 11h | Baja |
| E — Integraciones | 3 specs | 36h | Variable según piloto |
| F — Internacionalización | 3 specs | 52h | Solo si se escala |
| G — Feedback del piloto | TBD | TBD | Variable |

**Total estimado V4 (sin Bloque G):** ~184h ≈ 4-5 semanas de trabajo

---

## Decisiones pendientes para arrancar V4

1. ¿Cuándo arranca V4? Propuesta: 2 semanas después de iniciado el piloto, una vez que veamos qué pide el feedback (Bloque G)
2. ¿OIT pide ISRA antes del piloto o puede ir después? Definir prioridad de Bloque A
3. ¿Hay presupuesto para integraciones de pago/envíos (Bloque E)? Si no, se descarta
4. ¿La idea de escalar a otros países es real? Si no, descartar Bloque F

---

## Próximos pasos para este backlog

1. **Esperar respuesta de OIT** sobre IGDS 456/457, plazos del ISRA, alcance del PIA
2. **Recolectar feedback del piloto** durante mayo (Bloque G)
3. **Validar prioridades con UNTREF** (la contraparte académica del proyecto)
4. **Refinar specs prioritarios** con el mismo formato de V3 (7 secciones obligatorias) cuando se acerque la implementación
5. **Decidir orden de implementación** una vez confirmadas las prioridades

---

## Notas

- Este backlog NO es definitivo. Es un punto de partida basado en lo que sabemos hoy.
- Los specs no están escritos todavía, solo identificados. Cuando V4 arranque, cada uno se desarrolla con la misma rigurosidad de V3.
- Los Bloques no se implementan en orden alfabético: el orden lo determina la prioridad y dependencias.
