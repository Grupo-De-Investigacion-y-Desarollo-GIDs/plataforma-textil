# Pruebas manuales pendientes — V3

Este archivo acumula TODAS las verificaciones manuales que requieren ojos humanos en produccion/dev. Se ejecutan al final de la implementacion de todos los specs V3, en una sesion de validacion dedicada.

---

## Spec S-01 — Cookies seguridad

### Pruebas en plataforma-textil-dev.vercel.app (DEV)

- [ ] Login con email + password — cookie authjs.session-token tiene flags HttpOnly, Secure, SameSite=Lax, Path=/
- [ ] Login con Google OAuth — misma verificacion de flags
- [ ] Login con Magic Link — misma verificacion de flags
- [ ] Cookie csrf-token tiene los mismos flags en los 3 escenarios

### Pruebas en plataforma-textil.vercel.app (PRODUCCION)

- [ ] Login con email + password — cookie __Secure-authjs.session-token tiene flags correctos
- [ ] Login con Google OAuth — misma verificacion
- [ ] Login con Magic Link — misma verificacion
- [ ] Cookie __Host-authjs.csrf-token con flags correctos

### Como ejecutar

1. Abri ventana incognito (Ctrl+Shift+N)
2. Anda a la URL del ambiente
3. Logueate con el metodo correspondiente
4. F12 → Application → Cookies → selecciona el dominio
5. Verifica los flags en cada cookie

---

## Spec S-02 — Rate limiting

### Pruebas en plataforma-textil-dev.vercel.app (DEV)

- [ ] Login brute force: intentar login con password incorrecto 6 veces seguidas → la 6ta debe retornar 429
- [ ] Despues de 15 minutos, la misma IP puede volver a intentar login
- [ ] Header Retry-After presente en la respuesta 429
- [ ] Body de la respuesta 429 dice "Demasiadas solicitudes" en español
- [ ] Login normal (1-3 intentos) NO se ve afectado
- [ ] ADMIN/ESTADO autenticados pueden hacer 21+ cotizaciones sin rate limit (verificar por codigo durante review, no por prueba real)
- [ ] Si Redis cae (simulable cambiando UPSTASH_REDIS_REST_URL en Vercel temporalmente), las requests siguen pasando (fail-open)
- [ ] Magic link spam: pedir 6 magic links seguidos al mismo email → la 6ta debe retornar 429

### Como ejecutar

1. Abri ventana incognito
2. Anda a /login
3. Intenta login con password incorrecto 6 veces seguidas
4. La 6ta respuesta debe ser 429 en Network tab (F12 → Network)
5. Verificar header Retry-After y body con mensaje en español
6. Esperar 15 minutos y verificar que login vuelve a funcionar

---

## Spec S-03 — Validacion de archivos

### Pruebas en plataforma-textil-dev.vercel.app (DEV)

- [ ] Upload de PDF real como taller en formalizacion → sube correctamente
- [ ] Upload de JPG real como taller en portfolio → sube correctamente
- [ ] Upload de un .exe renombrado a .pdf → rechazado con "Formato no soportado"
- [ ] Upload de archivo de 6MB → rechazado con "tamano maximo"
- [ ] Upload de archivo con nombre `../../hack.pdf` → rechazado con "caracteres no permitidos"
- [ ] Admin desactiva contexto imagenes-portfolio → taller no puede subir fotos al portfolio (400)
- [ ] Admin reactiva el contexto → taller puede subir fotos nuevamente (esperar 1 min por cache)
- [ ] Admin cambia tamano maximo a 10 MB → archivo de 8 MB se acepta
- [ ] Admin agrega xlsx a tipos permitidos → Excel real se acepta
- [ ] Log UPLOAD_REJECTED visible en /admin/logs despues de un intento rechazado
- [ ] UI /admin/configuracion/archivos muestra 3 contextos con badges correctos
- [ ] Modal de edicion funciona: tipos, tamano, toggle activo

### Como ejecutar

1. Login como taller (roberto.gimenez@pdt.org.ar / pdt2026)
2. Ir a /taller/formalizacion y subir un PDF real
3. Ir a /taller/perfil y subir una imagen JPG al portfolio
4. Para el test de EXE disfrazado: renombrar cualquier .exe a .pdf e intentar subirlo
5. Para probar la UI admin: login como admin (lucia.fernandez@pdt.org.ar / pdt2026)
6. Ir a /admin/configuracion → click tab "Archivos"
7. Editar una config, verificar que los cambios se reflejan

---

## Spec D-01 — Redefinicion de roles ESTADO (verificacion obligatoria pre-merge)

### Criticidad: ALTA — este spec redefine el sistema completo de permisos

### Login como ESTADO (anabelen.torres@pdt.org.ar / pdt2026)
1. [ ] Sidebar muestra 8 items: Dashboard, Talleres, Documentos, Auditorias, Diagnostico Sector, Exportar Datos, Notificaciones, Mi Cuenta
2. [ ] Click en /estado/talleres → ver listado con filtros por nivel/provincia/pendientes
3. [ ] Click en un taller → ver tabs Formalizacion / Historial / Datos del taller
4. [ ] En Formalizacion: documentos COMPLETADO muestran "Aprobado por: [nombre]" con fecha
5. [ ] En /estado/documentos → ver tipos de documento, poder editar uno y guardar cambios

### Login como ADMIN (lucia.fernandez@pdt.org.ar / pdt2026)
6. [ ] Acceder a /estado/talleres/[id] → ver banner "Modo lectura", sin botones Aprobar/Rechazar/Revocar
7. [ ] Acceder a /admin/documentos → debe dar 404 (mudada a /estado/documentos)
8. [ ] /admin/logs → siguen apareciendo logs de validacion (historicos y nuevos ESTADO_VALIDACION_*)
9. [ ] /admin/talleres/[id] → ver banner con link "Ver vista de formalizacion", sin tab Formalizacion

### Login como TALLER (roberto.gimenez@pdt.org.ar / pdt2026)
10. [ ] Acceder a /estado/talleres → redirect a /unauthorized

### Como ejecutar

1. Abrir plataforma-textil-dev.vercel.app en ventana de incognito
2. Usar acceso-rapido (/) para login rapido entre roles
3. Verificar cada item de la checklist — tiempo estimado: 15 minutos
4. Los items 1-5 son los mas criticos (funcionalidad nueva ESTADO)
5. Los items 6-9 verifican que ADMIN no se rompio
6. El item 10 verifica aislamiento de permisos

### Post-migracion (solo produccion)
- [ ] Ejecutar `scripts/verificar-migracion-d01.sql` en Supabase SQL editor
- [ ] Documentar resultados en REVIEW_v3-redefinicion-roles-estado.md

---

## Spec D-02 — Tipos de documento DB y reglas de nivel configurables

### Login como ESTADO (anabelen.torres@pdt.org.ar / pdt2026)
1. [ ] /estado/documentos muestra puntos por tipo (15 pts PLATA, 20 pts ORO)
2. [ ] Editar un tipo → cambiar puntos → guardar → cambio persistido
3. [ ] /estado/configuracion-niveles muestra 3 cards (BRONCE 0 pts, PLATA 50 pts, ORO 100 pts)
4. [ ] Editar regla PLATA → click "Ver impacto" → muestra preview de talleres afectados
5. [ ] Sidebar ESTADO muestra item "Niveles"

### Login como TALLER (roberto.gimenez@pdt.org.ar / pdt2026)
6. [ ] Dashboard muestra desglose de puntaje sin error
7. [ ] Los puntos reflejan los valores de DB (no el fijo de 10)

### Login como ADMIN (lucia.fernandez@pdt.org.ar / pdt2026)
8. [ ] Puede VER /estado/configuracion-niveles (lectura)

### Post-migracion (solo produccion)
- [ ] Ejecutar `scripts/verificar-migracion-d02.sql` en Supabase SQL editor
- [ ] Ejecutar `npx tsx tools/recalcular-niveles.ts --dry-run` para verificar impacto
- [ ] Documentar resultados en REVIEW_v3-tipos-documento-db.md

---

## Spec Q-01 — Tests E2E Playwright

### Suite completo (local 2026-04-29)

- [x] 49 tests totales, 43 passed, 4 skipped, 2 flaky bajo carga — Gerardo 29/4
- [x] Nuevos: registro-taller, registro-marca, auth-roles, flujo-comercial, aprobacion-documento — Gerardo 29/4
- [x] data-* attributes agregados a 7 componentes — Gerardo 29/4
- [x] Tests pre-existentes corregidos (configuracion-niveles strict mode, sidebar count 9) — Gerardo 29/4
- [ ] Verificar que CI (GitHub Actions) pasa con el suite completo
- [ ] Verificar que branch protection bloquea merge si tests fallan

---

## Spec Q-02 — Error Boundaries

### Verificacion en plataforma-textil-dev.vercel.app (DEV)

- [ ] Ruta inexistente `/ruta-que-no-existe` muestra pagina 404 amigable con "Volver al inicio"
- [ ] Ruta inexistente `/admin/ruta-que-no-existe` (login admin) muestra 404, "Volver al inicio" lleva a /admin
- [ ] Ruta inexistente `/taller/ruta-que-no-existe` (login taller) muestra 404, "Volver al inicio" lleva a /taller
- [ ] Ruta inexistente `/marca/ruta-que-no-existe` (login marca) muestra 404, "Volver al inicio" lleva a /marca
- [ ] Ruta inexistente `/estado/ruta-que-no-existe` (login estado) muestra 404, "Volver al inicio" lleva a /estado

### Tests automatizados

- [x] 11 Vitest tests (error-logger + log-error-route) — Gerardo 29/4
- [x] 4 E2E tests (error-boundaries.spec.ts) — Gerardo 29/4
- [x] TypeScript 0 errores — Gerardo 29/4
- [ ] Verificar que CI (GitHub Actions) pasa con los tests nuevos

---

## Spec Q-03 — Errores consistentes en APIs

### Tests automatizados

- [x] 27 Vitest tests (api-errors + api-client) — Gerardo 29/4
- [x] TypeScript 0 errores — Gerardo 29/4
- [x] 11 endpoints migrados al formato V3 — Gerardo 29/4
- [x] 10 frontends actualizados con getErrorMessage — Gerardo 29/4
- [ ] Verificar que CI (GitHub Actions) pasa

### Verificacion funcional en plataforma-textil-dev.vercel.app (DEV)

- [ ] Registro con email invalido → error amigable (no "Internal Server Error")
- [ ] Registro duplicado → "El email ya esta registrado" (no crash)
- [ ] Flujo comercial completo (crear pedido → cotizar → aceptar) funciona sin errores
- [ ] Asistente RAG responde o muestra "no disponible" correctamente
- [ ] Feedback widget envia sin error

### Deuda documentada

- 57 endpoints con formato legacy quedan para V4 T-08 (~10h)
- 18 frontends con `data.error` legacy se migran con T-08

---

## Spec INT-00 — Acceso pre-formalizacion y niveles privados

### Criticidad: ALTA — este spec define las restricciones de acceso para talleres no verificados y la privacidad de niveles

### Verificacion de niveles ocultos

1. [ ] /directorio (sin login) — NO hay filtro de nivel, NO hay badges BRONCE/PLATA/ORO
2. [ ] /directorio (sin login) — talleres muestran "N credenciales verificadas" en vez de nivel
3. [ ] /perfil/[id] (sin login) — NO hay badge de nivel, SI hay credenciales individuales (CUIT verificado, ART, etc.)
4. [ ] /marca/directorio (login marca) — NO hay filtro de nivel, NO hay badges de nivel
5. [ ] /marca/directorio/[id] (login marca) — NO hay badge de nivel, SI hay credenciales individuales
6. [ ] /marca/pedidos/[id] (login marca) — cotizaciones NO muestran badge de nivel
7. [ ] /marca/pedidos/[id] (login marca) — ordenes NO muestran "(BRONCE/PLATA/ORO)" junto al nombre
8. [ ] Boton "Invitar a cotizar" (login marca) — talleres en lista NO muestran badge de nivel
9. [ ] PDF orden de manufactura — descargar y verificar que NO aparece "Nivel PDT"
10. [ ] /taller (login taller) — SI muestra nivel propio en dashboard
11. [ ] /taller/formalizacion (login taller) — SI muestra nivel propio
12. [ ] /estado/talleres (login estado) — SI muestra niveles de todos los talleres

### Verificacion de acceso restringido (requiere taller con verificadoAfip: false)

13. [ ] Dashboard taller no verificado muestra banner amber "en proceso de formalizacion"
14. [ ] Pedidos disponibles para taller no verificado muestra banner + boton dice "Ver detalle" (no "Ver y cotizar")
15. [ ] Pagina de detalle de pedido para taller no verificado muestra banner en vez de form cotizacion
16. [ ] Banner tiene link funcional a /taller/formalizacion

### Verificacion ESTADO

17. [ ] /estado/talleres tiene filtro "Verificacion AFIP" con opciones Verificados/Sin verificar
18. [ ] Filtro "Sin verificar" muestra solo talleres con verificadoAfip: false
19. [ ] Stat card "Sin verificar" muestra conteo correcto
20. [ ] Badge "Sin verificar" aparece junto al CUIT de talleres no verificados

### Tests automatizados

- [x] 6 Vitest tests (acceso-verificado.test.ts) — Gerardo 29/4
- [x] 3 E2E tests (acceso-verificado.spec.ts) — Gerardo 29/4
- [x] TypeScript 0 errores — Gerardo 29/4
- [x] 210/210 tests pasan en suite completo — Gerardo 29/4
- [ ] Verificar que CI (GitHub Actions) pasa

### Como ejecutar (items 13-16)

> Los items 13-16 requieren un taller con verificadoAfip: false. Si todos los talleres del seed estan verificados, se puede testear:
> 1. Via Supabase SQL: `UPDATE "Taller" SET "verificadoAfip" = false WHERE cuit = '20-30123456-7'` (taller de prueba)
> 2. Verificar items 13-16
> 3. Revertir: `UPDATE "Taller" SET "verificadoAfip" = true WHERE cuit = '20-30123456-7'`

---

## Spec INT-01 — Integracion completa ARCA/AFIP

### Pruebas en plataforma-textil-dev.vercel.app (DEV)

- [ ] Registro taller: verificar que al ingresar CUIT valido, el campo "Razon social" se autocompleta desde ARCA
- [ ] Registro taller: ingresar CUIT inexistente (ej: 99-99999999-9), verificar mensaje "No encontramos este CUIT en ARCA"
- [ ] Registro taller: verificar que CUIT inactivo muestra mensaje con email de soporte (gbreard@gmail.com)
- [ ] ESTADO > Talleres: card "Verificacion ARCA" muestra conteos correctos
- [ ] ESTADO > Talleres: boton "Sincronizar todos con ARCA" funciona y muestra resultado
- [ ] ESTADO > Talleres > [taller]: tab "Datos del taller" muestra seccion ARCA con tipo inscripcion, actividades, domicilio
- [ ] ESTADO > Talleres > [taller]: boton "Re-verificar contra ARCA" funciona
- [ ] Directorio publico: talleres verificados aparecen primero
- [ ] Directorio publico: badge "Verificado por ARCA" visible en tarjetas
- [ ] Directorio marca: mismo comportamiento que directorio publico
- [ ] Perfil publico: badge "Verificado por ARCA" visible
- [ ] ConsultaArca: verificar en Supabase que cada consulta crea un registro

### Pruebas de seguridad

- [ ] TALLER no puede acceder a /api/estado/arca (debe retornar 403)
- [ ] MARCA no puede acceder a /api/estado/arca/reverificar/[id] (debe retornar 403)

### Como ejecutar

> **Importante:** esta spec usa AfipSDK con plan Pro. En dev/preview el provider puede ser 'mock' o 'afipsdk' segun ARCA_ENABLED.
> 1. Para probar con mock: verificar que ARCA_ENABLED=true y ARCA_PROVIDER=mock en Vercel
> 2. Para probar con ARCA real: ARCA_ENABLED=true y ARCA_PROVIDER=afipsdk (requiere las 3 vars AFIP_*)

---

## Spec INT-02 — Email Resend

### Pruebas en plataforma-textil-dev.vercel.app (DEV)

- [ ] Magic link: ir a /login, ingresar gbreard@gmail.com, verificar que llega el email en menos de 30s
- [ ] Magic link: click en el boton del email, verificar que redirige a la plataforma logueado
- [ ] Bienvenida taller: registrar taller nuevo con gbreard@gmail.com, verificar email de bienvenida
- [ ] Bienvenida marca: registrar marca nueva con gbreard@gmail.com, verificar email de bienvenida
- [ ] Contenido: verificar que emails tienen header azul PDT, boton funcional, footer correcto
- [ ] Spam: verificar que emails NO caen en carpeta spam
- [ ] Error silencioso: si Resend falla, el registro/login debe completarse igual (solo falla el email)

### Limitaciones conocidas

> **Dominio testing:** `onboarding@resend.dev` solo envia a `gbreard@gmail.com`. Para el piloto se necesita dominio propio verificado con DKIM/SPF.

---

## Spec F-05 — Dashboard de demanda insatisfecha

### Tests automatizados

- [x] 11 Vitest tests (demanda-insatisfecha.test.ts) — Gerardo 4/5
- [x] 6 Vitest tests (notificaciones-matching.test.ts) — Gerardo 4/5
- [x] TypeScript 0 errores — Gerardo 4/5
- [x] 259/259 tests pasan en suite completo — Gerardo 4/5
- [ ] 6 E2E tests (demanda-insatisfecha.spec.ts) — pendiente CI
- [ ] Verificar que CI (GitHub Actions) pasa con los tests nuevos

### Verificacion funcional en plataforma-textil-dev.vercel.app (DEV)

- [ ] /estado/demanda-insatisfecha carga sin error (login ESTADO)
- [ ] Tab "Demanda insatisfecha" visible en nav ESTADO
- [ ] Stats cards muestran datos correctos (o 0 si no hay motivos)
- [ ] Barras de motivos clickeables, llevan a vista detallada
- [ ] Vista detallada por categoria muestra tabla con pedidos
- [ ] Vista "talleres cerca" muestra tabla con talleres y detalle
- [ ] Export CSV descarga archivo con headers correctos
- [ ] TALLER no puede acceder a /estado/demanda-insatisfecha (403/redirect)
- [ ] ADMIN puede acceder a /estado/demanda-insatisfecha (lectura)
- [ ] Loading skeleton visible durante carga

### Verificacion de integracion matching

- [ ] Publicar pedido que no encuentre talleres PLATA/ORO → verificar en DB que se creo MotivoNoMatch
- [ ] Publicar pedido con procesosRequeridos inexistentes → verificar que motivo es SIN_TALLERES_PROCESO

---

## Spec UX-mejoras — Mejoras UX (UX-01 a UX-04)

### UX-01 — Estados de carga

- [ ] Suspense fallback visible en taller/pedidos/disponibles (throttle network, recargar)
- [ ] Suspense fallback visible en taller/pedidos
- [ ] Suspense fallback visible en admin/auditorias
- [ ] Suspense fallback visible en marca/pedidos
- [ ] Loading component funciona en sus 3 variantes (spinner, fullPage, inline)

### UX-02 — Estados vacios

- [ ] EmptyState con CTA en taller/pedidos (link a pedidos disponibles)
- [ ] EmptyState sin CTA en admin/talleres (filtro sin resultados)
- [ ] EmptyState en marca/pedidos/[id] seccion cotizaciones (cuando no hay)
- [ ] EmptyState en admin/notificaciones (sin comunicaciones)
- [ ] EmptyState en cuenta/notificaciones

### UX-03 — Toasts y errores

- [ ] Toast de exito al publicar pedido (sin alert nativo)
- [ ] Toast de exito al aceptar cotizacion
- [ ] Toast de exito al enviar cotizacion
- [ ] Toast warning al contactar taller sin telefono (sin alert nativo)
- [ ] Toast error en completar perfil (sin alert nativo)
- [ ] Toast warning con description en cotizar-form (409 CONFLICT)
- [ ] 4+ toasts simultaneos: solo 3 visibles
- [ ] Toast con action button funciona

### UX-04 — Breadcrumbs

- [ ] Breadcrumbs en admin/talleres/[id] (Admin > Talleres > {nombre})
- [ ] Breadcrumbs en admin/marcas/[id] (Admin > Marcas > {nombre})
- [ ] Breadcrumbs en marca/pedidos/[id] (Marca > Pedidos > {omId})
- [ ] Breadcrumbs en taller/pedidos/disponibles/[id] (Taller > Pedidos disponibles > {prenda})
- [ ] Breadcrumbs en taller/pedidos/[id] (Taller > Mis ordenes > {moId})
- [ ] Breadcrumbs mobile: solo muestra link al padre
- [ ] No queda patron ArrowLeft/Volver en paginas de detalle

---

## Spec F-04 — Exportes del Estado

### Exportes individuales

- [ ] Descargar talleres CSV — verificar columnas ARCA (verificadoAfip, tipoInscripcion, categoriaMonotributo, estadoCuit)
- [ ] Descargar talleres Excel — verificar formato (headers bold, filas alternadas, columnas auto-ajustadas)
- [ ] Descargar marcas CSV — verificar campos nuevos (verificado ARCA, pedidos sin cotizaciones)
- [ ] Descargar validaciones CSV — verificar historial aprobaciones/rechazos con aprobador
- [ ] Descargar demanda insatisfecha CSV — verificar motivos y talleres cerca

### Informe mensual

- [ ] Generar informe mensual completo (Excel con 7 hojas)
- [ ] Verificar portada con titulo y fecha
- [ ] Verificar que cada hoja tiene headers formateados y datos del mes
- [ ] Verificar que se puede abrir en Excel y LibreOffice sin errores

### Filtros

- [ ] Filtro por provincia en talleres — verificar que CSV solo contiene talleres de esa provincia
- [ ] Filtro por nivel en talleres — verificar que CSV solo contiene talleres de ese nivel
- [ ] Filtro por periodo (mes actual) — verificar que CSV solo contiene registros del mes

### UI y feedback

- [ ] Breadcrumbs en /estado/exportar (Estado > Exportar)
- [ ] Toast de exito al descargar reporte
- [ ] Toast de error si hay problema de conexion
- [ ] Tarjetas por tipo de reporte visibles
- [ ] Seccion destacada para informe mensual visible

### Seguridad

- [ ] TALLER no puede acceder a /api/estado/exportar (403)
- [ ] MARCA no puede acceder a /api/estado/exportar (403)
- [ ] Caracteres especiales (ñ, tildes) se muestran correctamente en CSV abierto con Excel

---

## Spec F-02 — WhatsApp notificaciones

### Magic links

- [ ] Magic link valido auto-loguea y redirige al destino correcto
- [ ] Magic link expirado (>24h) redirige a /login?error=link_expirado
- [ ] Magic link usado dos veces: primera auto-loguea, segunda redirige sin login
- [ ] Magic link invalido redirige a /login?error=link_invalido
- [ ] Sesion creada por magic link tiene role y registroCompleto correctos

### WhatsApp triggers

- [ ] Pedido nuevo genera MensajeWhatsapp en DB para talleres compatibles
- [ ] Cotizacion aceptada genera MensajeWhatsapp
- [ ] Documento aprobado genera Notificacion in-app + MensajeWhatsapp
- [ ] Documento rechazado genera Notificacion in-app + MensajeWhatsapp
- [ ] Nivel subido genera Notificacion in-app + MensajeWhatsapp
- [ ] Mensaje admin genera MensajeWhatsapp para cada destinatario

### UI

- [ ] Wizard secuencial en admin/notificaciones — 1 chat por click
- [ ] Boton "Abrir chat" abre wa.me en nueva pestana
- [ ] Boton "Copiar mensaje" copia al clipboard
- [ ] Checkbox "Marcar como enviado" actualiza estado en DB
- [ ] Formulario /cuenta phone + toggle WhatsApp funcional
- [ ] Campo "Telefono WhatsApp" en registro con tooltip educativo

### Casos borde

- [ ] User sin phone: evento dispara, WhatsApp NO se genera, Notificacion in-app SI
- [ ] Phone invalido rechazado con error en /cuenta
- [ ] Toggle WhatsApp desactivado: no se generan MensajeWhatsapp

---

## Nota tecnica: E2E tests crean issues reales en GitHub

Los tests E2E de rate limiting (S-02) envian requests POST a `/api/feedback` que crea issues reales en GitHub. Cada corrida de CI genera ~11 issues basura con titulo "Test rate limit intento N". Esto contamina el panel de issues y el conteo del QA index.

**Solucion pendiente (Bloque 4 o V4):** cambiar el E2E de rate limiting para que use un endpoint que no cree issues reales, o mockear la creacion de issues en el handler de feedback cuando detecta body invalido.
