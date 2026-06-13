# J-04: Flujo de publicación de cursos (hallazgo B)

## Contexto

Hallazgo B del QA de Sergio: Sofía (CONTENIDO) crea una colección/curso, pero este no aparece en el carrusel del landing ni en `/taller/aprender`.

Causas diagnosticadas:
1. **Colección nace en borrador**: la API `POST /api/colecciones` hace `activa: body.activa ?? false`. El formulario de crear no envía `activa`, así que toda colección nueva nace con `activa: false`.
2. **Carrusel limitado a 2**: el landing (`src/app/page.tsx:45`) hace `take: 2` para colecciones, así que aunque estén publicadas, solo se muestran las 2 más recientes.
3. **Sin señal de estado**: tras crear, Sofía es redirigida a la edición sin ningún aviso de que la colección quedó en borrador y que debe publicarla manualmente.

## Qué construir

### 1. UX cue post-creación

Archivo: `src/app/(contenido)/contenido/colecciones/nueva/page.tsx`

- Tras crear la colección, redirigir a `/contenido/colecciones/[id]?created=1` (ya redirige a la edición, solo agregar query param)

Archivo: `src/app/(contenido)/contenido/colecciones/[id]/page.tsx`

- Detectar `?created=1` con `useSearchParams()`
- Mostrar un banner informativo (azul, no error) arriba del formulario:
  - Título: "Tu colección se creó como borrador"
  - Texto: "Agregá videos y cuando esté lista, cambiá el estado a «Publicada» para que aparezca en el inicio y en Cursos."
  - Botón/link: "Entendido" que cierra el banner (o simplemente se va al scroll down)
- El banner solo aparece cuando `created=1` está en la URL. No persiste después de navegar.

### 2. Subir límite del carrusel

Archivo: `src/app/page.tsx` (~línea 45)

- Cambiar `take: 2` → `take: 6`
- El carrusel ya es scroll horizontal con flechas, soporta N items
- Mantener `orderBy: { createdAt: 'desc' }` y `where: { activa: true }`

## Datos

Sin cambios de schema. Sin migraciones.

## Prescripciones técnicas

- El banner es un div condicional en el client component existente, no un componente nuevo
- Usar `useSearchParams()` de `next/navigation` para detectar `created=1`
- Colores del banner: `bg-blue-50 border-blue-200 text-blue-800` (informativo, no warning)
- Ícono: `Info` de lucide-react
- No agregar toast — el banner en la misma página es más visible y contextual

## Casos borde

- Sofía recarga la página sin `?created=1` → no aparece el banner (correcto)
- Sofía crea y el redirect falla → queda en `/contenido/colecciones` sin banner (aceptable)
- Carrusel con 0 cursos publicados → no muestra nada (ya manejado)
- Carrusel con 7+ cursos publicados → se scrollean con flechas (ya soportado)

## Criterio de aceptación

1. Sofía crea colección → ve banner "se creó como borrador" en la página de edición
2. El banner desaparece si recarga sin `?created=1`
3. Carrusel del landing muestra hasta 6 cursos (no solo 2)
4. Build pasa sin errores
