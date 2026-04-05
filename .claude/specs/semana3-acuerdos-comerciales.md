# Spec: Acuerdos comerciales — PDF de orden

- **Semana:** 3
- **Asignado a:** Gerardo
- **Dependencias:** semana3-pdf-qr-certificados mergeado (patrón @react-pdf/renderer ya establecido)

## ⚠️ ANTES DE ARRANCAR

- `semana3-pdf-qr-certificados` (Gerardo) — patrón de PDF con @react-pdf/renderer debe estar mergeado

## 1. Contexto

Cuando la marca acepta una cotización, se crea una OrdenManufactura con los términos acordados. El acuerdo para el piloto es un PDF descargable de esa orden — sin hitos de pago ni EscrowHito. El pago ocurre por fuera de la plataforma. El PDF sirve como evidencia del acuerdo para ambas partes y para el Estado.

## 2. Qué construir

- Componente PDF de la orden de manufactura
- API `GET /api/ordenes/[id]/pdf` — genera y retorna el PDF
- Botón "Descargar acuerdo" en `/taller/pedidos/[id]` y en `/marca/pedidos/[id]`

## 3. Datos

- OrdenManufactura tiene: `moId`, `proceso`, `precio`, `plazoDias`, `estado`, `createdAt`
- Relaciones: pedido (`omId`, `tipoPrenda`, `cantidad`) + marca (`nombre`) + taller (`nombre`, `cuit`, `nivel`)
- No hay cambios de schema

## 4. Prescripciones técnicas

### Archivo nuevo — `src/compartido/componentes/pdf/orden-pdf.tsx`

```tsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', backgroundColor: '#ffffff' },
  header: { backgroundColor: '#1e3a5f', padding: 20, marginBottom: 24 },
  headerText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  subheader: { color: '#93c5fd', fontSize: 10, textAlign: 'center', marginTop: 4 },
  moId: { color: '#fbbf24', fontSize: 12, textAlign: 'center', marginTop: 8 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', color: '#1e3a5f', marginBottom: 8, borderBottom: '1px solid #e5e7eb', paddingBottom: 4 },
  row: { flexDirection: 'row', marginBottom: 4 },
  label: { fontSize: 10, color: '#6b7280', width: 140 },
  value: { fontSize: 10, color: '#111827', flex: 1 },
  footer: { marginTop: 24, borderTop: '1px solid #e5e7eb', paddingTop: 12 },
  footerText: { fontSize: 9, color: '#9ca3af', textAlign: 'center' },
  aviso: { fontSize: 9, color: '#6b7280', textAlign: 'center', marginTop: 8, fontStyle: 'italic' },
})

interface OrdenPDFProps {
  moId: string
  nombreTaller: string
  cuitTaller: string
  nivelTaller: string
  nombreMarca: string
  tipoPrenda: string
  cantidad: number
  proceso: string
  precio: number
  plazoDias: number | null
  fechaAcuerdo: Date
}

export function OrdenPDF({ moId, nombreTaller, cuitTaller, nivelTaller, nombreMarca, tipoPrenda, cantidad, proceso, precio, plazoDias, fechaAcuerdo }: OrdenPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Orden de Manufactura</Text>
          <Text style={styles.subheader}>Plataforma Digital Textil · OIT Argentina · UNTREF</Text>
          <Text style={styles.moId}>{moId}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Taller</Text>
          <View style={styles.row}><Text style={styles.label}>Nombre:</Text><Text style={styles.value}>{nombreTaller}</Text></View>
          <View style={styles.row}><Text style={styles.label}>CUIT:</Text><Text style={styles.value}>{cuitTaller}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Nivel PDT:</Text><Text style={styles.value}>{nivelTaller}</Text></View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Marca</Text>
          <View style={styles.row}><Text style={styles.label}>Nombre:</Text><Text style={styles.value}>{nombreMarca}</Text></View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Términos del acuerdo</Text>
          <View style={styles.row}><Text style={styles.label}>Prenda:</Text><Text style={styles.value}>{tipoPrenda}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Cantidad:</Text><Text style={styles.value}>{cantidad} unidades</Text></View>
          <View style={styles.row}><Text style={styles.label}>Proceso:</Text><Text style={styles.value}>{proceso}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Precio acordado:</Text><Text style={styles.value}>$ {precio.toLocaleString('es-AR')}</Text></View>
          {plazoDias && <View style={styles.row}><Text style={styles.label}>Plazo:</Text><Text style={styles.value}>{plazoDias} días hábiles</Text></View>}
          <View style={styles.row}><Text style={styles.label}>Fecha de acuerdo:</Text><Text style={styles.value}>{new Date(fechaAcuerdo).toLocaleDateString('es-AR')}</Text></View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Documento generado por la Plataforma Digital Textil</Text>
          <Text style={styles.aviso}>El pago se acuerda directamente entre las partes. Este documento es solo un registro del acuerdo productivo.</Text>
        </View>
      </Page>
    </Document>
  )
}
```

### Archivo nuevo — `src/app/api/ordenes/[id]/pdf/route.tsx`

```tsx
import { NextResponse } from 'next/server'
import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { renderToBuffer } from '@react-pdf/renderer'
import { OrdenPDF } from '@/compartido/componentes/pdf/orden-pdf'

export const runtime = 'nodejs'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const orden = await prisma.ordenManufactura.findUnique({
    where: { id },
    include: {
      taller: { select: { nombre: true, cuit: true, nivel: true, userId: true } },
      pedido: {
        select: {
          tipoPrenda: true,
          cantidad: true,
          omId: true,
          marca: { select: { nombre: true, userId: true } },
        },
      },
    },
  })

  if (!orden) {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  }

  // Verificar ownership: taller asignado, marca dueña del pedido, o ADMIN
  const role = (session.user as { role?: string }).role
  const userId = session.user.id
  if (role !== 'ADMIN') {
    const esTaller = orden.taller.userId === userId
    const esMarca = orden.pedido.marca.userId === userId
    if (!esTaller && !esMarca) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }
  }

  const pdfBuffer = await renderToBuffer(
    <OrdenPDF
      moId={orden.moId}
      nombreTaller={orden.taller.nombre}
      cuitTaller={orden.taller.cuit}
      nivelTaller={orden.taller.nivel}
      nombreMarca={orden.pedido.marca.nombre}
      tipoPrenda={orden.pedido.tipoPrenda}
      cantidad={orden.pedido.cantidad}
      proceso={orden.proceso}
      precio={orden.precio}
      plazoDias={orden.plazoDias}
      fechaAcuerdo={orden.createdAt}
    />
  )

  // Usar new Uint8Array() — mismo patrón que certificados/[id]/pdf/route.tsx
  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="acuerdo-${orden.moId}.pdf"`,
    },
  })
}
```

### Archivo a modificar — `src/app/(taller)/taller/pedidos/[id]/page.tsx`

**Cambio 1 — Agregar `Download` al import de Lucide existente (línea 7):**

```typescript
// Antes:
import { ArrowLeft } from 'lucide-react'

// Después:
import { ArrowLeft, Download } from 'lucide-react'
```

**Cambio 2 — Agregar link de descarga dentro del card "Tu orden de manufactura", después de la barra de progreso (después de la línea 146, dentro del `<div>` que contiene el detalle de la orden):**

```tsx
{(orden.estado === 'EN_EJECUCION' || orden.estado === 'COMPLETADO') && (
  <div className="pt-3 border-t border-gray-100 mt-3">
    <a href={`/api/ordenes/${orden.id}/pdf`} download
      className="inline-flex items-center gap-2 text-sm font-semibold text-brand-blue hover:underline">
      <Download className="w-4 h-4" />
      Descargar acuerdo PDF
    </a>
  </div>
)}
```

### Archivo a modificar — `src/app/(marca)/marca/pedidos/[id]/page.tsx`

**Cambio 1 — Agregar `Download` al import de Lucide existente (línea 9):**

```typescript
// Antes:
import { ArrowLeft, Package, Clock, DollarSign, TrendingUp, CheckCircle } from 'lucide-react'

// Después:
import { ArrowLeft, Package, Clock, DollarSign, TrendingUp, CheckCircle, Download } from 'lucide-react'
```

**Cambio 2 — Agregar link de descarga dentro del `.map()` de órdenes (líneas 204-234), al lado del Badge de estado, solo cuando la orden está EN_EJECUCION o COMPLETADO:**

```tsx
{/* Dentro del .map(), al lado del Badge, después de línea 230 */}
{(orden.estado === 'EN_EJECUCION' || orden.estado === 'COMPLETADO') && (
  <a href={`/api/ordenes/${orden.id}/pdf`} download
    className="text-xs font-semibold text-brand-blue hover:underline">
    Acuerdo PDF
  </a>
)}
```

## 5. Casos borde

- Orden en estado PENDIENTE → no mostrar botón de descarga (el acuerdo se firma al aceptar)
- Orden CANCELADA → no mostrar botón de descarga
- `precio = 0` → mostrar "$0" en el PDF (precio no acordado aún)
- `plazoDias` null → no mostrar la fila de plazo en el PDF

## 6. Criterio de aceptación

- [ ] `GET /api/ordenes/[id]/pdf` retorna PDF descargable
- [ ] El PDF tiene datos del taller, marca y términos del acuerdo
- [ ] El botón aparece solo para órdenes EN_EJECUCION o COMPLETADO
- [ ] TALLER solo puede descargar sus propias órdenes
- [ ] MARCA solo puede descargar órdenes de sus pedidos
- [ ] Build pasa sin errores

## 7. Tests (verificación manual — Sergio)

1. Aceptar una orden como taller → verificar que aparece el botón "Descargar acuerdo PDF"
2. Click en el botón → verificar que se descarga PDF con los datos correctos
3. Intentar acceder a `/api/ordenes/[otra-orden]/pdf` como taller → debe retornar 403
