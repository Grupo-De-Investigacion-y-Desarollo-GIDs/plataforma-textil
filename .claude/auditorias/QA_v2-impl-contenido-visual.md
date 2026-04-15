# QA: Implementación de Contenido Visual

**Spec:** `v2-impl-contenido-visual.md`
**Commit de implementación:** `ca54c06`
**URL de prueba:** https://plataforma-textil.vercel.app
**Fecha:** 2026-04-15
**Auditor:** Sergio

---

## Cómo trabajar con este documento

1. Abrí este archivo y la plataforma en paralelo
2. Seguí los pasos en orden — cada paso depende del anterior
3. Marcá cada resultado con ✅ (ok), 🐛 (bug menor) o ❌ (bloqueante)
4. Si el resultado no es ✅ → abrí el widget azul "Feedback" en esa página → tipo [bug/falta] → describí qué pasó
5. Quedate en la página donde encontraste el problema antes de abrir el widget (captura la URL automáticamente)
6. Al terminar, completá el resultado global y commiteá este archivo actualizado

**Regla de oro:** un issue por hallazgo, desde la página donde ocurre.

> **IMPORTANTE — Este es el spec más visual de todos.** Tomá capturas de pantalla de los lightboxes y galerías para documentar que funcionan correctamente. Si algo no se ve bien en la captura, es un bug visual aunque el código funcione.

> **Nota:** si los hallazgos no aparecen en GitHub Issues, verificar que `GITHUB_TOKEN` y `GITHUB_REPO` están configurados en Vercel. Los hallazgos siempre quedan registrados en la DB aunque el token no esté configurado — se pueden ver en `/admin` desde `LogActividad`.

---

## Credenciales de prueba

| Rol | Email | Password | URL de entrada |
|-----|-------|----------|----------------|
| TALLER Bronce | `roberto.gimenez@pdt.org.ar` | `pdt2026` | `/taller` |
| TALLER Plata | `graciela.sosa@pdt.org.ar` | `pdt2026` | `/taller` |
| TALLER Oro | `carlos.mendoza@pdt.org.ar` | `pdt2026` | `/taller` |
| MARCA | `martin.echevarria@pdt.org.ar` | `pdt2026` | `/marca` |
| Sin login | — | — | `/` |

---

## Resultado global

- [ ] ✅ Aprobado — todo funciona
- [ ] 🔧 Aprobado con fixes — funciona pero hay bugs menores
- [ ] ❌ Rechazado — falta funcionalidad o hay bugs bloqueantes

**Decisión:** [ cerrar v2 / fix inmediato / abrir ítem v3 ]
**Issues abiertos:** #

---

## Eje 1 — Funcionalidad

Verificar que cada criterio de aceptación del spec está implementado.

| # | Criterio | Resultado | Issue |
|---|----------|-----------|-------|
| 1 | Migración `contenido_visual_imagenes` aplicada sin errores | | |
| 2 | `POST /api/upload/imagenes` valida ownership antes de aceptar upload (no acepta path libre del cliente) | | |
| 3 | Taller puede subir hasta 10 fotos desde `/taller/perfil` con preview | | |
| 4 | Portfolio visible en `/perfil/[id]` público con lightbox al click | | |
| 5 | Foto destacada del portfolio aparece en tarjetas del directorio | | |
| 6 | Talleres sin portfolio muestran placeholder genérico | | |
| 7 | Marca puede subir hasta 5 imágenes al crear un pedido | | |
| 8 | Campo `montoTotal` eliminado del form de nuevo pedido | | |
| 9 | Campo `descripcion` (textarea) y `procesosRequeridos` (multi-select) presentes en el form | | |
| 10 | Imágenes del pedido visibles como thumbnail en el marketplace y galería en el detalle | | |
| 11 | Taller puede adjuntar hasta 3 fotos al cotizar | | |
| 12 | Marca ve fotos del taller al comparar cotizaciones | | |
| 13 | Todas las `<img>` tienen `loading="lazy"` | | |
| 14 | Click en cualquier imagen de galería abre el lightbox | | |
| 15 | Build de TypeScript pasa sin errores | | |

---

## Eje 2 — Navegabilidad

> **Instrucciones:** Seguí los pasos en orden. Cada paso construye sobre el anterior. Preparar 2-3 imágenes JPG o PNG de prueba (menos de 5MB cada una) antes de arrancar.

### Paso 1 — Portfolio: sección visible en perfil del taller

- **Rol:** TALLER Bronce (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/taller/perfil`
- **Acción:**
  1. Login como Roberto Giménez (TALLER Bronce)
  2. Navegar a `/taller/perfil`
  3. Buscar la sección "Mi portfolio"
- **Esperado:** Se ve una Card con título "Mi portfolio". Si no tiene fotos, muestra un ícono gris, el texto "Agrega fotos de tus trabajos" y un botón "Agregar fotos"
- **Resultado:**
- **Notas:**

### Paso 2 — Portfolio: subir fotos con preview

- **Rol:** TALLER Bronce (sigue logueado)
- **URL de inicio:** `/taller/perfil`
- **Acción:**
  1. Click en "Agregar fotos"
  2. Seleccionar 2 imágenes JPG o PNG (menos de 5MB cada una)
  3. Observar los thumbnails antes de que se suban
- **Esperado:** Aparece el área de drop/click. Al seleccionar archivos, se muestran thumbnails de cada imagen con nombre y tamaño. Las fotos se suben automáticamente
- **Resultado:**
- **Notas:**

### Paso 3 — Portfolio: fotos en la grilla del perfil

- **Rol:** TALLER Bronce (sigue logueado)
- **URL de inicio:** `/taller/perfil`
- **Acción:**
  1. Esperar a que termine la subida (puede tardar unos segundos)
  2. Verificar que la página se refresca y las fotos aparecen en una grilla
- **Esperado:** Las 2 fotos aparecen como thumbnails cuadrados en una grilla de 3 o 4 columnas. Cada foto tiene un botón × rojo que aparece al hacer hover
- **Resultado:**
- **Notas:**

### Paso 4 — Portfolio: lightbox al hacer click

- **Rol:** TALLER Bronce (sigue logueado)
- **URL de inicio:** `/taller/perfil`
- **Acción:**
  1. Click en una de las fotos del portfolio
  2. Observar la imagen ampliada
  3. Click fuera de la imagen (en el fondo oscuro) para cerrar
- **Esperado:** Se abre un lightbox con fondo oscuro semitransparente y la imagen ampliada centrada. Click fuera cierra el lightbox
- **Resultado:**
- **Notas:** Tomar captura de pantalla del lightbox abierto

### Paso 5 — Portfolio público: fotos visibles sin login

- **Rol:** Sin login (ventana de incógnito)
- **URL de inicio:** `/perfil/[id]` (ID del taller de Roberto — copiar de la URL del perfil)
- **Acción:**
  1. Cerrar sesión o abrir ventana de incógnito
  2. Navegar al perfil público de Roberto: `/perfil/[id]`
  3. Buscar la sección "Trabajos realizados"
- **Esperado:** Se ve una Card con título "Trabajos realizados" con la grilla de fotos que Roberto subió. Click en una foto abre el lightbox
- **Resultado:**
- **Notas:**

### Paso 6 — Directorio: foto destacada en tarjeta

- **Rol:** Sin login (sigue en incógnito)
- **URL de inicio:** `/directorio`
- **Acción:**
  1. Navegar a `/directorio`
  2. Buscar la tarjeta de Roberto Giménez
- **Esperado:** La tarjeta de Roberto tiene una imagen destacada arriba (la primera foto de su portfolio) en formato panorámico (aspect-video). La imagen ocupa el ancho completo de la tarjeta
- **Resultado:**
- **Notas:**

### Paso 7 — Directorio: placeholder para taller sin fotos

- **Rol:** Sin login (sigue en incógnito)
- **URL de inicio:** `/directorio`
- **Acción:**
  1. En el mismo directorio, buscar un taller que NO tenga fotos de portfolio (ej: Graciela si no subió fotos)
- **Esperado:** La tarjeta muestra un placeholder gris con un ícono de fábrica (Factory) centrado, en lugar de una imagen
- **Resultado:**
- **Notas:**

### Paso 8 — Pedido: formulario con sección de imágenes

- **Rol:** MARCA (martin.echevarria@pdt.org.ar / pdt2026)
- **URL de inicio:** `/marca/pedidos/nuevo`
- **Acción:**
  1. Cerrar incógnito, login como Martín Echevarría (MARCA)
  2. Navegar a `/marca/pedidos/nuevo`
  3. Revisar los campos del formulario
- **Esperado:** El formulario tiene: tipo de prenda, cantidad, fecha objetivo, descripción (textarea), procesos requeridos (botones toggle), e imágenes de referencia (FileUpload con máx 5). Se ve el texto "opcional, max 5"
- **Resultado:**
- **Notas:**

### Paso 9 — Pedido: campo montoTotal eliminado

- **Rol:** MARCA (sigue logueado)
- **URL de inicio:** `/marca/pedidos/nuevo`
- **Acción:**
  1. Revisar todos los campos del formulario
  2. Verificar que NO existe un campo "Monto total estimado" ni similar
- **Esperado:** NO hay campo de monto total. Los únicos campos numéricos son "Cantidad" y "Fecha objetivo" (date)
- **Resultado:**
- **Notas:** Si aparece el campo montoTotal, es un bug — el spec lo deprecó explícitamente

### Paso 10 — Pedido: crear con imágenes, descripción y procesos

- **Rol:** MARCA (sigue logueado)
- **URL de inicio:** `/marca/pedidos/nuevo`
- **Acción:**
  1. Completar tipo de prenda: "Remera estampada"
  2. Cantidad: 500
  3. Descripción: "Tela jersey algodón 24/1, talles S a XL, estampado serigrafia en frente"
  4. Seleccionar 2 procesos requeridos (ej: Corte, Confección)
  5. Subir 2 imágenes JPG
  6. Click "Crear pedido"
- **Esperado:** El pedido se crea exitosamente, redirige a `/marca/pedidos?created=1`. Los procesos seleccionados se resaltan en azul antes de enviar
- **Resultado:**
- **Notas:**

### Paso 11 — Marketplace: thumbnail en pedidos disponibles

- **Rol:** TALLER Plata (graciela.sosa@pdt.org.ar / pdt2026)
- **URL de inicio:** `/taller/pedidos/disponibles`
- **Acción:**
  1. Cerrar sesión, login como Graciela Sosa (TALLER Plata)
  2. Navegar a `/taller/pedidos/disponibles`
  3. Buscar el pedido "Remera estampada" creado en el paso anterior
- **Esperado:** El pedido muestra un thumbnail de la primera imagen de referencia en formato panorámico arriba de la información del pedido
- **Resultado:**
- **Notas:** El pedido debe estar en estado PUBLICADO para aparecer. Si no aparece, primero publicar desde la vista de marca

### Paso 12 — Detalle pedido: galería completa con lightbox

- **Rol:** TALLER Plata (sigue logueado)
- **URL de inicio:** `/taller/pedidos/disponibles/[id]`
- **Acción:**
  1. Click en "Ver y cotizar" del pedido "Remera estampada"
  2. Buscar la sección "Imagenes de referencia"
  3. Click en una imagen
- **Esperado:** Se ve una Card "Imagenes de referencia" con las 2 fotos en grilla. Click en una abre el lightbox con la imagen ampliada
- **Resultado:**
- **Notas:** Tomar captura del lightbox

### Paso 13 — Cotización: sección de fotos al cotizar

- **Rol:** TALLER Plata (sigue logueado)
- **URL de inicio:** `/taller/pedidos/disponibles/[id]`
- **Acción:**
  1. Scroll hasta el formulario "Enviar cotizacion"
  2. Buscar la sección de fotos
- **Esperado:** Debajo del campo "Mensaje", hay un label "Fotos de trabajos similares (opcional, max 3)" con un FileUpload para imágenes
- **Resultado:**
- **Notas:**

### Paso 14 — Cotización: enviar con fotos adjuntas

- **Rol:** TALLER Plata (sigue logueado)
- **URL de inicio:** `/taller/pedidos/disponibles/[id]`
- **Acción:**
  1. Completar precio: 75000
  2. Plazo: 20 días
  3. Proceso: "Corte y confección completa"
  4. Adjuntar 2 fotos JPG
  5. Click "Enviar cotizacion"
- **Esperado:** La cotización se envía exitosamente, redirige a `/taller/pedidos`. Las fotos se suben antes del envío (puede tardar unos segundos)
- **Resultado:**
- **Notas:**

### Paso 15 — Marca: fotos de cotización visibles

- **Rol:** MARCA (martin.echevarria@pdt.org.ar / pdt2026)
- **URL de inicio:** `/marca/pedidos/[id]` (el pedido "Remera estampada")
- **Acción:**
  1. Cerrar sesión, login como Martín (MARCA)
  2. Navegar al detalle del pedido "Remera estampada"
  3. Scroll hasta la sección de cotizaciones
- **Esperado:** La cotización de Graciela muestra los datos (precio, plazo, proceso) y debajo las 2 fotos como thumbnails pequeños (64x64px aprox)
- **Resultado:**
- **Notas:**

### Paso 16 — Marca: lightbox en fotos de cotización

- **Rol:** MARCA (sigue logueado)
- **URL de inicio:** `/marca/pedidos/[id]`
- **Acción:**
  1. Click en una de las fotos de la cotización
- **Esperado:** Se abre el lightbox con la imagen ampliada. Click fuera cierra el lightbox
- **Resultado:**
- **Notas:** Tomar captura del lightbox

### Paso 17 — Validación: rechazo de formato inválido

- **Rol:** TALLER Bronce (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/taller/perfil`
- **Acción:**
  1. Cerrar sesión, login como Roberto (TALLER Bronce)
  2. Ir a `/taller/perfil` → sección Mi portfolio → "Agregar fotos"
  3. Intentar seleccionar un archivo PDF
- **Esperado:** El selector de archivos del browser filtra por tipo (solo muestra JPG/PNG/WebP). Si se fuerza un PDF de otra forma, el endpoint retorna error "Formato no soportado. Usa JPG, PNG o WebP."
- **Resultado:**
- **Notas:** El filtro principal es el `accept` del input del browser. El endpoint valida como segundo check

### Paso 18 — Validación: rechazo de imagen mayor a 5MB

- **Rol:** TALLER Bronce (sigue logueado)
- **URL de inicio:** `/taller/perfil`
- **Acción:**
  1. Preparar una imagen mayor a 5MB (ej: foto sin comprimir de alta resolución)
  2. Intentar subirla al portfolio
- **Esperado:** La imagen no se agrega a la lista de archivos seleccionados (el FileUpload filtra por tamaño client-side). Si se bypasea, el endpoint retorna "La imagen no puede superar 5MB"
- **Resultado:**
- **Notas:** El FileUpload tiene validación de 5MB client-side. El endpoint valida como segundo check

---

## Eje 3 — Casos borde

| # | Caso | Acción | Esperado | Resultado |
|---|------|--------|----------|-----------|
| 1 | Pedido sin imágenes se crea correctamente | Como MARCA, crear un pedido sin subir imágenes | El pedido se crea normalmente con array de imágenes vacío | |
| 2 | Cotización sin fotos se envía correctamente | Como TALLER, cotizar sin adjuntar fotos | La cotización se envía normalmente | |
| 3 | Taller con 10 fotos no puede agregar más | Subir fotos hasta llegar a 10 en el portfolio | El uploader desaparece, se muestra "Maximo 10 archivos alcanzado" | |
| 4 | Pedido con 5 imágenes muestra límite alcanzado | Seleccionar 5 imágenes en el form de nuevo pedido | El drop area desaparece, se muestra "Maximo 5 archivos alcanzado" | |
| 5 | Eliminar foto del portfolio | Hover sobre una foto → click en el botón × rojo | La foto se elimina del grid, la página se refresca | |
| 6 | Directorio marca también muestra foto destacada | Login como MARCA → `/marca/directorio` | Las tarjetas de talleres con portfolio muestran foto destacada igual que el directorio público | |

---

## Eje 4 — Performance

| Verificación | Método | Resultado |
|-------------|--------|-----------|
| Upload de imagen completa en menos de 5 segundos | Subir 1 foto JPG de ~2MB → medir tiempo | |
| Galería de 3+ fotos carga sin bloquear el contenido | Abrir perfil con fotos → verificar que el texto carga primero | |
| Lightbox abre inmediatamente al click | Click en foto → medir tiempo hasta que aparece | |
| Sin errores en consola del browser durante uploads | DevTools → Console → revisar durante la subida de fotos | |
| Directorio con fotos destacadas carga en menos de 3 segundos | `/directorio` → medir tiempo de carga completa | |
| Imágenes tienen `loading="lazy"` (no cargan todas al inicio) | DevTools → Network → verificar que imágenes fuera de viewport no cargan | |

---

## Eje 5 — Consistencia visual

| Verificación | Resultado | Notas |
|-------------|-----------|-------|
| Grilla del portfolio tiene aspect-ratio cuadrado consistente | | |
| Lightbox tiene fondo oscuro semitransparente (80% opacidad) | | |
| Foto destacada en directorio tiene aspect-ratio panorámico (aspect-video) | | |
| Placeholder de taller sin fotos es visible y centrado | | |
| Botón × de eliminar foto aparece solo en hover | | |
| Thumbnails de cotización tienen tamaño uniforme (64x64) | | |
| FileUpload muestra thumbnails de preview alineados | | |
| Botones toggle de procesos cambian de color al seleccionar (blanco → azul) | | |
| Textarea de descripción tiene placeholder descriptivo | | |

---

## Resumen de issues abiertos

| Issue | Tipo | Descripción | Prioridad sugerida |
|-------|------|-------------|-------------------|
| — | — | — | — |

---

## Notas del auditor

**Nota sobre las imágenes de prueba:** Para testear correctamente, preparar antes de arrancar:
- 3-4 imágenes JPG o PNG de menos de 5MB (fotos de prendas, telas, talleres)
- 1 archivo PDF (para verificar rechazo de formato)
- 1 imagen mayor a 5MB (para verificar rechazo de tamaño)

**Nota sobre el flujo de pedidos:** Los pasos 11 y 12 requieren que el pedido esté en estado PUBLICADO. Si el pedido se creó en paso 10 queda como BORRADOR, hay que publicarlo primero desde `/marca/pedidos/[id]` con el botón "Publicar".

**Nota sobre el lightbox:** El lightbox usa `<dialog>` nativo del browser. Se cierra haciendo click fuera de la imagen. No tiene botón de cerrar explícito — esto es intencional para mantenerlo simple. Si el auditor considera que necesita un botón X, reportarlo como **mejora** (no bug).

**Nota sobre el bucket de Supabase:** El bucket `imagenes` fue creado como público. Las URLs de las imágenes son accesibles sin autenticación — esto es intencional porque las imágenes del portfolio, pedidos y cotizaciones deben ser visibles en contextos donde no hay sesión (directorio público, perfil público).

---

## Checklist de cierre

- [ ] 15 criterios de aceptación del spec verificados
- [ ] 18 pasos de navegación probados (portfolio 7 + pedidos 5 + cotizaciones 4 + validación 2)
- [ ] 6 casos borde probados
- [ ] Performance revisada
- [ ] Capturas de pantalla de lightboxes tomadas
- [ ] Issues abiertos en GitHub con labels correctos
- [ ] Resultado global definido
- [ ] Documento commiteado a develop
