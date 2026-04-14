'use client'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import Link from 'next/link'
import { MessageCircle, ChevronDown, ChevronUp, Send, Loader2 } from 'lucide-react'

export function AsistenteChat() {
  const [abierto, setAbierto] = useState(false)
  const [pregunta, setPregunta] = useState('')
  const [respuesta, setRespuesta] = useState<string | null>(null)
  const [fuentes, setFuentes] = useState<string[]>([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [noDisponible, setNoDisponible] = useState(false)

  async function handlePreguntar() {
    if (!pregunta.trim() || pregunta.length < 10) {
      setError('La pregunta debe tener al menos 10 caracteres')
      return
    }
    setCargando(true)
    setError(null)
    setRespuesta(null)
    setFuentes([])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pregunta }),
      })
      if (!res.ok) {
        const data = await res.json()
        const esPermanente =
          data.error === 'Asistente no disponible' ||
          data.error === 'El asistente está deshabilitado temporalmente'
        if (esPermanente) {
          setNoDisponible(true)
        } else {
          setError(data.error ?? 'Error al consultar el asistente')
        }
        return
      }
      const data = await res.json()
      setRespuesta(data.respuesta)
      setFuentes(data.fuentes ?? [])
    } catch {
      setError('Error de conexion. Intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="mt-8 border border-brand-blue/20 rounded-xl overflow-hidden">
      <button
        onClick={() => setAbierto(!abierto)}
        className="w-full flex items-center justify-between px-4 py-3 bg-brand-blue/5 hover:bg-brand-blue/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-brand-blue" />
          <span className="text-sm font-medium text-brand-blue font-overpass">
            ¿Tenes dudas? Pregunta al asistente
          </span>
        </div>
        {abierto ? (
          <ChevronUp className="w-4 h-4 text-brand-blue" />
        ) : (
          <ChevronDown className="w-4 h-4 text-brand-blue" />
        )}
      </button>

      {abierto && (
        noDisponible ? (
          <div className="p-4 text-center">
            <MessageCircle className="w-6 h-6 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              El asistente no está disponible en este momento.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Para consultas escribí a soporte@plataformatextil.ar
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={pregunta}
                onChange={e => setPregunta(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !cargando && handlePreguntar()}
                placeholder="Ej: ¿Como calculo el SAM de una remera?"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                disabled={cargando}
                maxLength={500}
              />
              <button
                onClick={handlePreguntar}
                disabled={cargando || !pregunta.trim()}
                className="bg-brand-blue text-white px-3 py-2 rounded-lg hover:bg-brand-blue/90 disabled:opacity-50 transition-colors"
              >
                {cargando ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            {respuesta && (
              <div className="space-y-2">
                <div className="bg-slate-50 rounded-lg px-4 py-3 text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      a: ({ href, children }) => {
                        const isInternal = href?.startsWith('/')
                        if (isInternal) {
                          return (
                            <Link
                              href={href!}
                              className="text-brand-blue underline font-medium hover:text-brand-blue/80"
                            >
                              {children}
                            </Link>
                          )
                        }
                        return (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-blue underline font-medium"
                          >
                            {children}
                          </a>
                        )
                      },
                    }}
                  >
                    {respuesta}
                  </ReactMarkdown>
                </div>
                {fuentes.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs text-gray-400">Fuentes:</span>
                    {fuentes.map((f, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {cargando && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Consultando al asistente...</span>
              </div>
            )}

            <p className="text-xs text-gray-400">
              El asistente responde basandose en el contenido de la plataforma. Para consultas especificas escribi a soporte@plataformatextil.ar
            </p>
          </div>
        )
      )}
    </div>
  )
}
