'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react'

export default function AdminIntegracionArcaPage() {
  const [apiUrl, setApiUrl] = useState('https://serviciosweb.afip.gob.ar/genericos/v1')
  const [apiKey, setApiKey] = useState('••••••••••••')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'ok' | 'error' | null>(null)

  function handleTest() {
    setTesting(true)
    setTimeout(() => { setTestResult('ok'); setTesting(false) }, 1500)
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <Link href="/admin/integraciones" className="inline-flex items-center gap-1 text-sm text-brand-blue hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Volver a integraciones
      </Link>

      <h1 className="font-overpass font-bold text-2xl text-brand-blue mb-1">Configuración ARCA</h1>
      <p className="text-gray-500 text-sm mb-6">Verificación automática de CUIT y monotributo vía ARCA (ex-AFIP)</p>

      <Card className="mb-6">
        <h2 className="font-overpass font-bold text-brand-blue mb-4">Conexión API</h2>
        <div className="space-y-4">
          <Input label="URL del servicio" value={apiUrl} onChange={e => setApiUrl(e.target.value)} />
          <Input label="API Key / Token" type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} />
        </div>
      </Card>

      <Card className="mb-6">
        <h2 className="font-overpass font-bold text-brand-blue mb-4">Verificaciones Habilitadas</h2>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded" />
            <span className="text-sm">Verificar CUIT al registrarse</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded" />
            <span className="text-sm">Verificar monotributo activo</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded" />
            <span className="text-sm">Re-verificar periódicamente (cada 30 días)</span>
          </label>
        </div>
      </Card>

      <Card className="mb-6">
        <h2 className="font-overpass font-bold text-brand-blue mb-4">Test de Conexión</h2>
        <div className="flex items-center gap-3">
          <Button onClick={handleTest} disabled={testing}>{testing ? 'Verificando...' : 'Probar Conexión'}</Button>
          {testResult === 'ok' && (
            <span className="flex items-center gap-1 text-green-600 text-sm"><CheckCircle className="w-4 h-4" /> Conexión exitosa</span>
          )}
          {testResult === 'error' && (
            <span className="flex items-center gap-1 text-red-600 text-sm"><AlertTriangle className="w-4 h-4" /> Error de conexión</span>
          )}
        </div>
      </Card>

      <Card className="mb-6">
        <h2 className="font-overpass font-bold text-brand-blue mb-3">Estado</h2>
        <div className="flex items-center gap-2">
          <Badge variant="success">Activo</Badge>
          <span className="text-sm text-gray-500">Última verificación exitosa: hace 2 horas</span>
        </div>
      </Card>

      <Button className="w-full">Guardar Configuración</Button>
    </div>
  )
}
