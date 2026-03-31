# ROADMAP DE REMEDIACIÓN - PDT

Fecha: 2026-02-20
Objetivo: cerrar brecha TO-BE vs AS-IS con foco en seguridad, flujos core y operación.

## Fase 0 (Semana 1) - Blindaje inmediato

Meta: reducir riesgo operativo alto.

1. Homogeneizar `auth + role + ownership` en APIs críticas.
2. Corregir endpoints con mayor exposición de datos/acciones.
3. Definir checklist de seguridad de merge (mínimo obligatorio).
4. Agregar logging básico de mutaciones críticas en `log_actividad`.

Entregables:
- PR de hardening en `src/app/api/**/route.ts`.
- Documento de políticas API en `docs/API_SECURITY_RULES.md`.

## Fase 1 (Semana 2-3) - Flujos críticos de negocio

Meta: hacer que los journeys principales sean reales y confiables.

1. Password reset real (token, email, validación, cambio password).
2. Persistencia de wizard `/taller/perfil/completar`.
3. Flujo de formalización documental con upload/storage y estados.
4. Cierre funcional de detalle academia y progreso.

Entregables:
- APIs y páginas operativas para auth/formalización/academia.
- Métricas de adopción por flujo (eventos básicos).

## Fase 2 (Semana 4-5) - Integraciones y trazabilidad

Meta: convertir funcionalidades simuladas en capacidades reales.

1. Integración email transaccional (reset, notificaciones básicas).
2. QR y verificación de certificados end-to-end.
3. Generación de PDF para certificado y primer reporte estado.
4. ARCA (iniciar con verificación CUIT en registro/admin).

Entregables:
- `lib` de integraciones productivas.
- Variables de entorno y playbook de operación por integración.

## Fase 3 (Semana 6-7) - Admin y analítica operativa

Meta: cerrar panel de gestión para operación real.

1. Reemplazar pantallas admin mock por datos persistentes.
2. Completar acciones de revisión/aprobación/documentación.
3. Consolidar dashboard estado y exportes confiables.

Entregables:
- Admin funcional en módulos de mayor uso.
- Exportes y reportes auditables por período.

## Fase 4 (Semana 8) - Calidad y escalamiento

Meta: bajar riesgo de regresión y estabilizar releases.

1. Testing base: API + flujos E2E críticos.
2. Gates de CI: lint, typecheck, test mínimo, smoke E2E.
3. Observabilidad operativa (errores, tiempos, eventos de negocio).

Entregables:
- Pipeline CI con mínimos de calidad.
- Reporte semanal de salud del producto.

## Backlog priorizado (resumen)

Prioridad inmediata:
1. Seguridad API.
2. Password reset.
3. Wizard taller persistente.
4. Formalización con upload real.

Prioridad siguiente:
1. Academia detalle real.
2. Integraciones email/QR/PDF.
3. Admin detalle entidades sin mock.

## Criterios de éxito

1. Cero endpoints críticos sin autorización adecuada.
2. Flujos login/registro/reset/formalización/pedido completables sin pasos fake.
3. Menos de 5% de pantallas críticas con comportamiento mock.
4. Cobertura de pruebas en journeys core acordados.

## Cadencia recomendada

1. Revisión semanal de `docs/GAP_MATRIX.md`.
2. Cierre quincenal de objetivos de fase.
3. Ajuste de roadmap según incidentes y métricas de uso reales.
