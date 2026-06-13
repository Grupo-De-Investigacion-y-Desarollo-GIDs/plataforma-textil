# v4-f2 — Tabs internos en Pedidos del taller

## Contexto

F2 del informe de navegación de Sergio. Actualmente `/taller/pedidos` (recibidos) y `/taller/pedidos/disponibles` son páginas independientes conectadas por un botón y breadcrumbs, sin relación visual que indique que pertenecen a la misma sección. Sergio pide que sean tabs dentro de una misma sección.

Riesgo: BAJO. Autocontenido — solo toca el rol TALLER, no afecta componentes compartidos.

## Qué construir

1. **Layout con tabs** en `src/app/(taller)/taller/pedidos/layout.tsx`
   - Dos tabs: "Recibidos" (→ `/taller/pedidos`) y "Disponibles" (→ `/taller/pedidos/disponibles`)
   - Tab activo detectado por `usePathname()`
   - Los tabs **NO** se muestran en la vista de detalle (`/taller/pedidos/[id]` ni `/taller/pedidos/disponibles/[id]`)
   - Condición: si pathname matchea `/taller/pedidos/` seguido de algo que no sea exactamente `disponibles`, ocultar tabs

2. **Limpiar redundancias**
   - `page.tsx`: quitar el botón `<Link href="/taller/pedidos/disponibles">` con su badge
   - `disponibles/page.tsx`: quitar `<Breadcrumbs>` (los tabs cumplen esa función)

## Datos

Sin cambios de schema ni queries.

## Prescripciones técnicas

- `layout.tsx` es `'use client'` por `usePathname()`
- Usar tokens del design system: `font-overpass`, `text-brand-blue`, `border-brand-blue`
- No crear componente reutilizable de tabs — implementar inline en el layout
- Mantener `<main>` wrapping del layout padre (taller) intacto

## Casos borde

- `/taller/pedidos` → tabs visibles, "Recibidos" activo
- `/taller/pedidos/disponibles` → tabs visibles, "Disponibles" activo
- `/taller/pedidos/[uuid]` → tabs ocultos, detalle sin tabs
- `/taller/pedidos/disponibles/[uuid]` → tabs ocultos, detalle sin tabs

## Criterios de aceptación

- [ ] Layout con 2 tabs funcionales, highlight correcto
- [ ] Tabs ocultos en rutas de detalle
- [ ] Botón "Pedidos disponibles" eliminado de page.tsx
- [ ] Breadcrumbs eliminados de disponibles/page.tsx
- [ ] Build exitoso, tsc sin errores
- [ ] No hay redundancia visual entre tabs y encabezados

## Tests

- Navegación manual: verificar los 4 casos borde listados arriba
