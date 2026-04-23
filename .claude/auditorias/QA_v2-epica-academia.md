# QA: Épica Academia — Quiz obligatorio y certificación

**Spec:** `v2-epica-academia.md`
**Commit de implementación:** `ac76919`
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
| 1 | Un taller con `porcentajeCompletado < 100` recibe 403 al llamar el POST de evaluación | | |
| 2 | El endpoint de progreso calcula `totalVideos` server-side — un cliente no puede inflar el porcentaje | | |
| 3 | Un taller que marca todos los videos (incluido el último automáticamente al apretar "Rendir") puede rendir sin errores | | |
| 4 | `aplicarNivel` se ejecuta con `await` dentro de un try/catch local — un fallo no rompe la respuesta exitosa | | |
| 5 | Los fire-and-forget de email y QR logean errores con prefijo `[academia]` | | |
| 6 | La rama `yaExiste` del endpoint incluye `codigo` en la respuesta | | |
| 7 | El componente maneja el 403 con un mensaje visible ("No podés rendir todavía") | | |
| 8 | Build pasa sin errores de TypeScript | | |

---

## Eje 2 — Navegabilidad

### Paso 1 — TALLER ve listado de colecciones

- **Rol:** TALLER Bronce (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/taller/aprender`
- **Acción:**
  1. Login como Roberto Giménez (TALLER Bronce)
  2. Ir a `/taller/aprender`
- **Esperado:** Aparece el listado de colecciones disponibles (Seguridad e Higiene, Cálculo de Costos, Formalización). Cada colección muestra título, descripción, cantidad de videos y duración
- **Resultado:**
- **Notas:** Si Roberto ya tiene progreso en alguna colección del seed, puede aparecer un indicador de progreso parcial

### Paso 2 — Botón "Rendir evaluación" deshabilitado sin videos completos

- **Rol:** TALLER Bronce (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/taller/aprender`
- **Acción:**
  1. Entrar a una colección que NO haya completado (ej: "Cálculo de Costos y Presupuestos" si no la vio)
  2. Scroll hasta la sección "Evaluación final"
  3. Verificar el estado del botón "Rendir evaluación"
- **Esperado:**
  - Aparece un mensaje: *"Debés ver todos los videos antes de rendir"* con ícono de candado amarillo
  - El botón **"Rendir evaluación"** está deshabilitado (gris, no clickeable)
  - El progreso muestra X/N videos vistos (no 100%)
- **Resultado:**
- **Notas:** Si el botón está habilitado sin haber visto todos los videos, el gate visual del cliente no funciona

### Paso 3 — Gate real del backend (403 al forzar quiz)

- **Rol:** TALLER Bronce (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/taller/aprender/[id]` (la colección del Paso 2)
- **Acción:**
  1. Abrir DevTools (F12) → pestaña **Console**
  2. Copiar el ID de la colección de la URL (el cuid después de `/taller/aprender/`)
  3. Ejecutar:
     ```js
     fetch('/api/colecciones/<ID>/evaluacion', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ respuestas: [1, 1, 1] }),
     }).then(r => r.json().then(d => console.log(r.status, d)))
     ```
  4. Verificar la respuesta
- **Esperado:** Status **403** con body: `{ error: "Debés completar todos los videos antes de rendir la evaluación" }`
- **Resultado:**
- **Notas:** Si devuelve 200 o corrige el quiz, el gate del backend (§3.1 del spec) no está funcionando — bug de seguridad bloqueante

### Paso 4 — Ver todos los videos → progreso 100%

- **Rol:** TALLER Bronce (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/taller/aprender/[id]` (misma colección)
- **Acción:**
  1. Hacer click en cada video de la lista, uno por uno
  2. Para cada video, hacer click en **"✓ Marcar como visto"** (o navegar al siguiente, que marca el anterior automáticamente)
  3. Verificar la card "Tu progreso" a la derecha
- **Esperado:**
  - El contador de videos sube con cada marcación
  - La barra de progreso se llena proporcionalmente
  - Cuando todos están marcados, muestra **N/N videos vistos** y **100% completado**
  - El botón "Rendir evaluación" pasa a estar **habilitado** (azul, clickeable)
  - El mensaje de candado amarillo desaparece
- **Resultado:**
- **Notas:** Si el progreso no llega a 100% después de marcar todos, el cálculo del porcentaje puede tener un problema de redondeo

### Paso 5 — Click en "Rendir evaluación" habilita el quiz

- **Rol:** TALLER Bronce (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/taller/aprender/[id]` (con 100% de progreso)
- **Acción:**
  1. Click en **"Rendir evaluación"**
  2. Verificar que se abre el formulario del quiz
- **Esperado:**
  - El formulario muestra las preguntas de la evaluación con opciones tipo radio
  - Aparece un botón **"Enviar respuestas"** (deshabilitado hasta responder todas)
  - Aparece un link **"Cancelar"** para volver
  - No aparece ningún error 403 ni mensaje de candado
- **Resultado:**
- **Notas:** Al hacer click en "Rendir evaluación", el sistema auto-marca los videos faltantes en DB antes de abrir el quiz. Esto cubre el caso del último video que `seleccionarVideo()` no marca automáticamente

### Paso 6 — Aprobar el quiz

- **Rol:** TALLER Bronce (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/taller/aprender/[id]` (quiz abierto)
- **Acción:**
  1. Responder las preguntas correctamente (puntaje mínimo: 60%)
  2. Click en **"Enviar respuestas"**
- **Esperado:**
  - Aparece card verde: **"¡Aprobaste! X%"**
  - Subtexto: "Tu certificado fue generado."
  - Se muestra el código del certificado en formato `PDT-XXXXXX-XXXXXX-XXXXXX` (fuente mono)
  - La página se refresca y aparece la sección "Colección completada" con botón **"Descargar certificado PDF"**
- **Resultado:**
- **Notas:** Si el código muestra "Código: undefined", la rama `yaExiste` o la respuesta normal no incluyen `codigo`

### Paso 7 — Certificado visible en el perfil

- **Rol:** TALLER Bronce (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/taller/perfil`
- **Acción:**
  1. Ir a `/taller/perfil`
  2. Buscar la sección "Certificaciones"
- **Esperado:** La colección completada aparece como certificación activa con badge verde
- **Resultado:**
- **Notas:** Las certificaciones se muestran en la sección "Certificaciones" del perfil si `activa: true`

### Paso 8 — Nivel sube si corresponde

- **Rol:** TALLER Bronce (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/taller`
- **Acción:**
  1. Ir al dashboard `/taller`
  2. Verificar el nivel actual y el puntaje
- **Esperado:**
  - Si Roberto cumple ahora los requisitos de PLATA (CUIT verificado + documentos PLATA completados + al menos 1 certificado), su nivel debería haber subido a PLATA
  - El puntaje debería haber aumentado en +15 pts (PTS_POR_CERTIFICADO) respecto al valor previo al quiz
  - Si no cumple los requisitos completos de PLATA (le faltan documentos), el nivel sigue en BRONCE pero el puntaje sí aumentó
- **Resultado:**
- **Notas:** `aplicarNivel` se ejecuta con `await` después de crear el certificado. Si el nivel no subió cuando debía, verificar que la función corrió (`[academia] Error recalculando nivel` en logs de Vercel indicaría fallo)

### Paso 9 — Colección ya aprobada muestra certificado existente

- **Rol:** TALLER Bronce (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/taller/aprender/[id]` (la colección del Paso 6, ya certificada)
- **Acción:**
  1. Volver a entrar a la colección que aprobó en el Paso 6
- **Esperado:**
  - La sección del quiz NO aparece
  - En su lugar, aparece una card verde: **"Coleccion completada"** con texto "Ya obtuviste tu certificado para esta coleccion."
  - Botón **"Descargar certificado PDF"** disponible
  - Si se fuerza desde DevTools (`POST /api/colecciones/[id]/evaluacion`), el endpoint devuelve `{ aprobado: true, yaExiste: true, codigo: "PDT-..." }` sin crear un certificado nuevo
- **Resultado:**
- **Notas:** El campo `codigo` ahora se incluye en la respuesta `yaExiste` (antes decía "Código: undefined")

### Paso 10 — Reprobar el quiz y reintentar

- **Rol:** TALLER Bronce (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/taller/aprender/[id]` (otra colección no completada, con 100% de videos)
- **Acción:**
  1. Entrar a otra colección que no haya aprobado
  2. Ver todos los videos (o usar una donde ya tenga 100%)
  3. Click en "Rendir evaluación"
  4. Responder **todas las preguntas mal** a propósito
  5. Click en "Enviar respuestas"
- **Esperado:**
  - Aparece card roja: **"No aprobaste — X%"**
  - Subtexto: "Revisá los videos e intentá de nuevo."
  - Link azul: **"Intentar de nuevo"**
  - Click en "Intentar de nuevo" → limpia el resultado y cierra el quiz → vuelve a mostrar el botón "Rendir evaluación"
  - Se puede reintentar ilimitadas veces (sin límite de intentos para el piloto)
- **Resultado:**
- **Notas:** Cada intento (aprobado o no) se guarda en la tabla `IntentoEvaluacion`. No hay límite de reintentos en esta fase

### Paso 11 — ADMIN verifica certificado del taller

- **Rol:** ADMIN (lucia.fernandez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/admin/talleres`
- **Acción:**
  1. Cerrar sesión, login como Lucía Fernández (ADMIN)
  2. Ir a `/admin/talleres` → click en Roberto Giménez
  3. Verificar que el certificado aparece en la información del taller
- **Esperado:** En el detalle del taller, el puntaje refleja el certificado (+15 pts). El certificado se puede verificar en la DB o en la card de puntaje del dashboard
- **Resultado:**
- **Notas:** La página de detalle admin no tiene una tab dedicada de certificados, pero el puntaje y nivel reflejan los cambios

---

## Eje 3 — Casos borde

| # | Caso | Acción | Esperado | Resultado |
|---|------|--------|----------|-----------|
| 1 | Bypass progreso vía fetch | En consola: `fetch('/api/colecciones/<id>/progreso', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({videosVistos: 999, totalVideos: 1}) })` → verificar en DB | `porcentajeCompletado` clampeado al 100% máximo, `videosVistos` limitado al total real de la colección | |
| 2 | Bypass evaluación sin progreso | En consola: `POST /api/colecciones/<id>/evaluacion` con respuestas sin haber visto videos | 403 con mensaje "Debés completar todos los videos antes de rendir la evaluación" | |
| 3 | Último video no marcado manualmente | Ver todos los videos clickeando por la lista (sin usar "Marcar como visto") → click "Rendir" | El onClick auto-marca los faltantes antes de abrir el quiz — no da 403 | |
| 4 | Email falla silenciosamente | Aprobar quiz con SendGrid mal configurado | Certificado se crea igual, "¡Aprobaste!" se muestra, error logueado con `[academia]` | |
| 5 | Certificado existente con `yaExiste` | Forzar POST evaluación en colección ya certificada | Devuelve `{ aprobado: true, yaExiste: true, codigo: "PDT-..." }` sin crear duplicado | |
| 6 | `aplicarNivel` falla | Aprobar quiz cuando `aplicarNivel` tiene error interno | Certificado se crea, respuesta 200, nivel se recalcula en próximo trigger | |

---

## Eje 4 — Performance

| Verificación | Método | Resultado |
|-------------|--------|-----------|
| `/taller/aprender/[id]` carga en < 3s | DevTools → Network → recargar | |
| Marcar video como visto responde en < 1s | Click "Marcar como visto" → verificar actualización visual inmediata | |
| Enviar quiz responde en < 3s | Click "Enviar respuestas" → medir tiempo hasta resultado | |
| Sin errores en consola del browser | DevTools → Console → revisar durante todo el flujo | |
| Funciona en móvil (responsive) | DevTools → Toggle device toolbar → verificar player + quiz | |

---

## Eje 5 — Consistencia visual

| Verificación | Resultado | Notas |
|-------------|-----------|-------|
| Gate visual: ícono candado amarillo + texto cuando faltan videos | | |
| Botón "Rendir evaluación" deshabilitado: opacity reducida, no clickeable | | |
| Card aprobado: bg-green-50 border-green-200, texto verde | | |
| Card reprobado: bg-red-50 border-red-200, texto rojo | | |
| Card error 403: bg-red-50 con ícono Lock rojo + "No podés rendir todavía" | | |
| Código de certificado en fuente mono (font-mono) | | |
| Barra de progreso en brand-blue sobre gray-200 | | |
| Botón "Intentar de nuevo" en text-brand-blue hover:underline | | |
| Tipografías consistentes (Overpass para títulos) | | |
| Textos en español argentino | | |

---

## Resumen de issues abiertos

| Issue | Tipo | Descripción | Prioridad sugerida |
|-------|------|-------------|-------------------|
| — | — | — | — |

---

## Notas del auditor

**Nota sobre seguridad:** Los pasos 3 y los casos borde 1-2 son los más importantes de este QA. Antes de este spec, cualquier taller podía bypassear el quiz llamando directamente al endpoint con `fetch()`. Ahora hay dos niveles de protección: (a) el endpoint de progreso no acepta `totalVideos` del cliente (calcula server-side), y (b) el endpoint de evaluación verifica `porcentajeCompletado >= 100` en DB. Si cualquiera de estos gates falla, es un bug bloqueante.

**Nota sobre el auto-marcado:** El Paso 5 tiene un detalle sutil. La función `seleccionarVideo()` solo marca el video *anterior* al seleccionado — nunca el último. El spec agrega un auto-marcado al hacer click en "Rendir evaluación" que recorre los faltantes y los marca en DB antes de abrir el quiz. Esto evita un falso positivo del gate del backend.

**Nota sobre `aplicarNivel`:** El Paso 8 depende de que Roberto cumpla todos los requisitos de PLATA (CUIT verificado + documentos PLATA + 1 certificado). Con los datos del seed, Roberto solo tiene CUIT verificado pero le faltan ART y Habilitación municipal — por lo que NO subirá a PLATA solo por obtener un certificado. El puntaje sí sube +15 pts.

---

## Checklist de cierre

- [ ] 8 criterios de aceptación del spec verificados
- [ ] 11 pasos de navegación probados (incluyendo tests de seguridad desde DevTools)
- [ ] 6 casos borde probados
- [ ] Performance revisada en desktop y móvil
- [ ] Issues abiertos en GitHub con labels correctos
- [ ] Resultado global definido
- [ ] Documento commiteado a develop
