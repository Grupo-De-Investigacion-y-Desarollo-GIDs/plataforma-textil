---
name: github-workflows-patterns
description: |
  Patrones correctos para workflows GitHub Actions del proyecto PDT.
  Cubre detección de preview deploys en PRs, uso correcto de curl con redirects,
  manejo de paths para detectar archivos por versión (V2/V3/V4), y warmup
  programático de funciones serverless.
trigger: |
  Cuando se va a modificar archivos en .github/workflows/.
  Cuando hay problemas con CI que solo aparecen en PRs (no en push a develop).
  Cuando se va a agregar detección de archivos nuevos al sistema de publicación.
  Cuando hay errores 405 Method Not Allowed en curl de workflows.
---

# GitHub Workflows patterns para PDT

Lecciones aprendidas durante V4. Su objetivo es **evitar bugs estructurales en workflows**.

---

## 1. curl con -d NO necesita -X POST

### Problema

```yaml
# ❌ INCORRECTO
curl -X POST "$URL/api/auth/callback/credentials" \
     -d "email=...&password=..." \
     -L \
     -c cookies.txt
```

El flag `-X POST` fuerza POST en **TODAS las requests del redirect chain**. Cuando hay un redirect 302 a un GET endpoint, curl manda POST igual → el endpoint responde 405 Method Not Allowed.

### Síntoma

```
[ESTADO] login -> 405
```

Mientras otros roles devuelven 200.

### Regla

**`-d` ya implica POST.** Sin `-X`, curl correctamente cambia a GET tras redirect 302.

```yaml
# ✅ CORRECTO
curl "$URL/api/auth/callback/credentials" \
     -d "email=...&password=..." \
     -L \
     -c cookies.txt
```

### Bug histórico

PR #312: warmup de ESTADO devolvía 405 mientras los otros roles devolvían 200. Causa: `-X POST` forzaba POST en el redirect 302 → /estado → 405. Resuelto removiendo `-X POST`.

---

## 2. Preview URL en PRs: usar GitHub Deployments API

### Problema

En push a develop, `github.sha` y `TEST_BASE_URL` apuntan al mismo deploy. Funciona.

En PRs:
- `github.sha` es el **merge commit** (commit virtual creado por GitHub)
- Vercel deploya el `head.sha` del PR
- `TEST_BASE_URL` fijo apunta a develop (no al preview del PR)

Resultado: el SHA del health endpoint nunca matchea con el esperado → timeout.

### Síntoma

```
Wait for Vercel deployment: timeout after 10 min
Expected SHA: abc123
Received SHA: def456 (siempre el mismo, el actual de develop)
```

### Solución

Diferenciar comportamiento por evento:

```yaml
- name: Wait for Vercel deployment
  id: wait-deploy
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  run: |
    if [ "${{ github.event_name }}" = "push" ]; then
      # Push a develop: usar TEST_BASE_URL fijo + github.sha
      EXPECTED_SHA="${{ github.sha }}"
      BASE_URL="${{ secrets.TEST_BASE_URL }}"
      # ... poll hasta que SHA matchee ...
      echo "deploy_url=$BASE_URL" >> "$GITHUB_OUTPUT"
    else
      # PR: usar github.event.pull_request.head.sha + buscar preview URL via Deployments API
      EXPECTED_SHA="${{ github.event.pull_request.head.sha }}"
      REPO="${{ github.repository }}"
      for i in {1..60}; do
        DEPLOY_ID=$(curl -s -H "Authorization: token $GH_TOKEN" \
          "https://api.github.com/repos/$REPO/deployments?sha=$EXPECTED_SHA&per_page=5" \
          | jq -r '[.[] | select(.environment != "Production")][0].id // empty')

        if [ -n "$DEPLOY_ID" ]; then
          TARGET_URL=$(curl -s -H "Authorization: token $GH_TOKEN" \
            "https://api.github.com/repos/$REPO/deployments/$DEPLOY_ID/statuses" \
            | jq -r '[.[] | select(.state == "success")][0].environment_url // empty')

          if [ -n "$TARGET_URL" ]; then
            # Verificar que el health endpoint del preview reporta el SHA esperado
            ACTUAL_SHA=$(curl -s "$TARGET_URL/api/health/version" | jq -r '.sha // empty')
            if [ "$ACTUAL_SHA" = "$EXPECTED_SHA" ]; then
              echo "deploy_url=$TARGET_URL" >> "$GITHUB_OUTPUT"
              exit 0
            fi
          fi
        fi
        sleep 10
      done
      echo "::error::Preview deploy not ready"
      exit 1
    fi
```

### Después usar la URL resuelta

```yaml
- name: Warm up
  run: |
    BASE_URL="${{ steps.wait-deploy.outputs.deploy_url }}"
    curl "$BASE_URL/login"
    # ...

- name: Run Playwright tests
  env:
    TEST_BASE_URL: ${{ steps.wait-deploy.outputs.deploy_url }}
  run: npx playwright test
```

### Bug histórico

PR #312: workflow original solo soportaba push a develop. En PRs, el SHA nunca matcheaba → 10 min timeout en cada PR. Resuelto con detección dinámica via Deployments API.

---

## 3. Workflows que filtran por path: actualizar al cambiar versiones

### Problema

Workflows que procesan archivos según pattern de nombre:

```yaml
on:
  push:
    branches: [develop]
    paths:
      - '.claude/auditorias/QA_v2-*.md'
      - '.claude/auditorias/QA_v3-*.md'
```

Cuando se introduce V4, los archivos `QA_v4-*.md` **no disparan el workflow** porque el path filter no los incluye.

### Síntoma

El archivo se pushea a develop pero el workflow no corre → no se procesa → no se publica.

### Regla

**Al agregar una nueva versión de archivos (V4, V5...), actualizar:**

1. El `paths` del trigger
2. Los loops bash que iteran archivos
3. Filtros de archivos en scripts (ej: `tools/generate-qa.js`)

### Checklist al introducir V[N+1]

```bash
# Buscar todas las referencias a la versión actual
grep -rn "QA_v3" .github/workflows/
grep -rn "QA_v3" tools/
grep -rn "QA_v3" .claude/

# Agregar la nueva versión en cada lugar
```

### Bug histórico

PR #315 (qa-pages V4): el primer QA V4 se commiteó pero no apareció en GitHub Pages. Causa: el workflow `qa-pages.yml` solo detectaba `QA_v2-*` y `QA_v3-*`. Resuelto agregando `QA_v4-*` al filter, al loop, y al script `generate-qa.js`.

---

## 4. Warmup programático con login real

### Problema

Curl anónimo a páginas autenticadas devuelve 307 (redirect a login) sin tocar las funciones serverless reales:

```bash
# ❌ Esto NO calienta las functions que importan
curl "$URL/estado"  # → 307 redirect a /login
```

Cuando los tests E2E loguean por primera vez, las funciones están frías → timeout.

### Solución

Warmup con login real por cada rol + visitar páginas autenticadas:

```bash
warmup_role() {
  local ROLE="$1" EMAIL="$2" PASSWORD="$3"
  shift 3
  local PAGES=("$@")
  local COOKIE_JAR=$(mktemp)

  # 1. Get CSRF token
  local CSRF_JSON=$(curl -s -c "$COOKIE_JAR" "$BASE_URL/api/auth/csrf")
  local CSRF_TOKEN=$(echo "$CSRF_JSON" | python3 -c "import json,sys; print(json.load(sys.stdin).get('csrfToken',''))")

  # 2. Login (sin -X POST, con header CI bypass)
  curl -o /dev/null -w "  [$ROLE] login -> %{http_code} (%{time_total}s)\n" \
    -c "$COOKIE_JAR" -b "$COOKIE_JAR" -L \
    -H "x-ci-bypass: $CI_BYPASS_TOKEN" \
    "$BASE_URL/api/auth/callback/credentials" \
    -d "email=${EMAIL}&password=${PASSWORD}&csrfToken=${CSRF_TOKEN}"

  # 3. Visitar páginas autenticadas para calentar functions
  for PAGE in "${PAGES[@]}"; do
    curl -o /dev/null -w "  [$ROLE] $PAGE -> %{http_code}\n" \
      -b "$COOKIE_JAR" -L "$BASE_URL$PAGE"
  done

  rm -f "$COOKIE_JAR"
}

# Usar:
warmup_role "TALLER" "$TEST_TALLER_EMAIL" "$TEST_TALLER_PASSWORD" /taller /taller/pedidos
warmup_role "MARCA"  "$TEST_MARCA_EMAIL"  "$TEST_MARCA_PASSWORD"  /marca /marca/directorio
warmup_role "ESTADO" "$TEST_ESTADO_EMAIL" "$TEST_ESTADO_PASSWORD" /estado/talleres /estado/documentos
warmup_role "ADMIN"  "$TEST_ADMIN_EMAIL"  "$TEST_ADMIN_PASSWORD"  /admin /admin/talleres
```

### Verificar que el warmup funcionó

En los logs del workflow, buscar líneas como:

```
[TALLER] login -> 200 (1.02s)
[MARCA] login -> 200 (0.66s)
[ESTADO] login -> 200 (0.46s)
[ADMIN] login -> 200 (0.63s)
```

Si algún rol devuelve 405: revisar si hay `-X POST` en el curl (ver sección 1).
Si algún rol devuelve 401: revisar secret correspondiente (`TEST_*_EMAIL` / `TEST_*_PASSWORD`).
Si algún rol devuelve 500: hay un bug del backend, no del workflow.

### Bug histórico

PR #312 etapa inicial: warmup anónimo no calentaba las functions. Tests timeoutean en cold start. Resuelto con warmup programático con login real.

---

## 5. Diferencias entre triggers de workflows

### Triggers comunes

| Trigger | Cuándo dispara | `github.sha` |
|---|---|---|
| `push: branches: [develop]` | Push directo a develop | Commit pusheado |
| `push: branches: [main]` | Push directo a main | Commit pusheado |
| `pull_request: branches: [develop]` | PR contra develop | **Merge commit virtual** |
| `pull_request: types: [closed]` | PR cerrado/mergeado | Idem |

### Para PRs, usar el head commit, no el merge commit

```yaml
# ❌ Esto NO matchea con el preview deploy de Vercel
EXPECTED_SHA="${{ github.sha }}"  # merge commit virtual

# ✅ Esto sí matchea
EXPECTED_SHA="${{ github.event.pull_request.head.sha }}"
```

---

## 6. Permisos de workflows

### Workflows que necesitan llamar GitHub API

Si el workflow consulta deployments o cualquier endpoint de la GitHub API:

```yaml
permissions:
  contents: read
  deployments: read  # para consultar deployments de Vercel
  pull-requests: read
```

### Si falta permiso

```
HTTP 404 Not Found
```

Aunque el deployment exista. Causa: `GITHUB_TOKEN` sin permiso suficiente.

---

## 7. Checklist al modificar un workflow

Antes de pushear cambios a un workflow:

1. [ ] El YAML es válido: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/X.yml'))"`
2. [ ] Los triggers están correctos (push, PR, paths)
3. [ ] Las variables de entorno necesarias están en `env:` o `secrets`
4. [ ] Si hay curl: NO usar `-X POST` con `-d` y `-L` juntos
5. [ ] Si hay loops por archivos: incluir todas las versiones activas (V2/V3/V4)
6. [ ] Si depende de eventos: probar en push a branch Y en PR
7. [ ] Permisos están definidos si llama a GitHub API

---

## 8. Comandos útiles para debugging

```bash
# Ver runs recientes con detalle
gh run list --limit 10

# Ver logs de un run específico
gh run view [RUN_ID] --log

# Ver solo logs de jobs fallidos
gh run view [RUN_ID] --log-failed

# Re-triggear un workflow sin commit nuevo
gh workflow run nombre.yml --ref [branch]

# Ver workflows configurados
gh workflow list
```

---

## 9. Resumen ejecutivo

| Patrón | Regla |
|---|---|
| curl con `-d` | NO usar `-X POST` (rompe redirects con 405) |
| Preview URL en PRs | Usar GitHub Deployments API, `head.sha` |
| Path filters | Actualizar al introducir nueva versión |
| Warmup | Login real por rol, no curl anónimo |
| `github.sha` en PRs | Es merge commit, usar `pull_request.head.sha` |
| Permisos | Declarar explícitamente para API calls |

---

## Bugs históricos referenciados

- PR #312: workflow detección preview URLs en PRs
- PR #312: `-X POST` causando 405 en ESTADO
- PR #312: warmup anónimo no calentaba functions
- PR #315: qa-pages no detectaba QA_v4-*
