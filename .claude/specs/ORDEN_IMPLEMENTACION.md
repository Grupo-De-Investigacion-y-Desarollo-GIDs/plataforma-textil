# Orden de Implementación — v2

**Modalidad:** Implementación completa por Gerardo (backend + frontend + tests). Sergio realiza auditoría/validación humana posterior a cada implementación.

**Comando estándar por spec:**

```
Lee [spec].md y ejecutá el spec completo
```

---

## Prerrequisito único antes de arrancar

Responder estas dos preguntas:

1. **¿Hay datos reales en producción que no se pueden perder?** (afecta si se puede hacer `migrate reset`)
2. **¿Hay alguien de OIT/UNTREF asignado para redactar el corpus RAG?**

---

## Orden de implementación

### Bloque 1 — Operativo (ejecutar primero, sin esto nada funciona en prod)

| # | Spec | Commit | Notas |
|---|------|--------|-------|
| 1 | `v2-config-piloto-pre-deploy` | `5bc0950` | Buckets, keys, feature flags — checklist manual en Supabase + Vercel |

### Bloque 2 — Schema y datos (ejecutar antes de cualquier UI)

| # | Spec | Commit | Notas |
|---|------|--------|-------|
| 2 | `v2-epica-storage-documentos` | `efe59c4` | ⚠️ Requiere `migrate reset --force` — punto de no retorno |
| 3 | `v2-epica-flujo-comercial-unificado` | `cdcd130` | Depende de Bloque 2 mergeado |

### Bloque 3 — Backend independiente (paralelo o en cualquier orden)

| # | Spec | Commit | Notas |
|---|------|--------|-------|
| 4 | `v2-log-niveles-bidireccional` | `d21386b` | 0 migraciones, independiente |
| 5 | `v2-rag-corpus-real` | `13c0ad8` | Deshabilitar flag + limpiar corpus + conectar config |
| 6 | `v2-seguridad-tests-e2e` | `90cea52` | Fix falsos positivos — correr contra prod |

### Bloque 4 — Features principales (dependen de Bloques 2 y 3)

| # | Spec | Commit | Notas |
|---|------|--------|-------|
| 7 | `v2-epica-perfil-productivo` | `455b73c` | Depende de storage-documentos (`nivel.ts`) |
| 8 | `v2-epica-academia` | `6a1b695` | Depende de storage-documentos (tipos canónicos) |
| 9 | `v2-epica-notificaciones` | `c33f0c4` | Independiente |
| 10 | `v2-notificaciones-accionables` | `592de2d` | Depende de `v2-epica-notificaciones` |
| 11 | `v2-epica-perfiles-contacto` | `8c8a36d` | Independiente |

### Bloque 5 — Contenido visual (depende de Bloque 2 y flujo comercial)

| # | Spec | Commit | Notas |
|---|------|--------|-------|
| 12 | `v2-impl-contenido-visual` | `acde86d` | Depende de flujo-comercial-unificado + storage multi-bucket |

---

## Validación humana (Sergio) — por bloque

Sergio audita después de cada bloque completo, no spec por spec:

| Bloque | Qué valida |
|--------|-----------|
| Bloque 2 completo | Re-seed correcto, 7 validaciones por taller, labels legibles, flujo de invitación |
| Bloque 3 completo | Tests E2E en verde, logs de nivel correctos, RAG deshabilitado |
| Bloque 4 completo | Wizard, academia, notificaciones, perfiles |
| Bloque 5 completo | Portfolio, imágenes en pedidos, cotizaciones con fotos |

---

## Corpus RAG — trabajo editorial (OIT/UNTREF)

Independiente del desarrollo. Se puede hacer en paralelo.

**Acceso:** `/admin/integraciones/llm` → sección "Corpus RAG"

**Categorías a cubrir:**

- **tramites** — 7 documentos (uno por tipo de documento de formalización)
- **plataforma** — 5 documentos (niveles, cómo funciona, directorio, pedidos, cotizaciones)
- **capacitacion** — según contenido disponible
- **formalizacion** — beneficios, auditorías

**Formato de cada documento:** ver guía en `v2-rag-corpus-real.md` §6

Una vez cargados y validados: activar flag `asistente_rag` desde `/admin/configuracion`

---

## Post-piloto (no implementar ahora)

- **S1-04** — Vencimiento de documentos
- **S3-04** — KPI de reputación (fill rate, on-time rate)
- **S-VIS-10** — Fotos de instalaciones
- Badge dinámico de notificaciones en el sidebar
- Edición básica del perfil de marca
- Signed URLs para bucket `documentos` (reemplazar URLs públicas)
