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
          <Text style={styles.sectionTitle}>Terminos del acuerdo</Text>
          <View style={styles.row}><Text style={styles.label}>Prenda:</Text><Text style={styles.value}>{tipoPrenda}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Cantidad:</Text><Text style={styles.value}>{cantidad} unidades</Text></View>
          <View style={styles.row}><Text style={styles.label}>Proceso:</Text><Text style={styles.value}>{proceso}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Precio acordado:</Text><Text style={styles.value}>$ {precio.toLocaleString('es-AR')}</Text></View>
          {plazoDias && <View style={styles.row}><Text style={styles.label}>Plazo:</Text><Text style={styles.value}>{plazoDias} dias habiles</Text></View>}
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
