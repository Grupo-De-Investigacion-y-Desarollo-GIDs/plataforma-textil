#!/usr/bin/env node
/**
 * Generador QA: .md → .html interactivo
 *
 * Uso: node tools/generate-qa.js .claude/auditorias/QA_v2-xxx.md
 * Salida: .claude/auditorias/QA_v2-xxx.html (misma carpeta)
 *
 * Sin dependencias externas — solo fs y path.
 */

const fs = require('fs')
const path = require('path')

// ============================================
// PARSING
// ============================================

/**
 * Normaliza texto para comparación: quita tildes y pasa a minúsculas.
 */
function normalizar(text) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

/**
 * Parsea metadata del header del .md (líneas antes del primer ##)
 */
function parsearMetadata(header) {
  const meta = { titulo: '', spec: '', commit: '', url: '', fecha: '', auditor: '' }

  const tituloMatch = header.match(/^#\s+QA:\s*(.+)$/m)
  if (tituloMatch) meta.titulo = tituloMatch[1].trim()

  const specMatch = header.match(/\*\*Spec:\*\*\s*`([^`]+)`/m)
  if (specMatch) meta.spec = specMatch[1].trim()

  const commitMatch = header.match(/\*\*Commit de implementaci[oó]n:\*\*\s*`([^`]+)`/m)
  if (commitMatch) meta.commit = commitMatch[1].trim()

  const urlMatch = header.match(/\*\*URL de prueba:\*\*\s*(\S+)/m)
  if (urlMatch) meta.url = urlMatch[1].trim()

  const fechaMatch = header.match(/\*\*Fecha:\*\*\s*(.+)$/m)
  if (fechaMatch) meta.fecha = fechaMatch[1].trim()

  const auditorMatch = header.match(/\*\*Auditor:\*\*\s*(.+)$/m)
  if (auditorMatch) meta.auditor = auditorMatch[1].trim()

  return meta
}

/**
 * Divide el .md en secciones por headings ## (nivel 2).
 * Retorna: [{ nombre, nombreNorm, contenido }]
 */
function dividirSecciones(contenido) {
  const lineas = contenido.split('\n')
  const secciones = []
  let seccionActual = null
  let headerLines = []
  let foundFirstSection = false

  for (const linea of lineas) {
    const h2Match = linea.match(/^##\s+(.+)$/)
    if (h2Match && !linea.startsWith('###')) {
      if (!foundFirstSection) {
        // Todo antes del primer ## es el header
        foundFirstSection = true
      }
      if (seccionActual) {
        secciones.push(seccionActual)
      }
      seccionActual = {
        nombre: h2Match[1].trim(),
        nombreNorm: normalizar(h2Match[1]),
        contenido: ''
      }
    } else if (!foundFirstSection) {
      headerLines.push(linea)
    } else if (seccionActual) {
      seccionActual.contenido += linea + '\n'
    }
  }
  if (seccionActual) secciones.push(seccionActual)

  return { header: headerLines.join('\n'), secciones }
}

/**
 * Parsea una tabla markdown.
 * Retorna: [{ col1: valor, col2: valor, ... }]
 */
function parsearTabla(texto) {
  const lineas = texto.split('\n').filter(l => l.trim().startsWith('|'))
  if (lineas.length < 2) return []

  const headers = lineas[0].split('|').map(c => c.trim()).filter(Boolean)
  // Skip separator line (index 1)
  const filas = []
  for (let i = 2; i < lineas.length; i++) {
    const celdas = lineas[i].split('|').map(c => c.trim()).filter(Boolean)
    if (celdas.length === 0) continue
    const fila = {}
    headers.forEach((h, idx) => {
      fila[normalizar(h)] = celdas[idx] || ''
    })
    filas.push(fila)
  }
  return filas
}

/**
 * Parsea los pasos de Eje 2 (### Paso N — título)
 */
function parsearPasos(contenido) {
  const pasos = []
  const bloques = contenido.split(/^### /m).filter(Boolean)

  for (const bloque of bloques) {
    const lineas = bloque.split('\n')
    const tituloMatch = lineas[0].match(/Paso\s+(\d+)\s*[—–-]\s*(.+)/)
    if (!tituloMatch) continue

    const paso = {
      numero: parseInt(tituloMatch[1]),
      titulo: tituloMatch[2].trim(),
      rol: '',
      url: '',
      accion: '',
      esperado: '',
      resultado: '',
      notas: ''
    }

    let campoActual = null
    for (let i = 1; i < lineas.length; i++) {
      const l = lineas[i]
      const campoMatch = l.match(/^-\s+\*\*(.+?):\*\*\s*(.*)$/)
      if (campoMatch) {
        const campo = normalizar(campoMatch[1])
        const valor = campoMatch[2].trim()
        if (campo === 'rol') { paso.rol = valor; campoActual = 'rol' }
        else if (campo.includes('url')) { paso.url = valor; campoActual = 'url' }
        else if (campo.includes('accion')) { paso.accion = valor; campoActual = 'accion' }
        else if (campo.includes('esperado')) { paso.esperado = valor; campoActual = 'esperado' }
        else if (campo.includes('resultado')) { paso.resultado = valor; campoActual = 'resultado' }
        else if (campo.includes('nota')) { paso.notas = valor; campoActual = 'notas' }
      } else if (campoActual && l.match(/^\s{2,}/)) {
        // Continuación de campo multilínea
        paso[campoActual] += '\n' + l.trim()
      } else if (l.trim() === '') {
        // Línea vacía no corta el campo
      } else if (campoActual && !l.startsWith('#') && !l.startsWith('>')) {
        paso[campoActual] += '\n' + l.trim()
      }
    }

    // Limpiar valores
    for (const key of Object.keys(paso)) {
      if (typeof paso[key] === 'string') paso[key] = paso[key].trim()
    }

    pasos.push(paso)
  }
  return pasos
}

/**
 * Parsea el checklist de cierre (líneas que empiezan con - [ ])
 */
function parsearChecklist(contenido) {
  const items = []
  const lineas = contenido.split('\n')
  for (const l of lineas) {
    const match = l.match(/^-\s+\[.*?\]\s*(.+)$/)
    if (match) items.push(match[1].trim())
  }
  return items
}

/**
 * Parsea los radio buttons de resultado global
 */
function parsearResultadoGlobal(contenido) {
  const opciones = []
  const lineas = contenido.split('\n')
  let decision = ''
  let issues = ''

  for (const l of lineas) {
    const checkMatch = l.match(/^-\s+\[.*?\]\s*(.+)$/)
    if (checkMatch) opciones.push(checkMatch[1].trim())

    const decisionMatch = l.match(/\*\*Decisi[oó]n:\*\*\s*(.+)$/i)
    if (decisionMatch) decision = decisionMatch[1].trim()

    const issuesMatch = l.match(/\*\*Issues abiertos:\*\*\s*(.+)$/i)
    if (issuesMatch) issues = issuesMatch[1].trim()
  }

  return { opciones, decision, issues }
}

// ============================================
// HTML RENDERING
// ============================================

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderMetaHeader(meta) {
  return `
    <div class="header">
      <h1>${escapeHtml(meta.titulo)}</h1>
      <div class="meta-grid">
        <div class="meta-item"><span class="meta-label">Spec:</span> <code>${escapeHtml(meta.spec)}</code></div>
        ${meta.commit ? `<div class="meta-item"><span class="meta-label">Commit:</span> <code>${escapeHtml(meta.commit)}</code></div>` : ''}
        ${meta.url ? `<div class="meta-item"><span class="meta-label">URL:</span> <a href="${escapeHtml(meta.url)}" target="_blank">${escapeHtml(meta.url)}</a></div>` : ''}
        <div class="meta-item"><span class="meta-label">Fecha:</span> ${escapeHtml(meta.fecha)}</div>
        <div class="meta-item"><span class="meta-label">Auditor:</span> ${escapeHtml(meta.auditor)}</div>
      </div>
    </div>`
}

function renderCredenciales(contenido) {
  const filas = parsearTabla(contenido)
  if (filas.length === 0) return `<div class="section"><h2>Credenciales de prueba</h2><p class="text-muted">Sin credenciales</p></div>`

  let html = `<div class="section collapsible collapsed" onclick="toggleCollapse(this)">
    <h2>Credenciales de prueba <span class="collapse-icon">&#9654;</span></h2>
    <div class="collapse-content">
    <table class="cred-table"><thead><tr><th>Rol</th><th>Email</th><th>Password</th><th>URL</th></tr></thead><tbody>`

  for (const f of filas) {
    html += `<tr>
      <td>${escapeHtml(f.rol || '')}</td>
      <td><code>${escapeHtml(f.email || '')}</code></td>
      <td><code>${escapeHtml(f.password || '')}</code></td>
      <td><code>${escapeHtml(f['url de entrada'] || '')}</code></td>
    </tr>`
  }
  html += `</tbody></table></div></div>`
  return html
}

function renderComoTrabajar(contenido) {
  return `<div class="section collapsible collapsed" onclick="toggleCollapse(this)">
    <h2>Como trabajar con este documento <span class="collapse-icon">&#9654;</span></h2>
    <div class="collapse-content"><div class="readonly-block">${escapeHtml(contenido.trim())}</div></div>
  </div>`
}

function renderResultadoGlobal(contenido) {
  const { opciones, decision } = parsearResultadoGlobal(contenido)
  const ids = ['aprobado', 'aprobado-fixes', 'rechazado']
  const labels = ['Aprobado', 'Aprobado con fixes', 'Rechazado']
  const emojis = ['✅', '🔧', '❌']

  let html = `<div class="section" id="resultado-global"><h2>Resultado global</h2><div class="radio-group">`
  for (let i = 0; i < 3; i++) {
    html += `<label class="radio-btn" data-value="${ids[i]}">
      <input type="radio" name="resultado-global" value="${ids[i]}">
      <span class="radio-label">${emojis[i]} ${labels[i]}</span>
    </label>`
  }
  html += `</div>
    <div class="field-group">
      <label>Decision:</label>
      <input type="text" id="decision-global" placeholder="cerrar v2 / fix inmediato / abrir item v3" class="text-input">
    </div>
    <div class="field-group">
      <label>Issues abiertos:</label>
      <input type="text" id="issues-global" placeholder="#" class="text-input">
    </div>
  </div>`
  return html
}

function renderEje1(contenido) {
  const filas = parsearTabla(contenido)
  let html = `<div class="section" id="eje1"><h2>Eje 1 — Funcionalidad</h2>`

  for (let i = 0; i < filas.length; i++) {
    const f = filas[i]
    const num = f['#'] || (i + 1)
    const criterio = f.criterio || ''
    html += `<div class="item-card" data-eje="1" data-num="${num}">
      <div class="item-header">
        <span class="item-num">#${escapeHtml(String(num))}</span>
        <span class="item-text">${escapeHtml(criterio)}</span>
      </div>
      <div class="item-controls">
        <div class="status-btns">
          <button class="status-btn ok" onclick="setStatus(this, '✅')" title="OK">✅</button>
          <button class="status-btn bug" onclick="setStatus(this, '🐛')" title="Bug menor">🐛</button>
          <button class="status-btn fail" onclick="setStatus(this, '❌')" title="Bloqueante">❌</button>
        </div>
        <input type="text" class="obs-input" placeholder="Observaciones..." data-field="obs">
        <button class="btn-issue" onclick="crearIssue(this)">📋 Crear issue</button>
      </div>
    </div>`
  }
  html += `</div>`
  return html
}

function renderEje2(contenido) {
  const pasos = parsearPasos(contenido)
  let html = `<div class="section" id="eje2"><h2>Eje 2 — Navegabilidad</h2>`

  for (const p of pasos) {
    html += `<div class="paso-card" data-eje="2" data-num="${p.numero}">
      <div class="paso-header" onclick="togglePaso(this)">
        <span class="paso-title">Paso ${p.numero} — ${escapeHtml(p.titulo)}</span>
        <div class="paso-header-right">
          <span class="paso-status-indicator"></span>
          <span class="collapse-icon">&#9654;</span>
        </div>
      </div>
      <div class="paso-body">
        <div class="paso-fields">
          ${p.rol ? `<div class="paso-field"><span class="paso-label">Rol:</span> ${escapeHtml(p.rol)}</div>` : ''}
          ${p.url ? `<div class="paso-field"><span class="paso-label">URL:</span> <code>${escapeHtml(p.url)}</code></div>` : ''}
          ${p.accion ? `<div class="paso-field"><span class="paso-label">Accion:</span><div class="paso-value">${escapeHtml(p.accion)}</div></div>` : ''}
          ${p.esperado ? `<div class="paso-field"><span class="paso-label">Esperado:</span><div class="paso-value">${escapeHtml(p.esperado)}</div></div>` : ''}
        </div>
        <div class="item-controls">
          <div class="status-btns">
            <button class="status-btn ok" onclick="setStatus(this, '✅')" title="OK">✅</button>
            <button class="status-btn bug" onclick="setStatus(this, '🐛')" title="Bug menor">🐛</button>
            <button class="status-btn fail" onclick="setStatus(this, '❌')" title="Bloqueante">❌</button>
          </div>
          <textarea class="obs-textarea" placeholder="Resultado / Notas..." data-field="obs" rows="2">${escapeHtml(p.notas || '')}</textarea>
          <button class="btn-issue" onclick="crearIssue(this)">📋 Crear issue</button>
        </div>
      </div>
    </div>`
  }
  html += `</div>`
  return html
}

function renderEje3(contenido) {
  const filas = parsearTabla(contenido)
  let html = `<div class="section" id="eje3"><h2>Eje 3 — Casos borde</h2>`

  for (let i = 0; i < filas.length; i++) {
    const f = filas[i]
    const num = f['#'] || (i + 1)
    html += `<div class="item-card" data-eje="3" data-num="${num}">
      <div class="item-header">
        <span class="item-num">#${escapeHtml(String(num))}</span>
        <span class="item-text">${escapeHtml(f.caso || '')}</span>
      </div>
      <div class="item-details">
        ${f.accion ? `<div class="detail-row"><span class="detail-label">Accion:</span> ${escapeHtml(f.accion)}</div>` : ''}
        ${f.esperado ? `<div class="detail-row"><span class="detail-label">Esperado:</span> ${escapeHtml(f.esperado)}</div>` : ''}
      </div>
      <div class="item-controls">
        <div class="status-btns">
          <button class="status-btn ok" onclick="setStatus(this, '✅')" title="OK">✅</button>
          <button class="status-btn bug" onclick="setStatus(this, '🐛')" title="Bug menor">🐛</button>
          <button class="status-btn fail" onclick="setStatus(this, '❌')" title="Bloqueante">❌</button>
        </div>
        <input type="text" class="obs-input" placeholder="Observaciones..." data-field="obs">
        <button class="btn-issue" onclick="crearIssue(this)">📋 Crear issue</button>
      </div>
    </div>`
  }
  html += `</div>`
  return html
}

function renderEje4(contenido) {
  const filas = parsearTabla(contenido)
  let html = `<div class="section" id="eje4"><h2>Eje 4 — Performance</h2>`

  for (let i = 0; i < filas.length; i++) {
    const f = filas[i]
    html += `<div class="item-card compact" data-eje="4" data-num="${i + 1}">
      <div class="item-header">
        <span class="item-text">${escapeHtml(f.verificacion || '')}</span>
      </div>
      ${f.metodo ? `<div class="item-details"><span class="detail-label">Metodo:</span> ${escapeHtml(f.metodo)}</div>` : ''}
      <div class="item-controls">
        <div class="status-btns">
          <button class="status-btn ok" onclick="setStatus(this, '✅')" title="OK">✅</button>
          <button class="status-btn bug" onclick="setStatus(this, '🐛')" title="Bug">🐛</button>
        </div>
        <input type="text" class="obs-input" placeholder="Notas..." data-field="obs">
      </div>
    </div>`
  }
  html += `</div>`
  return html
}

function renderEje5(contenido) {
  const filas = parsearTabla(contenido)
  let html = `<div class="section" id="eje5"><h2>Eje 5 — Consistencia visual</h2>`

  for (let i = 0; i < filas.length; i++) {
    const f = filas[i]
    html += `<div class="item-card compact" data-eje="5" data-num="${i + 1}">
      <div class="item-header">
        <span class="item-text">${escapeHtml(f.verificacion || '')}</span>
      </div>
      <div class="item-controls">
        <div class="status-btns">
          <button class="status-btn ok" onclick="setStatus(this, '✅')" title="OK">✅</button>
          <button class="status-btn bug" onclick="setStatus(this, '🐛')" title="Bug">🐛</button>
        </div>
        <input type="text" class="obs-input" placeholder="Notas..." data-field="obs">
      </div>
    </div>`
  }
  html += `</div>`
  return html
}

function renderResumenIssues() {
  return `<div class="section" id="resumen-issues">
    <h2>Resumen de issues abiertos</h2>
    <textarea class="large-textarea" id="textarea-resumen-issues" placeholder="Listar issues abiertos con # y descripcion breve" rows="4"></textarea>
  </div>`
}

function renderNotasAuditor() {
  return `<div class="section" id="notas-auditor">
    <h2>Notas del auditor</h2>
    <textarea class="large-textarea" id="textarea-notas" placeholder="Observaciones generales, sugerencias de UX, contexto adicional..." rows="6"></textarea>
  </div>`
}

function renderChecklist(contenido) {
  const items = parsearChecklist(contenido)
  let html = `<div class="section" id="checklist"><h2>Checklist de cierre</h2><div class="checklist-items">`
  for (let i = 0; i < items.length; i++) {
    html += `<label class="checklist-item">
      <input type="checkbox" data-checklist="${i}">
      <span>${escapeHtml(items[i])}</span>
    </label>`
  }
  html += `</div></div>`
  return html
}

function renderSeccionDesconocida(nombre, contenido) {
  return `<div class="section unknown">
    <h2>${escapeHtml(nombre)}</h2>
    <pre class="readonly-block">${escapeHtml(contenido.trim())}</pre>
  </div>`
}

// ============================================
// SECCION → RENDERER MAPPING
// ============================================

const SECCION_MAP = {
  'como trabajar con este documento': renderComoTrabajar,
  'credenciales de prueba': renderCredenciales,
  'resultado global': renderResultadoGlobal,
  'eje 1': renderEje1,
  'eje 2': renderEje2,
  'eje 3': renderEje3,
  'eje 4': renderEje4,
  'eje 5': renderEje5,
  'resumen de issues abiertos': renderResumenIssues,
  'notas del auditor': renderNotasAuditor,
  'checklist de cierre': renderChecklist,
}

function encontrarRenderer(nombreNorm) {
  for (const [key, renderer] of Object.entries(SECCION_MAP)) {
    if (nombreNorm.startsWith(normalizar(key))) return renderer
  }
  return null
}

// ============================================
// CSS
// ============================================

const CSS = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: system-ui, -apple-system, sans-serif;
    background: #f5f7fa;
    color: #1a1a2e;
    line-height: 1.5;
    padding: 20px;
    padding-bottom: 80px;
  }
  .container { max-width: 900px; margin: 0 auto; }
  .header {
    background: #1e3a5f;
    color: white;
    padding: 24px 28px;
    border-radius: 12px;
    margin-bottom: 20px;
  }
  .header h1 { font-size: 22px; margin-bottom: 12px; }
  .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 13px; opacity: 0.9; }
  .meta-label { font-weight: 600; }
  .meta-item a { color: #7fb3ff; }
  .meta-item code { background: rgba(255,255,255,0.15); padding: 1px 5px; border-radius: 3px; font-size: 12px; }
  .section {
    background: white;
    border-radius: 10px;
    padding: 20px 24px;
    margin-bottom: 16px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  }
  .section h2 {
    font-size: 17px;
    color: #1e3a5f;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 2px solid #e8ecf1;
    cursor: default;
  }
  .collapsible { cursor: pointer; }
  .collapsible h2 { cursor: pointer; display: flex; align-items: center; justify-content: space-between; }
  .collapse-icon { font-size: 12px; color: #999; transition: transform 0.2s; }
  .collapsed .collapse-content { display: none; }
  .collapsed .collapse-icon { transform: rotate(0deg); }
  .collapsible:not(.collapsed) .collapse-icon { transform: rotate(90deg); }
  .readonly-block {
    background: #f8f9fa;
    border: 1px solid #e2e5ea;
    border-radius: 6px;
    padding: 12px 16px;
    font-size: 13px;
    white-space: pre-wrap;
    color: #555;
  }
  .cred-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .cred-table th { background: #f0f2f5; padding: 8px 10px; text-align: left; font-weight: 600; color: #444; }
  .cred-table td { padding: 6px 10px; border-bottom: 1px solid #eee; }
  .cred-table code { background: #f0f2f5; padding: 1px 4px; border-radius: 3px; font-size: 12px; }
  .radio-group { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
  .radio-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 14px;
    border: 2px solid #ddd;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.15s;
  }
  .radio-btn:hover { border-color: #1e3a5f; }
  .radio-btn.selected { border-color: #1e3a5f; background: #eef3f9; }
  .radio-btn input { display: none; }
  .field-group { margin-bottom: 10px; }
  .field-group label { font-size: 13px; font-weight: 600; color: #555; display: block; margin-bottom: 4px; }
  .text-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
  }
  .text-input:focus, .obs-input:focus, .obs-textarea:focus, .large-textarea:focus {
    outline: none;
    border-color: #1e3a5f;
    box-shadow: 0 0 0 2px rgba(30,58,95,0.15);
  }
  .item-card {
    border: 1px solid #e8ecf1;
    border-radius: 8px;
    padding: 14px 16px;
    margin-bottom: 10px;
    transition: border-color 0.15s;
  }
  .item-card.status-ok { border-left: 4px solid #27ae60; }
  .item-card.status-bug { border-left: 4px solid #f39c12; }
  .item-card.status-fail { border-left: 4px solid #c0392b; }
  .item-header { display: flex; gap: 10px; margin-bottom: 8px; align-items: flex-start; }
  .item-num { font-weight: 700; color: #1e3a5f; min-width: 30px; font-size: 14px; }
  .item-text { font-size: 14px; flex: 1; }
  .item-details { margin-bottom: 10px; padding: 8px 12px; background: #f8f9fa; border-radius: 6px; font-size: 13px; }
  .detail-row { margin-bottom: 4px; }
  .detail-label { font-weight: 600; color: #666; }
  .item-controls { display: flex; gap: 12px; align-items: flex-start; flex-wrap: wrap; }
  .status-btns { display: flex; gap: 4px; flex-shrink: 0; }
  .status-btn {
    width: 36px; height: 36px;
    border: 2px solid #ddd;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    font-size: 16px;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
  }
  .status-btn:hover { transform: scale(1.1); }
  .status-btn.active { border-color: #1e3a5f; background: #eef3f9; transform: scale(1.1); }
  .obs-input {
    flex: 1;
    min-width: 200px;
    padding: 7px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 13px;
    font-family: inherit;
  }
  .obs-textarea {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 13px;
    font-family: inherit;
    resize: vertical;
  }
  .large-textarea {
    width: 100%;
    padding: 12px 14px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
    resize: vertical;
  }
  .paso-card {
    border: 1px solid #e8ecf1;
    border-radius: 8px;
    margin-bottom: 10px;
    overflow: hidden;
  }
  .paso-card.status-ok { border-left: 4px solid #27ae60; }
  .paso-card.status-bug { border-left: 4px solid #f39c12; }
  .paso-card.status-fail { border-left: 4px solid #c0392b; }
  .paso-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 16px;
    cursor: pointer;
    background: #fafbfc;
    border-bottom: 1px solid transparent;
  }
  .paso-header:hover { background: #f0f2f5; }
  .paso-header-right { display: flex; align-items: center; gap: 8px; }
  .paso-status-indicator { font-size: 16px; }
  .paso-title { font-weight: 600; font-size: 14px; color: #1e3a5f; }
  .paso-body { display: none; padding: 16px; }
  .paso-card.expanded .paso-body { display: block; }
  .paso-card.expanded .paso-header { border-bottom: 1px solid #e8ecf1; }
  .paso-card.expanded .collapse-icon { transform: rotate(90deg); }
  .paso-fields { margin-bottom: 12px; }
  .paso-field { margin-bottom: 6px; font-size: 13px; }
  .paso-label { font-weight: 600; color: #555; }
  .paso-value { margin-top: 2px; padding-left: 0; white-space: pre-wrap; }
  .checklist-items { display: flex; flex-direction: column; gap: 8px; }
  .checklist-item {
    display: flex; align-items: flex-start; gap: 8px;
    padding: 8px 10px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
  }
  .checklist-item:hover { background: #f5f7fa; }
  .checklist-item input { margin-top: 3px; width: 16px; height: 16px; cursor: pointer; }
  .unknown { border-left: 3px solid #f39c12; }
  .text-muted { color: #999; font-size: 13px; }
  .sticky-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    border-top: 2px solid #1e3a5f;
    padding: 12px 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    z-index: 100;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  }
  .btn-copiar {
    background: #1e3a5f;
    color: white;
    border: none;
    padding: 10px 28px;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
  }
  .btn-copiar:hover { background: #2a4f7f; }
  .btn-copiar.copiado { background: #27ae60; }
  .progress-summary { font-size: 13px; color: #666; }
  .btn-issue {
    display: none;
    align-items: center;
    gap: 4px;
    padding: 5px 10px;
    border: 1px solid #c0392b;
    border-radius: 6px;
    background: white;
    color: #c0392b;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
  }
  .btn-issue:hover { background: #fdf0ef; }
  .btn-issue.visible { display: inline-flex; }
  .btn-issue.enviado { border-color: #27ae60; color: #27ae60; cursor: default; }
  .btn-issue.error { border-color: #e74c3c; color: #e74c3c; }
  .btn-issue:disabled { opacity: 0.6; cursor: not-allowed; }
  @media (max-width: 600px) {
    body { padding: 10px; padding-bottom: 80px; }
    .meta-grid { grid-template-columns: 1fr; }
    .item-controls { flex-direction: column; }
    .obs-input { min-width: 100%; }
    .radio-group { flex-direction: column; }
  }
`

// ============================================
// JS
// ============================================

const JS = `
  function toggleCollapse(el) {
    if (el.querySelector('.collapse-content')) {
      el.classList.toggle('collapsed');
    }
  }

  function togglePaso(header) {
    header.closest('.paso-card').classList.toggle('expanded');
  }

  function setStatus(btn, emoji) {
    const card = btn.closest('.item-card, .paso-card');
    const btns = card.querySelectorAll('.status-btn');
    const wasActive = btn.classList.contains('active');
    btns.forEach(b => b.classList.remove('active'));
    card.classList.remove('status-ok', 'status-bug', 'status-fail');

    if (!wasActive) {
      btn.classList.add('active');
      if (emoji === '✅') card.classList.add('status-ok');
      else if (emoji === '🐛') card.classList.add('status-bug');
      else if (emoji === '❌') card.classList.add('status-fail');
    }

    // Update paso status indicator
    const indicator = card.querySelector('.paso-status-indicator');
    if (indicator) {
      indicator.textContent = wasActive ? '' : emoji;
    }

    // Show/hide issue button for bug/fail
    const issueBtn = card.querySelector('.btn-issue');
    if (issueBtn && !issueBtn.classList.contains('enviado')) {
      if (!wasActive && (emoji === '🐛' || emoji === '❌')) {
        issueBtn.classList.add('visible');
      } else {
        issueBtn.classList.remove('visible');
      }
    }

    updateProgress();
  }

  function updateProgress() {
    const cards = document.querySelectorAll('.item-card, .paso-card');
    let total = 0, done = 0;
    cards.forEach(c => {
      total++;
      if (c.querySelector('.status-btn.active')) done++;
    });
    const el = document.getElementById('progress-text');
    if (el) el.textContent = done + ' / ' + total + ' completados';
  }

  function getCardStatus(card) {
    const active = card.querySelector('.status-btn.active');
    if (!active) return '—';
    if (active.classList.contains('ok')) return '✅';
    if (active.classList.contains('bug')) return '🐛';
    if (active.classList.contains('fail')) return '❌';
    return '—';
  }

  function getCardObs(card) {
    const input = card.querySelector('.obs-input, .obs-textarea');
    return input ? input.value.trim() : '';
  }

  function copiarResultados() {
    const titulo = document.querySelector('.header h1')?.textContent || 'QA';
    const fecha = new Date().toISOString().split('T')[0];
    let md = '';

    // Resultado global
    const globalRadio = document.querySelector('input[name="resultado-global"]:checked');
    const globalLabel = globalRadio ? globalRadio.closest('.radio-btn').querySelector('.radio-label').textContent.trim() : '—';
    const decision = document.getElementById('decision-global')?.value.trim() || '—';
    const issues = document.getElementById('issues-global')?.value.trim() || '#';

    md += '## Resultados — ' + titulo + '\\n';
    md += '**Fecha de auditoria:** ' + fecha + '\\n';
    md += '**Auditor:** Sergio\\n\\n';
    md += '### Resultado global\\n';
    md += globalLabel + '\\n';
    md += '**Decision:** ' + decision + '\\n';
    md += '**Issues abiertos:** ' + issues + '\\n\\n';

    // Eje 1
    const eje1Cards = document.querySelectorAll('#eje1 .item-card');
    if (eje1Cards.length > 0) {
      md += '### Eje 1 — Funcionalidad\\n';
      md += '| # | Criterio | Resultado | Observaciones |\\n';
      md += '|---|----------|-----------|---------------|\\n';
      eje1Cards.forEach(c => {
        const num = c.dataset.num;
        const criterio = c.querySelector('.item-text')?.textContent.trim() || '';
        const status = getCardStatus(c);
        const obs = getCardObs(c);
        md += '| ' + num + ' | ' + criterio + ' | ' + status + ' | ' + obs + ' |\\n';
      });
      md += '\\n';
    }

    // Eje 2
    const eje2Cards = document.querySelectorAll('#eje2 .paso-card');
    if (eje2Cards.length > 0) {
      md += '### Eje 2 — Navegabilidad\\n';
      eje2Cards.forEach(c => {
        const num = c.dataset.num;
        const titulo = c.querySelector('.paso-title')?.textContent.trim() || '';
        const status = getCardStatus(c);
        const obs = getCardObs(c);
        md += '**' + titulo + ':** ' + status;
        if (obs) md += ' — ' + obs;
        md += '\\n';
      });
      md += '\\n';
    }

    // Eje 3
    const eje3Cards = document.querySelectorAll('#eje3 .item-card');
    if (eje3Cards.length > 0) {
      md += '### Eje 3 — Casos borde\\n';
      md += '| # | Caso | Resultado | Observaciones |\\n';
      md += '|---|------|-----------|---------------|\\n';
      eje3Cards.forEach(c => {
        const num = c.dataset.num;
        const caso = c.querySelector('.item-text')?.textContent.trim() || '';
        const status = getCardStatus(c);
        const obs = getCardObs(c);
        md += '| ' + num + ' | ' + caso + ' | ' + status + ' | ' + obs + ' |\\n';
      });
      md += '\\n';
    }

    // Eje 4
    const eje4Cards = document.querySelectorAll('#eje4 .item-card');
    if (eje4Cards.length > 0) {
      md += '### Eje 4 — Performance\\n';
      md += '| Verificacion | Resultado | Notas |\\n';
      md += '|-------------|-----------|-------|\\n';
      eje4Cards.forEach(c => {
        const verif = c.querySelector('.item-text')?.textContent.trim() || '';
        const status = getCardStatus(c);
        const obs = getCardObs(c);
        md += '| ' + verif + ' | ' + status + ' | ' + obs + ' |\\n';
      });
      md += '\\n';
    }

    // Eje 5
    const eje5Cards = document.querySelectorAll('#eje5 .item-card');
    if (eje5Cards.length > 0) {
      md += '### Eje 5 — Consistencia visual\\n';
      md += '| Verificacion | Resultado | Notas |\\n';
      md += '|-------------|-----------|-------|\\n';
      eje5Cards.forEach(c => {
        const verif = c.querySelector('.item-text')?.textContent.trim() || '';
        const status = getCardStatus(c);
        const obs = getCardObs(c);
        md += '| ' + verif + ' | ' + status + ' | ' + obs + ' |\\n';
      });
      md += '\\n';
    }

    // Resumen issues
    const resumenIssues = document.getElementById('textarea-resumen-issues')?.value.trim();
    if (resumenIssues) {
      md += '### Resumen de issues abiertos\\n';
      md += resumenIssues + '\\n\\n';
    }

    // Notas
    const notas = document.getElementById('textarea-notas')?.value.trim();
    if (notas) {
      md += '### Notas del auditor\\n';
      md += notas + '\\n\\n';
    }

    // Checklist
    const checkItems = document.querySelectorAll('#checklist input[type="checkbox"]');
    if (checkItems.length > 0) {
      md += '### Checklist de cierre\\n';
      checkItems.forEach(cb => {
        const label = cb.closest('.checklist-item')?.querySelector('span')?.textContent.trim() || '';
        md += '- [' + (cb.checked ? 'x' : ' ') + '] ' + label + '\\n';
      });
    }

    navigator.clipboard.writeText(md).then(() => {
      const btn = document.getElementById('btn-copiar');
      btn.textContent = 'Copiado!';
      btn.classList.add('copiado');
      setTimeout(() => {
        btn.textContent = 'Copiar resultados como markdown';
        btn.classList.remove('copiado');
      }, 2000);
    });
  }

  function crearIssue(btn) {
    const card = btn.closest('.item-card, .paso-card');
    const obs = getCardObs(card);
    if (!obs || obs.length < 10) {
      btn.title = 'Escribi una observacion primero (min 10 caracteres)';
      btn.classList.add('error');
      btn.textContent = 'Escribi una observacion';
      setTimeout(() => { btn.classList.remove('error'); btn.textContent = '📋 Crear issue'; }, 2000);
      return;
    }

    const status = getCardStatus(card);
    const tipo = status === '❌' ? 'bloqueante' : 'bug';
    const eje = card.closest('.section')?.querySelector('h2')?.textContent.trim() || '';
    const itemText = card.querySelector('.item-text, .paso-title')?.textContent.trim() || '';
    const num = card.dataset.num || '';
    const spec = document.body.dataset.spec || '';
    const pagina = document.body.dataset.url || '';

    btn.disabled = true;
    btn.textContent = 'Enviando...';

    const apiUrl = document.body.dataset.apiUrl;

    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: tipo,
        mensaje: obs,
        pagina: pagina,
        auditorNombre: 'Sergio',
        auditorRol: 'QA',
        contextoQA: {
          spec: spec,
          eje: eje,
          item: '#' + num + ' ' + itemText,
          resultado: status
        }
      })
    }).then(r => {
      if (r.ok) {
        btn.textContent = '✅ Issue creado';
        btn.classList.add('enviado');
      } else {
        throw new Error();
      }
    }).catch(() => {
      btn.textContent = '❌ Error — reintenta';
      btn.classList.add('error');
      btn.disabled = false;
      setTimeout(() => { btn.classList.remove('error'); btn.textContent = '📋 Crear issue'; }, 3000);
    });
  }

  // Init radio buttons
  document.querySelectorAll('.radio-btn').forEach(label => {
    label.addEventListener('click', () => {
      const radio = label.querySelector('input[type="radio"]');
      radio.checked = true;
      label.closest('.radio-group').querySelectorAll('.radio-btn').forEach(l => l.classList.remove('selected'));
      label.classList.add('selected');
    });
  });

  updateProgress();
`

// ============================================
// ASSEMBLER
// ============================================

function generarHtml(mdPath) {
  const contenidoMd = fs.readFileSync(mdPath, 'utf-8')
  const { header, secciones } = dividirSecciones(contenidoMd)
  const meta = parsearMetadata(header)
  const plataformaUrl = process.env.PLATAFORMA_URL || 'https://plataforma-textil.vercel.app'
  const apiUrl = plataformaUrl + '/api/feedback'

  let bodyHtml = renderMetaHeader(meta)

  for (const seccion of secciones) {
    const renderer = encontrarRenderer(seccion.nombreNorm)
    if (renderer) {
      // renderResumenIssues y renderNotasAuditor no need content arg
      if (renderer === renderResumenIssues || renderer === renderNotasAuditor) {
        bodyHtml += renderer()
      } else {
        bodyHtml += renderer(seccion.contenido)
      }
    } else {
      bodyHtml += renderSeccionDesconocida(seccion.nombre, seccion.contenido)
    }
  }

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QA: ${escapeHtml(meta.titulo)}</title>
  <style>${CSS}</style>
</head>
<body data-spec="${escapeHtml(meta.spec)}" data-url="${escapeHtml(meta.url)}" data-api-url="${escapeHtml(apiUrl)}">
  <div class="container">
    ${bodyHtml}
  </div>
  <div class="sticky-bar">
    <span class="progress-summary" id="progress-text"></span>
    <button class="btn-copiar" id="btn-copiar" onclick="copiarResultados()">Copiar resultados como markdown</button>
  </div>
  <script>${JS}</script>
</body>
</html>`

  const outputPath = mdPath.replace(/\.md$/, '.html')
  fs.writeFileSync(outputPath, html, 'utf-8')
  return outputPath
}

// ============================================
// INDEX GENERATOR
// ============================================

/**
 * Genera un index.html con cards para cada QA_v2-*.md en el directorio.
 * Lee metadata de cada .md para mostrar título, fecha y spec.
 */
function generarIndex(dirPath) {
  const archivos = fs.readdirSync(dirPath)
    .filter(f => f.startsWith('QA_v2-') && f.endsWith('.md'))
    .sort()

  const qas = archivos.map(archivo => {
    const mdContent = fs.readFileSync(path.join(dirPath, archivo), 'utf-8')
    const headerEnd = mdContent.indexOf('\n## ')
    const headerText = headerEnd > -1 ? mdContent.slice(0, headerEnd) : mdContent
    const meta = parsearMetadata(headerText)
    const htmlFile = archivo.replace('.md', '.html')
    const htmlExists = fs.existsSync(path.join(dirPath, htmlFile))
    return { archivo, htmlFile, htmlExists, meta }
  })

  const INDEX_CSS = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #f5f7fa;
      color: #1a1a2e;
      line-height: 1.5;
      padding: 20px;
    }
    .container { max-width: 900px; margin: 0 auto; }
    .index-header {
      background: #1e3a5f;
      color: white;
      padding: 24px 28px;
      border-radius: 12px;
      margin-bottom: 24px;
    }
    .index-header h1 { font-size: 22px; margin-bottom: 4px; }
    .index-header p { font-size: 14px; opacity: 0.8; }
    .qa-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
    .qa-card {
      background: white;
      border: 1px solid #e8ecf1;
      border-radius: 10px;
      padding: 18px 22px;
      text-decoration: none;
      color: inherit;
      transition: all 0.15s;
      display: block;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .qa-card:hover { border-color: #1e3a5f; box-shadow: 0 2px 8px rgba(30,58,95,0.15); transform: translateY(-1px); }
    .qa-card.disabled { opacity: 0.5; pointer-events: none; }
    .qa-title { font-size: 16px; font-weight: 600; color: #1e3a5f; margin-bottom: 8px; }
    .qa-meta { display: flex; gap: 16px; font-size: 13px; color: #666; flex-wrap: wrap; }
    .qa-meta-item { display: flex; align-items: center; gap: 4px; }
    .qa-meta-label { font-weight: 600; color: #888; }
    .qa-badge {
      display: inline-block;
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 600;
    }
    .badge-ready { background: #e8f5e9; color: #2e7d32; }
    .badge-pending { background: #fff3e0; color: #e65100; }
    @media (max-width: 600px) {
      body { padding: 10px; }
      .qa-meta { flex-direction: column; gap: 4px; }
    }
  `

  let cardsHtml = ''
  for (const qa of qas) {
    const tag = qa.htmlExists
      ? '<span class="qa-badge badge-ready">HTML listo</span>'
      : '<span class="qa-badge badge-pending">Sin generar</span>'
    const cardTag = qa.htmlExists ? 'a' : 'div'
    const href = qa.htmlExists ? ` href="${escapeHtml(qa.htmlFile)}"` : ''
    const disabledClass = qa.htmlExists ? '' : ' disabled'

    cardsHtml += `
      <${cardTag}${href} class="qa-card${disabledClass}">
        <div class="qa-title">${escapeHtml(qa.meta.titulo || qa.archivo)}</div>
        <div class="qa-meta">
          <div class="qa-meta-item"><span class="qa-meta-label">Spec:</span> <code>${escapeHtml(qa.meta.spec || '—')}</code></div>
          <div class="qa-meta-item"><span class="qa-meta-label">Fecha:</span> ${escapeHtml(qa.meta.fecha || '—')}</div>
          <div class="qa-meta-item">${tag}</div>
        </div>
      </${cardTag}>`
  }

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QA Index — Plataforma Digital Textil</title>
  <style>${INDEX_CSS}</style>
</head>
<body>
  <div class="container">
    <div class="index-header">
      <h1>Auditorias QA</h1>
      <p>${qas.length} documentos de auditoria</p>
    </div>
    <div class="qa-grid">
      ${cardsHtml}
    </div>
  </div>
</body>
</html>`

  const outputPath = path.join(dirPath, 'index.html')
  fs.writeFileSync(outputPath, html, 'utf-8')
  return outputPath
}

// ============================================
// CLI
// ============================================

if (require.main === module) {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.error('Uso:')
    console.error('  node tools/generate-qa.js <ruta-al-QA.md>        # genera HTML individual')
    console.error('  node tools/generate-qa.js --index <directorio>   # genera index.html')
    console.error('')
    console.error('Ejemplo:')
    console.error('  node tools/generate-qa.js .claude/auditorias/QA_v2-epica-academia.md')
    console.error('  node tools/generate-qa.js --index .claude/auditorias/')
    process.exit(1)
  }

  if (args[0] === '--index') {
    const dir = path.resolve(args[1] || '.')
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
      console.error(`Error: directorio no encontrado: ${dir}`)
      process.exit(1)
    }
    const outputPath = generarIndex(dir)
    console.log(`✅ Index generado: ${outputPath}`)
  } else {
    const mdPath = path.resolve(args[0])
    if (!fs.existsSync(mdPath)) {
      console.error(`Error: archivo no encontrado: ${mdPath}`)
      process.exit(1)
    }
    const outputPath = generarHtml(mdPath)
    console.log(`✅ HTML generado: ${outputPath}`)
  }
}

// Export para tests
module.exports = {
  normalizar,
  parsearMetadata,
  dividirSecciones,
  parsearTabla,
  parsearPasos,
  parsearChecklist,
  parsearResultadoGlobal,
  generarHtml,
  generarIndex,
}
