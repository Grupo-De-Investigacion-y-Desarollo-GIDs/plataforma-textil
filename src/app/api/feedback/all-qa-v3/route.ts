import { NextRequest, NextResponse } from 'next/server'
import { corsHeaders, handleOptions } from '@/compartido/lib/cors'
import { transformIssue } from '@/app/api/feedback/by-qa/[qaSlug]/route'
import { aggregateIssues } from '@/compartido/lib/qa-aggregate'

const CACHE_TTL_MS = 60 * 1000
let cache: { data: unknown; expira: number } | null = null

const EMPTY_GLOBAL = { open: 0, closed: 0, total: 0, porVerificador: {}, porPerfil: {} }

export function OPTIONS(request: Request) {
  return handleOptions(request)
}

export async function GET(req: NextRequest) {
  if (cache && cache.expira > Date.now()) {
    return NextResponse.json(cache.data, {
      headers: { ...corsHeaders(req), 'X-Cache': 'HIT' },
    })
  }

  const token = process.env.GITHUB_TOKEN
  const repo = process.env.GITHUB_REPO ?? 'Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil'

  if (!token) {
    return NextResponse.json(
      { counts: {}, global: EMPTY_GLOBAL, lastUpdated: new Date().toISOString(), error: 'GitHub no configurado' },
      { headers: corsHeaders(req) }
    )
  }

  try {
    // Fetch all issues with label "piloto" (all QA issues have it),
    // then filter server-side for those with QA_v3-* labels
    const response = await fetch(
      `https://api.github.com/repos/${repo}/issues?state=all&labels=piloto&per_page=100`,
      {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github+json',
        },
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { counts: {}, global: EMPTY_GLOBAL, error: 'Error consultando GitHub', status: response.status, lastUpdated: new Date().toISOString() },
        { status: 502, headers: corsHeaders(req) }
      )
    }

    const rawIssues = await response.json()
    const transformed = rawIssues.map(transformIssue)
    const { counts, global } = aggregateIssues(transformed)

    const result = { counts, global, lastUpdated: new Date().toISOString() }

    cache = { data: result, expira: Date.now() + CACHE_TTL_MS }

    return NextResponse.json(result, {
      headers: { ...corsHeaders(req), 'X-Cache': 'MISS' },
    })
  } catch {
    return NextResponse.json(
      { counts: {}, global: EMPTY_GLOBAL, error: 'Error de conexion con GitHub', lastUpdated: new Date().toISOString() },
      { status: 502, headers: corsHeaders(req) }
    )
  }
}
