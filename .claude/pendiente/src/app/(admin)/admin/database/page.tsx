'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Database, Download, Upload, Play, AlertTriangle } from 'lucide-react'

const mockTables = [
  { name: 'User', rows: 32, size: '2.1 MB' },
  { name: 'Taller', rows: 24, size: '1.8 MB' },
  { name: 'Marca', rows: 8, size: '0.5 MB' },
  { name: 'Coleccion', rows: 5, size: '0.3 MB' },
  { name: 'Video', rows: 45, size: '1.2 MB' },
  { name: 'Certificado', rows: 38, size: '0.9 MB' },
  { name: 'Pedido', rows: 45, size: '1.5 MB' },
  { name: 'LogActividad', rows: 1234, size: '8.5 MB' },
]

const mockBackups = [
  { fecha: '04/02/26 09:30', tamano: '45 MB', estado: 'OK' },
  { fecha: '03/02/26 09:30', tamano: '44 MB', estado: 'OK' },
  { fecha: '02/02/26 09:30', tamano: '43 MB', estado: 'OK' },
]

export default function AdminDatabasePage() {
  const [query, setQuery] = useState('')
  const [resultado, setResultado] = useState<string | null>(null)

  function handleExecute() {
    setResultado('Consulta ejecutada. 0 filas afectadas. (mock)')
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <h1 className="font-overpass font-bold text-2xl text-brand-blue mb-1">Base de Datos</h1>
      <p className="text-gray-500 text-sm mb-6">Explorador y gestión de la base de datos</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <h2 className="font-overpass font-bold text-brand-blue mb-3 flex items-center gap-2">
            <Database className="w-5 h-5" /> Tablas del Sistema
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-semibold">Tabla</th>
                  <th className="text-right py-2 font-semibold">Registros</th>
                  <th className="text-right py-2 font-semibold">Tamaño</th>
                </tr>
              </thead>
              <tbody>
                {mockTables.map(t => (
                  <tr key={t.name} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-1.5 font-mono text-xs">{t.name}</td>
                    <td className="py-1.5 text-right text-gray-500">{t.rows.toLocaleString()}</td>
                    <td className="py-1.5 text-right text-gray-500">{t.size}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-2">Total: {mockTables.reduce((a, t) => a + t.rows, 0).toLocaleString()} registros</p>
        </Card>

        <Card>
          <h2 className="font-overpass font-bold text-brand-blue mb-3 flex items-center gap-2">
            <Download className="w-5 h-5" /> Backups Recientes
          </h2>
          <div className="space-y-2 mb-4">
            {mockBackups.map((b, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50">
                <span className="text-gray-600">{b.fecha}</span>
                <span className="text-gray-500">{b.tamano}</span>
                <Badge variant="success">{b.estado}</Badge>
                <Button size="sm" variant="secondary">Restaurar</Button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button size="sm" icon={<Download className="w-3 h-3" />}>Crear Backup</Button>
            <Button size="sm" variant="secondary" icon={<Upload className="w-3 h-3" />}>Importar</Button>
          </div>
        </Card>
      </div>

      <Card className="mb-4">
        <h2 className="font-overpass font-bold text-brand-blue mb-3 flex items-center gap-2">
          <Play className="w-5 h-5" /> Ejecutar Consulta SQL
        </h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-700">Solo ejecutá consultas de lectura (SELECT). Las consultas destructivas están bloqueadas en producción.</p>
        </div>
        <textarea
          value={query}
          onChange={e => setQuery(e.target.value)}
          rows={4}
          placeholder="SELECT * FROM &quot;User&quot; LIMIT 10;"
          className="w-full font-mono text-sm rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent mb-3"
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleExecute}>Ejecutar</Button>
          <Button size="sm" variant="secondary" onClick={() => setQuery('')}>Limpiar</Button>
        </div>
        {resultado && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm font-mono text-gray-600">{resultado}</div>
        )}
      </Card>
    </div>
  )
}
