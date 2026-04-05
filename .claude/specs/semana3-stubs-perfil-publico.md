# Spec: Stubs admin + perfil público del taller

- **Semana:** 3
- **Asignado a:** Sergio
- **Dependencias:** Ninguna

## 1. Contexto

Quedan dos stubs en admin que pueden confundir en el piloto. También el perfil público del taller le falta información importante comparado con la vista de marca. Este spec resuelve ambas cosas.

## 2. Qué construir

- `/admin/integraciones/email`: agregar badge "En construcción" y deshabilitar formulario
- `/perfil/[id]`: agregar prendas, certificados de cursos, descripción y link de volver

## 3. Datos

- No hay cambios de schema
- `/perfil/[id]` necesita incluir `prendas` y `certificados` en la query

## 4. Prescripciones técnicas

### Archivo a modificar — `src/app/(admin)/admin/integraciones/email/page.tsx`

**Cambio 1 — Agregar banner de advertencia al inicio del return, antes del primer `<Card>`** (después de línea 30, antes de línea 32):

`AlertTriangle` ya está importado en línea 9 — no agregar import duplicado.

```tsx
<div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
  <div>
    <p className="text-sm font-medium text-amber-800">Configuración en construcción</p>
    <p className="text-xs text-amber-600 mt-0.5">
      Esta pantalla no guarda cambios todavía. SendGrid ya está configurado vía variables de entorno.
    </p>
  </div>
</div>
```

**Cambio 2 — Deshabilitar todos los inputs y botones** del formulario agregando `disabled` y `className="opacity-50"` a cada `<Input>`, `<Button>`, y `<input type="checkbox">`.

**Cambio 3 — Reemplazar el contador mock** (línea 80):

```tsx
// Reemplazar:
<span className="text-sm text-gray-500">Emails enviados este mes: 156</span>

// Por:
<span className="text-sm text-gray-500">Configurado vía variables de entorno</span>
```

### Archivo a modificar — `src/app/(public)/perfil/[id]/page.tsx`

**Cambio 1 — Actualizar query para incluir prendas y certificados (líneas 13-19):**

```typescript
const taller = await prisma.taller.findUnique({
  where: { id },
  include: {
    procesos: { include: { proceso: true } },
    prendas: { include: { prenda: true } },
    maquinaria: true,
    certificaciones: { where: { activa: true } },
    certificados: {
      where: { revocado: false },
      include: { coleccion: { select: { titulo: true, institucion: true } } },
      orderBy: { fecha: 'desc' },
    },
  },
})
```

**Cambio 2 — Agregar link de volver al inicio de la página (antes de línea 26, dentro del return):**

```tsx
<div className="mb-4">
  <a href="/directorio" className="text-brand-blue hover:underline text-sm">
    ← Volver al directorio
  </a>
</div>
```

**Cambio 3 — Agregar descripción si existe, debajo del bloque de ubicación (después de línea 35):**

```tsx
{taller.descripcion && (
  <p className="text-gray-600 text-sm italic mt-2">&quot;{taller.descripcion}&quot;</p>
)}
```

**Cambio 4 — Agregar sección de prendas después de la sección de procesos (después de línea 69):**

```tsx
{taller.prendas.length > 0 && (
  <Card title="Tipos de prenda" className="mb-4">
    <div className="flex flex-wrap gap-2">
      {taller.prendas.map((tp: { id: string; prenda: { nombre: string } }) => (
        <Badge key={tp.id} variant="outline">{tp.prenda.nombre}</Badge>
      ))}
    </div>
  </Card>
)}
```

Nota: usar `tp.id` como key (PK del join table `TallerPrenda`), no `tp.prendaId`.

**Cambio 5 — Agregar sección de certificados de cursos, antes del cierre del `</div>` principal:**

```tsx
{taller.certificados.length > 0 && (
  <Card title="Capacitaciones certificadas">
    <div className="space-y-2">
      {taller.certificados.map((cert: { id: string; codigo: string; coleccion: { titulo: string; institucion: string | null } }) => (
        <div key={cert.id} className="flex items-center justify-between text-sm">
          <div>
            <span className="font-medium">{cert.coleccion.titulo}</span>
            {cert.coleccion.institucion && (
              <span className="text-gray-500 ml-2">· {cert.coleccion.institucion}</span>
            )}
          </div>
          <a href={`/verificar?code=${cert.codigo}`}
            className="text-brand-blue underline text-xs">
            Verificar
          </a>
        </div>
      ))}
    </div>
  </Card>
)}
```

## 5. Casos borde

- Taller sin prendas → no mostrar sección de prendas
- Taller sin certificados → no mostrar sección de capacitaciones
- Taller sin descripción → no mostrar el párrafo
- `params` en Next.js 16 es Promise — la página ya usa `await params` correctamente (línea 12)

## 6. Criterio de aceptación

- [ ] `/admin/integraciones/email` muestra banner de advertencia y formulario deshabilitado
- [ ] `/admin/integraciones/email` no muestra el contador falso de emails
- [ ] `/perfil/[id]` muestra prendas cuando el taller las tiene
- [ ] `/perfil/[id]` muestra certificados de cursos con link de verificación
- [ ] `/perfil/[id]` muestra descripción cuando existe
- [ ] Link volver al directorio aparece al inicio
- [ ] Build pasa sin errores

## 7. Tests (verificación manual)

1. Ir a `/admin/integraciones/email` → verificar banner de advertencia y formulario deshabilitado
2. Ir a `/perfil/[id]` del taller ORO → verificar que muestra prendas y certificados
3. Click en "Verificar" de un certificado → verificar que abre `/verificar` con el código correcto
4. Ir a `/directorio` → click en un taller → verificar link "Volver al directorio"
