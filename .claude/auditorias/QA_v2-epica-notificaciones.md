# QA: Épica Notificaciones — Centro de comunicaciones + Historial

**Spec:** `v2-epica-notificaciones.md`
**Commit de implementacion:** `871ffcd`
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
| 1 | `/admin/notificaciones` redirige a `/unauthorized` si el usuario no es ADMIN | | |
| 2 | La pagina tiene dos tabs: "Comunicaciones del admin" y "Notificaciones del sistema" | | |
| 3 | Tab "Comunicaciones" muestra envios agrupados por `batchId` (1 item por envio masivo) | | |
| 4 | Cada item del tab muestra titulo, mensaje, enviado por, destinatarios, canal y fecha | | |
| 5 | Tab "Historial" muestra solo notificaciones con `createdById IS NULL` | | |
| 6 | El formulario tiene 6 opciones de segmento (todos, talleres, bronce, plata, oro, marcas) | | |
| 7 | Al enviar con canal EMAIL se envian emails reales via SendGrid | | |
| 8 | El schema tiene `createdById` y `batchId` con relaciones nombradas en User | | |
| 9 | El codigo usa `user.notificacionesRecibidas` (no `user.notificaciones`) | | |
| 10 | Build de TypeScript pasa sin errores | | |

---

## Eje 2 — Navegabilidad

### Paso 1 — ADMIN ve dos tabs en notificaciones

- **Rol:** ADMIN (lucia.fernandez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/admin/notificaciones`
- **Accion:**
  1. Login como ADMIN
  2. Ir a `/admin/notificaciones`
  3. Verificar la estructura de la pagina
- **Esperado:** La pagina muestra: header con stats (total, sin leer, leidas), dos tabs "Comunicaciones del admin" y "Notificaciones del sistema", y el boton "Nueva Notificacion"
- **Resultado:**
- **Notas:** El tab "Comunicaciones del admin" debe estar activo por defecto. La URL no tiene `?tab=` o tiene `?tab=comunicaciones`

### Paso 2 — ADMIN verifica 6 opciones de segmento en el formulario

- **Rol:** ADMIN (lucia.fernandez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/admin/notificaciones`
- **Accion:**
  1. Click en "Nueva Notificacion"
  2. En el modal, verificar la seccion "Destinatarios"
- **Esperado:** Se muestran 6 radio buttons:
  - Todos los usuarios
  - Todos los talleres
  - Talleres Bronce
  - Talleres Plata
  - Talleres Oro
  - Todas las marcas
- **Resultado:**
- **Notas:** Verificar tambien que la seccion "Canal" muestra dos opciones con descripciones: "Solo en plataforma" (con subtexto) y "Email + plataforma" (con subtexto)

### Paso 3 — ADMIN envia notificacion a todos los talleres

- **Rol:** ADMIN (lucia.fernandez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/admin/notificaciones`
- **Accion:**
  1. Click en "Nueva Notificacion"
  2. Asunto: "Aviso importante para talleres"
  3. Mensaje: "Este es un mensaje de prueba para todos los talleres de la plataforma."
  4. Segmento: "Todos los talleres"
  5. Canal: "Solo en plataforma"
  6. Click en "Enviar Notificacion"
- **Esperado:** Aparece mensaje "Notificacion enviada correctamente". El modal se cierra. La pagina se refresca
- **Resultado:**
- **Notas:**

### Paso 4 — ADMIN verifica agrupacion en tab Comunicaciones

- **Rol:** ADMIN (lucia.fernandez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/admin/notificaciones?tab=comunicaciones`
- **Accion:**
  1. En el tab "Comunicaciones del admin", buscar el envio del Paso 3
- **Esperado:** Aparece **un solo item** (no uno por cada taller destinatario). El item muestra:
  - Titulo: "Aviso importante para talleres"
  - Mensaje (truncado)
  - Enviado por: Lucia Fernandez (o el nombre del admin)
  - N destinatarios (donde N es la cantidad de talleres activos)
  - Canal: In-app
  - Fecha de hoy
- **Resultado:**
- **Notas:** Si aparecen N items sueltos en vez de 1 agrupado, el `batchId` no esta funcionando

### Paso 5 — TALLER Bronce recibio la notificacion

- **Rol:** TALLER Bronce (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/cuenta/notificaciones`
- **Accion:**
  1. Cerrar sesion, login como Roberto Gimenez (TALLER Bronce)
  2. Ir a `/cuenta/notificaciones`
  3. Buscar la notificacion "Aviso importante para talleres"
- **Esperado:** La notificacion aparece en la bandeja con el titulo y mensaje del Paso 3
- **Resultado:**
- **Notas:**

### Paso 6 — TALLER Plata tambien recibio la notificacion

- **Rol:** TALLER Plata (graciela.sosa@pdt.org.ar / pdt2026)
- **URL de inicio:** `/cuenta/notificaciones`
- **Accion:**
  1. Cerrar sesion, login como Graciela Sosa (TALLER Plata)
  2. Ir a `/cuenta/notificaciones`
  3. Buscar la notificacion "Aviso importante para talleres"
- **Esperado:** La notificacion aparece — el segmento "Todos los talleres" incluye todos los niveles
- **Resultado:**
- **Notas:**

### Paso 7 — MARCA no recibio la notificacion de talleres

- **Rol:** MARCA (martin.echevarria@pdt.org.ar / pdt2026)
- **URL de inicio:** `/cuenta/notificaciones`
- **Accion:**
  1. Cerrar sesion, login como Martin Echevarria (MARCA)
  2. Ir a `/cuenta/notificaciones`
  3. Buscar la notificacion "Aviso importante para talleres"
- **Esperado:** La notificacion **NO aparece** — el segmento "Todos los talleres" excluye marcas
- **Resultado:**
- **Notas:**

### Paso 8 — ADMIN envia notificacion solo a Talleres Plata

- **Rol:** ADMIN (lucia.fernandez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/admin/notificaciones`
- **Accion:**
  1. Login como ADMIN
  2. Click en "Nueva Notificacion"
  3. Asunto: "Info exclusiva para nivel Plata"
  4. Mensaje: "Este mensaje es solo para talleres con nivel PLATA."
  5. Segmento: "Talleres Plata"
  6. Canal: "Solo en plataforma"
  7. Enviar
- **Esperado:** Envio exitoso. El count de destinatarios debe ser menor que el del Paso 3 (solo talleres Plata)
- **Resultado:**
- **Notas:**

### Paso 9 — TALLER Bronce NO recibio la notificacion de Plata

- **Rol:** TALLER Bronce (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/cuenta/notificaciones`
- **Accion:**
  1. Login como Roberto Gimenez (TALLER Bronce)
  2. Ir a `/cuenta/notificaciones`
  3. Buscar "Info exclusiva para nivel Plata"
- **Esperado:** La notificacion **NO aparece** — Roberto es Bronce, no Plata
- **Resultado:**
- **Notas:** Roberto deberia ver la del Paso 3 ("Aviso importante para talleres") pero NO la del Paso 8

### Paso 10 — ADMIN envia notificacion a Todos

- **Rol:** ADMIN (lucia.fernandez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/admin/notificaciones`
- **Accion:**
  1. Login como ADMIN
  2. Click en "Nueva Notificacion"
  3. Asunto: "Aviso general de la plataforma"
  4. Mensaje: "Este mensaje llega a todos los usuarios."
  5. Segmento: "Todos los usuarios"
  6. Canal: "Solo en plataforma"
  7. Enviar
- **Esperado:** Envio exitoso. El count de destinatarios incluye talleres + marcas + otros usuarios activos
- **Resultado:**
- **Notas:** Verificar despues que tanto un taller como una marca recibieron esta notificacion

### Paso 11 — ADMIN verifica agrupacion de multiples envios

- **Rol:** ADMIN (lucia.fernandez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/admin/notificaciones?tab=comunicaciones`
- **Accion:**
  1. Ir a tab "Comunicaciones del admin"
  2. Verificar que se muestran los 3 envios de los pasos anteriores
- **Esperado:** Se ven exactamente 3 items agrupados (no decenas de items sueltos):
  - "Aviso general de la plataforma" — N destinatarios
  - "Info exclusiva para nivel Plata" — M destinatarios (M < N)
  - "Aviso importante para talleres" — K destinatarios
  - Ordenados del mas reciente al mas antiguo
- **Resultado:**
- **Notas:** Si algun envio aparece desglosado en items individuales, el batchId no se esta seteando

---

## Eje 3 — Casos borde

| # | Caso | Accion | Esperado | Resultado |
|---|------|--------|----------|-----------|
| 1 | Auth gate — taller intenta acceder | Login como taller → ir a `/admin/notificaciones` | Redirige a `/unauthorized` | |
| 2 | Auth gate — marca intenta acceder | Login como marca → ir a `/admin/notificaciones` | Redirige a `/unauthorized` | |
| 3 | Envio sin asunto | Abrir modal → dejar asunto vacio → enviar | Error "Asunto y mensaje son obligatorios" | |
| 4 | Envio sin mensaje | Abrir modal → dejar mensaje vacio → enviar | Error "Asunto y mensaje son obligatorios" | |
| 5 | Tab Historial muestra solo sistema | Click en tab "Notificaciones del sistema" | Solo aparecen notificaciones generadas por flujos (no envios del admin) | |
| 6 | Tab vacio | Si no hay comunicaciones previas, tab Comunicaciones muestra estado vacio | Mensaje "Todavia no enviaste ninguna comunicacion" | |

---

## Eje 4 — Performance

| Verificacion | Metodo | Resultado |
|-------------|--------|-----------|
| Pagina de notificaciones carga en < 3s | DevTools → Network → recargar `/admin/notificaciones` | |
| Cambio de tab es instantaneo (server navigation) | Click en tab "Historial" → medir tiempo de cambio | |
| Modal de nueva notificacion responde en < 500ms | Click en "Nueva Notificacion" → medir tiempo hasta que aparece | |
| Sin errores en consola del browser | DevTools → Console → revisar | |
| Funciona en movil (responsive) | DevTools → Toggle device toolbar | |

---

## Eje 5 — Consistencia visual

| Verificacion | Resultado | Notas |
|-------------|-----------|-------|
| Tabs activos usan bg-brand-blue text-white | | |
| Tabs inactivos usan border border-gray-300 text-gray-600 | | |
| Stats cards tienen icono + numero grande + descripcion | | |
| Items agrupados muestran count de destinatarios con icono Users | | |
| Canal se muestra como "In-app" o "Email" (labels traducidos) | | |
| Descripciones de canal en el formulario son claras | | |
| Estado vacio tiene icono gris + mensaje descriptivo | | |
| Tipografias consistentes (Overpass para titulos) | | |
| Textos en espanol argentino | | |
| Sin texto en ingles visible al usuario | | |

---

## Resumen de issues abiertos

| Issue | Tipo | Descripcion | Prioridad sugerida |
|-------|------|-------------|-------------------|
| — | — | — | — |

---

## Notas del auditor

[Observaciones generales, sugerencias de UX, contexto adicional]

**Nota sobre emails:** El canal EMAIL solo envia emails reales en produccion con `SENDGRID_API_KEY` configurada. En desarrollo/preview, los emails se loguean en consola. Si elegis canal "Email + plataforma" en la prueba, la notificacion in-app siempre se crea — el email puede no llegar si la key no esta configurada. Esto es correcto.

---

## Checklist de cierre

- [ ] Todos los criterios de aceptacion del spec verificados (10 criterios)
- [ ] 11 pasos de navegacion probados
- [ ] 6 casos borde probados
- [ ] Performance revisada en desktop y movil
- [ ] Issues abiertos en GitHub con labels correctos
- [ ] Resultado global definido
- [ ] Documento commiteado a develop
