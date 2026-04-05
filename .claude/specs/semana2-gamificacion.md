# Spec: Gamificacion y narrativa de formalizacion

- **Semana:** 2
- **Asignado a:** Sergio
- **Dependencias:** Ninguna — puede hacerse desde el dia 1 de la semana 2

---

## 1. Contexto

La decision de diseno define que la formalizacion debe sentirse como un camino hacia mejores clientes, no como burocracia. Hay que agregar narrativa en lenguaje del taller, barra de progreso con proximo beneficio visible, micro-logros al subir de nivel y comparacion social. Todo en archivos ya existentes — no hay paginas nuevas.

Dependencia implicita: D4 (banner de nivel) requiere que los logs `NIVEL_SUBIDO` existan — esto viene del spec `semana2-queries-dashboard-estado`. Si Gerardo aun no lo mergeo, D4 no va a funcionar (el banner simplemente no se muestra porque no hay logs). D1, D2 y D3 no tienen dependencias.

---

## 2. Que construir

- Renombrar los 8 pasos de formalizacion a lenguaje del taller (D1)
- Asistente contextual en cada paso: para que sirve, como obtenerlo, link al tramite (D2)
- Barra de progreso con proximo beneficio visible en el dashboard (D3)
- Banner de logro al subir de nivel, detectado por log reciente server-side (D4)

---

## 3. Datos

- No hay cambios de schema
- Los 8 tipos de validacion ya existen: CUIT_MONOTRIBUTO, HABILITACION_MUNICIPAL, ART, INSCRIPCION_EMPLEADOR, SEGURIDAD_HIGIENE, HABILITACION_BOMBEROS, LIBRO_SUELDOS, CERTIFICACION_AMBIENTAL
- El nivel actual del taller viene del campo `nivel` en la tabla `talleres`
- El banner de logro (D4) lee de la tabla `log_actividad` buscando accion `NIVEL_SUBIDO` en las ultimas 24 horas

---

## 4. Prescripciones tecnicas

### Archivo a modificar — `src/app/(taller)/taller/formalizacion/page.tsx`

#### Cambio 1 — Renombrar tipos de validacion a lenguaje del taller (D1)

Reemplazar directamente el campo `label` en el array `tiposValidacion` existente (lineas 15-24). No crear un mapa separado — mantener un unico source of truth:

```typescript
const tiposValidacion = [
  { tipo: 'CUIT_MONOTRIBUTO', label: 'Registrate en ARCA', descripcion: 'Inscripcion en ARCA (ex-AFIP)', enlace: 'https://www.afip.gob.ar' },
  { tipo: 'HABILITACION_MUNICIPAL', label: 'Habilita tu local', descripcion: 'Permiso de funcionamiento del municipio', enlace: null },
  { tipo: 'ART', label: 'Asegura a tu equipo', descripcion: 'Seguro para trabajadores', enlace: null },
  { tipo: 'INSCRIPCION_EMPLEADOR', label: 'Registra tus empleados', descripcion: 'Registro en ARCA como empleador', enlace: 'https://www.afip.gob.ar' },
  { tipo: 'SEGURIDAD_HIGIENE', label: 'Plan de seguridad', descripcion: 'Plan de seguridad e higiene laboral', enlace: null },
  { tipo: 'HABILITACION_BOMBEROS', label: 'Habilitacion de bomberos', descripcion: 'Certificado de prevencion contra incendios', enlace: null },
  { tipo: 'LIBRO_SUELDOS', label: 'Libro de sueldos digital', descripcion: 'Registro digital de remuneraciones', enlace: null },
  { tipo: 'CERTIFICACION_AMBIENTAL', label: 'Certificacion ambiental', descripcion: 'Gestion de residuos textiles (opcional)', enlace: null },
]
```

El `ChecklistItem` ya usa `tipo.label` para renderizar — no requiere cambio adicional.

#### Cambio 2 — Asistente contextual en cada paso (D2)

Agregar un mapa de info contextual en el mismo archivo, antes del componente:

```typescript
const validacionInfo: Record<string, { info: string; link: string; costo: string }> = {
  CUIT_MONOTRIBUTO: {
    info: 'Tu numero de identificacion fiscal. Es gratuito y se tramita online en ARCA.',
    link: 'https://www.afip.gob.ar/monotributo/',
    costo: 'Gratuito',
  },
  HABILITACION_MUNICIPAL: {
    info: 'Autorizacion del municipio para operar como taller. Varia segun el municipio.',
    link: 'https://www.gba.gob.ar/municipios',
    costo: 'Varia segun municipio',
  },
  ART: {
    info: 'Seguro obligatorio que cubre a tus trabajadores ante accidentes laborales.',
    link: 'https://www.srt.gob.ar/',
    costo: 'Desde $8.000/mes segun cantidad de empleados',
  },
  INSCRIPCION_EMPLEADOR: {
    info: 'Registro de tus empleados en AFIP. Obligatorio si tenes personal en relacion de dependencia.',
    link: 'https://www.afip.gob.ar/empleadores/',
    costo: 'Gratuito',
  },
  SEGURIDAD_HIGIENE: {
    info: 'Plan basico de prevencion de riesgos laborales en tu taller.',
    link: 'https://www.srt.gob.ar/index.shtml',
    costo: 'Desde $15.000 con profesional habilitado',
  },
  HABILITACION_BOMBEROS: {
    info: 'Verificacion de condiciones de seguridad contra incendios.',
    link: 'https://www.bomberos.gob.ar/',
    costo: 'Varia segun municipio',
  },
  LIBRO_SUELDOS: {
    info: 'Registro digital de sueldos y jornadas. Obligatorio para empleadores.',
    link: 'https://www.argentina.gob.ar/trabajo/librodesueldos',
    costo: 'Gratuito',
  },
  CERTIFICACION_AMBIENTAL: {
    info: 'Declaracion de impacto ambiental ante el municipio.',
    link: 'https://www.argentina.gob.ar/ambiente',
    costo: 'Varia segun municipio',
  },
}
```

En el render del checklist (lineas 116-156), para cada validacion que NO esta COMPLETADO, agregar debajo del `UploadButton` y el link al tramite:

```tsx
{estado !== 'COMPLETADO' && validacionInfo[tipo.tipo] && (
  <div className="mt-2 ml-8 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
    <p>{validacionInfo[tipo.tipo].info}</p>
    <div className="flex gap-4 mt-2 text-xs text-gray-500">
      <span className="font-medium">Costo: {validacionInfo[tipo.tipo].costo}</span>
      <a
        href={validacionInfo[tipo.tipo].link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-brand-blue font-semibold hover:underline"
      >
        Como tramitarlo →
      </a>
    </div>
  </div>
)}
```

El panel de info se muestra debajo del boton de upload, dentro del mismo `div` que ya tiene `ml-8` para alinear con el checklist.

### Archivo a modificar — `src/app/(taller)/taller/page.tsx`

#### Cambio 3 — ProgressRing con proximo beneficio (D3)

Agregar import del componente:

```typescript
import { ProgressRing } from '@/compartido/componentes/ui/progress-ring'
```

Reemplazar el SVG ring inline (lineas 96-110) por el componente `ProgressRing`:

```tsx
<ProgressRing percentage={porcentajeFormal} size={120} strokeWidth={10} />
```

Decision de diseno: el ring cambia de color azul (SVG inline anterior) a rojo (componente `ProgressRing`). Esto es intencional — es consistente con `formalizacion/page.tsx` que ya usa `ProgressRing` en rojo. El rojo es mas llamativo junto al panel de "proximo beneficio".

Agregar debajo del bloque del ring (despues del `<Link>` a "Ver detalle"), el panel de proximo beneficio:

```tsx
{taller && taller.nivel === 'BRONCE' && porcentajeFormal < 100 && (
  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
    <p className="font-medium text-amber-800">
      Te faltan {TOTAL_VALIDACIONES - completadas} documentos para ser PLATA
    </p>
    <p className="text-amber-600 text-xs mt-1">
      Con PLATA apareces mas arriba en el directorio y accedes a marcas mas grandes
    </p>
  </div>
)}
{taller && taller.nivel === 'PLATA' && porcentajeFormal < 100 && (
  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
    <p className="font-medium text-yellow-800">
      Te faltan {TOTAL_VALIDACIONES - completadas} documentos para ser ORO
    </p>
    <p className="text-yellow-600 text-xs mt-1">
      Con ORO apareces primero en el directorio y podes recibir pedidos grandes
    </p>
  </div>
)}
{taller && taller.nivel === 'ORO' && (
  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
    <p className="font-medium text-green-800">
      Estas en el nivel maximo! Sos un taller verificado ORO
    </p>
  </div>
)}
```

#### Cambio 4 — Banner de logro al subir de nivel (D4)

Deteccion server-side consultando logs recientes. No usa `searchParams` ni depende de redirects del admin.

Agregar despues de la query principal del taller (linea 29), antes de los calculos:

```typescript
// Detectar si subio de nivel en las ultimas 24hs
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
  ? (logNivelReciente.detalles as { nivelNuevo: string })?.nivelNuevo
  : null
```

En el render, agregar el banner despues del encabezado (linea 85) y antes del grid de progreso:

```tsx
{nivelNuevo && (
  <div className="p-4 bg-green-50 border-2 border-green-400 rounded-xl text-center">
    <p className="text-2xl mb-1">
      {nivelNuevo === 'ORO' ? '🥇' : '🥈'}
    </p>
    <p className="font-overpass font-bold text-green-800 text-lg">
      Subiste a nivel {nivelNuevo}!
    </p>
    <p className="text-green-600 text-sm mt-1">
      Tu taller ahora tiene mas visibilidad en el directorio
    </p>
  </div>
)}
```

No modificar el archivo `admin/talleres/[id]/page.tsx` — el banner se detecta por log, no por redirect.

Nota: si el spec `semana2-queries-dashboard-estado` no esta mergeado (la accion `NIVEL_SUBIDO` no se loguea todavia), `logNivelReciente` sera siempre `null` y el banner no se muestra. No es un error — simplemente D4 no tiene efecto hasta que el log exista.

---

## 5. Casos borde

- **Taller ya en nivel ORO** → no mostrar barra de proximo beneficio, mostrar mensaje de felicitacion verde
- **No hay log NIVEL_SUBIDO reciente** → `nivelNuevo` es null, banner no se muestra
- **Log NIVEL_SUBIDO con detalles malformados** → cast a `{ nivelNuevo }` retorna undefined, banner no se muestra
- **Validacion contextual sin info en el mapa** → el condicional `validacionInfo[tipo.tipo]` lo cubre (no renderiza nada). El mapa cubre los 8 tipos, no deberia pasar.
- **En mobile** el panel de info contextual se muestra completo debajo del checklist item — no requiere tratamiento especial.

---

## 6. Criterio de aceptacion

- [ ] Los 8 tipos de validacion muestran nombres en lenguaje del taller (ej: "Registrate en ARCA" en vez de "CUIT / Monotributo")
- [ ] Cada validacion no completada muestra panel con descripcion, costo y link al tramite
- [ ] El dashboard muestra `ProgressRing` (componente, no SVG inline) — color rojo consistente con formalizacion
- [ ] Debajo del ring aparece el panel de "proximo beneficio" segun nivel actual
- [ ] Si hay log `NIVEL_SUBIDO` en las ultimas 24hs, aparece banner de celebracion en el dashboard
- [ ] Si no hay log reciente, el banner no se muestra
- [ ] No se modifico `admin/talleres/[id]/page.tsx`
- [ ] Build pasa sin errores

---

## 7. Tests (verificacion manual)

1. Entrar a `/taller/formalizacion` → verificar que los 8 items tienen nombres en lenguaje del taller
2. Click en una validacion pendiente → verificar que aparece panel de info con costo y link "Como tramitarlo"
3. Entrar a `/taller` → verificar que el ring de progreso es rojo (ProgressRing) no azul (SVG viejo)
4. Con taller BRONCE → verificar panel amarillo "Te faltan X documentos para ser PLATA"
5. Con taller ORO → verificar panel verde "Estas en el nivel maximo!"
6. Insertar manualmente un log `NIVEL_SUBIDO` en `log_actividad` con `timestamp` dentro de las ultimas 24hs y `detalles: { tallerId: '...', nivelNuevo: 'PLATA' }` → recargar `/taller` → debe aparecer banner de celebracion
7. Esperar 24hs (o borrar el log) → recargar → banner no debe aparecer
