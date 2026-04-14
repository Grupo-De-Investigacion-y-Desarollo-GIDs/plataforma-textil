# QA: Épica Flujo Comercial Unificado

**Spec:** `v2-epica-flujo-comercial-unificado.md`
**Commit de implementación:** `pendiente`
**URL de prueba:** https://plataforma-textil.vercel.app
**Fecha:** 2026-04-14
**Auditor:** Sergio

---

## Cómo trabajar con este documento

1. Abrí este archivo y la plataforma en paralelo
2. Seguí los pasos en orden — cada paso depende del anterior
3. Marcá cada resultado con ✅ (ok), 🐛 (bug menor) o ❌ (bloqueante)
4. Si el resultado no es ✅ → abrí el widget azul "Feedback" en esa página → tipo [bug/falta] → describí qué pasó
5. Quedate en la página donde encontraste el problema antes de abrir el widget (captura la URL automáticamente)
6. Al terminar, completá el resultado global y commiteá este archivo actualizado

**Regla de oro:** un issue por hallazgo, desde la página donde ocurre.

> **Nota:** si los hallazgos no aparecen en GitHub Issues, verificar que `GITHUB_TOKEN` y `GITHUB_REPO` están configurados en Vercel. Los hallazgos siempre quedan registrados en la DB aunque el token no esté configurado — se pueden ver en `/admin` desde `LogActividad`.

---

## Credenciales de prueba

| Rol | Email | Password | URL de entrada |
|-----|-------|----------|----------------|
| ADMIN | `lucia.fernandez@pdt.org.ar` | `pdt2026` | `/admin` |
| TALLER Bronce | `roberto.gimenez@pdt.org.ar` | `pdt2026` | `/taller` |
| TALLER Plata | `graciela.sosa@pdt.org.ar` | `pdt2026` | `/taller` |
| TALLER Oro | `carlos.mendoza@pdt.org.ar` | `pdt2026` | `/taller` |
| MARCA | `martin.echevarria@pdt.org.ar` | `pdt2026` | `/marca` |
| ESTADO | `anabelen.torres@pdt.org.ar` | `pdt2026` | `/estado` |

---

## Resultado global

- [ ] ✅ Aprobado — todo funciona
- [ ] 🔧 Aprobado con fixes — funciona pero hay bugs menores
- [ ] ❌ Rechazado — falta funcionalidad o hay bugs bloqueantes

**Decisión:** [ cerrar v2 / fix inmediato / abrir ítem v3 ]
**Issues abiertos:** #

---

## Eje 1 — Funcionalidad

Verificar que cada criterio de aceptación del spec está implementado.

| # | Criterio | Resultado | Issue |
|---|----------|-----------|-------|
| 1 | No existe el archivo `src/marca/componentes/asignar-taller.tsx` | | |
| 2 | No existe el botón "Asignar taller" en ninguna pantalla | | |
| 3 | `POST /api/pedidos/[id]/ordenes` no responde (handler removido) | | |
| 4 | Botón "Invitar a cotizar" aparece en pedidos en estado BORRADOR | | |
| 5 | Al invitar: pedido pasa a PUBLICADO con visibilidad INVITACION | | |
| 6 | Talleres invitados reciben notificación in-app | | |
| 7 | Talleres invitados ven el pedido con badge "Te invitaron" | | |
| 8 | Talleres NO invitados no ven el pedido si visibilidad es INVITACION | | |
| 9 | Taller no invitado que intenta cotizar via API recibe 403 | | |
| 10 | Cotizaciones se muestran en TODOS los estados del pedido (fix H-08) | | |
| 11 | Cotización ACEPTADA se destaca visualmente en verde | | |
| 12 | Al aceptar cotización, OrdenManufactura.cotizacionId queda seteado | | |
| 13 | Órdenes históricas mantienen cotizacionId = null sin romper nada | | |
| 14 | Build de TypeScript pasa sin errores | | |

---

## Eje 2 — Navegabilidad

### Paso 1 — Verificar que NO aparece botón "Asignar taller"

- **Rol:** MARCA (martin.echevarria@pdt.org.ar / pdt2026)
- **URL de inicio:** `/marca/pedidos`
- **Acción:**
  1. Login como MARCA
  2. Ir a `/marca/pedidos` → click en un pedido existente en estado BORRADOR (o crear uno nuevo desde "Nuevo pedido")
  3. En la pantalla de detalle del pedido, revisar la sección de acciones
- **Esperado:** NO aparece ningún botón "Asignar taller". Solo deben verse "Publicar al mercado", "Invitar a cotizar" y "Cancelar"
- **Resultado:**
- **Notas:**

### Paso 2 — Verificar botones "Publicar al mercado" e "Invitar a cotizar"

- **Rol:** MARCA (martin.echevarria@pdt.org.ar / pdt2026)
- **URL de inicio:** Detalle de un pedido en BORRADOR
- **Acción:**
  1. Desde el detalle de un pedido en estado BORRADOR, verificar que existen exactamente estos botones de acción:
     - "Publicar al mercado"
     - "Invitar a cotizar"
     - "Cancelar"
- **Esperado:** Los tres botones están visibles. "Publicar al mercado" e "Invitar a cotizar" solo aparecen en estado BORRADOR
- **Resultado:**
- **Notas:**

### Paso 3 — Flujo completo de invitación

- **Rol:** MARCA (martin.echevarria@pdt.org.ar / pdt2026)
- **URL de inicio:** Detalle de un pedido en BORRADOR
- **Acción:**
  1. Click en "Invitar a cotizar"
  2. Se abre modal "Invitar talleres a cotizar"
  3. Escribir "Corte" en el campo de búsqueda
  4. Esperar resultados (~300ms) → debe aparecer "Corte Sur SRL"
  5. Seleccionar "Corte Sur SRL" (checkbox)
  6. Buscar "Hilos" → seleccionar "Cooperativa Hilos del Sur"
  7. Verificar que dice "2 talleres seleccionados"
  8. Click en "Continuar (2)"
  9. Pantalla de confirmación muestra los 2 talleres seleccionados
  10. Click en "Invitar a cotizar"
  11. Modal se cierra, la página se refresca
- **Esperado:** El pedido pasa de BORRADOR a PUBLICADO. Los botones "Publicar al mercado" e "Invitar a cotizar" desaparecen
- **Resultado:**
- **Notas:**

### Paso 4 — Badge "Te invitaron" para taller invitado

- **Rol:** TALLER Oro (carlos.mendoza@pdt.org.ar / pdt2026) — es el user de Corte Sur SRL
- **URL de inicio:** `/taller/pedidos/disponibles`
- **Acción:**
  1. Cerrar sesión de MARCA, login como TALLER Oro
  2. Ir a `/taller/pedidos/disponibles`
  3. Buscar el pedido que fue invitado en el Paso 3
- **Esperado:** El pedido aparece en la lista con un badge "Te invitaron" junto al nombre de la prenda
- **Resultado:**
- **Notas:**

### Paso 5 — Taller NO invitado no ve el pedido

- **Rol:** TALLER Bronce (roberto.gimenez@pdt.org.ar / pdt2026) — NO fue invitado
- **URL de inicio:** `/taller/pedidos/disponibles`
- **Acción:**
  1. Cerrar sesión, login como TALLER Bronce
  2. Ir a `/taller/pedidos/disponibles`
  3. Buscar el pedido del Paso 3
- **Esperado:** El pedido con visibilidad INVITACION **NO** aparece en la lista. Solo aparecen pedidos con visibilidad PUBLICO
- **Resultado:**
- **Notas:**

### Paso 6 — Taller invitado cotiza el pedido

- **Rol:** TALLER Oro (carlos.mendoza@pdt.org.ar / pdt2026)
- **URL de inicio:** `/taller/pedidos/disponibles`
- **Acción:**
  1. Login como TALLER Oro
  2. Ir a `/taller/pedidos/disponibles` → click en "Ver y cotizar" del pedido invitado
  3. Completar el formulario de cotización (precio, plazo, proceso)
  4. Enviar la cotización
- **Esperado:** Cotización se crea exitosamente. Mensaje de confirmación visible
- **Resultado:**
- **Notas:**

### Paso 7 — MARCA ve la cotización recibida

- **Rol:** MARCA (martin.echevarria@pdt.org.ar / pdt2026)
- **URL de inicio:** `/marca/pedidos`
- **Acción:**
  1. Login como MARCA
  2. Ir al detalle del pedido que ahora está en PUBLICADO
  3. Verificar la sección "Cotizaciones"
- **Esperado:** La sección "Cotizaciones (1)" aparece con la cotización del taller Corte Sur SRL, mostrando precio, plazo, proceso y botones "Aceptar" y "Rechazar"
- **Resultado:**
- **Notas:**

### Paso 8 — MARCA acepta la cotización

- **Rol:** MARCA (martin.echevarria@pdt.org.ar / pdt2026)
- **URL de inicio:** Detalle del pedido PUBLICADO
- **Acción:**
  1. En la sección de cotizaciones, click en "Aceptar" de la cotización de Corte Sur SRL
  2. Confirmar si se pide confirmación
  3. La página se refresca
- **Esperado:** El pedido pasa a estado EN_EJECUCION. Se crea una orden de manufactura visible en la sección de órdenes
- **Resultado:**
- **Notas:**

### Paso 9 — Cotización ACEPTADA en verde

- **Rol:** MARCA (martin.echevarria@pdt.org.ar / pdt2026)
- **URL de inicio:** Detalle del pedido (ahora EN_EJECUCION)
- **Acción:**
  1. Verificar visualmente la sección de cotizaciones
- **Esperado:** La cotización aceptada se muestra con borde verde y fondo verde claro (`border-green-300 bg-green-50`). El badge muestra "ACEPTADA" en verde
- **Resultado:**
- **Notas:**

### Paso 10 — Cotizaciones visibles en EN_EJECUCION (fix H-08)

- **Rol:** MARCA (martin.echevarria@pdt.org.ar / pdt2026)
- **URL de inicio:** Detalle del pedido en EN_EJECUCION
- **Acción:**
  1. Verificar que la sección "Cotizaciones" sigue visible aún cuando el pedido ya no está en PUBLICADO
- **Esperado:** La sección "Cotizaciones (N)" aparece con las cotizaciones históricas (ACEPTADA en verde, RECHAZADA si las hay). Los botones "Aceptar/Rechazar" NO aparecen (porque el pedido ya no está PUBLICADO)
- **Resultado:**
- **Notas:**

### Paso 11 — Publicar pedido al mercado (flujo público)

- **Rol:** MARCA (martin.echevarria@pdt.org.ar / pdt2026)
- **URL de inicio:** `/marca/pedidos`
- **Acción:**
  1. Crear un nuevo pedido (o usar uno existente en BORRADOR)
  2. Click en "Publicar al mercado" (NO "Invitar a cotizar")
  3. Confirmar la publicación
- **Esperado:** El pedido pasa a PUBLICADO con visibilidad PUBLICO (default). Aparece para TODOS los talleres en `/taller/pedidos/disponibles`, sin badge "Te invitaron"
- **Resultado:**
- **Notas:**

### Paso 12 — Taller NO invitado no puede cotizar via API (seguridad)

- **Rol:** TALLER Bronce (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de inicio:** Cualquier página logueado como TALLER Bronce
- **Acción:**
  1. Login como TALLER Bronce
  2. Abrir DevTools → Console
  3. Ejecutar:
     ```js
     fetch('/api/cotizaciones', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ pedidoId: '<ID_DEL_PEDIDO_INVITACION>', precio: 100, plazoDias: 30, proceso: 'confeccion' }),
     }).then(r => r.json()).then(console.log)
     ```
     (Reemplazar `<ID_DEL_PEDIDO_INVITACION>` con el ID del pedido del Paso 3)
- **Esperado:** Respuesta con status **403** y mensaje `"No fuiste invitado a cotizar este pedido"`
- **Resultado:**
- **Notas:**

### Paso 13 — Verificar cotizacionId en OrdenManufactura (DB)

- **Rol:** ADMIN o acceso a Supabase
- **URL de inicio:** Supabase Dashboard → Table Editor → `ordenes_manufactura`
- **Acción:**
  1. Abrir la tabla `ordenes_manufactura` en Supabase
  2. Buscar la orden creada en el Paso 8 (la más reciente, o filtrar por el pedidoId)
  3. Verificar el campo `cotizacionId`
- **Esperado:** El campo `cotizacionId` tiene el ID de la cotización aceptada (no es null). Las órdenes creadas antes de esta épica (si las hay) mantienen `cotizacionId = null`
- **Resultado:**
- **Notas:**

---

## Eje 3 — Casos borde

| # | Caso | Acción | Esperado | Resultado |
|---|------|--------|----------|-----------|
| 1 | Pedido ya PUBLICADO no permite invitar | Desde un pedido PUBLICADO, verificar que NO aparece el botón "Invitar a cotizar" | Botón solo aparece en BORRADOR | |
| 2 | Taller ya invitado (duplicado) | Invitar al mismo taller dos veces al mismo pedido | `skipDuplicates` ignora silenciosamente, no falla | |
| 3 | tallerIds con IDs inválidos | Enviar POST a invitaciones con IDs que no existen | Los válidos se crean, los inválidos se ignoran. Si todos son inválidos → 400 | |
| 4 | Cotización vencida no se puede aceptar | Si existe una cotización con venceEn en el pasado, intentar aceptarla | Retorna error "La cotizacion vencio" | |
| 5 | montoTotal y presupuesto deprecados | Verificar que no se usan en código nuevo ni en UI nueva | Campos siguen en schema pero no aparecen en flujos nuevos | |

---

## Eje 4 — Performance

| Verificación | Método | Resultado |
|-------------|--------|-----------|
| Detalle pedido marca carga en < 3s | DevTools → Network → recargar `/marca/pedidos/[id]` | |
| Pedidos disponibles taller carga en < 3s | DevTools → Network → recargar `/taller/pedidos/disponibles` | |
| Modal "Invitar a cotizar" responde en < 500ms | Click en botón → medir tiempo hasta que aparece el modal | |
| Búsqueda de talleres responde en < 1s | Escribir "Corte" → medir tiempo hasta resultados | |
| Sin errores en consola del browser | DevTools → Console → revisar en todas las páginas | |
| Funciona en móvil (responsive) | DevTools → Toggle device toolbar → probar flujo completo | |

---

## Eje 5 — Consistencia visual

| Verificación | Resultado | Notas |
|-------------|-----------|-------|
| Tipografías consistentes (Overpass para títulos) | | |
| Colores del design system (brand-blue, brand-red) | | |
| Botón "Invitar a cotizar" coherente con otros botones outline | | |
| Modal de invitación tiene estilo consistente con otros modales | | |
| Badge "Te invitaron" usa variant default (azul) | | |
| Cotización ACEPTADA en verde es claramente distinguible | | |
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

[Observaciones generales, sugerencias de UX, contexto adicional]

---

## Checklist de cierre

- [ ] Todos los criterios de aceptación del spec verificados (14 criterios)
- [ ] 13 pasos de navegación probados
- [ ] 5 casos borde probados
- [ ] Performance revisada en desktop y móvil
- [ ] Issues abiertos en GitHub con labels correctos
- [ ] Resultado global definido
- [ ] Documento commiteado a develop
