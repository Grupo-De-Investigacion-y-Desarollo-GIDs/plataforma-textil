---
name: vercel-nextauth-config
description: |
  Configuración correcta de Vercel + NextAuth v5 para el proyecto PDT.
  Cubre manejo de variables de entorno por ambiente (Production/Preview/Development),
  evitar atadura por gitBranch, configuración correcta de NEXTAUTH_URL, y
  fallbacks para URLs dinámicas en preview deploys.
trigger: |
  Cuando se va a modificar variables de entorno en Vercel.
  Cuando hay problemas de redirect cross-domain en auth.
  Cuando hay logins que funcionan en producción pero fallan en preview.
  Cuando se va a tocar src/auth.ts, src/auth.config.ts, o src/compartido/lib/email.ts.
---

# Vercel + NextAuth config para PDT

Este skill captura aprendizajes sobre configuración de Vercel + NextAuth v5. Su objetivo es **evitar las trampas que descubrimos en V3 y V4**.

---

## 1. Arquitectura de ambientes

### Estructura actual del proyecto

| Ambiente Vercel | URL | Supabase | Cuándo |
|---|---|---|---|
| Production | `plataformatextil.com.ar` | `plataforma-textil-staging` (nefbhacmjrzynnhvgfnl) | Push a `main` |
| Preview (develop) | `dev.plataformatextil.com.ar` | `plataforma-textil-dev` (fjddgukwydsdcrqoxvns) | Push a `develop` |
| Preview (PRs) | `plataforma-textil-XXX.vercel.app` (URL única) | `plataforma-textil-dev` | Cada PR |

### Regla importante

**Production y Preview tienen Supabase DIFERENTES.** No hay "staging" intermedio. La base `plataforma-textil-staging` es realmente producción (el nombre engaña).

---

## 2. Variables de entorno: NUNCA atar por gitBranch

### Problema

En V3 se cargaron variables con `gitBranch=develop`. Esto significa que:

- La variable solo aplica al push a `develop`
- **NO aplica a PRs de otras ramas** → preview deploys quedan sin variables → CI rompe

### Síntoma

```
Vercel deploy: failed
Reason: missing DATABASE_URL, DIRECT_URL, etc.
```

### Regla

**Variables Preview deben aplicar a TODOS los branches preview, no solo a develop específicamente.**

### Cómo verificar

```bash
vercel env ls
```

Buscar la columna "Environments". Si alguna variable Preview tiene `[develop]` o similar entre paréntesis, está mal.

### Cómo corregir

```bash
# Borrar la variable atada al branch
vercel env rm NOMBRE_VAR preview --git-branch=develop --yes

# Recrearla sin gitBranch
echo "VALOR" | vercel env add NOMBRE_VAR preview
```

### Variables del proyecto que NUNCA deben tener gitBranch

```
DATABASE_URL
DIRECT_URL
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
AFIP_SDK_ENV
EMAIL_FROM
GITHUB_REPO
GITHUB_TOKEN
```

---

## 3. NEXTAUTH_URL: solo en Production

### Problema

Si `NEXTAUTH_URL` está seteado en Preview, NextAuth fuerza todas las redirects al dominio canonical (`dev.plataformatextil.com.ar`), incluso desde preview deploys de PRs con URL única.

### Síntoma

```
1. Test corre contra plataforma-textil-PR123.vercel.app (con cambios del PR)
2. Login redirect → NextAuth fuerza dev.plataformatextil.com.ar
3. Test termina en dominio sin los cambios del PR → fallos por código viejo
```

### Regla

**`NEXTAUTH_URL` SOLO en Production. NextAuth v5 auto-detecta la URL en Preview.**

### Configuración correcta

```bash
# Production: con valor
NEXTAUTH_URL=https://plataformatextil.com.ar  # ✓

# Preview: NO debe existir
NEXTAUTH_URL                                   # ✗ no debe estar
```

### Cómo verificar

```bash
vercel env ls | grep NEXTAUTH_URL
```

Debería mostrar solo "Production". Si aparece "Preview", borrarlo:

```bash
vercel env rm NEXTAUTH_URL preview --yes
```

### Bug histórico

PR #312: tests E2E de PRs fallaban porque `NEXTAUTH_URL` en Preview redirigía al dominio canonical (sin los cambios del PR). Resuelto borrando NEXTAUTH_URL de Preview.

---

## 4. Fallbacks para URLs en código

### Problema

Si quitamos `NEXTAUTH_URL` de Preview, el código que lo usa para construir URLs (emails, magic links, etc.) queda con string vacío.

### Solución

Helper centralizado con fallback a `VERCEL_URL`:

```typescript
// src/compartido/lib/email.ts
export const appBaseUrl =
  process.env.NEXTAUTH_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')

// Uso:
const magicLink = `${appBaseUrl}/n/${token}`
```

### Variables disponibles en Vercel

| Variable | Disponible en | Valor |
|---|---|---|
| `NEXTAUTH_URL` | Production (manual) | URL canónica |
| `VERCEL_URL` | Production + Preview (auto) | URL del deployment actual |
| `VERCEL_ENV` | Todos (auto) | `production` / `preview` / `development` |

**`VERCEL_URL` la setea Vercel automáticamente y siempre apunta al deployment actual.** Por eso es el fallback ideal.

---

## 5. Rate limiting y bypass para CI

### Configuración

El proyecto tiene rate limiting en NextAuth + middleware. Para tests E2E, el bypass es:

```typescript
// En el middleware o auth config
const CI_BYPASS_HEADER = 'x-ci-bypass'

function isCiBypass(req: Request) {
  if (process.env.VERCEL_ENV === 'production') return false  // nunca en prod
  return req.headers.get(CI_BYPASS_HEADER) === process.env.CI_BYPASS_TOKEN
}
```

### Regla

**En workflows y tests E2E, agregar el header `x-ci-bypass: $CI_BYPASS_TOKEN` a todos los requests de auth.**

```yaml
# .github/workflows/e2e.yml
- name: Warm up preview functions
  env:
    CI_BYPASS_TOKEN: ${{ secrets.CI_BYPASS_TOKEN }}
  run: |
    curl -H "x-ci-bypass: $CI_BYPASS_TOKEN" \
         "$BASE_URL/api/auth/callback/credentials" \
         -d "email=..."
```

```typescript
// playwright.config.ts
use: {
  extraHTTPHeaders: {
    'x-ci-bypass': process.env.CI_BYPASS_TOKEN ?? '',
  },
}
```

### Importante

**`isCiBypass()` debe devolver `false` en producción aunque venga el header.** Es solo para preview/dev.

---

## 6. Cookies de NextAuth en preview vs producción

### Producción (NODE_ENV=production en Vercel)

```
__Secure-authjs.session-token   (HttpOnly, Secure, Path=/)
__Host-authjs.csrf-token        (HttpOnly, Secure, Path=/)
__Secure-authjs.callback-url    (HttpOnly, Secure, Path=/)
```

Los prefijos `__Secure-` y `__Host-` son **estrictos**:
- `__Host-`: solo se acepta sin Domain=, con Path=/, y Secure
- `__Secure-`: solo se acepta con Secure flag

### Implicación para Playwright

**`page.request.post()` de Playwright tiene bugs conocidos manejando estas cookies en redirects.** Usar `page.goto()` + form fill (browser real).

---

## 7. Checklist al cambiar configuración de Vercel

Antes de modificar variables:

1. [ ] Pullear configuración actual: `vercel env pull .env.snapshot --environment=preview`
2. [ ] Confirmar que entendés qué variable estás cambiando
3. [ ] Confirmar qué ambientes afecta (Production / Preview / Development)
4. [ ] Si es destructivo: anotar valor actual antes de borrar
5. [ ] Después del cambio: hacer redeploy y verificar

### Comandos útiles

```bash
# Ver todas las variables
vercel env ls

# Pullear a archivo (para backup mental)
vercel env pull .env.snapshot --environment=preview

# Agregar variable
echo "VALOR" | vercel env add NOMBRE_VAR preview

# Borrar variable
vercel env rm NOMBRE_VAR preview --yes

# Si la variable tiene gitBranch específico:
vercel env rm NOMBRE_VAR preview --git-branch=develop --yes
```

---

## 8. Secrets de GitHub para CI

### Secrets críticos del proyecto

```
TEST_TALLER_EMAIL       roberto.gimenez@pdt.org.ar
TEST_TALLER_PASSWORD    pdt2026
TEST_MARCA_EMAIL        valentina.ramos@pdt.org.ar  (o similar)
TEST_MARCA_PASSWORD     pdt2026
TEST_ESTADO_EMAIL       anabelen.torres@pdt.org.ar
TEST_ESTADO_PASSWORD    pdt2026
TEST_ADMIN_EMAIL        lucia.fernandez@pdt.org.ar
TEST_ADMIN_PASSWORD     pdt2026
CI_BYPASS_TOKEN         [valor secreto compartido]
TEST_BASE_URL           https://dev.plataformatextil.com.ar
VERCEL_TOKEN            [token de Vercel para deploys]
```

### Regla

**Si los tests de un rol específico fallan y otros funcionan, sospechar primero del secret.** Verificar:

1. Que el secret existe: `gh secret list`
2. Que coincide EXACTAMENTE con el seed (email + password)
3. Si tenés dudas: rotar el secret con `gh secret set ...` o via web

### Bug histórico

PR #318: el secret `TEST_ESTADO_EMAIL` o `TEST_ESTADO_PASSWORD` tenía un valor distinto al esperado (`anabelen.torres@pdt.org.ar` / `pdt2026`). Esto causó 5 horas de debugging buscando bugs en código cuando era un valor de un secret. Resuelto actualizando el secret.

**Lección: verificar secrets desde el inicio, no al final.**

---

## 9. Resumen ejecutivo

| Patrón | Regla |
|---|---|
| Variables Preview | Sin `gitBranch` específico |
| NEXTAUTH_URL | Solo en Production |
| URLs en código | Usar `appBaseUrl` helper con fallback a `VERCEL_URL` |
| Rate limiting en CI | Header `x-ci-bypass` |
| Cookies `__Host-`/`__Secure-` | NO usar `page.request.post()` en Playwright |
| Antes de tocar Vercel | Pull config, anotar valores antes de borrar |
| Secrets de tests fallidos | Verificar PRIMERO antes de debuggear código |

---

## Comandos de diagnóstico rápido

```bash
# ¿Las variables Preview están bien?
vercel env ls | grep -E "(DATABASE|SUPABASE|NEXTAUTH)"

# ¿Hay variables con gitBranch?
vercel env ls | grep -i develop

# ¿Los secrets de tests existen?
gh secret list --repo Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil
```
