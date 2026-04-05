'use client'

import Link from 'next/link'
import { Card } from '@/compartido/componentes/ui/card'
import { Input } from '@/compartido/componentes/ui/input'
import { Badge } from '@/compartido/componentes/ui/badge'
import { ArrowLeft, AlertTriangle } from 'lucide-react'

export default function AdminIntegracionEmailPage() {
  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <Link href="/admin/integraciones" className="inline-flex items-center gap-1 text-sm text-brand-blue hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Volver a integraciones
      </Link>

      <h1 className="font-overpass font-bold text-2xl text-brand-blue mb-1">Configuracion SendGrid</h1>
      <p className="text-gray-500 text-sm mb-6">Envio de emails transaccionales y masivos</p>

      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-800">Configuracion en construccion</p>
          <p className="text-xs text-amber-600 mt-0.5">
            Esta pantalla no guarda cambios todavia. SendGrid ya esta configurado via variables de entorno.
          </p>
        </div>
      </div>

      <Card className="mb-6 opacity-50">
        <h2 className="font-overpass font-bold text-brand-blue mb-4">API de SendGrid</h2>
        <div className="space-y-4">
          <Input label="API Key" type="password" value="............" disabled onChange={() => {}} />
          <Input label="Email remitente" value="noreply@plataformatextil.ar" disabled onChange={() => {}} />
          <Input label="Nombre remitente" value="Plataforma Digital Textil" disabled onChange={() => {}} />
        </div>
      </Card>

      <Card className="mb-6 opacity-50">
        <h2 className="font-overpass font-bold text-brand-blue mb-4">Emails Habilitados</h2>
        <div className="space-y-2">
          {['Bienvenida al registrarse', 'Verificacion de email', 'Recuperar contrasena', 'Certificado emitido', 'Recordatorio de documentos por vencer'].map(label => (
            <label key={label} className="flex items-center gap-2">
              <input type="checkbox" defaultChecked disabled className="rounded" />
              <span className="text-sm text-gray-400">{label}</span>
            </label>
          ))}
        </div>
      </Card>

      <Card className="mb-6">
        <h2 className="font-overpass font-bold text-brand-blue mb-3">Estado</h2>
        <div className="flex items-center gap-2">
          <Badge variant="success">Activo</Badge>
          <span className="text-sm text-gray-500">Configurado via variables de entorno</span>
        </div>
      </Card>
    </div>
  )
}
