# Plan de implementación — PDT v4

Orden sugerido para Gerardo, dividido en **fases incrementales** que se pueden mergear de a una a `develop`. Cada fase es 1 PR.

**Branch base:** crear `feature/v4-visual-refresh` desde `develop`.

---

## Fase 1 — Tokens (1 PR · ~2 hs)

**Objetivo:** que toda la app herede paleta y tipografía nueva sin tocar componentes ni pantallas.

### Pasos

1. Bajar `Source Serif 4` y `Inter` como `.woff2` a `public/fonts/`
2. Reemplazar bloque `@theme inline` en `src/app/globals.css` (ver `02-tokens.md`)
3. Cambiar `body { color }` de `#1e2dbe` a `#0F0F1E`
4. `npm run build` y verificar sin errores
5. `npm run dev` y validar que páginas se renderean (cambia el color del body text + fuentes)

### Criterios de aceptación

- [ ] Build pasa sin errores
- [ ] Body text es gris oscuro, no azul brand
- [ ] H1 en páginas que lo tengan se ven en Source Serif 4
- [ ] El resto de la UI no se rompe visualmente

### Commit / PR

`feat(visual): tokens v4 (paleta extendida + tipografías Source Serif/Inter)`

---

## Fase 2 — Componentes UI base (1 PR · ~3 hs)

**Objetivo:** actualizar Button, Card, Badge, Input. Sin tocar pantallas todavía.

### Pasos

1. Refactorizar `src/compartido/componentes/ui/button.tsx` (agregar variantes `outline-dark`, `terra`)
2. Refactorizar `src/compartido/componentes/ui/card.tsx` (agregar prop `accent`)
3. Refactorizar `src/compartido/componentes/ui/badge.tsx` (variantes con pastel-bg)
4. Ajustar `src/compartido/componentes/ui/input.tsx` (focus ring + radius)

Detalle de código en `03-componentes.md`.

### Criterios de aceptación

- [ ] Todas las pantallas siguen funcionando (componentes son backwards-compatible)
- [ ] `Button` usado con `variant="primary"` se ve igual o mejor que antes
- [ ] `Card` con `accent="blue"` muestra barra azul superior
- [ ] `Badge variant="warning"` se ve con fondo pastel amarillo + texto oscuro

### Commit / PR

`feat(visual): refresh Button + Card + Badge + Input con paleta v4`

---

## Fase 3 — Componentes nuevos (1 PR · ~3 hs)

**Objetivo:** crear los componentes nuevos que el rediseño necesita.

### Pasos

1. Crear `src/compartido/componentes/ui/kpi-card.tsx`
2. Crear `src/compartido/componentes/ui/filter-pills.tsx`
3. Refactorizar `src/compartido/componentes/ui/empty-state.tsx` (usar nuevo patrón)
4. Crear `src/compartido/iconos/index.tsx` con los 12 iconos custom (extraer de `mockup/mockup-v6.html`)
5. Crear `src/compartido/iconos/logo-pdt.tsx` (decisión pendiente: PNG o SVG — `00-resumen.md` decisión #9)

### Criterios de aceptación

- [ ] `<KpiCard>` se renderiza con label, valor, ícono, delta
- [ ] `<FilterPills>` se renderiza activo/inactivo correctamente
- [ ] `<EmptyState>` con icon + title + description + action funciona
- [ ] Los 12 iconos custom se exportan e importan sin errores TS
- [ ] Tests unitarios mínimos para cada componente nuevo (Vitest)

### Commit / PR

`feat(visual): KpiCard + FilterPills + EmptyState + iconografía custom`

---

## Fase 4 — Modelo Prisma `Novedad` (1 PR · ~1 h)

**Objetivo:** agregar tabla `Novedad` para soportar el carrusel del landing.

### Schema sugerido

```prisma
enum TipoNovedad {
  NOTICIA
  CASO
  INDICADOR
}

model Novedad {
  id          String      @id @default(cuid())
  tipo        TipoNovedad
  titulo      String
  descripcion String      @db.Text
  imagenUrl   String?
  slug        String      @unique
  fecha       DateTime    @default(now())
  publicado   Boolean     @default(false)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([publicado, fecha])
}
```

### Pasos

1. Agregar modelo a `prisma/schema.prisma`
2. `npx prisma migrate dev --name add_novedad`
3. Agregar al seed (`prisma/seed.ts`) 2-3 novedades de ejemplo
4. Crear endpoint `GET /api/novedades?limit=4` que devuelve novedades publicadas ordenadas por fecha desc
5. Endpoint admin `POST /api/admin/novedades` para crear/editar (nice-to-have, puede esperar v4.1)

### Criterios de aceptación

- [ ] Migration aplicada sin errores
- [ ] Seed corrido genera 2-3 novedades de ejemplo
- [ ] `GET /api/novedades?limit=4` devuelve JSON con `{ id, tipo, titulo, slug, fecha, imagenUrl }`
- [ ] Solo novedades con `publicado = true` aparecen

### Commit / PR

`feat(novedad): modelo Prisma + endpoint público para carrusel landing`

---

## Fase 5 — Header app + Footer (1 PR · ~3 hs)

**Objetivo:** simplificar el header del app interno y agregar footer.

### Pasos

1. Crear `src/compartido/componentes/layout/footer.tsx`
2. Reescribir `src/compartido/componentes/layout/header.tsx` (variante app simplificada)
3. Renombrar tabs a "Mis X" en `tabsByRole`
4. Agregar `<Footer />` en cada layout que lo necesite (`(public)/layout.tsx`, `(auth)/layout.tsx`, `(taller)/layout.tsx`, `(marca)/layout.tsx`, `(estado)/layout.tsx`)
5. NO tocar `(admin)/layout.tsx`

Detalle en `04-header-y-layout.md`.

### Criterios de aceptación

- [ ] Header del app interno tiene 2 bandas (no 4)
- [ ] Banner amarillo "AMBIENTE DE PRUEBAS" reemplazado por pill chiquita en topbar
- [ ] Tabs renombrados a "Mis pedidos", "Mi formalización", "Mi perfil"
- [ ] Footer aparece en todas las páginas excepto admin
- [ ] Footer tiene año dinámico (`new Date().getFullYear()`)
- [ ] Footer tiene "OIT · UNTREF" como sello institucional
- [ ] Mobile sidebar sigue funcionando con el nuevo header

### Commit / PR

`feat(layout): simplificar header app + agregar footer institucional`

---

## Fase 6 — Header público + Landing nueva (1 PR · ~5 hs)

**Objetivo:** rehacer la landing pública con el rediseño completo.

### Pasos

1. Crear `src/compartido/componentes/layout/header-public.tsx`
2. Reescribir `src/app/(public)/page.tsx` siguiendo `mockup/mockup-v6.html` PANTALLA 1
3. Implementar el carrusel de novedades + cursos:
   - Server component que llama a `prisma.novedad.findMany({ where: { publicado: true }, take: 4 })` + `prisma.coleccion.findMany({ where: { publicado: true }, take: 4 })`
   - Client component opcional para navegación con flechas (puede ser solo CSS scroll-snap en v4)
4. Subir las imágenes de hero y cards a `public/images/landing/` (las que están en `mockup/assets/`)
5. Verificar política de privacidad real existe en `/privacidad`
6. Asegurar que `/terminos`, `/accesibilidad` y `/contacto` existen (si no, crear stubs simples)

### Criterios de aceptación

- [ ] Landing renderiza sin Estado (solo Talleres + Marcas como audiencias)
- [ ] Carrusel muestra novedades reales de la DB + cursos reales (`Coleccion` publicadas)
- [ ] Stats con fuente declarada ("Datos a abril 2026")
- [ ] CTAs "Soy taller" y "Soy marca" llevan a `/registro?rol=TALLER` y `/registro?rol=MARCA`
- [ ] Footer aparece al final
- [ ] Header público sticky funciona
- [ ] Responsive en mobile (375px) — al menos no se rompe; refinar después con feedback de usuarios

### Commit / PR

`feat(landing): rediseño v4 — header público + hero + cards actores + carrusel novedades`

---

## Fase 7 — Aplicar a dashboards (1 PR · ~6 hs)

**Objetivo:** aplicar el rediseño a Dashboard TALLER, MARCA, ESTADO.

### Pasos

1. Refactorizar `src/app/(taller)/taller/page.tsx` siguiendo `05-aplicacion-pantallas.md` sección 1
2. Refactorizar `src/app/(marca)/marca/page.tsx` siguiendo sección 2
3. Refactorizar `src/app/(estado)/estado/page.tsx` siguiendo sección 3 (cambios mínimos)
4. NO tocar `src/app/(admin)/admin/page.tsx` en esta fase

### Criterios de aceptación

- [ ] Dashboard TALLER tiene saludo "Hola, X" + badge nivel terracotta + card "Próxima acción"
- [ ] 4 KPIs con `<KpiCard>` (no 5)
- [ ] Pedidos sin códigos crípticos en H1 (nombres humanos)
- [ ] Dashboard MARCA tiene 4 KPIs + lista de pedidos recientes
- [ ] Dashboard ESTADO usa KpiCard sin cambiar la estructura

### Commit / PR

`feat(dashboards): aplicar rediseño v4 a TALLER, MARCA y ESTADO`

---

## Fase 8 — Listados (1 PR · ~4 hs)

**Objetivo:** aplicar `<FilterPills>` y `<EmptyState>` a todas las páginas de listado.

### Pasos

Aplicar el patrón de `05-aplicacion-pantallas.md` sección 5 a:
- `/taller/pedidos`
- `/taller/pedidos/disponibles`
- `/marca/pedidos`
- `/marca/directorio`
- `/estado/talleres`
- `/admin/talleres`, `/admin/usuarios`, `/admin/observaciones`, `/admin/auditorias`

### Criterios de aceptación

- [ ] Cada listado tiene breadcrumb arriba
- [ ] Header con pre-title terracotta + H1 serif + counts
- [ ] FilterPills reemplazan selects/forms de filtro
- [ ] EmptyState ilustrado cuando no hay resultados
- [ ] Tabla limpia con badges semánticos en columna estado

### Commit / PR

`feat(listados): aplicar FilterPills + EmptyState a páginas de listado`

---

## Fase 9 — Detalle pedido + Formalización (1 PR · ~4 hs)

**Objetivo:** refrescar las pantallas más críticas del flujo TALLER.

### Pasos

1. Refactorizar `src/app/(taller)/taller/pedidos/[id]/page.tsx` siguiendo sección 6 de `05-aplicacion-pantallas.md`
2. Refactorizar `src/app/(taller)/taller/formalizacion/page.tsx` siguiendo sección 7
3. Refactorizar `src/app/(marca)/marca/pedidos/[id]/page.tsx` con mismo patrón

### Criterios de aceptación

- [ ] Detalle de pedido tiene H1 con nombre humano (no código crudo)
- [ ] Formalización con cards individuales por documento, no una mega card
- [ ] CTAs "Aceptar/Rechazar orden" mantienen verde/rojo fuerte

### Commit / PR

`feat(taller): refresh detalle pedido + mi formalización`

---

## Fase 10 — Resto y limpieza (1 PR · ~3 hs)

**Objetivo:** terminar el resto de pantallas y limpiar código viejo.

### Pasos

1. Aplicar tokens y componentes nuevos al resto:
   - `/taller/perfil`, `/marca/perfil`
   - `/cuenta`, `/cuenta/notificaciones`
   - `/perfil/[id]` (perfil público)
   - `/login`, `/registro` (cambios mínimos)
   - `/ayuda`, `/terminos`, `/privacidad`
2. Eliminar componentes/clases huérfanos del v3 que ya no se usan
3. Verificar que `var(--brand-blue)` legacy sigue funcionando (compatibilidad)
4. Run `npm run lint` y arreglar warnings nuevos
5. Run E2E tests (`npm run test:e2e`) y arreglar selectores que cambiaron por refactor

### Criterios de aceptación

- [ ] Todas las páginas heredan paleta nueva
- [ ] Login y Registro mantienen funcionalidad
- [ ] E2E tests pasan
- [ ] Sin warnings de lint nuevos

### Commit / PR

`refactor(visual): aplicar v4 al resto de pantallas + cleanup`

---

## Fase 11 — Decisión logo final (1 PR · ~30 min)

Pendiente decisión Sergio (`00-resumen.md` #9). Cuando esté:

- Si elegimos PDT-círculo (PNG): subir `logo-pdt.png` a `public/`, ajustar `LogoPDT` component
- Si elegimos SVG custom: el componente ya está, solo hacer favicon SVG y `og:image`

### Commit / PR

`feat(brand): logo PDT v4 final`

---

## Total estimado

| Fase | Tiempo | Complejidad |
|---|---|---|
| 1. Tokens | 2 hs | 🟢 fácil |
| 2. Componentes base | 3 hs | 🟢 fácil |
| 3. Componentes nuevos | 3 hs | 🟡 media |
| 4. Modelo Novedad | 1 h | 🟢 fácil |
| 5. Header app + Footer | 3 hs | 🟡 media |
| 6. Header público + Landing | 5 hs | 🟠 alta |
| 7. Dashboards | 6 hs | 🟠 alta |
| 8. Listados | 4 hs | 🟡 media |
| 9. Detalle + Formalización | 4 hs | 🟡 media |
| 10. Resto y limpieza | 3 hs | 🟡 media |
| 11. Logo final | 0.5 h | 🟢 fácil |
| **TOTAL** | **~34.5 hs** | |

**Plan calendario sugerido:** 1 fase por día → ~2 semanas (10 días hábiles) con buffer.

---

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| E2E tests rompen por cambios de selectores | Actualizar tests en cada fase, no al final |
| Mobile se ve mal en pantallas concretas | Validar en cada fase con DevTools mobile |
| Carrusel no carga sin novedades en DB | Seed obligatorio en Fase 4 |
| Política de privacidad no existe / desactualizada | Coordinar con Sergio antes de Fase 6 |
| Logo OIT sin autorización formal | Coordinar con DCOMM antes de Fase 6 |
| Tokens rompen pantallas viejas (Admin) | Fase 10 chequea admin específicamente |

---

## Antes de mergear a develop

- [ ] Sergio revisa la pantalla en preview (Vercel branch deploy)
- [ ] E2E tests del flujo crítico pasan
- [ ] Lighthouse: contraste ≥ AA en pantallas clave
- [ ] Auditoría OIT compliance: política de privacidad al día, sin testimonios PII
