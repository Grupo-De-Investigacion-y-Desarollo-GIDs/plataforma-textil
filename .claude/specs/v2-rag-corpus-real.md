# Spec: RAG — Limpiar corpus falso y preparar para contenido real

**Versión:** v2
**Asignado a:** Gerardo (backend) + contenido editorial (OIT/UNTREF) + Sergio (UI fallback + markdown)
**Prioridad:** P1 — el asistente no puede usarse en el piloto con documentos inventados
**Resuelve:** H-18 + dead config bug en `/admin/integraciones/llm`

---

## 1. Contexto

El corpus RAG tiene **20 documentos inventados** generados durante el desarrollo. Nadie los validó y contienen información ficticia sobre trámites de AFIP y requisitos legales. Usar este corpus en el piloto es un **riesgo institucional para la OIT**.

Adicionalmente, la UI de `/admin/integraciones/llm` permite configurar el modelo, max tokens y system prompt — pero **`rag.ts` ignora esa configuración** y tiene todo hardcodeado. El admin cree que configura algo que no tiene efecto.

Este spec:

1. Elimina los documentos inventados del corpus
2. Conecta la configuración del admin con el código real de `rag.ts`
3. Deja la infraestructura lista para cargar documentos reales desde la UI del admin
4. Deshabilita el feature flag hasta que haya contenido real
5. Agrega soporte de markdown en las respuestas del asistente para navegación con links

---

## 2. Acción inmediata — deshabilitar el asistente

**Antes de cualquier implementación**, deshabilitar el feature flag desde el admin:

```
/admin/configuracion → tab Features → asistente_rag → OFF
```

Y también deshabilitar desde la config LLM:

```
/admin/integraciones/llm → checkbox "Habilitar asistente" → OFF
```

### Verificar que el flag realmente esconde el widget

**Archivo a verificar:** `src/app/(taller)/taller/aprender/[id]/page.tsx`

Verificar si el server component condiciona el render de `<AsistenteChat />` con `getFeatureFlag('asistente_rag')`. Si **no lo hace**, agregar:

```tsx
import { getFeatureFlag } from '@/compartido/lib/features'

// En el server component, junto con las otras queries:
const ragHabilitado = await getFeatureFlag('asistente_rag')

// En el JSX, reemplazar:
// <AsistenteChat />   ← render incondicional

// Por:
{ragHabilitado && <AsistenteChat />}
```

> Si el check **ya existe**, no tocar. Si no existe, agregarlo. Sin esta condición, desactivar el flag no tiene efecto y los talleres siguen viendo el asistente con información falsa.

### Relación entre los dos flags

Hay **dos controles independientes** que afectan al asistente:

| Flag | Ubicación | Grupo | Controla |
|---|---|---|---|
| `asistente_rag` | `/admin/configuracion` → tab Features | `features_e1` | **Visibilidad** del widget en la UI del taller |
| `llm_enabled` | `/admin/integraciones/llm` → checkbox | `llm` | **Procesamiento** en el backend (si el endpoint acepta requests) |

Para el piloto: **ambos OFF** hasta que haya corpus real. Al activar: **prender los dos**. Si `asistente_rag = ON` pero `llm_enabled = OFF`, el widget aparece pero retorna 503 — el fallback visual del §5 lo maneja. Si `asistente_rag = OFF`, el widget no aparece independientemente del backend.

---

## 3. Limpiar el corpus — Gerardo

### 3.1 Eliminar documentos de la DB

Ejecutar en Supabase SQL Editor:

```sql
-- Eliminar los 20 documentos inventados
TRUNCATE TABLE documentos_rag;
```

> `TRUNCATE` es más rápido que `DELETE` y resetea el estado de la tabla. Para el piloto no hay documentos reales que preservar — todo lo que hay son los 20 del script de desarrollo.

### 3.2 Vaciar el array del script de indexación

**Archivo:** `scripts/indexar-corpus.ts`

Reemplazar el array `corpus` de 20 documentos falsos por un array vacío con comentario:

```ts
// TODO: Reemplazar con contenido real validado por OIT/UNTREF
// Los documentos del piloto se cargan desde la UI de admin (/admin/integraciones/llm)
// Este script se usa solo para indexación batch masiva con embeddings
const corpus: Documento[] = []
```

Esto evita que alguien recorra `npx tsx scripts/indexar-corpus.ts` y re-inyecte los documentos falsos.

### 3.3 Hacer el script idempotente

Para cuando el script vuelva a tener contenido real, usar upsert en lugar de insert:

```ts
for (const [i, doc] of corpus.entries()) {
  const id = `rag-${String(i + 1).padStart(3, '0')}`
  const embedding = await generarEmbedding(doc.contenido)
  const embeddingStr = `[${embedding.join(',')}]`

  await prisma.$executeRaw`
    INSERT INTO documentos_rag (id, titulo, contenido, categoria, fuente, activo, embedding, "createdAt", "updatedAt")
    VALUES (
      ${id},
      ${doc.titulo},
      ${doc.contenido},
      ${doc.categoria},
      ${doc.fuente ?? null},
      true,
      ${embeddingStr}::vector,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      titulo = EXCLUDED.titulo,
      contenido = EXCLUDED.contenido,
      categoria = EXCLUDED.categoria,
      fuente = EXCLUDED.fuente,
      embedding = EXCLUDED.embedding,
      "updatedAt" = NOW()
  `

  console.log(`  [${i + 1}/${corpus.length}] ${doc.titulo}`)
  await new Promise((r) => setTimeout(r, 200))
}
```

Con `ON CONFLICT (id) DO UPDATE`, el script se puede correr múltiples veces sin fallar por IDs duplicados.

### 3.4 Agregar logging al endpoint

**Archivo:** `src/app/api/chat/route.ts`

En el check de keys (líneas 17-19):

```ts
if (!process.env.ANTHROPIC_API_KEY || !process.env.VOYAGE_API_KEY) {
  console.error('[chat] ANTHROPIC_API_KEY o VOYAGE_API_KEY no configuradas en las variables de entorno')
  return NextResponse.json({ error: 'Asistente no disponible' }, { status: 503 })
}
```

---

## 4. Conectar config del admin con `rag.ts` — Gerardo

### 4.1 Check de `llm_enabled` en el handler — ANTES de `buscarContexto`

**Archivo:** `src/app/api/chat/route.ts`

Agregar **después** del check de API keys y **antes** de parsear el body:

```ts
// Check de keys (ya existente)
if (!process.env.ANTHROPIC_API_KEY || !process.env.VOYAGE_API_KEY) {
  console.error('[chat] ANTHROPIC_API_KEY o VOYAGE_API_KEY no configuradas')
  return NextResponse.json({ error: 'Asistente no disponible' }, { status: 503 })
}

// NUEVO: check de llm_enabled — antes de buscarContexto para no consumir
// créditos de Voyage AI innecesariamente si el asistente está deshabilitado
const llmEnabledConfig = await prisma.configuracionSistema.findFirst({
  where: { clave: 'llm_enabled', grupo: 'llm' },
})
if (llmEnabledConfig?.valor === 'false') {
  return NextResponse.json(
    { error: 'El asistente está deshabilitado temporalmente' },
    { status: 503 }
  )
}

// Body parsing y buscarContexto siguen después...
```

> **Por qué antes de `buscarContexto`**: esa función llama a `generarEmbedding` que hace un request pagado a Voyage AI. Si el asistente está deshabilitado, cada intento del usuario desperdicia un request. Moviendo el check al inicio, la respuesta 503 es instantánea y gratuita.

### 4.2 Leer configuración de DB en `generarRespuesta`

**Archivo:** `src/compartido/lib/rag.ts`

Modificar `generarRespuesta` para leer el modelo, max tokens y system prompt de `ConfiguracionSistema`:

```ts
export async function generarRespuesta(
  pregunta: string,
  contexto: { titulo: string; contenido: string }[],
): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY no configurada')
  }

  // Leer config del admin desde DB
  const configs = await prisma.configuracionSistema.findMany({
    where: { grupo: 'llm' },
  })
  const configMap = Object.fromEntries(configs.map(c => [c.clave, c.valor]))

  const model = configMap['llm_model'] ?? 'claude-haiku-4-5-20251001'
  const maxTokens = parseInt(configMap['llm_max_tokens'] ?? '500')
  const systemPrompt = configMap['llm_system_prompt'] ?? `Sos un asistente de la Plataforma Digital Textil (PDT) de OIT Argentina y UNTREF.
Ayudas a talleres textiles con preguntas sobre formalizacion, tramites y uso de la plataforma.
Responde siempre en espanol, de forma clara y concisa.
Si en el contexto hay links en formato markdown, incluílos en tu respuesta para que el usuario pueda navegar directamente.
Solo responde basandote en el contexto provisto. Si no sabes, deci que no tenes esa informacion y sugeri contactar soporte@plataformatextil.ar.`

  const contextoTexto = contexto
    .map((d) => `## ${d.titulo}\n${d.contenido}`)
    .join('\n\n')

  const response = await anthropic.messages.create({
    model,                                          // ← de DB, antes hardcodeado
    max_tokens: maxTokens,                          // ← de DB
    system: systemPrompt,                           // ← de DB
    messages: [
      {
        role: 'user',
        content: contextoTexto
          ? `Contexto relevante:\n${contextoTexto}\n\nPregunta: ${pregunta}`
          : pregunta,
      },
    ],
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}
```

> **Nota sobre performance**: la query a `ConfiguracionSistema` ocurre en cada request del chat (~1ms, una sola query). Para el piloto con bajo volumen es aceptable. Si escala, agregar cache en memoria con TTL de 60s.

---

## 5. Fallback visual en `AsistenteChat` — Sergio

**Archivo:** `src/taller/componentes/asistente-chat.tsx`

### 5.1 Detectar error permanente

Agregar estado:

```ts
const [noDisponible, setNoDisponible] = useState(false)
```

En `handlePreguntar`, detectar el tipo de error:

```ts
if (!res.ok) {
  const data = await res.json()
  const esPermanente =
    data.error === 'Asistente no disponible' ||
    data.error === 'El asistente está deshabilitado temporalmente'
  if (esPermanente) {
    setNoDisponible(true)
  } else {
    setError(data.error ?? 'Error al consultar el asistente')
  }
  return
}
```

### 5.2 Estado degradado

Reemplazar el contenido del acordeón cuando `noDisponible`:

```tsx
{abierto && (
  noDisponible ? (
    <div className="p-4 text-center">
      <MessageCircle className="w-6 h-6 text-gray-300 mx-auto mb-2" />
      <p className="text-sm text-gray-500">
        El asistente no está disponible en este momento.
      </p>
      <p className="text-xs text-gray-400 mt-1">
        Para consultas escribí a soporte@plataformatextil.ar
      </p>
    </div>
  ) : (
    <div className="p-4 space-y-4">
      {/* Input y respuesta normales — existentes sin cambios */}
    </div>
  )
)}
```

---

## 5.bis Soporte de markdown en respuestas — Sergio

Las respuestas de Claude pueden incluir markdown (listas, negritas, links) que hoy se renderiza como texto plano. Para que los links de navegación funcionen, instalar soporte de markdown.

### 5.bis.1 Instalar dependencia

```bash
npm install react-markdown
```

### 5.bis.2 Renderizar respuestas con markdown

**Archivo:** `src/taller/componentes/asistente-chat.tsx`

Agregar imports:

```ts
import ReactMarkdown from 'react-markdown'
import Link from 'next/link'
```

Reemplazar el bloque de respuesta actual (líneas ~95-97):

```tsx
{/* ANTES: */}
<div className="bg-slate-50 rounded-lg px-4 py-3 text-sm text-gray-700 leading-relaxed">
  {respuesta}
</div>

{/* DESPUÉS: */}
<div className="bg-slate-50 rounded-lg px-4 py-3 text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none">
  <ReactMarkdown
    components={{
      a: ({ href, children }) => {
        const isInternal = href?.startsWith('/')
        if (isInternal) {
          return (
            <Link
              href={href!}
              className="text-brand-blue underline font-medium hover:text-brand-blue/80"
            >
              {children}
            </Link>
          )
        }
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-blue underline font-medium"
          >
            {children}
          </a>
        )
      },
    }}
  >
    {respuesta}
  </ReactMarkdown>
</div>
```

> Los links internos (empiezan con `/`) usan `<Link>` de Next.js para navegación client-side. Los externos se abren en nueva pestaña. Las clases `prose prose-sm` de Tailwind Typography formatean listas, negritas y párrafos correctamente.

### 5.bis.3 Verificar que Tailwind Typography está disponible

Si el proyecto **no tiene** `@tailwindcss/typography` instalado, las clases `prose` no tienen efecto. Verificar con:

```bash
grep -r "typography" package.json tailwind.config.*
```

Si no está, instalar:

```bash
npm install @tailwindcss/typography
```

Y agregar al config de Tailwind. Si ya está, no tocar.

---

## 6. Cómo cargar documentos reales — guía para el equipo editorial

### 6.1 Verificar que el endpoint genera embeddings

> **⚠️ Antes de empezar a cargar**: verificar que `POST /api/admin/rag` genera el embedding con Voyage AI antes de insertar. Si solo hace `prisma.documentoRAG.create` sin embedding, los documentos no aparecen en las búsquedas del asistente — quedan en DB pero sin vector. Si es así, Gerardo debe agregar la llamada a `generarEmbedding(contenido)` y el INSERT con `$executeRaw` al estilo del script.

### 6.2 Acceso a la UI de carga

```
/admin/integraciones/llm → sección "Documentos del corpus"
```

Para cada documento:

- **Título** descriptivo (ej: *"Cómo registrarse en ARCA como monotributista"*)
- **Contenido** en español argentino, claro y conciso (200-800 palabras por documento)
- **Categoría**: `tramites` / `plataforma` / `capacitacion` / `formalizacion`

### 6.3 Cómo escribir links navegables en los documentos

Para que el asistente dirija al usuario a una sección de la plataforma, incluir el link en formato markdown dentro del contenido del documento:

```
Para ver tu checklist, andá a [Mi Formalización](/taller/formalizacion).
```

Claude lee este link como parte del contexto y lo incluye en su respuesta. Gracias al soporte de markdown del §5.bis, el usuario puede hacer click directamente desde la respuesta del chat y navegar a esa sección.

**Links internos útiles:**

| Destino | Markdown |
|---|---|
| Formalización del taller | `[Mi Formalización](/taller/formalizacion)` |
| Academia / cursos | `[Academia](/taller/aprender)` |
| Perfil del taller | `[Mi Perfil](/taller/perfil)` |
| Pedidos disponibles | `[Pedidos disponibles](/taller/pedidos/disponibles)` |
| Directorio público | `[Directorio](/directorio)` |
| Ayuda | `[Centro de ayuda](/ayuda)` |

### 6.4 Categorías sugeridas para el piloto

**Trámites** (verificar con fuentes oficiales antes de publicar):

- Inscripción en ARCA/AFIP como monotributista
- Habilitación municipal — qué es y cómo tramitarla
- ART — qué es y cómo contratarla
- Inscripción como empleador en ARCA
- Habilitación de bomberos
- Plan de seguridad e higiene
- Nómina digital / libro de sueldos

**Plataforma** (redactar basado en el sistema real):

- Cómo funciona el sistema de niveles BRONCE/PLATA/ORO
- Cómo subir documentos de formalización
- Cómo funciona el directorio y por qué aparecer primero importa
- Cómo cotizar un pedido como taller
- Cómo publicar un pedido como marca

### 6.5 Ejemplo de documento con navegación

```
Título: Cómo subir documentos de formalización

Contenido: Para subir tus documentos de formalización andá a 
[Mi Formalización](/taller/formalizacion). Ahí vas a ver el checklist 
con los 7 pasos. Para cada paso podés hacer click en "Subir documento" 
y adjuntar el archivo en formato PDF, JPG o PNG (máximo 5MB).

Una vez subido, el equipo de PDT lo revisa en 48-72 horas hábiles. Si 
es aprobado, el requisito se marca como completado y tu puntaje sube 
automáticamente. Si es rechazado, vas a recibir un email con el motivo 
y podés volver a subirlo.

Para ver tu nivel actual y cuánto te falta para subir, entrá a 
[Mi Perfil](/taller/perfil).

Categoría: plataforma
```

### 6.6 Verificación post-carga

1. Login como taller → `/taller/aprender/[id]` → abrir el asistente
2. Hacer preguntas de prueba: *"¿Cómo subo mis documentos?"*, *"¿Qué necesito para nivel Plata?"*
3. Verificar que:
   - Las respuestas usan información del contenido real (no inventada)
   - Los links aparecen como texto clickeable azul
   - Click en un link interno navega a la sección correcta sin full reload
   - Click en un link externo abre nueva pestaña

### 6.7 Habilitar el asistente

Una vez cargados y validados los documentos reales:

```
/admin/configuracion → tab Features → asistente_rag → ON
/admin/integraciones/llm → checkbox "Habilitar asistente" → ON
```

> Prender **los dos** — `asistente_rag` habilita la visibilidad del widget y `llm_enabled` habilita el procesamiento en el backend.

---

## 7. Criterio de aceptación

- [ ] `TRUNCATE TABLE documentos_rag` ejecutado — tabla vacía
- [ ] Feature flag `asistente_rag` en OFF en producción
- [ ] `llm_enabled` en OFF en producción
- [ ] Widget de asistente **no aparece** en `/taller/aprender/[id]` cuando `asistente_rag` está OFF
- [ ] Array `corpus` en `scripts/indexar-corpus.ts` vaciado con comentario TODO
- [ ] Script de indexación usa upsert (`ON CONFLICT DO UPDATE`)
- [ ] `rag.ts` lee modelo/maxTokens/systemPrompt de `ConfiguracionSistema`
- [ ] Check de `llm_enabled` ocurre en el handler de `/api/chat` **antes** de `buscarContexto` (no después)
- [ ] Admin puede desactivar el asistente desde la UI de integraciones sin tocar Vercel
- [ ] Widget muestra estado degradado cuando el asistente está deshabilitado o las keys faltan
- [ ] Las respuestas del asistente renderizan markdown con links clickeables
- [ ] Links internos (`/taller/...`) navegan con `<Link>`, links externos abren en nueva pestaña
- [ ] `react-markdown` instalado como dependencia
- [ ] Al menos 10 documentos reales cargados y validados antes de activar el flag
- [ ] Build de TypeScript pasa sin errores

---

## 8. Tests (verificación manual)

1. **Corpus limpio**:
   - Verificar en Supabase que `documentos_rag` está vacío después del TRUNCATE
   - Correr `npx tsx scripts/indexar-corpus.ts` → sale inmediatamente porque `corpus` está vacío
2. **Feature flag oculta el widget**:
   - Con `asistente_rag = OFF`, login como taller → ir a `/taller/aprender/[id]`
   - Verificar que **no hay** acordeón de asistente en la página
3. **Backend bloqueado**:
   - Con `llm_enabled = OFF`, hacer `fetch('/api/chat', { method: 'POST', body: ... })` directo
   - Verificar que retorna 503 con `"El asistente está deshabilitado temporalmente"`
   - Verificar en Vercel Logs que **no** hay requests a Voyage AI (el check es pre-embedding)
4. **Fallback visual del widget**:
   - Con `asistente_rag = ON` y `llm_enabled = OFF`
   - Login como taller → abrir el asistente → escribir una pregunta → enviar
   - Verificar que muestra el estado degradado (*"El asistente no está disponible en este momento"*)
   - Verificar que el input desaparece y no se puede reintentar
5. **Config del admin funciona**:
   - Ir a `/admin/integraciones/llm` → cambiar el modelo a `claude-sonnet-4-5-20250929`
   - Habilitar `llm_enabled` → cargar un documento de prueba
   - Ir al asistente como taller → hacer una pregunta → verificar que responde (con Sonnet, no Haiku)
6. **Markdown con links**:
   - Cargar un documento con link: *"Andá a [Mi Formalización](/taller/formalizacion)"*
   - Hacer una pregunta relevante → la respuesta muestra el link azul clickeable
   - Click → navega a `/taller/formalizacion` sin full reload
7. **Verificación post-carga editorial**:
   - El equipo editorial carga ~10 documentos reales
   - Verificar que las respuestas son coherentes y precisas
   - Habilitar ambos flags → el widget aparece y funciona

---

## 9. Archivos tocados

| Archivo | Cambios | Responsable |
|---|---|---|
| `scripts/indexar-corpus.ts` | Vaciar corpus + upsert idempotente | Gerardo |
| `src/app/api/chat/route.ts` | Logging 503 + check `llm_enabled` antes de embedding | Gerardo |
| `src/compartido/lib/rag.ts` | Leer config de DB (model, maxTokens, systemPrompt) | Gerardo |
| `src/app/(taller)/taller/aprender/[id]/page.tsx` | Verificar/agregar check `getFeatureFlag('asistente_rag')` | Sergio |
| `src/taller/componentes/asistente-chat.tsx` | Fallback `noDisponible` + ReactMarkdown + Link routing | Sergio |
| `package.json` | Agregar `react-markdown` | Sergio |
| Supabase SQL Editor | `TRUNCATE TABLE documentos_rag` | Gerardo (ops) |
| `/admin/configuracion` | OFF `asistente_rag` | Gerardo (ops) |
| `/admin/integraciones/llm` | OFF `llm_enabled` | Gerardo (ops) |

**0 archivos nuevos, 5 archivos modificados, 1 dependencia nueva, 3 acciones operativas.**
