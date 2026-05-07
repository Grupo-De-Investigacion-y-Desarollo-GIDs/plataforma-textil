'use client'

import { useState } from 'react'
import { Card } from '@/compartido/componentes/ui/card'
import { Button } from '@/compartido/componentes/ui/button'
import { Breadcrumbs } from '@/compartido/componentes/ui/breadcrumbs'
import { Loading } from '@/compartido/componentes/ui/loading'
import { useToast } from '@/compartido/componentes/ui/toast'
import { FileText, FileSpreadsheet, Download } from 'lucide-react'

interface ReporteTipo {
  value: string
  label: string
  desc: string
  filtros: ('provincia' | 'nivel' | 'periodo')[]
}

const reportes: ReporteTipo[] = [
  { value: 'talleres', label: 'Talleres', desc: 'Datos completos: identificacion, formalizacion, verificacion ARCA, metricas de actividad', filtros: ['provincia', 'nivel', 'periodo'] },
  { value: 'marcas', label: 'Marcas', desc: 'Marcas registradas con CUIT, verificacion ARCA, pedidos y volumen', filtros: ['periodo'] },
  { value: 'validaciones', label: 'Validaciones', desc: 'Historial de aprobaciones y rechazos de documentos', filtros: ['periodo'] },
  { value: 'demanda', label: 'Demanda insatisfecha', desc: 'Pedidos sin cotizaciones con motivos y talleres cerca', filtros: ['periodo'] },
  { value: 'resumen', label: 'Resumen ejecutivo', desc: 'Metricas principales, distribucion por nivel, tasas de aceptacion', filtros: ['periodo'] },
  { value: 'capacitaciones', label: 'Capacitaciones', desc: 'Cursos completados, certificados emitidos', filtros: ['periodo'] },
  { value: 'acompanamiento', label: 'Talleres que necesitan acompanamiento', desc: 'Registros incompletos, menos de 4 documentos aprobados', filtros: [] },
  { value: 'pedidos', label: 'Pedidos', desc: 'Todos los pedidos con estado, cantidades y montos', filtros: ['periodo'] },
  { value: 'denuncias', label: 'Denuncias', desc: 'Denuncias recibidas sin datos del denunciante', filtros: ['periodo'] },
]

const PROVINCIAS = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Cordoba', 'Corrientes',
  'Entre Rios', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones',
  'Neuquen', 'Rio Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe',
  'Santiago del Estero', 'Tierra del Fuego', 'Tucuman',
]

function calcularFechas(periodo: string): { desde: string; hasta: string } | null {
  if (!periodo) return null
  const ahora = new Date()
  const hasta = ahora.toISOString()
  if (periodo === 'mes') return { desde: new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString(), hasta }
  if (periodo === 'trimestre') {
    const d = new Date(); d.setMonth(d.getMonth() - 3)
    return { desde: d.toISOString(), hasta }
  }
  if (periodo === 'semestre') {
    const d = new Date(); d.setMonth(d.getMonth() - 6)
    return { desde: d.toISOString(), hasta }
  }
  return null
}

export default function ExportarReportePage() {
  const { toast } = useToast()
  const [descargando, setDescargando] = useState<string | null>(null)
  const [filtros, setFiltros] = useState<Record<string, { periodo: string; provincia: string; nivel: string }>>({})

  function getFiltro(tipo: string) {
    return filtros[tipo] ?? { periodo: '', provincia: '', nivel: '' }
  }

  function setFiltro(tipo: string, key: string, value: string) {
    setFiltros(prev => ({
      ...prev,
      [tipo]: { ...getFiltro(tipo), [key]: value },
    }))
  }

  async function handleDescargar(tipo: string, formato: 'csv' | 'xlsx') {
    setDescargando(`${tipo}-${formato}`)
    try {
      const f = getFiltro(tipo)
      const fechas = calcularFechas(f.periodo)
      const params = new URLSearchParams({ tipo, formato })
      if (fechas) { params.set('desde', fechas.desde); params.set('hasta', fechas.hasta) }
      if (f.provincia) params.set('provincia', f.provincia)
      if (f.nivel) params.set('nivel', f.nivel)

      const res = await fetch(`/api/estado/exportar?${params}`)
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: { message: 'Error al generar' } }))
        const msg = typeof data.error === 'string' ? data.error : data.error?.message
        toast(msg || 'Error al generar reporte', 'error')
        return
      }
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      const ext = formato === 'xlsx' ? 'xlsx' : 'csv'
      a.download = `${tipo}-${new Date().toISOString().split('T')[0]}.${ext}`
      a.click()
      URL.revokeObjectURL(blobUrl)
      toast('Reporte descargado', 'success')
    } catch {
      toast('Error de conexion', 'error')
    } finally {
      setDescargando(null)
    }
  }

  async function handleInformeMensual() {
    setDescargando('mensual-xlsx')
    try {
      const ahora = new Date()
      const desde = new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString()
      const hasta = ahora.toISOString()
      const params = new URLSearchParams({ tipo: 'mensual', formato: 'xlsx', desde, hasta })

      const res = await fetch(`/api/estado/exportar?${params}`)
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: { message: 'Error al generar' } }))
        toast(typeof data.error === 'string' ? data.error : data.error?.message || 'Error', 'error')
        return
      }
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `informe-mensual-${new Date().toISOString().split('T')[0]}.xlsx`
      a.click()
      URL.revokeObjectURL(blobUrl)
      toast('Informe mensual descargado', 'success')
    } catch {
      toast('Error de conexion', 'error')
    } finally {
      setDescargando(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      <div>
        <Breadcrumbs items={[
          { label: 'Estado', href: '/estado' },
          { label: 'Exportar' },
        ]} />
        <h1 className="font-overpass font-bold text-2xl text-brand-blue">Exportar Reportes</h1>
        <p className="text-gray-500 text-sm mt-1">Genera informes del sector en formato CSV o Excel</p>
      </div>

      {/* Informe mensual destacado */}
      <Card className="border-brand-blue/30 bg-blue-50/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-overpass font-bold text-lg text-brand-blue">Informe mensual completo</h2>
            <p className="text-sm text-gray-600 mt-1">
              Plantilla Excel con todas las hojas: talleres, marcas, pedidos, validaciones, demanda insatisfecha y resumen.
              Listo para presentar a OIT.
            </p>
          </div>
          <Button
            onClick={handleInformeMensual}
            loading={descargando === 'mensual-xlsx'}
            icon={<FileSpreadsheet className="w-4 h-4" />}
          >
            Generar informe
          </Button>
        </div>
      </Card>

      {/* Reportes individuales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportes.map(r => {
          const f = getFiltro(r.value)
          const isDescargando = descargando?.startsWith(r.value)

          return (
            <Card key={r.value} className="flex flex-col">
              <h3 className="font-overpass font-semibold text-brand-blue mb-1">{r.label}</h3>
              <p className="text-xs text-gray-500 mb-3">{r.desc}</p>

              {/* Filtros */}
              <div className="space-y-2 mb-3">
                {r.filtros.includes('periodo') && (
                  <select
                    value={f.periodo}
                    onChange={e => setFiltro(r.value, 'periodo', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs"
                  >
                    <option value="">Todo el historial</option>
                    <option value="mes">Mes actual</option>
                    <option value="trimestre">Ultimos 3 meses</option>
                    <option value="semestre">Ultimos 6 meses</option>
                  </select>
                )}
                {r.filtros.includes('provincia') && (
                  <select
                    value={f.provincia}
                    onChange={e => setFiltro(r.value, 'provincia', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs"
                  >
                    <option value="">Todas las provincias</option>
                    {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                )}
                {r.filtros.includes('nivel') && (
                  <select
                    value={f.nivel}
                    onChange={e => setFiltro(r.value, 'nivel', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs"
                  >
                    <option value="">Todos los niveles</option>
                    <option value="BRONCE">Bronce</option>
                    <option value="PLATA">Plata</option>
                    <option value="ORO">Oro</option>
                  </select>
                )}
              </div>

              {/* Botones de descarga */}
              <div className="flex gap-2 mt-auto">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleDescargar(r.value, 'csv')}
                  loading={descargando === `${r.value}-csv`}
                  disabled={!!isDescargando}
                  icon={<FileText className="w-3.5 h-3.5" />}
                >
                  CSV
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleDescargar(r.value, 'xlsx')}
                  loading={descargando === `${r.value}-xlsx`}
                  disabled={!!isDescargando}
                  icon={<FileSpreadsheet className="w-3.5 h-3.5" />}
                >
                  Excel
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
