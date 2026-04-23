> **Postergado a V3** — depende de D-01 (redefinición roles ESTADO) y D-02 (tipos de documento desde DB). Ver `V3_BACKLOG.md`.

---

# Spec: "Tu próximo nivel" — guía de formalización en dashboard del taller

- **Semana:** v3 / UX institucional
- **Asignado a:** Sergio (UI) + Gerardo (lógica de pasos)
- **Origen:** Requerimiento OIT — la plataforma debe guiar activamente a los talleres hacia la formalización
- **Dependencias:** v2-epica-perfil-productivo mergeado, v2-epica-storage-documentos mergeado, D-01, D-02

---

## ANTES DE ARRANCAR

- [x] `taller.validaciones` disponible en la query del dashboard (ya existe)
- [x] `taller.certificados` disponible (ya existe)
- [x] `taller.verificadoAfip` disponible (ya existe)
- [x] `taller.sam` disponible para detectar si completó el perfil productivo (ya existe)
- [ ] D-01 resuelto — ESTADO configura tipos de documento
- [ ] D-02 resuelto — tipos de documento leídos desde DB, no hardcodeados

---

## 1. Contexto

El dashboard del taller ya muestra el porcentaje de formalización y un banner genérico ("Te faltan 7 documentos para ser PLATA"). Pero el taller no sabe exactamente qué hacer ni en qué orden — tiene que navegar a otras secciones para descubrirlo.

OIT requiere que la plataforma sea un agente activo de formalización, no solo un registro. La sección "Tu próximo nivel" convierte el dashboard en una guía paso a paso, priorizando las acciones de mayor impacto y mostrando el beneficio concreto de cada una.

---

## 2. Qué construir

Una sección nueva "Tu próximo nivel" en el dashboard del taller (`/taller`), entre el ring de formalización y las acciones rápidas.

La sección muestra:
- **Header** — nivel actual → nivel siguiente con barra de progreso visual
- **Lista de pasos pendientes** — ordenados por prioridad, cada uno con nombre, descripción corta, puntos que suma y botón de acción directo
- **Pasos completados** — colapsados al final, con check verde

---

## 3. Lógica de pasos

### Pasos para subir a PLATA (taller BRONCE)

| Prioridad | ID | Nombre | Descripción | Puntos | Acción |
|---|---|---|---|---|---|
| 1 | cuit | Verificar CUIT en AFIP | Tu identidad fiscal verificada | +10 pts | /taller/formalizacion |
| 2 | art | Subir ART | Seguro de riesgo de trabajo | +10 pts | /taller/formalizacion |
| 3 | habilitacion_municipal | Habilitación municipal | Permiso de funcionamiento | +10 pts | /taller/formalizacion |
| 4 | monotributo | Constancia de monotributo | Registro fiscal vigente | +10 pts | /taller/formalizacion |
| 5 | perfil_productivo | Completar perfil productivo | Capacidad, procesos y prendas | +5 pts | /taller/perfil/completar |
| 6 | curso_formalizacion | Curso de formalización | Certificado de la academia | +15 pts | /taller/aprender |

### Pasos para subir a ORO (taller PLATA)

| Prioridad | ID | Nombre | Descripción | Puntos | Acción |
|---|---|---|---|---|---|
| 1 | habilitacion_bomberos | Habilitación de bomberos | Certificado de seguridad | +10 pts | /taller/formalizacion |
| 2 | plan_seguridad | Plan de seguridad e higiene | Protocolo de trabajo seguro | +10 pts | /taller/formalizacion |
| 3 | empleados_registrados | Empleados registrados | Nómina laboral en regla | +10 pts | /taller/formalizacion |
| 4 | nomina_digital | Nómina digital | Gestión digital de empleados | +10 pts | /taller/formalizacion |
| 5 | curso_costos | Curso de cálculo de costos | Certificado de la academia | +15 pts | /taller/aprender |
| 6 | curso_seguridad | Curso de seguridad e higiene | Certificado de la academia | +15 pts | /taller/aprender |

### Taller ORO

Mostrar mensaje de felicitación: "¡Alcanzaste el nivel máximo!" con resumen de logros.

---

## 4. Función de derivación de pasos

Archivo: `src/compartido/lib/pasos-formalizacion.ts`

> **Nota V3:** cuando D-02 esté resuelto, los tipos de documento se leen desde la DB en lugar de hardcodearlos. Los nombres deben matchear exactamente con `tipoDocumento.nombre` en la DB: `"CUIT/Monotributo"`, `"Habilitación municipal"`, `"ART"`, `"Empleados registrados"`, `"Habilitación bomberos"`, `"Plan de seguridad e higiene"`, `"Nómina digital"`.

---

## 5. Componente UI

Archivo: `src/compartido/componentes/proximo-nivel.tsx`

---

## 6. Integración en el dashboard

Archivo: `src/app/(taller)/taller/page.tsx`

---

## 7. Casos borde

- **Taller recién registrado (sin datos)** — mostrar todos los pasos como pendientes
- **Taller ORO** — mostrar card de felicitación sin pasos
- **Todos los pasos completados pero nivel no subió** — mostrar mensaje "en revisión"
- **Taller sin taller creado todavía** — no mostrar la sección
- **Validación en estado PENDIENTE** — mostrar como "En revisión" con ícono de reloj

---

## 8. Criterios de aceptación

- [ ] Taller BRONCE ve sección "Tu camino a PLATA" con 6 pasos
- [ ] Pasos completados aparecen con check verde y colapsados
- [ ] Pasos pendientes muestran puntos que suman y botón de acción directo
- [ ] Validación en PENDIENTE muestra "En revisión" en lugar del botón
- [ ] Taller PLATA ve sección "Tu camino a ORO" con sus pasos correspondientes
- [ ] Taller ORO ve card de felicitación sin pasos pendientes
- [ ] Barra de progreso refleja los pasos completados / total
- [ ] Diseño usa colores del design system (brand-blue, green-50, amber-50)
- [ ] Funciona en mobile (responsive)
- [ ] Build sin errores de TypeScript

---

## 9. Tests

| # | Qué testear | Verificador |
|---|-------------|-------------|
| 1 | Taller BRONCE con 0 completados ve 6 pasos pendientes | QA |
| 2 | Taller BRONCE con CUIT verificado ve ese paso con check verde | QA |
| 3 | Taller PLATA ve pasos hacia ORO | QA |
| 4 | Taller ORO ve card de felicitación | QA |
| 5 | Validación en PENDIENTE muestra "En revisión" | QA |
| 6 | Toggle "Ver pasos completados" funciona | QA |
| 7 | Barra de progreso es correcta (2/6 = 33%) | QA |
| 8 | derivarPasos con taller sin validaciones devuelve 6 pasos todos pendientes | DEV |
| 9 | derivarPasos con taller ORO devuelve array vacío | DEV |
| 10 | Diseño responsive en mobile (360px) | QA |
