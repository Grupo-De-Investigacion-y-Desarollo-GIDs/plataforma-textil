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
| ~~T-07~~ | ~~Endpoint `/api/health/version` con cache headers explícitos~~ | ~~Cerrado en V3 (2026-05-04): verificado que devuelve `Cache-Control: max-age=0, must-revalidate` y `x-vercel-cache: MISS`. El problema de E2E no era cache sino timeout insuficiente (5 min) + fallo silencioso. Resuelto con Opción C: timeout a 10 min + exit 1 explícito + `ignoreCommand` para gh-pages~~ | ~~1h~~ |
| T-08 | Migrar ~57 endpoints restantes al formato de error consistente | Q-03 migró 11 endpoints críticos al formato `{ error: { code, message, digest } }` con `apiHandler`. Quedan ~57 endpoints con formato legacy `{ error: "string" }`. Incluye migrar los ~18 frontends que consumen esos endpoints para usar `getErrorMessage()` | 10h |
| T-09 | Migrar polling E2E a Vercel Deployment API | Si el volumen crece y los deploys tardan más, reemplazar el polling de `/api/health/version` por consulta directa a `api.vercel.com/v6/deployments` buscando SHA + state=READY. Requiere VERCEL_TOKEN como GitHub secret | 3h |
| T-10 | Pre-warming continuo de funciones críticas | La causa raíz de los 17 fixme era cold start + streaming SSR (no latencia de red, ni región de función, ni pooling — `regions: ["gru1"]` ya aplicaba a preview, y PgBouncer ya estaba activo). Solución V3: warm-up de 2 pasadas en E2E workflow antes de correr tests. V4 puede investigar pre-warming continuo (cron en producción, warm-up en CI para preview) si el problema reaparece | 3h |

**Total estimado Bloque D:** ~23h (T-07 cerrado, T-09 nuevo)

---

## Bloque E — Integraciones externas adicionales

Origen: pedidos durante el piloto.

| ID | Spec | Descripción | Estimación |
|----|------|-------------|------------|
| ~~I-02~~ | ~~Integración con AFIP/ARCA Padrón A5~~ | ~~Resuelto en INT-01 (v3-arca-completo): consultarPadron() verifica existencia, estado y actividades~~ | ~~8h~~ |
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
| G-02 | Control granular de credenciales exhibidas | Permitir al taller decidir que credenciales verificadas exhibir en su perfil publico (control granular). Hoy (v3) todas las credenciales COMPLETADO se muestran automaticamente. Si el feedback del piloto lo justifica, agregar toggle por credencial en /taller/perfil/editar | 4h |
| (TBD) | (Pendiente de feedback de talleres) | | |
| (TBD) | (Pendiente de feedback de marcas) | | |
| (TBD) | (Pendiente de feedback de OIT) | | |
| (TBD) | (Pendiente de feedback de Sergio sobre auditorías) | | |

---

## Bloque H — Mercado y transparencia

**Justificación arquitectónica:** La PDT hoy resuelve transacciones individuales (marca pide → taller cotiza → marca acepta) pero no expone la dinámica de mercado agregado. A diferencia de un marketplace puro tipo MercadoLibre, la PDT tiene un componente institucional (ESTADO/OIT) que necesita ver el mercado como sistema, no solo como suma de transacciones. Y a diferencia de ML, la PDT puede agregar capas de indicadores sociales (precio justo, impacto laboral, concentración geográfica) que un marketplace privado no tiene incentivo para mostrar.

Este bloque transforma la PDT de un sistema transaccional a una plataforma con inteligencia de mercado diferenciada por rol.

| ID | Spec | Descripción | Estimación | Dependencias |
|----|------|-------------|------------|--------------|
| H-01 | Vidriera pública `/mercado` | Página pública (sin login) con datos agregados anonimizados: volumen de pedidos por tipo de prenda, rango de precios por proceso, distribución geográfica de talleres, tendencias mensuales. Sin datos individuales de talleres ni marcas | 12h | Volumen real del piloto |
| H-02 | Inteligencia de mercado para TALLER | Dashboard con: precios sugeridos basados en cotizaciones aceptadas de pares, demanda compatible con sus procesos/capacidad, comparación de su nivel vs promedio del mercado, alertas de oportunidades nuevas | 10h | H-01 |
| H-03 | Inteligencia de mercado para MARCA | Dashboard con: precios de mercado por tipo de prenda/proceso, disponibilidad actual de talleres por zona, tiempos promedio de entrega, benchmark de sus pedidos vs mercado | 10h | H-01 |
| H-04 | Analítica institucional para ESTADO/OIT | Panel con: tendencias de formalización, concentración de mercado (índice Herfindahl), distribución territorial de actividad, evolución de niveles, flujo de pedidos/cotizaciones por período. Exportable a PDF/CSV para informes OIT | 12h | H-01 |
| H-05 | Indicadores de mercado justo | Precio mínimo de referencia social calculado por tipo de prenda/proceso. Alertas visibles cuando una cotización está significativamente por debajo del referencial. Banner informativo (no bloqueante) tanto para taller que cotiza bajo como para marca que acepta precio bajo | 8h | H-01, H-02 |
| H-06 | Alertas de concentración y territorio | Detección automática de desbalances: una marca concentra >X% del volumen, una zona tiene exceso/déficit de talleres, un proceso tiene oferta insuficiente. Alertas para ESTADO/OIT, no para actores individuales | 6h | H-04 |
| H-07 | Métricas de impacto laboral | Indicadores: horas de trabajo formal estimadas generadas por la plataforma, tasa de formalización por sector/zona, correlación entre nivel del taller y volumen de pedidos. Para informes OIT y vidriera pública | 8h | H-04 |

**Total estimado Bloque H:** ~66h

**Dependencia crítica:** Este bloque depende del piloto generando volumen real de transacciones (mayo 2026). Sin datos reales, los indicadores no tienen sentido. **Implementación recomendada:** junio post-piloto, priorizando H-01 y H-04 primero (los más demandados por OIT).

**Decisión de producto pendiente:** ver nota al final del documento sobre el modelo de la PDT.

---

## Bloque I — Servicios y catálogo de talleres

**Justificación:** Hoy los talleres tienen perfil + portfolio + datos de capacidad, pero no pueden mostrar activamente qué servicios ofrecen ni publicar disponibilidad. La PDT funciona como flujo reactivo (marca pide → taller cotiza) pero le falta el flujo proactivo (taller ofrece → marca descubre). Este bloque agrega una capa de marketplace activo donde el taller puede "vender" su capacidad, similar al modelo perfil + tienda de plataformas como Etsy o LinkedIn Services.

| ID | Spec | Descripción | Estimación | Dependencias |
|----|------|-------------|------------|--------------|
| I-01 | Servicios destacados del taller | Cada taller puede definir 3-5 servicios destacados con: nombre, descripción, rango de precio orientativo, tiempo estimado, fotos de ejemplo. Visibles en su perfil público y en el directorio | 8h | — |
| I-02 | Catálogo organizado por categoría | Vista `/explorar-servicios` organizada por categoría de proceso (corte, confección, estampado, etc.). Cada entrada muestra talleres que ofrecen ese servicio con sus datos resumidos | 12h | I-01 |
| I-03 | Sistema de publicaciones/anuncios | Talleres pueden publicar: disponibilidad actual, novedades, promociones temporales. Feed cronológico visible en su perfil y opcionalmente en la vidriera pública. Duración configurable (7/15/30 días) | 10h | I-01 |
| I-04 | Integración con vidriera pública | Los servicios y publicaciones de talleres alimentan la vidriera `/mercado` del Bloque H: servicios más demandados, talleres con disponibilidad inmediata, novedades del sector | 6h | H-01, I-01, I-03 |
| I-05 | Filtros avanzados en exploración | Agregar filtros en `/directorio` (o nueva ruta `/explorar-talleres`): por servicio ofrecido, por disponibilidad actual, por rango de precio, por zona + radio | 6h | I-01, I-02 |
| I-06 | Moderación básica + límites antispam | Revisión de publicaciones (auto-aprobación para PLATA+, moderación para BRONCE). Límites de frecuencia (máx N publicaciones/semana). Reporte de contenido inapropiado | 8h | I-03 |
| I-07 | Recomendaciones de talleres para marcas | Sistema de matching: basado en los pedidos anteriores de la marca, sugerir talleres compatibles por proceso, zona, nivel, precio histórico. Widget en dashboard de marca | 12h | I-01, I-02, H-01 |

**Total estimado Bloque I:** ~62h

**Decisiones pendientes a discutir con OIT/UNTREF antes de implementar:**

1. **Modelo de precio:** ¿precio fijo publicado, capacidad para cotizar, o híbrido? (impacta I-01 y I-05)
2. **Nivel mínimo para publicar:** ¿BRONCE puede publicar servicios o solo PLATA+? (impacta I-01 y I-06)
3. **Moderación:** ¿auto-aprobación para todos o solo niveles altos? (impacta I-06)
4. **Visibilidad pública:** ¿los servicios son visibles sin login o solo para marcas registradas? (impacta I-02 y I-04)
5. **Antispam:** ¿cuántas publicaciones por semana? ¿cuántos servicios destacados? (impacta I-06)
6. **Gamificación:** ¿publicar con calidad suma puntos al nivel del taller? (impacta sistema de niveles)

**Dependencia crítica:** Este bloque depende del piloto para definir bien la implementación. **Recomendado post-piloto (junio o más adelante), después del Bloque H** que provee la infraestructura de mercado.

---

## Resumen ejecutivo de V4

| Bloque | Specs | Estimación | Prioridad |
|--------|-------|------------|-----------|
| A — Cumplimiento OIT | 10 specs | 43h + docs | Alta (bloquea escalamiento) |
| B — Mobile y UX | 3 specs | 22h | Alta (talleres usan celular) |
| C — Mejoras de QA | 4 specs | 20h | Media |
| D — Deuda técnica V3 | 5 specs | 21h | Baja |
| E — Integraciones | 3 specs | 36h | Variable según piloto |
| F — Internacionalización | 3 specs | 52h | Solo si se escala |
| G — Feedback del piloto | TBD | TBD | Variable |
| H — Mercado y transparencia | 7 specs | 66h | Post-piloto (junio) |
| I — Servicios y catálogo | 7 specs | 62h | Post-piloto (después de H) |

**Total estimado V4 (sin Bloque G):** ~322h ≈ 8-9 semanas de trabajo

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

---

## Nota de diseño de producto — Modelo de la PDT

**Los Bloques H e I plantean una pregunta de producto que debe resolver OIT/UNTREF:**

> ¿La PDT es un sistema de gestión de formalización que también permite hacer pedidos?
> ¿O es un marketplace textil que también ayuda a formalizar?

- **Modelo institucional (ESTADO céntrico):** La PDT es una herramienta de política pública. El flujo comercial existe para incentivar la formalización, pero el centro es la relación taller-Estado. Los Bloques H e I son herramientas de transparencia e información, no de competencia comercial.
- **Modelo de mercado (oferta-demanda céntrico):** La PDT es un marketplace con capa institucional. El centro es la transacción taller-marca, y la formalización es un requisito de entrada que genera confianza. Los Bloques H e I son features competitivas de marketplace.

Las decisiones de implementación cambian según el modelo: moderación, visibilidad, gamificación, indicadores de precio justo, todo depende de qué tipo de plataforma queremos que sea.

**Recomendación:** definir esto durante el piloto (mayo 2026), antes de implementar H e I. La respuesta probablemente es un híbrido, pero el balance importa para las decisiones de diseño.
