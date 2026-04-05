'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Shield, XCircle } from 'lucide-react'
import { Button, Input, Card } from '@/compartido/componentes/ui'

const estadoLabel: Record<string, string> = {
  RECIBIDA: 'Recibida — en espera de revision',
  EN_INVESTIGACION: 'En investigacion',
  RESUELTA: 'Resuelta',
  DESESTIMADA: 'Desestimada',
}

const estadoColor: Record<string, string> = {
  RECIBIDA: 'text-yellow-700',
  EN_INVESTIGACION: 'text-blue-700',
  RESUELTA: 'text-green-700',
  DESESTIMADA: 'text-gray-500',
}

interface DenunciaResult {
  codigo: string
  tipo: string
  estado: string
  createdAt: string
  anonima: boolean
}

function ConsultarContent() {
  const searchParams = useSearchParams()
  const [codigo, setCodigo] = useState(searchParams.get('codigo') ?? '')
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<DenunciaResult | null>(null)
  const [noEncontrado, setNoEncontrado] = useState(false)
  const [buscado, setBuscado] = useState(false)

  useEffect(() => {
    const code = searchParams.get('codigo')
    if (code) buscar(code)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function buscar(valor: string) {
    if (!valor.trim()) return
    setLoading(true)
    setResultado(null)
    setNoEncontrado(false)
    try {
      const res = await fetch(`/api/denuncias/${encodeURIComponent(valor.trim())}`)
      if (res.ok) setResultado(await res.json())
      else setNoEncontrado(true)
    } catch {
      setNoEncontrado(true)
    } finally {
      setLoading(false)
      setBuscado(true)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await buscar(codigo)
  }

  return (
    <div>
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-brand-blue/10 flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-brand-blue" />
        </div>
        <h1 className="font-overpass font-bold text-3xl text-brand-blue mb-2">Consultar denuncia</h1>
        <p className="text-gray-600">Ingresa el codigo de tu denuncia para ver su estado.</p>
      </div>

      <Card className="max-w-xl mx-auto">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ej: DEN-2026-00001"
              label="Codigo de denuncia"
            />
          </div>
          <div className="sm:self-end">
            <Button type="submit" loading={loading} icon={<Search className="w-4 h-4" />}>
              Consultar
            </Button>
          </div>
        </form>
      </Card>

      {buscado && resultado && (
        <Card className="max-w-xl mx-auto mt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6 text-brand-blue" />
            </div>
            <div className="flex-1">
              <h2 className="font-overpass font-bold text-lg text-brand-blue mb-1">
                Denuncia encontrada
              </h2>
              <div className="space-y-2 text-sm mt-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Codigo</span>
                  <span className="font-semibold text-brand-blue">{resultado.codigo}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Tipo</span>
                  <span className="font-semibold text-gray-900">{resultado.tipo}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Estado</span>
                  <span className={`font-semibold ${estadoColor[resultado.estado] ?? 'text-gray-900'}`}>
                    {estadoLabel[resultado.estado] ?? resultado.estado}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Fecha de recepcion</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(resultado.createdAt).toLocaleDateString('es-AR')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {buscado && noEncontrado && (
        <Card className="max-w-xl mx-auto mt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="font-overpass font-bold text-lg text-red-700 mb-1">
                Denuncia no encontrada
              </h2>
              <p className="text-sm text-gray-500">
                No se encontro ninguna denuncia con ese codigo. Verifica que sea correcto e intenta de nuevo.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default function ConsultarDenunciaPage() {
  return (
    <Suspense>
      <ConsultarContent />
    </Suspense>
  )
}
