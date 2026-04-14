# QA: Épica Perfiles y Contacto

**Spec:** `v2-epica-perfiles-contacto.md`
**Commit de implementación:** `89bce8b`
**URL de prueba:** https://plataforma-textil.vercel.app
**Fecha:** 2026-04-14
**Auditor:** Sergio

---

## Cómo trabajar con este documento

1. Abrí este archivo y la plataforma en paralelo
2. Seguí los pasos en orden — cada paso depende del anterior
3. Marcá cada resultado con ✅ (ok), 🐛 (bug menor) o ❌ (bloqueante)
4. Si el resultado no es ✅ → abrí el widget azul "Feedback" en esa página → tipo [bug/falta] → describí qué pasó
5. Quedate en la página donde encontraste el problema antes de abrir el widget (captura la URL automáticamente)
6. Al terminar, completá el resultado global y commiteá este archivo actualizado

**Regla de oro:** un issue por hallazgo, desde la página donde ocurre.

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

---

## Resultado global

- [ ] ✅ Aprobado — todo funciona
- [ ] 🔧 Aprobado con fixes — funciona pero hay bugs menores
- [ ] ❌ Rechazado — falta funcionalidad o hay bugs bloqueantes

**Decisión:** [ cerrar v2 / fix inmediato / abrir ítem v3 ]
**Issues abiertos:** #

---

## Eje 1 — Funcionalidad

Verificar que cada criterio de aceptación del spec está implementado.

| # | Criterio | Resultado | Issue |
|---|----------|-----------|-------|
| 1 | El botón "Editar" en `/taller/perfil` se reemplaza por dos: "Editar datos básicos" y "Perfil productivo" | | |
| 2 | `/taller/perfil/editar` carga con los datos actuales del taller y del responsable | | |
| 3 | El form permite cambiar: nombre del taller, ubicación, zona, descripción, año de fundación, nombre del responsable, teléfono | | |
| 4 | El email es read-only en el form con nota explicativa | | |
| 5 | "Guardar cambios" actualiza correctamente Taller + User en la DB (en transacción atómica) | | |
| 6 | `/admin/talleres/[id]` muestra Card "Responsable / Contacto" con nombre, email (mailto:), teléfono (tel:), fecha de registro | | |
| 7 | `/admin/marcas/[id]` muestra la misma Card con los mismos datos + website clickeable si existe | | |
| 8 | Badge "Datos de contacto incompletos" aparece cuando faltan `user.name`, `user.phone` o `taller.ubicacion` | | |
| 9 | El campo `puntaje` ya no está en la allowlist del endpoint `PUT /api/talleres/[id]` | | |
| 10 | `PUT /api/talleres/[id]` con `{ puntaje: 100 }` devuelve 200 pero el puntaje NO cambia en DB | | |
| 11 | Build de TypeScript pasa sin errores | | |

---

## Eje 2 — Navegabilidad

### Paso 1 — TALLER ve dos botones en el perfil

- **Rol:** TALLER Bronce (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/taller/perfil`
- **Acción:**
  1. Login como Roberto Giménez (TALLER Bronce)
  2. Ir a `/taller/perfil`
  3. Mirar la esquina superior derecha del header del perfil
- **Esperado:** Hay DOS botones visibles:
  - "Editar datos básicos" (variant secondary, más prominente)
  - "Perfil productivo" (variant ghost, más sutil)
  - Ya NO existe el botón único "Editar" con ícono de lápiz
- **Resultado:**
- **Notas:** Si solo hay un botón, el cambio en `page.tsx` no se deployó

### Paso 2 — TALLER abre formulario de edición básica

- **Rol:** TALLER Bronce (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/taller/perfil`
- **Acción:**
  1. Click en "Editar datos básicos"
  2. Verificar que navega a `/taller/perfil/editar`
  3. Verificar los campos del formulario
- **Esperado:** El formulario tiene dos secciones:
  - **Datos de la empresa:** Nombre del taller (con valor actual), Ubicación, Zona / Barrio, Descripción del taller (textarea), Año de fundación (input numérico)
  - **Datos del responsable:** Nombre completo, Teléfono de contacto, Email (deshabilitado, gris)
  - Todos los campos con valor actual se muestran pre-cargados
  - Link "← Volver al perfil" arriba del título
- **Resultado:**
- **Notas:** Si los datos no se pre-cargan (campos vacíos cuando el taller tiene datos), el server component no está pasando los props correctamente

### Paso 3 — Email es campo read-only

- **Rol:** TALLER Bronce (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/taller/perfil/editar`
- **Acción:**
  1. Buscar el campo "Email" en la sección "Datos del responsable"
  2. Intentar hacer click y escribir en el campo
- **Esperado:**
  - El campo muestra el email actual (`roberto.gimenez@pdt.org.ar`)
  - Tiene fondo gris claro y texto gris (visualmente deshabilitado)
  - NO se puede editar (atributo `disabled`)
  - Debajo del campo dice: *"El email es tu credencial de login. Para cambiarlo escribí a soporte."*
- **Resultado:**
- **Notas:**

### Paso 4 — TALLER edita datos y guarda

- **Rol:** TALLER Bronce (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/taller/perfil/editar`
- **Acción:**
  1. Cambiar el nombre del taller (ej: agregar " Test" al final)
  2. Agregar o cambiar el teléfono de contacto (ej: "+54 11 9999-0000")
  3. Click en "Guardar cambios"
  4. Verificar que redirige a `/taller/perfil`
  5. Verificar que los cambios se reflejan en la página del perfil
- **Esperado:**
  - Mientras guarda, el botón dice "Guardando..." y está deshabilitado
  - Después de guardar, redirige a `/taller/perfil`
  - El nombre del taller actualizado aparece en el título del perfil
  - El teléfono actualizado aparece en la línea de contacto debajo del nombre
- **Resultado:**
- **Notas:** Después de verificar, volver a editar y restaurar los valores originales para no afectar los pasos siguientes

### Paso 5 — Botón "Perfil productivo" lleva al wizard

- **Rol:** TALLER Bronce (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/taller/perfil`
- **Acción:**
  1. Click en "Perfil productivo"
  2. Verificar el destino
- **Esperado:** Navega a `/taller/perfil/completar` — el wizard de 14 pasos existente. Funciona exactamente como antes, sin cambios
- **Resultado:**
- **Notas:**

### Paso 6 — ADMIN ve Card "Responsable / Contacto" en detalle de taller

- **Rol:** ADMIN (lucia.fernandez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/admin/talleres`
- **Acción:**
  1. Cerrar sesión, login como Lucía Fernández (ADMIN)
  2. Ir a `/admin/talleres`
  3. Click en el taller de Roberto Giménez para ver su detalle
- **Esperado:** Debajo de la Card del header y ANTES de los tabs de Formalización, aparece una Card titulada **"Responsable / Contacto"** con:
  - **Responsable:** nombre del responsable (o *"Sin nombre registrado"* en itálica gris si no tiene)
  - **Fecha de registro:** fecha en formato dd/mm/aaaa
  - **Email:** dirección de email en azul, clickeable
  - **Teléfono:** número en azul, clickeable (o *"Sin teléfono"* en itálica gris si no tiene)
- **Resultado:**
- **Notas:** Los datos de email y teléfono en la línea de metadata del header (gris chiquito) se MANTIENEN — no se borraron. La Card es la versión prominente y completa

### Paso 7 — Links de contacto son clickeables

- **Rol:** ADMIN (lucia.fernandez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/admin/talleres/[id]` (detalle de Roberto)
- **Acción:**
  1. Click en el email de la Card "Responsable / Contacto"
  2. Click en el teléfono (si tiene)
- **Esperado:**
  - Click en email → abre cliente de correo con `mailto:roberto.gimenez@pdt.org.ar`
  - Click en teléfono → abre dialer con `tel:` (en desktop puede abrir Skype/Teams, en móvil el teléfono)
  - Ambos links tienen hover underline y color brand-blue
- **Resultado:**
- **Notas:** En algunos navegadores/OS el click en mailto: o tel: puede no hacer nada visible si no hay app asociada — eso es comportamiento del sistema operativo, no un bug

### Paso 8 — Badge "Datos de contacto incompletos"

- **Rol:** ADMIN (lucia.fernandez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/admin/talleres`
- **Acción:**
  1. Buscar un taller que no tenga nombre de responsable, teléfono o ubicación
  2. Entrar a su detalle
  3. Verificar la Card "Responsable / Contacto"
- **Esperado:** Si al taller le falta `user.name`, `user.phone` O `ubicacion`, aparece un badge amarillo debajo de los datos de contacto con ícono de triángulo y texto: *"Datos de contacto incompletos — el taller puede completarlos desde su perfil"*
- **Resultado:**
- **Notas:** Si todos los talleres de seed tienen datos completos, el badge no aparecerá en ninguno — verificar en el Paso 4 dejando el teléfono vacío temporalmente

### Paso 9 — ADMIN ve Card "Responsable / Contacto" en detalle de marca

- **Rol:** ADMIN (lucia.fernandez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/admin/marcas`
- **Acción:**
  1. Ir a `/admin/marcas`
  2. Click en la marca de Martín Echevarría para ver su detalle
- **Esperado:** Debajo de la Card del header y ANTES de los Stats, aparece la misma Card **"Responsable / Contacto"** con:
  - **Responsable:** nombre del responsable
  - **Fecha de registro:** fecha en formato dd/mm/aaaa
  - **Email:** dirección de email clickeable (mailto:)
  - **Teléfono:** número clickeable (tel:) o *"Sin teléfono"*
  - **Website:** URL del website sin el `https://` con ícono Globe, clickeable, abre en nueva pestaña (solo si la marca tiene website)
  - Badge "Datos de contacto incompletos" si faltan `user.name` o `user.phone`
- **Resultado:**
- **Notas:**

### Paso 10 — Verificar fix de seguridad del puntaje

- **Rol:** TALLER Bronce (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/taller/perfil`
- **Acción:**
  1. Cerrar sesión, login como Roberto Giménez (TALLER Bronce)
  2. Ir a `/taller/perfil` y anotar el puntaje actual (sección "Información General" → "Puntaje: X pts")
  3. Abrir DevTools del navegador (F12 o Cmd+Option+I)
  4. Ir a la pestaña **Console**
  5. Primero, obtener el ID del taller — ejecutar:
     ```js
     fetch('/api/talleres').then(r => r.json()).then(d => console.log('ID:', d.talleres?.[0]?.id ?? d[0]?.id ?? d.id))
     ```
  6. Copiar el ID que aparece en la consola
  7. Ejecutar el siguiente comando reemplazando `<ID>` por el ID copiado:
     ```js
     fetch('/api/talleres/<ID>', {
       method: 'PUT',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ puntaje: 999 }),
     }).then(r => r.json()).then(console.log)
     ```
  8. Verificar que la respuesta tiene status 200 (no falla)
  9. Recargar `/taller/perfil` y verificar el puntaje
- **Esperado:**
  - El fetch devuelve 200 con los datos del taller (la request no falla)
  - Pero el puntaje en la página **NO cambió** — sigue siendo el valor original
  - El campo `puntaje` fue eliminado de la allowlist, por lo que el endpoint lo ignora silenciosamente
- **Resultado:**
- **Notas:** Si el puntaje cambió a 999, la allowlist todavía incluye `'puntaje'` — bug de seguridad bloqueante

---

## Eje 3 — Casos borde

| # | Caso | Acción | Esperado | Resultado |
|---|------|--------|----------|-----------|
| 1 | Nombre del taller vacío | En `/taller/perfil/editar`, borrar el nombre → verificar botón | Botón "Guardar cambios" deshabilitado (opacity reducida) | |
| 2 | Email read-only no editable | Intentar escribir en el campo email del form | El campo no acepta input (atributo `disabled`) | |
| 3 | `user.name` vacío en admin | Taller sin nombre de responsable → ver detalle en admin | Muestra *"Sin nombre registrado"* en itálica gris | |
| 4 | `user.phone` vacío en admin | Taller sin teléfono → ver detalle en admin | Muestra *"Sin teléfono"* en itálica gris, sin link `tel:` | |
| 5 | Cancelar edición | En `/taller/perfil/editar`, cambiar datos → click "Cancelar" | Navega a `/taller/perfil` sin guardar cambios | |
| 6 | Marca sin website | En `/admin/marcas/[id]`, marca sin website | La Card no muestra fila de website | |
| 7 | `body.user = null` al endpoint | Enviar `{ user: null }` al PUT | No rompe — `null && typeof null === 'object'` es falsy, ignora silenciosamente | |

---

## Eje 4 — Performance

| Verificación | Método | Resultado |
|-------------|--------|-----------|
| `/taller/perfil/editar` carga en < 3s | DevTools → Network → recargar | |
| Guardar cambios responde en < 2s | Click "Guardar" → medir tiempo hasta redirect | |
| Card "Responsable / Contacto" no agrega latencia visible en admin | Comparar tiempo de carga con/sin la Card | |
| Sin errores en consola del browser | DevTools → Console → revisar en todas las páginas | |
| Funciona en móvil (responsive) | DevTools → Toggle device toolbar → verificar form y Cards | |

---

## Eje 5 — Consistencia visual

| Verificación | Resultado | Notas |
|-------------|-----------|-------|
| Form de edición: secciones con bg-white, rounded-xl, border-gray-100 | | |
| Labels de campos: text-sm font-medium text-gray-700 | | |
| Inputs: border-gray-300, rounded-lg, px-3 py-2 | | |
| Campo email deshabilitado: bg-gray-50, text-gray-400, border-gray-200 | | |
| Botón "Guardar cambios": bg-brand-blue, text-white | | |
| Card "Responsable / Contacto" en admin: misma Card que las demás | | |
| Badge datos incompletos: fondo amber-50, texto amber-600, ícono triángulo | | |
| Links mailto: y tel: en brand-blue con hover:underline | | |
| Tipografías consistentes (Overpass para títulos) | | |
| Textos en español argentino | | |

---

## Resumen de issues abiertos

| Issue | Tipo | Descripción | Prioridad sugerida |
|-------|------|-------------|-------------------|
| — | — | — | — |

---

## Notas del auditor

**Nota sobre el fix de seguridad:** El paso 10 es especialmente importante — verifica que el campo `puntaje` ya no se puede manipular desde el cliente. Antes de este fix, cualquier taller podía auto-asignarse puntaje con un fetch directo, bypaseando el cálculo de `aplicarNivel`. Si el puntaje cambia en el paso 10, es un bug bloqueante.

**Nota sobre la transacción atómica:** El endpoint ahora usa `$transaction`. Si algún paso del PUT falla (ej: user update), todo rollbackea — no quedan datos a medias. Esto no es fácil de testear manualmente, pero se puede verificar indirectamente: si "Guardar cambios" falla, verificar que NINGÚN campo cambió (ni taller ni user).

**Nota sobre datos de seed:** Los talleres y marcas de seed pueden tener todos los datos completos. Para verificar el badge "Datos incompletos" (paso 8), se puede editar temporalmente un taller y dejar el teléfono vacío, luego verificar en el admin.

---

## Checklist de cierre

- [ ] 11 criterios de aceptación del spec verificados
- [ ] 10 pasos de navegación probados (incluyendo test de seguridad)
- [ ] 7 casos borde probados
- [ ] Performance revisada en desktop y móvil
- [ ] Issues abiertos en GitHub con labels correctos
- [ ] Resultado global definido
- [ ] Documento commiteado a develop
