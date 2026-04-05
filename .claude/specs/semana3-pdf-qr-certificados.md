# Spec: PDF y QR de certificados

- **Semana:** 3
- **Asignado a:** Gerardo
- **Dependencias:** Ninguna — `qrcode` ya instalado, `pdfUrl` y `qrCode` ya en schema

---

## 1. Contexto

Los certificados se crean correctamente pero los campos `pdfUrl` y `qrCode` quedan null. La lib `qr.ts` ya existe y genera QR pero nunca se usa. Hay que generar el QR al crear el certificado (subirlo a Supabase Storage), generar el PDF on-demand al descargar, y agregar botones de descarga en el taller y en el admin.

---

## 2. Que construir

- Instalar `@react-pdf/renderer`
- Componente PDF del certificado
- API `GET /api/certificados/[id]/pdf` — genera y retorna el PDF on-demand
- Al crear certificado: generar QR, subir a Storage, guardar `qrCode` URL en DB
- Boton "Descargar certificado PDF" en `/taller/aprender/[id]`
- Boton "Descargar" en `/admin/certificados`

---

## 3. Datos

- `pdfUrl` y `qrCode` ya existen en schema como `String?` nullable
- Bucket `documentos` ya existe en Supabase Storage
- `generateQrBuffer(codigo)` ya existe en `src/compartido/lib/qr.ts` — genera Buffer PNG del QR
- `uploadFile(buffer, path, contentType)` ya existe en `src/compartido/lib/storage.ts` — retorna `string` (publicUrl directa)

---

## 4. Prescripciones tecnicas

### Instalar dependencia

```bash
npm install @react-pdf/renderer
```

`@react-pdf/renderer` ya incluye sus propios tipos TypeScript — no instalar `@types/react-pdf` (ese paquete es para `react-pdf` viewer, no para el renderer).

### Archivo nuevo — `src/compartido/componentes/pdf/certificado-pdf.tsx`

```typescript
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', backgroundColor: '#ffffff' },
  header: { backgroundColor: '#1e3a5f', padding: 20, marginBottom: 20, borderRadius: 4 },
  headerText: { color: '#ffffff', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  subheader: { color: '#93c5fd', fontSize: 11, textAlign: 'center', marginTop: 4 },
  body: { padding: 20 },
  title: { fontSize: 14, color: '#374151', textAlign: 'center', marginBottom: 8 },
  nombreTaller: { fontSize: 22, color: '#1e3a5f', fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  cursoNombre: { fontSize: 16, color: '#374151', textAlign: 'center', marginBottom: 4 },
  calificacion: { fontSize: 13, color: '#059669', textAlign: 'center', marginBottom: 20 },
  footer: { marginTop: 20, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 12 },
  codigo: { fontSize: 10, color: '#6b7280', textAlign: 'center' },
  fecha: { fontSize: 10, color: '#6b7280', textAlign: 'center', marginTop: 4 },
  institucion: { fontSize: 11, color: '#374151', textAlign: 'center', marginTop: 8, fontWeight: 'bold' },
})

interface CertificadoPDFProps {
  nombreTaller: string
  nombreCurso: string
  calificacion: number
  codigo: string
  fecha: Date
  institucion: string
}

export function CertificadoPDF({ nombreTaller, nombreCurso, calificacion, codigo, fecha, institucion }: CertificadoPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Plataforma Digital Textil</Text>
          <Text style={styles.subheader}>OIT Argentina · UNTREF</Text>
        </View>
        <View style={styles.body}>
          <Text style={styles.title}>Certificado de Capacitacion</Text>
          <Text style={styles.title}>Este certificado acredita que</Text>
          <Text style={styles.nombreTaller}>{nombreTaller}</Text>
          <Text style={styles.title}>completo exitosamente el curso</Text>
          <Text style={styles.cursoNombre}>{nombreCurso}</Text>
          <Text style={styles.calificacion}>Calificacion: {calificacion}%</Text>
          <Text style={styles.institucion}>{institucion}</Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.codigo}>Codigo de verificacion: {codigo}</Text>
          <Text style={styles.fecha}>
            Fecha de emision: {new Date(fecha).toLocaleDateString('es-AR')}
          </Text>
          <Text style={styles.codigo}>
            Verificar en: plataformatextil.ar/verificar?code={codigo}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
```

### Archivo nuevo — `src/app/api/certificados/[id]/pdf/route.tsx`

Usar `.tsx` (no `.ts`) para que Next.js procese JSX. Forzar runtime Node.js porque `@react-pdf/renderer` depende de `yoga-layout` (WASM/native) que no funciona en Edge.

```typescript
import { NextResponse } from 'next/server'
import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { renderToBuffer } from '@react-pdf/renderer'
import { CertificadoPDF } from '@/compartido/componentes/pdf/certificado-pdf'

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

  const certificado = await prisma.certificado.findUnique({
    where: { id },
    include: {
      taller: { select: { id: true, nombre: true, userId: true } },
      coleccion: { select: { titulo: true, institucion: true } },
    },
  })

  if (!certificado) {
    return NextResponse.json({ error: 'Certificado no encontrado' }, { status: 404 })
  }

  // Verificar ownership: taller propio o ADMIN
  const role = (session.user as { role?: string }).role
  if (role !== 'ADMIN' && certificado.taller.userId !== session.user.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  // Generar PDF on-demand
  const pdfBuffer = await renderToBuffer(
    <CertificadoPDF
      nombreTaller={certificado.taller.nombre}
      nombreCurso={certificado.coleccion.titulo}
      calificacion={certificado.calificacion}
      codigo={certificado.codigo}
      fecha={certificado.fecha}
      institucion={certificado.coleccion.institucion ?? 'OIT Argentina · UNTREF'}
    />
  )

  return new Response(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="certificado-${certificado.codigo}.pdf"`,
    },
  })
}
```

Nota: el cold start de esta ruta puede ser lento (2-3s) la primera vez porque `@react-pdf/renderer` carga `yoga-layout`. Las siguientes invocaciones son rapidas gracias a Fluid Compute que reutiliza instancias.

### Archivo a modificar — `src/app/api/colecciones/[id]/evaluacion/route.ts`

Despues de crear el certificado (linea ~102), agregar generacion y guardado del QR:

```typescript
import { generateQrBuffer } from '@/compartido/lib/qr'
import { uploadFile } from '@/compartido/lib/storage'

// Dentro del bloque if (aprobado), despues de prisma.certificado.create:

// Generar QR y subirlo a Storage (fire-and-forget para no bloquear respuesta)
generateQrBuffer(codigo).then(async (qrBuffer) => {
  const qrPath = `qr/${taller.id}/${certificado.id}.png`
  const qrUrl = await uploadFile(qrBuffer, qrPath, 'image/png')
  if (qrUrl) {
    await prisma.certificado.update({
      where: { id: certificado.id },
      data: { qrCode: qrUrl },
    })
  }
}).catch((err) => {
  console.error('Error generando QR del certificado:', err)
})
```

La generacion del QR es fire-and-forget — si falla, el certificado se crea igual con `qrCode: null`. La pagina `/verificar` sigue funcionando sin imagen QR.

### Archivo a modificar — `src/app/(taller)/taller/aprender/[id]/page.tsx`

Cambiar el prop que pasa al client component. Actualmente (linea 82):

```typescript
// Antes:
certificadoExistente={!!certificado}

// Despues:
certificadoId={certificado?.id ?? null}
```

### Archivo a modificar — client component de aprender/[id]

Actualizar la interface del client component para recibir `certificadoId` en lugar de `certificadoExistente`:

```typescript
// Antes en la interface:
certificadoExistente: boolean

// Despues:
certificadoId: string | null
```

Agregar boton de descarga donde actualmente se muestra el estado de certificado:

```tsx
import { Download } from 'lucide-react'

{certificadoId && (
  <a
    href={`/api/certificados/${certificadoId}/pdf`}
    download
    className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-overpass font-semibold transition-colors"
  >
    <Download className="w-4 h-4" />
    Descargar certificado PDF
  </a>
)}
```

Actualizar las condiciones que usaban `certificadoExistente` a usar `!!certificadoId`.

### Archivo a modificar — `src/app/(admin)/admin/certificados/page.tsx`

Agregar columna "PDF" en la tabla de certificados con link de descarga:

```tsx
<a
  href={`/api/certificados/${cert.id}/pdf`}
  download
  className="text-brand-blue font-semibold text-sm hover:underline"
>
  Descargar
</a>
```

---

## 5. Casos borde

- **Certificado revocado** → el endpoint PDF igual lo genera (el PDF es evidencia historica)
- **Storage falla al guardar QR** → certificado se crea igual, `qrCode` queda null, la pagina `/verificar` sigue funcionando sin imagen QR
- **`@react-pdf/renderer` en Edge runtime** → forzado a Node.js con `export const runtime = 'nodejs'` en la route
- **Cold start lento** → primera invocacion puede tardar 2-3s por carga de `yoga-layout`. Documentar como comportamiento esperado.
- **`pdfUrl` queda siempre null en el piloto** → el PDF se genera on-demand en cada descarga, no se guarda en Storage. En una fase posterior se puede pre-generar y cachear en Storage actualizando `pdfUrl` para redirigir directamente.
- **Taller intenta descargar certificado de otro taller** → 403 "No autorizado" (ownership check via `taller.userId`)

---

## 6. Criterio de aceptacion

- [ ] `npm install @react-pdf/renderer` sin errores
- [ ] `GET /api/certificados/[id]/pdf` retorna un PDF descargable con Content-Type `application/pdf`
- [ ] El PDF tiene nombre del taller, curso, calificacion, codigo y fecha
- [ ] Al aprobar una evaluacion, `qrCode` se guarda en la DB (URL publica de Supabase Storage)
- [ ] Boton "Descargar certificado PDF" aparece en `/taller/aprender/[id]` cuando hay certificado
- [ ] Boton "Descargar" aparece en `/admin/certificados` para cada certificado
- [ ] TALLER solo puede descargar sus propios certificados, ADMIN puede descargar todos
- [ ] La ruta usa `runtime = 'nodejs'` (no Edge)
- [ ] Build pasa sin errores

---

## 7. Tests (verificacion manual)

1. Completar una evaluacion como taller → verificar en Supabase que `qrCode` tiene URL (no null) apuntando a `documentos/qr/{tallerId}/{certId}.png`
2. Verificar que la imagen QR es accesible en la URL publica
3. Ir a `/taller/aprender/[id]` con certificado → verificar que aparece el boton "Descargar certificado PDF"
4. Click en el boton → verificar que se descarga un PDF con nombre `certificado-{codigo}.pdf`
5. Abrir el PDF → verificar que tiene nombre del taller, curso, calificacion, codigo, fecha e institucion
6. Loguearse como otro taller e intentar `GET /api/certificados/{id}/pdf` → debe retornar 403
7. Loguearse como ADMIN → ir a `/admin/certificados` → verificar que cada fila tiene link "Descargar"
8. Click en "Descargar" desde admin → debe descargar el PDF correctamente
