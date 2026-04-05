# Spec: Feature Flags — control de funcionalidades E1 y E2

- **Semana:** 1
- **Asignado a:** Gerardo
- **Dependencias:** Ninguna — puede hacerse desde el día 1

## 1. Contexto

El sistema necesita poder habilitar y deshabilitar funcionalidades sin tocar el código. Esto permite desplegar todo el desarrollo y habilitar cada feature cuando esté lista y probada. La infraestructura `ConfiguracionSistema` ya existe. Este spec agrega el helper de lectura y los puntos de control en el código.

## 2. Qué construir

- Helper `getFeatureFlag(clave)` para server components y APIs
- Seed inicial de feature flags en la DB
- Tab "Features" en `/admin/configuracion` con toggles de E1 y E2
- Aplicar flags en los puntos clave del código

## 3. Datos

**Flags del Escenario 1 (grupo: `features_e1`):**

| Clave | Default | Descripción |
|-------|---------|-------------|
| `registro_talleres` | true | Registro público de talleres habilitado |
| `registro_marcas` | true | Registro público de marcas habilitado |
| `directorio_publico` | true | Directorio sin login visible |
| `academia` | true | Módulo de capacitación habilitado |
| `formalizacion` | true | Checklist y upload de documentos |
| `dashboard_estado` | true | Acceso al panel del Estado |
| `denuncias` | true | Formulario público de denuncias |

**Flags del Escenario 2 (grupo: `features_e2`):**

| Clave | Default | Descripción |
|-------|---------|-------------|
| `publicacion_pedidos` | false | Marca puede publicar pedidos |
| `cotizaciones` | false | Talleres pueden cotizar pedidos |
| `acuerdos_pdf` | false | Descarga de acuerdo en PDF |
| `matching_notificaciones` | false | Notificaciones automáticas a talleres |
| `asistente_rag` | false | Chat con IA en academia |

Todos los flags de E1 arrancan en true, todos los de E2 en false. El admin los activa manualmente cuando cada feature está lista.

**Agregar al seed** (`prisma/seed.ts`), dentro del `createMany` existente de `configuracionSistema` (línea 628). El seed actual hace `deleteMany` primero, así que `createMany` es correcto (no hace falta upsert):

```typescript
await prisma.configuracionSistema.createMany({
  data: [
    // Configs existentes
    { clave: 'nombre_plataforma', valor: 'Plataforma Digital Textil', grupo: 'general' },
    { clave: 'email_soporte', valor: 'soporte@pdt.org.ar', grupo: 'general' },
    { clave: 'prefijo_certificado', valor: 'PDT-CERT-', grupo: 'certificados' },
    { clave: 'institucion_firma', valor: 'OIT Argentina — UNTREF', grupo: 'certificados' },
    // Feature flags E1
    { clave: 'registro_talleres', valor: 'true', grupo: 'features_e1' },
    { clave: 'registro_marcas', valor: 'true', grupo: 'features_e1' },
    { clave: 'directorio_publico', valor: 'true', grupo: 'features_e1' },
    { clave: 'academia', valor: 'true', grupo: 'features_e1' },
    { clave: 'formalizacion', valor: 'true', grupo: 'features_e1' },
    { clave: 'dashboard_estado', valor: 'true', grupo: 'features_e1' },
    { clave: 'denuncias', valor: 'true', grupo: 'features_e1' },
    // Feature flags E2
    { clave: 'publicacion_pedidos', valor: 'false', grupo: 'features_e2' },
    { clave: 'cotizaciones', valor: 'false', grupo: 'features_e2' },
    { clave: 'acuerdos_pdf', valor: 'false', grupo: 'features_e2' },
    { clave: 'matching_notificaciones', valor: 'false', grupo: 'features_e2' },
    { clave: 'asistente_rag', valor: 'false', grupo: 'features_e2' },
  ],
})
```

## 4. Prescripciones técnicas

### Archivo nuevo — `src/compartido/lib/features.ts`

```typescript
import { prisma } from './prisma'

/**
 * Lee un feature flag de ConfiguracionSistema.
 * Sin cache — cada llamada consulta la DB.
 * Para el piloto (<100 requests/min) esto es despreciable.
 * Si se necesita cache real, usar Vercel KV o unstable_cache de Next.js.
 */
export async function getFeatureFlag(clave: string): Promise<boolean> {
  const config = await prisma.configuracionSistema.findUnique({
    where: { clave },
  })
  return config?.valor === 'true'
}

export async function getFeatureFlags(grupo: string): Promise<Record<string, boolean>> {
  const configs = await prisma.configuracionSistema.findMany({
    where: { grupo },
  })
  return Object.fromEntries(configs.map(c => [c.clave, c.valor === 'true']))
}
```

Nota: no se usa cache en memoria. Un `Map` estático en Vercel Fluid Compute persiste entre requests de la misma instancia pero no se invalida desde otras instancias. Para el piloto, una query por flag es suficiente y más predecible.

### Puntos de control — aplicar flags en el código

**Aplicables inmediatamente (archivos existen):**

```typescript
// 1. Directorio público — src/app/(public)/directorio/page.tsx
// Al inicio del server component:
import { getFeatureFlag } from '@/compartido/lib/features'
const habilitado = await getFeatureFlag('directorio_publico')
if (!habilitado) notFound()

// 2. Academia — src/app/(taller)/taller/aprender/page.tsx
// Al inicio, después del auth check:
const habilitado = await getFeatureFlag('academia')
if (!habilitado) {
  return (
    <div className="text-center py-12">
      <p className="text-gray-500">Módulo no disponible todavía.</p>
    </div>
  )
}

// 3. Notificaciones matching — src/compartido/lib/notificaciones.ts
// Al inicio de notificarTalleresCompatibles():
import { getFeatureFlag } from './features'
export async function notificarTalleresCompatibles(pedidoId: string): Promise<void> {
  if (!await getFeatureFlag('matching_notificaciones')) return
  // ... resto del código existente
}
```

**Aplicables cuando Sergio cree los archivos (marcar como pendientes):**

```typescript
// 4. Formulario denuncia — src/app/(public)/denunciar/page.tsx
// Nota: es client component. La verificación debe hacerse vía una prop
// desde un layout o wrapper server component, o con un fetch client-side.
// Opción simple: agregar check en POST /api/denuncias:
// if (!await getFeatureFlag('denuncias')) return NextResponse.json({ error: 'Funcionalidad no disponible' }, { status: 503 })

// 5. Botón publicar pedido — cuando exista src/marca/componentes/publicar-pedido.tsx
// Pasar prop `habilitado` desde el server component padre

// 6. Formulario cotización — cuando exista src/taller/componentes/cotizar-form.tsx
// Pasar prop `habilitado` desde el server component padre

// 7. Descarga acuerdo PDF — cuando exista el link en taller/marca
// Pasar prop `habilitado` desde el server component padre

// 8. Asistente RAG — cuando exista src/taller/componentes/asistente-chat.tsx
// Pasar prop `habilitado` desde el server component padre
```

Para los puntos en client components (5-8), el patrón es: el server component lee el flag y lo pasa como prop boolean. El client component no renderiza si `!habilitado`.

### Archivo a modificar — `src/app/(admin)/admin/configuracion/page.tsx`

**Cambio 1 — Agregar tab "Features" al array de tabs (línea 70):**

```typescript
const tabs = [
  { key: 'general' as const, label: 'General' },
  { key: 'emails' as const, label: 'Emails' },
  { key: 'integraciones' as const, label: 'Integraciones' },
  { key: 'features' as const, label: 'Features' },
]
```

Actualizar el tipo de `tab` en el useState (línea 9):

```typescript
const [tab, setTab] = useState<'general' | 'emails' | 'integraciones' | 'features'>('general')
```

**Cambio 2 — Agregar estado para los flags (junto a los otros useState):**

```typescript
const [flagsE1, setFlagsE1] = useState<Record<string, boolean>>({})
const [flagsE2, setFlagsE2] = useState<Record<string, boolean>>({})
```

**Cambio 3 — Cargar flags en el useEffect existente (línea 23), agregar dos fetches más:**

```typescript
useEffect(() => {
  Promise.all([
    fetch('/api/admin/config').then(r => r.json()),
    fetch('/api/admin/config?grupo=features_e1').then(r => r.json()),
    fetch('/api/admin/config?grupo=features_e2').then(r => r.json()),
  ]).then(([configData, e1Data, e2Data]) => {
    // Parsear configs generales (código existente)
    const configs = configData.configs ?? configData
    // ...código existente de parseo...

    // Parsear flags
    const e1Map: Record<string, boolean> = {}
    for (const c of (e1Data.configs ?? [])) e1Map[c.clave] = c.valor === 'true'
    setFlagsE1(e1Map)

    const e2Map: Record<string, boolean> = {}
    for (const c of (e2Data.configs ?? [])) e2Map[c.clave] = c.valor === 'true'
    setFlagsE2(e2Map)
  }).catch(() => {}).finally(() => setLoading(false))
}, [])
```

**Cambio 4 — Agregar función para toggle individual (guarda inmediatamente al cambiar):**

```typescript
async function handleToggleFlag(clave: string, grupo: string, valor: boolean) {
  // Actualizar UI optimistamente
  if (grupo === 'features_e1') setFlagsE1(prev => ({ ...prev, [clave]: valor }))
  else setFlagsE2(prev => ({ ...prev, [clave]: valor }))

  await fetch('/api/admin/config', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clave, valor: String(valor), grupo }),
  })
}
```

**Cambio 5 — Agregar contenido del tab "Features" en el JSX:**

```typescript
const flagLabels: Record<string, { label: string; desc: string }> = {
  registro_talleres: { label: 'Registro de talleres', desc: 'Permite que nuevos talleres se registren' },
  registro_marcas: { label: 'Registro de marcas', desc: 'Permite que nuevas marcas se registren' },
  directorio_publico: { label: 'Directorio público', desc: 'Directorio visible sin login' },
  academia: { label: 'Academia', desc: 'Módulo de capacitación y certificados' },
  formalizacion: { label: 'Formalización', desc: 'Checklist y upload de documentos' },
  dashboard_estado: { label: 'Dashboard Estado', desc: 'Acceso al panel del organismo público' },
  denuncias: { label: 'Denuncias', desc: 'Formulario público de denuncias anónimas' },
  publicacion_pedidos: { label: 'Publicación de pedidos', desc: 'Marcas pueden publicar pedidos (E2)' },
  cotizaciones: { label: 'Cotizaciones', desc: 'Talleres pueden cotizar pedidos publicados (E2)' },
  acuerdos_pdf: { label: 'Acuerdos PDF', desc: 'Descarga de acuerdo de manufactura en PDF (E2)' },
  matching_notificaciones: { label: 'Notificaciones de matching', desc: 'Alertas automáticas a talleres compatibles (E2)' },
  asistente_rag: { label: 'Asistente IA', desc: 'Chat con asistente en la academia (E2)' },
}
```

```tsx
{tab === 'features' && (
  <>
    <Card className="mb-6">
      <h2 className="font-overpass font-bold text-brand-blue mb-4">Escenario 1 — Formalización</h2>
      <div className="space-y-3">
        {Object.entries(flagsE1).map(([clave, activo]) => (
          <label key={clave} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <div>
              <p className="text-sm font-medium text-gray-800">{flagLabels[clave]?.label ?? clave}</p>
              <p className="text-xs text-gray-500">{flagLabels[clave]?.desc}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={activo ? 'success' : 'muted'}>{activo ? 'Activo' : 'Desactivado'}</Badge>
              <input type="checkbox" checked={activo}
                onChange={e => handleToggleFlag(clave, 'features_e1', e.target.checked)}
                className="rounded accent-brand-blue" />
            </div>
          </label>
        ))}
      </div>
    </Card>

    <Card className="mb-6">
      <h2 className="font-overpass font-bold text-brand-blue mb-4">Escenario 2 — Marketplace</h2>
      <div className="space-y-3">
        {Object.entries(flagsE2).map(([clave, activo]) => (
          <label key={clave} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <div>
              <p className="text-sm font-medium text-gray-800">{flagLabels[clave]?.label ?? clave}</p>
              <p className="text-xs text-gray-500">{flagLabels[clave]?.desc}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={activo ? 'success' : 'muted'}>{activo ? 'Activo' : 'Desactivado'}</Badge>
              <input type="checkbox" checked={activo}
                onChange={e => handleToggleFlag(clave, 'features_e2', e.target.checked)}
                className="rounded accent-brand-blue" />
            </div>
          </label>
        ))}
      </div>
    </Card>
  </>
)}
```

## 5. Casos borde

- Flag no existe en DB → `getFeatureFlag` retorna `false` por defecto (seguro)
- Sin cache en memoria → cada request lee de DB, predecible y consistente
- Admin desactiva registro mientras alguien está en medio del proceso → el proceso en curso termina igual, el flag solo afecta nuevos accesos
- Todos los flags de E2 en false por defecto → el sistema arranca como E1 puro
- Client components no pueden llamar `getFeatureFlag` → reciben el flag como prop desde el server component padre

## 6. Criterio de aceptación

- [ ] `getFeatureFlag('academia')` retorna `true` después del seed
- [ ] `getFeatureFlag('cotizaciones')` retorna `false` después del seed
- [ ] Tab "Features" aparece en `/admin/configuracion` con los 12 toggles
- [ ] Desactivar un flag desde el admin → la funcionalidad desaparece en la UI
- [ ] Activar `publicacion_pedidos` → aparece el botón "Publicar pedido" en los pedidos
- [ ] Build pasa sin errores

## 7. Tests (verificación manual — Sergio)

1. Correr seed → verificar en Supabase que existen los 12 flags
2. Desactivar `academia` desde `/admin/configuracion` → ir a `/taller/aprender` → verificar que muestra "Módulo no disponible"
3. Activar `cotizaciones` → ir a un pedido disponible → verificar que aparece el formulario de cotizar
4. Desactivar `directorio_publico` → ir a `/directorio` sin login → verificar notFound()
