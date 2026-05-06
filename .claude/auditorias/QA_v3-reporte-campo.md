# QA: Reporte de campo del piloto (T-02)

**Spec:** `v3-reporte-campo.md`
**Commit de implementacion:** pendiente (develop)
**URL de prueba:** https://plataforma-textil.vercel.app
**Fecha:** 2026-05-06
**Auditor(es):** Sergio (tecnico) + politologo, economista, sociologo
**Incluye Eje 6 de validacion de dominio:** si
**Perfiles aplicables:** politologo, economista, sociologo (contador NO aplica)

---

## Contexto institucional

El piloto OIT no es solo una plataforma funcional — es un experimento de politica publica. Los aprendizajes cualitativos (resistencias culturales, expectativas no cumplidas, oportunidades detectadas) no aparecen en logs ni metricas. Este spec crea la herramienta para registrar, categorizar y reportar esas observaciones de campo de forma estructurada.

---

## Objetivo de este QA

Verificar que el equipo (ADMIN, ESTADO) puede registrar observaciones de campo, filtrarlas, editarlas, y generar reportes Excel multi-hoja para OIT con datos cuantitativos y cualitativos integrados.

---

## Como trabajar con este documento

1. Abri este archivo y la plataforma en paralelo
2. Identifica que items te corresponden segun tu perfil (columna Verificador)
3. Segui los pasos en orden — cada paso depende del anterior
4. Marca cada resultado con ok, bug o bloqueante
5. Si el resultado no es ok → abri el widget azul "Feedback" → describi que paso
6. Al terminar, completa el resultado global y commitea este archivo actualizado

---

## Resultado global

- [ ] Aprobado — todo funciona
- [ ] Aprobado con fixes — funciona pero hay bugs menores
- [ ] Rechazado — falta funcionalidad o hay bugs bloqueantes

**Decision:** [ cerrar v3 / fix inmediato / abrir item v4 ]
**Issues abiertos:** # (links a GitHub)

---

## Eje 1 — Funcionalidad

| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 1 | Modelo ObservacionCampo agregado con enums y relaciones named | DEV | ok | |
| 2 | Modelo User con arrays observacionesCreadas y observacionesRecibidas | DEV | ok | |
| 3 | Migracion aplicada exitosamente | DEV | ok | |
| 4 | POST /api/admin/observaciones crea observacion | QA | | |
| 5 | GET /api/admin/observaciones lista con filtros (tipo, fuente, tags hasSome, periodo, sentimiento) | QA | | |
| 6 | PATCH /api/admin/observaciones/[id] edita observacion | QA | | |
| 7 | DELETE /api/admin/observaciones/[id] borra observacion | QA | | |
| 8 | Pagina /admin/observaciones con listado y filtros | QA | | |
| 9 | Pagina /admin/observaciones/nueva con formulario completo | QA | | |
| 10 | Pagina /admin/observaciones/[id]/editar para edicion | QA | | |
| 11 | Auth: ADMIN/ESTADO crean/ven; solo autor o ADMIN edita/borra | QA | | |
| 12 | GET /api/admin/reporte-mensual genera Excel multi-hoja | QA | | |
| 13 | GET /api/admin/reporte-piloto genera Excel completo | QA | | |
| 14 | Tags sugeridos en autocomplete (11 tags pre-cargados) | QA | | |
| 15 | Filtro por tags usa hasSome (OR, no AND) | DEV | ok | |
| 16 | Build sin errores de TypeScript | DEV | ok | |
| 17 | Sidebar admin incluye item "Observaciones" | QA | | |

---

## Eje 2 — Navegabilidad

### Paso 1 — Acceder al listado de observaciones

- **Rol:** ADMIN (lucia.fernandez@pdt.org.ar / pdt2026)
- **URL de inicio:** /admin
- **Verificador:** QA
- **Accion:** En la sidebar izquierda, buscar "Observaciones" (icono ojo). Hacer clic.
- **Esperado:** Se carga /admin/observaciones con titulo "Observaciones de campo", filtros, y boton "+ Nueva observacion". Si no hay observaciones, se muestra EmptyState.
- **Resultado:** [ ]
- **Notas:**

### Paso 2 — Crear observacion nueva

- **Rol:** ADMIN
- **URL de inicio:** /admin/observaciones
- **Verificador:** QA
- **Accion:** Clic en "+ Nueva observacion". Completar: Tipo = RESISTENCIA, Fuente = VISITA, Sentimiento = Negativo, Importancia = 4 estrellas, Titulo = "Taller no quiere poner CUIT", Contenido = "Pensaba que era para denunciar evasion fiscal", Tags = clickear "cultural" y "fiscal", Fecha = hoy, Ubicacion = "Tucuman". Clic en "Registrar observacion".
- **Esperado:** Toast "Observacion registrada". Redirige a /admin/observaciones. La observacion aparece en el listado con badge RESISTENCIA rojo, 4 estrellas, tags #cultural #fiscal.
- **Resultado:** [ ]
- **Notas:**

### Paso 3 — Crear observacion con usuario asociado

- **Rol:** ADMIN
- **URL de inicio:** /admin/observaciones/nueva
- **Verificador:** QA
- **Accion:** En "Sobre quien", escribir "Roberto" → seleccionar Roberto Gimenez del dropdown. Completar: Tipo = EXITO, Fuente = LLAMADA, Sentimiento = Positivo, Importancia = 3, Titulo = "Cerro 2 pedidos en una semana", Contenido = "Ya usa la plataforma para todos sus pedidos". Tags = "engagement, comercial". Guardar.
- **Esperado:** Toast de exito. En el listado, la observacion muestra "Sobre: Roberto Gimenez (TALLER)".
- **Resultado:** [ ]
- **Notas:**

### Paso 4 — Filtrar observaciones

- **Rol:** ADMIN
- **URL de inicio:** /admin/observaciones
- **Verificador:** QA
- **Accion:** Seleccionar Tipo = RESISTENCIA → Filtrar. Verificar que solo aparece la observacion de resistencia. Limpiar filtro y probar Tags = "cultural" → Filtrar.
- **Esperado:** Los filtros funcionan. El filtro por tags muestra observaciones que tengan al menos uno de los tags indicados.
- **Resultado:** [ ]
- **Notas:**

### Paso 5 — Editar observacion

- **Rol:** ADMIN
- **URL de inicio:** /admin/observaciones
- **Verificador:** QA
- **Accion:** Clic en la primera observacion. Verificar Breadcrumbs "Observaciones > Editar observacion". Cambiar importancia a 5 estrellas. Clic en "Guardar cambios".
- **Esperado:** Toast "Observacion actualizada". Redirige al listado. La observacion ahora tiene 5 estrellas.
- **Resultado:** [ ]
- **Notas:**

### Paso 6 — Eliminar observacion

- **Rol:** ADMIN
- **URL de inicio:** /admin/observaciones/[id]/editar
- **Verificador:** QA
- **Accion:** Clic en boton rojo "Eliminar" → confirmar "Si, eliminar".
- **Esperado:** Toast "Observacion eliminada". Redirige al listado. La observacion ya no aparece.
- **Resultado:** [ ]
- **Notas:**

### Paso 7 — Descargar reporte mensual

- **Rol:** ADMIN
- **URL de inicio:** /admin/observaciones
- **Verificador:** QA
- **Accion:** Clic en "Reporte mensual" (boton con icono de descarga).
- **Esperado:** Se descarga un archivo .xlsx. Al abrir en Excel: portada con titulo y fecha, hojas "Metricas plataforma", "Etapas onboarding", "Demanda insatisfecha", "Observaciones", "Resumen ejecutivo".
- **Resultado:** [ ]
- **Notas:**

### Paso 8 — Verificar acceso ESTADO

- **Rol:** ESTADO (anabelen.torres@pdt.org.ar / pdt2026)
- **URL de inicio:** /estado
- **Verificador:** QA
- **Accion:** Navegar a /admin/observaciones (si ESTADO tiene acceso al panel admin) o verificar que las APIs responden correctamente para ESTADO.
- **Esperado:** ESTADO puede crear y ver observaciones. ESTADO no puede editar observaciones de otros.
- **Resultado:** [ ]
- **Notas:** ESTADO accede a las APIs pero la UI esta en (admin). Para V3 esto es OK — evaluar si necesita su propio panel en V4.

### Paso 9 — Verificar que TALLER no ve observaciones

- **Rol:** TALLER (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de inicio:** /taller
- **Verificador:** QA
- **Accion:** Intentar acceder a /admin/observaciones directamente.
- **Esperado:** Redirige a /unauthorized o muestra error 403.
- **Resultado:** [ ]
- **Notas:**

---

## Eje 3 — Casos borde

| # | Caso | Accion | Esperado | Verificador | Resultado |
|---|------|--------|----------|-------------|-----------|
| 1 | Observacion sin usuario asociado | Crear observacion sin seleccionar "Sobre quien" | Se crea OK, en listado no muestra "Sobre: ..." | QA | |
| 2 | Titulo vacio | Submit sin completar titulo | Toast de error, no se envia | QA | |
| 3 | Contenido vacio | Submit sin contenido | Toast de error, no se envia | QA | |
| 4 | Tags custom | Escribir un tag nuevo: "mi-tag-nuevo" | Se guarda y aparece en el listado | QA | |
| 5 | Importancia minima (1) y maxima (5) | Crear dos observaciones con importancia 1 y 5 | Ambas se guardan, muestran estrellas correctas | QA | |
| 6 | Sentimiento opcional | Crear observacion sin seleccionar sentimiento | Se crea OK (sentimiento null) | DEV | |
| 7 | Edicion solo por autor | Login como ESTADO, intentar editar obs de ADMIN | Mensaje "Solo el autor o un ADMIN puede modificar" | QA | |
| 8 | Reporte sin observaciones | Generar reporte mensual en mes sin observaciones | Excel se genera, hoja Observaciones vacia | QA | |

---

## Eje 4 — Performance

| Verificacion | Metodo | Verificador | Resultado |
|-------------|--------|-------------|-----------|
| /admin/observaciones carga en menos de 3 segundos | DevTools > Network > recargar | QA | |
| Sin errores en consola del browser | DevTools > Console > revisar | QA | |
| Funciona en movil (responsive) | DevTools > Toggle device toolbar | QA | |
| Reporte mensual se descarga en menos de 10 segundos | Cronometrar descarga | QA | |

---

## Eje 5 — Consistencia visual

| Verificacion | Resultado | Notas |
|-------------|-----------|-------|
| Tipografias consistentes (Overpass para titulos) | | |
| Colores del design system (brand-blue, badges) | | |
| Skeleton loading visible al cargar paginas | | |
| Breadcrumbs en paginas nueva y editar | | |
| Sidebar admin muestra "Observaciones" con icono ojo | | |
| EmptyState cuando no hay observaciones | | |
| Tags clickeables en formulario de sugerencias | | |

---

## Eje 6 — Validacion de dominio (perfiles interdisciplinarios)

### Politologo — Relacion con el Estado

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | Los 9 tipos de observacion capturan las dimensiones relevantes para politica publica? (RESISTENCIA, EXPECTATIVA, DIFICULTAD_TECNICA, DIFICULTAD_PROCESO, OPORTUNIDAD, EXITO, CONTEXTO_TALLER, CONTEXTO_MARCA, POLITICA_PUBLICA) | | |
| 2 | La estructura del reporte final del piloto (8 hojas) sirve para informes a organismos internacionales como OIT? | | |
| 3 | Falta algun tipo de observacion? (ej: GENERO, INTERSECCIONALIDAD) | | |
| 4 | La hoja "Recomendaciones" del reporte piloto, que toma observaciones POLITICA_PUBLICA y recomendaciones de demanda insatisfecha, es util para la toma de decisiones? | | |

### Economista — Incentivos y metricas

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | La capa cualitativa (observaciones) complementa correctamente las metricas cuantitativas (talleres, pedidos, cotizaciones) en el reporte mensual? | | |
| 2 | Hay riesgo de sesgo del observador? El campo sentimiento (POSITIVO/NEUTRAL/NEGATIVO) puede sesgar el analisis? | | |
| 3 | La escala de importancia (1-5) es suficiente para priorizar hallazgos en un reporte ejecutivo? | | |
| 4 | El reporte mensual integra correctamente: metricas plataforma + funnel onboarding + demanda insatisfecha + observaciones? | | |

### Sociologo — Lenguaje y accesibilidad

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | La capacidad de registrar contexto cultural es suficiente? (campo contenido libre + tags "cultural") | | |
| 2 | El sentimiento como categoria puede simplificar realidades complejas? (ej: una resistencia que es simultaneamente comprensible y problematica) | | |
| 3 | Las citas literales en el campo contenido permiten preservar la voz de los talleres? | | |
| 4 | **Hay riesgo de extractivismo de conocimiento?** El equipo registra observaciones sobre talleres sin que estos lo sepan ni consientan. Si un taller comparte su saber productivo en una visita y eso se registra para OIT, hay apropiacion sin consentimiento? | | |
| 5 | Deberia agregarse un mecanismo para que el taller observado pueda ver y validar la observacion? (para V4) | | |
| 6 | El disclaimer del formulario ("Esta info se usa para el reporte a OIT") es suficiente para el equipo observador? | | |

---

## Resumen de issues abiertos

| Issue | Tipo | Descripcion | Perfil que lo encontro | Prioridad |
|-------|------|-------------|------------------------|-----------|

---

## Notas de los auditores

**Sergio (tecnico):**
[observaciones tecnicas sobre implementacion, seguridad, performance]

**Perfiles interdisciplinarios:**
[observaciones sobre logica institucional, lenguaje, incentivos, contexto del sector]

---

## Checklist de cierre

- [ ] Todos los criterios de aceptacion del spec verificados
- [ ] Casos borde probados
- [ ] Performance revisada en desktop y movil
- [ ] Eje 6 completado por cada perfil aplicable
- [ ] Issues abiertos en GitHub con labels correctos
- [ ] Resultado global definido
- [ ] Documento commiteado a develop
