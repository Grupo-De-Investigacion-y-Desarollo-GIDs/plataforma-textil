import { NextResponse } from 'next/server'

const ALLOWED_ORIGINS = [
  'https://grupo-de-investigacion-y-desarollo-gids.github.io',
]

export function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin') ?? ''
  const headers: Record<string, string> = {}
  if (ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
    headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    headers['Access-Control-Allow-Headers'] = 'Content-Type'
  }
  return headers
}

export function handleOptions(request: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) })
}
