# REVIEW: Badge de notificaciones en header global

**Spec:** `v3-badge-notificaciones-header`
**Fecha:** 2026-05-05
**Autor:** Gerardo (implementacion completa)

---

## Resumen de cambios

Implementacion completa del spec: badge de notificaciones en header global con dropdown, polling 30s, skeleton loading, y badge real en sidebar.

### Archivos nuevos (4)
- `src/compartido/componentes/layout/notificaciones-bell.tsx` — Componente client: Bell + badge rojo + dropdown con ultimas 5 notificaciones, polling 30s, skeleton, empty state, toast en error, visibilitychange refetch
- `src/__tests__/notificaciones-bell.test.ts` — 18 tests unitarios
- `tests/e2e/notificaciones-bell.spec.ts` — 5 tests E2E
- `prisma/migrations/20260505120000_add_notificacion_userId_leida_index/migration.sql` — Index compuesto para performance

### Archivos modificados (4)
- `prisma/schema.prisma` — Agregado `@@index([userId, leida])` en modelo Notificacion
- `src/compartido/componentes/layout/header.tsx` — Bell Link reemplazado por NotificacionesBell (desktop + mobile)
- `src/compartido/componentes/layout/user-sidebar.tsx` — Badge real via fetch on open (reemplaza `badge: 0` hardcodeado)
- `src/app/(admin)/layout.tsx` — NotificacionesBell agregado en barra superior del admin
- `src/app/api/notificaciones/route.ts` — Include `creadaPor` en GET query

### Archivos de documentacion (3)
- `.claude/auditorias/QA_v3-badge-notificaciones-header.md` — QA interactivo con validacion de dominio
- `.claude/auditorias/REVIEW_v3-badge-notificaciones-header.md` — Este archivo
- `.claude/auditorias/PRUEBAS_PENDIENTES.md` — Seccion badge-header agregada

---

## Decisiones tecnicas

### 1. Polling 30s en vez de WebSocket/SSE
No hay infraestructura de realtime en la plataforma. Polling cada 30s es suficiente para el piloto (25 talleres). El fetch es liviano (~1KB con limit=5). Se complementa con `visibilitychange` para update inmediato al volver a la pestana.

### 2. Sin endpoint nuevo
GET `/api/notificaciones?limit=5` ya devuelve `sinLeer` + lista. Solo se agrego `include: { creadaPor }` para el sender name. Evita duplicar logica.

### 3. Index compuesto `[userId, leida]`
El count `WHERE userId = ? AND leida = false` se ejecuta en cada polling (cada 30s por usuario). Sin index es table scan. Con el index es O(log n). Migracion manual porque shadow DB no soporta pgvector.

### 4. Sidebar: fetch on open (Opcion B del spec)
El sidebar se abre raramente (click en hamburguesa). Hace su propio fetch leve (`limit=1`) cuando se abre. No acopla sidebar con header, ambos son `'use client'` independientes.

### 5. Toast solo en primer error
`fetchErrorShown.current` evita spam de toasts si la red falla persistentemente. Solo muestra una vez hasta que un fetch exitoso resetea el flag.

### 6. Admin layout como server component
El admin layout es server component pero `NotificacionesBell` es client component — Next.js lo maneja sin problemas como island. No hace falta convertir el layout a client.

---

## Cobertura de tests

### Unitarios (18 tests)
- tiempoRelativo: 5 (import, ahora, minutos, horas, dias)
- Component import: 1
- Badge overflow: 3 (99+, exacto, cero)
- Polling config: 1
- API shape: 1
- Header imports: 2 (no Bell directo, si NotificacionesBell)
- UserSidebar: 2 (no badge:0, si menuItemsConBadge)
- Admin layout: 1 (importa NotificacionesBell)
- Prisma schema: 1 (index existe)
- API include: 1 (creadaPor en query)

### E2E (5 tests)
- GET /api/notificaciones shape con sinLeer y creadaPor
- Bell visible en header TALLER
- Bell visible en header MARCA
- Bell visible en admin layout
- Click en Bell abre dropdown con "Ver todas"

---

## Dependencias cumplidas

- [x] F-07 en develop (mensajes individuales — para que badge muestre mensaje_individual)
- [x] GET /api/notificaciones funcional (ya existia)
- [x] ToastProvider en app (ya en providers.tsx)
- [x] lucide-react Bell icon (ya importado)

---

## Deuda tecnica

- WebSocket/SSE para realtime en vez de polling (V4)
- ESC no cierra dropdown en mobile (implementado pero mobile ESC es raro)
- No hay tests de integracion para el polling (dificil de testear con Vitest sin timers complejos)
