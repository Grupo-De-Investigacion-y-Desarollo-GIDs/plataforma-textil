# QA: Log de niveles bidireccional + panel transparente

**Spec:** `v2-log-niveles-bidireccional.md`
**Commit de implementación:** `1221239`
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
| 1 | Taller que baja de nivel → `logActividad` crea fila con `accion: 'NIVEL_BAJADO'` | | |
| 2 | Taller que sube de nivel → sigue creando `accion: 'NIVEL_SUBIDO'` (sin regresión) | | |
| 3 | Dashboard taller muestra banner amarillo con ⚠️ al bajar de nivel | | |
| 4 | Dashboard taller muestra banner verde con 🥈/🥇 al subir de nivel | | |
| 5 | Dashboard Estado muestra "bajo de nivel" con ícono TrendingDown amarillo | | |
| 6 | Dashboard Estado muestra "subio de nivel" con ícono TrendingUp azul | | |
| 7 | Dashboard Estado muestra "aprobo una validacion" con ícono FileCheck verde | | |
| 8 | Historial de nivel aparece si tuvo mas de 1 cambio | | |
| 9 | Desglose del puntaje visible debajo del número grande | | |
| 10 | Cuando puntaje esta capped en 100, aparece "Puntaje maximo alcanzado" | | |
| 11 | Build de TypeScript pasa sin errores | | |

---

## Eje 2 — Navegabilidad

### Paso 1 — ADMIN aprueba validaciones PLATA de Roberto para subirlo de nivel

- **Rol:** ADMIN (lucia.fernandez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/admin/talleres`
- **Acción:**
  1. Login como ADMIN
  2. Ir a `/admin/talleres` → buscar "Roberto Giménez" (Taller Bronce = Confecciones del Norte)
  3. Click en el taller → ir a la tab de formalización
  4. Aprobar las validaciones necesarias para que cumpla requisitos de PLATA:
     - CUIT/Monotributo → aprobar
     - Habilitación municipal → aprobar
     - ART → aprobar
  5. Verificar que el nivel del taller cambia a PLATA (puede requerir que AFIP esté verificado y tenga al menos 1 certificado)
- **Esperado:** El nivel de Roberto sube a PLATA. En la DB aparece un registro `NIVEL_SUBIDO` en `log_actividad`
- **Resultado:**
- **Notas:** Si Roberto no cumple los requisitos de PLATA (falta AFIP verificado o certificado), el nivel no sube. En ese caso, verificar en `/admin/talleres/[id]` que AFIP está verificado y que tiene al menos un certificado activo. Si no, activarlos primero.

### Paso 2 — Roberto ve banner VERDE de subida

- **Rol:** TALLER Bronce (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/taller`
- **Acción:**
  1. Cerrar sesión de ADMIN, login como Roberto Giménez
  2. Ir a `/taller` (dashboard del taller)
- **Esperado:** Aparece un banner con borde izquierdo verde, ícono 🥈, texto **"Subiste a nivel PLATA!"** y subtexto "Ahora tenes mas visibilidad en el directorio."
- **Resultado:**
- **Notas:** El banner solo aparece dentro de las 24 horas posteriores al cambio de nivel

### Paso 3 — ADMIN revoca una validación para bajar a Roberto

- **Rol:** ADMIN (lucia.fernandez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/admin/talleres`
- **Acción:**
  1. Login como ADMIN
  2. Ir al detalle de Roberto Giménez
  3. Rechazar una de las validaciones PLATA que fue aprobada en el Paso 1 (ej: rechazar ART)
  4. Esto debería forzar un recálculo que baje a Roberto de PLATA a BRONCE
- **Esperado:** El nivel de Roberto baja a BRONCE. En la DB aparece un registro `NIVEL_BAJADO` en `log_actividad` con `nivelAnterior: PLATA` y `nivelNuevo: BRONCE`
- **Resultado:**
- **Notas:** Verificar en Supabase (`log_actividad` tabla) que la acción es efectivamente `NIVEL_BAJADO` (no `NIVEL_SUBIDO` como pasaba antes del fix)

### Paso 4 — Roberto ve banner AMARILLO de bajada

- **Rol:** TALLER (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/taller`
- **Acción:**
  1. Cerrar sesión de ADMIN, login como Roberto Giménez
  2. Ir a `/taller` (dashboard del taller)
- **Esperado:** Aparece un banner con borde izquierdo amarillo/amber, ícono ⚠️, texto **"Tu nivel bajo a BRONCE"** y subtexto "Revisa tus documentos en Formalizacion para volver a subir."
- **Resultado:**
- **Notas:** El banner amarillo reemplaza al verde del Paso 2 porque es mas reciente (últimas 24hs)

### Paso 5 — Roberto ve desglose del puntaje

- **Rol:** TALLER (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/taller`
- **Acción:**
  1. En el dashboard de Roberto, buscar la card de "Puntaje" (muestra el número grande en rojo)
  2. Debajo del número, verificar que aparece un desglose con líneas tipo:
     - `+ 10 pts CUIT verificado` (si AFIP verificado)
     - `+ N pts documentos (N)` (si tiene validaciones completadas)
     - `+ N pts capacitaciones (N)` (si tiene certificados)
- **Esperado:** Cada componente del puntaje se muestra en texto gris pequeño. La suma de las líneas coincide con el puntaje mostrado (o es menor si el puntaje está capped en 100)
- **Resultado:**
- **Notas:** Si Roberto no tiene AFIP verificado, la línea de CUIT no aparece. Si no tiene validaciones completadas, la línea de documentos no aparece. Esto es correcto.

### Paso 6 — Roberto ve historial de nivel

- **Rol:** TALLER (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/taller`
- **Acción:**
  1. Después de haber subido (Paso 1) y bajado (Paso 3) de nivel, en el dashboard de Roberto buscar la sección "Historial de nivel"
  2. Verificar que muestra las dos entradas
- **Esperado:** La sección muestra:
  - ↓ PLATA → BRONCE (fecha de hoy) — en amarillo/amber
  - ↑ BRONCE → PLATA (fecha de hoy) — en verde
  - La mas reciente aparece arriba
- **Resultado:**
- **Notas:** La sección solo aparece si el taller tuvo mas de 1 cambio de nivel. Si solo tuvo 1, no se muestra.

### Paso 7 — Carlos (ORO) ve "Puntaje máximo alcanzado"

- **Rol:** TALLER Oro (carlos.mendoza@pdt.org.ar / pdt2026)
- **URL de inicio:** `/taller`
- **Acción:**
  1. Login como Carlos Mendoza (TALLER ORO)
  2. Ir a `/taller` → buscar la card de puntaje
- **Esperado:** Si el puntaje es 100, debajo del desglose aparece la línea **"Puntaje maximo alcanzado (100 pts)"** en texto gris mas oscuro con font-medium
- **Resultado:**
- **Notas:** Si Carlos tiene puntaje < 100 por algún motivo, esta línea no aparece (correcto). Verificar que el desglose igualmente muestra las 3 líneas de aportes.

### Paso 8 — Dashboard Estado muestra subidas y bajadas con textos distintos

- **Rol:** ESTADO (anabelen.torres@pdt.org.ar / pdt2026)
- **URL de inicio:** `/estado`
- **Acción:**
  1. Login como Ana Belén Torres (ESTADO)
  2. Ir a `/estado` → scroll hasta la sección "Que esta funcionando?" → buscar la card "Actividad reciente"
  3. Verificar que las filas muestran textos distintos según el tipo de acción
- **Esperado:** Las filas de la actividad reciente muestran:
  - Filas de `VALIDACION_APROBADA` → ícono verde (FileCheck) + *"[nombre] aprobo una validacion"*
  - Filas de `NIVEL_SUBIDO` → ícono azul (TrendingUp) + *"[nombre] subio de nivel"*
  - Filas de `NIVEL_BAJADO` → ícono amarillo (TrendingDown) + *"[nombre] bajo de nivel"*
- **Resultado:**
- **Notas:** Antes del fix, todas las filas decían "aprobo validacion" sin importar el tipo — ese bug ya no debería existir

### Paso 9 — Verificar íconos y colores distintivos en Estado

- **Rol:** ESTADO (anabelen.torres@pdt.org.ar / pdt2026)
- **URL de inicio:** `/estado`
- **Acción:**
  1. En la misma card "Actividad reciente" del Paso 8
  2. Verificar visualmente que:
     - Ícono de validación aprobada es **verde** (FileCheck)
     - Ícono de subida de nivel es **azul** (TrendingUp, flecha hacia arriba)
     - Ícono de bajada de nivel es **amarillo/amber** (TrendingDown, flecha hacia abajo)
  3. Verificar que los tres tipos son visualmente distinguibles
- **Esperado:** Los tres tipos de ícono tienen colores claramente distintos. Los textos acompañan la dirección del cambio
- **Resultado:**
- **Notas:** Si no hay filas de algún tipo (por ejemplo, no hubo bajadas recientes), el tipo no aparece — es correcto

---

## Eje 3 — Casos borde

| # | Caso | Acción | Esperado | Resultado |
|---|------|--------|----------|-----------|
| 1 | Taller sin ningún cambio de nivel | Login como un taller que nunca cambió de nivel → ir a /taller | Sección "Historial de nivel" NO aparece | |
| 2 | Primer cambio de nivel (1 sola entrada) | Si un taller solo tuvo 1 cambio → ir a /taller | Sección "Historial de nivel" NO aparece (se necesitan >1) | |
| 3 | Taller sin AFIP verificado | Login como taller sin AFIP → revisar desglose | La línea "+ N pts CUIT verificado" NO aparece | |
| 4 | Taller sin validaciones completadas | Login como taller sin completadas → revisar desglose | La línea "+ N pts documentos" NO aparece | |
| 5 | Taller sin certificados | Login como taller sin certificados → revisar desglose | La línea "+ N pts capacitaciones" NO aparece | |
| 6 | Banner desaparece después de 24hs | Esperar 24hs desde el cambio de nivel (o verificar la lógica con la fecha) | Banner de subida/bajada no aparece pasadas las 24hs | |

---

## Eje 4 — Performance

| Verificación | Método | Resultado |
|-------------|--------|-----------|
| Dashboard taller carga en < 3s | DevTools → Network → recargar `/taller` | |
| Dashboard estado carga en < 3s | DevTools → Network → recargar `/estado` | |
| Sin errores en consola del browser | DevTools → Console → revisar en `/taller` y `/estado` | |
| Funciona en móvil (responsive) | DevTools → Toggle device toolbar → probar ambos dashboards | |

---

## Eje 5 — Consistencia visual

| Verificación | Resultado | Notas |
|-------------|-----------|-------|
| Banner verde de subida tiene borde-izquierdo verde + fondo green-50 | | |
| Banner amarillo de bajada tiene borde-izquierdo amber + fondo amber-50 | | |
| Desglose del puntaje usa texto gris pequeño (text-xs text-gray-400) | | |
| Historial de nivel usa flechas ↑↓ con colores correctos | | |
| Íconos en Estado son coherentes (verde/azul/amarillo) | | |
| Tipografías consistentes (Overpass para títulos) | | |
| Textos en español argentino | | |
| Sin texto en inglés visible al usuario | | |

---

## Resumen de issues abiertos

| Issue | Tipo | Descripción | Prioridad sugerida |
|-------|------|-------------|-------------------|
| — | — | — | — |

---

## Notas del auditor

[Observaciones generales, sugerencias de UX, contexto adicional]

**Nota sobre logs históricos:** Algunos registros anteriores al fix pueden tener `accion: 'NIVEL_SUBIDO'` aunque fueron bajadas reales. Esto es una limitación conocida y aceptada para el piloto. Los nuevos registros ya se crean correctamente.

---

## Checklist de cierre

- [ ] Todos los criterios de aceptación del spec verificados (11 criterios)
- [ ] 9 pasos de navegación probados
- [ ] 6 casos borde probados
- [ ] Performance revisada en desktop y móvil
- [ ] Issues abiertos en GitHub con labels correctos
- [ ] Resultado global definido
- [ ] Documento commiteado a develop
