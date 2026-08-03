# Handover PDT — Análisis y plan de trabajo

## Contexto

OIT solicitó entregar un Handover Package con la estructura estándar (puntos a-j). Este documento analiza qué hay, qué falta, qué no aplica por diseño arquitectónico (stack serverless Vercel + Supabase) y propone una división de tareas entre Sergio (coordinación/administrativo) y Gera (técnico).

## Nota sobre el stack

Varios ítems del checklist genérico de OIT asumen un despliegue tradicional (infra propia, contenedores, binarios). El PDT se armó intencionalmente en un stack managed (Vercel + Supabase), por lo cual algunos ítems se entregan adaptados y otros se declaran explícitamente como "N/A por diseño". Cada N/A queda justificado en el documento final de entrega.

---

## a) Código y repositorios

**Hay**: repositorio GitHub activo, `README.md`, historial Git completo, ramas `main`/`develop`, `CLAUDE.md` con convenciones internas.

**Falta**:
- `CONTRIBUTING.md`.
- Release notes formales / `CHANGELOG.md`.
- Tags de release.

**Responsable**: Gera.

---

## b) Infraestructura y despliegue

**Hay**: deploy en Vercel (region `gru1`), workflows GitHub Actions (`e2e.yml`, `qa-pages.yml`), `develop` → preview, `main` → producción, `package.json` con script de build (`prisma migrate deploy && prisma generate && next build`).

**Falta**:
- Documento descriptivo de arquitectura de deploy (proyecto Vercel, plan, region, DNS).
- Runbook operativo mínimo con 3-5 escenarios típicos (caída de Vercel/Supabase, migración fallida, cambio de dominio, rotación de secret).

**N/A por diseño**:
- Infra-as-Code (IaC): Vercel/Supabase son PaaS/BaaS. La infra vive en las UIs de los proveedores.
- Manifiestos de contenedores: arquitectura serverless, no hay Dockerfile ni Kubernetes.
- Scripts de despliegue y rollback: Vercel automatiza el deploy; rollback desde su UI. Se entrega procedimiento documentado, no scripts.

**Responsable**: Gera.

---

## c) Artefactos ejecutables

**Hay**: código fuente en Git, cada commit identificable por SHA.

**Decisión de entrega**: se entrega vía **tag de release + commit SHA** como artefacto identificable. No se genera tarball formal salvo pedido explícito posterior de OIT.

**N/A por diseño**: builds y hashes de binario no aplican en serverless.

**Responsable**: Gera (creación del tag).

---

## d) Configuración, acceso y credenciales

**Hay**: `.env.example` con todas las variables listadas (Supabase, NextAuth, Resend, Google OAuth, Supabase Storage, Anthropic, Voyage, AFIP SDK, GitHub, Upstash). Variables cargadas en Vercel y GitHub Actions secrets.

**Falta**:
- Definir titularidad institucional post-entrega (a qué email de OIT/UNTREF se transfieren las cuentas de Vercel, Supabase, dominio, Google OAuth, etc.).
- Inventario formal: qué secreto vive dónde y cómo se rota.
- DNS y dominios documentados (registrador, propietario, CNAME, TXT, MX).
- Certificados (gestionados por Vercel, hay que documentar).
- Storage/buckets de Supabase, políticas RLS y retención.
- Política de rotación de credenciales + calendario.
- Lista de contactos de escalamiento por proveedor (soporte Vercel, Supabase, Resend, etc.).

**Cambia por stack**: no hay secrets custom, todos son API keys de servicios de terceros. Rotación desde el dashboard de cada proveedor.

**Responsable**: **Sergio coordina con Matías y OIT** para definir titularidad, receptores y política institucional. Una vez definido, Gera arma el inventario técnico correspondiente.

---

## e) Datos y migraciones

**Hay**: `prisma/schema.prisma` completo, 28 migraciones versionadas, `prisma/seed.ts`, scripts SQL de verificación.

**Falta**:
- Procedimiento formal de backup y restore documentado.
- Política de retención de datos.

**Cambia por stack**: backups automáticos de Supabase; documentar procedimiento de restore, no armar mecanismo propio. Plan de migración a otra infra no aplica.

**Responsable**: Gera.

---

## f) Documentación técnica y funcional

**Hay** (sección sólida): `docs/03_tecnico/` (arquitectura, integraciones AFIP/ARCA/ANSES, API contract, design system), `docs/02_funcional/` (70 wireframes, casos de uso, historias, funciones), `docs/qa-v2/` (visión y modelo funcional), `docs/INFORME_1/2/3` (presentaciones).

**Falta**:
- **Manual de operación** (día a día: crear usuarios, resetear cuentas, procesar incidencias).
- **Manual de administración** (uso del panel `/admin`, gestión de contenido).
- Guía de desarrollo actualizada (levantar local, agregar features, correr tests).
- Release notes consolidadas.

**Responsable**:
- **Sergio**: Manual de operación + Manual de administración.
- **Gera**: Guía de desarrollo actualizada + release notes.

---

## g) Calidad, pruebas y seguridad

**Hay**: 33 tests unitarios en `src/__tests__/`, 15 archivos E2E con Playwright, CI que corre E2E contra preview, CORS y rate limiting (Upstash) implementados y testeados, `docs/seguridad/cookies.md`.

**Falta**:
- CSP (Content-Security-Policy) — no configurada en `next.config.ts`.
- Headers de seguridad (X-Frame-Options, X-Content-Type-Options, HSTS, Referrer-Policy) — no configurados.
- Reporte formal de cobertura de tests.
- Matriz de riesgos.
- Hallazgos de seguridad consolidados en un documento central.
- Documento de hardening aplicado.

**Cambia por stack**: hardening tradicional (nginx, firewall, patcheo del OS) no aplica — Vercel lo maneja. Hardening aplicable = Next.js + Vercel + Supabase RLS.

**Responsable**:
- **Sergio**: decidir formato de matriz de riesgos (formal ISO/OIT vs. pragmática "hallazgos + mitigaciones") en conversación con Gera.
- **Gera**: implementar CSP + headers en `next.config.ts`, generar reporte de cobertura, consolidar hallazgos.

---

## h) Licencias y propiedad intelectual

**Hay**: `package.json` con todas las dependencias listadas.

**Falta**:
- Archivo `LICENSE` del proyecto (README dice "por definir").
- Listado de licencias de dependencias (generar con `license-checker`).
- Documento de asignación / cesión de derechos.
- Tabla de componentes SaaS: Vercel, Supabase, Resend, Google OAuth, AFIP SDK, Anthropic, Voyage, Upstash, GitHub — con propietario, plan y estado de suscripción.

**Cambia por stack**: hay más SaaS que en un stack tradicional. La sección "componentes de terceros" es más gruesa e importante.

**Responsable**:
- **Sergio**: decidir la licencia del proyecto (con UNTREF/OIT) + documento de cesión de derechos con el equipo.
- **Gera**: reporte automático de licencias (`license-checker`) + tabla de SaaS.

---

## i) Cumplimiento y legal

**Hay**: páginas `/terminos`, `/privacidad`, `/accesibilidad` (revisar contenido); auth con roles y RBAC.

**Falta** (crítico para OIT):
- P-01: Consentimiento explícito en registro (~4h).
- P-04: Derecho a descargar datos (data portability).
- P-05: Derecho a eliminar cuenta y datos.
- P-06: Sistema de reporte de breach.
- P-07: Política de retención configurable.
- P-08: Sección admin "Privacidad y datos".
- P-09: Documento ISRA (plantilla OIT).
- P-10: Documento PIA / Privacy Assessment (plantilla OIT).

Todo listado en `.claude/specs/V4_BACKLOG.md` Bloque A, ~43h estimadas para la parte implementable.

**Responsable**:
- **Sergio**: coordinar revisión legal de términos y privacidad (con UNTREF/OIT) + completar plantillas ISRA (P-09) y PIA (P-10).
- **Gera**: implementar P-01 a P-08 (Bloque A del V4_BACKLOG, ~43h).

---

## j) Transferencia operativa

**Cubierto por otros puntos**:
- Los manuales del punto f (operación + administración) suplen la necesidad de sesiones de transferencia formales.
- La lista de contactos de escalamiento y calendario de rotación quedan absorbidos en el punto d.

No requiere trabajo adicional específico.

---

## Resumen — División de tareas

### Sergio (administrativo, coordinación)

| Punto | Tarea |
|---|---|
| d | Coordinar con Matías y OIT: titularidad institucional de cuentas + email receptor de accesos + política de rotación |
| f | Redactar Manual de operación |
| f | Redactar Manual de administración |
| g | Definir con Gera: matriz de riesgos formal o pragmática |
| h | Decidir licencia del proyecto (con UNTREF/OIT) + documento de cesión de derechos |
| i | Coordinar revisión legal de términos y privacidad |
| i | Completar plantillas ISRA (P-09) y PIA (P-10) |

### Gera (técnico)

| Punto | Tarea |
|---|---|
| a | CONTRIBUTING.md + política de release notes + taggear versiones |
| b | Documento descriptivo de infra Vercel/Supabase + runbook operativo mínimo |
| c | Confirmar entrega vía tag de release + commit SHA |
| d | Inventario técnico de secretos + DNS/dominios + calendario de rotación + lista de contactos por proveedor *(una vez que Sergio confirme titularidad y receptores)* |
| e | Documento de backup/restore Supabase + política de retención |
| f | Guía de desarrollo actualizada + release notes |
| g | Configurar CSP + headers de seguridad en `next.config.ts` |
| g | Reporte de cobertura de tests |
| g | Consolidar hallazgos de seguridad conocidos |
| h | Reporte de licencias con `license-checker` + tabla de SaaS |
| i | Implementar Bloque A V4_BACKLOG (P-01 a P-08) — ~43h estimadas |

### Ítems N/A por diseño serverless (se aclaran en la entrega)

- b) IaC — Vercel/Supabase son PaaS/BaaS.
- b) Manifiestos de contenedores — arquitectura serverless.
- b) Scripts de despliegue y rollback — Vercel automatiza; rollback desde UI.
- c) Tarball ejecutable con hash — se entrega tag + commit SHA como equivalente.
- e) Plan de migración a otra infra — no aplica.
- j) Sesiones de transferencia formales — cubiertas por manuales de operación y administración.

### Zona abierta para Gera

- Ajustes al runbook operativo si detecta escenarios frecuentes no cubiertos.
- Estimación real del Bloque A (los ~43h son del backlog, puede variar).
- Documentos adicionales de operación post-entrega que considere útiles (troubleshooting, FAQ técnica).
- Cualquier ítem que aparezca al armar la infra descriptiva o el inventario de secretos.
