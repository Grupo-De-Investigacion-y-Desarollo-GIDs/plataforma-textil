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
| T-10 | ~~Pre-warming continuo de funciones críticas~~ | ~~Cerrado en V3 (2026-05-04): causa raíz real era DATABASE_URL vacío en preview (I-01 incompleto), no cold start. Solución: setear env vars + loading.tsx per-page + warm-up en E2E + test timeout 60s~~ | ~~3h~~ |
| T-11 | Health check de variables de entorno críticas | Validar al inicio de la app que DATABASE_URL, DIRECT_URL, NEXTAUTH_SECRET, RESEND_API_KEY y otras vars críticas no estén vacías/ausentes. Mostrar error claro en server startup y/o `/api/health/version`. Lección aprendida: I-01 dejó vars vacías 8 días sin detectarse, rompiendo toda la preview silenciosamente | 2h |
| T-12 | estado/page Suspense refactor | Splitear las 15 queries de `prisma.$transaction` en `/estado/page.tsx` a child components async con Suspense boundaries. Excluido de UX V3 por complejidad: romper la transacción requiere verificar atomicidad de lectura. **Nota V3 (2026-05-05):** Diagnóstico de ESTADO login lento resuelto con índice compuesto `LogActividad[userId, timestamp]` + warm-up de `/estado` en CI. Causa raíz era query `talleresInactivos` haciendo table scan en logs. T-12 sigue válido para reducir bundle inicial pero NO es bloqueante. | 2.5h |
| T-13 | Migrar 4 confirm() nativos a dialogs custom | Reemplazar `confirm()` en admin/colecciones/[id] (x2), marca/cancelar-pedido, y marca/publicar-pedido con modal de confirmación consistente con el design system | 1h |
| T-14 | Mejorar detalle de logs de auditoría | La tabla de logs muestra la acción (ej: `VALIDACION_APROBADA`) pero no indica sobre qué usuario/recurso se realizó. Agregar columna o tooltip con detalle del recurso afectado. Origen: QA issue #144 | 3h |
| T-15 | Filtro de usuario asociado en logs | Agregar filtro por usuario afectado (no solo el que ejecuta la acción) en `/admin/logs`. Origen: QA issue #145 | 2h |

| T-16 | Migrar NotaInterna → NotaSeguimiento | 2 sistemas de notas coexisten en admin talleres/marcas detail (legacy NotaInterna + T-03 NotaSeguimiento). Decidir cual es canonical, migrar datos del legacy, eliminar el deprecated. Origen: T-03 audit | 4h |
| T-17 | Refactor E2E tests sin skip silencioso | Tests E2E usan try/catch { test.skip() } que enmascara fallos reales. Reemplazar por expect + assertions que fallen explicitamente. Incluye fix de test flaky `ux-mejoras.spec.ts:34` (EmptyState breadcrumb timeout — falla intermitente confirmada 1/2 runs). Origen: T-03 audit | 6h |

**Total estimado Bloque D:** ~41.5h (T-07/T-10 cerrados, T-16/T-17 nuevos)

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

## Bloque J — Rol CONTENIDO completo

Origen: durante V3 se identifico que el rol CONTENIDO esta parcialmente implementado. Tiene layout propio y 4 paginas pero con links rotos a `/admin/colecciones/`, sin sidebar correcto, sin notificaciones propias. En V3 se oculto de la UI administrativa para evitar que se vea roto en el piloto.

**Workaround V3:** ADMIN carga contenido directamente. Si OIT/UNTREF pregunta por el rol, esta reservado para V4.

### Analisis funcional pendiente (antes de implementar)

| # | Pregunta | Respuesta |
|---|----------|-----------|
| 1 | Que hace exactamente un contenidista en la PDT? | |
| 2 | Tiene rol de moderacion o solo carga de cursos? | |
| 3 | OIT/UNTREF carga contenido o es un rol externo (ej: INTI, universidades)? | |
| 4 | Que relacion tiene con ADMIN: jerarquica (subordinado) o complementaria (par)? | |
| 5 | Necesita ver observaciones de campo (T-02)? | |
| 6 | Necesita notificaciones propias o comparte con ADMIN? | |
| 7 | Puede editar/eliminar colecciones que creo otro usuario? | |

### Implementacion

| ID | Spec | Descripcion | Estimacion |
|----|------|-------------|------------|
| J-01 | Spec funcional CONTENIDO | Definir flujos completos basados en respuestas del analisis | 3h |
| J-02 | Sidebar propio | No compartir con admin — sidebar dedicado con items relevantes | 2h |
| J-03 | Rutas propias /contenido/** | Resolver links rotos: /admin/colecciones/ → /contenido/colecciones/nueva, /contenido/colecciones/[id], /contenido/colecciones/[id]/videos | 4h |
| J-04 | Permisos granulares | Revisar middleware + APIs para que CONTENIDO solo acceda a lo que necesita | 2h |
| J-05 | Notificaciones y panel propio | Dashboard basico con metricas de academia + acceso a notificaciones | 3h |

**Total estimado Bloque J:** 14h (incluye analisis funcional)

**Prioridad V4:** Media (no bloquea piloto)

---

## Bloque G — Mejoras del piloto (post-feedback)

Origen: cosas que vamos a aprender durante el piloto. **Este bloque está vacío hoy y se llena con feedback real.**

| ID | Spec | Descripción | Estimación |
|----|------|-------------|------------|
| G-01 | Boton filtro "Ver pendientes" en dashboard ESTADO | Agregar boton `data-filter="con-pendientes"` en dashboard ESTADO que linkee a `/estado/talleres?pendientes=con`. Hoy la ruta de filtro existe pero no hay acceso directo desde el dashboard | 1h |
| G-02 | Control granular de credenciales exhibidas | Permitir al taller decidir que credenciales verificadas exhibir en su perfil publico (control granular). Hoy (v3) todas las credenciales COMPLETADO se muestran automaticamente. Si el feedback del piloto lo justifica, agregar toggle por credencial en /taller/perfil/editar | 4h |
| G-03 | Opción "No tengo áreas separadas" en evaluación de infraestructura | En `/taller/perfil/completar`, la pregunta "¿Tenés áreas separadas para cada proceso?" no ofrece opción negativa. Agregar "No tengo áreas separadas" como opción válida. Origen: QA issue #208 | 1h |
| G-04 | Explicación contextual del SAM en onboarding | En `/taller/perfil/completar` se menciona "qué es el SAM" sin brindar detalle ni contexto. Agregar descripción breve del Sistema de Auto-evaluación y Mejora al inicio del proceso. Origen: QA issues #209, #210 | 2h |
| G-05 | Pedidos: campos adicionales (talles, terminaciones, segmento) | Ampliar formulario de publicar pedido: talles y cantidad por talle, unidades, terminaciones, segmento (masculino/femenino/unisex). Requiere analisis funcional con marcas reales. Origen: feedback piloto issue #213 | 6h |
| G-06 | Pedidos: seccion "Molderia y aspectos tecnicos" | Agregar seccion para subir moldes, fichas tecnicas, o indicar si el taller debe generarlos. Definir formato: texto rico, archivos adjuntos, checklist. Origen: feedback piloto issue #214 | 4h |
| (TBD) | (Pendiente de mas feedback de marcas/talleres) | | |
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

## Bloque K — Seguridad

Origen: Hallazgo critico de auditoria QA INT-00 (2026-05-06) — `/api/talleres` expuesto sin auth, leakea nivel (privado) + PII (email, phone). Tambien `/api/pedidos/[id]/ordenes` leakea nivel a marcas.

| ID | Spec | Descripcion | Estimacion |
|----|------|-------------|------------|
| K-01 | Auditoria de seguridad de endpoints | Auditar TODOS los endpoints del proyecto (~75 rutas en /api). Verificar auth check + role check en cada uno. Documentar: endpoint, metodo, auth requerida, roles permitidos, datos expuestos | 4h |
| K-02 | Test pattern reutilizable de auth | Crear helper de test que para cada endpoint verifique: 401 sin auth, 403 con rol incorrecto, 200 con rol correcto. Aplicar a los ~75 endpoints existentes | 6h |
| K-03 | Fix inmediato /api/talleres | Agregar requiereRolApi, usar select en vez de include para excluir nivel/PII, remover parametro ?nivel | 1h |
| K-04 | Fix /api/pedidos/[id]/ordenes nivel leak | Remover `nivel: true` del Prisma select en la query de ordenes | 0.5h |
| K-05 | Revisitar endpoints con datos sensibles | Post-auditoria K-01: aplicar select explicito (no include) en todos los endpoints que retornan datos de taller/user para evitar leaks futuros por campos nuevos en schema | 4h |

**Total estimado Bloque K:** ~15.5h

**Prioridad:** Alta — K-03 y K-04 son fixes pre-piloto. K-01/K-02/K-05 pueden ir post-piloto pero antes de produccion abierta.

---

## Bloque M — Gobernanza y validacion interdisciplinaria

Origen: Hallazgo Eje 6 sociologo en QA T-02 (2026-05-06) — riesgo de extractivismo de conocimiento sin consentimiento del taller observado. Tambien faltan categorias de genero (eje transversal OIT).

| ID | Spec | Descripcion | Estimacion |
|----|------|-------------|------------|
| M-01 | Protocolo etico de observaciones de campo | Disenar protocolo de uso etico: se le comunica al taller que esta siendo observado? Tienen derecho a ver/objetar observaciones sobre ellos? Quien accede (solo ESTADO/ADMIN o tambien el taller observado)? Hay anonimizacion en reportes? Coordinar con OIT/UNTREF — decision institucional, no solo tecnica | 4h analisis + impl segun decision |
| M-02 | Tipo de observacion GENERO | Agregar GENERO al enum TipoObservacion + tag "genero" en sugeridos. Eje transversal de OIT. En sector textil argentino la mayoria de trabajadores/as son mujeres — las observaciones de campo deben poder capturar esta dimension | 1h |
| M-03 | Guia para el equipo observador | Documento con lineamientos: cuando usar cada tipo de observacion, como registrar contexto cultural sin simplificar, uso de citas textuales, etica de observacion participante. Entregable para capacitacion pre-piloto | 2h (doc, no codigo) |

**Total estimado Bloque M:** ~7h + decision institucional OIT/UNTREF

**Prioridad:** Media-alta — M-01 es decision institucional que deberia arrancar antes o durante el piloto. M-02 y M-03 son rapidos post-decision.

---

## Bloque L — Documentacion y operaciones

Origen: lecciones aprendidas durante QA V3 y operacion del piloto.

| ID | Spec | Descripcion | Estimacion |
|----|------|-------------|------------|
| L-01 | Verificacion correcta de env vars Vercel | Documentar en `docs/operaciones/verificar-env-vars.md` como chequear variables `sensitive` en Vercel. Actualizar Vercel CLI a version actual. Regla: NUNCA confiar en `vercel env pull` para variables sensitive — usar dashboard o API con `value_present` check. Origen: falso diagnostico INT-02, CLI v50.38.3 mostraba variables vacias cuando en realidad tenian valor | 0.5h |

**Total estimado Bloque L:** ~0.5h

---

## Bloque N — Hallazgos interdisciplinarios Fase 2 (consolidado Eje 6)

Origen: auditoria QA Fase 2 (2026-05-06/07). 69 items de primera pasada Eje 6 a traves de 8 QAs, con 4 perfiles: politologo, economista, sociologo, contador. Los hallazgos transversales se consolidan aqui; los accionables se enlazan a otros bloques.

### Politologo — Hallazgos transversales

| Hallazgo | QA origen | Accion V4 | Bloque enlazado |
|----------|-----------|-----------|-----------------|
| Falta tipo GENERO en observaciones — eje transversal OIT | T-02 | Agregar enum + tag + indicadores | M-02 |
| Separacion ADMIN/ESTADO refleja bien la realidad institucional argentina | D-01 | Mantener — validado | — |
| Funnel onboarding falta etapa FORMALIZADO (outcome OIT) | T-03 | Agregar etapa post-piloto | G (feedback) |
| Demanda insatisfecha como dato accionable: framing correcto | F-05 | Mantener — validado | — |
| Talleres cerca: riesgo de lista negra informal si ESTADO no es sensible | F-05 | Capacitar equipo | P-01 |
| Reporte piloto 8 hojas compatible con formato OIT, falta Metodologia | F-04 | Agregar hoja Metodologia + Glosario | G (feedback) |

### Economista — Hallazgos transversales

| Hallazgo | QA origen | Accion V4 | Bloque enlazado |
|----------|-----------|-----------|-----------------|
| Credenciales granulares > etiqueta unica para evaluacion comercial | INT-00 | Mantener — validado | — |
| Barrera del CUIT es significativa pero justificada | INT-00 | Documentar trade-off | O-01 |
| Tasa aceptacion insuficiente sola — faltan monto promedio, tendencias | F-04 | Agregar metricas economicas | H-01, H-02 |
| Discrepancia empleados tiene riesgo de malinterpretacion | F-04 | Agregar nota al pie en export | G (feedback) |
| Thresholds recomendaciones conservadores para piloto, bajar post-piloto | F-05 | Hacer configurables | G (feedback) |
| Sesgo del observador via sentimiento — mitigado por contenido libre | T-02 | Documentar en guia | P-01 |
| Funnel mide adopcion pero no impacto economico | T-03 | Combinar con metricas outcome | H-04 |

### Sociologo — Hallazgos transversales

| Hallazgo | QA origen | Accion V4 | Bloque enlazado |
|----------|-----------|-----------|-----------------|
| Riesgo de extractivismo de conocimiento sin consentimiento | T-02 | Protocolo etico | O-02, M-01 |
| Tono constructivo bien calibrado en banners y mensajes | INT-00 | Mantener — validado | — |
| Separacion de registros linguisticos taller vs ESTADO: correcta | INT-00, D-01 | Mantener — validado | — |
| Gamificacion checklist apropiada con reservas (no nativos digitales) | T-03 | Testear en primera semana piloto | P-01 |
| Talleres NO ven demanda que no pudieron cubrir — correcto para piloto | F-05 | V4: notificacion constructiva cuando puedan actuar | G (feedback) |
| Protocolo seguimiento puede sentirse como vigilancia | T-03 | Capacitar equipo: "facilitador, no inspector" | P-01 |

### Contador — Hallazgos transversales

| Hallazgo | QA origen | Accion V4 | Bloque enlazado |
|----------|-----------|-----------|-----------------|
| PDF de orden: CUIT suficiente, podria faltar tipo inscripcion | INT-00 | Nice-to-have, no bloqueante | G (feedback) |
| Credenciales individuales cubren 80% evaluacion riesgo comercial | INT-00 | Mantener — validado | — |
| Guia taller falta explicar monotributo vs RI, categorias textil | T-03 | Agregar FAQ fiscal | P-02 |
| Falta IIBB provincial, formulario 960 en tipos de documento | D-01 | ESTADO puede agregar via /estado/documentos | — |
| Exportes faltan facturacion estimada y tipo comprobante | F-04 | V4 campo "facturacion estimada" en perfil taller | H-01 |

---

## Bloque O — Decisiones institucionales V4

Origen: puntos que surgieron de la auditoria Fase 2 que requieren decision de negocio/gobernanza, no solo tecnica. Se discuten al inicio de V4. Referencia completa: `docs/v4-input-institucional.md`.

| ID | Decision | Contexto | Impacto tecnico |
|----|----------|----------|-----------------|
| O-01 | Barrera del CUIT: documentar trade-off formalizacion vs inclusion | INT-00 economista: talleres informales excluidos. Justificado pero debe documentarse | Ninguno (decision de producto) |
| O-02 | Protocolo etico de observaciones de campo | T-02 sociologo: consentimiento, transparencia, anonimizacion | M-01 (vista taller o filtro exportes) |
| O-03 | Dominio propio para emails transaccionales | INT-02: onboarding@resend.dev limita deliverability | ~1h tecnica + decision de dominio |
| O-04 | Corpus real para RAG (asistente IA) | Implementado con placeholder, necesita contenido real | Carga de documentos |
| O-05 | Definicion funcional rol CONTENIDO | Parcialmente implementado, oculto en V3 | Bloque J completo |
| O-06 | Genero como eje transversal | T-02 politologo: indicadores + tipo observacion | M-02 (~1h) + indicadores en exportes |
| O-07 | Modelo de la PDT: institucional vs marketplace | Nota en V4_BACKLOG: impacta Bloques H e I | Decisiones de diseno en H e I |

**Prioridad:** Discutir O-01 a O-07 en la primera reunion de planificacion V4. No requieren codigo inmediato.

---

## Bloque P — Capacitacion y protocolos operativos

Origen: hallazgos Eje 6 que no son codigo sino preparacion del equipo humano para el piloto y V4.

| ID | Spec | Descripcion | Estimacion |
|----|------|-------------|------------|
| P-01 | Guia del equipo de campo | Lineamientos para observaciones: cuando usar cada tipo, como registrar contexto cultural, citas textuales, etica de observacion, sentimiento como primera impresion no como veredicto. "Sos facilitador, no inspector." Incluye: no crear listas negras con talleres cerca, limitar recordatorios a 1/semana | 3h (doc) |
| P-02 | FAQ fiscal para talleres | Seccion en la guia de onboarding: diferencia monotributo/RI, categorias textil, que pasa con CUIL vs CUIT, IIBB por provincia, links utiles AFIP/municipio/ART | 2h (doc) |

**Total estimado Bloque P:** ~5h (documentacion, no codigo)

---

## Resumen ejecutivo de V4

| Bloque | Specs | Estimación | Prioridad |
|--------|-------|------------|-----------|
| A — Cumplimiento OIT | 10 specs | 43h + docs | Alta (bloquea escalamiento) |
| B — Mobile y UX | 3 specs | 22h | Alta (talleres usan celular) |
| C — Mejoras de QA | 4 specs | 20h | Media |
| D — Deuda técnica V3 | 9 specs | 41.5h | Baja-media |
| E — Integraciones | 3 specs | 36h | Variable segun piloto |
| F — Internacionalizacion | 3 specs | 52h | Solo si se escala |
| G — Feedback del piloto | TBD | TBD | Variable |
| H — Mercado y transparencia | 7 specs | 66h | Post-piloto |
| I — Servicios y catalogo | 7 specs | 62h | Post-piloto (despues de H) |
| J — Rol CONTENIDO completo | 5 specs | 14h | Media (depende O-05) |
| K — Seguridad | 5 specs | 15.5h | Alta (K-03/K-04 ya fixeados) |
| L — Documentacion y operaciones | 1 spec | 0.5h | Baja |
| M — Gobernanza e interdisciplinaria | 3 specs | 7h | Media-alta |
| N — Hallazgos interdisciplinarios | consolidado | (referencia) | Input para V4 |
| O — Decisiones institucionales | 7 decisiones | (analisis) | Primera reunion V4 |
| P — Capacitacion y protocolos | 2 specs | 5h | Pre-piloto o semana 1 |

**Total estimado V4 (sin Bloques G, N, O):** ~384h ≈ 10 semanas de trabajo

**Nota K-03/K-04:** Ya fixeados en Fase 2 (INT-00). K-01/K-02/K-05 pendientes para V4.

---

## Como arrancar V4

V4 arranca con **rediseno**: analisis funcional + procesos definidos antes de codear.

**Paso 1 — Primera reunion de planificacion:**
- Revisar Bloque O (7 decisiones institucionales)
- Priorizar bloques A-P segun feedback del piloto (Bloque G)
- Descartar bloques no relevantes (F si no se escala internacionalmente, E si no hay presupuesto)

**Paso 2 — Specs detallados:**
- Cada bloque priorizado se desarrolla con specs formales (7 secciones obligatorias como V3)
- Los hallazgos del Bloque N (Eje 6) alimentan cada spec

**Paso 3 — Implementacion:**
- Bloque P (capacitacion) puede empezar inmediatamente (es documentacion, no codigo)
- Bloques tecnicos arrancan despues de definir procesos

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
