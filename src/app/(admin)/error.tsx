'use client'

import { SectionError } from '@/components/ui/section-error'

export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return <SectionError section="Administracion" reset={reset} />
}
