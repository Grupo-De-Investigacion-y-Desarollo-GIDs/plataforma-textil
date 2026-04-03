'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react'

export default function AdminIntegracionWhatsappPage() {
  const [phoneId, setPhoneId] = useState('')
  const [token, setToken] = useState('••••••••••••')
  const [businessId, setBusinessId] = useState('')
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

      <h1 className="font-overpass font-bold text-2xl text-brand-blue mb-1">Configuración WhatsApp Business</h1>
      <p className="text-gray-500 text-sm mb-6">Notificaciones y comunicación por WhatsApp</p>

      <Card className="mb-6">
        <h2 className="font-overpass font-bold text-brand-blue mb-4">Meta Business API</h2>
        <div className="space-y-4">
          <Input label="Phone Number ID" value={phoneId} onChange={e => setPhoneId(e.target.value)} />
          <Input label="Access Token" type="password" value={token} onChange={e => setToken(e.target.value)} />
          <Input label="Business Account ID" value={businessId} onChange={e => setBusinessId(e.target.value)} />
        </div>
      </Card>

      <Card className="mb-6">
        <h2 className="font-overpass font-bold text-brand-blue mb-4">Mensajes Habilitados</h2>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded" />
            <span className="text-sm">Notificación de auditoría programada</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded" />
            <span className="text-sm">Recordatorio de documentos por vencer</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded" />
            <span className="text-sm">Certificado emitido</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded" />
            <span className="text-sm">Contacto marca-taller</span>
          </label>
        </div>
      </Card>

      <Card className="mb-6">
        <h2 className="font-overpass font-bold text-brand-blue mb-4">Test de Envío</h2>
        <div className="flex items-center gap-3">
          <Input placeholder="+54 9 11 ..." className="w-48" />
          <Button onClick={handleTest} disabled={testing}>{testing ? 'Enviando...' : 'Enviar Test'}</Button>
          {testResult === 'ok' && <span className="flex items-center gap-1 text-green-600 text-sm"><CheckCircle className="w-4 h-4" /> Enviado</span>}
          {testResult === 'error' && <span className="flex items-center gap-1 text-red-600 text-sm"><AlertTriangle className="w-4 h-4" /> Error</span>}
        </div>
      </Card>

      <Card className="mb-6">
        <h2 className="font-overpass font-bold text-brand-blue mb-3">Estado</h2>
        <div className="flex items-center gap-2">
          <Badge variant="warning">Pendiente</Badge>
          <span className="text-sm text-gray-500">No configurado</span>
        </div>
      </Card>

      <Button className="w-full">Guardar Configuración</Button>
    </div>
  )
}
