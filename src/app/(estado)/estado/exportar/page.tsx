'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, FileText, CheckCircle, AlertCircle } from 'lucide-react'

const reportes = [
  { value: 'resumen', label: 'Resumen ejecutivo', desc: 'Metricas principales, distribucion por nivel' },
  { value: 'talleres', label: 'Listado completo de talleres', desc: 'Todos los talleres con datos de contacto y nivel' },
  { value: 'acompanamiento', label: 'Talleres que necesitan acompanamiento', desc: 'Registros incompletos, sin actividad, docs por vencer' },
  { value: 'capacitaciones', label: 'Reporte de capacitaciones', desc: 'Cursos completados, certificados emitidos' },
]

export default function ExportarReportePage() {
  const [tipo, setTipo] = useState('talleres')
  const [generando, setGenerando] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [filename, setFilename] = useState('')
  const [error, setError] = useState('')

  async function handleGenerar() {
    setGenerando(true)
    setDownloadUrl(null)
    setError('')
    try {
      const res = await fetch(`/api/exportar?tipo=${tipo}`)
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Error al generar' }))
        setError(data.error || 'Error al generar reporte')
        return
      }
      const disposition = res.headers.get('Content-Disposition') || ''
      const match = disposition.match(/filename="(.+)"/)
      const name = match?.[1] || `${tipo}.csv`
      setFilename(name)

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)
    } catch {
      setError('Error de conexion')
    } finally {
      setGenerando(false)
    }
  }

  function handleDescargar() {
    if (!downloadUrl) return
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = filename
    a.click()
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <h1 className="font-overpass font-bold text-2xl text-brand-blue mb-1">Exportar Reporte</h1>
      <p className="text-gray-500 text-sm mb-6">Genera informes del estado del sector en formato CSV</p>

      <Card title="Tipo de Reporte" className="mb-6">
        <div className="space-y-3">
          {reportes.map(r => (
            <label key={r.value} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${tipo === r.value ? 'border-brand-blue bg-blue-50/50' : 'border-gray-200 hover:border-gray-300'}`}>
              <input type="radio" name="tipo" value={r.value} checked={tipo === r.value}
                onChange={() => { setTipo(r.value); setDownloadUrl(null) }}
                className="mt-1 accent-[var(--color-brand-blue)]" />
              <div>
                <p className="font-semibold text-sm">{r.label}</p>
                <p className="text-xs text-gray-500">{r.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </Card>

      {error && (
        <Card className="mb-6 bg-red-50 border-red-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </Card>
      )}

      {downloadUrl && (
        <Card className="mb-6 bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
            <div>
              <p className="font-semibold text-green-700">Reporte generado exitosamente</p>
              <p className="text-sm text-green-600">Hace click en &quot;Descargar&quot; para obtener {filename}.</p>
            </div>
          </div>
        </Card>
      )}

      <div className="flex gap-3">
        <Button onClick={handleGenerar} loading={generando} icon={<FileText className="w-4 h-4" />} size="lg">
          Generar Reporte
        </Button>
        {downloadUrl && (
          <Button variant="success" icon={<Download className="w-4 h-4" />} size="lg" onClick={handleDescargar}>
            Descargar
          </Button>
        )}
      </div>
    </div>
  )
}
