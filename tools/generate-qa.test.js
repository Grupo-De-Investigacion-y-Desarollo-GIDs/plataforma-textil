#!/usr/bin/env node
/**
 * Tests para generate-qa.js
 * Correr: node tools/generate-qa.test.js
 */

const fs = require('fs')
const path = require('path')
const {
  normalizar,
  parsearMetadata,
  dividirSecciones,
  parsearTabla,
  parsearPasos,
  parsearChecklist,
  parsearResultadoGlobal,
  generarHtml,
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
