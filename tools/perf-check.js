#!/usr/bin/env node

/**
 * Performance checks — mide TTFB y valida paginación/filtros
 * Uso: node tools/perf-check.js https://plataforma-textil.vercel.app
 */

const BASE = process.argv[2]
if (!BASE) {
  console.error('Uso: node tools/perf-check.js <base-url>')
  process.exit(1)
}

const TTFB_THRESHOLD_MS = 3000
let passed = 0
let failed = 0

function result(ok, label, detail) {
  if (ok) {
    console.log(`  ✅ PASS  ${label}${detail ? ' — ' + detail : ''}`)
    passed++
  } else {
    console.log(`  ❌ FAIL  ${label}${detail ? ' — ' + detail : ''}`)
    failed++
  }
}

async function measureTTFB(url, options = {}) {
  const start = performance.now()
  const res = await fetch(url, { redirect: 'manual', ...options })
  const ttfb = performance.now() - start
  const body = res.status < 400 ? await res.text() : ''
  return { ttfb, status: res.status, body, headers: res.headers }
}

async function login(email, password) {
  // 1. Get CSRF token
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`)
  const csrfCookies = csrfRes.headers.getSetCookie?.() ?? []
  const { csrfToken } = await csrfRes.json()

  // 2. Build cookie string from CSRF response
  const cookieJar = csrfCookies.map(c => c.split(';')[0]).join('; ')

  // 3. POST credentials
  const callbackRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: cookieJar,
    },
    body: new URLSearchParams({
      email,
      password,
      csrfToken,
      callbackUrl: `${BASE}/taller`,
      json: 'true',
    }),
    redirect: 'manual',
  })

  // 4. Collect session cookies
  const sessionCookies = callbackRes.headers.getSetCookie?.() ?? []
  const allCookies = [...csrfCookies, ...sessionCookies]
    .map(c => c.split(';')[0])
    .join('; ')

  return allCookies
}

async function run() {
  console.log(`\nPerformance check: ${BASE}\n`)

  // --- Login ---
  console.log('Logging in as Roberto Giménez (BRONCE)...')
  let sessionCookie
  try {
    sessionCookie = await login('roberto.gimenez@pdt.org.ar', 'pdt2026')
    if (!sessionCookie.includes('authjs.session-token')) {
      result(false, 'Login', 'no se obtuvo session token')
      console.log(`\n${passed} passed, ${failed} failed\n`)
      process.exit(failed > 0 ? 1 : 0)
    }
    result(true, 'Login', 'session cookie obtenida')
  } catch (err) {
    result(false, 'Login', err.message)
    console.log(`\n${passed} passed, ${failed} failed\n`)
    process.exit(1)
  }

  // --- Check 1: /taller TTFB (warm = 2nd request) ---
  console.log('\n--- Check 1: /taller TTFB (warm) ---')
  const authHeaders = { Cookie: sessionCookie }
  // Cold request (discard)
  await measureTTFB(`${BASE}/taller`, { headers: authHeaders })
  // Warm request
  const taller = await measureTTFB(`${BASE}/taller`, { headers: authHeaders })
  const tallerTTFB = Math.round(taller.ttfb)
  const tallerOk = taller.status === 200 && taller.ttfb < TTFB_THRESHOLD_MS
  result(tallerOk, `/taller TTFB < ${TTFB_THRESHOLD_MS}ms`, `${tallerTTFB}ms, status=${taller.status}`)

  // --- Check 2: /directorio TTFB (warm) ---
  console.log('\n--- Check 2: /directorio TTFB (warm) ---')
  await measureTTFB(`${BASE}/directorio`)
  const dir = await measureTTFB(`${BASE}/directorio`)
  const dirTTFB = Math.round(dir.ttfb)
  const dirOk = dir.status === 200 && dir.ttfb < TTFB_THRESHOLD_MS
  result(dirOk, `/directorio TTFB < ${TTFB_THRESHOLD_MS}ms`, `${dirTTFB}ms, status=${dir.status}`)

  // --- Check 3: Paginación — page=1 vs page=2 devuelven contenido distinto ---
  console.log('\n--- Check 3: Paginación /directorio ---')
  const page1 = await measureTTFB(`${BASE}/directorio?page=1`)
  const page2 = await measureTTFB(`${BASE}/directorio?page=2`)
  if (page1.status === 200 && page2.status === 200) {
    // Con 3 talleres en el seed y PAGE_SIZE=12, page2 no tiene resultados
    // Verificar que el HTML es distinto (page2 muestra "No encontramos talleres" o distinta lista)
    const distinct = page1.body !== page2.body
    result(distinct, 'page=1 y page=2 devuelven contenido distinto', distinct ? 'OK' : 'mismo HTML')
  } else {
    result(false, 'Paginación', `status page1=${page1.status}, page2=${page2.status}`)
  }

  // --- Check 4: Filtros se preservan en la paginación ---
  console.log('\n--- Check 4: Filtros preservados en paginación ---')
  const filtered = await measureTTFB(`${BASE}/directorio?page=1&proceso=Corte`)
  if (filtered.status === 200) {
    // Verificar que el HTML contiene el filtro en el select o en los links de paginación
    const hasFilter = filtered.body.includes('proceso=') || filtered.body.includes('Corte')
    result(hasFilter, 'Filtro proceso=Corte se preserva en el HTML', hasFilter ? 'OK' : 'filtro no encontrado en HTML')
  } else {
    result(false, 'Filtros', `status=${filtered.status}`)
  }

  // --- Resumen ---
  console.log(`\n${'='.repeat(50)}`)
  console.log(`Resultado: ${passed} passed, ${failed} failed`)
  console.log(`${'='.repeat(50)}\n`)
  process.exit(failed > 0 ? 1 : 0)
}

run().catch(err => {
  console.error('Error fatal:', err.message)
  process.exit(1)
})
