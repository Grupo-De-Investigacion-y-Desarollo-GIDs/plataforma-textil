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
/**
 * Parsea YAML frontmatter delimitado por --- al inicio del archivo.
 * Retorna objeto con los campos encontrados, o null si no hay frontmatter.
 */
function parsearFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return null
  const fm = {}
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^(\w[\w_]*):\s*"?(.+?)"?\s*$/)
    if (kv) fm[kv[1]] = kv[2]
  }
  return fm
}

function parsearMetadata(header) {
  const meta = { titulo: '', spec: '', commit: '', url: '', fecha: '', auditor: '', incluyeEje6: false, perfiles: [] }

  // Intentar YAML frontmatter primero
  const fm = parsearFrontmatter(header)
  if (fm) {
    if (fm.titulo) meta.titulo = fm.titulo
    if (fm.spec) meta.spec = fm.spec
    if (fm.fecha) meta.fecha = fm.fecha
    if (fm.autor) meta.auditor = fm.autor
    if (fm.version) meta.commit = fm.version
  }

  // Titulo desde # QA: ... (funciona con y sin frontmatter)
  const tituloMatch = header.match(/^#\s+QA:\s*(.+)$/m)
  if (tituloMatch) meta.titulo = tituloMatch[1].trim()

  // Fallback inline markdown (sobreescribe frontmatter si ambos existen)
  const specMatch = header.match(/\*\*Spec:\*\*\s*`([^`]+)`/m)
  if (specMatch) meta.spec = specMatch[1].trim()

  const commitMatch = header.match(/\*\*Commit de implementaci[oó]n:\*\*\s*`([^`]+)`/m)
  if (commitMatch) meta.commit = commitMatch[1].trim()

  const urlMatch = header.match(/\*\*URL de prueba:\*\*\s*(\S+)/m)
  if (urlMatch) meta.url = urlMatch[1].trim()

  const fechaMatch = header.match(/\*\*Fecha:\*\*\s*(.+)$/m)
  if (fechaMatch) meta.fecha = fechaMatch[1].trim()

  // V3: Auditor(es) o Auditor
  const auditorMatch = header.match(/\*\*Auditor(?:\(es\))?:\*\*\s*(.+)$/m)
  if (auditorMatch) meta.auditor = auditorMatch[1].trim()

  // V3: Flag Eje 6
  const eje6Match = header.match(/\*\*Incluye Eje 6.*?:\*\*\s*(.+)$/m)
  if (eje6Match) meta.incluyeEje6 = normalizar(eje6Match[1]) === 'si'

  // V3: Perfiles aplicables
  const perfilesMatch = header.match(/\*\*Perfiles aplicables:\*\*\s*(.+)$/m)
  if (perfilesMatch) meta.perfiles = perfilesMatch[1].split(',').map(p => p.trim())

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

function badgeVerificador(verificador) {
  const v = (verificador || 'QA').trim()
  const cls = v.includes('DEV') ? 'badge-dev' : 'badge-qa'
  return `<span class="${cls}">${escapeHtml(v)}</span>`
}

function renderEje1(contenido) {
  const filas = parsearTabla(contenido)
  let html = `<div class="section" id="eje1"><h2>Eje 1 — Funcionalidad</h2>`

  for (let i = 0; i < filas.length; i++) {
    const f = filas[i]
    const num = f['#'] || (i + 1)
    const criterio = f.criterio || ''
    const verificador = f.verificador || 'QA'
    const dataVerif = verificador.includes('DEV') ? 'DEV' : 'QA'
    html += `<div class="item-card" data-eje="1" data-num="${num}" data-verificador="${dataVerif}" data-item-selector="eje-1-item-${num}">
      <div class="item-header">
        <span class="item-num">#${escapeHtml(String(num))}</span>
        <span class="item-text">${escapeHtml(criterio)}</span>
        ${badgeVerificador(verificador)}
      </div>
      <div class="item-badges"></div>
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
    html += `<div class="paso-card" data-eje="2" data-num="${p.numero}" data-item-selector="eje-2-paso-${p.numero}">
      <div class="paso-header" onclick="togglePaso(this)">
        <span class="paso-title">Paso ${p.numero} — ${escapeHtml(p.titulo)}</span>
        <div class="paso-header-right">
          <span class="paso-status-indicator"></span>
          <span class="collapse-icon">&#9654;</span>
        </div>
      </div>
      <div class="paso-body">
        <div class="item-badges"></div>
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
    const verificador3 = f.verificador || 'QA'
    const dataVerif3 = verificador3.includes('DEV') ? 'DEV' : 'QA'
    html += `<div class="item-card" data-eje="3" data-num="${num}" data-verificador="${dataVerif3}" data-item-selector="eje-3-caso-${num}">
      <div class="item-header">
        <span class="item-num">#${escapeHtml(String(num))}</span>
        <span class="item-text">${escapeHtml(f.caso || '')}</span>
        ${badgeVerificador(verificador3)}
      </div>
      <div class="item-badges"></div>
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
    const verificador4 = f.verificador || 'QA'
    const dataVerif4 = verificador4.includes('DEV') ? 'DEV' : 'QA'
    html += `<div class="item-card compact" data-eje="4" data-num="${i + 1}" data-verificador="${dataVerif4}" data-item-selector="eje-4-item-${i + 1}">
      <div class="item-header">
        <span class="item-text">${escapeHtml(f.verificacion || '')}</span>
        ${badgeVerificador(verificador4)}
      </div>
      <div class="item-badges"></div>
      ${f.metodo ? `<div class="item-details"><span class="detail-label">Metodo:</span> ${escapeHtml(f.metodo)}</div>` : ''}
      <div class="item-controls">
        <div class="status-btns">
          <button class="status-btn ok" onclick="setStatus(this, '✅')" title="OK">✅</button>
          <button class="status-btn bug" onclick="setStatus(this, '🐛')" title="Bug">🐛</button>
        </div>
        <input type="text" class="obs-input" placeholder="Notas..." data-field="obs">
        <button class="btn-issue" onclick="crearIssue(this)">📋 Crear issue</button>
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
    html += `<div class="item-card compact" data-eje="5" data-num="${i + 1}" data-item-selector="eje-5-item-${i + 1}">
      <div class="item-header">
        <span class="item-text">${escapeHtml(f.verificacion || '')}</span>
      </div>
      <div class="item-badges"></div>
      <div class="item-controls">
        <div class="status-btns">
          <button class="status-btn ok" onclick="setStatus(this, '✅')" title="OK">✅</button>
          <button class="status-btn bug" onclick="setStatus(this, '🐛')" title="Bug">🐛</button>
        </div>
        <input type="text" class="obs-input" placeholder="Notas..." data-field="obs">
        <button class="btn-issue" onclick="crearIssue(this)">📋 Crear issue</button>
      </div>
    </div>`
  }
  html += `</div>`
  return html
}

function renderContextoInstitucional(contenido) {
  return `<div class="section" id="contexto-institucional">
    <h2>Contexto institucional</h2>
    <div class="readonly-block">${escapeHtml(contenido.trim())}</div>
  </div>`
}

function renderObjetivo(contenido) {
  return `<div class="section" id="objetivo-qa">
    <h2>Objetivo de este QA</h2>
    <div class="readonly-block">${escapeHtml(contenido.trim())}</div>
  </div>`
}

/**
 * Parsea subsecciones ### dentro del Eje 6 por perfil.
 * Cada ### es un perfil (Politologo, Economista, Sociologo, Contador).
 */
function renderEje6(contenido) {
  const bloques = contenido.split(/^### /m).filter(Boolean)
  let html = `<div class="section" id="eje6"><h2>Eje 6 — Validacion de dominio</h2>`

  for (const bloque of bloques) {
    const lineas = bloque.split('\n')
    const titulo = lineas[0].trim()
    // Extraer nombre del perfil (primera palabra antes del —)
    const perfilMatch = titulo.match(/^(\w+)/)
    const perfil = perfilMatch ? normalizar(perfilMatch[1]) : 'todos'
    const restContent = lineas.slice(1).join('\n')
    const filas = parsearTabla(restContent)

    html += `<div class="section collapsible collapsed" onclick="toggleCollapse(this)" data-perfil="${escapeHtml(perfil)}">
      <h2>${escapeHtml(titulo)} <span class="collapse-icon">&#9654;</span></h2>
      <div class="collapse-content">`

    for (let i = 0; i < filas.length; i++) {
      const f = filas[i]
      const num = f['#'] || (i + 1)
      const pregunta = f.pregunta || ''
      html += `<div class="item-card" data-eje="6" data-num="${num}" data-verificador="perfil" data-perfil="${escapeHtml(perfil)}" data-item-selector="eje-6-${escapeHtml(perfil)}-${num}">
        <div class="item-header">
          <span class="item-num">#${escapeHtml(String(num))}</span>
          <span class="item-text">${escapeHtml(pregunta)}</span>
          <span class="badge-perfil">${escapeHtml(perfil)}</span>
        </div>
        <div class="item-badges"></div>
        <div class="item-controls">
          <div class="status-btns">
            <button class="status-btn ok" onclick="setStatus(this, '✅')" title="OK">✅</button>
            <button class="status-btn bug" onclick="setStatus(this, '🐛')" title="Observacion">🐛</button>
          </div>
          <textarea class="obs-textarea" placeholder="Notas del perfil..." data-field="obs" rows="2"></textarea>
          <button class="btn-issue" onclick="crearIssue(this)">📋 Crear issue</button>
        </div>
      </div>`
    }
    html += `</div></div>`
  }
  html += `</div>`
  return html
}

function renderNotasAuditores() {
  return `<div class="section" id="notas-auditores">
    <h2>Notas de los auditores</h2>
    <div class="field-group">
      <label>Sergio (tecnico):</label>
      <textarea class="large-textarea" id="textarea-notas-tecnico" placeholder="Observaciones tecnicas..." rows="4"></textarea>
    </div>
    <div class="field-group">
      <label>Perfiles interdisciplinarios:</label>
      <textarea class="large-textarea" id="textarea-notas-perfiles" placeholder="Observaciones de dominio..." rows="4"></textarea>
    </div>
  </div>`
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
  'contexto institucional': renderContextoInstitucional,
  'objetivo de este qa': renderObjetivo,
  'credenciales de prueba': renderCredenciales,
  'resultado global': renderResultadoGlobal,
  'eje 1': renderEje1,
  'eje 2': renderEje2,
  'eje 3': renderEje3,
  'eje 4': renderEje4,
  'eje 5': renderEje5,
  'eje 6': renderEje6,
  'resumen de issues abiertos': renderResumenIssues,
  'notas del auditor': renderNotasAuditor,
  'notas de los auditores': renderNotasAuditores,
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
  .badge-qa {
    display: inline-block;
    font-size: 10px;
    padding: 2px 7px;
    border-radius: 4px;
    font-weight: 700;
    background: #e3f2fd;
    color: #1565c0;
    margin-left: 8px;
    flex-shrink: 0;
  }
  .badge-dev {
    display: inline-block;
    font-size: 10px;
    padding: 2px 7px;
    border-radius: 4px;
    font-weight: 700;
    background: #f3e5f5;
    color: #7b1fa2;
    margin-left: 8px;
    flex-shrink: 0;
  }
  .badge-perfil {
    display: inline-block;
    font-size: 10px;
    padding: 2px 7px;
    border-radius: 4px;
    font-weight: 700;
    background: #fff3e0;
    color: #e65100;
    margin-left: 8px;
    flex-shrink: 0;
    text-transform: capitalize;
  }
  .filter-bar {
    display: flex;
    gap: 6px;
    align-items: center;
    flex-wrap: wrap;
    background: white;
    border-radius: 10px;
    padding: 12px 16px;
    margin-bottom: 16px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  }
  .filter-label { font-size: 13px; font-weight: 600; color: #555; margin-right: 4px; }
  .filter-btn {
    padding: 5px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    background: white;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    color: #555;
    transition: all 0.15s;
  }
  .filter-btn:hover { border-color: #1e3a5f; color: #1e3a5f; }
  .filter-btn.active { background: #1e3a5f; color: white; border-color: #1e3a5f; }
  .item-badges { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 4px; }
  .issue-badge {
    display: inline-block; font-size: 11px; padding: 2px 8px;
    border-radius: 4px; font-weight: 600; text-decoration: none;
    cursor: pointer; transition: opacity 0.15s;
  }
  .issue-badge:hover { opacity: 0.8; }
  .issue-open { background: #fce4e4; color: #c0392b; }
  .issue-resolved { background: #e8f5e9; color: #2e7d32; }
  .issue-discarded { background: #f0f0f0; color: #888; }
  .issue-stats { display: flex; gap: 12px; margin: 8px 0 12px; }
  .issue-stat {
    font-size: 13px; font-weight: 600; padding: 4px 12px;
    border-radius: 6px;
  }
  .stat-open { background: #fce4e4; color: #c0392b; }
  .stat-resolved { background: #e8f5e9; color: #2e7d32; }
  .stat-discarded { background: #f0f0f0; color: #888; }
  .issues-list { margin-top: 8px; }
  .issue-row { padding: 6px 0; border-bottom: 1px solid #f0f0f0; font-size: 13px; display: flex; align-items: center; gap: 8px; }
  .issue-link { color: #1e3a5f; font-weight: 600; text-decoration: none; }
  .issue-link:hover { text-decoration: underline; }
  .issue-title { flex: 1; color: #555; }
  .issue-badge-small { font-size: 10px; padding: 1px 6px; border-radius: 3px; font-weight: 600; }
  @media (max-width: 600px) {
    body { padding: 10px; padding-bottom: 80px; }
    .meta-grid { grid-template-columns: 1fr; }
    .item-controls { flex-direction: column; }
    .obs-input { min-width: 100%; }
    .radio-group { flex-direction: column; }
    .filter-bar { flex-direction: column; align-items: flex-start; }
    .issue-stats { flex-direction: column; gap: 4px; }
  }
`

// ============================================
// JS
// ============================================

const JS = `
  function filtrarPor(tipo) {
    // Reset todos los botones de filtro
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.filter-btn[data-filter="' + tipo + '"]').classList.add('active');

    document.querySelectorAll('.item-card, .paso-card').forEach(c => {
      if (tipo === 'todos') { c.style.display = ''; return; }
      const verif = c.dataset.verificador || 'QA';
      const perfil = c.dataset.perfil || '';
      if (tipo === 'QA' || tipo === 'DEV') {
        c.style.display = verif === tipo ? '' : 'none';
      } else {
        // Filtro por perfil interdisciplinario
        c.style.display = perfil === tipo ? '' : 'none';
      }
    });
    // Ocultar/mostrar secciones de ejes vacias
    document.querySelectorAll('.section[id^="eje"]').forEach(s => {
      const visible = s.querySelectorAll('.item-card:not([style*="none"]), .paso-card:not([style*="none"])');
      s.style.display = visible.length === 0 ? 'none' : '';
    });
    // Secciones dentro de eje6 (colapsables de perfil)
    document.querySelectorAll('#eje6 .collapsible').forEach(s => {
      const visible = s.querySelectorAll('.item-card:not([style*="none"])');
      s.style.display = visible.length === 0 ? 'none' : '';
    });
  }

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

    // Eje 6
    const eje6Cards = document.querySelectorAll('#eje6 .item-card');
    if (eje6Cards.length > 0) {
      md += '### Eje 6 — Validacion de dominio\\n';
      md += '| # | Pregunta | Perfil | Resultado | Notas |\\n';
      md += '|---|----------|--------|-----------|-------|\\n';
      eje6Cards.forEach(c => {
        const num = c.dataset.num;
        const pregunta = c.querySelector('.item-text')?.textContent.trim() || '';
        const perfil = c.dataset.perfil || '';
        const status = getCardStatus(c);
        const obs = getCardObs(c);
        md += '| ' + num + ' | ' + pregunta + ' | ' + perfil + ' | ' + status + ' | ' + obs + ' |\\n';
      });
      md += '\\n';
    }

    // Resumen issues
    const resumenIssues = document.getElementById('textarea-resumen-issues')?.value.trim();
    if (resumenIssues) {
      md += '### Resumen de issues abiertos\\n';
      md += resumenIssues + '\\n\\n';
    }

    // Notas (V2: textarea-notas, V3: textarea-notas-tecnico + textarea-notas-perfiles)
    const notas = document.getElementById('textarea-notas')?.value.trim();
    if (notas) {
      md += '### Notas del auditor\\n';
      md += notas + '\\n\\n';
    }
    const notasTecnico = document.getElementById('textarea-notas-tecnico')?.value.trim();
    const notasPerfiles = document.getElementById('textarea-notas-perfiles')?.value.trim();
    if (notasTecnico || notasPerfiles) {
      md += '### Notas de los auditores\\n';
      if (notasTecnico) md += '**Sergio (tecnico):** ' + notasTecnico + '\\n';
      if (notasPerfiles) md += '**Perfiles interdisciplinarios:** ' + notasPerfiles + '\\n';
      md += '\\n';
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
    const slugMeta = document.querySelector('meta[name="qa-slug"]');
    const qaSlug = slugMeta ? slugMeta.content : '';

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
          resultado: status,
          qaSlug: qaSlug,
          itemSelector: card.dataset.itemSelector || '',
          verificador: card.dataset.verificador || 'QA',
          perfil: card.dataset.perfil || 'tecnico'
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
// ISSUES JS (polling + badges)
// ============================================

const ISSUES_JS = `
  (function() {
    var apiBase = document.body.dataset.apiUrl;
    if (!apiBase) return;
    // apiUrl apunta a .../api/feedback — by-qa es relativo a eso
    var feedbackBase = apiBase.replace('/api/feedback', '/api/feedback/by-qa/');
    var slugMeta = document.querySelector('meta[name="qa-slug"]');
    if (!slugMeta) return;
    var qaSlug = slugMeta.content;

    function crearBadgeIssue(issue) {
      var a = document.createElement('a');
      a.href = issue.url;
      a.target = '_blank';
      a.className = 'issue-badge issue-' + (
        issue.state === 'open' ? 'open' :
        issue.stateReason === 'completed' ? 'resolved' : 'discarded'
      );
      a.textContent = '#' + issue.number + ' — ' + (
        issue.state === 'open' ? 'Abierto' :
        issue.stateReason === 'completed' ? 'Resuelto' : 'Descartado'
      );
      return a;
    }

    function actualizarResumen(issues) {
      var open = 0, resolved = 0, discarded = 0;
      issues.forEach(function(i) {
        if (i.state === 'open') open++;
        else if (i.stateReason === 'completed') resolved++;
        else discarded++;
      });
      var el;
      el = document.getElementById('stat-abiertos'); if (el) el.textContent = open + ' abiertos';
      el = document.getElementById('stat-resueltos'); if (el) el.textContent = resolved + ' resueltos';
      el = document.getElementById('stat-descartados'); if (el) el.textContent = discarded + ' descartados';

      var list = document.getElementById('issues-list');
      if (list) {
        list.innerHTML = '';
        if (issues.length === 0) {
          list.innerHTML = '<p class="text-muted">Sin issues reportados</p>';
        } else {
          issues.forEach(function(issue) {
            var row = document.createElement('div');
            row.className = 'issue-row';
            row.innerHTML = '<a href="' + issue.url + '" target="_blank" class="issue-link">#' + issue.number + '</a> ' +
              '<span class="issue-title">' + (issue.title || '') + '</span> ' +
              '<span class="issue-badge-small issue-' + (issue.state === 'open' ? 'open' : issue.stateReason === 'completed' ? 'resolved' : 'discarded') + '">' +
              (issue.state === 'open' ? 'Abierto' : issue.stateReason === 'completed' ? 'Resuelto' : 'Descartado') + '</span>';
            list.appendChild(row);
          });
        }
      }
    }

    function cargarIssues() {
      fetch(feedbackBase + qaSlug)
        .then(function(res) { if (!res.ok) throw new Error(); return res.json(); })
        .then(function(data) {
          document.querySelectorAll('.issue-badge').forEach(function(b) { b.remove(); });

          data.issues.forEach(function(issue) {
            if (!issue.itemSelector) return;
            var item = document.querySelector('[data-item-selector="' + issue.itemSelector + '"]');
            if (!item) return;
            var container = item.querySelector('.item-badges');
            if (container) container.appendChild(crearBadgeIssue(issue));
          });

          actualizarResumen(data.issues);

          var status = document.getElementById('github-status');
          if (status) status.textContent = 'Actualizado: ' + new Date(data.lastUpdated).toLocaleString('es-AR');
        })
        .catch(function() {
          var status = document.getElementById('github-status');
          if (status) status.textContent = 'No se pudo cargar estado de issues';
        });
    }

    cargarIssues();
    setInterval(cargarIssues, 2 * 60 * 1000);
  })();
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

  // V3: filtros por verificador/perfil
  bodyHtml += `<div class="filter-bar" id="filter-bar">
    <span class="filter-label">Filtrar:</span>
    <button class="filter-btn active" data-filter="todos" onclick="filtrarPor('todos')">Todos</button>
    <button class="filter-btn" data-filter="QA" onclick="filtrarPor('QA')">QA tecnico</button>
    <button class="filter-btn" data-filter="DEV" onclick="filtrarPor('DEV')">DEV</button>
    ${meta.incluyeEje6 && meta.perfiles.length > 0 ? meta.perfiles.map(p =>
      `<button class="filter-btn" data-filter="${escapeHtml(normalizar(p))}" onclick="filtrarPor('${escapeHtml(normalizar(p))}')">${escapeHtml(p)}</button>`
    ).join('') : ''}
  </div>`

  for (const seccion of secciones) {
    const renderer = encontrarRenderer(seccion.nombreNorm)
    if (renderer) {
      // renderers sin argumentos de contenido
      if (renderer === renderResumenIssues || renderer === renderNotasAuditor || renderer === renderNotasAuditores) {
        bodyHtml += renderer()
      } else {
        bodyHtml += renderer(seccion.contenido)
      }
    } else {
      bodyHtml += renderSeccionDesconocida(seccion.nombre, seccion.contenido)
    }
  }

  // Derivar qaSlug del nombre del archivo .md (sin extension ni path)
  const qaSlug = path.basename(mdPath, '.md')

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="qa-slug" content="${escapeHtml(qaSlug)}">
  <title>QA: ${escapeHtml(meta.titulo)}</title>
  <style>${CSS}</style>
</head>
<body data-spec="${escapeHtml(meta.spec)}" data-url="${escapeHtml(meta.url)}" data-api-url="${escapeHtml(apiUrl)}">
  <div class="container">
    ${bodyHtml}
  </div>
  <div class="section" id="panel-resumen">
    <h2>Resumen de issues</h2>
    <div id="github-status" class="text-muted"></div>
    <div class="issue-stats">
      <span class="issue-stat stat-open" id="stat-abiertos">0 abiertos</span>
      <span class="issue-stat stat-resolved" id="stat-resueltos">0 resueltos</span>
      <span class="issue-stat stat-discarded" id="stat-descartados">0 descartados</span>
    </div>
    <div id="issues-list" class="issues-list"></div>
  </div>
  </div>
  <div class="sticky-bar">
    <span class="progress-summary" id="progress-text"></span>
    <button class="btn-copiar" id="btn-copiar" onclick="copiarResultados()">Copiar resultados como markdown</button>
  </div>
  <script>${JS}</script>
  <script>${ISSUES_JS}</script>
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
 * Genera un index.html con cards para cada QA_v2/v3-*.md en el directorio.
 * V3 arriba (en curso), V2 abajo (historico, colapsado).
 */
/**
 * Parsea un .md de QA V3 y cuenta items de verificación por verificador.
 * Busca en tablas (Eje 1, 3, 4, 5) y pasos (Eje 2).
 * Retorna: { dev: { total, ok, bug }, qa: { total, ok, bug }, total, verified }
 */
/**
 * Determina si un resultado de tabla/checkbox cuenta como "verificado".
 * Acepta: ok, ✅, texto que empiece con ✅, "verificado".
 * Rechaza: vacío, —, n/a, tbd, pendiente.
 */
function esResultadoVerificado(resultado) {
  if (!resultado) return false
  const r = resultado.trim().toLowerCase()
  if (!r || r === '—' || r === '-' || r === 'n/a' || r === 'tbd' || r === 'pendiente' || r === '[ ]') return false
  if (r === 'ok' || r.startsWith('ok ') || r.startsWith('ok—') || r.startsWith('ok,')) return 'ok'
  if (resultado.trim().startsWith('✅') || r.startsWith('verificado')) return 'ok'
  if (r === 'bug' || r === 'bloqueante') return 'bug'
  // Cualquier otro texto no vacío y no-pendiente = verificado
  return 'ok'
}

function parsearProgreso(mdContent) {
  const stats = {
    dev: { total: 0, ok: 0, bug: 0 },
    qa: { total: 0, ok: 0, bug: 0 },
  }

  const lineas = mdContent.split('\n')
  let enChecklist = false

  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i]

    // Detectar seccion "Checklist de cierre" — no contar sus checkboxes
    if (linea.match(/^##\s+/)) {
      enChecklist = normalizar(linea).includes('checklist')
    }

    // Tablas: | # | ... | DEV/QA | resultado | ... |
    const tablaMatch = linea.match(/^\|\s*\d+\s*\|.*\|\s*(DEV|QA)\s*\|\s*(.*?)\s*\|/)
    if (tablaMatch) {
      const verificador = tablaMatch[1].toLowerCase()
      const resultado = tablaMatch[2].trim()
      const bucket = verificador === 'dev' ? stats.dev : stats.qa
      bucket.total++
      const tipo = esResultadoVerificado(resultado)
      if (tipo === 'ok') bucket.ok++
      else if (tipo === 'bug') bucket.bug++
      continue
    }

    // Eje 5 (Consistencia visual): | Verificacion | Resultado | Notas | — sin verificador, cuenta como QA
    if (linea.match(/^\|[^|]+\|[^|]+\|[^|]*\|$/) && !linea.match(/Resultado|Verificacion|---/i)) {
      const resMatch = linea.match(/^\|[^|]+\|\s*(.*?)\s*\|[^|]*\|$/)
      if (resMatch) {
        stats.qa.total++
        const tipo = esResultadoVerificado(resMatch[1].trim())
        if (tipo === 'ok') stats.qa.ok++
        else if (tipo === 'bug') stats.qa.bug++
      }
      continue
    }

    // Pasos (Eje 2): buscar "- **Verificador:** DEV/QA" seguido de "- **Resultado:**"
    const pasoVerMatch = linea.match(/^-\s*\*\*Verificador:\*\*\s*(DEV|QA)/i)
    if (pasoVerMatch) {
      const verificador = pasoVerMatch[1].toLowerCase()
      const bucket = verificador === 'dev' ? stats.dev : stats.qa
      bucket.total++
      for (let j = i + 1; j < Math.min(i + 5, lineas.length); j++) {
        const resMatch = lineas[j].match(/^-\s*\*\*Resultado:\*\*\s*(.*)/)
        if (resMatch) {
          const tipo = esResultadoVerificado(resMatch[1].trim())
          if (tipo === 'ok') bucket.ok++
          else if (tipo === 'bug') bucket.bug++
          break
        }
      }
      continue
    }

    // Checkboxes sueltos: - [x] texto / - [ ] texto
    // Solo contar si NO estamos en seccion Checklist de cierre y NO es un Resultado inline
    const checkboxMatch = linea.match(/^-\s*\[([ xX])\]\s*(.+)/)
    if (checkboxMatch && !enChecklist && !linea.includes('**Resultado:**')) {
      const checked = checkboxMatch[1].toLowerCase() === 'x'
      const texto = checkboxMatch[2]
      const esDev = texto.includes('✅ Gerardo') || texto.includes('DEV')
      const bucket = esDev ? stats.dev : stats.qa
      bucket.total++
      if (checked) bucket.ok++
      continue
    }
  }

  const total = stats.dev.total + stats.qa.total
  const verified = stats.dev.ok + stats.qa.ok + stats.dev.bug + stats.qa.bug

  return { ...stats, total, verified }
}

function generarIndex(dirPath) {
  const archivos = fs.readdirSync(dirPath)
    .filter(f => (f.startsWith('QA_v2-') || f.startsWith('QA_v3-')) && f.endsWith('.md'))
    .sort()

  const qas = archivos.map(archivo => {
    const mdContent = fs.readFileSync(path.join(dirPath, archivo), 'utf-8')
    const headerEnd = mdContent.indexOf('\n## ')
    const headerText = headerEnd > -1 ? mdContent.slice(0, headerEnd) : mdContent
    const meta = parsearMetadata(headerText)
    const htmlFile = archivo.replace('.md', '.html')
    const htmlExists = fs.existsSync(path.join(dirPath, htmlFile))
    const version = archivo.startsWith('QA_v3-') ? 'v3' : 'v2'
    const progreso = version === 'v3' ? parsearProgreso(mdContent) : null
    return { archivo, htmlFile, htmlExists, meta, version, progreso }
  })

  // Separar y ordenar por fecha (mas reciente primero)
  const sortByFecha = (a, b) => (b.meta.fecha || '').localeCompare(a.meta.fecha || '')
  const v3Qas = qas.filter(q => q.version === 'v3').sort(sortByFecha)
  const v2Qas = qas.filter(q => q.version === 'v2').sort(sortByFecha)

  // Mapeo de archivo QA a bloque V3 (basado en ORDEN_IMPLEMENTACION_V3.md)
  const BLOQUES_V3 = [
    { id: 'b0', nombre: 'Bloque 0 — Infraestructura QA', slugs: ['QA_v3-formato-ampliado', 'QA_v3-qa-estado-issues'] },
    { id: 'b1', nombre: 'Bloque 1 — Infraestructura base', slugs: ['QA_v3-separar-ambientes', 'QA_v3-logs-admin-auditoria'] },
    { id: 'b2', nombre: 'Bloque 2 — Seguridad', slugs: ['QA_v3-cookies-seguridad', 'QA_v3-rate-limiting', 'QA_v3-validacion-archivos'] },
    { id: 'b3', nombre: 'Bloque 3 — Roles ESTADO', slugs: ['QA_v3-redefinicion-roles-estado', 'QA_v3-tipos-documento-db'] },
    { id: 'b4', nombre: 'Bloque 4 — Calidad y errores', slugs: ['QA_v3-tests-e2e', 'QA_v3-error-boundaries', 'QA_v3-errores-consistentes-apis'] },
    { id: 'b5', nombre: 'Bloque 5 — Integraciones externas', slugs: ['QA_v3-arca-verificacion-cuit', 'QA_v3-whatsapp-magic-link', 'QA_v3-rag-asistente'] },
    { id: 'b6', nombre: 'Bloque 6 — Features de marca', slugs: ['QA_v3-proximo-nivel-dashboard', 'QA_v3-exportes-estado', 'QA_v3-demanda-insatisfecha', 'QA_v3-mensajes-individuales'] },
    { id: 'b7', nombre: 'Bloque 7 — UX/Onboarding', slugs: ['QA_v3-protocolos-onboarding', 'QA_v3-reporte-campo', 'QA_v3-ux-mejoras'] },
  ]

  // Clasificar V3 QAs en bloques
  const allKnownSlugs = new Set(BLOQUES_V3.flatMap(b => b.slugs))
  const v3PorBloque = BLOQUES_V3.map(bloque => {
    const bloqueQas = bloque.slugs
      .map(slug => v3Qas.find(q => q.archivo.replace('.md', '') === slug))
      .filter(Boolean)
    return { ...bloque, qas: bloqueQas }
  })
  const v3Otros = v3Qas.filter(q => !allKnownSlugs.has(q.archivo.replace('.md', '')))

  function renderCard(qa) {
    const tag = qa.htmlExists
      ? '<span class="qa-badge badge-ready">HTML listo</span>'
      : '<span class="qa-badge badge-pending">Sin generar</span>'
    const cardTag = qa.htmlExists ? 'a' : 'div'
    const href = qa.htmlExists ? ` href="${escapeHtml(qa.htmlFile)}"` : ''
    const disabledClass = qa.htmlExists ? '' : ' disabled'
    const qaSlugAttr = qa.version === 'v3' ? ` data-qa-slug="${escapeHtml(qa.archivo.replace('.md', ''))}"` : ''

    // Chips de perfiles si tiene Eje 6
    let perfilesHtml = ''
    if (qa.meta.perfiles && qa.meta.perfiles.length > 0) {
      perfilesHtml = `<div class="qa-perfiles">${qa.meta.perfiles.map(p =>
        `<span class="perfil-chip">${escapeHtml(p)}</span>`
      ).join('')}</div>`
    }

    // Estado de issues (solo V3, inyectado por JS)
    const estadoHtml = qa.version === 'v3' ? `
        <div class="estado-resumen"></div>
        <div class="estado-detalle" style="display:none"></div>` : ''

    // Progreso de verificacion (solo V3)
    let progresoHtml = ''
    if (qa.progreso && qa.progreso.total > 0) {
      const p = qa.progreso
      const pct = Math.round((p.verified / p.total) * 100)
      const devStatus = p.dev.total > 0
        ? (p.dev.ok === p.dev.total ? `<span class="prog-complete">DEV: ${p.dev.ok}/${p.dev.total}</span>`
          : `<span class="prog-pending">DEV: ${p.dev.ok}/${p.dev.total}</span>`)
        : ''
      const qaStatus = p.qa.total > 0
        ? (p.qa.ok === p.qa.total ? `<span class="prog-complete">QA: ${p.qa.ok}/${p.qa.total}</span>`
          : `<span class="prog-pending">QA: ${p.qa.ok}/${p.qa.total}</span>`)
        : ''
      const bugsTotal = p.dev.bug + p.qa.bug
      const bugBadge = bugsTotal > 0 ? ` <span class="prog-bugs">${bugsTotal} bug${bugsTotal > 1 ? 's' : ''}</span>` : ''
      progresoHtml = `
        <div class="qa-progreso">
          <div class="prog-bar-container">
            <div class="prog-bar" style="width:${pct}%"></div>
          </div>
          <div class="prog-info">
            <span class="prog-pct">${p.verified}/${p.total} verificados (${pct}%)</span>
            ${devStatus} ${qaStatus}${bugBadge}
          </div>
        </div>`
    }

    return `
      <${cardTag}${href} class="qa-card${disabledClass}" data-version="${qa.version}"${qaSlugAttr}>
        <div class="qa-title">${escapeHtml(qa.meta.titulo || qa.archivo)}</div>
        <div class="qa-meta">
          <div class="qa-meta-item"><span class="qa-meta-label">Spec:</span> <code>${escapeHtml(qa.meta.spec || '—')}</code></div>
          <div class="qa-meta-item"><span class="qa-meta-label">Fecha:</span> ${escapeHtml(qa.meta.fecha || '—')}</div>
          <div class="qa-meta-item">${tag}</div>
        </div>
        ${perfilesHtml}${progresoHtml}${estadoHtml}
      </${cardTag}>`
  }

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
      margin-bottom: 16px;
    }
    .index-header h1 { font-size: 22px; margin-bottom: 4px; }
    .index-header p { font-size: 14px; opacity: 0.8; }
    .index-filter-bar {
      display: flex; gap: 6px; align-items: center;
      background: white; border-radius: 10px;
      padding: 10px 16px; margin-bottom: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }
    .index-filter-label { font-size: 13px; font-weight: 600; color: #555; margin-right: 4px; }
    .index-filter-btn {
      padding: 5px 14px; border: 1px solid #ddd; border-radius: 6px;
      background: white; cursor: pointer; font-size: 12px; font-weight: 600;
      color: #555; transition: all 0.15s;
    }
    .index-filter-btn:hover { border-color: #1e3a5f; color: #1e3a5f; }
    .index-filter-btn.active { background: #1e3a5f; color: white; border-color: #1e3a5f; }
    .qa-section { margin-bottom: 24px; }
    .qa-section-title { font-size: 17px; font-weight: 700; color: #1e3a5f; margin-bottom: 4px; }
    .qa-section-desc { font-size: 13px; color: #888; margin-bottom: 12px; }
    .qa-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
    .qa-card {
      background: white; border: 1px solid #e8ecf1; border-radius: 10px;
      padding: 18px 22px; text-decoration: none; color: inherit;
      transition: all 0.15s; display: block;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .qa-card:hover { border-color: #1e3a5f; box-shadow: 0 2px 8px rgba(30,58,95,0.15); transform: translateY(-1px); }
    .qa-card.disabled { opacity: 0.5; pointer-events: none; }
    .qa-title { font-size: 16px; font-weight: 600; color: #1e3a5f; margin-bottom: 8px; }
    .qa-meta { display: flex; gap: 16px; font-size: 13px; color: #666; flex-wrap: wrap; }
    .qa-meta-item { display: flex; align-items: center; gap: 4px; }
    .qa-meta-label { font-weight: 600; color: #888; }
    .qa-badge {
      display: inline-block; font-size: 11px; padding: 2px 8px;
      border-radius: 4px; font-weight: 600;
    }
    .badge-ready { background: #e8f5e9; color: #2e7d32; }
    .badge-pending { background: #fff3e0; color: #e65100; }
    .qa-perfiles { display: flex; gap: 4px; margin-top: 8px; flex-wrap: wrap; }
    .perfil-chip {
      font-size: 10px; padding: 2px 8px; border-radius: 10px;
      background: #fff3e0; color: #e65100; font-weight: 600; text-transform: capitalize;
    }
    details summary { cursor: pointer; list-style: none; }
    details summary::-webkit-details-marker { display: none; }
    details summary::before { content: '\\25B6  '; font-size: 10px; color: #999; }
    details[open] summary::before { content: '\\25BC  '; }
    /* Progreso de verificacion */
    .progreso-global-panel {
      background: white; border: 1px solid #e8ecf1; border-radius: 10px;
      padding: 18px 22px; margin-bottom: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .progreso-global-panel h3 { font-size: 15px; font-weight: 700; color: #1e3a5f; margin-bottom: 10px; }
    .prog-bar-container {
      background: #e8ecf1; border-radius: 6px; height: 8px; overflow: hidden; margin-bottom: 6px;
    }
    .prog-bar-lg { height: 12px; }
    .prog-bar {
      background: linear-gradient(90deg, #2e7d32, #43a047); height: 100%; border-radius: 6px;
      transition: width 0.3s;
    }
    .prog-info {
      display: flex; gap: 10px; align-items: center; flex-wrap: wrap;
      font-size: 12px; color: #666; margin-top: 4px;
    }
    .prog-info-global { font-size: 13px; }
    .prog-pct { font-weight: 600; color: #333; }
    .prog-complete {
      color: #2e7d32; font-weight: 600; padding: 1px 8px;
      background: #e8f5e9; border-radius: 4px;
    }
    .prog-pending {
      color: #e65100; font-weight: 600; padding: 1px 8px;
      background: #fff3e0; border-radius: 4px;
    }
    .prog-bugs {
      color: #c62828; font-weight: 600; padding: 1px 8px;
      background: #ffeaea; border-radius: 4px;
    }
    .qa-progreso { margin-top: 10px; }
    /* Panel global de estado */
    .estado-global-panel {
      background: white; border: 1px solid #e8ecf1; border-radius: 10px;
      padding: 18px 22px; margin-bottom: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .estado-global-panel h3 { font-size: 15px; font-weight: 700; color: #1e3a5f; margin-bottom: 10px; }
    .estado-global-stats {
      display: flex; gap: 16px; flex-wrap: wrap; align-items: center; margin-bottom: 8px;
    }
    .estado-stat {
      font-size: 14px; font-weight: 600; padding: 3px 10px; border-radius: 6px;
    }
    .estado-stat-open { background: #ffeaea; color: #c62828; }
    .estado-stat-closed { background: #e8f5e9; color: #2e7d32; }
    .estado-stat-total { background: #f5f5f5; color: #555; }
    .estado-global-detail { font-size: 13px; color: #666; margin-top: 6px; line-height: 1.6; }
    .estado-global-footer {
      display: flex; justify-content: space-between; align-items: center;
      margin-top: 10px; font-size: 12px; color: #999;
    }
    .estado-refresh-btn {
      padding: 4px 12px; border: 1px solid #ddd; border-radius: 5px;
      background: white; cursor: pointer; font-size: 12px; color: #555;
    }
    .estado-refresh-btn:hover { border-color: #1e3a5f; color: #1e3a5f; }
    .estado-disabled-msg { font-size: 13px; color: #999; font-style: italic; }
    /* Badges en cards V3 */
    .estado-resumen {
      margin-top: 8px;
    }
    .estado-badge-resumen {
      display: inline-block; font-size: 12px; font-weight: 600;
      padding: 3px 10px; border-radius: 6px; cursor: pointer;
      user-select: none; transition: all 0.15s;
    }
    .estado-badge-verde { background: #e8f5e9; color: #2e7d32; }
    .estado-badge-amarillo { background: #fff8e1; color: #f57f17; }
    .estado-badge-rojo { background: #ffeaea; color: #c62828; }
    .estado-badge-resumen:hover { opacity: 0.8; }
    .estado-detalle {
      margin-top: 8px; padding: 10px 14px; background: #f9fafb;
      border-radius: 8px; border: 1px solid #e8ecf1; font-size: 13px;
    }
    .estado-detalle-line { margin-bottom: 4px; color: #555; }
    .estado-detalle-issues { margin-top: 8px; }
    .estado-issue-row { display: flex; align-items: center; gap: 6px; margin-bottom: 3px; }
    .estado-issue-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .estado-issue-dot-open { background: #c62828; }
    .estado-issue-dot-closed { background: #2e7d32; }
    .estado-issue-link { font-size: 12px; color: #1e3a5f; text-decoration: none; font-weight: 600; }
    .estado-issue-link:hover { text-decoration: underline; }
    .estado-issue-title { font-size: 12px; color: #555; }
    .estado-issue-ver { font-size: 12px; color: #1e3a5f; text-decoration: none; margin-left: auto; }
    /* Bloques V3 */
    .bloque-section { margin-bottom: 12px; }
    .bloque-section details {
      background: white; border: 1px solid #e8ecf1; border-radius: 10px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06); overflow: hidden;
    }
    .bloque-section summary {
      padding: 14px 20px; font-size: 15px; font-weight: 700; color: #1e3a5f;
      display: flex; align-items: center; gap: 10px;
      user-select: none;
    }
    .bloque-section summary:hover { background: #f8f9fb; }
    .bloque-stats {
      font-size: 12px; font-weight: 600; color: #666; margin-left: auto;
    }
    .bloque-content { padding: 4px 16px 16px; }
    .bloque-placeholder {
      font-size: 13px; color: #aaa; font-style: italic; padding: 8px 4px;
    }
    @media (max-width: 600px) {
      body { padding: 10px; }
      .qa-meta { flex-direction: column; gap: 4px; }
      .index-filter-bar { flex-wrap: wrap; }
      .estado-global-stats { flex-direction: column; gap: 6px; }
    }
  `

  const plataformaUrl = process.env.PLATAFORMA_URL || 'https://plataforma-textil.vercel.app'
  const allQaApiUrl = plataformaUrl + '/api/feedback/all-qa-v3'

  const INDEX_JS = `
    function filtrarIndex(tipo) {
      document.querySelectorAll('.index-filter-btn').forEach(b => b.classList.remove('active'));
      document.querySelector('.index-filter-btn[data-filter="' + tipo + '"]').classList.add('active');
      var v3Section = document.getElementById('section-v3');
      var v2Section = document.getElementById('section-v2');
      if (tipo === 'todos') { v3Section.style.display = ''; v2Section.style.display = ''; }
      else if (tipo === 'v3') { v3Section.style.display = ''; v2Section.style.display = 'none'; }
      else if (tipo === 'v2') { v3Section.style.display = 'none'; v2Section.style.display = ''; }
    }

    (function() {
      var API_URL = '${escapeHtml(allQaApiUrl)}';

      function formatearDetalle(label, pairs) {
        var parts = [];
        for (var key in pairs) {
          var p = pairs[key];
          var txt = key.charAt(0).toUpperCase() + key.slice(1) + ': ';
          var items = [];
          if (p.open > 0) items.push(p.open + ' abierto' + (p.open > 1 ? 's' : ''));
          if (p.closed > 0) items.push(p.closed + ' cerrado' + (p.closed > 1 ? 's' : ''));
          if (items.length > 0) parts.push(txt + items.join(' \\u00B7 '));
        }
        return parts.length > 0 ? '<div class="estado-detalle-line"><strong>' + label + ':</strong> ' + parts.join(' | ') + '</div>' : '';
      }

      function badgeClass(open) {
        if (open === 0) return 'estado-badge-verde';
        if (open <= 3) return 'estado-badge-amarillo';
        return 'estado-badge-rojo';
      }

      function dotIcon(open) {
        return open === 0 ? '\\u2705' : '\\uD83D\\uDD34';
      }

      function renderGlobal(data) {
        var panel = document.getElementById('estado-global');
        if (!panel) return;
        if (data.error === 'GitHub no configurado') {
          panel.innerHTML = '<p class="estado-disabled-msg">Sincronizacion con GitHub deshabilitada</p>';
          return;
        }
        var g = data.global;
        var html = '<div class="estado-global-stats">';
        html += '<span class="estado-stat estado-stat-open">\\uD83D\\uDD34 ' + g.open + ' abierto' + (g.open !== 1 ? 's' : '') + '</span>';
        html += '<span class="estado-stat estado-stat-closed">\\u2713 ' + g.closed + ' cerrado' + (g.closed !== 1 ? 's' : '') + '</span>';
        html += '<span class="estado-stat estado-stat-total">\\u25EF ' + g.total + ' total</span>';
        html += '</div>';
        html += formatearDetalle('Por verificador', g.porVerificador);
        html += formatearDetalle('Por perfil', g.porPerfil);
        html += '<div class="estado-global-footer">';
        html += '<span id="estado-global-ts">Ultima actualizacion: ' + new Date(data.lastUpdated).toLocaleString('es-AR') + '</span>';
        html += '<button class="estado-refresh-btn" onclick="cargarEstadoIndex()">Refrescar</button>';
        html += '</div>';
        panel.innerHTML = html;
      }

      function renderCardEstado(card, qa) {
        var resumen = card.querySelector('.estado-resumen');
        var detalle = card.querySelector('.estado-detalle');
        if (!resumen || !detalle) return;

        var cls = badgeClass(qa.open);
        var icon = qa.open === 0 ? '\\u2705' : qa.open <= 3 ? '\\uD83D\\uDFE1' : '\\uD83D\\uDD34';
        resumen.innerHTML = '<span class="estado-badge-resumen ' + cls + '">' +
          icon + ' ' + qa.open + ' abierto' + (qa.open !== 1 ? 's' : '') +
          ' \\u00B7 ' + qa.closed + ' cerrado' + (qa.closed !== 1 ? 's' : '') + '</span>';

        var dhtml = '';
        dhtml += formatearDetalle('Verificador', qa.porVerificador);
        dhtml += formatearDetalle('Perfil', qa.porPerfil);
        if (qa.issues && qa.issues.length > 0) {
          dhtml += '<div class="estado-detalle-issues">';
          dhtml += '<strong>Issues:</strong>';
          qa.issues.forEach(function(issue) {
            var dotCls = issue.state === 'open' ? 'estado-issue-dot-open' : 'estado-issue-dot-closed';
            dhtml += '<div class="estado-issue-row">';
            dhtml += '<span class="estado-issue-dot ' + dotCls + '"></span>';
            dhtml += '<a class="estado-issue-link" href="' + issue.url + '" target="_blank">#' + issue.number + '</a>';
            dhtml += '<span class="estado-issue-title">' + (issue.title || '').substring(0, 60) + '</span>';
            dhtml += '<a class="estado-issue-ver" href="' + issue.url + '" target="_blank">\\u2192 ver</a>';
            dhtml += '</div>';
          });
          dhtml += '</div>';
        }
        detalle.innerHTML = dhtml;

        resumen.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          detalle.style.display = detalle.style.display === 'none' ? '' : 'none';
        };
      }

      function cargarEstadoIndex() {
        fetch(API_URL)
          .then(function(res) { return res.json(); })
          .then(function(data) {
            renderGlobal(data);
            var cards = document.querySelectorAll('.qa-card[data-qa-slug]');
            cards.forEach(function(card) {
              var slug = card.dataset.qaSlug;
              if (data.counts && data.counts[slug]) {
                renderCardEstado(card, data.counts[slug]);
              } else {
                var resumen = card.querySelector('.estado-resumen');
                if (resumen) resumen.innerHTML = '<span class="estado-badge-resumen estado-badge-verde">\\u2705 Sin issues</span>';
              }
            });
          })
          .catch(function() {
            var panel = document.getElementById('estado-global');
            if (panel) panel.innerHTML = '<p class="estado-disabled-msg">No se pudo cargar estado de issues</p>';
          });
      }

      // Exponer para boton refrescar
      window.cargarEstadoIndex = cargarEstadoIndex;

      cargarEstadoIndex();
      setInterval(cargarEstadoIndex, 5 * 60 * 1000);
    })();
  `

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
      <p>${qas.length} documentos de auditoria (${v3Qas.length} V3 + ${v2Qas.length} V2)</p>
    </div>

    <div class="index-filter-bar">
      <span class="index-filter-label">Filtrar:</span>
      <button class="index-filter-btn active" data-filter="todos" onclick="filtrarIndex('todos')">Todos</button>
      <button class="index-filter-btn" data-filter="v3" onclick="filtrarIndex('v3')">Solo V3</button>
      <button class="index-filter-btn" data-filter="v2" onclick="filtrarIndex('v2')">Solo V2</button>
    </div>

    ${(() => {
      const globalProg = { devTotal: 0, devOk: 0, devBug: 0, qaTotal: 0, qaOk: 0, qaBug: 0, total: 0, verified: 0 }
      v3Qas.forEach(q => {
        if (!q.progreso) return
        globalProg.devTotal += q.progreso.dev.total
        globalProg.devOk += q.progreso.dev.ok
        globalProg.devBug += q.progreso.dev.bug
        globalProg.qaTotal += q.progreso.qa.total
        globalProg.qaOk += q.progreso.qa.ok
        globalProg.qaBug += q.progreso.qa.bug
        globalProg.total += q.progreso.total
        globalProg.verified += q.progreso.verified
      })
      const pct = globalProg.total > 0 ? Math.round((globalProg.verified / globalProg.total) * 100) : 0
      const devLabel = globalProg.devOk === globalProg.devTotal && globalProg.devTotal > 0
        ? `<span class="prog-complete">DEV: ${globalProg.devOk}/${globalProg.devTotal} completo</span>`
        : `<span class="prog-pending">DEV: ${globalProg.devOk}/${globalProg.devTotal}</span>`
      const qaLabel = globalProg.qaOk === globalProg.qaTotal && globalProg.qaTotal > 0
        ? `<span class="prog-complete">QA: ${globalProg.qaOk}/${globalProg.qaTotal} completo</span>`
        : `<span class="prog-pending">QA: ${globalProg.qaOk}/${globalProg.qaTotal} pendiente</span>`
      const bugsTotal = globalProg.devBug + globalProg.qaBug
      const bugBadge = bugsTotal > 0 ? `<span class="prog-bugs">${bugsTotal} bug${bugsTotal > 1 ? 's' : ''}</span>` : ''
      return `<div class="progreso-global-panel">
      <h3>Progreso de verificacion V3</h3>
      <div class="prog-bar-container prog-bar-lg">
        <div class="prog-bar" style="width:${pct}%"></div>
      </div>
      <div class="prog-info prog-info-global">
        <span class="prog-pct">${globalProg.verified}/${globalProg.total} verificados (${pct}%)</span>
        ${devLabel} ${qaLabel} ${bugBadge}
      </div>
    </div>`
    })()}

    <div class="estado-global-panel" id="estado-global">
      <h3>Issues reportados V3</h3>
      <p class="estado-disabled-msg">Cargando...</p>
    </div>

    <div class="qa-section" id="section-v3">
      <div class="qa-section-title">V3 — En curso</div>
      <div class="qa-section-desc">Auditorias de specs V3 agrupadas por bloque del plan de implementacion</div>
      ${v3PorBloque.map(bloque => {
        const bloqueProgreso = { open: 0, closed: 0 }
        bloque.qas.forEach(q => {
          if (q.progreso) {
            bloqueProgreso.closed += q.progreso.verified
            bloqueProgreso.open += (q.progreso.total - q.progreso.verified)
          }
        })
        const statsHtml = bloque.qas.length > 0
          ? `<span class="bloque-stats">${bloque.qas.length} QA${bloque.qas.length > 1 ? 's' : ''}</span>`
          : '<span class="bloque-stats" style="color:#aaa">vacio</span>'
        return `
      <div class="bloque-section">
        <details open>
          <summary>${escapeHtml(bloque.nombre)} ${statsHtml}</summary>
          <div class="bloque-content">
            ${bloque.qas.length > 0
              ? `<div class="qa-grid">${bloque.qas.map(renderCard).join('')}</div>`
              : '<p class="bloque-placeholder">Aun no implementado</p>'}
          </div>
        </details>
      </div>`
      }).join('')}
      ${v3Otros.length > 0 ? `
      <div class="bloque-section">
        <details open>
          <summary>Otros V3 <span class="bloque-stats">${v3Otros.length} QA${v3Otros.length > 1 ? 's' : ''}</span></summary>
          <div class="bloque-content">
            <div class="qa-grid">${v3Otros.map(renderCard).join('')}</div>
          </div>
        </details>
      </div>` : ''}
    </div>

    <div class="qa-section" id="section-v2">
      <details>
        <summary>
          <span class="qa-section-title">V2 — Historico</span>
          <span class="qa-section-desc" style="display:inline;margin-left:8px">Auditorias de specs V2 ya cerrados (referencia historica)</span>
        </summary>
        <div class="qa-grid" style="margin-top:12px">
          ${v2Qas.map(renderCard).join('')}
        </div>
      </details>
    </div>
  </div>
  <script>${INDEX_JS}</script>
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
  parsearFrontmatter,
  parsearMetadata,
  esResultadoVerificado,
  dividirSecciones,
  parsearTabla,
  parsearPasos,
  parsearChecklist,
  parsearResultadoGlobal,
  parsearProgreso,
  generarHtml,
  generarIndex,
}
