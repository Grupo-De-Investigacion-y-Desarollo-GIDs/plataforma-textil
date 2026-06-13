import Link from 'next/link'
import { LogoPDT } from '@/compartido/componentes/ui/logo-pdt'
import { INSTITUTIONAL, FOOTER_LINKS } from '@/compartido/lib/content/institutional'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-ink-primary text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Col 1 — Branding */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-full p-1.5">
                <LogoPDT variant="icon" size="sm" />
              </div>
              <div>
                <p className="font-serif font-bold text-white text-sm leading-tight">
                  {INSTITUTIONAL.brandName}
                </p>
                <p className="font-overpass font-bold text-[10px] text-terra-300 uppercase tracking-wider mt-0.5">
                  {INSTITUTIONAL.brandSubtitle}
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              {INSTITUTIONAL.brandDescription}
            </p>
          </div>

          {/* Col 2 — Plataforma */}
          <div>
            <h3 className="font-overpass font-bold text-white text-xs uppercase tracking-widest mb-3">
              Plataforma
            </h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.plataforma.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Recursos */}
          <div>
            <h3 className="font-overpass font-bold text-white text-xs uppercase tracking-widest mb-3">
              Recursos
            </h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.recursos.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Legal */}
          <div>
            <h3 className="font-overpass font-bold text-white text-xs uppercase tracking-widest mb-3">
              Legal
            </h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.legal.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Separator + bottom row */}
        <div className="border-t border-gray-700 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-500">
          <p>&copy; {currentYear} {INSTITUTIONAL.copyrightHolder}. Todos los derechos reservados.</p>
          <p className="font-overpass font-bold text-gray-300 text-sm">
            {INSTITUTIONAL.endorsement}
          </p>
        </div>
      </div>
    </footer>
  )
}
