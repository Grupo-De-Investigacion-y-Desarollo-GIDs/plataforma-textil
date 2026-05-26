# G-19: Vitrina de demanda para el taller

## Contexto

El botón "Explorar marcas" en el dashboard del taller apuntaba a `/directorio` (directorio de talleres), lo cual era incorrecto. La vista correcta es `/taller/pedidos/disponibles` — que muestra pedidos publicados por marcas que buscan talleres.

La vista existe y funciona, pero se presenta como lista plana poco atractiva. Se transforma en una "vitrina de demanda" tipo marketplace para la demo.

**Decisión de producto**: la vitrina es visible para TODOS los talleres. El gating es solo en la acción de cotizar (ya implementado). Los talleres no formalizados ven la demanda como incentivo a formalizarse.

## Qué construir

### 1. Redirigir botón del dashboard
- `src/app/(taller)/taller/page.tsx` línea ~347
- `href="/directorio"` → `href="/taller/pedidos/disponibles"`
- Label: "Explorar marcas" → "Ver qué buscan las marcas"
- Subtítulo "Conocé quién busca talleres" se mantiene

### 2. Presentación tipo vitrina
- `src/app/(taller)/taller/pedidos/disponibles/page.tsx`
- Lista vertical → grilla: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`
- Cards compactas: imagen arriba (aspect-[4/3]), tipo de prenda prominente, presupuesto destacado (verde), marca + ubicación, cantidad, fecha
- Placeholder visual para pedidos sin imagen: div con ícono Package + fondo brand-bg-light
- Tokens del design system (rounded-card, shadow-card, font-overpass, font-serif)
- Botón "Ver y cotizar" / "Ver detalle" según verificación (existente, mantener)

### 3. Incentivo de formalización reforzado
- Banner amber actual → card con:
  - Ícono Shield o FileCheck
  - Título: "Verificá tu CUIT para cotizar estos pedidos"
  - Texto: "Podés ver toda la demanda disponible. Para enviar cotizaciones, completá tu formalización."
  - CTA azul: "Ir a Formalización" → `/taller/formalizacion`
- Tono no estigmatizante (lenguaje de acompañamiento, refs master 3.7)

### 4. Filtrar pedidos E2E
- En la query Prisma, agregar: `NOT: { tipoPrenda: { startsWith: 'E2E-Test' } }`
- No borrar registros (los tests E2E los necesitan)

### 5. Imágenes seed
- Subir buzo.png, remera.png, camisa.png a Supabase Storage (bucket `imagenes`, carpeta `pedidos/`)
- Actualizar campo `imagenes` de los 3 pedidos publicados reales en la base de preview
- Actualizar `prisma/seed.ts` para incluir URLs en futuros seeds

## Datos

No hay cambios de schema. El campo `imagenes String[]` en el modelo Pedido ya existe y soporta múltiples URLs.

## Prescripciones técnicas

- Server component (ya lo es), sin cambiar a client
- Prisma query existente + filtro NOT para E2E
- Grid responsive con Tailwind
- Placeholder: div con ícono de lucide-react (Package)
- Imágenes con `loading="lazy"` y `object-cover`
- No agregar filtros ni búsqueda (eso es bloque H, post-demo)

## Casos borde

- Pedido sin imagen → placeholder visual (no se rompe)
- Pedido sin presupuesto → no mostrar línea de precio
- Pedido sin fecha → no mostrar fecha
- 0 pedidos disponibles → EmptyState existente (sin cambios)
- Taller sin CUIT verificado → banner reforzado + botones "Ver detalle" (existente)

## Criterio de aceptación

1. Botón del dashboard lleva a `/taller/pedidos/disponibles`
2. La vista muestra grilla de cards (no lista)
3. Los 3 pedidos reales muestran su imagen
4. No aparecen pedidos E2E-Test en la vista
5. Taller no-verificado ve banner de incentivo reforzado
6. Taller verificado ve botones "Ver y cotizar"
7. Build pasa sin errores

## Alcance

- **Demo (este PR)**: presentación + imágenes + botón + filtro E2E
- **Post-demo (bloque H)**: filtros por categoría/ubicación/presupuesto, búsqueda, ordenamiento, badges urgencia
