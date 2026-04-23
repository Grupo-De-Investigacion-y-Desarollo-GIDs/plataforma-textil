# Observaciones de Sergio — Analisis v2

**Fecha:** 2026-04-08
**Base:** Analisis de documentos v2 + revision de codigo existente
**Para:** Gerardo, antes de escribir los specs de v2

---

## Epica 1 — Storage y Documentos

Acuerdo con S1-01, S1-02 y S1-03. S1-04 queda como mejora futura segun lo planteado por Gerardo.

---

## Epica 2 — Flujo Comercial

Acuerdo con la decision de flujo unificado y con S2-01 a S2-04.

---

## Epica 3 — Perfiles y Wizard Productivo

Acuerdo con S3-01, S3-02 y S3-03. S3-04 queda como mejora futura.

### Tema a discutir con Gerardo: el wizard productivo y el sistema de puntaje

Se detecto un bug tecnico: el wizard guarda su `scoreGeneral` (basado en maquinaria, equipo y organizacion) en el mismo campo `puntaje` que usa `nivel.ts` para el puntaje de formalizacion. Se pisan.

Esto genera una contradiccion visible en el dashboard: un taller puede mostrar "Puntaje: 75" (del wizard) pero "Nivel: BRONCE" (sin documentos de formalizacion). El numero alto sugiere que esta bien, pero el nivel dice que no tiene nada formalizado.

Hay tres metricas que hoy se mezclan:

| Metrica | Que mide | Quien la calcula |
|---------|----------|-----------------|
| Nivel (BRONCE/PLATA/ORO) | Formalizacion | `nivel.ts` |
| Puntaje (numero) | Formalizacion O wizard (se pisan) | `nivel.ts` o wizard |
| Progreso % | Documentos completados / 8 | Dashboard |

**Preguntas para Gerardo:**
- ¿El wizard de perfil productivo corresponde a esta plataforma? Tiene 14 pasos y pide informacion muy detallada (SAM, polivalencia, escalabilidad) que puede ser excesiva para talleres chicos o familiares
- ¿Era una herramienta de diagnostico temporal o se planea mantenerla?
- Si se mantiene, el puntaje del wizard y el puntaje de formalizacion deben ser campos separados — no pueden compartir el mismo campo

---

## Epica 4 — Academia

Acuerdo con S4-01 y S4-04.

### Observacion: S4-02 y S4-03 son la misma tarea

S4-02 plantea el quiz obligatorio y S4-03 plantea conectar el quiz aprobado con la generacion del certificado. Son el mismo flujo — no tiene sentido implementarlos en dos pasos separados. Se recomienda unificarlos en un solo spec: "quiz como requisito para certificarse".

---

## Epica 5 — Notificaciones y Niveles

Acuerdo con S5-01, S5-02 y S5-03.

### Tema a discutir con Gerardo: dos conceptos mezclados en la misma pantalla

La pagina `/admin/notificaciones` mezcla dos cosas distintas en la misma tabla:

1. **Notificaciones de sistema** — generadas automaticamente por flujos (pedido publicado, cotizacion recibida, documento aprobado, etc.)
2. **Comunicaciones del admin** — mensajes redactados manualmente y enviados a segmentos (todos, talleres, marcas)

Hoy no hay separacion visual ni funcional entre ambas. El admin no puede distinguir que genero el sistema y que mando el manualmente.

**Pregunta para Gerardo:** ¿Deberian ser dos secciones separadas? Por ejemplo:
- "Centro de comunicaciones" → donde el admin redacta y envia mensajes masivos
- "Historial de notificaciones" → log de lo que genero el sistema automaticamente

### Vinculo con Epica 3 — puntaje

El bug del wizard (puntaje pisado) impacta directamente en esta epica: S5-02 propone corregir el log de niveles, pero si el campo `puntaje` esta siendo sobreescrito por el wizard, el historial de cambios de nivel tampoco va a ser confiable. Resolver el wizard es prerequisito para que S5-02 y S5-03 tengan sentido.

---

## Epica Contenido Visual

Acuerdo con las 3 fases y los cambios de schema propuestos.

Acuerdo con eliminar el campo presupuesto del pedido — el precio lo define el taller en su cotizacion, no la marca al publicar. Esto refleja el precio real del mercado y alinea con el flujo comercial unificado.
