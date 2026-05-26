# J-05: Soporte de imagen en colecciones (hallazgo A)

## Contexto

Hallazgo A del QA de Sergio: los cursos aparecen en el carrusel del landing con el placeholder "PDT" porque el modelo `Coleccion` no tiene campo de imagen. El landing hardcodea `imagen: null` al armar los items del carrusel.

## Que construir

### 1. Campo imagenUrl en modelo Coleccion

Archivo: `prisma/schema.prisma`, modelo `Coleccion` (~linea 607)

Agregar:
```prisma
imagenUrl    String?   // URL de imagen de portada del curso
```

Migracion: `npx prisma migrate dev --name agregar_imagen_coleccion`

### 2. Upload endpoint (patron novedades)

Crear: `src/app/api/colecciones/[id]/upload/route.ts`

Patron identico a `/api/contenido/novedades/upload/route.ts`:
- POST con FormData (`file`)
- Solo CONTENIDO o ADMIN
- Validar MIME (jpeg, png, webp) y size (5MB)
- Path en bucket: `colecciones/{coleccionId}/{timestamp}.{ext}`
- Usar `uploadFile(buffer, path, contentType, 'imagenes')` de `@/compartido/lib/storage`
- Retornar `{ url }`

### 3. Aceptar imagenUrl en PUT /api/colecciones/[id]

Archivo: `src/app/api/colecciones/[id]/route.ts`

Agregar `imagenUrl: body.imagenUrl` al data del update (linea 42-49).

### 4. Input de imagen en form de editar coleccion

Archivo: `src/app/(contenido)/contenido/colecciones/[id]/page.tsx`

Patron identico a `FormularioNovedad`:
- Estado: `imagenUrl` (string | null), `uploading` (boolean)
- `handleUpload(file)`: POST FormData a `/api/colecciones/${coleccionId}/upload`, guardar URL
- Cargar `imagenUrl` desde data en useEffect (ya carga datos de la coleccion)
- En el form, seccion "Imagen de portada" dentro del Card de Informacion Basica:
  - Si hay imagen: preview + boton "Quitar imagen"
  - Si no: input file + texto ayuda
  - Mientras sube: "Subiendo imagen..."
- Enviar `imagenUrl` en el body del PUT de handleSave

### 5. Usar imagen real en carrusel del landing

Archivo: `src/app/page.tsx` (~linea 46)

- Agregar `imagenUrl: true` al select de la query de colecciones
- Linea 65: cambiar `imagen: null` → `imagen: c.imagenUrl`
- El CarruselNovedades ya maneja `imagen: null` como fallback al placeholder PDT

## Datos

- Schema: campo `imagenUrl String?` en modelo Coleccion (migracion)
- Sin seed — colecciones existentes quedan con `imagenUrl: null` (placeholder)

## Prescripciones tecnicas

- Upload endpoint simple (como novedades), sin ConfiguracionUpload
- No usar FileUpload component — usar input file nativo (como novedades)
- No tocar la pagina de "nueva coleccion" — la imagen se sube en la edicion
- No cambiar el CarruselNovedades — ya soporta imagen null como placeholder
- `next.config.ts` ya tiene `*.supabase.co` en remotePatterns

## Casos borde

- Coleccion sin imagen → placeholder PDT en carrusel (sin cambios, ya funciona)
- Sofia sube imagen de 6MB → error "Archivo muy grande. Maximo 5MB."
- Sofia sube PDF → error "Tipo de archivo no permitido. Use JPEG, PNG o WebP."
- Bucket "imagenes" no existe → error 503 descriptivo
- Coleccion eliminada con imagen → imagen queda huerfana en storage (aceptable, no critico)

## Criterio de aceptacion

1. Campo `imagenUrl` existe en modelo Coleccion
2. Sofia puede subir imagen en el form de edicion de coleccion
3. La imagen aparece como preview en el form
4. Sofia puede quitar la imagen (vuelve a null)
5. Carrusel del landing muestra la imagen real si existe, placeholder si no
6. Build sin errores
