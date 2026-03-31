'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react'

export default function AdminIntegracionEmailPage() {
  const [apiKey, setApiKey] = useState('••••••••••••')
  const [fromEmail, setFromEmail] = useState('noreply@plataformatextil.ar')
  const [fromName, setFromName] = useState('Plataforma Digital Textil')
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

      <h1 className="font-overpass font-bold text-2xl text-brand-blue mb-1">Configuración SendGrid</h1>
      <p className="text-gray-500 text-sm mb-6">Envío de emails transaccionales y masivos</p>

      <Card className="mb-6">
        <h2 className="font-overpass font-bold text-brand-blue mb-4">API de SendGrid</h2>
        <div className="space-y-4">
          <Input label="API Key" type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} />
          <Input label="Email remitente" value={fromEmail} onChange={e => setFromEmail(e.target.value)} />
          <Input label="Nombre remitente" value={fromName} onChange={e => setFromName(e.target.value)} />
        </div>
      </Card>

      <Card className="mb-6">
        <h2 className="font-overpass font-bold text-brand-blue mb-4">Emails Habilitados</h2>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded" />
            <span className="text-sm">Bienvenida al registrarse</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded" />
            <span className="text-sm">Verificación de email</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded" />
            <span className="text-sm">Recuperar contraseña</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded" />
            <span className="text-sm">Certificado emitido</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded" />
            <span className="text-sm">Recordatorio de documentos por vencer</span>
          </label>
        </div>
      </Card>

      <Card className="mb-6">
        <h2 className="font-overpass font-bold text-brand-blue mb-4">Test de Envío</h2>
        <div className="flex items-center gap-3">
          <Button onClick={handleTest} disabled={testing}>{testing ? 'Enviando...' : 'Enviar Email de Prueba'}</Button>
          {testResult === 'ok' && <span className="flex items-center gap-1 text-green-600 text-sm"><CheckCircle className="w-4 h-4" /> Enviado correctamente</span>}
          {testResult === 'error' && <span className="flex items-center gap-1 text-red-600 text-sm"><AlertTriangle className="w-4 h-4" /> Error al enviar</span>}
        </div>
      </Card>

      <Card className="mb-6">
        <h2 className="font-overpass font-bold text-brand-blue mb-3">Estado</h2>
        <div className="flex items-center gap-2">
          <Badge variant="success">Activo</Badge>
          <span className="text-sm text-gray-500">Emails enviados este mes: 156</span>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button className="flex-1">Guardar Configuración</Button>
        <Link href="/admin/templates">
          <Button variant="secondary">Editar Templates</Button>
        </Link>
      </div>
    </div>
  )
}
