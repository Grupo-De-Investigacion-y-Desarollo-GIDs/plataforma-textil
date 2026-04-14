# QA: Notificaciones accionables con deep links

**Spec:** `v2-notificaciones-accionables.md`
**Commit de implementacion:** `e687d5a`
**URL de prueba:** https://plataforma-textil.vercel.app
**Fecha:** 2026-04-14
**Auditor:** Sergio

---

## Como trabajar con este documento

1. Abri este archivo y la plataforma en paralelo
2. Segui los pasos en orden — cada paso depende del anterior
3. Marca cada resultado con ✅ (ok), 🐛 (bug menor) o ❌ (bloqueante)
4. Si el resultado no es ✅ → abri el widget azul "Feedback" en esa pagina → tipo [bug/falta] → describi que paso
5. Quedate en la pagina donde encontraste el problema antes de abrir el widget (captura la URL automaticamente)
6. Al terminar, completa el resultado global y commitea este archivo actualizado

**Regla de oro:** un issue por hallazgo, desde la pagina donde ocurre.

> **Nota:** si los hallazgos no aparecen en GitHub Issues, verificar que `GITHUB_TOKEN` y `GITHUB_REPO` estan configurados en Vercel. Los hallazgos siempre quedan registrados en la DB aunque el token no este configurado — se pueden ver en `/admin` desde `LogActividad`.

---

## Credenciales de prueba

| Rol | Email | Password | URL de entrada |
|-----|-------|----------|----------------|
| ADMIN | `lucia.fernandez@pdt.org.ar` | `pdt2026` | `/admin` |
| TALLER Bronce | `roberto.gimenez@pdt.org.ar` | `pdt2026` | `/taller` |
| TALLER Plata | `graciela.sosa@pdt.org.ar` | `pdt2026` | `/taller` |
| TALLER Oro | `carlos.mendoza@pdt.org.ar` | `pdt2026` | `/taller` |
| MARCA | `martin.echevarria@pdt.org.ar` | `pdt2026` | `/marca` |

---

## Resultado global

- [ ] ✅ Aprobado — todo funciona
- [ ] 🔧 Aprobado con fixes — funciona pero hay bugs menores
- [ ] ❌ Rechazado — falta funcionalidad o hay bugs bloqueantes

**Decision:** [ cerrar v2 / fix inmediato / abrir item v3 ]
**Issues abiertos:** #

---

## Eje 1 — Funcionalidad

Verificar que cada criterio de aceptacion del spec esta implementado.

| # | Criterio | Resultado | Issue |
|---|----------|-----------|-------|
| 1 | Campo `link String?` agregado al modelo `Notificacion` y migracion aplicada | | |
| 2 | `NotificacionData.pedido` incluye `id` ademas de `omId` | | |
| 3 | Notificaciones de cotizacion `RECIBIDA` tienen link a `/marca/pedidos/{pedidoId}` | | |
| 4 | Notificaciones `ACEPTADA` y `RECHAZADA` tienen link a `/taller/pedidos` | | |
| 5 | Notificaciones `PEDIDO_DISPONIBLE` tienen link a `/taller/pedidos/disponibles/{pedidoId}` | | |
| 6 | Click en notificacion con link navega al destino | | |
| 7 | Al hacer click, la notificacion se marca como leida (optimistic + fetch) | | |
| 8 | Notificaciones sin link se muestran sin interaccion ni cursor pointer | | |
| 9 | Links internos usan `<Link>` (client-side navigation), externos usan `<a target="_blank">` | | |
| 10 | Label textual muestra tipo (*"Ver pedido →"*), no cuids de la URL | | |
| 11 | Admin puede incluir link opcional al enviar notificaciones masivas | | |
| 12 | Build de TypeScript pasa sin errores | | |

---

## Eje 2 — Navegabilidad

### Paso 1 — MARCA publica un pedido al mercado

- **Rol:** MARCA (martin.echevarria@pdt.org.ar / pdt2026)
- **URL de inicio:** `/marca/pedidos`
- **Accion:**
  1. Login como MARCA
  2. Ir a `/marca/pedidos` → crear un pedido nuevo (o usar uno en BORRADOR)
  3. Click en "Publicar al mercado"
  4. Confirmar la publicacion
- **Esperado:** El pedido pasa a PUBLICADO. El sistema genera notificaciones para talleres compatibles (Plata y Oro con capacidad suficiente)
- **Resultado:**
- **Notas:** Si no hay talleres compatibles, no se generan notificaciones. Verificar que al menos Graciela (Plata) o Carlos (Oro) cumplen los requisitos

### Paso 2 — TALLER Plata ve notificacion con link

- **Rol:** TALLER Plata (graciela.sosa@pdt.org.ar / pdt2026)
- **URL de inicio:** `/cuenta/notificaciones`
- **Accion:**
  1. Cerrar sesion, login como Graciela Sosa (TALLER Plata)
  2. Ir a `/cuenta/notificaciones`
  3. Buscar la notificacion "Nuevo pedido disponible: [tipo prenda]"
- **Esperado:** La notificacion muestra:
  - Titulo en azul: "Nuevo pedido disponible: [prenda]"
  - Mensaje con nombre de marca y cantidad
  - Texto azul: **"Ver pedido disponible →"**
  - Badge "NUEVA" en rojo (si no fue leida)
  - Fondo celeste claro (border-brand-blue/30 bg-brand-blue/5) si no leida
- **Resultado:**
- **Notas:** Si la notificacion no tiene el texto "Ver pedido disponible →", el campo `link` no se esta populando

### Paso 3 — Click navega al pedido correcto

- **Rol:** TALLER Plata (graciela.sosa@pdt.org.ar / pdt2026)
- **URL de inicio:** `/cuenta/notificaciones`
- **Accion:**
  1. Click en la notificacion del Paso 2
  2. Verificar que navega a `/taller/pedidos/disponibles/[id]` (la pagina del pedido)
- **Esperado:** Navegacion client-side (sin full reload de pagina) al detalle del pedido publicado en el Paso 1. La URL contiene el ID correcto del pedido
- **Resultado:**
- **Notas:** Si da 404, el `pedidoId` en el link no coincide con el ID real del pedido

### Paso 4 — Notificacion queda marcada como leida

- **Rol:** TALLER Plata (graciela.sosa@pdt.org.ar / pdt2026)
- **URL de inicio:** `/cuenta/notificaciones`
- **Accion:**
  1. Volver a `/cuenta/notificaciones` (boton atras o navegacion)
  2. Verificar el estado de la notificacion del Paso 2
- **Esperado:** La notificacion ya no tiene el badge "NUEVA", tiene fondo blanco (border-gray-200 bg-white), y el contador "Sin leer" bajo en 1
- **Resultado:**
- **Notas:** El mark-as-read es optimistic — se actualiza visualmente al hacer click, antes de que el fetch confirme

### Paso 5 — TALLER cotiza el pedido

- **Rol:** TALLER Plata (graciela.sosa@pdt.org.ar / pdt2026)
- **URL de inicio:** `/taller/pedidos/disponibles`
- **Accion:**
  1. Ir al pedido publicado en el Paso 1 → click en "Ver y cotizar"
  2. Completar precio, plazo y proceso
  3. Enviar la cotizacion
- **Esperado:** Cotizacion enviada exitosamente. La marca recibe notificacion de cotizacion recibida
- **Resultado:**
- **Notas:**

### Paso 6 — MARCA ve notificacion de cotizacion con link

- **Rol:** MARCA (martin.echevarria@pdt.org.ar / pdt2026)
- **URL de inicio:** `/cuenta/notificaciones`
- **Accion:**
  1. Cerrar sesion, login como Martin Echevarria (MARCA)
  2. Ir a `/cuenta/notificaciones`
  3. Buscar la notificacion "Nueva cotizacion recibida"
- **Esperado:** La notificacion muestra:
  - Titulo: "Nueva cotizacion recibida"
  - Mensaje con nombre del taller, precio y plazo
  - Texto azul: **"Ver pedido →"**
  - Badge "NUEVA" si no leida
- **Resultado:**
- **Notas:**

### Paso 7 — MARCA navega al detalle del pedido via link

- **Rol:** MARCA (martin.echevarria@pdt.org.ar / pdt2026)
- **URL de inicio:** `/cuenta/notificaciones`
- **Accion:**
  1. Click en la notificacion "Nueva cotizacion recibida"
  2. Verificar destino
- **Esperado:** Navega a `/marca/pedidos/[id]` — la pagina de detalle del pedido con la seccion de cotizaciones visible. La cotizacion de Graciela aparece ahi
- **Resultado:**
- **Notas:**

### Paso 8 — MARCA acepta la cotizacion

- **Rol:** MARCA (martin.echevarria@pdt.org.ar / pdt2026)
- **URL de inicio:** `/marca/pedidos/[id]`
- **Accion:**
  1. En la seccion de cotizaciones, click en "Aceptar" en la cotizacion de Graciela
  2. Confirmar si se pide confirmacion
- **Esperado:** El pedido pasa a EN_EJECUCION. Graciela recibe notificacion "Tu cotizacion fue aceptada" con link
- **Resultado:**
- **Notas:**

### Paso 9 — TALLER ve notificacion de cotizacion aceptada con link

- **Rol:** TALLER Plata (graciela.sosa@pdt.org.ar / pdt2026)
- **URL de inicio:** `/cuenta/notificaciones`
- **Accion:**
  1. Cerrar sesion, login como Graciela Sosa
  2. Ir a `/cuenta/notificaciones`
  3. Buscar la notificacion "Tu cotizacion fue aceptada"
- **Esperado:** La notificacion muestra:
  - Titulo: "Tu cotizacion fue aceptada"
  - Texto azul: **"Ver pedido →"**
  - Click navega a `/taller/pedidos`
- **Resultado:**
- **Notas:** ACEPTADA y RECHAZADA apuntan a /taller/pedidos (listing) porque no hay vista de detalle de pedido para taller

### Paso 10 — ADMIN envia notificacion con link personalizado

- **Rol:** ADMIN (lucia.fernandez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/admin/notificaciones`
- **Accion:**
  1. Login como ADMIN
  2. Click en "Nueva Notificacion"
  3. Asunto: "Nuevo curso de capacitacion disponible"
  4. Mensaje: "Ya esta disponible el curso de Control de Calidad. Inscribite!"
  5. Link de destino: `/taller/aprender`
  6. Segmento: "Todos los talleres"
  7. Canal: "Solo en plataforma"
  8. Enviar
- **Esperado:** Envio exitoso. Verificar que el campo "Link de destino" existe en el formulario debajo del textarea de mensaje, con placeholder "/taller/aprender o https://..." y texto de ayuda
- **Resultado:**
- **Notas:**

### Paso 11 — TALLER recibe notificacion masiva con link

- **Rol:** TALLER Plata (graciela.sosa@pdt.org.ar / pdt2026)
- **URL de inicio:** `/cuenta/notificaciones`
- **Accion:**
  1. Login como Graciela Sosa
  2. Ir a `/cuenta/notificaciones`
  3. Buscar la notificacion "Nuevo curso de capacitacion disponible"
- **Esperado:** La notificacion muestra:
  - Titulo: "Nuevo curso de capacitacion disponible"
  - Texto azul: **"Ir al enlace →"**
  - Click navega a `/taller/aprender` sin full reload
- **Resultado:**
- **Notas:** El label dice "Ir al enlace →" porque el tipo es ADMIN_ENVIO

### Paso 12 — Notificaciones sin link se muestran sin interaccion

- **Rol:** TALLER (cualquiera)
- **URL de inicio:** `/cuenta/notificaciones`
- **Accion:**
  1. En la bandeja de notificaciones, buscar una notificacion antigua que no tenga link (las creadas antes de esta implementacion)
  2. Verificar su apariencia
- **Esperado:** La notificacion:
  - NO tiene texto "→" debajo del mensaje
  - NO tiene cursor pointer al pasar el mouse
  - NO es clickeable (es un `<div>`, no un `<Link>` o `<a>`)
  - Se ve igual que antes de la implementacion
- **Resultado:**
- **Notas:** Si no hay notificaciones antiguas sin link, enviar una desde admin sin completar el campo "Link de destino" y verificar que se comporta como texto inerte

---

## Eje 3 — Casos borde

| # | Caso | Accion | Esperado | Resultado |
|---|------|--------|----------|-----------|
| 1 | Notificacion historica (link null) | Ver notificacion anterior a este spec | Se muestra sin link, sin cursor, sin "→" | |
| 2 | Admin envia sin link | Nueva notificacion → dejar link vacio → enviar | Notificacion se crea con link null, sin interaccion | |
| 3 | Link a pedido eliminado | Click en link de pedido que fue borrado | Navega a la URL → pagina 404 (aceptable) | |
| 4 | Mark-as-read al click | Click en notificacion con link → volver → verificar | Aparece como leida (optimistic update) | |
| 5 | Boton "Marcar todas como leidas" | Tener varias no leidas → click en el boton | Todas pasan a leidas, badge "NUEVA" desaparece, contador baja a 0 | |

---

## Eje 4 — Performance

| Verificacion | Metodo | Resultado |
|-------------|--------|-----------|
| /cuenta/notificaciones carga en < 3s | DevTools → Network → recargar | |
| Click en link navega sin full reload | Observar que la pagina no hace refresh completo | |
| Mark-as-read es instantaneo (optimistic) | Click → verificar que cambia inmediatamente sin espera | |
| Sin errores en consola del browser | DevTools → Console → revisar | |
| Funciona en movil (responsive) | DevTools → Toggle device toolbar | |

---

## Eje 5 — Consistencia visual

| Verificacion | Resultado | Notas |
|-------------|-----------|-------|
| Notificacion no leida: borde brand-blue/30, fondo brand-blue/5 | | |
| Notificacion leida: borde gray-200, fondo white | | |
| Badge "NUEVA" en rojo (text-brand-red) solo en no leidas | | |
| Texto del link en brand-blue con font-medium | | |
| Labels correctos por tipo: "Ver pedido →", "Ver pedido disponible →", "Ir al enlace →" | | |
| Cursor pointer solo en notificaciones con link | | |
| Hover en notificacion con link cambia fondo a gray-50 | | |
| Estado vacio tiene icono Bell gris + mensaje descriptivo | | |
| Tipografias consistentes (Overpass para titulos) | | |
| Textos en espanol argentino | | |

---

## Resumen de issues abiertos

| Issue | Tipo | Descripcion | Prioridad sugerida |
|-------|------|-------------|-------------------|
| — | — | — | — |

---

## Notas del auditor

[Observaciones generales, sugerencias de UX, contexto adicional]

**Nota sobre el flujo de prueba:** Los pasos 1-9 forman un flujo comercial completo (publicar → notificar → cotizar → notificar → aceptar → notificar). Cada notificacion generada automaticamente tiene un deep link al recurso correspondiente. Si alguna notificacion no tiene el link, el creador de esa notificacion no fue actualizado correctamente.

**Nota sobre notificaciones historicas:** Las notificaciones creadas antes de esta implementacion tienen `link: null` y se muestran como texto inerte — esto es backward compatible y correcto.

---

## Checklist de cierre

- [ ] Todos los criterios de aceptacion del spec verificados (12 criterios)
- [ ] 12 pasos de navegacion probados
- [ ] 5 casos borde probados
- [ ] Performance revisada en desktop y movil
- [ ] Issues abiertos en GitHub con labels correctos
- [ ] Resultado global definido
- [ ] Documento commiteado a develop
