# Discovery W-B (ACOTADO) — Consistencia reporte sectorial ↔ formulario W-A

> **Tipo:** Discovery acotado (análisis, NO implementación). · **Fecha:** 2026-06-13 · **Rama:** `develop`.
> **Alcance deliberado:** NO las ~22h del reporte sectorial completo (eso es **deseable post-MVP**). Una sola pregunta de **consistencia**:
>
> **¿El reporte/analítica sectorial que existe HOY refleja las categorías NUEVAS de W-A, o quedó mostrando las viejas?**

---

> **ACTUALIZACIÓN (2026-06-13, al implementar el fix):** el bug era **más amplio** que lo que este discovery detectó. Al editar los archivos se confirmó que **`organizacion` y `registroProduccion` tenían el mismo problema de labels viejos** (no solo `escalabilidad`): el dashboard sectorial no etiquetaba `mixta` y el perfil del taller mostraba `mixta` como "Prenda completa" y `sin-sistematico` como "Sin registro". El discovery los había marcado "new-aware" mirando solo las queries `groupBy` (correctas) y no los mapas de labels (incompletos). **Los 3 campos se corrigieron juntos** vía fuente única `src/compartido/lib/taller-formulario.ts`. La clasificación de §3 (bug de consistencia chico, ~1–2h) se mantiene; solo aumentó el alcance dentro de los mismos 2 archivos.

## 0. TL;DR

**SÍ existe un reporte sectorial** (`(estado)/estado/sector/page.tsx`) que agrega los datos del formulario del taller. **Está casi todo new-aware**, salvo **un campo: `escalabilidad`**, cuyo mapeo de etiquetas quedó con los **valores VIEJOS**. Eso produce un **bug de consistencia chico y concreto** en dos lugares.

→ **Hay deuda de consistencia, pero acotada: solo los labels de `escalabilidad` en 2 archivos.** Fix estimado **~1–2h**, totalmente separado de las ~22h de W-B completo.

→ Aparte (NO consistencia, sí "deseable post-MVP"): dos campos nuevos (`disponibilidad`, `rolesFuncionales`) **no los agrega ningún reporte todavía** — es feature faltante, no dato sucio.

---

## 1. ¿Existe un reporte/dashboard que agregue datos del formulario?

**Sí:** `src/app/(estado)/estado/sector/page.tsx` — dashboard sectorial de ESTADO. Hace `prisma.taller.groupBy` / `tallerPlantilla.groupBy` sobre los campos del formulario:

| Campo del formulario | ¿Lo agrega el reporte? | ¿New-aware? |
|---|---|---|
| `organizacion` (incl. `mixta`) | ✅ groupBy (línea ~73) | ✅ sí |
| `plantilla` (`taller_plantilla`, enum CategoriaOficioTextil) | ✅ groupBy por `categoria` (línea ~79) | ✅ sí (APRENDIZ/MEDIO_OFICIAL/OFICIAL/OFICIAL_CALIFICADO) |
| `registroProduccion` (incl. `sin-sistematico`) | ✅ groupBy (línea ~83) | ✅ sí |
| **`escalabilidad`** | ✅ groupBy (línea ~89) | ❌ **labels VIEJOS** (ver §2) |
| `disponibilidad` (nuevo) | ❌ no lo agrega nadie | — (deseable) |
| `rolesFuncionales` (nuevo) | ❌ no lo agrega nadie | — (deseable) |

Otros consumidores de datos de taller que **NO** dependen de estos campos (sin riesgo): `demanda-insatisfecha.ts` (agrega por nivel/capacidad/procesos), `exportar/data.ts`, `reporte-piloto`, `admin/reportes` — ninguno toca organizacion/escalabilidad/etc.

---

## 2. El hallazgo de consistencia: `escalabilidad` con labels viejos

El formulario nuevo (`completar/page.tsx:576–579`) guarda **4 valores nuevos**: `turnos`, `contratar`, `tercerizar`, `maquinaria`. La migración `20260525180000` además **borró** los viejos `no-puedo`/`horas-extra` (`UPDATE ... SET escalabilidad = NULL`). Pero **dos consumidores siguen mapeando los valores viejos**:

### (a) Dashboard sectorial ESTADO — `(estado)/estado/sector/page.tsx:28–34`
```ts
const escLabels: Record<string, string> = {
  turno: 'Segundo turno',          // ❌ el form guarda 'turnos', no 'turno'
  tercerizar: 'Tercerización',     // ✅
  contratar: 'Contratando personal',// ✅
  'horas-extra': 'Horas extra',    // ❌ borrado por la migración
  no: 'Sin capacidad',             // ❌ valor viejo
}
```
Faltan `turnos` y `maquinaria` (los dos valores nuevos más usados). El `groupBy(['escalabilidad'])` devuelve filas con value `turnos`/`maquinaria` que **no tienen label** → se muestran como crudo/"Desconocido". **El reporte sectorial muestra mal la categoría de escalabilidad.**

### (b) Perfil del propio taller — `(taller)/taller/perfil/page.tsx:235–239`
```tsx
{taller.escalabilidad === 'turno' ? 'Segundo turno'        // ❌ guarda 'turnos'
 : taller.escalabilidad === 'tercerizar' ? 'Tercerización'  // ✅
 : taller.escalabilidad === 'contratar' ? 'Contratando personal' // ✅
 : taller.escalabilidad === 'horas-extra' ? 'Horas extra'   // ❌ borrado
 : 'Sin capacidad de escalar'}                              // ← cae acá para turnos/maquinaria
```
Un taller que eligió "Ampliando turnos" (`turnos`) o "Invirtiendo en maquinaria" (`maquinaria`) ve **"Sin capacidad de escalar"** en su propio perfil — **dato visiblemente equivocado**.

> Es exactamente el riesgo de acoplamiento que el master advierte ("cambiar el formulario W-A sin el reporte W-B genera datos sucios") — pero el daño real quedó reducido a **un solo campo**.

---

## 3. Clasificación del hallazgo

| Frente | ¿Qué es? | Urgencia | Estimación |
|---|---|---|---|
| **`escalabilidad` labels viejos** (sector + perfil taller) | **Bug de CONSISTENCIA** (muestra categorías viejas / "Sin capacidad" para datos válidos nuevos) | **Sí, vale ahora** (chico) | **~1–2h** |
| `disponibilidad`/`rolesFuncionales` sin agregar en ningún reporte | Feature faltante (dato nuevo no surfaceado), NO dato sucio | No urgente — parte de W-B completo | (incluido en las ~22h) |
| W-B completo (rediseño reporte sectorial, tablas nuevas, geocoding) | Deseable post-MVP | No urgente | ~22h (master) |

---

## 4. Recomendación

1. **Fix de consistencia de `escalabilidad` (recomendado, ~1–2h):** actualizar los dos mapeos a los 4 valores nuevos `{turnos, contratar, tercerizar, maquinaria}`, borrar las claves muertas (`turno`, `horas-extra`, `no`), agregar `maquinaria`. Tocar **solo** `(estado)/estado/sector/page.tsx` (escLabels) y `(taller)/taller/perfil/page.tsx` (display). Sin schema, sin migración. **Decisión de Gerardo: fix ahora (PR chico) o a DEUDA.**
   - *Recomendación:* hacerlo ahora — es un bug visible (el taller ve su propia escalabilidad mal) y barato. Sumar un assert al e2e del wizard (T-06) que cubra que `turnos`/`maquinaria` se muestran bien.
2. **`disponibilidad` + `rolesFuncionales` en reportes:** dejar para **W-B completo post-MVP**. No es dato sucio (nadie los muestra mal; simplemente no se muestran aún). Sin urgencia.
3. **W-B completo (~22h):** confirmado **deseable, no urgente**. El acoplamiento W-A↔W-B NO está roto a nivel datos (los campos se guardan bien); solo el label de un campo se muestra viejo. Una vez aplicado el fix del punto 1, **no hay deuda de consistencia pendiente**.

---

## 5. Riesgos

- **Bajo.** El fix del punto 1 es de presentación pura (mapeo de strings a labels), sin tocar datos ni queries de agregación (el `groupBy` ya agrupa por el valor correcto; solo falta etiquetarlo). Riesgo de regresión mínimo.
- **Nota de dato:** como la migración ya puso `escalabilidad = NULL` para los valores viejos, **no quedan filas con `turno`/`horas-extra`/`no` en la DB** — las claves viejas del mapeo son código muerto, su borrado no pierde nada.

---

## 6. Respuesta a la pregunta del discovery

> ¿El reporte sectorial refleja las categorías nuevas o las viejas?

**Refleja las nuevas en 3 de 4 campos** (organizacion, registroProduccion, plantilla). **En `escalabilidad` muestra labels viejos** → bug de consistencia chico (~1–2h, 2 archivos). **Sí hay deuda de consistencia, acotada y barata** — recomiendo fixearla ya, separada de las ~22h de W-B completo (que queda deseable post-MVP, sin urgencia).
