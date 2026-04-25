# Spec: Tu proximo nivel — guia de formalizacion en el dashboard del taller

- **Version:** V3
- **Origen:** V3_BACKLOG F-01
- **Asignado a:** Gerardo
- **Prioridad:** Alta — pieza central de la propuesta de valor para OIT (formalizacion guiada)

---

## ANTES DE ARRANCAR

- [ ] V3_BACKLOG D-01 mergeado (redefinicion de roles ESTADO)
- [ ] V3_BACKLOG D-02 mergeado (tipos de documento desde DB con `calcularProximoNivel()` disponible)

---

## 1. Contexto

V2 cerro con un banner contextual basico en el dashboard del taller que dice cosas como "Te falta 1 certificado de academia para subir a PLATA". Es util pero limitado:

- Es un solo banner — no muestra todos los pasos faltantes
- No tiene accion directa — el taller tiene que descubrir donde resolver cada cosa
- No comunica los beneficios concretos de subir de nivel
- Solo aparece si el taller esta cerca del proximo nivel (puntos altos)

Para OIT esto es insuficiente. La **plataforma debe guiar activamente al taller hacia la formalizacion** — ese es el valor diferencial respecto a un directorio pasivo. El taller necesita ver, sin ambiguedad:

1. **Que le falta concretamente** para subir al proximo nivel
2. **Cuantos puntos suma cada accion** (gamificacion clara)
3. **Que obtiene al subir** (motivacion)
4. **Como hacerlo ya mismo** (botones de accion directos)

Este spec construye una seccion "Tu proximo nivel" prominente en el dashboard del taller, con todos los pasos visibles, ordenados por prioridad e impacto.

---

## 2. Que construir

1. **Seccion "Tu proximo nivel"** en `/taller` (dashboard) — reemplaza el banner contextual de V2 con un componente estructurado
2. **Lista priorizada de pasos** — ordenada por: 1) impacto en puntos, 2) facilidad de completar, 3) requeridos antes que opcionales
3. **Cada paso con:** titulo, puntos que suma, descripcion corta, boton de accion directo
4. **Card de beneficios del proximo nivel** — muestra los `beneficios` configurados en `ReglaNivel`
5. **Estado especial "ya estas en ORO"** — celebracion + invitacion a mantener el nivel
6. **Barra de progreso visual** — porcentaje hacia el proximo nivel

---

## 3. Wireframe del componente

```
+--------------------------------------------------------------+
| Tu proximo nivel: PLATA                                       |
| ============================............  60% (30 / 50 pts)   |
|                                                                |
| Te faltan 3 pasos para subir a PLATA:                          |
|                                                                |
| 1. Verifica tu CUIT en ARCA                       +10 pts     |
|    Tu CUIT esta pendiente de verificacion.                    |
|    [Verificar ahora ->]                                       |
|                                                                |
| 2. Subi tu constancia de monotributo              +15 pts     |
|    Documento requerido para PLATA                             |
|    [Subir documento ->]                                       |
|                                                                |
| 3. Completa un curso de la academia               +0 pts (req)|
|    PLATA requiere al menos 1 certificado.                     |
|    [Ver cursos ->]                                            |
|                                                                |
| -----                                                         |
|                                                                |
| Al alcanzar PLATA vas a obtener:                               |
|   - Apareces mas arriba en el directorio                      |
|   - Acceso a pedidos de marcas medianas                       |
|   - Distintivo PLATA visible en tu perfil                     |
|                                                                |
+--------------------------------------------------------------+
```

Si el taller ya esta en ORO:

```
+--------------------------------------------------------------+
| Estas en nivel ORO!                                            |
|                                                                |
| Sos parte del top de talleres de la plataforma. Mantenete     |
| activo cumpliendo con los pedidos para conservar tu nivel.    |
|                                                                |
| Tu proximo paso:                                              |
| - Mantene tus documentos al dia                               |
| - Segui capacitandote en la academia                          |
| - Completa tus pedidos en tiempo                              |
|                                                                |
+--------------------------------------------------------------+
```

---

## 4. Logica de priorizacion

La funcion `calcularProximoNivel()` (definida en D-02) devuelve los datos crudos. Este spec define **como ordenar y presentar** esos datos en la UI.

### 4.1 — Orden de los pasos

> **Dependencia D-02:** la interface `ProximoNivelInfo.documentosFaltantes[]` definida en D-02 tiene `{ id, nombre, nivelMinimo, puntos }`. Este spec necesita ademas `requerido: boolean` para distinguir documentos requeridos de opcionales en la UI. **Actualizar D-02** agregando `requerido` al tipo de los items antes de implementar F-01.

```typescript
function ordenarPasos(info: ProximoNivelInfo): Paso[] {
  const pasos: Paso[] = []

  // 1. CUIT pendiente de verificacion (si requiereAfip)
  if (info.requiereAfip) {
    pasos.push({
      id: 'verificar-afip',
      titulo: 'Verifica tu CUIT en ARCA',
      descripcion: 'Tu CUIT esta pendiente de verificacion.',
      puntos: 10,
      prioridad: 1,  // siempre primero
      requerido: true,
      accion: { texto: 'Verificar ahora', href: '/taller/perfil/verificar-cuit' },
    })
  }

  // 2. Documentos faltantes — ordenados por puntos descendente
  const docsOrdenados = [...info.documentosFaltantes].sort((a, b) => b.puntos - a.puntos)
  for (const doc of docsOrdenados) {
    pasos.push({
      id: `documento-${doc.id}`,
      titulo: `Subi tu ${doc.nombre.toLowerCase()}`,
      descripcion: doc.requerido
        ? 'Documento requerido para tu proximo nivel'
        : 'Documento opcional — suma puntos extras',
      puntos: doc.puntos,
      prioridad: doc.requerido ? 2 : 4,  // requeridos antes que opcionales
      requerido: doc.requerido,
      accion: { texto: 'Subir documento', href: '/taller/formalizacion' },
    })
  }

  // 3. Certificados de academia faltantes
  if (info.certificadosFaltantes > 0) {
    pasos.push({
      id: 'certificados-academia',
      titulo: info.certificadosFaltantes === 1
        ? 'Completa un curso de la academia'
        : `Completa ${info.certificadosFaltantes} cursos de la academia`,
      descripcion: `Tu proximo nivel requiere al menos ${info.certificadosFaltantes} certificado${info.certificadosFaltantes > 1 ? 's' : ''} mas`,
      puntos: 0,
      prioridad: 3,
      requerido: true,
      accion: { texto: 'Ver cursos', href: '/taller/aprender' },
    })
  }

  return pasos.sort((a, b) => a.prioridad - b.prioridad)
}
```

### 4.2 — Tipo `Paso`

```typescript
interface Paso {
  id: string                  // identificador unico del paso
  titulo: string              // visible en card
  descripcion: string         // texto explicativo
  puntos: number              // puntos que suma (puede ser 0)
  prioridad: number           // 1 = mas prioritario
  requerido: boolean          // afecta badge visual
  accion: {
    texto: string             // texto del boton
    href: string              // donde lleva
  }
}
```

---

## 5. Implementacion

### 5.1 — Server component que obtiene datos

Archivo: `src/taller/componentes/proximo-nivel-card.tsx`

> **Dependencia D-02:** la interface `ProximoNivelInfo` definida en D-02 tiene `puntosFaltantes` pero no `puntosActuales` ni `puntosObjetivo`. La barra de progreso necesita ambos para mostrar "X / Y pts". **Actualizar D-02** agregando `puntosActuales: number` (puntaje actual del taller) y `puntosObjetivo: number` (puntosMinimos de la ReglaNivel del proximo nivel) a la interface.

```typescript
import { calcularProximoNivel } from '@/compartido/lib/nivel'

export async function ProximoNivelCard({ tallerId }: { tallerId: string }) {
  const info = await calcularProximoNivel(tallerId)

  if (info.nivelProximo === null) {
    return <NivelOroCelebracion />
  }

  const pasos = ordenarPasos(info)

  return (
    <Card>
      <CardHeader>
        <h2>Tu proximo nivel: {info.nivelProximo}</h2>
        <BarraProgreso
          puntosActuales={info.puntosActuales}
          puntosObjetivo={info.puntosObjetivo}
        />
      </CardHeader>

      <CardBody>
        <p className="text-sm text-zinc-600">
          Te faltan {pasos.length} paso{pasos.length > 1 ? 's' : ''} para subir a {info.nivelProximo}:
        </p>

        <div className="space-y-3 mt-4">
          {pasos.map(paso => (
            <PasoItem key={paso.id} paso={paso} />
          ))}
        </div>

        <BeneficiosNivel beneficios={info.beneficiosProximoNivel} nivel={info.nivelProximo} />
      </CardBody>
    </Card>
  )
}
```

### 5.2 — Componente `PasoItem`

```tsx
function PasoItem({ paso }: { paso: Paso }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{paso.titulo}</span>
          {paso.puntos > 0 && (
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
              +{paso.puntos} pts
            </span>
          )}
          {!paso.requerido && (
            <span className="text-xs text-zinc-500">opcional</span>
          )}
        </div>
        <p className="text-sm text-zinc-600 mt-1">{paso.descripcion}</p>
      </div>
      <Link
        href={paso.accion.href}
        className="text-sm text-violet-600 hover:underline whitespace-nowrap"
      >
        {paso.accion.texto} ->
      </Link>
    </div>
  )
}
```

### 5.3 — Componente `BarraProgreso`

```tsx
function BarraProgreso({ puntosActuales, puntosObjetivo }: { puntosActuales: number; puntosObjetivo: number }) {
  const porcentaje = Math.min(100, Math.round((puntosActuales / puntosObjetivo) * 100))

  return (
    <div>
      <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-400 to-amber-500"
          style={{ width: `${porcentaje}%` }}
        />
      </div>
      <p className="text-xs text-zinc-500 mt-1">
        {porcentaje}% ({puntosActuales} / {puntosObjetivo} pts)
      </p>
    </div>
  )
}
```

### 5.4 — Integracion en el dashboard

Archivo: `src/app/(taller)/taller/page.tsx`

Remover el banner contextual inline de V2. **No existe un componente separado** — el banner es JSX inline en `taller/page.tsx`:

- **Lineas 171-184:** logica de `bannerMensaje` y `bannerLink` — eliminar
- **Lineas 362-370:** render del banner standalone (`<div className="bg-brand-bg-light rounded-xl p-5 border-l-4 border-brand-blue">`) — eliminar
- **Lineas 264-291:** mensajes inline de nivel dentro del card "Progreso de Formalizacion" (bloques condicionales `taller.nivel === 'BRONCE'`, `'PLATA'`, `'ORO'` con textos "Te faltan X documentos para ser PLATA/ORO" y "Estas en el nivel maximo") — eliminar porque `ProximoNivelCard` cubre lo mismo con mas detalle

Reemplazar con:

```tsx
<ProximoNivelCard tallerId={taller.id} />
```

Posicionar **entre el header de bienvenida** (lineas 192-199) **y el grid de progreso principal** (linea 233). Es el bloque mas importante despues de las stats de puntaje.

> **Nota:** las constantes `PTS_VERIFICADO_AFIP`, `PTS_POR_VALIDACION`, `PTS_POR_CERTIFICADO`, `PUNTAJE_MAX` importadas en lineas 9-13 tambien se eliminan como parte de D-02. El card de "Puntaje" (lineas 296-314) que las usa se actualiza en D-02, no en este spec.

### 5.5 — Estado especial ORO

> **Confirmado:** `nivelProximo: null` es la senal correcta para ORO segun D-02 (`ProximoNivelInfo.nivelProximo: NivelTaller | null // null si ya es ORO`). `calcularProximoNivel()` lee el nivel actual de DB. Si un taller es ORO en DB pero un cambio de reglas lo bajaria, sigue mostrando la celebracion de ORO hasta que `aplicarNivel()` lo recalcule via trigger o sincronizacion (ver seccion 6).

```tsx
function NivelOroCelebracion() {
  return (
    <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-300">
      <CardBody>
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-xl font-semibold text-amber-900">Estas en nivel ORO!</h2>
        </div>

        <p className="text-sm text-amber-800">
          Sos parte del top de talleres de la plataforma. Mantenete activo cumpliendo con
          los pedidos para conservar tu nivel.
        </p>

        <div className="mt-4">
          <p className="text-sm font-semibold text-amber-900 mb-2">Para mantener ORO:</p>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>Mantene tus documentos al dia</li>
            <li>Segui capacitandote en la academia</li>
            <li>Completa tus pedidos en tiempo</li>
          </ul>
        </div>
      </CardBody>
    </Card>
  )
}
```

### 5.6 — Componente `SincronizarNivel` (client)

Archivo: `src/taller/componentes/sincronizar-nivel.tsx`

Un render de pagina no debe tener side effects. La sincronizacion de nivel se dispara post-mount desde un componente client:

```tsx
'use client'

import { useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { sincronizarNivel } from './sincronizar-nivel-action'

export function SincronizarNivel({ tallerId }: { tallerId: string }) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      const resultado = await sincronizarNivel(tallerId)
      if (resultado.cambio) {
        router.refresh()
      }
    })
  }, [tallerId, router, startTransition])

  return null  // no renderiza nada
}
```

Server action asociada:

```typescript
// src/taller/componentes/sincronizar-nivel-action.ts
'use server'

import { aplicarNivel } from '@/compartido/lib/nivel'
import { auth } from '@/compartido/lib/auth'

export async function sincronizarNivel(tallerId: string): Promise<{ cambio: boolean }> {
  const session = await auth()
  if (!session?.user) return { cambio: false }

  const resultado = await aplicarNivel(tallerId, session.user.id)
  // aplicarNivel ya loguea si hubo cambio
  // El caller compara con lo que tenia antes — pero no necesita saber el nivel anterior
  // Solo nos importa si hubo cambio para hacer refresh
  return { cambio: resultado.nivel !== resultado.nivel }
  // ^^^ esto siempre es false — necesitamos comparar con el nivel previo
}
```

> **Nota de implementacion:** `aplicarNivel()` ya retorna `ResultadoNivel` pero no indica si hubo cambio. Hay dos opciones:
>
> 1. Pasar el `nivelActual` del taller como parametro al server action y comparar con `resultado.nivel`
> 2. Extender `aplicarNivel()` para que retorne `{ ...resultado, cambio: boolean }`
>
> Opcion 1 es mas simple y no modifica la firma de `aplicarNivel`:
>
> ```typescript
> export async function sincronizarNivel(tallerId: string, nivelActual: string): Promise<{ cambio: boolean }> {
>   const session = await auth()
>   if (!session?.user) return { cambio: false }
>   const resultado = await aplicarNivel(tallerId, session.user.id)
>   return { cambio: resultado.nivel !== nivelActual }
> }
> ```
>
> Y en el dashboard: `<SincronizarNivel tallerId={taller.id} nivelActual={taller.nivel} />`

---

## 6. Casos borde

- **Taller sin nivel asignado (recien registrado)** — `calcularProximoNivel()` devuelve `nivelActual: 'BRONCE'` y `nivelProximo: 'PLATA'`. La card aparece desde el primer login.

- **Configuracion de niveles cambia mientras el taller esta en sesion** — el server component re-renderiza en cada navegacion al dashboard. El cambio se ve la proxima vez que el taller entra a `/taller`.

- **Taller completa todos los requisitos pero `aplicarNivel()` no se disparo aun** — la card sigue mostrando el nivel anterior porque `aplicarNivel()` solo se ejecuta en triggers especificos (aprobar/rechazar validacion, etc). Esto es comportamiento esperado pero confuso. **Mitigacion V3:** el componente client `<SincronizarNivel>` (seccion 5.6) se monta en el dashboard y dispara `aplicarNivel()` post-mount via server action. Si hubo cambio de nivel, ejecuta `router.refresh()` para que el server component re-renderice con el nivel actualizado. Esto separa la lectura (server component puro, sin side effects) de la escritura (client-side triggered, fire-and-forget post-hidratacion).

- **Lista vacia (todo cumplido)** — no deberia pasar despues de la mitigacion anterior, pero si pasa, mostrar mensaje: "Estas listo para el proximo nivel — el sistema lo actualizara en breve".

- **Documentos requeridos pero opcionales son muchos** — si la lista pasa de 6-7 pasos, agregar paginacion visual (mostrar primeros 5 con "ver mas"). Para V3 con configuracion inicial son ~5 pasos maximo.

- **CUIT verificado pero hay error de ARCA mostrando pendiente** — el flag `verificadoAfip: false` puede estar mal por el problema de AfipSDK. La accion de "Verificar ahora" en este caso muestra un mensaje especifico: "Estamos teniendo problemas para conectarnos con ARCA. Tu informacion esta siendo revisada manualmente."

- **Beneficios vacios en `ReglaNivel`** — si el ESTADO no configuro `beneficios`, mostrar un placeholder generico: "Mejoras tu visibilidad en la plataforma".

---

## 7. Tests

| # | Que testear | Como | Verificador |
|---|-------------|------|-------------|
| 1 | Taller BRONCE ve card "Tu proximo nivel: PLATA" | Login como Roberto, dashboard | QA |
| 2 | Pasos ordenados por prioridad correctamente | Inspeccionar orden visual | QA |
| 3 | Botones llevan a la URL correcta | Click en cada accion, verificar destino | QA |
| 4 | Barra de progreso muestra porcentaje correcto | Comparar con calculo manual | DEV |
| 5 | Taller ORO ve celebracion (no card de progreso) | Configurar taller a ORO en seed, verificar | QA |
| 6 | Beneficios del proximo nivel vienen de ReglaNivel | Modificar beneficios en DB, verificar UI | QA |
| 7 | Cambio en config de ESTADO se refleja al recargar | ESTADO modifica regla, taller recarga dashboard | QA |
| 8 | Documentos opcionales aparecen al final con badge "opcional" | Configurar tipo opcional con puntos | QA |
| 9 | SincronizarNivel dispara actualizacion post-mount | Login con condiciones cumplidas, ver nivel actualizado tras refresh | DEV |
| 10 | Mensaje especifico cuando AfipSDK falla | Simular error de ARCA, verificar texto | DEV |

---

## 8. Validacion de dominio (perfiles interdisciplinarios)

**Politologo:**
- La gamificacion de la formalizacion (puntos, niveles, beneficios) es apropiada para una herramienta institucional?
- Los textos comunican que el Estado valida los documentos, no la plataforma?

**Economista:**
- Los puntos asignados a cada paso reflejan correctamente el costo/esfuerzo del taller?
- Los beneficios listados son los correctos para motivar formalizacion?
- Hay riesgo de que un taller se obsesione con puntos y descuide otros aspectos del trabajo?

**Sociologo:**
- El lenguaje es comprensible y motivador para un taller familiar?
- La estructura visual (badges, colores) es accesible para personas con poca experiencia digital?
- El uso de "vos/tenes" se mantiene consistente?
- Hay riesgo de que el taller sienta presion excesiva o juicio?

**Contador:**
- Los nombres de los documentos son los correctos (monotributo vs constancia de inscripcion)?
- Las acciones sugeridas reflejan el flujo real de tramites en Argentina?
- Falta algun documento critico para la realidad fiscal del sector textil?

---

## 9. Criterios de aceptacion

- [ ] Componente `ProximoNivelCard` creado en `src/taller/componentes/`
- [ ] Componentes auxiliares: `PasoItem`, `BarraProgreso`, `BeneficiosNivel`, `NivelOroCelebracion`
- [ ] Logica de priorizacion implementada (funcion `ordenarPasos`)
- [ ] Integracion en `/taller/page.tsx` reemplazando el banner contextual inline de V2 (lineas 171-184, 264-291, 362-370)
- [ ] Card visible para todos los talleres (BRONCE, PLATA, ORO)
- [ ] Datos vienen de `calcularProximoNivel()` (D-02)
- [ ] Acciones llevan a las paginas correctas
- [ ] Estado ORO muestra celebracion en lugar de card de progreso
- [ ] Sincronizacion de nivel via componente client `<SincronizarNivel>` post-mount (no side effects en render)
- [ ] Estilo coherente con design system V2
- [ ] D-02 actualizado con `puntosActuales`, `puntosObjetivo` y `requerido` en `ProximoNivelInfo`
- [ ] Build sin errores de TypeScript

---

## 10. Performance

La card hace 1 query (via `calcularProximoNivel()` que internamente hace 2-3 queries con cache). Tiempo estimado: <200ms warm. No hay problema.

`<SincronizarNivel>` dispara `aplicarNivel()` asincrono post-mount — no bloquea el render inicial del dashboard. El taller ve los datos actuales inmediatamente y si hay cambio de nivel, se refresca.

Si se detecta lentitud en produccion, considerar:
- Pre-calcular el progreso al aprobar validacion y guardarlo en `Taller.proximoNivelInfo` (JSON)
- Invalidar al cambiar configuracion

Esto se evalua en V4 si hace falta.

---

## 11. Cambios requeridos en D-02

Este spec depende de `ProximoNivelInfo` definida en D-02 (seccion 4.3). Antes de implementar F-01, actualizar la interface en D-02:

```typescript
export interface ProximoNivelInfo {
  nivelActual: NivelTaller
  nivelProximo: NivelTaller | null
  puntosActuales: number       // NUEVO — puntaje actual del taller
  puntosObjetivo: number       // NUEVO — puntosMinimos de la ReglaNivel del proximo nivel
  puntosFaltantes: number      // se mantiene (puntosObjetivo - puntosActuales)
  documentosFaltantes: {
    id: string
    nombre: string
    nivelMinimo: NivelTaller
    puntos: number
    requerido: boolean          // NUEVO — para distinguir requeridos de opcionales en la UI
  }[]
  requiereAfip: boolean
  certificadosFaltantes: number
  beneficiosProximoNivel: string[]
}
```

---

## 12. Referencias

- V3_BACKLOG -> F-01
- V2 issue #87 — primera version del banner contextual (mejora directa)
- D-01 — define el rol ESTADO que configura los beneficios
- D-02 — define `calcularProximoNivel()` y `ReglaNivel.beneficios`
