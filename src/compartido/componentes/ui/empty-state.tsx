import Link from 'next/link'
import { Button } from './button'

interface EmptyStateProps {
  titulo: string
  mensaje: string
  accion?: {
    texto: string
    href?: string
    onClick?: () => void
  }
}

export function EmptyState({ titulo, mensaje, accion }: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4">
      <h3 className="font-overpass font-semibold text-gray-800 mb-2">{titulo}</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">{mensaje}</p>

      {accion && (
        accion.href ? (
          <Link href={accion.href}>
            <Button size="sm">{accion.texto}</Button>
          </Link>
        ) : (
          <Button size="sm" onClick={accion.onClick}>{accion.texto}</Button>
        )
      )}
    </div>
  )
}
