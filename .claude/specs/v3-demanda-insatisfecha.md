# Spec: Dashboard de demanda insatisfecha para el Estado

- **Version:** V3
- **Origen:** V3_BACKLOG F-05
- **Asignado a:** Gerardo
- **Prioridad:** Media-alta — valor institucional alto para OIT, no bloquea piloto tecnico

---

## ANTES DE ARRANCAR

- [ ] V3_BACKLOG D-01 mergeado (rol ESTADO con `/estado/talleres`)
- [ ] V3_BACKLOG D-02 mergeado (`ReglaNivel` con `puntosMinimos`, `calcularProximoNivel()` disponible)
- [ ] V3_BACKLOG Q-03 mergeado (formato de errores — los 3 endpoints de este spec deben usarlo)
- [ ] El sistema de matching de pedidos ya esta funcionando (V2)

---

## 1. Contexto

**El insight clave detectado en V2 (issues #63-71):**

Cuando una marca publica un pedido y no hay talleres compatibles, el sistema simplemente no envia notificaciones. La marca asume que nadie quiere su pedido, los talleres no se enteran que hubo demanda, y el ESTADO/OIT pierden informacion valiosisima sobre **donde no llega la oferta formal del sector**.

Pero esa demanda no satisfecha es exactamente el dato que mas importa para politica publica:

- Cuantos pedidos quedan sin cotizaciones por falta de talleres del nivel requerido?
- Que procesos productivos demanda el mercado pero no estan disponibles en los talleres formales?
- Que talleres estan a un paso de poder cotizar pero les falta una pieza especifica?

Esta informacion permite al ESTADO **intervenir con precision quirurgica**:
- Si fallan por nivel insuficiente -> acelerar formalizacion de los talleres del segmento
- Si fallan por capacidad -> apoyar inversion en equipamiento
- Si fallan por proceso no disponible -> capacitar en ese proceso

Sin este dashboard, OIT no puede transformar la plataforma en una herramienta de politica publica.

---

## 2. Que construir

1. **Registro de motivos de no-match** — cuando el matching no encuentra talleres, registrar por que
2. **Tabla nueva `MotivoNoMatch`** — captura cada caso para analisis posterior
3. **Dashboard `/estado/demanda-insatisfecha`** — vista agregada para el ESTADO
4. **Identificacion de "talleres cerca de matchear"** — talleres que cumplen casi todas las condiciones excepto una
5. **Recomendaciones de intervencion** — el dashboard sugiere acciones concretas
6. **Export a CSV** — para informes que el ESTADO presenta a OIT

---

## 3. Modelo de datos

### 3.1 — Tabla nueva `MotivoNoMatch`

Se crea un registro por cada pedido que no genera matches al publicarse.

```prisma
model MotivoNoMatch {
  id                  String   @id @default(cuid())

  // Pedido afectado
  pedidoId            String
  pedido              Pedido   @relation(fields: [pedidoId], references: [id], onDelete: Cascade)

  // Categoria agregada (para analisis)
  motivoCategoria     MotivoCategoria
  // SIN_TALLERES_NIVEL: hay talleres que matchearian si se relajara el nivel (BRONCE excluidos por hardcode PLATA/ORO)
  // SIN_TALLERES_CAPACIDAD: hay talleres del nivel pero ninguno con capacidad suficiente
  // SIN_TALLERES_PROCESO: hay talleres pero ninguno cubre los procesosRequeridos del pedido
  // OTROS: combinacion o motivo no clasificable

  // Detalle estructurado
  detalle             Json
  // Schema: {
  //   capacidadRequerida: 500,           // pedido.cantidad
  //   procesosRequeridos: ['CONFECCION'], // pedido.procesosRequeridos
  //   tipoPrenda: 'Remera basica',       // pedido.tipoPrenda
  //   talleresEvaluados: 23,
  //   talleresExcluidos: {
  //     porNivel: 18,                    // BRONCE que matchearian si se relajara nivel
  //     porCapacidad: 3,                 // PLATA/ORO pero capacidad insuficiente
  //     porProceso: 2,                   // PLATA/ORO con capacidad pero sin el proceso
  //   },
  //   talleresCerca: [
  //     { tallerId: 'abc', nombre: 'La Aguja', faltaPara: 'subir_a_plata', detalle: 'Le faltan 15 puntos' },
  //   ]
  // }

  resueltoEn          DateTime?  // si un taller matchea despues, se marca aca
  createdAt           DateTime @default(now())

  @@index([pedidoId])
  @@index([motivoCategoria])
  @@index([createdAt])
  @@map("motivos_no_match")
}

enum MotivoCategoria {
  SIN_TALLERES_NIVEL
  SIN_TALLERES_CAPACIDAD
  SIN_TALLERES_PROCESO
  OTROS
}
```

> **Nota V4:** la categoria `SIN_TALLERES_UBICACION` se omite porque el modelo `Pedido` no tiene campo geografico (`provinciaRequerida` no existe). Para implementar filtro geografico, agregar el campo al modelo Pedido en V4 y reintroducir esta categoria. Registrar en V3_BACKLOG como mejora futura.

### 3.2 — Modificacion del flujo de matching existente

> **Estado actual de `notificarTalleresCompatibles()`** en `src/compartido/lib/notificaciones.ts:81-131`:
>
> - Linea 82: verifica feature flag `matching_notificaciones`
> - Lineas 90-104: busca talleres con filtros:
>   - `nivel: { in: ['PLATA', 'ORO'] }` — **hardcodeado**, no viene del pedido
>   - `capacidadMensual: { gte: pedido.cantidad }` — el campo real es `cantidad`, no `cantidadPiezas`
>   - `user: { active: true }`
>   - Opcionalmente `prendas: { some: { prendaId: pedido.tipoPrendaId } }` si el pedido tiene tipoPrendaId
>   - **NO filtra por `procesosRequeridos`** — el pedido tiene este campo pero el matching lo ignora
>   - **NO filtra por ubicacion** — no existe campo geografico en Pedido
> - Linea 106: `if (talleres.length === 0) return` — **retorno silencioso, sin logging ni registro**
> - `take: 20`, `orderBy: { puntaje: 'desc' }`

**Punto de insercion:** reemplazar el `return` silencioso de linea 106 con el registro de motivo:

```typescript
// src/compartido/lib/notificaciones.ts — modificar notificarTalleresCompatibles()

export async function notificarTalleresCompatibles(pedidoId: string) {
  if (!await getFeatureFlag('matching_notificaciones')) return

  const pedido = await prisma.pedido.findUnique({
    where: { id: pedidoId },
    include: { marca: { select: { nombre: true } } },
  })
  if (!pedido) return

  // ... where clause existente (lineas 90-97) ...

  const talleres = await prisma.taller.findMany({
    where: whereClause,
    include: { user: { select: { id: true, email: true } } },
    orderBy: { puntaje: 'desc' },
    take: 20,
  })

  if (talleres.length === 0) {
    // ANTES: return silencioso
    // AHORA V3: registrar motivo de no-match
    await registrarMotivoNoMatch(pedido)
    return
  }

  // ... resto del flujo existente (notificaciones, email, WhatsApp) ...
}
```

### 3.3 — Funcion `registrarMotivoNoMatch`

```typescript
async function registrarMotivoNoMatch(pedido: Pedido) {
  // 3 queries paralelas simulando "que pasaria si relajaramos cada criterio"
  const [
    bronceQueMatchearian,   // BRONCE que matchearian si se relajara nivel
    sinCapacidadSuficiente, // PLATA/ORO pero con capacidad < pedido.cantidad
    totalPlataOro,          // total PLATA/ORO activos (para calcular exclusion por proceso)
  ] = await Promise.all([
    // Talleres BRONCE activos con capacidad suficiente
    prisma.taller.count({
      where: {
        nivel: 'BRONCE',
        capacidadMensual: { gte: pedido.cantidad },
        user: { active: true },
      },
    }),
    // Talleres PLATA/ORO activos pero capacidad insuficiente
    prisma.taller.count({
      where: {
        nivel: { in: ['PLATA', 'ORO'] },
        capacidadMensual: { lt: pedido.cantidad },
        user: { active: true },
      },
    }),
    // Total PLATA/ORO activos (para referencia)
    prisma.taller.count({
      where: {
        nivel: { in: ['PLATA', 'ORO'] },
        user: { active: true },
      },
    }),
  ])

  // Estimar exclusion por proceso (si el pedido tiene procesosRequeridos)
  let excluidosPorProceso = 0
  if (pedido.procesosRequeridos.length > 0) {
    // Talleres PLATA/ORO con capacidad pero sin los procesos requeridos
    // procesosRequeridos es String[] libre — match aproximado contra TallerProceso.proceso.nombre
    const talleresConCapacidad = await prisma.taller.findMany({
      where: {
        nivel: { in: ['PLATA', 'ORO'] },
        capacidadMensual: { gte: pedido.cantidad },
        user: { active: true },
      },
      select: {
        id: true,
        procesos: { select: { proceso: { select: { nombre: true } } } },
      },
    })

    excluidosPorProceso = talleresConCapacidad.filter(t => {
      const procesosDelTaller = t.procesos.map(p => p.proceso.nombre.toUpperCase())
      return !pedido.procesosRequeridos.every(pr =>
        procesosDelTaller.some(pt => pt.includes(pr.toUpperCase()))
      )
    }).length
  }

  // Determinar categoria dominante
  let motivoCategoria: MotivoCategoria = 'OTROS'
  if (bronceQueMatchearian > 0 && totalPlataOro === 0) {
    motivoCategoria = 'SIN_TALLERES_NIVEL'
  } else if (sinCapacidadSuficiente > totalPlataOro / 2) {
    motivoCategoria = 'SIN_TALLERES_CAPACIDAD'
  } else if (excluidosPorProceso > 0) {
    motivoCategoria = 'SIN_TALLERES_PROCESO'
  } else if (bronceQueMatchearian > 0) {
    motivoCategoria = 'SIN_TALLERES_NIVEL'
  }

  // Buscar talleres "cerca" — los que casi cumplen
  const talleresCerca = await buscarTalleresCerca(pedido)

  await prisma.motivoNoMatch.create({
    data: {
      pedidoId: pedido.id,
      motivoCategoria,
      detalle: {
        capacidadRequerida: pedido.cantidad,
        procesosRequeridos: pedido.procesosRequeridos,
        tipoPrenda: pedido.tipoPrenda,
        talleresExcluidos: {
          porNivel: bronceQueMatchearian,
          porCapacidad: sinCapacidadSuficiente,
          porProceso: excluidosPorProceso,
        },
        talleresCerca,
      },
    },
  })
}
```

### 3.4 — Funcion `buscarTalleresCerca`

La pieza mas importante para politica publica: identificar talleres que **estan a un paso** de poder cotizar.

```typescript
import { calcularProximoNivel } from '@/compartido/lib/nivel'

async function buscarTalleresCerca(pedido: Pedido) {
  // Talleres BRONCE que tendrian capacidad suficiente
  // (los excluidos solo por nivel, que es el caso mas accionable)
  const cercaPorNivel = await prisma.taller.findMany({
    where: {
      nivel: 'BRONCE',
      capacidadMensual: { gte: pedido.cantidad },
      user: { active: true },
    },
    select: { id: true, nombre: true },
    orderBy: { puntaje: 'desc' },
    take: 5,
  })

  // Para cada taller cerca, calcular que le falta exactamente
  // calcularProximoNivel() de D-02 (commit ae1b6c7) retorna ProximoNivelInfo
  // con: nivelProximo, puntosFaltantes, puntosActuales, puntosObjetivo, documentosFaltantes[]
  const talleresConDetalle = await Promise.all(
    cercaPorNivel.map(async (t) => {
      const info = await calcularProximoNivel(t.id)
      return {
        tallerId: t.id,
        nombre: t.nombre,
        faltaPara: info.nivelProximo ? 'subir_a_' + info.nivelProximo.toLowerCase() : 'ya_en_maximo',
        detalle: `${info.puntosFaltantes} puntos faltantes${info.documentosFaltantes.length > 0 ? `, ${info.documentosFaltantes.length} doc(s) pendientes` : ''}`,
        puntosFaltantes: info.puntosFaltantes,
      }
    })
  )

  return talleresConDetalle
}
```

> **Performance:** `calcularProximoNivel()` hace 2-3 queries con cache de 5 min (D-02 seccion 8.1). Para 5 talleres con cache caliente son ~5 queries totales (1 por taller, reglas y tipos cacheados). Aceptable.

> **Nota sobre procesos:** `buscarTalleresCerca` no filtra por `procesosRequeridos` del pedido porque la relacion es `String[]` libre vs `TallerProceso` (FK). Hacer match fuzzy string-a-string seria impreciso. El match por nivel + capacidad es suficiente para V3. Para V4, normalizar `procesosRequeridos` como FK a `ProcesoProductivo` permitiria matching exacto.

---

## 4. Dashboard `/estado/demanda-insatisfecha`

### 4.1 — Vista principal

```
+------------------------------------------------------------------+
| Demanda insatisfecha (ultimos 30 dias)                            |
|                                                                    |
| 47 pedidos publicados sin cotizaciones                             |
| 12.400 unidades de produccion potencial                            |
| 12 marcas afectadas                                                |
|                                                                    |
| +-------------------------------------------------------------+  |
| | Motivos principales                                           |  |
| |                                                                |  |
| | Sin talleres del nivel requerido    ======== 42% (20)        |  |
| | Sin capacidad suficiente            ===== 27% (13)            |  |
| | Proceso no disponible               ==== 21% (10)             |  |
| | Otros                               == 10% (4)                |  |
| +-------------------------------------------------------------+  |
|                                                                    |
| Demanda con presupuesto declarado: $2.4M                           |
| (sobre 31 de 47 pedidos que declararon presupuesto)                |
|                                                                    |
| +-------------------------------------------------------------+  |
| | Oportunidades de intervencion                                  |  |
| |                                                                |  |
| | - 8 talleres estan a menos de 20 puntos de PLATA              |  |
| |   Liberaria capacidad para ~4.200 unidades                    |  |
| |   [Ver talleres]                                              |  |
| |                                                                |  |
| | - 3 pedidos de "Estampado digital" sin oferta formal          |  |
| |   -> considerar capacitacion                                  |  |
| |   [Ver detalles]                                              |  |
| +-------------------------------------------------------------+  |
|                                                                    |
+------------------------------------------------------------------+
```

### 4.2 — Vista detallada por categoria

Click en "Sin talleres del nivel requerido" lleva a:

```
+------------------------------------------------------------------+
| Pedidos sin matchear por NIVEL insuficiente (20)                  |
|                                                                    |
| ID pedido   Tipo prenda      Cantidad   Marca       Talleres cerca|
| ----------------------------------------------------------------  |
| OM-2026-042 500 remeras       500       DulceModa   3 talleres    |
| OM-2026-038 2000 jeans         2000      TextilCo   2 talleres    |
| ... (mas filas)                                                   |
|                                                                    |
| [Exportar CSV]                                                     |
+------------------------------------------------------------------+
```

> **Campos disponibles en el Pedido** para las columnas: `omId`, `tipoPrenda` (String), `cantidad` (Int), `descripcion` (String?), `procesosRequeridos` (String[]), `estado` (enum), `fechaObjetivo` (DateTime?), `marca.nombre` (via relacion). La columna "Nivel req." se omite porque el nivel esta hardcodeado en el matching (PLATA/ORO), no es configurable por pedido.

### 4.3 — Vista por taller "cerca de matchear"

Lista de talleres con contexto de que les falta y cuantas oportunidades habrian capturado:

```
+------------------------------------------------------------------+
| Talleres cerca de poder matchear (8)                              |
|                                                                    |
| Taller          Nivel actual   Falta para    Pedidos que matchearia|
| ----------------------------------------------------------------  |
| Taller Fenix    BRONCE         15 pts PLATA  4                    |
| La Aguja        BRONCE         2 docs        3                    |
| Cosido y Listo  BRONCE         8 pts PLATA   2                    |
| ... (mas filas)                                                   |
|                                                                    |
| [Ver todos] [Exportar CSV]                                        |
+------------------------------------------------------------------+
```

---

## 5. Logica de oportunidades de intervencion

### 5.1 — Reglas heuristicas

> **Calibradas para piloto de 25 talleres y ~20 pedidos/mes.** Los thresholds se revisan cuando el volumen crece.

| Patron | Threshold | Recomendacion |
|--------|-----------|---------------|
| Pedidos del mismo proceso sin matchear en 30d | >=3 | Sugerir capacitacion en ese proceso |
| Talleres a <20 pts de PLATA con pedidos compatibles esperando | >=5 | Sugerir acelerar formalizacion del segmento |
| Demanda de capacidad alta sin talleres del tamano | >=2000 piezas con <3 talleres | Sugerir apoyar crecimiento de talleres medianos |

> **Regla geografica omitida:** requiere agregar campo `provincia` o `ubicacion` al modelo Pedido. Registrar en V3_BACKLOG como mejora futura: "Agregar campo geografico a Pedido para habilitar analisis territorial de demanda insatisfecha".

### 5.2 — Calculo de "demanda potencial"

> **Decision V3:** la metrica principal es **unidades de produccion**, no pesos. El campo `presupuesto` (Float?) es opcional y muchos pedidos no lo tienen. Fabricar numeros monetarios con datos parciales es engañoso para un dashboard de politica publica.

```typescript
async function calcularStatsAgregadas(desde: Date, hasta: Date) {
  const motivos = await prisma.motivoNoMatch.findMany({
    where: {
      createdAt: { gte: desde, lte: hasta },
      resueltoEn: null,  // solo no resueltos
      pedido: { estado: { not: 'CANCELADO' } },
    },
    include: {
      pedido: {
        select: {
          id: true,
          cantidad: true,
          presupuesto: true,
          marcaId: true,
        },
      },
    },
  })

  const pedidoIds = new Set(motivos.map(m => m.pedidoId))
  const marcaIds = new Set(motivos.map(m => m.pedido.marcaId))

  // Metrica principal: unidades
  const unidadesTotales = motivos.reduce((sum, m) => sum + m.pedido.cantidad, 0)

  // Metrica secundaria: pesos (solo pedidos con presupuesto declarado)
  const conPresupuesto = motivos.filter(m => m.pedido.presupuesto != null)
  const demandaPesos = conPresupuesto.reduce((sum, m) => sum + (m.pedido.presupuesto ?? 0), 0)

  // Breakdown por categoria
  const breakdown: Record<string, number> = {}
  for (const m of motivos) {
    breakdown[m.motivoCategoria] = (breakdown[m.motivoCategoria] ?? 0) + 1
  }

  return {
    pedidosTotales: pedidoIds.size,
    unidadesTotales,
    marcasAfectadas: marcaIds.size,
    demandaPesos,
    pedidosConPresupuesto: conPresupuesto.length,
    motivosBreakdown: breakdown,
  }
}
```

Para las recomendaciones, el impacto se expresa en unidades:

```typescript
// "Acelerar formalizacion liberaria capacidad para ~4.200 unidades"
const impactoUnidades = motivosPorNivel.reduce((sum, m) => sum + m.pedido.cantidad, 0)
```

---

## 6. Casos borde

- **Pedido se publica y al dia siguiente un taller hace match** — el `MotivoNoMatch` queda registrado. Cuando el match ocurre tarde, setear `resueltoEn` y el pedido sale de "demanda insatisfecha" activa. Para V3, el campo `resueltoEn` se setea manualmente o al primer match via `notificarTalleresCompatibles` en un re-run.

- **Marca cancela el pedido** — el motivo queda registrado pero se filtra del dashboard activo (`pedido.estado != 'CANCELADO'`).

- **Pedidos con criterios muy laxos** — un pedido sin procesosRequeridos y con cantidad baja deberia matchear casi cualquier taller PLATA/ORO. Si no matchea, es porque no hay talleres PLATA/ORO activos. La categoria seria `SIN_TALLERES_NIVEL` (todos son BRONCE).

- **Performance del calculo** — `registrarMotivoNoMatch` hace 3 queries paralelas + 1 query de procesos + lookup de talleres cerca (~5 queries). Estimado <500ms. Solo se ejecuta cuando un pedido NO matchea, no en cada matching.

- **Datos sensibles en el dashboard** — el ESTADO ve nombres de marcas y talleres. Es informacion ya visible para ESTADO en otros lugares, no se agrega exposicion nueva.

- **Talleres que no quieren ser visibles para ESTADO** — no aplica. Todos los talleres en la plataforma son visibles para ESTADO por diseno (es la autoridad regulatoria).

- **procesosRequeridos como String[] libre** — el match es aproximado (string.includes). Un taller con proceso "Confeccion" puede no matchear un pedido que pide "Confeccion deportiva" porque el matching es por inclusion de string, no igualdad exacta. Aceptable para V3. Para V4, normalizar procesosRequeridos como FK a ProcesoProductivo.

---

## 7. Endpoints

> **Formato de errores:** Todos los endpoints de esta sección usan `apiHandler` de Q-03. Los errores de auth, validación y 500 se manejan con los helpers estándar (`errorForbidden`, `errorResponse`, `errorInternal`).

### 7.1 — `GET /api/estado/demanda-insatisfecha`

Retorna las stats agregadas para el dashboard.

**Query params:**
- `desde`: fecha (default ultimos 30 dias)
- `hasta`: fecha (default hoy)
- `motivoCategoria`: filtro opcional

**Response:**
```typescript
{
  pedidosTotales: number,
  unidadesTotales: number,              // suma de cantidad de pedidos afectados
  marcasAfectadas: number,
  demandaPesos: number,                 // suma de presupuesto (solo pedidos que lo declararon)
  pedidosConPresupuesto: number,        // cuantos pedidos tenian presupuesto
  motivosBreakdown: {
    SIN_TALLERES_NIVEL: number,
    SIN_TALLERES_CAPACIDAD: number,
    SIN_TALLERES_PROCESO: number,
    OTROS: number,
  },
  recomendaciones: Array<{
    tipo: 'formalizacion' | 'capacitacion' | 'crecimiento',
    titulo: string,
    descripcion: string,
    impactoUnidades: number,            // unidades de produccion potencial
    accionUrl: string,
  }>,
}
```

### 7.2 — `GET /api/estado/demanda-insatisfecha/detalle`

Retorna los pedidos individuales con detalle.

**Query params:**
- `motivoCategoria`: requerido
- `desde`, `hasta`: opcionales

**Response:** array de pedidos con sus motivos asociados, incluyendo `omId`, `tipoPrenda`, `cantidad`, `marca.nombre`, `talleresCerca`.

### 7.3 — `GET /api/estado/demanda-insatisfecha/exportar`

Retorna CSV con todos los datos del rango pedido. Aplica rate limit (5 exportaciones/hora) de S-02.

Headers CSV: `omId, tipoPrenda, cantidad, presupuesto, marca, motivoCategoria, talleresCerca, fecha`

---

## 8. Casos borde de privacidad y framing

### 8.1 — Tono institucional

El dashboard NO debe parecer una herramienta de "vigilancia de talleres" o "ranking de quien rinde mal". El framing debe ser **constructivo**:

- "Talleres cerca de poder matchear -> oportunidades de acompanamiento"
- NO: "Talleres que NO pudieron matchear -> talleres deficientes"

Los textos deben enfocarse en oportunidades de politica publica, no en senalar fallas individuales.

### 8.2 — Datos al taller

El taller individual **no ve** que hubo pedidos que no pudo matchear. Verlo podria generar frustracion improductiva. La info se queda en `/estado/`.

Lo que el taller SI ve es lo de F-01 (Tu proximo nivel) que le dice que pasos puede dar para mejorar — sin mencionar pedidos especificos.

---

## 9. Criterios de aceptacion

- [ ] Migracion con tabla `MotivoNoMatch` y enum `MotivoCategoria` (3 categorias + OTROS)
- [ ] Funcion `registrarMotivoNoMatch` integrada en `notificarTalleresCompatibles` (linea 106)
- [ ] Helper `buscarTalleresCerca` retorna talleres BRONCE a un paso de matchear
- [ ] `buscarTalleresCerca` usa `calcularProximoNivel()` de D-02 para detalle
- [ ] Dashboard `/estado/demanda-insatisfecha` con vista principal
- [ ] 3 vistas detalladas (una por categoria: nivel, capacidad, proceso)
- [ ] Vista de "talleres cerca" con detalle de que les falta
- [ ] Recomendaciones automaticas segun reglas heuristicas (thresholds para 25 talleres)
- [ ] Metrica principal: unidades de produccion, no pesos
- [ ] Metrica secundaria: demanda en pesos (solo pedidos con presupuesto declarado, con aclaracion)
- [ ] Export a CSV con rate limit
- [ ] Filtros por fecha y motivo
- [ ] Item nuevo en sidebar ESTADO: "Demanda insatisfecha"
- [ ] Build sin errores de TypeScript

---

## 10. Tests

| # | Que testear | Como | Verificador |
|---|-------------|------|-------------|
| 1 | Pedido sin matches genera MotivoNoMatch | Crear pedido imposible, verificar tabla | DEV |
| 2 | Pedido con matches no genera MotivoNoMatch | Crear pedido normal, verificar tabla vacia | DEV |
| 3 | Categoria dominante se calcula correctamente | Crear pedido con problema solo de nivel, verificar `SIN_TALLERES_NIVEL` | DEV |
| 4 | Talleres cerca aparecen en el detalle | Verificar que talleres BRONCE a 1 paso aparecen | DEV |
| 5 | Dashboard muestra unidades (no pesos) como metrica principal | Cargar dashboard, verificar | QA |
| 6 | Recomendaciones aparecen cuando hay patrones | Crear 3 pedidos del mismo proceso, ver recomendacion | QA |
| 7 | Export CSV funciona | Click en exportar, abrir archivo | QA |
| 8 | Filtros funcionan | Aplicar filtros, verificar resultados | QA |
| 9 | Performance del registro <500ms | Medir en logs de Vercel | DEV |
| 10 | Pedido cancelado no aparece en demanda activa | Cancelar pedido, verificar dashboard | DEV |

---

## 11. Validacion de dominio (perfiles interdisciplinarios)

**Politologo:**
- La presentacion de "demanda insatisfecha" como dato accionable es la correcta para una politica publica textil?
- Hay riesgo de que ESTADO use estos datos para presionar a talleres individuales?

**Economista:**
- El calculo de unidades de produccion potencial es una metrica util para medir demanda?
- El dato de presupuesto (parcial) es suficiente para informes, o genera mas confusion que valor?

**Sociologo:**
- Los talleres "cerca de matchear" deben ser contactados proactivamente o esperar a que ellos se acerquen?
- Hay riesgo de que esta visibilidad genere stress sobre talleres que ya estan sobrecargados?

**Contador:**
- Los datos exportados sirven para reportes formales que el ESTADO presentaria a OIT?
- La metrica de unidades es suficiente o OIT necesita valoracion monetaria?

---

## 12. Limitaciones del matching actual

Este spec depende del sistema de matching de `notificarTalleresCompatibles()` que tiene limitaciones importantes:

1. **Nivel hardcodeado:** el matching filtra `nivel: { in: ['PLATA', 'ORO'] }` sin leerlo del pedido. No hay campo `nivelMinimoRequerido` en el modelo `Pedido`. Todos los pedidos excluyen a BRONCE automaticamente — no se puede publicar un pedido "abierto a todos los niveles".

2. **Sin componente geografico:** el modelo `Pedido` no tiene campo de provincia o ubicacion. No se puede analizar demanda territorial ("pedidos en Mendoza sin talleres locales"). Para V4: agregar campo y reintroducir `SIN_TALLERES_UBICACION`.

3. **Procesos como strings libres:** `Pedido.procesosRequeridos` es `String[]` con texto libre, no FK a `ProcesoProductivo`. El matching actual ignora este campo completamente. El analisis de demanda por proceso usa match aproximado por string que puede ser impreciso. Para V4: normalizar como FK.

4. **Sin filtro por proceso en matching:** aunque el taller tiene relacion `TallerProceso` y el pedido tiene `procesosRequeridos`, el matching no cruza estos datos. Un taller de "Corte" recibe notificacion de un pedido que pide "Estampado digital". Esto infla los matches y reduce la precision del analisis de demanda.

Estas limitaciones afectan la precision del analisis de demanda insatisfecha. El dashboard de V3 trabaja con los datos disponibles y da resultados utiles pero aproximados. V4 puede mejorar el modelo de matching para que esta feature sea mas rica y precisa.

---

## 13. Referencias

- V3_BACKLOG -> F-05
- V2 issues #63-71 — donde se identifico el problema de matching silencioso
- D-01 — define el rol ESTADO que accede a este dashboard
- D-02 — define `calcularProximoNivel()` (commit ae1b6c7) que se usa para identificar talleres cerca
- `notificarTalleresCompatibles()` en `src/compartido/lib/notificaciones.ts:81-131`
