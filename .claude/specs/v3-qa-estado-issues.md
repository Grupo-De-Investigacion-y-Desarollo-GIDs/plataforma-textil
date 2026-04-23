# Spec: Estado de issues en interfaz de QA

- **Versión:** V3
- **Origen:** Parte 3 postergada de V2 + necesidad del equipo ampliado
- **Asignado a:** Gerardo
- **Prioridad:** Alta — con 5+ auditores en paralelo, ver el estado de issues es crítico para evitar reportes duplicados

---

## ANTES DE ARRANCAR

- [ ] V3_BACKLOG QA formato ampliado implementado (specs V3 generan QAs con formato nuevo)
- [ ] `GITHUB_TOKEN` y `GITHUB_REPO` configurados en Vercel
- [ ] `src/app/api/feedback/route.ts` existente y funcionando

---

## 1. Contexto

Hoy la interfaz HTML de QA es una checklist estática. El auditor puede:

- Marcar ítems con ✅/🐛/❌
- Crear issues desde el widget "Feedback" o desde botones integrados
- Escribir notas libres

Pero lo que **no puede**:

- Ver si un ítem que marcó como bug ya fue resuelto
- Saber qué estado tiene cada issue que abrió (abierto, en progreso, cerrado)
- Evitar reportar un bug que otro compañero ya reportó

Este gap no era crítico cuando Sergio era el único auditor — él recordaba qué había reportado. Pero con 5 auditores en paralelo (Sergio + 4 compañeros) es insostenible:

- Tres personas pueden reportar el mismo bug sin saberlo
- Un auditor vuelve al QA después de 3 días y no se acuerda qué había encontrado
- Los compañeros no ven las explicaciones que Gerardo dio al cerrar issues previos (pierden contexto — clickean el badge para ver en GitHub)

Este spec convierte la interfaz HTML de QA de checklist estática a **panel de control en vivo** con estado sincronizado desde GitHub.

---

## 2. Qué construir

1. **Endpoint que devuelve issues de un QA específico** — consulta GitHub API filtrada por label del spec correspondiente
2. **Carga asíncrona en el HTML generado** — al abrir el QA, fetch de issues y poblar la UI
3. **Vinculación issue ↔ ítem** — cada issue recuerda en qué eje/paso/item se creó (metadata en HTML comments del body)
4. **Badges de estado en cada ítem** — muestra issues asociados con estado visual (abierto/cerrado/descartado)
5. **Panel de resumen al final del QA** — vista agregada con contadores y links
6. **Actualización automática cada 2 minutos** — el HTML hace polling sin intervención del usuario
7. **Cache server-side** — respetar rate limit de GitHub (5000 requests/hora autenticado)
8. **CORS utility compartido** — extraer headers CORS a utility reutilizable

---

## 3. Cambios en el flujo

### 3.1 — Creación de issues (actual → ampliado)

**Hoy:** el botón "Crear issue" hace `POST /api/feedback` con: título, descripción, spec, eje, ítem, resultado. Los labels que agrega son por tipo (`bug`, `piloto`, etc.) pero **no incluyen el slug del QA**.

**V3:** agregar campos para trazabilidad bidireccional:
- `qaSlug`: nombre del archivo QA sin extensión (ej: `QA_v3-separar-ambientes`)
- `itemSelector`: identificador único del ítem dentro del QA (ej: `eje-2-paso-3`, `eje-1-item-5`, `eje-3-caso-2`)
- `verificador`: QA o DEV (del badge del ítem)
- `perfil`: politólogo/economista/sociólogo/contador/tecnico (si aplica, del Eje 6)

Estos campos se guardan en el body del issue de GitHub como HTML comments — no afectan la lectura humana pero el parser los recupera.

> **Dependencia bloqueante:** Modificar `/api/feedback/route.ts` para agregar `qaSlug` como label de GitHub es prerequisito de todo este spec. Sin el label, el endpoint de lectura no puede filtrar issues por QA. **Los issues creados antes de este cambio no se encontrarán con el filtro** — hay que re-etiquetarlos manualmente en GitHub si se quiere trazabilidad retroactiva con issues de V2.

### 3.2 — Lectura de issues (nuevo)

**Nuevo endpoint:** `GET /api/feedback/by-qa/[qaSlug]`

Retorna todos los issues asociados a un QA específico con shape:

```json
{
  "issues": [
    {
      "number": 47,
      "title": "Botón aprobar sin feedback visual",
      "state": "closed",
      "stateReason": "completed",
      "itemSelector": "eje-2-paso-3",
      "verificador": "QA",
      "perfil": "tecnico",
      "createdAt": "2026-04-21T14:30:00Z",
      "closedAt": "2026-04-21T16:45:00Z",
      "url": "https://github.com/.../issues/47",
      "labels": ["bug", "piloto", "QA_v3-separar-ambientes"]
    }
  ],
  "lastUpdated": "2026-04-23T19:00:00Z"
}
```

> **Nota:** La respuesta no incluye `comments` de cada issue. Fetchear comments requiere 1 API call adicional por issue (`GET /repos/:owner/:repo/issues/:number/comments`). Con 20 issues y polling cada 2 minutos, eso serían 21 calls/minuto por QA — con 5 QAs abiertos supera el rate limit de GitHub (5,000/hora). El auditor clickea el badge del issue para ver comments directamente en GitHub.

---

## 4. Prescripciones técnicas

### 4.1 — CORS utility compartido

Hoy los CORS headers están inline en `/api/feedback/route.ts`. Ambos endpoints (POST feedback y GET by-qa) necesitan los mismos headers CORS porque los QA HTMLs viven en GitHub Pages (origin distinto a Vercel).

Archivo nuevo: `src/compartido/lib/cors.ts`

```typescript
import { NextResponse } from 'next/server'

const ALLOWED_ORIGINS = [
  'https://grupo-de-investigacion-y-desarollo-gids.github.io',
]

export function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin') ?? ''
  const headers: Record<string, string> = {}
  if (ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
    headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    headers['Access-Control-Allow-Headers'] = 'Content-Type'
  }
  return headers
}

export function handleOptions(request: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) })
}
```

Cambios:
- `Access-Control-Allow-Methods` ahora incluye `GET` además de `POST` y `OPTIONS`
- Actualizar `/api/feedback/route.ts` para importar de `@/compartido/lib/cors` en vez de tener la función inline

### 4.2 — Endpoint `/api/feedback/by-qa/[qaSlug]`

Archivo nuevo: `src/app/api/feedback/by-qa/[qaSlug]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { corsHeaders, handleOptions } from '@/compartido/lib/cors'

const CACHE_TTL_MS = 60 * 1000  // 1 minuto
const cache = new Map<string, { data: unknown; expira: number }>()

export function OPTIONS(request: Request) {
  return handleOptions(request)
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ qaSlug: string }> }
) {
  const { qaSlug } = await params

  // Cache check
  const cached = cache.get(qaSlug)
  if (cached && cached.expira > Date.now()) {
    return NextResponse.json(cached.data, {
      headers: { ...corsHeaders(req), 'X-Cache': 'HIT' },
    })
  }

  const token = process.env.GITHUB_TOKEN
  const repo = process.env.GITHUB_REPO ?? 'Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil'

  if (!token) {
    return NextResponse.json(
      { issues: [], error: 'GitHub no configurado' },
      { headers: corsHeaders(req) }
    )
  }

  // GitHub API: buscar issues con label qaSlug
  const response = await fetch(
    `https://api.github.com/repos/${repo}/issues?state=all&labels=${encodeURIComponent(qaSlug)}&per_page=100`,
    {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github+json',
      },
    }
  )

  if (!response.ok) {
    return NextResponse.json(
      { issues: [], error: 'Error consultando GitHub', status: response.status },
      { status: 502, headers: corsHeaders(req) }
    )
  }

  const issues = await response.json()

  // Parsear metadata del body (HTML comments)
  const parsed = issues.map((issue: Record<string, unknown>) => {
    const body = (issue.body as string) ?? ''
    const itemSelector = body.match(/<!-- item:\s*(.+?)\s*-->/)?.[1] ?? null
    const verificador = body.match(/<!-- verificador:\s*(.+?)\s*-->/)?.[1] ?? null
    const perfil = body.match(/<!-- perfil:\s*(.+?)\s*-->/)?.[1] ?? null

    return {
      number: issue.number,
      title: issue.title,
      state: issue.state,
      stateReason: issue.state_reason,
      itemSelector,
      verificador,
      perfil,
      createdAt: issue.created_at,
      closedAt: issue.closed_at,
      url: issue.html_url,
      labels: (issue.labels as Array<{ name: string }>).map(l => l.name),
    }
  })

  const result = {
    issues: parsed,
    lastUpdated: new Date().toISOString(),
  }

  cache.set(qaSlug, { data: result, expira: Date.now() + CACHE_TTL_MS })

  return NextResponse.json(result, {
    headers: { ...corsHeaders(req), 'X-Cache': 'MISS' },
  })
}
```

> **Nota sobre auth:** Este endpoint es **público** (no requiere sesión de NextAuth). Los QA HTMLs se abren desde GitHub Pages donde no hay sesión de la plataforma. El endpoint solo lee issues de un repo público de GitHub — no expone datos internos. El rate limit de S-02 protege contra abuso.

### 4.3 — Modificación de `/api/feedback/route.ts`

El endpoint actual crea issues. Hay que:

1. **Agregar el slug del QA como label** automáticamente
2. **Insertar metadata como HTML comments en el body** para que el parser los recupere
3. **Importar CORS de utility compartido** en vez de tener inline

```typescript
import { corsHeaders, handleOptions } from '@/compartido/lib/cors'

// En la función POST, al construir el body del issue:
const body = `
${issueBody}

---
<!-- item: ${contextoQA?.itemSelector ?? ''} -->
<!-- verificador: ${contextoQA?.verificador ?? 'QA'} -->
<!-- perfil: ${contextoQA?.perfil ?? 'tecnico'} -->
<!-- url: ${pagina} -->
`

// Al crear el issue, agregar qaSlug a labels:
const issueLabels = [...(labels[tipo] ?? ['piloto'])]
if (contextoQA?.qaSlug) {
  issueLabels.push(contextoQA.qaSlug)
}
if (contextoQA?.perfil && contextoQA.perfil !== 'tecnico') {
  issueLabels.push(`perfil-${contextoQA.perfil}`)
}

await fetch(`https://api.github.com/repos/${process.env.GITHUB_REPO}/issues`, {
  // ...
  body: JSON.stringify({
    title,
    body,
    labels: issueLabels,
  }),
})
```

### 4.4 — Cambios en `tools/generate-qa.js`

**Agregar al HTML generado:**

1. **Meta tag con el slug del QA:**
   ```html
   <meta name="qa-slug" content="QA_v3-separar-ambientes">
   ```

2. **Atributos `data-item-selector` en cada ítem/paso/caso:**
   ```html
   <div class="item-card" data-item-selector="eje-1-item-3" data-verificador="QA">
   ```

3. **Contenedor para badges en cada ítem:**
   ```html
   <div class="item-badges"></div>
   ```

4. **Script que hace fetch al cargar y popula badges:**
   ```javascript
   const apiUrl = document.body.dataset.apiUrl  // .../api/feedback
   const qaSlug = document.querySelector('meta[name="qa-slug"]').content

   async function cargarIssues() {
     try {
       const res = await fetch(`${apiUrl}/by-qa/${qaSlug}`)
       if (!res.ok) throw new Error()
       const data = await res.json()

       // Limpiar badges previos
       document.querySelectorAll('.issue-badge').forEach(b => b.remove())

       data.issues.forEach(issue => {
         if (!issue.itemSelector) return
         const item = document.querySelector(`[data-item-selector="${issue.itemSelector}"]`)
         if (!item) return

         const badgesContainer = item.querySelector('.item-badges')
         if (badgesContainer) badgesContainer.appendChild(crearBadgeIssue(issue))
       })

       actualizarResumen(data.issues)
     } catch {
       // GitHub no disponible — la checklist sigue funcionando
       const banner = document.getElementById('github-status')
       if (banner) banner.textContent = 'No se pudo cargar estado de issues'
     }
   }

   function crearBadgeIssue(issue) {
     const badge = document.createElement('a')
     badge.href = issue.url
     badge.target = '_blank'
     badge.className = 'issue-badge issue-' + (
       issue.state === 'open' ? 'open' :
       issue.stateReason === 'completed' ? 'resolved' : 'discarded'
     )
     badge.textContent = '#' + issue.number + ' — ' + (
       issue.state === 'open' ? 'Abierto' :
       issue.stateReason === 'completed' ? 'Resuelto' : 'Descartado'
     )
     return badge
   }

   cargarIssues()
   setInterval(cargarIssues, 2 * 60 * 1000)  // cada 2 minutos
   ```

5. **Actualizar `crearIssue` para enviar qaSlug y itemSelector:**
   ```javascript
   // Dentro de crearIssue(), agregar al body del fetch:
   body: JSON.stringify({
     tipo: tipo,
     mensaje: obs,
     pagina: pagina,
     auditorNombre: 'Sergio',
     auditorRol: 'QA',
     contextoQA: {
       spec: spec,
       eje: eje,
       item: '#' + num + ' ' + itemText,
       resultado: status,
       qaSlug: qaSlug,
       itemSelector: card.dataset.itemSelector,
       verificador: card.dataset.verificador,
       perfil: card.dataset.perfil || 'tecnico',
     }
   })
   ```

### 4.5 — Badges visuales

Cada ítem del QA puede tener 0 o más badges de issues asociados:

| Estado del issue | Clase CSS | Color | Texto |
|------------------|-----------|-------|-------|
| Abierto (open) | `issue-open` | Rojo | `#47 — Abierto` |
| Cerrado con resolución (closed/completed) | `issue-resolved` | Verde | `#47 — Resuelto` |
| Cerrado sin resolución (closed/not_planned) | `issue-discarded` | Gris | `#47 — Descartado` |

Click en el badge abre el issue en GitHub en nueva pestaña — ahí el auditor puede ver los comments del desarrollador.

### 4.6 — Panel de resumen

Al final del QA, antes de "Notas de los auditores", se agrega un panel:

```html
<section class="panel-resumen" id="panel-resumen">
  <h2>Resumen de issues</h2>
  <div id="github-status" class="text-muted"></div>
  <div class="stats">
    <div class="stat abierto" id="stat-abiertos">0 abiertos</div>
    <div class="stat resuelto" id="stat-resueltos">0 resueltos</div>
    <div class="stat descartado" id="stat-descartados">0 descartados</div>
  </div>
  <div class="issues-list" id="issues-list">
    <!-- Populado por JS con links a cada issue -->
  </div>
</section>
```

Se popula automáticamente con la función `actualizarResumen(issues)` del fetch inicial.

---

## 5. Casos borde

- **GitHub API caída** — el endpoint devuelve `{ issues: [], error: 'GitHub no disponible' }`. El HTML muestra un banner discreto "No se pudo cargar estado de issues" pero la checklist sigue funcionando normalmente.

- **QA sin issues** — `issues: []`. No se muestran badges. El panel de resumen dice "Sin issues reportados".

- **Issue sin `itemSelector` en metadata** — issue antiguo creado antes de este spec, sin trazabilidad. Aparece en el panel de resumen general pero no asociado a un ítem específico.

- **Issues de V2 sin label qaSlug** — no se encontrarán con el filtro. Hay que re-etiquetarlos manualmente en GitHub si se quiere trazabilidad retroactiva. Para V3 es aceptable — los issues de V2 ya están cerrados.

- **Rate limit de GitHub** — con cache de 1 minuto y sin fetchear comments: 1 call a GitHub/minuto por QA. Con 5 QAs abiertos: 5 calls/minuto = 300/hora — muy debajo de 5,000/hora. Si se supera, el endpoint devuelve 502 y el HTML muestra el último cache disponible.

- **Dos auditores crean issue del mismo ítem simultáneamente** — ambos issues aparecen como badges en el mismo ítem. El auditor ve los dos y puede comentar en cualquiera para deduplicar.

- **Issue cerrado y reabierto** — el endpoint retorna `state: 'open'` y `stateReason: null`. Se muestra como abierto.

- **Cache desactualizado entre instancias serverless** — la invalidación funciona en la instancia que hizo el fetch. Otras instancias tienen cache viejo hasta 1 minuto. Aceptable para un panel informativo.

- **Metadata HTML comments editada accidentalmente** — si alguien edita el body del issue en GitHub y borra los `<!-- ... -->` comments, el issue pierde la vinculación con el ítem. Aparece en el panel de resumen pero sin badge en el ítem específico. Para V3 el riesgo es bajo — solo Gerardo edita issues.

---

## 6. Criterios de aceptación

- [ ] CORS utility extraído a `src/compartido/lib/cors.ts` con métodos `GET, POST, OPTIONS`
- [ ] `/api/feedback/route.ts` importa CORS de utility compartido
- [ ] `/api/feedback/route.ts` agrega `qaSlug` como label al crear issues
- [ ] `/api/feedback/route.ts` inserta metadata como HTML comments en el body del issue
- [ ] Endpoint `/api/feedback/by-qa/[qaSlug]` creado, público (sin auth), con cache de 1 minuto
- [ ] Endpoint incluye CORS headers para GitHub Pages origin
- [ ] `tools/generate-qa.js` agrega `data-item-selector` a cada ítem renderizado
- [ ] `tools/generate-qa.js` agrega `<meta name="qa-slug">` al HTML
- [ ] HTML generado tiene script que hace fetch y popula badges al cargar
- [ ] Polling cada 2 minutos sin intervención del usuario
- [ ] Badges muestran estado visual correcto (rojo/verde/gris)
- [ ] Click en badge abre el issue en GitHub
- [ ] Panel de resumen al final del QA con stats agregadas
- [ ] Fallback: si GitHub API falla, la checklist sigue funcionando
- [ ] Rate limit de GitHub no se supera con 5 auditores simultáneos
- [ ] Build sin errores

---

## 7. Tests

| # | Qué testear | Cómo | Verificador |
|---|-------------|------|-------------|
| 1 | Endpoint retorna issues con formato correcto | `curl /api/feedback/by-qa/QA_v3-test` | DEV |
| 2 | Cache respeta TTL de 1 minuto | Dos requests consecutivos, segundo con X-Cache: HIT | DEV |
| 3 | CORS headers presentes en respuesta GET | Verificar `Access-Control-Allow-Origin` en response | DEV |
| 4 | Issue creado desde QA tiene label qaSlug y metadata | Crear issue, inspeccionar en GitHub | DEV |
| 5 | Badge aparece en ítem correcto al cargar | Abrir QA con issues asociados, verificar visual | QA |
| 6 | Badge de issue cerrado es verde | Cerrar issue en GitHub, recargar QA | QA |
| 7 | Polling actualiza badges sin reload | Cambiar estado en GitHub, esperar 2 min | QA |
| 8 | Click en badge abre issue en nueva pestaña | Click en un badge | QA |
| 9 | Panel resumen muestra contadores correctos | Verificar que suma coincide | QA |
| 10 | GitHub caído no rompe el QA | Desconfigurar `GITHUB_TOKEN`, abrir QA | DEV |
| 11 | Issue sin itemSelector aparece en panel pero no en ítem | Crear issue manual sin metadata, verificar | DEV |

---

## 8. Beneficios para el equipo ampliado

- **Evita reportes duplicados** — si Sergio ya reportó un bug en el ítem 3, los 4 compañeros lo ven al abrir el QA
- **Contexto histórico** — los compañeros clickean el badge para ver en GitHub cómo Gerardo resolvió issues similares
- **Panel de control** — Gerardo ve de un vistazo qué QAs tienen issues abiertos y cuáles están limpios
- **Onboarding más rápido** — nuevos auditores ven qué se probó y qué resultó
- **Auditoría más liviana** — no hay que ir a GitHub para ver el estado, todo está en el QA

---

## 9. Referencias

- V3_BACKLOG → relacionado con T-01 (QAs por perfil) y T-04 (feedback loop)
- Parte 3 postergada de V2 (sistema de QA construido en V2)
- GitHub Issues API: https://docs.github.com/en/rest/issues/issues
- Rate limits GitHub: 5000 req/hora autenticado, 60 req/hora sin auth
- CORS utility actual: `src/app/api/feedback/route.ts` (a extraer)
