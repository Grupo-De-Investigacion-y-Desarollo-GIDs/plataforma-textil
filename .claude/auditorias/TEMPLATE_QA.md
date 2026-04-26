# Template QA — Plataforma Digital Textil

**Version:** v3
**Auditor(es):** Sergio (tecnico) + [perfiles aplicables]
**Como reportar hallazgos:** usar el widget azul "Feedback" en el angulo inferior derecho de cada pagina. Un issue por hallazgo.

---

## Tipos de reporte en el widget

| Tipo | Cuando usarlo |
|------|---------------|
| **bug** | Algo que deberia funcionar y no funciona |
| **falta** | Algo que el spec prometia y no esta implementado |
| **mejora** | Funciona pero podria ser mejor (no bloquea) |
| **confusion** | La UI no es clara, no sabes que hacer |

**Regla de oro:** quedate en la pagina donde encontraste el problema antes de abrir el widget — captura la URL automaticamente.

> **Nota:** si los hallazgos no aparecen en GitHub Issues, verificar que `GITHUB_TOKEN` y `GITHUB_REPO` estan configurados en Vercel. Los hallazgos siempre quedan registrados en la DB aunque el token no este configurado — se pueden ver en `/admin` desde `LogActividad`.

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
| CONTENIDO | `sofia.martinez@pdt.org.ar` | `pdt2026` | `/contenido` |
| Sin login | — | — | `/` |

---

## Estructura de cada documento de QA (V3)

Cada spec implementado genera un archivo `QA_[nombre-spec].md` con esta estructura:

---

```markdown
# QA: [NOMBRE DEL SPEC]

**Spec:** `[nombre-spec].md`
**Commit de implementacion:** `[hash]`
**URL de prueba:** https://plataforma-textil-dev.vercel.app
**Fecha:** [fecha]
**Auditor(es):** Sergio (tecnico) + [perfiles aplicables]
**Incluye Eje 6 de validacion de dominio:** si / no
**Perfiles aplicables:** politologo, economista, sociologo, contador

---

## Contexto institucional

[Breve parrafo explicando que representa este spec en la realidad del sector textil argentino.]

---

## Objetivo de este QA

[Que se esta probando y por que importa para OIT/Estado/talleres]

---

## Como trabajar con este documento

1. Abri este archivo y la plataforma en paralelo
2. Identifica que items te corresponden segun tu perfil (columna Verificador)
3. Segui los pasos en orden — cada paso depende del anterior
4. Marca cada resultado con ok, bug o bloqueante
5. Si el resultado no es ok → abri el widget azul "Feedback" → describí que paso
6. Al terminar, completa el resultado global y commitea este archivo actualizado

---

## Resultado global

- [ ] Aprobado — todo funciona
- [ ] Aprobado con fixes — funciona pero hay bugs menores
- [ ] Rechazado — falta funcionalidad o hay bugs bloqueantes

**Decision:** [ cerrar v3 / fix inmediato / abrir item v4 ]
**Issues abiertos:** # (links a GitHub)

---

## Eje 1 — Funcionalidad

Verificar que cada criterio de aceptacion del spec esta implementado.

> **Nota:** Los items marcados **DEV** los verifica Gerardo desde el codigo o la terminal — no son verificables desde el browser. El auditor solo verifica los items marcados **QA**.

| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 1 | [criterio del spec] | QA / DEV | | # |

---

## Eje 2 — Navegabilidad

Pasos de navegacion a seguir en orden. Cada paso es una accion concreta.

### Paso N — [descripcion del paso]

- **Rol:** [que usuario usar]
- **URL de inicio:** [donde empezar]
- **Verificador:** QA / DEV
- **Accion:** [que hacer exactamente, paso a paso]
- **Esperado:** [que deberia verse o pasar]
- **Resultado:** [ ]
- **Notas:** [observaciones libres]

> Si el resultado no es ok → abrir widget en esa pagina → tipo [bug/falta] → describir que paso

---

## Eje 3 — Casos borde

Probar situaciones limite prescritas en el spec.

| # | Caso | Accion | Esperado | Verificador | Resultado |
|---|------|--------|----------|-------------|-----------|
| 1 | [caso borde] | [que hacer] | [que deberia pasar] | QA / DEV | |

---

## Eje 4 — Performance

| Verificacion | Metodo | Verificador | Resultado |
|-------------|--------|-------------|-----------|
| Pagina carga en menos de 3 segundos | DevTools > Network > recargar | QA | |
| Sin errores en consola del browser | DevTools > Console > revisar | QA | |
| Funciona en movil (responsive) | DevTools > Toggle device toolbar | QA | |

---

## Eje 5 — Consistencia visual

| Verificacion | Resultado | Notas |
|-------------|-----------|-------|
| Tipografias consistentes (Overpass para titulos) | | |
| Colores del design system (brand-blue, brand-red) | | |
| Estados vacios tienen mensaje descriptivo | | |
| Textos en espanol argentino (vos/tenes) | | |

---

## Eje 6 — Validacion de dominio (perfiles interdisciplinarios)

> Solo incluir si el spec tiene aspectos de dominio textil/institucional.
> Specs puramente tecnicos (rate limiting, cookies) ponen "Incluye Eje 6: no" y omiten esta seccion.

### Politologo — Relacion con el Estado

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | [pregunta especifica] | | |

### Economista — Incentivos y metricas

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | [pregunta especifica] | | |

### Sociologo — Lenguaje y accesibilidad

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | [pregunta especifica] | | |

### Contador — Flujos fiscales y operativos

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | [pregunta especifica] | | |

---

## Resumen de issues abiertos

| Issue | Tipo | Descripcion | Perfil que lo encontro | Prioridad |
|-------|------|-------------|------------------------|-----------|

---

## Notas de los auditores

**Sergio (tecnico):**
[observaciones tecnicas sobre implementacion, seguridad, performance]

**Perfiles interdisciplinarios:**
[observaciones sobre logica institucional, lenguaje, incentivos, contexto del sector]

---

## Checklist de cierre

- [ ] Todos los criterios de aceptacion del spec verificados
- [ ] Casos borde probados
- [ ] Performance revisada en desktop y movil
- [ ] Eje 6 completado por cada perfil aplicable (si aplica)
- [ ] Issues abiertos en GitHub con labels correctos
- [ ] Resultado global definido
- [ ] Documento commiteado a develop
```
