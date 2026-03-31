'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useToast } from '@/components/ui/toast'

export function SaveToast({ message = 'Cambios guardados' }: { message?: string }) {
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    if (searchParams.get('saved') === '1') {
      toast(message)
      // Clean URL without causing navigation
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [searchParams, toast, message])

  return null
}
