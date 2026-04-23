# Propuesta de Soluciones v2 — Plataforma Digital Textil

**Fecha:** 2026-04-07
**Basado en:** `v2-hallazgos-validacion.md` (20 hallazgos de primera validacion)
**Referencias:** Better Work (OIT/IFC), Sedex/SMETA, Alibaba/1688, SAP Ariba, Faire, Coursera, DocuSign

---

## Filosofia general

La PDT es una plataforma de **compliance laboral + marketplace textil** para la OIT. No es un e-commerce comun: su valor esta en la trazabilidad, la formalizacion y la confianza entre actores. Las soluciones deben priorizar:

1. **Trazabilidad completa** — todo acto queda registrado y es auditable (como Sedex/SMETA)
2. **Flujos guiados** — el usuario no puede saltear pasos ni tomar atajos que rompan la logica (como SAP Ariba en sourcing)
3. **Documentos como activos** — un documento subido es un activo con ciclo de vida, no un archivo suelto (como DocuSign)
4. **Aprendizaje verificable** — la capacitacion tiene valor solo si se puede demostrar (como Coursera)
5. **Visibilidad por rol** — cada actor ve exactamente lo que necesita, ni mas ni menos (como Better Work)

---

## Epica 1 — Storage y Documentos

### Referencia: Better Work (OIT/IFC) + DocuSign

Better Work maneja documentos de compliance fabril con un ciclo de vida claro: **subida → revision → aprobacion/rechazo → vencimiento → renovacion**. Cada documento tiene version, fecha de carga, quien lo reviso, y queda accesible siempre (nunca desaparece). DocuSign agrega el concepto de que un documento es un activo inmutable una vez firmado.

### Diagnostico del codigo actual

- **Bucket:** El codigo usa `const BUCKET = 'documentos'` en `src/compartido/lib/storage.ts` pero el bucket no existe en Supabase produccion.
- **Catalogo duplicado:** La vista taller tiene 8 tipos hardcodeados en `taller/formalizacion/page.tsx` (lineas 15-24), mientras que admin lee de la tabla `TipoDocumento` via `/api/tipos-documento`. No hay garantia de que coincidan.
- **Visibilidad:** En `admin/talleres/[id]/page.tsx` linea 121, la query filtra `v.documentoUrl && v.estado === 'PENDIENTE'` — solo muestra pendientes con archivo. Los aprobados y rechazados desaparecen de la vista.

### Solucion propuesta

**S1-01: Crear bucket y politicas en Supabase** (H-01)
- Crear bucket `documentos` en Supabase Storage (produccion)
- Politica: INSERT para usuarios autenticados, SELECT para ADMIN/ESTADO, DELETE solo ADMIN
- Agregar al seed/setup script para que no se repita

**S1-02: Catalogo unico de documentos** (H-03, H-05)
- Eliminar el array hardcodeado de `taller/formalizacion/page.tsx`
- Leer siempre de `TipoDocumento` via API o query directa
- Cada tipo tiene: `nombre`, `descripcion`, `requerido` (bool), `nivelMinimo` (BRONCE/PLATA/ORO), `enlaceTramite`, `costoEstimado`
- La vista taller filtra por `activo === true`
- La vista admin muestra todos con badge "Obligatorio" / "Opcional" y nivel requerido
- **Referencia Better Work:** los checklists de compliance son configurables por tipo de fabrica y pais — no hardcodeados

**S1-03: Ciclo de vida completo de documentos** (H-02, H-04)
- Cambiar la vista de documentos en admin para mostrar TODOS los estados, no solo PENDIENTE
- Estructura de tabs en el detalle del taller:
  - **Pendientes** — documentos que necesitan revision (accion: aprobar/rechazar)
  - **Aprobados** — con link de descarga del archivo y fecha de aprobacion
  - **Rechazados** — con motivo y posibilidad de que el taller reenvie
  - **Vencidos** — documentos cuya fecha de vigencia paso (nuevo campo `fechaVencimiento`)
- Cada documento muestra: tipo, fecha subida, quien subio, fecha revision, quien reviso, link al archivo
- **Referencia DocuSign:** el documento nunca se borra, siempre hay audit trail

**S1-04: Vencimiento y renovacion** (mejora futura, inspidara en Sedex)
- Campo `fechaVencimiento` en Validacion
- Cron job que marca documentos vencidos y notifica al taller
- El taller puede subir version renovada sin perder el historial
- **Referencia Sedex/SMETA:** las auditorias y certificaciones tienen vigencia, el sistema alerta antes del vencimiento

---

## Epica 2 — Flujo Comercial

### Referencia: SAP Ariba (sourcing) + Alibaba Trade Assurance + Faire

SAP Ariba tiene un flujo de sourcing rigido: **RFQ → Bid → Evaluacion → Award → Contrato → Ejecucion**. No se puede saltar pasos. Alibaba Trade Assurance agrega proteccion al comprador con hitos de pago. Faire simplifica la experiencia pero mantiene la trazabilidad del pedido completo.

### Diagnostico del codigo actual

- **Boton sin destino:** `admin/pedidos/page.tsx` tiene un icono de ojo en linea 64 pero no navega a ninguna ruta. No existe `/admin/pedidos/[id]`.
- **Atajo peligroso:** `AsignarTaller` (componente en `src/marca/componentes/asignar-taller.tsx`) permite crear una OrdenManufactura directamente desde BORRADOR, sin pasar por publicacion ni cotizacion. Ademas la API `POST /api/pedidos/[id]/ordenes` transiciona automaticamente de BORRADOR a EN_EJECUCION.
- **Cotizaciones invisibles:** La vista de detalle del pedido en `marca/pedidos/[id]/page.tsx` linea 207-247 solo muestra cotizaciones cuando el pedido esta en PUBLICADO. En EN_EJECUCION ya no se ven.
- **PDF limitado:** El link al PDF de acuerdo existe en la vista de ordenes, pero la generacion funciona para EN_EJECUCION y COMPLETADO.

### Solucion propuesta

**S2-01: Eliminar asignacion directa** (H-07)
- Eliminar el componente `AsignarTaller` y su boton de la vista de pedidos
- El unico camino para crear una orden es: Publicar → Recibir cotizaciones → Aceptar una
- Esto alinea con el flujo diseñado en los wireframes y protege la trazabilidad
- **Referencia SAP Ariba:** en sourcing events, no se puede adjudicar sin al menos una oferta evaluada

**S2-02: Trazabilidad completa de cotizaciones** (H-08)
- Mostrar cotizaciones en TODOS los estados del pedido, no solo en PUBLICADO
- En la seccion de cotizaciones agregar columna "Estado" con badge: Enviada / Aceptada / Rechazada
- La cotizacion aceptada se destaca visualmente (borde verde, badge prominente)
- Los KPIs del pedido en ejecucion muestran: precio acordado (de la cotizacion aceptada), plazo pactado, progreso
- **Referencia Alibaba:** el comprador siempre puede ver el historial de negociacion completo

**S2-03: Vista admin de pedidos** (H-06)
- Crear pagina `/admin/pedidos/[id]/page.tsx` (read-only)
- Muestra: datos del pedido, marca, cotizaciones recibidas, ordenes de manufactura, timeline de estados
- El admin puede ver pero NO puede modificar — su rol es supervisar
- El boton "Ver" en el listado navega a esta nueva ruta
- **Referencia Better Work:** los inspectores tienen vista de solo lectura de los acuerdos entre fabricas y marcas

**S2-04: Filtros en admin/pedidos** (H-09)
- Agregar searchParams: `marca`, `taller`, `estado`, `fechaDesde`, `fechaHasta`
- Form method="get" con selects (patron ya usado en otras paginas del admin)
- Prisma where dinamico (patron existente en el proyecto)

**S2-05: Acuerdo PDF accesible siempre** (mejora de H-08)
- El PDF de acuerdo debe poder descargarse desde que la orden existe (estado PENDIENTE en adelante), no solo en COMPLETADO
- Agregar link al PDF tambien en la vista de cotizacion aceptada
- **Referencia Faire:** el purchase order se genera al aceptar y queda disponible siempre

---

## Epica 3 — Perfiles y Datos de Contacto

### Referencia: LinkedIn (perfil profesional) + Alibaba Supplier Profile

LinkedIn mantiene la regla de que el perfil es del usuario y el usuario controla que se muestra. Alibaba tiene perfiles de proveedores con datos de contacto, persona responsable, y metricas de desempeño — todo visible para el comprador.

### Diagnostico del codigo actual

- **Datos existen pero no se muestran bien:** `admin/talleres/[id]` SI muestra email y telefono del user (lineas 140-146), y `admin/marcas/[id]` tambien (lineas 112-115). El hallazgo de Sergio puede deberse a que la informacion esta dispersa o poco visible.
- **Perfil taller:** `taller/perfil/page.tsx` tiene link a editar en linea 69-71 (`/taller/perfil/completar`), pero el wizard de 14 pasos es para completar el perfil productivo (maquinas, SAM, etc.), no para editar datos basicos como nombre/telefono/ubicacion.
- **Datos desconectados:** El wizard guarda campos como `maquinaria`, `procesos`, `prendas` en el modelo Taller, pero la vista de "Mi perfil" solo muestra un subconjunto. Campos editados en el wizard no se reflejan todos.

### Solucion propuesta

**S3-01: Seccion "Responsable" prominente en admin** (H-10, H-11)
- En el detalle de taller y marca del admin, agregar seccion destacada "Responsable / Contacto" arriba del todo
- Mostrar: nombre completo, email (con `mailto:`), telefono (con `tel:`), fecha de registro
- Si falta algun dato, mostrar badge "Datos incompletos" en amarillo
- **Referencia Alibaba:** el "Contact Person" es lo primero que se ve en un perfil de proveedor

**S3-02: Edicion de perfil basico separada del wizard** (H-12, H-13)
- Separar la edicion en dos flujos:
  1. **Datos basicos** (nombre, telefono, ubicacion, descripcion) — formulario simple, accesible con boton "Editar" en Mi Perfil
  2. **Perfil productivo** (maquinas, SAM, procesos, prendas) — wizard de 14 pasos, accesible con "Completar perfil productivo"
- "Mi perfil" debe mostrar TODOS los campos que el taller puede editar, agrupados por seccion
- **Referencia LinkedIn:** datos basicos se editan inline, habilidades/experiencia se editan en seccion separada

**S3-03: Completitud de perfil como indicador** (mejora)
- Mostrar barra de completitud en el dashboard del taller (ya existe el calculo en lineas 44-51)
- Desglosar: "Datos basicos: 80% | Perfil productivo: 40%"
- Esto motiva al taller a completar sin ser bloqueante
- **Referencia Alibaba:** el "Profile Completion Score" es visible para el proveedor y afecta su ranking

**S3-04: KPI de reputacion** (H-14, mejora futura)
- Agregar score de reputacion basado en: cumplimiento de plazos, calidad reportada, nivel de formalizacion
- Visible en el perfil del taller (para marcas) y en el admin
- No bloquea piloto pero es diferenciador
- **Referencia Faire:** los proveedores tienen metricas de "fill rate" y "ship on time" visibles

---

## Epica 4 — Academia y Aprendizaje

### Referencia: Coursera + Better Work Training

Coursera tiene un modelo probado: **video con tracking de tiempo → quiz obligatorio → certificado verificable**. No se puede obtener certificado sin aprobar el quiz. Better Work Training aplica lo mismo al contexto fabril: los cursos de compliance tienen evaluacion y los certificados tienen vigencia.

### Diagnostico del codigo actual

- **Feature flag:** `getFeatureFlag('academia')` en `compartido/lib/features.ts` lee de `configuracionSistema`. Si el valor en DB es `'false'`, muestra "Modulo no disponible". Es posible que Sergio haya desactivado el flag durante las pruebas del checklist (item 7 del flujo 7 pide desactivar academia y verificar que muestra "no disponible", luego reactivar).
- **Progreso sin validacion:** Los videos se marcan como vistos con un click, sin minimo de tiempo de reproduccion ni quiz.
- **Asistente RAG:** Requiere `ANTHROPIC_API_KEY` y `VOYAGE_API_KEY` en Vercel. Si no estan configuradas, la API retorna error silencioso.
- **Quiz existe:** Hay evaluaciones en el seed y pagina `/contenido/evaluaciones`, pero no estan integradas como requisito para completar coleccion.

### Solucion propuesta

**S4-01: Verificar y restaurar feature flag** (H-15)
- Verificar en BD que `configuracionSistema` tiene `academia = 'true'`
- Si Sergio lo desactivo durante las pruebas (flujo 7 del checklist), reactivarlo
- Agregar proteccion: solo ADMIN puede cambiar feature flags (ya esta asi)

**S4-02: Progreso verificable** (H-16, H-17)
- **Nivel 1 (minimo viable):** Registrar timestamp de inicio y fin de visualizacion. Marcar como "visto" solo si el tiempo transcurrido es >= 50% de la duracion del video.
- **Nivel 2 (recomendado):** Quiz obligatorio al final de cada coleccion. Sin aprobar el quiz (>= 70%), no se emite certificado.
- **Nivel 3 (futuro):** Quiz por modulo (no solo por coleccion), intentos limitados, nota minima configurable.
- Esto ya tiene infraestructura: existe el modelo `IntentoEvaluacion` y la pagina de evaluaciones en contenido.
- **Referencia Coursera:** cada modulo tiene quiz, el certificado requiere aprobar todos. La plataforma registra tiempo de video real (no clics).

**S4-03: Conectar quiz con certificacion** (mejora estructural)
- Flujo: Ver todos los videos → Rendir quiz → Si aprueba → Generar certificado
- El certificado ya se genera con PDF y tiene verificacion publica en `/verificar`
- Falta el paso intermedio: verificar que el quiz esta aprobado antes de habilitar la descarga
- **Referencia Better Work Training:** los cursos de compliance para gerentes de fabrica tienen pre-test y post-test obligatorios

**S4-04: Asistente RAG** (H-18)
- Verificar si `ANTHROPIC_API_KEY` y `VOYAGE_API_KEY` estan en Vercel
- Si no estan, configurarlas o deshabilitar el chat visualmente (en vez de mostrar un chat que no responde)
- Agregar fallback: si las API keys no estan, mostrar mensaje "El asistente no esta disponible en este momento" en vez de error silencioso
- **Referencia Coursera:** el foro/Q&A tiene fallback a FAQ cuando no hay respuesta en 24hs

---

## Epica 5 — Notificaciones y Niveles

### Referencia: Slack (notificaciones accionables) + Better Work (compliance scoring)

Slack nunca muestra una notificacion que no lleve a algun lado — cada mensaje es clickeable y tiene contexto. Better Work tiene un scoring de compliance transparente: el inspector y la fabrica ven los mismos datos, y cualquier cambio de nivel queda explicado.

### Diagnostico del codigo actual

- **Notificaciones sin accion:** `admin/notificaciones/page.tsx` lineas 100-121 renderiza una tabla con titulo, mensaje, destinatario y fecha. No hay links ni acciones — es un historial pasivo.
- **Nivel siempre "SUBIDO":** `compartido/lib/nivel.ts` linea 112 usa `logActividad('NIVEL_SUBIDO')` sin importar si el nivel subio o bajo. Si se revoca una validacion, el nivel puede bajar de PLATA a BRONCE pero el log dice "NIVEL_SUBIDO".

### Solucion propuesta

**S5-01: Notificaciones accionables** (H-19)
- Cada notificacion debe tener un campo `link` (URL destino)
- Al crear notificaciones, incluir el link contextual:
  - "Nuevo pedido disponible" → `/taller/pedidos/disponibles`
  - "Cotizacion aceptada" → `/taller/pedidos/[id]`
  - "Documento aprobado" → `/taller/formalizacion`
  - "Nueva denuncia" → `/admin/auditorias`
- En la tabla de notificaciones, el titulo es clickeable y lleva al link
- Marcar como leida al hacer click
- **Referencia Slack:** cada notificacion es un deep link a la conversacion/mensaje relevante

**S5-02: Log de niveles bidireccional** (H-20)
- Cambiar la logica en `nivel.ts`:
  - Si nivel nuevo > nivel anterior → `logActividad('NIVEL_SUBIDO', ...)`
  - Si nivel nuevo < nivel anterior → `logActividad('NIVEL_BAJADO', ...)`
  - Si nivel no cambio → no loguear
- Incluir en el log: nivel anterior, nivel nuevo, motivo (que validacion se completo o se revoco)
- En la vista admin, mostrar con icono/color: verde para subida, rojo para bajada
- **Referencia Better Work:** cada cambio en el assessment score de una fabrica queda documentado con el motivo, y tanto la fabrica como el comprador pueden verlo

**S5-03: Panel de nivel transparente para el taller** (mejora)
- En el dashboard del taller, ademas del ProgressRing, mostrar:
  - Desglose del puntaje: "AFIP verificado +10 | Habilitacion municipal +10 | ..."
  - Que falta para el proximo nivel (ya existe parcialmente)
  - Historial de cambios de nivel con fechas
- **Referencia Better Work:** la fabrica tiene acceso a su propio assessment report con puntajes desglosados

---

## Epica 6 — Infraestructura y DevOps

Hallazgos transversales que no son bugs funcionales pero afectan la operacion.

### S6-01: Configurar GITHUB_TOKEN y GITHUB_REPO en Vercel
- Para que el widget de feedback cree issues en GitHub automaticamente
- Crear token con scope `repo` (o `public_repo` si el repo es publico)
- Sin esto, todo el feedback queda solo en la BD y hay que consultarlo manualmente

### S6-02: Configurar API keys para RAG
- `ANTHROPIC_API_KEY` y `VOYAGE_API_KEY` en Vercel
- Sin esto, el asistente de academia no funciona

### S6-03: Tildes en acceso rapido (H-21)
- Corregir nombres en `src/app/(auth)/acceso-rapido/page.tsx` para que coincidan con el seed
- Fix trivial, incluir en cualquier PR

---

## Resumen de esfuerzo estimado

| Solucion | Epica | Complejidad | Requiere schema? | Referencia |
|----------|-------|-------------|-------------------|------------|
| S1-01 Bucket Supabase | Storage | Baja | No | — |
| S1-02 Catalogo unico | Storage | Media | Si (TipoDocumento) | Better Work |
| S1-03 Ciclo de vida docs | Storage | Media | No | DocuSign |
| S1-04 Vencimiento | Storage | Alta | Si | Sedex |
| S2-01 Eliminar asignacion directa | Comercial | Baja | No | SAP Ariba |
| S2-02 Trazabilidad cotizaciones | Comercial | Media | No | Alibaba |
| S2-03 Vista admin pedidos | Comercial | Media | No | Better Work |
| S2-04 Filtros pedidos | Comercial | Baja | No | — |
| S2-05 PDF siempre accesible | Comercial | Baja | No | Faire |
| S3-01 Seccion responsable | Perfiles | Baja | No | Alibaba |
| S3-02 Edicion basica vs wizard | Perfiles | Media | No | LinkedIn |
| S3-03 Completitud | Perfiles | Baja | No | Alibaba |
| S3-04 KPI reputacion | Perfiles | Alta | Si | Faire |
| S4-01 Feature flag academia | Academia | Baja | No | — |
| S4-02 Progreso verificable | Academia | Media | Si | Coursera |
| S4-03 Quiz + certificacion | Academia | Media | No | Better Work |
| S4-04 Asistente RAG | Academia | Baja | No | — |
| S5-01 Notificaciones accionables | Notif | Media | Si (campo link) | Slack |
| S5-02 Log bidireccional | Niveles | Baja | No | Better Work |
| S5-03 Panel nivel transparente | Niveles | Media | No | Better Work |
| S6-01 GitHub token | Infra | Baja | No | — |
| S6-02 API keys RAG | Infra | Baja | No | — |
| S6-03 Tildes | Infra | Trivial | No | — |

---

## Orden sugerido de implementacion

### Fase 1 — Desbloquear piloto (P0)
1. S1-01 (bucket) + S6-01 (GitHub token) + S6-02 (API keys) + S6-03 (tildes) — config/infra
2. S4-01 (verificar feature flag academia)
3. S5-02 (log bidireccional niveles)
4. S2-01 (eliminar asignacion directa)
5. S2-02 (trazabilidad cotizaciones)

### Fase 2 — Completar funcionalidad (P1)
6. S1-03 (ciclo de vida documentos)
7. S1-02 (catalogo unico)
8. S2-03 (vista admin pedidos)
9. S3-02 (edicion perfil basico)
10. S5-01 (notificaciones accionables)

### Fase 3 — Mejoras de calidad (P2)
11. S2-04 (filtros pedidos)
12. S3-01 (seccion responsable admin)
13. S4-02 + S4-03 (progreso verificable + quiz)
14. S5-03 (panel nivel transparente)
15. S3-03 (completitud de perfil)

### Fase 4 — Contenido visual (nueva epica)
16. S-VIS-01 + S-VIS-02 (bucket imagenes + servicio)
17. S-VIS-03 a S-VIS-06 (portfolio taller + galeria publica)
18. S-VIS-07 a S-VIS-09 (imagenes en pedidos y cotizaciones)

### Fase 5 — Evolucion (P3/futuro)
19. S1-04 (vencimiento documentos)
20. S3-04 (KPI reputacion)
21. S2-05 (PDF siempre accesible)
22. S4-04 (fallback asistente RAG)
23. S-VIS-10 (fotos de instalaciones)

---

## Epica 7 — Contenido Visual (nueva)

Spec completo en `v2-epica-contenido-visual.md`. La plataforma no soporta imagenes en pedidos ni en perfiles de talleres. Un marketplace textil sin contenido visual no funciona.

**Resumen:**
- **Portfolio taller:** 10 fotos de trabajos, visible en perfil publico y admin
- **Imagenes en pedido:** 5 fotos de referencia (diseño, molde, muestra)
- **Imagenes en cotizacion:** 3 fotos de trabajos similares
- **Fotos de instalaciones:** para auditores y nivel ORO (futuro)

**Infra existente reutilizable:** campo `portfolioFotos` en schema, componente `file-upload.tsx`, funciones de storage.
**Referencia:** Alibaba (RFQ visual + Product Gallery), Faire (catalogo de productos)
