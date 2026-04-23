# Checklist de configuración pre-deploy — Piloto v2

**Tipo:** Operativo — no es código, son acciones en Vercel y Supabase (+ un fix trivial en un archivo)
**Asignado a:** Gerardo
**Prioridad:** P0 para bucket `documentos`, feature flag y API keys. P1/P2 para GitHub token y bucket `imagenes`.

---

## Contexto

Antes de implementar cualquier spec v2, hay que asegurarse de que el entorno de producción tiene las variables y recursos necesarios. Varios specs fallan silenciosamente si estas configuraciones no están.

Esta lista está **verificada contra el código real** del repo — los nombres de bucket, env vars y rutas coinciden exactamente con lo que usan los archivos afectados.

---

## 1. Supabase Storage — bucket `documentos` 🔴 P0

**Problema:** H-01 — *"Bucket not found"* al ver documentos pendientes en producción.

**Referencia en código:** `src/compartido/lib/storage.ts:3` usa literalmente `const BUCKET = 'documentos'`.

### Acción

1. Ir a Supabase Dashboard → Storage
2. Crear bucket con nombre exactamente `documentos` (lowercase, sin acentos)
3. Configurar como **privado** (no público)

### Verificación

El hallazgo original se reportó al **visualizar** documentos desde el admin, no al subirlos. La verificación debe cubrir los dos escenarios:

1. **Subida:** login como Graciela Sosa (TALLER PLATA, `graciela.sosa@pdt.org.ar` / `pdt2026`) → `/taller/formalizacion` → subir un documento → verificar que no tira *"Bucket not found"*.
2. **Visualización:** login como Lucía Fernández (ADMIN, `lucia.fernandez@pdt.org.ar`) → `/admin/talleres/[id]` de Graciela → pestaña documentos → click en "Ver documento" del que acaba de subir → el archivo se descarga/abre sin error.

Si (1) pasa pero (2) falla, es un problema de generación de signed URL, no del bucket. Si (1) falla es el bucket.

### Al terminar

Documentar el paso en el handover (`.claude/specs/handover/`) y considerar agregar un script `scripts/setup-supabase.ts` o similar que cree los buckets automáticamente en futuros entornos, así no se repite el olvido en staging u otro proyecto.

---

## 2. Supabase Storage — bucket `imagenes` 🟡 P1

**Problema:** S-VIS-01 — la épica de contenido visual necesita un bucket separado para portfolio y pedidos.

**Referencia:** `v2-epica-contenido-visual.md` §"Solución propuesta → Fase 1".

### Acción

1. Crear bucket `imagenes` en Supabase Storage
2. Configurar como **público** (las imágenes de portfolio y pedidos son públicas por diseño de la épica)
3. Límite de tamaño: 5MB por archivo
4. Tipos MIME permitidos: `image/jpeg`, `image/png`, `image/webp`
5. **No hace falta crear ahora** si la épica de contenido visual todavía no arrancó. Hacerlo junto con S-VIS-01 del spec correspondiente.

### Verificación

Confirmar desde el dashboard que el bucket existe y marcarlo como público. No se puede probar desde la app hasta que la épica visual esté implementada — es solo precondición.

### Nota de seguridad

Un bucket fully public permite enumerar paths si alguien conoce el patrón (`talleres/{tallerId}/portfolio/...`). Para el piloto con pocos usuarios y datos no sensibles es aceptable. En etapa futura conviene evaluar: (a) signed URLs, (b) bucket privado con API de redirect, o (c) políticas RLS de solo lectura.

---

## 3. Variables de entorno en Vercel — API keys RAG 🔴 P0

**Problema:** H-18 — el asistente RAG no funciona sin keys. **Importante**: el hallazgo original mencionaba "API key de OpenAI" como causa probable, pero el sistema **no usa OpenAI**. Usa Anthropic + Voyage:

- `ANTHROPIC_API_KEY` — usado en `src/compartido/lib/rag.ts:5` y `:56`
- `VOYAGE_API_KEY` — usado en `src/compartido/lib/rag.ts:10` y `:11`
- `api/chat/route.ts:17` valida que las dos estén antes de procesar el request

### Acción (desde Dashboard)

1. Vercel Dashboard → proyecto `plataforma-textil` → Settings → Environment Variables
2. Agregar `ANTHROPIC_API_KEY` con la key real de Claude API (`console.anthropic.com`)
3. Agregar `VOYAGE_API_KEY` con la key de Voyage AI (`voyageai.com`)
4. Aplicar a **Production, Preview, Development** — los tres entornos
5. **Redeploy obligatorio** — Vercel no reinyecta env vars a deploys existentes

### Alternativa (CLI, más rápido si estás en terminal)

```bash
vercel env add ANTHROPIC_API_KEY production
vercel env add ANTHROPIC_API_KEY preview
vercel env add ANTHROPIC_API_KEY development
# repetir con VOYAGE_API_KEY
vercel env pull .env.local   # sincronizar local
```

Después un `vercel --prod` o un commit vacío (`git commit --allow-empty -m "chore: trigger redeploy"`) para forzar redeploy.

### Verificación

Login como taller (cualquiera con `academia` activa) → `/taller/aprender/[id]` de una colección → abrir el chat RAG → hacer una pregunta concreta sobre el contenido del video → debe responder con texto coherente, no con error 500/503 ni *"El asistente no está disponible"*.

---

## 4. Feature flag `academia` 🔴 P0

**Problema:** H-15 — Roberto Giménez (BRONCE) ve *"Módulo no disponible"* en `/taller/aprender`.

**Referencia en código:** `src/app/(admin)/admin/configuracion/page.tsx:10` define los tabs como `'general' | 'emails' | 'integraciones' | 'features'`. El flag `academia` está listado en línea 97 como parte del grupo `features_e1`.

### Acción

1. Login como ADMIN (Lucía Fernández, `lucia.fernandez@pdt.org.ar`) en producción
2. Ir a `/admin/configuracion?tab=features`
3. En la sección E1 verificar que el toggle **Academia** está en **Activo**
4. Si está en Inactivo, activarlo (click en el toggle, se persiste vía `/api/admin/config`)

### Verificación

Login como Roberto Giménez (TALLER BRONCE) → `/taller/aprender` → debe cargar el catálogo de colecciones (no *"Módulo no disponible"*). Luego entrar a una colección y verificar que el reproductor de videos funciona.

---

## 5. Variables de entorno en Vercel — GitHub token (feedback) 🟡 P2

**Problema:** S6-01 — el widget de feedback no crea issues en GitHub si el token no está. **No bloquea el piloto** — el feedback igual queda persistido en la tabla `LogActividad` (ver `v2-hallazgos-validacion.md` línea 279). Útil cuando el equipo quiera tracking en GitHub Issues.

**Prioridad real:** P2. Se puede hacer después del primer piloto si no es prioritario.

### Acción

1. GitHub → Settings → Developer Settings → Personal Access Tokens → Generate new token (classic)
2. Scope: `repo` (full) — **necesario porque el repo `Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil` es privado**. `public_repo` no alcanzaría. Si en algún momento se evalúa un token granular, limitar a: Contents (read), Issues (read/write), Metadata (read).
3. En Vercel → Environment Variables → Production:
   - `GITHUB_TOKEN` = el token generado
   - `GITHUB_REPO` = `Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil`
4. Solo aplicar a **Production** (no en Preview/Development — los feedbacks de staging contaminarían los issues)
5. Redeploy

### Verificación

Login en producción → abrir widget de Feedback → enviar un feedback de prueba ("test ignorar") → verificar que aparece un issue nuevo en `github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/issues` dentro de 30s. Si no aparece, revisar logs de Vercel Functions buscando errores del webhook de feedback.

---

## 6. Fix de tildes en `/acceso-rapido` 🟡 P3 (fix trivial)

**Problema:** H-21 — los nombres en `src/app/(auth)/acceso-rapido/page.tsx` no llevan tildes, pero el seed sí. Solo afecta la página de desarrollo. Cosmético.

**Prioridad real:** P3, trivial. Se puede incluir en cualquier PR sin spec propio. Lo dejo acá para que no se olvide.

### Hay 5 nombres a corregir

Verificado contra el archivo actual (`src/app/(auth)/acceso-rapido/page.tsx` líneas 9-80):

| Línea | Valor actual | Valor correcto |
|------:|---|---|
| 13 | `'Lucia Fernandez'` | `'Lucía Fernández'` |
| 23 | `'Roberto Gimenez'` | `'Roberto Giménez'` |
| 53 | `'Martin Echevarria'` | `'Martín Echevarría'` |
| 63 | `'Ana Belen Torres'` | `'Ana Belén Torres'` |
| 73 | `'Sofia Martinez'` | `'Sofía Martínez'` |

Graciela Sosa y Carlos Mendoza no llevan tildes en su nombre real, **no tocar**.

### Nota importante

Los `email` y `password` **no se cambian** — eso rompería el login contra el seed. Solo se cambia el campo `nombre` del array `usuarios`. Los emails siguen siendo `lucia.fernandez@pdt.org.ar`, etc.

### Verificación

Abrir `/acceso-rapido` → los 5 nombres se muestran con tildes → click en cada uno → el login funciona igual que antes (el `signIn` usa el email, no el nombre).

---

## Orden de ejecución recomendado

| Orden | Item | Por qué |
|---|---|---|
| 1 | Bucket `documentos` (§1) | Bloqueo más crítico — H-01 impide cualquier flujo de documentos |
| 2 | API keys RAG (§3) | Bloquea H-18 — sin esto la academia tiene un chat roto |
| 3 | Feature flag `academia` (§4) | Verificación de 1 minuto, puede desbloquear H-15 si Sergio lo dejó off en las pruebas |
| 4 | Fix de tildes (§6) | Trivial, se puede incluir en cualquier commit |
| 5 | GitHub token (§5) | Puede posponerse — el feedback queda en DB aunque falten los issues |
| 6 | Bucket `imagenes` (§2) | Solo cuando arranque la épica de contenido visual |

Los items 1 a 3 son **P0 estricto**. Los items 4 a 6 no bloquean el piloto.

---

## Criterio de cierre

El checklist se considera completo cuando:

- [ ] Bucket `documentos` existe en Supabase producción
- [ ] Graciela Sosa puede subir un documento sin ver "Bucket not found"
- [ ] Lucía Fernández puede abrir el documento subido desde `/admin/talleres/[id]`
- [ ] `ANTHROPIC_API_KEY` y `VOYAGE_API_KEY` están en los 3 entornos de Vercel
- [ ] El chat RAG responde preguntas en producción (no error 503)
- [ ] Feature flag `academia` está activo en `/admin/configuracion?tab=features`
- [ ] `/taller/aprender` carga sin "Módulo no disponible" para Roberto Giménez
- [ ] Los 5 nombres corregidos aparecen con tildes en `/acceso-rapido`

Items postergados (no bloquean cierre):

- [ ] GitHub token configurado y validado con un feedback de prueba
- [ ] Bucket `imagenes` creado (solo cuando inicie la épica de contenido visual)
