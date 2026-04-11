# Spec: Log de niveles bidireccional + panel transparente

**Versión:** v2
**Asignado a:** Gerardo (backend `nivel.ts` + dashboard Estado) + Sergio (UI dashboard taller)
**Prioridad:** P0
**Resuelve:** H-20 (`NIVEL_SUBIDO` incorrecto al bajar), S5-02, S5-03
**Sin cambios de schema — 0 migraciones**

---

## 1. Contexto

Cuando un taller baja de nivel (ej: `PLATA → BRONCE` porque se revocó una validación o un certificado), `aplicarNivel` en `nivel.ts:111-117` registra igualmente la acción `NIVEL_SUBIDO`:

```ts
if (nivelAnterior !== resultado.nivel) {
  logActividad('NIVEL_SUBIDO', userId, {  // ← siempre SUBIDO, aunque haya bajado
    tallerId,
    nivelAnterior,
    nivelNuevo: resultado.nivel,
  })
}
```

El dashboard del taller (`/taller/page.tsx:32-46`) lee ese log en las últimas 24hs y muestra un banner de celebración *"¡Subiste a nivel BRONCE!"* con ícono de medalla — doble error visual: texto incorrecto + celebración indebida.

Además, el dashboard del taller **no tiene historial** de cambios de nivel, y el puntaje se muestra como un número sin desglose (no se ve de dónde viene).

El fix es quirúrgico: comparar la dirección del cambio antes de escribir el log, y actualizar 3 vistas para manejar ambos casos. **Sin cambios de schema** — el modelo `LogActividad` con `accion String` y `detalles Json?` ya soporta cualquier valor.

---

## ⚠️ ANTES DE ARRANCAR (Sergio)

- [ ] **Gerardo mergeó el fix de `nivel.ts`** con la lógica bidireccional (Acción 1 del §2)
- [ ] Al menos un taller tuvo una bajada real registrada con `accion: 'NIVEL_BAJADO'` O se simula desde Supabase para poder testear

### Simular una bajada para testing de UI

Si todavía no hay bajadas reales en DB, insertar manualmente desde el SQL editor de Supabase:

```sql
INSERT INTO log_actividad (id, user_id, accion, detalles, timestamp)
VALUES (
  gen_random_uuid(),
  '<admin_user_id>',
  'NIVEL_BAJADO',
  '{"tallerId":"<taller_id>","nivelAnterior":"PLATA","nivelNuevo":"BRONCE"}'::jsonb,
  now()
);
```

Reemplazar `<admin_user_id>` por el ID de Lucía Fernández y `<taller_id>` por el del taller que quiera testear (por ejemplo, el de Graciela Sosa para simular una bajada de PLATA a BRONCE). Luego login como ese taller → ver el banner amarillo. Borrar la fila después del test para no contaminar los datos.

---

## 2. Cambios de backend — Gerardo

### Acción 1 — Corregir la dirección del log en `aplicarNivel`

**Archivo:** `src/compartido/lib/nivel.ts`

En las líneas 111-117:

```ts
// ANTES:
if (nivelAnterior !== resultado.nivel) {
  logActividad('NIVEL_SUBIDO', userId, {
    tallerId,
    nivelAnterior,
    nivelNuevo: resultado.nivel,
  })
}

// DESPUÉS:
if (nivelAnterior !== resultado.nivel) {
  const nivelOrder: Record<string, number> = { BRONCE: 0, PLATA: 1, ORO: 2 }
  const subio = nivelOrder[resultado.nivel] > nivelOrder[nivelAnterior]
  logActividad(subio ? 'NIVEL_SUBIDO' : 'NIVEL_BAJADO', userId, {
    tallerId,
    nivelAnterior,
    nivelNuevo: resultado.nivel,
  })
}
```

El `nivelOrder` mapea los niveles a enteros comparables. Si el nuevo es mayor, es subida. Si es menor, es bajada. No puede ser igual porque el `if` exterior ya descarta ese caso.

### Acción 2 — Incluir `NIVEL_BAJADO` en la query de actividad reciente del Estado

**Archivo:** `src/app/(estado)/estado/page.tsx`

En la query `logsNivel` (aproximadamente líneas 79-84 del original):

```ts
// ANTES:
const logsNivel = await prisma.logActividad.findMany({
  where: { accion: { in: ['VALIDACION_APROBADA', 'NIVEL_SUBIDO'] } },
  orderBy: { timestamp: 'desc' },
  take: 5,
  include: { user: { select: { name: true } } },
})

// DESPUÉS:
const logsNivel = await prisma.logActividad.findMany({
  where: { accion: { in: ['VALIDACION_APROBADA', 'NIVEL_SUBIDO', 'NIVEL_BAJADO'] } },
  orderBy: { timestamp: 'desc' },
  take: 5,
  include: { user: { select: { name: true } } },
})
```

**Importante**: este cambio por sí solo no alcanza — hay que también actualizar la UI que renderiza estos logs. Ver Acción 3.

### Acción 3 — Hacer dinámico el texto del dashboard del Estado 🔴 CRÍTICO

**Archivo:** `src/app/(estado)/estado/page.tsx` (aproximadamente líneas 262-281)

La UI actual tiene un texto hardcoded `' aprobo validacion'` que se aplica a **todas** las filas del filtro — esto ya es un bug pre-existente porque los logs `NIVEL_SUBIDO` se muestran con el texto "aprobó validación". Agregar `NIVEL_BAJADO` al filtro sin tocar la UI agrava el problema.

**Fix**: reemplazar el texto hardcoded por un mapa dinámico según `log.accion`.

Imports arriba del archivo (ya debería tener `FileCheck` importado, agregar los otros dos):

```ts
import { FileCheck, TrendingUp, TrendingDown, /* ...resto */ } from 'lucide-react'
```

Agregar antes del `return` o al inicio del JSX del componente:

```ts
const textoPorAccion: Record<string, { texto: string; icono: React.ReactNode }> = {
  VALIDACION_APROBADA: {
    texto: 'aprobó una validación',
    icono: <FileCheck className="w-4 h-4 text-green-500 shrink-0" />,
  },
  NIVEL_SUBIDO: {
    texto: 'subió de nivel',
    icono: <TrendingUp className="w-4 h-4 text-blue-500 shrink-0" />,
  },
  NIVEL_BAJADO: {
    texto: 'bajó de nivel',
    icono: <TrendingDown className="w-4 h-4 text-amber-500 shrink-0" />,
  },
}
```

Reemplazar el bloque de renderizado de cada log (líneas ~266-278) por:

```tsx
{logsNivel.map((log) => {
  const info = textoPorAccion[log.accion] ?? textoPorAccion.VALIDACION_APROBADA
  return (
    <div key={log.id} className="py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {info.icono}
        <div>
          <p className="text-sm">
            <span className="font-semibold">{log.user?.name || 'Admin'}</span>
            {' '}{info.texto}
          </p>
          <p className="text-xs text-gray-400">{log.timestamp.toLocaleDateString('es-AR')}</p>
        </div>
      </div>
    </div>
  )
})}
```

Con esto:

- `VALIDACION_APROBADA` → ícono verde + *"aprobó una validación"* (sin cambios vs hoy)
- `NIVEL_SUBIDO` → ícono azul + *"subió de nivel"* (antes decía mal "aprobó validación")
- `NIVEL_BAJADO` → ícono amarillo + *"bajó de nivel"* (nuevo)

Cierra el bug pre-existente y cubre el caso nuevo en un solo cambio.

---

## 3. Cambios de UI — Sergio

**Archivo:** `src/app/(taller)/taller/page.tsx`

### Imports a agregar al inicio del archivo

```ts
import {
  PTS_VERIFICADO_AFIP,
  PTS_POR_VALIDACION,
  PTS_POR_CERTIFICADO,
  PUNTAJE_MAX,
} from '@/compartido/lib/nivel'
```

Las cuatro constantes **ya están exportadas** en `nivel.ts:29-32`, no hace falta tocar ese archivo.

### Cambio 1 — Incluir certificados en la query del taller + definir variables

El query actual incluye `validaciones` pero no `certificados`. Hay que extenderlo:

```ts
const taller = await prisma.taller.findFirst({
  where: { userId: session.user.id },
  include: {
    validaciones: true,
    certificados: { where: { revocado: false } },   // ← agregar
  },
})

// Después del query, definir las variables que el desglose necesita:
const certificadosActivos = taller?.certificados.length ?? 0
// La variable `completadas` ya existe en la línea 67 del archivo actual:
// const completadas = validaciones.filter((v) => v.estado === 'COMPLETADO').length
// Usar esa variable tal cual, no renombrar.
```

### Cambio 2 — Ampliar la query de detección de cambio reciente para incluir bajadas

Reemplazar el bloque de las líneas 32-46:

```ts
// ANTES:
const hace24hs = new Date(Date.now() - 24 * 60 * 60 * 1000)
const logNivelReciente = taller
  ? await prisma.logActividad.findFirst({
      where: {
        accion: 'NIVEL_SUBIDO',
        timestamp: { gte: hace24hs },
        detalles: { path: ['tallerId'], equals: taller.id },
      },
      orderBy: { timestamp: 'desc' },
    })
  : null
const nivelNuevo = logNivelReciente
  ? (logNivelReciente.detalles as { nivelNuevo?: string })?.nivelNuevo
  : null

// DESPUÉS:
const hace24hs = new Date(Date.now() - 24 * 60 * 60 * 1000)
const logNivelReciente = taller
  ? await prisma.logActividad.findFirst({
      where: {
        accion: { in: ['NIVEL_SUBIDO', 'NIVEL_BAJADO'] },  // ← AMPLIADO
        timestamp: { gte: hace24hs },
        detalles: { path: ['tallerId'], equals: taller.id },
      },
      orderBy: { timestamp: 'desc' },
    })
  : null

const cambioNivel = logNivelReciente
  ? {
      accion: logNivelReciente.accion as 'NIVEL_SUBIDO' | 'NIVEL_BAJADO',
      nivelNuevo: (logNivelReciente.detalles as { nivelNuevo?: string })?.nivelNuevo,
      nivelAnterior: (logNivelReciente.detalles as { nivelAnterior?: string })?.nivelAnterior,
    }
  : null
```

### Cambio 3 — Query para historial de niveles (S5-03)

Agregar después del cambio 2:

```ts
// Últimos 10 cambios de nivel para este taller
const historialNiveles = taller
  ? await prisma.logActividad.findMany({
      where: {
        accion: { in: ['NIVEL_SUBIDO', 'NIVEL_BAJADO'] },
        detalles: { path: ['tallerId'], equals: taller.id },
      },
      orderBy: { timestamp: 'desc' },
      take: 10,
    })
  : []
```

Usa el índice existente `@@index([accion, timestamp])` del modelo `LogActividad`. Performance OK para volumen del piloto.

### Cambio 4 — Banner dual según dirección del cambio

Reemplazar el bloque actual del banner (líneas ~104-111) por:

```tsx
{cambioNivel && cambioNivel.nivelNuevo && (
  cambioNivel.accion === 'NIVEL_SUBIDO' ? (
    // Banner de celebración — verde
    <div className="border-l-4 border-l-green-500 bg-green-50 rounded-xl p-4 flex items-center gap-3">
      <span className="text-2xl">
        {cambioNivel.nivelNuevo === 'ORO' ? '🥇' : '🥈'}
      </span>
      <div>
        <p className="font-overpass font-bold text-green-800">
          ¡Subiste a nivel {cambioNivel.nivelNuevo}!
        </p>
        <p className="text-sm text-green-600">
          Ahora tenés más visibilidad en el directorio.
        </p>
      </div>
    </div>
  ) : (
    // Banner de alerta — amarillo
    <div className="border-l-4 border-l-amber-500 bg-amber-50 rounded-xl p-4 flex items-center gap-3">
      <span className="text-2xl">⚠️</span>
      <div>
        <p className="font-overpass font-bold text-amber-800">
          Tu nivel bajó a {cambioNivel.nivelNuevo}
        </p>
        <p className="text-sm text-amber-600">
          Revisá tus documentos en Formalización para volver a subir.
        </p>
      </div>
    </div>
  )
)}
```

> **Nota sobre logs históricos**: algunos logs viejos tienen `accion: 'NIVEL_SUBIDO'` aunque fueron bajadas reales (bug pre-fix). El banner los va a mostrar como subidas — incorrecto para los históricos, correcto para los nuevos. Se acepta como limitación conocida del piloto.

### Cambio 5 — Desglose del puntaje (orden de layout)

**Posición prescrita**: debajo del número grande del puntaje (línea 184 del original) y antes de cualquier otro contenido de esa card.

```tsx
<p className="text-3xl font-bold text-brand-red">{taller?.puntaje ?? 0}</p>

{/* Desglose del puntaje — qué aporta cada componente */}
<div className="text-xs text-gray-400 space-y-0.5 mt-1">
  {taller?.verificadoAfip && (
    <p>+ {PTS_VERIFICADO_AFIP} pts CUIT verificado</p>
  )}
  {completadas > 0 && (
    <p>+ {completadas * PTS_POR_VALIDACION} pts documentos ({completadas})</p>
  )}
  {certificadosActivos > 0 && (
    <p>+ {certificadosActivos * PTS_POR_CERTIFICADO} pts capacitaciones ({certificadosActivos})</p>
  )}
  {/* Cap en 100: cuando la suma bruta excede PUNTAJE_MAX, el puntaje real se trunca.
      Mostrar una línea explícita para evitar la inconsistencia visual
      "mi puntaje es 100 pero el desglose suma 125". */}
  {(taller?.puntaje ?? 0) >= PUNTAJE_MAX && (
    <p className="text-gray-500 font-medium mt-1">
      Puntaje máximo alcanzado ({PUNTAJE_MAX} pts)
    </p>
  )}
</div>
```

Usa `completadas` (variable ya existente en línea 67 del archivo actual), no inventar `validacionesCompletadas`. Usa `certificadosActivos` definido en el Cambio 1.

### Cambio 6 — Sección "Historial de nivel" (orden de layout)

**Posición prescrita**: **debajo del desglose del puntaje** (o sea, debajo de la card del puntaje completa). Ambos — desglose y historial — son contexto del nivel actual, conviene que queden juntos visualmente.

Renderizar solo si el taller tuvo más de 1 cambio de nivel:

```tsx
{historialNiveles.length > 1 && (
  <div className="bg-white rounded-xl border border-gray-100 p-6">
    <h2 className="font-overpass font-bold text-gray-800 mb-4">Historial de nivel</h2>
    <div className="space-y-2">
      {historialNiveles.map(log => {
        const detalles = log.detalles as { nivelAnterior?: string; nivelNuevo?: string }
        const subio = log.accion === 'NIVEL_SUBIDO'
        return (
          <div
            key={log.id}
            className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0"
          >
            <div className="flex items-center gap-2">
              <span className={subio ? 'text-green-600' : 'text-amber-600'}>
                {subio ? '↑' : '↓'}
              </span>
              <span className="text-gray-600">
                {detalles.nivelAnterior} → {detalles.nivelNuevo}
              </span>
            </div>
            <span className="text-gray-400 text-xs">
              {new Date(log.timestamp).toLocaleDateString('es-AR')}
            </span>
          </div>
        )
      })}
    </div>
  </div>
)}
```

El primer cambio (1 sola entrada) se oculta porque no es "historial" sino la primera vez que el taller cambió de nivel — no hay nada con qué comparar.

---

## 4. Nota sobre logs históricos incorrectos

Hay registros en DB con `accion: 'NIVEL_SUBIDO'` que en realidad fueron bajadas (antes del fix de la Acción 1). Para el piloto con pocos datos **no es crítico**: el nuevo código discrimina correctamente desde el momento del deploy, y los logs históricos incorrectos quedarán mezclados con los correctos en el dashboard del Estado (mostrados como "subió de nivel" aunque hayan sido bajadas).

Si en algún momento se quiere corregir la historia, un script one-shot en TypeScript puede releer cada log de `NIVEL_SUBIDO`, comparar `detalles.nivelAnterior` contra `detalles.nivelNuevo` usando el mismo `nivelOrder`, y re-etiquetar las filas donde la dirección sea descendente. **Postponer a post-piloto** cuando haya volumen real — no es parte de este spec.

---

## 5. Casos borde

- **Taller sin ningún cambio de nivel** → `historialNiveles.length === 0` → sección no renderiza.
- **Primer cambio de nivel** → `historialNiveles.length === 1` → sección no renderiza (no hay historia comparable), solo el banner del cambio reciente.
- **Taller con AFIP + 7 validaciones + 3 certificados** → suma bruta 125, puntaje real 100 por el cap, desglose muestra las 3 líneas + *"Puntaje máximo alcanzado"*.
- **Taller sin AFIP verificado** → la línea de CUIT no aparece (condición `taller?.verificadoAfip`).
- **Taller sin validaciones completadas** → línea de documentos no aparece (condición `completadas > 0`).
- **Taller sin certificados** → línea de capacitaciones no aparece.
- **Log con `detalles` malformado** (sin `nivelNuevo` o sin `nivelAnterior`) → el banner y el historial lo muestran con `undefined` o se saltea — no rompe el render.
- **Logs históricos con `NIVEL_SUBIDO` mal etiquetado** → aparecen como subidas aunque fueron bajadas. Limitación conocida, aceptada.
- **Caso imposible por el `if` exterior**: `nivelAnterior === nivel.nuevo`. El `nivelOrder` no lo contempla, pero ese camino nunca se ejecuta porque el `if (nivelAnterior !== resultado.nivel)` lo descarta antes.

---

## 6. Criterio de aceptación

- [ ] Taller que baja de PLATA a BRONCE → `logActividad` crea fila con `accion: 'NIVEL_BAJADO'` y payload correcto
- [ ] Taller que sube de BRONCE a PLATA → sigue creando fila con `accion: 'NIVEL_SUBIDO'` (sin regresión)
- [ ] Dashboard del taller muestra banner **amarillo** con ⚠️ al bajar de nivel
- [ ] Dashboard del taller muestra banner **verde** con 🥈/🥇 al subir de nivel
- [ ] Dashboard del Estado `/estado` muestra "bajó de nivel" con ícono `TrendingDown` amarillo para filas `NIVEL_BAJADO`
- [ ] Dashboard del Estado muestra "subió de nivel" con ícono `TrendingUp` azul para filas `NIVEL_SUBIDO` (fix del bug pre-existente)
- [ ] Dashboard del Estado muestra "aprobó una validación" con ícono `FileCheck` verde para `VALIDACION_APROBADA` (comportamiento original preservado)
- [ ] Historial de nivel aparece en el dashboard del taller si tuvo más de 1 cambio
- [ ] Desglose del puntaje visible debajo del número grande
- [ ] Cuando el puntaje está capped en 100, aparece la línea *"Puntaje máximo alcanzado"*
- [ ] Build de TypeScript pasa sin errores

---

## 7. Tests (verificación manual)

1. **Fix del bug H-20**:
   - Login como admin (Lucía Fernández)
   - En DB: revocar una validación de Graciela Sosa (TALLER PLATA) para forzar una bajada
   - Verificar en Supabase que la fila nueva en `log_actividad` tiene `accion = 'NIVEL_BAJADO'`
2. **Banner amarillo de bajada**:
   - Login como Graciela Sosa
   - Ir a `/taller` → verificar que aparece el banner amarillo con *"Tu nivel bajó a BRONCE"* y el ⚠️
3. **Banner verde de subida (sin regresión)**:
   - Como admin, aprobar una validación pendiente de Roberto Giménez (TALLER BRONCE)
   - Si el nuevo nivel queda en PLATA, login como Roberto → verificar banner verde con 🥈 *"¡Subiste a nivel PLATA!"*
4. **Dashboard del Estado con texto dinámico**:
   - Login como Ana Belén Torres (ESTADO)
   - Ir a `/estado` → en la card "Actividad reciente" verificar que las 3 líneas muestran textos distintos:
     - *"Admin aprobó una validación"* con ícono verde
     - *"Admin subió de nivel"* con ícono azul
     - *"Admin bajó de nivel"* con ícono amarillo
5. **Historial de nivel en el dashboard del taller**:
   - Como Graciela Sosa (después de haber subido y bajado una vez), ir a `/taller`
   - Verificar que aparece la sección "Historial de nivel" con las 2 entradas cronológicamente (↑ verde y ↓ amarillo), la más reciente arriba
6. **Desglose del puntaje**:
   - Como Carlos Mendoza (TALLER ORO con AFIP + varias validaciones + certificados) → ir a `/taller`
   - Verificar que el desglose muestra las 3 líneas (+10 AFIP + N documentos + M capacitaciones)
   - Si la suma bruta excede 100, verificar que aparece *"Puntaje máximo alcanzado (100 pts)"*
7. **Simulación con SQL** (si no hay bajadas reales):
   - Usar el snippet de la sección "⚠️ Antes de arrancar" para insertar una fila sintética
   - Testear los banners y el historial
   - Borrar la fila al terminar

---

## 8. Archivos tocados

| Archivo | Cambios | Responsable |
|---|---|---|
| `src/compartido/lib/nivel.ts` | Corregir dirección del log (Acción 1) | Gerardo |
| `src/app/(estado)/estado/page.tsx` | Filtro + texto dinámico + imports de lucide (Acciones 2 y 3) | Gerardo |
| `src/app/(taller)/taller/page.tsx` | Include certificados, variables, banner dual, historial, desglose (Cambios 1-6) | Sergio |

**3 archivos tocados, 0 archivos nuevos, 0 migraciones.** El spec más chico de los v2 y uno de los de mayor impacto visible para el usuario final.
