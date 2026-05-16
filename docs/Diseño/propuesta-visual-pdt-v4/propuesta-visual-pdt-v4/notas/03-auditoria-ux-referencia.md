# Auditoría UX — Propuesta visual landing rediseñada (IA)

**Fecha:** 2026-05-08
**Material:** `benchmark/landing-pdt-referencia.png`
**Origen:** propuesta generada por IA, aportada por Sergio
**Objetivo:** filtrar errores antes de pasar a Gerardo y de invertir tiempo en test con usuarios reales

---

## Resumen ejecutivo

La propuesta es **mayoritariamente sólida** — resuelve los problemas más graves del estado actual (header de 4 bandas, color sin sistema, footer ausente, jerarquía débil). Pero tiene **5 problemas que NO se pueden ignorar** antes de adoptarla:

1. 🔴 **Compliance OIT — testimonios con PII expuestos** (P0)
2. 🟠 Error ortográfico visible: "Trasabilidad" → es "Trazabilidad"
3. 🟠 Header no escala al app interno (sin variante para páginas internas)
4. 🟠 Imagen, testimonios y stats probablemente ficticios (riesgo institucional)
5. 🟡 Sin pensar en mobile, vacíos, errores ni dark mode

**Veredicto:** adoptable como base, con ajustes obligatorios antes de mostrar a Gerardo. El estilo visual y los componentes son aprovechables; el contenido específico (testimonios, stats, fecha) necesita revisión humana.

---

## 1. Accesibilidad (WCAG 2.2)

| # | Hallazgo | Severidad | Acción |
|---|---|---|---|
| 1.1 | Texto azul brand sobre fondo azul pastel claro de la card flotante "Producción transparente y responsable" → contraste estimado < 4.5:1 (WCAG AA fail) | 🟠 | Oscurecer el texto a `#1A1A2E` o aclarar más el fondo |
| 1.2 | Subtítulos grises de stats ("Talleres activos verificados") sobre blanco → verificar contraste (gray-500 sobre blanco da 4.6:1, en el límite) | 🟡 | Subir a gray-600 (`#4B5563`) → 7:1 OK |
| 1.3 | Tap targets de links "Quiero formalizarme →" en cards = link inline, probablemente <44px de alto | 🟠 | Convertir en botón con padding mín. 12px vertical |
| 1.4 | Iconos sociales del footer (LinkedIn/IG/YouTube) sin label visible | 🟡 | `aria-label="LinkedIn"`, etc. |
| 1.5 | Color como diferenciador entre cards Talleres/Marcas/Estado (azul/verde/lila) | ✅ OK | Cada card tiene también título e ícono distintos — no se depende solo del color |
| 1.6 | Iconografía de checkmark en card flotante: verde sobre azul muy claro | 🟡 | Verificar contraste — puede pasar si el verde es lo bastante saturado |
| 1.7 | Estados de focus visibles | ❓ | No evaluable desde imagen estática — exigir en implementación |
| 1.8 | Tamaño de fuente del body | ✅ OK | Parece 16px+ |
| 1.9 | Texto del título de stat (número grande "31") no comunica nada solo — el label "Talleres activos" es chico | 🟡 | Subir tamaño del label (text-base mín.) |

---

## 2. Jerarquía visual y escaneo

| # | Hallazgo | Acción |
|---|---|---|
| 2.1 | **Z-pattern del hero bien resuelto:** logo→nav→CTAs (top), título→imagen (medio), CTAs primarios (acción) | ✅ Adoptar |
| 2.2 | **Card flotante "Producción transparente y responsable" compite con los CTAs primarios** del hero | 🟠 Reducir el peso visual de la card (más sutil), o sacarla y dejar la imagen sola |
| 2.3 | **F-pattern al scrollear:** cada sección con H2 a la izquierda y elementos abajo. OK. | ✅ Adoptar |
| 2.4 | Buena respiración entre secciones, ninguna sobrecargada | ✅ Adoptar |
| 2.5 | "Para cada actor del ecosistema" es la sección más importante (los 3 caminos) — bien posicionada arriba | ✅ Adoptar |
| 2.6 | Sección "¿Por qué elegir PDT?" duplica info de "Para cada actor" | 🟡 Considerar eliminar o fusionar |
| 2.7 | Nav del header con 5 items (¿Cómo funciona?/Beneficios/Impacto/Recursos/Sobre nosotros) — "Beneficios" e "Impacto" suenan muy parecido | 🟡 Consolidar en menos items o renombrar |

---

## 3. Consistencia con el app interno

**Este es el punto más débil de la propuesta.** La IA generó solo la landing pública, pero el rediseño tiene que escalar a:
- Dashboards (TALLER, MARCA, ESTADO, ADMIN)
- Listados (pedidos, talleres, observaciones)
- Detalles (pedido, taller, perfil)
- Forms (registro, login, formalización)
- Estados (vacío, error, loading)

| Elemento | Landing (referencia) | App interno (actual) | Conflicto |
|---|---|---|---|
| **Header** | 1 banda blanca + nav 5 items + 2 CTAs "Soy X" | 4 bandas + tabs por rol + user info | No escala — necesita variante app |
| **Logo + título** | Logo PDT + título 2 líneas a la izquierda | Logo + título + rol + nombre | Adoptable con ajustes |
| **CTAs principales** | "Soy taller" / "Soy marca" | Acciones por rol (Crear pedido, Buscar taller, etc.) | Distintos — coherente con el contexto |
| **Tipografía** | H1 grande + body gris oscuro | H1 mediano + body azul brand | Adoptable: cambiar body a gris oscuro |
| **Iconografía pastel** | Sí (azul/verde/lila) | No (íconos planos) | Adoptable directamente |
| **Footer** | 4 columnas + redes + copyright | No existe | Adoptar |
| **Card style** | rounded-xl + sombra sutil + padding generoso | rounded-xl + sombra estándar | Adoptable con ajustes |
| **Color coding por rol** | Talleres=azul, Marcas=verde, Estado=lila | Tabs azules para todos | Adoptar el coding por rol |

**Acción crítica:** Gerardo necesita **dos variantes documentadas del header** — `<HeaderPublic>` (esta) y `<HeaderApp>` (nueva, aplicando los principios). NO copiar el header de la landing al app interno tal cual.

---

## 4. Microcopy y mensaje

| # | Texto en la imagen | Problema | Sugerencia |
|---|---|---|---|
| 4.1 | "Formalizá, conectá y **trazá** la producción..." | "trazá" no es palabra obvia para usuarios primerizos | Mover el highlight a "Formalizá" (la palabra central). Mantener "trazá" en el discurso pero sin destacarla. |
| 4.2 | "Conocer más →" (card Estado) | Vago, no comunica acción | "Acceder a indicadores" o "Ver datos del sector" |
| 4.3 | "Buscar proveedores" (card Marcas) | OK | ✅ |
| 4.4 | "Quiero formalizarme →" (card Talleres) | OK, primera persona | ✅ |
| 4.5 | "Matching inteligente" (paso 2 de Cómo funciona) | Suena marketing/B2B | "Recomendaciones según tu perfil" o "Conexión con marcas afines" |
| 4.6 | "Por qué elegir Plataforma Digital Textil?" | Suena ecommerce, no institucional | "Cómo aporta valor" o "Qué ofrece la plataforma" — o quitar la sección |
| 4.7 | "**Trasabilidad**" (en card flotante) | **ERROR ORTOGRÁFICO** | "Trazabilidad" |
| 4.8 | "+120 Empleos formalizados" | "+" ambiguo (¿desde cuándo? ¿meta o realizado?) | "120 empleos formalizados — datos a abril 2026" |
| 4.9 | "Trabajo digno" | Coloquial; OIT usa "Trabajo decente" oficialmente | Decisión política: dejar "digno" si es decisión consciente para audiencia local; "decente" para precisión institucional |
| 4.10 | "Sumate a la transformación del sector textil" | Bien — call to action institucional | ✅ |
| 4.11 | "© 2024 Plataforma Digital Textil" (footer) | Estamos en 2026 — fecha desactualizada | Usar año dinámico: `{new Date().getFullYear()}` |

---

## 5. Compliance OIT

(Resumen del review que hice con la skill `oit-compliance-pdt`. Detalle completo en chat.)

| # | Hallazgo | Severidad |
|---|---|---|
| 5.1 | **Testimonios con foto + nombre + rol** sin consentimiento documentado expuestos en endpoint Public — viola H1 (Confidential en Public) e IGDS 457 §11 | 🔴 P0 |
| 5.2 | **Stats numéricos** sin fuente ni método de cálculo declarados — IGDS 457 §9 (precisión), ECC §4.3.1 (transparencia) | 🟠 P1 |
| 5.3 | **Logo OIT** y leyenda "iniciativa de OIT y UNTREF" sin verificar autorización — relacionado con P1.6 del mapeo (sin aprobación AASC/ITGC) | 🟠 P1 |
| 5.4 | **"Trabajo digno"** vs terminología técnica OIT "Trabajo decente" — no es bloqueante | 🟡 P2 |
| 5.5 | **Footer cita "Política de privacidad"** — debe existir documento real al día (cubre parcialmente P0.3 del mapeo) | 🟡 P2 |

**Acción mínima antes de publicar:**
- Quitar testimonios o reemplazar por testimonios institucionales (cita OIT/UNTREF como organización, sin foto/nombre individual)
- Agregar fuente a stats o reemplazar por dato cualitativo
- Confirmar autorización de logo con DCOMM
- Asegurar `/privacidad` existe y está actualizado

---

## 6. Riesgos / cosas que la IA decoró pero no resolvió

| # | Riesgo | Cómo se nota |
|---|---|---|
| 6.1 | **Texto generado sin proofreading** | "Trasabilidad" mal escrita en la card más visible |
| 6.2 | **Foto del hero probablemente stock o generada** | Para una iniciativa OIT que valora "verificación", una foto real del piloto sería más coherente |
| 6.3 | **Testimonios probablemente ficticios** | Riesgo institucional + compliance (P0) |
| 6.4 | **Stats probablemente inventados o aspiracionales** | "+120 empleos formalizados" no tiene fuente |
| 6.5 | **Año desactualizado** | "© 2024" cuando estamos en 2026 |
| 6.6 | **Items del nav sin verificar que existan** | "Beneficios", "Impacto", "Recursos" — ¿hay páginas reales detrás? Si no, son links rotos |
| 6.7 | **Sin pensar en mobile** | La propuesta es solo desktop, no muestra cómo se acomoda nav, hero, cards en 375px |
| 6.8 | **Sin estados** vacío / error / loading / onboarding | El app interno los necesita en cada página |
| 6.9 | **Sin dark mode** | Decisión válida quitarlo, pero hay que decidirlo conscientemente |
| 6.10 | **No define cómo aplicar el sistema al app interno** | La propuesta es solo landing pública — falta el 90% del producto |

---

## 7. Cuadro de decisiones

### ✅ Adoptar tal cual (Nivel 1+2 del rediseño)

| Elemento | Por qué |
|---|---|
| Paleta brand-blue mantenida | Identidad ya establecida |
| Pastels nuevos (azul/verde/lila) | Color coding semántico claro |
| Body text gris oscuro en vez de azul brand | Mejor contraste y jerarquía |
| Iconografía circular pastel | Replicable en cards de stats |
| Cards con sombra sutil + padding generoso | Mejor que el actual |
| Footer multi-columna | El actual no tiene |
| CTA banner azul antes del footer | Patrón aprovechable también para "Próxima acción" en dashboards |
| Estructura Z-pattern del hero | Buena base para landing |

### ⚙️ Adoptar con ajustes (Nivel 1+2+3)

| Elemento | Ajuste necesario |
|---|---|
| Header de 1 banda | Definir variante específica para app interno (con tabs por rol y user info) |
| Tipografía H1 grande | OK para landing, reducir 1 nivel para páginas internas |
| Cards de roles (Para cada actor) | OK para landing, no aplica directamente al app interno |
| Microcopy del hero | Reescribir 4-5 frases (ver sección 4) |
| Card flotante hero | Reducir peso visual o quitar |
| Stats numéricos | Agregar fuente y método de cálculo |

### ⏳ Validar con usuarios antes de adoptar

| Elemento | Pregunta a validar |
|---|---|
| Color coding Talleres=azul / Marcas=verde / Estado=lila | ¿Los usuarios asocian esos colores al rol o se confunden? |
| "Trabajo digno" vs "Trabajo decente" | Decisión política — preguntar a contraparte OIT |
| 5 items del nav (Cómo funciona / Beneficios / Impacto / Recursos / Sobre nosotros) | ¿Son los items que el usuario busca o son ruido? |
| "Quiero formalizarme" como CTA primario para taller | ¿El taller se identifica con ese verbo o prefiere "Conseguí clientes"? |

### ❌ NO adoptar / requiere reemplazo

| Elemento | Por qué |
|---|---|
| Testimonios con foto + nombre + rol | Compliance OIT P0 — necesita consentimiento o reemplazarse |
| Foto stock del hero | Buscar/producir foto real del piloto |
| Stats sin fuente | Agregar fuente o reemplazar |
| "© 2024" hardcoded | Año dinámico |
| "Trasabilidad" mal escrita | Corregir antes de mostrar a nadie |
| "Matching inteligente" | Suena marketing-y, reescribir |

---

## 8. Próximos pasos

1. **Hoy:** revisar este doc con Sergio, decidir qué se adopta / ajusta / valida / descarta
2. **Esta semana:** preparar la versión "filtrada" de la propuesta para Gerardo (sin los problemas P0/P1 corregidos)
3. **Antes de implementar:** test rápido con 3-5 usuarios del piloto (Capa 2) sobre los 4 puntos de "Validar con usuarios"
4. **Implementación V4 (Gerardo):** aplicar Nivel 1+2 (tokens + componentes) en orden
   1. Tokens nuevos en `globals.css`
   2. Componentes Button, Card, Badge actualizados
   3. Header rediseñado (variante app)
   4. Footer nuevo
   5. Aplicar a páginas en orden de prioridad: Dashboard TALLER → Dashboard MARCA → Dashboards ESTADO/ADMIN

---

## 9. Lo que falta cubrir (Fase 2-4)

- **Fase 2 (benchmarking):** mirar 2-3 referencias adicionales (gov.ar, Mi Argentina, plataformas OIT internacionales) para no quedar atado a una sola fuente IA
- **Fase 3 (principios):** decidir qué tiene que comunicar el rediseño en 3-5 frases (institucional vs cercano, denso vs respirado, etc.)
- **Fase 4 (propuesta para Gerardo):** documento final con tokens + componentes + ejemplos antes/después + plan de implementación
