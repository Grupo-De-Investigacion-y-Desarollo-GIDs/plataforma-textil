'use client'
import { useState } from 'react'
import { MessageSquarePlus, X, Send, Loader2, CheckCircle } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

const TIPOS = [
  { value: 'bug', label: '🐛 Algo no funciona', color: 'text-red-600' },
  { value: 'mejora', label: '✨ Podria mejorar', color: 'text-blue-600' },
  { value: 'falta', label: '🔍 Me falta algo', color: 'text-amber-600' },
  { value: 'confusion', label: '😕 No entendi como usar esto', color: 'text-purple-600' },
]

function parsearEntidad(pathname: string): { entidad: string; id: string } | null {
  const patrones = [
    { regex: /\/taller\/pedidos\/disponibles\/([^/]+)/, entidad: 'pedido_disponible' },
    { regex: /\/taller\/pedidos\/([^/]+)/, entidad: 'pedido' },
    { regex: /\/taller\/aprender\/([^/]+)/, entidad: 'coleccion' },
    { regex: /\/marca\/directorio\/([^/]+)/, entidad: 'taller' },
    { regex: /\/marca\/pedidos\/([^/]+)/, entidad: 'pedido' },
    { regex: /\/admin\/talleres\/([^/]+)/, entidad: 'taller' },
    { regex: /\/admin\/marcas\/([^/]+)/, entidad: 'marca' },
    { regex: /\/admin\/auditorias\/([^/]+)/, entidad: 'auditoria' },
  ]
  for (const { regex, entidad } of patrones) {
    const match = pathname.match(regex)
    if (match) return { entidad, id: match[1] }
  }
  return null
}

const ROLES_AUDITOR = [
  { value: 'TALLER_BRONCE', label: 'Taller Bronce' },
  { value: 'TALLER_PLATA', label: 'Taller Plata' },
  { value: 'TALLER_ORO', label: 'Taller Oro' },
  { value: 'MARCA', label: 'Marca' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'ESTADO', label: 'Estado' },
  { value: 'SIN_LOGIN', label: 'Sin login / visitante' },
]

export function FeedbackWidget() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const autenticado = !!session?.user
  const [abierto, setAbierto] = useState(false)
  const [tipo, setTipo] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [auditorNombre, setAuditorNombre] = useState('')
  const [auditorRol, setAuditorRol] = useState('SIN_LOGIN')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const entidadParseada = parsearEntidad(pathname)

  async function handleEnviar() {
    if (!tipo || mensaje.length < 10) {
      setError('Elegi un tipo y escribi al menos 10 caracteres')
      return
    }
    if (!autenticado && auditorNombre.trim().length < 2) {
      setError('Ingresa tu nombre (al menos 2 caracteres)')
      return
    }
    setEnviando(true)
    setError(null)
    try {
      const body: Record<string, unknown> = {
        tipo,
        mensaje,
        pagina: pathname,
        entidad: entidadParseada?.entidad ?? null,
        entidadId: entidadParseada?.id ?? null,
      }
      if (!autenticado) {
        body.auditorNombre = auditorNombre.trim()
        body.auditorRol = auditorRol
      }
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error()
      setEnviado(true)
      setTimeout(() => {
        setAbierto(false)
        setEnviado(false)
        setTipo('')
        setMensaje('')
        setAuditorNombre('')
        setAuditorRol('SIN_LOGIN')
      }, 2000)
    } catch {
      setError('Error al enviar. Intenta de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {abierto && (
        <div className="mb-3 w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-brand-blue">
            <span className="text-white text-sm font-medium font-overpass">Contanos tu experiencia</span>
            <button onClick={() => setAbierto(false)} className="text-white/80 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {enviado ? (
            <div className="p-6 text-center">
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-800">Gracias por tu feedback!</p>
              <p className="text-xs text-gray-500 mt-1">Lo revisaremos pronto</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {!autenticado && (
                <div className="space-y-2 pb-3 border-b border-gray-100">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tu nombre *</label>
                    <input
                      value={auditorNombre}
                      onChange={e => setAuditorNombre(e.target.value)}
                      placeholder="Nombre y apellido"
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Rol que estás probando</label>
                    <select
                      value={auditorRol}
                      onChange={e => setAuditorRol(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                    >
                      {ROLES_AUDITOR.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                {TIPOS.map(t => (
                  <button key={t.value} onClick={() => setTipo(t.value)}
                    className={`text-left px-3 py-2 rounded-lg border text-xs transition-colors ${
                      tipo === t.value ? 'border-brand-blue bg-brand-blue/5' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <span className={t.color}>{t.label}</span>
                  </button>
                ))}
              </div>
              <textarea value={mensaje} onChange={e => setMensaje(e.target.value)}
                placeholder="Describi lo que paso o lo que necesitas..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue/30" />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button onClick={handleEnviar} disabled={enviando}
                className="w-full flex items-center justify-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-blue/90 disabled:opacity-50">
                {enviando ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                {enviando ? 'Enviando...' : 'Enviar feedback'}
              </button>
              <p className="text-xs text-gray-400 text-center">Pagina: {pathname}</p>
              {entidadParseada && (
                <p className="text-xs text-gray-400 text-center">
                  Entidad: <span className="font-medium">{entidadParseada.entidad}</span> {entidadParseada.id.slice(0, 8)}...
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <button onClick={() => setAbierto(!abierto)}
        className="flex items-center gap-2 bg-brand-blue text-white px-4 py-2.5 rounded-full shadow-lg hover:bg-brand-blue/90 transition-colors">
        <MessageSquarePlus className="w-4 h-4" />
        <span className="text-sm font-medium">Feedback</span>
      </button>
    </div>
  )
}
