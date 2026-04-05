'use client'
import { useState } from 'react'
import { Shield, CheckCircle } from 'lucide-react'
import { Button } from '@/compartido/componentes/ui/button'
import { Card } from '@/compartido/componentes/ui/card'

const TIPOS_DENUNCIA = [
  'Trabajo no registrado',
  'Trabajo infantil',
  'Condiciones insalubres',
  'No pago de salarios',
  'Acoso laboral',
  'Incumplimiento de normas de seguridad',
  'Otro',
]

export default function DenunciarPage() {
  const [tipo, setTipo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState<{ codigo: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleEnviar() {
    if (!tipo || !descripcion || descripcion.length < 20) {
      setError('Completa el tipo y la descripcion (minimo 20 caracteres)')
      return
    }
    setEnviando(true)
    setError(null)
    try {
      const res = await fetch('/api/denuncias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, descripcion, anonima: true }),
      })
      if (!res.ok) throw new Error('Error al enviar')
      const data = await res.json()
      setResultado({ codigo: data.codigo })
    } catch {
      setError('Ocurrio un error al enviar la denuncia. Intenta de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  if (resultado) {
    return (
      <div>
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="font-overpass font-bold text-3xl text-green-700 mb-2">Denuncia recibida</h1>
          <p className="text-gray-600">Tu denuncia fue registrada de forma anonima.</p>
        </div>
        <Card className="max-w-md mx-auto">
          <p className="text-sm text-gray-600 mb-3">
            Guarda este codigo para consultar el estado de tu denuncia:
          </p>
          <div className="bg-brand-blue/10 rounded-lg px-4 py-3 text-center">
            <p className="text-xl font-bold font-overpass text-brand-blue">{resultado.codigo}</p>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Podes consultar el estado en{' '}
            <a href="/consultar-denuncia" className="text-brand-blue underline">
              consultar-denuncia
            </a>
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-brand-blue/10 flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-brand-blue" />
        </div>
        <h1 className="font-overpass font-bold text-3xl text-brand-blue mb-2">Hacer una denuncia</h1>
        <p className="text-gray-600">Tu denuncia es anonima. Nadie sabra quien la realizo.</p>
      </div>

      <Card className="max-w-md mx-auto">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Tipo de situacion</label>
            <select value={tipo} onChange={e => setTipo(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">Selecciona el tipo...</option>
              {TIPOS_DENUNCIA.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Descripcion</label>
            <textarea
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              placeholder="Describi la situacion con el mayor detalle posible..."
              rows={5}
              maxLength={500}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            />
            <p className="text-xs text-gray-400 mt-1">{descripcion.length}/500 caracteres — minimo 20</p>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <Button onClick={handleEnviar} disabled={enviando} className="w-full">
            {enviando ? 'Enviando...' : 'Enviar denuncia de forma anonima'}
          </Button>

          <p className="text-xs text-gray-400 text-center">
            Esta denuncia sera revisada por el equipo de la Plataforma Digital Textil y los organismos competentes.
          </p>
        </div>
      </Card>
    </div>
  )
}
