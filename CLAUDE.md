# PDT - Plataforma Digital Textil

## Stack
Next.js 16 (App Router, Turbopack) | TypeScript | Tailwind v4 | Prisma 6 | PostgreSQL (Supabase) | NextAuth v5 beta | Vercel

## Estructura
```
src/
  app/(admin)/admin/...    # 20+ pages - Panel admin
  app/(taller)/taller/...  # 7 pages - Vista taller
  app/(marca)/marca/...    # 6 pages - Vista marca
  app/(estado)/estado/...  # 4 pages - Vista estado
  app/(auth)/               # login, registro, olvide-contrasena, mi-cuenta
  app/(public)/             # directorio, perfil/[id], ayuda, terminos, privacidad
  app/api/                  # 18 API routes
  components/ui/            # 13 componentes (button, card, badge, modal, data-table...)
  components/layout/        # header, user-sidebar
  lib/                      # auth.ts, auth.config.ts, prisma.ts, utils.ts
  middleware.ts             # Proteccion por roles (usa auth.config.ts para Edge)
```

## Roles: TALLER (Bronce/Plata/Oro) | MARCA | ESTADO | ADMIN

## Convenciones
- Server components por defecto, 'use client' solo cuando necesario
- Filtros: searchParams + form method="get" + Prisma where dinamico
- Auth: auth.config.ts (ligero, Edge) + auth.ts (completo, server-side)
- UI: font-overpass, colores brand-blue/brand-red, Badge con variantes
- Sin emojis en codigo salvo mock data existente

## Docs de referencia (no editar, solo consultar)
- `mvp_2/PANTALLAS_MVP.md` — 70 wireframes ASCII con specs
- `mvp_2/DESIGN_SYSTEM.md` — Tokens, tipografia, colores
- `textil/data.js` — Mock data completo
- `textil/NAVEGACION_POR_BARRERAS.md` — Flujos por rol (B1-B7)

## Deploy
- Produccion: https://pdt-nine.vercel.app
- GitHub: https://github.com/sergiandat/textil
- DB: Supabase (sa-east-1)
- Env vars en Vercel: DATABASE_URL, DIRECT_URL, NEXTAUTH_SECRET, NEXTAUTH_URL

## Decisiones tomadas
- Middleware separado de Prisma para no exceder 1MB Edge limit
- Navegacion: tabs activos detectados por pathname (no hardcodeados)
- Registro en 1 paso (simplificado vs wireframe de 3 pasos)
