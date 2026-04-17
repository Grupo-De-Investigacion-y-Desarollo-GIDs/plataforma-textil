# QA: Actividad contextual en pedidos — timeline por entidad

**Spec:** `v2-actividad-contextual-pedidos.md`
**Commit de implementación:** `d08bb0a`
**URL de prueba:** https://plataforma-textil.vercel.app
**Fecha:** 2026-04-17
**Auditor:** Sergio

---

## Resultado global

- [ ] ✅ Aprobado — todo funciona
- [ ] 🔧 Aprobado con fixes — funciona pero hay bugs menores
- [ ] ❌ Rechazado — falta funcionalidad o hay bugs bloqueantes

**Decisión:** [ cerrar v2 / fix inmediato / abrir ítem v3 ]
**Issues abiertos:** # (links a GitHub)

---

## Eje 1 — Funcionalidad

Verificar que cada criterio de aceptación del spec está implementado.

> **Nota:** Los ítems marcados **DEV** los verifica Gerardo desde el código o la terminal — no son verificables desde el browser. El auditor solo verifica los ítems marcados **QA**.

| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 1 | Tab "Notificaciones del sistema" eliminado de `/admin/notificaciones` | QA | | |
| 2 | Nota al pie en `/admin/notificaciones` con link a `/admin/logs` | QA | | |
| 3 | Componente `ActivityTimeline` creado y reutilizable | DEV | | |
| 4 | Marca ve sección "Actividad del pedido" en `/marca/pedidos/[id]` | QA | | |
| 5 | Taller ve sección "Actividad de tu orden" en `/taller/pedidos/[id]` | QA | | |
| 6 | Labels en español argentino según tabla del spec | QA | | |
| 7 | Sección no aparece si no hay actividad registrada | QA | | |
| 8 | Build sin errores de TypeScript | DEV | | |

---

## Eje 2 — Navegabilidad

Pasos de navegación a seguir en orden. Cada paso es una acción concreta.

### Paso 1 — ADMIN verifica que el tab "Sistema" fue eliminado

- **Rol:** ADMIN (`lucia.fernandez@pdt.org.ar` / `pdt2026`)
- **URL de inicio:** `/admin/notificaciones`
- **Acción:** Verificar que la página NO muestra tabs. Solo se ve el listado de "Comunicaciones" y al pie un link "Logs del sistema".
- **Esperado:** No hay tab "Notificaciones del sistema". El título dice "Comunicaciones". Al pie hay un link a `/admin/logs`.
- **Resultado:**
- **Notas:**

### Paso 2 — ADMIN hace clic en el link "Logs del sistema"

- **Rol:** ADMIN
- **URL de inicio:** `/admin/notificaciones`
- **Acción:** Hacer clic en el link "Logs del sistema" al pie de la página.
- **Esperado:** Navega a `/admin/logs` y muestra la tabla de logs del sistema.
- **Resultado:**
- **Notas:**

### Paso 3 — MARCA publica un pedido para generar actividad

- **Rol:** MARCA (`martin.echevarria@pdt.org.ar` / `pdt2026`)
- **URL de inicio:** `/marca/pedidos`
- **Acción:** Crear un pedido nuevo (tipo: Remera, cantidad: 100) y publicarlo desde su detalle.
- **Esperado:** El pedido pasa a estado "Publicado".
- **Resultado:**
- **Notas:**

### Paso 4 — MARCA verifica sección "Actividad del pedido"

- **Rol:** MARCA
- **URL de inicio:** `/marca/pedidos/[id del pedido creado]`
- **Acción:** Scrollear hasta el final de la página del pedido recién publicado.
- **Esperado:** Se ve sección "Actividad del pedido" con al menos un evento "Pedido publicado — en busqueda de taller" con fecha relativa.
- **Resultado:**
- **Notas:**

### Paso 5 — TALLER envía cotización al pedido

- **Rol:** TALLER Oro (`carlos.mendoza@pdt.org.ar` / `pdt2026`)
- **URL de inicio:** `/taller/pedidos/disponibles`
- **Acción:** Buscar el pedido publicado en el paso 3 y enviar una cotización (proceso: Confección, precio: 5000, plazo: 15 días).
- **Esperado:** Cotización enviada correctamente.
- **Resultado:**
- **Notas:**

### Paso 6 — MARCA acepta la cotización

- **Rol:** MARCA (`martin.echevarria@pdt.org.ar` / `pdt2026`)
- **URL de inicio:** `/marca/pedidos/[id del pedido]`
- **Acción:** Aceptar la cotización del taller.
- **Esperado:** Cotización aceptada, orden de manufactura creada, pedido pasa a "En ejecucion".
- **Resultado:**
- **Notas:**

### Paso 7 — MARCA verifica actividad completa del pedido

- **Rol:** MARCA
- **URL de inicio:** `/marca/pedidos/[id del pedido]`
- **Acción:** Scrollear hasta la sección "Actividad del pedido".
- **Esperado:** Se ven varios eventos en orden cronológico descendente: "Cotizacion aceptada...", "Cotizacion recibida de...", "Pedido publicado...". Cada uno con ícono de color y fecha relativa.
- **Resultado:**
- **Notas:**

### Paso 8 — TALLER verifica actividad de su orden

- **Rol:** TALLER Oro (`carlos.mendoza@pdt.org.ar` / `pdt2026`)
- **URL de inicio:** `/taller/pedidos`
- **Acción:** Ir al detalle de la orden recibida y scrollear hasta la sección "Actividad de tu orden".
- **Esperado:** Se ve la sección con eventos desde la perspectiva del taller: "Tu cotizacion fue aceptada", "Orden asignada a tu taller", etc.
- **Resultado:**
- **Notas:**

### Paso 9 — TALLER actualiza progreso y verifica actividad

- **Rol:** TALLER Oro
- **URL de inicio:** `/taller/pedidos/[id de la orden]`
- **Acción:** Actualizar el progreso a 50% y revisar la sección de actividad.
- **Esperado:** Aparece nuevo evento "Actualizaste el progreso a 50%" en la timeline.
- **Resultado:**
- **Notas:**

### Paso 10 — Verificar pedido sin actividad

- **Rol:** MARCA (`martin.echevarria@pdt.org.ar` / `pdt2026`)
- **URL de inicio:** `/marca/pedidos`
- **Acción:** Ir al detalle de un pedido en estado "Borrador" que no fue publicado.
- **Esperado:** La sección "Actividad del pedido" NO aparece (no hay actividad registrada).
- **Resultado:**
- **Notas:**

> Si el resultado no es ✅ → abrir widget en esa página → tipo [bug/falta] → describir qué pasó

---

## Eje 3 — Casos borde

Probar situaciones límite prescritas en el spec.

> **Nota:** Los ítems marcados **DEV** los verifica Gerardo desde el código o la terminal — no son verificables desde el browser. El auditor solo verifica los ítems marcados **QA**.
>
> **Si la acción requiere cambiar de usuario:** cerrá sesión, logueate como el rol indicado, y recién entonces ejecutá el comando. Un fetch ejecutado con el usuario equivocado puede dar falso positivo o falso negativo.

| # | Caso | Acción | Esperado | Verificador | Resultado |
|---|------|--------|----------|-------------|-----------|
| 1 | Pedido sin actividad en logs | Ir a un pedido en Borrador que nunca fue publicado | Sección "Actividad" no aparece | QA | |
| 2 | Log con `detalles` null | Consultar query con pedidoId que no existe en detalles | Query devuelve array vacío sin error | DEV | |
| 3 | Labels en español correcto | Revisar cada tipo de evento en la timeline | No hay texto en inglés, se usa español argentino | QA | |
| 4 | Fecha relativa correcta | Verificar que eventos recientes dicen "hace X min" | Formato relativo coherente (no fecha absoluta cruda) | QA | |
| 5 | Componente no crashea con detalles null | Crear log manual con detalles null en DB | La página no rompe, muestra label genérico | DEV | |
| 6 | Orden sin actividad registrada | Ir a una orden sin logs en LogActividad | Sección "Actividad" no aparece | QA | |

---

## Eje 4 — Performance

Verificar tiempos de carga y comportamiento bajo condiciones normales.

| Verificación | Método | Resultado |
|-------------|--------|-----------|
| Página carga en menos de 3 segundos | Abrir DevTools → Network → recargar | |
| Imágenes no bloquean el contenido | Scroll mientras carga | |
| Sin errores en consola del browser | DevTools → Console → revisar | |
| Funciona en móvil (responsive) | DevTools → Toggle device toolbar | |

---

## Eje 5 — Consistencia visual

Verificar que el diseño es coherente con el resto de la plataforma.

| Verificación | Resultado | Notas |
|-------------|-----------|-------|
| Tipografías consistentes (Overpass para títulos) | | |
| Colores del design system (brand-blue, brand-red) | | |
| Bordes y radios consistentes (rounded-xl) | | |
| Estados vacíos tienen mensaje descriptivo | | |
| Textos en español argentino (vos/tenés) | | |
| Sin texto en inglés visible al usuario | | |

---

## Resumen de issues abiertos

| Issue | Tipo | Descripción | Prioridad sugerida |
|-------|------|-------------|-------------------|
| — | — | — | — |

---

## Notas del auditor

[Observaciones generales, sugerencias de UX, contexto adicional que no entra en los ejes anteriores]

---

## Checklist de cierre

- [ ] Todos los criterios de aceptación del spec verificados
- [ ] Casos borde probados
- [ ] Performance revisada en desktop y móvil
- [ ] Issues abiertos en GitHub con labels correctos
- [ ] Resultado global definido
- [ ] Documento commiteado a develop
