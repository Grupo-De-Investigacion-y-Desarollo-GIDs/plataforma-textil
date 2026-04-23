# Epica: Contenido Visual — Imagenes en Pedidos y Portfolio de Talleres

**Fecha:** 2026-04-07
**Estado:** Aprobado para v2
**Referencia:** Alibaba/1688 (RFQ visual + perfil de proveedor), Faire (catalogo de productos)

---

## Problema

La plataforma es un marketplace textil pero no tiene soporte para imagenes en ninguno de los flujos criticos:

- **Pedidos sin referencia visual:** Una marca crea un pedido con solo texto (tipo prenda, cantidad, monto). Un taller no puede evaluar si es capaz de producirlo sin ver el diseño, molde o muestra de referencia.
- **Talleres sin portfolio:** Un taller no puede mostrar su trabajo. La marca elige a ciegas, basandose solo en nivel, ubicacion y rating numerico.
- **Perfil publico generico:** El directorio lista talleres como fichas de texto. No transmite confianza ni diferenciacion.

En Alibaba, el 90% de los RFQ incluyen imagenes. Los proveedores sin galeria de productos reciben 70% menos contactos. El contenido visual no es un nice-to-have — es lo que hace funcionar un marketplace de manufactura.

---

## Decision: pedido sin presupuesto

El pedido es una **demanda abierta**. La marca describe que necesita y los talleres cotizan libremente. Si la marca publica presupuesto, condiciona las ofertas y se pierde la informacion real del mercado.

**Referencia:** En Alibaba el campo "Target Price" es opcional y la mayoria no lo completa. En licitaciones publicas (espiritu OIT), las ofertas son libres.

### Campos del pedido v2

| Campo | Obligatorio | Descripcion |
|-------|-------------|-------------|
| Tipo de prenda | Si | Que necesita fabricar |
| Cantidad | Si | Escala del trabajo |
| Descripcion / especificaciones | Si | Detalle tecnico: tela, talles, terminaciones |
| Imagenes de referencia | Recomendado | Diseño, molde, muestra (hasta 5) |
| Fecha objetivo | Si | Plazo maximo de entrega |
| Procesos requeridos | Opcional | Corte, confeccion, estampado, etc. |
| ~~Presupuesto / monto~~ | **Eliminado** | Lo define el taller en su cotizacion |

### Campos de la cotizacion v2

| Campo | Obligatorio | Descripcion |
|-------|-------------|-------------|
| Precio unitario | Si | Oferta del taller por unidad |
| Plazo (dias) | Si | En cuantos dias puede entregar |
| Proceso | Si | Que proceso(s) cotiza |
| Imagenes de trabajos similares | Opcional | Fotos de productos que ya hizo (hasta 3) |
| Mensaje | Opcional | Comentarios, condiciones, aclaraciones |

---

## Estado actual del codigo

| Componente | Existe? | Detalle |
|-----------|---------|---------|
| `portfolioFotos: String[]` en modelo Taller | Si | Campo en schema Prisma, nunca usado |
| `file-upload.tsx` (drag & drop) | Si | Componente generico reutilizable en `compartido/componentes/ui/` |
| `storage.ts` (uploadFile/deleteFile) | Si | Funciones para Supabase Storage, bucket `documentos` |
| Upload de validaciones | Si | Flujo completo: componente + API + storage (PDF/JPG/PNG/WebP, 5MB) |
| Bucket para imagenes | No | Solo existe bucket `documentos` para formalizacion |
| Campo imagenes en Pedido | No | Modelo Pedido no tiene campos de imagen |
| Campo montoTotal en Pedido | Si | **Eliminar** — el precio lo define la cotizacion |
| Galeria en perfil taller | No | Ni en `/taller/perfil` ni en `/perfil/[id]` publico |
| Imagenes en detalle de pedido | No | `/marca/pedidos/[id]` solo muestra texto |

---

## Wireframes

### W1: Marketplace de pedidos — `/taller/pedidos/disponibles`

Lo que ve el taller cuando busca trabajo. La foto es del producto que la marca quiere fabricar.

```
+-----------------------------------------------------------+
|  Pedidos disponibles                      Filtrar v        |
+-----------------------------------------------------------+
|                                                            |
|  +----------+  Buzo oversize -- 500 unidades               |
|  |          |  Moda Urbana BA                              |
|  |  [FOTO   |  Fecha limite: 15 mayo 2026                  |
|  |  DEL     |  Procesos: Corte, Confeccion, Estampado      |
|  |  DISENO] |  +----------+ +-----------+                  |
|  |          |  | +2 fotos | | Ver y     |                  |
|  +----------+  +----------+ | cotizar > |                  |
|                              +-----------+                  |
+------------------------------------------------------------+
|                                                            |
|  +----------+  Remera basica -- 1000 unidades              |
|  |          |  Amapola Textil                              |
|  |  [FOTO   |  Fecha limite: 30 mayo 2026                  |
|  |  MOLDE]  |  Procesos: Corte, Confeccion                 |
|  |          |  +----------+ +-----------+                  |
|  +----------+  | +1 foto  | | Ver y     |                  |
|                +----------+ | cotizar > |                  |
|                              +-----------+                  |
+------------------------------------------------------------+
|                                                            |
|  +----------+  Campera deportiva -- 200 unidades           |
|  | [SIN     |  Urbano Textil                               |
|  |  IMAGEN  |  Fecha limite: 10 junio 2026                  |
|  |  icono   |  Procesos: Corte, Confeccion                 |
|  | generico]|  +-----------+                               |
|  +----------+  | Ver y     |  <-- sin fotos, menos atractivo|
|                | cotizar > |                               |
|                +-----------+                               |
+------------------------------------------------------------+
```

### W2: Detalle del pedido para cotizar — `/taller/pedidos/disponibles/[id]`

El taller ve toda la informacion del pedido y envia su cotizacion.

```
+-----------------------------------------------------------+
|  < Volver a pedidos disponibles                            |
|                                                            |
|  Buzo oversize                                             |
|  Moda Urbana BA · 500 unidades · Entrega: 15 mayo 2026    |
|                                                            |
|  +---------------------------------------------------+    |
|  |                                                    |    |
|  |           [IMAGEN PRINCIPAL DEL DISENO]            |    |
|  |                                                    |    |
|  +---------------------------------------------------+    |
|  +------+ +------+ +------+ +------+                      |
|  | img  | | img  | | img  | | img  |  <-- thumbnails      |
|  |  2   | |  3   | |  4   | |  5   |      click = zoom    |
|  +------+ +------+ +------+ +------+                      |
|                                                            |
|  Descripcion:                                              |
|  Buzo oversize en algodon, talle S-XL, estampado           |
|  frontal serigrafia 3 colores. Necesitamos molde           |
|  propio (adjunto en imagen 3). Tela: french terry          |
|  280gr. Terminacion: ribeteado en cuello y punos.          |
|                                                            |
|  Procesos requeridos: Corte · Confeccion · Estampado       |
|                                                            |
|  ========= Tu cotizacion =========                         |
|                                                            |
|  Precio por unidad:  [$ ________]                          |
|  Plazo (dias):       [__________]                          |
|  Proceso:            [v Seleccionar      ]                 |
|                                                            |
|  Fotos de trabajos   +------+ +------+ +------+            |
|  similares           | + img| | + img| | + img|  (max 3)  |
|  (opcional):         +------+ +------+ +------+            |
|                                                            |
|  Mensaje:            +------------------------------+      |
|                      | Tenemos experiencia en buzos |      |
|                      | oversize, adjunto muestras   |      |
|                      +------------------------------+      |
|                                                            |
|                      +---------------------+               |
|                      | Enviar cotizacion    |               |
|                      +---------------------+               |
+-----------------------------------------------------------+
```

### W3: Creacion de pedido — `/marca/pedidos/nuevo`

La marca describe su demanda. Sin presupuesto — el precio lo definen los talleres.

```
+-----------------------------------------------------------+
|  Nuevo pedido                                              |
|                                                            |
|  Tipo de prenda:     [Buzo oversize               ]       |
|  Cantidad:           [500                         ]       |
|  Fecha objetivo:     [15/05/2026                  ]       |
|                                                            |
|  Descripcion:        +------------------------------+     |
|                      | Buzo oversize en algodon,    |     |
|                      | talle S-XL, estampado        |     |
|                      | frontal serigrafia 3 colores.|     |
|                      | Tela: french terry 280gr.    |     |
|                      +------------------------------+     |
|                                                            |
|  Procesos            [ ] Corte                             |
|  requeridos:         [x] Confeccion                        |
|                      [x] Estampado                         |
|                      [ ] Bordado                           |
|                      [ ] Lavado                            |
|                      [ ] Planchado                         |
|                                                            |
|  === Imagenes de referencia (hasta 5) ===                  |
|  +-----------------------------------------------+        |
|  |                                                |        |
|  |       Arrastra imagenes aca                    |        |
|  |       o [click para seleccionar]               |        |
|  |                                                |        |
|  |       JPG, PNG o WebP · Max 5MB cada una       |        |
|  +-----------------------------------------------+        |
|  +------+ +------+                                         |
|  | img  | | img  |  <-- preview con boton eliminar         |
|  |  1   | |  2   |                                         |
|  | [x]  | | [x]  |  Diseno frontal · Molde base            |
|  +------+ +------+                                         |
|                                                            |
|  +--------------------+    +---------------------+         |
|  | Guardar borrador   |    | Publicar al mercado |         |
|  +--------------------+    +---------------------+         |
|                            +---------------------+         |
|                            | Invitar a cotizar   |         |
|                            +---------------------+         |
+-----------------------------------------------------------+
```

### W4: Directorio de talleres — `/directorio`

Tarjetas visuales con foto destacada del portfolio.

```
+-----------------------------------------------------------+
|  Directorio de talleres            Buscar: [___________]   |
|  Nivel: [Todos v]  Proceso: [Todos v]  Zona: [Todos v]    |
+-----------------------------------------------------------+
|                                                            |
|  +---------------------------+  +-------------------------+|
|  | +-------------------------+  | +-----------------------+||
|  | | [FOTO DESTACADA        ]|  | | [FOTO DESTACADA     ]|||
|  | | [del portfolio         ]|  | | [del portfolio      ]|||
|  | | [primer trabajo        ]|  | |                      |||
|  | +-------------------------+  | +-----------------------+||
|  | Corte Sur SRL                | Coop. Hilos del Sur      ||
|  | * ORO    4.8 rating          | * PLATA    4.2 rating    ||
|  | Avellaneda, Buenos Aires     | La Matanza               ||
|  | Corte · Confeccion           | Confeccion               ||
|  | +----+ +----+ +----+        | +----+ +----+            ||
|  | |img | |img | |img | +4     | |img | |img | +1         ||
|  | +----+ +----+ +----+        | +----+ +----+            ||
|  | [Ver perfil]                 | [Ver perfil]             ||
|  +---------------------------+  +-------------------------+|
|                                                            |
|  +---------------------------+                             |
|  | +-------------------------+                             |
|  | |      [SIN FOTO]        |  <-- taller sin portfolio   |
|  | |    icono placeholder    |                             |
|  | +-------------------------+                             |
|  | Taller La Aguja                                         |
|  | * BRONCE    3.5 rating                                  |
|  | Florencio Varela                                        |
|  | Confeccion                                              |
|  | (sin fotos de trabajos)                                 |
|  | [Ver perfil]                                            |
|  +---------------------------+                             |
+-----------------------------------------------------------+
```

### W5: Perfil publico del taller — `/perfil/[id]`

Pagina completa con galeria de trabajos.

```
+-----------------------------------------------------------+
|  < Volver al directorio                                    |
|                                                            |
|  Corte Sur SRL                              * ORO          |
|  Avellaneda, Buenos Aires · 4.8 · 15 trabajadores         |
|  [Contactar por WhatsApp]                                  |
|                                                            |
|  === Trabajos realizados ===                               |
|  +------+ +------+ +------+ +------+ +------+             |
|  |      | |      | |      | |      | |      |             |
|  | img  | | img  | | img  | | img  | | img  |             |
|  |  1   | |  2   | |  3   | |  4   | |  5   |             |
|  |      | |      | |      | |      | |      |             |
|  +------+ +------+ +------+ +------+ +------+             |
|  +------+ +------+ +------+                                |
|  | img  | | img  | | img  |    <-- click abre lightbox     |
|  |  6   | |  7   | |  8   |                                |
|  +------+ +------+ +------+                                |
|                                                            |
|  === Capacidades ===                                       |
|  Procesos: Corte · Confeccion · Estampado                  |
|  Prendas: Buzos · Remeras · Camperas                       |
|  Capacidad: 2000 prendas/mes                               |
|                                                            |
|  === Certificaciones ===                                   |
|  [check] Seguridad en el Taller (PDT-CERT-2026-000012)    |
|  [check] Costos y Presupuestos (PDT-CERT-2026-000013)     |
|                                                            |
|  === Instalaciones ===                  (futuro, fase 4)   |
|  +------+ +------+ +------+                                |
|  |taller| |maqui | |depo  |                                |
|  |      | |naria | |sito  |                                |
|  +------+ +------+ +------+                                |
+-----------------------------------------------------------+
```

### W6: Vista de la marca comparando cotizaciones — `/marca/pedidos/[id]`

La marca ve su pedido con todas las cotizaciones recibidas.

```
+-----------------------------------------------------------+
|  < Volver a mis pedidos                                    |
|                                                            |
|  Buzo oversize -- 500 unidades              PUBLICADO      |
|  Entrega: 15 mayo 2026                                     |
|                                                            |
|  +------+ +------+ +------+  <-- imagenes del pedido      |
|  | img  | | img  | | img  |                                |
|  +------+ +------+ +------+                                |
|                                                            |
|  === Cotizaciones recibidas (3) ===                        |
|                                                            |
|  +-------------------------------------------------------+ |
|  | Corte Sur SRL · * ORO · 4.8                            | |
|  | Precio: $2.000/u · Plazo: 30 dias · Confeccion        | |
|  | +----+ +----+ +----+                                   | |
|  | |img | |img | |img |  <-- fotos de trabajos similares  | |
|  | +----+ +----+ +----+                                   | |
|  | "Tenemos experiencia en buzos, adjunto muestras"       | |
|  | [Aceptar]  [Rechazar]                        ENVIADA   | |
|  +-------------------------------------------------------+ |
|                                                            |
|  +-------------------------------------------------------+ |
|  | Coop. Hilos del Sur · * PLATA · 4.2                    | |
|  | Precio: $1.800/u · Plazo: 45 dias · Confeccion        | |
|  | +----+ +----+                                          | |
|  | |img | |img |                                          | |
|  | +----+ +----+                                          | |
|  | "Podemos hacer el lote en 2 tandas de 250"            | |
|  | [Aceptar]  [Rechazar]                        ENVIADA   | |
|  +-------------------------------------------------------+ |
|                                                            |
|  +-------------------------------------------------------+ |
|  | Taller La Aguja · * BRONCE · 3.5                       | |
|  | Precio: $2.200/u · Plazo: 20 dias · Confeccion        | |
|  | (sin imagenes adjuntas)                                | |
|  | "Entrega rapida garantizada"                           | |
|  | [Aceptar]  [Rechazar]                        ENVIADA   | |
|  +-------------------------------------------------------+ |
+-----------------------------------------------------------+
```

### W7: Perfil del taller — vista propia con portfolio — `/taller/perfil`

Lo que ve el taller de su propio perfil, con opcion de editar.

```
+-----------------------------------------------------------+
|  Mi Perfil                              [Editar datos]     |
|                                                            |
|  Roberto Gimenez                                           |
|  Taller La Aguja · * BRONCE · Florencio Varela             |
|  Completitud: ======----  60%                              |
|                                                            |
|  === Mi Portfolio ===                    [+ Agregar fotos] |
|  +------+ +------+ +------+                                |
|  | img  | | img  | | img  |                                |
|  |  1   | |  2   | |  3   |                                |
|  | [x]  | | [x]  | | [x]  |  <-- boton eliminar           |
|  +------+ +------+ +------+                                |
|                                                            |
|  O si no tiene fotos:                                      |
|  +-----------------------------------------------+        |
|  |                                                |        |
|  |  Subi fotos de tus trabajos para que las       |        |
|  |  marcas vean lo que sabes hacer                |        |
|  |                                                |        |
|  |  [+ Agregar fotos]                             |        |
|  |                                                |        |
|  |  Los talleres con portfolio reciben 3x         |        |
|  |  mas contactos                                 |        |
|  +-----------------------------------------------+        |
|                                                            |
|  === Capacidades ===                                       |
|  Procesos: Confeccion                                      |
|  Prendas: Remeras · Buzos                                  |
|  Capacidad: 500 prendas/mes                                |
|                                                            |
|  [Completar perfil productivo]  <-- wizard de 14 pasos    |
+-----------------------------------------------------------+
```

### Tabla resumen: que imagen aparece donde

| Vista | Que imagen se muestra | Quien la sube |
|-------|----------------------|---------------|
| Marketplace (lista pedidos) | Foto del producto/diseno que la marca quiere fabricar | La marca |
| Detalle pedido (taller cotiza) | Galeria completa del pedido (diseno, molde, muestra) | La marca |
| Cotizacion del taller | Fotos de trabajos similares que hizo el taller | El taller |
| Comparar cotizaciones (marca) | Fotos del pedido + fotos adjuntas de cada taller | Ambos |
| Directorio (lista talleres) | Foto destacada del portfolio del taller | El taller |
| Perfil publico del taller | Galeria completa de trabajos + instalaciones | El taller |
| Perfil propio del taller | Galeria editable con drag/drop y eliminar | El taller |
| Admin (detalle pedido) | Todas las imagenes (pedido + cotizaciones) read-only | — |
| Admin (detalle taller) | Portfolio del taller read-only | — |

---

## Solucion propuesta

### Fase 1: Infraestructura de imagenes

**S-VIS-01: Crear bucket `imagenes` en Supabase Storage**
- Bucket publico para imagenes de portfolio y pedidos
- Politica: INSERT para usuarios autenticados, SELECT publico, DELETE solo owner o ADMIN
- Estructura de paths:
  - `talleres/{tallerId}/portfolio/{filename}` — fotos del taller
  - `talleres/{tallerId}/instalaciones/{filename}` — fotos del espacio
  - `pedidos/{pedidoId}/referencias/{filename}` — imagenes del pedido
  - `cotizaciones/{cotizacionId}/adjuntos/{filename}` — fotos en cotizaciones
- Formatos: JPG, PNG, WebP
- Tamaño maximo: 5MB por imagen
- Limite: 10 imagenes por portfolio, 5 por pedido, 3 por cotizacion

**S-VIS-02: Servicio de imagenes**
- Extender `storage.ts` para soportar multiples buckets
- Funcion `uploadImagen(bucket, path, file)` con validacion de tipo y tamaño
- Funcion `deleteImagen(bucket, path)`
- Generar URLs publicas via Supabase Storage public URL
- Opcional: resize/thumbnail via Supabase Image Transformation

### Fase 2: Portfolio del taller (W4, W5, W7)

**S-VIS-03: Paso de portfolio en wizard de perfil**
- Agregar paso 14 al wizard de `/taller/perfil/completar`: "Mostra tu trabajo"
- UI: grid de imagenes con drag & drop (reutilizar `file-upload.tsx`)
- Maximo 10 imagenes
- Cada imagen puede tener etiqueta opcional: tipo de prenda, proceso, año
- Guardar URLs en campo existente `portfolioFotos: String[]`
- **Referencia Alibaba:** el proveedor sube "Product Showcase" con categorias

**S-VIS-04: Galeria en perfil del taller — vista propia (W7)**
- En `/taller/perfil` agregar seccion "Mi Portfolio" con grid de imagenes
- Boton "Agregar fotos" que abre el uploader
- Posibilidad de reordenar (drag) y eliminar
- Preview con lightbox al hacer click
- Si no tiene fotos: CTA motivacional "Los talleres con portfolio reciben 3x mas contactos"

**S-VIS-05: Galeria en perfil publico y directorio (W4, W5)**
- En `/perfil/[id]` agregar seccion "Trabajos realizados" con grid de imagenes
- Solo se muestra si el taller tiene al menos 1 foto
- Lightbox para ver en tamaño completo
- En `/directorio` y `/marca/directorio`: la primera foto del portfolio como imagen destacada de la tarjeta
- Talleres sin portfolio muestran placeholder generico
- **Referencia Alibaba:** "Product Gallery" es la primera seccion del perfil de proveedor

**S-VIS-06: Galeria en detalle de taller (admin)**
- En `/admin/talleres/[id]` mostrar las fotos del portfolio (read-only)
- El admin puede ver pero no editar las fotos del taller

### Fase 3: Imagenes en pedidos y cotizaciones (W1, W2, W3, W6)

**S-VIS-07: Campo de imagenes en creacion de pedido (W3)**
- En `/marca/pedidos/nuevo` agregar seccion "Imagenes de referencia"
- UI: uploader de hasta 5 imagenes (reutilizar `file-upload.tsx`)
- Eliminar campo `montoTotal` del formulario — el precio lo define la cotizacion
- Agregar campo `imagenes: String[]` al modelo Pedido en schema Prisma

**S-VIS-08: Mostrar imagenes en detalle de pedido (W1, W2)**
- En marketplace `/taller/pedidos/disponibles`: primera imagen como thumbnail en la tarjeta
- En detalle `/taller/pedidos/disponibles/[id]`: galeria completa con lightbox
- En `/marca/pedidos/[id]`: imagenes del pedido arriba de las cotizaciones
- En `/admin/pedidos/[id]` (vista admin read-only): todas las imagenes

**S-VIS-09: Imagenes en cotizaciones (W2, W6)**
- Cuando el taller cotiza, puede adjuntar hasta 3 imagenes de trabajos similares
- Agregar campo `imagenes: String[]` al modelo Cotizacion en schema Prisma
- En la vista de la marca comparando cotizaciones (W6): fotos del taller debajo de cada oferta
- **Referencia Alibaba:** el proveedor adjunta fotos de productos similares en su oferta

### Fase 4: Fotos de instalaciones (mejora futura)

**S-VIS-10: Fotos del espacio de trabajo**
- Seccion separada del portfolio: "Mis instalaciones"
- Fotos de: taller, maquinaria, area de produccion, deposito
- Visible en perfil publico y para auditores
- Puede ser requisito para nivel ORO (verificacion visual)
- **Referencia Better Work:** las fotos de instalaciones son parte de la evaluacion de compliance

---

## Cambios de schema necesarios

```prisma
model Pedido {
  // ... campos existentes
  // ELIMINAR: montoTotal    Float?   -- el precio lo define la cotizacion
  imagenes          String[]    // URLs de imagenes de referencia (max 5)
  descripcion       String?     // Detalle tecnico (tela, talles, terminaciones)
  procesosRequeridos String[]   // Lista de procesos necesarios
}

model Cotizacion {
  // ... campos existentes
  imagenes          String[]    // URLs de imagenes adjuntas (max 3)
  mensaje           String?     // Comentarios del taller
}

// Taller ya tiene:
// portfolioFotos    String[]   // Ya existe, sin usar
```

---

## Priorizacion

| Fase | Items | Wireframes | Esfuerzo | Dependencias |
|------|-------|------------|----------|--------------|
| Fase 1: Infra | S-VIS-01, S-VIS-02 | — | Bajo | Crear bucket en Supabase |
| Fase 2: Portfolio | S-VIS-03 a S-VIS-06 | W4, W5, W7 | Medio | Fase 1 |
| Fase 3: Pedidos | S-VIS-07 a S-VIS-09 | W1, W2, W3, W6 | Medio | Fase 1 + migration schema |
| Fase 4: Instalaciones | S-VIS-10 | W5 (seccion) | Bajo | Fase 2 |

**Recomendacion:** Fase 1 y 2 primero — un taller con portfolio tiene mas chances de recibir cotizaciones. Fase 3 despues — las imagenes en pedidos mejoran la calidad de las cotizaciones.

---

## Criterios de aceptacion globales

- [ ] Bucket `imagenes` creado en Supabase con politicas correctas
- [ ] Taller puede subir hasta 10 fotos de portfolio desde el wizard o perfil
- [ ] Portfolio visible en perfil publico (`/perfil/[id]`) y en admin
- [ ] Foto destacada del portfolio aparece en tarjetas del directorio
- [ ] Taller sin portfolio muestra placeholder generico
- [ ] Marca puede subir hasta 5 imagenes de referencia al crear pedido
- [ ] Campo montoTotal eliminado del formulario de pedido
- [ ] Imagenes del pedido visibles en marketplace y detalle
- [ ] Taller puede adjuntar hasta 3 fotos en su cotizacion
- [ ] Marca ve fotos del taller al comparar cotizaciones
- [ ] Imagenes se muestran con lightbox en todas las vistas
- [ ] Imagenes validadas: solo JPG/PNG/WebP, max 5MB cada una
- [ ] Las imagenes no bloquean la carga de la pagina (lazy loading)
