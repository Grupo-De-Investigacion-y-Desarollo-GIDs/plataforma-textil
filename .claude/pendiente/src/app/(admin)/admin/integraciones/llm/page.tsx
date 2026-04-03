'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'

export default function AdminIntegracionLlmPage() {
  const [provider, setProvider] = useState('openai')
  const [apiKey, setApiKey] = useState('••••••••••••')
  const [modelo, setModelo] = useState('gpt-4o-mini')
  const [maxTokens, setMaxTokens] = useState('500')
  const [systemPrompt, setSystemPrompt] = useState('Sos un asistente de la Plataforma Digital Textil. Ayudás a talleres con preguntas sobre formalización, trámites y capacitación.')

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <Link href="/admin/integraciones" className="inline-flex items-center gap-1 text-sm text-brand-blue hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Volver a integraciones
      </Link>

      <h1 className="font-overpass font-bold text-2xl text-brand-blue mb-1">Configuración LLM</h1>
      <p className="text-gray-500 text-sm mb-6">Asistente virtual con IA para talleres</p>

      <Card className="mb-6">
        <h2 className="font-overpass font-bold text-brand-blue mb-4">Proveedor</h2>
        <div className="space-y-4">
          <Select label="Proveedor de IA" value={provider} onChange={e => setProvider(e.target.value)}
            options={[{ value: 'openai', label: 'OpenAI' }, { value: 'anthropic', label: 'Anthropic' }, { value: 'local', label: 'Modelo local' }]} />
          <Input label="API Key" type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} />
          <Select label="Modelo" value={modelo} onChange={e => setModelo(e.target.value)}
            options={[
              { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
              { value: 'gpt-4o', label: 'GPT-4o' },
              { value: 'claude-sonnet-4-5-20250929', label: 'Claude Sonnet 4.5' },
            ]} />
          <Input label="Max tokens por respuesta" type="number" value={maxTokens} onChange={e => setMaxTokens(e.target.value)} />
        </div>
      </Card>

      <Card className="mb-6">
        <h2 className="font-overpass font-bold text-brand-blue mb-4">System Prompt</h2>
        <textarea value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} rows={5}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent" />
      </Card>

      <Card className="mb-6">
        <h2 className="font-overpass font-bold text-brand-blue mb-4">Configuración del Chatbot</h2>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded" />
            <span className="text-sm">Habilitar chatbot en pantallas de aprendizaje</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded" />
            <span className="text-sm">Habilitar chatbot en todo el sitio</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded" />
            <span className="text-sm">Registrar conversaciones en logs</span>
          </label>
        </div>
      </Card>

      <Button className="w-full">Guardar Configuración</Button>
    </div>
  )
}
