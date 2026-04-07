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

## Estado actual del codigo

| Componente | Existe? | Detalle |
|-----------|---------|---------|
| `portfolioFotos: String[]` en modelo Taller | Si | Campo en schema Prisma, nunca usado |
| `file-upload.tsx` (drag & drop) | Si | Componente generico reutilizable en `compartido/componentes/ui/` |
| `storage.ts` (uploadFile/deleteFile) | Si | Funciones para Supabase Storage, bucket `documentos` |
| Upload de validaciones | Si | Flujo completo: componente + API + storage (PDF/JPG/PNG/WebP, 5MB) |
| Bucket para imagenes | No | Solo existe bucket `documentos` para formalizacion |
| Campo imagenes en Pedido | No | Modelo Pedido no tiene campos de imagen |
| Galeria en perfil taller | No | Ni en `/taller/perfil` ni en `/perfil/[id]` publico |
| Imagenes en detalle de pedido | No | `/marca/pedidos/[id]` solo muestra texto |

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
- Formatos: JPG, PNG, WebP
- Tamaño maximo: 5MB por imagen
- Limite: 10 imagenes por portfolio, 5 por pedido

**S-VIS-02: Servicio de imagenes**
- Extender `storage.ts` para soportar multiples buckets
- Funcion `uploadImagen(bucket, path, file)` con validacion de tipo y tamaño
- Funcion `deleteImagen(bucket, path)`
- Generar URLs publicas via Supabase Storage public URL
- Opcional: resize/thumbnail via Supabase Image Transformation

### Fase 2: Portfolio del taller

**S-VIS-03: Paso de portfolio en wizard de perfil**
- Agregar paso 14 al wizard de `/taller/perfil/completar`: "Mostra tu trabajo"
- UI: grid de imagenes con drag & drop (reutilizar `file-upload.tsx`)
- Maximo 10 imagenes
- Cada imagen puede tener etiqueta opcional: tipo de prenda, proceso, año
- Guardar URLs en campo existente `portfolioFotos: String[]`
- **Referencia Alibaba:** el proveedor sube "Product Showcase" con categorias

**S-VIS-04: Galeria en perfil del taller (vista propia)**
- En `/taller/perfil` agregar seccion "Mi Portfolio" con grid de imagenes
- Boton "Agregar fotos" que abre el uploader
- Posibilidad de reordenar (drag) y eliminar
- Preview con lightbox al hacer click

**S-VIS-05: Galeria en perfil publico**
- En `/perfil/[id]` agregar seccion "Trabajos realizados" con grid de imagenes
- Solo se muestra si el taller tiene al menos 1 foto
- Lightbox para ver en tamaño completo
- **Referencia Alibaba:** "Product Gallery" es la primera seccion del perfil de proveedor
- **Referencia Faire:** grid masonry con fotos de productos destacados

**S-VIS-06: Galeria en detalle de taller (admin)**
- En `/admin/talleres/[id]` mostrar las fotos del portfolio (read-only)
- El admin puede ver pero no editar las fotos del taller

### Fase 3: Imagenes en pedidos

**S-VIS-07: Campo de imagenes en creacion de pedido**
- En `/marca/pedidos/nuevo` agregar seccion "Imagenes de referencia"
- UI: uploader de hasta 5 imagenes
- Campos opcionales por imagen: descripcion, tipo (diseño, molde, muestra, referencia)
- Agregar campo `imagenes: String[]` al modelo Pedido en schema Prisma
- **Referencia Alibaba:** el RFQ tiene campo "Attach Reference Images" con hasta 5 fotos

**S-VIS-08: Mostrar imagenes en detalle de pedido**
- En `/marca/pedidos/[id]` mostrar las imagenes de referencia en seccion destacada
- En `/taller/pedidos/disponibles/[id]` (donde el taller ve el pedido para cotizar) mostrar las imagenes
- En `/admin/pedidos/[id]` (vista admin read-only) mostrar las imagenes
- Lightbox para ver en tamaño completo

**S-VIS-09: Imagenes en vista de cotizacion**
- Cuando el taller cotiza, puede adjuntar imagenes de referencia (muestras propias, trabajos similares)
- Agregar campo `imagenes: String[]` al modelo Cotizacion en schema Prisma
- La marca ve estas imagenes al comparar cotizaciones
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
  imagenes          String[]    // URLs de imagenes de referencia (max 5)
}

model Cotizacion {
  // ... campos existentes  
  imagenes          String[]    // URLs de imagenes adjuntas (max 3)
}

// Taller ya tiene:
// portfolioFotos    String[]   // Ya existe, sin usar
```

---

## Priorizacion

| Fase | Items | Esfuerzo | Dependencias |
|------|-------|----------|--------------|
| Fase 1: Infra | S-VIS-01, S-VIS-02 | Bajo | Crear bucket en Supabase |
| Fase 2: Portfolio | S-VIS-03 a S-VIS-06 | Medio | Fase 1 |
| Fase 3: Pedidos | S-VIS-07 a S-VIS-09 | Medio | Fase 1 + migration schema |
| Fase 4: Instalaciones | S-VIS-10 | Bajo | Fase 2 |

**Recomendacion:** Fase 1 y 2 primero — un taller con portfolio tiene mas chances de recibir cotizaciones. Fase 3 despues — las imagenes en pedidos mejoran la calidad de las cotizaciones.

---

## Criterios de aceptacion globales

- [ ] Bucket `imagenes` creado en Supabase con politicas correctas
- [ ] Taller puede subir hasta 10 fotos de portfolio desde el wizard o perfil
- [ ] Portfolio visible en perfil publico (`/perfil/[id]`) y en admin
- [ ] Marca puede subir hasta 5 imagenes de referencia al crear pedido
- [ ] Taller ve las imagenes del pedido antes de cotizar
- [ ] Imagenes se muestran con lightbox en todas las vistas
- [ ] Imagenes validadas: solo JPG/PNG/WebP, max 5MB cada una
- [ ] Las imagenes no bloquean la carga de la pagina (lazy loading)
