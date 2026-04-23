# Spec: Separar ambientes — Supabase desarrollo y producción

- **Versión:** V3
- **Origen:** V3_BACKLOG I-01
- **Asignado a:** Gerardo
- **Prioridad:** Crítica — bloqueante para que los 4 compañeros empiecen a validar sin afectar producción

---

## ANTES DE ARRANCAR

- [ ] `main` actualizado con el merge de V2 (22/04/2026)
- [ ] Acceso a cuenta de Supabase para crear nueva instancia
- [ ] Acceso a Vercel para configurar branch de producción y environment variables
- [ ] Backup de producción exportado (Supabase Dashboard → Settings → Database → Backups)

---

## 1. Contexto

Hoy Preview (develop) y Producción (main) comparten la misma instancia de Supabase. Esto significa que:

- Los fixes de develop afectan los datos que ve producción
- Si alguien corre el seed en desarrollo, borra los datos de producción
- Sergio no puede probar operaciones destructivas (borrar usuarios, revocar certificados) sin afectar producción
- Los 4 compañeros no pueden validar libremente sin riesgo de corromper datos reales del piloto

Además, hoy el deploy a producción es manual (`vercel deploy --prod`). Cada vez que se mergea `develop` a `main` hay que acordarse de deployar manualmente — esto ya causó problemas en V2 (Sergio auditando contra producción desactualizada).

Este spec resuelve las dos cosas: dos Supabase separadas + deploy automático de `main` a producción.

---

## 2. Qué construir

1. **Nueva instancia de Supabase** — `plataforma-textil-dev` separada de la actual
2. **Variables de entorno en Vercel** — Preview apunta a la Supabase dev, Producción apunta a la Supabase prod
3. **Branch `main` configurada como Producción en Vercel** — deploy automático en cada push
4. **Build script con migraciones automáticas** — `prisma migrate deploy` corre en cada build
5. **Seed corriendo solo en dev** — el seed nunca se ejecuta contra producción
6. **Banner visual de ambiente** — indicador claro cuando el usuario está en Preview

---

## 3. Pasos de implementación

### Paso 1 — Crear nueva Supabase (dev)

En Supabase Dashboard:
1. New project → nombre: `plataforma-textil-dev`
2. Región: `sa-east-1` (misma que prod)
3. Password: generar uno fuerte, guardar en password manager
4. Esperar a que termine de crearse (~2 minutos)

### Paso 2 — Aplicar schema a la nueva instancia

Desde el proyecto local, con `.env` apuntando temporalmente a la nueva DB dev:

```bash
# Aplicar las 18 migraciones en orden (mantiene historial limpio)
npx prisma migrate deploy

# Poblar datos de demo
npx prisma db seed

# Restaurar .env para que apunte a prod de nuevo
```

**No usar `db pull` + `db push`** — eso crea el schema pero no registra el historial de migraciones en `_prisma_migrations`, lo cual rompe futuros `migrate deploy`.

`prisma migrate deploy` es idempotente y no-destructivo: solo aplica migraciones pendientes.

### Paso 3 — Configurar variables de entorno en Vercel

Ir a Vercel → Project Settings → Environment Variables.

**Variables con scope "Preview" (solo branches != main) — valores de Supabase dev:**

| Variable | Valor | Scope |
|---|---|---|
| `DATABASE_URL` | URL pooler de Supabase dev | Preview |
| `DIRECT_URL` | URL directa de Supabase dev | Preview |
| `SUPABASE_URL` | URL API de Supabase dev | Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key de Supabase dev | Preview |

**Variables con scope "Production" (solo main) — valores de Supabase prod (ya configuradas):**

| Variable | Valor | Scope |
|---|---|---|
| `DATABASE_URL` | URL pooler de Supabase prod | Production |
| `DIRECT_URL` | URL directa de Supabase prod | Production |
| `SUPABASE_URL` | URL API de Supabase prod | Production |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key de Supabase prod | Production |

**Variables compartidas — ampliar scope a "All Environments":**

| Variable | Notas |
|---|---|
| `NEXTAUTH_SECRET` | Mismo secret en ambos ambientes |
| `SENDGRID_API_KEY` | Compartido — emails van al mismo servicio |
| `EMAIL_FROM` | Fallback en código: `noreply@plataformatextil.ar` |
| `GOOGLE_CLIENT_ID` | OAuth compartido |
| `GOOGLE_CLIENT_SECRET` | OAuth compartido |
| `ANTHROPIC_API_KEY` | Chat RAG compartido |
| `VOYAGE_API_KEY` | Embeddings RAG compartido |
| `AFIP_CUIT_PLATAFORMA` | CUIT de la plataforma |
| `AFIP_SDK_TOKEN` | Token de AfipSDK |
| `AFIP_SDK_ENV` | `development` o `production` según ambiente |
| `GITHUB_TOKEN` | Para crear issues de feedback |
| `GITHUB_REPO` | Fallback en código: `Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil` |

**`NEXTAUTH_URL` NO hace falta configurarla en Preview.** NextAuth v5 detecta automáticamente `VERCEL_URL` (auto-seteada por Vercel) y la usa como base URL cuando `NEXTAUTH_URL` no está definida. Solo necesita estar seteada en Production con el dominio final (`https://plataforma-textil.vercel.app`).

**Verificación:** después de configurar, ir a Vercel → Project Settings → Environment Variables y confirmar que las 4 vars de DB tienen valores distintos entre Preview y Production, y que las 13 vars compartidas tienen scope "All Environments".

### Paso 4 — Configurar branch de producción

**Antes de tocar nada:** ir a Vercel → Project Settings → Git → Production Branch y verificar el valor actual.

- Si ya dice `main` → **no-op**, no tocar nada.
- Si dice otra cosa → cambiar a `main` y guardar.

A partir de ahora cada push a `main` deploya automáticamente a producción. Preview se genera para cualquier otra branch (incluido `develop`).

**No hay riesgo de romper workflows:** el único GitHub Action (`qa-pages.yml`) solo se triggerea con pushes a `develop` y no depende de la configuración de Vercel.

### Paso 5 — Modificar build script

En `package.json`, cambiar el script de build:

```json
"build": "prisma migrate deploy && prisma generate && next build"
```

Esto garantiza que cada deploy (tanto Preview como Production) aplique migraciones pendientes automáticamente. `prisma migrate deploy` es no-destructivo — solo corre migraciones que no se aplicaron todavía.

### Paso 6 — Banner de ambiente

Archivo nuevo: `src/compartido/componentes/ambiente-banner.tsx`

```tsx
export function AmbienteBanner() {
  const env = process.env.VERCEL_ENV

  if (env === 'production' || !env) return null

  const label = env === 'preview' ? 'AMBIENTE DE PRUEBAS' : 'DESARROLLO LOCAL'
  const color = env === 'preview' ? 'bg-amber-500' : 'bg-purple-500'

  return (
    <div className={`${color} text-white text-center text-xs font-semibold py-1`}>
      {label} — este no es el ambiente de produccion
    </div>
  )
}
```

**Server component** (sin `'use client'`). Usa `VERCEL_ENV` que Vercel auto-setea en cada deploy (`"production"`, `"preview"`, o `"development"`). No hace falta crear ni mantener variables manuales como `NEXT_PUBLIC_VERCEL_ENV`.

Integrar en `src/app/layout.tsx` al inicio del `<body>`:

```tsx
<body>
  <AmbienteBanner />
  {children}
</body>
```

---

## 4. Casos borde

- **Migrations no aplicadas en prod** — resuelto: el build script ahora corre `prisma migrate deploy` automáticamente en cada deploy.
- **Seed en producción** — `package.json` debe tener el script de seed condicionado: `"seed": "if [ \"$VERCEL_ENV\" != \"production\" ]; then tsx prisma/seed.ts; fi"` — el seed nunca corre en prod.
- **Variables faltantes en Preview** — la tabla del Paso 3 cubre las 17 variables del proyecto. Verificar con el checklist después de configurar.
- **Datos de producción eliminados por error** — antes de hacer cualquier cambio, exportar backup completo de la Supabase prod actual (Supabase Dashboard → Settings → Database → Backups).
- **NEXTAUTH_URL en Preview** — no configurar. NextAuth v5 usa `VERCEL_URL` automáticamente en deploys de Vercel.

---

## 5. Criterios de aceptación

- [ ] Nueva Supabase `plataforma-textil-dev` existe con el mismo schema que prod
- [ ] Las 18 migraciones aparecen en `_prisma_migrations` de la nueva DB
- [ ] Seed corre limpio en la nueva instancia sin errores
- [ ] Variables de entorno en Vercel: 4 vars DB con scope diferenciado (Preview vs Production)
- [ ] Variables de entorno en Vercel: 13 vars compartidas con scope "All Environments"
- [ ] Branch `main` configurada como Production Branch en Vercel
- [ ] Push a `develop` genera Preview con Supabase dev
- [ ] Push a `main` genera deploy automático a producción con Supabase prod
- [ ] Banner de ambiente visible en Preview, invisible en Production
- [ ] Backup de producción exportado antes de hacer los cambios
- [ ] Build corre `prisma migrate deploy` automáticamente en cada deploy
- [ ] Seed no se ejecuta en producción

---

## 6. Tests

| # | Qué testear | Cómo | Verificador |
|---|-------------|------|-------------|
| 1 | Preview usa Supabase dev | Loguearse en Preview, crear un usuario, verificar que NO aparece en producción | QA |
| 2 | Production usa Supabase prod | Loguearse en producción con credenciales existentes | QA |
| 3 | Banner visible en Preview | Abrir URL de Preview, verificar banner amarillo arriba | QA |
| 4 | Banner invisible en Production | Abrir `plataforma-textil.vercel.app`, no debe haber banner | QA |
| 5 | Seed no corre en prod | Verificar logs de build de Vercel en producción — no debe aparecer `prisma db seed` | DEV |
| 6 | Migrations se aplican automáticamente | Hacer un cambio al schema, mergear a main, verificar que la migration corre en los logs de build | DEV |
| 7 | Push a develop no afecta prod | Modificar datos desde Preview, verificar que prod sigue igual | QA |
| 8 | Backup de producción exportado | Confirmar que existe archivo de backup antes de cambios | DEV |
| 9 | Historial de migraciones limpio | Conectar a Supabase dev, verificar 18 rows en `_prisma_migrations` | DEV |

---

## 7. Deuda técnica que resuelve

- Elimina el riesgo de que desarrollo rompa producción
- Elimina deploys manuales olvidados
- Habilita a los 4 compañeros a probar libremente sin riesgo
- Establece el estándar de industria (dev/prod separados) para el proyecto

---

## 8. Referencias

- V3_BACKLOG → I-01
- V2 problema: migración de `zona` generó errores en producción porque develop y prod compartían DB
- V2 problema: deploy manual olvidado causó que Sergio audite contra producción desactualizada
