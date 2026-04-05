# Spec: Queries Dashboard Estado

- **Semana:** 2
- **Asignado a:** Gerardo
- **Dependencias:** Ninguna

---

## 1. Contexto

El dashboard del Estado actual tiene 9 counts basicos y 2 listas. Hay que completarlo con las 3 secciones definidas en la arquitectura: "Como esta el sector?", "Donde hay que actuar?" y "Que esta funcionando?". Ademas hay que agregar la accion `NIVEL_SUBIDO` al log de actividad, indices al schema para queries eficientes y corregir el guard del middleware para permitir ADMIN.

---

## 2. Que construir

- Queries completas para las 3 secciones del dashboard Estado
- Accion `NIVEL_SUBIDO` en logActividad cuando un taller cambia de nivel
- Indices en schema para las queries mas frecuentes
- Guard de rol ESTADO + ADMIN en middleware para `/estado/*`

---

## 3. Datos

### Migracion — agregar indices al schema

```prisma
model Validacion {
  @@index([estado])
  @@index([tallerId])
}

model Certificado {
  @@index([fecha])
}

model LogActividad {
  @@index([accion, timestamp])
  @@index([userId])
}

model Denuncia {
  @@index([estado])
}
```

Migracion: `npx prisma migrate dev --name agregar_indices_dashboard_estado`

---

## 4. Prescripciones tecnicas

### Archivo a modificar — `src/compartido/lib/nivel.ts`

#### Cambiar firma de `aplicarNivel`

Firma actual (linea 91):

```typescript
export async function aplicarNivel(tallerId: string): Promise<ResultadoNivel>
```

Firma nueva:

```typescript
export async function aplicarNivel(tallerId: string, userId?: string): Promise<ResultadoNivel>
```

#### Reescribir el cuerpo para leer nivel anterior y loguear si cambio

```typescript
import { logActividad } from './log'

export async function aplicarNivel(tallerId: string, userId?: string): Promise<ResultadoNivel> {
  // Leer nivel actual antes del calculo
  const tallerActual = await prisma.taller.findUnique({
    where: { id: tallerId },
    select: { nivel: true },
  })
  const nivelAnterior = tallerActual?.nivel ?? 'BRONCE'

  const resultado = await calcularNivel(tallerId)

  await prisma.taller.update({
    where: { id: tallerId },
    data: {
      nivel: resultado.nivel,
      puntaje: resultado.puntaje,
    },
  })

  // Loguear si el nivel cambio
  if (nivelAnterior !== resultado.nivel) {
    logActividad('NIVEL_SUBIDO', userId, {
      tallerId,
      nivelAnterior,
      nivelNuevo: resultado.nivel,
    })
  }

  return resultado
}
```

Nota: `logActividad` es fire-and-forget por diseno (no usa `await`, hace `.catch()` interno). En server actions que terminan rapido, el log puede perderse si el proceso se cierra antes de que la escritura se complete. Esto es comportamiento esperado — en el piloto con pocos usuarios no es un problema practico. Si se necesita garantia, se puede migrar a `await logActividad(...)` en el futuro.

#### Actualizar los 3 callsites

**`src/app/api/certificados/route.ts` — linea 61:**

```typescript
// Antes:
await aplicarNivel(cert.taller.id)

// Despues:
await aplicarNivel(cert.taller.id, session.user.id)
```

**`src/app/api/certificados/route.ts` — linea 98:**

```typescript
// Antes:
await aplicarNivel(body.tallerId)

// Despues:
await aplicarNivel(body.tallerId, session.user.id)
```

**`src/app/(admin)/admin/talleres/[id]/page.tsx` — lineas 68 y 91** (dentro de server actions que tienen `session` disponible):

```typescript
// Antes:
await aplicarNivel(id)

// Despues:
await aplicarNivel(id, session.user.id)
```

Verificar que `session.user.id` esta disponible en el scope de cada server action. En `talleres/[id]/page.tsx` las server actions ya llaman `auth()` al inicio — usar ese `session.user.id`.

### Archivo a modificar — `src/middleware.ts`

**Cambio explicito en lineas 81-85.** Reemplazar:

```typescript
// Antes:
if (pathname.startsWith('/estado')) {
  if (userRole !== 'ESTADO') {
    return NextResponse.redirect(new URL('/unauthorized', nextUrl))
  }
  return NextResponse.next()
}
```

Por:

```typescript
// Despues:
if (pathname.startsWith('/estado')) {
  if (userRole !== 'ESTADO' && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/unauthorized', nextUrl))
  }
  return NextResponse.next()
}
```

### Archivo a modificar — `src/app/(estado)/estado/page.tsx`

#### Queries

Reemplazar las queries actuales (lineas 15-51) por el conjunto completo:

```typescript
const hace30dias = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

const [
  // Seccion 1: Como esta el sector?
  totalTalleres,
  totalMarcas,
  bronce, plata, oro,
  progresoData,

  // Seccion 2: Donde hay que actuar?
  validacionesPendientes,
  denunciasSinResolver,
  talleresInactivos,

  // Seccion 3: Que esta funcionando?
  certificadosMes,
  totalCertificados,
  subieronNivelMes,
  cursosCompletados,
] = await prisma.$transaction([

  // Seccion 1
  prisma.taller.count(),
  prisma.marca.count(),
  prisma.taller.count({ where: { nivel: 'BRONCE' } }),
  prisma.taller.count({ where: { nivel: 'PLATA' } }),
  prisma.taller.count({ where: { nivel: 'ORO' } }),
  prisma.validacion.groupBy({
    by: ['estado'],
    _count: { estado: true },
  }),

  // Seccion 2
  prisma.validacion.count({ where: { estado: 'PENDIENTE' } }),
  prisma.denuncia.count({
    where: { estado: { in: ['RECIBIDA', 'EN_INVESTIGACION'] } },
  }),
  prisma.taller.count({
    where: {
      createdAt: { lt: hace30dias },
      user: {
        logs: { none: { timestamp: { gte: hace30dias } } },
      },
    },
  }),

  // Seccion 3
  prisma.certificado.count({
    where: { fecha: { gte: inicioMes }, revocado: false },
  }),
  prisma.certificado.count({ where: { revocado: false } }),
  prisma.logActividad.count({
    where: { accion: 'NIVEL_SUBIDO', timestamp: { gte: inicioMes } },
  }),
  prisma.progresoCapacitacion.count({
    where: { porcentajeCompletado: 100 },
  }),
])

// Calcular progreso promedio desde groupBy
const aprobadas = progresoData.find(d => d.estado === 'APROBADO')?._count.estado ?? 0
const totalValidaciones = progresoData.reduce((acc, d) => acc + d._count.estado, 0)
const progresoPromedio = totalValidaciones > 0
  ? Math.round((aprobadas / totalValidaciones) * 100)
  : 0
```

Nota sobre talleres inactivos: el filtro `createdAt: { lt: hace30dias }` excluye talleres registrados en los ultimos 30 dias que aun no tienen actividad. Sin este filtro, talleres recien creados por admin aparecerian como "inactivos" inmediatamente.

Mantener las queries de listas existentes (ultimasPendientes y logsNivel) despues del `$transaction`.

#### UI — organizar en 3 secciones

**Seccion 1 — "Como esta el sector?"**
- Stat cards: total talleres, total marcas, progreso promedio de formalizacion (%)
- Barra de distribucion Bronce/Plata/Oro con porcentajes (ya existe, mantener)

**Seccion 2 — "Donde hay que actuar?"**
- Card con numero de validaciones pendientes + link a `/admin/talleres` (existente, mantener)
- Card con denuncias sin resolver — solo mostrar el numero, sin link. Nota: el link a `/admin/denuncias` se implementa en spec semana3
- Card con talleres sin actividad en 30 dias — mostrar count con icono de alerta

**Seccion 3 — "Que esta funcionando?"**
- Certificados emitidos este mes vs total
- Talleres que subieron de nivel este mes
- Cursos completados total

Mantener la seccion de validaciones pendientes con lista detallada (ya existe) y la seccion de actividad reciente (ya existe).

---

## 5. Casos borde

- **Si no hay validaciones en la DB:** `progresoPromedio = 0` (division por cero protegida con ternario)
- **Si `NIVEL_SUBIDO` no tiene logs anteriores:** `subieronNivelMes = 0` — mostrar 0, no error
- **Usuario sin rol ESTADO ni ADMIN que intenta acceder a `/estado`:** redirect a `/unauthorized`
- **ADMIN puede acceder a `/estado`:** para monitoreo sin restriccion
- **Talleres creados hace menos de 30 dias:** no aparecen como inactivos aunque no tengan actividad
- **`logActividad` fire-and-forget en server actions:** el log de `NIVEL_SUBIDO` puede perderse si el proceso termina antes de que la escritura se complete. Esto es comportamiento esperado por diseno de `logActividad` (usa `.catch()` sin `await`). En el piloto no es un problema practico.

---

## 6. Criterio de aceptacion

- [ ] Migracion de indices corre sin errores
- [ ] `aplicarNivel` tiene firma `(tallerId: string, userId?: string)`
- [ ] Los 3 callsites pasan `session.user.id` como segundo argumento
- [ ] `NIVEL_SUBIDO` se loguea en `log_actividad` cuando un taller cambia de nivel
- [ ] Middleware permite ADMIN acceder a `/estado`
- [ ] Middleware bloquea TALLER y MARCA en `/estado`
- [ ] Dashboard Estado muestra las 3 secciones con datos reales
- [ ] Progreso promedio de formalizacion se calcula correctamente (0 si no hay validaciones)
- [ ] Talleres inactivos muestra count real, excluyendo talleres nuevos
- [ ] Denuncias sin resolver muestra count real, sin link
- [ ] Build pasa sin errores

---

## 7. Tests (verificacion manual)

1. Aprobar una validacion de un taller Bronce que tiene todas las validaciones de Plata → verificar que el nivel sube a Plata y que aparece `NIVEL_SUBIDO` en tabla `log_actividad` con `nivelAnterior: 'BRONCE'` y `nivelNuevo: 'PLATA'`
2. Entrar a `/estado` con usuario ESTADO → debe ver las 3 secciones con datos
3. Entrar a `/estado` con usuario ADMIN → debe poder acceder
4. Entrar a `/estado` con usuario TALLER → debe ver `/unauthorized`
5. Verificar en Supabase que los indices fueron creados (revisar tabla `pg_indexes` o usar `\di` en psql)
6. Crear un taller hoy y verificar que NO aparece como inactivo en el dashboard
7. Verificar que la card de denuncias muestra solo el numero sin link clickeable
