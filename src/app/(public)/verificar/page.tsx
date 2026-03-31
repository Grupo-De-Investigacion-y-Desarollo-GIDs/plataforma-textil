'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, CheckCircle, XCircle, Award } from 'lucide-react'
import { Button, Input, Card } from '@/components/ui'

interface CertificadoResult {
  codigo: string
  taller: string
  coleccion: string
  fecha: string
  calificacion: number
  revocado: boolean
}

function VerificarContent() {
  const searchParams = useSearchParams()
  const [codigo, setCodigo] = useState(searchParams.get('code') ?? '')
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<CertificadoResult | null>(null)
  const [noEncontrado, setNoEncontrado] = useState(false)
  const [buscado, setBuscado] = useState(false)

  useEffect(() => {
    const code = searchParams.get('code')
    if (code) buscar(code)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function buscar(valor: string) {
    if (!valor.trim()) return
    setLoading(true)
    setResultado(null)
    setNoEncontrado(false)
    try {
      const res = await fetch(`/api/certificados/${encodeURIComponent(valor.trim())}`)
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
          <Award className="w-8 h-8 text-brand-blue" />
        </div>
        <h1 className="font-overpass font-bold text-3xl text-brand-blue mb-2">
          Verificar Certificado
        </h1>
        <p className="text-gray-600">
          Ingresá el código del certificado para verificar su autenticidad.
        </p>
      </div>

      <Card className="max-w-xl mx-auto">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ej: CERT-SST-2025-00001"
              label="Código del certificado"
            />
          </div>
          <div className="sm:self-end">
            <Button
              type="submit"
              loading={loading}
              icon={<Search className="w-4 h-4" />}
            >
              Verificar
            </Button>
          </div>
        </form>
      </Card>

      {buscado && resultado && !resultado.revocado && (
        <Card className="max-w-xl mx-auto mt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h2 className="font-overpass font-bold text-lg text-green-700 mb-1">
                Certificado Válido
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Este certificado es auténtico y se encuentra vigente.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Código</span>
                  <span className="font-semibold text-brand-blue">{resultado.codigo}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Taller</span>
                  <span className="font-semibold text-gray-900">{resultado.taller}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Curso</span>
                  <span className="font-semibold text-gray-900">{resultado.coleccion}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Fecha de emisión</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(resultado.fecha).toLocaleDateString('es-AR')}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Calificación</span>
                  <span className="font-semibold text-gray-900">{resultado.calificacion}%</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {buscado && resultado && resultado.revocado && (
        <Card className="max-w-xl mx-auto mt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h2 className="font-overpass font-bold text-lg text-red-700 mb-1">
                Certificado Revocado
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Este certificado fue revocado y ya no es válido.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Código</span>
                  <span className="font-semibold text-red-600">{resultado.codigo}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Taller</span>
                  <span className="font-semibold text-gray-900">{resultado.taller}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Curso</span>
                  <span className="font-semibold text-gray-900">{resultado.coleccion}</span>
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
                Certificado no encontrado
              </h2>
              <p className="text-sm text-gray-500">
                No se encontró ningún certificado con el código ingresado. Verificá que el código sea correcto e intentá de nuevo.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default function VerificarPage() {
  return (
    <Suspense>
      <VerificarContent />
    </Suspense>
  )
}
