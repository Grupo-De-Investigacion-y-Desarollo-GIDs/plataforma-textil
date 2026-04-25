# Spec: Reporte de campo del piloto

- **Versión:** V3
- **Origen:** V3_BACKLOG T-02
- **Asignado a:** Gerardo
- **Prioridad:** Media-alta — sin esto no hay forma estructurada de capturar el aprendizaje del piloto

---

## ANTES DE ARRANCAR

- [ ] V3_BACKLOG T-03/T-05 mergeado (protocolos de onboarding — el reporte de campo se complementa)
- [ ] V3_BACKLOG F-04 mergeado (exportes Estado — el reporte usa `generarXlsx` y `HojaExportable` creados por F-04)
- [ ] V3_BACKLOG F-05 mergeado (demanda insatisfecha — input de hoja específica del reporte mensual)

---

## 1. Contexto

El piloto OIT no es solo "que la plataforma funcione". Es **un experimento de política pública** del que se debe extraer aprendizaje aplicable a otros sectores y a futuras iteraciones.

Sin un mecanismo formal de reporte, los aprendizajes se pierden:
- ¿Qué resistencias culturales hubo en los talleres?
- ¿Qué expectativas tenían las marcas vs lo que pasó?
- ¿Qué pasos del onboarding fueron los más difíciles?
- ¿Qué pidió el ESTADO que la plataforma no podía dar?
- ¿Cuántos talleres quedaron afuera y por qué?

Estos datos cualitativos no aparecen en logs ni en exportes — requieren observación, entrevistas y registro consciente.

**Para V3:** una herramienta que estructure ese registro y permita generar reportes formales para OIT al final del piloto.

---

## 2. Qué construir

1. **Tabla nueva `ObservacionCampo`** — registra observaciones cualitativas atadas a usuarios o eventos
2. **UI `/admin/observaciones`** — para que el equipo (Gerardo, OIT, ESTADO) registre y consulte
3. **Tipos de observación estructurados** — para análisis posterior
4. **Plantilla de reporte mensual** — Excel pre-formateado con todos los datos
5. **Plantilla de reporte final del piloto** — más completo, para presentar a OIT
6. **Sistema de tags** — para categorizar observaciones (cultural, técnico, fiscal, etc.)

---

## 3. Modelo de datos

```prisma
model ObservacionCampo {
  id          String   @id @default(cuid())

  // Quién la registró (opcional — si se elimina el autor, la observación se preserva sin atribución)
  autorId     String?
  autor       User?    @relation(name: "ObservacionAutor", fields: [autorId], references: [id], onDelete: SetNull)

  // Sobre quién (opcional — si se elimina el user observado, la observación persiste)
  userId      String?
  user        User?    @relation(name: "ObservacionUser", fields: [userId], references: [id], onDelete: SetNull)

  // Contenido
  tipo        TipoObservacion
  tags        String[] // tags libres: ['cultural', 'fiscal', 'tecnico', 'positivo', 'negativo']
  titulo      String
  contenido   String   @db.Text

  // Contexto
  fechaEvento DateTime           // cuando ocurrió lo observado (no cuando se registró)
  ubicacion   String?            // donde ocurrió (provincia, taller físico, etc.)
  fuente      FuenteObservacion  @default(VISITA)
  // VISITA: visita presencial al taller
  // LLAMADA: conversación telefónica
  // WHATSAPP: chat por WhatsApp
  // PLATAFORMA: comportamiento observado en la plataforma
  // ENTREVISTA: entrevista estructurada
  // OTROS

  // Análisis
  sentimiento Sentimiento? // POSITIVO | NEUTRAL | NEGATIVO
  importancia Int @default(3) // 1-5

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
  @@index([tipo])
  @@index([fechaEvento])
  @@map("observaciones_campo")
}

enum TipoObservacion {
  RESISTENCIA          // resistencia cultural o conceptual
  EXPECTATIVA          // expectativa que NO se cumplió o se superó
  DIFICULTAD_TECNICA   // problema técnico (UI confusa, bug, etc)
  DIFICULTAD_PROCESO   // problema de proceso (no entendió cómo cotizar)
  OPORTUNIDAD          // oportunidad detectada (feature, capacitación, etc)
  EXITO                // algo que funcionó bien
  CONTEXTO_TALLER      // info sobre la realidad del taller
  CONTEXTO_MARCA       // info sobre la realidad de la marca
  POLITICA_PUBLICA     // observación con implicancias para OIT
}

enum FuenteObservacion {
  VISITA
  LLAMADA
  WHATSAPP
  PLATAFORMA
  ENTREVISTA
  OTROS
}

enum Sentimiento {
  POSITIVO
  NEUTRAL
  NEGATIVO
}
```

**Patrón de relaciones duales a User:** Cuando hay dos relaciones al mismo modelo, AMBAS necesitan `@relation(name: ...)`. Precedente en el codebase: Notificacion usa `@relation("NotificacionDestinatario")` y `@relation("NotificacionCreador")`.

**`onDelete: SetNull` en ambas relaciones:** Las observaciones son evidencia institucional para OIT. Perder observaciones porque un user se da de baja sería contraproducente. Si se elimina el autor, la observación se preserva sin atribución. Si se elimina el user observado, la observación persiste con `userId: null`. Precedente: `Notificacion.creadaPor` usa `onDelete: SetNull`.

**IMPORTANTE — agregar al modelo User:**

```prisma
model User {
  // ... campos existentes ...
  observacionesCreadas    ObservacionCampo[] @relation("ObservacionAutor")
  observacionesRecibidas  ObservacionCampo[] @relation("ObservacionUser")
}
```

Sin estos dos arrays, Prisma rechaza la migración por ambigüedad.

---

## 4. UI `/admin/observaciones`

### 4.1 — Vista de lista

Ruta: `src/app/(admin)/admin/observaciones/page.tsx`

```
┌──────────────────────────────────────────────────────────────────────┐
│ Observaciones de campo                                                 │
│                                                                        │
│ [+ Nueva observación]                                                  │
│                                                                        │
│ Filtros:                                                               │
│ Tipo: [Todos ▼]  Fuente: [Todas ▼]  Tags: [todos]                     │
│ Período: [Últimos 30 días ▼]  Sentimiento: [Todos ▼]                  │
│                                                                        │
│ ┌──────────────────────────────────────────────────────────────┐     │
│ │ 🔴 RESISTENCIA · Visita · Negativo · ⭐⭐⭐⭐                  │     │
│ │ Roberto (La Aguja) no quería poner CUIT en plataforma         │     │
│ │ "Pensaba que era para denunciar evasión"                       │     │
│ │ Anabelen Torres · Hace 2 días · #cultural #fiscal              │     │
│ └──────────────────────────────────────────────────────────────┘     │
│                                                                        │
│ ┌──────────────────────────────────────────────────────────────┐     │
│ │ 🟢 EXITO · Llamada · Positivo · ⭐⭐⭐                          │     │
│ │ DulceModa cerró 2 pedidos en 1 semana                          │     │
│ │ Ya está usando la plataforma para todos sus pedidos            │     │
│ │ Lucía Fernández · Hace 4 días · #marca #engagement             │     │
│ └──────────────────────────────────────────────────────────────┘     │
│                                                                        │
│ [Ver más] [Exportar a Excel]                                          │
└──────────────────────────────────────────────────────────────────────┘
```

El botón **"+ Nueva observación"** linkea a `/admin/observaciones/nueva`.

### 4.2 — Editor de observación (página dedicada)

**NO usar Modal.** El Modal existente tiene sizes sm/md/lg pero sin `max-height` ni `overflow-y-auto` — formularios largos se desbordan. El editor de observación tiene ~10 campos incluyendo textarea, search dropdown, radio buttons, tag input, date picker y number selector — excede la capacidad del Modal.

**Patrón del codebase:** Formularios con 8+ campos usan páginas dedicadas (`/admin/colecciones/nueva`, `/marca/pedidos/nuevo`).

**Rutas:**
- Crear: `src/app/(admin)/admin/observaciones/nueva/page.tsx`
- Editar: `src/app/(admin)/admin/observaciones/[id]/editar/page.tsx`

**Layout del formulario:**

```
┌──────────────────────────────────────────────────────────────────────┐
│ ← Volver a observaciones                                              │
│                                                                        │
│ Nueva observación                                                      │
│                                                                        │
│ Sobre quién: [Buscar usuario... ▼]  (opcional)                         │
│                                                                        │
│ Tipo: [RESISTENCIA ▼]                                                  │
│ Fuente: [VISITA ▼]                                                     │
│ Sentimiento: [○ Positivo  ● Neutral  ○ Negativo]                       │
│ Importancia: [⭐⭐⭐ ▼] (1-5)                                          │
│                                                                        │
│ Título: ___________________________________________                    │
│                                                                        │
│ Contenido:                                                             │
│ ┌──────────────────────────────────────────────────────────────┐     │
│ │ Describí lo observado con detalle. Incluí citas literales si   │     │
│ │ es relevante. Pensá en alguien leyendo esto en 3 meses.        │     │
│ │                                                                 │     │
│ │ ...                                                             │     │
│ └──────────────────────────────────────────────────────────────┘     │
│                                                                        │
│ Tags (separados por coma):                                             │
│ ___________________________________________                            │
│ Sugerencias: cultural, fiscal, tecnico, positivo, negativo, urgente    │
│                                                                        │
│ Fecha del evento: [hoy ▼]                                              │
│ Ubicación (opcional): ____________________                             │
│                                                                        │
│ [Cancelar]  [Guardar]                                                  │
└──────────────────────────────────────────────────────────────────────┘
```

### 4.3 — Auth y permisos

- Crear observación: ADMIN, ESTADO
- Ver listado: ADMIN, ESTADO
- Ver observación individual: ADMIN, ESTADO (incluso si es sobre otro user)
- Editar/eliminar: solo el autor o ADMIN
- Los usuarios observados NO ven las observaciones sobre ellos (es feedback interno)

---

## 5. Reportes

### 5.1 — Reporte mensual

Auto-generado el día 1 de cada mes. Excel multi-hoja:

| Hoja | Contenido | Fuente de datos |
|------|-----------|-----------------|
| Portada | Mes, totales, contexto | Calculada |
| Métricas plataforma | Stats numéricas | F-04 (exportes) |
| Etapas de onboarding | Funnel del piloto | T-03 (calcularEtapa) |
| Demanda insatisfecha | Pedidos sin matchear | F-05 (demanda insatisfecha) |
| **Observaciones del mes** | Listado completo de ObservacionCampo del mes | Este spec |
| Resumen ejecutivo | Top 5 observaciones positivas, top 5 problemas, oportunidades | Este spec |

Endpoint: `GET /api/admin/reporte-mensual?mes=2026-05`

### 5.2 — Reporte final del piloto

Para presentar a OIT al final del piloto. Más completo que el mensual:

| Hoja | Contenido | Fuente de datos |
|------|-----------|-----------------|
| Portada | Período del piloto, equipo, alcance | Calculada |
| Resumen ejecutivo | 1 página con hallazgos principales | Calculada |
| Talleres | Stats completos + observaciones por taller | F-04 + este spec |
| Marcas | Idem | F-04 + este spec |
| Métricas finales | Funnel completo, conversión, volumen | T-03 + F-04 |
| Demanda insatisfecha | Análisis completo | F-05 |
| **Aprendizajes cualitativos** | Todas las observaciones agrupadas por TipoObservacion | Este spec |
| **Recomendaciones** | Generadas semi-automáticamente desde observaciones POLITICA_PUBLICA | Este spec |
| Anexo: datos crudos | Talleres, marcas, pedidos, validaciones del período | F-04 |

Endpoint: `GET /api/admin/reporte-piloto?desde=...&hasta=...`

### 5.3 — Cómo se generan

**Dependencia crítica:** `generarXlsx`, `HojaExportable` y la dependencia `exceljs` **NO existen hoy en el código**. Son creaciones de F-04 (`v3-exportes-estado.md`). Hoy solo existe un endpoint CSV básico en `/api/exportar/route.ts`. Sin F-04 mergeado primero, no hay infraestructura de Excel multi-hoja disponible.

Reutilizan el helper `generarXlsx` de F-04. Cada reporte arma sus hojas y delega la generación:

```typescript
// src/app/api/admin/reporte-piloto/route.ts
import { generarXlsx, HojaExportable } from '@/compartido/lib/exportes'  // creado por F-04
import { obtenerStats, obtenerObservaciones } from './data'

export async function GET(req: NextRequest) {
  // Auth: solo ADMIN o ESTADO
  // Filtros: desde, hasta

  const hojas: HojaExportable[] = [
    armarHojaPortada(metadata),
    armarHojaResumenEjecutivo(stats, observaciones),
    armarHojaTalleres(talleres, observacionesPorUsuario),
    // ... etc
    armarHojaAprendizajesCualitativos(observaciones),
  ]

  const buffer = await generarXlsx(hojas, { titulo: 'Reporte Final Piloto', subtitulo: '...' })

  return new NextResponse(buffer, { /* headers xlsx */ })
}
```

### 5.4 — Generación de "aprendizajes cualitativos"

Esta es la parte más rica del reporte. Las observaciones se agrupan por tipo y se sintetizan:

```typescript
function armarHojaAprendizajesCualitativos(observaciones: ObservacionCampo[]) {
  // Agrupar por tipo
  const porTipo = groupBy(observaciones, 'tipo')

  // Para cada tipo, listar las top 10 observaciones por importancia
  const filas = []

  for (const [tipo, obs] of Object.entries(porTipo)) {
    const top = obs.sort((a, b) => b.importancia - a.importancia).slice(0, 10)
    filas.push([tipo, '', ''])  // header
    for (const o of top) {
      filas.push([
        o.fechaEvento.toLocaleDateString(),
        o.titulo,
        o.contenido.slice(0, 500) + (o.contenido.length > 500 ? '...' : ''),
      ])
    }
  }

  return {
    nombre: 'Aprendizajes',
    headers: ['Fecha', 'Título', 'Contenido'],
    filas,
  }
}
```

---

## 6. Tags y categorización

### 6.1 — Tags como `String[]` en PostgreSQL

El schema ya usa `String[]` en 7 campos existentes (`Taller.portfolioFotos`, `Taller.areas`, `Pedido.imagenes`, `Pedido.procesosRequeridos`, etc.). PostgreSQL mapea `String[]` a `text[]` nativamente — funciona sin problemas en Supabase.

### 6.2 — Tags sugeridos por defecto

El editor sugiere estos tags pre-cargados (auto-completar):

- **cultural**: aspectos culturales/idiosincráticos
- **fiscal**: relacionado con monotributo, IVA, ARCA
- **tecnico**: bug, UI confusa, lentitud
- **proceso**: no entendió un paso del flujo
- **positivo**: feedback bueno
- **negativo**: feedback malo
- **urgente**: requiere acción inmediata
- **politica-publica**: implicancia para OIT/Estado
- **engagement**: relacionado con uso/abandono
- **capacitacion**: sobre necesidad de capacitar
- **comercial**: relacionado con cierre de pedidos

### 6.3 — Tags libres

El admin puede agregar tags nuevos. Para V3 sin moderación — los tags se crean al usarlos.

### 6.4 — Búsqueda por tag

```
GET /api/admin/observaciones?tags=cultural,fiscal
```

Devuelve observaciones que tengan **al menos uno** de los tags pedidos. Operador Prisma:

```typescript
where: {
  tags: { hasSome: ['cultural', 'fiscal'] }
}
```

> **Nota:** Este es un patrón nuevo en el codebase. Los 7 campos `String[]` existentes no se filtran por arrays todavía — todos se usan solo para lectura/escritura. `hasSome` es el primer uso de operadores de filtrado sobre arrays nativos de PostgreSQL.

---

## 7. Casos borde

- **Observación sin usuario asociado** — válido. Una observación general (ej: "El sector textil de Salta tiene mucha informalidad") no necesita un user específico. `userId` es opcional.

- **Observación sobre user que se da de baja** — la observación queda con `userId: null` gracias a `onDelete: SetNull`. La observación persiste como evidencia institucional para OIT.

- **Autor que se da de baja** — la observación queda con `autorId: null` gracias a `onDelete: SetNull`. Se muestra como "Autor desconocido" en la UI. Las observaciones son evidencia institucional — no se eliminan por movimientos de personal.

- **Observaciones contradictorias** — dos personas pueden registrar observaciones distintas sobre el mismo taller. Es OK — la realidad es subjetiva y queremos múltiples puntos de vista.

- **Observación con info muy sensible** — alguien podría escribir info que no debería estar en DB (datos personales, denuncias, etc.). Mitigación: documentar en un disclaimer del editor: "Esta info se usa para el reporte a OIT. No incluyas datos sensibles que no quieras compartir."

- **Volumen alto de observaciones (1000+)** — para piloto es improbable (~50-100 esperadas). Si crece, paginar la vista de listado y los reportes.

- **Observaciones viejas en reportes nuevos** — los reportes filtran por fecha del evento (`fechaEvento`), no de creación. Una observación de hace 6 meses puede aparecer en un reporte si el evento fue reciente.

- **Sentimiento incorrecto** — el campo es subjetivo. No hay validación. Es OK — los reportes lo muestran como dato adicional, no determinan acciones automáticas.

- **Privacidad inter-equipo** — todas las observaciones son visibles para ADMIN y ESTADO. No hay observaciones "privadas" en V3. Si alguien quiere algo privado, lo guarda fuera.

---

## 8. Criterios de aceptación

- [ ] Modelo `ObservacionCampo` agregado a Prisma con enums y ambas relaciones named
- [ ] Modelo `User` con arrays `observacionesCreadas` y `observacionesRecibidas`
- [ ] Migración aplicada
- [ ] Endpoint `POST /api/admin/observaciones` para crear
- [ ] Endpoint `GET /api/admin/observaciones` para listar con filtros (incluyendo `hasSome` para tags)
- [ ] Endpoint `PATCH /api/admin/observaciones/[id]` para editar
- [ ] Endpoint `DELETE /api/admin/observaciones/[id]` para borrar
- [ ] Página `/admin/observaciones` con listado y filtros
- [ ] Página `/admin/observaciones/nueva` con formulario completo
- [ ] Página `/admin/observaciones/[id]/editar` para edición
- [ ] Auth: ADMIN/ESTADO crean/ven; solo autor o ADMIN edita/borra
- [ ] Endpoint `GET /api/admin/reporte-mensual` con Excel (requiere F-04)
- [ ] Endpoint `GET /api/admin/reporte-piloto` con Excel completo (requiere F-04 + F-05)
- [ ] Plantilla de reporte mensual auto-generable
- [ ] Plantilla de reporte final del piloto
- [ ] Tags sugeridos en autocomplete
- [ ] Filtros por tipo, fuente, tags (`hasSome`), período, sentimiento
- [ ] Build sin errores de TypeScript

---

## 9. Tests

| # | Qué testear | Cómo | Verificador |
|---|-------------|------|-------------|
| 1 | Crear observación desde página dedicada | Crear desde `/admin/observaciones/nueva`, verificar DB | QA |
| 2 | Filtros funcionan correctamente | Aplicar filtros, comparar resultados | QA |
| 3 | Filtro por tags con `hasSome` | Buscar `tags=cultural`, verificar que incluye observaciones con ese tag | DEV |
| 4 | Editar observación solo permite al autor o ADMIN | Login como otro ESTADO, intentar editar | DEV |
| 5 | Reporte mensual incluye observaciones del período | Crear obs, generar reporte, verificar | QA |
| 6 | Reporte final tiene todas las hojas | Generar, abrir Excel, verificar pestañas | QA |
| 7 | Observación sin userId se permite | Crear sin asociar usuario | DEV |
| 8 | Usuario observado NO ve la observación | Login como taller, verificar que no aparece | DEV |
| 9 | Importancia se ordena correctamente | Crear con varios valores, ordenar | DEV |
| 10 | Formulario valida campos requeridos | Submit vacío, ver errores | QA |
| 11 | Eliminar user observado no elimina la observación | Borrar user, verificar observación con userId: null | DEV |

---

## 10. Validación de dominio (perfiles interdisciplinarios)

**Politólogo:**
- ¿Los tipos de observación capturan las dimensiones relevantes para política pública?
- ¿La estructura del reporte final sirve para informes a organismos internacionales?
- ¿Falta algún tipo (ej: GENERO, INTERSECCIONALIDAD)?

**Economista:**
- ¿La capa cualitativa complementa correctamente las métricas cuantitativas?
- ¿Hay riesgo de sesgo del observador? ¿Cómo mitigarlo?

**Sociólogo:**
- ¿La capacidad de registrar contexto cultural es suficiente?
- ¿El sentimiento como categoría puede simplificar realidades complejas?
- ¿Las citas literales en el campo `contenido` permiten preservar la voz de los talleres?
- ¿Hay riesgo de extractivismo de conocimiento (apropiarse de saberes sin consentimiento)?

**Contador:** este spec no aplica al perfil contable.

---

## 11. Referencias

- V3_BACKLOG → T-02
- T-03/T-05 — protocolos de onboarding (los reportes capturan datos generados ahí)
- F-04 — `generarXlsx` y `HojaExportable` para reportes Excel multi-hoja
- F-05 — datos de demanda insatisfecha (input para reporte mensual)
