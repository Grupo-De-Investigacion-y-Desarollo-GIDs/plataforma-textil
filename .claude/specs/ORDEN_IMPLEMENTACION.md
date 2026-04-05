# Orden de implementacion — Semanas 1-4

Fecha: 2026-04-05
Referencia: cada spec vive en `.claude/specs/semanaX-nombre.md`
Regla: Sergio no arranca un spec hasta que sus dependencias esten mergeadas en develop.

---

## Grafo de dependencias

```
                    ┌─────────────────────┐
                    │ infra-contenido (G)  │ ← sin deps
                    └──────┬──────────────┘
                           │ desbloquea
              ┌────────────┼────────────────┐
              ▼            ▼                ▼
     registro-3-pasos  layout-contenido  (middleware CONTENIDO)
         (S)              (S)
              │
              ▼
     oauth-magiclink (G)

    ┌──────────────────┐
    │ afipsdk-cuit (G) │ ← sin deps
    └──────┬───────────┘
           │ desbloquea
           ▼
     registro-3-pasos (S)

    ┌──────────────────┐
    │ schema-e2 (G)    │ ← sin deps
    └──────┬───────────┘
           │ desbloquea
           ├─► api-cotizaciones (G)
           │        │ desbloquea
           │        ├─► publicacion-pedidos-ui (S)
           │        │        │ desbloquea
           │        │        └─► vistas-cotizaciones (S)
           │        └─► notificaciones-matching (G)
           └─► publicacion-pedidos-ui (S)

    pdf-qr-certificados (G) ─► acuerdos-comerciales (G)

    queries-dashboard-estado (G) ─► exportes-estado (G)
                                 ─► dashboard-estado-ui (S)

    rag-decision-pipeline (G) ─► chat-rag-ui (S)

    feature-flags (G) ← sin deps

    Sin dependencias (paralelos):
    ├── landing-dos-entradas (S)
    ├── gamificacion (S)
    ├── directorio-publico (S)
    ├── denuncia-publica (S)
    ├── whatsapp-perfil-marca (S)
    ├── stubs-perfil-publico (S)
    └── auditoria-detalle (S)
```

G = Gerardo, S = Sergio

---

## Estado de implementacion — Gerardo (11 specs, todos mergeados)

| # | Spec | Deps | Desbloquea | Estado |
|---|------|------|------------|--------|
| 1 | `semana1-infra-contenido` (parte G) | ninguna | registro-3-pasos (S), layout-contenido (S) | mergeado |
| 2 | `semana1-afipsdk-cuit` | ninguna | registro-3-pasos (S) | mergeado |
| 3 | `semana1-feature-flags` | ninguna | — | mergeado |
| 4 | `semana2-schema-e2` | ninguna | api-cotizaciones (G), publicacion-pedidos-ui (S) | mergeado |
| 5 | `semana2-queries-dashboard-estado` | ninguna | dashboard-estado-ui (S), exportes-estado (G) | mergeado |
| 6 | `semana2-api-cotizaciones` | schema-e2 | publicacion-pedidos-ui (S), notificaciones-matching (G) | mergeado |
| 7 | `semana1-oauth-magiclink` | — | — | mergeado |
| 8 | `semana2-rag-decision-pipeline` | ninguna | chat-rag-ui (S) | mergeado |
| 9 | `semana3-pdf-qr-certificados` | ninguna | acuerdos-comerciales (G) | mergeado |
| 10 | `semana3-notificaciones-matching` | schema-e2 + api-cotizaciones | — | mergeado |
| 11 | `semana3-acuerdos-comerciales` | pdf-qr-certificados | — | mergeado |
| 12 | `semana3-exportes-estado` | queries-dashboard-estado | — | mergeado |

---

## Estado de implementacion — Sergio (13 specs, todos pendientes)

| # | Spec | Deps (esperar merge de Gerardo) | Estado |
|---|------|---------------------------------|--------|
| 1 | `semana1-landing-dos-entradas` | ninguna — puede arrancar dia 1 | pendiente |
| 2 | `semana1-registro-3-pasos` | infra-contenido (G) + afipsdk-cuit (G) | pendiente |
| 3 | `semana2-layout-contenido` | infra-contenido (G) | pendiente |
| 4 | `semana2-gamificacion` | ninguna (D4 espera queries-dashboard) | pendiente |
| 5 | `semana2-dashboard-estado-ui` | queries-dashboard-estado (G) | pendiente |
| 6 | `semana2-publicacion-pedidos-ui` | schema-e2 (G) + api-cotizaciones (G) | pendiente |
| 7 | `semana3-auditoria-detalle` | ninguna | pendiente |
| 8 | `semana3-chat-rag-ui` | rag-decision-pipeline (G) | pendiente |
| 9 | `semana3-denuncia-publica` | ninguna | pendiente |
| 10 | `semana3-directorio-publico` | ninguna | pendiente |
| 11 | `semana3-stubs-perfil-publico` | ninguna | pendiente |
| 12 | `semana3-vistas-cotizaciones` | api-cotizaciones (G) + publicacion-pedidos-ui (S) | pendiente |
| 13 | `semana3-whatsapp-perfil-marca` | ninguna | pendiente |

**Todas las dependencias de Gerardo estan mergeadas.** Sergio puede arrancar cualquier spec excepto:
- `vistas-cotizaciones` (#12) que necesita que el propio Sergio termine `publicacion-pedidos-ui` (#6) primero.

---

## Semana 4 — Testing

Ver `.claude/specs/semana4-testing-checklist.md`. No se agrega funcionalidad nueva.

---

## Como usar este archivo

1. **Gerardo** actualiza la columna "Estado" de su tabla al terminar cada spec (pendiente → mergeado)
2. **Sergio** consulta la tabla de Sergio para saber que puede arrancar
3. Si un spec se retrasa o cambia de prioridad, actualizar este archivo
4. Los specs individuales tienen su propio "ANTES DE ARRANCAR" con checks concretos — este archivo es el mapa general
