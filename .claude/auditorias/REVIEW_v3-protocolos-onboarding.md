# REVIEW: T-03 Protocolos de onboarding (T-03 + T-05 unificados)

**Spec:** `v3-protocolos-onboarding`
**Fecha:** 2026-05-05
**Autor:** Gerardo (implementacion completa)

---

## Resumen de cambios

Implementacion completa del spec T-03 + T-05 unificados: protocolos de onboarding para talleres y marcas del piloto OIT.

### Archivos nuevos (12)
- `src/compartido/lib/onboarding.ts` — Logica: calcularEtapa, calcularPasosTaller, calcularPasosMarca, calcularMetricas, ETAPA_LABELS, ETAPA_COLORS
- `src/compartido/componentes/ui/checklist-onboarding.tsx` — Banner de checklist reutilizable con pasos y link "Continuar"
- `src/app/(public)/ayuda/onboarding-taller/page.tsx` — Guia paso a paso para talleres (JSX directo)
- `src/app/(public)/ayuda/onboarding-marca/page.tsx` — Guia paso a paso para marcas (JSX directo)
- `src/app/(admin)/admin/onboarding/page.tsx` — Dashboard con stats, funnel, tabla de usuarios por etapa
- `src/app/(admin)/admin/onboarding/acciones-rapidas.tsx` — Client component: reenviar invitacion, enviar mensaje
- `src/app/api/admin/onboarding/reenviar-invitacion/route.ts` — POST endpoint para reenvio de email de registro
- `src/app/api/admin/notas-seguimiento/route.ts` — GET/POST para notas de seguimiento (CRUD)
- `src/admin/componentes/notas-seguimiento.tsx` — Client component: lista + formulario de notas
- `prisma/migrations/20260505140000_add_nota_seguimiento/migration.sql` — Tabla notas_seguimiento
- `src/__tests__/onboarding.test.ts` — 24 tests unitarios
- `tests/e2e/onboarding.spec.ts` — 7 tests E2E

### Archivos modificados (7)
- `prisma/schema.prisma` — NotaSeguimiento model + User relations (notasSeguimientoRecibidas, notasSeguimientoCreadas)
- `src/app/(public)/ayuda/page.tsx` — Links a guias de onboarding
- `src/app/(taller)/taller/page.tsx` — Checklist onboarding condicional (oculta ProximoNivelCard cuando hay pasos pendientes)
- `src/app/(marca)/marca/page.tsx` — Checklist onboarding condicional
- `src/app/(admin)/layout.tsx` — Sidebar: item "Onboarding" con icono Rocket
- `src/app/(admin)/admin/talleres/[id]/page.tsx` — NotasSeguimiento integrado al final
- `src/app/(admin)/admin/marcas/[id]/page.tsx` — NotasSeguimiento integrado al final
- `src/compartido/lib/email.ts` — buildInvitacionRegistroEmail()
- `src/compartido/lib/whatsapp-templates.ts` — Templates bienvenida y recordatorio_perfil

### Archivos de documentacion (3)
- `.claude/auditorias/QA_v3-protocolos-onboarding.md` — QA interactivo con Eje 6
- `.claude/auditorias/REVIEW_v3-protocolos-onboarding.md` — Este archivo
- `.claude/auditorias/PRUEBAS_PENDIENTES.md` — Seccion T-03 agregada

---

## Decisiones tecnicas

### 1. Etapa calculada, no persistida
`calcularEtapa()` hace queries a LogActividad y _count cada vez que se llama. La etapa NO se persiste en la DB. Esto evita inconsistencias y simplifica el codigo. Para 25 usuarios del piloto, el performance es aceptable. Si escala a 500+, considerar caching o campo persistido.

### 2. ChecklistOnboarding vs ProximoNivelCard
Spec 6.1 prescribe que son mutuamente excluyentes. Implementado con `onboardingCompleto = pasos.every(p => p.completado)`. Cuando todos los pasos estan completos, el checklist desaparece y ProximoNivelCard toma su lugar.

### 3. NotaSeguimiento: modelo nuevo vs NotaInterna
El spec prescribe NotaSeguimiento separado de NotaInterna. NotaInterna esta ligada a tallerId/marcaId, NotaSeguimiento a userId (mas general). Las dos coexisten sin conflicto.

### 4. Relaciones User — impacto en T-02
**IMPORTANTE para T-02:** Este spec agrega 2 relaciones al modelo User:
- `notasSeguimientoRecibidas NotaSeguimiento[] @relation("userNotas")`
- `notasSeguimientoCreadas NotaSeguimiento[] @relation("autorNotas")`

T-02 (reporte de campo) tambien agregara relaciones a User. Las migraciones no colisionan porque cada una agrega su propio modelo con sus propias FKs. Solo hay que asegurarse de que T-02 se base en el schema actualizado post-T-03.

### 5. Email template reutiliza emailWrapper + btnPrimario
`buildInvitacionRegistroEmail()` sigue el patron existente de los 13 builders en email.ts. Usa emailWrapper() para consistencia visual y btnPrimario() para el CTA.

### 6. Funnel sin reporte mensual auto-generado
Spec 7.3 prescribe reporte mensual auto-generado. No implementado — requiere cron job que no existe en la plataforma. Las metricas del funnel estan disponibles en tiempo real desde /admin/onboarding. Para V4 se puede agregar un cron con Vercel.

---

## Cobertura de tests

### Unitarios (24 tests)
- Lib imports: 4 (calcularEtapa, calcularPasosTaller, calcularPasosMarca, calcularMetricas)
- ETAPA_LABELS/COLORS: 2
- PasoOnboarding estructura: 3
- Component imports: 3 (ChecklistOnboarding, NotasSeguimiento, AccionesRapidasOnboarding)
- Email builder: 1 (subject, html, variables)
- WhatsApp templates: 3 (bienvenida, recordatorio_perfil, renderizado)
- Schema: 2 (NotaSeguimiento, User relations)
- Paginas: 3 (onboarding-taller, onboarding-marca, ayuda links)
- Admin: 1 (sidebar link)
- Dashboard: 2 (taller + marca checklist condicional)

### E2E (7 tests)
- GET notas sin auth → 401
- POST reenviar-invitacion sin auth → 401
- TALLER GET notas → 403
- /ayuda/onboarding-taller accesible
- /ayuda/onboarding-marca accesible
- /admin/onboarding visible para ADMIN
- /ayuda tiene links a guias

---

## Dependencias cumplidas

- [x] D-01 mergeado (roles ADMIN/ESTADO)
- [x] INT-01 mergeado (verificacion ARCA)
- [x] F-02 mergeado (WhatsApp templates + generarMensajeWhatsapp)
- [x] Q-03 mergeado (apiHandler, errorForbidden, etc.)
- [x] F-07 mergeado (mensajes individuales para recordatorios)
- [x] Badge notificaciones mergeado (descubribilidad)

---

## Deuda tecnica

- Reporte mensual auto-generado (spec 7.3) — requiere cron, queda para V4
- Instructivo PDF (spec 4.3) — material operativo, no codigo
- Metricas avanzadas (mediana/promedio tiempo hasta primera cotizacion) — queda para V4
- `calcularEtapa` hace N+1 queries — aceptable para 25 usuarios, optimizar si escala
