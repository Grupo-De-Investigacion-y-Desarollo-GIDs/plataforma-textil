# Decisiones pendientes — Input institucional OIT/UNTREF

**Fecha:** 2026-05-06
**Contexto:** Decisiones que requieren input institucional antes o durante el piloto. Surgieron de la auditoria QA Fase 2 (Ejes 6 interdisciplinarios).
**Responsable de seguimiento:** Gerardo

---

## 1. Protocolo etico de observaciones de campo

**Origen:** QA T-02, Eje 6 sociologo — riesgo de extractivismo de conocimiento
**Estado:** Pendiente de decision
**Urgencia:** Alta (pre-piloto o primera semana)

**Preguntas a resolver:**
- Se le comunica al taller que esta siendo observado?
- Tienen derecho a ver/objetar observaciones sobre ellos?
- Quien accede a las observaciones (solo ESTADO/ADMIN o tambien el taller observado)?
- Hay anonimizacion en reportes que van a OIT?
- OIT tiene lineamientos IGDS aplicables a observacion participante en proyectos?

**Impacto tecnico:** Si se decide transparencia total, se necesita una vista para el taller donde vea observaciones sobre si mismo (V4 M-01). Si se decide anonimizacion, se necesita filtro en exportes.

---

## 2. Threshold de inactividad onboarding

**Origen:** QA T-03, Eje 6 politologo — intervencion del ESTADO proporcional vs invasiva
**Estado:** Resuelto — 14 dias (decision Gerardo 2026-05-06)
**Implementacion:** `DIAS_INACTIVIDAD = 14` en `src/compartido/lib/onboarding.ts`

**Nota:** Para escala post-piloto, considerar hacer configurable desde admin.

---

## 3. Dominio propio para emails

**Origen:** QA INT-02, Eje 5 — emails salen de onboarding@resend.dev (dominio testing)
**Estado:** Pendiente de decision
**Urgencia:** Media (funciona para el piloto pero limita deliverability)

**Preguntas a resolver:**
- Que dominio usar? pdt.org.ar? plataformatextil.ar? subdominio de OIT?
- Quien registra y administra el dominio?
- Configurar DNS (SPF, DKIM, DMARC) en Resend

**Impacto tecnico:** Cambiar `EMAIL_FROM` en Vercel env vars + configurar dominio en Resend dashboard. ~1h tecnica + decision de dominio.

---

## 4. Corpus para RAG (asistente IA)

**Origen:** Spec v3-rag-corpus-real (implementado pero sin contenido real)
**Estado:** Pendiente — necesita contenido de OIT/UNTREF
**Urgencia:** Baja (asistente funciona con corpus placeholder)

**Preguntas a resolver:**
- Que documentos incluir? (guias OIT, manuales de formalizacion, FAQ del sector)
- Quien provee el contenido? OIT? UNTREF? INTI?
- Fecha esperada de entrega del corpus real

---

## 5. Rol CONTENIDO en V4

**Origen:** V4_BACKLOG Bloque J — rol parcialmente implementado, oculto en V3
**Estado:** Pendiente de definicion funcional
**Urgencia:** Baja (no bloquea piloto)

**Preguntas a resolver:**
- Que hace exactamente un contenidista en la PDT?
- Tiene rol de moderacion o solo carga de cursos?
- OIT/UNTREF carga contenido o es un rol externo (ej: INTI, universidades)?
- Que relacion tiene con ADMIN: jerarquica o complementaria?

---

## 6. Tipo de observacion GENERO

**Origen:** QA T-02, Eje 6 politologo — falta categoria de genero en observaciones
**Estado:** Pendiente de decision
**Urgencia:** Media (OIT tiene mandato transversal de genero)

**Preguntas a resolver:**
- Agregar GENERO como tipo de observacion antes del piloto?
- OIT tiene requerimientos especificos de indicadores de genero?
- En sector textil argentino la mayoria de trabajadores/as son mujeres — como se captura esto?

**Impacto tecnico:** Agregar enum value + tag sugerido. ~1h (V4 M-02).

---

## Proximos pasos

1. Enviar este documento a OIT/UNTREF para input
2. Priorizar: items 1 y 3 son los mas urgentes para el piloto
3. Items 2 (resuelto) y 4-6 pueden esperar al feedback del piloto
