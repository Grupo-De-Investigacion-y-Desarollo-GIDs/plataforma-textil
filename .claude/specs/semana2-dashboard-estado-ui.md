# Spec: Dashboard Estado — UI completa

- **Semana:** 2
- **Asignado a:** Sergio
- **Dependencias:** semana2-queries-dashboard-estado (Gerardo debe haber mergeado — las queries nuevas deben existir)

---

## ANTES DE ARRANCAR

Verificar que estos commits estan en develop antes de tocar codigo:

- [ ] semana2-queries-dashboard-estado (Gerardo) — commit con mensaje `feat: queries dashboard estado`
- [ ] Verificar que el archivo `estado/page.tsx` exporta las variables: `progresoPromedio`, `talleresInactivos`, `denunciasSinResolver`, `certificadosMes`, `subieronNivelMes`

Si no estan mergeados, NO arrancar. Avisarle a Gerardo.

---

## 1. Contexto

El spec semana2-queries-dashboard-estado (Gerardo) agrega todas las queries necesarias al dashboard Estado. Este spec es solo UI — reorganizar la pagina en las 3 secciones definidas en la arquitectura usando los datos que Gerardo dejo disponibles. No hay queries nuevas en este spec.

---

## 2. Que construir

Reorganizar `src/app/(estado)/estado/page.tsx` en 3 secciones visuales claras:

- Seccion 1: "Como esta el sector?"
- Seccion 2: "Donde hay que actuar?"
- Seccion 3: "Que esta funcionando?"

---

## 3. Datos

- Todas las variables ya existen en el `page.tsx` despues del merge de Gerardo
- No hay queries nuevas — solo reorganizacion visual

---

## 4. Prescripciones tecnicas

### Archivo a modificar — `src/app/(estado)/estado/page.tsx`

#### Imports — actualizar la linea de Lucide

Reemplazar la linea de imports de lucide-react (linea 9) por:

```typescript
import { Factory, Store, FileCheck, Award, Clock, TrendingUp, AlertCircle, BookOpen, ShoppingBag } from 'lucide-react'
```

Se agregan `BookOpen` (cursos completados) y `ShoppingBag` (pedidos activos).

#### Eliminar card "Capacitacion" del grid medio

Eliminar la card "Capacitacion" (lineas 113-131 del archivo actual). Esos datos (cursos completados + certificados emitidos) se muestran ahora en la seccion 3 como cards individuales. Eliminar tambien el grid `grid-cols-1 md:grid-cols-2` que la contenia — la card "Distribucion por nivel" se mueve a la seccion 1.

#### Header — actualizar

```tsx
<div className="mb-8">
  <h1 className="font-overpass font-bold text-3xl text-brand-blue">Dashboard del Sector</h1>
  <p className="text-gray-500 text-sm mt-1">Monitoreo de la Plataforma Digital Textil</p>
</div>
```

#### Seccion 1 — "Como esta el sector?"

```tsx
<div>
  <h2 className="font-overpass font-bold text-lg text-gray-700 mb-4">Como esta el sector?</h2>

  {/* Grid 4 stats */}
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
    <Card className="text-center">
      <Factory className="w-6 h-6 text-brand-blue mx-auto mb-1" />
      <p className="font-overpass font-bold text-3xl text-brand-blue">{totalTalleres}</p>
      <p className="text-xs text-gray-500">Talleres registrados</p>
    </Card>
    <Card className="text-center">
      <Store className="w-6 h-6 text-brand-blue mx-auto mb-1" />
      <p className="font-overpass font-bold text-3xl text-brand-blue">{totalMarcas}</p>
      <p className="text-xs text-gray-500">Marcas registradas</p>
    </Card>
    <Card className="text-center">
      <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-1" />
      <p className="font-overpass font-bold text-3xl text-brand-blue">{progresoPromedio}%</p>
      <p className="text-xs text-gray-500">Progreso promedio formalizacion</p>
    </Card>
    <Card className="text-center">
      <ShoppingBag className="w-6 h-6 text-orange-500 mx-auto mb-1" />
      <p className="font-overpass font-bold text-3xl text-brand-blue">{pedidosActivos}</p>
      <p className="text-xs text-gray-500">Pedidos en ejecucion</p>
    </Card>
  </div>

  {/* Distribucion por nivel — mover la card existente aqui */}
  <Card title="Distribucion por nivel">
    {/* Barras Bronce/Plata/Oro existentes — copiar tal cual */}
  </Card>
</div>
```

#### Seccion 2 — "Donde hay que actuar?"

```tsx
<div>
  <h2 className="font-overpass font-bold text-lg text-gray-700 mb-4">Donde hay que actuar?</h2>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

    {/* Card: Validaciones pendientes */}
    <Card className="border-l-4 border-l-amber-400">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-800">{validacionesPendientes}</p>
          <p className="text-sm text-gray-500">Validaciones pendientes</p>
        </div>
        <Clock className="w-8 h-8 text-amber-400" />
      </div>
      {validacionesPendientes > 0 && (
        <Link href="/admin/talleres" className="text-xs text-brand-blue hover:underline mt-2 block">
          Revisar documentos →
        </Link>
      )}
    </Card>

    {/* Card: Denuncias sin resolver */}
    <Card className="border-l-4 border-l-red-400">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-800">{denunciasSinResolver}</p>
          <p className="text-sm text-gray-500">Denuncias sin resolver</p>
        </div>
        <AlertCircle className="w-8 h-8 text-red-400" />
      </div>
      {/* Sin link por ahora — /admin/denuncias se implementa en semana 3 */}
    </Card>

    {/* Card: Talleres sin actividad */}
    <Card className="border-l-4 border-l-gray-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-800">{talleresInactivos}</p>
          <p className="text-sm text-gray-500">Talleres sin actividad (30 dias)</p>
        </div>
        <Factory className="w-8 h-8 text-gray-400" />
      </div>
    </Card>

  </div>

  {/* Lista detallada de validaciones pendientes — mantener la lista existente de 5 items */}
  {validacionesPendientes > 0 && (
    <Card title={
      <span className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-yellow-500" />
        Validaciones pendientes de revision
        {validacionesPendientes > 0 && (
          <Badge variant="warning">{validacionesPendientes}</Badge>
        )}
      </span>
    } className="mt-4">
      {/* Lista existente de ultimasPendientes — copiar tal cual */}
    </Card>
  )}
</div>
```

#### Seccion 3 — "Que esta funcionando?"

```tsx
<div>
  <h2 className="font-overpass font-bold text-lg text-gray-700 mb-4">Que esta funcionando?</h2>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

    {/* Card: Certificados este mes */}
    <Card className="border-l-4 border-l-green-400">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-800">{certificadosMes}</p>
          <p className="text-sm text-gray-500">Certificados este mes</p>
          <p className="text-xs text-gray-400">{totalCertificados} total</p>
        </div>
        <Award className="w-8 h-8 text-green-400" />
      </div>
    </Card>

    {/* Card: Talleres que subieron de nivel */}
    <Card className="border-l-4 border-l-blue-400">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-800">{subieronNivelMes}</p>
          <p className="text-sm text-gray-500">Subieron de nivel este mes</p>
        </div>
        <TrendingUp className="w-8 h-8 text-blue-400" />
      </div>
    </Card>

    {/* Card: Cursos completados */}
    <Card className="border-l-4 border-l-purple-400">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-800">{cursosCompletados}</p>
          <p className="text-sm text-gray-500">Cursos completados</p>
        </div>
        <BookOpen className="w-8 h-8 text-purple-400" />
      </div>
    </Card>

  </div>

  {/* Actividad reciente — mantener la lista existente */}
  {logsNivel.length > 0 && (
    <Card title="Actividad reciente — Aprobaciones" className="mt-4">
      {/* Lista existente de logsNivel — copiar tal cual */}
    </Card>
  )}
</div>
```

---

## 5. Casos borde

- **Si `denunciasSinResolver = 0`** → mostrar la card igual con el numero 0, no ocultar
- **Si `subieronNivelMes = 0`** → mostrar 0, no ocultar
- **Si no hay actividad reciente** → no mostrar la card (logica existente con `logsNivel.length > 0`)
- **`border-l-4` en Card** → funciona correctamente con el componente Card que tiene `border border-gray-100` por defecto. El `border-l-4` sobreescribe el borde izquierdo.

---

## 6. Criterio de aceptacion

- [ ] El dashboard muestra 3 secciones con titulos claros ("Como esta el sector?", "Donde hay que actuar?", "Que esta funcionando?")
- [ ] Los titulos de seccion usan `font-overpass font-bold`
- [ ] Seccion 1 muestra `totalTalleres`, `totalMarcas`, `progresoPromedio` y distribucion por nivel
- [ ] Seccion 2 muestra `validacionesPendientes`, `denunciasSinResolver`, `talleresInactivos` con bordes de color
- [ ] Seccion 3 muestra `certificadosMes`, `subieronNivelMes`, `cursosCompletados` con bordes de color
- [ ] La card "Capacitacion" vieja fue eliminada (no hay duplicacion)
- [ ] La lista de validaciones pendientes solo aparece si hay pendientes
- [ ] La card de denuncias no tiene link
- [ ] Todos los colores de texto usan `gray` (no `slate`)
- [ ] Build pasa sin errores

---

## 7. Tests (verificacion manual)

1. Loguearse con usuario ESTADO → verificar las 3 secciones con titulos
2. Verificar que los numeros coinciden con los datos del seed
3. Verificar que el link "Revisar documentos" aparece solo si hay validaciones pendientes
4. Verificar que la card de denuncias no tiene link clickeable
5. Verificar que no existe una card duplicada "Capacitacion" del layout viejo
6. Verificar en el inspector que los textos usan `gray`, no `slate`
