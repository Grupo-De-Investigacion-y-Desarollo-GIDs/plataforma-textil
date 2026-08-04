# Especificaciones de las líneas de continuidad

**Destino en el repositorio:** `docs/handover/ESPECIFICACIONES_CONTINUIDAD.md`

Fecha: 7 de agosto de 2026

Este documento baja al nivel de campos, opciones y flujos las líneas de continuidad enunciadas en la Parte II del Informe final. Es el documento específico que esa parte remite al repositorio: reúne el alcance funcional, los componentes afectados, los modelos de datos, las dependencias, los recorridos y los criterios de aceptación necesarios para retomar el desarrollo sin reconstruir su fundamento.

Su destinatario es un equipo técnico que retome la plataforma. No sustituye al Informe final, que expone el estado, el criterio y la agenda; lo complementa con el detalle de implementación.

---

## Alcance

Este anexo baja al nivel de campos, opciones y flujos las adecuaciones descriptas en la *Guía de escalabilidad y mejoras post-piloto*. Se organiza por eje temático y distingue entre:

- **Especificaciones aprobadas**: definidas en Master V4, Narrativa V4 consolidada o Copy Etapas 2-3. Cuando existe copy detallado en el documento fuente, este anexo remite al documento y no repite el contenido.
- **Especificaciones complementarias**: derivadas del relevamiento del piloto, no cubiertas por los documentos aprobados. Corresponden a la Parte B de la Guía y **no están programadas**: se documentan a este nivel de detalle solo donde el relevamiento permitió anticiparlo.

Cada adecuación indica su documento fuente para trazabilidad.

**Advertencia importante sobre las secciones ya implementadas.** Varias de las adecuaciones especificadas en este anexo se implementaron durante el piloto, y en algunos casos con un diseño técnico distinto del que aquí se había previsto. Esas secciones se marcan como **[YA IMPLEMENTADO]** y su contenido fue reemplazado por la descripción de la solución efectivamente construida, en lugar de conservar la especificación original. La razón es práctica: si se conservara el texto previo, un equipo que retome el trabajo en la fase de continuidad podría implementar por segunda vez —y de otra manera— algo que ya existe y funciona. Cuando la solución construida difiere de la aprobada, se indica explícitamente.

---

## 1. Eje 1 — Adecuación del producto al modelo Showcase + Match

### 1.1 Renombre ESTADO → COORD — [NO IMPLEMENTADO]

Fuente: Narrativa V4 § 2.9.

El renombre **no se implementó**. El rol conserva su denominación "Estado" en el panel, la navegación, las rutas de acceso, el enum de roles y las reglas de autorización.

Lo único adoptado durante el piloto fue la **firma "Equipo de Coordinación"** en los correos y mensajes dirigidos a los talleres, y la mención a "la Coordinación" en los avisos que refieren a quien aprueba o revisa documentación. Es una convención de redacción —para no dirigirse a los talleres en nombre del "Estado"— y no un renombre de rol: no alcanza al panel ni a la navegación del propio rol.

Conviene ejecutar el renombre junto con el desdoblamiento en sub-perfiles (§ 1.2), que toca el mismo modelo de datos. La tabla siguiente conserva la especificación completa.

**Componentes afectados**:

| Componente | Cambio |
|---|---|
| Layout `(estado)` | Renombrar a `(coord)`. Actualizar rutas `/estado/*` a `/coord/*` con redirects permanentes desde las viejas rutas. |
| Sidebar taller/marca | Referencias a "Estado" pasan a "Coordinación". |
| Enum `Role` en Prisma | Agregar valor `COORD`. Migración de usuarios existentes con rol `ESTADO` a `COORD`. Mantener `ESTADO` deprecado por 30 días con redirección automática. |
| Middleware | Reglas de autorización de `/coord/*` (equivalente a `/estado/*` actual). |
| Copy de UI | Reemplazo global en textos visibles: "Estado" → "Coordinación", "ESTADO" → "COORD" en badges y registros de auditoría. |
| Notificaciones y emails | Reemplazo en asuntos y cuerpos. La firma "Equipo de Coordinación" ya está aplicada; resta el resto del cuerpo y los asuntos. |

**Referencias específicas** (para copy de flujos): Copy Etapas 2-3 § 2.5 tiene el mapeo completo "donde dice X → cambia a Y".

### 1.2 Sub-perfiles COORD POLÍTICO / OPERATIVO

Fuente: Narrativa V4 § 3.5, § 4.3. Copy: Copy Etapas 2-3 § 3.1.

**Modelo de datos**:

- Nuevo campo `subPerfilCoord` en usuario con rol COORD. Enum: `POLITICO` / `OPERATIVO`.
- Asignación por parte del administrador desde `/admin/usuarios` al momento de asignar el rol COORD.

**Permisos diferenciados**:

| Recurso / acción | POLÍTICO | OPERATIVO |
|---|---|---|
| Configuración de etapas y umbrales | ✓ | ✗ |
| Catálogo de tipos de documento | ✓ | ✗ |
| Catálogo de cursos de Academia | ✓ | ✗ |
| Plantillas de respuesta | ✓ | ✗ |
| Reportes institucionales | ✓ | ✓ (lectura) |
| Cola de verificaciones (aprobar/rechazar) | ✗ | ✓ |
| Detalle de documentos individuales | ✗ | ✓ |
| Observaciones de campo | ✓ (lectura) | ✓ (crear/editar) |
| Talleres (listado) | ✓ | ✓ |
| Talleres (detalle) | ✓ | ✓ |

**Interfaz común con módulos condicionales**: la cabecera muestra el sub-perfil activo con pill (POLÍTICO: azul oscuro / OPERATIVO: verde institucional). Los tabs del menú se filtran según sub-perfil.

**Copy completo**: Copy Etapas 2-3 § 3.1.

### 1.3 Sistema de tres umbrales escalonados del Taller — [UMBRALES 1 Y 2 YA IMPLEMENTADOS, CON OTRO DISEÑO]

Fuente: Narrativa V4 § 3.2. Copy: Copy Etapas 2-3 § 2.3.

Los umbrales 1 y 2 se implementaron durante el piloto, pero **no como un enum único de umbral**. La especificación original preveía un campo `umbralActual` recalculado en cada acción relevante; la implementación resolvió cada umbral por separado, con los mecanismos que su naturaleza requería. Se describe a continuación lo efectivamente construido, para que no se reimplemente.

**Umbral 1 (Registrado) — implementado como estado de cuenta.** En lugar de un valor de umbral calculado, se incorporó al modelo `Taller` un estado de cuenta persistido, con enum `EstadoCuenta` de tres valores: `ACTIVA`, `EN_GRACIA` e `INACTIVA`. Lo acompañan los campos `inicioGracia` (arranque del reloj de 60 días), `inactivadaAt` y `recordatorioCuitEnviadoAt` (idempotencia del recordatorio). El estado vigente se computa a partir de `inicioGracia`, no del campo almacenado, lo que evita depender de que la tarea programada haya corrido. La migración se aplicó con criterio de amnistía. Una tarea programada diaria envía el recordatorio hacia el día 50, transiciona a `INACTIVA` al vencer el plazo, y la verificación del CUIT reactiva la cuenta de forma automática y centralizada.

**Umbral 2 (Visible en directorio) — implementado como "vidriera mínima".** No se persiste un valor de umbral: la condición se evalúa en el momento de la consulta, mediante funciones de dominio en el módulo de visibilidad de la vidriera. Las condiciones efectivas son verificación de CUIT ante ARCA, descripción con extensión mínima, ubicación a nivel de provincia y partido, y al menos un rubro o proceso visible. **La fotografía se mantuvo opcional durante el piloto**, con una imagen institucional de reemplazo, en lugar de ser obligatoria como preveía la especificación. El taller recibe dentro de su vidriera un aviso con lo que le falta completar.

**Umbral 3 (Apto para cotizar) — pendiente.** Es la única parte no implementada. Especificación:

| Umbral | Condición cumplida |
|---|---|
| Apto para cotizar | Etapa "En proceso" o "Consolidada" + `porcentajePerfilCompleto >= 80` |

Habilita `POST /api/cotizaciones` y la vidriera completa con todos los bloques disponibles. Corresponde evaluar si conviene introducir en este punto el campo `umbralActual` unificado de la especificación original, o mantener el patrón de evaluación por condición que ya está en uso para los umbrales 1 y 2. **Recomendación técnica: mantener el patrón actual**, que evita el riesgo de que un valor persistido quede desincronizado de las condiciones reales.

**Notificaciones asociadas** (texto exacto en Copy Etapas 2-3 § 2.3). El recordatorio del período de gracia está implementado. Quedan pendientes:
- Cambio de umbral: "Avanzaste al umbral X. [lo que se desbloquea]".
- Próximo umbral cerca: "Estás cerca del siguiente umbral. Te falta [ítem] para avanzar."
- Bloqueo al intentar cotizar sin umbral 3: "Todavía no estás en el umbral Apto para cotizar. Mirá Mi recorrido para ver qué te falta."

### 1.4 Cabecera común de Mi taller — [YA IMPLEMENTADO, CON DESVIACIÓN]

Fuente: Copy Etapas 2-3 § 2.1.

**Estructura especificada originalmente**:

- Título principal: `[Nombre del taller]`.
- Subtítulo: `Etapa [Inicial / En proceso / Consolidada] · ARCA verificado`.
- Botón derecho: "Editar mi taller" (link a `/taller/perfil/editar`).
- Botón secundario: "Ver cómo me ve el directorio" (preview de la vidriera pública).

**Lo efectivamente construido**: la cabecera conserva únicamente el nombre del taller y las solapas de navegación. La metadata de identidad se distribuyó por contexto, en lugar de concentrarse en el encabezado: la ubicación quedó en "Datos básicos"; la etapa y la verificación ARCA quedaron en el inicio, en "Mi recorrido" y en las credenciales de "Mi vidriera". La vista previa "Ver cómo me ve el directorio" sí está implementada, dentro de "Mi vidriera".

El cambio responde a una decisión de QA del 27 de junio de 2026, tomada para evitar que el mismo dato se repitiera en tres superficies simultáneas. En los formularios de edición y de carga el encabezado se oculta.

**Acción requerida en la fase de continuidad**: confirmar institucionalmente que la desviación se acepta. Si se acepta, no hay desarrollo asociado.

**Sub-tabs de Mi taller**: se implementaron tres —Datos básicos, Mi gestión productiva y Mi vidriera—, sobre las dos previstas originalmente.

### 1.5 Sub-tabs de Pedidos — [TALLER YA IMPLEMENTADO · MARCA PENDIENTE]

Fuente: Narrativa V4 § 4.1, § 4.2.

**Rol Taller**: `/taller/pedidos` — **implementado**.
- Recibidos (default): pedidos donde el taller cotizó o fue invitado.
- Disponibles: vitrina de demanda compatible con el perfil productivo.

Las solapas se muestran únicamente en las páginas de índice y se ocultan en el detalle de cada pedido. Este patrón se reutilizó luego como molde para las solapas de Mi taller.

**Rol Marca**: `/marca/pedidos` — **pendiente**. La vista conserva un listado único, sin desdoblamiento en solapas.
- Mis publicados (default): pedidos publicados por esta marca.
- Cotizaciones recibidas: cotizaciones activas sobre los pedidos publicados.
- Históricos: pedidos cerrados (completados o cancelados).

**Cambio de modelo**: agregar campo `estadoPedido` con enum ampliado (`BORRADOR` / `PUBLICADO` / `EN_EJECUCION` / `ESPERANDO_ENTREGA` / `COMPLETADO` / `CANCELADO`) — ya presente en el modelo actual.

### 1.6 Modelo B de visibilidad del perfil productivo — [YA IMPLEMENTADO, CON OTRO DISEÑO Y MAYOR ALCANCE]

Fuente: Narrativa V4 § 4.5.

La especificación original preveía un modelo relacional nuevo, `PerfilProductivoVisibilidad`, con cinco campos booleanos. **La implementación resolvió el problema de otra manera y con más alcance.** Se describe lo construido; la especificación previa queda sin efecto.

**Modelo de datos efectivo**: un único campo `visibilidadVidriera` de tipo JSONB sobre `Taller`, acompañado de un indicador `modeloB_revisado` que distingue a los talleres que ya pasaron por la configuración de visibilidad de aquellos que conservan el comportamiento por defecto.

La elección del formato JSONB sobre un modelo relacional tiene una consecuencia práctica relevante para la fase de continuidad: **agregar nuevos bloques al conjunto no requiere migración de base de datos**, solo ampliar la lista canónica en el código.

**Semántica de la visibilidad**: el valor por defecto es *visible*. Una clave ausente, o el campo entero en nulo, significa que el bloque se muestra. Únicamente un `false` explícito oculta. Esto permitió incorporar la funcionalidad sin alterar el comportamiento de ningún taller preexistente.

**Bloques efectivamente controlables** (once, sobre los cinco previstos): formación, equipo, espacio, capacidad, organización, maquinaria, procesos, prendas, año de fundación, portfolio y tipo de inscripción tributaria.

Sobre el último corresponde una precisión de minimización de datos: se expone **solo el tipo** de inscripción —monotributista o responsable inscripto— y nunca la categoría, porque la categoría revela indirectamente una franja de facturación del taller.

Se incorporó además un control granular por credencial de Academia, que permite al taller ocultar certificados individuales dentro del bloque de formación. Queda subordinado al interruptor general del bloque.

**Reglas fijas** (invariantes, no configurables):
- SAM nunca se expone en la vidriera pública, con independencia del interruptor de capacidad. Solo visible en la gestión productiva del taller y para Coordinación.
- Las credenciales —etapa y verificación ARCA— nunca se ocultan: no son un bloque conmutable.
- Las certificaciones externas quedaron fuera del conjunto del piloto.

**UI**: interruptores por bloque en la gestión del perfil, con indicador de última edición por cada bloque de la vidriera.

**Preview**: "Ver cómo me ve el directorio", implementado dentro de "Mi vidriera" y no en la cabecera, en coherencia con la desviación descripta en § 1.4.

### 1.7 Identificación inicial del tipo de unidad productiva

Fuente complementaria: relevamiento del piloto (trabajo de campo).

**Modelo de datos**: nuevo campo `tipoUnidadProductiva` en `Taller`. Enum: `EMPRESARIAL` / `COOPERATIVA` / `FAMILIAR` / `UNIPERSONAL` / `MIXTO`.

**Momento de captura**: paso siguiente al alta, previo al wizard del perfil productivo.

**Pregunta** (texto sugerido, sujeto a validación sectorial): *"¿Cómo describirías la forma de organización de tu taller?"*

**Opciones excluyentes**:
- Empresa con trabajadores en relación de dependencia.
- Cooperativa de trabajo o unidad asociativa.
- Taller familiar (con integrantes del grupo familiar).
- Taller unipersonal o costurera/o individual.
- No estoy seguro / mixto.

**Impacto**:
- Checklist de formalización parametrizado por tipo (nuevo modelo `RequisitoFormalizacionPorTipo` con relación N:N a `TipoDocumento` y `TipoUnidadProductiva`).
- Mensajes de ayuda contextuales por tipo.
- Filtro adicional en dashboards de COORD y reportes sectoriales.

Modificable desde `/taller/perfil/editar`.

### 1.8 Ajustes de lenguaje

Fuente: Narrativa V4 § 2.7 (orientación general) + relevamiento del piloto (ejemplos concretos).

**Glosario de sustituciones** aplicable en todo el copy:

| Actual | Nuevo |
|---|---|
| Contratar personal | Incorporar trabajadores |
| Empleados | Trabajadores / integrantes / asociados (según contexto) |
| Empleador | Titular / responsable / referente |
| Verificado / no verificado | Confirmado / en proceso de confirmación |
| Cumplís / no cumplís | Alcanzaste / estás avanzando hacia |
| Falta / faltante | Próximo paso / pendiente de completar |
| Rechazado | Requiere ajustes / revisar |
| Nivel Bronce / Plata / Oro | Etapa Inicial / En proceso / Consolidada |
| Directorio de talleres | Explorar talleres |

**Metodología**: revisión semi-manual del copy hardcodeado en componentes + consolidación en `src/compartido/lib/content/institutional.ts` como fuente única. Alcance: pantallas de usuario + emails transaccionales + notificaciones + mensajes de error.

---

## 2. Eje 2 — Vinculación bidireccional y matching enriquecido

### 2.1 Nomenclador propio de prendas

Fuente: Master V4 § 3.4.

**Estructura**: 11 familias, ~95 tipologías. Detalle completo del catálogo en Master V4 § 3.4.

**Modelo de datos**:

```
Familia (id, codigo, nombre)
  ↓ 1:N
Tipologia (id, familiaId, codigo, nombre)
```

**Búsqueda**: autocompletado con matching por prefijo + búsqueda difusa por nombre. Aceptar sinónimos frecuentes.

**Uso**:
- `Pedido.tipoPrendaId` (FK a Tipologia).
- `Taller.prendasQueOfrece` (N:N a Tipologia).

### 2.2 Estructura de pedido enriquecida

Fuente: Master V4 § 3.6.

**Modelo de datos** — campos del `Pedido`:

| Campo | Tipo | Requerido |
|---|---|---|
| tipoPrenda | FK Tipologia | Sí |
| cantidadEstimada | Int | Sí |
| curvaTalles | String (texto libre) | No |
| especificaciones | Text (texto libre) | No |
| serviciosRequeridos | N:N Servicio | Sí (mínimo 1) |
| fechaRequerida | Date | Sí |
| documentacionDisponible | JSON (array de: molde / ficha técnica / muestra física / tabla de medidas) | No |

**Nota importante**: los archivos (moldes, fichas técnicas) NO se suben a la plataforma en la versión inicial (Master V4 § 3.6). El campo `documentacionDisponible` solo declara qué tiene la marca; el envío se coordina fuera de plataforma.

### 2.3 Matching por prenda + servicios

Fuente: Master V4 § 3.5.

**Modelo de datos**: nuevo modelo `Servicio` (id, categoria, nombre, activo). Catálogo maestro administrado por rol COORD POLÍTICO.

**Categorías de servicio** (catálogo inicial):
- Preparación: diseño/patronaje, digitalización de moldes, tizado, corte manual, corte automatizado.
- Confección: prenda completa, partes específicas, bordado industrial, estampado, sublimado, aplicación de accesorios.
- Terminación: planchado industrial, etiquetado interno, etiquetado externo, control de calidad, embolsado, empaque.
- Especializados: muestras y prototipos, ajustes de talle, series cortas, series largas, producción bajo norma técnica.

**Algoritmo de matching** (consulta SQL parametrizada, sin motor de búsqueda dedicado):

```
Taller es candidato si:
  Taller.prendasQueOfrece INCLUYE Pedido.tipoPrenda (o categoría superior)
  Y
  Taller.serviciosOfrecidos CUBRE Pedido.serviciosRequeridos
  Y
  Taller.capacidadDisponible >= Pedido.cantidadEstimada
```

**Ordenamiento del listado**:
1. Compatibilidad total (todos los criterios cumplidos).
2. Compatibilidad parcial priorizando prenda + servicios.
3. Ubicación cercana como factor de desempate.
4. Etapa de formalización avanzada como factor de desempate.

**Transparencia del matching**: cuando la plataforma muestra candidatos, indica qué criterios se cumplieron y cuáles no. Facilita la decisión y la confianza en el sistema.

### 2.4 Refactor del perfil del taller para declarar prendas + servicios

Fuente: Master V4 § 3.5.

**Cambios en el wizard**:
- Nuevo paso: selección de prendas que ofrece (multi-select desde nomenclador con autocompletado).
- Nuevo paso: selección de servicios ofrecidos (multi-select desde catálogo).
- Estos datos alimentan el matching (ver § 2.3).

**Modelo de datos**:
- `TallerPrenda` (N:N Taller ↔ Tipologia).
- `TallerServicio` (N:N Taller ↔ Servicio).

### 2.5 Vista del taller sobre marcas y oportunidades

Fuente complementaria: relevamiento del piloto (trabajo de campo).

**Nueva ruta**: `/taller/explorar-marcas`.

**Listado de marcas** con campos:
- Nombre, ubicación, rubro/segmento (ver § 2.6).
- Cantidad de pedidos publicados en últimos 90 días.
- Fecha del último pedido.

**Filtros**:
- Rubro / segmento.
- Ubicación (provincia, partido).
- Actividad reciente (30d / 90d / cualquier momento).
- Tipo de necesidad (según declaración de tercerización — ver § 2.6).

**Detalle de marca**:
- Datos básicos.
- Descripción.
- Servicios que habitualmente terceriza.
- Pedidos activos publicados por esta marca.
- Historial de vinculaciones (agregado, respetando privacidad).

**Nueva ruta**: `/taller/oportunidades`.

**Listado de pedidos activos** que coinciden con el perfil productivo del taller. Ordenamiento por fecha + cercanía + tipo de compatibilidad.

**Consideraciones técnicas**:
- Los datos de la marca ya existen en el modelo actual. Requiere UI + índices para consultas por rubro/ubicación/actividad reciente.
- La lógica de compatibilidad reutiliza el matching de pedidos.

### 2.6 Enriquecimiento del perfil de la marca

Fuente complementaria: relevamiento del piloto (trabajo de campo).

**Nuevos campos en `Marca`**:

| Campo | Tipo | Uso |
|---|---|---|
| segmentoMercado | Enum (`CONSUMO_MASIVO` / `MEDIO` / `ALTA_GAMA` / `UNIFORMES_INSTITUCIONALES` / `INDUMENTARIA_TECNICA` / `OTRO`) | Filtro en directorio, matching |
| procesosInternos | N:N Servicio | Declaración de procesos que realiza en casa |
| procesosTercerizados | N:N Servicio | Declaración de procesos que habitualmente terceriza |
| busquedaActivaProveedores | Bool | Habilita aparecer en "Oportunidades" del taller |
| descripcionBusqueda | Text | Descripción libre del tipo de proveedor buscado |
| ubicacionPreferida | Ref Ubicacion | Preferencia para localización de proveedores |
| volumenesEstimados | JSON | Volúmenes aproximados de contratación |
| frecuenciaContratacion | Enum | Frecuencia estimada |

**Impacto**: los talleres pueden ver marcas con búsqueda activa incluso sin pedido puntual publicado. Refuerza la lógica bidireccional.

### 2.7 Enriquecimiento de la caracterización técnica del taller

Fuente complementaria: relevamiento del piloto (trabajo de campo).

**Modelo de datos**: nuevo modelo `CapacidadTecnicaTaller` (relación 1:1 con `Taller`).

**Campos**:

| Campo | Tipo | Opciones |
|---|---|---|
| nivelComplejidad | Enum | `BASICA` / `INTERMEDIA` / `ALTA` |
| materialesTrabajados | JSON (multi-select) | Algodón, sintéticos, denim, poplin, punto, polar, telas técnicas, cuero, otros |
| tiposCostura | JSON (multi-select) | Recta, overlock, collareta, ojal/botón, refuerzo, decorativa, zigzag, bordado industrial |
| terminaciones | JSON (multi-select) | Planchado, etiquetado interno/externo, embolsado, empaque por talles |
| experienciaTecnica | Bool + Text | Sí/No + descripción libre |
| capacidadPrototipos | Bool + JSON | Sí/No + tipos (muestras / prototipos / ajustes patronaje) |
| normasTecnicas | JSON (multi-select) | IRAM, INTI, requisitos específicos, otros |

**Visibilidad**: configurable por el propio taller (Modelo B, ver § 1.6).

**Uso en matching**: los pedidos pueden requerir `nivelComplejidad` mínimo, `materiales` específicos, `tiposCostura`, etc. — el matching filtra por estos criterios.

### 2.8 Sección de certificaciones

Fuente complementaria: relevamiento del piloto (trabajo de campo).

**Modelo de datos**: nuevo modelo `CertificacionTaller` (N:1 con `Taller`).

**Campos de una entrada**:

| Campo | Tipo | Detalle |
|---|---|---|
| tipo | Enum | `SISTEMA_GESTION` / `PRODUCTO` / `PROCESO` / `SECTORIAL` |
| norma | String + FK opcional a catálogo | Ej: ISO 9001, OEKO-TEX Standard 100, IRAM |
| entidadCertificadora | String | Nombre libre |
| alcance | Text | Descripción del alcance |
| fechaEmision | Date | Requerido |
| fechaVencimiento | Date | Requerido |
| estadoVigencia | Calculado | `VIGENTE` / `PROXIMO_A_VENCER` (<90d) / `VENCIDO` |
| documentoAdjunto | FK a Storage | Opcional |
| visible | Bool | Control por el taller |

**Catálogo maestro de normas**: nuevo modelo `NormaCertificacion` administrado por rol COORD POLÍTICO. Alimenta autocompletado.

**UI**:
- Nueva sección en `/taller/perfil/gestion` (privada) y `/taller/perfil/vidriera` (pública, si visible).
- Badge visual en vidriera para certificaciones marcadas como visibles.
- Notificación al taller cuando una certificación entra en estado `PROXIMO_A_VENCER`.

### 2.9 Ampliación del catálogo de prendas

Fuente complementaria: relevamiento del piloto (trabajo de campo).

**Familias adicionales al Master V4 § 3.4**:

**Familia "Ropa de trabajo"** (subcategorías): uniforme laboral genérico, ropa de servicio, delantales y guardapolvos, vestimenta corporativa.

**Familia "Blanquería"** (subcategorías): sábanas y fundas, toallas y toallones, manteles y servilletas, cortinas y tapicería textil, ropa de cama institucional.

**Familia "Indumentaria técnica"** (subcategorías con sub-subcategorías):
- Ropa laboral con requisitos específicos: ignífuga, antiestática, alta visibilidad, con protección química.
- Ropa deportiva técnica: alta montaña, primeras pieles, ropa de agua, ropa de invierno.
- Uniformes para fuerzas de seguridad.
- Elementos de protección personal (EPP) textiles.

**Estructura extendida**: el nomenclador pasa de 2 niveles (familia → tipología) a 3 niveles (familia → subcategoría → especialización).

Consideración: el taller declara sus capacidades al nivel de precisión que domine (puede declarar a nivel de familia o de especialización).

### 2.10 Portfolio con soporte de video

Fuente complementaria: relevamiento del piloto (trabajo de campo).

**Especificaciones**:
- Hasta 5 videos por taller (ajustable).
- Formatos: MP4, MOV, WebM.
- Duración máxima: 60 segundos.
- Tamaño máximo: 50 MB.
- Reproducción embebida en vidriera pública (sin descarga directa).
- Miniatura auto-generada.
- Descripción opcional por video.

**Consideraciones técnicas**:
- Ampliar `/admin/configuracion/archivos` con contexto `portfolio-video`.
- Storage en bucket de Supabase Storage.
- Generación de miniatura server-side con `ffmpeg` u equivalente.
- Evaluar costo de almacenamiento y transferencia al escalar.

### 2.11 Registro de maquinaria flexibilizado

Fuente complementaria: relevamiento del piloto (trabajo de campo).

**Ampliación del catálogo maestro** (`TipoMaquinaria`, administrado por rol COORD POLÍTICO):

Recta industrial, overlock (con subtipos 3/4/5 hilos), collareta, recubridora, doble aguja, ojaladora, botonera, presilladora, zigzag, bordadora industrial, estampadora, sublimadora, fusionadora, cortadora manual, cortadora automática, máquina de patronaje digital, otras.

**Nuevos campos por entrada en `MaquinariaTaller`**:

| Campo | Tipo |
|---|---|
| tipoMaquinariaId | FK TipoMaquinaria |
| cantidad | Int (default 1) |
| estado | Enum (`NUEVA` / `BUEN_ESTADO` / `REGULAR` / `REQUIERE_REPARACION`) |
| descripcionLibre | Text (solo si tipo = "otras") |

### 2.12 Revisión del cálculo de capacidad productiva

Fuente complementaria: relevamiento del piloto (trabajo de campo).

**Cambios**:

- Explicación transparente del cálculo. Al lado del resultado, enlace "Cómo se calcula" abre modal con la fórmula en lenguaje simple y los valores concretos usados.
- Ajuste manual. Nuevo campo `capacidadDeclarada` en `Taller`, opcional. Cuando está seteado, la vidriera muestra ese valor con leyenda "declarado por el taller". Los reportes sectoriales usan el valor calculado (para consistencia).
- Revisión del factor de eficiencia. Sustituir el factor único por una tabla de factores según tipo de prenda (rango sugerido: 0.6 a 0.75).

---

## 3. Eje 3 — Formación e integración con acompañamiento

### 3.1 Academia para MARCAS

Fuente: Narrativa V4 § 3.4. Copy: Copy Etapas 2-3 § 3.3.

**Cambios**:

- Habilitar sub-tab "Cursos" para rol MARCA. Ruta: `/marca/cursos`.
- Reutilizar la infraestructura de Colecciones + Videos + Evaluaciones existente para el rol Taller.
- Ampliar modelo `Coleccion` con campo `roleTarget` (enum `TALLER` / `MARCA` / `AMBOS`).
- Ampliar modelo `Coleccion` con campo `categoria` (enum: `COMO_ELEGIR_PROVEEDORES` / `GESTION_CADENA` / `COMERCIO_JUSTO` / `CALIDAD_TEXTIL` / `COSTOS_PRECIOS` / `OTROS`).
- Los certificados obtenidos por marcas se muestran en su perfil (no en el directorio público).

**Copy exacto** de todas las pantallas (cabecera del tab, banner contextual, categorías del catálogo, vista de curso individual, estados, notificaciones): Copy Etapas 2-3 § 3.3.

### 3.2 Linkeo bidireccional curso ↔ requisito

Fuente: Copy Etapas 2-3 § 3.3.

**Modelo de datos**: nueva tabla `CursoRequisito` (N:N entre `Coleccion` y `TipoDocumento`).

**Vistas**:

- Desde el detalle de un curso (rol Marca): "Al completar este curso, vas a entender mejor estos requisitos que los talleres necesitan cumplir: [lista de tipos de documento]".
- Desde un requisito (vista del taller, en Mi recorrido): "Cursos que profundizan este requisito: [lista de colecciones]".

**Administración**: el rol CONTENIDO (o COORD POLÍTICO) asocia cursos con requisitos desde la vista de cada colección.

### 3.3 Plantillas de respuesta institucional

Fuente: Narrativa V4 § 3.5. Copy: Copy Etapas 2-3 § 3.2.

**Modelo de datos**: nuevo modelo `PlantillaRespuesta`.

| Campo | Tipo |
|---|---|
| nombreInterno | String (identificador para COORD) |
| mensajeAlTaller | Text (texto visible al destinatario) |
| tipo | Enum (`RECHAZO` / `PEDIDO_ACLARACION`) |
| activa | Bool |
| creadaPor | FK Usuario (COORD POLÍTICO) |

**Vista del POLÍTICO** — gestión del catálogo:

- Nueva ruta: `/coord/plantillas`.
- CRUD completo desde interfaz.

**Vista del OPERATIVO** — uso en el modal de rechazo:

- Selector: "Usar plantilla" / "Escribir libre".
- "Usar plantilla": dropdown con plantillas activas del tipo. Al seleccionar, el campo motivo se rellena y queda editable.
- "Escribir libre": campo vacío.
- Texto auxiliar: "Podés usar una plantilla y adaptarla al caso concreto antes de enviar."

**Copy completo**: Copy Etapas 2-3 § 3.2.

### 3.4 Materiales de organizaciones intermedias

Fuente complementaria: relevamiento del piloto (trabajo de campo).

**Modelo de datos**: nuevo modelo `MaterialInstitucional` gestionable por rol CONTENIDO o COORD POLÍTICO.

**Campos**:

| Campo | Tipo |
|---|---|
| titulo | String |
| descripcion | Text |
| organizacion | String (nombre de la organizacion o institucion) |
| categoria | Enum (`FORMALIZACION` / `HIGIENE_SEGURIDAD` / `COSTOS` / `NEGOCIACION` / `COOPERATIVISMO` / `OTROS`) |
| tipo | Enum (`PDF` / `VIDEO` / `ENLACE_EXTERNO`) |
| archivo | FK Storage o URL |
| visibilidadPorRol | JSON (roles habilitados) |

**Integración con checklists**: cada `TipoDocumento` puede tener asociados uno o más `MaterialInstitucional` (relación N:N). En la vista del requisito, aparece enlace "Ver material de referencia".

**Materiales identificados para incorporación inicial**:
- Manuales y guias de recomendaciones elaborados por organizaciones sectoriales.
- Documentos de INAES para cooperativas (a evaluar disponibilidad).
- Guías del INTI sobre normativa textil (a evaluar disponibilidad).

### 3.5 Contactos y derivaciones territoriales

Fuente complementaria: relevamiento del piloto (trabajo de campo).

**Modelo de datos**: nuevo modelo `ContactoInstitucional`.

| Campo | Tipo |
|---|---|
| nombre | String |
| tipo | Enum (`FEDERACION` / `COOPERATIVA` / `UNIVERSIDAD` / `MUNICIPIO` / `ORGANISMO_PUBLICO` / `ONG`) |
| ubicacion | Ref Ubicacion |
| serviciosOfrecidos | JSON (multi-select) |
| datosContacto | JSON (email, teléfono, dirección, sitio web) |
| ambitoActuacion | Enum (`NACIONAL` / `PROVINCIAL` / `LOCAL`) |

**Sugerencia contextual en el checklist**: cada `TipoDocumento` puede tener asociado un `tipoContactoUtil` (multi-select). Al abrir el requisito, se muestran los contactos de ese tipo cercanos a la ubicación del taller.

**Vista consolidada**: nueva pantalla `/taller/acompanamiento` con listado filtrable por ubicación, tipo de servicio y tipo de organización.

### 3.6 Mensajes orientativos frente a requisitos no cumplidos

Fuente complementaria: refuerza la orientación de acompañamiento (Narrativa V4 § 2.7).

**Modelo de datos**: nuevo campo `mensajeOrientativo` en `TipoDocumento`, estructurado como:

```
{
  queEs: string,          // descripción funcional (1-2 líneas)
  comoSeCumple: string,   // pasos concretos con referencia al organismo
  recursosUtiles: [       // enlaces a MaterialInstitucional y ContactoInstitucional
    { tipo: 'material' | 'contacto', id: string }
  ],
  costoEstimado: string   // rango orientativo (opcional)
}
```

**UI**: al abrir el detalle de un requisito no cumplido, se muestra el mensaje estructurado en lugar del genérico "Pendiente".

Ejemplo (habilitación municipal): "La habilitación es la autorización del municipio para operar en el domicilio declarado. Se solicita en la Dirección de Habilitaciones del municipio. Requiere plano del local, constancia de servicios y, según el municipio, informe de bomberos. [Guía general] [Contactos municipales por partido]. Costo entre $X y $Y."

---

## 4. Eje 4 — Consolidación institucional y cumplimiento

Los componentes técnicos requeridos por cumplimiento están definidos en el V4_BACKLOG bloque A (P-01 a P-08) y en el bloque K residual. Este anexo no repite las especificaciones; remite a los ítems del backlog.

**Bloque A — Cumplimiento OIT y privacidad de datos**:

| Ítem | Descripción | Referencia |
|---|---|---|
| P-01 | Consentimiento explícito en registro (casillas obligatorias: términos, privacidad, visibilidad de datos) | V4_BACKLOG Bloque A. **Desarrollo completado**; se incorpora junto con la publicación de los textos revisados |
| P-04 | Derecho a portabilidad — botón "Descargar mis datos" → JSON completo | V4_BACKLOG Bloque A |
| P-05 | Derecho a eliminar cuenta — soft delete inmediato, hard delete a 30 días, doble confirmación | V4_BACKLOG Bloque A |
| P-06 | Sistema de reporte de breach — `/admin/incidentes` con fecha, tipo, datos afectados, notificación a OIT | V4_BACKLOG Bloque A |
| P-07 | Política de retención configurable — UI admin por tipo de dato + job nocturno | V4_BACKLOG Bloque A |
| P-08 | Sección admin "Privacidad y datos" — agrupa P-04..P-07 + dashboard de métricas | V4_BACKLOG Bloque A |

**Sustitución de los textos legales publicados** (no figura como ítem del backlog, pero condiciona a P-01): las páginas públicas de términos y condiciones y de política de privacidad siguen sirviendo las versiones preliminares de febrero de 2026, anteriores al proceso de adecuación normativa. Los textos revisados del paquete de handover no están incorporados a la aplicación. Es una tarea técnica menor —sustitución de contenido estático— pero prioritaria, porque el texto vigente declara derechos de supresión y portabilidad sin aclarar la vía de ejercicio, cuando los mecanismos de autoservicio correspondientes (P-04 y P-05) no existen. Debe resolverse junto con P-01 y con la unificación de la dirección de contacto para asuntos de privacidad.

**Bloque K — Cierre de seguridad residual**:

- CSP en `next.config.ts` con directivas definidas para el stack (Next.js + Vercel + Supabase + Resend + OAuth).
- Headers de seguridad: X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin, Strict-Transport-Security con `max-age >= 31536000`.
- Consolidación de hallazgos en `docs/seguridad/hallazgos-consolidados.md` con estado y controles aplicados.

**Definiciones institucionales pendientes** (no son especificaciones técnicas):

- Licencia definitiva del código y de la documentación. Se adopta Apache License 2.0 y CC BY 4.0 IGO de forma operativa; la definición final corresponde a OIT una vez transferido el proyecto (cláusula 9 del marco de contratación).
- Definición de titularidad institucional post-entrega de cuentas de infraestructura.
- Protocolo formal de notificación de incidentes de seguridad (contenidos, plazos, canales, responsables).
- Acuerdo de procesamiento de datos con Supabase o justificación formal (riesgo ISRA N° 68).

**Métricas de éxito V4** (reemplazan métricas V3): implementación en el dashboard de COORD. Ver Narrativa V4 § 2.6 para el mapeo completo.

---

## 5. Referencias documentales

- **Master V4** (mayo 2026): §§ 2.4, 3.2, 3.4, 3.5, 3.6, 3.7-3.20.
- **Narrativa V4 consolidada rev2** (1 jun 2026): §§ 2.5-2.9, 3.2, 3.4, 3.5, 4.1-4.5.
- **Copy Etapas 2-3** (18 jun 2026): §§ 2.1, 2.3, 2.5, 3.1, 3.2, 3.3.
- **V4_BACKLOG** (`.claude/specs/V4_BACKLOG.md`): Bloques A, K, Q, R.
- **Spec v3-redefinicion-roles-estado**: base implementada del sub-perfilado COORD.
- **IGDS 457**: marco normativo de protección de datos.
- **Marco de contratación OIT** (wcms_768754): cláusulas 9 y 10.

---

*Documento preliminar para validación técnica.*
