# Fase 1 — Análisis visual de pantallas

**Fecha:** 2026-05-08
**Material analizado:** 16 capturas HTML de producción (https://plataforma-textil.vercel.app)
**Cobertura:** TALLER (6), MARCA (2), ESTADO (2), ADMIN (2), pública (1), login (1), menús (2)

---

## A. Hallazgos transversales (los más importantes)

### A1. **Hay DOS design systems en la misma plataforma** [crítico]
- **Layout TALLER/MARCA/ESTADO:** header horizontal de 4 bandas + tabs
- **Layout ADMIN:** sidebar lateral oscuro persistente + topbar simple
- Resultado: cambiar de rol siente como cambiar de aplicación

### A2. **Header con 4 bandas verticales** [alto impacto, fácil arreglar]
En TALLER/MARCA/ESTADO el usuario ve, antes del contenido:
1. Banner amarillo "AMBIENTE DE PRUEBAS"
2. Topbar oscuro (menú, idioma, V2.0, notificaciones, nombre)
3. Banner azul brand grande (logo PDT + título + rol)
4. Tabnav azul claro con tabs

Esto consume ~150px de alto, cada banda tiene un color distinto y compite por atención.
**Oportunidad:** colapsar a 2 bandas: topbar único (40px) + nav (50px). El banner azul grande es vanidad institucional, no aporta info.

### A3. **Inconsistencia de densidad entre dashboards** [importante]
| Rol | Densidad | Comentario |
|---|---|---|
| TALLER | Alta (5 KPIs + checklist + 3 acciones + 3 listas) | Bien, pero saturado |
| MARCA | Baja (3 KPIs + 2 acciones + 1 banner) | Mucho whitespace, parece vacío |
| ESTADO | Alta y bien organizada (4 KPIs + 3 secciones temáticas) | El mejor del set |
| ADMIN | Sidebar + 4 stats + 6 accesos + menú completo | Otro paradigma |

**Oportunidad:** unificar el patrón de dashboard. ESTADO ya tiene un buen modelo (secciones nombradas como preguntas: "¿Cómo está el sector?", "¿Dónde hay que actuar?", "¿Qué está funcionando?").

### A4. **Color sin sistema semántico** [importante]
Mismos colores significan cosas distintas según la pantalla:
- TALLER: `14%` en rojo (¿es malo?), `25 puntos` en rojo, `6468` en verde — sin lógica
- ESTADO: usa borde de color izquierdo en cards (amarillo, rojo, azul, verde, púrpura) → semántico claro
- MARCA: todo en brand-blue, sin código de color

**Oportunidad:** definir paleta semántica:
- Rojo = problema/alerta (denuncias, errores)
- Amarillo = pendiente (validaciones, acción requerida)
- Verde = éxito/completado
- Azul = info/neutro
- Brand-blue = identidad, headings

### A5. **Tipografía sin jerarquía suficiente** [medio]
- Headings azules + body text azul oscuro = bajo contraste de jerarquía
- "Bienvenido, X" tiene casi el mismo peso visual que "Tus primeros pasos"
- Falta tamaño grande para H1 / pequeño para captions

### A6. **Microcopy: códigos crípticos de mock visibles en producción** [bug, fácil arreglar]
En el dashboard TALLER aparecen códigos como:
- `MO-2026-A7221043 OM-2026-B858D5C9 E2E-Test-1778254904620`

Esto es ruido de seed data filtrándose al usuario. Hay que esconderlo o reemplazarlo por nombres de marca.

### A7. **Logo redundante** [cosmético, fácil]
El círculo "PDT" (56×56px) está al lado del título "Plataforma Digital Textil". Mismo nombre dos veces. Soluciones:
- Dejar solo el logo (más visual)
- Dejar solo el título (más limpio)
- Combinar en un wordmark

### A8. **Saludo y rol duplicados**
- Topbar muestra: `MARCA: Urbano Textil`
- H1 dice: `Bienvenido, Urbano Textil`
- Subtítulo dice: `Tu panel de gestion de produccion`

Tres veces se identifica al usuario. Suficiente con dos: rol en topbar + saludo personal en H1.

### A9. **CTAs débiles en flujos críticos** [importante]
- "Continuar paso siguiente →" en TALLER es texto link, no botón. Debería ser CTA primario.
- Cards de "Acciones rápidas" tienen mismo peso visual que cards de stats. El usuario no sabe qué clickear primero.

### A10. **Falta progreso visual del nivel del taller**
- Badge dice "🥉 BRONCE" + donut con 14%
- Pero falta: ¿qué falta para PLATA? ¿cuánto le falta? El donut muestra "PROGRESO DE FORMALIZACIÓN" general, no específico al próximo nivel.

### A11. **Banner amarillo "AMBIENTE DE PRUEBAS"** [cosmético]
Está bien que avise, pero ocupa ancho completo y compite con el contenido. Podría ser una pill chiquita en el topbar.

### A12. **Dos donuts de progreso con significados distintos** [importante, confunde]
- Dashboard TALLER: donut "14% PROGRESO DE FORMALIZACIÓN"
- Mi Perfil TALLER: donut "89% PERFIL COMPLETO"
- Mi Formalización: donut "14%" + "1/7 completados"

Tres donuts grandes con porcentajes diferentes, todos diciendo "progreso de algo del taller". El usuario no entiende cuál importa.
**Oportunidad:** unificar visualmente. Por ejemplo, **un solo widget de "Estado del taller"** en el dashboard que muestre 3 barras: Perfil 89%, Formalización 14%, On-time 75%.

### A13. **CTAs en pedidos están MUY bien** [aprovechar como modelo]
En `14-taller-pedido-detalle.png`:
- "Aceptar orden" verde (acción positiva)
- "Rechazar orden" rojo (acción negativa)
- "Contactar por WhatsApp" verde (canal de contacto)

Esto es el mejor uso de color semántico de toda la plataforma. **Replicar este patrón** en otros lugares donde haya decisiones (Aceptar/Rechazar cotización, Aprobar/Rechazar validación, etc.).

### A14. **Bug de renderizado duplicado** [no es visual, es bug del save HTML]
Múltiples capturas muestran el contenido renderizado dos veces (Marca dashboard, Pedido detalle, Estado dashboard). Es probable que sea cómo el navegador guardó el HTML, no un bug del sitio. **No es prioridad para la propuesta visual** pero conviene confirmar viendo en el navegador real.

---

## B. Notas por pantalla

### B1. Landing pública (`01-landing-publica.png`)
**Buena estructura:** título grande + 2 botones (Soy Taller / Soy Marca) + 3 stats + cards "Soy Taller / Soy Marca" con beneficios + flujo "Cómo funciona" + Sistema de niveles (Bronce/Plata/Oro).

**Problemas:**
- Título "Plataforma Digital Textil" muy grande comparado con tagline
- "UNA INICIATIVA DE OIT ARGENTINA Y UNTREF" en uppercase y chiquito → bien institucional pero podría tener más peso (es importante para credibilidad)
- Botones Soy Taller/Soy Marca redundantes con cards de abajo que dicen lo mismo
- "Solicita acceso institucional" en texto link, debería ser un CTA terciario más visible

### B2. Dashboard TALLER (`03-taller-dashboard.png`)
- 5 KPI cards en una fila → en mobile va a romper
- Checklist con items tachados (✓ tachado): comunica "ya está hecho", pero la legibilidad baja
- Donut 14% en rojo: ¿14% es bueno o malo? Sin contexto el rojo asusta
- "PUNTAJE 25" en rojo grande: parece error
- Pedidos activos: códigos crípticos
- Capacitaciones recomendadas: progreso bar limpio, bien

### B3. Academia TALLER (`04-taller-academia.png`)
Cards de cursos: "Seguridad e Higiene", "Cálculo de Costos y Presupuestos", "Formalización y Registro del Taller". Cada uno con duración, número de videos, progreso (75%, 67%) y CTA "Continuar".
- **Bien:** progreso visible
- **Mejorar:** las cards parecen homogéneas (sin destacar el siguiente recomendado)

### B4. Colección Academia (`05-taller-coleccion.png`)
Vista del curso con lista de videos.
- Cards de videos con play icon + título + duración
- Layout claro, similar al patrón de academia

### B5. Dashboard MARCA (`06-marca-dashboard.png`)
- 3 KPIs + 2 acciones = mucho whitespace
- Banner azul claro "Tenes 3 cotizaciones pendientes de revisión" → bueno como nudge
- **Aparente bug:** la página se renderiza dos veces en el screenshot. Confirmar si es bug del save HTML o del render real.
- Falta lista de pedidos recientes (en TALLER están, acá no)

### B6. Dashboard ESTADO (`08-estado-dashboard.png`) — **el mejor del set**
- Secciones nombradas como preguntas
- 4 KPI cards arriba con íconos coloridos
- "Donde hay que actuar?" con 3 cards de borde rojo/amarillo/azul = semántico
- "Que esta funcionando?" con 3 cards de borde verde/azul/púrpura = positivo
- Card grande "Progreso de formalización" con 3 progress bars (Bronce/Plata/Oro) — muy claro
- Lista "Actividad reciente" con íconos por tipo de evento

**Tomar este dashboard como modelo para los demás.**

### B7. Datos sectoriales ESTADO (`09-estado-sector.png`)
Sección con datos analíticos: Organización productiva, Gestión y registro, Capacidad de escalar, Top 5 procesos, Top 5 prendas, Distribución por provincia. Buen patrón de "informe sectorial".

### B8. Dashboard ADMIN (`11-admin-dashboard.png`)
- Sidebar lateral con 18 ítems → bien para admin, pero **rompe consistencia con otros roles**
- Funnel de adopción con barras + porcentajes → buen patrón
- Tabla Usuarios con badges de rol coloridos
- Botón "Reenviar invitación" en cada fila → bien

### B9. Edición Colección ADMIN (`12-admin-coleccion-editar.png`)
Form de edición con 3 secciones: Información Básica, Videos (3), Estado de publicación. Sidebar admin lateral. Formulario funcional, sin estilo distintivo.

### B10. Login (`13-login.png`) — **una de las mejor diseñadas**
- Logo PDT centrado grande + título → ahí el círculo PDT sí tiene sentido (es la pantalla de marca)
- Card blanca centrada con form: Email + Contraseña + "Olvidé mi contraseña" + CTA "Ingresar" azul fuerte
- Separador "O continúa con" + botón Google + magic link "Enviar link"
- Footer "No tenes cuenta? Crear cuenta"
- **Aprovechable:** este patrón de tarjeta centrada se puede usar para registro y recuperar contraseña
- **Detalle:** falta tilde en "Iniciar sesión" → "Iniciar sesion" (microcopy)

### B11. Pedido detallado TALLER (`14-taller-pedido-detalle.png`)
- Breadcrumbs: `Taller > Mis ordenes > MO-2026-E1D8FA31` ✓ bien
- H1: el código MO-2026-E1D8FA31 + badge "Pendiente de aceptación" amarillo claro
- 5 cards apiladas: Detalle del pedido / Tu orden de manufactura / Responder propuesta / Contacto marca / Actividad de tu orden
- CTAs claros: "Aceptar orden" verde + "Rechazar orden" rojo + "Contactar por WhatsApp" verde — **muy bien diferenciados**
- **Problema:** el código MO-2026-E1D8FA31 como H1 es críptico. Debería ser un nombre más humano (ej. "Pedido de Urbano Textil — 500 unidades")
- **Bug confirmado:** la página vuelve a renderizarse duplicada en el HTML guardado (no es problema de Edge, está así en el HTML)

### B12. Mi Perfil TALLER (`15-taller-perfil.png`) — **bien diseñada**
- Header del perfil: nombre + badge BRONCE naranja + ubicación + email + teléfono
- Card "Perfil 89% completo" con donut rojo grande
- 4 stat cards: 3.2 Rating ⭐ | 8 Trabajadores | 6,468 Cap. mensual | 75% On-time
- 5 secciones bien jerarquizadas: Descripción / Información General / Mi portfolio (con thumbs) / Perfil productivo / Maquinaria
- **Conflicto importante:** el dashboard dice 14% PROGRESO DE FORMALIZACIÓN y este perfil dice 89% PERFIL COMPLETO — **dos métricas distintas con el mismo nombre visual** (donut + porcentaje). El usuario se confunde.

### B13. Mi Formalización TALLER (`16-taller-formalizacion.png`)
- Card de progreso 14% + "1/7 completados" + tabla "Niveles" a la derecha (Bronce/Plata/Oro con puntos requeridos)
- Checklist de 7 documentos: Registrate en ARCA (COMPLETADO) + Habilitá tu local (PENDIENTE) + Asegurá a tu equipo (PENDIENTE + 3 sub-opciones radio: "ya tiene ART", "ya pago", "no la hizo") + Habilitación de bomberos / Plan de seguridad / Libro de sueldos digital
- Estados visuales con colores: verde COMPLETADO / naranja PENDIENTE
- Banner abajo: "Necesitas ayuda para formalizarte? — Pedí cuenta"
- **Bien:** el flujo es claro
- **Mejorar:** los radio buttons dentro de un item (Asegurá a tu equipo) rompen el patrón. Sería mejor sub-pasos.

---

## C. Lo que NO se ve en estas capturas

Faltan (no críticos para empezar la propuesta):
- **MARCA**: Directorio, Crear pedido, Pedido detalle
- **ESTADO**: Demanda insatisfecha, Exportar, Detalle de taller
- **ADMIN**: Observaciones, Talleres, Auditorías
- **AUTH**: Registro, Recuperar contraseña
- **MOBILE**: ninguna pantalla en viewport mobile (importante para validar Nivel 3)
- **STATES**: vacíos, errores, loading, onboarding

---

## D. Próximos pasos (Fase 2)

1. ✅ **Fase 1 — Diagnóstico** (este documento)
2. ⏭ **Fase 2 — Benchmarking** (30 min): mirar 3-5 referencias visuales y extraer 1 idea de cada una
3. ⏭ **Fase 3 — Principios** (30 min): qué tiene que comunicar el rediseño
4. ⏭ **Fase 4 — Propuesta** (2 hs): documento con tokens nuevos + componentes + ejemplos antes/después
