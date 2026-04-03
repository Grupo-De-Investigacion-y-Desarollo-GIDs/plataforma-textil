'use client'

import { SectionError } from '@/compartido/componentes/ui/section-error'

export default function AuthError({ reset }: { error: Error; reset: () => void }) {
  return <SectionError section="Autenticacion" reset={reset} />
}
