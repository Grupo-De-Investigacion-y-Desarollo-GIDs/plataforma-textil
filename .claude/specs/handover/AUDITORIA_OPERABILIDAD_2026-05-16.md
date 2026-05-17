# Auditoria de Operabilidad — 2026-05-16

## Contexto

Al disenar X-05 (Header app + Footer institucional), se ejecuto una auditoria
completa del estado de "operabilidad" de la plataforma: si OIT/UNTREF quiere
agregar o editar contenido sin developer, ¿que pueden hacer hoy y que no?

**Conclusion principal:** La mayoria de configuraciones criticas YA tienen UI.
Hay 3 gaps bloqueantes identificados que requieren specs nuevos.

---

## 1. Clasificacion de modelos Prisma

### A — Transaccionales (no necesitan CMS)

| Modelo | Notas |
|--------|-------|
| User, Account, Session, VerificationToken | Auth/sistema |
| Taller, Marca | Creados por usuarios en registro |
| Pedido, Cotizacion, OrdenManufactura, PedidoInvitacion | Flujo comercial |
| Validacion | Documentos subidos por talleres |
| Denuncia | Enviadas por anonimos |
| Auditoria, AccionCorrectiva | Creadas por ESTADO |
| LogActividad, ConsultaArca, EscrowHito | Automaticos |
| NotaInterna, NotaSeguimiento, MensajeWhatsapp | Creados por admin |
| MagicLink, TallerPlantilla, MotivoNoMatch | Sistema |

### B — Configuracion (catalogos y reglas)

| Modelo | Origen datos | UI hoy? | Veredicto |
|--------|-------------|---------|-----------|
| ProcesoProductivo | Seed (5) | ADMIN CRUD completo | OK |
| **TipoPrenda** | Seed (5) | **NO** | **GAP** |
| **PrendaProceso** | Seed (relacion M:M) | **NO** | **GAP menor** |
| **TipoDocumento** | Seed (7) | **NO** | **GAP** |
| ReglaNivel | Seed (3) | ESTADO editable | OK |
| ConfiguracionSistema | Seed (KV store) | ADMIN tabs completas | OK |
| ConfiguracionUpload | Seed (contextos) | ADMIN editable | OK |

### C — Contenido editorial

| Modelo | Origen datos | UI hoy? | Veredicto |
|--------|-------------|---------|-----------|
| Coleccion + Video | ADMIN | CRUD completo (listado, nueva, editar, videos) | OK |
| Evaluacion | ADMIN/CONTENIDO | Crear preguntas, asociar a coleccion | OK |
| Certificado | Sistema | Listado admin (no creacion manual — correcto) | OK |
| Notificacion | ADMIN/CONTENIDO | Envio masivo + listado | OK |
| DocumentoRAG | ADMIN | CRUD en /integraciones/llm | OK |
| **Novedad** | Seed (5) | **API GET existe, NO hay UI para crear/editar** | **GAP** |
| ObservacionCampo | ADMIN | CRUD completo | OK |

---

## 2. Estado de UI por modelo (detalle)

| Modelo | Listado | Crear | Editar | API admin |
|--------|---------|-------|--------|-----------|
| ProcesoProductivo | `/admin/procesos` | Modal | Modal | `/api/procesos` |
| TipoPrenda | **NO** | **NO** | **NO** | **NO** |
| PrendaProceso | **NO** | **NO** | **NO** | **NO** |
| TipoDocumento | **NO** | **NO** | **NO** | **NO** |
| ReglaNivel | `/estado/configuracion-niveles` | N/A (3 fijos) | Modal | API completa |
| ConfiguracionSistema | `/admin/configuracion` | N/A | Inline | `/api/admin/config` |
| ConfiguracionUpload | `/admin/configuracion/archivos` | N/A | Modal | API completa |
| Coleccion + Video | `/admin/colecciones` | `/nueva` | `/[id]` + `/[id]/videos` | Inline |
| Evaluacion | `/admin/evaluaciones` + contenido | Form preguntas | N/A | Inline |
| Notificacion | `/admin/notificaciones` + contenido | Envio masivo | N/A | API |
| DocumentoRAG | `/admin/integraciones/llm` | Crear | Editar | `/api/admin/rag` |
| Novedad | **NO** | **NO** | **NO** | Solo GET publico |
| ObservacionCampo | `/admin/observaciones` | `/nueva` | `/[id]/editar` | API completa |

---

## 3. Valores hardcoded en codigo

| Ubicacion | Que define | Configurable? |
|-----------|-----------|---------------|
| `src/app/page.tsx` L132 | Beneficios "Soy Taller" (4 items) | NO — contenido editorial landing |
| `src/app/page.tsx` L236-280 | Niveles con requisitos/beneficios | Parcial — DB tiene beneficios pero landing los duplica |
| `src/app/page.tsx` L358-371 | Instituciones (OIT, UNTREF, INTI, FACTA) | NO — cambia rara vez |
| `src/app/page.tsx` L404-446 | Footer inline | NO — se extrae como componente en X-05 |
| `src/compartido/lib/oficio-textil.ts` | 4 categorias de oficio | OK — viene de enum Prisma |
| `src/app/(public)/denunciar/page.tsx` L7 | 7 tipos de denuncia | NO — cambia rara vez |
| `src/app/(admin)/admin/observaciones/formulario-observacion.tsx` | 9 tipos + 6 fuentes | OK — viene de enum Prisma |
| `src/compartido/componentes/feedback-widget.tsx` | 4 tipos feedback | OK — UI interna |

---

## 4. Landing page — secciones y fuentes de datos

| Seccion | Fuente | Hardcoded? |
|---------|--------|------------|
| Hero (titulo, subtitulo, CTAs) | Inline | SI |
| Estadisticas (talleres, marcas, certificados) | **Prisma count() real** | NO |
| "¿Quien sos?" (cards Taller/Marca) | Inline | SI |
| "Como funciona" (3 pasos) | Inline | SI |
| "Sistema de niveles" (B/P/O) | Inline | SI (duplica ReglaNivel.beneficios de DB) |
| "Capacitacion" (3 colecciones) | **Prisma query real** | NO |
| "Verificar certificado" | Form estatico | OK |
| "Instituciones" | Inline array | SI (raro cambio) |
| CTA final | Inline | SI |
| Footer | Inline | SI (se soluciona con X-05) |

**Novedades:** Modelo existe, API GET funciona, seed carga 5. Pero la landing
**no consume novedades**. No hay seccion que las muestre.

---

## 5. Configuraciones del sistema

| Config | Editable via UI? | Donde |
|--------|-----------------|-------|
| Nombre plataforma | SI | `/admin/configuracion` |
| Email soporte | SI | `/admin/configuracion` |
| WhatsApp soporte | SI | `/admin/configuracion` |
| Permitir registro talleres/marcas | SI | `/admin/configuracion` |
| Requiere aprobacion | SI | `/admin/configuracion` |
| Prefijo certificado | SI | `/admin/configuracion` |
| Feature flags E1/E2 | SI | `/admin/configuracion` tab Features |
| Umbrales nivel (puntos, AFIP, certs) | SI | `/estado/configuracion-niveles` |
| Beneficios por nivel (texto) | SI | `/estado/configuracion-niveles` |
| Contextos de upload (tipos, tamano) | SI | `/admin/configuracion/archivos` |
| **Tipos de prenda (catalogo)** | **NO** | Solo en seed |
| **Tipos de documento (catalogo)** | **NO** | Solo en seed |
| **Instituciones del footer** | **NO** | Hardcoded en page.tsx |
| **Textos del landing** | **NO** | Hardcoded en page.tsx |

---

## 6. Resumen ejecutivo

| # | Item | Tipo | UI hoy? | Quien administra | Urgencia |
|---|------|------|---------|-----------------|----------|
| 1 | **Novedades** (CRUD) | Contenido | NO | CONTENIDO | **MVP** |
| 2 | **TipoPrenda** (catalogo) | Config | NO | ADMIN | **MVP** |
| 3 | **TipoDocumento** (catalogo) | Config | NO | ADMIN | **Post-MVP** |
| 4 | **Landing: seccion Novedades** | UI | NO (API existe) | CONTENIDO | MVP |
| 5 | **Landing: textos editables** | Contenido | NO | CONTENIDO | Nice-to-have |
| 6 | **Footer** (componente compartido) | UI | NO | Dev (X-05) | MVP |
| 7 | **PrendaProceso** (relacion) | Config | NO | ADMIN | Nice-to-have |
| 8 | **Tipos de denuncia** | Config | NO | ADMIN | Nice-to-have |

---

## 7. Specs nuevos necesarios

| Spec | Esfuerzo | Cubre items | Urgencia |
|------|----------|-------------|----------|
| **X-05** Header + Footer | 3h | #6 | Ya planeado |
| **X-04b** CRUD Novedades (CONTENIDO) | 3-4h | #1, #4 | MVP |
| **CRUD TipoPrenda** (ADMIN) | 2h | #2 | MVP |
| **CRUD TipoDocumento** (ADMIN) | 3h | #3 | Post-MVP |

**Total: 4 specs, ~12h de trabajo.**

---

## 8. Prioridad sugerida

1. **X-05** (ya planeado) — Header + Footer
2. **X-04b CRUD Novedades** — sin esto CONTENIDO no puede publicar nada
3. **CRUD TipoPrenda** — sin esto no se pueden agregar prendas nuevas

---

## 9. Riesgos de NO hacer

| Item | Si OIT lanza sin esto... |
|------|--------------------------|
| Novedades sin UI | La seccion de novedades del landing queda vacia o con datos de seed. CONTENIDO no puede comunicar nada nuevo. |
| TipoPrenda sin UI | Si una marca pide tipo no listado, necesitan developer para INSERT manual. |
| TipoDocumento sin UI | Si cambia regulacion (documento nuevo requerido), necesitan developer. |
| Landing textos | Funciona pero no se personaliza. Riesgo bajo — cambia 1-2 veces/ano. |
| Tipos de denuncia | Lista fija, probablemente correcta. Riesgo bajo. |

---

**Proximos pasos:** Implementar X-05 con contenido hardcoded pero estructurado
para facilitar migracion a CMS. Luego X-04b y CRUD TipoPrenda como specs aparte.
