# Spec: Épica Academia — Quiz obligatorio y certificación

**Versión:** v2
**Asignado a:** Gerardo (backend) + Sergio (UI)
**Unifica:** S4-02 (progreso verificable) + S4-03 (quiz → certificado)

---

## 1. Contexto

El flujo quiz → certificado ya está casi completo pero tiene cuatro problemas:

1. **Gate de videos puramente cosmético** — el requisito de ver todos los videos vive solo en el cliente (`academia-cliente.tsx:197-210`). Se bypasea clickeando por la lista sin reproducir nada, o llamando directamente al POST con `fetch`.
2. **El endpoint de progreso confía en el cliente** — `POST /api/colecciones/[id]/progreso` recibe `videosVistos` y `totalVideos` del body y los persiste tal cual. Cualquier taller puede postear `{videosVistos: 1, totalVideos: 1}` y tener el 100% sin ver nada.
3. **`aplicarNivel` se llama sin `await`** — el nivel puede quedar desactualizado silenciosamente si la llamada falla.
4. **Fire-and-forget sin logging** — si falla el email o la generación del QR, no queda rastro.

Este spec fija los cuatro problemas con cambios localizados en 3 archivos.

---

## 2. Decisiones

- El gate de videos se mueve al backend en **dos niveles**: (a) el endpoint de evaluación valida `porcentajeCompletado >= 100` antes de corregir, y (b) el endpoint de progreso calcula `porcentajeCompletado` server-side usando el conteo real de videos de la colección (no confía en el cliente).
- Sin límite de intentos para el piloto — se puede agregar después usando la tabla `IntentoEvaluacion` que ya existe.
- Logging básico en los fire-and-forget — `console.error` con prefijo `[academia]`.
- `aplicarNivel` pasa a `await` pero envuelto en su propio try/catch para no romper la respuesta exitosa si falla.

---

## 3. Backend — endpoint de evaluación

**Archivo:** `src/app/api/colecciones/[id]/evaluacion/route.ts`

### 3.1 Gate de progreso (prerrequisito del quiz)

Después de cargar el taller y la colección (línea ~74, después del check `if (!coleccion.evaluacion)`), agregar:

```ts
// Verificar que el taller completó todos los videos
const progreso = await prisma.progresoCapacitacion.findUnique({
  where: { tallerId_coleccionId: { tallerId: taller.id, coleccionId } },
  select: { porcentajeCompletado: true },
})
if ((progreso?.porcentajeCompletado ?? 0) < 100) {
  return NextResponse.json(
    { error: 'Debés completar todos los videos antes de rendir la evaluación' },
    { status: 403 }
  )
}
```

> Usar la variable `coleccionId` ya destructurada de `const { id: coleccionId } = await params` — `params.id` no está disponible porque `params` es `Promise` en Next.js 15+.

### 3.2 Fix del bug `yaExiste`: agregar `codigo` a la respuesta

En el check idempotente (líneas ~77-82), la query actual ya devuelve toda la fila de `Certificado`, entonces `certExistente.codigo` ya existe en memoria — solo falta incluirlo en el JSON de respuesta:

```ts
// ANTES:
return NextResponse.json({
  aprobado: true,
  calificacion: certExistente.calificacion,
  certificadoId: certExistente.id,
  yaExiste: true,
})

// DESPUÉS:
return NextResponse.json({
  aprobado: true,
  calificacion: certExistente.calificacion,
  certificadoId: certExistente.id,
  codigo: certExistente.codigo,       // ← nuevo: soluciona "Código: undefined" en UI
  yaExiste: true,
})
```

### 3.3 `await aplicarNivel` envuelto en try/catch local

En la rama "aprobado" (línea ~132), cambiar:

```ts
// ANTES — fire-and-forget:
aplicarNivel(taller.id, session.user.id)

// DESPUÉS — await con try/catch aislado:
try {
  await aplicarNivel(taller.id, session.user.id)
} catch (err) {
  console.error('[academia] Error recalculando nivel tras certificado:', err)
  // No re-throw: el certificado ya fue creado (línea 104), no queremos
  // que un fallo en aplicarNivel convierta una respuesta 200 en 500.
  // El nivel se recalculará en el próximo trigger (otra validación, otro cert).
}
```

> **Importante:** `aplicarNivel` NO puede ir envuelto en el try/catch principal del handler. Si lo envolvés ahí y falla, el handler retorna 500 aunque el `Certificado` ya exista en DB, y el cliente pierde la pantalla "¡Aprobaste!". El try/catch local preserva la respuesta exitosa.

### 3.4 Logging en los fire-and-forget

Reemplazar los `.catch(() => {})` por catches con logging explícito:

```ts
// Email
sendEmail({
  to: taller.user.email,
  ...buildCertificadoEmail({ nombreTaller: taller.nombre, tituloColeccion: coleccion.titulo, codigo: certificado.codigo, calificacion }),
}).catch((err) => {
  console.error('[academia] Error enviando email de certificado:', err)
})

// QR
generateQrBuffer(codigo)
  .then(async (qrBuffer) => {
    const qrPath = `qr/${taller.id}/${certificado.id}.png`
    const qrUrl = await uploadFile(qrBuffer, qrPath, 'image/png')
    if (qrUrl) {
      await prisma.certificado.update({
        where: { id: certificado.id },
        data: { qrCode: qrUrl },
      })
    }
  })
  .catch((err) => {
    console.error('[academia] Error generando QR del certificado:', err)
  })
```

---

## 4. Backend — endpoint de progreso (gate real, no bypasseable)

**Archivo:** `src/app/api/colecciones/[id]/progreso/route.ts`

El endpoint actual confía en el cliente para `totalVideos`, lo que permite bypasear cualquier gate posterior. Hay que calcular server-side.

### 4.1 Reemplazar el cálculo actual

```ts
// ANTES — confía en el cliente:
const { videosVistos, totalVideos } = body
const porcentajeCompletado =
  totalVideos > 0 ? Math.round((videosVistos / totalVideos) * 100) : 0

// DESPUÉS — totalVideos se calcula del schema, videosVistos se clampa:
const { videosVistos: videosVistosRaw } = body

// Contar videos reales de la colección
const coleccion = await prisma.coleccion.findUnique({
  where: { id: coleccionId },
  select: { _count: { select: { videos: true } } },
})
if (!coleccion) {
  return NextResponse.json({ error: 'Colección no encontrada' }, { status: 404 })
}
const totalVideos = coleccion._count.videos

// Clampar el input del cliente al rango válido
const videosVistos = Math.min(
  Math.max(0, Number(videosVistosRaw) || 0),
  totalVideos
)

const porcentajeCompletado =
  totalVideos > 0 ? Math.round((videosVistos / totalVideos) * 100) : 0
```

El `upsert` de `progresoCapacitacion` queda igual, pero ahora con los valores validados.

### 4.2 Por qué esto importa

Sin este cambio, el gate del endpoint de evaluación (§3.1) es teatro: un taller puede llamar directamente `POST /api/colecciones/[id]/progreso` con `{videosVistos: 1, totalVideos: 1}` y pasar el gate sin haber visto nada. El objetivo del spec es un gate real.

---

## 5. UI — AcademiaCliente

**Archivo:** `src/taller/componentes/academia-cliente.tsx`

### 5.1 Fix crítico: marcar el último video automáticamente

**Problema actual**: `seleccionarVideo(indice)` (líneas 72-76) solo marca el video *anterior* al seleccionado:

```tsx
function seleccionarVideo(indice: number) {
  setVideoActual(indice)
  if (indice > 0) marcarVisto(indice - 1)   // solo marca el anterior
}
```

Consecuencia: un taller que hace click por la lista hasta llegar al último video **nunca auto-marca el último**. Con el nuevo gate del backend, va a recibir 403 aunque en la UI vea todos los videos "abiertos".

**Fix**: al hacer click en "Rendir evaluación", marcar todos los videos como vistos antes de abrir el quiz. Reemplazar el `onClick` del botón (línea ~204):

```tsx
// ANTES:
<Button
  disabled={!todosVistos}
  onClick={() => {
    setRespuestas(new Array(evaluacion.preguntas.length).fill(-1))
    setMostrarQuiz(true)
  }}
>
  Rendir evaluación
</Button>

// DESPUÉS:
<Button
  disabled={!todosVistos}
  onClick={async () => {
    // Asegurar que todos los videos estén marcados antes de rendir.
    // Cubre el caso del último video que seleccionarVideo() nunca auto-marca.
    const faltantes = videos
      .map((_, i) => i)
      .filter(i => !videosVistos.has(i))
    for (const i of faltantes) {
      await marcarVisto(i)
    }
    setRespuestas(new Array(evaluacion.preguntas.length).fill(-1))
    setMostrarQuiz(true)
  }}
>
  Rendir evaluación
</Button>
```

> El `disabled={!todosVistos}` sigue siendo una barrera visual — si el usuario no hizo click en suficientes videos como para que `videosVistos.size === videos.length`, el botón está deshabilitado y el bloque de auto-marcado no se ejecuta. El auto-marcado es para el caso en que `todosVistos === true` (porque clickeó por la lista) pero algunos no estén en DB por los edge cases del tracking.

**Alternativa más simple** si el equipo prefiere: cambiar `seleccionarVideo` para marcar el video *actual* en lugar del anterior. Pero eso cambia la semántica del botón "✓ Marcar como visto" que ya existe. La versión del spec es más conservadora.

### 5.2 Type expandido para el estado del quiz

```ts
type ResultadoQuiz = {
  aprobado: boolean
  calificacion: number
  codigo?: string
  error?: string    // mensaje de prerrequisito (403) o error genérico
}

const [resultadoQuiz, setResultadoQuiz] = useState<ResultadoQuiz | null>(null)
```

### 5.3 Manejar 403 en `enviarQuiz`

```ts
async function enviarQuiz() {
  if (!evaluacion) return
  setEnviandoQuiz(true)
  try {
    const res = await fetch(`/api/colecciones/${coleccionId}/evaluacion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ respuestas }),
    })
    const data = await res.json()

    if (!res.ok) {
      if (res.status === 403) {
        setResultadoQuiz({
          aprobado: false,
          calificacion: 0,
          error: data.error ?? 'Completá todos los videos antes de rendir',
        })
      } else {
        setResultadoQuiz({
          aprobado: false,
          calificacion: 0,
          error: 'Error al enviar la evaluación. Intentá de nuevo.',
        })
      }
      return
    }

    setResultadoQuiz(data)
    if (data.aprobado) router.refresh()
  } finally {
    setEnviandoQuiz(false)
  }
}
```

### 5.4 Renderizar el 403 en la card de resultado

Reemplazar el bloque existente del estado `resultadoQuiz && !resultadoQuiz.aprobado` (líneas ~266-277) por:

```tsx
{resultadoQuiz && !resultadoQuiz.aprobado && (
  <>
    {resultadoQuiz.error ? (
      // Prerrequisito no cumplido (403) o error de red
      <Card className="bg-red-50 border border-red-200">
        <div className="flex items-center gap-3">
          <Lock className="w-5 h-5 text-red-500 shrink-0" />
          <div>
            <p className="font-semibold text-red-800">No podés rendir todavía</p>
            <p className="text-sm text-red-600">{resultadoQuiz.error}</p>
          </div>
        </div>
      </Card>
    ) : (
      // Reprobó el quiz
      <Card className="bg-red-50 border border-red-200">
        <p className="font-bold text-red-700">No aprobaste — {resultadoQuiz.calificacion}%</p>
        <p className="text-red-600 text-sm mt-1">Revisá los videos e intentá de nuevo.</p>
        <button
          onClick={() => { setResultadoQuiz(null); setMostrarQuiz(false) }}
          className="mt-3 text-sm text-brand-blue hover:underline"
        >
          Intentar de nuevo
        </button>
      </Card>
    )}
  </>
)}
```

`Lock` ya está importado en la línea 5 del componente (`import { Play, Check, Lock, ChevronRight, Download } from 'lucide-react'`).

---

## 6. Casos borde

- **Taller con todos los videos marcados → rinde → aprueba** → `router.refresh()` re-renderiza el server component, `certificadoId` llega, la card "Colección completada" aparece. Ya funciona hoy, no cambia.
- **Taller llama POST de evaluación directamente sin videos** → 403 con mensaje claro (§3.1).
- **Taller llama POST de progreso con `{videosVistos: 999, totalVideos: 1}`** → el backend clamppa `videosVistos` a `totalVideos` real de la colección y recalcula. No se puede bypassear (§4.1).
- **Taller hace click por la lista hasta el último video y aprieta "Rendir"** → el `onClick` expandido marca los faltantes antes de abrir el quiz (§5.1). No recibe 403 falso positivo.
- **Email falla** → `console.error` con prefijo `[academia]`, el certificado queda igual en DB.
- **QR falla** → `console.error`, el certificado queda con `qrCode = null`. La página `/verificar` debe tolerar certificados sin QR (verificar que ya lo hace — no parte de este spec).
- **`aplicarNivel` falla** → try/catch local logea, certificate sigue creado, respuesta 200, cliente ve "¡Aprobaste!". El nivel se recalcula en el próximo trigger (otra validación aprobada, otro certificado).
- **Taller ya tiene certificado vigente** → la rama `yaExiste` devuelve `aprobado: true` con `codigo` incluido, el componente lo muestra correctamente.

---

## 7. Criterio de aceptación

- [ ] Un taller con `porcentajeCompletado < 100` recibe 403 al llamar el POST de evaluación
- [ ] El endpoint de progreso calcula `totalVideos` server-side — un cliente no puede inflar el porcentaje
- [ ] Un taller que marca todos los videos (incluido el último automáticamente al apretar "Rendir") puede rendir sin errores
- [ ] `aplicarNivel` se ejecuta con `await` dentro de un try/catch local — un fallo no rompe la respuesta exitosa
- [ ] Los fire-and-forget de email y QR logean errores con prefijo `[academia]`
- [ ] La rama `yaExiste` del endpoint incluye `codigo` en la respuesta
- [ ] El componente maneja el 403 con un mensaje visible ("No podés rendir todavía")
- [ ] Build pasa sin errores de TypeScript

---

## 8. Tests (verificación manual)

1. **Gate real del backend**:
   - Login como taller, entrar a una colección con videos sin marcar ninguno
   - En consola del navegador: `fetch('/api/colecciones/<id>/evaluacion', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ respuestas: [] }) })`
   - Verificar que responde 403 con el mensaje de prerequisito
2. **Gate del endpoint de progreso**:
   - En consola: `fetch('/api/colecciones/<id>/progreso', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ videosVistos: 999, totalVideos: 1 }) })`
   - Verificar en DB que `porcentajeCompletado` no es > 100, está limitado al total real
3. **Flow completo feliz**:
   - Login como taller, entrar a colección, click por la lista hasta el último video
   - Apretar "Rendir evaluación" → ver que se abre el quiz (no da 403 aunque el último no esté marcado "visual")
   - Responder, aprobar, verificar que aparece "¡Aprobaste!" con el código
   - Verificar en DB que el nivel del taller se actualizó (aplicarNivel corrió)
4. **Certificado existente**:
   - Entrar a una colección ya certificada → ver que "Colección completada" muestra el código correcto (no `undefined`)
5. **Logs de fallos silenciosos**:
   - Con SendGrid mal configurado, aprobar un quiz → verificar en logs de Vercel que aparece `[academia] Error enviando email de certificado`
   - El taller igual ve "¡Aprobaste!" y el certificado está en DB

---

## 9. Archivos tocados

| Archivo | Cambios | Responsable |
|---|---|---|
| `src/app/api/colecciones/[id]/evaluacion/route.ts` | §3 (gate, yaExiste, await, logging) | Gerardo |
| `src/app/api/colecciones/[id]/progreso/route.ts` | §4 (calcular totalVideos server-side) | Gerardo |
| `src/taller/componentes/academia-cliente.tsx` | §5 (auto-mark, type, 403 handling, UI) | Sergio |

No hay cambios de schema. No hay migración.
