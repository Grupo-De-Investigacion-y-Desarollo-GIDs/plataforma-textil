'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/compartido/componentes/ui/card'
import { Button } from '@/compartido/componentes/ui/button'
import { Input } from '@/compartido/componentes/ui/input'
import { Badge } from '@/compartido/componentes/ui/badge'

export default function AdminConfiguracionPage() {
  const [tab, setTab] = useState<'general' | 'emails' | 'integraciones' | 'features'>('general')
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
  const [flagsE1, setFlagsE1] = useState<Record<string, boolean>>({})
  const [flagsE2, setFlagsE2] = useState<Record<string, boolean>>({})

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/config').then(r => r.json()),
      fetch('/api/admin/config?grupo=features_e1').then(r => r.json()),
      fetch('/api/admin/config?grupo=features_e2').then(r => r.json()),
    ]).then(([configData, e1Data, e2Data]) => {
      const configs = (configData.configs ?? configData) as { clave: string; valor: string }[]
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

      const e1Map: Record<string, boolean> = {}
      for (const c of ((e1Data.configs ?? []) as { clave: string; valor: string }[])) e1Map[c.clave] = c.valor === 'true'
      setFlagsE1(e1Map)

      const e2Map: Record<string, boolean> = {}
      for (const c of ((e2Data.configs ?? []) as { clave: string; valor: string }[])) e2Map[c.clave] = c.valor === 'true'
      setFlagsE2(e2Map)
    }).catch(() => {}).finally(() => setLoading(false))
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

  async function handleToggleFlag(clave: string, grupo: string, valor: boolean) {
    if (grupo === 'features_e1') setFlagsE1(prev => ({ ...prev, [clave]: valor }))
    else setFlagsE2(prev => ({ ...prev, [clave]: valor }))

    await fetch('/api/admin/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clave, valor: String(valor), grupo }),
    })
  }

  const flagLabels: Record<string, { label: string; desc: string }> = {
    registro_talleres: { label: 'Registro de talleres', desc: 'Permite que nuevos talleres se registren' },
    registro_marcas: { label: 'Registro de marcas', desc: 'Permite que nuevas marcas se registren' },
    directorio_publico: { label: 'Directorio publico', desc: 'Directorio visible sin login' },
    academia: { label: 'Academia', desc: 'Modulo de capacitacion y certificados' },
    formalizacion: { label: 'Formalizacion', desc: 'Checklist y upload de documentos' },
    dashboard_estado: { label: 'Dashboard Estado', desc: 'Acceso al panel del organismo publico' },
    denuncias: { label: 'Denuncias', desc: 'Formulario publico de denuncias anonimas' },
    publicacion_pedidos: { label: 'Publicacion de pedidos', desc: 'Marcas pueden publicar pedidos (E2)' },
    cotizaciones: { label: 'Cotizaciones', desc: 'Talleres pueden cotizar pedidos publicados (E2)' },
    acuerdos_pdf: { label: 'Acuerdos PDF', desc: 'Descarga de acuerdo de manufactura en PDF (E2)' },
    matching_notificaciones: { label: 'Notificaciones de matching', desc: 'Alertas automaticas a talleres compatibles (E2)' },
    asistente_rag: { label: 'Asistente IA', desc: 'Chat con asistente en la academia (E2)' },
  }

  const tabs = [
    { key: 'general' as const, label: 'General' },
    { key: 'emails' as const, label: 'Emails' },
    { key: 'integraciones' as const, label: 'Integraciones' },
    { key: 'features' as const, label: 'Features' },
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

      {tab === 'features' && (
        <>
          <Card className="mb-6">
            <h2 className="font-overpass font-bold text-brand-blue mb-4">Escenario 1 — Formalizacion</h2>
            <div className="space-y-3">
              {Object.entries(flagsE1).map(([clave, activo]) => (
                <label key={clave} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{flagLabels[clave]?.label ?? clave}</p>
                    <p className="text-xs text-gray-500">{flagLabels[clave]?.desc}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={activo ? 'success' : 'muted'}>{activo ? 'Activo' : 'Desactivado'}</Badge>
                    <input type="checkbox" checked={activo}
                      onChange={e => handleToggleFlag(clave, 'features_e1', e.target.checked)}
                      className="rounded accent-[var(--color-brand-blue)]" />
                  </div>
                </label>
              ))}
            </div>
          </Card>

          <Card className="mb-6">
            <h2 className="font-overpass font-bold text-brand-blue mb-4">Escenario 2 — Marketplace</h2>
            <div className="space-y-3">
              {Object.entries(flagsE2).map(([clave, activo]) => (
                <label key={clave} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{flagLabels[clave]?.label ?? clave}</p>
                    <p className="text-xs text-gray-500">{flagLabels[clave]?.desc}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={activo ? 'success' : 'muted'}>{activo ? 'Activo' : 'Desactivado'}</Badge>
                    <input type="checkbox" checked={activo}
                      onChange={e => handleToggleFlag(clave, 'features_e2', e.target.checked)}
                      className="rounded accent-[var(--color-brand-blue)]" />
                  </div>
                </label>
              ))}
            </div>
          </Card>
        </>
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
