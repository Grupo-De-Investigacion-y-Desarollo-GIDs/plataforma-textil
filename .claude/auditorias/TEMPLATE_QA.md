# Template QA — Plataforma Digital Textil

**Versión:** v2
**Auditor:** Sergio
**Cómo reportar hallazgos:** usar el widget azul "Feedback" en el ángulo inferior derecho de cada página. Un issue por hallazgo.

---

## Tipos de reporte en el widget

| Tipo | Cuándo usarlo |
|------|---------------|
| **bug** | Algo que debería funcionar y no funciona |
| **falta** | Algo que el spec prometía y no está implementado |
| **mejora** | Funciona pero podría ser mejor (no bloquea) |
| **confusión** | La UI no es clara, no sabés qué hacer |

**Regla de oro:** quedate en la página donde encontraste el problema antes de abrir el widget — captura la URL automáticamente.

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
| CONTENIDO | `sofia.martinez@pdt.org.ar` | `pdt2026` | `/contenido` |
| Sin login | — | — | `/` |

---

## Estructura de cada documento de QA

Cada spec implementado genera un archivo `QA_[nombre-spec].md` con esta estructura:

---

```markdown
# QA: [NOMBRE DEL SPEC]

**Spec:** `[nombre-spec].md`
**Commit de implementación:** `[hash]`
**URL de prueba:** https://plataforma-textil.vercel.app
**Fecha:** [fecha]
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

| # | Criterio | Resultado | Issue |
|---|----------|-----------|-------|
| 1 | [criterio del spec] | ✅ / 🐛 / ❌ | # |

---

## Eje 2 — Navegabilidad

Pasos de navegación a seguir en orden. Cada paso es una acción concreta.

### Paso N — [descripción del paso]

- **Rol:** [qué usuario usar]
- **URL de inicio:** [dónde empezar]
- **Acción:** [qué hacer exactamente, paso a paso]
- **Esperado:** [qué debería verse o pasar]
- **Resultado:** [ ✅ / 🐛 / ❌ ]
- **Notas:** [observaciones libres]

> Si el resultado no es ✅ → abrir widget en esa página → tipo [bug/falta] → describir qué pasó

---

## Eje 3 — Casos borde

Probar situaciones límite prescritas en el spec.

| # | Caso | Acción | Esperado | Resultado |
|---|------|--------|----------|-----------|
| 1 | [caso borde] | [qué hacer] | [qué debería pasar] | ✅ / 🐛 / ❌ |

---

## Eje 4 — Performance

Verificar tiempos de carga y comportamiento bajo condiciones normales.

| Verificación | Método | Resultado |
|-------------|--------|-----------|
| Página carga en menos de 3 segundos | Abrir DevTools → Network → recargar | ✅ / 🐛 |
| Imágenes no bloquean el contenido | Scroll mientras carga | ✅ / 🐛 |
| Sin errores en consola del browser | DevTools → Console → revisar | ✅ / 🐛 |
| Funciona en móvil (responsive) | DevTools → Toggle device toolbar | ✅ / 🐛 |

---

## Eje 5 — Consistencia visual

Verificar que el diseño es coherente con el resto de la plataforma.

| Verificación | Resultado | Notas |
|-------------|-----------|-------|
| Tipografías consistentes (Overpass para títulos) | ✅ / 🐛 | |
| Colores del design system (brand-blue, brand-red) | ✅ / 🐛 | |
| Bordes y radios consistentes (rounded-xl) | ✅ / 🐛 | |
| Estados vacíos tienen mensaje descriptivo | ✅ / 🐛 | |
| Textos en español argentino (vos/tenés) | ✅ / 🐛 | |
| Sin texto en inglés visible al usuario | ✅ / 🐛 | |

---

## Resumen de issues abiertos

| Issue | Tipo | Descripción | Prioridad sugerida |
|-------|------|-------------|-------------------|
| #N | bug/falta/mejora | descripción breve | bloqueante / menor / v3 |

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
```
