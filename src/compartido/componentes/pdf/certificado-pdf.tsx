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
