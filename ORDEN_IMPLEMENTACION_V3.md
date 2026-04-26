# Orden de Implementación — V3

**Fecha:** 2026-04-25
**Modalidad:** Implementación secuencial por Gerardo. Sergio realiza QA posterior por bloque.
**Referencia de dependencias:** Revisión cruzada en `.claude/specs/V3_REVISION_CRUZADA.md`

---

## 1. Resumen ejecutivo

| Métrica | Valor |
|---------|-------|
| **Specs totales** | 22 |
| **Tablas nuevas en Prisma** | 8 (`ReglaNivel`, `ConsultaArca`, `MensajeWhatsapp`, `MagicLink`, `MotivoNoMatch`, `ConfiguracionUpload`, `NotaSeguimiento`, `ObservacionCampo`) |
| **Enums nuevos** | 7 (`TipoInscripcionAfip`, `EstadoCuit`, `EstadoMensajeWhatsapp`, `MotivoCategoria`, `TipoObservacion`, `FuenteObservacion`, `Sentimiento`) |
| **Tablas modificadas** | 3 (`Taller` +9 campos, `TipoDocumento` +2 campos, `Validacion` +1 campo) |
| **Modelo User** | +8 arrays de relación (de T-02, T-03, F-02 — coordinar migraciones) |
| **Endpoints nuevos** | ~12 |
| **Endpoints migrados** | 11 (a formato Q-03) |
| **Esfuerzo estimado** | ~135 horas |
| **Bloques conceptuales** | 8 |
| **Dependencia crítica externa** | AfipSDK (plan Pro/Growth, confirmación de pricing) |

### Cadena crítica más larga

```
I-01 → S-04 → D-01 → Q-02 → Q-03 → F-07 → T-03 → T-02
                 ↓              ↓
                D-02 → F-05 → F-04 → T-02
```

**T-02 (reporte de campo)** es el spec con más dependencias transitivas: necesita que 14 de los otros 21 specs estén mergeados. Es el último en implementarse.

---

## 2. Grafo de dependencias

```
                    ┌──────────┐
                    │  I-01    │  Separar ambientes
                    │ (raíz)   │
                    └────┬─────┘
           ┌─────────┬──┴──┬─────────┬──────────┬──────────┐
           ▼         ▼     ▼         ▼          ▼          ▼
        ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
        │ S-04 │ │ S-01 │ │ S-02 │ │ F-02 │ │ F-06 │ │ QA   │
        │ Logs │ │Cookie│ │ Rate │ │WhApp │ │ RAG  │ │format│
        └──┬───┘ └──────┘ └──┬───┘ └──┬───┘ └──────┘ └──┬───┘
           │                  │        │                   │
           ▼                  ▼        │                   ▼
        ┌──────┐          ┌──────┐    │              ┌──────┐
        │ D-01 │◄─────────│ S-03 │    │              │  QA  │
        │Roles │          │Upload│    │              │issues│
        └──┬───┘          └──────┘    │              └──────┘
     ┌─────┼──────┬───────┐           │
     ▼     ▼      ▼       ▼           │
  ┌──────┐┌────┐┌─────┐┌──────┐       │
  │ D-02 ││Q-02││Q-01 ││INT-01│       │
  │TipDoc││ErrB││E2E  ││ ARCA │       │
  └──┬───┘└─┬──┘└─────┘└──┬───┘       │
     │      ▼              │           │
     │   ┌──────┐          │           │
     │   │ Q-03 │◄─────────┼───────────┘
     │   │ErrAPI│          │
     │   └──┬───┘          │
     │  ┌───┼──────┐       │
     ▼  ▼   ▼      ▼       │
  ┌──────┐┌────┐┌──────┐   │
  │ F-01 ││ UX ││ F-05 │   │
  │NxtLvl││1..4││Demand│   │
  └──────┘└────┘└──┬───┘   │
                   │       │
     ┌─────────────┤       │
     │             │       │
     │   ┌──────┐  │       │
     │   │ F-07 │◄─┼── Q-03 + F-02 + S-02
     │   │ Msgs │  │
     │   └──┬───┘  │
     │      │      │
     │      ▼      │
     │   ┌──────┐  │
     │   │ T-03 │◄─┼── INT-01 + F-02 + Q-03 + F-07
     │   │Onbrd │  │
     │   └──┬───┘  │
     │      │      │
     ▼      │      │
  ┌──────┐  │      │
  │ F-04 │◄─┘  ◄── INT-01 + F-05 + Q-03 + S-04
  │Export│
  └──┬───┘
     │
     ▼
  ┌──────┐
  │ T-02 │◄── T-03 + F-04 + F-05
  │Report│
  └──────┘
```

### Leyenda

- **Flechas** = "depende de" (la flecha apunta al spec que debe estar mergeado primero)
- **Specs sin flechas entrantes** = se pueden implementar sin deps V3 (I-01, QA-formato)
- **Specs sin flechas salientes** = terminales, nadie depende de ellos (T-02, Q-01, S-01, F-01, F-06, QA-issues, UX)

---

## 3. Orden secuencial recomendado

### Bloque 1 — Infraestructura (sin esto nada funciona en V3)

| # | ID | Archivo | Deps V3 | Horas | Notas |
|---|----|---------|---------|----|-------|
| 1 | I-01 | `v3-separar-ambientes.md` | — | 4 | Supabase dev, env vars, banner, build script |
| 2 | S-04 | `v3-logs-admin-auditoria.md` | I-01 | 6 | Desbloquea D-01. Wrapper `logAccionAdmin`, aplicar en ~14 endpoints, UI `/admin/logs` |

**Hito:** Preview apunta a DB dev, producción a DB prod. `logAccionAdmin` disponible.

### Bloque 2 — Seguridad

| # | ID | Archivo | Deps V3 | Horas | Notas |
|---|----|---------|---------|----|-------|
| 3 | S-01 | `v3-cookies-seguridad.md` | I-01 | 3 | Config explícita cookies, test E2E, docs |
| 4 | S-02 | `v3-rate-limiting.md` | I-01 | 5 | Upstash Redis, helper, 10 endpoints protegidos |
| 5 | S-03 | `v3-validacion-archivos.md` | I-01, S-02 | 5 | Magic bytes, `ConfiguracionUpload`, UI admin, aplicar en 2 endpoints |

**Hito:** Plataforma hardened. Cookies seguras, rate limits, uploads validados.

### Bloque 3 — Roles y schema (el más crítico)

| # | ID | Archivo | Deps V3 | Horas | Notas |
|---|----|---------|---------|----|-------|
| 6 | D-01 | `v3-redefinicion-roles-estado.md` | I-01, S-04 | 8 | Mayor desbloqueo. 4 páginas ESTADO nuevas, mover server actions, cambiar permisos en ~5 endpoints. Migración: `aprobadoPor` en Validacion |
| 7 | D-02 | `v3-tipos-documento-db.md` | D-01 | 8 | `ReglaNivel`, `puntosOtorgados` en TipoDocumento, refactor `aplicarNivel()`, UI `/estado/configuracion-niveles`, seed |

**Hito:** ESTADO valida documentos (no ADMIN). Niveles configurables desde DB.

### Bloque 4 — Calidad de código

| # | ID | Archivo | Deps V3 | Horas | Notas |
|---|----|---------|---------|----|-------|
| 8 | Q-02 | `v3-error-boundaries.md` | D-01 | 5 | `ErrorPage`, `NotFoundPage`, 7 `error.tsx`, 7 `not-found.tsx`, `/api/log-error`, `react-error-boundary` |
| 9 | Q-03 | `v3-errores-consistentes-apis.md` | Q-02 | 6 | **Mayor desbloqueo secundario.** `apiHandler`, `errorResponse`, `apiFetch`, migrar 11 APIs críticas |
| 10 | Q-01 | `v3-tests-e2e.md` | I-01, D-01 | 6 | Config Playwright, helpers auth, 8 tests E2E, CI en cada PR |

**Hito:** Errores consistentes en toda la plataforma. Tests E2E como safety net. `apiFetch` disponible para todos los specs siguientes.

### Bloque 5 — Integraciones externas

| # | ID | Archivo | Deps V3 | Horas | Notas |
|---|----|---------|---------|----|-------|
| 11 | INT-01 | `v3-arca-completo.md` | I-01, D-01 | 10 | El más pesado. `arca.ts`, 9 campos en Taller, `ConsultaArca`, sync periódica, badges verificado/autodeclarado. **Blocker externo:** respuesta de AfipSDK sobre pricing |
| 12 | F-02 | `v3-whatsapp-notificaciones.md` | I-01 | 8 | `MensajeWhatsapp`, `MagicLink`, generador, 6 triggers, wizard envío. Migración: 2 tablas nuevas + arrays en User |
| 13 | F-06 | `v3-rag-completo.md` | I-01 | 6 | PDF support (`pdfjs-dist`), corpus real, prompts, widget en dashboard taller |

**Hito:** ARCA verificando CUITs, WhatsApp como canal, RAG activo con corpus real.

### Bloque 6 — Features principales

| # | ID | Archivo | Deps V3 | Horas | Notas |
|---|----|---------|---------|----|-------|
| 14 | F-01 | `v3-proximo-nivel-dashboard.md` | D-01, D-02 | 5 | `ProximoNivelCard`, `SincronizarNivel`, reemplaza banner contextual V2 |
| 15 | F-05 | `v3-demanda-insatisfecha.md` | D-01, D-02, Q-03 | 8 | `MotivoNoMatch`, `registrarMotivoNoMatch`, `buscarTalleresCerca`, dashboard `/estado/demanda-insatisfecha`, 3 endpoints |
| 16 | F-07 | `v3-mensajes-individuales.md` | D-01, F-02, Q-03, S-02 | 5 | Endpoint con `apiHandler`, editor con preview, tabs en `/admin/notificaciones` |
| 17 | UX-01..04 | `v3-ux-mejoras.md` | Q-02, Q-03, D-01 | 6 | `Loading`, `EmptyState`, toast extend, `Breadcrumbs`, Suspense refactor |

**Hito:** Dashboard taller guía formalización. Demanda insatisfecha visible para ESTADO. Admin puede contactar usuarios. UX pulida.

### Bloque 7 — Features avanzados (muchas dependencias)

| # | ID | Archivo | Deps V3 | Horas | Notas |
|---|----|---------|---------|----|-------|
| 18 | F-04 | `v3-exportes-estado.md` | D-01, INT-01, F-05, Q-03, S-04 | 8 | `exceljs`, `generarXlsx`, ampliar 7 exportes, 2 nuevos, informe mensual 7 hojas |
| 19 | T-03 | `v3-protocolos-onboarding.md` | D-01, INT-01, F-02, Q-03, F-07 | 8 | 2 páginas `/ayuda/`, dashboard `/admin/onboarding`, checklist, `NotaSeguimiento`, métricas. Migración: 1 tabla + arrays en User |
| 20 | T-02 | `v3-reporte-campo.md` | T-03, F-04, F-05 | 6 | `ObservacionCampo`, UI `/admin/observaciones`, plantillas reporte. Migración: 1 tabla + 3 enums + arrays en User. **Último spec en implementarse** |

**Hito:** ESTADO puede generar informes mensuales para OIT. Protocolos de onboarding activos. Reporte de campo capturando aprendizajes.

### Bloque 8 — QA tooling (independiente, se puede intercalar)

| # | ID | Archivo | Deps V3 | Horas | Notas |
|---|----|---------|---------|----|-------|
| 21 | QA-fmt | `v3-qa-formato-ampliado.md` | — | 4 | Template V3, `generate-qa.js` update, Eje 6, filtros por perfil |
| 22 | QA-iss | `v3-qa-estado-issues.md` | QA-fmt | 5 | Endpoint `by-qa/[qaSlug]`, CORS, badges en HTML, polling |

> **Nota:** El Bloque 8 no tiene dependencias V3 (solo V2 como prerrequisito). Se puede implementar **en cualquier momento** — incluso antes del Bloque 1. La recomendación de ponerlo al final es para priorizar funcionalidad de la plataforma, pero si Sergio necesita QAs con formato V3 antes, se puede adelantar.

---

## 4. Coordinación de migraciones

### 4.1 — Orden recomendado de migraciones Prisma

Cada migración se genera con `npx prisma migrate dev --name <nombre>`. El orden refleja las dependencias de schema:

| # | Spec | Migración | Tabla/cambio | Depende de migración |
|---|------|-----------|-------------|---------------------|
| 1 | S-03 | `agregar_configuracion_upload` | **Nueva:** `ConfiguracionUpload` | — |
| 2 | D-01 | `agregar_aprobado_por_validacion` | **Modificada:** `Validacion` + `aprobadoPor` | — |
| 3 | D-02 | `agregar_regla_nivel_y_puntos` | **Nueva:** `ReglaNivel`. **Modificada:** `TipoDocumento` + `puntosOtorgados`, `ordenVisualizacion` | Migración 2 |
| 4 | INT-01 | `agregar_campos_arca_taller` | **Nueva:** `ConsultaArca`. **Modificada:** `Taller` +9 campos. **Enums:** `TipoInscripcionAfip`, `EstadoCuit` | Migración 2 |
| 5 | F-02 | `agregar_whatsapp_y_magic_links` | **Nuevas:** `MensajeWhatsapp`, `MagicLink`. **Enum:** `EstadoMensajeWhatsapp`. **Modificada:** `User` +2 arrays | — |
| 6 | F-05 | `agregar_motivo_no_match` | **Nueva:** `MotivoNoMatch`. **Enum:** `MotivoCategoria`. **Modificada:** `Pedido` +1 array | Migración 3 |
| 7 | T-03 | `agregar_nota_seguimiento` | **Nueva:** `NotaSeguimiento`. **Modificada:** `User` +2 arrays | Migración 5 (ambas tocan User) |
| 8 | T-02 | `agregar_observacion_campo` | **Nueva:** `ObservacionCampo`. **Enums:** `TipoObservacion`, `FuenteObservacion`, `Sentimiento`. **Modificada:** `User` +2 arrays | Migración 7 (ambas tocan User) |

### 4.2 — Zona de riesgo: modelo User

Tres specs agregan arrays de relación al modelo User:

```prisma
// F-02 (migración 5)
mensajesWhatsapp    MensajeWhatsapp[]
magicLinks          MagicLink[]

// T-03 (migración 7)
notasSeguimientoRecibidas  NotaSeguimiento[] @relation("userNotas")
notasSeguimientoCreadas    NotaSeguimiento[] @relation("autorNotas")

// T-02 (migración 8)
observacionesCreadas    ObservacionCampo[] @relation("ObservacionAutor")
observacionesRecibidas  ObservacionCampo[] @relation("ObservacionUser")
```

**Regla:** implementar F-02 → T-03 → T-02 secuencialmente. Nunca en branches paralelos que toquen `schema.prisma`. El orden propuesto en §3 ya respeta esto (posiciones 12, 19, 20).

### 4.3 — Specs sin migración

Los siguientes specs no tocan `schema.prisma`:

- S-01 (cookies — solo `auth.config.ts`)
- S-02 (rate limiting — solo Redis externo)
- S-04 (logs — usa `LogActividad` existente + wrapper)
- Q-01 (tests E2E — solo archivos de test)
- Q-02 (error boundaries — solo componentes)
- Q-03 (errores consistentes — solo lib + migrar handlers)
- F-01 (próximo nivel — solo componentes, lee de DB existente)
- F-06 (RAG — usa `RagDocumento` existente + PDF lib)
- UX-01..04 (componentes UI)
- QA-formato (tooling)
- QA-issues (endpoint + tooling)

Estos 11 specs se pueden implementar sin riesgo de conflicto de migraciones.

---

## 5. Hitos de validación

### Hito 1 — Infraestructura lista (después de Bloque 1)
- [ ] Preview y producción usan DBs separadas
- [ ] Banner "AMBIENTE DE PRUEBAS" visible en Preview, invisible en producción
- [ ] `prisma migrate deploy` corre en cada build
- [ ] `/admin/logs` tiene filtros por usuario, acción, entidad, fecha
- [ ] Sergio puede hacer seed en Preview sin afectar producción

### Hito 2 — Plataforma hardened (después de Bloque 2)
- [ ] Cookies con `httpOnly`, `secure`, `sameSite: lax`, `maxAge: 7d`
- [ ] 10 endpoints con rate limiting activo
- [ ] Uploads validados por magic bytes (no solo extensión)
- [ ] Test E2E de cookies pasa en Preview

### Hito 3 — Arquitectura institucional (después de Bloque 3)
- [ ] ESTADO puede aprobar/rechazar documentos desde `/estado/talleres/[id]`
- [ ] ADMIN ya no puede aprobar documentos (solo gestión técnica)
- [ ] Tipos de documento configurables desde `/estado/documentos` con puntos por tipo
- [ ] `ReglaNivel` configurable desde `/estado/configuracion-niveles`
- [ ] `aplicarNivel()` lee umbrales y puntos de DB

### Hito 4 — Calidad garantizada (después de Bloque 4)
- [ ] Error boundaries en los 7 route groups + `global-error.tsx`
- [ ] `apiHandler` captura P2002, P2025, P2003 automáticamente
- [ ] `apiFetch` parsea formato viejo (LEGACY_ERROR) y nuevo
- [ ] 8 tests E2E pasan en Preview
- [ ] CI corre tests en cada PR a develop

### Hito 5 — Integraciones activas (después de Bloque 5)
- [ ] ARCA trae tipo inscripción, categoría monotributo, empleados SIPA
- [ ] Badges "Verificado por ARCA" / "Autodeclarado" visibles
- [ ] WhatsApp genera links `wa.me` con magic auth tokens
- [ ] Asistente RAG responde con corpus real de OIT/ARCA
- [ ] 6 triggers de WhatsApp activos (pedido nuevo, cotización aceptada, etc.)

### Hito 6 — Features completos (después de Bloque 6)
- [ ] Dashboard taller muestra `ProximoNivelCard` con pasos priorizados
- [ ] ESTADO ve dashboard de demanda insatisfecha con talleres "cerca de matchear"
- [ ] Admin puede enviar mensajes individuales con preview y WhatsApp opcional
- [ ] Loading states, empty states, toast y breadcrumbs consistentes

### Hito 7 — Listo para OIT (después de Bloque 7)
- [ ] ESTADO puede generar informe mensual Excel de 7 hojas
- [ ] Dashboard de onboarding muestra funnel de adopción
- [ ] Checklist guía primeros pasos de talleres y marcas
- [ ] Reporte de campo captura observaciones cualitativas
- [ ] Exportar demanda insatisfecha a CSV

### Hito 8 — QA operativo (después de Bloque 8)
- [ ] QAs V3 generan HTML con Eje 6 (perfiles interdisciplinarios)
- [ ] Badges de estado de issues aparecen en QA HTML
- [ ] Polling cada 2 min actualiza badges sin reload
- [ ] 5 auditores pueden trabajar sin reportar duplicados

---

## 6. Riesgos y mitigaciones

### R1 — AfipSDK no responde sobre pricing (bloquea INT-01)
- **Impacto:** INT-01 no se puede implementar. F-04 (exportes con datos ARCA) queda sin datos verificados.
- **Probabilidad:** Media — ticket abierto 21/04/2026, sin respuesta al 25/04
- **Mitigación:** INT-01 está en Bloque 5 (posición 11). Si AfipSDK no responde para cuando se llega al Bloque 5, saltar INT-01 e implementar Bloques 6-7 sin datos ARCA. F-04 exporta solo datos autodeclarados. INT-01 se retoma cuando AfipSDK responda. **Specs que funcionan sin INT-01:** F-04 (exporta sin columnas ARCA), T-03 (onboarding sin verificación automática — verificación manual como fallback).

### R2 — Migración D-01 rompe flujos existentes
- **Impacto:** Mover server actions de `/admin/talleres/[id]` a `/estado/talleres/[id]` puede dejar enlaces rotos, redirects mal configurados, o acciones silenciosamente denegadas.
- **Probabilidad:** Baja-media
- **Mitigación:** D-01 se implementa en Bloque 3 (posición 6), después de S-04 (logs). Cada cambio de permisos queda logueado. Q-01 (tests E2E) se implementa en Bloque 4 (posición 10) y valida los flujos post-D-01.

### R3 — `prisma migrate deploy` falla en producción
- **Impacto:** Deploy roto. Producción desactualizada.
- **Probabilidad:** Baja — las migraciones son aditivas (campos nuevos, tablas nuevas), no destructivas.
- **Mitigación:** I-01 prescribe backup de producción antes de empezar. El build script `prisma migrate deploy && prisma generate && next build` falla rápido si la migración tiene problemas. Preview valida la migración antes de que llegue a producción.

### R4 — Upstash Redis free tier insuficiente
- **Impacto:** Rate limiting deja de funcionar. S-02 prescribe "fail open" (si Redis cae, permite la request).
- **Probabilidad:** Baja — free tier de 10,000 comandos/día cubre un piloto de 25 talleres.
- **Mitigación:** `rateLimit()` tiene try/catch que falla abierto. Monitorear uso en dashboard de Upstash. Si se excede, upgrade a plan Pro ($10/mes).

### R5 — Colisión de migraciones en branches paralelos
- **Impacto:** `prisma migrate dev` genera conflictos de migración. Resolverlos es tedioso.
- **Probabilidad:** Media — si Sergio implementa algo mientras Gerardo está en otro spec.
- **Mitigación:** Solo Gerardo toca `schema.prisma` (regla de CLAUDE.md). Las migraciones siguen el orden de §4.1. Si hay conflicto, `prisma migrate dev` lo detecta y hay que resolver manualmente con `prisma migrate resolve`.

### R6 — Corpus RAG no está listo a tiempo
- **Impacto:** F-06 se implementa pero el asistente responde con corpus vacío o de test.
- **Probabilidad:** Alta — requiere que OIT/UNTREF recolecte documentos reales.
- **Mitigación:** F-06 se implementa técnicamente (PDF upload, prompts, widget). El corpus se carga cuando esté disponible. El feature flag `asistente_rag` se mantiene OFF hasta que haya al menos 10 documentos reales.

### R7 — Piloto OIT arranca 1/mayo y V3 no está completo
- **Impacto:** El piloto arranca con funcionalidad parcial de V3.
- **Probabilidad:** Alta — 135 horas estimadas, ~3 semanas a tiempo completo.
- **Mitigación:** Los Bloques 1-4 (posiciones 1-10) son los **mínimos para un piloto funcional**: ambientes separados, seguridad, roles correctos, errores consistentes, tests. Las features de Bloques 5-7 mejoran la experiencia pero no la bloquean. Priorizar en este orden.

---

## 7. Dependencias no formalizadas descubiertas

Además de las dependencias corregidas en la revisión cruzada, se detectó:

| Spec | Dependencia implícita | Razón | Ya formalizada |
|------|----------------------|-------|----------------|
| F-04 | F-05 | Exporte "demanda" usa tabla `MotivoNoMatch` | Sí (revisión cruzada D-01) |
| F-04 | S-04 | Usa `logAccionAdmin` | Sí (revisión cruzada D-02) |
| F-04 | Q-03 | Endpoint nuevo V3 | Sí (revisión cruzada C-03) |
| F-07 | Q-03 | Endpoint nuevo V3 | Sí (revisión cruzada C-02/D-03) |
| T-03 | F-07 | Recordatorios usan mensajes individuales | Sí (revisión cruzada D-04) |
| T-03 | Q-03 | Endpoint nuevo V3 | Sí (revisión cruzada D-05) |
| F-05 | Q-03 | 3 endpoints nuevos V3 | Sí (revisión cruzada D-06) |

Todas las dependencias detectadas ya fueron formalizadas en los specs como parte de la revisión cruzada.
