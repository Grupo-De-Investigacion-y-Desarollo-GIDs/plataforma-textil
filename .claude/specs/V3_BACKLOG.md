# Backlog V3 — Aprendizajes de V2

Fecha inicio: 2026-04-17
Base: validación interna V2 + QA de Sergio + análisis arquitectural

---

## Decisiones arquitecturales pendientes

### D-01 — Redefinición de roles: ESTADO valida documentos
- **Problema:** Hoy ADMIN aprueba/rechaza documentos y configura tipos por nivel. Debería ser ESTADO — es quien regula los requisitos laborales.
- **Impacto:** `/admin/documentos` → `/estado/documentos`, aprobación de validaciones pasa al rol ESTADO
- **Specs afectados en V2:** v2-epica-storage-documentos, v2-epica-perfiles-contacto
- **QAs afectados:** QA_v2-epica-storage-documentos, QA_v2-epica-perfiles-contacto

### D-02 — "Tu próximo nivel" con tipos de documento desde DB
- **Problema:** La guía de formalización necesita leer los tipos de documento requeridos por nivel desde la DB, no hardcodearlos.
- **Depende de:** D-01 (ESTADO configura los tipos)
- **Spec relacionado:** v2-proximo-nivel-dashboard (postergado a V3)

---

## Performance

### P-01 — Plataforma lenta en general
- **Problema:** Todas las páginas cargan lento. No hay métricas todavía.
- **Próximo paso:** Medir con Vercel Analytics + Chrome DevTools cuáles son las páginas más lentas y por qué (queries N+1, server components pesados, imágenes sin optimizar, etc.)
- **Prioridad:** Alta — puede bloquear el piloto real
- **Fixes V2 aplicados:** Vercel Analytics instalado (`0c17f02`), queries paralelas en /taller (`1b9c8cf`), paginación directorio (`9b2aec8`)
- **Resultados medidos (warm):** `/taller` pasó de 2-4s a 330ms (~10x), `/directorio` de 4.8s a 236ms (~20x). Script: `node tools/perf-check.js`

### P-03 — Auditoría de performance completa del sistema
- **Problema:** Inventario de todas las rutas, clasificación por riesgo, medición automatizada con perf-check.js extendido, análisis de queries Prisma por página.
- **Base:** Fixes aplicados en V2 (P-01) y latencia Supabase pendiente (P-02).
- **Prioridad:** Media — ejecutar al inicio de V3 para priorizar optimizaciones

### P-02 — Prisma Accelerate o connection pooling
- **Problema:** La latencia de Supabase sa-east-1 genera ~100-200ms por roundtrip. Con queries paralelas mejora, pero la causa raíz es la distancia a la DB.
- **Próximo paso:** Evaluar Prisma Accelerate (connection pooling + edge caching) para V3.
- **Prioridad:** Media — depende de cuánto mejoren los fixes V2

---

## Seguridad

### S-01 — Auditoría de configuración de cookies de sesión (NextAuth)
- **Problema:** Verificar que `httpOnly`, `secure` y `sameSite` están correctamente configurados para producción. Revisar expiración de sesión y rotación de tokens.
- **Base:** NextAuth v5
- **Prioridad:** Alta — requisito para piloto real

---

## Funcionalidades nuevas

### F-01 — "Tu próximo nivel" (guía de formalización en dashboard del taller)
- **Spec:** `v3-proximo-nivel-dashboard.md`
- **Depende de:** D-01, D-02
- **Descripción:** Sección en `/taller` que muestra pasos concretos para subir de nivel, con prioridad, puntos y botones de acción directos. Requerimiento OIT — la plataforma debe guiar activamente hacia la formalización.

---

## Deuda técnica documentada de V2

*(Se agrega a medida que se identifica)*
