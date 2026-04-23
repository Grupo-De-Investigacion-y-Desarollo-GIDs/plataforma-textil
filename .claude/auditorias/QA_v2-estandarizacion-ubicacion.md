# QA: Estandarización de ubicación — provincias y partidos INDEC

**Spec:** `v2-estandarizacion-ubicacion.md`
**Commit de implementación:** `3734b17`
**URL de prueba:** https://plataforma-textil.vercel.app
**Fecha:** 2026-04-17
**Auditor:** Sergio

---

## Resultado global

- [ ] ✅ Aprobado — todo funciona
- [ ] 🔧 Aprobado con fixes — funciona pero hay bugs menores
- [ ] ❌ Rechazado — falta funcionalidad o hay bugs bloqueantes

**Decisión:** [ cerrar v2 / fix inmediato / abrir ítem v3 ]
**Issues abiertos:** # (links a GitHub)

---

## Eje 1 — Funcionalidad

Verificar que cada criterio de aceptación del spec está implementado.

> **Nota:** Los ítems marcados **DEV** los verifica Gerardo desde el código o la terminal — no son verificables desde el browser. El auditor solo verifica los ítems marcados **QA**.

| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 1 | Migración corre sin errores | DEV | | |
| 2 | JSON de INDEC tiene las 24 provincias con sus partidos/departamentos | DEV | | |
| 3 | Formulario de edición muestra select de provincia → partido en cascada | QA | | |
| 4 | Al cambiar provincia se resetea el partido seleccionado | QA | | |
| 5 | Campo de detalle libre funciona y se guarda | QA | | |
| 6 | Seed corre sin errores con los nuevos campos | DEV | | |
| 7 | Dashboard de Estado agrupa por provincia (no por zona) | QA | | |
| 8 | Directorio público muestra provincia/partido y permite buscar por ellos | QA | | |
| 9 | No quedan referencias a `taller.zona` en el codebase | DEV | | |
| 10 | Build sin errores de TypeScript | DEV | | |

---

## Eje 2 — Navegabilidad

Pasos de navegación a seguir en orden. Cada paso es una acción concreta.

### Paso 1 — TALLER edita su perfil y ve los selects de ubicación

- **Rol:** TALLER Bronce (`roberto.gimenez@pdt.org.ar` / `pdt2026`)
- **URL de inicio:** `/taller/perfil`
- **Acción:**
  1. Ir a `/taller/perfil` → click en "Editar datos básicos"
  2. Buscar la sección de ubicación
  3. Verificar que hay un select de "Provincia" (no un campo de texto libre "Zona / Barrio")
- **Esperado:** Se ve un select con las 24 provincias argentinas. No hay campo de texto libre "Zona / Barrio".
- **Resultado:**
- **Notas:**

### Paso 2 — TALLER selecciona provincia y ve los partidos

- **Rol:** TALLER Bronce
- **URL de inicio:** `/taller/perfil/editar`
- **Acción:**
  1. Seleccionar "Buenos Aires" en el select de provincia
  2. Verificar que aparece un segundo select con partidos bonaerenses
- **Esperado:** Aparece un select "Partido / Departamento" con partidos como Avellaneda, La Matanza, Florencio Varela, etc.
- **Resultado:**
- **Notas:**

### Paso 3 — TALLER cambia de provincia y el partido se resetea

- **Rol:** TALLER Bronce
- **URL de inicio:** `/taller/perfil/editar`
- **Acción:**
  1. Seleccionar "Buenos Aires" → seleccionar "Avellaneda" como partido
  2. Cambiar la provincia a "Córdoba"
  3. Verificar que el partido se reseteó
- **Esperado:** Al cambiar provincia, el partido seleccionado se borra y aparecen los departamentos de Córdoba.
- **Resultado:**
- **Notas:**

### Paso 4 — TALLER selecciona CABA y ve comunas

- **Rol:** TALLER Bronce
- **URL de inicio:** `/taller/perfil/editar`
- **Acción:**
  1. Seleccionar "Ciudad Autónoma de Buenos Aires" en el select de provincia
  2. Verificar el label del segundo select
- **Esperado:** El segundo select dice "Comuna" (no "Partido / Departamento") y muestra las comunas de CABA.
- **Resultado:**
- **Notas:**

### Paso 5 — TALLER completa detalle de ubicación y guarda

- **Rol:** TALLER Bronce
- **URL de inicio:** `/taller/perfil/editar`
- **Acción:**
  1. Seleccionar provincia: Buenos Aires, partido: Florencio Varela
  2. Escribir en "Detalle de ubicación": "Barrio Centro, a 2 cuadras de la estación"
  3. Click "Guardar cambios"
  4. Verificar en `/taller/perfil` que se muestra la nueva ubicación
- **Esperado:** El perfil muestra "Buenos Aires, Florencio Varela" junto al ícono de ubicación.
- **Resultado:**
- **Notas:**

### Paso 6 — ESTADO ve distribución por provincia

- **Rol:** ESTADO (`anabelen.torres@pdt.org.ar` / `pdt2026`)
- **URL de inicio:** `/estado/sector`
- **Acción:**
  1. Ir a `/estado/sector`
  2. Buscar la sección de distribución geográfica
- **Esperado:** La sección se llama "Distribución por provincia" (no "por zona"). Muestra "Buenos Aires — 3 talleres" (o similar según seed).
- **Resultado:**
- **Notas:**

### Paso 7 — Directorio público muestra provincia/partido

- **Rol:** Sin login
- **URL de inicio:** `/directorio`
- **Acción:**
  1. Ir a `/directorio`
  2. Verificar qué ubicación se muestra debajo del nombre de cada taller
- **Esperado:** Cada taller muestra "Buenos Aires, Avellaneda" (o equivalente) con ícono de ubicación, no "zona" libre.
- **Resultado:**
- **Notas:**

### Paso 8 — Directorio público busca por provincia

- **Rol:** Sin login
- **URL de inicio:** `/directorio`
- **Acción:**
  1. Escribir "Buenos Aires" en el campo de búsqueda
  2. Click "Buscar"
- **Esperado:** Aparecen los 3 talleres (todos están en Buenos Aires en el seed).
- **Resultado:**
- **Notas:**

### Paso 9 — Directorio público busca por partido

- **Rol:** Sin login
- **URL de inicio:** `/directorio`
- **Acción:**
  1. Escribir "Avellaneda" en el campo de búsqueda
  2. Click "Buscar"
- **Esperado:** Aparece solo Corte Sur SRL (el único en Avellaneda).
- **Resultado:**
- **Notas:**

> Si el resultado no es ✅ → abrir widget en esa página → tipo [bug/falta] → describir qué pasó

---

## Eje 3 — Casos borde

Probar situaciones límite prescritas en el spec.

> **Nota:** Los ítems marcados **DEV** los verifica Gerardo desde el código o la terminal — no son verificables desde el browser. El auditor solo verifica los ítems marcados **QA**.
>
> **Si la acción requiere cambiar de usuario:** cerrá sesión, logueate como el rol indicado, y recién entonces ejecutá el comando. Un fetch ejecutado con el usuario equivocado puede dar falso positivo o falso negativo.

| # | Caso | Acción | Esperado | Verificador | Resultado |
|---|------|--------|----------|-------------|-----------|
| 1 | Taller sin provincia seleccionada | Abrir editar perfil sin seleccionar provincia | El select de partido NO aparece | QA | |
| 2 | Guardar sin provincia | Dejar provincia vacía y guardar | Se guarda correctamente con provincia null | QA | |
| 3 | Buscar provincia inexistente | Escribir "Japón" en búsqueda del directorio | No aparecen resultados | QA | |
| 4 | No quedan referencias a zona en src/ | `grep -r '\bzona\b' src/` | 0 resultados | DEV | |
| 5 | JSON INDEC tiene 24 provincias | Contar provincias en ubicaciones-ar.json | Exactamente 24 | DEV | |

---

## Eje 4 — Performance

Verificar tiempos de carga y comportamiento bajo condiciones normales.

| Verificación | Método | Resultado |
|-------------|--------|-----------|
| Página carga en menos de 3 segundos | Abrir DevTools → Network → recargar | |
| Imágenes no bloquean el contenido | Scroll mientras carga | |
| Sin errores en consola del browser | DevTools → Console → revisar | |
| Funciona en móvil (responsive) | DevTools → Toggle device toolbar | |

---

## Eje 5 — Consistencia visual

Verificar que el diseño es coherente con el resto de la plataforma.

| Verificación | Resultado | Notas |
|-------------|-----------|-------|
| Tipografías consistentes (Overpass para títulos) | | |
| Colores del design system (brand-blue, brand-red) | | |
| Bordes y radios consistentes (rounded-xl) | | |
| Estados vacíos tienen mensaje descriptivo | | |
| Textos en español argentino (vos/tenés) | | |
| Sin texto en inglés visible al usuario | | |

---

## Resumen de issues abiertos

| Issue | Tipo | Descripción | Prioridad sugerida |
|-------|------|-------------|-------------------|
| — | — | — | — |

---

## Notas del auditor

[Observaciones generales, sugerencias de UX, contexto adicional que no entra en los ejes anteriores]

---

## Checklist de cierre

- [ ] Todos los criterios de aceptación del spec verificados
- [ ] Casos borde probados
- [ ] Performance revisada en desktop y móvil
- [ ] Issues abiertos en GitHub con labels correctos
- [ ] Resultado global definido
- [ ] Documento commiteado a develop
