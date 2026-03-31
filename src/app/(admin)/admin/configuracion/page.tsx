'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function AdminConfiguracionPage() {
  const [tab, setTab] = useState<'general' | 'emails' | 'integraciones'>('general')
  const [saving, setSaving] = useState(false)

  const [nombrePlataforma, setNombrePlataforma] = useState('Plataforma Digital Textil')
  const [emailSoporte, setEmailSoporte] = useState('soporte@plataformatextil.ar')
  const [whatsappSoporte, setWhatsappSoporte] = useState('+54 11 1234-5678')
  const [permitirTalleres, setPermitirTalleres] = useState(true)
  const [permitirMarcas, setPermitirMarcas] = useState(true)
  const [requiereAprobacion, setRequiereAprobacion] = useState(false)
  const [prefijoCertificado, setPrefijoCertificado] = useState('PDT-CERT-')
  const [institucionFirma, setInstitucionFirma] = useState('OIT Argentina - UNTREF')

  async function handleSave() {
    setSaving(true)
    try {
      const configs = [
        { clave: 'nombre_plataforma', valor: nombrePlataforma },
        { clave: 'email_soporte', valor: emailSoporte },
        { clave: 'whatsapp_soporte', valor: whatsappSoporte },
        { clave: 'permitir_talleres', valor: String(permitirTalleres) },
        { clave: 'permitir_marcas', valor: String(permitirMarcas) },
        { clave: 'requiere_aprobacion', valor: String(requiereAprobacion) },
        { clave: 'prefijo_certificado', valor: prefijoCertificado },
        { clave: 'institucion_firma', valor: institucionFirma },
      ]
      for (const config of configs) {
        await fetch('/api/admin/config', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config),
        })
      }
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { key: 'general' as const, label: 'General' },
    { key: 'emails' as const, label: 'Emails' },
    { key: 'integraciones' as const, label: 'Integraciones' },
  ]

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <h1 className="font-overpass font-bold text-2xl text-brand-blue mb-1">Configuración General</h1>
      <p className="text-gray-500 text-sm mb-6">Parámetros del sistema</p>

      <div className="flex gap-2 mb-6">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === t.key ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'general' && (
        <>
          <Card className="mb-6">
            <h2 className="font-overpass font-bold text-brand-blue mb-4">Información de la Plataforma</h2>
            <div className="space-y-4">
              <Input label="Nombre de la plataforma" value={nombrePlataforma} onChange={e => setNombrePlataforma(e.target.value)} />
              <Input label="Email de soporte" value={emailSoporte} onChange={e => setEmailSoporte(e.target.value)} />
              <Input label="WhatsApp de soporte" value={whatsappSoporte} onChange={e => setWhatsappSoporte(e.target.value)} />
            </div>
          </Card>

          <Card className="mb-6">
            <h2 className="font-overpass font-bold text-brand-blue mb-4">Registro de Usuarios</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={permitirTalleres} onChange={e => setPermitirTalleres(e.target.checked)} className="rounded" />
                <span className="text-sm">Permitir registro de nuevos talleres</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={permitirMarcas} onChange={e => setPermitirMarcas(e.target.checked)} className="rounded" />
                <span className="text-sm">Permitir registro de nuevas marcas</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={requiereAprobacion} onChange={e => setRequiereAprobacion(e.target.checked)} className="rounded" />
                <span className="text-sm">Requiere aprobación manual de nuevos registros</span>
              </label>
            </div>
          </Card>

          <Card className="mb-6">
            <h2 className="font-overpass font-bold text-brand-blue mb-4">Certificados</h2>
            <div className="space-y-4">
              <Input label="Prefijo de código de certificado" value={prefijoCertificado} onChange={e => setPrefijoCertificado(e.target.value)} />
              <Input label="Institución que firma certificados" value={institucionFirma} onChange={e => setInstitucionFirma(e.target.value)} />
            </div>
          </Card>
        </>
      )}

      {tab === 'emails' && (
        <Card className="mb-6">
          <h2 className="font-overpass font-bold text-brand-blue mb-4">Configuración de Email</h2>
          <p className="text-sm text-gray-500">Configurá los proveedores de email en <a href="/admin/integraciones/email" className="text-brand-blue hover:underline">Integraciones - Email</a></p>
        </Card>
      )}

      {tab === 'integraciones' && (
        <Card className="mb-6">
          <h2 className="font-overpass font-bold text-brand-blue mb-4">Integraciones</h2>
          <p className="text-sm text-gray-500">Configurá las integraciones externas en <a href="/admin/integraciones" className="text-brand-blue hover:underline">Integraciones</a></p>
        </Card>
      )}

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? 'Guardando...' : 'Guardar Configuración'}
      </Button>
    </div>
  )
}
