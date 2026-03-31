'use client'

import { SectionError } from '@/components/ui/section-error'

export default function PublicError({ reset }: { error: Error; reset: () => void }) {
  return <SectionError section="la pagina" reset={reset} />
}
