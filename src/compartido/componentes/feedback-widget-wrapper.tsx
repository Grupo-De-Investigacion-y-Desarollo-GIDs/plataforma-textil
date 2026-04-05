'use client'
import { useSession } from 'next-auth/react'
import { FeedbackWidget } from './feedback-widget'

export function FeedbackWidgetWrapper() {
  const { data: session } = useSession()
  if (!session?.user) return null
  return <FeedbackWidget />
}
