# QA: Config Piloto Pre-Deploy

**Spec:** `v2-config-piloto-pre-deploy.md`
**Commit de implementacion:** `ccf8643` (fix tildes) + bucket confirmado existente
**URL de prueba:** https://plataforma-textil.vercel.app
**Fecha:** 2026-04-13
**Auditor:** Sergio

---

## Como trabajar con este documento

Este documento es tu guia de navegacion para auditar el spec implementado.

**Lo que necesitas:**

- Este documento abierto en una pestana
- La plataforma abierta en otra pestana: https://plataforma-textil.vercel.app

**Como reportar hallazgos:**

1. Cuando encuentres algo que no funciona o falta — quedate en esa pagina de la plataforma
2. Abri el widget azul "Feedback" en el angulo inferior derecho
3. Si estas sin login: completa tu nombre y selecciona el rol que estas probando
4. Selecciona el tipo de hallazgo:
   - **bug** — algo que deberia funcionar y no funciona
   - **falta** — algo prometido en el spec que no esta implementado
   - **mejora** — funciona pero podria ser mejor
   - **confusion** — la UI no es clara
5. Describi: que esperabas ver + que viste en cambio
6. Envia — queda registrado automaticamente

**Regla de oro:** un reporte por hallazgo. No acumules varios problemas en un solo mensaje.

**No necesitas editar este documento.** Solo segui los pasos y reporta con el widget.

> **Nota:** si los hallazgos no aparecen en GitHub Issues, verificar que `GITHUB_TOKEN` y `GITHUB_REPO` estan configurados en Vercel. Los hallazgos siempre quedan registrados en la DB aunque el token no este configurado — se pueden ver en `/admin` desde `LogActividad`.

---

## Resultado global

- [ ] Aprobado — todo funciona
- [ ] Aprobado con fixes — funciona pero hay bugs menores
- [ ] Rechazado — falta funcionalidad o hay bugs bloqueantes

**Decision:** [ cerrar v2 / fix inmediato / abrir item v3 ]
**Issues abiertos:** #

---

## Credenciales de prueba

| Rol | Email | Password | URL de entrada |
|-----|-------|----------|----------------|
| ADMIN | `lucia.fernandez@pdt.org.ar` | `pdt2026` | `/admin` |
| TALLER Bronce | `roberto.gimenez@pdt.org.ar` | `pdt2026` | `/taller` |
| TALLER Plata | `graciela.sosa@pdt.org.ar` | `pdt2026` | `/taller` |
| TALLER Oro | `carlos.mendoza@pdt.org.ar` | `pdt2026` | `/taller` |
| MARCA | `martin.echevarria@pdt.org.ar` | `pdt2026` | `/marca` |
| ESTADO | `anabelen.torres@pdt.org.ar` | `pdt2026` | `/estado` |
| CONTENIDO | `sofia.martinez@pdt.org.ar` | `pdt2026` | `/contenido` |
| Sin login | — | — | `/` |

---

## Eje 1 — Funcionalidad

Verificar que cada criterio de aceptacion del spec esta implementado.

| # | Criterio | Resultado | Issue |
|---|----------|-----------|-------|
| 1 | Los 5 nombres en `/acceso-rapido` muestran tildes correctas | | |
| 2 | Bucket `documentos` existe en Supabase (privado) | | |
| 3 | Feature flag `academia` activo en `/admin/configuracion?tab=features` | | |
| 4 | `ANTHROPIC_API_KEY` y `VOYAGE_API_KEY` configuradas en Vercel (pendiente Gerardo) | | |
| 5 | Widget de feedback funciona sin sesion activa | | |
| 6 | Widget de feedback funciona con sesion activa | | |

---

## Eje 2 — Navegabilidad

Pasos de navegacion a seguir en orden. Cada paso es una accion concreta.

### Paso 1 — Verificar nombres con tildes en acceso rapido

- **Rol:** Sin login
- **URL de inicio:** https://plataforma-textil.vercel.app/acceso-rapido
- **Accion:** Abrir la pagina y leer los nombres de los 7 usuarios listados
- **Esperado:** Los siguientes 5 nombres deben mostrar tildes correctas:
  - Lucia Fernandez → **Lucia Fernandez** (con tilde en i y a)
  - Roberto Gimenez → **Roberto Gimenez** (con tilde en la e)
  - Martin Echevarria → **Martin Echevarria** (con tilde en i y en la segunda i)
  - Ana Belen Torres → **Ana Belen Torres** (con tilde en la e)
  - Sofia Martinez → **Sofia Martinez** (con tilde en i y en i)
  - Graciela Sosa y Carlos Mendoza **sin tildes** (correcto asi)
- **Resultado:** [ ]
- **Notas:**

> Si algun nombre no tiene tildes → abrir widget → tipo **bug** → describir cual nombre falta

### Paso 2 — Login con Lucia Fernandez (ADMIN)

- **Rol:** Sin login
- **URL de inicio:** https://plataforma-textil.vercel.app/acceso-rapido
- **Accion:** Click en la tarjeta de Lucia Fernandez. Esperar a que cargue.
- **Esperado:** Redirige a `/admin`. Se ve el panel de administracion. El nombre "Lucia Fernandez" aparece en el sidebar o header.
- **Resultado:** [ ]
- **Notas:**

### Paso 3 — Login con Roberto Gimenez (TALLER BRONCE)

- **Rol:** Sin login
- **URL de inicio:** https://plataforma-textil.vercel.app/acceso-rapido
- **Accion:** Si tenes sesion activa, primero cerrar sesion. Luego click en Roberto Gimenez.
- **Esperado:** Redirige a `/taller`. Se ve el dashboard de taller.
- **Resultado:** [ ]
- **Notas:**

### Paso 4 — Login con Graciela Sosa (TALLER PLATA)

- **Rol:** Sin login
- **URL de inicio:** https://plataforma-textil.vercel.app/acceso-rapido
- **Accion:** Cerrar sesion anterior. Click en Graciela Sosa.
- **Esperado:** Redirige a `/taller`. Se ve el dashboard de taller.
- **Resultado:** [ ]
- **Notas:**

### Paso 5 — Login con Carlos Mendoza (TALLER ORO)

- **Rol:** Sin login
- **URL de inicio:** https://plataforma-textil.vercel.app/acceso-rapido
- **Accion:** Cerrar sesion anterior. Click en Carlos Mendoza.
- **Esperado:** Redirige a `/taller`. Se ve el dashboard de taller.
- **Resultado:** [ ]
- **Notas:**

### Paso 6 — Login con Martin Echevarria (MARCA)

- **Rol:** Sin login
- **URL de inicio:** https://plataforma-textil.vercel.app/acceso-rapido
- **Accion:** Cerrar sesion anterior. Click en Martin Echevarria.
- **Esperado:** Redirige a `/marca`. Se ve el panel de marca.
- **Resultado:** [ ]
- **Notas:**

### Paso 7 — Login con Ana Belen Torres (ESTADO)

- **Rol:** Sin login
- **URL de inicio:** https://plataforma-textil.vercel.app/acceso-rapido
- **Accion:** Cerrar sesion anterior. Click en Ana Belen Torres.
- **Esperado:** Redirige a `/estado`. Se ve el dashboard del sector.
- **Resultado:** [ ]
- **Notas:**

### Paso 8 — Login con Sofia Martinez (CONTENIDO)

- **Rol:** Sin login
- **URL de inicio:** https://plataforma-textil.vercel.app/acceso-rapido
- **Accion:** Cerrar sesion anterior. Click en Sofia Martinez.
- **Esperado:** Redirige a `/contenido/colecciones`. Se ve el panel de contenido.
- **Resultado:** [ ]
- **Notas:**

### Paso 9 — Widget de feedback sin login

- **Rol:** Sin login (abrir pestana de incognito)
- **URL de inicio:** https://plataforma-textil.vercel.app/
- **Accion:**
  1. Verificar que el boton azul "Feedback" aparece en el angulo inferior derecho
  2. Click en el boton
  3. Verificar que aparecen los campos "Tu nombre" y "Rol que estas probando" arriba de los tipos de reporte
  4. Completar: nombre "Sergio QA", rol "Sin login / visitante"
  5. Seleccionar tipo "mejora"
  6. Escribir: "Test de feedback sin login — ignorar este reporte"
  7. Click en "Enviar feedback"
- **Esperado:** Aparece el mensaje de confirmacion "Gracias por tu feedback!" con el icono verde. Despues de 2 segundos el widget se cierra solo.
- **Resultado:** [ ]
- **Notas:**

### Paso 10 — Widget de feedback con login

- **Rol:** TALLER Plata (Graciela Sosa)
- **URL de inicio:** https://plataforma-textil.vercel.app/acceso-rapido
- **Accion:**
  1. Login como Graciela Sosa
  2. En `/taller`, verificar que el boton azul "Feedback" aparece en el angulo inferior derecho
  3. Click en el boton
  4. Verificar que **NO** aparecen los campos "Tu nombre" ni "Rol" (porque ya estas logueada)
  5. Seleccionar tipo "mejora"
  6. Escribir: "Test de feedback con login — ignorar este reporte"
  7. Click en "Enviar feedback"
- **Esperado:** Aparece "Gracias por tu feedback!" y se cierra. Los campos de nombre y rol no deben estar visibles cuando hay sesion activa.
- **Resultado:** [ ]
- **Notas:**

### Paso 11 — Subir documento de formalizacion (bucket documentos)

- **Rol:** TALLER Plata (Graciela Sosa)
- **URL de inicio:** https://plataforma-textil.vercel.app/taller/formalizacion
- **Accion:**
  1. Login como Graciela Sosa
  2. Ir a `/taller/formalizacion`
  3. Buscar cualquier tipo de documento (ej: CUIT/Monotributo o el que este disponible)
  4. Click en "Subir documento" o el boton equivalente
  5. Seleccionar un archivo PDF de prueba (o imagen JPG/PNG)
  6. Confirmar la subida
- **Esperado:** El documento se sube sin error. No debe aparecer "Bucket not found" ni error de storage. El documento queda visible con estado "Pendiente de revision".
- **Resultado:** [ ]
- **Notas:**

> Si ves "Bucket not found" → abrir widget → tipo **bug** → describir "Error de storage al subir documento de formalizacion"

### Paso 12 — Verificar documento subido desde admin

- **Rol:** ADMIN (Lucia Fernandez)
- **URL de inicio:** https://plataforma-textil.vercel.app/admin/talleres
- **Accion:**
  1. Login como Lucia Fernandez
  2. Ir a `/admin/talleres`
  3. Buscar el taller de Graciela Sosa ("Cooperativa Hilos del Sur")
  4. Click para ver el detalle
  5. Ir a la pestana "Documentos" o "Formalizacion"
  6. Buscar el documento subido en el paso anterior
  7. Click en "Ver documento"
- **Esperado:** El documento se abre o descarga sin error 403 ni "archivo no encontrado".
- **Resultado:** [ ]
- **Notas:**

> **Nota:** el bucket es privado actualmente. Si el documento no se puede visualizar (error 403), reportar como **bug** — se resolvera en el spec de storage-documentos.

### Paso 13 — Feature flags en admin (si Gerardo ya los activo)

- **Rol:** ADMIN (Lucia Fernandez)
- **URL de inicio:** https://plataforma-textil.vercel.app/admin/configuracion?tab=features
- **Accion:**
  1. Login como Lucia Fernandez
  2. Ir a `/admin/configuracion?tab=features`
  3. Verificar que existe el toggle "Academia"
  4. Verificar si esta activo o inactivo
- **Esperado:** El toggle de Academia existe y se puede cambiar. Si Gerardo ya lo activo, debe estar en "Activo".
- **Resultado:** [ ]
- **Notas:** Si el toggle no existe o la pagina da error → reportar como **bug**

---

## Eje 3 — Casos borde

| # | Caso | Accion | Esperado | Resultado |
|---|------|--------|----------|-----------|
| 1 | Feedback sin nombre (sin login) | Abrir widget sin login, dejar nombre vacio, intentar enviar | Debe mostrar error "Ingresa tu nombre (al menos 2 caracteres)" | |
| 2 | Feedback con mensaje corto | Seleccionar un tipo, escribir menos de 10 caracteres, enviar | Debe mostrar error "Elegi un tipo y escribi al menos 10 caracteres" | |
| 3 | Feedback sin tipo seleccionado | Escribir mensaje largo pero no seleccionar tipo, enviar | Debe mostrar error de validacion | |
| 4 | Login con credenciales incorrectas | Ir a `/login`, usar email correcto pero password incorrecto | No debe loguearse, debe mostrar error | |

---

## Eje 4 — Performance

| Verificacion | Metodo | Resultado |
|-------------|--------|-----------|
| `/acceso-rapido` carga en menos de 3 segundos | Abrir DevTools → Network → recargar | |
| Widget de feedback abre sin delay visible | Click en boton azul, medir tiempo de apertura | |
| Sin errores en consola del browser | DevTools → Console → revisar en `/acceso-rapido` y `/taller` | |
| Funciona en movil (responsive) | DevTools → Toggle device toolbar → verificar `/acceso-rapido` | |

---

## Eje 5 — Consistencia visual

| Verificacion | Resultado | Notas |
|-------------|-----------|-------|
| Nombres con tildes se renderizan bien (no aparecen caracteres rotos) | | |
| Widget de feedback usa colores brand-blue | | |
| Widget se posiciona correctamente en mobile (no tapa contenido) | | |
| Campos de nombre y rol del widget tienen estilo consistente | | |
| Textos del widget en espanol argentino (vos/tenes) | | |

---

## Resumen de issues abiertos

| Issue | Tipo | Descripcion | Prioridad sugerida |
|-------|------|-------------|-------------------|
| | | | |

---

## Notas del auditor

[Observaciones generales, sugerencias de UX, contexto adicional que no entra en los ejes anteriores]

---

## Checklist de cierre

- [ ] Nombres con tildes verificados en `/acceso-rapido`
- [ ] Login funcional con las 7 credenciales del seed
- [ ] Widget de feedback funciona sin login (campos nombre + rol visibles)
- [ ] Widget de feedback funciona con login (sin campos extra)
- [ ] Subida de documento de formalizacion probada
- [ ] Visualizacion de documento desde admin probada
- [ ] Feature flags revisados en `/admin/configuracion`
- [ ] Casos borde probados
- [ ] Performance revisada en desktop y movil
- [ ] Issues abiertos en GitHub con labels correctos
- [ ] Resultado global definido
- [ ] Documento commiteado a develop
