'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/compartido/componentes/ui/card'
import { Button } from '@/compartido/componentes/ui/button'
import { Input } from '@/compartido/componentes/ui/input'

export default function AdminConfiguracionPage() {
  const [tab, setTab] = useState<'general' | 'emails' | 'integraciones'>('general')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [nombrePlataforma, setNombrePlataforma] = useState('')
  const [emailSoporte, setEmailSoporte] = useState('')
  const [whatsappSoporte, setWhatsappSoporte] = useState('')
  const [permitirTalleres, setPermitirTalleres] = useState(true)
  const [permitirMarcas, setPermitirMarcas] = useState(true)
  const [requiereAprobacion, setRequiereAprobacion] = useState(false)
  const [prefijoCertificado, setPrefijoCertificado] = useState('')
  const [institucionFirma, setInstitucionFirma] = useState('')

  useEffect(() => {
    fetch('/api/admin/config')
      .then(r => r.json())
      .then((configs: { clave: string; valor: string }[]) => {
        const map: Record<string, string> = {}
        configs.forEach(c => { map[c.clave] = c.valor })
        if (map['nombre_plataforma']) setNombrePlataforma(map['nombre_plataforma'])
        if (map['email_soporte']) setEmailSoporte(map['email_soporte'])
        if (map['whatsapp_soporte']) setWhatsappSoporte(map['whatsapp_soporte'])
        if (map['permitir_talleres'] !== undefined) setPermitirTalleres(map['permitir_talleres'] !== 'false')
        if (map['permitir_marcas'] !== undefined) setPermitirMarcas(map['permitir_marcas'] !== 'false')
        if (map['requiere_aprobacion'] !== undefined) setRequiereAprobacion(map['requiere_aprobacion'] === 'true')
        if (map['prefijo_certificado']) setPrefijoCertificado(map['prefijo_certificado'])
        if (map['institucion_firma']) setInstitucionFirma(map['institucion_firma'])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      const configs = [
        { clave: 'nombre_plataforma', valor: nombrePlataforma, grupo: 'general' },
        { clave: 'email_soporte', valor: emailSoporte, grupo: 'general' },
        { clave: 'whatsapp_soporte', valor: whatsappSoporte, grupo: 'general' },
        { clave: 'permitir_talleres', valor: String(permitirTalleres), grupo: 'registro' },
        { clave: 'permitir_marcas', valor: String(permitirMarcas), grupo: 'registro' },
        { clave: 'requiere_aprobacion', valor: String(requiereAprobacion), grupo: 'registro' },
        { clave: 'prefijo_certificado', valor: prefijoCertificado, grupo: 'certificados' },
        { clave: 'institucion_firma', valor: institucionFirma, grupo: 'certificados' },
      ]
      for (const config of configs) {
        await fetch('/api/admin/config', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config),
        })
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
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

      {loading && (
        <div className="space-y-4 mb-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

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

      <Button onClick={handleSave} disabled={saving || loading} className="w-full">
        {saving ? 'Guardando...' : 'Guardar Configuracion'}
      </Button>

      {saved && (
        <p className="text-sm text-green-600 text-center mt-3 font-medium">Configuracion guardada correctamente</p>
      )}
    </div>
  )
}
