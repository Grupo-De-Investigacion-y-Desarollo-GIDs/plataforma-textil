import Link from 'next/link'
import { LogoPDT } from '@/compartido/componentes/ui/logo-pdt'
import {
  INSTITUTIONAL,
  HEADER_PUBLIC_NAV,
  HEADER_PUBLIC_CTAS,
} from '@/compartido/lib/content/institutional'

export function HeaderPublic() {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Izquierda: logo + nombre */}
          <Link href="/" className="flex items-center gap-3">
            <LogoPDT variant="icon" size="md" />
            <div className="flex flex-col leading-tight">
              <span className="font-serif font-bold text-base text-ink-primary">
                {INSTITUTIONAL.brandName}
              </span>
              <span className="font-overpass font-bold text-[10px] text-terra-600 uppercase tracking-wider">
                {INSTITUTIONAL.brandSubtitle}
              </span>
            </div>
          </Link>

          {/* Centro: nav (hidden en mobile) */}
          <nav className="hidden lg:flex items-center gap-6">
            {HEADER_PUBLIC_NAV.map(item => (
              <Link
                key={item.href + item.label}
                href={item.href}
                className="text-sm font-overpass font-medium text-gray-700 hover:text-brand-blue transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Derecha: 3 CTAs */}
          <div className="flex items-center gap-2">
            <Link
              href={HEADER_PUBLIC_CTAS.iniciar.href}
              className="hidden sm:inline-flex items-center px-3 py-2 text-sm font-overpass font-medium text-brand-blue hover:bg-pastel-blue rounded-md transition-colors"
            >
              {HEADER_PUBLIC_CTAS.iniciar.label}
            </Link>
            <Link
              href={HEADER_PUBLIC_CTAS.taller.href}
              className="inline-flex items-center px-4 py-2 text-sm font-overpass font-semibold text-white bg-brand-blue hover:bg-brand-blue-dark rounded-md transition-colors"
            >
              {HEADER_PUBLIC_CTAS.taller.label}
            </Link>
            <Link
              href={HEADER_PUBLIC_CTAS.marca.href}
              className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-overpass font-semibold text-ink-primary border border-ink-primary hover:bg-gray-50 rounded-md transition-colors"
            >
              {HEADER_PUBLIC_CTAS.marca.label}
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
