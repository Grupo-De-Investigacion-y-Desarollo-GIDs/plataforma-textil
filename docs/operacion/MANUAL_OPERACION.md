# Manual de Operación — Plataforma Digital Textil (PDT)

Documento oficial para el uso operativo cotidiano de la plataforma por parte de los cuatro roles activos: Taller, Marca, Estado y Contenido.

---

## Alcance de este documento

Este manual describe la plataforma en el estado en el que se entrega, correspondiente a la versión publicada al momento del cierre del proyecto (rama `main` en producción y rama `develop` en el ambiente del piloto).

El plan de evolución de la plataforma (Documento Master V4 y sus anexos de narrativa consolidada) contempla funcionalidades adicionales que no fueron implementadas dentro del alcance de esta entrega. Esas funcionalidades quedan documentadas en el material de planificación como referencia para etapas futuras, y no están cubiertas por este manual. Cuando corresponde, se hace una nota puntual dentro de cada rol.

Este manual complementa al **Manual de Administración**, que describe el uso del panel `/admin` por parte del rol ADMIN. Los cuatro roles operativos que describe este documento (Taller, Marca, Estado, Contenido) son los que operan la plataforma en su función cotidiana. El rol ADMIN queda fuera de este documento.

---

## Índice

1. Introducción
2. Guía del Taller
3. Guía de la Marca
4. Guía del Estado
5. Guía del Contenido
6. Preguntas frecuentes y escalamiento

---

## 1. Introducción

### 1.1 Qué es la Plataforma Digital Textil

La Plataforma Digital Textil (PDT) es una plataforma web que vincula a los actores del sector textil argentino, con foco inicial en el Conurbano bonaerense. Tres funciones principales conviven en el mismo sistema:

- Un espacio profesional donde los **talleres textiles** presentan sus capacidades, avanzan en su recorrido de formalización y encuentran oportunidades de trabajo.
- Un canal donde las **marcas** buscan talleres verificados, publican pedidos y coordinan la producción.
- Un panel donde el **equipo institucional del Estado** hace seguimiento del sector, aprueba trámites, coordina auditorías presenciales y accede a reportes agregados.

Además, un rol de **contenido** gestiona el material educativo de la Academia y las comunicaciones editoriales de la plataforma.

El proyecto es desarrollado por UNTREF con el apoyo de la Organización Internacional del Trabajo (OIT), en el marco de una intervención sectorial que busca reducir la informalidad laboral y facilitar la formalización progresiva de los talleres.

### 1.2 Los cuatro roles operativos

| Rol | Quiénes lo usan | Función principal |
|---|---|---|
| **Taller** | Personas responsables de talleres textiles (unidades productivas). | Cargar el perfil productivo, avanzar en la formalización, mostrar la vidriera, cotizar pedidos. |
| **Marca** | Personas que representan empresas de indumentaria o marcas comerciales. | Buscar talleres, publicar pedidos, coordinar la producción. |
| **Estado** | Equipo institucional que acompaña el sector (representantes de organismos públicos, referentes sectoriales). | Aprobar documentación, coordinar auditorías, consultar dashboards, exportar reportes. |
| **Contenido** | Equipo responsable de la Academia y de las novedades editoriales. | Cargar cursos, evaluaciones y novedades del sector; enviar comunicaciones editoriales. |

Un mismo usuario puede tener más de un rol activo simultáneamente (por ejemplo, una persona que dirige un taller y también trabaja institucionalmente en el Estado). En ese caso, la plataforma incluye un selector que permite cambiar el "modo" con el que se opera, sin necesidad de tener dos cuentas separadas.

### 1.3 Nota sobre el rol Estado y su evolución

En el estado actual de la plataforma, el rol se denomina **Estado**: así aparece en el panel, en la navegación y en las rutas de acceso. En la planificación futura (Documento Master V4 y narrativa consolidada) se contempla su renombramiento a **Coordinación**, junto con su desdoblamiento en dos sub-perfiles:

- **Coordinación Político**: definirá los criterios institucionales, las etapas de formalización, los umbrales y las plantillas de respuesta.
- **Coordinación Operativo**: trabajará los casos individuales, revisará documentación, aprobará avances y dejará observaciones de campo.

Estos cambios **no están implementados** en la versión que documenta este manual. Toda la funcionalidad descripta en la Sección 4 se refiere al rol Estado tal como opera hoy, sin la separación por sub-perfiles.

Corresponde una aclaración que evita confusión al operar. Las comunicaciones que la plataforma envía a los talleres —correos y mensajes— se firman como **"Equipo de Coordinación"**, y algunos avisos dentro de la aplicación mencionan a "la Coordinación" al referirse a quien aprueba o revisa. Es una convención de redacción adoptada para no dirigirse a los talleres en nombre del "Estado", no un renombre del rol. El taller que recibe un correo firmado por Coordinación y el equipo que opera bajo el rol Estado son el mismo.

### 1.4 Cómo acceder a la plataforma

La plataforma se accede desde cualquier navegador web actualizado (Chrome, Firefox, Edge o Safari) desde computadora o dispositivo móvil.

1. Ingresar a la dirección: `https://plataformatextil.com.ar` (o el dominio que se comunique institucionalmente).
2. Hacer clic en **Iniciar sesión** en el encabezado.
3. Ingresar credenciales (email y contraseña, o mediante Google, o mediante enlace mágico enviado al email).
4. Una vez autenticado, la plataforma redirige al usuario al panel correspondiente a su rol.

Si el usuario todavía no tiene cuenta, puede registrarse desde **Soy taller** o **Soy marca** en la página pública, según corresponda. Los roles Estado y Contenido no se registran de forma pública: son asignados por administración.

### 1.5 Cómo pedir ayuda

Tres canales disponibles:

- **Ayuda dentro de la plataforma**: enlace "Ayuda" en el menú personal (accesible desde cualquier pantalla). Contiene una guía inicial de uso, preguntas frecuentes y datos de contacto.
- **Widget de feedback**: botón flotante en la esquina inferior derecha de cualquier pantalla. Permite reportar bugs, sugerencias, dudas o pedidos de funcionalidad. Cada feedback queda registrado en el panel de administración con el contexto de la página desde donde se envió.
- **Contacto directo**: email y WhatsApp de soporte configurados institucionalmente. Están visibles en la sección de Ayuda y en el pie de página de la plataforma.

### 1.6 Convenciones del manual

- Los nombres de secciones, botones o enlaces que aparecen en la plataforma se muestran en **negrita**.
- Las URL o rutas internas van entre `backticks`.
- Las notas al margen y consideraciones importantes van marcadas explícitamente.
- Cuando una funcionalidad puede evolucionar (por ejemplo, el rol Estado a Coordinación), se aclara puntualmente en la sección correspondiente.

---

## 2. Guía del Taller

Esta sección describe cómo un taller usa la plataforma día a día: desde el registro inicial hasta la operación cotidiana con marcas, cursos y trámites de formalización.

### 2.1 Registro y verificación de CUIT

**Objetivo**: crear la cuenta del taller en la plataforma y verificar que su CUIT esté activo ante ARCA (ex-AFIP).

**Cómo hacerlo**:

1. Desde la página principal pública, hacer clic en **Soy taller**.
2. Completar los datos básicos del registro: nombre del taller, email, teléfono, CUIT.
3. Elegir contraseña o usar Google / enlace mágico (magic link enviado al email).
4. La plataforma verifica automáticamente el CUIT contra el padrón de ARCA. Si el CUIT es válido, el registro queda confirmado y la cuenta habilitada.
5. Si el CUIT no puede verificarse en ese momento (por ejemplo, si ARCA está temporalmente caído), la cuenta entra en un **período de gracia de 60 días** durante el cual el taller puede acceder a la plataforma, aprender en la Academia y consultar recursos, aunque todavía no aparezca en el directorio público.

**Notas**:

- Un mismo CUIT no puede registrar dos cuentas separadas. Si el CUIT ya existe (por ejemplo, si el mismo taller también tiene rol de marca en la plataforma), se agrega el rol adicional a la cuenta existente, no se crea una nueva.
- Durante el período de gracia, el sistema reintenta la verificación de CUIT automáticamente todos los días. Si logra verificar antes de los 60 días, el taller queda activo. Si al finalizar los 60 días el CUIT sigue sin verificarse, la cuenta pasa a estado "pendiente de formalización" y no puede operar hasta corregir el dato.
- El taller también puede corregir el CUIT desde su cuenta o pedir ayuda al equipo de coordinación en caso de que ARCA haya rechazado un CUIT que el taller considera válido.

### 2.2 Completar el perfil productivo (wizard)

**Objetivo**: cargar la información sobre el taller que permite hacer matching con marcas y calcular la capacidad productiva.

**Cómo llegar**: menú principal → **Mi taller** → botón **Completar perfil**, o desde `/taller/perfil/completar`.

**Cómo hacerlo**:

El perfil se carga con un formulario guiado (wizard) que recorre los siguientes bloques temáticos, uno por uno:

1. **Datos básicos del taller**: nombre público, descripción, año de fundación, ubicación (provincia y partido).
2. **Equipo de trabajo**: cantidad de trabajadores por categoría de experiencia (aprendices, medio oficial, oficial, oficial calificado).
3. **Organización productiva**: cómo está organizado el trabajo (por ejemplo, si trabajan por células, en línea, o mixto).
4. **Espacio físico**: metros cuadrados aproximados y descripción del lugar de trabajo.
5. **Maquinaria**: máquinas disponibles y cantidad de cada tipo.
6. **Roles funcionales del taller**: qué tareas realiza el taller (Moldería, Tizado, Corte, Confección, Terminación y planchado, Control de calidad, Coordinación, Administración, Compras, Logística).
7. **Capacidad productiva**: disponibilidad para tomar nuevos pedidos y posibilidades de escalar (ampliando turnos, contratando, tercerizando, invirtiendo en maquinaria).
8. **Registro productivo**: si el taller lleva registro de su producción diaria y con qué sistema (papel, planilla, sistema informático, sin registro sistemático).
9. **Tipo de prendas y procesos**: qué prendas puede confeccionar el taller, y qué procesos ofrece (corte, confección, planchado, etiquetado, etc.).
10. **Tiempo estándar de confección**: tiempo aproximado que le lleva al taller confeccionar la prenda que produce con más frecuencia. Es un dato clave para calcular capacidad de producción.

**Notas**:

- El formulario se puede completar por partes: cada bloque se guarda al avanzar. Si el taller cierra sesión antes de terminar, puede retomar desde donde dejó.
- Los datos cargados en el perfil se usan para: (a) calcular la capacidad productiva mensual estimada, (b) hacer matching automático con pedidos de marcas, (c) mostrar la vidriera pública, (d) generar datos sectoriales agregados (anónimos) para reportes institucionales.
- El perfil se puede editar en cualquier momento desde **Mi taller** → **Editar datos básicos** o desde los sub-tabs específicos de cada área.
- **Mi taller** se organiza en tres sub-tabs: **Datos básicos** (identidad, contacto y ubicación), **Mi gestión productiva** (uso interno, ver 2.5) y **Mi vidriera** (lo que ven las marcas, ver 2.4). La cabecera muestra el nombre del taller y la navegación entre los tres. En los formularios de carga y edición la navegación se oculta, para no perder el contexto de la tarea en curso.

### 2.3 Recorrido de formalización

**Objetivo**: subir progresivamente la documentación que acredita el nivel de formalización del taller (inscripción en ARCA, habilitaciones municipales, ART, altas de empleados, etc.), y avanzar por las tres etapas del recorrido.

**Cómo llegar**: menú principal → **Mi recorrido**, o desde `/taller/formalizacion`.

**Cómo hacerlo**:

La pantalla muestra un checklist con los requisitos de formalización, agrupados por etapa. Para cada requisito, el taller puede:

1. Leer una explicación breve del trámite (qué es, para qué sirve, dónde se hace, costo aproximado).
2. Subir el documento correspondiente desde el botón **Subir documento**.
3. Ver el estado de validación de cada documento: pendiente de revisión, aprobado, rechazado (con motivo), o con pedido de aclaración.

Cuando un documento se aprueba, el requisito queda marcado como cumplido. A medida que se acumulan requisitos aprobados, el taller avanza automáticamente por las tres etapas:

- **Etapa inicial** — Los primeros datos y la verificación de ARCA.
- **En proceso de formalización** — Documentación adicional cargada y validada.
- **Formalización consolidada** — Todos los requisitos principales verificados.

**Notas**:

- La aprobación de documentos la realiza el equipo del Estado, no es automática. Los tiempos de respuesta dependen de la carga de trabajo del equipo (habitualmente entre uno y cinco días hábiles).
- Si un documento es rechazado, el motivo se muestra en la misma pantalla junto al documento. El taller puede subir una nueva versión corregida.
- Cada acción sobre un documento (subida, aprobación, rechazo) queda registrada con fecha, autor y motivo. El historial es accesible desde la ficha del documento.
- La plataforma no reemplaza los trámites externos (inscribirse en ARCA, sacar la habilitación municipal, etc.). Los talleres deben hacerlos por los canales oficiales y luego subir la constancia a la plataforma.

### 2.4 Mi vidriera pública

**Objetivo**: mostrar el perfil del taller a las marcas que exploran el directorio público, con la información que el taller quiere hacer visible.

**Cómo llegar**: menú principal → **Mi taller** → sub-tab **Vidriera**, o desde `/taller/perfil/vidriera`.

**Cómo hacerlo**:

La vidriera es la forma en que se ve el taller cuando una marca lo encuentra en el directorio. Se organiza en bloques que reflejan las capacidades y credenciales del taller. Desde esta pantalla, el taller puede:

1. Ver una vista previa de cómo lo perciben las marcas, con el botón **Ver cómo me ve el directorio**.
2. Cargar una descripción libre del taller, sus valores, su historia, aspectos diferenciales.
3. Subir imágenes representativas del taller (opcional).
4. Decidir, bloque por bloque, qué información se muestra públicamente y cuál queda reservada.

**Qué bloques puede mostrar u ocultar**

El taller controla la visibilidad de once bloques mediante un interruptor por cada uno:

| Bloque | Qué muestra |
|---|---|
| Formación | Credenciales obtenidas en la Academia |
| Equipo de trabajo | Composición del equipo por categoría de experiencia |
| Espacio físico | Metros cuadrados y descripción del lugar |
| Capacidad productiva | Capacidad estimada y disponibilidad |
| Organización del trabajo | Cómo está organizada la producción |
| Maquinaria | Máquinas disponibles y cantidades |
| Procesos | Qué procesos ofrece el taller |
| Prendas | Qué prendas puede confeccionar |
| Año de fundación | Antigüedad del taller |
| Portfolio | Imágenes cargadas |
| Inscripción tributaria | Tipo de inscripción (monotributista o responsable inscripto) |

**Reglas que conviene conocer antes de usar los interruptores**:

- **Todo se muestra por defecto.** Un bloque solo deja de verse si el taller lo apaga explícitamente. Los talleres que ya existían antes de esta funcionalidad siguen mostrando todo, como hasta ahora.
- **El tiempo estándar de confección nunca se publica.** Aunque el bloque de capacidad esté visible, ese dato no aparece en la vidriera pública en ningún caso. Solo lo ven el propio taller y el equipo institucional. La razón es que permite calcular el costo de mano de obra del taller.
- **La etapa de formalización y la verificación de ARCA no se pueden ocultar.** No tienen interruptor: son la base de confianza sobre la que las marcas consultan el directorio.
- **De la inscripción tributaria se muestra solo el tipo, nunca la categoría.** La categoría revela indirectamente una franja de facturación.
- **Dentro de Formación se puede elegir credencial por credencial.** Además del interruptor general del bloque, cada credencial de la Academia tiene su propio control. Si el bloque general está apagado, no se muestra ninguna, con independencia de los controles individuales.
- Cada bloque indica **cuándo se editó por última vez**, para detectar información desactualizada.

> **Advertencia importante.** Si el taller apaga **al mismo tiempo** los bloques *Procesos* y *Prendas*, deja de aparecer en el directorio público. Para figurar en el listado, la plataforma exige que al menos uno de los dos esté visible con contenido cargado: son los datos que permiten a una marca entender qué hace el taller. La vidriera sigue existiendo y es accesible por enlace directo, pero el taller no aparece en las búsquedas. Si un taller reporta que "desapareció del directorio", este es el primer punto a revisar.

**Qué se necesita para aparecer en el directorio**

Además de los bloques anteriores, la plataforma exige un mínimo de información —la *vidriera mínima*— para incluir a un taller en el directorio público:

1. **CUIT verificado** ante ARCA.
2. **Descripción** de al menos 50 caracteres.
3. **Ubicación** declarada, con provincia y partido.
4. **Al menos un rubro o proceso** cargado y visible.

Si falta alguno, la propia pantalla de Mi vidriera muestra un aviso indicando qué completar. No hace falta averiguarlo por otra vía.

**Notas**:

- Los datos verificados institucionalmente (etapa de formalización, verificación de ARCA, credenciales de la Academia) se muestran automáticamente y no requieren acción del taller.
- La fotografía del taller es **opcional** durante el piloto: los talleres sin imagen aparecen igualmente en el directorio, con una imagen institucional de reemplazo.
- La sección "Descripción" es texto libre y conviene mantenerla actualizada: es el primer contacto que una marca tiene con el taller, y además cuenta para el mínimo de 50 caracteres.

### 2.5 Mi gestión productiva

**Objetivo**: espacio interno del taller para llevar registro de su propia producción, sin exposición pública.

**Cómo llegar**: menú principal → **Mi taller** → sub-tab **Gestión productiva**, o desde `/taller/perfil/gestion`.

**Cómo hacerlo**:

Esta sección es privada del taller: no la ven las marcas ni aparece en el directorio. El equipo del Estado puede consultarla como parte de su acompañamiento, pero no la publica.

Permite ver y organizar información productiva propia del taller: composición del equipo, maquinaria, espacio, capacidad estimada, y demás datos cargados durante el wizard.

**Notas**:

- La separación entre vidriera (pública) y gestión productiva (privada) permite que el taller cargue información sensible sin exponerla necesariamente al mercado.
- Cambiar información desde este sub-tab actualiza los datos internos. Si algún cambio afecta información que también aparece en la vidriera pública, la vidriera se actualiza al mismo tiempo.

### 2.6 Academia — cursos, evaluaciones y certificados

**Objetivo**: capacitarse en temas clave del sector (formalización, costos, calidad, negociación, uso de la plataforma) y obtener certificados que suman al perfil profesional.

**Cómo llegar**: menú principal → **Cursos**, o desde `/taller/aprender`.

**Cómo hacerlo**:

La Academia se organiza en **colecciones** de cursos. Cada colección contiene material audiovisual y termina con una evaluación de opción múltiple.

**Los cursos de formalización.** El corpus formativo inicial de la plataforma sigue una ruta de siete cursos que **se corresponden uno a uno con los pasos del recorrido de formalización** descripto en 2.3:

| Curso | Paso del recorrido que acompaña |
|---|---|
| 1 | Monotributo |
| 2 | Habilitación |
| 3 | ART |
| 4 | Alta temprana |
| 5 | Prevención contra incendios |
| 6 | Seguridad e higiene |
| 7 | Libro de Sueldos Digital |

La correspondencia es la lógica central de la Academia: cuando el taller encuentra un requisito del recorrido que no sabe cómo cumplir, hay un curso que lo explica. Cada curso parte de una situación concreta del taller antes de introducir la terminología oficial, distingue las fases de preparación, ejecución, confirmación y seguimiento, y cierra con las fuentes oficiales del trámite.

Los materiales incluyen subtítulos y están pensados para recorridos breves y retomables, con lectura posible desde el teléfono.

Pasos típicos:

1. Explorar el catálogo de colecciones disponibles.
2. Elegir una colección y ver el material en orden.
3. Al terminar, rendir la evaluación asociada. Se requiere superar un puntaje mínimo (configurado por la coordinación) para aprobar.
4. Si aprueba, la plataforma emite un **certificado** con nombre del taller, fecha, calificación y código único. El certificado queda en el perfil del taller y aparece como una credencial en la vidriera.

**Notas**:

- Los certificados se pueden descargar en PDF desde el propio perfil o desde la sección de la Academia.
- Si el taller no aprueba la evaluación, puede volver a intentarlo. No hay límite de intentos.
- El taller decide qué credenciales muestra en su vidriera pública, una por una (ver 2.4).
- Los cursos remiten a procedimientos y montos que cambian con el tiempo. Cada uno indica su fecha de vigencia: ante una diferencia con lo que informa el organismo, prevalece la fuente oficial.
- **El acceso a la Academia no depende de la verificación de CUIT.** Un taller en período de gracia, o cuya cuenta pasó a pendiente de formalización, conserva el acceso a los cursos y puede seguir capacitándose. La restricción alcanza solo a la operación comercial.
- Si un certificado es revocado (por ejemplo, por detección de irregularidad), el taller es notificado y pierde la credencial correspondiente. Los certificados revocados no se eliminan del sistema, quedan marcados en el historial.

### 2.7 Pedidos — encontrar oportunidades y cotizar

**Objetivo**: encontrar pedidos publicados por marcas, evaluar si el taller puede realizarlos, y postularse (cotizar) cuando corresponda.

**Cómo llegar**: menú principal → **Pedidos**, o desde `/taller/pedidos`.

**Cómo hacerlo**:

La sección se divide en dos vistas:

- **Pedidos disponibles**: pedidos publicados por marcas que coinciden con las capacidades declaradas por el taller (según el perfil productivo). Cada pedido muestra el tipo de prenda, cantidad estimada, servicios requeridos, plazo, y datos generales de la marca solicitante.
- **Mis pedidos**: pedidos en los que el taller ya está participando o participó (activos, en producción, completados, cancelados).

Para cotizar un pedido disponible:

1. Abrir el detalle del pedido.
2. Revisar las especificaciones (tipo de prenda, cantidad, servicios, fecha requerida, documentación disponible como moldes o fichas técnicas).
3. Enviar una cotización con precio y condiciones. La marca recibe la propuesta y decide si acepta.
4. Si la marca acepta, el pedido pasa a estado "en ejecución" y se genera una orden de producción con seguimiento.

**Notas**:

- No todos los talleres ven todos los pedidos. La plataforma filtra los pedidos según el perfil del taller (tipos de prenda declarados, servicios ofrecidos, ubicación, capacidad, etc.). Si un taller no ve pedidos, puede revisar y ampliar los datos de su perfil productivo.
- La comunicación posterior a la aceptación (envío de moldes, coordinación logística, entrega) puede continuar dentro o fuera de la plataforma, según lo que acuerden marca y taller.
- La plataforma no gestiona pagos ni facturación. Es un espacio para generar el contacto y coordinar; la transacción comercial se realiza por fuera.

### 2.8 Notificaciones y comunicación

Cada acción relevante genera una notificación para el taller: aprobación o rechazo de documentos, nuevos pedidos disponibles, mensajes de marcas, certificados emitidos, novedades institucionales.

Las notificaciones se ven desde:

- **Campana de notificaciones** en el encabezado superior, con contador de mensajes sin leer.
- **Notificaciones** en el menú personal, con la lista completa.
- **Email**, cuando el envío por email está configurado para el tipo de notificación.
- **WhatsApp**, en algunos casos, mediante un enlace click-to-chat que abre el mensaje pre-cargado.

El taller puede también enviar mensajes al equipo de coordinación (Estado) desde su cuenta, para consultas puntuales sobre trámites o dudas del uso de la plataforma.

---

## 3. Guía de la Marca

Esta sección describe cómo una marca usa la plataforma día a día: desde el registro inicial hasta la publicación de pedidos y la coordinación con talleres.

### 3.1 Registro y creación de cuenta

**Objetivo**: crear la cuenta institucional de la marca en la plataforma.

**Cómo hacerlo**:

1. Desde la página principal pública, hacer clic en **Soy marca**.
2. Completar los datos del registro: nombre de la marca / empresa, email institucional, teléfono de contacto, CUIT de la empresa.
3. Elegir contraseña o usar Google / enlace mágico enviado al email.
4. La plataforma verifica el CUIT contra el padrón de ARCA. Una vez confirmado, la cuenta queda habilitada.

**Notas**:

- El CUIT de la marca se verifica igual que en el caso de los talleres. El sistema aplica el mismo período de gracia de 60 días si la verificación no puede completarse en el momento del registro.
- Un mismo CUIT puede tener rol de marca y rol de taller simultáneamente (por ejemplo, una empresa de indumentaria con producción propia que también terceriza). En ese caso, la cuenta tiene los dos perfiles y se puede alternar el modo desde el selector del encabezado.

### 3.2 Completar el perfil de marca

**Objetivo**: cargar la información institucional y comercial de la marca para que los talleres puedan conocerla al recibir pedidos.

**Cómo llegar**: menú principal → **Mi marca**, o desde `/marca/perfil`.

**Cómo hacerlo**:

Desde esta sección la marca puede cargar y editar:

- Nombre público de la marca (puede diferir de la razón social).
- Descripción de la marca, valores, historia, rubro.
- Ubicación (provincia y partido).
- Sitio web y datos de contacto públicos.
- Referente / persona de contacto para el vínculo con talleres.

**Notas**:

- El perfil de marca es más simple que el de taller: no incluye wizard extenso ni cálculos de capacidad.
- Los datos cargados aquí son visibles para los talleres cuando reciben un pedido de esta marca. Se recomienda mantener actualizada al menos la descripción y el referente, porque son los primeros elementos de confianza.

### 3.3 Explorar talleres (directorio)

**Objetivo**: buscar talleres disponibles en la red, aplicar filtros y ver su perfil para evaluar potenciales proveedores.

**Cómo llegar**: menú principal → **Explorar talleres**, o desde `/marca/directorio`.

**Cómo hacerlo**:

La pantalla muestra el directorio de talleres verificados en la plataforma. Cada taller aparece con:

- Nombre y ubicación.
- Etapa de formalización actual (Etapa inicial, En proceso, Consolidada).
- Verificación de ARCA (badge visible cuando corresponde).
- Tipos de prenda que hace y servicios que ofrece.
- Certificados de la Academia obtenidos.

Filtros disponibles:

- **Rubro / tipo de prenda**: para buscar talleres que hacen la prenda específica que la marca necesita.
- **Servicios ofrecidos**: por ejemplo, talleres que hacen corte, o que hacen prenda completa incluida terminación.
- **Ubicación**: por provincia y partido.

Al hacer clic en un taller, se abre su vidriera pública con toda la información que el taller decidió hacer visible.

**Notas**:

- El directorio muestra solo talleres con CUIT verificado por ARCA. Los talleres en período de gracia (aún sin verificar) no aparecen.
- Los datos productivos internos del taller (composición del equipo, maquinaria detallada, capacidad estimada) pueden no estar visibles en la vidriera pública, según lo que cada taller haya decidido publicar.
- Si un taller que interesa no aparece con determinado filtro, puede ser porque no declaró esa capacidad en su perfil. Vale la pena revisar sin filtros o buscar por nombre directo.

### 3.4 Publicar un pedido

**Objetivo**: publicar una necesidad de producción para que los talleres compatibles puedan verla y cotizar.

**Cómo llegar**: menú principal → **Pedidos** → botón **Nuevo pedido**, o directamente desde `/marca/pedidos/nuevo`.

**Cómo hacerlo**:

Al crear un pedido nuevo, la marca completa un formulario con:

- **Tipo de prenda** (del nomenclador de la plataforma).
- **Cantidad estimada** de unidades.
- **Curva de talles** (texto o tabla, ej. "S/M/L/XL con 20% M y 30% L").
- **Especificaciones adicionales** (texto libre: color, materiales, detalles constructivos).
- **Servicios requeridos** (selección múltiple: corte, confección, terminación, planchado, etiquetado, empaque).
- **Fecha requerida** de entrega.
- **Documentación disponible** para el taller (ficha técnica, molde, muestra física, tabla de medidas): la marca declara qué tiene disponible aunque no lo suba al momento.

Una vez completados los datos, el pedido puede guardarse como **borrador** (no visible para talleres) o publicarse (visible para talleres compatibles).

**Notas**:

- Los archivos (fichas técnicas, moldes) no se suben directamente a la plataforma en esta versión: la marca declara qué tiene disponible y se coordina el envío por fuera cuando se acepta la cotización.
- Un pedido publicado puede editarse mientras no haya sido aceptado por un taller. Después de la aceptación, cambios sustanciales requieren cancelar y publicar uno nuevo.
- La plataforma notifica automáticamente a los talleres cuyo perfil coincide con las especificaciones del pedido, para que puedan verlo y cotizar.

### 3.5 Recibir cotizaciones y elegir taller

**Objetivo**: revisar las propuestas que envían los talleres para el pedido publicado y elegir con qué taller trabajar.

**Cómo llegar**: menú principal → **Pedidos** → seleccionar el pedido → sección de cotizaciones recibidas.

**Cómo hacerlo**:

Cada pedido publicado acumula las cotizaciones que envían los talleres compatibles. Para cada cotización, la marca puede ver:

- Nombre del taller que cotiza.
- Precio propuesto y condiciones (plazo, forma de trabajo, observaciones).
- Perfil del taller (vidriera completa, con etapa, certificados, capacidades).

La marca elige la cotización que prefiere y confirma. Al aceptar:

1. El pedido pasa a estado "en ejecución".
2. Se genera una orden de producción con el taller seleccionado.
3. Ambas partes reciben la notificación y el detalle para coordinar la producción.
4. Las otras cotizaciones quedan como no aceptadas; los talleres son notificados.

**Notas**:

- La coordinación operativa posterior (envío de moldes, retiro de muestras, entrega final, facturación) se realiza dentro o fuera de la plataforma según acuerden marca y taller.
- La plataforma no gestiona pagos ni facturación. Es un espacio para generar el contacto y coordinar la producción.
- Si ningún taller cotizó en un plazo razonable, la marca puede revisar las especificaciones (probablemente son muy restrictivas) o contactar directamente a talleres del directorio.

### 3.6 Estados del pedido — ciclo de vida

Un pedido puede pasar por los siguientes estados:

- **Borrador**: la marca lo está armando, no es visible para talleres.
- **Publicado**: visible para talleres compatibles, recibiendo cotizaciones.
- **En ejecución**: se aceptó una cotización y el taller está produciendo.
- **Esperando entrega**: producción finalizada, pendiente logística / recepción.
- **Completado**: cerrado exitosamente.
- **Cancelado**: anulado antes de completarse (por decisión de la marca o intervención institucional).

Cada cambio de estado se registra en el historial del pedido, con fecha y responsable.

### 3.7 Notificaciones y comunicación

La marca recibe notificaciones automáticas cuando:

- Un taller envía una nueva cotización sobre un pedido publicado.
- Un taller solicita más información sobre un pedido.
- El equipo de coordinación (Estado) envía una comunicación institucional (por ejemplo, novedades de la plataforma, mantenimiento programado).

Las notificaciones se ven desde la campana del encabezado y la sección **Notificaciones** del menú personal. Según el tipo, también pueden llegar por email o WhatsApp.

La marca puede enviar mensajes a un taller específico desde el perfil del taller en el directorio, o al equipo de coordinación desde la sección de ayuda.

---

## 4. Guía del Estado

Esta sección describe cómo el equipo del Estado usa la plataforma para hacer seguimiento del sector, aprobar trámites, coordinar auditorías presenciales y obtener reportes agregados.

> **Nota sobre la evolución del rol**
>
> En la versión actual de la plataforma, este rol se denomina **Estado** y opera como un rol único con permisos completos sobre todas las funciones que se describen abajo.
>
> El plan de evolución (Documento Master V4 y narrativa consolidada) contempla:
>
> - Renombrar el rol a **Coordinación**.
> - Desdoblarlo en dos sub-perfiles con permisos diferenciados: **Coordinación Político** (definición de criterios, políticas y catálogos) y **Coordinación Operativo** (revisión y aprobación de casos individuales).
>
> Este cambio **no está implementado** en la versión que documenta este manual. Todo lo descripto abajo corresponde al rol Estado unificado tal como opera hoy.

### 4.1 Acceder al panel

**Cómo llegar**: iniciar sesión con una cuenta con rol Estado. La plataforma redirige automáticamente al Dashboard del rol (`/estado`).

El panel del Estado organiza el trabajo en ocho secciones accesibles desde el menú superior:

- **Dashboard**: vista general de indicadores del sector y actividad reciente.
- **Talleres**: listado y detalle de los talleres registrados.
- **Documentos**: cola de documentos cargados por talleres a revisar.
- **Etapas**: configuración de los criterios que definen cada etapa de formalización.
- **Auditorías**: programación y seguimiento de auditorías presenciales.
- **Demanda insatisfecha**: análisis de pedidos que quedaron sin cotización o sin match.
- **Datos sectoriales**: reportes agregados y visualizaciones del sector.
- **Exportar**: descarga de reportes en Excel para trabajo institucional.

### 4.2 Dashboard institucional

**Objetivo**: consultar de un vistazo el estado general del sector: cantidad de talleres registrados, distribución por etapas de formalización, actividad reciente y alertas relevantes.

**Cómo llegar**: `/estado` (pantalla de inicio al ingresar).

**Qué se ve**:

- Métricas principales: total de talleres, distribución por etapa, cantidad de documentos pendientes de aprobación, cantidad de auditorías programadas.
- Actividad reciente: acciones destacadas del sistema y del equipo.
- Alertas: talleres cuyo período de gracia está por vencer, documentos con mucho tiempo pendiente, etc.

**Notas**:

- El Dashboard es de consulta. Todas las acciones concretas se realizan desde las otras secciones (Talleres, Documentos, Auditorías).
- Los indicadores se actualizan al cargar la pantalla.

### 4.3 Talleres — consulta y seguimiento

**Objetivo**: consultar el listado de talleres registrados, buscar uno específico, y acceder al detalle completo de cada uno.

**Cómo llegar**: menú superior → **Talleres**, o desde `/estado/talleres`.

**Qué se ve**:

Listado de todos los talleres con:

- Nombre, CUIT, ubicación.
- Etapa actual de formalización.
- Verificación de ARCA (badge visible).
- Fecha de registro.
- Estado activo o inactivo.

Filtros disponibles por etapa y búsqueda por texto.

**Detalle de un taller**:

Al abrir el detalle de un taller se accede a:

- Datos generales del taller (perfil productivo, ubicación, contacto).
- Bloque de datos verificados por ARCA (tipo de inscripción, categoría, actividades, domicilio fiscal).
- Historial de documentos cargados y su estado.
- Historial de auditorías realizadas.
- Observaciones de campo asociadas al taller.
- Certificados de la Academia obtenidos.
- Notas internas (privadas del equipo institucional).

Desde el detalle también se pueden realizar acciones:

- Re-verificar el CUIT contra ARCA (si hubo cambios o el taller lo pidió).
- **Corregir el CUIT declarado por el taller**, cuando el número cargado tiene un error.
- Aprobar o rechazar documentos pendientes.
- Registrar una observación de campo.
- Cargar una nota interna del equipo.

**Corrección de CUIT — cuándo y cómo**

Es la vía de salida para los talleres cuyo CUIT no verifica. Los casos habituales son un error de tipeo al registrarse, o un CUIT correcto que ARCA rechazó por una situación transitoria.

1. Abrir el detalle del taller y usar la acción de corrección de CUIT.
2. Ingresar el número correcto. La plataforma admite el dato con o sin guiones, espacios o puntos: normaliza el formato automáticamente.
3. Al guardar, se dispara la verificación contra ARCA.
4. Si verifica, **la cuenta se reactiva sola**: un taller que estaba en período de gracia o en estado pendiente de formalización vuelve a estar activo, sin ninguna gestión adicional y sin pérdida de información.

Si el taller sostiene que su CUIT es válido y ARCA lo sigue rechazando, se puede reintentar la verificación desde la misma pantalla. La plataforma además reintenta automáticamente todos los días mientras dure el período de gracia.

**Notas**:

- Las notas internas son privadas del equipo del Estado. Los talleres no las ven.
- El historial de cambios de etapa de cada taller queda registrado con fecha y motivo. Es útil para reportes trimestrales y para responder consultas del propio taller sobre su recorrido.

### 4.4 Documentos — aprobación de trámites

**Objetivo**: revisar los documentos que los talleres suben en su recorrido de formalización y decidir si se aprueban, se rechazan (con motivo) o se pide una aclaración.

**Cómo llegar**: menú superior → **Documentos**, o desde `/estado/documentos`.

**Cómo hacerlo**:

La pantalla muestra la cola de documentos pendientes de revisión, ordenados por prioridad (por defecto, los más antiguos primero). Para cada documento se puede:

1. Ver el archivo subido (habitualmente PDF o imagen).
2. Comparar con los datos declarados por el taller (por ejemplo, si el CUIT del PDF coincide con el CUIT registrado, si el nombre del titular coincide).
3. Ver el historial de cargas anteriores del mismo documento (si es una re-carga después de un rechazo previo).
4. Tomar una decisión:
   - **Aprobar**: el requisito queda cumplido. El taller es notificado automáticamente.
   - **Rechazar**: se solicita motivo (por qué el documento no cumple). El taller recibe la notificación con el motivo y puede subir una nueva versión.
   - **Pedir aclaración**: se envía una pregunta al taller sin rechazar formalmente. El taller responde y luego se aprueba o rechaza.

**Notas**:

- Toda decisión queda registrada con quién la tomó y en qué fecha. Es la evidencia auditada del avance de formalización.
- Los criterios técnicos para aprobar/rechazar cada tipo de documento se apoyan en la configuración de etapas (Sección 4.5) y en criterios institucionales.
- Si el documento requiere validación externa (por ejemplo, un profesional matriculado), el equipo puede pedirla por fuera de la plataforma y luego cargar la aprobación.

### 4.5 Etapas de formalización — configuración

**Objetivo**: revisar y ajustar los criterios que definen cada etapa de formalización (qué requisitos cumplen para pasar de una etapa a la siguiente).

**Cómo llegar**: menú superior → **Etapas**, o desde `/estado/configuracion-niveles`.

**Qué se puede hacer**:

- Ver las tres etapas configuradas (Etapa inicial, En proceso, Consolidada).
- Ver qué requisitos son necesarios para cada etapa.
- Editar los criterios: qué documentos se requieren, cuáles son obligatorios y cuáles opcionales.
- Editar el texto que describe cada etapa (mensajes de acompañamiento que ven los talleres).

**Notas**:

- Cambiar los criterios impacta a los talleres nuevos y afecta el cálculo de etapa de todos los talleres existentes al recalcular. Se recomienda planificar los cambios y comunicarlos.
- En el plan de evolución esta función pasaría al perfil "Coordinación Político" (ver nota al inicio de esta sección).

### 4.6 Auditorías presenciales

**Objetivo**: programar visitas presenciales a talleres, dar seguimiento a las que están en curso y cargar los informes cuando se realizaron.

**Cómo llegar**: menú superior → **Auditorías**, o desde `/estado/auditorias`.

**Cómo hacerlo**:

La pantalla se organiza en tres bloques:

- **Próximas auditorías**: las que están programadas y todavía no se realizaron.
- **Pendientes de informe**: las que se realizaron pero cuyo informe no se cerró aún. Aparecen marcadas en amarillo.
- **Historial**: auditorías completadas y canceladas.

Para programar una nueva auditoría:

1. Botón **Nueva auditoría** en la parte superior.
2. Elegir taller, fecha y hora, tipo de auditoría (Primera visita, Verificación de habilitaciones, Seguimiento, Re-auditoría), auditor asignado.
3. Guardar. La auditoría queda en "Próximas".

Para cargar el informe de una auditoría realizada:

1. En "Pendientes de informe", hacer clic en **Cargar informe** de la auditoría correspondiente.
2. Completar resultado (Conforme, No conforme con observaciones, etc.).
3. Cargar acciones correctivas requeridas si corresponde, con fecha límite y responsable.
4. Adjuntar observaciones y evidencia si hace falta.
5. Marcar como completada. El estado pasa a "Completada" en el historial.

**Notas**:

- Las auditorías presenciales son gestión operativa del equipo del Estado. El panel del Admin puede verlas de manera consultiva, pero la operación diaria se hace desde `/estado/auditorias`.
- Las acciones correctivas quedan asociadas al taller y se pueden consultar desde su ficha. Sirven para el seguimiento de la re-auditoría posterior.

### 4.7 Observaciones de campo

**Objetivo**: cargar el registro cualitativo del piloto — todo lo que el equipo observa en visitas, llamadas, entrevistas y contactos con talleres o marcas.

**Cómo llegar**: desde el detalle de un taller o desde la sección **Observaciones** del panel de administración (algunas versiones tienen acceso directo desde `/estado`).

**Cómo hacerlo**:

Cada observación se carga con:

- **Título** breve.
- **Contenido** libre.
- **Tipo**: Resistencia, Expectativa, Dificultad técnica, Dificultad de proceso, Oportunidad, Éxito, Contexto taller, Contexto marca, Política pública.
- **Fuente**: Visita, Llamada, WhatsApp, Plataforma, Entrevista, Otros.
- **Sentimiento**: Positivo, Neutral, Negativo.
- **Importancia** (1 a 5 estrellas).
- **Tags** libres para agrupar por temas (ej. `cultural`, `fiscal`, `género`).
- **Fecha del evento** y **usuario asociado** (opcional, si aplica a un taller/marca puntual).

**Notas**:

- Las observaciones alimentan el reporte a OIT. Es la evidencia cualitativa del piloto.
- El material se puede filtrar por tipo, fuente, período y tags para armar informes por temáticas.
- El equipo puede descargar un **reporte mensual** consolidado desde la propia sección de observaciones.

### 4.8 Demanda insatisfecha

**Objetivo**: analizar los pedidos que no encontraron taller adecuado, para identificar oportunidades de capacitación, ampliación de servicios o incorporación de nuevos talleres al piloto.

**Cómo llegar**: menú superior → **Demanda insatisfecha**, o desde `/estado/demanda-insatisfecha`.

**Qué se ve**:

Listado de pedidos publicados por marcas que:

- No recibieron cotizaciones en el plazo esperado.
- Fueron cancelados por la marca por falta de respuesta.
- Recibieron cotizaciones que no se concretaron.

Con esta información el equipo puede detectar:

- Tipos de prenda o servicios que están sin cubrir (oportunidad para orientar la capacitación).
- Regiones sin talleres suficientes (oportunidad de sumar actores).
- Requisitos de las marcas que los talleres actuales no pueden cumplir.

### 4.9 Datos sectoriales

**Objetivo**: consultar reportes agregados del sector: distribución geográfica, composición del equipo, capacidad productiva, tipos de prenda predominantes, entre otros.

**Cómo llegar**: menú superior → **Datos sectoriales**, o desde `/estado/sector`.

**Qué se ve**:

Visualizaciones agregadas y anónimas del universo de talleres del piloto. Sirven para armar el mapa vivo del sector y para el reporte a OIT.

**Notas**:

- Los datos son agregados y no identifican talleres individuales. Cumple con los criterios de protección de datos personales.
- Las visualizaciones se generan a partir de los datos que los talleres cargaron en su perfil productivo.

### 4.10 Exportar reportes

**Objetivo**: descargar información en formato Excel para trabajo institucional (informes, presentaciones, análisis externo).

**Cómo llegar**: menú superior → **Exportar**, o desde `/estado/exportar`.

**Qué se puede exportar**:

- Listado de talleres (con o sin filtros por etapa).
- Listado de documentos aprobados / rechazados en un período.
- Informe mensual de observaciones de campo.
- Reportes ARCA con datos verificados.
- Otros reportes específicos según el catálogo disponible.

**Notas**:

- Los archivos exportados son en formato Excel (`.xlsx`) para facilitar el trabajo posterior.
- Los exportes que contienen datos personales requieren tratamiento cuidadoso: las políticas institucionales de OIT y UNTREF sobre uso de datos aplican.

---

## 5. Guía del Contenido

Esta sección describe cómo el rol Contenido gestiona el material educativo de la Academia y las comunicaciones editoriales de la plataforma.

### 5.1 Acceder al panel

**Cómo llegar**: iniciar sesión con una cuenta con rol Contenido. La plataforma redirige al panel de Contenido (`/contenido`).

El panel tiene un menú lateral con cuatro secciones:

- **Novedades**: gestión del CMS de novedades sectoriales que se muestran en la landing pública y a los usuarios.
- **Colecciones**: gestión de las colecciones de cursos de la Academia (crear, editar, agregar videos).
- **Evaluaciones**: gestión de los quizzes vinculados a cada colección.
- **Notificaciones**: envío de comunicaciones editoriales a los usuarios de la plataforma.

### 5.2 Novedades — CMS

**Objetivo**: publicar y gestionar novedades del sector textil y de la plataforma, que se muestran en la landing pública y en el dashboard de los usuarios logueados.

**Cómo llegar**: menú lateral → **Novedades**, o desde `/contenido/novedades`.

**Cómo hacerlo**:

Desde la pantalla se ven todas las novedades cargadas y su estado. Para crear una novedad nueva:

1. Botón **Nueva novedad** (parte superior).
2. Completar título, resumen, contenido completo, categoría (por ejemplo, Academia, Sector, Institucional), imagen destacada (opcional).
3. Definir fecha de publicación.
4. Guardar como borrador o publicar directamente.

Para editar una novedad existente, hacer clic en su fila y modificar los campos desde el formulario de edición.

**Notas**:

- Las novedades publicadas aparecen en el carrusel de la landing pública y en la sección de novedades del dashboard de talleres y marcas.
- Las novedades pueden despublicarse en cualquier momento (pasarlas a borrador) si se detecta un error o si ya no son vigentes.
- La imagen destacada es opcional pero recomendada; le da presencia visual al item en el carrusel.

### 5.3 Colecciones — Academia

**Objetivo**: gestionar las colecciones de cursos que integran la Academia (temas, videos, orden, publicación).

**Cómo llegar**: menú lateral → **Colecciones**, o desde `/contenido/colecciones`.

**Cómo hacerlo**:

La pantalla muestra todas las colecciones existentes (publicadas y en borrador). Para crear una nueva:

1. Botón **Nueva colección**.
2. Completar título, descripción, categoría, institución que avala el contenido, duración estimada.
3. Guardar. La colección queda en estado Borrador.
4. Desde el detalle de la colección se pueden agregar videos (uno por uno) desde el sub-flujo **Videos**.

**Agregar videos a una colección**:

1. Ir al detalle de la colección → sección de videos.
2. Pegar la URL de YouTube del video.
3. La plataforma valida la URL y muestra una vista previa embebida para confirmar visualmente.
4. Cargar el título del video en la plataforma (puede diferir del título original de YouTube) y la duración estimada.
5. Confirmar el checklist de verificación de contenido (contenido preciso y actualizado, audio claro, sin publicidad invasiva).
6. Guardar. El video queda incorporado a la colección.

**Publicar una colección**:

Desde la edición de la colección, cambiar el estado de Borrador a Publicada. A partir de ese momento, la colección es visible para todos los talleres en la Academia.

**Notas**:

- Solo se aceptan videos de YouTube. No hay carga directa de video ni soporte para otras plataformas.
- La cantidad y el orden de videos se puede editar en cualquier momento desde la sección de videos de la colección.
- Cambiar de Publicada a Borrador oculta la colección para los talleres, pero los certificados ya emitidos siguen siendo válidos.

### 5.4 Evaluaciones — quiz de las colecciones

**Objetivo**: gestionar los cuestionarios de opción múltiple que los talleres deben aprobar para obtener el certificado de una colección.

**Cómo llegar**: menú lateral → **Evaluaciones**, o desde `/contenido/evaluaciones`.

**Cómo hacerlo**:

1. Seleccionar la colección deseada desde el selector superior.
2. Si la colección aún no tiene evaluación, aparece la opción de crear una nueva.
3. Configurar el **puntaje mínimo** para aprobar (porcentaje, por defecto 60%).
4. Agregar preguntas una por una:
   - Enunciado de la pregunta.
   - Opciones de respuesta (mínimo 2, máximo 4).
   - Marcar la opción correcta.
   - Escribir una explicación opcional que se muestra al taller cuando termina de rendir.
5. Guardar la evaluación completa desde el botón inferior.

**Notas**:

- Cada colección puede tener una única evaluación (o ninguna).
- Los cambios en las preguntas se guardan solo cuando se hace clic en el botón inferior de guardar. Si se cambia de colección antes de guardar, los cambios se pierden.
- Si se modifica una evaluación, los certificados ya emitidos no se ven afectados. La nueva versión aplica a los talleres que rindan a partir de ese momento.

### 5.5 Notificaciones editoriales

**Objetivo**: enviar comunicaciones editoriales a los usuarios de la plataforma desde el rol Contenido (por ejemplo, anuncios de nuevos cursos, recordatorios de capacitación, avisos sobre novedades).

**Cómo llegar**: menú lateral → **Notificaciones**, o desde `/contenido/notificaciones`.

**Cómo hacerlo**:

Similar al envío de comunicaciones desde el panel del Admin: se selecciona un segmento de destinatarios (talleres, marcas, o subconjuntos), se elige el canal (in-app, email), se redacta el mensaje y se envía.

**Notas**:

- Este envío desde el rol Contenido se usa para comunicación editorial / educativa. Las comunicaciones operativas o institucionales las envía el Admin desde el panel `/admin`.
- Todo envío queda registrado con quien lo disparó, cuándo y a cuántos destinatarios.

---

## 6. Preguntas frecuentes y escalamiento

Esta sección reúne las preguntas más habituales por rol y las vías de escalamiento cuando algo no puede resolverse desde la plataforma.

### 6.1 Preguntas frecuentes — Taller

**No puedo iniciar sesión.**
Verificar email y contraseña. Si se perdió la contraseña, usar la opción **Olvidé mi contraseña** en el login. Si el email no llega, revisar carpeta de spam. Si el problema persiste, contactar al equipo de coordinación (Estado) desde el email de soporte.

**Mi CUIT no se verifica.**
Puede ser una caída temporal del servicio de ARCA. El sistema reintenta automáticamente todos los días durante 60 días. Si al término del período la verificación sigue fallando y el CUIT es válido, contactar al equipo de coordinación con la constancia oficial de ARCA para gestión manual.

**Subí un documento y aparece como rechazado.**
Ver el motivo del rechazo en la misma pantalla del documento (aparece junto al estado). Corregir el problema (documento vencido, ilegible, no coincide con la titularidad, etc.) y subir una nueva versión. El equipo revisa nuevamente.

**No aparezco en el directorio de talleres.**
Revisar en este orden:

1. **CUIT verificado** por ARCA. Es condición excluyente.
2. **Datos mínimos completos**: descripción de al menos 50 caracteres, provincia y partido declarados, y al menos un rubro o proceso cargado. La pantalla de Mi vidriera avisa qué falta.
3. **Los bloques Procesos y Prendas no pueden estar los dos apagados.** Si el taller ocultó ambos desde los controles de visibilidad, deja de figurar en el listado aunque todo lo demás esté completo. Alcanza con volver a mostrar uno de los dos. Ver 2.4.

La fotografía **no** es requisito: los talleres sin imagen aparecen igualmente, con una imagen institucional de reemplazo.

**Estaba en período de gracia, verifiqué mi CUIT y no sé si se reactivó mi cuenta.**
La reactivación es automática e inmediata: en cuanto el CUIT verifica, la cuenta vuelve a estar activa sin ninguna gestión adicional y sin pérdida de información. Si el estado no se actualiza, cerrar sesión y volver a entrar. Si persiste, contactar al equipo.

**Cargué mal mi CUIT al registrarme y no puedo corregirlo.**
Contactar al equipo de coordinación indicando el CUIT correcto. El equipo puede corregirlo desde su panel, y al hacerlo se dispara la verificación: si el número es válido, la cuenta se reactiva sola.

**No veo pedidos disponibles.**
La plataforma filtra los pedidos según el perfil productivo. Si no aparece ninguno, ampliar los datos del perfil (tipos de prenda que hace, servicios que ofrece, capacidad declarada). También puede ser que en ese momento no haya pedidos publicados que coincidan.

**Rendí una evaluación y no obtuve el certificado.**
Verificar el puntaje obtenido en la pantalla de resultado. Si el puntaje fue menor al mínimo requerido, se puede volver a rendir sin límite de intentos. Si el puntaje fue suficiente pero el certificado no aparece, esperar unos minutos (la emisión puede demorar) y refrescar la pantalla. Si persiste, contactar al equipo.

### 6.2 Preguntas frecuentes — Marca

**Publiqué un pedido y no recibo cotizaciones.**
Puede ser que las especificaciones sean muy restrictivas o que no haya talleres compatibles en el momento. Revisar las opciones del pedido (servicios requeridos, ubicación, tipo de prenda, plazos) y considerar ampliar el criterio. También se puede contactar directamente a talleres del directorio que parezcan compatibles.

**Un taller aceptó mi pedido pero no responde.**
Contactar directamente al taller por los canales que declaró (email, WhatsApp) para coordinar. Si no hay respuesta razonable, informar al equipo de coordinación (Estado) para que intervenga. Los datos de coordinación no se gestionan desde la plataforma; se coordinan directamente entre las partes.

**Cambié de opinión sobre un pedido publicado.**
Si el pedido aún no fue aceptado por un taller, se puede editar o cancelar sin problema. Si ya fue aceptado, comunicar el cambio al taller y evaluar si conviene modificar la orden o cancelarla y publicar una nueva.

### 6.3 Preguntas frecuentes — Estado

**No puedo aprobar un documento porque no estoy seguro del criterio.**
Consultar los criterios definidos en la sección **Etapas** (configuración de etapas de formalización). Si el criterio no está claro, consultar con el equipo (idealmente, con quien haya definido las políticas institucionales).

**Un taller reclama que su CUIT es válido pero aparece rechazado.**
Desde el detalle del taller usar el botón **Re-verificar contra ARCA** para forzar una nueva consulta. Si sigue fallando pero el taller tiene constancia oficial válida, escalar al equipo técnico para verificación manual en la base.

**Necesito un exporte de datos que no encuentro en la sección Exportar.**
Contactar al equipo técnico o al panel del Admin para exportes ad hoc. La sección Exportar cubre los reportes más frecuentes; para exportes con filtros específicos puede requerir consulta directa a la base.

**Detecté una posible irregularidad en un taller.**
Cargar una **observación de campo** (tipo Contexto o Dificultad, según corresponda) desde el detalle del taller. La observación queda registrada con fecha y autor. Si la irregularidad requiere revocar validaciones ya aprobadas, coordinar internamente antes de actuar, porque las revocaciones tienen impacto sobre el taller y quedan auditadas.

### 6.4 Preguntas frecuentes — Contenido

**Cargué un video de YouTube y no se ve.**
Verificar que la URL sea válida (formato `https://www.youtube.com/watch?v=...` o `https://youtu.be/...`). Si la URL es correcta pero el video no aparece, puede ser que el propietario haya cambiado la configuración de privacidad. Buscar una versión alternativa o subida oficial y actualizar el video en la colección.

**No aparece una colección que publiqué.**
Verificar que la colección esté en estado Publicada (no Borrador) y que tenga al menos un video cargado. Si la colección tiene evaluación configurada, verificar que tenga al menos una pregunta.

**Se me rompió el flujo de creación de una evaluación.**
Los cambios en las preguntas se guardan solo al hacer clic en el botón inferior de guardar la evaluación completa. Si se cambia de colección o se refresca la pantalla antes de guardar, se pierden los cambios. Rehacer desde cero y guardar antes de navegar.

### 6.5 Vías de escalamiento

Cuando algo no puede resolverse desde el uso normal de la plataforma, las vías de escalamiento son las siguientes, en orden creciente de complejidad:

**1. Ayuda dentro de la plataforma**

Enlace **Ayuda** en el menú personal. Contiene guía inicial, preguntas frecuentes y datos de contacto.

**2. Widget de feedback**

Botón flotante en la esquina inferior derecha. Sirve para reportar bugs, sugerencias o pedidos de aclaración. Cada feedback queda registrado con la URL de la página desde donde se envió y llega al panel del Admin para su seguimiento.

**3. Email o WhatsApp de soporte institucional**

Configurado por la institución que opera la plataforma. Disponible en la sección de Ayuda y en el pie de página.

**4. Escalamiento al equipo técnico**

Cuando el problema requiere intervención sobre la base de datos, la infraestructura o el código (por ejemplo, reactivar una cuenta suspendida, corregir un dato mal migrado, resolver un error 500 recurrente), el equipo de coordinación deriva al equipo técnico responsable de la plataforma. Los datos de contacto del equipo técnico post-entrega son parte del paquete de handover institucional (ver Manual de Administración, Sección 10).

**5. Notificación de incidentes de seguridad**

Si se detecta un problema de seguridad (acceso indebido, exposición de datos, sospecha de fraude), se debe notificar de forma inmediata al equipo institucional responsable, según el procedimiento acordado con OIT en el marco de las cláusulas de protección de datos del contrato (marco OIT, cláusula 10.4). No compartir información sensible por canales no seguros.

---

## Fin del manual

Este manual describe la operación cotidiana de la Plataforma Digital Textil en la versión que se entrega. Se complementa con el **Manual de Administración** (que documenta el panel `/admin`) y con la **Documentación técnica** en `docs/` (arquitectura, integraciones, API, seguridad).

Para actualizaciones o correcciones, contactar al equipo responsable de la documentación del proyecto. El archivo fuente en Markdown está en `docs/MANUAL_OPERACION.md` para permitir edición y regeneración del documento Word.
