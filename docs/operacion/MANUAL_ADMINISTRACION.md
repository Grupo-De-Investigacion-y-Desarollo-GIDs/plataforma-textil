# Manual de Administración — Plataforma Digital Textil (PDT)

Documento oficial para operación y mantenimiento del sistema. Destinado a personas con rol ADMIN encargadas de gestionar la plataforma post-entrega.

Fecha: 7 de agosto de 2026

---

## Alcance de este documento

Este manual describe la plataforma en el estado en el que se entrega, correspondiente a la versión publicada en la rama principal del repositorio al momento del cierre del proyecto.

El plan de evolución de la plataforma —Documento Master V4 y sus anexos de narrativa consolidada— contempla funcionalidades adicionales que no fueron implementadas dentro del alcance de esta entrega. Esas funcionalidades quedan documentadas en el material de planificación como referencia para etapas futuras, y no están cubiertas por este manual.

Este manual complementa al **Manual de Operación**, que describe la operación cotidiana de los cuatro roles operativos: Taller, Marca, Estado y Contenido. El presente documento cubre exclusivamente el panel de administración y el rol ADMIN.

---

## Índice

1. Introducción y acceso
2. Dashboard
3. Gestión de actores (Usuarios, Talleres, Marcas)
4. Contenido y Academia (Colecciones, Evaluaciones, Certificados)
5. Operación comercial (Pedidos, Procesos, Auditorías)
6. Comunicación y feedback (Observaciones, Notificaciones, Feedback)
7. Configuración del sistema (General, Archivos, Onboarding)
8. Integraciones (Email, LLM)
9. Logs y reportes
10. Troubleshooting y FAQ

---

## Convenciones del manual

A lo largo del documento se utilizan las siguientes convenciones para describir la interfaz:

- **Términos en negrita** para identificar botones, secciones y elementos visibles en pantalla.
- `Rutas entre backticks` para señalar URLs internas del panel (ej. `/admin/usuarios`).
- Los **badges** son etiquetas de color que indican estado (verde = correcto/activo, amarillo = pendiente/en proceso, rojo = error/inactivo, gris = sin actividad).
- Las **tarjetas de métricas** son bloques con un número grande y una etiqueta descriptiva, ubicadas en la parte superior de cada sección.
- Los **modales** son ventanas emergentes que aparecen al hacer click en un botón de acción, sin abandonar la pantalla actual.
- Los **toasts** son notificaciones breves (verdes o rojas) que aparecen en la esquina inferior derecha para confirmar una acción o mostrar un error.

---

## 1. Introducción y acceso

### 1.1 Qué es el panel de administración

El panel de administración es el espacio central desde el cual se gestiona toda la Plataforma Digital Textil (PDT): usuarios, talleres, marcas, contenido de la Academia, pedidos, integraciones con servicios externos y configuración del sistema.

Es un panel web que se accede a través del navegador (no hay aplicación de escritorio ni móvil dedicada). Está optimizado para pantallas de escritorio (mínimo 1280px de ancho); en tablets funciona pero con menor comodidad; no está pensado para uso desde teléfonos móviles.

### 1.2 Roles del sistema y permisos

La plataforma tiene cinco roles con distinto nivel de acceso. El manual describe únicamente las funciones del rol ADMIN, que es el único con acceso completo al panel `/admin`.

| Rol | Alcance | Panel al que accede |
|---|---|---|
| **ADMIN** | Control total sobre la plataforma: usuarios, talleres, marcas, contenido, configuración, integraciones. | `/admin` |
| **CONTENIDO** | Gestión exclusiva del material de la Academia (colecciones, videos, evaluaciones). | `/contenido` |
| **ESTADO** | Consulta de datos, aprobación de trámites, exportación de reportes. No puede modificar datos operativos. | `/estado` |
| **MARCA** | Empresas que publican pedidos y buscan talleres. Uso operativo, no administrativo. | `/marca` |
| **TALLER** | Talleres textiles que se registran, cargan su perfil productivo y responden pedidos. | `/taller` |

**Reglas importantes**:

- Un usuario tiene un único rol activo a la vez.
- El cambio de rol de un usuario debe realizarse con criterio (ver Sección 3.1 - Usuarios).
- Todo acceso y toda acción del rol ADMIN queda registrada en el sistema de logs para auditoría (Sección 9).

### 1.3 Cómo acceder al panel

1. Abrir un navegador (Chrome, Firefox, Edge o Safari en su versión actualizada).
2. Ingresar a la URL de la plataforma: `https://plataforma-textil.vercel.app` (o el dominio que se configure institucionalmente).
3. Hacer click en **Iniciar sesión** en la esquina superior derecha.
4. Ingresar las credenciales de la cuenta ADMIN (email + contraseña, o Google OAuth si la cuenta está vinculada).
5. Una vez autenticado, escribir `/admin` en la barra de direcciones del navegador o hacer click en cualquier enlace interno que lleve al panel.
6. Si la cuenta no tiene rol ADMIN, el sistema redirige automáticamente a `/unauthorized` y no permite el acceso.

**Cierre de sesión**: en el encabezado superior derecho hay un botón **Cerrar sesión**. Es recomendable cerrarla al terminar la jornada, especialmente si se trabaja desde una computadora compartida.

### 1.4 Estructura general de la interfaz

Todas las pantallas del panel comparten el mismo esqueleto:

**Encabezado superior** (fijo en pantalla):

- Logo circular de PDT y el texto **Admin Panel**.
- **Campana de notificaciones** con contador de mensajes sin leer.
- Nombre del usuario logueado.
- Enlace **Volver al sitio** para navegar al frontend público.
- Botón **Cerrar sesión**.

**Barra lateral izquierda** (visible en pantallas grandes, oculta en tablets):

Contiene los 20 accesos principales del panel, con ícono y etiqueta:

- **Dashboard** — vista general
- **Usuarios** — gestión de cuentas
- **Talleres** — talleres registrados
- **Marcas** — marcas registradas
- **Pedidos** — órdenes de trabajo
- **Colecciones** — cursos de la Academia
- **Evaluaciones** — evaluaciones de las colecciones
- **Certificados** — certificados emitidos
- **Procesos** — gestión de procesos y catálogo de servicios
- **Auditorías** — inspecciones registradas
- **Documentos** — documentación cargada por talleres
- **Onboarding** — configuración del proceso de alta
- **Observaciones** — observaciones de campo cargadas por ESTADO
- **Reportes** — reportes exportables
- **Notificaciones** — envío masivo de notificaciones
- **Integraciones** — configuración de servicios externos
- **Feedback** — reportes enviados por los usuarios de la plataforma
- **Configuración** — configuración general del sistema
- **Seguridad** — logs de auditoría

**Área principal** (contenido de la sección activa):

Cada sección tiene un patrón visual consistente:

1. Título de la sección y descripción breve.
2. Tarjetas de métricas resumen (cuando aplica).
3. Barra de búsqueda y filtros.
4. Botones de acción (Exportar, Nuevo, etc.).
5. Tabla o listado con los datos.
6. Modales para acciones específicas al hacer click.

### 1.5 Recuperación de credenciales ADMIN

El flujo estándar de recuperación de contraseña (link "Olvidé mi contraseña" en el login) funciona para todos los roles.

En caso de pérdida total de acceso a la cuenta ADMIN principal (por ejemplo, si el email de recuperación también quedó inaccesible), contactar al equipo técnico responsable (ver Sección 10) para resetear la clave directamente en la base de datos. No hay un "administrador maestro" ni un back door — la recuperación siempre requiere intervención técnica sobre la base.

---

## 2. Dashboard

### 2.1 Para qué sirve

Vista rápida del estado general de la plataforma. Es la pantalla de inicio del panel: al ingresar a `/admin` el sistema redirige automáticamente al dashboard. Contiene tres bloques principales: métricas de la plataforma, accesos rápidos a las secciones más consultadas y una lista de actividad reciente.

Es una pantalla de **consulta y navegación** — no se pueden modificar datos desde aquí.

### 2.2 Cómo llegar

- Ingresando a `/admin` (redirige automáticamente).
- O bien, haciendo click en **Dashboard** (primer item del sidebar).

### 2.3 Qué se ve en pantalla

#### Bloque 1 — Métricas principales

Cuatro tarjetas horizontales con los indicadores clave del ecosistema:

| Métrica | Qué cuenta | Cómo interpretarla |
|---|---|---|
| **Talleres registrados** | Cantidad total de talleres con cuenta creada (activos + inactivos). | Indicador de tracción del lado de la oferta. |
| **Marcas registradas** | Cantidad total de marcas con cuenta creada. | Indicador de tracción del lado de la demanda. |
| **Colecciones activas** | Cantidad de colecciones de la Academia publicadas y disponibles para los talleres. | Volumen de contenido educativo disponible. |
| **Certificados emitidos** | Cantidad de certificados otorgados a talleres tras completar colecciones. | Nivel de aprovechamiento de la Academia. |

Cada tarjeta usa un color que refleja el tipo de métrica (verde para actores humanos, amarillo/naranja para contenido, gris para acumulados históricos). Los números se cargan al abrir la página (spinner "Cargando…" mientras se recuperan).

#### Bloque 2 — Accesos Rápidos

Tarjeta con seis enlaces directos a las secciones más consultadas: **Colecciones**, **Usuarios**, **Certificados**, **Reportes**, **Configuración**, **Notificaciones**. Cada uno abre la sección correspondiente al hacer click, evitando pasar por el sidebar.

#### Bloque 3 — Actividad Reciente

Tarjeta con las últimas 5 acciones registradas en el sistema, ordenadas de la más reciente a la más antigua. Cada línea muestra:

- **Fecha y hora** de la acción (formato día/mes hora:minuto).
- **Autor**: nombre del usuario que realizó la acción (o "Sistema" si fue un proceso automático como el cron de verificación de CUIT).
- **Descripción** de la acción (ej. "aprobó documento", "creó usuario", "envió notificación masiva").

Si no hay actividad reciente, se muestra el mensaje "Sin actividad reciente".

#### Bloque 4 — Menú Completo

Debajo de los tres bloques anteriores, aparece una grilla de tarjetas con los 15 accesos secundarios: Colecciones, Evaluaciones, Certificados, Usuarios, Talleres, Marcas, Pedidos, Auditorías, Reportes, Notificaciones, Logs, Procesos, Documentos, Configuración, Integraciones. Cada tarjeta abre la sección correspondiente.

### 2.4 Qué se puede hacer

- **Consultar el estado general** de un vistazo antes de iniciar cualquier tarea.
- **Navegar a las secciones frecuentes** desde los accesos rápidos, sin pasar por el sidebar.
- **Detectar movimientos recientes** en la sección de actividad (útil si se sospecha algún cambio no autorizado o para saber qué hizo el resto del equipo desde la última sesión).
- **Ir a cualquier sección secundaria** desde la grilla del menú completo.

### 2.5 Casos frecuentes

**Caso 1 — Inicio de jornada de trabajo**:

1. Ingresar a `/admin`.
2. Mirar las 4 métricas y comparar con los valores del día anterior (si se lleva registro externo).
3. Revisar Actividad Reciente para saber qué se hizo desde la última sesión.
4. Si hay actividad inesperada (ej. un rol cambiado que no se recuerda haber cambiado), profundizar en la sección **Logs**.
5. Ir a la sección donde se planea trabajar (por accesos rápidos o sidebar).

**Caso 2 — Chequeo de tracción del piloto**:

1. Anotar los valores actuales de las 4 métricas.
2. Comparar contra las metas definidas por el proyecto (talleres objetivo, marcas objetivo, etc.).
3. Si algún indicador está estancado, usar la sección **Reportes** para obtener datos históricos más detallados y las secciones específicas (Talleres, Marcas, Colecciones) para analizar la composición.

**Caso 3 — Detección de anomalías**:

1. Al ingresar, revisar Actividad Reciente.
2. Si se ven acciones inesperadas (muchas eliminaciones, cambios de rol no planificados, acciones fuera de horario laboral), ir a **Seguridad → Logs**.
3. Filtrar los logs por fecha y usuario para reconstruir qué ocurrió.
4. Si se identifica un problema real, escalar según el procedimiento operativo interno.

### 2.6 Notas y limitaciones

- **Actualización no automática**: las métricas y la actividad reciente se cargan al abrir o refrescar la página. No hay actualización en tiempo real.
- **Solo lectura**: el dashboard no permite editar datos.
- **Actividad limitada a 5 registros**: para ver el histórico completo, ir a **Seguridad → Logs** en el sidebar.
- **Sensibilidad de los conteos**: las métricas incluyen tanto cuentas activas como inactivas. Para segmentar, ir a la sección específica y aplicar filtros.

---

## 3. Gestión de actores

Esta sección agrupa las tres pantallas que gestionan los actores del ecosistema: Usuarios (cuentas de acceso genéricas), Talleres (perfiles productivos) y Marcas (perfiles comerciales). Un mismo actor puede aparecer en dos secciones simultáneamente: por ejemplo, un taller aparece en **Usuarios** como cuenta y también en **Talleres** con su perfil productivo.

### 3.1 Usuarios

#### Para qué sirve

Es el panel de control central de todas las cuentas de la plataforma, sin importar el rol. Desde aquí se pueden ver todos los usuarios registrados, cambiar sus roles, suspender cuentas, enviar mensajes individuales y resetear contraseñas. También muestra un bloque especial con "registros incompletos" — usuarios que iniciaron el alta por Google o magic link pero no llegaron a completar el CUIT y la elección de rol.

#### Cómo llegar

- Sidebar: **Usuarios** (segundo item).
- URL directa: `/admin/usuarios`.

#### Qué se ve en pantalla

**A. Bloque "Registros incompletos"** (solo aparece si hay registros pendientes):

Tarjeta destacada con borde amarillo a la izquierda. Enumera los usuarios que iniciaron el registro pero no lo completaron. Cada línea muestra:
- Email del usuario.
- Nombre (si lo declaró).
- Fecha del intento.
- Enlace **Contactar** que abre un email al usuario para invitarlo a completar el registro.

**B. Tarjetas de métricas** (tres tarjetas):

- **Total** — cantidad total de usuarios activos + inactivos.
- **Talleres** — cantidad de usuarios con rol TALLER.
- **Marcas** — cantidad de usuarios con rol MARCA.

**C. Barra de búsqueda y filtro**:

- Campo de búsqueda: filtra en tiempo real por nombre, email o CUIT.
- Selector de rol: **Todos los roles**, **Taller**, **Marca**, **Estado**, **Admin**.

**D. Tabla de usuarios** con las siguientes columnas:

| Columna | Contenido |
|---|---|
| **Usuario** | Nombre del usuario (o "Sin nombre") + email en gris debajo. |
| **Rol** | Badge de color: ADMIN en verde, resto en gris. |
| **Estado** | Badge verde (Activo) o amarillo (Inactivo). |
| **Registro** | Fecha en formato dd/mm/yyyy. Columna ordenable. |
| **Acciones** | Tres íconos: **Ver detalle** (ojo), **Editar** (lápiz), **Desactivar usuario** (icono de usuario tachado). |

Si no hay usuarios que matcheen los filtros, aparece el mensaje "No se encontraron usuarios."

#### Qué se puede hacer

##### Ver detalle de un usuario

Click en el ícono de **ojo** de cualquier usuario. Se abre un modal con:

- Nombre y email del usuario.
- Rol actual.
- Estado (Activo/Inactivo).
- Fecha de registro.
- Teléfono (si está cargado).
- Botones de acción: **Enviar mensaje**, **Cambiar rol**, **Resetear contraseña**, **Suspender cuenta**.

##### Cambiar rol de un usuario

Dos formas de acceder:
- Click en el ícono de **lápiz** en la fila del usuario.
- Desde el modal de detalle, click en **Cambiar rol**.

Se abre un modal pequeño con un selector: TALLER, MARCA, ESTADO, ADMIN. Elegir el nuevo rol y hacer click en **Guardar**. Aparece un toast verde de confirmación.

**Consideraciones al cambiar rol**:
- Cambiar de rol modifica el acceso del usuario a las áreas de la plataforma.
- No se puede cambiar el rol de la propia cuenta (medida de seguridad, para evitar bloquearse).
- Cambiar de TALLER o MARCA a ADMIN da acceso total: usar con criterio.
- El cambio es inmediato y no requiere que el usuario cierre y abra sesión (se aplica en el próximo request).

##### Suspender una cuenta

Dos formas de acceder:
- Click en el ícono de **usuario tachado** en la fila.
- Desde el modal de detalle, click en **Suspender cuenta**.

Aparece un modal de confirmación con el mensaje: *"Vas a suspender la cuenta de [email]. El usuario no podrá acceder a la plataforma."* Hacer click en **Confirmar** (rojo) para suspender o **Cancelar** para abortar.

**Consideraciones**:
- Suspender no elimina la cuenta ni sus datos — solo bloquea el acceso.
- La cuenta suspendida sigue visible en el listado con badge amarillo "Inactivo".
- Para reactivarla, hay que hacerlo desde la base de datos por el equipo técnico (aún no hay botón de reactivación en la interfaz).

##### Resetear contraseña

Solo accesible desde el modal de detalle → botón **Resetear contraseña**. Aparece un modal de confirmación: *"Se enviarán instrucciones de reset de contraseña a [email]."* Confirmar para disparar el envío.

**Consideraciones**:
- El envío del email de reset depende de la configuración de Resend (ver Sección 8.1). Si Resend no está configurado, el reset no llega y el usuario debe contactarse directamente.
- El toast confirma "Se enviaron instrucciones de reset" — verificar en la sección **Logs** que el envío se registró.

##### Enviar mensaje individual

Solo accesible desde el modal de detalle → botón **Enviar mensaje**. Se abre un editor de mensaje con:

- Destinatario preseleccionado.
- Campo de asunto y cuerpo.
- Selector de canales (email siempre disponible; WhatsApp solo si el usuario tiene teléfono cargado).

El mensaje individual se registra en la sección **Comunicación** (Sección 6) y queda auditado.

#### Casos frecuentes

**Caso 1 — Un usuario reporta que no puede acceder**:
1. Buscar al usuario por email en la barra de búsqueda.
2. Verificar el estado en la columna Estado. Si dice **Inactivo**, la cuenta está suspendida — decidir si reactivar (con soporte técnico) o mantener suspendida.
3. Si está **Activo** y aún no puede acceder, usar la opción **Resetear contraseña** para enviarle instrucciones nuevas.

**Caso 2 — Un registro incompleto necesita ayuda**:
1. Ver el bloque **Registros incompletos** al inicio de la página.
2. Hacer click en **Contactar** al lado del email para escribirle.
3. Enviarle instrucciones para completar el registro (URL directa al paso pendiente).

**Caso 3 — Se detecta un usuario con rol equivocado** (ej. un taller que se registró como marca):
1. Buscar al usuario por email.
2. Abrir modal de detalle.
3. Click en **Cambiar rol** y elegir el rol correcto.
4. Verificar en la sección específica (Talleres o Marcas) que aparezca el perfil bien clasificado.

#### Notas y limitaciones

- **Sin paginación explícita en la interfaz**: la carga inicial trae los usuarios (limit=100 por defecto). Si la plataforma crece por encima de ese número, se listan solo los primeros 100 — usar los filtros y búsqueda para acotar.
- **Sin edición inline**: los datos del usuario (nombre, teléfono) no se editan desde este panel. Cambios de datos personales los debe hacer el propio usuario desde su perfil o el equipo técnico desde la base.
- **Historial de acciones**: cada suspensión, cambio de rol o reset queda en **Logs** (Sección 9) con el ADMIN que lo ejecutó y la fecha.

---

### 3.2 Talleres

#### Para qué sirve

Vista específica de los usuarios con rol TALLER. Muestra el perfil productivo (CUIT, ubicación, etapa de formalización) además de los datos de cuenta. Permite consultar el detalle de cada taller, exportar la lista completa y navegar al perfil individual para revisar documentos, historial y verificación de ARCA.

#### Cómo llegar

- Sidebar: **Talleres**.
- URL directa: `/admin/talleres`.

#### Qué se ve en pantalla

**A. Tarjetas de métricas** (cuatro tarjetas):

- **Total** — cantidad total de talleres registrados.
- **Consolidada** — talleres en etapa ORO (formalización completa).
- **En proceso** — talleres en etapa PLATA (formalización parcial).
- **Etapa inicial** — talleres en etapa BRONCE (recién registrados).

Nota: en la base de datos las etapas están como BRONCE/PLATA/ORO. En la interfaz se traducen a "Etapa inicial / En proceso / Consolidada" para uso institucional.

**B. Barra de búsqueda y filtro**:

- Búsqueda: filtra en tiempo real por nombre, CUIT o email.
- Selector de etapa: **Todas las etapas**, **Consolidada** (ORO), **En proceso** (PLATA), **Etapa inicial** (BRONCE).

**C. Botones de exportación**:

- **Exportar CSV** — descarga la lista filtrada en formato CSV.
- **Exportar Excel** — descarga la lista filtrada en formato XLSX.

**D. Tabla de talleres** con las siguientes columnas:

| Columna | Contenido |
|---|---|
| **Nombre** | Nombre del taller + email en gris debajo. |
| **CUIT** | Número de CUIT. Ordenable. |
| **Etapa** | Badge de color según nivel: verde (Consolidada), gris (En proceso), amarillo (Etapa inicial). |
| **Estado** | Badge verde (Activo) o amarillo (Inactivo). |
| **Registro** | Fecha en formato dd/mm/yyyy. Ordenable. |
| **Acciones** | Dos íconos: **Ver detalle** (ojo) y **Editar** (lápiz). |

Si no hay talleres que matcheen, aparece el bloque **EmptyState** con el mensaje "Sin talleres — No se encontraron talleres con esos filtros."

#### Qué se puede hacer

##### Ver detalle de un taller

Click en el ícono de **ojo** → navega a `/admin/talleres/[id]`. La pantalla de detalle muestra:

- Datos generales (nombre, CUIT, ubicación).
- Verificación de ARCA (CUIT verificado, tipo de inscripción, categoría monotributo, actividades AFIP, domicilio fiscal).
- Perfil productivo (capacidad, prendas, maquinaria).
- Documentos cargados y validaciones.
- Certificados obtenidos en la Academia.
- Historial de acciones sobre el taller.

La pantalla de detalle es compartida con el panel de ESTADO — ver el Manual de Operación para el flujo completo de aprobación de documentos.

##### Exportar la lista

Los botones **Exportar CSV** y **Exportar Excel** generan un archivo con los talleres actualmente filtrados. Los campos incluidos son: id, nombre, cuit, nivel, provincia, partido, fecha de registro, email, teléfono, estado activo.

Casos de uso: reportes institucionales, seguimiento del piloto, entrega de datos a stakeholders externos.

##### Filtrar y buscar

Combinar la búsqueda por texto con el filtro por etapa para segmentar. Ejemplos:
- Buscar "Buenos Aires" y filtrar por etapa **Consolidada** → talleres consolidados en Buenos Aires.
- Buscar un CUIT específico → localizar rápidamente a un taller reportado por incidencia.

#### Casos frecuentes

**Caso 1 — Un taller reclama que su verificación de ARCA no aparece**:
1. Buscar al taller por CUIT o email.
2. Abrir el detalle (ícono de ojo).
3. Ir a la pestaña "Datos del taller" y verificar el estado del bloque ARCA.
4. Si está sin verificar, usar el botón **Re-verificar contra ARCA** o esperar al próximo ciclo del cron automático.

**Caso 2 — Reporte trimestral para el proyecto**:
1. Filtrar por etapa **Consolidada**.
2. Exportar a Excel.
3. Repetir para **En proceso** y **Etapa inicial**.
4. Usar los tres archivos para armar el reporte de avance.

**Caso 3 — Localizar talleres inactivos por región**:
1. En el buscador escribir el nombre de la provincia o partido.
2. En el listado, identificar los que tienen badge amarillo "Inactivo".
3. Para cada uno, abrir detalle e investigar el motivo (ver **Logs** o pestaña Historial).

#### Notas y limitaciones

- **Ícono de editar sin acción**: el botón de lápiz aparece en la fila pero actualmente no está conectado a un formulario de edición inline. Los cambios sobre datos del taller se hacen desde su detalle o requieren intervención del equipo técnico.
- **Límite de 100 talleres por carga**: para plataformas con más de 100 talleres, usar filtros para acotar la vista.
- **Etapas ORO/PLATA/BRONCE**: nomenclatura interna de la base. En la interfaz se muestra la traducción institucional. Al exportar, el CSV/Excel puede mostrar la nomenclatura interna — validar antes de compartir con terceros.

---

### 3.3 Marcas

#### Para qué sirve

Vista específica de los usuarios con rol MARCA (empresas que publican pedidos y buscan talleres). Es más simple que la de Talleres — las marcas no tienen sistema de etapas ni verificación de ARCA compleja en la interfaz de listado.

#### Cómo llegar

- Sidebar: **Marcas**.
- URL directa: `/admin/marcas`.

#### Qué se ve en pantalla

**A. Tarjetas de métricas** (dos tarjetas):

- **Total** — cantidad total de marcas registradas.
- **Activas** — marcas con cuenta activa.

**B. Barra de búsqueda**: filtra por nombre, CUIT o email en tiempo real.

**C. Tabla de marcas** con las siguientes columnas:

| Columna | Contenido |
|---|---|
| **Empresa** | Nombre de la marca + email en gris. |
| **CUIT** | Número de CUIT. Ordenable. |
| **Estado** | Badge verde (Activa) o amarillo (Inactiva). |
| **Registro** | Fecha en formato dd/mm/yyyy. Ordenable. |
| **Acciones** | Dos íconos: **Ver detalle** (ojo) y **Editar** (lápiz). |

#### Qué se puede hacer

##### Ver detalle de una marca

Click en el ícono de ojo → navega a `/admin/marcas/[id]`. La pantalla de detalle muestra:

- Datos generales (razón social, CUIT, sitio web, contacto).
- Perfil comercial (rubro, tamaño).
- Pedidos publicados con estado y participaciones.
- Historial de conexiones con talleres.

##### Filtrar y buscar

Solo búsqueda de texto libre por nombre, CUIT o email. No hay filtros adicionales (a diferencia de Talleres).

#### Casos frecuentes

**Caso 1 — Verificar si una marca ya se registró**:
1. Buscar por nombre o CUIT.
2. Si no aparece, verificar en Usuarios con rol MARCA (por si el registro está incompleto).

**Caso 2 — Revisar la actividad comercial de una marca**:
1. Abrir el detalle.
2. Consultar la lista de pedidos publicados y su estado.
3. Ver historial de conexiones con talleres.

#### Notas y limitaciones

- **Sin exportación en la vista listado**: para exportar marcas, usar la sección **Reportes** (Sección 9.2).
- **Menos información visible que Talleres**: refleja que el rol MARCA tiene menos requisitos formales que TALLER en el modelo de la plataforma.
- **Sin filtro por estado**: si hay muchas marcas inactivas y se busca solo activas, usar los stats como referencia o pedir exportación específica.

---

## 4. Contenido y Academia

Esta sección agrupa las tres pantallas que gestionan el material educativo de la plataforma: Colecciones (agrupaciones de videos que arman los cursos), Evaluaciones (quizzes vinculados a cada colección) y Certificados (los que se emiten cuando un taller aprueba una evaluación).

El circuito completo es: crear una **Colección** → agregar **Videos** desde YouTube → configurar una **Evaluación** con preguntas → cuando un taller completa los videos y aprueba la evaluación, el sistema emite un **Certificado**.

### 4.1 Colecciones

#### Para qué sirve

Gestiona las colecciones de cursos que integran la Academia de la plataforma. Cada colección es una agrupación temática de videos curados de YouTube (por ejemplo: "Seguridad e Higiene en el Taller Textil", "Cálculo de Costos y Presupuestos"). Los talleres consumen estas colecciones para formarse y, si se configura una evaluación, obtener certificados.

Desde esta pantalla se pueden crear nuevas colecciones, editar las existentes y gestionar los videos que las componen.

#### Cómo llegar

- Sidebar: **Colecciones**.
- URL directa: `/admin/colecciones`.

#### Qué se ve en pantalla

**A. Encabezado**: título "Colecciones de Cursos" + botón **+ Nueva Colección** (arriba a la derecha).

**B. Barra de búsqueda**: filtra colecciones por título en tiempo real.

**C. Lista de colecciones** (una tarjeta por colección):

Cada tarjeta muestra:
- **Título** de la colección (en color azul, tipografía serif).
- **Institución** que la avala (ej. "OIT", "UNTREF", "SOIVA").
- **Cantidad de videos** que contiene.
- **Badge de estado**: **Publicada** (verde) o **Borrador** (amarillo).
- **Dos botones**:
  - **Editar** — abre la pantalla de edición de la colección (título, descripción, institución, categoría, duración).
  - **Videos** — abre la pantalla de gestión de videos de esa colección.

Si no hay colecciones, aparece el mensaje "No se encontraron colecciones."

#### Qué se puede hacer

##### Crear una nueva colección

1. Click en **+ Nueva Colección** (arriba a la derecha).
2. Se abre el formulario en `/admin/colecciones/nueva` con los siguientes campos:
   - **Título de la colección** (obligatorio).
   - **Descripción** (área de texto libre).
   - **Categoría** (ej. "Seguridad", "Costos", "Formalización").
   - **Institución** (quien avala el contenido).
   - **Duración estimada** (formato libre, ej. "2 horas").
3. Hacer click en **Crear Colección**.
4. El sistema crea la colección en estado **Borrador** y redirige a la pantalla de edición.

##### Editar una colección existente

1. En el listado, hacer click en **Editar** de la colección deseada.
2. Se abre la pantalla de edición donde se pueden modificar todos los campos + publicar/despublicar.
3. Guardar.

##### Agregar videos a una colección

1. En el listado, hacer click en **Videos** de la colección.
2. Se abre `/admin/colecciones/[id]/videos` con el flujo de agregar video:

**Paso 1 — URL de YouTube**: pegar la URL del video. El sistema valida el formato y muestra un tilde verde si es válido o un mensaje de error si no.

**Vista previa**: si la URL es válida, se muestra un reproductor embebido de YouTube para verificar visualmente que sea el video correcto.

**Paso 2 — Información del video**:
- **Título en la plataforma** (obligatorio) — puede diferir del título original de YouTube.
- **Duración estimada** (opcional, formato libre ej. "12:35").

**Verificación de contenido** (checklist obligatorio, los tres deben tildarse para poder guardar):
- Verifiqué que el contenido es preciso y actualizado.
- El audio es claro y comprensible.
- No contiene publicidad invasiva.

3. Hacer click en **Agregar a la colección**.

##### Publicar o despublicar una colección

Desde la pantalla de edición, cambiar el estado. Las colecciones **Publicadas** son visibles para talleres en la Academia; las **Borrador** solo son visibles para administradores.

#### Casos frecuentes

**Caso 1 — Sumar una nueva capacitación completa**:
1. Crear colección desde **+ Nueva Colección** (queda en Borrador).
2. Agregar todos los videos desde la pantalla **Videos**.
3. Configurar la evaluación asociada en la sección **Evaluaciones** (ver 4.2).
4. Volver a editar la colección y cambiar el estado a **Publicada**.

**Caso 2 — Retirar temporalmente un contenido obsoleto**:
1. Buscar la colección.
2. Click en **Editar**.
3. Cambiar el estado a **Borrador**.
4. Guardar. Los talleres dejan de verla en la Academia pero los certificados ya emitidos siguen siendo válidos.

**Caso 3 — Actualizar un video que YouTube dio de baja**:
1. Ir a **Videos** de la colección afectada.
2. Eliminar el video roto.
3. Agregar el video nuevo (buscar una versión alternativa o subida oficial actualizada).
4. Notificar a los talleres si es necesario (Sección 6.2 - Notificaciones).

#### Notas y limitaciones

- **YouTube como única fuente**: la plataforma solo acepta URLs de YouTube. No hay upload directo de videos ni soporte para Vimeo u otras plataformas.
- **Sin campo de "orden" visible en el listado**: los videos aparecen en el orden en que fueron agregados. Para reordenar hay que ir a la pantalla individual de la colección.
- **La cantidad de videos** que se muestra en la tarjeta se actualiza al refrescar la página.
- **Los checkboxes de verificación** son solo una confirmación visual del ADMIN; no realizan validación técnica del video.

---

### 4.2 Evaluaciones

#### Para qué sirve

Gestiona los quizzes asociados a cada colección de la Academia. Una evaluación es un cuestionario de opción múltiple que el taller debe aprobar (superando un puntaje mínimo configurable) para obtener el certificado de la colección.

Cada colección puede tener **una única evaluación** o **ninguna** (si es solo material informativo sin certificación).

#### Cómo llegar

- Sidebar: **Evaluaciones**.
- URL directa: `/admin/evaluaciones`.

#### Qué se ve en pantalla

**A. Encabezado**: título "Evaluaciones" + un badge lateral que indica el estado de la evaluación de la colección seleccionada:
- Badge verde **Evaluación activa** — la colección tiene evaluación configurada.
- Badge gris **Sin evaluación** — la colección aún no tiene preguntas cargadas.

**B. Selector de Colección**: lista desplegable con todas las colecciones existentes. Al cambiar la selección se cargan las preguntas de esa colección.

**C. Bloque Configuración**:
- **Puntaje mínimo para aprobar (%)** — número entre 0 y 100. Por defecto 60. El taller debe superar este puntaje para obtener el certificado.

**D. Bloque Preguntas**:
- Encabezado con la cantidad actual: "Preguntas (N)".
- Botón **+ Agregar Pregunta** (arriba a la derecha del bloque).
- Lista numerada de preguntas. Cada pregunta muestra:
  - Enunciado.
  - Lista de opciones con símbolo circular (● = opción correcta marcada en verde, ○ = opciones incorrectas en gris).
  - Explicación (si se cargó) en cursiva gris debajo.
  - Íconos de acción: **Editar** (lápiz) y **Eliminar** (papelera).

Si no hay preguntas: aparece la tarjeta "No hay preguntas. Agregá la primera."

**E. Botón principal** (parte inferior, ancho completo):
- Si la colección no tiene evaluación: **Crear evaluación para "[nombre de la colección]"**.
- Si ya tiene: **Actualizar evaluación de "[nombre de la colección]"**.

#### Qué se puede hacer

##### Crear una evaluación nueva

1. Seleccionar la colección deseada del desplegable.
2. Aparece la tarjeta "No hay preguntas".
3. Click en **+ Agregar Pregunta**. Se abre un modal con:
   - **Pregunta** (obligatoria).
   - **Opciones** — mínimo 2, máximo 4. Marcar la opción correcta con el radio a la izquierda.
   - **Agregar opción** (link) — suma una opción vacía (hasta máximo 4).
   - **Eliminar opción** (ícono de papelera al lado de cada opción, disponible si hay más de 2).
   - **Explicación** (opcional) — texto que se muestra al taller al rendir para justificar la respuesta correcta.
4. Click en **Agregar**. La pregunta se suma al listado (en memoria, aún no guardada en el servidor).
5. Repetir hasta tener todas las preguntas deseadas.
6. Ajustar el **Puntaje mínimo** si es necesario.
7. Click en **Crear evaluación para "[nombre]"**. Se guarda en el servidor y aparece el mensaje verde "Evaluación guardada correctamente".

##### Editar una pregunta existente

1. Click en el ícono de **lápiz** al lado de la pregunta.
2. Se abre el modal con los datos precargados.
3. Modificar y hacer click en **Actualizar**.
4. Click en **Actualizar evaluación** para persistir en el servidor.

##### Eliminar una pregunta

1. Click en el ícono de **papelera** al lado de la pregunta.
2. La pregunta se elimina del listado (en memoria).
3. Click en **Actualizar evaluación** para persistir el cambio.

**Importante**: los cambios en las preguntas no se guardan hasta que se hace click en el botón inferior de crear/actualizar evaluación. Si se cambia de colección antes de guardar, se pierden los cambios sin advertencia.

##### Cambiar el puntaje mínimo

Modificar el valor en el campo **Puntaje mínimo** y hacer click en **Actualizar evaluación**. Aplica a evaluaciones futuras — los certificados ya emitidos no se ven afectados.

#### Casos frecuentes

**Caso 1 — Diseñar la evaluación de una colección nueva**:
1. Asegurarse de que la colección ya existe y tiene videos.
2. Ir a **Evaluaciones** y seleccionarla.
3. Definir un puntaje mínimo razonable (60% es el default).
4. Cargar 5-10 preguntas de opción múltiple con explicaciones útiles.
5. Guardar la evaluación.
6. Verificar rindiendo la evaluación desde una cuenta de taller de prueba antes de publicar la colección.

**Caso 2 — Ajustar preguntas después de recibir feedback**:
1. Seleccionar la colección.
2. Editar las preguntas confusas o incorrectas.
3. Guardar.
4. Los talleres que ya aprobaron mantienen su certificado — solo los que rindan de ahora en adelante verán la versión actualizada.

**Caso 3 — Bajar la exigencia de una evaluación**:
1. Seleccionar la colección.
2. Cambiar el puntaje mínimo (ej. de 70 a 60).
3. Guardar. Los próximos intentos usarán el nuevo umbral.

#### Notas y limitaciones

- **Una evaluación por colección**: no se pueden tener múltiples versiones ni evaluaciones alternativas para la misma colección.
- **Cambios en memoria**: agregar, editar o eliminar preguntas solo se persiste al hacer click en el botón principal inferior. Cambiar de colección o cerrar la pantalla sin guardar descarta los cambios.
- **Sin previsualización desde el ADMIN**: para ver cómo se ve la evaluación al rendir hay que hacerlo desde una cuenta de taller (probar en un ambiente de prueba antes de publicar).
- **Sin importación masiva**: cada pregunta se carga a mano en el modal. No hay carga por CSV ni por API directa desde el panel.

---

### 4.3 Certificados

#### Para qué sirve

Registro y control de todos los certificados emitidos a talleres tras aprobar evaluaciones. Cada certificado tiene un código único, apunta a una colección específica y a un taller determinado, y puede descargarse en PDF. Los certificados pueden **revocarse** si se detecta un fraude, un error o si el taller lo solicita.

#### Cómo llegar

- Sidebar: **Certificados**.
- URL directa: `/admin/certificados`.

#### Qué se ve en pantalla

**A. Tarjetas de métricas** (dos tarjetas):
- **Total** — cantidad total de certificados emitidos (válidos + revocados).
- **Este mes** — certificados emitidos en el mes calendario actual.

**B. Barra de búsqueda**: filtra por nombre de taller o por código de certificado.

**C. Tabla de certificados** con las siguientes columnas:

| Columna | Contenido |
|---|---|
| **Código** | Código único alfanumérico del certificado. Ordenable. |
| **Taller** | Nombre del taller que obtuvo el certificado. |
| **Colección** | Nombre de la colección/curso completado. |
| **Fecha** | Fecha de emisión (dd/mm/yyyy). |
| **Estado** | Badge verde (Válido) o amarillo (Revocado). |
| **PDF** | Link **Descargar** que baja el certificado en PDF. |
| **Acciones** | Íconos: **Ver detalle** (ojo) y **Revocar** (papelera, solo aparece si el certificado está válido). |

#### Qué se puede hacer

##### Ver vista previa de un certificado

1. Click en el ícono de **ojo** de la fila.
2. Se abre un modal grande con la vista previa del certificado tal cual lo ve el taller:
   - Título "CERTIFICADO".
   - Nombre del taller.
   - Nombre de la colección completada.
   - Calificación obtenida (porcentaje).
   - Código único del certificado.
3. Desde el modal se puede descargar el PDF o cerrar la vista previa.

##### Descargar el PDF de un certificado

Click en el link **Descargar** en la columna PDF. El navegador descarga el archivo PDF con nombre `certificado-[código].pdf`.

##### Revocar un certificado

1. Click en el ícono de **papelera** (solo visible si el certificado está válido).
2. Se abre un modal con:
   - Nombre del taller.
   - Código del certificado.
   - **Selector de motivo de revocación** (obligatorio): **Datos falsos**, **Solicitud del taller**, **Error administrativo**, **Otro**.
3. Elegir el motivo y hacer click en **Revocar**.
4. El certificado pasa a estado **Revocado** y ya no puede descargarse desde el perfil público del taller. El motivo queda registrado en logs.

**Importante**: la revocación es una acción sensible. No hay flujo automático de "reactivación": si se revoca por error, hay que emitir un nuevo certificado (lo cual requiere que el taller rinda nuevamente la evaluación).

##### Buscar certificados

Escribir en la barra de búsqueda por nombre del taller o por código. La lista se filtra en tiempo real.

#### Casos frecuentes

**Caso 1 — Un taller reclama que no tiene un certificado que sí obtuvo**:
1. Buscar por el nombre del taller.
2. Si aparece con estado **Válido**, hacer click en **Descargar** y enviárselo o instruirle cómo bajarlo desde su perfil.
3. Si aparece **Revocado**, revisar en Logs (Sección 9) el motivo y la fecha de revocación.
4. Si no aparece, ir al perfil del taller y verificar que efectivamente completó y aprobó la evaluación.

**Caso 2 — Se detectó fraude en una evaluación**:
1. Buscar el certificado del taller.
2. Click en el ícono de papelera.
3. Seleccionar motivo **Datos falsos**.
4. Confirmar revocación.
5. Registrar el incidente institucionalmente y notificar al taller (Sección 6.2).

**Caso 3 — Reporte de certificaciones del último mes**:
1. Mirar la métrica **Este mes** en la parte superior.
2. Para ver el detalle: buscar por nombre de colección o exportar desde la sección **Reportes** (Sección 9.2).

#### Notas y limitaciones

- **Sin filtro por estado en el listado**: la tabla mezcla certificados válidos y revocados. Para segmentar, usar la búsqueda y ordenar por columna **Estado**.
- **Sin filtro por período**: la métrica "Este mes" es el único agrupamiento temporal visible. Para períodos custom, usar **Reportes**.
- **Sin exportación desde este listado**: para descargar la lista completa en CSV/Excel, ir a **Reportes**.
- **La generación del PDF depende del servidor**: si hay problemas de rendimiento, la descarga puede demorar unos segundos.
- **Certificados revocados no se eliminan**: se mantienen en la base con el estado marcado y el motivo registrado. Nunca se pierde el rastro.

---

## 5. Operación comercial

Esta sección agrupa las tres pantallas que gestionan la operación comercial de la plataforma: Pedidos (órdenes que publican las marcas y trabajan los talleres), Procesos (catálogo de capacidades productivas que los talleres pueden ofrecer) y Auditorías (inspecciones presenciales que realiza el equipo).

Es la sección más operativa del panel: aquí se consulta cómo va el flujo comercial del piloto, se dan de alta procesos productivos que aparecen en el directorio y se coordinan las visitas de auditoría a los talleres.

### 5.1 Pedidos

#### Para qué sirve

Es el panel de control de todos los pedidos publicados en la plataforma. Un pedido es una orden de trabajo publicada por una marca (por ejemplo: "300 remeras básicas talla M-L, con etiqueta interna, entrega en 30 días"). Los talleres postulan a los pedidos, la marca elige y se genera una orden de manufactura.

Desde esta pantalla se puede monitorear el estado de cada pedido, filtrar por estado, buscar por marca o por número de OM (Orden de Manufactura) y exportar un reporte completo.

#### Cómo llegar

- Sidebar: **Pedidos**.
- URL directa: `/admin/pedidos`.

#### Qué se ve en pantalla

**A. Tarjetas de métricas** (cinco tarjetas):

| Métrica | Descripción |
|---|---|
| **Total** | Cantidad total de pedidos en la plataforma (en todos los estados). |
| **Completados** | Pedidos que se cerraron exitosamente. |
| **En ejecución** | Pedidos en producción activa por parte de talleres. |
| **Publicados** | Pedidos abiertos a la recepción de cotizaciones/postulaciones. |
| **Borradores** | Pedidos que la marca creó pero aún no publicó. |

**B. Barra de búsqueda y filtro**:
- Búsqueda: filtra por nombre de marca, ID de OM o ID de pedido en tiempo real.
- Selector de estado: **Todos los estados**, **Borrador**, **Publicado**, **En ejecución**, **Esperando entrega**, **Completado**, **Cancelado**.

**C. Botón**: **Exportar reporte de pedidos** — descarga un archivo con la lista filtrada.

**D. Tabla de pedidos** con las siguientes columnas:

| Columna | Contenido |
|---|---|
| **OM** | ID de la Orden de Manufactura (código único). |
| **Marca** | Nombre de la marca que publicó el pedido. |
| **Prenda** | Tipo de prenda (ej. "Remera básica", "Pantalón sastrero"). |
| **Estado** | Badge con color según el estado (ver tabla más abajo). |
| **Cantidad** | Cantidad de unidades solicitadas (formato con separador de miles). |
| **Órdenes** | Cantidad de órdenes de producción generadas a partir del pedido. |
| **Fecha** | Fecha de creación (dd/mm/yyyy). Ordenable. |
| **Acciones** | Ícono de **Ver detalle** (ojo). |

**Estados del pedido y sus colores**:

| Estado | Badge | Significado |
|---|---|---|
| **BORRADOR** | Gris | La marca lo creó pero aún no lo publicó. Los talleres no lo ven. |
| **PUBLICADO** | Amarillo | Publicado y visible para talleres. Recibe cotizaciones/postulaciones. |
| **EN EJECUCIÓN** | Azul | Se asignó a uno o más talleres. Producción en curso. |
| **ESPERANDO ENTREGA** | Amarillo | Producción finalizada, esperando entrega física. |
| **COMPLETADO** | Verde | Cerrado exitosamente. |
| **CANCELADO** | Rojo | Se anuló antes de completarse (por la marca o por decisión operativa). |

#### Qué se puede hacer

##### Ver el detalle de un pedido

Click en el ícono de **ojo** de la fila. Se navega a la pantalla de detalle del pedido, donde se pueden ver:
- Descripción completa del pedido (prenda, especificaciones, cantidad).
- Talleres postulados y cotizaciones recibidas.
- Órdenes de producción generadas.
- Historial de cambios de estado.
- Documentos asociados (fichas técnicas, moldes, muestras).

##### Filtrar y buscar

Combinar búsqueda por texto con filtro por estado. Ejemplos:
- Filtrar por **En ejecución** → ver todos los pedidos activos en producción.
- Buscar "Zara" → ver todos los pedidos de una marca específica.
- Buscar por OM ID → localizar un pedido puntual reportado por incidencia.

##### Exportar reporte

Click en **Exportar reporte de pedidos** → descarga un archivo con la lista filtrada. Útil para reportes trimestrales, análisis de tracción del marketplace y presentaciones institucionales.

#### Ciclo de vida de un pedido

Un pedido pasa típicamente por los siguientes estados en orden:

1. **BORRADOR** — la marca lo está armando. No es visible para talleres.
2. **PUBLICADO** — la marca lo publica. Los talleres pueden verlo y postularse.
3. **EN EJECUCIÓN** — la marca eligió taller(es) y la producción arrancó.
4. **ESPERANDO ENTREGA** — el taller terminó la producción y está en logística.
5. **COMPLETADO** — la entrega se concretó, cierre exitoso.

En cualquier momento entre 1 y 4, el pedido puede pasar a **CANCELADO** (por decisión de la marca o intervención operativa).

#### Casos frecuentes

**Caso 1 — Chequeo semanal del marketplace**:
1. Ir al panel de Pedidos.
2. Revisar la métrica **Publicados** (indicador de demanda activa).
3. Revisar la métrica **En ejecución** (indicador de flujo de producción).
4. Si **Publicados** está alto y **En ejecución** bajo, investigar por qué no se cierran los matches (ver detalle de pedidos publicados por más de N días).

**Caso 2 — Una marca reporta que su pedido no aparece**:
1. Buscar por nombre de marca o CUIT.
2. Verificar el estado del pedido. Si está en **BORRADOR**, la marca no lo publicó — instruirla o publicarlo desde el detalle.
3. Si está en **PUBLICADO** y no recibe postulaciones, revisar si el matching automático está funcionando (Sección 6.2 - Notificaciones) o si hay talleres con esas capacidades en el directorio.

**Caso 3 — Reporte mensual de operación comercial**:
1. Filtrar por **Completado** y anotar el número.
2. Filtrar por **En ejecución** y anotar el número.
3. Exportar el reporte completo.
4. Combinar con datos de Talleres y Marcas para armar el informe institucional.

#### Notas y limitaciones

- **Sin edición desde el panel**: no se pueden modificar datos del pedido desde el ADMIN. Los cambios los hace la marca desde su propio panel.
- **Sin cancelación desde el panel**: cancelar un pedido requiere que la marca lo haga desde su cuenta, o intervención del equipo técnico desde la base.
- **Límite de 100 pedidos por carga**: usar filtros para acotar la vista si crece por encima.
- **Reporte exportado**: los campos del CSV son los mismos de la tabla + campos adicionales de detalle (ver **Reportes** para exportes con más columnas).

---

### 5.2 Procesos

#### Para qué sirve

Gestiona el catálogo de procesos productivos que los talleres pueden marcar como capacidades propias. Estos "procesos" son los tags que aparecen en el directorio público como filtros — por ejemplo: "Corte", "Confección", "Bordado", "Serigrafía", "Sublimación", "Planchado industrial".

Este catálogo es maestro: cada proceso que se agrega desde aquí aparece como opción disponible para todos los talleres al armar su perfil productivo. Es importante mantenerlo consistente y evitar duplicados (ej. "Bordado" vs "Bordados").

#### Cómo llegar

- Sidebar: **Procesos**.
- URL directa: `/admin/procesos`.

#### Qué se ve en pantalla

**A. Encabezado**: título "Procesos Productivos" + descripción "Tags que los talleres usan para indicar sus capacidades" + botón **+ Nuevo Proceso** (arriba a la derecha).

**B. Barra de búsqueda**: filtra procesos por nombre en tiempo real.

**C. Tabla de procesos** con las siguientes columnas:

| Columna | Contenido |
|---|---|
| **Proceso** | Nombre del proceso. Si está inactivo, aparece un badge gris "Inactivo" al lado. |
| **Descripción** | Descripción libre del proceso (o "-" si no tiene). |
| **Talleres** | Cantidad de talleres que declararon tener esta capacidad. |
| **Acciones** | Ícono de **Editar** (lápiz). |

Si no hay procesos, aparece el mensaje "No hay procesos registrados."

#### Qué se puede hacer

##### Crear un nuevo proceso

1. Click en **+ Nuevo Proceso** (arriba a la derecha).
2. Se abre un modal con:
   - **Nombre del proceso** (obligatorio) — ej. "Termosellado".
   - **Descripción** (opcional) — texto breve que explique el proceso.
   - **Checkbox "Proceso activo (visible en el directorio)"** — tildado por defecto.
3. Click en **Guardar**.
4. El proceso aparece inmediatamente disponible como capacidad seleccionable por los talleres.

##### Editar un proceso

1. Click en el ícono de **lápiz** de la fila.
2. Se abre el mismo modal con los datos cargados.
3. Modificar y guardar.

**Consideraciones al editar**:
- Cambiar el nombre modifica cómo se muestra a los talleres y en el directorio, pero no rompe las asociaciones existentes (los talleres que ya lo tenían marcado siguen asociados).
- Desactivar un proceso (destildar "Proceso activo") lo oculta del directorio y de las opciones de nuevos talleres, pero **no lo quita** de los talleres que ya lo tenían marcado.

##### Buscar procesos

Escribir en la barra de búsqueda. La tabla se filtra en tiempo real.

#### Casos frecuentes

**Caso 1 — Sumar un proceso nuevo detectado en campo**:
1. Verificar antes en el listado que no exista uno equivalente (evitar duplicados como "Estampado" y "Estampación").
2. Click en **+ Nuevo Proceso**.
3. Cargar nombre + descripción + dejar tildado "Proceso activo".
4. Guardar.

**Caso 2 — Consolidar duplicados**:
1. Detectar dos procesos que son lo mismo (ej. "Bordado" y "Bordados").
2. Verificar en la columna Talleres cuál tiene más asociaciones (mantener ese).
3. Desactivar el duplicado destildando "Proceso activo".
4. Coordinar con soporte técnico para migrar los talleres del proceso desactivado al principal (requiere intervención en base).

**Caso 3 — Retirar un proceso obsoleto**:
1. Buscar el proceso.
2. Editar y destildar "Proceso activo".
3. Guardar. El proceso desaparece del directorio y de las opciones para talleres nuevos.

#### Notas y limitaciones

- **Sin eliminación**: no se pueden borrar procesos desde el panel, solo desactivarlos. La eliminación efectiva requiere intervención en base y cuidado (los talleres asociados quedarían huérfanos del tag).
- **Sin fusión de procesos**: consolidar duplicados requiere trabajo manual en base para transferir las asociaciones.
- **Sin categorización**: los procesos son una lista plana. No hay jerarquías (ej. "Estampado > Serigrafía > Sublimación") — todo va al mismo nivel.
- **Impacto en el directorio**: los cambios son inmediatos y visibles en el directorio público. Verificar antes de guardar.

---

### 5.3 Auditorías

#### Para qué sirve

Panel para programar, dar seguimiento y consultar el historial de auditorías presenciales realizadas a talleres. Cada auditoría es una visita de un inspector al taller para verificar habilitaciones, hacer seguimiento, realizar re-auditorías o inspeccionar por primera vez un taller nuevo.

Desde esta pantalla se pueden ver las auditorías programadas, las que están en curso o pendientes de informe, y el historial completo de auditorías cerradas.

#### Cómo llegar

- Sidebar: **Auditorías**.
- URL directa: `/admin/auditorias`.

#### Qué se ve en pantalla

**A. Encabezado**: título "Auditorías" + botón **Nueva Auditoría** (arriba a la derecha, abre un modal para programar).

**B. Tarjetas de métricas** (tres tarjetas):
- **Programadas** — auditorías planificadas para el futuro que aún no se hicieron.
- **En curso / Pendientes informe** — auditorías que se realizaron pero cuyo informe aún no se cerró.
- **Completadas** — auditorías con informe cerrado.

**C. Sección "Próximas Auditorías"**:

Lista de tarjetas con las auditorías programadas. Cada tarjeta muestra:
- Fecha y hora de la auditoría.
- Nombre del taller.
- Ubicación del taller.
- Nombre del auditor asignado (o "Sin auditor asignado").
- Tipo de auditoría.
- Badge de estado (Programada, en azul claro).

Si no hay auditorías programadas: aparece un **EmptyState** con el mensaje "Sin auditorías programadas — No hay auditorías pendientes. Programá una nueva desde el botón de arriba."

**D. Sección "Pendientes de Informe"** (solo aparece si hay pendientes):

Lista de tarjetas con borde amarillo a la izquierda. Cada una muestra:
- Ícono de alerta.
- Fecha y nombre del taller.
- Auditor y tipo.
- Cantidad de acciones correctivas registradas.
- Botón **Cargar informe** que navega al detalle para cerrar la auditoría.

**E. Sección "Historial"**:

Lista de las auditorías completadas o canceladas, con:
- Nombre del taller.
- Fecha.
- Tipo.
- Resultado (si se registró).
- Badge de estado.

**Tipos de auditoría**:

| Tipo | Cuándo se usa |
|---|---|
| **Primera visita** | Primera inspección de un taller recién incorporado. |
| **Verificación de habilitaciones** | Chequeo de que la documentación cargada coincide con la realidad. |
| **Seguimiento** | Visitas de rutina para talleres ya integrados al piloto. |
| **Re-auditoría** | Nueva inspección después de una anterior que detectó problemas. |

**Estados de la auditoría**:

| Estado | Badge | Significado |
|---|---|---|
| **PROGRAMADA** | Azul claro | Planificada, aún no realizada. |
| **EN_CURSO** | Amarillo | Realizada, informe en carga. |
| **COMPLETADA** | Verde | Informe cerrado. |
| **CANCELADA** | Gris | Suspendida antes de realizarse. |

#### Qué se puede hacer

##### Programar una nueva auditoría

1. Click en **Nueva Auditoría** (arriba a la derecha).
2. Se abre un modal donde se puede:
   - Seleccionar el **taller** (del listado de talleres registrados).
   - Definir **fecha y hora**.
   - Elegir el **tipo** (Primera visita, Verificación, Seguimiento, Re-auditoría).
   - Asignar un **auditor** (opcional).
3. Guardar. La auditoría aparece en la sección Próximas.

##### Cargar el informe de una auditoría

Cuando el inspector realiza la visita, la auditoría pasa a estado **EN_CURSO** y aparece en "Pendientes de Informe".

1. En la sección Pendientes, click en **Cargar informe** de la auditoría deseada.
2. Se navega a la pantalla de detalle donde se puede:
   - Registrar el resultado (Conforme, No conforme con observaciones, etc.).
   - Cargar acciones correctivas si corresponde.
   - Adjuntar fotos y observaciones.
   - Marcar la auditoría como completada.

##### Consultar el historial

Scrollear hasta la sección **Historial** para ver todas las auditorías cerradas. Están ordenadas de la más reciente a la más antigua.

#### Casos frecuentes

**Caso 1 — Planificación semanal de visitas**:
1. Ir a **Auditorías**.
2. Revisar la sección Próximas para saber qué visitas hay agendadas.
3. Si hay huecos de agenda, programar nuevas con el botón **Nueva Auditoría**.
4. Coordinar con el equipo de inspectores en base a esta grilla.

**Caso 2 — Cierre de informes pendientes**:
1. Revisar la sección **Pendientes de Informe**.
2. Para cada una, hacer click en **Cargar informe**.
3. Cerrar la auditoría con el resultado correspondiente.
4. Si detecta acciones correctivas, registrarlas para seguimiento futuro (re-auditoría).

**Caso 3 — Reporte de cumplimiento de auditorías**:
1. Ver la métrica **Completadas** para saber cuántas se hicieron.
2. Comparar con la meta institucional del proyecto.
3. Exportar detalles desde la sección **Reportes** (Sección 9.2) para armar el informe.

#### Notas y limitaciones

- **Últimas 50 auditorías**: la pantalla trae las 50 auditorías más recientes ordenadas por fecha descendente. Para históricos más profundos, usar **Reportes**.
- **Sin filtro por rango de fechas** desde el listado: si se necesita ver un período específico, revisar el detalle en la sección Reportes.
- **Sin edición inline**: los datos de la auditoría (fecha, taller, auditor, tipo) se cargan al programarla. Cambios posteriores requieren editar desde el detalle o intervención técnica.
- **La sección "Pendientes de Informe" solo se muestra si hay pendientes**: si el bloque no aparece, no hay informes por cargar.
- **El botón "Cargar informe"** redirige a `/admin/auditorias/[id]` donde se completa el flujo de cierre.

---

## 6. Comunicación y feedback

Esta sección agrupa las tres pantallas dedicadas a la comunicación entre la plataforma y sus usuarios, y al registro cualitativo del proyecto: Observaciones (notas de campo del equipo del piloto), Notificaciones (envío masivo e individual de mensajes) y Feedback (reportes que los usuarios envían desde el widget de feedback dentro de la plataforma).

A diferencia de las secciones operativas anteriores, estas están más orientadas al **acompañamiento del piloto** que a la operación transaccional: sirven para armar el reporte a OIT, comunicar novedades importantes al ecosistema y recibir señales de mejora.

### 6.1 Observaciones

#### Para qué sirve

Registro cualitativo del piloto para el reporte a OIT. Aquí se cargan observaciones que el equipo detecta en campo (visitas presenciales, llamadas, WhatsApps, entrevistas, uso de la plataforma), tanto positivas como problemáticas, para armar un corpus de aprendizajes del proyecto.

Cada observación se categoriza por tipo (resistencia, expectativa, dificultad, oportunidad, éxito, contexto), fuente (dónde se detectó), sentimiento (positivo/neutral/negativo) e importancia (1 a 5 estrellas). Puede asociarse a un taller o marca específico, y se pueden agregar tags libres para búsquedas transversales (ej. `cultural`, `fiscal`, `género`, `edad`).

#### Cómo llegar

- Sidebar: **Observaciones**.
- URL directa: `/admin/observaciones`.

#### Qué se ve en pantalla

**A. Encabezado**: título "Observaciones de campo" + dos botones a la derecha:
- **Reporte mensual** — descarga un archivo con el resumen de observaciones del último mes.
- **+ Nueva observación** — navega al formulario de carga.

**B. Barra de filtros** (formulario que se envía con **Filtrar**):

| Filtro | Opciones |
|---|---|
| **Tipo** | Todos, Resistencia, Expectativa, Dificultad técnica, Dificultad proceso, Oportunidad, Éxito, Contexto taller, Contexto marca, Política pública. |
| **Fuente** | Todas, Visita, Llamada, WhatsApp, Plataforma, Entrevista, Otros. |
| **Sentimiento** | Todos, Positivo, Neutral, Negativo. |
| **Período** | Últimos 7 días, 30 días (default), 90 días, 6 meses, Todos. |
| **Tags** | Campo de texto libre. Se pueden pasar varios separados por coma (ej. "cultural, fiscal"). |

**C. Contador de resultados**: "N observaciones" según los filtros aplicados.

**D. Lista de observaciones** (una tarjeta por observación):

Cada tarjeta muestra:
- **Badge del tipo** con color según categoría (rojo para dificultades y resistencias, verde para éxitos, amarillo para expectativas, gris para contextos).
- **Etiqueta de fuente** (Visita, Llamada, etc.).
- **Etiqueta de sentimiento** en color (verde/gris/rojo).
- **Estrellas de importancia** (de 1 a 5).
- **Título** de la observación.
- **Contenido** (recortado a 2 líneas).
- **Metadatos abajo**: autor, fecha, y si aplica "Sobre: [nombre] ([rol])" cuando la observación está asociada a un actor.
- **Tags** en formato `#tag`.

Toda la tarjeta es clickeable — al hacer click, navega a `/admin/observaciones/[id]/editar` para editar la observación.

Si no hay resultados, aparece un **EmptyState** con el mensaje "Sin observaciones — No hay observaciones de campo que coincidan con los filtros. Registrá la primera." + botón para crear nueva.

**Tabla de tipos de observación y sus significados**:

| Tipo | Cuándo usar |
|---|---|
| **Resistencia** | Cuando un actor manifiesta oposición o rechazo al uso de la plataforma o alguna función. |
| **Expectativa** | Cuando un actor expresa qué espera que la plataforma haga (aunque aún no lo haga). |
| **Dificultad técnica** | Problemas al usar la plataforma (interfaz, bugs, confusión de flujos). |
| **Dificultad proceso** | Problemas fuera de la plataforma que la impactan (trámites externos, coordinación con terceros). |
| **Oportunidad** | Ideas o pistas para nuevas funciones, mejoras, ampliaciones. |
| **Éxito** | Historias positivas del uso de la plataforma (matching exitoso, formalización lograda, etc.). |
| **Contexto taller** | Información contextual sobre un taller (situación familiar, económica, sectorial). |
| **Contexto marca** | Información contextual sobre una marca (posicionamiento, estrategia). |
| **Política pública** | Observaciones relevantes para el diseño de políticas (regulaciones, incentivos, barreras institucionales). |

#### Qué se puede hacer

##### Cargar una nueva observación

1. Click en **+ Nueva observación** (arriba a la derecha).
2. Se abre el formulario en `/admin/observaciones/nueva` con los siguientes campos:
   - **Título** (obligatorio).
   - **Contenido** (obligatorio, texto largo).
   - **Tipo** (obligatorio, selector).
   - **Fuente** (obligatoria).
   - **Sentimiento** (opcional).
   - **Importancia** (1 a 5 estrellas).
   - **Fecha del evento** (por defecto hoy).
   - **Usuario asociado** (opcional, para vincular a un taller/marca específico).
   - **Tags** (texto libre, separados por coma).
3. Guardar. La observación aparece en el listado.

##### Editar una observación

1. Click en cualquier tarjeta del listado.
2. Se abre `/admin/observaciones/[id]/editar` con todos los campos precargados.
3. Modificar y guardar.

##### Descargar el reporte mensual

Click en **Reporte mensual** (arriba a la derecha). Descarga un archivo con el resumen del último mes: cantidad por tipo, distribución por sentimiento, observaciones destacadas, tendencias identificadas.

##### Filtrar el corpus

Combinar filtros para explorar el corpus según intereses específicos:
- **Tipo = Éxito + Período = 30 días** → recopilar casos de éxito del mes para el reporte.
- **Sentimiento = Negativo + Fuente = Plataforma** → detectar puntos de dolor del uso digital.
- **Tags = "cultural"** → agrupar observaciones vinculadas a factores culturales del sector.

#### Casos frecuentes

**Caso 1 — Registro diario de una visita a un taller**:
1. Volver de la visita, entrar a **Observaciones** → **+ Nueva observación**.
2. Cargar título breve ("Taller X — resistencia a subir facturas por miedo a AFIP").
3. Elegir tipo (Resistencia), fuente (Visita), sentimiento (Negativo), importancia (3 o 4 estrellas si es representativo).
4. Asociar al taller correspondiente.
5. Agregar tags relevantes (`fiscal`, `cultural`, `barrera-piloto`).
6. Guardar.

**Caso 2 — Armado del reporte trimestral para OIT**:
1. Filtrar por Período = 90 días.
2. Descargar el reporte mensual (o exportar desde Reportes con más detalle).
3. Filtrar por Tipo = Éxito → armar sección "Aprendizajes positivos".
4. Filtrar por Tipo = Resistencia + Dificultad → armar sección "Barreras identificadas".
5. Filtrar por Tipo = Oportunidad → armar sección "Recomendaciones".

**Caso 3 — Cruce de patrones**:
1. Filtrar por tag específico (ej. `género`).
2. Revisar todas las observaciones para detectar patrones que no aparecen aislados.
3. Cargar una observación de tipo **Contexto** que sintetice el patrón encontrado.

#### Notas y limitaciones

- **Últimas 50 observaciones**: la lista trae hasta 50. Para análisis histórico completo, usar la exportación desde Reportes.
- **Sin edición masiva**: cada observación se edita individualmente.
- **Tags libres**: no hay diccionario controlado. Cuidar la consistencia de nombres (evitar "cultural" y "culturales" como tags separados).
- **La asociación a usuario** (opcional) sirve para trazar la observación a un actor. Es útil para el reporte a OIT pero puede omitirse si es una observación general del ecosistema.
- **Sin eliminación desde el listado**: para eliminar una observación hay que hacerlo desde el detalle de edición.

---

### 6.2 Notificaciones

#### Para qué sirve

Panel de gestión de las comunicaciones que la plataforma envía a los usuarios. Combina dos flujos distintos: **Comunicaciones masivas** (mensajes que se envían a grupos amplios, como un anuncio a todos los talleres) y **Mensajes individuales** (mensajes enviados a un usuario específico desde el detalle de su perfil).

Todas las comunicaciones enviadas quedan registradas para trazabilidad, con métricas de recepción y lectura.

#### Cómo llegar

- Sidebar: **Notificaciones**.
- URL directa: `/admin/notificaciones` (por defecto abre en la tab de comunicaciones masivas).
- URL directa para mensajes individuales: `/admin/notificaciones?tab=individuales`.

#### Qué se ve en pantalla

**A. Encabezado**: título "Comunicaciones" + botón para enviar nueva comunicación (arriba a la derecha).

**B. Tarjetas de métricas** (tres tarjetas):
- **Total enviadas** — cantidad total de comunicaciones que el equipo ADMIN envió.
- **Sin leer** — cuántas quedan sin ser abiertas por los destinatarios.
- **Leídas** — cuántas fueron leídas.

**C. Tabs**:
- **Comunicaciones masivas** (por defecto).
- **Mensajes individuales**.

#### Tab: Comunicaciones masivas

Lista de las últimas 30 comunicaciones enviadas a grupos. Cada línea muestra:
- **Título** de la comunicación.
- **Mensaje** (recortado a 2 líneas).
- **Enviado por** (nombre del ADMIN que la disparó).
- **Cantidad de destinatarios** (con ícono de personas).
- **Canal** (Email, WhatsApp, Push, o In-app).
- **Fecha** de envío.

Si no hay comunicaciones, aparece un **EmptyState** con el mensaje "Sin comunicaciones enviadas — Todavía no enviaste ninguna comunicación. Usá el formulario de arriba para enviar la primera."

#### Tab: Mensajes individuales

Últimos 50 mensajes individuales enviados a usuarios específicos. Tabla con:

| Columna | Contenido |
|---|---|
| **Fecha** | Fecha y hora del envío. |
| **Destinatario** | Nombre del usuario destinatario + quién lo envió abajo. |
| **Título** | Asunto del mensaje. |
| **Vía** | Badges: **Plataforma** (siempre); **WhatsApp** (si además se disparó por WhatsApp). |
| **Leído** | Badge verde (Sí) o amarillo (No). |

#### Qué se puede hacer

##### Enviar una comunicación masiva

1. Click en el botón de envío arriba a la derecha (abre un formulario).
2. Elegir el segmento de destinatarios:
   - **Todos los talleres**.
   - **Todos los talleres de una etapa específica** (Etapa inicial / En proceso / Consolidada).
   - **Todas las marcas**.
   - **Combinaciones custom** (según segmentación disponible).
3. Elegir el **canal**: In-app (dentro de la plataforma), Email, WhatsApp.
4. Redactar **título** y **mensaje**.
5. Confirmar el envío.
6. La comunicación aparece en el listado como un batch con la cantidad de destinatarios.

##### Enviar un mensaje individual

Los mensajes individuales no se disparan desde esta pantalla. Se disparan desde el detalle de cada usuario (ver Sección 3.1 - Usuarios → Enviar mensaje). Esta pantalla solo los muestra en el histórico.

##### Consultar métricas de lectura

- La métrica **Sin leer** es global. Para ver el detalle de una comunicación específica, se puede consultar en Logs.
- La columna **Leído** en mensajes individuales indica si el destinatario abrió el mensaje.

##### Ir a Logs del sistema

Enlace al pie de página que lleva a `/admin/logs` para ver la actividad general del sistema (incluye envíos automáticos como notificaciones de matching, aprobaciones de documentos, etc.).

**Canales de comunicación disponibles**:

| Canal | Descripción |
|---|---|
| **In-app** (Plataforma) | Aparece en la campana de notificaciones del usuario dentro de la plataforma. Es el canal por defecto. |
| **Email** | Se envía por Resend al email del usuario. Requiere que Resend esté configurado (Sección 8.1). |
| **WhatsApp** | Se envía por WhatsApp click-to-chat. Requiere que el usuario tenga teléfono cargado. |
| **Push** | Notificaciones push del navegador. Requiere que el usuario haya dado permiso. |

#### Casos frecuentes

**Caso 1 — Anunciar un mantenimiento programado**:
1. Ir a **Comunicaciones masivas**.
2. Click en enviar nueva.
3. Segmentar a **Todos los usuarios**.
4. Canal: **In-app + Email**.
5. Título: "Mantenimiento programado — [fecha]".
6. Mensaje explicativo con horarios y qué va a estar afectado.
7. Enviar.

**Caso 2 — Recordar a talleres pendientes que carguen documentación**:
1. Segmentar a **Talleres en Etapa inicial** (BRONCE).
2. Canal: **Email + WhatsApp**.
3. Mensaje motivacional con link al perfil.
4. Enviar y revisar más tarde la métrica **Sin leer** para hacer follow-up manual.

**Caso 3 — Consultar quién le mandó qué a un usuario específico**:
1. Ir a la tab **Mensajes individuales**.
2. Buscar visualmente el destinatario (o filtrar con Ctrl+F en el navegador si el listado es largo).
3. Revisar la columna "por [nombre]" para saber qué ADMIN envió cada mensaje.

#### Notas y limitaciones

- **Últimas 30 comunicaciones masivas**: el listado trae solo las 30 más recientes. Para históricos completos, ir a Logs.
- **Últimos 50 mensajes individuales**: similar limitación.
- **Los envíos son irrevocables**: una vez disparada la comunicación, no se puede "des-enviar" ni editar el mensaje.
- **El canal Email depende de Resend**: si la configuración de Resend falla, los emails no llegan pero el envío queda registrado como si hubiera salido. Revisar Logs para confirmar.
- **El canal WhatsApp usa wa.me** (click-to-chat), no la API oficial de WhatsApp Business. Esto significa que el mensaje no se envía automáticamente — el usuario recibe un link que abre el chat pre-cargado con el mensaje.

---

### 6.3 Feedback

#### Para qué sirve

Recepción y consulta de todos los feedbacks que los usuarios de la plataforma envían desde el widget de feedback (visible como un botón flotante en la esquina inferior derecha de cualquier pantalla). Es la vía principal por la cual talleres, marcas y otros actores reportan bugs, sugieren mejoras, informan gaps de funcionalidad o expresan confusión.

#### Cómo llegar

- Sidebar: **Feedback**.
- URL directa: `/admin/feedback`.

#### Qué se ve en pantalla

**A. Encabezado**: título "Feedback del piloto" + descripción "Últimos 50 feedbacks de los usuarios".

**B. Tabla de feedbacks** con las siguientes columnas:

| Columna | Contenido |
|---|---|
| **Tipo** | Badge con categoría: **bug** (rojo), **mejora** (azul), **falta** (amarillo), **confusion** (gris). |
| **Mensaje** | Texto libre del feedback (recortado con truncate). |
| **Rol** | Rol del usuario que envió (TALLER, MARCA, ESTADO, ADMIN). |
| **Página** | URL donde estaba parado el usuario al enviar el feedback (útil para localizar el contexto). |
| **Entidad** | Si el feedback está asociado a una entidad específica (ej. taller ID, pedido ID), aparece aquí con los primeros 8 caracteres del ID. |
| **Usuario** | Nombre o email del usuario que envió el feedback. |
| **Fecha** | Fecha de envío. |

Si no hay feedbacks: "No hay feedbacks todavía."

**Tipos de feedback**:

| Tipo | Cuándo se usa |
|---|---|
| **bug** | El usuario encontró algo que no funciona (error, comportamiento inesperado). |
| **mejora** | El usuario sugiere una mejora a algo que ya existe. |
| **falta** | El usuario reporta que falta una funcionalidad que esperaba encontrar. |
| **confusion** | El usuario no entiende cómo hacer algo o qué significa algo. |

#### Qué se puede hacer

##### Revisar feedbacks recientes

Simplemente entrar al panel: la tabla muestra los últimos 50 ordenados por fecha descendente.

##### Localizar el contexto de un feedback

Usar la columna **Página** para saber en qué pantalla estaba el usuario. Copiar la URL y abrirla en otra pestaña para reproducir el contexto.

##### Cruzar feedback con usuario

Si el feedback es de tipo **bug** o **confusion**, puede ser útil escribirle al usuario directamente. Copiar el nombre/email de la columna **Usuario** y ir a la sección **Usuarios** (Sección 3.1) para abrir el modal de detalle y usar la opción **Enviar mensaje**.

#### Casos frecuentes

**Caso 1 — Priorización semanal**:
1. Filtrar visualmente por tipo **bug** — priorizar reparación con Gera.
2. Revisar tipo **falta** — evaluar si sumar al backlog.
3. Revisar **mejora** — insumo para próximas iteraciones.
4. Revisar **confusion** — insumo para mejorar copy, tutorial o documentación.

**Caso 2 — Reproducir un bug reportado**:
1. Identificar el feedback tipo **bug**.
2. Copiar la URL de la columna **Página**.
3. Ver los detalles adicionales en la columna **Entidad** para identificar el caso exacto.
4. Reproducir el problema con una cuenta del rol correspondiente.
5. Reportar a Gera con el detalle recolectado.

**Caso 3 — Consolidar feedbacks para próxima iteración**:
1. Revisar todos los feedbacks del período.
2. Agrupar por tipo y por área funcional (basado en la columna Página).
3. Armar backlog priorizado con impacto x frecuencia.

#### Notas y limitaciones

- **Solo los últimos 50**: no hay paginación ni exportación desde este panel. Para históricos completos, usar `logActividad` desde Reportes o consulta directa a base.
- **Sin marcado de "atendido"**: la interfaz no permite marcar feedbacks como resueltos o descartados. Todos aparecen igual, ordenados por fecha.
- **Sin edición**: los feedbacks son inmutables (son un log del usuario).
- **La columna Entidad puede estar vacía**: no todos los feedbacks se envían desde una entidad específica (algunos son generales de la plataforma).
- **La URL de Página puede quedar obsoleta**: si la ruta cambia (por rediseño de la plataforma), el link puede no llevar exactamente al mismo lugar donde estaba el usuario al reportar.

---

## 7. Configuración del sistema

Esta sección agrupa las tres pantallas donde se ajustan los parámetros globales de la plataforma: Configuración general (información institucional, permisos de registro, feature flags), Archivos (tipos y tamaños permitidos para uploads en distintos contextos) y Onboarding (seguimiento del proceso de alta de talleres y marcas).

Son pantallas que se tocan poco pero cuyos cambios impactan a toda la plataforma. Cualquier ajuste acá se refleja inmediatamente sobre el resto del sistema, por lo que conviene documentar los cambios y coordinar con el equipo antes de modificar valores críticos.

### 7.1 Configuración general

#### Para qué sirve

Configura los parámetros globales de la plataforma: nombre institucional, canales de soporte, apertura del registro, política de certificados, y **feature flags** — interruptores que activan o desactivan funcionalidades enteras sin necesidad de tocar código.

Los feature flags son especialmente importantes: permiten habilitar o deshabilitar módulos completos (como Academia, Directorio público, Denuncias, Publicación de pedidos, Asistente IA) según el momento del piloto y las decisiones institucionales.

#### Cómo llegar

- Sidebar: **Configuración**.
- URL directa: `/admin/configuracion`.

#### Qué se ve en pantalla

**A. Encabezado**: título "Configuración General" + descripción "Parámetros del sistema".

**B. Tabs**: cuatro tabs internas + un enlace externo:
- **General** (por defecto).
- **Emails**.
- **Integraciones**.
- **Features**.
- Botón **Archivos** que abre `/admin/configuracion/archivos` en una pantalla aparte (Sección 7.2).

**C. Botón inferior**: **Guardar Configuración** (ancho completo). Se aplica a los cambios de la tab General.

#### Tab: General

Tres bloques de configuración:

**Bloque "Información de la Plataforma"**:
- **Nombre de la plataforma** — nombre institucional visible en emails, títulos y cabeceras (por defecto "Plataforma Digital Textil").
- **Email de soporte** — dirección a la que los usuarios pueden escribir para pedir ayuda.
- **WhatsApp de soporte** — número al que los usuarios pueden escribir.

**Bloque "Registro de Usuarios"** — tres checkboxes:
- **Permitir registro de nuevos talleres** — si se destilda, los talleres no pueden crear cuentas nuevas. Los existentes siguen accediendo normalmente.
- **Permitir registro de nuevas marcas** — idem para marcas.
- **Requiere aprobación manual de nuevos registros** — si se tilda, las cuentas creadas quedan pendientes de aprobación antes de tener acceso completo.

**Bloque "Certificados"**:
- **Prefijo de código de certificado** — texto que antecede al código de cada certificado emitido (ej. "PDT-2026-").
- **Institución que firma certificados** — nombre institucional que aparece en el PDF del certificado (ej. "UNTREF / OIT").

#### Tab: Emails

Contiene un mensaje que redirige a `/admin/integraciones/email` (Sección 8.1) donde se configura el proveedor de emails (Resend).

#### Tab: Integraciones

Contiene un mensaje que redirige a `/admin/integraciones` (Sección 8) donde se configuran las integraciones externas.

#### Tab: Features

Contiene dos bloques con toggles para activar/desactivar módulos:

**Bloque "Escenario 1 — Formalización"**:

| Flag | Qué controla |
|---|---|
| **Registro de talleres** | Permite que nuevos talleres se registren. |
| **Registro de marcas** | Permite que nuevas marcas se registren. |
| **Directorio público** | El directorio de talleres es visible sin necesidad de login. |
| **Academia** | Módulo de capacitación y certificados disponible. |
| **Formalización** | Checklist y upload de documentos disponibles. |
| **Dashboard Estado** | Acceso al panel del organismo público habilitado. |
| **Denuncias** | Formulario público de denuncias anónimas visible. |

**Bloque "Escenario 2 — Marketplace"**:

| Flag | Qué controla |
|---|---|
| **Publicación de pedidos** | Marcas pueden publicar pedidos. |
| **Cotizaciones** | Talleres pueden cotizar pedidos publicados. |
| **Acuerdos PDF** | Descarga de acuerdo de manufactura en PDF disponible. |
| **Notificaciones de matching** | Alertas automáticas a talleres compatibles cuando hay un pedido nuevo. |
| **Asistente IA** | Chat con asistente RAG disponible en la Academia. |

Cada flag tiene un badge de estado (**Activo** verde / **Desactivado** gris) y un checkbox. Al modificar un checkbox, el cambio se guarda automáticamente (no requiere presionar "Guardar Configuración").

#### Qué se puede hacer

##### Cambiar la información institucional

1. Ir a la tab **General**.
2. Modificar los campos del bloque "Información de la Plataforma".
3. Click en **Guardar Configuración** al pie.
4. Aparece el mensaje verde "Configuración guardada correctamente".

##### Cerrar el registro temporalmente

Ejemplo: se llegó al cupo del piloto y no se quieren aceptar más registros nuevos.

1. Tab **General** → bloque "Registro de Usuarios".
2. Destildar **Permitir registro de nuevos talleres** y/o **Permitir registro de nuevas marcas**.
3. Guardar.
4. La pantalla de registro pública muestra un mensaje indicando que el registro está cerrado.

##### Activar aprobación manual

Ejemplo: se quiere revisar cada cuenta antes de activarla.

1. Tab **General** → tildar **Requiere aprobación manual de nuevos registros**.
2. Guardar.
3. Los nuevos registros quedan en estado pendiente hasta que un ADMIN los apruebe desde la sección Usuarios.

##### Activar o desactivar un módulo

Ejemplo: pausar temporalmente el Asistente IA por costo o mantenimiento.

1. Tab **Features** → buscar **Asistente IA**.
2. Destildar el checkbox.
3. El cambio se aplica de inmediato — no hay que presionar guardar.
4. Los usuarios que estaban usando el asistente dejan de verlo en la Academia.

#### Casos frecuentes

**Caso 1 — Preparación para el evento OIT**:
1. Tab **General** → cambiar temporalmente el email de soporte a un canal dedicado al evento.
2. Guardar.
3. Al terminar el evento, restaurar el original.

**Caso 2 — Cierre del registro por cupo**:
1. Tab **General** → destildar los dos permisos de registro.
2. Guardar.
3. Notificar al equipo por notificación masiva (Sección 6.2) que se cerró el registro.

**Caso 3 — Actualizar la firma institucional del certificado**:
1. Tab **General** → bloque Certificados → modificar **Institución que firma certificados**.
2. Guardar.
3. Los certificados que se emitan de acá en adelante llevarán la nueva firma. Los ya emitidos mantienen la firma anterior.

#### Notas y limitaciones

- **Los feature flags se guardan al toggle**: no requieren presionar Guardar. Cambiar uno tiene efecto inmediato sobre toda la plataforma.
- **El resto de la configuración requiere Guardar explícito**: si se navega a otra tab o se cierra la pantalla sin guardar, los cambios se pierden.
- **Sin historial de cambios visible en la interfaz**: para saber quién modificó qué configuración, hay que consultar los Logs (Sección 9).
- **Cambios de configuración impactan a todos los usuarios inmediatamente**: coordinar con el equipo antes de tocar cosas críticas como feature flags.
- **Los bloques Emails e Integraciones son solo enlaces**: la configuración real está en la sección Integraciones (Sección 8).

---

### 7.2 Archivos

#### Para qué sirve

Define qué tipos de archivo y qué tamaño máximo se aceptan al hacer upload en cada contexto de la plataforma. Por ejemplo: al cargar la constancia de habilitación municipal, solo se permite PDF hasta 5MB; al cargar un logo, solo PNG/JPEG hasta 2MB; al cargar un video de producto, MP4/MOV hasta 100MB.

La plataforma trae contextos preconfigurados (fichas técnicas, documentos de formalización, imágenes de perfil, etc.). Desde este panel se pueden modificar los tipos permitidos, el tamaño máximo y activar/desactivar cada contexto.

#### Cómo llegar

- Desde **Configuración** → botón **Archivos** en la barra de tabs superior.
- URL directa: `/admin/configuracion/archivos`.

#### Qué se ve en pantalla

**A. Encabezado**: breadcrumb "← Configuración" + título "Configuración de Archivos" + descripción "Define qué tipos de archivo y tamaño máximo se aceptan en cada contexto de la plataforma".

**B. Lista de contextos** (una tarjeta por contexto):

Cada tarjeta muestra:
- **Nombre del contexto** (ej. "Documentos de formalización", "Imagen de perfil de taller").
- **Badge de estado** (Activo / Desactivado).
- **Descripción** (opcional).
- **Contexto** — código interno entre backticks (ej. `documento_formalizacion`).
- **Tamaño máximo** en MB.
- **Badges de tipos permitidos** (PDF, JPEG, PNG, etc.).
- Botón **Editar** a la derecha.

Si no hay configuraciones: mensaje "No hay configuraciones de upload. Ejecutá el seed para crearlas."

#### Qué se puede hacer

##### Editar una configuración de contexto

1. Click en **Editar** de la tarjeta.
2. Se abre un modal con:
   - **Grilla de tipos permitidos** — 8 opciones con checkboxes:
     - PDF (documentos), JPEG/PNG/WebP (imágenes), Excel/Word (ofimática), MP4/MOV (video).
   - **Tamaño máximo (MB)** — número entre 1 y 100.
   - **Checkbox "Contexto activo"** — si se destilda, no se pueden subir archivos de ese contexto.
3. Click en **Guardar**.

**Reglas del formulario**:
- Debe haber **al menos un tipo permitido** (si se destildan todos, aparece error y no se puede guardar).
- El tamaño mínimo es **1 MB**, el máximo **100 MB**.

##### Desactivar un contexto

1. Editar el contexto.
2. Destildar **Contexto activo**.
3. Guardar. Al desactivarse, cualquier intento de upload en ese contexto es bloqueado con un mensaje al usuario.

#### Casos frecuentes

**Caso 1 — Permitir imágenes WebP en fichas técnicas** (formato más liviano que JPEG):
1. Editar el contexto "Fichas técnicas".
2. Tildar **WebP**.
3. Guardar.

**Caso 2 — Aumentar el tamaño máximo para videos institucionales**:
1. Editar el contexto de videos.
2. Cambiar el tamaño de 50 MB a 100 MB.
3. Guardar.

**Caso 3 — Bloquear temporalmente uploads en un contexto** (por ejemplo, por auditoría de datos):
1. Editar el contexto.
2. Destildar **Contexto activo**.
3. Guardar. Los usuarios verán un mensaje de "upload deshabilitado".

#### Notas y limitaciones

- **Los contextos vienen preconfigurados desde el seed**: no hay opción para crear nuevos contextos desde la interfaz. Si se necesita un contexto nuevo, requiere intervención técnica en base + código.
- **No hay validación de contenido**: la plataforma valida por extensión y tamaño, pero no analiza el contenido interno del archivo (no detecta virus, no valida que un PDF sea realmente un PDF).
- **Cambios inmediatos**: al guardar, los nuevos uploads ya siguen la nueva regla. Los archivos ya subidos no se ven afectados aunque ahora estén "fuera de norma".
- **Sin límite global**: cada contexto tiene su propio límite. Un mismo usuario podría subir muchos archivos en distintos contextos sin que la plataforma bloquee por volumen total.

---

### 7.3 Onboarding

#### Para qué sirve

Seguimiento del progreso de talleres y marcas a través del ciclo de vida del piloto: desde que son "invitados" (creados por el equipo pero aún no ingresaron), pasando por "registrados" (crearon cuenta pero no completaron perfil), "perfil completo" y hasta llegar a "activos" (usan la plataforma regularmente) o "inactivos" (dejaron de usarla).

Es la vista más útil para el equipo del piloto porque permite ver el funnel de adopción y actuar sobre los usuarios que están frenados en alguna etapa.

#### Cómo llegar

- Sidebar: **Onboarding**.
- URL directa: `/admin/onboarding`.

#### Qué se ve en pantalla

**A. Encabezado**: título "Estado del onboarding" + descripción "Seguimiento del progreso de talleres y marcas en el piloto".

**B. Tarjetas de métricas** (cinco tarjetas):

| Métrica | Descripción |
|---|---|
| **Total usuarios** | Talleres + marcas activos en la plataforma. |
| **Invitados** | Usuarios creados por el equipo pero que aún no completaron el registro (nunca ingresaron). |
| **Registrados** | Usuarios que crearon cuenta pero no completaron el perfil productivo o comercial. |
| **Activos** | Usuarios con actividad reciente en la plataforma. |
| **Inactivos** | Usuarios que estuvieron activos pero dejaron de usar la plataforma. |

**C. Funnel de adopción**:

Visualización de barras que muestra el flujo del onboarding:
- **Invitados** (100% base) — barra gris.
- **Registrados** (%) — barra azul.
- **Perfil completo** (%) — barra amarilla.
- **Activos** (%) — barra verde.

Cada barra muestra la cantidad absoluta y el porcentaje respecto al total.

**D. Tabla de usuarios** con las siguientes columnas:

| Columna | Contenido |
|---|---|
| **Nombre** | Nombre del usuario + email en gris. |
| **Rol** | Badge outline con el rol (TALLER o MARCA). |
| **Etapa** | Badge de color según la etapa actual del onboarding. |
| **Registro** | Fecha en formato dd/mm/yyyy. |
| **Acciones** | Botones de acción rápida (dependen de la etapa actual del usuario). |

Si no hay usuarios: **EmptyState** con "Sin usuarios de onboarding — No hay talleres ni marcas registrados todavía."

**Etapas del onboarding**:

| Etapa | Significado | Acción típica del equipo |
|---|---|---|
| **INVITADO** | Cuenta creada por el equipo, aún no ingresó. | Enviar invitación por WhatsApp/email. |
| **REGISTRADO** | Ingresó y creó cuenta, pero no completó el perfil. | Recordarle que complete perfil productivo/comercial. |
| **PERFIL_COMPLETO** | Perfil cargado pero no está usando la plataforma activamente. | Motivar con recorridos guiados o llamada de acompañamiento. |
| **ACTIVO** | Usa la plataforma regularmente. | Sin acción, solo monitorear. |
| **INACTIVO** | Estaba activo pero dejó de usar la plataforma. | Contactar para entender el motivo y reactivarlo. |

#### Qué se puede hacer

##### Consultar el funnel

Simplemente entrar a la sección. El funnel muestra visualmente dónde se pierden usuarios entre etapa y etapa.

##### Filtrar visualmente por etapa

Scrollear la tabla y buscar el color del badge de etapa. Los usuarios con badge amarillo suelen ser los que necesitan atención.

##### Acciones rápidas por usuario

Cada fila tiene un componente **AccionesRapidasOnboarding** que ofrece opciones distintas según la etapa:

- **Enviar recordatorio** (email/WhatsApp).
- **Registrar contacto** (registro de que el equipo se comunicó con el usuario).
- **Marcar como inactivo manualmente** (si el equipo decide dar por perdido a un usuario que no responde).
- **Ver detalle** (redirige al perfil completo del usuario).

Las acciones específicas dependen del rol y la etapa. Un INVITADO típicamente tiene la acción de enviar invitación; un REGISTRADO tiene la de recordar completar perfil; un INACTIVO tiene la de reactivar.

#### Casos frecuentes

**Caso 1 — Follow-up semanal del equipo del piloto**:
1. Ir a **Onboarding**.
2. Revisar el funnel — identificar en qué etapa hay más caídas.
3. Filtrar visualmente por etapa **REGISTRADO** (los que crearon cuenta pero no completaron).
4. Para cada uno, usar la acción de recordatorio.
5. Registrar los contactos hechos.

**Caso 2 — Reactivar usuarios INACTIVOS**:
1. Buscar usuarios con etapa **INACTIVO**.
2. Para cada uno, contactar por WhatsApp (fuera de plataforma) para entender por qué dejó de usar.
3. Registrar el resultado como observación de campo (Sección 6.1).

**Caso 3 — Reporte de tracción del onboarding**:
1. Anotar los valores de las 5 métricas.
2. Comparar contra la semana/mes anterior (llevar registro externo).
3. Combinar con las observaciones cualitativas (Sección 6.1) para armar el reporte a OIT.

#### Notas y limitaciones

- **Solo talleres y marcas**: la sección no muestra usuarios ADMIN, ESTADO ni CONTENIDO — es específica del onboarding del ecosistema productivo.
- **Etapa calculada dinámicamente**: la etapa no se almacena, se calcula al cargar la página en función del estado real del usuario. Esto asegura que siempre esté actualizada pero puede ralentizar la carga si hay muchos usuarios.
- **Sin filtros ni búsqueda**: la tabla es plana, no tiene filtros. Para muchos usuarios, buscar con Ctrl+F del navegador es lo más rápido.
- **Sin exportación**: para exportar el estado del onboarding, usar la sección **Reportes** (Sección 9.2) o consultar Base directamente.
- **La lógica de cálculo de etapa** vive en `@/compartido/lib/onboarding`. Si se modifica esa lógica, cambia lo que aparece en esta pantalla.

---

## 8. Integraciones

Esta sección gestiona los servicios externos que la plataforma consume: envío de emails, asistente de IA con base de conocimiento, y otros servicios que se irán sumando (verificación ARCA, WhatsApp Business).

La configuración de la mayoría de estos servicios se hace vía **variables de entorno** en Vercel (por seguridad, no se exponen las claves desde el panel). El panel sirve para consultar el estado, activar/desactivar módulos y — en el caso del LLM — cargar contenido de la base de conocimiento del asistente.

### 8.0 Vista general de integraciones

#### Cómo llegar

- Sidebar: **Integraciones**.
- URL directa: `/admin/integraciones`.

#### Qué se ve en pantalla

Título "Integraciones API" + descripción "Configuración de servicios externos". Lista de tarjetas, una por integración:

| Integración | Descripción | Estado actual |
|---|---|---|
| **ARCA (ex-AFIP)** | Verificación automática de CUIT y monotributo. | Configurado — marcado como "Próximamente" en la interfaz de tarjetas. |
| **LLM / Chatbot** | Asistente virtual con IA para talleres. | Se configura desde `/admin/integraciones/llm` (Sección 8.2). |
| **SendGrid (Email)** | Envío de emails transaccionales y masivos. | Configurado vía variables de entorno. Ver Sección 8.1. |
| **WhatsApp Business** | Notificaciones y comunicación por WhatsApp. | Próximamente (no implementado — el envío actual usa wa.me click-to-chat, no la API oficial). |

Cada tarjeta muestra:
- Ícono representativo.
- Nombre.
- Descripción.
- Badge de estado (Configurado / Pendiente / Próximamente).
- Ícono de tuerca (para las configurables).

Las tarjetas marcadas como **Próximamente** aparecen con opacidad reducida y no son clickeables. Las configurables abren la pantalla de detalle correspondiente.

---

### 8.1 Email (SendGrid / Resend)

#### Para qué sirve

Pantalla informativa sobre la integración de envío de emails. Es la que la plataforma usa para enviar mails transaccionales (bienvenida, recuperación de contraseña, notificaciones de matching, certificados emitidos) y comunicaciones masivas.

**Nota importante**: en la interfaz aparece como **"SendGrid"**, pero la implementación técnica actual usa **Resend** (variable `RESEND_API_KEY` en las variables de entorno). Es una discrepancia de nomenclatura en la UI, sin impacto operativo.

#### Cómo llegar

- Sidebar: **Integraciones** → click en la tarjeta **SendGrid (Email)**.
- URL directa: `/admin/integraciones/email`.

#### Qué se ve en pantalla

**A. Breadcrumb**: Admin → Integraciones → Email.

**B. Encabezado**: título "Configuración SendGrid" + descripción "Envío de emails transaccionales y masivos".

**C. Alerta amarilla**: "Configuración en construcción — Esta pantalla no guarda cambios todavía. SendGrid ya está configurado vía variables de entorno."

**D. Bloque "API de SendGrid"** (deshabilitado, solo visualización):
- **API Key** (oculto, solo visible parcialmente).
- **Email remitente** (ej. `noreply@plataformatextil.ar`).
- **Nombre remitente** (ej. "Plataforma Digital Textil").

**E. Bloque "Emails Habilitados"** (deshabilitado, todos preseleccionados):
- Bienvenida al registrarse.
- Verificación de email.
- Recuperar contraseña.
- Certificado emitido.
- Recordatorio de documentos por vencer.

**F. Bloque "Estado"**:
- Badge verde **Activo**.
- Texto: "Configurado vía variables de entorno".

#### Qué se puede hacer

**Actualmente, nada desde el panel**. La configuración real vive en las variables de entorno de Vercel:

| Variable | Descripción |
|---|---|
| `RESEND_API_KEY` | Clave de API del proveedor de email. |
| `EMAIL_FROM` | Dirección remitente (ej. `noreply@plataformatextil.ar`). |
| `EMAIL_FROM_NAME` | Nombre remitente (ej. "Plataforma Digital Textil"). |
| `EMAIL_SUPPORT` | Email de soporte visible en las comunicaciones. |
| `EMAIL_REPLY_TO` | Dirección a la que responden los destinatarios. |

Para cambiar cualquiera de estos valores, hay que ir al dashboard de Vercel → Settings → Environment Variables, modificar el valor y hacer un nuevo deploy para que el cambio tenga efecto.

#### Casos frecuentes

**Caso 1 — Verificar que los emails estén saliendo**:
1. Entrar a `/admin/integraciones/email`.
2. Confirmar que el badge diga **Activo**.
3. Si dice **Pendiente** o hay algún error, contactar al equipo técnico para revisar las variables de entorno.

**Caso 2 — Cambiar el dominio del remitente**:
1. Esta pantalla no permite el cambio.
2. Coordinar con el equipo técnico para: (a) verificar el nuevo dominio en Resend, (b) actualizar `EMAIL_FROM` en Vercel, (c) hacer nuevo deploy.

#### Notas y limitaciones

- **La pantalla es informativa**: no permite modificar nada. Es solo un dashboard de estado.
- **Discrepancia de nombre**: la UI dice "SendGrid" pero se usa Resend. Es un residual de una versión anterior de la plataforma.
- **Sin visor de emails enviados**: para ver qué emails salieron, ir a la sección **Logs** (Sección 9). No hay una bandeja de envíos desde este panel.
- **Sin métricas de deliverability**: la tasa de apertura, rebote y spam se consulta desde el dashboard del proveedor (Resend), no desde el panel.

---

### 8.2 LLM / Asistente IA

#### Para qué sirve

Configura el **asistente virtual con IA** que aparece en la Academia y otros puntos de la plataforma. El asistente responde preguntas de los talleres sobre formalización, trámites, uso de la plataforma y contenido de las colecciones.

Usa un modelo LLM (Anthropic o OpenAI) combinado con un **corpus RAG** (Retrieval Augmented Generation) — una base de conocimiento de documentos que el asistente consulta para dar respuestas precisas. Los documentos del corpus se cargan desde esta pantalla.

#### Cómo llegar

- Sidebar: **Integraciones** → click en **LLM / Chatbot**.
- URL directa: `/admin/integraciones/llm`.

#### Qué se ve en pantalla

**A. Breadcrumb**: Admin → Integraciones → LLM.

**B. Encabezado**: título "Configuración LLM" + descripción "Asistente virtual con IA para talleres".

**C. Bloque "Proveedor"**:
- **Proveedor de IA**: selector con opciones **Anthropic** (default) o **OpenAI**.
- **Modelo**: selector con opciones (para Anthropic): **Claude Haiku 4.5** (más rápido y económico) o **Claude Sonnet 4.5** (más capaz y costoso).
- **Max tokens por respuesta**: número. Por defecto 500. Define el largo máximo de cada respuesta del asistente.
- **Habilitar asistente**: checkbox. Si se destilda, el asistente deja de estar disponible para los usuarios.

**D. Bloque "System Prompt"**:

Área de texto con las instrucciones base que se le dan al modelo. Por defecto: *"Sos un asistente de la Plataforma Digital Textil. Ayudás a talleres con preguntas sobre formalización, trámites y capacitación."* Puede modificarse para ajustar el tono o el alcance del asistente.

**E. Botón**: **Guardar Configuración** (ancho completo).

**F. Bloque "Documentos del corpus (N)"**:

Sección para gestionar el conocimiento base del asistente.

**Formulario de nuevo documento**:
- **Título** (ej. "Cómo obtener el CUIT").
- **Contenido** (área de texto libre).
- **Categoría**: selector con opciones **Formalización**, **Trámites**, **Plataforma** (default), **Capacitación**.
- Botón **+ Agregar documento**.

**Lista de documentos existentes**:
Cada documento muestra:
- **Título** (tachado y en gris si está desactivado).
- **Categoría · fecha de creación**.
- Ícono de papelera para desactivar (solo visible si está activo).

Si no hay documentos: "No hay documentos en el corpus."

#### Qué se puede hacer

##### Cambiar el proveedor o modelo

1. Ir al bloque **Proveedor**.
2. Cambiar los selectores según necesidad:
   - **Anthropic vs OpenAI**: depende de qué API keys estén configuradas en el env (`ANTHROPIC_API_KEY`, `VOYAGE_API_KEY` para embeddings).
   - **Claude Haiku vs Sonnet**: Haiku es rápido y económico, ideal para volumen. Sonnet es más costoso pero da respuestas más elaboradas.
3. Click en **Guardar Configuración**.

##### Modificar el system prompt

1. Editar el área de texto en el bloque **System Prompt**.
2. Guardar.
3. Los cambios se aplican de inmediato para las próximas consultas del asistente.

##### Activar/desactivar el asistente

1. Tildar/destildar el checkbox **Habilitar asistente**.
2. Guardar.

**Alternativa**: usar el **feature flag "Asistente IA"** en Configuración → Features (Sección 7.1). El toggle acá y el flag hacen cosas similares pero el flag es global y este es específico del módulo.

##### Agregar un documento al corpus

1. En el formulario del bloque **Documentos del corpus**:
2. Completar título.
3. Escribir el contenido (puede ser texto largo, instrucciones, respuestas frecuentes).
4. Elegir categoría.
5. Click en **+ Agregar documento**.
6. El documento aparece al tope del listado y queda disponible para que el asistente lo consulte.

##### Desactivar un documento

1. Click en el ícono de papelera al lado del documento.
2. El documento se marca como inactivo (aparece tachado y en gris) pero no se elimina — sigue existiendo en base pero no se usa en las respuestas del asistente.

#### Casos frecuentes

**Caso 1 — Reducir el costo del asistente**:
1. Ir a **Proveedor**.
2. Cambiar de **Claude Sonnet 4.5** a **Claude Haiku 4.5**.
3. Reducir **Max tokens** de 500 a 300.
4. Guardar. Las próximas consultas usarán el modelo más barato.

**Caso 2 — Cargar información nueva que el asistente debe conocer**:
1. Preparar el texto (por ejemplo, información sobre una nueva ley o trámite).
2. Ir al formulario de nuevo documento.
3. Título: "Ley de Talles 2026".
4. Contenido: pegar el texto explicativo.
5. Categoría: **Trámites**.
6. Agregar.
7. Verificar que el asistente responda correctamente cuando se le pregunte sobre ese tema.

**Caso 3 — Ajustar el tono del asistente**:
1. Editar el **System Prompt**.
2. Cambiar "Sos un asistente..." por algo más formal o más cercano según decisión institucional.
3. Guardar.

**Caso 4 — Cortar el asistente por costo o incidencia**:
1. Destildar **Habilitar asistente**.
2. Guardar.
3. Los usuarios dejan de ver el chat en la Academia.

#### Notas y limitaciones

- **Las API keys viven en variables de entorno**: `ANTHROPIC_API_KEY` para el modelo, `VOYAGE_API_KEY` para los embeddings del RAG. No se configuran desde el panel.
- **Cambiar el system prompt tiene impacto inmediato**: probar antes en un ambiente de prueba, especialmente si se cambia mucho el estilo o instrucciones críticas.
- **Documentos desactivados no se eliminan**: para eliminarlos definitivamente, requiere intervención en base.
- **Sin métricas de uso del asistente**: para ver cuántas consultas se hicieron o cuáles fueron los temas más consultados, hay que ir a Logs (Sección 9) o al dashboard del proveedor.
- **Categorías fijas**: las 4 categorías de documentos (Formalización, Trámites, Plataforma, Capacitación) son fijas. Agregar nuevas requiere cambio de código.
- **Sin importación masiva**: cada documento se carga a mano. Para cargar volumen desde archivos externos, coordinar con el equipo técnico (existe el script `tools/indexar-corpus.ts` para carga bulk).
- **El asistente puede tener alucinaciones**: como todo modelo LLM, puede inventar información. Mantener el corpus RAG actualizado y probar periódicamente reduce el riesgo pero no lo elimina.

---

## 9. Logs y reportes

Esta sección agrupa las dos pantallas de observabilidad de la plataforma: **Logs** (registro auditado de todas las acciones sensibles del sistema) y **Reportes** (dashboard con métricas agregadas y visualizaciones de tracción).

Los Logs sirven para investigar incidencias, auditar cambios y responder a preguntas del tipo *"¿quién hizo esto y cuándo?"*. Los Reportes sirven para tener una vista de tracción general del piloto, útil para presentaciones y seguimiento institucional.

### 9.1 Logs (Seguridad)

#### Para qué sirve

Registro auditado de todas las acciones sensibles que ocurren en la plataforma: creación y modificación de usuarios, aprobaciones y rechazos de documentos, emisión y revocación de certificados, cambios en el corpus RAG, exportaciones de datos, entre otras.

Cada log incluye quién realizó la acción, cuándo, sobre qué entidad, con qué motivo (si corresponde) y todos los detalles técnicos necesarios para investigar o auditar. Es la fuente de verdad de "qué pasó" en la plataforma.

#### Cómo llegar

- Sidebar: **Seguridad** (última opción, con ícono de escudo).
- URL directa: `/admin/logs`.

#### Qué se ve en pantalla

**A. Encabezado**: título "Logs de Actividad" + descripción "Registro de acciones sensibles en la plataforma" + botón **Exportar CSV** (arriba a la derecha).

**B. Bloque de filtros** (cinco filtros en una fila):

| Filtro | Opciones |
|---|---|
| **Usuario** | Todos los usuarios / lista de usuarios activos con formato "Nombre (ROL)". |
| **Acción** | Todas las acciones / lista dinámica de todas las acciones registradas. |
| **Entidad** | Todas las entidades / Usuario / Taller / Validación / Certificado / Colección / Nota / Documento RAG / Exportación. |
| **Desde** | Fecha (date picker). |
| **Hasta** | Fecha (date picker). |

Si hay filtros activos, aparece un link "Limpiar filtros" abajo.

**C. Tabla de logs** con las siguientes columnas:

| Columna | Contenido |
|---|---|
| **Fecha** | Fecha y hora completa de la acción. |
| **Usuario** | Nombre + rol del autor de la acción (o "Sistema" si fue un proceso automático). |
| **Acción** | Código de la acción en formato monoespaciado (ej. `ADMIN_USUARIO_EDITADO`). |
| **Sensibilidad** | Badge de color según nivel: **Crítica** (rojo), **Alta** (amarillo), **Media** (azul), **Baja** (gris). |
| **Entidad** | Entidad afectada por la acción (o "sin datos"). |
| **Motivo** | Texto libre del motivo (ej. razón de una revocación). |
| **Expandir** | Botón con flecha que despliega el detalle completo de la acción. |

**D. Paginación**: 50 registros por página, con contador y botones Anterior/Siguiente.

**Niveles de sensibilidad** (asignación automática según el tipo de acción):

| Nivel | Ejemplos de acciones |
|---|---|
| **Crítica** | Revocación de validación, revocación de certificado, revocación de validación por ESTADO. |
| **Alta** | Creación/edición/desactivación de usuarios, aprobación/rechazo de validaciones, emisión de certificados, exportación de datos. |
| **Media** | Edición de perfil de taller, edición/eliminación de colecciones, notas internas, agregar/desactivar documentos RAG. |
| **Baja** | Todas las demás acciones no catalogadas explícitamente. |

#### Qué se puede hacer

##### Filtrar el histórico

Combinar cualquier subset de los cinco filtros. Ejemplos:
- **Usuario = un ADMIN específico + Desde/Hasta = último mes** → todo lo que hizo esa persona ese mes.
- **Acción = `CERTIFICADO_REVOCADO`** → todas las revocaciones históricas.
- **Entidad = "usuario"** → todas las acciones sobre cuentas.

Los filtros se aplican al hacer la selección (no requieren botón Aplicar).

##### Ver el detalle completo de una acción

1. Click en la flecha **↓** de la columna derecha.
2. Se despliega debajo de la fila un bloque con **todos los detalles técnicos** del log (campos clave-valor con la información completa: IDs, valores anteriores/nuevos, contexto adicional).
3. Click en la flecha **↑** para colapsar.

##### Exportar a CSV

Click en **Exportar CSV** arriba a la derecha. Descarga los logs actualmente filtrados como CSV. Útil para auditorías externas, análisis en Excel, o entrega a stakeholders (ej. OIT).

##### Limpiar filtros

Click en el link **Limpiar filtros** debajo del bloque de filtros. Vuelve a la vista completa.

#### Casos frecuentes

**Caso 1 — Investigar un cambio no autorizado**:
1. Ir a Logs.
2. Filtrar por **Entidad = usuario** + **Acción = `ADMIN_USUARIO_EDITADO`**.
3. Definir un rango de fechas del período sospechoso.
4. Revisar quién hizo cada cambio.
5. Para cada log sospechoso, expandir el detalle y ver los valores anteriores/nuevos.

**Caso 2 — Auditoría de certificados revocados**:
1. Filtrar por **Acción = `CERTIFICADO_REVOCADO`**.
2. Definir el período (ej. último trimestre).
3. Exportar CSV.
4. Cruzar con la sección Certificados (Sección 4.3) para armar un informe con motivos y responsables.

**Caso 3 — Reporte de actividad de un ADMIN específico**:
1. Filtrar por **Usuario = [nombre del ADMIN]**.
2. Definir el período que se quiere auditar.
3. Revisar todas las acciones realizadas.
4. Exportar si es necesario presentar formalmente.

**Caso 4 — Verificar si una notificación fue realmente enviada**:
1. Filtrar por **Acción = envío de notificación** (buscar en el selector de acciones).
2. Filtrar por fecha del intento reportado.
3. Ver en el detalle expandido a qué destinatarios se envió, por qué canal, y si hubo error.

#### Notas y limitaciones

- **50 logs por página**: la paginación es simple (Anterior/Siguiente), sin salto directo a página.
- **La exportación respeta los filtros**: solo se exportan los logs que coinciden con los filtros activos.
- **Formato de fecha**: dd/mm/yyyy hh:mm:ss (localizado a Argentina).
- **Acciones no listadas en la tabla de sensibilidad** se muestran como **Baja** por defecto. No implica que no sean importantes, solo que no fueron catalogadas explícitamente.
- **El log es inmutable**: una vez registrado, no se puede editar ni eliminar desde el panel.
- **La entidad y motivo pueden aparecer como "sin datos"**: no todas las acciones cargan esos campos. Depende del código que genera el log.
- **Los logs no se purgan automáticamente**: se acumulan indefinidamente. Con el tiempo puede ser necesario definir una política de retención (ver Sección 10).

---

### 9.2 Reportes

#### Para qué sirve

Dashboard visual con las métricas agregadas más importantes de la plataforma: cantidad de actores, distribución por nivel de formalización, videos completados en la Academia y tendencia de registros mensuales.

Está pensado para consulta rápida (presentaciones, reuniones, seguimiento institucional). No reemplaza a las exportaciones específicas de cada sección — es una vista consolidada.

#### Cómo llegar

- Sidebar: **Reportes**.
- URL directa: `/admin/reportes`.

#### Qué se ve en pantalla

**A. Encabezado**: título "Reportes y Estadísticas" + descripción "Métricas de la plataforma".

**B. Bloque "Métricas Principales"** — cuatro tarjetas:

| Métrica | Descripción |
|---|---|
| **Talleres** | Cantidad total de talleres registrados. |
| **Marcas** | Cantidad total de marcas registradas. |
| **Certificados** | Cantidad de certificados válidos (excluye los revocados). |
| **Videos completados** | Cantidad total de videos vistos completamente por todos los talleres en la Academia. |

**C. Bloque "Distribución por Nivel"**:

Barras horizontales que muestran cómo se distribuyen los talleres entre las tres etapas de formalización:

- **Consolidada** (ORO) — barra azul oscura.
- **En proceso** (PLATA) — barra azul media.
- **Etapa inicial** (BRONCE) — barra azul clara.

Cada barra muestra la etapa, el porcentaje y la cantidad absoluta.

Si no hay talleres: "Sin talleres registrados."

**D. Bloque "Registros por Mes"**:

Gráfico de barras verticales con los registros de los últimos 6 meses. Para cada mes, dos barras:
- **Azul oscuro** — talleres registrados ese mes.
- **Azul claro** — marcas registradas ese mes.

Debajo del gráfico, leyenda de colores.

Si no hay registros en el período: "Sin registros en los últimos 6 meses."

#### Qué se puede hacer

Esta pantalla es **puramente informativa**. No permite modificar datos ni exportar directamente. Sirve para:

- **Ver de un vistazo** el estado general de tracción del piloto.
- **Presentaciones institucionales**: capturar la pantalla y usar las visualizaciones.
- **Detectar tendencias**: en el gráfico de registros por mes se ve si el crecimiento es sostenido, plano o decreciente.

Para obtener los datos crudos o exportarlos, ir a las secciones específicas:
- Talleres → sección **Talleres** (Sección 3.2), botón Exportar CSV/Excel.
- Marcas → sección **Reportes** (no tiene exportación por rol; usar consulta a base).
- Certificados → sección **Certificados** (Sección 4.3) o Logs (Sección 9.1).
- Videos → no hay exportación desde el panel, requiere consulta a base.

#### Casos frecuentes

**Caso 1 — Reporte mensual para reunión institucional**:
1. Ir a **Reportes**.
2. Capturar pantalla completa.
3. Compartir en la presentación.

**Caso 2 — Chequeo semanal de tracción**:
1. Ir a **Reportes**.
2. Anotar las 4 métricas principales.
3. Comparar con el registro de la semana anterior (llevar registro externo).
4. Mirar el gráfico de registros por mes para ver tendencia.

**Caso 3 — Verificar equilibrio del ecosistema oferta/demanda**:
1. Comparar métrica **Talleres** vs **Marcas**.
2. Si hay mucha oferta y poca demanda, evaluar acciones de captación de marcas.
3. Si hay mucha demanda y poca oferta, evaluar acciones de captación de talleres.

#### Notas y limitaciones

- **Datos en tiempo real**: se calculan al cargar la página, no hay caché.
- **Sin filtros por período** para las métricas principales: siempre son totales acumulados.
- **Sin exportación directa**: para bajar datos, ir a las secciones específicas o consultar base.
- **Sin gráfico de matching / pedidos**: la vista se centra en actores y capacitación, no en operación comercial. Para ver métricas de pedidos, ir a **Pedidos** (Sección 5.1).
- **Sin métricas comparativas** (mes vs mes, año vs año): hay que llevar registro externo manual.
- **Los últimos 6 meses** en el gráfico son fijos: no se puede cambiar el rango.
- **No hay panel específico para exportaciones grandes**: para exportes complejos, coordinar con el equipo técnico (queries directas a base).

---

## 10. Troubleshooting y FAQ

Esta sección agrupa los problemas más frecuentes que puede encontrar quien opera el panel de administración, sus soluciones habituales, y los casos que requieren escalamiento al equipo técnico.

Está pensada para ser el primer lugar de consulta cuando algo no funciona como se espera antes de pedir ayuda o abrir un ticket.

---

### 10.1 Preguntas frecuentes

#### Acceso y credenciales

**No puedo iniciar sesión como ADMIN.**
1. Verificar que el email y contraseña sean correctos.
2. Probar en modo incógnito por si hay cookies rotas.
3. Si aparece "No autorizado" al ingresar a `/admin` después de loguearse, la cuenta no tiene rol ADMIN — pedir a otro ADMIN que le asigne el rol desde Usuarios (Sección 3.1).
4. Si perdió la contraseña, usar el flujo "Olvidé mi contraseña" del login.
5. Si perdió el acceso al email de recuperación, contactar al equipo técnico (ver Sección 10.4).

**Se me cerró la sesión sola.**
- Las sesiones tienen un tiempo de expiración por seguridad. Volver a loguear.
- Si esto pasa muy seguido, puede ser problema del navegador (cookies bloqueadas). Probar en otro navegador.

**Me apareció "acceso no autorizado" navegando dentro del panel.**
- Alguien modificó el rol de la cuenta. Verificar en Usuarios (Sección 3.1) que la cuenta siga siendo ADMIN.
- Si la cuenta perdió el rol involuntariamente, revisar Logs (Sección 9.1) filtrando por acción `ADMIN_USUARIO_EDITADO` para saber quién lo cambió y cuándo.

#### Usuarios y cuentas

**Un usuario no recibe el email de reset de contraseña.**
1. Verificar en Configuración → Integraciones que el estado del Email diga **Activo** (Sección 8.1).
2. Revisar en Logs (Sección 9.1) si el envío se registró.
3. Si el envío se registró pero no llegó, revisar carpeta de spam del usuario.
4. Si el envío no aparece en Logs, hay problema con la integración de Resend — escalar al equipo técnico.

**Necesito reactivar una cuenta suspendida.**
- La interfaz actual no tiene botón de reactivación. Requiere intervención del equipo técnico en base de datos. Contactar según Sección 10.4.

**Un registro incompleto no aparece en Usuarios.**
- Los registros incompletos aparecen en un bloque específico al inicio de la pantalla **Usuarios** (Sección 3.1). Si el bloque no aparece, no hay registros incompletos.
- Si un usuario reporta que se registró pero no aparece en el listado, puede que haya un problema con el flujo de registro. Verificar en Logs.

**No puedo cambiarle el rol a mi propia cuenta.**
- Es una medida de seguridad intencional para evitar que un ADMIN se bloquee a sí mismo. Otro ADMIN debe hacer el cambio.

#### Talleres y verificación de ARCA

**Un taller aparece como "no verificado" pero él dice que su CUIT es correcto.**
1. Ir al detalle del taller (Sección 3.2), pestaña "Datos del taller".
2. Verificar el estado del bloque ARCA.
3. Si aparece con error, hacer click en **Re-verificar contra ARCA**.
4. Si el error persiste, revisar la integración de ARCA (proveedor puede estar caído).
5. Como último recurso, revisar los Logs para ver la respuesta exacta de ARCA.

**La cuenta se inactivó automáticamente por CUIT.**
- El cron automático inactiva cuentas cuya verificación de ARCA falla después del período de gracia.
- Para reactivar: pedirle al taller que corrija su CUIT desde su propio panel (flujo A), o hacer la corrección desde COORD (flujo B).
- Ver el circuito completo de CUIT en la documentación técnica.

#### Contenido y Academia

**Publiqué una colección pero los talleres no la ven.**
1. Verificar que la colección esté en estado **Publicada** (no Borrador).
2. Verificar que el feature flag **Academia** esté activo (Configuración → Features, Sección 7.1).
3. Verificar que la colección tenga al menos un video.

**Un video de YouTube ya no funciona.**
- Editar la colección → sección Videos → eliminar el video roto y agregar uno alternativo.
- Notificar a los talleres que hubo una actualización si es relevante.

**Un certificado se emitió por error.**
- Ir a Certificados (Sección 4.3) → buscar el certificado → click en el ícono de papelera → seleccionar motivo **Error administrativo** → revocar.
- El taller pierde el certificado y debe rendir nuevamente la evaluación si quiere obtenerlo de nuevo.

#### Operación comercial

**Una marca dice que publicó un pedido pero no aparece en el listado.**
1. Ir a Pedidos (Sección 5.1) → filtrar por marca.
2. Verificar el estado del pedido. Si está en **BORRADOR**, la marca no lo publicó.
3. Instruir a la marca sobre cómo publicar o ayudarla desde el detalle.

**Los pedidos no reciben cotizaciones.**
1. Verificar que el feature flag **Cotizaciones** esté activo (Sección 7.1).
2. Verificar que existan talleres con las capacidades del pedido en la sección Talleres (Sección 3.2).
3. Verificar que el flag **Notificaciones de matching** esté activo — sin él, los talleres no reciben aviso de pedidos nuevos.

**Se generó una auditoría con datos equivocados.**
- No se puede editar desde el listado. Ir al detalle en `/admin/auditorias/[id]` para editar.
- Si el error es en la fecha o taller asignado, escalar al equipo técnico.

#### Notificaciones y comunicaciones

**Envié una comunicación masiva pero los usuarios dicen que no la recibieron.**
1. Verificar en Notificaciones (Sección 6.2) que la comunicación aparezca en el listado.
2. Ver la métrica **Sin leer** — es normal que la mayoría empiece sin leer.
3. Si el canal fue Email, verificar en Logs que no haya errores de envío.
4. Si el canal fue WhatsApp, recordar que se usa wa.me (click-to-chat), no envío automático — los usuarios reciben un link, no el mensaje.

**Un feedback tipo "bug" reporta algo que no puedo reproducir.**
1. Copiar la URL de la columna Página.
2. Ver los detalles del contexto en la columna Entidad.
3. Intentar reproducir con una cuenta del rol correspondiente (crear una cuenta de test si es necesario).
4. Si no se reproduce, escalar al equipo técnico con el feedback original y qué se probó.

#### Configuración e integraciones

**Cambié un valor en Configuración General pero no veo el efecto.**
- Verificar que se hizo click en **Guardar Configuración** (no aplica a los feature flags que se guardan al toggle).
- Refrescar el navegador para descartar caché local.
- Si es un cambio en la información institucional (nombre plataforma, email), verificar en las páginas públicas.

**Un feature flag no parece tener efecto.**
- Los feature flags impactan lo que ven los usuarios finales, no siempre al ADMIN.
- Probar el flag con una cuenta del rol afectado (ej. si desactivé Academia, entrar como taller y verificar que no la ve).
- Si sigue apareciendo aunque esté desactivado, escalar al equipo técnico.

**El asistente IA da respuestas incorrectas.**
1. Revisar el system prompt en LLM (Sección 8.2).
2. Verificar que los documentos del corpus estén actualizados y activos.
3. Agregar documentos que respondan específicamente a las preguntas que se están respondiendo mal.
4. Si el problema es sistemático, considerar cambiar de modelo (ej. de Haiku a Sonnet) — más costoso pero más preciso.

#### Logs y reportes

**Los números en Dashboard no coinciden con los de Reportes.**
- Dashboard trae stats en un momento; Reportes lo hace de manera independiente. Puede haber pequeñas diferencias por concurrencia.
- Refrescar ambas pantallas para asegurar datos actuales.
- Si la diferencia es grande, escalar al equipo técnico.

**No aparece un log que estoy seguro que ocurrió.**
- Verificar los filtros aplicados. Un filtro por usuario, acción o entidad puede estar ocultándolo.
- Limpiar filtros y buscar por fecha aproximada.
- Recordar que no todas las acciones se loguean — solo las catalogadas como sensibles (ver Sección 9.1).

---

### 10.2 Escenarios de resolución rápida

#### Escenario 1 — Un actor del piloto no puede acceder o operar

**Diagnóstico paso a paso**:

1. **Verificar identidad**: pedir email y CUIT.
2. **Buscar en Usuarios** (Sección 3.1) por email.
3. **Chequear estado**: si dice Inactivo, la cuenta está suspendida — decidir reactivar (con equipo técnico) o no.
4. **Chequear rol**: si el rol no coincide con lo que el actor cree ser, corregirlo desde el modal de detalle.
5. **Verificar en el panel específico**: si es taller, ir a Talleres (Sección 3.2) y verificar que el perfil esté completo y ARCA verificado.
6. **Si es problema de contraseña**: usar el botón Resetear contraseña.
7. **Si nada de lo anterior aplica**: escalar al equipo técnico con los datos recolectados.

#### Escenario 2 — Sospecha de fraude o acción indebida

**Pasos**:

1. **Ir a Dashboard**: revisar Actividad Reciente.
2. **Si aparece la acción sospechosa**: hacer click para ir a Logs.
3. **En Logs (Sección 9.1)**: filtrar por Usuario = el ADMIN sospechado + rango de fechas.
4. **Expandir el detalle** de las acciones sospechosas y revisar los valores anteriores/nuevos.
5. **Exportar CSV** con los filtros aplicados como evidencia.
6. **Escalar institucionalmente** según el procedimiento interno.

#### Escenario 3 — Un módulo entero no funciona

**Ejemplo**: los talleres no ven la Academia.

**Pasos**:

1. **Verificar feature flag**: Configuración → Features → Escenario 1 → el flag **Academia** debe estar activo.
2. **Verificar que haya contenido**: entrar a Colecciones (Sección 4.1) y confirmar que hay al menos una colección publicada.
3. **Probar con cuenta de taller**: crear una cuenta de test con rol TALLER y verificar que se ve la Academia.
4. **Si nada anda**: escalar al equipo técnico.

#### Escenario 4 — Preparación de la plataforma para un evento

**Pasos**:

1. **Configurar canales de soporte específicos** del evento (Sección 7.1): cambiar email/WhatsApp de soporte a canales dedicados.
2. **Preparar cuentas demo** con datos precargados (coordinar con equipo técnico).
3. **Verificar feature flags**: activar todo lo que se va a mostrar, desactivar lo que no.
4. **Preparar comunicación** masiva de "estamos en evento" si aplica (Sección 6.2).
5. **Post-evento**: revertir cambios de configuración.

#### Escenario 5 — Bloqueo temporal del registro por cupo lleno

**Pasos**:

1. Configuración → General → destildar **Permitir registro de nuevos talleres** y/o **Permitir registro de nuevas marcas** (Sección 7.1).
2. **Guardar**.
3. **Notificar** al equipo por comunicación masiva o email.
4. **Actualizar la landing** con un mensaje explicativo (coordinar con el equipo técnico si requiere cambio en las páginas públicas).

---

### 10.3 Cuándo escalar al equipo técnico

Escalar al equipo técnico cuando:

- **Cualquier acción requiere modificar base de datos** — reactivar cuenta suspendida, eliminar contenido definitivamente, fusionar procesos duplicados, migrar datos entre entidades.
- **La configuración por variables de entorno necesita ajustarse** — cambiar dominio de emails, rotar claves de integraciones, agregar nuevos secretos.
- **Aparecen errores 500 o pantallas rotas** al navegar el panel.
- **Los logs muestran errores sistemáticos** que se repiten.
- **Hay una integración caída** (ARCA no responde, Resend no envía, el asistente IA no funciona).
- **Un cambio de código es necesario** — agregar una nueva funcionalidad, corregir un bug, ajustar una regla de negocio.
- **Se necesita un exporte complejo** que no está disponible en las pantallas del panel.
- **Se detecta un problema de seguridad** (accesos indebidos, exposición de datos, alguna anomalía sensible).
- **Preparación de eventos con requisitos técnicos** (cuentas demo, ambiente específico, capacidades especiales).

---

### 10.4 Contactos y escalamiento

Esta sección debe completarse con los datos institucionales de contacto post-entrega:

- **Equipo técnico responsable**: [nombre, email, WhatsApp de contacto directo].
- **Proveedor de infraestructura (Vercel)**: soporte a través del dashboard de Vercel.
- **Proveedor de base de datos (Supabase)**: soporte a través del dashboard de Supabase.
- **Proveedor de emails (Resend)**: soporte a través del dashboard de Resend.
- **Proveedor de LLM (Anthropic)**: soporte a través del dashboard de Anthropic.
- **Referente institucional (UNTREF/OIT)**: [nombre y contacto].

**Formato sugerido para reportar una incidencia**:

```
Fecha y hora aproximada:
Qué se estaba haciendo:
Qué se esperaba que ocurriera:
Qué ocurrió en su lugar:
Pantalla afectada (URL):
Rol del usuario afectado:
Pasos para reproducir:
Capturas de pantalla:
```

---

### 10.5 Recursos adicionales

- **Manual de Operación** (documento separado): describe los procesos día a día que involucran al panel (crear usuarios manualmente, procesar incidencias, coordinar auditorías).
- **Documentación técnica**: `/docs/03_tecnico/` en el repositorio del proyecto (arquitectura, integraciones, API contract, design system).
- **Documentación funcional**: `/docs/02_funcional/` en el repositorio (wireframes, casos de uso, historias de usuario).
- **Backlog V4**: `.claude/specs/V4_BACKLOG.md` — funcionalidades pendientes de desarrollo, muchas de las cuales están referenciadas en las secciones "Limitaciones" de este manual.

---

## Fin del manual

Este manual describe el panel de administración de la Plataforma Digital Textil (PDT) en su versión actual al momento de la entrega. Las funcionalidades pueden evolucionar; consultar el equipo técnico si se detectan diferencias significativas con lo aquí documentado.

Para mejoras al presente manual, enviar sugerencias al equipo responsable de mantener la documentación del proyecto.

