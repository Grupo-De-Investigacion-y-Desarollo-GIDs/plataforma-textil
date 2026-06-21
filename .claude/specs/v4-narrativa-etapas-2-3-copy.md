# Copy de Narrativa V4 — Etapas 2 y 3

> Fuente: entregable de Sergio, 18-jun-2026. Insumo de implementacion para Etapa 2 (narrativa core) y Etapa 3 (gobernanza / bloque V4.5).

Copy de Narrativa V4 — Etapas 2 y 3
Fecha: 18 de junio de 2026
Para: Gerardo (implementación)
Versión: preliminar — para validación
Alcance: copy textual de las componentes de las Etapas 2 y 3 del plan de implementación de la Narrativa V4

Cómo está organizado
Cada sección lista los textos visibles a usuario para cada componente: títulos, subtítulos, ayudas contextuales, banners, mensajes de estado (vacío, cargando, error, éxito), textos de botones y confirmaciones. Lo que está entre corchetes [así] son variables dinámicas que la aplicación reemplaza por datos reales.
Criterios narrativos transversales (aplican a todo el copy):
- Tono de acompañamiento institucional, no de evaluación ni de puntaje.
- Verbos de acción para botones, en infinitivo o imperativo personal (en segunda persona singular: "completá", "subí", "elegí").
- En textos descriptivos, voz neutra, claridad sobre jerga técnica.
- "Facilitador, no inspector" — sin lenguaje punitivo ni de auditoría rígida.
- Etapas en lugar de niveles/puntajes (Inicial / En proceso / Consolidada).

ETAPA 2 — Reestructuración (Mi taller + dimensiones + umbrales)
2.1 Sub-tabs Mi taller
Estructura visual
El tab principal "Mi taller" se convierte en paraguas de dos sub-tabs. La cabecera común muestra el nombre del taller, su etapa actual y el ARCA verificado. Debajo, el toggle de sub-tabs:
Mi vidriera   |   Mi gestión productiva
Cabecera común (siempre visible arriba)

Sub-tab "Mi vidriera"
Texto del sub-tab: Mi vidriera
Ícono auxiliar (opcional): ícono de vidriera/exhibición
Banner contextual (sobre el contenido del sub-tab):
"Esto es lo que ven las marcas cuando te encuentran en el directorio. Lo que mostrás acá es público — usá el botón Ver cómo me ve el directorio para revisarlo."
Sub-tab "Mi gestión productiva"
Texto del sub-tab: Mi gestión productiva
Ícono auxiliar (opcional): ícono de gestión/herramienta
Banner contextual:
"Esto es solo tuyo. Tu equipo de acompañamiento puede verlo para ayudarte, pero ninguna marca tiene acceso. Es tu espacio de gestión interna."
Mensajes de estado

2.2 Tres dimensiones de la vidriera
Estructura
Mi vidriera se reorganiza en 3 bloques claros, cada uno con su propio título, ayuda contextual y contenido.
Bloque 1 — Credenciales
Título del bloque: Credenciales
Subtítulo: Lo que confirma que tu taller cumple con los requisitos institucionales.
Ayuda contextual (ícono "i" al lado del título):
"Las credenciales son verificadas por la entidad de gobernanza. Mostrás tu etapa de formalización y la verificación de ARCA."
Estados visuales en la vidriera pública:
- Si tiene etapa Inicial: badge azul claro con "Etapa inicial"
- Si tiene etapa En proceso: badge azul medio con "En proceso de formalización"
- Si tiene etapa Consolidada: badge azul oscuro con "Formalización consolidada"
- Si tiene ARCA verificado: badge verde con texto "ARCA verificado"
Estado vacío: (no aplica — siempre se muestra al menos el dato de ARCA y la etapa, aunque sea inicial)
Bloque 2 — Formación
Título del bloque: Formación
Subtítulo: Los cursos que completaste y que aportan a tu trayectoria profesional.
Ayuda contextual:
"Cada badge corresponde a un curso completado en la Academia. Podés elegir qué badges mostrar a las marcas desde la configuración de tu vidriera."
Estado vacío: "Todavía no completaste ningún curso. Mirá la Academia para empezar tu primer trayecto formativo."
CTA en estado vacío: Ir a la Academia
Badges (texto sobre cada badge):
- Nombre del curso
- (opcional) Fecha de obtención
Bloque 3 — Descripción
Título del bloque: Descripción de mi taller
Subtítulo: Lo que contás sobre cómo trabajás. Vos decidís qué hacer visible a las marcas.
Ayuda contextual:
"Esta sección incluye tu perfil productivo. Podés mostrar u ocultar bloques completos desde Configuración de visibilidad. La información que ocultes solo la verás vos en Mi gestión productiva."
Sub-bloques del perfil productivo (cada uno con su propio título):
- Mi equipo de trabajo
- Mi espacio físico
- Mi capacidad de producción
- Cómo organizo el trabajo
- Maquinaria
Mensaje cuando un bloque está oculto a marcas (visible solo al taller en preview):
"Este bloque no se muestra a las marcas. Cambialo desde Configuración de visibilidad si querés exponerlo."

2.3 Tres umbrales escalonados
Estructura
La página "Mi recorrido" muestra los tres umbrales en orden y resalta el actual del taller. Cada umbral tiene su propio panel.
Umbral 1 — Registrado
Título: Registrado
Subtítulo: Te diste de alta en la plataforma. Ya podés moverte por la Academia y los Recursos.
Ayuda contextual:
"Estás en período de bienvenida. Tenés 60 días para verificar tu CUIT y completar tu vidriera mínima. Mientras tanto, podés aprender en la Academia y conocer cómo funciona la plataforma."
Lista de lo que se desbloquea:
- Navegar la Academia
- Consultar Recursos institucionales
- Ver el directorio público
Lista de lo que falta para pasar al siguiente umbral:
- Verificar tu CUIT con ARCA
- Completar descripción del taller (mínimo 50 caracteres)
- Indicar tu ubicación
- Declarar al menos un rubro o capacidad
- Subir una foto de tu taller
CTA principal: Completá tu vidriera mínima
Mensaje cuando faltan días del período de gracia: "Te quedan [X] días del período de bienvenida."
Mensaje cuando el período de gracia vence: "El período de bienvenida finalizó. Completá tu vidriera mínima para aparecer en el directorio."
Umbral 2 — Visible en directorio
Título: Visible en el directorio
Subtítulo: Ya apareces en el directorio público. Las marcas pueden encontrarte y conocer tu taller.
Ayuda contextual:
"Tu vidriera mínima está lista. Las marcas pueden verte. El siguiente paso es habilitar la cotización de pedidos — para eso, avanzá en la etapa de formalización y completá tu perfil productivo."
Lista de lo que se desbloquea:
- Aparecer en el directorio público
- Recibir mensajes de marcas
- Ser incluido en búsquedas y filtros
Lista de lo que falta para pasar al siguiente umbral:
- Alcanzar al menos la etapa "En proceso" de formalización
- Completar tu perfil productivo al 80%
CTA principal: Ver mi recorrido de formalización
Umbral 3 — Apto para cotizar
Título: Apto para cotizar
Subtítulo: Ya podés cotizar pedidos publicados por marcas. Es el último umbral del recorrido.
Ayuda contextual:
"Llegaste al umbral más alto. Tus capacidades están declaradas, tu formalización avanzó y las marcas pueden invitarte a cotizar. Seguí completando tu perfil para aparecer en más búsquedas."
Lista de lo que se desbloquea:
- Recibir invitaciones a cotizar
- Aparecer en match calificado por capacidad
- Habilitar tu vidriera completa (todas las dimensiones)
Mensaje motivacional (opcional): "Tu recorrido en la PDT está completo. Seguí sumando capacidades y cursos para que más marcas te encuentren."
Mensajes transversales del recorrido

2.4 Filtros del directorio
Estructura
El directorio (vista de marca y vista pública) se simplifica a tres filtros.
Título de la sección de filtros: Filtrar talleres
Filtros:

Texto debajo de los filtros (siempre visible):
"Mostramos solo talleres con CUIT verificado por ARCA."
Botones:
- Aplicar filtros
- Limpiar filtros
Estado vacío (sin resultados):
"No encontramos talleres con esos filtros. Probá quitando alguno o ampliando la ubicación."

2.5 Renombre ESTADO → COORD
Cambios de copy en pantallas existentes

Texto en la página "Quién es quién" / Ayuda
"El rol COORD agrupa a las personas responsables de la coordinación institucional de la plataforma. Es el equipo que verifica documentación, define las etapas de formalización y acompaña a los talleres en su recorrido."
Texto de transición (notificación a usuarios actuales con rol ESTADO)
"El rol que tenías como ESTADO pasa a llamarse COORD. Tu acceso y tus permisos son los mismos. El cambio es de nomenclatura, no funcional."

ETAPA 3 — Gobernanza estructural + Academia para marcas
3.1 Sub-perfil COORD POLÍTICO / OPERATIVO
Estructura
El rol COORD se desdobla en dos sub-perfiles con permisos diferenciados. La UI muestra un módulo común y módulos específicos según el sub-perfil.
Cabecera común (visible para los dos sub-perfiles)
Título principal: Coordinación · [Político / Operativo]
Subtítulo: Acompañamiento institucional del sector textil
Pill indicadora de sub-perfil:
- Político (color: azul oscuro)
- Operativo (color: verde institucional)
Sub-perfil POLÍTICO
Texto del módulo de inicio:
"Tu rol es estratégico. Acá ves cómo evoluciona el sector, configurás las políticas de formalización y producís informes para la gobernanza."
Secciones del menú del POLÍTICO:
- Estado del sector
- Configuración de etapas y umbrales
- Catálogo de cursos de la Academia
- Plantillas de respuesta
- Reportes institucionales
Texto de la sección "Configuración de etapas y umbrales":
"Acá definís qué documentos y verificaciones requiere cada etapa de formalización. Los cambios afectan a todos los talleres a partir del próximo ciclo."
Texto de ayuda en plantillas de respuesta:
"Las plantillas se ofrecen al perfil Operativo cuando aprueba o rechaza documentación. Vos definís el lenguaje institucional; ellos lo usan o lo adaptan al caso."
Mensaje cuando intenta acceder a un documento individual:
"El acceso a documentos individuales es del perfil Operativo. Vos definís políticas y ves agregados; ellos trabajan los casos."
Sub-perfil OPERATIVO
Texto del módulo de inicio:
"Tu rol es ejecutivo. Acá trabajás los casos individuales: revisás documentación, aprobás avances de etapa y dejás observaciones de campo."
Secciones del menú del OPERATIVO:
- Mi agenda
- Cola de verificaciones
- Talleres
- Observaciones de campo
Texto de la sección "Cola de verificaciones":
"Acá están los documentos que esperan tu revisión. Aprobá, rechazá con motivo o pedí una aclaración al taller."
Botones de acción sobre cada documento:
- Aprobar
- Rechazar
- Pedir aclaración
Confirmación al aprobar:
"Aprobado. El taller fue notificado automáticamente."
Modal al rechazar:
- Título: Rechazar documento
- Subtítulo: "Indicá el motivo del rechazo. El taller recibirá tu mensaje."
- Campo: motivo (mínimo 50 caracteres)
- Selector: usar plantilla / escribir libre
- Botón confirmación: Rechazar y notificar
- Botón cancelar: Cancelar
Modal al pedir aclaración:
- Título: Pedir aclaración
- Subtítulo: "Hacele una pregunta al taller. Tendrá oportunidad de responder una vez."
- Campo: pregunta (texto libre)
- Botón confirmación: Enviar pregunta
- Botón cancelar: Cancelar
Mensaje al pedir aclaración (cuando ya hubo una):
"Ya hiciste una aclaración sobre este documento. Si seguís con dudas, aprobá o rechazá con el motivo correspondiente."
Mensaje cuando intenta acceder a configuración política:
"La configuración de etapas y umbrales es del perfil Político. Vos trabajás los casos individuales."
Texto de transición (notificación a usuarios migrados al sub-perfil OPERATIVO)
"Tu rol COORD se especificó como Operativo. Trabajás los casos individuales (verificaciones, observaciones de campo). La configuración de políticas es del perfil Político."

3.2 Plantillas de rechazo
Estructura
El POLÍTICO gestiona el catálogo de plantillas. El OPERATIVO las usa al rechazar.
Vista del POLÍTICO — gestión del catálogo
Título de la sección: Plantillas de respuesta
Texto introductorio:
"Las plantillas se ofrecen al perfil Operativo cuando aprueba o rechaza documentación. Cada plantilla tiene un nombre interno y un mensaje al taller. Mantenelas claras y constructivas."
Botón para crear plantilla: Nueva plantilla
Formulario de plantilla:
- Campo 1 — Nombre interno: "Cómo identificás esta plantilla. Solo lo ve el equipo COORD."
- Campo 2 — Mensaje al taller: "El texto que recibe el taller. Hablale de vos a vos, sé concreto sobre qué cambiar."
- Campo 3 — Tipo: rechazo / pedido de aclaración
- Botón confirmación: Guardar plantilla
- Botón cancelar: Cancelar
Confirmación al guardar: "Plantilla guardada. Ya está disponible para el equipo Operativo."
Estado vacío: "Todavía no creaste plantillas. Las plantillas ayudan a mantener un lenguaje institucional consistente."
Vista del OPERATIVO — uso de plantillas al rechazar
En el modal de rechazo:
- Selector: "Usar plantilla" / "Escribir libre"
- Si elige "Usar plantilla": dropdown con las plantillas activas. Al seleccionar una, el campo de motivo se rellena automáticamente y queda editable.
- Si elige "Escribir libre": el campo de motivo queda vacío para escribir desde cero.
Texto auxiliar:
"Podés usar una plantilla y adaptarla al caso concreto antes de enviar."

3.3 Academia para marcas
Estructura
Se habilita el tab "Cursos" para el rol MARCA. La marca ve un catálogo curado de cursos pensados para su rol: gestión de proveedores, comercio justo, calidad textil, costos.
Cabecera del tab Cursos en rol MARCA
Título principal: Cursos
Subtítulo: Aprender sobre el sector textil, los procesos productivos y la formalización de tus proveedores.
Banner contextual:
"Los cursos están pensados para ayudarte a entender cómo trabajan los talleres con los que conectás. Cada uno tiene su catálogo de requisitos asociados — al completar un curso, ves qué requisitos del recorrido del taller estás ayudando a apuntalar."
Estructura del catálogo
El catálogo se organiza en categorías. Cada curso tiene:
- Título del curso
- Descripción corta (1-2 líneas)
- Tiempo estimado de cursada
- Categoría
- Badge (si ya lo completaste)
Categorías iniciales para la marca:
- Cómo elegir proveedores
- Gestión de la cadena productiva
- Comercio justo y trabajo decente
- Calidad textil
- Costos y precios justos
Vista de curso individual
Cabecera del curso:
- Título del curso
- Categoría
- Tiempo estimado
- Botón principal: Empezar curso / Continuar curso / Ver certificado
Sección "Qué vas a aprender":
[bullets con los aprendizajes específicos del curso]
Sección "Requisitos del recorrido del taller que apoya este curso":
"Al completar este curso, vas a entender mejor estos requisitos que los talleres necesitan cumplir:"
- [requisito 1]
- [requisito 2]
- [requisito 3]
Sección "Cursos relacionados":
[listado de otros cursos]
Lógica de linkeo curso ↔ requisito
Desde un curso (vista de la marca):
- "Este curso te ayuda a entender los siguientes requisitos del recorrido del taller: [lista]"
Desde un requisito (vista del taller, en Mi recorrido):
- "Cursos que profundizan este requisito: [lista]"
Estados

Notificaciones

Decisiones abiertas que afectan al copy final
Algunas decisiones institucionales pendientes pueden modificar fragmentos del copy de arriba. Las marco acá para que estén visibles:
¿Los cursos cuentan en el cálculo del recorrido del taller?
- Si la respuesta es sí, el copy del Umbral 3 y del Bloque de Formación cambia para reflejar que los cursos suman a la formalización.
- Si la respuesta es no (status quo), el copy actual queda.
¿El renombre COORD → GOBERNANZA está confirmado?
- Si OIT confirma "GOBERNANZA" como nombre institucional, hay que reemplazar todas las menciones de "COORD" del copy de arriba.
¿Quién carga el contenido de cursos en producción? (O-05)
- Si la respuesta involucra a INTI, las descripciones de la Academia pueden mencionar la cocreación.
¿La validación sectorial del perfil del taller (G-18) ya se hizo?
- Si se hizo, el copy de los bloques de la vidriera puede mencionarlo como referencia ("validado con el sector").
¿Los textos legales (política de privacidad y términos) ya están ampliados?
- Si están ampliados, los enlaces en el flujo de registro pueden referenciarlos directamente.

Pendientes para Nivel 5 — copy fino
Lo siguiente queda para un trabajo posterior dedicado al lenguaje (no es parte de las Etapas 2 y 3):
- Mensajes de error específicos (validaciones de formulario, errores de API)
- Emails transaccionales (asunto + cuerpo de los 10-15 emails operativos)
- Notificaciones push (cuando se habilite mobile)
- Lenguaje del onboarding inicial (primera vez que el usuario entra)
- Footer institucional ampliado y leyendas legales
- Textos de los formularios completos del perfil productivo (W-A)
- Tooltips de cada campo del wizard

Documento preliminar para validación con el equipo. Ajustes y sugerencias son bienvenidos antes de pasar a implementación.