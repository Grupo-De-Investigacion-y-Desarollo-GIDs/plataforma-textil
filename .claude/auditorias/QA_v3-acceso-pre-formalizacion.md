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
| 5 | Directorio publico filtra solo talleres verificados | QA | | # |
| 6 | Directorio marca filtra solo talleres verificados | QA | | # |
| 7 | Nivel NO visible en directorio publico | QA | | # |
| 8 | Nivel NO visible en directorio marca | QA | | # |
| 9 | Nivel NO visible en perfil publico de taller | QA | | # |
| 10 | Nivel NO visible en cotizaciones (vista marca) | QA | | # |
| 11 | Nivel NO visible en ordenes de manufactura (vista marca) | QA | | # |
| 12 | Nivel NO visible en modal invitar-a-cotizar | QA | | # |
| 13 | Nivel NO visible en PDF de orden | QA | | # |
| 14 | Nivel SI visible en dashboard taller (propio) | QA | | # |
| 15 | Nivel SI visible en /taller/formalizacion (propio) | QA | | # |
| 16 | Nivel SI visible en /estado/talleres | QA | | # |
| 17 | Credenciales verificadas visibles en perfil publico | QA | | # |
| 18 | Credenciales verificadas visibles en directorio marca detalle | QA | | # |
| 19 | Banner "en proceso de formalizacion" en dashboard taller no verificado | QA | | # |
| 20 | Banner en pedidos disponibles para taller no verificado | QA | | # |
| 21 | Pagina cotizar muestra banner en vez de form para taller no verificado | QA | | # |
| 22 | ESTADO puede filtrar por "Sin verificar" en /estado/talleres | QA | | # |
| 23 | ESTADO ve stat card "Sin verificar" con conteo correcto | QA | | # |
| 24 | ESTADO ve badge "Sin verificar" junto al CUIT de talleres no verificados | QA | | # |

---

## Eje 2 — Navegabilidad

### Paso 1 — Taller verificado cotiza normalmente

- **Rol:** TALLER Bronce (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de inicio:** /taller
- **Verificador:** QA
- **Accion:** Ir a Pedidos disponibles → click en un pedido → verificar que aparece el form de cotizacion
- **Esperado:** Form visible, boton "Enviar cotizacion" funcional, sin banner de restriccion
- **Resultado:** [ ]
- **Notas:**

### Paso 2 — Directorio publico sin niveles

- **Rol:** Sin login
- **URL de inicio:** /directorio
- **Verificador:** QA
- **Accion:** Abrir directorio publico. Verificar que no hay filtro de nivel ni badges BRONCE/PLATA/ORO. Verificar que hay indicador de credenciales verificadas.
- **Esperado:** Sin filtro "Nivel". Sin badges de nivel. Cards muestran "N credenciales verificadas" si tienen docs completados.
- **Resultado:** [ ]
- **Notas:**

### Paso 3 — Perfil publico sin nivel, con credenciales

- **Rol:** Sin login
- **URL de inicio:** /perfil/[id de taller]
- **Verificador:** QA
- **Accion:** Click en un taller desde el directorio. Verificar que el perfil no muestra nivel pero si credenciales verificadas.
- **Esperado:** Sin badge BRONCE/PLATA/ORO. Seccion "CUIT verificado" + credenciales individuales (si tiene docs COMPLETADO).
- **Resultado:** [ ]
- **Notas:**

### Paso 4 — Marca directorio sin niveles

- **Rol:** MARCA (martin.echevarria@pdt.org.ar / pdt2026)
- **URL de inicio:** /marca/directorio
- **Verificador:** QA
- **Accion:** Verificar que no hay filtro de nivel ni badges. Verificar credenciales.
- **Esperado:** Sin filtro "Nivel". Cards sin badge de nivel. Credenciales visibles si tienen.
- **Resultado:** [ ]
- **Notas:**

### Paso 5 — ESTADO ve niveles + filtro verificacion

- **Rol:** ESTADO (anabelen.torres@pdt.org.ar / pdt2026)
- **URL de inicio:** /estado/talleres
- **Verificador:** QA
- **Accion:** Verificar que niveles SI son visibles. Verificar que existe filtro "Verificacion AFIP" con opciones Verificados/Sin verificar. Verificar stat card "Sin verificar".
- **Esperado:** Badges de nivel visibles. Filtro funciona. Stat card muestra conteo correcto.
- **Resultado:** [ ]
- **Notas:**

### Paso 6 — PDF de orden sin nivel

- **Rol:** TALLER o MARCA con orden existente
- **URL de inicio:** /taller/pedidos/[id] (orden completada o en ejecucion)
- **Verificador:** QA
- **Accion:** Click "Descargar acuerdo PDF". Abrir PDF y verificar que NO aparece "Nivel PDT".
- **Esperado:** PDF muestra Nombre + CUIT del taller, pero NO nivel.
- **Resultado:** [ ]
- **Notas:**

---

## Eje 3 — Casos borde

| # | Caso | Accion | Esperado | Verificador | Resultado |
|---|------|--------|----------|-------------|-----------|
| 1 | Taller recien registrado (verificadoAfip: false) | Intentar cotizar via API directa (curl/Postman) | 403 TALLER_NO_VERIFICADO | DEV | ok |
| 2 | Cotizaciones existentes de taller que pierde verificacion | Verificar que cotizaciones ya enviadas siguen visibles | Cotizaciones anteriores se mantienen | QA | |
| 3 | Marca invita taller no verificado via API | POST /api/pedidos/[id]/invitaciones con tallerId no verificado | 400 con mensaje descriptivo | DEV | ok |
| 4 | Directorio vacio por filtro | Aplicar filtros que no matchean ningun taller | Mensaje "No encontramos talleres con esos filtros" | QA | |
| 5 | Taller sin validaciones completadas | Ver perfil publico de taller sin docs aprobados | Sin seccion de credenciales (solo CUIT verificado si aplica) | QA | |

---

## Eje 4 — Performance

| Verificacion | Metodo | Verificador | Resultado |
|-------------|--------|-------------|-----------|
| Directorio publico carga en menos de 3 segundos | DevTools > Network > recargar | QA | |
| Directorio marca carga en menos de 3 segundos | DevTools > Network > recargar | QA | |
| Sin errores en consola del browser | DevTools > Console > revisar | QA | |
| Funciona en movil (responsive) | DevTools > Toggle device toolbar | QA | |

---

## Eje 5 — Consistencia visual

| Verificacion | Resultado | Notas |
|-------------|-----------|-------|
| Tipografias consistentes (Overpass para titulos) | | |
| Colores del design system (brand-blue, brand-red) | | |
| Credenciales verificadas usan Badge variant success con icono ShieldCheck | | |
| Banner de taller no verificado usa colores amber coherentes | | |
| Badge "Sin verificar" en ESTADO usa variant error | | |
| Textos en espanol argentino (vos/tenes/podes) | | |

---

## Eje 6 — Validacion de dominio (perfiles interdisciplinarios)

### Politologo — Relacion con el Estado

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | La privacidad del nivel (BRONCE/PLATA/ORO) y la exposicion de credenciales sueltas en vez de una etiqueta unica, ¿bajan barreras de entrada o crean opacidad para las marcas? | | |
| 2 | El Estado puede identificar talleres sin verificar y acompanarlos — ¿es suficiente el filtro + badge, o necesita una accion directa tipo "Enviar recordatorio"? | | |
| 3 | ¿El hecho de que talleres no verificados puedan navegar y capacitarse pero no cotizar, equilibra bien inclusion vs regulacion? ¿O deberia haber un paso intermedio? | | |

### Economista — Incentivos y metricas

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | El modelo de credenciales sueltas (ART ✓, Monotributo ✓) vs etiqueta unica (BRONCE/PLATA/ORO), ¿que senales de mercado genera? ¿Las marcas pueden tomar decisiones informadas con credenciales granulares? | | |
| 2 | ¿La restriccion de cotizar sin CUIT verificado crea una barrera de entrada economica relevante? ¿Hay talleres del sector que no pueden obtener un CUIT por razones estructurales? | | |
| 3 | ¿El directorio que solo muestra verificados crea un sesgo de seleccion? ¿Los talleres con mejores precios pero informales quedan invisibles para las marcas? | | |

### Sociologo — Lenguaje y accesibilidad

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | El mensaje al taller no verificado ("Tu taller esta en proceso de formalizacion. Podes navegar...") ¿es realmente constructivo o se siente como exclusion disfrazada de acompanamiento? | | |
| 2 | ¿El cambio de "Ver y cotizar" a "Ver detalle" para talleres no verificados es lo suficientemente claro, o genera confusion? | | |
| 3 | ¿El tono de los banners invita a la accion o genera desanimo? ¿Hay vocabulario que pueda percibirse como estigmatizante ("sin verificar", "no verificado")? | | |

### Contador — Flujos fiscales y operativos

| # | Pregunta | Resultado | Notas |
|---|----------|-----------|-------|
| 1 | ¿Las marcas pueden trabajar con confianza solo viendo credenciales individuales (ART ✓, Monotributo ✓) sin conocer el nivel del taller? ¿Es suficiente informacion para evaluar riesgo comercial? | | |
| 2 | El PDF de orden de manufactura ya no incluye nivel — ¿el CUIT es suficiente para fines contables y de trazabilidad? ¿Falta algun dato? | | |
| 3 | ¿La automaticidad de las credenciales (aparecen todas las COMPLETADO sin filtro del taller) puede exponer informacion que el taller preferiria no mostrar? | | |

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

- [ ] Todos los criterios de aceptacion verificados (24 items)
- [ ] Casos borde probados (5 items)
- [ ] Performance revisada en desktop y movil
- [ ] Eje 6 completado por cada perfil aplicable
- [ ] Issues abiertos en GitHub con labels correctos
- [ ] Resultado global definido
- [ ] Documento commiteado a develop
