'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from './ui/button'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
  contexto?: 'admin' | 'taller' | 'marca' | 'estado' | 'contenido' | 'publico'
}

export function ErrorPage({ error, reset, contexto = 'publico' }: Props) {
  useEffect(() => {
    fetch('/api/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contexto,
        digest: error.digest,
        mensaje: error.message,
        ruta: window.location.pathname,
      })
    }).catch(() => {})
  }, [error, contexto])

  const rutaInicio = {
    admin: '/admin',
    taller: '/taller',
    marca: '/marca',
    estado: '/estado',
    contenido: '/admin/contenido',
    publico: '/',
  }[contexto]

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border rounded-lg shadow-sm p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl text-amber-600">!</span>
        </div>

        <h1 className="font-overpass font-semibold text-xl mb-2">
          Algo salio mal
        </h1>

        <p className="text-sm text-zinc-600 mb-6">
          Tuvimos un problema cargando esta pagina. Ya se lo notificamos al equipo.
        </p>

        {error.digest && (
          <p className="text-xs text-zinc-400 mb-4 font-mono">
            Codigo de error: {error.digest}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <Button onClick={reset} variant="primary">
            Intentar de nuevo
          </Button>

          <Link href={rutaInicio}>
            <Button variant="ghost" className="w-full">
              Volver al inicio
            </Button>
          </Link>
        </div>

        <p className="text-xs text-zinc-500 mt-6">
          Si el problema persiste, podes{' '}
          <button
            onClick={() => abrirFeedback(error.digest)}
            className="underline text-brand-blue hover:text-blue-800"
          >
            reportarlo aca
          </button>
        </p>
      </div>
    </div>
  )
}

function abrirFeedback(digest?: string) {
  const evento = new CustomEvent('open-feedback', {
    detail: { contexto: `error:${digest ?? 'unknown'}` }
  })
  window.dispatchEvent(evento)
}
