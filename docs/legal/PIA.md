# PIA — Evaluación de Impacto en la Privacidad

**Plataforma Digital Textil (PDT)** · Documento de transparencia sobre el tratamiento de datos personales.
**Versión:** 1.0 · **Fecha:** 2026-08-06 · **Responsable técnico:** Gerardo · **Coordinación:** Sergio (UNTREF/OIT)

> Este documento acompaña a la [Política de Privacidad](./POLITICA_DE_PRIVACIDAD.md) y a los
> [Términos y Condiciones](./TERMINOS_Y_CONDICIONES.md). Describe qué datos trata la plataforma,
> con qué finalidad, quiénes son los terceros que los procesan y los riesgos residuales con sus
> mitigaciones. La validación legal final queda a cargo de OIT/UNTREF (ver §8).

---

## 1. Contexto y alcance

PDT conecta **talleres textiles** con **marcas** para promover la formalización del sector, con
capacitación, verificación de identidad fiscal (ARCA) y gestión de pedidos. Opera como aplicación
web sobre stack **serverless gestionado** (Vercel + Supabase). El tratamiento de datos personales
alcanza a: usuarios registrados (talleres, marcas, personal de coordinación estatal, administración
y contenido) y a las personas físicas cuyos CUIT se verifican contra el padrón de ARCA.

## 2. Datos personales tratados

| Categoría | Datos | Origen |
|---|---|---|
| Identificación | Nombre, email, teléfono (opcional) | El usuario al registrarse |
| Identificación fiscal | **CUIT** y datos derivados de ARCA (razón social, tipo de inscripción, categoría de monotributo, estado, domicilio fiscal, actividades) | El usuario + **verificación ARCA** |
| Entidad | Datos del taller/marca (nombre, ubicación/provincia, capacidad, procesos, prendas, maquinaria) | El usuario |
| Documentación | Documentos de formalización subidos (PDF/imagen) para validación de nivel | El usuario |
| Actividad | Cotizaciones, pedidos, progreso de capacitación, certificados | Generados por el uso |
| Autenticación | Contraseña (hash **bcrypt**), sesión (JWT) | Sistema |

**No se tratan** categorías especiales de datos (salud, biometría, ideología) de forma estructurada.

## 3. Finalidad y base

- **Verificar la identidad** del taller/marca (CUIT vía ARCA) para dar confianza al matching.
- **Conectar** talleres y marcas (directorio, pedidos, cotizaciones).
- **Capacitar** y **certificar** (academia).
- **Comunicar** avisos operativos (email; WhatsApp opcional).

El **consentimiento explícito** al registro (términos, privacidad y visibilidad de datos para
marcas) se recolecta y **persiste de forma auditable** (spec P-01: tabla `Consentimiento` con
tipo + versión + fecha; en implementación). El aviso de propósito (P-03) se muestra **antes** de
pedir los datos.

## 4. Flujos de datos y visibilidad

- Ciertos datos del taller (nombre, ubicación, procesos, capacidad) son **visibles para las
  marcas** en el directorio — el usuario lo **consiente** explícitamente al registrarse.
- El directorio público y la vista de marca muestran **solo talleres verificados** (`verificadoAfip`),
  garantía reforzada por tests de no-regresión.
- Los documentos de formalización se sirven por **URL firmada** con expiración; el acceso a leerlos
  requiere rol autorizado (401 a anónimos).

## 5. Terceros que procesan datos (9 proveedores) y DPA

| Proveedor | Rol | Datos que ve | ¿DPA disponible? |
|---|---|---|---|
| **Vercel** | Hosting/compute (región `gru1`) | Todo el tráfico de la app | Sí — https://vercel.com/legal/dpa |
| **Supabase** | Base de datos + Storage (`sa-east-1`) | Todos los datos persistidos | Sí — https://supabase.com/legal/dpa (SCCs) |
| **Resend** | Email saliente | Email + nombre del destinatario | Sí — https://resend.com/legal/dpa (pre-firmado, EU-US DPF) |
| **Google Cloud (OAuth)** | Login con Google | Email/perfil (**si se activara**) | Sí — https://cloud.google.com/terms/data-processing-addendum |
| **AFIP SDK** (afipsdk.com) | Verificación de CUIT contra ARCA | CUIT | **NO hay DPA público** — solo Términos + Privacidad → **gap declarado (§7)** |
| **Anthropic** (Claude API) | Asistente RAG | Texto de consultas del asistente | Sí — vía Commercial Terms (SCCs; inputs/outputs no se usan para entrenar) |
| **Voyage AI** (embeddings) | Búsqueda semántica del RAG | Texto indexado del corpus | Sí — bajo el DPA de MongoDB (matriz) |
| **Upstash** (Redis) | Rate limiting | IP / identificador de request | Sí — https://upstash.com/trust/dpa.pdf |
| **GitHub** | Repositorio + CI | Código (sin PII de usuarios finales) | Sí — GitHub Data Protection Agreement |

**8 de 9 publican DPA/DPA-equivalente.** El único sin DPA público es **AFIP SDK** (ver §7).

## 6. Transferencias transfronterizas

- **Datos en reposo:** Supabase `sa-east-1` (São Paulo, Brasil) — fuera de Argentina pero en la región.
- **Compute:** Vercel `gru1` (São Paulo).
- **Email:** Resend/Amazon SES (subdominio `send.`, región `sa-east-1`).
- **IA (RAG):** Anthropic y Voyage/MongoDB procesan en **EE.UU.** (cubierto por SCCs / EU-US DPF de cada uno).

La transferencia transfronteriza es un **riesgo declarado** del ISRA; la formalización del acuerdo
con Supabase (o la justificación de términos estándar) queda como pendiente de OIT (§8).

## 7. Riesgos residuales y mitigaciones

| Riesgo | Estado / mitigación |
|---|---|
| **AFIP SDK sin DPA público** | Gap declarado. Ve solo el CUIT. Acción: solicitar DPA o justificar en revisión legal (OIT). |
| **Google OAuth** | **Planificada, NO operativa** — `GOOGLE_CLIENT_ID/SECRET` **ausentes en producción** (verificado); el botón está oculto. Google **no** recibe datos personales hoy. Si se activa, pasa a ser tercero que recibe email/perfil. |
| **Autenticación de correo (spoofing)** | Mitigado: SPF (subdominio `send.`) + DKIM (Resend) + DMARC (`p=none`, monitoreo). Pendiente: subir DMARC a `quarantine`. |
| **Registro abierto en preview/dev** | En cierre: gate por ambiente + allowlist (spec v4-a). En producción el registro es abierto por diseño (piloto). |
| **CSP / security headers** | **Pendiente** — hoy sin CSP en `next.config.ts` (ver `HARDENING.md`). |
| **Retención de datos por tipo** | **Pendiente de definición OIT.** Hoy no hay política de borrado automático por antigüedad. |

## 8. Derechos de los titulares y pendientes de OIT

- **Derechos:** acceso, rectificación, supresión y portabilidad — declarados en la Política de
  Privacidad. **Mecanismo de ejercicio:** hoy vía contacto (`soporte@`/`privacidad@plataformatextil.com.ar`);
  la automatización de export/borrado es deuda (Bloque A, P-04..P-08).
- **Pendientes de OIT/UNTREF (post-transferencia):** domicilio institucional en los textos,
  correo receptor institucional, protocolo de notificación de brechas, **plazos de retención por
  tipo de dato**, y formalización del acuerdo con Supabase. La validación legal de los textos ya
  publicados corre por UNTREF + OIT.

---

*PIA v1.0 — 2026-08-06. Se actualiza al cerrar los pendientes de §7-§8. Documento complementario
del ISRA (entrega por canal separado).*
