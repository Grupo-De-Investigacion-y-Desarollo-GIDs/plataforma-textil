'use client'

import { SectionError } from '@/compartido/componentes/ui/section-error'

export default function EstadoError({ reset }: { error: Error; reset: () => void }) {
  return <SectionError section="Estado" reset={reset} />
}
