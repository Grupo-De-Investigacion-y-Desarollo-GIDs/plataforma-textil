# Fase 2 — Benchmarking de referencias visuales

**Fecha:** 2026-05-08
**Objetivo:** mirar 3 referencias relevantes y robar 1 idea concreta de cada una. No quedarnos atados solo a la propuesta IA.

**Criterio de selección:** una referencia institucional OIT (Better Work), una gubernamental argentina (Mi Argentina), una B2B de calidad (Stripe Dashboard).

---

## Referencia 1 — Better Work (OIT + IFC, sector textil global)

**URL:** https://betterwork.org
**Por qué importa:** programa de OIT-IFC para mejorar condiciones laborales en industria textil global (Vietnam, Bangladesh, Camboya, etc.). **Es el paralelo institucional más cercano al PDT.**

### Lo que hace bien

- **Minimalismo institucional:** blanco + navy + azul accent. Sin pastels. Tono más serio y oficial.
- **NO usa hero clásico:** la home arranca con search + cards de artículos featured (con fecha + tag). Más cercano a un sitio de evidencia que a un landing de marketing.
- **Stats prominentes en bold gigante:** "22%" / "2,250 Factories" / "3.7 million Workers". El número es el héroe, el label es chico.
- **4 audiencias en nav** (workers / governments / brands / employers) — espejo del PDT (taller / estado / marca).
- **Footer multi-columna con selector de país** y enlaces a Global Offices.
- **Iconografía SVG simple** para audiencias — no pastels.

### Idea a robar #1: **Stats con número GIGANTE en bold y label chico**

En la propuesta IA actual, los stats tienen ícono pastel + número mediano + label. En Better Work, **el número ocupa el 70% del espacio visual**. Es más impactante y más institucional.

**Aplicación al PDT:**
```jsx
<div className="text-center">
  <div className="text-6xl font-bold text-brand-blue">31</div>
  <div className="text-sm text-gray-500 mt-2 uppercase tracking-wider">
    Talleres activos verificados
  </div>
</div>
```

### Idea a robar #2: **Sustituir testimonios por "casos de uso" o "evidencia"**

Better Work no usa testimonios con foto, usa **artículos/casos de uso con fecha + tag temático**. Esto:
- Es más coherente con narrativa OIT (evidence-based)
- **Resuelve el P0 de compliance** del review (no expone PII de usuarios reales)
- Da feed actualizable (vs testimonios fijos que se vuelven viejos)

**Aplicación al PDT:**
- Reemplazar la sección "Confianza que se construye en comunidad" (testimonios) por:
  - **"Casos de impacto"** o **"Evidencia"** con 2-3 cards de:
    - Foto institucional (no de individuo)
    - Título: "Reducción del trabajo informal en talleres del Conurbano"
    - Fecha: "Abril 2026"
    - Tag: "Formalización"
    - 2-3 líneas de descripción
- Esto no requiere consentimiento individual y es más fácil de mantener actualizado

### Idea a robar #3: **NO usar hero con imagen grande**

Decisión radical. Better Work va directo al contenido: search + cards. Para PDT, esto se traduce en:
- Hero más sobrio: título + subtítulo + 2 CTAs, **sin imagen** o con imagen muy chica al costado
- Más espacio para los 3 caminos por audiencia (Talleres / Marcas / Estado)

**Pero:** es una decisión polémica — la propuesta IA sí pone imagen grande, y eso ayuda a comunicar "humanos en talleres reales". Decisión a discutir.

---

## Referencia 2 — Mi Argentina (gov.ar)

**URL:** https://mi.argentina.gob.ar
**Por qué importa:** plataforma oficial multi-trámite del estado argentino. Tono institucional + audiencia mixta (ciudadanos, empresas, profesionales).

### Lo que hace bien

- **Identidad gov.ar consistente:** celeste argentino + blanco + tipografía oficial.
- **Breadcrumb jerárquico institucional:** Presidencia → Jefatura de Gabinete → Innovación → ICT → Mi Argentina. Demuestra "estamos respaldados por X".
- **"Mis X" como estructura central:** Mis trámites, Mis credenciales, Mis turnos, Mi perfil. **Primera persona dominante.**
- **Tiles de acceso por trámite** con ícono lineal + nombre — no por menú lineal.
- **Sin testimonios, sin imágenes humanas grandes:** acercamiento sobrio.
- **Acceso a app móvil** prominente desde web.

### Idea a robar #4: **"Mis X" como organización del menú del usuario logueado**

El PDT actual ya lo hace en parte (Mi Perfil, Mi Formalización), pero podría extenderse:
- TALLER: Mis pedidos, Mi formalización, Mis evaluaciones, Mi perfil, Mi academia
- MARCA: Mis pedidos, Mi directorio, Mi perfil, Mis cotizaciones
- ESTADO: Mi panel, Mis exportes, Mis configuraciones

**Beneficio:** propiedad/agencia del usuario. Es _su_ información, no la del sistema.

### Idea a robar #5: **Sello de "respaldo institucional" visible siempre**

Mi Argentina muestra "Presidencia de la Nación" en el header de forma sutil pero permanente. Para PDT:
- Footer: "Una iniciativa de OIT y UNTREF" ✓ ya está en propuesta IA
- **Pero también en header:** un sello chiquito "OIT + UNTREF" en la barra superior, no solo en hero/footer
- Aporta credibilidad institucional en cada página, no solo en landing

### Idea a robar #6: **Tono institucional sobrio, sin marketing de SaaS**

Diferencias con la propuesta IA:
| Marketing de SaaS (IA) | Institucional sobrio (gov.ar) |
|---|---|
| "Sumate a la transformación" | "Iniciá tu trámite" |
| "Por qué elegir PDT?" | "Cómo funciona" |
| "Matching inteligente" | "Conectamos talleres con marcas" |

**Decisión política:** ¿el PDT se posiciona como SaaS B2B o como plataforma institucional gov-style? La propuesta IA pendula al primero. Better Work y Mi Argentina pendulan al segundo. Para una iniciativa OIT, el segundo tono es más coherente.

---

## Referencia 3 — Stripe Dashboard

**URL:** https://stripe.com (dashboard) + capturas conocidas
**Por qué importa:** referencia B2B mundial de calidad de UX en dashboards. Aplica a las pantallas internas del PDT.

### Lo que hace bien

- **Tipografía sin afectación:** Inter (system UI), tamaños precisos, alta legibilidad.
- **KPI cards con cambio % vs período anterior:** "$48,392 ↑ 12% vs last month" — el número solo no informa, el delta sí.
- **Charts minimalistas:** líneas finas, una sola serie por gráfico, colores neutros.
- **Sidebar lateral compacto:** ítems con ícono + label, secciones colapsables.
- **Empty states ilustrados con CTA:** ilustración SVG + título + 1-2 líneas + botón.
- **Filtros como pills:** "All / Active / Pending / Closed" en listados.
- **Search global** (Cmd+K) accesible desde cualquier página.
- **Color secundario muy reservado:** azul Stripe casi solo para CTAs primarios. Resto en grayscale.

### Idea a robar #7: **KPI cards con delta % vs período anterior**

Aplicación a Dashboard ESTADO:
```
Antes:                       Después:
─────────────────────       ─────────────────────
54                          54  ↑ 12% vs abril
PEDIDOS EN EJECUCION         PEDIDOS EN EJECUCION
```

El delta da contexto: ¿está creciendo o cayendo el sector?
También aplica a Dashboard ADMIN (funnel de adopción), MARCA (cotizaciones), TALLER (no tan directo, pero sí en stats de perfil).

### Idea a robar #8: **Empty states bien resueltos**

El PDT actual no tiene empty states bien diseñados. Por ejemplo, cuando un taller recién registrado no tiene pedidos:
- Hoy: tabla vacía o "No hay datos"
- Stripe-style:
  - Ilustración SVG simple (caja vacía, etc.)
  - Título: "Aún no tenés pedidos asignados"
  - Subtítulo: "Te avisaremos por email cuando una marca te envíe una cotización"
  - CTA: "Completá tu perfil para que las marcas te encuentren →"

Esto convierte un "no pasa nada" en una oportunidad de acción.

### Idea a robar #9: **Filtros como pills en listados**

Hoy en `/admin/talleres` o `/marca/pedidos` los filtros son selects o forms. Stripe usa pills horizontales:
```
[Todos] [Activos] [Pendientes] [Inactivos]   ← clickeables, una sola fila
```
- Más fácil de escanear
- Estado actual visible (la pill activa está destacada)
- Mobile-friendly

---

## Síntesis: 9 ideas para la propuesta v4

| # | Idea | Origen | Aplica a |
|---|---|---|---|
| 1 | Stats con número gigante + label chico | Better Work | Landing + dashboards |
| 2 | Sustituir testimonios por "casos de impacto" / evidencia | Better Work | Landing |
| 3 | (Polémica) NO usar hero con imagen grande | Better Work | Landing |
| 4 | "Mis X" como estructura del menú usuario | Mi Argentina | App interno |
| 5 | Sello "OIT + UNTREF" en header (no solo footer) | Mi Argentina | Toda la app |
| 6 | Tono institucional sobrio, sin SaaS marketing | Mi Argentina | Microcopy general |
| 7 | KPI cards con delta % vs período anterior | Stripe | Dashboards |
| 8 | Empty states ilustrados con CTA | Stripe | App interno |
| 9 | Filtros como pills en listados | Stripe | App interno |

---

## Decisiones agregadas a la propuesta v4

Estas ideas se suman al cuadro de la sección 7 de `03-auditoria-ux-referencia.md`:

### ✅ Adoptar tal cual (nuevo)
- KPI cards con delta % (idea #7)
- Empty states ilustrados (idea #8)
- Filtros como pills (idea #9)
- "Mis X" en menú usuario (idea #4)

### ⚙️ Adoptar con ajustes (nuevo)
- Stats con número gigante en bold (idea #1) — combinar con los pastels de la propuesta IA: ícono pastel chico + número grande
- Sello OIT+UNTREF en header (idea #5)

### ⏳ Validar con usuarios (nuevo)
- Tono institucional vs SaaS (idea #6) — preguntar a 3 usuarios del piloto qué tono prefieren
- Hero con o sin imagen grande (idea #3) — ¿la imagen ayuda o distrae?

### 🚨 Cambio importante (nuevo)
- **Reemplazar testimonios por "casos de impacto"/evidencia** (idea #2). Esto resuelve el P0 de compliance (no expone PII) Y aporta valor institucional.

---

## Lo que NO sirve robar de estas referencias

- **Better Work:** la home sin hero clásico es radical, podría no encajar con audiencia argentina menos acostumbrada a sitios institucionales globales.
- **Mi Argentina:** la estética celeste-blanco no aplica (PDT tiene su brand-blue).
- **Stripe:** sidebar lateral fino + Cmd+K son patrones de power users — la audiencia del PDT (talleres) probablemente no los usa.

---

## Pendientes Fase 3

Ahora que tenemos el material:
- Auditoría UX (`03-auditoria-ux-referencia.md`) — 5 problemas críticos detectados
- Benchmarking (`04-benchmarking.md`) — 9 ideas extraídas

**Fase 3 (principios):** definir en 3-5 frases qué tiene que comunicar el rediseño v4. Esto es la "regla del pulgar" para resolver dudas de microcopy y estilo cuando el spec no alcance.

Tentativamente:
1. **Institucional, no SaaS** — el lenguaje y el tono se acercan a gov.ar más que a Stripe
2. **Evidencia, no marketing** — los números tienen fuente; los casos reemplazan a los testimonios
3. **Primera persona del usuario** — "Mis pedidos", "Mi formalización"
4. **Color con significado** — verde=hecho, naranja=pendiente, rojo=problema, azul=acción
5. **Respiración antes que densidad** — preferir whitespace a meter más cards
