'use client'

import { SectionError } from '@/compartido/componentes/ui/section-error'

export default function PublicError({ reset }: { error: Error; reset: () => void }) {
  return <SectionError section="la pagina" reset={reset} />
}
