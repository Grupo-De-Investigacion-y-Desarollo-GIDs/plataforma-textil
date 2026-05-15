---
name: debugging-methodology
description: |
  Metodología para investigar bugs y fallos en CI sin caer en trial-and-error.
  Cubre verificaciones previas obligatorias, jerarquía de hipótesis, cuándo parar
  e iterar, cómo reportar honestamente cuando no se entiende un problema.
trigger: |
  Cuando hay tests E2E fallando y no es obvio por qué.
  Cuando un PR lleva 2+ intentos de fix sin progreso.
  Cuando un fallo "parece flaky" — investigar antes de retry.
  Cuando hay logs contradictorios o sin sentido.
---

# Debugging methodology para PDT

Este skill captura la metodología de investigación de bugs **que faltó en V4 y costó 5 horas**. Su objetivo es evitar el ciclo trial-and-error.

---

## 1. La regla de oro: investigar antes de adivinar

### Anti-patrón a evitar

```
1. Test falla
2. Hipótesis A → aplicar fix → falla
3. Hipótesis B → aplicar fix → falla
4. Hipótesis C → aplicar fix → falla
5. Hipótesis D → aplicar fix → ¿funcionó? no estamos seguros
```

Esto es **trial-and-error**, no debugging. Cada iteración:
- Toma tiempo (commit + push + CI ~10-15 min cada vez)
- Acumula cambios que pueden interactuar de forma rara
- Esconde la causa raíz real
- Frustra al equipo

### Patrón correcto

```
1. Test falla
2. INVESTIGAR sin fixear: capturar evidencia exacta
3. Generar hipótesis con base en evidencia
4. Verificar la hipótesis (lecturas, no commits)
5. SOLO entonces aplicar fix
6. Si el fix no funciona, replantear hipótesis (no apilar fixes)
```

---

## 2. Verificaciones previas obligatorias

### Antes de buscar bugs sofisticados, verificar lo básico

Cuando hay un test fallando, ANTES de hipótesis complejas:

#### 1. ¿Las credenciales son correctas?

```bash
# Verificar que el secret existe
gh secret list --repo [REPO]

# Para credenciales sensibles, NO podés leer el valor del secret
# Pero podés:
# - Sobrescribirlo con valor conocido (gh secret set)
# - Verificar el funcionamiento con curl manual con valor conocido
```

```powershell
# Probar login manualmente con curl/PowerShell
$csrf = (Invoke-RestMethod -Uri "https://[URL]/api/auth/csrf" -SessionVariable s).csrfToken
$body = @{ email = "EMAIL"; password = "PASSWORD"; csrfToken = $csrf }
Invoke-WebRequest -Uri "https://[URL]/api/auth/callback/credentials" `
    -Method POST -Body $body -WebSession $s -MaximumRedirection 5

# Verificar sesión
Invoke-RestMethod -Uri "https://[URL]/api/auth/session" -WebSession $s
```

**Si curl funciona pero el test no**: el problema es del test/herramienta.
**Si curl no funciona**: las credenciales o el backend están mal.

#### 2. ¿El backend responde correctamente?

```bash
# Test directo de endpoint
curl https://[URL]/api/health/version

# Medir tiempo de respuesta
curl -w "Total: %{time_total}s\n" https://[URL]/[endpoint]
```

**Si el backend responde <2s y el test timeoutea a 60s**: el problema no es el backend.

#### 3. ¿El error es de qué tipo?

| Tipo de error | Significado | Acción |
|---|---|---|
| `Timeout XXms exceeded` | Tiempo agotado esperando algo | Investigar QUÉ esperaba (URL, locator, response) |
| `strict mode violation` | Locator matchea múltiples elementos | Scopear el locator |
| `element not found` | Selector no matchea nada | Verificar si la página cargó y el elemento existe |
| `expected X, received Y` | Assertion falla | Verificar el valor real (puede ser tilde, espacio, encoding) |
| `4xx/5xx HTTP` | Error del servidor | Investigar el endpoint, no el test |
| `ERR_CONNECTION` | Network | Verificar URL, conectividad |

#### 4. ¿Es preexistente o nuevo?

```bash
# Ver runs anteriores del mismo branch o branch base
gh run list --branch [BRANCH] --workflow [WORKFLOW] --limit 10

# Comparar conteos:
# - 76 passed, 0 failed, 20 flaky → flakies enmascarando bugs
# - 76 passed, 0 failed, 0 flaky → CI verde de verdad
```

**Si fallaba antes con success por retries**: el problema es preexistente, posiblemente estaba oculto.

---

## 3. Jerarquía de hipótesis

### Empezar por lo más simple

Cuando algo no funciona, considerar en este orden:

1. **¿Credenciales/configuración mal cargada?** (típicamente 5 min de verificación, 90% de las veces es esto)
2. **¿Selector incorrecto?** (típicamente 10 min)
3. **¿Test desactualizado?** (la app cambió pero el test no)
4. **¿Bug del producto?** (la app tiene un problema real)
5. **¿Bug de framework/herramienta?** (Playwright, NextAuth, etc.)
6. **¿Combinación de los anteriores?**

### NO empezar por

- "Es un bug obscuro de React 19 streaming SSR" (a veces sí, pero no es primera hipótesis)
- "Es problema de timing del CI" (a veces sí, pero verificar lo básico primero)
- "Es un bug conocido de Playwright" (a veces sí, pero verificar primero)

### Por qué importa el orden

Si pasás 5 horas asumiendo "bug de React 19" cuando era un secret mal cargado, perdés esas 5 horas. El proceso ordenado evita eso.

---

## 4. Cuándo parar y replantear

### Señales de que estás en trial-and-error

1. **3+ intentos de fix sin progreso claro**
2. **Cada fix introduce un problema nuevo**
3. **No podés explicar con claridad qué causa el problema actual**
4. **Estás frustrado o cansado**
5. **El reporte que recibís dice "creo que es X" sin evidencia**

### Qué hacer cuando parás

1. **NO aplicar otro fix**
2. **Pedir reporte completo de evidencia**:
   - Output completo del último error (no resumido)
   - Comparación con runs anteriores
   - Cambios aplicados hasta ahora
3. **Releer la situación desde el principio**
4. **Generar 2-3 hipótesis con evidencia**
5. **Verificar cada hipótesis con lecturas (no commits)**
6. **Solo entonces, aplicar el fix más probable**

### Plantilla de "stop request"

Cuando uses Claude Code y necesites parar:

```
PARÁ. NO MÁS COMMITS NI CAMBIOS.

Necesito que pares y reportes con EVIDENCIA, no hipótesis.

1. Inventario de intentos: listar commits del branch con qué intentó cada uno
2. Estado actual: output COMPLETO del último error (sin filtrar)
3. Estado del código: contenido de los archivos modificados
4. Honestidad: ¿tenés claridad sobre la causa raíz o estás adivinando?

NO HAGAS NINGÚN CAMBIO. Solo reportá.
```

---

## 5. Cómo reportar bien

### Reporte bueno

```markdown
## Diagnóstico

Test demanda-insatisfecha:14 falla con:
"locator('Unidades de produccion potencial') resolved to 0 elements"

Causa raíz: la página tiene "Unidades de **producción** potencial" (con tilde),
el test busca "produccion" (sin tilde).

Evidencia:
- src/app/estado/demanda-insatisfecha/page.tsx:42 → 'Unidades de producción potencial'
- tests/e2e/demanda-insatisfecha.spec.ts:14 → expect(...'produccion potencial')

Fix propuesto: agregar tilde al test.

NO aplicar fix sin validación.
```

### Reporte malo

```
El test falla. Probablemente es un problema de timing.
Voy a aumentar el timeout y reintentar.
```

### Características de un buen reporte

1. **Específico**: nombres de archivos, líneas, mensajes exactos
2. **Con evidencia**: muestra el código relevante, no solo describe
3. **Honesto sobre certeza**: "creo que es X" vs "es X según evidencia"
4. **Propone fix antes de aplicarlo**: da oportunidad de validar
5. **No salta a la acción**: investiga antes de fixear

---

## 6. "Pasa en retry" no es "funciona"

### Anti-patrón

Tests con `retries: 2` que pasan en retry **NO son verdes**. Son flakies que pasan **porque el framework les da una segunda chance**.

### Por qué importa

1. **Enmascaran bugs reales**: vimos PR #318 con "76 passed, 0 failed" que en realidad tenía 20 flakies
2. **Hacen CI lento**: cada flaky agrega ~2-5 minutos al run
3. **Cubren problemas que aparecerán en producción**: si en CI tarda más, en producción también puede tardar más
4. **Erosionan la confianza en el CI**: "el CI dijo verde pero rompió producción"

### Regla

**Cualquier flaky es un bug por investigar**, no un test "intermitente que pasa solo".

Categorías típicas de flaky:
- Timeout puro → problema de tiempo
- Strict mode violation → locator que matchea múltiples elementos
- Element not found → race condition con carga
- Assertion intermitente → race condition con data o estado

Cada una tiene fix conocido (ver skill `playwright-e2e-patterns`).

### Cuándo es aceptable dejar un flaky

- **Está documentado en `KNOWN_ISSUES.md`** con causa identificada
- **Está scopeado** (afecta solo 1 test específico, no es sistémico)
- **Hay TODO concreto** con próxima acción
- **No es de un patrón conocido fixeable**

---

## 7. Comandos de diagnóstico esenciales

### GitHub CLI

```bash
# Listar runs recientes
gh run list --limit 10

# Ver detalle de un run
gh run view [RUN_ID]

# Ver logs (todos)
gh run view [RUN_ID] --log

# Ver solo logs de jobs fallidos
gh run view [RUN_ID] --log-failed

# Descargar artifacts (reporte Playwright, screenshots)
gh run download [RUN_ID] -n playwright-report
```

### Playwright

```bash
# Correr 1 test específico localmente
npx playwright test [archivo].spec.ts -g "[nombre del test]"

# Correr con UI (debug visual)
npx playwright test --ui

# Ver el reporte HTML después de un run
npx playwright show-report
```

### Vercel CLI

```bash
# Listar variables de entorno
vercel env ls

# Ver deploys recientes
vercel ls plataforma-textil

# Ver logs runtime
vercel logs [deployment-url] --since 30m
```

### Git

```bash
# Ver qué cambió en este branch
git log develop..[BRANCH] --oneline

# Ver diff completo
git log develop..[BRANCH] -p

# Ver archivos modificados
git diff develop --stat
```

---

## 8. Bugs históricos como ejemplos

### Caso 1 — PR #318: 5 horas de trial-and-error

**Síntoma:** 20 tests de ESTADO timeoutean a 60s.

**Hipótesis equivocadas (en orden):**
1. Cold start de funciones serverless → fix con warmup → no resolvió
2. Cookies `__Host-` con `page.request.post()` → fix con browser form → no resolvió
3. /estado pesado con 16 queries → fix con timeout 90s → no resolvió
4. Optimizar /estado con Suspense → no implementado, probablemente no resolvería

**Causa raíz real:** secret `TEST_ESTADO_EMAIL` o `TEST_ESTADO_PASSWORD` tenía valor incorrecto desde V3. El login fallaba silenciosamente, la URL nunca cambiaba.

**Lección:** si UNO solo rol falla y otros funcionan, **verificar credenciales antes de buscar bugs complejos**.

### Caso 2 — PR #312: 405 en warmup ESTADO

**Síntoma:** warmup de ESTADO devuelve 405 mientras otros roles devuelven 200.

**Hipótesis equivocadas:**
1. Bug en /estado endpoint
2. Rate limiting específico para ESTADO

**Causa raíz real:** `curl -X POST` forzaba POST en el redirect chain. Otros roles tenían suerte de que su redirect terminaba en endpoint que aceptaba POST. ESTADO redirigía a página que solo aceptaba GET → 405.

**Lección:** errores HTTP específicos (405 = Method Not Allowed) son **muy informativos**, leerlos antes de inventar hipótesis.

### Caso 3 — PR #316: breadcrumb strict mode

**Síntoma:** locator de breadcrumb encuentra 2 elementos.

**Investigación correcta (rápida):**
1. Buscar componente Breadcrumb en el código → solo 1 lugar lo renderiza
2. Inspeccionar trace del test → 2 elementos: uno en `<main>`, otro en `<div hidden id="S:1">`
3. Identificar el patrón: React 19 streaming SSR
4. Fix: scopear el locator a `<main>`

**Lección:** cuando el error es claro (strict mode violation con 2 elementos), **inspeccionar el DOM real** antes de teorizar.

---

## 9. Reglas de oro

| Regla | Resumen |
|---|---|
| Investigar antes de adivinar | Capturar evidencia exacta antes de aplicar fix |
| Verificar lo básico primero | Credenciales, configs, secrets → antes que bugs sofisticados |
| Errores HTTP son informativos | 405 = método incorrecto, 401 = auth, 500 = bug backend |
| Parar a los 3 intentos | Si no funciona, pedir reporte y replantear |
| Reportar con honestidad | "No sé" es mejor que un fix a ciegas |
| Pasa en retry ≠ funciona | Cualquier flaky es un bug por investigar |
| Si UNO falla y otros no | Buscar la diferencia entre ellos |
| Hipótesis con evidencia | "Es X según [archivo:línea]" > "Probablemente es X" |

---

## 10. Plantillas útiles

### Plantilla: "stop and investigate"

```
PARÁ. Necesito investigar antes de seguir.

1. Pasame el output COMPLETO del último error (sin filtrar con grep)
2. Listame los intentos de fix hasta ahora y qué falló en cada uno
3. ¿Tenés certeza de la causa raíz o estás adivinando?
4. ¿Hay alguna verificación básica que no hayamos hecho?

NO HAGAS CAMBIOS. Solo reportá.
```

### Plantilla: "investigar antes de aplicar fix"

```
ANTES de aplicar el fix, hacer estos pasos sin modificar nada:

1. [paso de investigación específico]
2. [verificación específica]
3. [comparación con casos similares]

Reportar evidencia. Esperar mi validación antes de fixear.
```

### Plantilla: "verificar credenciales primero"

```
Antes de buscar bugs en código, verificar que los secrets están bien:

1. gh secret list para confirmar que existen
2. Probar manualmente con curl/PowerShell usando valores conocidos del seed
3. Si manual funciona y CI falla: rotar el secret por las dudas

Si confirmamos credenciales, recién entonces investigar bugs en código.
```
