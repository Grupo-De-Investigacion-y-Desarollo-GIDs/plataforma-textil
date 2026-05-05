# QA: Mejoras UX agrupadas (UX-01 a UX-04)

**Spec:** `v3-ux-mejoras.md`
**Commit de implementacion:** 8703481 (feat: UX mejoras)
**URL de prueba:** https://plataforma-textil-dev.vercel.app
**Fecha:** 2026-05-05
**Auditor(es):** Sergio (tecnico) + sociologo
**Incluye Eje 6 de validacion de dominio:** si (parcial)
**Perfiles aplicables:** sociologo

---

## Contexto institucional

V2 funciona pero tiene fricciones de UX que el QA y los companeros interdisciplinarios identificaron durante la validacion. No son bugs criticos — son cosas que sumadas hacen que la plataforma se sienta menos profesional: estados de carga inconsistentes, pantallas vacias sin guia, mensajes de error sin contexto, y falta de breadcrumbs para orientarse. Para V3 con OIT estas mejoras suman al "feel" institucional de la plataforma — la diferencia entre "esto parece un proyecto academico" y "esto esta listo para produccion" muchas veces esta en estos detalles.

---

## Objetivo de este QA

Verificar que los 4 ejes de mejora UX estan implementados correctamente: componentes de carga con Suspense (UX-01), estados vacios con guia contextual (UX-02), toasts mejorados reemplazando alert() nativos (UX-03), y breadcrumbs de navegacion consistentes (UX-04). Verificar retrocompatibilidad con los 14 call sites existentes de toast y que no se rompe ninguna pagina existente.

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

> **Nota:** Los items marcados **DEV** los verifica Gerardo desde el codigo o la terminal — no son verificables desde el browser. El auditor solo verifica los items marcados **QA**.

### UX-01 — Estados de carga consistentes

| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 1 | Componente Loading con 3 variantes (spinner, fullPage, inline) | DEV | ok — Gerardo 5/5 | # |
| 2 | Componentes Skeleton, SkeletonCard, SkeletonTable | DEV | ok — Gerardo 5/5 | # |
| 3 | Suspense con fallback en taller/pedidos/disponibles | QA | | # |
| 4 | Suspense con fallback en taller/pedidos | QA | | # |
| 5 | Suspense con fallback en admin/auditorias | QA | | # |
| 6 | Suspense con fallback en marca/pedidos | QA | | # |
| 7 | admin/dashboard NO tocado (excepcion client component) | DEV | ok — Gerardo 5/5 | # |
| 8 | estado/page NO tocado (excluido por complejidad) | DEV | ok — Gerardo 5/5 | # |

### UX-02 — Estados vacios con guia

| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 9 | Componente EmptyState reutilizable | DEV | ok — Gerardo 5/5 | # |
| 10 | EmptyState en taller/pedidos/disponibles | QA | | # |
| 11 | EmptyState en taller/pedidos | QA | | # |
| 12 | EmptyState en marca/pedidos | QA | | # |
| 13 | EmptyState en marca/pedidos/[id] (cotizaciones) | QA | | # |
| 14 | EmptyState en admin/notificaciones | QA | | # |
| 15 | EmptyState en admin/talleres | QA | | # |
| 16 | EmptyState en cuenta/notificaciones | QA | | # |

### UX-03 — Mensajes de error contextuales

| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 17 | Toast con variantes warning/info | DEV | ok — Gerardo 5/5 | # |
| 18 | Toast con description y action button | DEV | ok — Gerardo 5/5 | # |
| 19 | Firma retrocompatible (14 call sites existentes) | DEV | ok — Gerardo 5/5 | # |
| 20 | Max 3 toasts visibles | DEV | ok — Gerardo 5/5 | # |
| 21 | alert() migrado en completar/page.tsx | QA | | # |
| 22 | alert() migrado en contactar-taller.tsx | QA | | # |
| 23 | alert() migrado en publicar-pedido.tsx (2 alerts) | QA | | # |
| 24 | Mensajes especificos por codigo de error en aceptar-cotizacion | QA | | # |
| 25 | Mensajes especificos en rechazar-cotizacion | QA | | # |
| 26 | Mensajes especificos en cotizar-form (409 CONFLICT) | QA | | # |
| 27 | Toast de exito al publicar pedido | QA | | # |
| 28 | Toast de exito al aceptar cotizacion | QA | | # |
| 29 | Toast de exito al enviar cotizacion | QA | | # |

### UX-04 — Breadcrumbs y navegacion

| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 30 | Componente Breadcrumbs reutilizable | DEV | ok — Gerardo 5/5 | # |
| 31 | Breadcrumbs mobile responsive (solo padre en mobile) | QA | | # |
| 32 | Breadcrumbs en admin/talleres/[id] | QA | | # |
| 33 | Breadcrumbs en admin/marcas/[id] | QA | | # |
| 34 | Breadcrumbs en marca/pedidos/[id] | QA | | # |
| 35 | Breadcrumbs en taller/pedidos/disponibles/[id] | QA | | # |
| 36 | Breadcrumbs en taller/pedidos/[id] | QA | | # |
| 37 | Breadcrumbs en admin/auditorias/[id] | QA | | # |
| 38 | Breadcrumbs en estado/talleres/[id] | QA | | # |
| 39 | ArrowLeft/Volver eliminado de todas las paginas con breadcrumbs | DEV | ok — Gerardo 5/5 | # |

### General

| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 40 | Build sin errores TypeScript | DEV | ok — Gerardo 5/5 | # |
| 41 | Suite Vitest completa (276 tests) | DEV | ok — Gerardo 5/5 | # |

---

## Eje 2 — Navegabilidad

### Paso 1 — Verificar breadcrumbs como MARCA

- **Rol:** MARCA (martin.echevarria@pdt.org.ar / pdt2026)
- **URL de inicio:** `/marca`
- **Verificador:** QA
- **Accion:** Hacer login como MARCA. Navegar a /marca/pedidos. Hacer click en un pedido para ir a /marca/pedidos/[id]. Verificar que los breadcrumbs aparecen arriba mostrando la ruta completa.
- **Esperado:** Breadcrumbs visibles con formato "Pedidos > [nombre del pedido]". Click en "Pedidos" navega de vuelta a /marca/pedidos. No hay boton ArrowLeft/Volver.
- **Resultado:** [ ]
- **Notas:**

### Paso 2 — Verificar breadcrumbs y empty state como TALLER

- **Rol:** TALLER Bronce (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/taller`
- **Verificador:** QA
- **Accion:** Hacer login como TALLER. Navegar a /taller/pedidos/disponibles. Si no hay pedidos disponibles, verificar el EmptyState. Si hay pedidos, hacer click en uno y verificar breadcrumbs en la pagina de detalle.
- **Esperado:** Si no hay pedidos: EmptyState con icono, mensaje explicativo y CTA contextual. Si hay pedidos: breadcrumbs en detalle con formato "Pedidos disponibles > [nombre]". No hay boton ArrowLeft/Volver.
- **Resultado:** [ ]
- **Notas:**

### Paso 3 — Verificar toast de exito al enviar cotizacion

- **Rol:** TALLER Plata (graciela.sosa@pdt.org.ar / pdt2026)
- **URL de inicio:** `/taller`
- **Verificador:** QA
- **Accion:** Hacer login como TALLER. Navegar a /taller/pedidos/disponibles. Seleccionar un pedido y enviar una cotizacion (completar el formulario y confirmar).
- **Esperado:** Aparece un toast de exito (no un alert() nativo del browser) confirmando que la cotizacion fue enviada. El toast desaparece automaticamente despues de unos segundos.
- **Resultado:** [ ]
- **Notas:**

### Paso 4 — Verificar toast al publicar pedido (no alert)

- **Rol:** MARCA (martin.echevarria@pdt.org.ar / pdt2026)
- **URL de inicio:** `/marca`
- **Verificador:** QA
- **Accion:** Hacer login como MARCA. Crear y publicar un nuevo pedido (completar formulario y confirmar publicacion).
- **Esperado:** Aparece un toast de exito (no un alert() nativo del browser) confirmando que el pedido fue publicado. No debe aparecer ningun window.alert().
- **Resultado:** [ ]
- **Notas:**

### Paso 5 — Verificar Suspense loading en admin/auditorias

- **Rol:** ADMIN (lucia.fernandez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/admin`
- **Verificador:** QA
- **Accion:** Hacer login como ADMIN. Navegar a /admin/auditorias. Si la pagina tarda en cargar (probar con throttling en DevTools > Network > Slow 3G), verificar que aparece un skeleton o spinner mientras carga.
- **Esperado:** Se ve un Loading/Skeleton mientras los datos se cargan, no una pagina en blanco ni un salto abrupto. Luego aparece el contenido normalmente.
- **Resultado:** [ ]
- **Notas:**

---

## Eje 3 — Casos borde

| # | Caso | Accion | Esperado | Verificador | Resultado |
|---|------|--------|----------|-------------|-----------|
| 1 | Loading rapido (<200ms) - no flicker | Navegar a una pagina con Suspense con buena conexion | No hay flicker perceptible del skeleton/spinner. La pagina carga directamente o muestra loading por un instante sin parpadeo molesto | QA | |
| 2 | Empty state durante loading | Navegar a un listado vacio con throttling (Slow 3G) | Se ve el Loading/Skeleton primero, y cuando termina de cargar se muestra el EmptyState. No se muestra EmptyState durante la carga | QA | |
| 3 | 4+ toasts simultaneos | Provocar 4 o mas acciones que generen toast rapidamente (ej: publicar, cotizar, etc. en sucesion rapida) | Solo 3 toasts visibles a la vez, los mas viejos se descartan automaticamente | DEV | ok — Gerardo 5/5 |
| 4 | Breadcrumbs con labels largos | Navegar a una pagina de detalle cuyo titulo tenga mas de 30 caracteres | El label del breadcrumb se trunca a 30 caracteres con "..." sin romper el layout | QA | |
| 5 | Mobile - breadcrumbs solo padre | Abrir una pagina con breadcrumbs en viewport mobile (< 640px) | Solo se muestra el link al nivel padre (ej: "< Pedidos"), no la ruta completa | QA | |

---

## Eje 4 — Performance

| Verificacion | Metodo | Verificador | Resultado |
|-------------|--------|-------------|-----------|
| Pagina carga en menos de 3 segundos | DevTools > Network > recargar | QA | |
| Sin errores en consola del browser | DevTools > Console > revisar | QA | |
| Funciona en movil (responsive) | DevTools > Toggle device toolbar | QA | |
| Loading skeleton visible mientras carga | Recargar pagina con network throttling (Slow 3G) | QA | |

---

## Eje 5 — Consistencia visual

| Verificacion | Resultado | Notas |
|-------------|-----------|-------|
| Tipografias consistentes (Overpass para titulos) | | |
| Colores del design system (brand-blue, brand-red) | | |
| Estados vacios tienen mensaje descriptivo e icono | | |
| Textos en espanol argentino (vos/tenes) | | |
| Toasts tienen iconos y colores consistentes por variante | | |
| Breadcrumbs alineados y con separadores claros | | |

---

## Eje 6 — Validacion de dominio (perfiles interdisciplinarios)

> Spec puramente tecnico/UX. Solo aplica el perfil de sociologo por los aspectos de lenguaje y accesibilidad de los componentes orientados al usuario.

### Politologo — Relacion con el Estado

No aplica (spec puramente tecnico/UX).

### Economista — Incentivos y metricas

No aplica (spec puramente tecnico/UX).

### Sociologo — Lenguaje y accesibilidad

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | Los mensajes de empty state son comprensibles para usuarios de baja alfabetizacion digital? | | |
| 2 | Los toasts son percibidos como ayudas o como interrupciones? | | |
| 3 | Los breadcrumbs ayudan a la orientacion o son ruido visual? | | |

### Contador — Flujos fiscales y operativos

No aplica (spec puramente tecnico/UX).

---

## Resumen de issues abiertos

| Issue | Tipo | Descripcion | Perfil que lo encontro | Prioridad |
|-------|------|-------------|------------------------|-----------|

---

## Notas de los auditores

**Sergio (tecnico):**
[observaciones tecnicas sobre implementacion, seguridad, performance]

**Perfiles interdisciplinarios:**
[observaciones sobre lenguaje, accesibilidad, percepcion de los usuarios]

---

## Checklist de cierre

- [ ] Todos los criterios de aceptacion del spec verificados
- [ ] Casos borde probados
- [ ] Performance revisada en desktop y movil
- [ ] Eje 6 completado por cada perfil aplicable
- [ ] Issues abiertos en GitHub con labels correctos
- [ ] Resultado global definido
- [ ] Documento commiteado a develop
