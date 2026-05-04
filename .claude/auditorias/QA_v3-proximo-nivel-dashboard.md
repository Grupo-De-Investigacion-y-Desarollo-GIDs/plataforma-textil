---
spec: v3-proximo-nivel-dashboard
version: V3
bloque: 4
titulo: "Tu proximo nivel — guia de formalizacion en el dashboard taller"
fecha: 2026-05-04
autor: Gerardo (Claude Code)
verificacion_dev: Pendiente
---

# QA: Tu proximo nivel — F-01

**Spec:** `v3-proximo-nivel-dashboard.md`
**URL de prueba:** https://plataforma-textil.vercel.app
**Fecha:** 2026-05-04
**Auditor(es):** Sergio (tecnico) + politologo, economista, sociologo, contador
**Incluye Eje 6 de validacion de dominio:** si
**Perfiles aplicables:** politologo, economista, sociologo, contador

---

## Contexto institucional

La plataforma guia activamente a los talleres textiles argentinos hacia la formalizacion — ese es el valor diferencial respecto a un directorio pasivo. Los talleres necesitan ver sin ambiguedad que les falta, cuantos puntos suma cada accion, que obtienen al subir de nivel y como hacerlo ya mismo. Este spec reemplaza el banner contextual basico de V2 con una seccion estructurada "Tu proximo nivel" en el dashboard del taller.

---

## Objetivo de este QA

Verificar que la card de progreso hacia el proximo nivel aparece correctamente para talleres BRONCE, PLATA y ORO, con pasos priorizados, barra de progreso, beneficios y acciones directas.

---

## Credenciales de prueba

| Rol | Email | Password | Nivel esperado |
|-----|-------|----------|----------------|
| TALLER Bronce | `roberto.gimenez@pdt.org.ar` | `pdt2026` | BRONCE |
| TALLER Plata | `graciela.sosa@pdt.org.ar` | `pdt2026` | PLATA |
| TALLER Oro | `carlos.mendoza@pdt.org.ar` | `pdt2026` | ORO |

---

## Resultado global

- [ ] Aprobado — todo funciona
- [ ] Aprobado con fixes — funciona pero hay bugs menores
- [ ] Rechazado — falta funcionalidad o hay bugs bloqueantes

**Decision:** [ ]
**Issues abiertos:** —

---

## Eje 1 — Funcionalidad

| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 1 | Componente `ProximoNivelCard` creado en `src/taller/componentes/` | DEV | | |
| 2 | Componentes auxiliares: `PasoItem`, `BarraProgreso`, `BeneficiosNivel`, `NivelOroCelebracion` | DEV | | |
| 3 | Logica de priorizacion implementada (funcion `ordenarPasos`) | DEV | | |
| 4 | Integracion en `/taller/page.tsx` reemplazando el banner contextual inline de V2 | DEV | | |
| 5 | Card visible para TALLER Bronce con pasos hacia PLATA | QA | | |
| 6 | Card visible para TALLER Plata con pasos hacia ORO | QA | | |
| 7 | Taller ORO ve celebracion (no card de progreso) | QA | | |
| 8 | Datos vienen de `calcularProximoNivel()` (D-02) | DEV | | |
| 9 | Acciones llevan a las paginas correctas | QA | | |
| 10 | Sincronizacion de nivel via `<SincronizarNivel>` post-mount | DEV | | |
| 11 | Build sin errores de TypeScript | DEV | | |
| 12 | Tests unitarios pasan (8 tests) | DEV | | |

---

## Eje 2 — Navegabilidad

### Paso 1 — Taller Bronce ve su guia de formalizacion

- **Rol:** TALLER Bronce (roberto.gimenez@pdt.org.ar)
- **URL de inicio:** /taller
- **Verificador:** QA
- **Accion:** Login → dashboard carga → buscar seccion "Tu proximo nivel: PLATA"
- **Esperado:** Card prominente con titulo "Tu proximo nivel: PLATA", barra de progreso con porcentaje y puntos, lista de pasos numerados con badges de puntos
- **Resultado:** [ ]

### Paso 2 — Verificar barra de progreso

- **Rol:** TALLER Bronce
- **URL de inicio:** /taller
- **Verificador:** QA
- **Accion:** Observar la barra de progreso bajo el titulo
- **Esperado:** Barra con gradiente amarillo/naranja, texto "X% (N / M pts)" donde N es el puntaje actual del taller
- **Resultado:** [ ]

### Paso 3 — Pasos priorizados correctamente

- **Rol:** TALLER Bronce
- **URL de inicio:** /taller
- **Verificador:** QA
- **Accion:** Revisar orden de los pasos en la card
- **Esperado:** Si CUIT no verificado: "Verifica tu CUIT en ARCA" primero (+10 pts). Luego documentos requeridos ordenados por puntos. Certificados despues. Opcionales al final con texto "opcional".
- **Resultado:** [ ]

### Paso 4 — Acciones directas funcionan

- **Rol:** TALLER Bronce
- **URL de inicio:** /taller
- **Verificador:** QA
- **Accion:** Click "Verificar ahora" → verificar destino. Click "Subir documento" → verificar destino. Click "Ver cursos" → verificar destino.
- **Esperado:** "Verificar ahora" → /taller/perfil/verificar-cuit. "Subir documento" → /taller/formalizacion. "Ver cursos" → /taller/aprender.
- **Resultado:** [ ]

### Paso 5 — Beneficios del proximo nivel

- **Rol:** TALLER Bronce
- **URL de inicio:** /taller
- **Verificador:** QA
- **Accion:** Scrollear la card hasta la seccion de beneficios
- **Esperado:** Texto "Al alcanzar PLATA vas a obtener:" seguido de una lista con checks verdes. Beneficios configurados en ReglaNivel (o placeholder si vacios).
- **Resultado:** [ ]

### Paso 6 — Taller ORO ve celebracion

- **Rol:** TALLER Oro (carlos.mendoza@pdt.org.ar)
- **URL de inicio:** /taller
- **Verificador:** QA
- **Accion:** Login → dashboard
- **Esperado:** Card con fondo degradado ambar/dorado, texto "Estas en nivel ORO!", mensaje motivador, lista "Para mantener ORO:" con 3 items.
- **Resultado:** [ ]

### Paso 7 — No aparece el banner contextual de V2

- **Rol:** TALLER Bronce
- **URL de inicio:** /taller
- **Verificador:** QA
- **Accion:** Buscar en todo el dashboard un banner con borde izquierdo azul que decia "Subi tus documentos de formalizacion..."
- **Esperado:** NO debe existir. Fue reemplazado por ProximoNivelCard.
- **Resultado:** [ ]

---

## Eje 3 — Casos borde

| # | Caso | Accion | Esperado | Verificador | Resultado |
|---|------|--------|----------|-------------|-----------|
| 1 | Taller sin CUIT verificado | Login Bronce, ver card | Paso "Verifica tu CUIT en ARCA" aparece primero con +10 pts | QA | |
| 2 | Taller con CUIT verificado | Verificar que NO aparece el paso de CUIT | QA | |
| 3 | Beneficios vacios en ReglaNivel | Si algun nivel no tiene beneficios configurados, se muestra "Mejoras tu visibilidad en la plataforma" | QA | |
| 4 | Documentos opcionales | Aparecen al final con texto "opcional" (sin badge de puntos requeridos) | QA | |
| 5 | SincronizarNivel actualiza nivel | Login con condiciones cumplidas, verificar que el nivel se actualiza sin recargar manualmente | DEV | |

---

## Eje 4 — Performance

| Verificacion | Metodo | Verificador | Resultado |
|-------------|--------|-------------|-----------|
| Dashboard carga en menos de 3 segundos | DevTools > Network > recargar | QA | |
| Sin errores en consola del browser | DevTools > Console > revisar | QA | |
| Funciona en movil (responsive) | DevTools > Toggle device toolbar (375px) | QA | |
| Card no bloquea render inicial (SincronizarNivel es async post-mount) | DevTools > Network > ver que la pagina aparece antes del server action | QA | |

---

## Eje 5 — Consistencia visual

| Verificacion | Resultado | Notas |
|-------------|-----------|-------|
| Titulo usa font-overpass y color brand-blue | | |
| Badges de puntos en ambar consistente | | |
| Card ORO tiene degradado ambar distinguible | | |
| Textos en espanol argentino (vos/tenes/subi) | | |
| Barra de progreso suave con gradiente | | |
| Links de accion en brand-blue con hover underline | | |

---

## Eje 6 — Validacion de dominio (perfiles interdisciplinarios)

### Politologo — Relacion con el Estado

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | La gamificacion de la formalizacion (puntos, niveles, beneficios) es apropiada para una herramienta institucional? No trivializa un proceso serio? | | |
| 2 | Los textos comunican que el Estado valida los documentos, no la plataforma? (ej: "verificacion" no implica que la plataforma decide) | | |
| 3 | El nombre "nivel" no genera expectativa de que el Estado otorga un reconocimiento oficial? | | |

### Economista — Incentivos y metricas

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | Los puntos asignados a cada paso reflejan correctamente el costo/esfuerzo del taller? (CUIT = 10, documentos = 15-20) | | |
| 2 | Los beneficios listados son los correctos para motivar formalizacion sin prometer cosas que la plataforma no puede garantizar? | | |
| 3 | Hay riesgo de que un taller se obsesione con puntos y descuide otros aspectos del trabajo? La card incentiva correctamente? | | |

### Sociologo — Lenguaje y accesibilidad

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | El lenguaje es comprensible y motivador para un taller familiar (no burocratico, no infantil)? | | |
| 2 | La estructura visual (badges, colores, barra) es accesible para personas con poca experiencia digital? | | |
| 3 | El uso de "vos/tenes/subi" se mantiene consistente en todos los textos de la card? | | |
| 4 | Hay riesgo de que el taller sienta presion excesiva o juicio por estar en nivel bajo? Los textos son neutros o motivadores? | | |

### Contador — Flujos fiscales y operativos

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | Los nombres de los documentos son los correctos segun la realidad fiscal argentina (monotributo, constancia de inscripcion, ART)? | | |
| 2 | Las acciones sugeridas reflejan el flujo real de tramites (verificar CUIT → subir constancia → capacitarse)? | | |
| 3 | Falta algun documento critico para la realidad fiscal del sector textil? | | |
