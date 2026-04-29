#!/usr/bin/env node
/**
 * Tests para generate-qa.js
 * Correr: node tools/generate-qa.test.js
 */

const fs = require('fs')
const os = require('os')
const path = require('path')
const {
  normalizar,
  parsearFrontmatter,
  parsearMetadata,
  esResultadoVerificado,
  dividirSecciones,
  parsearTabla,
  parsearPasos,
  parsearChecklist,
  parsearResultadoGlobal,
  parsearProgreso,
  parsearCheckboxes,
  renderItemCard,
  generarHtml,
  generarIndex,
} = require('./generate-qa')

let passed = 0
let failed = 0

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`)
    passed++
  } else {
    console.log(`  ❌ FAIL: ${testName}`)
    failed++
  }
}

function assertEq(actual, expected, testName) {
  if (actual === expected) {
    console.log(`  ✅ PASS: ${testName}`)
    passed++
  } else {
    console.log(`  ❌ FAIL: ${testName}`)
    console.log(`     Esperado: ${JSON.stringify(expected)}`)
    console.log(`     Actual:   ${JSON.stringify(actual)}`)
    failed++
  }
}

// ============================================
// Test 1: Parseo de metadata
// ============================================
console.log('\n📋 Test 1: Parseo de metadata')
{
  const fixture = `# QA: Épica Academia — Quiz obligatorio

**Spec:** \`v2-epica-academia.md\`
**Commit de implementación:** \`ac76919\`
**URL de prueba:** https://plataforma-textil.vercel.app
**Fecha:** 2026-04-14
**Auditor:** Sergio

---`
  const meta = parsearMetadata(fixture)
  assertEq(meta.titulo, 'Épica Academia — Quiz obligatorio', 'titulo')
  assertEq(meta.spec, 'v2-epica-academia.md', 'spec')
  assertEq(meta.commit, 'ac76919', 'commit')
  assertEq(meta.url, 'https://plataforma-textil.vercel.app', 'url')
  assertEq(meta.fecha, '2026-04-14', 'fecha')
  assertEq(meta.auditor, 'Sergio', 'auditor')
}

// ============================================
// Test 2: Detección de secciones
// ============================================
console.log('\n📋 Test 2: Detección de secciones')
{
  const fixture = `# QA: Test

**Spec:** \`test.md\`
**Fecha:** 2026-01-01
**Auditor:** Test

## Cómo trabajar con este documento
Instrucciones aqui.

## Credenciales de prueba
| Rol | Email |
|-----|-------|
| ADMIN | test@test.com |

## Resultado global
- [ ] Aprobado

## Eje 1 — Funcionalidad
| # | Criterio | Resultado | Issue |
|---|----------|-----------|-------|

## Eje 2 — Navegabilidad
### Paso 1 — Login

## Eje 3 — Casos borde
| # | Caso | Accion | Esperado | Resultado |
|---|------|--------|----------|-----------|

## Eje 4 — Performance
| Verificacion | Metodo | Resultado |
|-------------|--------|-----------|

## Eje 5 — Consistencia visual
| Verificacion | Resultado | Notas |
|-------------|-----------|-------|

## Resumen de issues abiertos
Nada.

## Notas del auditor
Sin notas.

## Checklist de cierre
- [ ] item 1
`
  const { secciones } = dividirSecciones(fixture)
  assertEq(secciones.length, 11, '11 secciones detectadas')
  assert(secciones[0].nombreNorm.includes('como trabajar'), 'primera seccion es como trabajar')
  assert(secciones[3].nombreNorm.includes('eje 1'), 'eje 1 detectado')
  assert(secciones[4].nombreNorm.includes('eje 2'), 'eje 2 detectado')
  assert(secciones[10].nombreNorm.includes('checklist'), 'checklist detectado')
}

// ============================================
// Test 3: Parser Eje 1 — tabla
// ============================================
console.log('\n📋 Test 3: Parser Eje 1 — tabla')
{
  const fixture = `
| # | Criterio | Resultado | Issue |
|---|----------|-----------|-------|
| 1 | Login funciona | | |
| 2 | Registro ok | | |
| 3 | Dashboard carga | | |
`
  const filas = parsearTabla(fixture)
  assertEq(filas.length, 3, '3 filas parseadas')
  assertEq(filas[0]['#'], '1', 'primera fila num')
  assertEq(filas[0].criterio, 'Login funciona', 'primera fila criterio')
  assertEq(filas[2].criterio, 'Dashboard carga', 'tercera fila criterio')
}

// ============================================
// Test 4: Parser Eje 2 — pasos
// ============================================
console.log('\n📋 Test 4: Parser Eje 2 — pasos')
{
  const fixture = `
### Paso 1 — Login como admin

- **Rol:** ADMIN (lucia@test.com / pdt2026)
- **URL de inicio:** /admin
- **Acción:** Click en login
- **Esperado:** Redirige al dashboard
- **Resultado:**
- **Notas:** Sin notas

### Paso 2 — Verificar dashboard

- **Rol:** ADMIN
- **URL de inicio:** /admin/dashboard
- **Acción:** Revisar stats
- **Esperado:** Muestra contadores
- **Resultado:**
- **Notas:**
`
  const pasos = parsearPasos(fixture)
  assertEq(pasos.length, 2, '2 pasos parseados')
  assertEq(pasos[0].numero, 1, 'paso 1 numero')
  assertEq(pasos[0].titulo, 'Login como admin', 'paso 1 titulo')
  assertEq(pasos[0].rol, 'ADMIN (lucia@test.com / pdt2026)', 'paso 1 rol')
  assertEq(pasos[0].url, '/admin', 'paso 1 url')
  assertEq(pasos[1].numero, 2, 'paso 2 numero')
  assertEq(pasos[1].titulo, 'Verificar dashboard', 'paso 2 titulo')
}

// ============================================
// Test 5: Parser Eje 3 — tabla con 5 columnas
// ============================================
console.log('\n📋 Test 5: Parser Eje 3 — tabla')
{
  const fixture = `
| # | Caso | Accion | Esperado | Resultado |
|---|------|--------|----------|-----------|
| 1 | Feedback sin nombre | Enviar sin nombre | Muestra error | |
| 2 | Feedback corto | Escribir 5 chars | Muestra error validacion | |
`
  const filas = parsearTabla(fixture)
  assertEq(filas.length, 2, '2 filas parseadas')
  assertEq(filas[0].caso, 'Feedback sin nombre', 'fila 1 caso')
  assertEq(filas[0].accion, 'Enviar sin nombre', 'fila 1 accion')
  assertEq(filas[0].esperado, 'Muestra error', 'fila 1 esperado')
  assertEq(filas[1].caso, 'Feedback corto', 'fila 2 caso')
}

// ============================================
// Test 6: Parser checklist de cierre
// ============================================
console.log('\n📋 Test 6: Parser checklist de cierre')
{
  const fixture = `
- [ ] Criterios verificados
- [ ] Pasos probados
- [ ] Casos borde probados
- [ ] Performance revisada
- [ ] Issues abiertos
`
  const items = parsearChecklist(fixture)
  assertEq(items.length, 5, '5 items')
  assertEq(items[0], 'Criterios verificados', 'item 1')
  assertEq(items[4], 'Issues abiertos', 'item 5')
}

// ============================================
// Test 7: Sección desconocida
// ============================================
console.log('\n📋 Test 7: Sección desconocida')
{
  const fixture = `# QA: Test
**Spec:** \`test.md\`
**Fecha:** 2026-01-01
**Auditor:** Test

## Resultado global
- [ ] Aprobado

## Seccion Inventada Con Texto Libre
Este es contenido libre que no deberia romper nada.
Puede tener varias lineas.
`
  const { secciones } = dividirSecciones(fixture)
  const inventada = secciones.find(s => s.nombreNorm.includes('seccion inventada'))
  assert(inventada !== undefined, 'seccion desconocida detectada')
  assert(inventada.contenido.includes('contenido libre'), 'contenido preservado')

  // Verificar que genera HTML sin error
  const tmpPath = path.join(__dirname, '_test_unknown.md')
  fs.writeFileSync(tmpPath, fixture)
  let error = null
  try {
    generarHtml(tmpPath)
  } catch (e) {
    error = e
  }
  assert(error === null, 'genera HTML sin crash con seccion desconocida')

  const htmlPath = tmpPath.replace('.md', '.html')
  if (fs.existsSync(htmlPath)) {
    const html = fs.readFileSync(htmlPath, 'utf-8')
    assert(html.includes('Seccion Inventada'), 'HTML contiene la seccion desconocida')
    assert(html.includes('unknown'), 'seccion marcada como unknown')
    fs.unlinkSync(htmlPath)
  }
  fs.unlinkSync(tmpPath)
}

// ============================================
// Test 8: .md mínimo
// ============================================
console.log('\n📋 Test 8: .md minimo')
{
  const fixture = `# QA: Test Minimo
**Spec:** \`test.md\`
**Fecha:** 2026-01-01
**Auditor:** Test
`
  const tmpPath = path.join(__dirname, '_test_minimal.md')
  fs.writeFileSync(tmpPath, fixture)
  let error = null
  try {
    generarHtml(tmpPath)
  } catch (e) {
    error = e
  }
  assert(error === null, 'genera HTML sin crash con md minimo')

  const htmlPath = tmpPath.replace('.md', '.html')
  if (fs.existsSync(htmlPath)) {
    const html = fs.readFileSync(htmlPath, 'utf-8')
    assert(html.includes('Test Minimo'), 'HTML contiene titulo')
    assert(html.includes('Copiar resultados'), 'HTML contiene boton copiar')
    assert(!html.includes('undefined'), 'sin undefined')
    assert(!html.includes('[object Object]'), 'sin [object Object]')
    fs.unlinkSync(htmlPath)
  }
  fs.unlinkSync(tmpPath)
}

// ============================================
// Test 9: Normalización de tildes
// ============================================
console.log('\n📋 Test 9: Normalizacion de tildes')
{
  assertEq(normalizar('Cómo trabajar'), normalizar('Como trabajar'), 'como/cómo')
  assertEq(normalizar('Épica'), normalizar('Epica'), 'epica/épica')
  assertEq(normalizar('Acción'), normalizar('Accion'), 'accion/acción')
  assertEq(normalizar('Decisión'), normalizar('Decision'), 'decision/decisión')

  // Verificar que el mapper reconoce ambas variantes
  const fixture1 = `# QA: Test
**Spec:** \`test.md\`
**Fecha:** 2026-01-01
**Auditor:** Test

## Como trabajar con este documento
Instrucciones sin tildes.
`
  const fixture2 = `# QA: Test
**Spec:** \`test.md\`
**Fecha:** 2026-01-01
**Auditor:** Test

## Cómo trabajar con este documento
Instrucciones con tildes.
`
  const { secciones: s1 } = dividirSecciones(fixture1)
  const { secciones: s2 } = dividirSecciones(fixture2)
  assertEq(s1[0].nombreNorm, s2[0].nombreNorm, 'headings normalizados iguales')
}

// ============================================
// Test de integración — los 12 QAs reales
// ============================================
console.log('\n📋 Tests de integración — QAs reales')
{
  const auditoriaDir = path.resolve(__dirname, '..', '.claude', 'auditorias')
  const archivos = fs.readdirSync(auditoriaDir).filter(f => f.startsWith('QA_v2-') && f.endsWith('.md'))

  assertEq(archivos.length >= 12, true, `encontrados ${archivos.length} QAs (esperados >=12)`)

  for (const archivo of archivos) {
    const mdPath = path.join(auditoriaDir, archivo)
    const htmlPath = mdPath.replace('.md', '.html')
    const nombre = archivo.replace('.md', '')

    let error = null
    try {
      generarHtml(mdPath)
    } catch (e) {
      error = e
    }

    assert(error === null, `${nombre}: genera sin crash`)

    if (fs.existsSync(htmlPath)) {
      const html = fs.readFileSync(htmlPath, 'utf-8')

      // Verificar que contiene el título
      const tituloMatch = fs.readFileSync(mdPath, 'utf-8').match(/^#\s+QA:\s*(.+)$/m)
      if (tituloMatch) {
        assert(html.includes('QA:'), `${nombre}: contiene titulo`)
      }

      // Verificar botón copiar
      assert(html.includes('Copiar resultados'), `${nombre}: contiene boton copiar`)

      // Verificar sin undefined ni [object Object]
      assert(!html.includes('>undefined<'), `${nombre}: sin undefined`)
      assert(!html.includes('[object Object]'), `${nombre}: sin [object Object]`)

      // Limpiar
      fs.unlinkSync(htmlPath)
    } else {
      assert(false, `${nombre}: HTML no fue creado`)
    }
  }
}

// ============================================
// Test 10: Comando --index
// ============================================
console.log('\n📋 Test 10: Comando --index')
{
  const auditoriaDir = path.resolve(__dirname, '..', '.claude', 'auditorias')

  // Primero generar los HTMLs individuales para que el index los detecte
  const mdFiles = fs.readdirSync(auditoriaDir).filter(f => f.startsWith('QA_v2-') && f.endsWith('.md'))
  for (const f of mdFiles) {
    generarHtml(path.join(auditoriaDir, f))
  }

  // Generar el index
  let error = null
  try {
    generarIndex(auditoriaDir)
  } catch (e) {
    error = e
  }
  assert(error === null, 'genera index.html sin crash')

  const indexPath = path.join(auditoriaDir, 'index.html')
  assert(fs.existsSync(indexPath), 'index.html fue creado')

  if (fs.existsSync(indexPath)) {
    const html = fs.readFileSync(indexPath, 'utf-8')

    assert(html.includes('Auditorias QA'), 'contiene titulo del index')
    assert(!html.includes('undefined'), 'sin undefined')
    assert(!html.includes('[object Object]'), 'sin [object Object]')

    // Verificar que tiene links a los 12 QAs
    let linksFound = 0
    for (const f of mdFiles) {
      const htmlFile = f.replace('.md', '.html')
      if (html.includes(htmlFile)) linksFound++
    }
    assertEq(linksFound, mdFiles.length, `contiene links a los ${mdFiles.length} QAs`)

    // Verificar que contiene títulos de los QAs
    assert(html.includes('Academia'), 'contiene titulo de academia')
    assert(html.includes('Config Piloto'), 'contiene titulo de config piloto')

    // Verificar que tiene badges "HTML listo"
    assert(html.includes('HTML listo'), 'contiene badge de HTML listo')

    // Limpiar
    fs.unlinkSync(indexPath)
  }

  // Limpiar HTMLs individuales
  for (const f of mdFiles) {
    const htmlPath = path.join(auditoriaDir, f.replace('.md', '.html'))
    if (fs.existsSync(htmlPath)) fs.unlinkSync(htmlPath)
  }
}

// ============================================
// Test 11: HTML contiene botón "Crear issue"
// ============================================
console.log('\n📋 Test 11: Boton Crear issue en Eje 1/2/3')
{
  const auditoriaDir = path.resolve(__dirname, '..', '.claude', 'auditorias')
  const mdPath = path.join(auditoriaDir, 'QA_v2-epica-academia.md')
  generarHtml(mdPath)
  const htmlPath = mdPath.replace('.md', '.html')
  const html = fs.readFileSync(htmlPath, 'utf-8')

  assert(html.includes('Crear issue'), 'HTML contiene boton Crear issue')
  assert(html.includes('crearIssue'), 'HTML contiene funcion crearIssue')
  assert(html.includes('plataforma-textil.vercel.app'), 'HTML contiene URL de la plataforma')
  assert(html.includes('data-spec='), 'HTML contiene data-spec')
  assert(html.includes('data-api-url='), 'HTML contiene data-api-url')

  fs.unlinkSync(htmlPath)
}

// ============================================
// Test 12: PLATAFORMA_URL custom
// ============================================
console.log('\n📋 Test 12: PLATAFORMA_URL custom')
{
  const fixture = `# QA: Test URL Custom
**Spec:** \`test.md\`
**Fecha:** 2026-01-01
**Auditor:** Test

## Eje 1 — Funcionalidad
| # | Criterio | Resultado | Issue |
|---|----------|-----------|-------|
| 1 | Test item | | |
`
  const tmpPath = path.join(__dirname, '_test_custom_url.md')
  fs.writeFileSync(tmpPath, fixture)

  // Set custom URL
  process.env.PLATAFORMA_URL = 'https://custom.example.com'
  generarHtml(tmpPath)
  delete process.env.PLATAFORMA_URL

  const htmlPath = tmpPath.replace('.md', '.html')
  const html = fs.readFileSync(htmlPath, 'utf-8')

  assert(html.includes('custom.example.com/api/feedback'), 'HTML usa URL custom en api-url')
  assert(!html.includes('plataforma-textil.vercel.app/api/feedback'), 'HTML no usa URL default en api-url')

  fs.unlinkSync(htmlPath)
  fs.unlinkSync(tmpPath)
}

// ============================================
// Test 13: Parseo de metadata V3 (Eje 6, perfiles, auditor(es))
// ============================================
console.log('\n📋 Test 13: Parseo de metadata V3')
{
  const fixtureV3 = `# QA: Test V3

**Spec:** \`v3-test.md\`
**Fecha:** 2026-04-26
**Auditor(es):** Sergio (tecnico) + politologo, economista
**Incluye Eje 6 de validacion de dominio:** si
**Perfiles aplicables:** politologo, economista, sociologo
`
  const meta = parsearMetadata(fixtureV3)
  assertEq(meta.titulo, 'Test V3', 'titulo V3')
  assertEq(meta.auditor, 'Sergio (tecnico) + politologo, economista', 'auditor(es) V3')
  assertEq(meta.incluyeEje6, true, 'incluyeEje6 = true')
  assertEq(meta.perfiles.length, 3, '3 perfiles')
  assertEq(meta.perfiles[0], 'politologo', 'perfil 1')
  assertEq(meta.perfiles[2], 'sociologo', 'perfil 3')

  // Retrocompatibilidad: metadata V2 sin campos V3
  const fixtureV2 = `# QA: Test V2
**Spec:** \`v2-test.md\`
**Fecha:** 2026-01-01
**Auditor:** Sergio
`
  const metaV2 = parsearMetadata(fixtureV2)
  assertEq(metaV2.auditor, 'Sergio', 'auditor V2 sigue funcionando')
  assertEq(metaV2.incluyeEje6, false, 'incluyeEje6 default false')
  assertEq(metaV2.perfiles.length, 0, 'perfiles default vacio')

  // Flag explicitamente "no"
  const fixtureNo = `# QA: Test No Eje6
**Spec:** \`v3-tecnico.md\`
**Fecha:** 2026-04-26
**Auditor(es):** Sergio
**Incluye Eje 6 de validacion de dominio:** no
`
  const metaNo = parsearMetadata(fixtureNo)
  assertEq(metaNo.incluyeEje6, false, 'incluyeEje6 = false cuando flag es no')
}

// ============================================
// Test 14: Parsing de Eje 6 — secciones por perfil
// ============================================
console.log('\n📋 Test 14: Parsing de Eje 6 — secciones por perfil')
{
  const fixture = `# QA: Test Eje 6

**Spec:** \`v3-test.md\`
**Fecha:** 2026-04-26
**Auditor(es):** Sergio + equipo
**Incluye Eje 6 de validacion de dominio:** si
**Perfiles aplicables:** politologo, economista

## Resultado global
- [ ] Aprobado

## Eje 1 — Funcionalidad
| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 1 | Login funciona | QA | | |

## Eje 6 — Validacion de dominio

### Politologo — Relacion con el Estado

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | El flujo refleja la relacion Estado-privado? | | |
| 2 | Incentivos alineados entre actores? | | |

### Economista — Incentivos y metricas

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | Estructura de niveles crea incentivos correctos? | | |

## Checklist de cierre
- [ ] Todo verificado
`
  const tmpPath = path.join(__dirname, '_test_eje6.md')
  fs.writeFileSync(tmpPath, fixture)
  generarHtml(tmpPath)
  const htmlPath = tmpPath.replace('.md', '.html')
  const html = fs.readFileSync(htmlPath, 'utf-8')

  assert(html.includes('id="eje6"'), 'HTML contiene id="eje6"')
  assert(html.includes('Politologo'), 'HTML contiene seccion Politologo')
  assert(html.includes('Economista'), 'HTML contiene seccion Economista')
  assert(html.includes('data-perfil="politologo"'), 'item-card tiene data-perfil="politologo"')
  assert(html.includes('data-perfil="economista"'), 'item-card tiene data-perfil="economista"')
  assert(html.includes('badge-perfil'), 'HTML tiene badge de perfil')
  // Verificar que las preguntas estan como item-cards
  assert(html.includes('El flujo refleja la relacion Estado-privado?'), 'pregunta 1 politologo presente')
  assert(html.includes('Estructura de niveles crea incentivos correctos?'), 'pregunta 1 economista presente')
  // Verificar colapsable por defecto
  assert(html.includes('collapsible collapsed'), 'secciones de perfil colapsadas por defecto')

  fs.unlinkSync(htmlPath)
  fs.unlinkSync(tmpPath)
}

// ============================================
// Test 15: Eje 6 omitido cuando flag es "no"
// ============================================
console.log('\n📋 Test 15: Eje 6 omitido cuando flag es no')
{
  const fixture = `# QA: Test Sin Eje 6

**Spec:** \`v3-tecnico.md\`
**Fecha:** 2026-04-26
**Auditor(es):** Sergio
**Incluye Eje 6 de validacion de dominio:** no

## Resultado global
- [ ] Aprobado

## Eje 1 — Funcionalidad
| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 1 | Rate limiting funciona | DEV | | |

## Checklist de cierre
- [ ] Todo verificado
`
  const tmpPath = path.join(__dirname, '_test_no_eje6.md')
  fs.writeFileSync(tmpPath, fixture)
  generarHtml(tmpPath)
  const htmlPath = tmpPath.replace('.md', '.html')
  const html = fs.readFileSync(htmlPath, 'utf-8')

  assert(!html.includes('id="eje6"'), 'HTML NO contiene id="eje6"')
  // La seccion visible <h2>Eje 6 no debe existir (el string aparece en el JS template pero no como HTML visible)
  assert(!html.includes('<h2>Eje 6'), 'HTML NO contiene <h2> Eje 6')
  assert(html.includes('id="eje1"'), 'HTML SI contiene Eje 1')

  fs.unlinkSync(htmlPath)
  fs.unlinkSync(tmpPath)
}

// ============================================
// Test 16: Badge Verificador QA/DEV en Eje 1, 3, 4
// ============================================
console.log('\n📋 Test 16: Badge Verificador QA/DEV')
{
  const fixture = `# QA: Test Badges

**Spec:** \`v3-test.md\`
**Fecha:** 2026-04-26
**Auditor(es):** Sergio

## Eje 1 — Funcionalidad
| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 1 | UI muestra boton | QA | | |
| 2 | Endpoint devuelve 200 | DEV | | |
| 3 | Mixto funciona | QA / DEV | | |

## Eje 3 — Casos borde
| # | Caso | Accion | Esperado | Verificador | Resultado |
|---|------|--------|----------|-------------|-----------|
| 1 | Input vacio | Enviar vacio | Error | QA | |
| 2 | DB caida | Simular falla | Log error | DEV | |

## Eje 4 — Performance
| Verificacion | Metodo | Verificador | Resultado |
|-------------|--------|-------------|-----------|
| Pagina carga < 3s | DevTools | QA | |
| Query < 200ms | Vercel Logs | DEV | |
`
  const tmpPath = path.join(__dirname, '_test_badges.md')
  fs.writeFileSync(tmpPath, fixture)
  generarHtml(tmpPath)
  const htmlPath = tmpPath.replace('.md', '.html')
  const html = fs.readFileSync(htmlPath, 'utf-8')

  // Eje 1 badges
  assert(html.includes('class="badge-qa"'), 'Eje 1 tiene badge-qa')
  assert(html.includes('class="badge-dev"'), 'Eje 1 tiene badge-dev')

  // data-verificador attributes
  assert(html.includes('data-verificador="QA"'), 'item-card tiene data-verificador="QA"')
  assert(html.includes('data-verificador="DEV"'), 'item-card tiene data-verificador="DEV"')

  // Eje 3 badges — extraer seccion entre id="eje3" y el siguiente id="eje
  const eje3Start = html.indexOf('id="eje3"')
  const eje3End = html.indexOf('id="eje4"')
  const eje3Section = (eje3Start > -1 && eje3End > eje3Start) ? html.substring(eje3Start, eje3End) : ''
  assert(eje3Section.includes('badge-qa'), 'Eje 3 tiene badge-qa')
  assert(eje3Section.includes('badge-dev'), 'Eje 3 tiene badge-dev')

  // Eje 4 badges — extraer seccion entre id="eje4" y el siguiente id= o section
  const eje4Start = html.indexOf('id="eje4"')
  const eje4End = html.indexOf('id="resumen-issues"', eje4Start)
  const eje4Section = (eje4Start > -1 && eje4End > eje4Start) ? html.substring(eje4Start, eje4End) : html.substring(eje4Start || 0, (eje4Start || 0) + 3000)
  assert(eje4Section.includes('badge-qa'), 'Eje 4 tiene badge-qa')
  assert(eje4Section.includes('badge-dev'), 'Eje 4 tiene badge-dev')

  // Default cuando no hay columna Verificador — testear con fixture V2 sin columna
  const fixtureV2 = `# QA: Test Default Badge
**Spec:** \`v2-test.md\`
**Fecha:** 2026-01-01
**Auditor:** Sergio

## Eje 1 — Funcionalidad
| # | Criterio | Resultado | Issue |
|---|----------|-----------|-------|
| 1 | Login funciona | | |
`
  const tmpV2 = path.join(__dirname, '_test_default_badge.md')
  fs.writeFileSync(tmpV2, fixtureV2)
  generarHtml(tmpV2)
  const htmlV2 = fs.readFileSync(tmpV2.replace('.md', '.html'), 'utf-8')
  assert(htmlV2.includes('data-verificador="QA"'), 'sin columna Verificador → default QA')
  assert(htmlV2.includes('badge-qa'), 'sin columna Verificador → badge-qa')

  fs.unlinkSync(htmlPath)
  fs.unlinkSync(tmpPath)
  fs.unlinkSync(tmpV2.replace('.md', '.html'))
  fs.unlinkSync(tmpV2)
}

// ============================================
// Test 17: Filtros HTML por perfil y verificador
// ============================================
console.log('\n📋 Test 17: Filtros HTML por perfil y verificador')
{
  const fixture = `# QA: Test Filtros

**Spec:** \`v3-test.md\`
**Fecha:** 2026-04-26
**Auditor(es):** Sergio + equipo
**Incluye Eje 6 de validacion de dominio:** si
**Perfiles aplicables:** politologo, sociologo

## Eje 1 — Funcionalidad
| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 1 | Test item | QA | | |

## Eje 6 — Validacion de dominio

### Politologo — Relacion con el Estado
| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | Pregunta pol | | |

### Sociologo — Lenguaje
| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | Pregunta soc | | |

## Checklist de cierre
- [ ] Done
`
  const tmpPath = path.join(__dirname, '_test_filtros.md')
  fs.writeFileSync(tmpPath, fixture)
  generarHtml(tmpPath)
  const htmlPath = tmpPath.replace('.md', '.html')
  const html = fs.readFileSync(htmlPath, 'utf-8')

  // Barra de filtros existe
  assert(html.includes('id="filter-bar"'), 'barra de filtros presente')

  // Botones de filtro base
  assert(html.includes('data-filter="todos"'), 'boton filtro Todos')
  assert(html.includes('data-filter="QA"'), 'boton filtro QA')
  assert(html.includes('data-filter="DEV"'), 'boton filtro DEV')

  // Botones de filtro por perfil
  assert(html.includes('data-filter="politologo"'), 'boton filtro politologo')
  assert(html.includes('data-filter="sociologo"'), 'boton filtro sociologo')

  // JS de filtrado embebido
  assert(html.includes('function filtrarPor(tipo)'), 'JS filtrarPor presente')
  assert(html.includes("tipo === 'todos'"), 'filtrarPor maneja caso todos (reset)')
  assert(html.includes("c.style.display = ''"), 'filtrarPor resetea display')

  fs.unlinkSync(htmlPath)
  fs.unlinkSync(tmpPath)
}

// ============================================
// Test 18: Secciones V3 nuevas (contexto, objetivo, notas auditores)
// ============================================
console.log('\n📋 Test 18: Secciones V3 nuevas')
{
  const fixture = `# QA: Test Secciones V3

**Spec:** \`v3-test.md\`
**Fecha:** 2026-04-26
**Auditor(es):** Sergio + equipo

## Contexto institucional

Este flujo simula el registro de un taller familiar en Florencio Varela.

## Objetivo de este QA

Verificar que el registro funciona end-to-end para talleres informales.

## Resultado global
- [ ] Aprobado

## Eje 1 — Funcionalidad
| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 1 | Test | QA | | |

## Notas de los auditores

**Sergio (tecnico):**
Sin notas.

**Perfiles interdisciplinarios:**
Sin notas.

## Checklist de cierre
- [ ] Done
`
  const tmpPath = path.join(__dirname, '_test_secciones_v3.md')
  fs.writeFileSync(tmpPath, fixture)
  generarHtml(tmpPath)
  const htmlPath = tmpPath.replace('.md', '.html')
  const html = fs.readFileSync(htmlPath, 'utf-8')

  // Contexto institucional renderizado como seccion, no como unknown
  assert(html.includes('id="contexto-institucional"'), 'seccion contexto institucional')
  assert(html.includes('taller familiar en Florencio Varela'), 'contenido del contexto')
  assert(!html.match(/class="section unknown"[^>]*>[\s\S]*?Contexto institucional/), 'contexto NO es unknown')

  // Objetivo del QA
  assert(html.includes('id="objetivo-qa"'), 'seccion objetivo del QA')
  assert(html.includes('registro funciona end-to-end'), 'contenido del objetivo')

  // Notas de los auditores (V3, con 2 textareas)
  assert(html.includes('id="notas-auditores"'), 'seccion notas auditores V3')
  assert(html.includes('textarea-notas-tecnico'), 'textarea notas tecnico')
  assert(html.includes('textarea-notas-perfiles'), 'textarea notas perfiles')

  fs.unlinkSync(htmlPath)
  fs.unlinkSync(tmpPath)
}

// ============================================
// Test 19: Index generator con QA_v3-*
// ============================================
console.log('\n📋 Test 19: Index generator incluye QA_v3')
{
  const auditoriaDir = path.resolve(__dirname, '..', '.claude', 'auditorias')

  // Generar todos los HTMLs (V2 + V3)
  const allMdFiles = fs.readdirSync(auditoriaDir)
    .filter(f => (f.startsWith('QA_v2-') || f.startsWith('QA_v3-')) && f.endsWith('.md'))
  for (const f of allMdFiles) {
    generarHtml(path.join(auditoriaDir, f))
  }

  // Generar index
  generarIndex(auditoriaDir)
  const indexPath = path.join(auditoriaDir, 'index.html')
  const html = fs.readFileSync(indexPath, 'utf-8')

  // Debe incluir V3 QAs
  const v3Files = allMdFiles.filter(f => f.startsWith('QA_v3-'))
  assert(v3Files.length > 0, 'existen archivos QA_v3-*.md')
  for (const f of v3Files) {
    const htmlFile = f.replace('.md', '.html')
    assert(html.includes(htmlFile), `index incluye ${htmlFile}`)
  }

  // Total debe ser mayor que solo V2
  const v2Files = allMdFiles.filter(f => f.startsWith('QA_v2-'))
  const totalLinks = allMdFiles.filter(f => html.includes(f.replace('.md', '.html'))).length
  assert(totalLinks > v2Files.length, `index tiene ${totalLinks} links (mas que ${v2Files.length} V2)`)

  // Limpiar
  fs.unlinkSync(indexPath)
  for (const f of allMdFiles) {
    const htmlPath = path.join(auditoriaDir, f.replace('.md', '.html'))
    if (fs.existsSync(htmlPath)) fs.unlinkSync(htmlPath)
  }
}

// ============================================
// Test 20: Index separa V2 y V3 en secciones
// ============================================
console.log('\n📋 Test 20: Index separa V2 y V3 en secciones')
{
  const auditoriaDir = path.resolve(__dirname, '..', '.claude', 'auditorias')

  // Generar todos los HTMLs
  const allMdFiles = fs.readdirSync(auditoriaDir)
    .filter(f => (f.startsWith('QA_v2-') || f.startsWith('QA_v3-')) && f.endsWith('.md'))
  for (const f of allMdFiles) {
    generarHtml(path.join(auditoriaDir, f))
  }

  generarIndex(auditoriaDir)
  const indexPath = path.join(auditoriaDir, 'index.html')
  const html = fs.readFileSync(indexPath, 'utf-8')

  // Secciones separadas
  assert(html.includes('id="section-v3"'), 'index tiene seccion V3')
  assert(html.includes('id="section-v2"'), 'index tiene seccion V2')
  assert(html.includes('V3 — En curso'), 'seccion V3 tiene titulo correcto')
  assert(html.includes('V2 — Historico'), 'seccion V2 tiene titulo correcto')

  // Descripciones
  assert(html.includes('agrupadas por bloque del plan de implementacion'), 'V3 tiene descripcion')
  assert(html.includes('specs V2 ya cerrados'), 'V2 tiene descripcion')

  // V2 esta dentro de <details> (colapsable)
  const v2SectionStart = html.indexOf('id="section-v2"')
  const v2Chunk = html.substring(v2SectionStart, v2SectionStart + 500)
  assert(v2Chunk.includes('<details>'), 'V2 usa <details> (colapsable)')
  assert(v2Chunk.includes('<summary>'), 'V2 tiene <summary>')

  // Filtros
  assert(html.includes('filtrarIndex'), 'index tiene funcion filtrarIndex')
  assert(html.includes('data-filter="todos"'), 'index tiene boton Todos')
  assert(html.includes('data-filter="v3"'), 'index tiene boton Solo V3')
  assert(html.includes('data-filter="v2"'), 'index tiene boton Solo V2')

  // Cards tienen data-version
  assert(html.includes('data-version="v3"'), 'cards V3 tienen data-version')
  assert(html.includes('data-version="v2"'), 'cards V2 tienen data-version')

  // V3 section aparece ANTES que V2 en el HTML
  const v3Pos = html.indexOf('id="section-v3"')
  const v2Pos = html.indexOf('id="section-v2"')
  assert(v3Pos < v2Pos, 'V3 aparece antes que V2 en el HTML')

  // Perfiles chips se muestran si el QA los tiene
  const v3Files = allMdFiles.filter(f => f.startsWith('QA_v3-'))
  let hayPerfiles = false
  for (const f of v3Files) {
    const mdContent = fs.readFileSync(path.join(auditoriaDir, f), 'utf-8')
    if (mdContent.includes('**Perfiles aplicables:**')) hayPerfiles = true
  }
  if (hayPerfiles) {
    assert(html.includes('perfil-chip'), 'index muestra chips de perfiles')
  }

  // Limpiar
  fs.unlinkSync(indexPath)
  for (const f of allMdFiles) {
    const hp = path.join(auditoriaDir, f.replace('.md', '.html'))
    if (fs.existsSync(hp)) fs.unlinkSync(hp)
  }
}

// ============================================
// Test 21: HTML tiene meta qa-slug y data-item-selector
// ============================================
console.log('\n📋 Test 21: meta qa-slug y data-item-selector')
{
  const fixture = `# QA: Test Item Selectors

**Spec:** \`v3-test.md\`
**Fecha:** 2026-04-26
**Auditor(es):** Sergio

## Eje 1 — Funcionalidad
| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 1 | Login funciona | QA | | |
| 2 | Registro ok | DEV | | |

## Eje 2 — Navegabilidad
### Paso 1 — Login como admin
- **Rol:** ADMIN
- **URL de inicio:** /admin
- **Accion:** Login
- **Esperado:** Dashboard
- **Resultado:**

### Paso 2 — Ver logs
- **Rol:** ADMIN
- **URL de inicio:** /admin/logs
- **Accion:** Abrir
- **Esperado:** Tabla de logs
- **Resultado:**

## Eje 3 — Casos borde
| # | Caso | Accion | Esperado | Verificador | Resultado |
|---|------|--------|----------|-------------|-----------|
| 1 | Input vacio | Enviar | Error | QA | |

## Eje 5 — Consistencia visual
| Verificacion | Resultado | Notas |
|-------------|-----------|-------|
| Tipografias | | |
`
  const tmpPath = path.join(__dirname, '_test_selectors.md')
  fs.writeFileSync(tmpPath, fixture)
  generarHtml(tmpPath)
  const htmlPath = tmpPath.replace('.md', '.html')
  const html = fs.readFileSync(htmlPath, 'utf-8')

  // meta qa-slug derivado del nombre del archivo
  assert(html.includes('name="qa-slug"'), 'HTML tiene meta qa-slug')
  assert(html.includes('content="_test_selectors"'), 'qa-slug es el nombre del archivo sin .md')

  // data-item-selector en Eje 1
  assert(html.includes('data-item-selector="eje-1-item-1"'), 'Eje 1 item 1 tiene selector')
  assert(html.includes('data-item-selector="eje-1-item-2"'), 'Eje 1 item 2 tiene selector')

  // data-item-selector en Eje 2
  assert(html.includes('data-item-selector="eje-2-paso-1"'), 'Eje 2 paso 1 tiene selector')
  assert(html.includes('data-item-selector="eje-2-paso-2"'), 'Eje 2 paso 2 tiene selector')

  // data-item-selector en Eje 3
  assert(html.includes('data-item-selector="eje-3-caso-1"'), 'Eje 3 caso 1 tiene selector')

  // data-item-selector en Eje 5
  assert(html.includes('data-item-selector="eje-5-item-1"'), 'Eje 5 item 1 tiene selector')

  // .item-badges container en cada item
  const badgesCount = (html.match(/class="item-badges"/g) || []).length
  assert(badgesCount >= 6, `item-badges containers presentes (${badgesCount} >= 6)`)

  fs.unlinkSync(htmlPath)
  fs.unlinkSync(tmpPath)
}

// ============================================
// Test 22: Script de polling de issues embebido
// ============================================
console.log('\n📋 Test 22: Script de polling de issues')
{
  const fixture = `# QA: Test Polling

**Spec:** \`v3-test.md\`
**Fecha:** 2026-04-26
**Auditor(es):** Sergio

## Eje 1 — Funcionalidad
| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 1 | Test | QA | | |

## Checklist de cierre
- [ ] Done
`
  const tmpPath = path.join(__dirname, '_test_polling.md')
  fs.writeFileSync(tmpPath, fixture)
  generarHtml(tmpPath)
  const htmlPath = tmpPath.replace('.md', '.html')
  const html = fs.readFileSync(htmlPath, 'utf-8')

  // Script de carga de issues
  assert(html.includes('function cargarIssues()'), 'HTML contiene cargarIssues')
  assert(html.includes('setInterval(cargarIssues'), 'HTML contiene polling con setInterval')
  assert(html.includes('crearBadgeIssue'), 'HTML contiene crearBadgeIssue')
  assert(html.includes('actualizarResumen'), 'HTML contiene actualizarResumen')
  assert(html.includes('/by-qa/'), 'HTML hace fetch a /by-qa/')

  // crearIssue envia qaSlug e itemSelector
  assert(html.includes('qaSlug: qaSlug'), 'crearIssue envia qaSlug')
  assert(html.includes('itemSelector: card.dataset.itemSelector'), 'crearIssue envia itemSelector')
  assert(html.includes('verificador: card.dataset.verificador'), 'crearIssue envia verificador')
  assert(html.includes('perfil: card.dataset.perfil'), 'crearIssue envia perfil')

  // Panel de resumen
  assert(html.includes('id="panel-resumen"'), 'HTML tiene panel de resumen')
  assert(html.includes('id="stat-abiertos"'), 'panel tiene stat abiertos')
  assert(html.includes('id="stat-resueltos"'), 'panel tiene stat resueltos')
  assert(html.includes('id="issues-list"'), 'panel tiene lista de issues')

  // CSS de badges de issues
  assert(html.includes('.issue-open'), 'CSS tiene clase issue-open')
  assert(html.includes('.issue-resolved'), 'CSS tiene clase issue-resolved')
  assert(html.includes('.issue-discarded'), 'CSS tiene clase issue-discarded')

  fs.unlinkSync(htmlPath)
  fs.unlinkSync(tmpPath)
}

// Test 23: Index contiene cargarEstadoIndex con polling 5min
// ============================================
console.log('\n📋 Test 23: Index tiene cargarEstadoIndex con polling 5min')
{
  // Crear un QA V3 dummy para que el index tenga algo
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-test-index-estado-'))
  const v3File = path.join(tmpDir, 'QA_v3-test-estado.md')
  fs.writeFileSync(v3File, `# QA: Test Estado Index

**Spec:** \`v3-test.md\`
**Fecha:** 2026-04-26
**Auditor(es):** Sergio

## Eje 1 — Funcionalidad
| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 1 | Test | QA | | |

## Checklist de cierre
- [ ] Done
`)

  const indexPath = generarIndex(tmpDir)
  const html = fs.readFileSync(indexPath, 'utf-8')

  // Script de estado con polling
  assert(html.includes('function cargarEstadoIndex()'), 'Index contiene cargarEstadoIndex')
  assert(html.includes('setInterval(cargarEstadoIndex, 5 * 60 * 1000)'), 'Index tiene polling cada 5 minutos')
  assert(html.includes('/api/feedback/all-qa-v3'), 'Index apunta al endpoint all-qa-v3')
  assert(html.includes('window.cargarEstadoIndex = cargarEstadoIndex'), 'cargarEstadoIndex es global para boton refrescar')

  // Panel global
  assert(html.includes('id="estado-global"'), 'Index tiene panel global de estado')
  assert(html.includes('Issues reportados V3'), 'Panel de issues tiene titulo')
  assert(html.includes('estado-refresh-btn'), 'CSS tiene clase estado-refresh-btn')

  // CSS de badges de estado
  assert(html.includes('.estado-badge-verde'), 'CSS tiene badge verde')
  assert(html.includes('.estado-badge-amarillo'), 'CSS tiene badge amarillo')
  assert(html.includes('.estado-badge-rojo'), 'CSS tiene badge rojo')
  assert(html.includes('.estado-global-panel'), 'CSS tiene estado-global-panel')

  // Cleanup
  fs.rmSync(tmpDir, { recursive: true })
}

// ============================================
// Test 24: Cards V3 tienen estado-resumen y estado-detalle
// ============================================
console.log('\n📋 Test 24: Cards V3 tienen .estado-resumen y .estado-detalle')
{
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-test-cards-estado-'))

  // Un V3 y un V2
  const v3File = path.join(tmpDir, 'QA_v3-test-cards.md')
  fs.writeFileSync(v3File, `# QA: Test Cards V3

**Spec:** \`v3-cards.md\`
**Fecha:** 2026-04-26
**Auditor(es):** Sergio

## Eje 1 — Funcionalidad
| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 1 | Test | QA | | |

## Checklist de cierre
- [ ] Done
`)

  const v2File = path.join(tmpDir, 'QA_v2-test-cards.md')
  fs.writeFileSync(v2File, `# QA: Test Cards V2

**Spec:** \`v2-cards.md\`
**Fecha:** 2026-04-20

## Checklist
- [x] Done
`)

  const indexPath = generarIndex(tmpDir)
  const html = fs.readFileSync(indexPath, 'utf-8')

  // V3 cards tienen contenedores de estado
  assert(html.includes('data-qa-slug="QA_v3-test-cards"'), 'Card V3 tiene data-qa-slug')
  assert(html.includes('class="estado-resumen"'), 'Card V3 tiene .estado-resumen')
  assert(html.includes('class="estado-detalle"'), 'Card V3 tiene .estado-detalle')

  // V2 cards NO tienen contenedores de estado (solo mirar entre section-v2 y el script)
  const v2Start = html.indexOf('id="section-v2"')
  const v2End = html.indexOf('<script>', v2Start)
  const v2Cards = html.substring(v2Start, v2End)
  assert(!v2Cards.includes('estado-resumen'), 'Card V2 NO tiene .estado-resumen')
  assert(!v2Cards.includes('data-qa-slug'), 'Card V2 NO tiene data-qa-slug')

  // Cleanup
  fs.rmSync(tmpDir, { recursive: true })
}

// ============================================
// Test 25: parsearProgreso cuenta items DEV y QA
// ============================================
console.log('\n📋 Test 25: parsearProgreso cuenta items DEV y QA')
{
  const fixture = `# QA: Test Progreso

**Spec:** \`v3-test.md\`
**Fecha:** 2026-04-27
**Auditor(es):** Sergio

## Eje 1 — Funcionalidad
| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 1 | Item uno | DEV | ok | |
| 2 | Item dos | DEV | ok | |
| 3 | Item tres | QA | | |
| 4 | Item cuatro | QA | ok | |
| 5 | Item cinco | DEV | bug | |

## Eje 2 — Navegabilidad

### Paso 1 — Login
- **Verificador:** QA
- **Resultado:** ok

### Paso 2 — Navegar
- **Verificador:** DEV
- **Resultado:** [ ]

## Eje 3 — Casos borde
| # | Caso | Accion | Esperado | Verificador | Resultado |
|---|------|--------|----------|-------------|-----------|
| 1 | Caso uno | hacer algo | algo pasa | DEV | ok |
| 2 | Caso dos | hacer otro | otro pasa | QA | bug |

## Checklist de cierre
- [x] Done
`

  const p = parsearProgreso(fixture)

  // DEV: items 1,2 (ok), 5 (bug) de Eje1 + paso2 (vacio) de Eje2 + caso1 (ok) de Eje3 = 5 total, 3 ok, 1 bug
  assert(p.dev.total === 5, `DEV total es 5 (got ${p.dev.total})`)
  assert(p.dev.ok === 3, `DEV ok es 3 (got ${p.dev.ok})`)
  assert(p.dev.bug === 1, `DEV bug es 1 (got ${p.dev.bug})`)

  // QA: items 3 (vacio), 4 (ok) de Eje1 + paso1 (ok) de Eje2 + caso2 (bug) de Eje3 = 4 total, 2 ok, 1 bug
  assert(p.qa.total === 4, `QA total es 4 (got ${p.qa.total})`)
  assert(p.qa.ok === 2, `QA ok es 2 (got ${p.qa.ok})`)
  assert(p.qa.bug === 1, `QA bug es 1 (got ${p.qa.bug})`)

  // Global
  assert(p.total === 9, `Total es 9 (got ${p.total})`)
  assert(p.verified === 7, `Verificados es 7: 3+1 DEV + 2+1 QA (got ${p.verified})`)
}

// ============================================
// Test 26: Index muestra progreso de verificacion
// ============================================
console.log('\n📋 Test 26: Index muestra progreso de verificacion')
{
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-test-progreso-'))

  const v3File = path.join(tmpDir, 'QA_v3-cookies-seguridad.md')
  fs.writeFileSync(v3File, `# QA: Test Progreso Index

**Spec:** \`v3-cookies-seguridad.md\`
**Fecha:** 2026-04-27
**Auditor(es):** Sergio

## Eje 1 — Funcionalidad
| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 1 | Item DEV ok | DEV | ok | |
| 2 | Item QA pendiente | QA | | |

## Checklist de cierre
- [ ] Done
`)

  const indexPath = generarIndex(tmpDir)
  const html = fs.readFileSync(indexPath, 'utf-8')

  // Panel global de progreso
  assert(html.includes('Progreso de verificacion V3'), 'Index tiene panel de progreso global')
  assert(html.includes('prog-bar-container'), 'Index tiene barra de progreso')
  assert(html.includes('verificados'), 'Index muestra conteo de verificados')

  // Card V3 tiene progreso
  assert(html.includes('qa-progreso'), 'Card V3 tiene seccion de progreso')

  // DEV completo, QA pendiente
  assert(html.includes('DEV: 1/1'), 'Index muestra DEV 1/1')
  assert(html.includes('QA: 0/1'), 'Index muestra QA 0/1')

  // Cleanup
  fs.rmSync(tmpDir, { recursive: true })
}

// ============================================
// Test 27: Index agrupa QAs V3 por bloque, mantiene V2 en lista plana
// ============================================
console.log('\n📋 Test 27: Index agrupa QAs V3 por bloque, mantiene V2 en lista plana')
{
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-test-bloques-'))

  // Crear QAs V3 de diferentes bloques
  fs.writeFileSync(path.join(tmpDir, 'QA_v3-cookies-seguridad.md'), `# QA: Cookies
**Spec:** \`v3-cookies-seguridad.md\`
**Fecha:** 2026-04-27
**Auditor(es):** Sergio
## Checklist de cierre
- [ ] Done
`)
  fs.writeFileSync(path.join(tmpDir, 'QA_v3-rate-limiting.md'), `# QA: Rate Limiting
**Spec:** \`v3-rate-limiting.md\`
**Fecha:** 2026-04-27
**Auditor(es):** Sergio
## Checklist de cierre
- [ ] Done
`)
  fs.writeFileSync(path.join(tmpDir, 'QA_v3-separar-ambientes.md'), `# QA: Separar Ambientes
**Spec:** \`v3-separar-ambientes.md\`
**Fecha:** 2026-04-26
**Auditor(es):** Sergio
## Checklist de cierre
- [ ] Done
`)

  // Crear un QA V2
  fs.writeFileSync(path.join(tmpDir, 'QA_v2-test-historico.md'), `# QA: Test Historico
**Spec:** \`v2-test-historico.md\`
**Fecha:** 2026-01-01
**Auditor(es):** Sergio
## Checklist de cierre
- [ ] Done
`)

  const indexPath = generarIndex(tmpDir)
  const html = fs.readFileSync(indexPath, 'utf-8')

  // V3 agrupados por bloque
  assert(html.includes('Bloque 2'), 'Index tiene Bloque 2 — Seguridad')
  assert(html.includes('Bloque 1'), 'Index tiene Bloque 1 — Infraestructura base')
  assert(html.includes('bloque-section'), 'Index usa class bloque-section')
  assert(html.includes('<details open>'), 'Bloques usan details open')

  // Cookies y rate-limiting estan en Bloque 2
  const b2Start = html.indexOf('Bloque 2')
  const b2End = html.indexOf('Bloque 3', b2Start)
  const b2Section = html.slice(b2Start, b2End > -1 ? b2End : undefined)
  assert(b2Section.includes('cookies-seguridad'), 'Bloque 2 contiene cookies-seguridad')
  assert(b2Section.includes('rate-limiting'), 'Bloque 2 contiene rate-limiting')

  // Separar-ambientes esta en Bloque 1
  const b1Start = html.indexOf('Bloque 1')
  const b1End = html.indexOf('Bloque 2', b1Start)
  const b1Section = html.slice(b1Start, b1End > -1 ? b1End : undefined)
  assert(b1Section.includes('separar-ambientes'), 'Bloque 1 contiene separar-ambientes')

  // V2 esta en seccion aparte, lista plana (no bloques)
  const v2Start = html.indexOf('section-v2')
  const v2Section = html.slice(v2Start)
  assert(v2Section.includes('test-historico'), 'V2 contiene test-historico')
  assert(!v2Section.includes('bloque-section'), 'V2 NO tiene bloque-section')

  // Cleanup
  fs.rmSync(tmpDir, { recursive: true })
}

// ============================================
// Test 28: Bloques sin QAs muestran placeholder
// ============================================
console.log('\n📋 Test 28: Bloques sin QAs muestran placeholder')
{
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-test-placeholder-'))

  // Solo un QA en Bloque 2, el resto de bloques vacios
  fs.writeFileSync(path.join(tmpDir, 'QA_v3-cookies-seguridad.md'), `# QA: Cookies
**Spec:** \`v3-cookies-seguridad.md\`
**Fecha:** 2026-04-27
**Auditor(es):** Sergio
## Checklist de cierre
- [ ] Done
`)

  const indexPath = generarIndex(tmpDir)
  const html = fs.readFileSync(indexPath, 'utf-8')

  // Bloques vacios muestran placeholder
  assert(html.includes('Aun no implementado'), 'Bloques vacios muestran placeholder')

  // Contar placeholders — deberia haber 7 (8 bloques - 1 con QA = 7 vacios)
  const placeholderCount = (html.match(/Aun no implementado/g) || []).length
  assert(placeholderCount === 7, `7 bloques vacios tienen placeholder (encontrados: ${placeholderCount})`)

  // Bloque 2 NO tiene placeholder
  const b2Start = html.indexOf('Bloque 2')
  const b3Start = html.indexOf('Bloque 3', b2Start)
  const b2Section = html.slice(b2Start, b3Start)
  assert(!b2Section.includes('Aun no implementado'), 'Bloque 2 con QA no tiene placeholder')

  // Stats de bloque vacio vs con QA
  assert(html.includes('vacio'), 'Bloques vacios muestran stats "vacio"')

  // Cleanup
  fs.rmSync(tmpDir, { recursive: true })
}

// ============================================
// Test 29: QA V3 no mapeado a bloque aparece en Otros V3
// ============================================
console.log('\n📋 Test 29: QA V3 no mapeado a bloque aparece en Otros V3')
{
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-test-otros-'))

  // QA con nombre que no esta en ningun bloque
  fs.writeFileSync(path.join(tmpDir, 'QA_v3-feature-desconocida.md'), `# QA: Feature Desconocida
**Spec:** \`v3-feature-desconocida.md\`
**Fecha:** 2026-04-27
**Auditor(es):** Sergio
## Checklist de cierre
- [ ] Done
`)

  const indexPath = generarIndex(tmpDir)
  const html = fs.readFileSync(indexPath, 'utf-8')

  assert(html.includes('Otros V3'), 'Index tiene seccion Otros V3')
  assert(html.includes('feature-desconocida'), 'Otros V3 contiene el QA no mapeado')

  // Cleanup
  fs.rmSync(tmpDir, { recursive: true })
}

// ============================================
// TEST 30: parsearMetadata con YAML frontmatter
// ============================================
{
  const header = `---
spec: v3-redefinicion-roles-estado
version: V3
bloque: 3
titulo: "Redefinicion de roles"
fecha: 2026-04-28
autor: Gerardo (Claude Code)
---

# QA: Redefinicion de roles ESTADO (D-01)`

  const meta = parsearMetadata(header)
  assert(meta.spec === 'v3-redefinicion-roles-estado', 'frontmatter: spec parseado correctamente')
  assert(meta.fecha === '2026-04-28', 'frontmatter: fecha parseada correctamente')
  assert(meta.titulo === 'Redefinicion de roles ESTADO (D-01)', 'frontmatter: titulo del # QA sobreescribe frontmatter')
  assert(meta.auditor === 'Gerardo (Claude Code)', 'frontmatter: autor mapeado a auditor')
}

// ============================================
// TEST 31: parsearProgreso con checkboxes sueltos
// ============================================
{
  const md = `# QA: Test

## Eje 1 — Funcionalidad

### 1.1 Items verificados
- [x] Login como ESTADO — ok
- [x] Sidebar muestra 8 items — ok
- [ ] Filtrar por nivel

### 1.2 Items pendientes
- [ ] Click en un taller
- [ ] Ver tabs
`

  const progreso = parsearProgreso(md)
  assert(progreso.total === 5, 'checkboxes: cuenta 5 items totales, obtuvo ' + progreso.total)
  assert(progreso.verified === 2, 'checkboxes: 2 verificados (los [x]), obtuvo ' + progreso.verified)
}

// ============================================
// TEST 32: parsearProgreso cuenta ✅ Gerardo como verificado
// ============================================
{
  const md = `# QA: Test

## Eje 1 — Funcionalidad

| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 1 | DB existe | DEV | ✅ Gerardo 28/4 | |
| 2 | Migraciones ok | DEV | ✅ Gerardo 28/4 | |
| 3 | Seed funciona | DEV | | |
| 4 | Banner visible | QA | ok | |
| 5 | Login funciona | QA | | |
`

  const progreso = parsearProgreso(md)
  assert(progreso.dev.total === 3, 'emoji: 3 items DEV totales, obtuvo ' + progreso.dev.total)
  assert(progreso.dev.ok === 2, 'emoji: 2 items DEV verificados con ✅, obtuvo ' + progreso.dev.ok)
  assert(progreso.qa.total === 2, 'emoji: 2 items QA totales, obtuvo ' + progreso.qa.total)
  assert(progreso.qa.ok === 1, 'emoji: 1 item QA verificado con ok, obtuvo ' + progreso.qa.ok)
  assert(progreso.verified === 3, 'emoji: 3 verificados total (2 DEV + 1 QA), obtuvo ' + progreso.verified)
}

// ============================================
// TEST 34: parsearCheckboxes extrae items de checkboxes
// ============================================
{
  const contenido = `### 1.1 Login
- [x] Login como ESTADO — ✅ Gerardo 28/4
- [ ] Verificar sidebar
- [x] Click en taller — ok
`
  const items = parsearCheckboxes(contenido)
  assert(items.length === 3, 'parsearCheckboxes: 3 items, obtuvo ' + items.length)
  assert(items[0].verificador === 'DEV', 'parsearCheckboxes: item con ✅ Gerardo es DEV')
  assert(items[0].preStatus === '✅', 'parsearCheckboxes: item [x] tiene preStatus ✅')
  assert(items[1].verificador === 'QA', 'parsearCheckboxes: item sin marca es QA')
  assert(items[1].preStatus === '', 'parsearCheckboxes: item [ ] tiene preStatus vacio')
  assert(items[2].preStatus === '✅', 'parsearCheckboxes: segundo [x] tiene preStatus ✅')
}

// ============================================
// TEST 35: renderItemCard genera HTML con data attributes
// ============================================
{
  const html = renderItemCard('1', 3, 'Verificar login', 'DEV', '✅')
  assert(html.includes('data-eje="1"'), 'renderItemCard: tiene data-eje')
  assert(html.includes('data-num="3"'), 'renderItemCard: tiene data-num')
  assert(html.includes('data-verificador="DEV"'), 'renderItemCard: tiene data-verificador DEV')
  assert(html.includes('Verificar login'), 'renderItemCard: contiene texto')
  assert(html.includes('data-pre-status="✅"'), 'renderItemCard: tiene pre-status cuando verificado')

  const html2 = renderItemCard('2', 1, 'Item QA', 'QA', '')
  assert(html2.includes('data-verificador="QA"'), 'renderItemCard: QA sin pre-status')
  assert(!html2.includes('data-pre-status'), 'renderItemCard: sin pre-status cuando vacio')
}

// ============================================
// TEST 33: esResultadoVerificado rechaza valores vacios/pendientes
// ============================================
{
  assert(esResultadoVerificado('') === false, 'vacio no es verificado')
  assert(esResultadoVerificado('—') === false, 'guion largo no es verificado')
  assert(esResultadoVerificado('n/a') === false, 'n/a no es verificado')
  assert(esResultadoVerificado('pendiente') === false, 'pendiente no es verificado')
  assert(esResultadoVerificado('tbd') === false, 'tbd no es verificado')
  assert(esResultadoVerificado('ok') === 'ok', 'ok es verificado')
  assert(esResultadoVerificado('✅ Gerardo 28/4') === 'ok', '✅ con texto es verificado')
  assert(esResultadoVerificado('bug') === 'bug', 'bug es bug')
  assert(esResultadoVerificado('ok — verificado con E2E') === 'ok', 'ok con nota es verificado')
}

// ============================================
// RESUMEN
// ============================================
console.log('\n' + '='.repeat(50))
console.log(`Resultados: ${passed} passed, ${failed} failed, ${passed + failed} total`)
if (failed > 0) {
  console.log('⚠️  Hay tests que fallaron!')
  process.exit(1)
} else {
  console.log('✅ Todos los tests pasaron!')
}
