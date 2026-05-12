# Decisiones del proyecto — Plataforma Digital Textil

Este documento registra las decisiones importantes tomadas durante el proyecto, con su contexto y razonamiento.

**Para qué sirve:**
- Entender **por qué** se tomó cada decisión (no solo el resultado)
- Evitar revisar decisiones ya resueltas
- Onboarding de nuevos integrantes del equipo
- Auditoría institucional del proceso de toma de decisiones

**Cómo se usa:**
- Las decisiones se registran cronológicamente
- Cada decisión tiene contexto, alternativas consideradas y justificación
- Si una decisión se revisa o anula, se documenta acá también

---

## Estructura de cada decisión

```
### N. Título descriptivo

- Fecha: YYYY-MM
- Categoría: Producto / Técnica / Institucional / Metodológica
- Contexto: por qué se necesitó decidir esto
- Alternativas consideradas: A, B, C
- Decisión tomada: cuál se eligió
- Razonamiento: por qué esa y no otra
- Implicancias: qué cambia en el proyecto
- Estado: Vigente / Revisada / Anulada
```

---

## Decisiones de Producto

### 1. Modelo Showcase + Match con backend institucional invisible

- **Fecha:** Mayo 2026
- **Categoría:** Producto (fundacional)
- **Contexto:** El proyecto necesitaba un modelo claro de qué es la PDT. ¿Es un marketplace de e-commerce? ¿Un sistema institucional puro? La indefinición generaba decisiones inconsistentes.
- **Alternativas consideradas:**
  - A) Marketplace tipo MercadoLibre (transacciones cerradas en plataforma)
  - B) Sistema institucional puro (foco en ESTADO/OIT, talleres y marcas secundarios)
  - C) Showcase + Match (vidriera profesional con backend institucional invisible)
- **Decisión tomada:** C
- **Razonamiento:** La PDT no procesa pagos ni cierra transacciones (sale del alcance). Tampoco puede ser solo institucional porque entonces talleres y marcas no la usarían. Showcase + Match captura el espíritu: vidriera profesional + acompañamiento a la formalización + métricas para política pública invisibles al usuario.
- **Implicancias:**
  - No hay MercadoPago ni pagos online
  - No hay tracking de envíos ni reviews
  - Las métricas cambian: encuentros generados, vidrieras publicadas, en lugar de transacciones cerradas
  - ESTADO ve dashboards pero no protagoniza la UI pública
- **Estado:** Vigente

### 2. Membresía con vigencia anual

- **Fecha:** Mayo 2026
- **Categoría:** Producto
- **Contexto:** Necesidad de mantener el directorio público actualizado y filtrar talleres inactivos sin borrarlos.
- **Alternativas consideradas:**
  - A) Sin vigencia (una vez registrado, queda permanente)
  - B) Vigencia anual con renovación tipo Registro MiPyME
  - C) Vigencia semestral
- **Decisión tomada:** B
- **Razonamiento:** El modelo Registro MiPyME ya es familiar para empresas argentinas. Anual da tiempo razonable de renovación sin que el directorio se desactualice mucho. Talleres no renovados pasan a "pendiente de renovación" en lugar de borrarse.
- **Implicancias:**
  - Solo talleres con membresía vigente aparecen en directorios
  - Emails recordatorios automáticos antes del vencimiento
  - Lenguaje no estigmatizante para vencidos: "Renová tu membresía"
- **Estado:** Vigente

### 3. Un mismo CUIT puede operar como taller y marca (modelo Airbnb)

- **Fecha:** Mayo 2026
- **Categoría:** Producto
- **Contexto:** Hay casos reales donde una empresa es taller (produce para otros) y marca (subcontrata producción) al mismo tiempo. ¿Una cuenta por rol o cuentas separadas?
- **Alternativas consideradas:**
  - A) Una cuenta por rol (forzar separación de identidad)
  - B) Modelo Airbnb: una cuenta, perfiles separados, toggle UI
  - C) Modelo Booking: cuentas separadas pero vinculadas
- **Decisión tomada:** B
- **Razonamiento:** Refleja la realidad del sector. Es lo que hacen Airbnb (host/guest), Mercado Libre (vendedor/comprador). Mantiene la identidad institucional (CUIT) única pero permite operar en distintos modos.
- **Implicancias:**
  - Schema refactorizado: User + PerfilTaller + PerfilMarca opcionales
  - Toggle UI "estás operando como" en header
  - Clasificación automática invisible de pedidos (COMERCIAL vs SUBCONTRATACION)
  - Regla anti-incesto: un mismo CUIT no puede cotizar pedidos propios
  - Es uno de los refactors más grandes de V4 (~35h estimadas)
- **Estado:** Vigente — pendiente de implementación

### 4. Catálogo de prendas: nomenclador propio

- **Fecha:** Mayo 2026
- **Categoría:** Producto
- **Contexto:** Pedidos requieren categorizar el tipo de prenda. ¿Usamos nomenclador existente o creamos uno propio?
- **Alternativas consideradas:**
  - A) Nomenclador arancelario (oficial AFIP)
  - B) Nomenclador Ley de Talles
  - C) Nomenclador propio basado en marketplaces consumer
- **Decisión tomada:** C
- **Razonamiento:** El arancelario es por tipologías macro (no sirve para matching). La Ley de Talles es demasiado genérica. INTI no tiene algo público y abarcativo. Construir propio basado en cómo categorizan Ripley/H&M/Falabella es lo más útil para el matching.
- **Implicancias:**
  - 11 familias de productos (códigos 01.XX a 99.XX)
  - ~95 tipologías de prendas
  - Refactor del formulario de pedido
  - Refactor del matching para usar prenda + servicios
- **Estado:** Vigente — pendiente de implementación

### 5. Matching basado en prenda + servicios (no solo prenda)

- **Fecha:** Mayo 2026
- **Categoría:** Producto
- **Contexto:** El matching V3 era solo por tipo de prenda. Insight: una "Remera" puede ser muy distinta según los servicios requeridos.
- **Alternativas consideradas:**
  - A) Matching solo por prenda (V3)
  - B) Matching por prenda + servicios requeridos
  - C) Matching por capacidad técnica completa (prenda + servicios + maquinaria + capacidad)
- **Decisión tomada:** B (con C como evolución futura)
- **Razonamiento:** Servicios es el discriminador más importante (corte, confección, terminación, planchado, etiquetado, embalado). Capacidad técnica es ruido en esta etapa.
- **Implicancias:**
  - Nueva tabla Servicio
  - Nueva relación M2M entre Pedido y Servicio
  - UI multi-select de servicios en pedido
  - Lógica de matching refactorizada
- **Estado:** Vigente — pendiente de implementación

### 6. Narrativa de formalización: acompañamiento, no ranking

- **Fecha:** Mayo 2026
- **Categoría:** Producto / UX
- **Contexto:** V3 mostraba "Nivel BRONCE/PLATA/ORO" al taller. El equipo sectorial cuestionó: esto estigmatiza a talleres en etapa inicial y refuerza una narrativa de ranking que no es coherente con el modelo Showcase + Match.
- **Alternativas consideradas:**
  - A) Mantener niveles BRONCE/PLATA/ORO visibles
  - B) Eliminar niveles completamente
  - C) Niveles internos (analítica) pero invisibles para el usuario
- **Decisión tomada:** C
- **Razonamiento:** Mantener niveles internos es útil para análisis sectorial de ESTADO/OIT. Pero el usuario NO debe verlos. En su lugar, ve "X de 7 requisitos verificados" con lenguaje de acompañamiento.
- **Implicancias:**
  - Refactor de copy en toda la app
  - Componentes visuales que mostraban niveles se actualizan
  - 3 etapas visibles con lenguaje no jerárquico: "Etapa inicial", "En proceso", "Consolidada"
  - El sistema interno mantiene Bronce/Plata/Oro para reportes
- **Estado:** Vigente — pendiente de implementación

### 7. Período de gracia 60 días para CUIT no verificado

- **Fecha:** Mayo 2026
- **Categoría:** Producto
- **Contexto:** ¿Qué hace un taller que se registra sin CUIT verificado? ¿Lo bloqueamos o le damos acceso parcial?
- **Alternativas consideradas:**
  - A) Bloqueo total hasta verificar CUIT
  - B) Acceso pleno sin verificación
  - C) Período de gracia 60 días con acceso a recursos pero sin aparecer en directorio
- **Decisión tomada:** C
- **Razonamiento:** Coherente con el modelo Showcase + Match (CUIT verificado para ser visible) pero también con la misión de rampa de entrada a la formalización (no abandonamos al informal). Le damos 60 días para verificar mientras puede acceder a Academia y recursos institucionales.
- **Implicancias:**
  - Lógica de "fecha de gracia" en User
  - Recordatorios automáticos durante los 60 días
  - Después de 60 días sin CUIT: cuenta "pendiente formalización"
- **Estado:** Vigente

### 8. Marca/Empresa de Indumentaria como un solo perfil

- **Fecha:** Mayo 2026
- **Categoría:** Producto
- **Contexto:** ¿Hay diferencia entre Marca y Empresa de Indumentaria (vinculada a CIAI)?
- **Alternativas consideradas:**
  - A) Dos perfiles distintos
  - B) Un solo perfil con campo de subtipo interno
- **Decisión tomada:** B
- **Razonamiento:** Funcionalmente hacen lo mismo (publicar pedidos, contactar talleres). El subtipo se usa solo para análisis sectorial de ESTADO/OIT.
- **Implicancias:**
  - Un solo modelo PerfilMarca con campo `subtipo` enum
  - UI sin diferenciación visible
  - Reportes sectoriales pueden filtrar por subtipo
- **Estado:** Vigente

### 9. Identidad visual V4 — propuesta del equipo de diseño

- **Fecha:** Mayo 2026
- **Categoría:** Producto / UX
- **Contexto:** V3 tenía identidad visual minimalista (azul brand + rojo, 2 fuentes). Faltaba sistema semántico de colores, jerarquía tipográfica, componentes complejos.
- **Alternativas consideradas:**
  - A) Mantener V3 sin cambios
  - B) Refactor visual completo: paleta extendida + 3 fuentes + componentes nuevos
  - C) Refactor parcial
- **Decisión tomada:** B
- **Razonamiento:** El modelo Showcase + Match requiere comunicar profesionalismo institucional sin caer en frialdad de e-gov. La nueva paleta incluye terracotta como acento editorial (sector textil), pastels semánticos, 3 fuentes con jerarquía clara.
- **Implicancias:**
  - 34.5h de implementación en 11 fases incrementales
  - Componentes nuevos: KpiCard, FilterPills, EmptyState refactor
  - Header simplificado (4 bandas a 2)
  - Footer institucional nuevo
  - Landing pública rediseñada con carrusel de novedades
- **Estado:** Vigente — pendiente de implementación

---

## Decisiones Técnicas

### 10. Stack: Next.js 16 + Prisma 6 + Supabase + Vercel

- **Fecha:** Febrero 2026
- **Categoría:** Técnica (fundacional)
- **Contexto:** Stack elegido al inicio del proyecto. Sigue vigente.
- **Decisión tomada:** Next.js App Router + TypeScript + Prisma + PostgreSQL en Supabase + Vercel para deploy
- **Razonamiento:**
  - Next.js: framework maduro, App Router moderno, despliegue 1-click en Vercel
  - Prisma: ORM con type safety
  - Supabase: PostgreSQL gestionado, Storage, región sa-east-1 cercana a Argentina
  - Vercel: CI/CD automático desde GitHub, SSL gratis, preview deploys
- **Implicancias:** Stack consistente desde V1
- **Estado:** Vigente

### 11. Autenticación: NextAuth v5 con magic links + Google OAuth

- **Fecha:** Marzo 2026
- **Categoría:** Técnica
- **Contexto:** El login tradicional con contraseña genera fricción en usuarios de talleres (no quieren recordar más contraseñas).
- **Alternativas consideradas:**
  - A) Login tradicional usuario+contraseña
  - B) Solo magic links por email
  - C) Magic links + Google OAuth como opciones paralelas
- **Decisión tomada:** C
- **Razonamiento:** Magic links eliminan la fricción de contraseñas. Google OAuth para usuarios que prefieren ese flujo. Sin contraseñas en la base.
- **Implicancias:** NextAuth v5 + @auth/prisma-adapter + Resend para envío de magic links
- **Estado:** Vigente

### 12. Email transaccional: Resend con dominio propio verificado

- **Fecha:** Mayo 2026
- **Categoría:** Técnica
- **Contexto:** V3 usaba `onboarding@resend.dev` (testing). Limitación: solo permite enviar al email de la cuenta de Resend. Bloquea piloto con usuarios reales.
- **Alternativas consideradas:**
  - A) Mantener Resend testing
  - B) Resend con dominio propio (`plataformatextil.com.ar`)
  - C) Migrar a otro proveedor (SendGrid, AWS SES, Mailgun)
- **Decisión tomada:** B
- **Razonamiento:** Resend tiene buena DX, pricing accesible (3.000 emails/mes gratis), integración limpia con Next.js. Con dominio propio verificado, sin limitaciones de destinatarios.
- **Implicancias:** Verificación de dominio en Resend (DKIM + SPF), DMARC en Cloudflare
- **Estado:** Vigente

### 13. Dominio propio: plataformatextil.com.ar

- **Fecha:** Mayo 2026
- **Categoría:** Técnica / Institucional
- **Contexto:** V3 usaba URLs `*.vercel.app`. No es presentable institucionalmente para el piloto.
- **Alternativas consideradas:**
  - A) `redtextil.com.ar`
  - B) `plataformatextil.com.ar`
  - C) Otra opción
- **Decisión tomada:** B (autorizado por OIT)
- **Razonamiento:** Descriptivo, fácil de recordar, refleja el modelo Showcase + Match. Aprobado por OIT en email institucional.
- **Implicancias:**
  - Compra en NIC.ar
  - DNS gestionado en Cloudflare
  - SSL automático vía Vercel
  - Email forwarding gratuito vía Cloudflare Email Routing
- **Estado:** Vigente

### 14. DNS: Cloudflare (no NIC.ar DNS interno)

- **Fecha:** Mayo 2026
- **Categoría:** Técnica
- **Contexto:** NIC.ar permite usar sus DNS internos. ¿Conviene o no?
- **Alternativas consideradas:**
  - A) DNS de NIC.ar (gratuito, panel viejo)
  - B) Cloudflare (gratuito, panel moderno, features extra)
- **Decisión tomada:** B
- **Razonamiento:** Mejor panel, Email Routing incluido, CDN automático, protección DDoS, todo en un lugar.
- **Implicancias:**
  - Delegación de nameservers en NIC.ar a Cloudflare
  - Configuración DNS en Cloudflare
  - Email Routing en Cloudflare (forwarding gratuito)
- **Estado:** Vigente

### 15. RAG: Claude API + Voyage AI + pgvector

- **Fecha:** Abril 2026
- **Categoría:** Técnica
- **Contexto:** El asistente IA necesita un sistema RAG (Retrieval Augmented Generation) para responder preguntas sobre la PDT y normativa.
- **Alternativas consideradas:**
  - A) OpenAI embeddings + GPT-4
  - B) Claude API + Voyage AI embeddings (voyage-3-lite, 512 dim)
  - C) Modelo local
- **Decisión tomada:** B
- **Razonamiento:**
  - Claude tiene mejor performance en español y razonamiento
  - Voyage AI tiene embeddings más eficientes (512 dim vs 1536 de OpenAI ada-002) con buena calidad
  - pgvector en Supabase para almacenamiento (sin servicio externo adicional)
  - Costo proyectado: <$1 USD/mes para piloto
- **Implicancias:** Integración via SDK, RPC en Supabase para búsqueda vectorial
- **Estado:** Vigente

---

## Decisiones Institucionales

### 16. Licencia: MIT

- **Fecha:** Mayo 2026
- **Categoría:** Institucional
- **Contexto:** El proyecto debe ser replicable por otros equipos (OIT distribuye con licencia open source). ¿Qué licencia usar?
- **Alternativas consideradas:**
  - A) MIT
  - B) Apache 2.0
  - C) GPL v3
- **Decisión tomada:** A
- **Razonamiento:** MIT es la licencia open source más simple y permisiva. Apache 2.0 agrega cláusulas de patentes que no son necesarias para este proyecto. GPL es restrictiva (copyleft).
- **Implicancias:** Cualquier organización puede tomar el código, modificarlo y usarlo. Solo deben mantener el aviso de copyright.
- **Estado:** Vigente

### 17. Copyright joint: OIT y UNTREF

- **Fecha:** Mayo 2026
- **Categoría:** Institucional
- **Contexto:** ¿A nombre de quién va el copyright del código?
- **Alternativas consideradas:**
  - A) Solo OIT
  - B) Solo UNTREF
  - C) OIT y UNTREF (joint)
  - D) Persona física
- **Decisión tomada:** C
- **Razonamiento:** Refleja que es un proyecto institucional conjunto. OIT es sponsor, UNTREF es ejecutor. Copyright joint reconoce ambas contribuciones.
- **Implicancias:** Cualquier modificación debe mantener el aviso de copyright de ambas instituciones.
- **Estado:** Vigente

### 18. Leyenda institucional: "Desarrollado por UNTREF con el apoyo de la OIT"

- **Fecha:** Mayo 2026
- **Categoría:** Institucional
- **Contexto:** ¿Cómo se atribuye institucionalmente el proyecto en la UI?
- **Alternativas consideradas:**
  - A) Logo OIT + logo UNTREF visibles
  - B) Solo leyenda textual sin logos
  - C) Logo PDT propio + leyenda textual
- **Decisión tomada:** C
- **Razonamiento:** Logo OIT requiere autorización formal de DCOMM (proceso pendiente). Mientras tanto, la leyenda textual cumple el rol institucional sin riesgo de uso no autorizado.
- **Implicancias:**
  - Leyenda visible en footer de toda la app
  - Texto en certificados, PDFs, landing
  - Logo OIT/UNTREF NO usados en V4 (revisar en V5)
- **Estado:** Vigente

---

## Decisiones Metodológicas

### 19. Metodología V4: spec con 12 secciones + QA con 6 ejes ajustados

- **Fecha:** Mayo 2026
- **Categoría:** Metodológica
- **Contexto:** V3 funcionó pero tuvo problemas: validación interdisciplinaria llegaba tarde, QAs demasiado atomizados, validación sectorial no planificada, handover inexistente. V4 necesita corregir esto.
- **Alternativas consideradas:**
  - A) Mantener metodología V3
  - B) Refactor parcial
  - C) Metodología nueva con 12 secciones obligatorias + QA con 6 ejes ajustados
- **Decisión tomada:** C
- **Razonamiento:** Estructurar mejora consistencia y calidad. 12 secciones obligatorias asegura que ningún spec deja cosas implícitas. QA reestructurado con flujos en vez de criterios atomizados mejora detección de bugs reales.
- **Implicancias:**
  - Template de Spec V4 y Template de QA V4 creados
  - Documento [METODOLOGIA_V4.md](../../METODOLOGIA_V4.md) como referencia
  - Workflow `qa-pages.yml` actualizado para incluir QA_v4-*.md
  - REVIEWs separados (V3) eliminados — reemplazados por comentarios en PRs
- **Estado:** Vigente desde Spec 2 V4

### 20. Validación interdisciplinaria temprana (en el spec, no en el QA)

- **Fecha:** Mayo 2026
- **Categoría:** Metodológica
- **Contexto:** V3 tenía Eje 6 (validación de dominio) al FINAL del QA. Llegaba tarde: cuando el equipo interdisciplinario identificaba un problema conceptual, el código ya estaba escrito.
- **Alternativas consideradas:**
  - A) Mantener Eje 6 al final del QA
  - B) Mover Eje 6 al inicio (sección 3 del spec)
  - C) Eliminar Eje 6
- **Decisión tomada:** B
- **Razonamiento:** Validar perspectivas ANTES de implementar evita rework. El QA solo verifica que la implementación respete lo decidido en el spec, no genera observaciones nuevas.
- **Implicancias:**
  - Sección 3 del spec V4: "Validación interdisciplinaria"
  - Eje 6 del QA alivianado: solo verifica, no genera nuevo
  - 5 perspectivas posibles: politólogo, sociólogo, economista, contador, sectorial
- **Estado:** Vigente

### 21. Validación sectorial diferida al final del MVP V4

- **Fecha:** Mayo 2026
- **Categoría:** Metodológica
- **Contexto:** Validar cada spec con talleres y marcas reales es costoso y lento. ¿Cuándo se hace?
- **Alternativas consideradas:**
  - A) Validar cada spec antes de implementar
  - B) Validar cada spec después de implementar
  - C) Validar todo el MVP V4 en 1-2 sesiones grupales grandes al final
- **Decisión tomada:** C
- **Razonamiento:** Coordinar validación spec por spec es inviable. Concentrar la validación al final del MVP permite mostrar un producto integral y obtener feedback en contexto real.
- **Implicancias:**
  - Sección 8 del spec V4: casi siempre "N/A — Diferida a validación grupal post-MVP V4"
  - Al terminar MVP V4: 1-2 sesiones grupales con talleres y marcas reales
  - Feedback se procesa como issues iterativos
- **Estado:** Vigente

---

## Decisiones revisadas o anuladas

(Sin entradas por ahora. Esta sección se llena si una decisión vigente se modifica o anula.)

---

## Cómo agregar una decisión nueva

1. Numerar secuencialmente (siguiendo la última)
2. Completar todos los campos de la estructura estándar
3. Categorizar (Producto / Técnica / Institucional / Metodológica)
4. Documentar alternativas consideradas (al menos 2)
5. Justificar el razonamiento explícitamente
6. Listar implicancias concretas
7. Commit con mensaje descriptivo

Si una decisión existente cambia:
- NO borrar la decisión vieja
- Marcar como "Revisada" o "Anulada"
- Crear decisión nueva con referencia a la anterior

---

## Referencias

- [Master V4](../../../docs/Diseño/MASTER_V4.md.pdf) — Documento estratégico completo con todas las decisiones de planificación
- [Metodología V4](../../METODOLOGIA_V4.md) — Método de trabajo vigente
- [README principal del proyecto](../../../README.md)

---

**Última actualización:** Mayo 2026

Si encontrás una decisión faltante o desactualizada, actualizá este documento y avisá al equipo.
