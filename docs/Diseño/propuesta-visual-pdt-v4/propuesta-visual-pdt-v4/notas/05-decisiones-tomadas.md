# Decisiones tomadas — Propuesta visual v4

**Fecha:** 2026-05-08
**Tomadas por:** Sergio (con análisis de Claude)

---

## Decisión 1 — Adoptar la propuesta IA como base

**Resultado:** opción (b) — B2B moderno estilo propuesta IA, NO opción (a) institucional sobrio gov.ar.

**Implica:**
- ✅ Header de 1 banda blanca con logo + nav + 2 CTAs
- ✅ Hero con título grande + palabra destacada + foto/imagen
- ✅ Cards con iconografía circular pastel (azul/verde/lila por audiencia)
- ✅ Tono cercano, primera persona ("Quiero formalizarme", "Sumate")
- ✅ Stats con ícono pastel + número + label
- ✅ Banner CTA azul brand antes del footer
- ✅ Footer multi-columna

**No se adopta:**
- ❌ Tono institucional sobrio sin imágenes
- ❌ "Trámites" en lugar de "transformación"
- ❌ Estilo gov.ar argentino

---

## Decisión 2 — Reemplazar testimonios por carrusel de novedades + cursos

**Resultado:** la sección "Confianza que se construye en comunidad" (que tenía 2 testimonios con foto+nombre+rol) se reemplaza por un **carrusel de novedades y cursos**.

**Razones:**
1. **Resuelve P0 de compliance OIT** — sin PII de personas reales
2. **Contenido vivo** — la academia ya existe (cursos reales: Seguridad e Higiene, Cálculo de Costos, Formalización y Registro del Taller)
3. **Sirve a las 3 audiencias:**
   - Taller: cursos para avanzar de nivel
   - Marca: novedades del sector textil
   - Estado: evidencia de capacitación
4. **Feed actualizable** vs testimonios fijos que envejecen
5. **Coherente con narrativa de evidencia** (Better Work usa este mismo patrón)

### Estructura del carrusel propuesta

```
┌──────────────────────────────────────────────────────────────────┐
│ Novedades y capacitaciones                                       │
│                                                                  │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐    │
│ │ [imagen]   │ │ [imagen]   │ │ [imagen]   │ │ [imagen]   │    │
│ │ CURSO      │ │ NOVEDAD    │ │ CURSO      │ │ NOVEDAD    │    │
│ │ Seguridad  │ │ Reducción  │ │ Cálculo    │ │ +120       │    │
│ │ e Higiene  │ │ del trabajo│ │ de Costos  │ │ empleos    │    │
│ │ en el      │ │ informal   │ │ y          │ │ formali-   │    │
│ │ Taller     │ │ en el      │ │ Presu-     │ │ zados en   │    │
│ │ Textil     │ │ Conurbano  │ │ puestos    │ │ 2026       │    │
│ │            │ │            │ │            │ │            │    │
│ │ 3h 30min   │ │ Abril 2026 │ │ 3h         │ │ Mayo 2026  │    │
│ └────────────┘ └────────────┘ └────────────┘ └────────────┘    │
│                                                                  │
│                                                  [Ver todo →]    │
└──────────────────────────────────────────────────────────────────┘
```

### Detalle de cada card del carrusel

**Card de curso:**
- Imagen ilustrativa o ícono grande
- Tag superior: "CURSO" en pastel azul
- Título del curso
- Duración (3h 30min, 4h, etc.)
- Hover/click → /aprender/[id]

**Card de novedad:**
- Imagen ilustrativa
- Tag superior: "NOVEDAD" en pastel verde o lila
- Título de la novedad
- Fecha (Abril 2026)
- Hover/click → /novedades/[id] (a crear)

### Modelo de datos

- **Cursos:** ya existen como `Coleccion` en Prisma. Se filtran las publicadas.
- **Novedades:** modelo nuevo (a definir con Gerardo). Campos sugeridos:
  - `titulo` (string)
  - `descripcion` (text)
  - `imagenUrl` (string)
  - `fecha` (datetime)
  - `tipo` (enum: NOTICIA, INDICADOR, CASO)
  - `publicado` (boolean)
  - `slug` (string)

### Datos en estado inicial

Para el lanzamiento, podemos arrancar con:
- 3 cursos reales de la academia (los que existen)
- 1-2 novedades institucionales: "Lanzamiento del piloto en Conurbano", "OIT y UNTREF firman convenio"
- Total: 4-5 cards mínimo en el carrusel

---

## Decisión 3 — Mantener stats numéricos con fuente

**Resultado:** se mantienen stats en la landing, **pero con fuente declarada**.

**Aplicación:**
- "31 talleres activos verificados" → "31 talleres activos verificados — datos a abril 2026"
- "+120 empleos formalizados" → "120 empleos formalizados desde enero 2025"
- Tooltip o nota al pie con metodología si es relevante

**Si los números actuales (31, 22, 4, +120) son aspiracionales y no reales:**
- Reemplazarlos por números reales del piloto (aunque sean más bajos: "10 talleres", "9 marcas")
- O por descripciones cualitativas: "Más de 30 talleres en proceso de formalización"

---

## Decisión 4 — Logo OIT + UNTREF: validar autorización antes de implementar

**Resultado:** se mantiene el sello "Una iniciativa de OIT y UNTREF" en footer y posiblemente en header.

**Pero antes de implementar:**
- Confirmar con contraparte OIT (DCOMM o equivalente) que el PDT está autorizado a usar el logo OIT
- Documentar la autorización
- Verificar que la formulación "iniciativa de OIT y UNTREF" describe correctamente la relación contractual

**Pendiente:** Sergio o Gerardo confirma con OIT.

---

## Decisión 5 — "Trabajo digno" se mantiene (audiencia argentina)

**Resultado:** se mantiene "Trabajo digno" en lugar de "Trabajo decente".

**Razón:** "Trabajo digno" es coloquial argentino y conecta mejor con la audiencia local (talleres, marcas) que el término técnico OIT "Trabajo decente".

**Riesgo bajo:** OIT usa "Trabajo decente" en documentos oficiales pero acepta variantes locales en comunicación pública.

---

## Decisiones pendientes (a definir con Gerardo)

| # | Decisión | Por qué importa |
|---|---|---|
| 1 | Header del app interno: ¿variante simplificada del header landing? ¿O sidebar lateral como ADMIN? | Impacta arquitectura de componentes |
| 2 | Aplicar color coding por rol (azul/verde/lila) en app interno | Impacta consistencia con diseño actual |
| 3 | Modelo Prisma para `Novedad` (carrusel) | Si lo aprobamos, Gerardo lo agrega al schema |
| 4 | Mobile: ¿se valida con usuarios o se diseña directo? | Impacta tiempo de implementación |
| 5 | Dark mode: ¿se incluye en v4 o se deja para v5? | Impacta paleta de tokens |
