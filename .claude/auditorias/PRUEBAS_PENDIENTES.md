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
