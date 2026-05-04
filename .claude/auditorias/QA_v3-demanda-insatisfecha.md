# QA: F-05 Dashboard de demanda insatisfecha

**Spec:** `v3-demanda-insatisfecha.md`
**Commit de implementacion:** pendiente (primer commit de F-05)
**URL de prueba:** https://plataforma-textil-dev.vercel.app
**Fecha:** 2026-05-04
**Auditor(es):** Sergio (tecnico) + politologo + economista + sociologo + contador
**Incluye Eje 6 de validacion de dominio:** si
**Perfiles aplicables:** politologo, economista, sociologo, contador

---

## Contexto institucional

Cuando una marca publica un pedido y no hay talleres formales compatibles, el sistema antes simplemente no hacia nada. Esa "demanda insatisfecha" es el dato mas valioso para politica publica: muestra donde no llega la oferta formal del sector textil. Este dashboard permite al ESTADO/OIT ver cuantos pedidos quedan sin cotizaciones, por que motivo, y que intervenciones concretas se pueden hacer (capacitacion, formalizacion, apoyo a crecimiento).

---

## Objetivo de este QA

Verificar que el dashboard de demanda insatisfecha funciona correctamente: muestra stats, motivos, recomendaciones, vistas detalladas, y exporta a CSV. Verificar que el registro automatico de motivos funciona cuando un pedido no matchea, y que las recomendaciones heuristicas son accionables.

---

## Como trabajar con este documento

1. Abri este archivo y la plataforma en paralelo
2. Identifica que items te corresponden segun tu perfil (columna Verificador)
3. Segui los pasos en orden — cada paso depende del anterior
4. Marca cada resultado con ok, bug o bloqueante
5. Si el resultado no es ok → abri el widget azul "Feedback" → describí que paso
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
| 1 | Migracion con tabla `MotivoNoMatch` y enum `MotivoCategoria` (4 categorias) | DEV | | # |
| 2 | Funcion `registrarMotivoNoMatch` integrada en `notificarTalleresCompatibles` (linea 106) | DEV | | # |
| 3 | Helper `buscarTalleresCerca` retorna talleres BRONCE a un paso de matchear | DEV | | # |
| 4 | `buscarTalleresCerca` usa `calcularProximoNivel()` de D-02 para detalle | DEV | | # |
| 5 | Dashboard `/estado/demanda-insatisfecha` con vista principal (stats + breakdown) | QA | | # |
| 6 | Vista detallada por categoria: SIN_TALLERES_NIVEL | QA | | # |
| 7 | Vista detallada por categoria: SIN_TALLERES_CAPACIDAD | QA | | # |
| 8 | Vista detallada por categoria: SIN_TALLERES_PROCESO | QA | | # |
| 9 | Vista de "talleres cerca" con detalle de que les falta | QA | | # |
| 10 | Recomendaciones automaticas segun reglas heuristicas | QA | | # |
| 11 | Metrica principal: unidades de produccion (no pesos) | QA | | # |
| 12 | Metrica secundaria: demanda en pesos (solo con presupuesto declarado, con aclaracion) | QA | | # |
| 13 | Export a CSV con rate limit | QA | | # |
| 14 | Filtro por fecha (desde/hasta en URL) | QA | | # |
| 15 | Item "Demanda insatisfecha" en navegacion ESTADO | QA | | # |
| 16 | Build sin errores de TypeScript | DEV | | # |
| 17 | Matching ahora filtra por procesosRequeridos (fix incluido en F-05) | DEV | | # |

---

## Eje 2 — Navegabilidad

### Paso 1 — Acceder al dashboard como ESTADO

- **Rol:** ESTADO (anabelen.torres@pdt.org.ar / pdt2026)
- **URL de inicio:** `/estado`
- **Verificador:** QA
- **Accion:** Hacer login como ESTADO. Buscar el tab "Demanda insatisfecha" en la barra de navegacion. Hacer click.
- **Esperado:** Se muestra el dashboard con titulo "Demanda insatisfecha", 3 cards de stats (pedidos sin cotizaciones, unidades, marcas), y la seccion de motivos principales.
- **Resultado:** [ ]
- **Notas:**

### Paso 2 — Ver motivos por categoria

- **Rol:** ESTADO
- **URL de inicio:** `/estado/demanda-insatisfecha`
- **Verificador:** QA
- **Accion:** Click en cualquiera de los 4 motivos (barras de progreso). Si no hay datos, las barras estaran en 0%.
- **Esperado:** Se navega a la vista detallada con tabla de pedidos filtrados por esa categoria. Boton "Volver al resumen" visible.
- **Resultado:** [ ]
- **Notas:**

### Paso 3 — Exportar CSV

- **Rol:** ESTADO
- **URL de inicio:** `/estado/demanda-insatisfecha`
- **Verificador:** QA
- **Accion:** Click en "Exportar CSV".
- **Esperado:** Se descarga un archivo .csv con headers: omId, tipoPrenda, cantidad, presupuesto, marca, motivoCategoria, talleresCerca, fecha.
- **Resultado:** [ ]
- **Notas:**

### Paso 4 — Ver talleres cerca de matchear

- **Rol:** ESTADO
- **URL de inicio:** `/estado/demanda-insatisfecha`
- **Verificador:** QA
- **Accion:** Si hay recomendaciones de formalizacion, click en "Ver detalles". Alternativamente, navegar directo a `/estado/demanda-insatisfecha?vista=talleres-cerca`.
- **Esperado:** Tabla con talleres, columnas: nombre, "falta para", detalle, pedidos que matchearia.
- **Resultado:** [ ]
- **Notas:**

### Paso 5 — Verificar acceso denegado para TALLER

- **Rol:** TALLER (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/taller`
- **Verificador:** QA
- **Accion:** Intentar navegar a `/estado/demanda-insatisfecha` directamente.
- **Esperado:** Redirige a `/unauthorized` o muestra pagina de error de permisos.
- **Resultado:** [ ]
- **Notas:**

---

## Eje 3 — Casos borde

| # | Caso | Accion | Esperado | Verificador | Resultado |
|---|------|--------|----------|-------------|-----------|
| 1 | Sin motivos registrados (DB vacia) | Acceder al dashboard con DB sin MotivoNoMatch | Muestra estado vacio con mensaje explicativo, no crash | QA | |
| 2 | Pedido cancelado no aparece | Cancelar un pedido que tenia MotivoNoMatch | El pedido no aparece en la vista activa | DEV | |
| 3 | Error en calcularProximoNivel | Taller sin ReglaNivel configurada | buscarTalleresCerca no crashea, muestra "sin datos" | DEV | |
| 4 | Rate limit en exportacion | Descargar CSV 6 veces en 1 hora | Las primeras 5 funcionan, la 6ta retorna 429 | DEV | |
| 5 | ADMIN tambien puede acceder | Login como ADMIN, navegar a /estado/demanda-insatisfecha | Carga normalmente | QA | |

---

## Eje 4 — Performance

| Verificacion | Metodo | Verificador | Resultado |
|-------------|--------|-------------|-----------|
| Pagina carga en menos de 3 segundos | DevTools > Network > recargar | QA | |
| Sin errores en consola del browser | DevTools > Console > revisar | QA | |
| Funciona en movil (responsive) | DevTools > Toggle device toolbar | QA | |
| Loading skeleton visible mientras carga | Recargar pagina con network throttling | QA | |

---

## Eje 5 — Consistencia visual

| Verificacion | Resultado | Notas |
|-------------|-----------|-------|
| Tipografias consistentes (Overpass para titulos) | | |
| Colores del design system (brand-blue, brand-red) | | |
| Estados vacios tienen mensaje descriptivo | | |
| Textos en espanol argentino (vos/tenes) | | |
| Barras de progreso de motivos son clickeables | | |
| Boton Exportar CSV es visible y accesible | | |

---

## Eje 6 — Validacion de dominio (perfiles interdisciplinarios)

### Politologo — Relacion con el Estado

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | La presentacion de "demanda insatisfecha" como dato accionable es la correcta para una politica publica textil? | | |
| 2 | Hay riesgo de que ESTADO use estos datos para presionar a talleres individuales? | | |
| 3 | El framing constructivo ("oportunidades de acompanamiento") es adecuado o resulta demasiado suave? | | |
| 4 | Los datos exportados en CSV son utiles para informes institucionales? | | |

### Economista — Incentivos y metricas

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | El calculo de unidades de produccion potencial es una metrica util para medir demanda? | | |
| 2 | El dato de presupuesto (parcial) es suficiente para informes, o genera mas confusion que valor? | | |
| 3 | Los thresholds de las recomendaciones (>=3 pedidos mismo proceso, >=2000 piezas) son razonables para el piloto? | | |
| 4 | Falta alguna metrica economica clave que un decisor de politica publica necesitaria? | | |

### Sociologo — Lenguaje y accesibilidad

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | Los talleres "cerca de matchear" deben ser contactados proactivamente o esperar a que ellos se acerquen? | | |
| 2 | Hay riesgo de que esta visibilidad genere stress sobre talleres que ya estan sobrecargados? | | |
| 3 | El lenguaje del dashboard evita estigmatizar a talleres BRONCE? | | |
| 4 | El taller individual NO ve que hubo pedidos que no pudo matchear — es correcto protegerlo de esa frustracion? | | |

### Contador — Flujos fiscales y operativos

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | Los datos exportados sirven para reportes formales que el ESTADO presentaria a OIT? | | |
| 2 | La metrica de unidades es suficiente o OIT necesita valoracion monetaria? | | |
| 3 | El CSV incluye suficientes columnas para auditorias? | | |
| 4 | El rate limit de 5 exportaciones/hora es razonable para el uso esperado? | | |

---

## Resumen de issues abiertos

| Issue | Tipo | Descripcion | Perfil que lo encontro | Prioridad |

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
