'use client'

import { SectionError } from '@/components/ui/section-error'

export default function TallerError({ reset }: { error: Error; reset: () => void }) {
  return <SectionError section="Taller" reset={reset} />
}
