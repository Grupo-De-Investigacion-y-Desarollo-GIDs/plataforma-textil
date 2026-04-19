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

### P-02 — Prisma Accelerate o connection pooling
- **Problema:** La latencia de Supabase sa-east-1 genera ~100-200ms por roundtrip. Con queries paralelas mejora, pero la causa raíz es la distancia a la DB.
- **Próximo paso:** Evaluar Prisma Accelerate (connection pooling + edge caching) para V3.
- **Prioridad:** Media — depende de cuánto mejoren los fixes V2
- **Nota:** Consolidado con I-03 (infraestructura)

### P-03 — Auditoría de performance completa del sistema
- **Problema:** Inventario de todas las rutas, clasificación por riesgo, medición automatizada con perf-check.js extendido, análisis de queries Prisma por página.
- **Base:** Fixes aplicados en V2 (P-01) y latencia Supabase pendiente (P-02).
- **Prioridad:** Media — ejecutar al inicio de V3 para priorizar optimizaciones

---

## Infraestructura

### I-01 — Separar ambientes: dos Supabase (desarrollo y producción)
- **Problema:** Hoy Preview y Producción comparten la misma DB — riesgo real para el piloto con OIT. Branch `main` debería deployar a producción automáticamente en Vercel, branch `develop` a Preview. Cada ambiente con su propia instancia de Supabase.
- **Incluye:** Banner de ambiente en la plataforma para que el auditor sepa dónde está.
- **Prioridad:** Alta — bloqueante para piloto real con datos de talleres reales

### I-02 — Mover funciones Vercel a región gru1 (São Paulo)
- **Problema:** Las funciones corren en `iad1` (Virginia) pero la DB está en `sa-east-1` (São Paulo). Cada query tiene ~100-150ms de latencia interna entre función y DB.
- **Fix:** Configurar `regions: ['gru1']` en Vercel para que las funciones corran en São Paulo.
- **Prioridad:** Alta — fix de una línea con impacto directo en latencia

### I-03 — Prisma Accelerate o connection pooling
- **Problema:** Mismo que P-02 — la conexión directa a Supabase desde funciones serverless genera overhead de conexión en cada cold start.
- **Próximo paso:** Evaluar Prisma Accelerate (connection pooling + edge caching) o PgBouncer de Supabase.
- **Prioridad:** Media — evaluar después de I-02

---

## Seguridad

### S-01 — Auditoría de configuración de cookies de sesión (NextAuth)
- **Problema:** Verificar que `httpOnly`, `secure` y `sameSite` están correctamente configurados para producción. Revisar expiración de sesión y rotación de tokens.
- **Base:** NextAuth v5
- **Prioridad:** Alta — requisito para piloto real

### S-02 — Rate limiting en APIs críticas
- **Problema:** Hoy no hay límite de requests en endpoints como `/api/cotizaciones`, `/api/pedidos`, `/api/auth/callback/credentials`. Un actor malicioso podría hacer brute force o spam.
- **Próximo paso:** Implementar rate limiting con Vercel WAF o middleware custom.
- **Prioridad:** Alta — antes de exponer a usuarios reales

### S-03 — Validación server-side de archivos subidos
- **Problema:** El tipo real y tamaño máximo de archivos no se verifican en el servidor. Un usuario podría subir un ejecutable renombrándolo como `.jpg`.
- **Próximo paso:** Verificar magic bytes del archivo en el endpoint de upload, no solo la extensión.
- **Prioridad:** Media — mitigado parcialmente por Supabase Storage policies

### S-04 — Logs de auditoría para acciones sensibles del admin
- **Problema:** Acciones como borrar usuario, revocar certificado o cambiar nivel manualmente no generan logs detallados con el admin que las ejecutó.
- **Próximo paso:** Agregar `logActividad` en endpoints de admin con `userId` del admin y detalles de la acción.
- **Prioridad:** Media — necesario para accountability en piloto OIT

---

## Funcionalidades nuevas

### F-01 — "Tu próximo nivel" (guía de formalización en dashboard del taller)
- **Spec:** `v3-proximo-nivel-dashboard.md`
- **Depende de:** D-01, D-02
- **Descripción:** Sección en `/taller` que muestra pasos concretos para subir de nivel, con prioridad, puntos y botones de acción directos. Requerimiento OIT — la plataforma debe guiar activamente hacia la formalización.

### F-02 — WhatsApp bot para talleres
- **Problema:** Canal principal de la visión original del proyecto. Sin esto los talleres reales no usan la plataforma web — la mayoría no tiene hábito de abrir un browser para gestionar su trabajo.
- **Prioridad:** Crítica — sin esto el piloto con talleres reales no funciona

### F-03 — Verificar que /verificar está linkeada desde lugares visibles
- **Problema:** La página de verificación de certificados existe pero no hay links visibles para que usuarios externos (marcas, auditores) la encuentren.
- **Prioridad:** Baja — no bloquea piloto pero reduce valor del certificado

### F-04 — Exportes del Estado en formatos reales
- **Problema:** Los botones CSV/Excel en `/admin/talleres` y `/estado/exportar` no tienen handler implementado o son parciales.
- **Prioridad:** Media — el Estado necesita poder extraer datos para informes

---

## Calidad de código

### Q-01 — Cobertura E2E con Playwright
- **Problema:** No hay tests end-to-end automatizados. Los flujos críticos (registro, login, crear pedido, cotizar, aceptar, completar) no se verifican automáticamente antes de cada deploy.
- **Prioridad:** Alta — garantía antes de cada demo con OIT

### Q-02 — Error boundaries en todos los layouts
- **Problema:** Hoy si una query falla (DB caída, timeout), el usuario ve una página rota sin contexto. Faltan `error.tsx` en los layouts de cada rol.
- **Prioridad:** Media — UX degradada pero no bloqueante

### Q-03 — Manejo de errores consistente en APIs
- **Problema:** Las respuestas de error son heterogéneas entre endpoints — algunos devuelven `{ error: string }`, otros `{ message: string }`, algunos no devuelven body.
- **Prioridad:** Baja — afecta DX, no UX directamente

---

## Deuda técnica documentada de V2

*(Se agrega a medida que se identifica)*

---

## Prioridades para piloto OIT

Orden recomendado para V3, basado en impacto en el piloto real con talleres y la OIT:

1. **F-02 — WhatsApp bot** — sin esto talleres reales no participan
2. **I-01 — Separar ambientes** — sin esto no podés tener OIT y desarrollo al mismo tiempo
3. **Q-01 — Tests E2E** — garantía antes de cada demo
4. **S-02 — Rate limiting** — antes de exponer a usuarios reales
