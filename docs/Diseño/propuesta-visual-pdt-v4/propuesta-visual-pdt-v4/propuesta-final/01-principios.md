# Principios visuales de PDT v4

> 5 frases que resuelven las dudas que el spec no cubra. Si te enfrentás a una decisión visual no especificada, releé esto.

---

## 1. Institucional con cercanía, no SaaS B2B

PDT es una iniciativa de OIT y UNTREF. La voz visual debe sentirse **respaldada por instituciones serias** sin caer en frialdad gov.ar.

- ✅ Tono: cercano, primera persona ("Quiero formalizarme", "Mi panel"), pero con respaldo institucional visible
- ❌ Evitar: lenguaje SaaS de marketing ("Sumate al cambio", "Matching inteligente", "Por qué elegirnos")
- ❌ Evitar: estética demasiado oficial / fría / vacía

---

## 2. Evidencia antes que marketing

Los números, citas, ejemplos y testimonios deben ser **reales y verificables**. Si no hay datos reales, mostrar la realidad (vacío bien diseñado) en vez de inventar.

- ✅ "10 talleres activos verificados — datos a abril 2026"
- ❌ "+120 empleos formalizados" sin fuente
- ❌ Testimonios fabricados con foto + nombre + rol (también es violación P0 de compliance OIT)

---

## 3. Color con significado, no con decoración

Cada color tiene un rol semántico fijo. No usar colores random para variar visualmente.

| Color | Significado | Uso |
|---|---|---|
| Brand Blue `#1E2DBE` | Identidad PDT, acción primaria | CTAs primarios, headings, links activos |
| Terracotta `#C2410C` | Acento editorial, conexión textil | Pills institucionales, accent text, botones secundarios |
| Verde `#22C55E` / Pastel green | Éxito, completado | Badges "Completado", "Por entregar" |
| Amarillo `#F59E0B` / Pastel yellow | Pendiente, advertencia | Badges "Pendiente", banner de ambiente piloto |
| Rojo `#EF4444` / Pastel red | Error, problema, denuncia | Mensajes de error, badges destructivos |
| Lila / Pastel purple | Análisis, datos sectoriales | Solo en vistas ESTADO o reportes (NO en landing) |

**Color por audiencia (en app interno):** Talleres = azul brand · Marcas = verde · Estado = lila.

---

## 4. Primera persona del usuario

Todo el menú y los listados se nombran desde el punto de vista del usuario logueado.

- ✅ "Mis pedidos", "Mi formalización", "Mi perfil", "Mis evaluaciones"
- ❌ "Pedidos", "Formalización", "Perfil"
- ✅ "Hola, Taller La Aguja" como saludo de dashboard
- ❌ "Bienvenido, Taller La Aguja" (más distante, gov.ar style)

Esto comunica **propiedad/agencia** sobre la información: es del usuario, no del sistema.

---

## 5. Respiración antes que densidad

Cuando dudes entre meter más cards/info o dejar whitespace, **elegí whitespace**. Excepción: dashboards profesionales (ESTADO, ADMIN) donde sí cabe densidad alta porque la audiencia es power user.

- ✅ Padding generoso en cards (`p-6` o `p-8`)
- ✅ Margen vertical entre secciones (`py-16`, `py-20`)
- ✅ Listas con espacio entre items (`space-y-4` mín.)
- ❌ Apilar 5 stat cards seguidas sin jerarquía
- ❌ Cards homogéneas que compiten por atención

**Excepción justificada:** ESTADO y ADMIN pueden tener densidad mayor porque son herramientas, no comunicación.

---

## Cuando el spec no alcance

Si te encontrás con una decisión visual no especificada:

1. ¿La opción A respeta los 5 principios? Sí → usá A.
2. ¿La opción B también los respeta? Si las dos respetan, **la más sobria gana**.
3. ¿Ninguna respeta los principios? **Pregunta a Sergio**, no improvises.

Esto vale para microcopy, colores, espaciado, decisiones de layout menores, naming de componentes, etc.
