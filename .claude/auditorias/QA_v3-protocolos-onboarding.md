# QA: Protocolos de onboarding (T-03 + T-05 unificados)

**Spec:** `v3-protocolos-onboarding`
**Commit de implementacion:** pendiente
**URL de prueba:** https://plataforma-textil-dev.vercel.app
**Fecha:** 2026-05-05
**Auditor(es):** Sergio (tecnico) + politologo + economista + sociologo + contador
**Incluye Eje 6 de validacion de dominio:** si (4 perfiles)
**Perfiles aplicables:** politologo, economista, sociologo, contador

---

## Contexto institucional

El piloto OIT arranca con 25 talleres reales y 5 marcas. Sin protocolos de onboarding, el primer mes seria caotico: talleres con dudas que no saben a quien consultar, ESTADO sin informacion de quien esta en que etapa, OIT sin metricas para informes. Este spec agrega guias paso a paso para talleres y marcas, un dashboard de seguimiento para el admin, checklists en los dashboards de usuario, templates de email e invitacion, notas de seguimiento internas, y metricas de funnel de adopcion.

---

## Objetivo de este QA

Verificar que: (1) las guias de onboarding son accesibles y completas, (2) el dashboard admin muestra metricas y etapas correctas, (3) el checklist en dashboards de taller/marca funciona correctamente, (4) el endpoint de reenvio de invitacion funciona, (5) las notas de seguimiento se pueden crear y ver, (6) la seguridad esta correcta (solo ADMIN/ESTADO ven notas).

---

## Como trabajar con este documento

1. Abri este archivo y la plataforma en paralelo
2. Identifica que items te corresponden segun tu perfil (columna Verificador)
3. Segui los pasos en orden — cada paso depende del anterior
4. Marca cada resultado con ok, bug o bloqueante

---

## Checklist de verificacion

### Bloque 1 — Paginas de onboarding

| # | Paso | Resultado esperado | Verificador | Estado |
|---|------|--------------------|-------------|--------|
| 1 | Ir a /ayuda | Links "Guia para talleres" y "Guia para marcas" visibles | QA | |
| 2 | Click en "Guia para talleres" | Pagina /ayuda/onboarding-taller con 4 pasos numerados | QA | |
| 3 | Verificar contenido: niveles, documentos, pedidos | Informacion completa y clara para talleres | QA | |
| 4 | Click en "Guia para marcas" | Pagina /ayuda/onboarding-marca con 4 pasos | QA | |
| 5 | Verificar contenido: pedidos, cotizaciones, badges | Informacion relevante para marcas | QA | |

### Bloque 2 — Dashboard admin/onboarding

| # | Paso | Resultado esperado | Verificador | Estado |
|---|------|--------------------|-------------|--------|
| 6 | Login como ADMIN. Ir a /admin/onboarding | Dashboard con stats por etapa visible | QA | |
| 7 | Verificar stats cards: Total, Invitados, Registrados, Activos, Inactivos | Numeros coherentes con usuarios existentes | QA | |
| 8 | Verificar funnel de adopcion | Barras proporcionales con porcentajes correctos | QA | |
| 9 | Verificar tabla de usuarios con columnas: Nombre, Rol, Etapa, Registro, Acciones | Datos correctos para cada usuario | QA | |
| 10 | "Onboarding" visible en sidebar del admin | Link en el sidebar izquierdo | QA | |

### Bloque 3 — Acciones rapidas en dashboard

| # | Paso | Resultado esperado | Verificador | Estado |
|---|------|--------------------|-------------|--------|
| 11 | Usuario en etapa INVITADO: boton "Reenviar invitacion" | Boton visible, click envia email | QA | |
| 12 | Usuario en etapa REGISTRADO: boton "Enviar mensaje" | Abre editor de mensaje individual (F-07) | QA | |
| 13 | Usuario en etapa ACTIVO: sin acciones | Muestra "-" en columna acciones | QA | |

### Bloque 4 — Checklist en dashboard taller

| # | Paso | Resultado esperado | Verificador | Estado |
|---|------|--------------------|-------------|--------|
| 14 | Login como TALLER con perfil incompleto. Ir a /taller | Checklist de 5 pasos visible despues del encabezado | QA | |
| 15 | Pasos completados muestran check verde, pendientes circulo gris | Diferenciacion visual clara | QA | |
| 16 | Boton "Continuar paso siguiente" lleva al primer paso pendiente | Navegacion correcta | QA | |
| 17 | ProximoNivelCard NO visible mientras checklist esta activo | Solo se muestra uno u otro, nunca ambos | QA | |
| 18 | Login como TALLER con todo completo | Checklist no se muestra, ProximoNivelCard si | QA | |

### Bloque 5 — Checklist en dashboard marca

| # | Paso | Resultado esperado | Verificador | Estado |
|---|------|--------------------|-------------|--------|
| 19 | Login como MARCA con perfil incompleto. Ir a /marca | Checklist de 5 pasos visible | QA | |
| 20 | "Completar datos de tu marca" pendiente si falta tipo/ubicacion/volumen | Estado correcto | QA | |
| 21 | Boton "Continuar paso siguiente" funciona | Navega al paso correcto | QA | |

### Bloque 6 — Notas de seguimiento

| # | Paso | Resultado esperado | Verificador | Estado |
|---|------|--------------------|-------------|--------|
| 22 | Login como ADMIN. Ir a /admin/talleres/[id] | Seccion "Notas de seguimiento" visible al final | QA | |
| 23 | Click "Agregar nota". Escribir texto. Click "Guardar" | Nota aparece en la lista con autor y timestamp | QA | |
| 24 | Ir a /admin/marcas/[id] | Seccion "Notas de seguimiento" visible al final | QA | |
| 25 | Login como TALLER. Ir a /taller | NO hay seccion de notas visible | QA | |

### Bloque 7 — Email y WhatsApp

| # | Paso | Resultado esperado | Verificador | Estado |
|---|------|--------------------|-------------|--------|
| 26 | Reenviar invitacion desde dashboard admin | Email enviado (verificar en logs) | DEV | |
| 27 | Template bienvenida WhatsApp existe | Template renderiza con nombre y enlace | DEV | |
| 28 | Template recordatorio_perfil WhatsApp existe | Template renderiza correctamente | DEV | |

### Bloque 8 — Seguridad

| # | Paso | Resultado esperado | Verificador | Estado |
|---|------|--------------------|-------------|--------|
| 29 | GET /api/admin/notas-seguimiento sin auth | 401 | DEV | |
| 30 | POST /api/admin/onboarding/reenviar-invitacion sin auth | 401 | DEV | |
| 31 | TALLER GET /api/admin/notas-seguimiento | 403 | DEV | |

### Bloque 9 — Tests automatizados

| # | Verificacion | Verificador | Estado |
|---|-------------|-------------|--------|
| 32 | 24 Vitest tests pasan (npx vitest run src/__tests__/onboarding.test.ts) | DEV | |
| 33 | TypeScript compila sin errores (npx tsc --noEmit) | DEV | |
| 34 | 7 E2E tests pasan en CI (tests/e2e/onboarding.spec.ts) | DEV | |

---

## Validacion de dominio (seccion 12 del spec)

### Politologo

| # | Pregunta | Respuesta | Estado |
|---|----------|-----------|--------|
| P1 | Las etapas y metricas son las apropiadas para reportar a OIT? | | |
| P2 | La intervencion del ESTADO en INACTIVO 14+ dias es proporcional o invasiva? | | |

### Economista

| # | Pregunta | Respuesta | Estado |
|---|----------|-----------|--------|
| E1 | Las metricas del funnel son las correctas para evaluar el impacto del piloto? | | |
| E2 | Falta alguna metrica economica (volumen de cotizaciones, monto promedio)? | | |

### Sociologo

| # | Pregunta | Respuesta | Estado |
|---|----------|-----------|--------|
| S1 | Los textos de email y WhatsApp suenan invitadores o burocraticos? | | |
| S2 | La gamificacion de "completar pasos" es apropiada para usuarios que no son nativos digitales? | | |
| S3 | El protocolo de seguimiento puede generar sensacion de vigilancia? | | |

### Contador

| # | Pregunta | Respuesta | Estado |
|---|----------|-----------|--------|
| C1 | La guia explica correctamente los temas de monotributo y formalizacion? | | |
| C2 | Hay info critica para el sector textil que falta? | | |

---

## Resumen

| Bloque | Items | Verificador principal |
|--------|-------|----------------------|
| 1. Paginas onboarding | 5 | QA |
| 2. Dashboard admin | 5 | QA |
| 3. Acciones rapidas | 3 | QA |
| 4. Checklist taller | 5 | QA |
| 5. Checklist marca | 3 | QA |
| 6. Notas seguimiento | 4 | QA |
| 7. Email/WhatsApp | 3 | DEV |
| 8. Seguridad | 3 | DEV |
| 9. Tests | 3 | DEV |
| **Total** | **34** | |
| Validacion dominio | 9 preguntas | politologo, economista, sociologo, contador |
