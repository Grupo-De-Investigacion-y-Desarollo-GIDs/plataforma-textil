'use client'

import { ErrorPage } from '@/compartido/componentes/error-page'

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorPage error={error} reset={reset} contexto="admin" />
}
