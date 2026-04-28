---
spec: v3-redefinicion-roles-estado
version: V3
bloque: 3
titulo: "Redefinicion de roles — ESTADO valida documentos"
fecha: 2026-04-28
autor: Gerardo (Claude Code)
---

# QA: Redefinicion de roles ESTADO (D-01)

## Eje 1 — Funcionalidad core

### 1.1 ESTADO puede acceder a /estado/talleres
- [ ] Login como ESTADO (anabelen.torres@pdt.org.ar / pdt2026)
- [ ] Navegar a /estado/talleres
- [ ] Ver listado con columnas: Taller, Nivel, Provincia, Docs pendientes, Progreso
- [ ] Verificar que los 3 talleres del seed aparecen
- [ ] Filtrar por nivel Bronce -> solo aparece Taller La Aguja
- [ ] Limpiar filtro -> vuelven los 3

### 1.2 ESTADO puede ver detalle de taller con tabs
- [ ] Click en un taller del listado
- [ ] Ver header con nombre, CUIT, nivel, puntaje
- [ ] Tab Formalizacion visible con checklist de documentos
- [ ] Tab Historial visible con timeline de decisiones
- [ ] Tab Datos del taller con info de solo lectura

### 1.3 ESTADO puede aprobar/rechazar documentos
- [ ] En tab Formalizacion, encontrar un documento PENDIENTE
- [ ] Click Aprobar -> documento pasa a COMPLETADO
- [ ] Verificar que muestra "Aprobado por: Ana Belen Torres" con fecha
- [ ] Volver atras, encontrar otro PENDIENTE, rechazar con motivo
- [ ] Verificar que muestra "Rechazado: [motivo]"

### 1.4 ESTADO puede revocar documentos aprobados
- [ ] En tab Formalizacion, encontrar un documento COMPLETADO
- [ ] Ingresar motivo de revocacion y click Revocar
- [ ] Documento pasa a NO_INICIADO
- [ ] Verificar en tab Historial que aparece la revocacion

### 1.5 ESTADO puede gestionar tipos de documento
- [ ] Navegar a /estado/documentos
- [ ] Ver listado de Obligatorios y Opcionales
- [ ] Click en Editar un tipo -> modal se abre
- [ ] Cambiar descripcion -> Guardar -> cambio reflejado
- [ ] Click Nuevo Requisito -> completar nombre y guardar -> aparece en la lista

### 1.6 ESTADO puede ver auditorias de formalizacion
- [ ] Navegar a /estado/auditorias
- [ ] Ver tabla con Fecha, Actor, Accion, Detalle
- [ ] Filtrar por tipo de accion
- [ ] Filtrar por rango de fechas
- [ ] Exportar CSV funciona (abre nueva tab con descarga)

## Eje 2 — Seguridad y permisos

### 2.1 ADMIN NO puede aprobar documentos
- [ ] Login como ADMIN (lucia.fernandez@pdt.org.ar / pdt2026)
- [ ] Acceder a /estado/talleres/[id]
- [ ] Verificar que aparece banner "Modo lectura"
- [ ] Verificar que NO hay botones Aprobar/Rechazar/Revocar
- [ ] Intentar POST a /api/tipos-documento via DevTools -> 403

### 2.2 ADMIN no puede acceder a /admin/documentos
- [ ] Login como ADMIN
- [ ] Navegar a /admin/documentos -> 404

### 2.3 TALLER no puede acceder a /estado/*
- [ ] Login como TALLER (roberto.gimenez@pdt.org.ar / pdt2026)
- [ ] Navegar a /estado/talleres -> redirect a /unauthorized
- [ ] Navegar a /estado/documentos -> redirect a /unauthorized

### 2.4 MARCA no puede acceder a /estado/*
- [ ] Login como MARCA (martin.echevarria@pdt.org.ar / pdt2026)
- [ ] Navegar a /estado/talleres -> redirect a /unauthorized

## Eje 3 — Navegacion y UI

### 3.1 Sidebar ESTADO tiene 8 items
- [ ] Login como ESTADO
- [ ] Abrir sidebar hamburguesa
- [ ] Verificar items: Dashboard, Talleres, Documentos, Auditorias, Diagnostico Sector, Exportar Datos, Notificaciones, Mi Cuenta

### 3.2 Sidebar ADMIN no muestra Documentos
- [ ] Login como ADMIN
- [ ] Verificar que sidebar NO tiene item "Documentos" apuntando a /admin/documentos

### 3.3 ADMIN talleres/[id] muestra link a vista ESTADO
- [ ] Login como ADMIN
- [ ] Ir a /admin/talleres/[id]
- [ ] Verificar banner con link "Ver vista de formalizacion"
- [ ] Click en link -> navega a /estado/talleres/[id]

## Eje 4 — Datos y migracion

### 4.1 Validaciones historicas mantienen aprobadoPor
- [ ] Verificar en /estado/talleres/[id-taller-oro] tab Formalizacion
- [ ] Los documentos COMPLETADO deben mostrar "Aprobado por: Lucia Fernandez" (admin del seed) o "Sistema (pre-V3)"

### 4.2 Logs historicos siguen visibles
- [ ] Login como ADMIN
- [ ] Ir a /admin/logs
- [ ] Verificar que acciones VALIDACION_APROBADA y ESTADO_VALIDACION_* aparecen

### 4.3 Niveles no se alteraron
- [ ] Verificar que Taller La Aguja sigue en BRONCE
- [ ] Verificar que Cooperativa Hilos del Sur sigue en PLATA
- [ ] Verificar que Corte Sur SRL sigue en ORO

## Eje 5 — Integraciones

### 5.1 Recalculo de nivel funciona post-D01
- [ ] Como ESTADO, aprobar un documento de un taller BRONCE
- [ ] Verificar que el puntaje se actualiza correctamente
- [ ] Si sube de nivel, verificar que el log NIVEL_SUBIDO aparece

### 5.2 Email de aprobacion se envia
- [ ] Aprobar un documento como ESTADO
- [ ] Verificar en logs del servidor que intento enviar email (o en Sendgrid si esta configurado)

## Eje 6 — Validacion de dominio (perfiles interdisciplinarios)

### 6.1 Perspectiva politologica
- [ ] PREGUNTA: La separacion ADMIN/ESTADO refleja la division real entre gestion tecnica y politica publica en Argentina?
- [ ] PREGUNTA: Un organismo estatal (INTI, Ministerio de Trabajo) aceptaria la responsabilidad de validar documentos en esta plataforma?
- [ ] VERIFICAR: El rol ESTADO tiene autonomia suficiente (no depende de ADMIN para ninguna accion regulatoria)
- [ ] VERIFICAR: Las decisiones del ESTADO quedan trazables (auditorias, logs con prefijo ESTADO_VALIDACION_*)

### 6.2 Perspectiva sociologica
- [ ] PREGUNTA: El taller percibe diferencia entre "el Estado aprobo tu documento" vs "un admin de la plataforma lo aprobo"?
- [ ] PREGUNTA: Esta diferencia genera mas o menos confianza en el proceso de formalizacion?
- [ ] VERIFICAR: La UI del taller (/taller/formalizacion) muestra quien aprobo cada documento — esto permite al taller saber que fue el Estado

### 6.3 Perspectiva economica
- [ ] PREGUNTA: Con 1-2 personas ESTADO y 25 talleres, la carga de revision de documentos es sostenible?
- [ ] PREGUNTA: Los incentivos de taller/marca/estado siguen alineados con la nueva separacion?
- [ ] VERIFICAR: El Estado puede ver todos los talleres y su estado de formalizacion en una sola pantalla (/estado/talleres)

### 6.4 Perspectiva contable
- [ ] PREGUNTA: Los tipos de documento configurados (CUIT, ART, Habilitacion municipal, etc.) reflejan la realidad fiscal argentina?
- [ ] PREGUNTA: El Estado tiene capacidad real de verificar estos documentos (acceso a ARCA, SIPA, etc.)?
