import Link from 'next/link'
import { Button } from './ui/button'

interface Props {
  contexto?: 'admin' | 'taller' | 'marca' | 'estado' | 'contenido' | 'publico'
  mensaje?: string
}

export function NotFoundPage({ contexto = 'publico', mensaje }: Props) {
  const rutaInicio = {
    admin: '/admin',
    taller: '/taller',
    marca: '/marca',
    estado: '/estado',
    contenido: '/admin/contenido',
    publico: '/',
  }[contexto]

  const mensajeDefault = {
    admin: 'Esta pagina de administracion no existe',
    taller: 'No encontramos lo que buscas',
    marca: 'No encontramos lo que buscas',
    estado: 'Esta pagina no existe',
    contenido: 'Esta pagina de contenido no existe',
    publico: 'La pagina que buscas no existe o fue movida',
  }[contexto]

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-brand-blue flex items-center justify-center mx-auto mb-4">
          <span className="font-overpass font-bold text-white text-lg">404</span>
        </div>

        <h1 className="font-overpass font-semibold text-xl mb-2">
          Pagina no encontrada
        </h1>

        <p className="text-sm text-zinc-600 mb-6">
          {mensaje ?? mensajeDefault}
        </p>

        <Link href={rutaInicio}>
          <Button variant="primary">Volver al inicio</Button>
        </Link>
      </div>
    </div>
  )
}
