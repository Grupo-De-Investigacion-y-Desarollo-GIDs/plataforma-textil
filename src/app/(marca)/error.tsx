'use client'

import { SectionError } from '@/components/ui/section-error'

export default function MarcaError({ reset }: { error: Error; reset: () => void }) {
  return <SectionError section="Marca" reset={reset} />
}
