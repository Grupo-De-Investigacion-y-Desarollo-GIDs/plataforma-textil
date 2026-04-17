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

---

## Funcionalidades nuevas

*(Se agregan a medida que V2 avanza)*

---

## Deuda técnica documentada de V2

*(Se agrega a medida que se identifica)*
