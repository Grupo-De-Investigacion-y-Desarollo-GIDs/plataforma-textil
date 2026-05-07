# Input institucional para planificacion V4

**Fecha:** 2026-05-06 (originado en auditoria QA Fase 2)
**Actualizado:** 2026-05-07
**Contexto:** Puntos que surgieron de los Ejes 6 interdisciplinarios durante la auditoria pre-piloto. Se decidiran al inicio de V4, no se envian a OIT por separado.
**Referencia cruzada:** V4_BACKLOG.md — Bloque N (Hallazgos interdisciplinarios) y Bloque O (Decisiones institucionales)

---

## 1. Protocolo etico de observaciones de campo

**Origen:** QA T-02, Eje 6 sociologo
**Para discutir en V4:** Definir reglas de uso etico de las observaciones de campo antes de escalar.

Preguntas abiertas:
- Se le comunica al taller que esta siendo observado?
- Tienen derecho a ver/objetar observaciones sobre ellos?
- Quien accede (solo ESTADO/ADMIN o tambien el taller observado)?
- Hay anonimizacion en reportes?

**Impacto tecnico:** Vista taller para ver observaciones (si transparencia), filtro en exportes (si anonimizacion).

---

## 2. Threshold de inactividad onboarding

**Resuelto:** 14 dias (decision Gerardo 2026-05-06). Implementado en `DIAS_INACTIVIDAD = 14`.
**Para V4:** Considerar hacer configurable desde admin.

---

## 3. Dominio propio para emails

**Para discutir en V4:** Que dominio usar (pdt.org.ar, plataformatextil.ar, subdominio).
**Impacto:** Cambiar EMAIL_FROM + configurar DNS. ~1h tecnica + decision de dominio.

---

## 4. Corpus para RAG

**Para discutir en V4:** Que documentos incluir, quien los provee, cuando.
**Estado actual:** Asistente funciona con corpus placeholder.

---

## 5. Rol CONTENIDO

**Para discutir en V4:** Definir que hace un contenidista, que relacion tiene con ADMIN, si modera o solo carga.
**Estado actual:** Parcialmente implementado, oculto en V3.

---

## 6. Genero como eje transversal

**Para discutir en V4:** Agregar GENERO como tipo de observacion + indicadores de genero en exportes.
**Contexto:** Sector textil argentino tiene mayoria de trabajadoras mujeres. Eje transversal de OIT.
