# QA: Acceso pre-formalizacion y niveles privados

**Spec:** `v3-acceso-pre-formalizacion-niveles-privados` (sin spec previo — decisión OIT directa)
**Commit de implementacion:** (pendiente — pre-push)
**URL de prueba:** https://plataforma-textil-dev.vercel.app
**Fecha:** 2026-04-29
**Auditor(es):** Sergio (tecnico) + politologo + economista + sociologo + contador
**Incluye Eje 6 de validacion de dominio:** si
**Perfiles aplicables:** politologo, economista, sociologo, contador

---

## Contexto institucional

La PDT permite a talleres textiles registrarse con su CUIT, que se verifica contra AFIP/ARCA. Talleres en proceso de formalizacion (CUIT no verificado) pueden acceder a la plataforma en modo lectura pero no pueden cotizar pedidos ni aparecer en el directorio publico. Los niveles de formalizacion (BRONCE/PLATA/ORO) son internos — visibles solo para el taller y el Estado, no para marcas ni el publico. Las marcas ven credenciales individuales verificadas (ART, Monotributo, etc.) en vez de una etiqueta de nivel.

---

## Objetivo de este QA

Verificar que: (1) talleres no verificados no pueden cotizar ni aparecer en directorio, (2) los niveles no son visibles para marcas ni publico, (3) las credenciales verificadas se muestran correctamente, (4) ESTADO puede identificar talleres sin verificar, (5) los mensajes al taller son constructivos y no punitivos.

---

## Como trabajar con este documento

1. Abri este archivo y la plataforma en paralelo
2. Identifica que items te corresponden segun tu perfil (columna Verificador)
3. Segui los pasos en orden — cada paso depende del anterior
4. Marca cada resultado con ok, bug o bloqueante
5. Si el resultado no es ok → abri el widget azul "Feedback" → describi que paso
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

| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 1 | POST /api/cotizaciones rechaza taller con verificadoAfip:false con 403 TALLER_NO_VERIFICADO | DEV | ok | |
| 2 | POST /api/cotizaciones permite taller con verificadoAfip:true | DEV | ok | |
| 3 | GET /api/talleres solo retorna talleres verificados | DEV | ok | |
| 4 | POST /api/pedidos/[id]/invitaciones rechaza talleres no verificados | DEV | ok | |
| 5 | Directorio publico filtra solo talleres verificados | QA | ✅ code review — `where: { verificadoAfip: true }` filtro duro en directorio/page.tsx:27. Decision deliberada de INT-00 — Claude Code 6/5 | |
| 6 | Directorio marca filtra solo talleres verificados | QA | ✅ code review — `where: { verificadoAfip: true }` en marca/directorio/page.tsx:48 — Claude Code 6/5 | |
| 7 | Nivel NO visible en directorio publico | QA | ✅ code review — sin mencion de nivel/BRONCE/PLATA/ORO. Sin filtro de nivel. Muestra credenciales count + BadgeArca — Claude Code 6/5 | |
| 8 | Nivel NO visible en directorio marca | QA | ✅ code review — sin mencion de nivel. Filtros: texto, proceso, prenda. Muestra credenciales + BadgeArca — Claude Code 6/5 | |
| 9 | Nivel NO visible en perfil publico de taller | QA | ✅ code review — sin nivel. Muestra BadgeArca + credenciales individuales con ShieldCheck — Claude Code 6/5 | |
| 10 | Nivel NO visible en cotizaciones (vista marca) | QA | ✅ code review — cotizaciones muestran nombre, proceso, precio, plazo — sin nivel — Claude Code 6/5 | |
| 11 | Nivel NO visible en ordenes de manufactura (vista marca) | QA | ⚠️ UI pasa pero API leaks — la UI no muestra nivel, pero /api/pedidos/[id]/ordenes incluye `nivel: true` en el Prisma select (linea 29). Dato accesible via DevTools — Claude Code 6/5 | |
| 12 | Nivel NO visible en modal invitar-a-cotizar | QA | ⚠️ UI pasa pero API leaks — modal usa {id, nombre, ubicacion, capacidadMensual} pero /api/talleres retorna TODO el objeto incluyendo nivel. API ademas acepta ?nivel=ORO como filtro. Endpoint sin auth — Claude Code 6/5 | |
| 13 | Nivel NO visible en PDF de orden | QA | ✅ code review — PDF contiene moId, nombreTaller, cuitTaller, tipoPrenda, cantidad, proceso, precio, plazoDias, fechaAcuerdo. Sin nivel — Claude Code 6/5 | |
| 14 | Nivel SI visible en dashboard taller (propio) | QA | ✅ code review — nivel badge, history, level change banners, ProximoNivelCard, SincronizarNivel — Claude Code 6/5 | |
| 15 | Nivel SI visible en /taller/formalizacion (propio) | QA | ✅ code review — Badge "Nivel {taller.nivel}" + escala referencia (Bronce 0-39, Plata 40-69, Oro 70+) — Claude Code 6/5 | |
| 16 | Nivel SI visible en /estado/talleres | QA | ✅ verificado en INT-01 — StatCards Oro/Plata/Bronce, filtro nivel, columna nivel en tabla — Claude Code 6/5 | |
| 17 | Credenciales verificadas visibles en perfil publico | QA | ✅ code review — cada validacion COMPLETADO se muestra como Badge variant="success" con ShieldCheck + nombre del doc (perfil/[id]/page.tsx:47-49) — Claude Code 6/5 | |
| 18 | Credenciales verificadas visibles en directorio marca detalle | QA | ✅ code review — "CUIT verificado" badge + credenciales individuales Badge success + ShieldCheck (marca/directorio/[id]/page.tsx:57-66) — Claude Code 6/5 | |
| 19 | Banner "en proceso de formalizacion" en dashboard taller no verificado | QA | ✅ code review — banner amber con titulo "Tu taller esta en proceso de formalizacion", texto constructivo, CTA "Ir a Formalizacion" (taller/page.tsx:183-198) — Claude Code 6/5 | |
| 20 | Banner en pedidos disponibles para taller no verificado | QA | ✅ code review — banner "Tu CUIT aun no esta verificado" + CTA cambia de "Ver y cotizar" a "Ver detalle" (disponibles/page.tsx:54-61,121) — Claude Code 6/5 | |
| 21 | Pagina cotizar muestra banner en vez de form para taller no verificado | QA | ✅ code review — CotizarForm nunca se renderiza para no verificados. Card amber "Para enviar cotizaciones, tu taller necesita tener el CUIT verificado" + CTA "Ir a Formalizacion". Doble proteccion: API tambien bloquea con 403 — Claude Code 6/5 | |
| 22 | ESTADO puede filtrar por "Sin verificar" en /estado/talleres | QA | ✅ verificado en INT-01 — filtro "Verificacion ARCA" con opciones Verificados/Sin verificar — Claude Code 6/5 | |
| 23 | ESTADO ve stat card "Sin verificar" con conteo correcto | QA | ✅ verificado en INT-01 — StatCard variant warning cuando sinVerificar > 0 — Claude Code 6/5 | |
| 24 | ESTADO ve badge "Sin verificar" junto al CUIT de talleres no verificados | QA | ✅ verificado en INT-01 — BadgeArca con ShieldAlert amber — Claude Code 6/5 | |

---

## Eje 2 — Navegabilidad

### Paso 1 — Taller verificado cotiza normalmente

- **Rol:** TALLER Bronce (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de inicio:** /taller
- **Verificador:** QA
- **Accion:** Ir a Pedidos disponibles → click en un pedido → verificar que aparece el form de cotizacion
- **Esperado:** Form visible, boton "Enviar cotizacion" funcional, sin banner de restriccion
- **Resultado:** ✅ code review — CotizarForm se renderiza cuando verificadoAfip=true (disponibles/[id]/page.tsx:112). Doble proteccion: API POST /api/cotizaciones permite taller verificado — Claude Code 6/5. ⏳ verificacion visual en browser pendiente
- **Notas:**

### Paso 2 — Directorio publico sin niveles

- **Rol:** Sin login
- **URL de inicio:** /directorio
- **Verificador:** QA
- **Accion:** Abrir directorio publico. Verificar que no hay filtro de nivel ni badges BRONCE/PLATA/ORO. Verificar que hay indicador de credenciales verificadas.
- **Esperado:** Sin filtro "Nivel". Sin badges de nivel. Cards muestran "N credenciales verificadas" si tienen docs completados.
- **Resultado:** ✅ code review — sin filtro nivel, sin badges nivel. Cards muestran "X credenciales verificadas" con ShieldCheck. Prisma query no incluye nivel en select — Claude Code 6/5
- **Notas:**

### Paso 3 — Perfil publico sin nivel, con credenciales

- **Rol:** Sin login
- **URL de inicio:** /perfil/[id de taller]
- **Verificador:** QA
- **Accion:** Click en un taller desde el directorio. Verificar que el perfil no muestra nivel pero si credenciales verificadas.
- **Esperado:** Sin badge BRONCE/PLATA/ORO. Seccion "CUIT verificado" + credenciales individuales (si tiene docs COMPLETADO).
- **Resultado:** ✅ code review — sin nivel. Muestra BadgeArca + credenciales individuales Badge success + ShieldCheck para cada validacion COMPLETADO — Claude Code 6/5
- **Notas:**

### Paso 4 — Marca directorio sin niveles

- **Rol:** MARCA (martin.echevarria@pdt.org.ar / pdt2026)
- **URL de inicio:** /marca/directorio
- **Verificador:** QA
- **Accion:** Verificar que no hay filtro de nivel ni badges. Verificar credenciales.
- **Esperado:** Sin filtro "Nivel". Cards sin badge de nivel. Credenciales visibles si tienen.
- **Resultado:** ✅ code review — filtros: texto, proceso, prenda. Sin filtro nivel. Cards sin badge nivel. Credenciales count + ShieldCheck visibles — Claude Code 6/5
- **Notas:**

### Paso 5 — ESTADO ve niveles + filtro verificacion

- **Rol:** ESTADO (anabelen.torres@pdt.org.ar / pdt2026)
- **URL de inicio:** /estado/talleres
- **Verificador:** QA
- **Accion:** Verificar que niveles SI son visibles. Verificar que existe filtro "Verificacion ARCA" con opciones Verificados/Sin verificar. Verificar stat card "Sin verificar".
- **Esperado:** Badges de nivel visibles. Filtro funciona. Stat card muestra conteo correcto.
- **Resultado:** ✅ verificado en INT-01 — niveles visibles, filtro "Verificacion ARCA" (corregido de AFIP), StatCard sinVerificar con variant warning — Claude Code 6/5
- **Notas:**

### Paso 6 — PDF de orden sin nivel

- **Rol:** TALLER o MARCA con orden existente
- **URL de inicio:** /taller/pedidos/[id] (orden completada o en ejecucion)
- **Verificador:** QA
- **Accion:** Click "Descargar acuerdo PDF". Abrir PDF y verificar que NO aparece "Nivel PDT".
- **Esperado:** PDF muestra Nombre + CUIT del taller, pero NO nivel.
- **Resultado:** ✅ code review — orden-pdf.tsx contiene moId, nombreTaller, cuitTaller, nombreMarca, tipoPrenda, cantidad, proceso, precio, plazoDias, fechaAcuerdo. Sin nivel — Claude Code 6/5. ⏳ descargar y abrir PDF en browser para verificacion visual
- **Notas:**

---

## Eje 3 — Casos borde

| # | Caso | Accion | Esperado | Verificador | Resultado |
|---|------|--------|----------|-------------|-----------|
| 1 | Taller recien registrado (verificadoAfip: false) | Intentar cotizar via API directa (curl/Postman) | 403 TALLER_NO_VERIFICADO | DEV | ok |
| 2 | Cotizaciones existentes de taller que pierde verificacion | Verificar que cotizaciones ya enviadas siguen visibles | Cotizaciones anteriores se mantienen | QA | ✅ code review — GET /api/cotizaciones no filtra por verificadoAfip. Cotizaciones existentes permanecen visibles. Proteccion solo en creacion (POST 403). Correcto: son registros comerciales que no deben desaparecer retroactivamente — Claude Code 6/5 |
| 3 | Marca invita taller no verificado via API | POST /api/pedidos/[id]/invitaciones con tallerId no verificado | 400 con mensaje descriptivo | DEV | ok |
| 4 | Directorio vacio por filtro | Aplicar filtros que no matchean ningun taller | Mensaje "No encontramos talleres con esos filtros" | QA | ✅ code review — directorio publico muestra "No encontramos talleres con esos filtros" + link "Ver todos". Marca directorio muestra "No hay talleres para esos filtros." — Claude Code 6/5. ⚠️ Ambas paginas usan texto inline en vez de componente EmptyState (viola CLAUDE.md checklist item 4) |
| 5 | Taller sin validaciones completadas | Ver perfil publico de taller sin docs aprobados | Sin seccion de credenciales (solo CUIT verificado si aplica) | QA | ✅ code review — seccion de credenciales condicional: solo se renderiza si verificadoAfip=true o validaciones.length > 0. Con verificadoAfip=true y 0 docs: solo BadgeArca. Con ambos false: seccion oculta — Claude Code 6/5 |

---

## Eje 4 — Performance

| Verificacion | Metodo | Verificador | Resultado |
|-------------|--------|-------------|-----------|
| Directorio publico carga en menos de 3 segundos | DevTools > Network > recargar | QA | ⏳ requiere browser. Nota por code review: directorio publico tiene paginacion (PAGE_SIZE=12) y Promise.all para queries paralelas — bien optimizado |
| Directorio marca carga en menos de 3 segundos | DevTools > Network > recargar | QA | ⏳ requiere browser. ⚠️ por code review: marca/directorio NO tiene paginacion — findMany sin take/skip carga TODOS los talleres verificados. Riesgo de performance con muchos talleres |
| Sin errores en consola del browser | DevTools > Console > revisar | QA | ⏳ requiere browser |
| Funciona en movil (responsive) | DevTools > Toggle device toolbar | QA | ⏳ requiere browser |

---

## Eje 5 — Consistencia visual

| Verificacion | Resultado | Notas |
|-------------|-----------|-------|
| Tipografias consistentes (Overpass para titulos) | ⏳ requiere browser | |
| Colores del design system (brand-blue, brand-red) | ⏳ requiere browser | |
| Credenciales verificadas usan Badge variant success con icono ShieldCheck | ✅ code review — Badge variant="success" con ShieldCheck en perfil publico y marca directorio — Claude Code 6/5 | |
| Banner de taller no verificado usa colores amber coherentes | ✅ code review — border-l-amber-400 bg-amber-50 text-amber-800 en dashboard; bg-amber-50 border-amber-200 en pedidos disponibles — Claude Code 6/5 | |
| Badge "Sin verificar" en ESTADO usa variant error | ✅ verificado en INT-01 — BadgeArca con ShieldAlert amber-50/amber-700 — Claude Code 6/5 | Nota: usa amber (warning) no error (red). Verificar si es intencionado |
| Textos en espanol argentino (vos/tenes/podes) | ✅ code review — banners usan "Podes navegar", "vas a poder cotizar", "completá tu documentación", "Tu taller" (voseo rioplatense consistente) — Claude Code 6/5 | |

---

## Eje 6 — Validacion de dominio (perfiles interdisciplinarios)

### Politologo — Relacion con el Estado

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | La privacidad del nivel (BRONCE/PLATA/ORO) y la exposicion de credenciales sueltas en vez de una etiqueta unica, ¿bajan barreras de entrada o crean opacidad para las marcas? | 🔵 Primera pasada: La decision baja barreras de entrada. Una etiqueta unica "BRONCE" podria estigmatizar talleres en formalizacion temprana, mientras que credenciales granulares (ART ✓, Monotributo ✓) permiten a las marcas evaluar lo que les importa sin un ranking simplificado. Riesgo: las marcas podrian no entender que criterios evaluar sin guia. | Requiere validacion con marcas reales del piloto |
| 2 | El Estado puede identificar talleres sin verificar y acompanarlos — ¿es suficiente el filtro + badge, o necesita una accion directa tipo "Enviar recordatorio"? | 🔵 Primera pasada: El filtro + badge es suficiente para identificacion, pero falta una herramienta de accion directa. En el piloto con 25 talleres es manejable manualmente (WhatsApp, telefono). A escala (100+ talleres) se necesitaria "Enviar recordatorio" automatizado. Recomendacion: diferir a V4 como feature. | Ya existe como feature request potencial en V4 |
| 3 | ¿El hecho de que talleres no verificados puedan navegar y capacitarse pero no cotizar, equilibra bien inclusion vs regulacion? ¿O deberia haber un paso intermedio? | 🔵 Primera pasada: Equilibrio adecuado para el contexto argentino. Permite al taller informal conocer la plataforma, capacitarse y avanzar en formalizacion antes de operar comercialmente. Esto alinea con la politica publica de acompanamiento gradual vs exclusion binaria. No se necesita paso intermedio para el piloto. | Verificar con OIT si el approach es compatible con sus marcos de trabajo decente |

### Economista — Incentivos y metricas

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | El modelo de credenciales sueltas (ART ✓, Monotributo ✓) vs etiqueta unica (BRONCE/PLATA/ORO), ¿que senales de mercado genera? ¿Las marcas pueden tomar decisiones informadas con credenciales granulares? | 🔵 Primera pasada: Las credenciales granulares generan una senal mas informativa que una etiqueta agregada. Una marca textil prioriza ART (riesgo laboral) y Monotributo (facturacion), no un score arbitrario. El modelo actual permite decision informada basada en los criterios relevantes para cada marca. Riesgo: si hay 10+ credenciales, la granularidad puede convertirse en ruido. Con 5-7 credenciales actuales es manejable. | Requiere feedback de marcas en piloto |
| 2 | ¿La restriccion de cotizar sin CUIT verificado crea una barrera de entrada economica relevante? ¿Hay talleres del sector que no pueden obtener un CUIT por razones estructurales? | 🔵 Primera pasada: Si, es una barrera significativa. En el sector textil argentino hay talleres familiares informales que operan sin CUIT por desconocimiento, costo de monotributo, o miedo a perder asistencia social. La plataforma mitiga parcialmente con la academia y el acompanamiento, pero la barrera del CUIT excluye al segmento mas vulnerable. Este es un trade-off consciente: la OIT necesita trazabilidad y la plataforma no puede intermediar trabajo no registrado. | Tema critico para discutir con OIT — documentar la decision y sus limitaciones |
| 3 | ¿El directorio que solo muestra verificados crea un sesgo de seleccion? ¿Los talleres con mejores precios pero informales quedan invisibles para las marcas? | 🔵 Primera pasada: Si crea sesgo de seleccion, pero es intencional y justificado. La plataforma busca formalizar, no intermediar informalidad. Los talleres informales con buenos precios tienen incentivo a formalizarse para acceder al mercado. El riesgo es que los primeros meses del piloto el directorio tenga pocos talleres (solo los ya formalizados). | Monitorear ratio verificados/total en primeras semanas |

### Sociologo — Lenguaje y accesibilidad

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | El mensaje al taller no verificado ("Tu taller esta en proceso de formalizacion. Podes navegar...") ¿es realmente constructivo o se siente como exclusion disfrazada de acompanamiento? | 🔵 Primera pasada: El tono es constructivo y bien calibrado. Usa "en proceso de formalizacion" (estado transitorio, no permanente). Enfatiza lo que SI puede hacer (navegar, capacitarse, subir docs) antes de lo que no puede. El CTA "Ir a Formalizacion" da agencia. No usa lenguaje negativo ("no podes", "no tenes permiso"). Nota: el banner del dashboard dice "Podes navegar la plataforma, capacitarte y subir documentos para avanzar" — enmarca la restriccion como un camino, no como un muro. | Un sociologo real deberia validar con talleres del piloto — la percepcion del mensaje depende del contexto cultural del receptor |
| 2 | ¿El cambio de "Ver y cotizar" a "Ver detalle" para talleres no verificados es lo suficientemente claro, o genera confusion? | 🔵 Primera pasada: Es claro y no engana. "Ver detalle" comunica que puede explorar. No promete funcionalidad que no tiene. Al hacer click, la pagina de detalle muestra el banner explicativo en vez del form. No hay momento de "bait and switch" — el taller sabe desde el listado que no puede cotizar (banner visible arriba del listado). | Podria mejorarse con un icono o tooltip "¿Por que no puedo cotizar?" |
| 3 | ¿El tono de los banners invita a la accion o genera desanimo? ¿Hay vocabulario que pueda percibirse como estigmatizante ("sin verificar", "no verificado")? | 🔵 Primera pasada: Los banners para el taller son invitadores — usan "en proceso de formalizacion" y "completá tu documentación". PERO: el badge para ESTADO dice "Sin verificar" / "Pendiente de verificacion" — este vocabulario es interno (solo lo ve ESTADO/ADMIN), no el taller. El taller nunca ve la palabra "sin verificar" sobre si mismo. Esto es correcto: el ESTADO necesita lenguaje directo para gestion, el taller necesita lenguaje motivacional. | Bien resuelto la separacion de registros linguisticos por audiencia |

### Contador — Flujos fiscales y operativos

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | ¿Las marcas pueden trabajar con confianza solo viendo credenciales individuales (ART ✓, Monotributo ✓) sin conocer el nivel del taller? ¿Es suficiente informacion para evaluar riesgo comercial? | 🔵 Primera pasada: Para el sector textil argentino, las credenciales clave son: CUIT verificado (legitimidad), ART (riesgo laboral — critico para marcas que quieren evitar responsabilidad solidaria), Monotributo/Inscripto (facturacion). Estas 3 credenciales cubren el 80% de la evaluacion de riesgo comercial. El nivel (que agrega capacitaciones y docs opcionales) es mas relevante para el Estado que para la marca. | Las marcas grandes (Zara, H&M en Argentina) piden ART y facturacion, no un score de plataforma |
| 2 | El PDF de orden de manufactura ya no incluye nivel — ¿el CUIT es suficiente para fines contables y de trazabilidad? ¿Falta algun dato? | 🔵 Primera pasada: El CUIT es suficiente para trazabilidad contable en Argentina — permite verificar contra ARCA, emitir facturas, y cumplir con la ley de trazabilidad textil (Ley 27.501). El PDF incluye CUIT + nombre, que es lo minimo requerido. Podria faltar: tipo de inscripcion (monotributo vs RI) para que la marca sepa que tipo de factura esperar (B vs A). Esto es un nice-to-have, no bloqueante. | Verificar con contador real si se necesita categoria fiscal en el PDF |
| 3 | ¿La automaticidad de las credenciales (aparecen todas las COMPLETADO sin filtro del taller) puede exponer informacion que el taller preferiria no mostrar? | 🔵 Primera pasada: En el contexto actual (5-7 credenciales, todas son indicadores positivos de formalizacion), no hay riesgo de exposicion negativa. Las credenciales son binarias (tiene o no tiene) — no muestran numeros sensibles como facturacion o cantidad de empleados. Sin embargo, si se agregan credenciales que impliquen informacion sensible (ej: "Empleo femenino certificado" que podria revelar composicion de genero), se necesitaria control del taller sobre que mostrar. Para el piloto actual: no es un problema. | Considerar mecanismo de opt-out si se agregan credenciales sensibles en V4 |

---

## Resumen de issues abiertos

| Issue | Tipo | Descripcion | Perfil que lo encontro | Prioridad |
|-------|------|-------------|------------------------|-----------|
| — | ❌ seguridad | /api/talleres accesible SIN autenticacion — expone nivel, email, phone de todos los talleres verificados. Tambien acepta ?nivel=ORO como filtro. | Claude Code (API test) | **alta** |
| — | ⚠️ data leak | /api/pedidos/[id]/ordenes incluye `nivel: true` en Prisma select — dato accesible via DevTools por marcas autenticadas | Claude Code (code review) | media |
| — | ⚠️ cosmetico | Marca dashboard dice "Encontra proveedores verificados por nivel y proceso" — marcas no pueden filtrar por nivel | Claude Code (code review) | baja |
| — | ⚠️ convencion | Directorios publico y marca no usan componente EmptyState (viola CLAUDE.md checklist item 4) | Claude Code (code review) | baja |
| — | ⚠️ performance | Marca directorio sin paginacion — findMany sin take/skip carga todos los talleres | Claude Code (code review) | media |

---

## Notas de los auditores

**Claude Code (code review + API testing + Eje 6 primera pasada — 6/5/2026):**

**Metodologia:** Code review de 15+ archivos (paginas publicas, marca, taller, estado, APIs, PDF, modal). API testing via WebFetch contra produccion. Eje 6 primera pasada con analisis desde 4 perspectivas.

**Hallazgos positivos:**
- Privacidad de nivel bien implementada en la capa UI: 0 leaks en 10 paginas/componentes verificados
- Doble proteccion en cotizaciones: UI (form reemplazado por banner) + API (403 TALLER_NO_VERIFICADO)
- Banners constructivos con tono apropiado (voseo rioplatense, enfasis en lo positivo)
- Credenciales granulares bien resueltas (ShieldCheck + Badge success)
- Separacion de registros linguisticos por audiencia (taller vs ESTADO)
- Formalizacion accesible para no verificados (correcto: necesitan subir docs)

**Hallazgos criticos:**
- /api/talleres es el hallazgo mas serio: endpoint sin auth que expone datos sensibles incluyendo nivel (que deberia ser privado)
- /api/pedidos/[id]/ordenes leak de nivel en select (menor, requiere auth de marca)

**Perfiles interdisciplinarios:**
[primera pasada 🔵 completada — requiere validacion humana]

**Sergio (tecnico):**
[pendiente]

---

## Checklist de cierre

- [ ] Todos los criterios de aceptacion verificados (24 items)
- [ ] Casos borde probados (5 items)
- [ ] Performance revisada en desktop y movil
- [ ] Eje 6 completado por cada perfil aplicable
- [ ] Issues abiertos en GitHub con labels correctos
- [ ] Resultado global definido
- [ ] Documento commiteado a develop
