# Arquitectura Escenario 1 — Piloto de Adopción

Fecha: 2026-04-03 (actualizado 2026-04-04)
Base: PANTALLAS_MVP.md, CHECKLIST.md, GAP_MATRIX.md, GAPS_PANTALLAS.md, DECISIONES.md, código actual

---

## 0. DECISIONES DE DISEÑO

### Narrativa unificadora

**La formalización ES el camino hacia mejores clientes.** Cada paso de formalización desbloquea visibilidad comercial. La UI debe reflejar esta narrativa en cada pantalla: no se formaliza "porque hay que cumplir", sino porque cada paso abre puertas concretas.

### Sistema de niveles con beneficios tangibles

| Nivel | Requisitos | Beneficios visibles |
|---|---|---|
| BRONCE | Registro con CUIT verificado | Aparece en directorio con visibilidad básica |
| PLATA | Documentación básica + capacitación | Aparece con prioridad media + badge "Verificado" |
| ORO | Formalización completa | Aparece primero en búsquedas + acceso a marcas de mayor volumen |

En cada nivel, la UI muestra el **próximo beneficio concreto** que se desbloquea al avanzar. El taller siempre sabe qué gana con el siguiente paso.

### Gamificación liviana

- Barra de progreso con próximo beneficio visible ("Te falta 1 documento para ser PLATA")
- Notificación de logro al subir de nivel (celebración visual + mensaje motivacional)
- Comparación social: "X talleres de tu zona ya están en nivel PLATA"
- Sin puntos abstractos ni tablas de posiciones — solo progreso real con recompensas reales

### Valor para la marca

- La verificación es el diferencial: CUIT verificado + documentación + capacitación certificada
- Filtros en el directorio que hacen visible la ventaja de cada nivel (el taller ORO se destaca)
- Botón de contacto WhatsApp con contexto pre-cargado: "Hola, te contacto desde la Plataforma Textil por [nombre del pedido]"

### Estado como actor activo

El Estado no es un observador pasivo. Desde la plataforma puede:

- Enviar mensajes directos a talleres estancados o con documentación vencida
- Agendar visitas/auditorías con notificación automática al taller
- Recibir alertas priorizadas por criterios de riesgo (quejas + antigüedad última auditoría + volumen)

### Formalización como proceso, no burocracia

- Cada paso nombrado en lenguaje del taller, no burocrático (ej: "Asegurá a tu equipo" en vez de "ART - Aseguradora de Riesgos del Trabajo")
- Asistente contextual en cada paso: para qué sirve, cómo obtenerlo, links directos y costos estimados
- Micro-logros con feedback positivo inmediato (check verde, mensaje de felicitación)
- Sin bloqueos: el taller sigue usando la plataforma aunque no haya completado todos los pasos. Los niveles son incentivo, no barrera

### Canales

- **WhatsApp como canal principal** de notificaciones (no email). El público objetivo usa WhatsApp, no revisa email
- **Mobile-first** para flujos críticos: registro, formalización básica, academia
- **Desktop** para flujos complejos: wizard perfil productivo completo, dashboard admin

### Autenticación y registro

**Métodos de autenticación:**
- Google OAuth
- Email + contraseña
- Magic link

**Entradas públicas:**
- La landing tiene dos entradas únicamente: **"Soy taller"** y **"Soy marca"**
- Estado y Admin son creados por el administrador desde el panel — nunca se auto-registran
- El rol queda definido desde la entrada elegida en la landing

**CUIT como identificador único:**
- Un CUIT = un solo rol en todo el sistema
- El CUIT es señal de referencia, no verificador de rol — no bloquea ni corrige el rol elegido por el usuario
- Si un CUIT ya está registrado, el sistema lo detecta y muestra mensaje claro

**Registro mínimo para taller (3 pasos):**
1. Elegir método de autenticación (Google, email+contraseña, magic link)
2. Ingresar CUIT — verifica contra ARCA, asigna nivel BRONCE automáticamente
3. Nombre del taller — visible en el directorio

Todo lo demás se completa progresivamente en múltiples sesiones cortas. Cada vez que el taller vuelve, se le sugiere completar un dato más (no todos). No hay formulario maratón

### Perfil mínimo de marca para contactar talleres

Nombre (del registro), tipo de marca, ubicación y volumen mensual aproximado. Se completa en un modal la primera vez que la marca intenta contactar un taller. Queda habilitado para siempre después — no vuelve a pedirse.

### Ubicación estandarizada

Tanto talleres como marcas usan un campo estructurado para ubicación — código postal o coordenadas del INDEC — no texto libre. El detalle de implementación va en el spec correspondiente.

---

## 1. FUNCIONALIDADES

### 1.1 REGISTRAR — Onboarding en <5 minutos

| Componente | Ruta | Estado | Notas |
|---|---|---|---|
| Login | `/login` | LISTO | NextAuth credentials, redirect por rol |
| Registro wizard 3 pasos | `/registro` | INCOMPLETO | Funciona pero: CUIT acepta cualquier string, sin checkbox T&C, password min 6 vs 8 en API, datos paso 3 se pierden al volver |
| Verificación CUIT contra ARCA | — | FALTA | env var CUIT_API_URL pendiente, API no conectada |
| Olvide contraseña | `/olvide-contrasena` | INCOMPLETO | UI existe, NO envía email ni genera token (onSubmit solo cambia estado local) |
| Restablecer contraseña | `/restablecer/[token]` | INCOMPLETO | Page existe (Sprint 1) pero flujo end-to-end no verificado post-migración |
| Mi cuenta | `/mi-cuenta` | INCOMPLETO | PUT funciona, teléfono inicia vacío (no hay GET para pre-cargar), sesión no se refresca |
| Tour primer uso | — | FALTA | No hay implementación. Necesita flag hasSeenTour |

### 1.2 ENCONTRAR — Matching marcas ↔ talleres

| Componente | Ruta | Estado | Notas |
|---|---|---|---|
| Directorio talleres (marca) | `/marca/directorio` | LISTO | Filtros server-side reales (nivel, proceso, prenda, texto) |
| Perfil taller (vista marca) | `/marca/directorio/[id]` | LISTO | Datos completos. Botón "Contactar WhatsApp" sin action |
| Crear pedido | `/marca/pedidos/nuevo` | LISTO | Server Action, genera OM-ID, crea en BD |
| Lista pedidos marca | `/marca/pedidos` | LISTO | Filtros, stats, datos reales |
| Detalle pedido marca | `/marca/pedidos/[id]` | INCOMPLETO | Ownership verificado, muestra órdenes. Falta: acciones cancelar/editar, modal asignar taller |
| Pedidos recibidos (taller) | `/taller/pedidos` | INCOMPLETO | Lista órdenes reales. Solo lectura — no hay detalle ni forma de actualizar progreso |
| Detalle orden (taller) | `/taller/pedidos/[id]` | FALTA | Taller no puede ver detalle ni reportar avance |
| Perfil público marca | — | FALTA | Diseñado en wireframe #18, nunca construido |
| Directorio público | `/directorio` | INCOMPLETO | Funciona sin auth pero sin filtros, sin paginación, sin búsqueda |
| Perfil público taller | `/perfil/[id]` | INCOMPLETO | Más simple que `/marca/directorio/[id]`: no trae certificados, sin botón contactar |
| Botón "Contactar" (WhatsApp) | varios | INCOMPLETO | Renderizado en múltiples vistas pero sin handler en ninguna |

### 1.3 APRENDER — Capacitación con certificados

| Componente | Ruta | Estado | Notas |
|---|---|---|---|
| Catálogo colecciones | `/taller/aprender` | LISTO | Colecciones activas desde BD, progreso real, stats |
| Detalle curso + videos | `/taller/aprender/[id]` | LISTO | YouTube embed, marcar visto (BD), quiz, certificado automático |
| Verificar certificado QR | `/verificar` | LISTO | Lookup por código, estados válido/revocado/no encontrado |
| Admin colecciones CRUD | `/admin/colecciones/*` | LISTO | Crear, editar, agregar videos, toggle activa/borrador |
| Admin evaluaciones | `/admin/evaluaciones` | STUB | 100% mock in-memory, no persiste, no conecta a colecciones reales |
| Admin certificados | `/admin/certificados` | INCOMPLETO | Lista real, pero botón "Revocar" solo cierra modal sin API call, PDF no genera |
| Generación QR (imagen) | — | FALTA | Verificación funciona, pero no se genera código QR como imagen |
| RAG/IA companion | — | FALTA | Previsto en propuesta OIT, no hay implementación ni decisión de stack |

### 1.4 ACOMPAÑAR — Formalización progresiva (Bronce → Plata → Oro)

| Componente | Ruta | Estado | Notas |
|---|---|---|---|
| Checklist formalización | `/taller/formalizacion` | INCOMPLETO | Muestra 8 validaciones reales, progress ring real. Botón "Subir documento" NO funciona (sin upload, sin storage) |
| Upload documentos → Supabase | — | INCOMPLETO | Sprint 1 implementó upload, pero botón en formalización no lo conecta |
| Aprobación/rechazo docs (admin) | `/admin/talleres/[id]` | LISTO | Server Actions reales, recalcula nivel, envía email, log |
| Cálculo nivel automático | `lib/nivel.ts` | LISTO | aplicarNivel() cuenta certificados + validaciones, actualiza nivel y puntaje |
| Wizard perfil productivo | `/taller/perfil/completar` | LISTO | 14 pasos, fórmula SAM, score 5 dimensiones, persiste en BD. Sin auto-save entre pasos |
| Perfil taller (lectura) | `/taller/perfil` | LISTO | Datos completos, % completitud, ProgressRing |
| Links a profesionales | — | FALTA | Propuesta OIT menciona arquitectos, electricistas habilitados. Sin implementación |

### 1.5 FISCALIZAR — Dashboard Estado + denuncias

| Componente | Ruta | Estado | Notas |
|---|---|---|---|
| Dashboard Estado | `/estado` | INCOMPLETO | Stats reales (talleres, marcas, niveles). Falta: card Oro, métricas capacitación, pedidos, link a exportar, guard de rol ESTADO |
| Exportar reportes | `/estado/exportar` | STUB | UI completa, cero API calls, "Generar" simula espera, "Descargar" sin handler |
| Auditorías (admin) | `/admin/auditorias` | INCOMPLETO | Sprint 1 mejoró API (auth+roles), pero UI sigue con datos mock in-memory |
| Denuncias — API | `/api/denuncias` | LISTO | POST público (anónimo), GET protegido ADMIN/ESTADO |
| Denuncia — UI pública | — | FALTA | API existe, no hay pantalla para que un trabajador denuncie |
| Consulta estado denuncia | — | FALTA | El denunciante no puede saber qué pasó con su denuncia |
| Algoritmo priorización | — | FALTA | Propuesta OIT: quejas + tiempo última auditoría + volumen |

### 1.6 Transversales / Sistema

| Componente | Estado | Notas |
|---|---|---|
| Auth middleware por roles | LISTO | TALLER/MARCA/ESTADO/ADMIN, rutas públicas definidas |
| Design system (colores, tipografía, badges) | LISTO | Overpass + Noto Sans, brand-blue/red, Badge variantes |
| Layout con sidebar por rol | LISTO | Header + sidebar condicional |
| Notificaciones in-app | STUB | API existe, UI admin es mock, no hay bandeja de usuario |
| Email transaccional (SendGrid) | INCOMPLETO | Envío funciona para aprobación docs. Templates hardcodeadas, no hay CRUD |
| Logging actividad | LISTO | logActividad() en mutaciones críticas, admin/logs con paginación |
| 404 / Error / Unauthorized | LISTO | Páginas de sistema implementadas |

### 1.7 Admin — gestión de plataforma

| Componente | Estado | Notas |
|---|---|---|
| Dashboard stats | INCOMPLETO | Counts reales, sin gráficos ni filtro temporal |
| Talleres lista + detalle | LISTO | Filtros reales, detalle con tabs, aprobación docs |
| Marcas lista | LISTO | Detalle es STUB (mock hardcodeado) |
| Pedidos lista | LISTO | Detalle sin handler (solo lista) |
| Usuarios | INCOMPLETO | Lista real. Botones editar/suspender/resetear sin handler |
| Procesos productivos | STUB | CRUD in-memory, sin API |
| Tipos de documento | STUB | CRUD in-memory, sin API |
| Configuración sistema | INCOMPLETO | Write funciona (PUT real), read hardcodeado |
| Reportes | STUB | 100% datos hardcodeados |
| Notificaciones masivas | STUB | Form UI, sin envío |
| Integraciones (ARCA, LLM, WA, Email) | STUB | Solo Email tiene sendgrid parcial. Resto son forms sin backend |

---

## 2. FLUJOS PRINCIPALES

### Flujo A: Registro → Primer uso (cualquier rol)

```
Visitante → /registro (3 pasos: rol → datos → entidad)
  → [FALTA] Verificar CUIT contra ARCA
  → Crea User + Taller/Marca en transacción
  → Redirect a /login
  → Login → middleware detecta rol → redirect a dashboard
  → [FALTA] Tour primer uso
  → Si TALLER: dashboard invita a completar perfil
```

**Gaps:** CUIT sin validar, tour inexistente, redirect post-registro va a login en vez de auto-login.

### Flujo B: Taller completa perfil y formaliza (ACOMPAÑAR + REGISTRAR)

```
/taller → banner "Completá tu perfil"
  → /taller/perfil/completar (14 pasos wizard)
    → Calcula SAM, capacidad, score
    → Guarda en BD → redirect a /taller/aprender o /taller/perfil
  → /taller/formalizacion → ve checklist 8 validaciones
    → [INCOMPLETO] Click "Subir documento" → upload a Supabase Storage
    → Admin recibe notificación (?) → /admin/talleres/[id]
    → Admin aprueba/rechaza → aplicarNivel() recalcula
    → Taller ve nivel actualizado (BRONCE → PLATA → ORO)
```

**Gaps:** Botón upload desconectado del storage (Sprint 1 lo implementó pero la UI de formalización no lo usa). No hay notificación al admin cuando se sube un doc.

### Flujo C: Taller se capacita (APRENDER)

```
/taller/aprender → ve colecciones activas con progreso
  → /taller/aprender/[id] → mira videos, marca como vistos
  → Rinde evaluación (quiz)
  → Si aprueba → certificado automático con código único
  → aplicarNivel() recalcula puntaje
  → Certificado visible en /taller/perfil y verificable en /verificar?code=XXX
```

**Estado:** Este es el flujo más completo. Funciona end-to-end. Falta generación de QR como imagen.

### Flujo D: Marca crea pedido y encuentra taller (ENCONTRAR)

```
/marca/directorio → filtra talleres por nivel/proceso/prenda
  → /marca/directorio/[id] → ve perfil del taller
  → [INCOMPLETO] Botón "Contactar" → wa.me link (sin handler)
  → /marca/pedidos/nuevo → crea pedido (BORRADOR)
  → [FALTA] Asignar talleres al pedido (modal 2 pasos no implementado en producción)
  → OrdenManufactura creada → taller ve en /taller/pedidos
  → [FALTA] Taller actualiza progreso desde detalle orden
  → [FALTA] Estado pedido se auto-calcula desde órdenes
```

**Gaps:** El flujo de asignación de talleres a pedidos y el ciclo de vida de la orden están incompletos. Es el gap funcional más grande del MVP.

### Flujo E: Estado fiscaliza (FISCALIZAR)

```
/estado → ve métricas generales (talleres, marcas, niveles)
  → [FALTA] Ve alertas priorizadas por algoritmo
  → [STUB] /estado/exportar → genera reportes
  → [FALTA] Trabajador denuncia desde UI pública
  → API /api/denuncias recibe denuncia
  → [FALTA] Denuncia se vincula a auditoría
  → Admin programa auditoría desde /admin/auditorias [STUB]
```

**Gaps:** Toda la cadena denuncia → auditoría → acción correctiva está desconectada. La API existe pero no hay UI de denuncia ni visualización de prioridades.

### Flujo F: Admin gestiona plataforma

```
/admin/dashboard → ve stats generales
  → Gestiona talleres (detalle completo con aprobación) ✓
  → Gestiona marcas (detalle es stub) ✗
  → Gestiona colecciones/cursos (CRUD completo) ✓
  → Gestiona evaluaciones (mock in-memory) ✗
  → Ve pedidos (lista real, sin detalle) ~
  → Ve logs (real, con paginación) ✓
  → Configuración (write real, read hardcoded) ~
```

---

## 3. DECISIONES TÉCNICAS PENDIENTES

### DT-01: Integración ARCA/AFIP para verificación CUIT — RESUELTA
- **Proveedor:** AfipSDK (afipsdk.com)
- **Plan:** Free para desarrollo y piloto (suficiente para 35 registros)
- **CUIT de plataforma:** Provisorio con CUIT de Gerardo, migrar a CUIT de UNTREF (30-68525606-8) antes del escalamiento
- **Variables:** AFIP_SDK_TOKEN y AFIP_SDK_ENV configuradas en Vercel y .env.local
- **Flujo:** Usuario ingresa CUIT → plataforma consulta AfipSDK → si inválido/inactivo bloquea el registro → si válido autocompleta razón social, domicilio y categoría → asigna BRONCE automáticamente
- **Pendiente institucional:** UNTREF debe autorizar su CUIT en ARCA para producción real. Documentar en handover OIT

### DT-02: Storage para documentos de formalización — RESUELTA
- **Estado:** El código de upload ya estaba conectado desde Sprint 1 (UploadButton → API → Supabase Storage)
- **Bucket:** `documentos` creado en Supabase Storage (privado, 5MB, PDF/JPG/PNG/WebP)
- **Bug corregido:** Si el upload falla, la validación no pasa a PENDIENTE — retorna error HTTP 502 al usuario
- **Variables:** SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY confirmadas en .env.local y Vercel

### DT-03: Generación de PDFs (certificados, reportes) — RESUELTA
- **Decisión:** @react-pdf/renderer para certificados, Puppeteer para exportes del Estado
- **Impacto:** Certificados y exportes del Estado

### DT-04: Generación de códigos QR — RESUELTA
- **Decisión:** Librería qrcode de npm
- **Impacto:** Verificación funciona pero no se genera la imagen QR para imprimir/compartir

### DT-05: RAG / IA companion en APRENDER — RESUELTA
- **Decisión:** Postergado al Escenario 2. APRENDER funciona sin IA. Agregarla multiplica complejidad y costo para el piloto
- **Contexto:** Propuesta OIT lo menciona como feature de APRENDER. Stack no definido (Claude API está en CLAUDE.md). No hay presupuesto asignado para API calls de IA

### DT-06: Evaluaciones admin — persistencia — RESUELTA
- **Estado:** El sistema está unificado y funcional — no hay dos sistemas separados
- **Flujo:** Admin crea/edita evaluaciones via `/admin/evaluaciones` → persiste en BD via `PUT /api/colecciones/[id]/evaluacion`. Taller rinde el quiz → se corrigen respuestas → se genera certificado automático si aprueba
- **Pendientes menores (no bloqueantes):** No se puede eliminar una evaluación completa, no hay preview del quiz desde perspectiva del taller

### DT-07: Flujo de asignación taller → pedido
- **Qué decidir:** Cómo la marca asigna talleres a un pedido. ¿Modal en detalle pedido? ¿Matching automático con sugerencias?
- **Impacto:** Sin esto, ENCONTRAR está incompleto — el ciclo pedido→orden→ejecución no cierra
- **Contexto:** GAPS_PANTALLAS.md documenta que Sergio implementó un modal 2 pasos (buscar + definir proceso/precio/plazo) pero no está claro si sobrevivió la migración al repo nuevo

### DT-08: Notificaciones — alcance MVP — RESUELTA
- **Decisión:** Email + WhatsApp como canales de notificación. Bandeja in-app postergada
- **Contexto:** API de notificaciones existe, modelo Notificacion en schema. Admin UI es stub

### DT-09: Seguridad API — ownership uniforme
- **Qué decidir:** GAP_MATRIX marca como CRÍTICO que la validación auth+ownership es inconsistente entre endpoints
- **Impacto:** Riesgo de acceso no autorizado a datos ajenos
- **Acción:** Auditar todos los endpoints GET/PUT/DELETE y aplicar patrón uniforme

### DT-10: Admin detalle marca — reconstruir
- **Qué decidir:** `/admin/marcas/[id]` es un stub con datos hardcodeados. ¿Se reconstruye siguiendo el patrón de `/admin/talleres/[id]`?
- **Impacto:** Bajo para piloto (10 marcas), pero necesario para operación real

---

## 4. DEPENDENCIAS

```
REGISTRAR ──────────────────────────────────────────────────┐
  │                                                         │
  ├── DT-01 ARCA/AFIP ──→ bloquea verificación CUIT        │
  │                                                         │
  ▼                                                         │
ACOMPAÑAR                                                   │
  │                                                         │
  ├── DT-02 Storage upload ──→ bloquea subir documentos     │
  ├── Depende de: REGISTRAR (taller debe existir)           │
  ├── aplicarNivel() ──→ LISTO                              │
  │                                                         │
  ▼                                                         │
ENCONTRAR                                                   │
  │                                                         │
  ├── Depende de: ACOMPAÑAR (nivel define visibilidad)      │
  ├── DT-07 Asignación taller ──→ bloquea ciclo de pedidos  │
  ├── Detalle orden taller ──→ bloquea ejecución            │
  │                                                         │
  ▼                                                         │
APRENDER ←── independiente, el más completo                 │
  │                                                         │
  ├── DT-03 PDF ──→ bloquea descarga certificados           │
  ├── DT-04 QR ──→ bloquea imagen QR                        │
  ├── DT-06 Evaluaciones admin ──→ bloquea gestión quizzes  │
  │                                                         │
  ▼                                                         │
FISCALIZAR                                                  │
  │                                                         │
  ├── Depende de: ACOMPAÑAR (datos de formalización)        │
  ├── Depende de: ENCONTRAR (datos de pedidos/órdenes)      │
  ├── UI denuncia pública ──→ FALTA                         │
  ├── DT-03 PDF ──→ bloquea exportes                        │
  └── Auditorías real ──→ bloquea programación              │
```

### Orden sugerido de implementación

1. **Cerrar gaps de REGISTRAR** — CUIT, password reset, T&C (base para todo)
2. **Conectar upload en ACOMPAÑAR** — Reutilizar Sprint 1, conectar botón
3. **Completar ciclo ENCONTRAR** — Asignación, detalle orden, progreso
4. **Pulir APRENDER** — Evaluaciones admin, PDF, QR (ya funciona bien)
5. **Construir FISCALIZAR** — Denuncia UI, dashboard real, exportes

---

## 5. RIESGOS TÉCNICOS

### R-01: Seguridad API inconsistente — CRÍTICO
- **Qué:** Endpoints con validación de auth/ownership desigual (GAP_MATRIX lo marca CRÍTICO)
- **Ejemplo:** DELETE /api/colecciones/[id] sin auth, PUT sin verificar rol
- **Impacto:** En piloto con datos reales, un usuario podría acceder/modificar datos ajenos
- **Mitigación:** Auditar y corregir todos los endpoints ANTES del piloto

### R-02: Dependencia ARCA/AFIP no resuelta — ALTO
- **Qué:** La verificación de CUIT es central para REGISTRAR y ACOMPAÑAR pero no hay API conectada ni decisión sobre proveedor
- **Impacto:** Si la integración falla o demora, el registro acepta CUITs inválidos
- **Mitigación:** Implementar validación de formato (11 dígitos, dígito verificador) como mínimo. Verificación real como mejora

### R-03: Flujo ENCONTRAR incompleto — ALTO
- **Qué:** El ciclo pedido → asignación → orden → ejecución → completado no cierra
- **Impacto:** Las métricas MVP requieren 30 pedidos iniciados y 15 completados. Sin este flujo no se pueden medir
- **Mitigación:** Priorizar DT-07 (asignación) y detalle orden taller

### R-04: Stubs que parecen funcionales — MEDIO
- **Qué:** Múltiples pantallas admin (auditorías, procesos, documentos, evaluaciones, reportes) tienen UI completa con datos mock. Un operador podría creer que funcionan
- **Impacto:** Confusión en piloto, pérdida de datos ingresados en forms mock
- **Mitigación:** (a) Deshabilitar o marcar con badge "En construcción", o (b) conectar a BD

### R-05: Sin tests automatizados — MEDIO
- **Qué:** No hay test suite. Ni unitarios ni de integración
- **Impacto:** Riesgo de regresiones al implementar los gaps. Refactors de seguridad API son especialmente riesgosos sin tests
- **Mitigación:** Tests de integración en flujos críticos (registro, login, pedidos, nivel) antes de tocar seguridad API

### R-06: Schema Prisma con gaps conocidos (DEC-010) — MEDIO
- **Qué:** 12 gaps identificados: VerificationToken sin campo type, Auditoria.inspectorId sin FK, campos denormalizados en Pedido
- **Impacto:** Queries ineficientes, datos inconsistentes posibles
- **Mitigación:** Migración incremental. No intentar cerrar los 12 gaps de una vez

### R-07: Password mismatch frontend/backend — BAJO pero vergonzoso
- **Qué:** Frontend exige min 6 caracteres, API exige min 8. El usuario ve "registro exitoso" pero falla
- **Impacto:** Mala experiencia en el primer contacto con la plataforma
- **Mitigación:** Alinear a min 8 en ambos lados

### R-08: Middleware Next.js 16 deprecation — BAJO
- **Qué:** Next.js 16 recomienda migrar middleware.ts a proxy.ts
- **Impacto:** No bloqueante ahora pero puede romper en futuras versiones
- **Mitigación:** Planificar migración post-piloto

---

## 6. RESUMEN DE ESTADO POR FUNCIÓN MVP

| Función | % Estimado | Bloqueantes |
|---|---|---|
| REGISTRAR | 60% | CUIT sin verificar, password reset no funcional, sin T&C |
| ENCONTRAR | 50% | Ciclo pedido→orden incompleto, sin asignación, sin detalle orden |
| APRENDER | 85% | Evaluaciones admin stub, sin PDF/QR real |
| ACOMPAÑAR | 65% | Upload desconectado de UI, sin links profesionales |
| FISCALIZAR | 25% | Dashboard básico, exportes stub, sin UI denuncia, auditorías mock |

### Para alcanzar piloto viable (métricas DEC-002)

**Mínimo indispensable:**
1. Registro con validación CUIT (al menos formato)
2. Ciclo completo de pedidos (crear → asignar → ejecutar → completar)
3. Upload de documentos conectado en formalización
4. Seguridad API auditada
5. UI de denuncia pública

**Deseable pero no bloqueante:**
- PDF de certificados
- QR como imagen
- Exportes Estado reales
- Auditorías con datos reales
- Notificaciones in-app
