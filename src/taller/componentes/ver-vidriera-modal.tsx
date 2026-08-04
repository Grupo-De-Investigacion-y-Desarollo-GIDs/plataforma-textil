'use client'

import { useEffect, useState } from 'react'
import { ExternalLink, X } from 'lucide-react'
import { Button } from '@/compartido/componentes/ui/button'

// "Ver cómo me ve el directorio" como MODAL sobre "Mi vidriera" (no navega a la
// página pública). Al cerrar, el taller queda en su contexto privado. El contenido
// (children) es la vidriera pública filtrada por #437, server-rendered en la página.

export function VerVidrieraModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        icon={<ExternalLink className="w-4 h-4" />}
        onClick={() => setOpen(true)}
      >
        Ver cómo me ve el directorio
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Vista previa de tu vidriera pública"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[88vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-2 px-5 py-3 border-b border-gray-100 shrink-0">
              <div className="min-w-0">
                <h2 className="font-overpass font-bold text-brand-blue">Así te ven las marcas</h2>
                <p className="text-xs text-gray-500">
                  Vista pública filtrada según tu configuración de visibilidad.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-4">
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
