import { Fragment } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface Breadcrumb {
  label: string
  href?: string
}

interface Props {
  items: Breadcrumb[]
}

function truncate(text: string, max: number) {
  return text.length > max ? text.slice(0, max) + '...' : text
}

export function Breadcrumbs({ items }: Props) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
      {/* Mobile: solo link al padre */}
      <div className="flex items-center gap-1.5 sm:hidden">
        {items.length >= 2 && (
          <Link
            href={items[items.length - 2].href ?? '#'}
            className="inline-flex items-center gap-1 hover:text-brand-blue"
          >
            <ChevronRight className="w-3 h-3 rotate-180" />
            {truncate(items[items.length - 2].label, 30)}
          </Link>
        )}
      </div>

      {/* Desktop: breadcrumb completo */}
      <div className="hidden sm:flex items-center gap-1.5">
        {items.map((item, idx) => (
          <Fragment key={idx}>
            {idx > 0 && <ChevronRight className="w-3 h-3 text-gray-400" />}
            {item.href ? (
              <Link href={item.href} className="hover:text-brand-blue transition-colors">
                {truncate(item.label, 30)}
              </Link>
            ) : (
              <span className="text-gray-900 font-medium">
                {truncate(item.label, 30)}
              </span>
            )}
          </Fragment>
        ))}
      </div>
    </nav>
  )
}
