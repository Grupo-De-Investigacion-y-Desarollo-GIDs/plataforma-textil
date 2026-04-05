'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/compartido/componentes/ui/card'
import { Button } from '@/compartido/componentes/ui/button'
import { Input } from '@/compartido/componentes/ui/input'
import { Select } from '@/compartido/componentes/ui/select'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'

interface Config {
  clave: string
  valor: string
}

interface DocRAG {
  id: string
  titulo: string
  categoria: string
  activo: boolean
  createdAt: string
}

export default function AdminIntegracionLlmPage() {
  const [provider, setProvider] = useState('anthropic')
  const [modelo, setModelo] = useState('claude-haiku-4-5-20251001')
  const [maxTokens, setMaxTokens] = useState('500')
  const [systemPrompt, setSystemPrompt] = useState('Sos un asistente de la Plataforma Digital Textil. Ayudas a talleres con preguntas sobre formalizacion, tramites y capacitacion.')
  const [enabled, setEnabled] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Documentos RAG
  const [documentos, setDocumentos] = useState<DocRAG[]>([])
  const [nuevoTitulo, setNuevoTitulo] = useState('')
  const [nuevoContenido, setNuevoContenido] = useState('')
  const [nuevoCategoria, setNuevoCategoria] = useState('plataforma')
  const [agregando, setAgregando] = useState(false)

  // Cargar config al montar
  useEffect(() => {
    fetch('/api/admin/config?grupo=llm')
      .then(r => r.json())
      .then((d: { configs?: Config[] }) => {
        const configs = d.configs || []
        const get = (clave: string) => configs.find(c => c.clave === clave)?.valor
        if (get('llm_provider')) setProvider(get('llm_provider')!)
        if (get('llm_model')) setModelo(get('llm_model')!)
        if (get('llm_max_tokens')) setMaxTokens(get('llm_max_tokens')!)
        if (get('llm_system_prompt')) setSystemPrompt(get('llm_system_prompt')!)
        if (get('llm_enabled')) setEnabled(get('llm_enabled') === 'true')
      })
      .catch(() => {})

    fetch('/api/admin/rag')
      .then(r => r.json())
      .then((d: { documentos?: DocRAG[] }) => setDocumentos(d.documentos || []))
      .catch(() => {})
  }, [])

  async function guardarConfig() {
    setSaving(true)
    setSaved(false)
    const configs = [
      { clave: 'llm_provider', valor: provider, grupo: 'llm' },
      { clave: 'llm_model', valor: modelo, grupo: 'llm' },
      { clave: 'llm_max_tokens', valor: maxTokens, grupo: 'llm' },
      { clave: 'llm_system_prompt', valor: systemPrompt, grupo: 'llm' },
      { clave: 'llm_enabled', valor: String(enabled), grupo: 'llm' },
    ]
    for (const c of configs) {
      await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(c),
      })
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  async function agregarDocumento() {
    if (!nuevoTitulo.trim() || !nuevoContenido.trim()) return
    setAgregando(true)
    try {
      const res = await fetch('/api/admin/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: nuevoTitulo, contenido: nuevoContenido, categoria: nuevoCategoria }),
      })
      if (res.ok) {
        const doc = await res.json()
        setDocumentos(prev => [{ ...doc, activo: true, createdAt: new Date().toISOString() }, ...prev])
        setNuevoTitulo('')
        setNuevoContenido('')
      }
    } catch { /* ignore */ }
    setAgregando(false)
  }

  async function desactivarDocumento(id: string) {
    await fetch(`/api/admin/rag/${id}`, { method: 'DELETE' })
    setDocumentos(prev => prev.map(d => d.id === id ? { ...d, activo: false } : d))
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <Link href="/admin/integraciones" className="inline-flex items-center gap-1 text-sm text-brand-blue hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Volver a integraciones
      </Link>

      <h1 className="font-overpass font-bold text-2xl text-brand-blue mb-1">Configuracion LLM</h1>
      <p className="text-gray-500 text-sm mb-6">Asistente virtual con IA para talleres</p>

      <Card className="mb-6">
        <h2 className="font-overpass font-bold text-brand-blue mb-4">Proveedor</h2>
        <div className="space-y-4">
          <Select label="Proveedor de IA" value={provider} onChange={e => setProvider(e.target.value)}
            options={[{ value: 'anthropic', label: 'Anthropic' }, { value: 'openai', label: 'OpenAI' }]} />
          <Select label="Modelo" value={modelo} onChange={e => setModelo(e.target.value)}
            options={[
              { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' },
              { value: 'claude-sonnet-4-5-20250929', label: 'Claude Sonnet 4.5' },
            ]} />
          <Input label="Max tokens por respuesta" type="number" value={maxTokens} onChange={e => setMaxTokens(e.target.value)} />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} className="rounded" />
            <span className="text-sm">Habilitar asistente</span>
          </label>
        </div>
      </Card>

      <Card className="mb-6">
        <h2 className="font-overpass font-bold text-brand-blue mb-4">System Prompt</h2>
        <textarea value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} rows={5}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent" />
      </Card>

      <Button onClick={guardarConfig} loading={saving} className="w-full mb-6">
        {saved ? 'Guardado' : 'Guardar Configuracion'}
      </Button>

      {/* Documentos del corpus */}
      <Card>
        <h2 className="font-overpass font-bold text-brand-blue mb-4">Documentos del corpus ({documentos.length})</h2>

        {/* Agregar documento */}
        <div className="space-y-3 mb-4 pb-4 border-b border-gray-100">
          <Input label="Titulo" value={nuevoTitulo} onChange={e => setNuevoTitulo(e.target.value)} placeholder="Ej: Como obtener el CUIT" />
          <textarea value={nuevoContenido} onChange={e => setNuevoContenido(e.target.value)} rows={3} placeholder="Contenido del documento..."
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent" />
          <Select label="Categoria" value={nuevoCategoria} onChange={e => setNuevoCategoria(e.target.value)}
            options={[
              { value: 'formalizacion', label: 'Formalizacion' },
              { value: 'tramites', label: 'Tramites' },
              { value: 'plataforma', label: 'Plataforma' },
              { value: 'capacitacion', label: 'Capacitacion' },
            ]} />
          <Button onClick={agregarDocumento} loading={agregando} size="sm" icon={<Plus className="w-4 h-4" />}>
            Agregar documento
          </Button>
        </div>

        {/* Lista */}
        {documentos.length === 0 ? (
          <p className="text-sm text-gray-500">No hay documentos en el corpus.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {documentos.map(doc => (
              <div key={doc.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold ${doc.activo ? '' : 'text-gray-400 line-through'}`}>{doc.titulo}</p>
                  <p className="text-xs text-gray-400">{doc.categoria} · {new Date(doc.createdAt).toLocaleDateString('es-AR')}</p>
                </div>
                {doc.activo && (
                  <button onClick={() => desactivarDocumento(doc.id)} className="p-1 hover:bg-red-50 rounded" title="Desactivar">
                    <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
