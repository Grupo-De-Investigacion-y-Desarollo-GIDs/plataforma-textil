# Changelog

Todas las modificaciones relevantes de la Plataforma Digital Textil (PDT).

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) de forma
pragmática y el versionado se aproxima a [SemVer](https://semver.org/lang/es/). Las
versiones se corresponden con **tags de release** en Git y con el estado desplegado en
producción (rama `main`). El detalle fino de cada cambio vive en el historial de Pull
Requests del repositorio (cada entrada referencia su `#PR`).

Convención de entornos:
- **`main` → Producción** (https://plataformatextil.com.ar).
- **`develop` → Preview**. Lo que está en `develop` y todavía no se promovió a `main`
  figura bajo **[No liberado]**.

---

## [No liberado] — `v2.1.0` (rama `develop`)

Trabajo de la semana del 06-ago, **pendiente del 2º deploy** a producción (runbook
`.claude/specs/RUNBOOK_DEPLOY_v2.1.0.md`). Aditivo sobre v2.0.0 (1 migración: `add_consentimiento`).

### Privacidad y consentimiento (P-01 / P-02 / P-03)
- Consentimiento explícito y **auditable** en el registro: tabla `Consentimiento` (tipo + versión + fecha), 3 checkboxes obligatorios y aviso de propósito (#465).
- Páginas legales `/terminos` y `/privacidad` publicadas desde `docs/legal/*.md` (render solo-cuerpo por estructura + remark-gfm) (#461, #465).

### Seguridad
- Gate de registro por ambiente + allowlist — cierra el registro abierto en dev/preview (permite TLDs de test para CI) (#466).
- **PIA** (evaluación de impacto en privacidad) + **HARDENING** (controles aplicados) — 9 proveedores + tabla de DPA; Google OAuth planificada/no-operativa (#467).

### Directorio y Coordinación
- Filtro de `/api/talleres` por rol: MARCA/público solo verificados; ADMIN/ESTADO todos. Fix del enlace verificar-CUIT + rename del tab a "Tipos de documento" (#463).
- **Auditorías** retirada del menú de Coordinación (tab + ruta 404) (#468).

### Datos y operación
- **Migración documentada del piloto** dev→prod (23 usuarios reales, veredicto por evidencia, export de dev) + scripts + anexo (#464).
- Runbook del 2º deploy v2.1.0 (#469).

---

## [2.0.0] — 2026-08-04 — Release de producción

Deploy a producción del trabajo acumulado en `develop` desde la 1.0.0. **Tag `v2.0.0` sobre
`4fa2979`** (2026-08-04). Es un **release mayor** (multi-rol, vidriera Modelo B, circuito
CUIT/ARCA, endurecimiento de seguridad), no un parche.

### Multi-rol y autenticación (Bloque U)
- Sesión multi-rol (TALLER ↔ MARCA) con helper y middleware; toggle de modo activo (#391, #393, #396, #397).
- Flujo de agregar un segundo rol a una cuenta existente (#398).
- Clasificación de pedidos COMERCIAL / SUBCONTRATACIÓN + regla anti-incesto multi-rol (#382, #383).
- Migración de datos multi-rol y tests E2E dedicados con seed dual (#409, #410).

### Vidriera / Directorio (Etapa 2 — Modelo B)
- Vidriera del taller en 3 dimensiones con render condicional (`modeloB_revisado`) (#437, #441, #444).
- Núcleo Modelo B: toggles de visibilidad, escritura y net-new hacia el directorio (#445, #446).
- Sub-tabs "Mi taller" (vidriera | gestión productiva) y reorganización de "Datos básicos" (#439, #442).
- Vidriera mínima para el directorio + comms de Coordinación y filtros (#438, #448).

### Período de gracia y circuito CUIT/ARCA (Etapa 2.3)
- Gracia de 60 días: schema, estado, helper y banners (#449).
- Cron de gracia CUIT: recordatorio, inactivación y reactivación (#450).
- Circuito CUIT: reintento de ARCA en el cron de gracia, corrección y reverificación de CUIT, normalización de formato (#452, #453, #454).

### Seguridad y calidad
- Cierre del Bloque K: K-05 selects, rate-limit y borrado de endpoints GET muertos (#423).
- Fixes mobile del flujo crítico del taller (M-03) (#431).
- Degamificación V4: se quita "Formalización %" del sidebar y barrido del rol Taller (#440, #443).

> Nota: la observabilidad del error crudo de ARCA (hotfix) y el override `?real=1` para
> convivencia mock/real en DEV están en curso sobre `develop`/`main` (ver
> `.claude/specs/v4-circuito-cuit-implementacion.md`).

---

## [1.0.0] — 2026-06-13 — Release de producción (piloto)

Primer despliegue formal a producción (commit `3333016`). Consolida el MVP, el piloto con
usuarios reales y el rediseño V4. Corresponde al tag `v1.0.0`.

### Rediseño V4 y landing
- Sistema de componentes V4 (refactor base + nuevos) y paleta a los dashboards (#324, #347).
- HeaderPublic + landing rediseñada, Header de app (2 bandas) + Footer institucional (#342, #343, #345, #349).
- CMS de Novedades (CRUD simple) (#344).
- Leyenda institucional oficial de OIT en toda la UI (#362).

### Navegación y flujos del taller
- Navegación F1+F3: sidebar personal en desktop + accesos personales; tabs internos en Pedidos (#374, #375).
- Renombre de tabs del taller (Mi vidriera, Mi recorrido, Cursos) (#372).
- Formulario de taller W-A completo (organización, disponibilidad, roles funcionales) (#363).
- Vitrina de demanda del taller (G-19) (#370).
- "Mi Formalización" (3 cards) y ocultamiento de niveles en ESTADO/ADMIN (#358, #359).

### Contenido / academia
- CONTENIDO gestiona colecciones; imagen en colecciones; flujo de publicación de cursos (#364, #371, #373).

### Schema multi-rol (fundacional)
- Schema multi-rol con CUIT y ARCA centralizados; campos de formulario de taller; tipo de pedido (#348, migraciones de mayo–junio).

### Seguridad (Bloque K / RLS)
- K-01 RLS: cierre del leak de anónimos en dev (Capas A+B) y de 3 críticos C1/C2/C3 (PII + answer-key) (#389, #414).
- K-02: preparación del bucket de documentos privado + fix IDOR de upload de imágenes en cotización (C5) (#356, #417, #418).
- Fix de race de clobbering de cookie en sesión JWT (B-05) (#411).

### Integraciones
- AFIP SDK / verificación de CUIT (semana 1); email transaccional con Resend; rate limiting (Upstash); RAG.

### Estabilización del piloto
- Resolución de decenas de issues de feedback del piloto (texto, acentos, UX, links rotos) — mayo 2026 (#193–#296, varios).
- Consolidación de fixes E2E de CI (workflow, storageState, timeouts, warmup) (#312, #316, #317, #318, #323, #337, #346).

---

## [0.x] — Desarrollo inicial (2026-01 a 2026-05)

- 2026-01-08: estructura inicial del MVP (OIT–UNTREF).
- Desarrollo de MVP, panel admin, vistas taller/marca/estado, auth por roles, piloto pre-producción.
  El detalle vive en el historial de Git y en `.claude/specs/` (specs `semana1`–`semana4`, `v2-*`, `v3-*`).

---

### Cómo se generan las releases

1. El trabajo se acumula en `develop` (cada PR con Conventional Commits y su `#PR`).
2. La promoción a producción es un merge `develop → main` siguiendo el
   `RUNBOOK_PROMOCION_PROD.md` (snapshot, migraciones en el build, smoke, verificación).
3. Al promover se crea el tag `vX.Y.Z` sobre el commit de `main` y se agrega la sección
   correspondiente a este archivo, moviendo lo de **[No liberado]** a la nueva versión.
