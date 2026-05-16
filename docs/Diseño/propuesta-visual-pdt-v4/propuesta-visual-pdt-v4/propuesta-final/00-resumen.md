# Propuesta visual PDT — v4

**Para:** Gerardo
**De:** Sergio (con análisis y mockup asistidos por Claude)
**Fecha:** 2026-05-08
**Estado del proyecto:** V3 cerrado. Inputs para iniciar V4.

---

## Qué es esto

Una propuesta de **rediseño visual** para PDT v4. **No** es un rediseño funcional ni de arquitectura — la lógica, el modelo de datos, los flujos y los roles se mantienen. Lo que cambia es la capa visual: header, tipografía, paleta extendida, iconografía, componentes UI, footer y la landing pública.

El alcance se mantiene en **Nivel 1+2+3**: cambios de tokens (un archivo), cambios en componentes compartidos (1 archivo cada uno) y cambios estructurales acotados (header, footer). NO se restructuran páginas individuales — los layouts existentes absorben los cambios automáticamente al actualizarse los tokens.

---

## Por qué

Auditoría visual y UX del estado actual (16 capturas, 5 documentos de análisis) detectó:

1. **Header de 4 bandas verticales** (~150px) que come espacio y compite por atención
2. **Dos design systems coexistiendo** en una misma plataforma (TALLER/MARCA/ESTADO con tabs vs ADMIN con sidebar)
3. **Color sin sistema semántico** — el rojo significa "negativo" en una pantalla y solo "acento" en otra
4. **Microcopy con códigos crípticos** filtrándose al usuario (`MO-2026-A7221043 OM-2026-B858D5C9 E2E-Test-...`)
5. **Logo + título redundantes** ("PDT" + "Plataforma Digital Textil" lado a lado)
6. **Sin footer real** en toda la app
7. **Empty states débiles** sin orientar la próxima acción
8. **Tres donuts de progreso** con porcentajes diferentes que confunden al taller (14%, 89%, 14%)

---

## Decisiones tomadas

| # | Decisión | Estado |
|---|---|---|
| 1 | Adoptar la propuesta IA como base (B2B moderno) | ✅ confirmado |
| 2 | Reemplazar testimonios por carrusel de novedades + cursos (resuelve P0 compliance OIT) | ✅ confirmado |
| 3 | Stats numéricos con fuente declarada ("Datos a abril 2026") | ✅ confirmado |
| 4 | "Trabajo digno" se mantiene (audiencia argentina) | ✅ confirmado |
| 5 | Color de acento nuevo: terracotta `#C2410C` | ✅ confirmado |
| 6 | Tipografía Source Serif 4 para titulares + Inter para body + Overpass para UI | ✅ confirmado |
| 7 | Set de iconos custom (12 iconos en SVG) | ✅ confirmado |
| 8 | Estado e instituciones fuera del landing público (acceso por convenio) | ✅ confirmado |
| 9 | Logo: **PDT-círculo (PNG)** — descartar SVG custom | ✅ confirmado |
| 10 | Header del app interno: variante simplificada de 2 bandas | ✅ confirmado |
| 11 | Modelo Prisma `Novedad` (carrusel) | ⏳ Gerardo decide schema |
| 12 | Mobile: implementar con criterio responsive estándar; validar con usuarios después | ⏳ pendiente |
| 13 | Dark mode: NO incluir en v4 (deja para v5) | ✅ confirmado |
| 14 | **Verificar autorización OIT del logo y wording "iniciativa de OIT y UNTREF" con DCOMM** | 🔔 RECORDATORIO ABIERTO — ver final del doc |

---

## Estructura de la propuesta

| Archivo | Para qué sirve |
|---|---|
| `00-resumen.md` (este) | Visión general, decisiones, próximos pasos |
| `01-principios.md` | 5 frases que rigen las dudas que el spec no cubra |
| `02-tokens.md` | Paleta + tipografía + sombras + radios para `globals.css` |
| `03-componentes.md` | Button, Card, Badge, Input, Empty State refrescados con código |
| `04-header-y-layout.md` | 2 variantes del header (público + app) + footer nuevo |
| `05-aplicacion-pantallas.md` | Cómo aplicar los cambios a Dashboard, Pedidos, Formalización, etc. |
| `06-plan-implementacion.md` | Orden sugerido para Gerardo + criterios de aceptación |

**Material de soporte** (en `~/Documents/propuesta-visual-pdt-v4/`):
- `mockup/mockup-v6.html` — visualización navegable de las 3 pantallas clave
- `mockup/mockup-v6-preview.png` — captura larga para compartir
- `mockup/assets/` — imágenes generadas con IA (hero + cards del carrusel + logo)
- `notas/` — análisis y benchmarking que originaron las decisiones

---

## Próximos pasos para Gerardo

1. **Revisar mockup-v6.html** en browser (no en GitHub)
2. **Decidir logo** entre las 2 opciones de la sección Identidad
3. **Revisar `02-tokens.md`** y aplicar a `src/app/globals.css`
4. **Crear branch** `feature/v4-visual-refresh` desde `develop`
5. **Implementar en orden** según `06-plan-implementacion.md`
6. **Antes de mergear:** chequear con Sergio que la implementación coincide con el mockup en cuanto a tokens, componentes y layout

---

## Próximos pasos para Sergio

1. **Validar autorización logo OIT** con la contraparte (DCOMM o equivalente) — ver recordatorio abajo
2. **Generar versiones en variantes del logo PDT-círculo** elegido (favicon, og:image, social media)
3. **Test rápido con piloto** (3-5 usuarios) sobre los 4 puntos del cuadro de Validación de `notas/03-auditoria-ux-referencia.md` sección 7

**No se hace en V4 (postponed):**
- Imagen para card "Cálculo de Costos y Presupuestos" → la card va sin imagen, con placeholder pastel + ícono
- Política de privacidad actualizada → queda como pendiente paralelo (no bloquea el rediseño visual, pero sí el lanzamiento público)

---

## Resumen ejecutivo en una frase

**La V4 toma la propuesta IA como base, le aplica filtro UX y compliance OIT, le agrega un set de tokens semánticos coherentes y le da personalidad institucional sin romper la arquitectura del app.**

---

## 🔔 RECORDATORIO IMPORTANTE — autorización OIT

Antes de poner la V4 en producción pública, Sergio debe **confirmar con la contraparte OIT (DCOMM o equivalente) la autorización formal de uso del logo OIT y del wording "Una iniciativa de OIT y UNTREF"** que aparece en:

- Header del landing público
- Footer de toda la app
- Página de identidad visual

**Por qué importa:**
- IGDS 333 §13 (AASC) exige que toda nueva aplicación esté registrada en el inventario AASC
- El mapeo OIT del PDT (`~/Documents/OIT-compliance/mapeo-PDT.md` P1.6) marca esto como gap formal abierto
- DCOMM gestiona el branding institucional y las reglas de uso del logo

**Acción concreta:**
- [ ] Confirmar con contraparte OIT que el PDT está autorizado a usar el logo
- [ ] Documentar la autorización por escrito (email del contacto OIT confirmando)
- [ ] Verificar que la formulación "iniciativa de OIT y UNTREF" describe correctamente la relación contractual
- [ ] Si no hay autorización formal: usar solo "UNTREF" hasta que se gestione, y dejar el espacio del logo OIT vacío o con texto

**Esto NO bloquea el desarrollo de V4** — Gerardo puede implementar todo el rediseño visual mientras la autorización se gestiona. Bloquea solo el momento de hacer públicos los assets que muestran el logo OIT.
