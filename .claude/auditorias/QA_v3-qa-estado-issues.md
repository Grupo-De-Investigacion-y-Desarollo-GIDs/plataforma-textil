# QA: Estado de issues en interfaz de QA

**Spec:** `v3-qa-estado-issues.md` (QA-iss)
**Commit de implementacion:** pendiente
**URL de prueba:** https://plataforma-textil-dev.vercel.app
**Fecha:** 2026-04-26
**Auditor(es):** Sergio (tecnico)
**Incluye Eje 6 de validacion de dominio:** no

---

## Contexto institucional

Este spec convierte los QA HTMLs de checklists estaticas a paneles de control en vivo. Con 5 auditores trabajando en paralelo sobre el mismo QA, ver el estado de issues evita reportes duplicados y da visibilidad del progreso en tiempo real. Los badges de estado (abierto/resuelto/descartado) se sincronizan desde GitHub cada 2 minutos.

---

## Objetivo de este QA

Verificar que el endpoint by-qa funciona, que los badges aparecen en los QA HTMLs, que el polling actualiza sin reload, y que la creacion de issues incluye metadata para trazabilidad bidireccional.

---

## Como trabajar con este documento

1. Abri este archivo y la plataforma en paralelo
2. Identifica que items te corresponden segun tu perfil (columna Verificador)
3. Segui los pasos en orden — cada paso depende del anterior
4. Marca cada resultado con ok, bug o bloqueante
5. Si el resultado no es ok → abri el widget azul "Feedback" → describí que paso
6. Al terminar, completa el resultado global y commitea este archivo actualizado

---

## Credenciales de prueba

| Rol | Email | Password | URL de entrada |
|-----|-------|----------|----------------|
| ADMIN | `lucia.fernandez@pdt.org.ar` | `pdt2026` | `/admin` |

---

## Resultado global

- [ ] Aprobado — todo funciona
- [ ] Aprobado con fixes — funciona pero hay bugs menores
- [ ] Rechazado — falta funcionalidad o hay bugs bloqueantes

**Decision:** [ cerrar / fix inmediato / abrir item v4 ]
**Issues abiertos:** #

---

## Eje 1 — Funcionalidad

| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 1 | CORS utility extraido a `src/compartido/lib/cors.ts` con metodos GET, POST, OPTIONS | DEV | | |
| 2 | `/api/feedback/route.ts` importa CORS de utility compartido | DEV | | |
| 3 | `/api/feedback/route.ts` agrega qaSlug como label al crear issues | DEV | | |
| 4 | `/api/feedback/route.ts` inserta metadata como HTML comments en el body | DEV | | |
| 5 | Endpoint `/api/feedback/by-qa/[qaSlug]` creado, publico, con cache de 1 minuto | DEV | | |
| 6 | Endpoint incluye CORS headers para GitHub Pages origin | DEV | | |
| 7 | `tools/generate-qa.js` agrega `data-item-selector` a cada item | DEV | | |
| 8 | `tools/generate-qa.js` agrega `<meta name="qa-slug">` al HTML | DEV | | |
| 9 | HTML generado tiene script que hace fetch y popula badges al cargar | QA | | |
| 10 | Polling cada 2 minutos sin intervencion del usuario | QA | | |
| 11 | Badges muestran estado visual correcto (rojo/verde/gris) | QA | | |
| 12 | Click en badge abre el issue en GitHub | QA | | |
| 13 | Panel de resumen al final del QA con stats agregadas | QA | | |
| 14 | Fallback: si GitHub API falla, la checklist sigue funcionando | DEV | | |
| 15 | Build sin errores | DEV | | |

---

## Eje 2 — Navegabilidad

### Paso 1 — Verificar endpoint by-qa

- **Rol:** Sin login (endpoint publico)
- **URL de inicio:** `/api/feedback/by-qa/QA_v3-logs-admin-auditoria`
- **Verificador:** DEV
- **Accion:** Abrir la URL directamente en el browser
- **Esperado:** JSON con `{ issues: [...], lastUpdated: "..." }`
- **Resultado:** [ ]
- **Notas:**

### Paso 2 — Verificar badges en QA HTML

- **Rol:** Sin login
- **URL de inicio:** QA HTML en GitHub Pages
- **Verificador:** QA
- **Accion:** Abrir un QA HTML que tenga issues asociados. Esperar a que carguen los badges.
- **Esperado:** Badges aparecen al lado de los items que tienen issues, con colores correctos
- **Resultado:** [ ]
- **Notas:**

### Paso 3 — Verificar creacion de issue con metadata

- **Rol:** Sin login (desde QA HTML)
- **URL de inicio:** QA HTML en GitHub Pages
- **Verificador:** QA
- **Accion:** Marcar un item como bug, escribir observacion, click en "Crear issue"
- **Esperado:** Issue creado en GitHub con label del QA slug y HTML comments de metadata en el body
- **Resultado:** [ ]
- **Notas:**

### Paso 4 — Verificar panel de resumen

- **Rol:** Sin login
- **URL de inicio:** QA HTML en GitHub Pages
- **Verificador:** QA
- **Accion:** Scrollear al final del QA hasta "Resumen de issues"
- **Esperado:** Contadores de abiertos/resueltos/descartados, lista de issues con links
- **Resultado:** [ ]
- **Notas:**

---

## Eje 3 — Casos borde

| # | Caso | Accion | Esperado | Verificador | Resultado |
|---|------|--------|----------|-------------|-----------|
| 1 | QA sin issues | Abrir QA que no tiene issues | Panel dice "Sin issues reportados", sin badges | QA | |
| 2 | Issue sin itemSelector (viejo) | Verificar issue creado antes de QA-iss | Aparece en panel de resumen pero sin badge en item | DEV | |
| 3 | GitHub API caida | Desconfigurar GITHUB_TOKEN, abrir QA | Banner "No se pudo cargar estado de issues", checklist sigue funcionando | DEV | |
| 4 | Cache funciona | Dos requests al endpoint en < 1 min | Segundo retorna X-Cache: HIT | DEV | |
| 5 | Slug con caracteres especiales | `/api/feedback/by-qa/QA_v3-con-guiones-y-numeros-123` | 200 con issues vacio | DEV | |

---

## Eje 4 — Performance

| Verificacion | Metodo | Verificador | Resultado |
|-------------|--------|-------------|-----------|
| Endpoint by-qa responde en < 2s | DevTools > Network | QA | |
| Badges no bloquean la carga del QA | Abrir QA, verificar que checklist aparece antes que badges | QA | |
| Sin errores en consola del browser | DevTools > Console | QA | |

---

## Eje 5 — Consistencia visual

| Verificacion | Resultado | Notas |
|-------------|-----------|-------|
| Badges de issues tienen colores distinguibles (rojo/verde/gris) | | |
| Panel de resumen es coherente con el design system del QA | | |
| Badges no rompen el layout de los items | | |

---

## Resumen de issues abiertos

| Issue | Tipo | Descripcion | Perfil que lo encontro | Prioridad |
|-------|------|-------------|------------------------|-----------|

---

## Notas de los auditores

**Sergio (tecnico):**
[observaciones tecnicas]

**Perfiles interdisciplinarios:**
No aplica — spec puramente tecnico.

---

## Checklist de cierre

- [ ] Todos los criterios de aceptacion del spec verificados
- [ ] Casos borde probados
- [ ] Performance revisada
- [ ] Issues abiertos en GitHub con labels correctos
- [ ] Resultado global definido
- [ ] Documento commiteado a develop
