# Historias de Usuario por Épica

Fecha: 2026-03-01
Base: 03_CASOS_USO.md, CHECKLIST.md, PANTALLAS_MVP.md
Funciones MVP: REGISTRAR, ENCONTRAR, APRENDER, ACOMPAÑAR, FISCALIZAR
Estado: OK | PARCIAL | FALTA (según CHECKLIST del código de Sergio)

---

## Épica 1: REGISTRAR

> Onboarding de talleres, marcas y usuarios administrativos.
> Un taller o marca se registra en <5 minutos con datos mínimos.

### HU-R01: Registro de taller
**Como** taller, **quiero** registrarme con mis datos básicos,
**para** acceder a la plataforma y empezar mi proceso de formalización.

**Criterios de aceptación:**
- [ ] Wizard de 3 pasos: rol → datos personales → datos de taller
- [ ] Campos: nombre, email, password (min 8), teléfono, nombre taller, CUIT, ubicación, capacidad
- [ ] CUIT valida formato (11 dígitos, no acepta cualquier string)
- [ ] Si CUIT ya existe, muestra mensaje claro
- [ ] Al completar, crea User + Taller en transacción
- [ ] Redirect a /login con banner de éxito

**Estado:** PARCIAL — Wizard funciona pero CUIT no valida formato, ubicación es texto libre,
no hay checkbox de términos y condiciones, datos del paso 3 se pierden al volver.

**Pantallas:** `/registro`

---

### HU-R02: Registro de marca
**Como** marca, **quiero** registrarme con mis datos comerciales,
**para** buscar talleres y crear pedidos.

**Criterios de aceptación:**
- [ ] Mismo wizard que taller pero paso 3 pide: nombre marca, CUIT, ubicación, tipo
- [ ] Crea User + Marca en transacción
- [ ] Redirect a /login con banner de éxito

**Estado:** PARCIAL — Mismos problemas que HU-R01.

**Pantallas:** `/registro`

---

### HU-R03: Login
**Como** usuario registrado, **quiero** iniciar sesión con email y contraseña,
**para** acceder a mi dashboard según mi rol.

**Criterios de aceptación:**
- [ ] Form con email + password
- [ ] Validación Zod
- [ ] Redirect post-login según rol (taller→/taller, marca→/marca, estado→/estado, admin→/admin)
- [ ] Maneja callbackUrl para redirect a página original

**Estado:** OK

**Pantallas:** `/login`

---

### HU-R04: Recuperar contraseña
**Como** usuario, **quiero** recuperar mi contraseña por email,
**para** volver a acceder si la olvidé.

**Criterios de aceptación:**
- [ ] Form pide email
- [ ] Sistema genera token y envía email con link
- [ ] Link lleva a /restablecer/[token] con form de nueva contraseña
- [ ] Token expira después de uso o tiempo

**Estado:** OK (Sprint 1)

**Pantallas:** `/olvide-contrasena`, `/restablecer/[token]`

---

### HU-R05: Editar mi cuenta
**Como** usuario, **quiero** editar mi nombre, teléfono y contraseña,
**para** mantener mis datos actualizados.

**Criterios de aceptación:**
- [ ] Formulario con nombre y teléfono pre-cargados
- [ ] Sección separada para cambiar contraseña (pide actual + nueva)
- [ ] Feedback visual después de guardar (toast)
- [ ] Session se refresca con los nuevos datos

**Estado:** PARCIAL — Teléfono no se pre-carga, session no se refresca, sin toast.

**Pantallas:** `/mi-cuenta`

---

### HU-R06: Completar perfil productivo (Wizard)
**Como** taller, **quiero** completar mi perfil productivo paso a paso,
**para** que las marcas vean mi capacidad real y el sistema calcule mi score.

**Criterios de aceptación:**
- [ ] Wizard de 14 pasos: maquinaria, equipo, experiencia, organización, espacio, SAM, eficiencia, gestión, procesos, prendas, resumen
- [ ] Fórmula de capacidad: ((horas*60)/SAM) * eficiencia * máquinas * 22
- [ ] Score calculado desde respuestas (5 dimensiones)
- [ ] Pre-carga datos existentes si ya los completó
- [ ] Guarda via PUT /api/talleres/[id] incluyendo maquinaria, procesos, prendas, puntaje

**Estado:** OK (Sprint 1)

**Pantallas:** `/taller/perfil/completar` (14 pasos)

---

### HU-R07: Verificación CUIT contra ARCA
**Como** sistema, **quiero** verificar el CUIT ingresado contra ARCA/AFIP,
**para** auto-completar datos y validar que el taller/marca existe.

**Criterios de aceptación:**
- [ ] Consulta ARCA con CUIT ingresado
- [ ] Retorna: razón social, condición fiscal, actividad
- [ ] Auto-completa campos del formulario de registro
- [ ] Si CUIT no existe o está inactivo, muestra error

**Estado:** FALTA — Actualmente CUIT se acepta como texto libre sin verificación.

**Pantallas:** `/registro` (paso 2)

---

## Épica 2: ENCONTRAR

> Matching entre marcas y talleres. Directorio con filtros y perfiles públicos.

### HU-E01: Directorio de talleres (marca)
**Como** marca, **quiero** buscar talleres filtrando por nivel, proceso y prenda,
**para** encontrar proveedores que se ajusten a mi pedido.

**Criterios de aceptación:**
- [ ] Grid de cards con talleres
- [ ] Filtros server-side: búsqueda texto, nivel (Bronce/Plata/Oro), proceso, prenda
- [ ] Selects de proceso y prenda cargados desde BD
- [ ] Cada card muestra: nombre, nivel, ubicación, rating, procesos, prendas, capacidad
- [ ] Link a perfil detallado del taller

**Estado:** OK

**Pantallas:** `/marca/directorio`

---

### HU-E02: Perfil público del taller
**Como** marca, **quiero** ver el perfil completo de un taller,
**para** evaluar si es un buen proveedor.

**Criterios de aceptación:**
- [ ] Header con nombre, nivel, ubicación, stats (rating, trabajadores, capacidad, on-time)
- [ ] Secciones: procesos, prendas, maquinaria, certificaciones
- [ ] Certificados de academia con link a verificación
- [ ] Botón de contacto por WhatsApp (wa.me)

**Estado:** OK (vista marca). PARCIAL (vista pública: más simple, sin certificados).

**Pantallas:** `/marca/directorio/[id]`, `/perfil/[id]`

---

### HU-E03: Directorio público
**Como** visitante, **quiero** ver el directorio de talleres sin estar logueado,
**para** conocer la oferta de la plataforma.

**Criterios de aceptación:**
- [ ] Grid de talleres ordenados por rating
- [ ] Cada card es link al perfil público
- [ ] No requiere auth

**Estado:** PARCIAL — Sin paginación, sin filtros, sin búsqueda.

**Pantallas:** `/directorio`

---

### HU-E04: Crear pedido
**Como** marca, **quiero** crear un pedido especificando prenda, cantidad y fecha,
**para** iniciar el proceso de búsqueda de talleres.

**Criterios de aceptación:**
- [ ] Form con: tipo de prenda, cantidad, fecha objetivo, monto total
- [ ] Genera ID único (OM-YYYY-UUID)
- [ ] Crea pedido en estado BORRADOR
- [ ] Redirect a lista de pedidos con banner de éxito

**Estado:** OK

**Pantallas:** `/marca/pedidos/nuevo`

---

### HU-E05: Lista de pedidos (marca)
**Como** marca, **quiero** ver mis pedidos con filtros y stats,
**para** gestionar mi actividad en la plataforma.

**Criterios de aceptación:**
- [ ] Lista de pedidos con filtros (texto + estado)
- [ ] 4 stat cards reales (total, borradores, en ejecución, completados)
- [ ] Cada pedido es link clickeable al detalle
- [ ] Badge de estado por pedido

**Estado:** OK

**Pantallas:** `/marca/pedidos`

---

### HU-E06: Detalle de pedido y asignar taller
**Como** marca, **quiero** ver el detalle de un pedido y asignar talleres,
**para** comenzar la producción.

**Criterios de aceptación:**
- [ ] Verifica ownership (solo mi pedido o ADMIN)
- [ ] Timeline visual de estados (Borrador → En ejecución → Completado)
- [ ] Stats: unidades, progreso %, monto, fecha
- [ ] Lista de órdenes de manufactura asignadas
- [ ] Botón "Asignar taller" abre modal con búsqueda (solo en BORRADOR)
- [ ] Al asignar primer taller, auto-transición a EN_EJECUCION
- [ ] Botón "Cancelar pedido" con confirmación (cascadea a órdenes)

**Estado:** OK (implementado por Sergio en commits cfb0ed3 y 8bda346)

**Pantallas:** `/marca/pedidos/[id]`

---

### HU-E07: Pedidos recibidos (taller)
**Como** taller, **quiero** ver las órdenes de manufactura asignadas a mí,
**para** gestionar mi producción.

**Criterios de aceptación:**
- [ ] Lista de órdenes asignadas al taller desde BD
- [ ] 4 stat cards (total, pendientes, en ejecución, completadas)
- [ ] Cada orden muestra: ID, pedido, marca, proceso, precio, progreso, estado

**Estado:** OK (solo lectura, no hay forma de actualizar progreso/estado desde taller)

**Pantallas:** `/taller/pedidos`

---

## Épica 3: APRENDER

> Capacitación contextual. Videos curados de YouTube, evaluaciones y certificados verificables.
> Es la función CENTRAL del MVP.

### HU-AP01: Catálogo de cursos
**Como** taller, **quiero** ver el catálogo de cursos disponibles,
**para** elegir qué capacitación tomar.

**Criterios de aceptación:**
- [ ] Lista de colecciones activas desde BD
- [ ] Muestra: título, cantidad de videos, progreso, certificados obtenidos
- [ ] Botones dinámicos: "Empezar" / "Continuar" / "Revisar" según estado
- [ ] Stats cards (cursos, videos, certificados)

**Estado:** OK

**Pantallas:** `/taller/aprender`

---

### HU-AP02: Tomar un curso
**Como** taller, **quiero** ver los videos de un curso y marcar mi progreso,
**para** capacitarme a mi ritmo.

**Criterios de aceptación:**
- [ ] Videos embebidos de YouTube
- [ ] Lista de videos clickeable con orden
- [ ] Marcar video como visto (POST /api/colecciones/[id]/progreso)
- [ ] Progreso persistido en BD (ProgresoCapacitacion)
- [ ] Pre-carga progreso existente

**Estado:** OK

**Pantallas:** `/taller/aprender/[id]`

---

### HU-AP03: Evaluación y certificado
**Como** taller, **quiero** rendir una evaluación al terminar el curso,
**para** obtener un certificado verificable.

**Criterios de aceptación:**
- [ ] Quiz con preguntas de la colección (desde BD)
- [ ] Corrige respuestas automáticamente
- [ ] Si aprueba (>= puntaje mínimo), genera certificado con código único
- [ ] Certificado aparece en perfil del taller
- [ ] Muestra estado del certificado si ya existe

**Estado:** OK

**Pantallas:** `/taller/aprender/[id]` (sección evaluación)

---

### HU-AP04: Verificar certificado
**Como** visitante, **quiero** verificar un certificado ingresando su código,
**para** confirmar que es auténtico.

**Criterios de aceptación:**
- [ ] Input para código o lectura desde ?code= en URL
- [ ] 3 estados: válido (verde), revocado (rojo), no encontrado (rojo)
- [ ] Muestra datos: taller, curso, fecha, calificación
- [ ] Funciona desde links QR en perfiles

**Estado:** OK (falta generación de QR como imagen)

**Pantallas:** `/verificar`

---

## Épica 4: ACOMPAÑAR

> Acompañamiento en formalización. Checklist de documentos, validaciones,
> niveles BRONCE/PLATA/ORO.

### HU-AC01: Checklist de formalización
**Como** taller, **quiero** ver mi checklist de documentos con % completado,
**para** saber qué me falta para formalizarme.

**Criterios de aceptación:**
- [ ] Lista de validaciones mapeadas contra tipos de documento
- [ ] Progress ring con % real
- [ ] Badges por item: completado, pendiente, vencido, rechazado
- [ ] Botón para subir documento por cada item

**Estado:** PARCIAL — Progress ring y badges funcionan, pero el botón "Subir documento"
no tiene handler. El taller no puede subir documentos desde esta página.

**Pantallas:** `/taller/formalizacion`

---

### HU-AC02: Subir documento de formalización
**Como** taller, **quiero** subir un documento para una validación específica,
**para** avanzar en mi proceso de formalización.

**Criterios de aceptación:**
- [ ] Upload con validación MIME (PDF/JPG/PNG/WEBP) y max 5MB
- [ ] Sube a Supabase Storage
- [ ] Actualiza estado de validación a PENDIENTE
- [ ] Feedback visual de éxito/error

**Estado:** PARCIAL — API de upload existe y funciona (Sprint 1), pero la página
de formalización no integra el componente file-upload. El componente existe
en `src/components/ui/file-upload.tsx` pero no se usa.

**Pantallas:** `/taller/formalizacion`

---

### HU-AC03: Admin aprueba/rechaza documento
**Como** admin, **quiero** revisar y aprobar/rechazar documentos de talleres,
**para** validar su proceso de formalización.

**Criterios de aceptación:**
- [ ] Detalle del taller con tabs: Formalización, Documentos, Actividad
- [ ] Tab Formalización: checklist de validaciones con aprobar/rechazar (Server Actions)
- [ ] Al aprobar/rechazar, recalcula nivel con aplicarNivel()
- [ ] Notas internas por taller

**Estado:** OK (Sprint 1)

**Pantallas:** `/admin/talleres/[id]`

---

### HU-AC04: Niveles BRONCE/PLATA/ORO
**Como** sistema, **quiero** calcular automáticamente el nivel del taller,
**para** que su formalización se refleje en su perfil y ranking.

**Criterios de aceptación:**
- [ ] Cálculo basado en validaciones completadas + certificados de academia
- [ ] Se recalcula al aprobar/rechazar validación y al crear/revocar certificado
- [ ] Nivel y puntaje se persisten en el modelo Taller

**Estado:** OK (Sprint 1, lib/nivel.ts)

**Pantallas:** Todas las que muestran nivel del taller

---

## Épica 5: FISCALIZAR

> Dashboard para el Estado. Métricas, exportes, auditorías, denuncias.

### HU-F01: Dashboard Estado
**Como** usuario del Estado, **quiero** ver un dashboard con métricas del sector,
**para** monitorear la formalización y detectar anomalías.

**Criterios de aceptación:**
- [ ] Counts reales: total talleres, total marcas, por nivel (Bronce/Plata/Oro)
- [ ] Barra de distribución por nivel con porcentajes
- [ ] Guard de rol ESTADO (no accesible a otros roles)
- [ ] Links a reportes y exportar

**Estado:** PARCIAL — Counts funcionan pero falta card de Oro, no hay guard de rol,
no hay link a exportar, no hay pedidos ni métricas de capacitación.

**Pantallas:** `/estado`

---

### HU-F02: Exportar reporte
**Como** usuario del Estado, **quiero** exportar reportes en PDF/Excel/CSV,
**para** compartir datos con otros organismos.

**Criterios de aceptación:**
- [ ] Selector de tipo de reporte (talleres, marcas, pedidos, certificados)
- [ ] Selector de formato (PDF/Excel/CSV)
- [ ] Selector de período
- [ ] Generación real del archivo y descarga

**Estado:** STUB — UI completa pero simula 2 segundos y no genera nada.

**Pantallas:** `/estado/exportar`

---

### HU-F03: Denuncias anónimas
**Como** trabajador, **quiero** hacer una denuncia anónima,
**para** reportar situaciones de trabajo informal sin represalias.

**Criterios de aceptación:**
- [ ] Form público (sin auth) con: tipo, descripción, taller (opcional)
- [ ] Genera código único de seguimiento
- [ ] Estado consultable por código (sin revelar datos del denunciante)

**Estado:** OK (API implementada en Sprint 1). FALTA página pública de denuncia.

**Pantallas:** Por crear

---

## Épica 6: ADMIN (implementado por Sergio)

> Panel de administración. No es función MVP formal pero Sergio lo construyó.

### HU-AD01: Dashboard admin
**Como** admin, **quiero** ver stats generales y acceder a todas las secciones,
**para** gestionar la plataforma.

**Criterios de aceptación:**
- [ ] Stats reales: talleres, marcas, colecciones, certificados
- [ ] Logs recientes reales
- [ ] Grid de navegación a sub-secciones

**Estado:** PARCIAL — Stats y logs reales. Sin gráficos ni filtro de período.

**Pantallas:** `/admin/dashboard`

---

### HU-AD02: CRUD Colecciones (academia)
**Como** admin, **quiero** crear, editar y gestionar colecciones de cursos,
**para** mantener actualizado el contenido de APRENDER.

**Criterios de aceptación:**
- [ ] Lista con búsqueda
- [ ] Crear colección (título, descripción, categoría, institución)
- [ ] Editar colección + toggle publicada/borrador
- [ ] Agregar videos (URL YouTube + título)
- [ ] Eliminar videos
- [ ] Crear evaluaciones con preguntas y respuestas

**Estado:** OK (colecciones y videos). PARCIAL (evaluaciones: CRUD in-memory, no persiste).

**Pantallas:** `/admin/colecciones`, `/admin/colecciones/nueva`, `/admin/colecciones/[id]`,
`/admin/colecciones/[id]/videos`, `/admin/evaluaciones`

---

### HU-AD03: Gestión de usuarios
**Como** admin, **quiero** ver y gestionar usuarios de la plataforma,
**para** administrar accesos y roles.

**Criterios de aceptación:**
- [ ] Lista con filtros (nombre/email, rol)
- [ ] Stats: total, talleres, marcas
- [ ] Modal detalle con datos reales
- [ ] Acciones: cambiar rol, resetear password, suspender

**Estado:** PARCIAL — Lista y detalle reales. Acciones (editar, suspender) sin handler.

**Pantallas:** `/admin/usuarios`

---

### HU-AD04: Gestión de talleres
**Como** admin, **quiero** ver el listado de talleres y acceder a su detalle,
**para** revisar documentación y gestionar niveles.

**Criterios de aceptación:**
- [ ] Lista con filtros (nombre/CUIT/email, nivel)
- [ ] Stats: total, Oro, Plata, Bronce
- [ ] Detalle con datos reales, validaciones, maquinaria, certificados
- [ ] Tabs: Formalización (aprobar/rechazar), Documentos, Actividad

**Estado:** OK (lista y detalle completos con Server Actions)

**Pantallas:** `/admin/talleres`, `/admin/talleres/[id]`

---

### HU-AD05: Gestión de marcas
**Como** admin, **quiero** ver el listado de marcas y su detalle,
**para** monitorear la actividad comercial.

**Criterios de aceptación:**
- [ ] Lista con búsqueda
- [ ] Stats: total, activas
- [ ] Detalle con datos reales

**Estado:** OK (lista). STUB (detalle: siempre muestra mock "Comercial Textil SRL").

**Pantallas:** `/admin/marcas`, `/admin/marcas/[id]`

---

### HU-AD06: Logs de actividad
**Como** admin, **quiero** ver los logs de actividad del sistema,
**para** auditar acciones de usuarios.

**Criterios de aceptación:**
- [ ] Lista real con paginación (20 por página)
- [ ] Filtros: búsqueda y tipo (AUTH/CRUD/ADMIN/ERROR)
- [ ] Tabla con timestamp, tipo, usuario, acción, detalles

**Estado:** OK (lectura). FALTA: ninguna ruta escribe logs al mutar datos.

**Pantallas:** `/admin/logs`

---

## Resumen por épica

| Épica | HU total | OK | PARCIAL | STUB | FALTA |
|-------|:--------:|:--:|:-------:|:----:|:-----:|
| REGISTRAR | 7 | 3 | 3 | 0 | 1 |
| ENCONTRAR | 7 | 5 | 1 | 0 | 0* |
| APRENDER | 4 | 4 | 0 | 0 | 0 |
| ACOMPAÑAR | 4 | 2 | 2 | 0 | 0 |
| FISCALIZAR | 3 | 0 | 1 | 1 | 1 |
| ADMIN | 6 | 2 | 3 | 1 | 0 |
| **Total** | **31** | **16** | **10** | **2** | **2** |

*ENCONTRAR: funcionalidades faltantes (notificaciones a talleres, matching automático)
no están como HU separadas porque dependen de integraciones (email, WhatsApp).

---

## Historias pendientes de definir (Fase 1)

Estas historias corresponden a funciones fuera del MVP pero documentadas en los CU:

| ID | Historia | Función | CU origen |
|----|----------|---------|-----------|
| HU-AC05 | Marca verifica proveedor antes de contratar | ACORDAR | CU-A01 |
| HU-PA01 | Pago por hitos completados | PAGAR | CU-P01 |
| HU-EJ01 | Taller registra avance con evidencia | EJECUTAR | CU-X01 |
| HU-EJ02 | Marca monitorea en tiempo real | EJECUTAR | CU-X02 |
| HU-F04 | Inspector agenda auditoría | FISCALIZAR | CU-F04 |
| HU-F05 | Sistema genera reporte para MTEySS | FISCALIZAR | CU-F05 |
| HU-G01 | Mesa tripartita define parámetros | GOBERNAR | CU-G01 |
