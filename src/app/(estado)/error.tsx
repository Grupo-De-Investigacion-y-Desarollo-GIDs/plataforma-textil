'use client'

import { SectionError } from '@/components/ui/section-error'

export default function EstadoError({ reset }: { error: Error; reset: () => void }) {
  return <SectionError section="Estado" reset={reset} />
}
