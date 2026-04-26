import { NextRequest, NextResponse } from 'next/server'
import { corsHeaders, handleOptions } from '@/compartido/lib/cors'

const CACHE_TTL_MS = 60 * 1000 // 1 minuto
const cache = new Map<string, { data: unknown; expira: number }>()

export function OPTIONS(request: Request) {
  return handleOptions(request)
}

/**
 * Parsea metadata de HTML comments en el body de un issue de GitHub.
 * Los comments tienen forma: <!-- key: value -->
 */
export function parseIssueMetadata(body: string) {
  return {
    itemSelector: body.match(/<!-- item:\s*(.+?)\s*-->/)?.[1] ?? null,
    verificador: body.match(/<!-- verificador:\s*(.+?)\s*-->/)?.[1] ?? null,
    perfil: body.match(/<!-- perfil:\s*(.+?)\s*-->/)?.[1] ?? null,
  }
}

/**
 * Transforma un issue crudo de GitHub API al shape que consume el HTML de QA.
 */
export function transformIssue(issue: Record<string, unknown>) {
  const body = (issue.body as string) ?? ''
  const metadata = parseIssueMetadata(body)

  return {
    number: issue.number,
    title: issue.title,
    state: issue.state,
    stateReason: issue.state_reason ?? null,
    itemSelector: metadata.itemSelector,
    verificador: metadata.verificador,
    perfil: metadata.perfil,
    createdAt: issue.created_at,
    closedAt: issue.closed_at,
    url: issue.html_url,
    labels: (issue.labels as Array<{ name: string }>).map(l => l.name),
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ qaSlug: string }> }
) {
  const { qaSlug } = await params

  // Cache check
  const cached = cache.get(qaSlug)
  if (cached && cached.expira > Date.now()) {
    return NextResponse.json(cached.data, {
      headers: { ...corsHeaders(req), 'X-Cache': 'HIT' },
    })
  }

  const token = process.env.GITHUB_TOKEN
  const repo = process.env.GITHUB_REPO ?? 'Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil'

  if (!token) {
    return NextResponse.json(
      { issues: [], error: 'GitHub no configurado' },
      { headers: corsHeaders(req) }
    )
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${repo}/issues?state=all&labels=${encodeURIComponent(qaSlug)}&per_page=100`,
      {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github+json',
        },
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { issues: [], error: 'Error consultando GitHub', status: response.status },
        { status: 502, headers: corsHeaders(req) }
      )
    }

    const issues = await response.json()
    const parsed = issues.map(transformIssue)

    const result = {
      issues: parsed,
      lastUpdated: new Date().toISOString(),
    }

    cache.set(qaSlug, { data: result, expira: Date.now() + CACHE_TTL_MS })

    return NextResponse.json(result, {
      headers: { ...corsHeaders(req), 'X-Cache': 'MISS' },
    })
  } catch {
    return NextResponse.json(
      { issues: [], error: 'Error de conexion con GitHub' },
      { status: 502, headers: corsHeaders(req) }
    )
  }
}
