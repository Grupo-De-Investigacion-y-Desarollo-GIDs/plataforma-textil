# REVIEW: UX Mejoras - Loading, Toasts, Empty States, Breadcrumbs

**Spec:** v3-ux-mejoras
**Fecha:** 2026-05-05
**Implemento:** Gerardo (Claude Code)

---

## Changelog

### Archivos nuevos
- `src/compartido/componentes/ui/loading.tsx` — Componente Loading complementario (3 variantes: spinner, fullPage, inline)
- `src/compartido/componentes/ui/skeleton.tsx` — Componentes Skeleton, SkeletonCard, SkeletonTable
- `src/compartido/componentes/ui/empty-state.tsx` — Componente EmptyState reutilizable
- `src/compartido/componentes/ui/breadcrumbs.tsx` — Componente Breadcrumbs con mobile responsive
- `src/__tests__/ux-mejoras.test.ts` — 17 tests Vitest
- `tests/e2e/ux-mejoras.spec.ts` — 4 tests Playwright
- `.claude/auditorias/QA_v3-ux-mejoras.md`
- `.claude/auditorias/REVIEW_v3-ux-mejoras.md`

### Archivos modificados
- `src/compartido/componentes/ui/toast.tsx` — Reescrito: +warning/info types, +description, +action button, max 3 toasts, firma retrocompatible
- `src/app/(taller)/taller/pedidos/disponibles/page.tsx` — Suspense + Breadcrumbs + EmptyState
- `src/app/(taller)/taller/pedidos/page.tsx` — Suspense + EmptyState
- `src/app/(admin)/admin/auditorias/page.tsx` — Suspense + EmptyState
- `src/app/(marca)/marca/pedidos/page.tsx` — Suspense + EmptyState
- `src/app/(taller)/taller/perfil/completar/page.tsx` — alert() migrado a toast
- `src/marca/componentes/contactar-taller.tsx` — alert() migrado a toast warning
- `src/marca/componentes/publicar-pedido.tsx` — 2 alert() migrados a toast + toast exito
- `src/marca/componentes/aceptar-cotizacion.tsx` — +toast exito, +error especifico CONFLICT
- `src/marca/componentes/rechazar-cotizacion.tsx` — +toast exito, +error especifico CONFLICT
- `src/marca/componentes/cancelar-pedido.tsx` — +toast exito
- `src/taller/componentes/cotizar-form.tsx` — +toast exito, +toast warning 409
- `src/app/(admin)/admin/notificaciones/page.tsx` — EmptyState
- `src/app/(admin)/admin/talleres/page.tsx` — EmptyState
- `src/app/(public)/cuenta/notificaciones/notificaciones-lista.tsx` — EmptyState
- 18 archivos: ArrowLeft/Volver reemplazado con Breadcrumbs (admin/talleres/[id], admin/marcas/[id], marca/pedidos/[id], taller/pedidos/disponibles/[id], taller/pedidos/[id], admin/auditorias/[id], estado/talleres/[id], marca/directorio/[id], perfil-marca/[id], taller/aprender/[id], admin/colecciones/[id], colecciones/[id]/videos, colecciones/nueva, integraciones/email, integraciones/llm, auth/olvide-contrasena, estado/demanda-insatisfecha, taller/pedidos/disponibles)

### No se tocaron (excluidos por decision)
- `src/app/(estado)/estado/page.tsx` — 15 queries en $transaction, Suspense excluido por complejidad (derivado a V4)
- `src/app/(admin)/admin/dashboard/page.tsx` — client component, Suspense no aplica
- `src/app/(auth)/registro/completar/page.tsx` — ArrowLeft es navegacion de wizard, no "Volver a..."
- `src/app/(taller)/taller/perfil/completar/page.tsx` — idem, wizard navigation

---

## Decisiones

1. **estado/page excluido de Suspense por complejidad.** La pagina usa `$transaction` con 15 queries. Hacer Suspense requiere romper la transaccion y extraer queries a child components. Derivado a V4 backlog.

2. **Toast reescrito completo, no parcheado.** La firma simple `(string, type?)` sigue funcionando para retrocompatibilidad con los 14 call sites existentes. La nueva firma soporta `{ title, description, type, action }`.

3. **EmptyState sin icono/emoji.** El spec originalmente incluia iconos, pero se decidio mantener el componente limpio con solo titulo + mensaje + CTA opcional. Consistente con el design system.

4. **Breadcrumbs mobile.** En viewport pequeno solo muestra un link al padre con chevron. En desktop muestra la cadena completa. Labels truncados a 30 chars con "...".

5. **Wizard navigation no reemplazada.** Los ArrowLeft en `perfil/completar` y `registro/completar` son navegacion intra-wizard (prev/next step), no "Volver a...". No se reemplazaron con Breadcrumbs.

6. **confirm() nativos fuera de scope.** Se detectaron 4 `confirm()` calls en el codebase (colecciones x2, cancelar-pedido, publicar-pedido). No estan en el scope de esta spec. Derivados a V4 backlog.

---

## Variables de entorno

Ninguna nueva.

---

## Tests

| Archivo | Tests | Resultado |
|---------|-------|-----------|
| `src/__tests__/ux-mejoras.test.ts` | 17 | PASS |
| `tests/e2e/ux-mejoras.spec.ts` | 4 | pendiente CI |
| Suite completa Vitest | 276 | PASS |

---

## Riesgos

- **Suspense en paginas con auth.** La extraccion de queries a child async components requiere re-evaluar `auth()` en el child. Esto duplica la llamada `auth()` en algunos casos. Aceptable para V3.
- **Toast max 3.** Si el usuario dispara muchas acciones rapidas, puede perder toasts. El timeout es de 5s (subido de 4s original).
- **Breadcrumbs truncation.** Labels > 30 chars se cortan con "..." sin tooltip. Aceptable para V3, se puede mejorar en V4.
