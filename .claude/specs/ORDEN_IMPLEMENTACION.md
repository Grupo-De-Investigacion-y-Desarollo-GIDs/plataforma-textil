# Orden de implementacion — Semanas 1-3

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
           │        └─► notificaciones-matching (G)
           └─► publicacion-pedidos-ui (S)

    Sin dependencias (paralelos):
    ├── landing-dos-entradas (S)
    ├── queries-dashboard-estado (G) ─► dashboard-estado-ui (S)
    ├── gamificacion (S)  [D4 necesita queries-dashboard implicitamente]
    ├── rag-decision-pipeline (G)
    └── pdf-qr-certificados (G)
```

G = Gerardo, S = Sergio

---

## Orden de implementacion — Gerardo

Prioridad por impacto: primero lo que desbloquea a Sergio, despues lo independiente.

| # | Spec | Deps | Desbloquea | Estado |
|---|------|------|------------|--------|
| 1 | `semana1-infra-contenido` (parte G) | ninguna | registro-3-pasos (S), layout-contenido (S) | pendiente |
| 2 | `semana1-afipsdk-cuit` | ninguna | registro-3-pasos (S) | pendiente |
| 3 | `semana2-schema-e2` | ninguna | api-cotizaciones (G), publicacion-pedidos-ui (S) | pendiente |
| 4 | `semana2-queries-dashboard-estado` | ninguna | dashboard-estado-ui (S), gamificacion D4 (S) | pendiente |
| 5 | `semana2-api-cotizaciones` | schema-e2 | publicacion-pedidos-ui (S), notificaciones-matching (G) | pendiente |
| 6 | `semana1-oauth-magiclink` | registro-3-pasos (S) | — | pendiente |
| 7 | `semana2-rag-decision-pipeline` | ninguna | — | pendiente |
| 8 | `semana3-pdf-qr-certificados` | ninguna | — | pendiente |
| 9 | `semana3-notificaciones-matching` | schema-e2 + api-cotizaciones | — | pendiente |

Nota: oauth-magiclink (#6) espera que Sergio termine registro-3-pasos. Si Sergio se atrasa, Gerardo salta a #7 o #8.

---

## Orden de implementacion — Sergio

| # | Spec | Deps (esperar merge de Gerardo) | Estado |
|---|------|---------------------------------|--------|
| 1 | `semana1-landing-dos-entradas` | ninguna — puede arrancar dia 1 | pendiente |
| 2 | `semana2-gamificacion` (D1+D2+D3) | ninguna — D4 espera queries-dashboard | pendiente |
| 3 | `semana1-registro-3-pasos` | infra-contenido (G) + afipsdk-cuit (G) | pendiente |
| 4 | `semana2-layout-contenido` | infra-contenido (G) | pendiente |
| 5 | `semana2-dashboard-estado-ui` | queries-dashboard-estado (G) | pendiente |
| 6 | `semana2-gamificacion` (D4) | queries-dashboard-estado (G) | pendiente |
| 7 | `semana2-publicacion-pedidos-ui` | schema-e2 (G) + api-cotizaciones (G) | pendiente |
| 8 | `semana1-infra-contenido` (parte S) | infra-contenido parte G | pendiente |

Sergio puede hacer #1 y #2 desde el dia 1 sin esperar nada.

---

## Commits esperados por spec

Para que los bloqueos "ANTES DE ARRANCAR" funcionen, estos son los mensajes de commit que Gerardo debe usar al terminar cada spec:

| Spec | Mensaje de commit |
|------|-------------------|
| infra-contenido (parte G) | `feat: agregar rol CONTENIDO al schema y middleware` |
| afipsdk-cuit | `feat: integrar AfipSDK` |
| schema-e2 | `feat: agregar estado PUBLICADO y modelo Cotizacion` |
| queries-dashboard-estado | `feat: queries dashboard estado` |
| api-cotizaciones | `feat: API cotizaciones` |
| oauth-magiclink | `feat: Google OAuth y magic link` |
| rag-decision-pipeline | `feat: RAG infraestructura y pipeline` |
| pdf-qr-certificados | `feat: PDF y QR certificados` |
| notificaciones-matching | `feat: notificaciones talleres compatibles` |

Sergio busca estos mensajes en `git log` antes de arrancar.

---

## Como usar este archivo

1. **Gerardo** actualiza la columna "Estado" de su tabla al terminar cada spec (pendiente → mergeado)
2. **Sergio** consulta la tabla de Sergio para saber que puede arrancar
3. Si un spec se retrasa o cambia de prioridad, actualizar este archivo
4. Los specs individuales tienen su propio "ANTES DE ARRANCAR" con checks concretos — este archivo es el mapa general
