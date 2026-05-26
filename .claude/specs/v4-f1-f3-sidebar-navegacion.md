# v4-f1-f3 — Sidebar visible en desktop + solo accesos personales

## Contexto

F1 y F3 del informe de navegación de Sergio. Hoy la sidebar es un drawer oculto que se abre con hamburguesa, y contiene items de sección (Inicio, Pedidos, etc.) duplicados con los tabs del header. Sergio propone:

- **F1**: Que la sidebar sea visible fija en desktop (drawer en mobile)
- **F3**: Que la sidebar tenga SOLO accesos personales (Notificaciones, Mi cuenta + Ayuda/Cerrar sesión), eliminando la duplicación con los tabs del header

Modelo opción A (aprobado): header = secciones del rol (tabs), sidebar = accesos personales.

Riesgo: ALTO. Toca componentes compartidos por TALLER, MARCA, ESTADO y (public) logueado. ADMIN aislado (no se toca).

## Qué construir

### F1 — Sidebar visible en desktop
1. `SidebarContext` nuevo para compartir estado open/close entre Header y UserSidebar (que ahora viven separados en el DOM)
2. UserSidebar con CSS dual: mobile = drawer fixed (como hoy), desktop = static en flex flow (como ADMIN)
3. Header pierde hamburguesa en desktop (`lg:hidden`), avatar en desktop navega a `/cuenta`
4. Los 4 layouts (taller, marca, estado, public-logueado) adoptan patrón flex: Header → div.flex(Sidebar + main) → Footer

### F3 — Sidebar solo accesos personales
1. `menuItemsByRole` para TALLER/MARCA/ESTADO se reduce a: Notificaciones + Mi cuenta
2. Footer de sidebar (Ayuda + Cerrar sesión) se mantiene
3. Items de sección eliminados (ya están en `TABS_BY_ROLE` del header)

## Datos

Sin cambios de schema ni queries.

## Prescripciones técnicas

### Archivo nuevo: `src/compartido/componentes/layout/sidebar-context.tsx`
- Client component con `SidebarProvider` y hook `useSidebar()`
- Estado: `{ isOpen, open, close }`

### Modificar: `src/compartido/componentes/layout/header.tsx`
- Consumir `useSidebar()` en vez de `useState` local
- Eliminar render de `<UserSidebar>` (se mueve a layouts)
- Hamburguesa: `lg:hidden`
- Avatar click: mobile → `open()`, desktop → `router.push('/cuenta')`

### Modificar: `src/compartido/componentes/layout/user-sidebar.tsx`
- Consumir `useSidebar()` en vez de props `isOpen`/`onClose`
- CSS responsivo: `fixed ... -translate-x-full` en mobile, `lg:static lg:translate-x-0 lg:w-64 lg:border-r`
- Overlay: `lg:hidden`
- Body scroll lock: SOLO `isOpen && viewport < lg`
- Badge notificaciones: fetch on mount + fetch on open
- `menuItemsByRole`: solo items personales para los 3 roles operativos
- Botón cerrar (X): `lg:hidden`
- ESC handler: solo mobile

### Modificar: 4 layouts
- `src/app/(taller)/layout.tsx`
- `src/app/(marca)/layout.tsx`
- `src/app/(estado)/layout.tsx`
- `src/app/(public)/layout.tsx` (rama logueada)
- Envolver en `<SidebarProvider>`
- Estructura: Header → `<div flex flex-1>` → UserSidebar + main → Footer

### Modificar: `src/compartido/componentes/layout/index.ts`
- Agregar export de `SidebarProvider`

## Riesgos detectados y mitigaciones

| # | Riesgo | Mitigación |
|---|--------|------------|
| 1 | Body scroll lock en desktop bloquea pagina | Condicionar a `isOpen && !isDesktop` con matchMedia |
| 2 | Badge notificaciones no se carga en desktop (nunca isOpen=true) | Agregar fetch on mount |
| 3 | (public) logueado usa Header y necesita el mismo tratamiento | Incluir en los cambios |
| 4 | Tests e2e rompen: hamburguesa `lg:hidden` a 1280px | Actualizar 2 tests |

## Tests a ajustar

- `smoke.spec.ts:30` → verificar sidebar visible (`aside[aria-label="Menú principal"]`) en vez de hamburguesa
- `roles-estado.spec.ts:38-51` → sidebar visible sin click hamburguesa, contar 2 items en vez de 10

## Criterio de aceptación

- [ ] Desktop (lg+): sidebar visible a la izquierda con 2 items + footer, header con tabs arriba, main a la derecha
- [ ] Mobile (<lg): hamburguesa visible, sidebar como drawer con overlay
- [ ] TALLER, MARCA, ESTADO: los 3 roles funcionan con el nuevo layout
- [ ] (public) logueado: sidebar visible en desktop
- [ ] ADMIN: sin cambios
- [ ] Body scroll NO bloqueado en desktop
- [ ] Badge notificaciones carga en desktop
- [ ] Tests e2e pasan (2 actualizados)
- [ ] `npm run build` OK, `tsc --noEmit` OK
