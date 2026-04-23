# QA: Épica Perfil Productivo — Wizard, Perfil Taller y Dashboard Sectorial

**Spec:** `v2-epica-perfil-productivo.md`
**Commit de implementación:** `1f8d531`
**URL de prueba:** https://plataforma-textil.vercel.app
**Fecha:** 2026-04-14
**Auditor:** Sergio

---

## Cómo trabajar con este documento

1. Abrí este archivo y la plataforma en paralelo
2. Seguí los pasos en orden — cada paso depende del anterior
3. Marcá cada resultado con ✅ (ok), 🐛 (bug menor) o ❌ (bloqueante)
4. Si el resultado no es ✅ → abrí el widget azul "Feedback" en esa página → tipo [bug/falta] → describí qué pasó
5. Quedate en la página donde encontraste el problema antes de abrir el widget (captura la URL automáticamente)
6. Al terminar, completá el resultado global y commiteá este archivo actualizado

**Regla de oro:** un issue por hallazgo, desde la página donde ocurre.

> **Nota:** si los hallazgos no aparecen en GitHub Issues, verificar que `GITHUB_TOKEN` y `GITHUB_REPO` están configurados en Vercel. Los hallazgos siempre quedan registrados en la DB aunque el token no esté configurado — se pueden ver en `/admin` desde `LogActividad`.

---

## Credenciales de prueba

| Rol | Email | Password | URL de entrada |
|-----|-------|----------|----------------|
| ADMIN | `lucia.fernandez@pdt.org.ar` | `pdt2026` | `/admin` |
| TALLER Bronce | `roberto.gimenez@pdt.org.ar` | `pdt2026` | `/taller` |
| TALLER Plata | `graciela.sosa@pdt.org.ar` | `pdt2026` | `/taller` |
| TALLER Oro | `carlos.mendoza@pdt.org.ar` | `pdt2026` | `/taller` |
| MARCA | `martin.echevarria@pdt.org.ar` | `pdt2026` | `/marca` |
| ESTADO | `anabelen.torres@pdt.org.ar` | `pdt2026` | `/estado` |

---

## Resultado global

- [ ] ✅ Aprobado — todo funciona
- [ ] 🔧 Aprobado con fixes — funciona pero hay bugs menores
- [ ] ❌ Rechazado — falta funcionalidad o hay bugs bloqueantes

**Decisión:** [ cerrar v2 / fix inmediato / abrir ítem v3 ]
**Issues abiertos:** #

---

## Eje 1 — Funcionalidad

Verificar que cada criterio de aceptación del spec está implementado.

| # | Criterio | Resultado | Issue |
|---|----------|-----------|-------|
| 1 | El wizard ya no envía `puntaje: scoreGeneral` en `handleSave` | | |
| 2 | El paso de resumen del wizard no muestra el "Score General" ni los "Indicadores de Madurez" (las 5 barras) | | |
| 3 | El paso de resumen sigue mostrando "Capacidad", "Procesos seleccionados", "Prendas seleccionadas" y "Badges Desbloqueados" | | |
| 4 | `/taller/perfil` muestra la sección "Perfil productivo" si `taller.organizacion !== null` | | |
| 5 | Los talleres que no completaron el wizard no ven la sección | | |
| 6 | Los cursos recomendados en `/taller` priorizan colecciones que matcheen pasos de formalización pendientes del taller | | |
| 7 | Si el taller es BRONCE recién creado (sin filas en Validacion), los cursos de formalización básica aparecen primero | | |
| 8 | `/estado/sector` carga con datos agregados reales y resuelve los nombres de procesos y prendas (no muestra IDs crudos) | | |
| 9 | El item "Diagnóstico del sector" aparece en el Header del rol ESTADO y el tab se marca activo al estar en `/estado/sector` | | |
| 10 | La migración de schema aplica limpio (campos `procesosTarget` y `formalizacionTarget` en Coleccion) | | |
| 11 | Build pasa sin errores de TypeScript | | |

---

## Eje 2 — Navegabilidad

### Paso 1 — TALLER completa el wizard y verifica el resumen

- **Rol:** TALLER Bronce (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/taller/perfil/completar`
- **Acción:**
  1. Login como Roberto Giménez (TALLER Bronce)
  2. Ir a `/taller/perfil/completar`
  3. Avanzar por los 14 pasos del wizard completando datos (o si ya están cargados, avanzar con "Siguiente")
  4. Llegar al paso 13 (Resumen final)
- **Esperado:** El paso 13 muestra:
  - Título: **"¡Perfil productivo completado!"**
  - Subtítulo: "Las marcas pueden ver tu capacidad, maquinaria y procesos"
  - Texto auxiliar: "Este diagnóstico ayuda al equipo de la plataforma a entender el sector textil"
  - Card **"Capacidad"** con capacidad diaria y mensual + especialidad
  - Card **"Procesos seleccionados"** con badges de procesos
  - Card **"Prendas seleccionadas"** con badges de prendas
  - Card **"Badges Desbloqueados"** con 6 badges verdes
  - **NO** aparece el "Score General" con el número grande en porcentaje
  - **NO** aparecen los "Indicadores de Madurez" (las 5 barras de progreso: Equipo, Organización, Maquinaria, Gestión, Escalabilidad)
  - Dos botones: "Ver mi perfil" y "Guardar e ir a Academia"
- **Resultado:**
- **Notas:** Si aparece el Score General o las 5 barras, el step 13 del wizard no fue actualizado

### Paso 2 — Sección "Perfil productivo" visible en el perfil

- **Rol:** TALLER Bronce (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/taller/perfil`
- **Acción:**
  1. Después de completar el wizard (Paso 1), click en "Ver mi perfil" o ir a `/taller/perfil`
  2. Buscar la sección "Perfil productivo" entre "Tipos de Prenda" y "Certificaciones"
- **Esperado:** Aparece una Card titulada **"Perfil productivo"** con hasta 6 campos en grilla:
  - **Organización:** "En línea", "Modular" o "Prenda completa"
  - **Espacio:** metros cuadrados (solo si > 0)
  - **Experiencia del equipo:** "Más de 5 años", "3 a 5 años", "1 a 3 años" o "Menos de 1 año"
  - **Registro de producción:** "Software", "Excel/planilla", "Papel" o "Sin registro"
  - **Puede escalar:** "Segundo turno", "Tercerización", "Contratando personal", "Horas extra" o "Sin capacidad de escalar"
  - **SAM (prenda principal):** valor en minutos
  - Texto al pie: *"Esta información es visible para el equipo de la plataforma y organismos del Estado. No afecta tu nivel de formalización."*
  - Cada campo tiene fondo `bg-gray-50` con `rounded-lg p-3`
- **Resultado:**
- **Notas:** Si la sección no aparece, verificar que Roberto completó el wizard (proxy: `taller.organizacion !== null` en la DB)

### Paso 3 — El puntaje NO cambió por el wizard

- **Rol:** TALLER Bronce (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/taller/perfil`
- **Acción:**
  1. Ir a `/taller/perfil` → sección "Información General" → leer "Puntaje: X pts"
  2. Comparar con el puntaje que tenía **antes** de completar el wizard
  3. Si no anotaste el puntaje antes, ir al dashboard `/taller` → card "Puntaje" → verificar que es consistente con validaciones aprobadas
- **Esperado:** El puntaje es el mismo que antes de completar el wizard. El wizard ya NO envía `puntaje: scoreGeneral` al endpoint — el puntaje lo calcula exclusivamente `aplicarNivel` basado en documentos y certificados
- **Resultado:**
- **Notas:** El puntaje de Roberto Bronce debería ser 10 (solo tiene CUIT verificado + 1 validación completada). Si cambió a un valor como 60-80%, el bug del wizard sigue presente

### Paso 4 — Recomendaciones para TALLER Bronce

- **Rol:** TALLER Bronce (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/taller`
- **Acción:**
  1. Ir al dashboard `/taller`
  2. Scroll hasta la sección "Capacitaciones recomendadas"
  3. Verificar qué colecciones se muestran
- **Esperado:** Como Roberto es BRONCE y le faltan casi todos los documentos de formalización (Habilitación municipal, ART, Empleados registrados, Habilitación bomberos, Plan de seguridad e higiene, Nómina digital), las colecciones recomendadas deberían incluir:
  - **"Formalización y Registro del Taller"** (col3) — matchea CUIT/Monotributo, Habilitación municipal, ART
  - **"Seguridad e Higiene en el Taller Textil"** (col1) — matchea Habilitación bomberos, Plan de seguridad e higiene, Empleados registrados
  - Las recomendaciones priorizan por formalización pendiente, no por orden genérico
- **Resultado:**
- **Notas:** Si las colecciones aparecen en orden genérico (1, 2, 3) sin relación con documentos pendientes, la lógica de priorización no funciona. Si Roberto ya completó la col3 (tiene certificado), no debería aparecer

### Paso 5 — Recomendaciones para TALLER Plata (distintas)

- **Rol:** TALLER Plata (graciela.sosa@pdt.org.ar / pdt2026)
- **URL de inicio:** `/taller`
- **Acción:**
  1. Cerrar sesión, login como Graciela Sosa (TALLER Plata)
  2. Ir al dashboard `/taller`
  3. Verificar las "Capacitaciones recomendadas"
- **Esperado:** Graciela tiene PLATA — sus documentos pendientes son distintos a Roberto (tiene CUIT, ART y Habilitación municipal completados, le faltan los de ORO). Las colecciones recomendadas deberían reflejar esos documentos pendientes. Si completó la col1 (tiene certificado de Seguridad e Higiene), esa NO debería aparecer
- **Resultado:**
- **Notas:** La clave es que las recomendaciones sean **distintas** a las de Roberto. Si son idénticas, la priorización por formalización no está diferenciando

### Paso 6 — Recomendaciones para TALLER Oro (fallback)

- **Rol:** TALLER Oro (carlos.mendoza@pdt.org.ar / pdt2026)
- **URL de inicio:** `/taller`
- **Acción:**
  1. Cerrar sesión, login como Carlos Mendoza (TALLER Oro)
  2. Ir al dashboard `/taller`
  3. Verificar las "Capacitaciones recomendadas"
- **Esperado:** Carlos es ORO — tiene TODOS los documentos de formalización completados. Las colecciones recomendadas deberían venir de la query por procesos (si matchean) o del fallback (cualquier colección no completada). Si Carlos completó las 3 colecciones (tiene 3 certificados), la sección no debería aparecer
- **Resultado:**
- **Notas:** Si Carlos tiene las 3 colecciones completadas, no se esperan recomendaciones. Eso es correcto

### Paso 7 — ESTADO ve tab "Diagnóstico del sector"

- **Rol:** ESTADO (anabelen.torres@pdt.org.ar / pdt2026)
- **URL de inicio:** `/estado`
- **Acción:**
  1. Cerrar sesión, login como Ana Belén Torres (ESTADO)
  2. Verificar la barra de navegación (tabs)
- **Esperado:** En la barra de tabs del Header aparecen 3 items:
  - "Dashboard" (activo si estás en `/estado`)
  - **"Diagnóstico del sector"** (nuevo)
  - "Exportar"
- **Resultado:**
- **Notas:** Si solo hay 2 tabs (Dashboard y Exportar), el cambio en `header.tsx` no se deployó

### Paso 8 — Dashboard sectorial muestra datos agregados

- **Rol:** ESTADO (anabelen.torres@pdt.org.ar / pdt2026)
- **URL de inicio:** `/estado/sector`
- **Acción:**
  1. Click en el tab "Diagnóstico del sector" o ir a `/estado/sector`
  2. Verificar que la página carga y muestra datos
- **Esperado:**
  - Título: **"Diagnóstico del sector"**
  - Subtítulo: "Datos productivos agregados de los talleres registrados"
  - Nota: "Basado en el perfil productivo completado por cada taller. No refleja la situación de formalización." + si hay menos de 10 talleres: "Datos del piloto — N talleres."
  - **Capacidad instalada:** 2 cards grandes:
    - Capacidad total instalada (unidades/mes) — suma de `capacidadMensual` de todos los talleres
    - Promedio por taller (unidades/mes) — promedio de los que tienen `capacidadMensual > 0`
  - **Organización productiva:** barras proporcionales (En línea / Modular / Prenda completa)
  - **Gestión y registro:** barras (Software / Excel / Papel / Sin registro)
  - **Capacidad de escalar:** barras por tipo
  - **Experiencia promedio del equipo:** barras
  - El tab "Diagnóstico del sector" está activo en el Header
- **Resultado:**
- **Notas:** Si la página da error, puede ser que ningún taller completó el wizard (todos los groupBy devuelven vacío). Esto es aceptable — debería mostrar cards con 0 o barras vacías

### Paso 9 — Top 5 procesos y prendas con nombres legibles

- **Rol:** ESTADO (anabelen.torres@pdt.org.ar / pdt2026)
- **URL de inicio:** `/estado/sector`
- **Acción:**
  1. Scroll hasta las Cards "Top 5 procesos productivos" y "Top 5 tipos de prenda"
  2. Verificar el contenido
- **Esperado:**
  - **Top 5 procesos productivos:** lista con nombre legible ("Confección", "Corte", "Estampado", etc.) y cantidad de talleres. **NO muestra IDs crudos** (cuids tipo `clxyz123...`)
  - **Top 5 tipos de prenda:** lista con nombre legible ("Remera", "Jean", "Pantalón", etc.) y cantidad de talleres. **NO muestra IDs crudos**
  - Si hay menos de 5 procesos o prendas registrados, se muestran los que haya
- **Resultado:**
- **Notas:** Si aparecen IDs en lugar de nombres, la resolución de nombres no funciona (`nombresProcesos` / `nombresPrendas` queries fallaron)

### Paso 10 — Distribución por zona

- **Rol:** ESTADO (anabelen.torres@pdt.org.ar / pdt2026)
- **URL de inicio:** `/estado/sector`
- **Acción:**
  1. Scroll hasta la Card "Distribución por zona"
  2. Verificar el contenido
- **Esperado:**
  - Lista de zonas con cantidad de talleres por cada una
  - Si un taller no tiene zona, aparece "Sin zona"
  - Los nombres coinciden con las zonas del seed (ej: "Mataderos, CABA", "La Matanza, Buenos Aires", "Avellaneda, Buenos Aires")
- **Resultado:**
- **Notas:**

---

## Eje 3 — Casos borde

| # | Caso | Acción | Esperado | Resultado |
|---|------|--------|----------|-----------|
| 1 | Taller sin wizard completado | Login como taller que no completó el wizard → `/taller/perfil` | Sección "Perfil productivo" NO aparece | |
| 2 | Dashboard sin talleres con wizard | Si ningún taller completó el wizard → `/estado/sector` | Barras vacías o 0 en capacidad, página carga sin error | |
| 3 | Taller Oro sin colecciones pendientes | Login como Carlos (Oro, 3 certificados) → `/taller` | Sección "Capacitaciones recomendadas" no aparece o muestra vacío | |
| 4 | Paso 13 sin procesos/prendas | Completar wizard sin seleccionar procesos ni prendas → paso 13 | Cards "Procesos seleccionados" y "Prendas seleccionadas" no aparecen, sin error | |
| 5 | `hasSome` con array vacío | Taller sin procesos → recomendaciones | Query 2 (por procesos) no falla — Prisma maneja `hasSome: []` retornando vacío | |

---

## Eje 4 — Performance

| Verificación | Método | Resultado |
|-------------|--------|-----------|
| `/taller/perfil` con sección productiva carga en < 3s | DevTools → Network → recargar | |
| `/taller` (dashboard) con recomendaciones priorizadas carga en < 3s | DevTools → Network → recargar | |
| `/estado/sector` con 8 queries agregadas carga en < 3s | DevTools → Network → recargar | |
| Sin errores en consola del browser | DevTools → Console → revisar en todas las páginas | |
| Funciona en móvil (responsive) | DevTools → Toggle device toolbar → verificar dashboard sectorial y perfil productivo | |

---

## Eje 5 — Consistencia visual

| Verificación | Resultado | Notas |
|-------------|-----------|-------|
| Card "Perfil productivo": campos con bg-gray-50 rounded-lg p-3 | | |
| Labels de campos en text-gray-500 text-xs, valores en font-medium text-gray-800 | | |
| Texto al pie de Card productiva en text-xs text-gray-400 | | |
| Dashboard sectorial: barras proporcionales como las de "Distribución por nivel" en `/estado` | | |
| Cards de capacidad instalada: número en text-2xl font-bold text-brand-blue | | |
| Tab "Diagnóstico del sector" activo con bg-white text-brand-blue | | |
| Paso 13 del wizard: sin score ni barras de madurez, layout limpio | | |
| Tipografías consistentes (Overpass para títulos) | | |
| Textos en español argentino | | |

---

## Resumen de issues abiertos

| Issue | Tipo | Descripción | Prioridad sugerida |
|-------|------|-------------|-------------------|
| — | — | — | — |

---

## Notas del auditor

**Nota sobre el fix del puntaje:** Este es un bug de seguridad/integridad que existía desde la versión original del wizard. Antes, completar el wizard pisaba el puntaje de formalización con un score calculado localmente (60-80%). Ahora el wizard NO envía puntaje — el campo `puntaje` lo controla exclusivamente `aplicarNivel` en `nivel.ts`. Si después de completar el wizard el puntaje cambió, el bug sigue presente.

**Nota sobre recomendaciones:** La priorización es: (1) colecciones que matchean documentos de formalización pendientes, (2) colecciones que matchean procesos del taller, (3) fallback a cualquier colección no completada. Para verificar que funciona, comparar las recomendaciones entre Roberto (Bronce, casi todo pendiente), Graciela (Plata, solo ORO pendiente) y Carlos (Oro, todo completado). Si los 3 ven las mismas recomendaciones, la priorización no funciona.

**Nota sobre datos del piloto:** El dashboard sectorial muestra "Datos del piloto — N talleres" si hay menos de 10. Con el seed actual hay 3 talleres, así que las barras y tops son representativas pero limitados. Esto es correcto y esperado para la fase de piloto.

---

## Checklist de cierre

- [ ] 11 criterios de aceptación del spec verificados
- [ ] 10 pasos de navegación probados
- [ ] 5 casos borde probados
- [ ] Performance revisada en desktop y móvil
- [ ] Issues abiertos en GitHub con labels correctos
- [ ] Resultado global definido
- [ ] Documento commiteado a develop
