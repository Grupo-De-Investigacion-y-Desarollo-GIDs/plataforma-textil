'use client'

import { useState } from 'react'
import { Card } from '@/compartido/componentes/ui/card'
import { Button } from '@/compartido/componentes/ui/button'
import { FileText, AlertCircle } from 'lucide-react'

const reportes = [
  { value: 'resumen', label: 'Resumen ejecutivo', desc: 'Metricas principales, distribucion por nivel' },
  { value: 'talleres', label: 'Listado completo de talleres', desc: 'Todos los talleres con datos de contacto y nivel' },
  { value: 'acompanamiento', label: 'Talleres que necesitan acompanamiento', desc: 'Registros incompletos, sin actividad, docs por vencer' },
  { value: 'capacitaciones', label: 'Reporte de capacitaciones', desc: 'Cursos completados, certificados emitidos' },
  { value: 'marcas', label: 'Listado de marcas', desc: 'Todas las marcas con CUIT, tipo y volumen' },
  { value: 'pedidos', label: 'Reporte de pedidos', desc: 'Pedidos con estado, cantidades y montos' },
  { value: 'denuncias', label: 'Reporte de denuncias', desc: 'Denuncias recibidas sin datos del denunciante' },
]

function calcularDesde(periodo: string): string | null {
  if (!periodo) return null
  const ahora = new Date()
  if (periodo === 'mes') return new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString()
  if (periodo === 'trimestre') {
    const d = new Date()
    d.setMonth(d.getMonth() - 3)
    return d.toISOString()
  }
  if (periodo === 'semestre') {
    const d = new Date()
    d.setMonth(d.getMonth() - 6)
    return d.toISOString()
  }
  return null
}

export default function ExportarReportePage() {
  const [tipo, setTipo] = useState('talleres')
  const [periodo, setPeriodo] = useState('')
  const [generando, setGenerando] = useState(false)
  const [error, setError] = useState('')

  async function handleGenerar() {
    setGenerando(true)
    setError('')
    try {
      const desde = calcularDesde(periodo)
      const url = `/api/exportar?tipo=${tipo}${desde ? `&desde=${desde}` : ''}`
      const res = await fetch(url)
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Error al generar' }))
        setError(data.error || 'Error al generar reporte')
        return
      }
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `reporte-${tipo}-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(blobUrl)
    } catch {
      setError('Error de conexion')
    } finally {
      setGenerando(false)
    }
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
                onChange={() => setTipo(r.value)}
                className="mt-1 accent-[var(--color-brand-blue)]" />
              <div>
                <p className="font-semibold text-sm">{r.label}</p>
                <p className="text-xs text-gray-500">{r.desc}</p>
              </div>
            </label>
          ))}
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium text-gray-700">Periodo</label>
          <select value={periodo} onChange={e => setPeriodo(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">Todo el historial</option>
            <option value="mes">Mes actual</option>
            <option value="trimestre">Ultimos 3 meses</option>
            <option value="semestre">Ultimos 6 meses</option>
          </select>
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

      <Button onClick={handleGenerar} loading={generando} icon={<FileText className="w-4 h-4" />} size="lg">
        Generar y Descargar
      </Button>
    </div>
  )
}
