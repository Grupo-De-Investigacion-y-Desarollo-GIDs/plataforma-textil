# QA: Epica Storage y Documentos

**Spec:** `v2-epica-storage-documentos.md`
**Commit de implementacion:** `fed7a93` (9 archivos + migracion + bucket publico)
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
| 1 | 7 TipoDocumento en la DB (sin Certificado ambiental) | | |
| 2 | Cada taller del seed tiene exactamente 7 validaciones (no 13 duplicadas) | | |
| 3 | `/taller/formalizacion` muestra labels legibles desde DB ("Registrate en ARCA", no "CUIT_MONOTRIBUTO") | | |
| 4 | `/taller/formalizacion` denominador del progreso = 7 | | |
| 5 | Admin ve los mismos labels legibles en `/admin/talleres/[id]` | | |
| 6 | Admin puede ver link del documento en estados COMPLETADO, RECHAZADO y VENCIDO (no solo PENDIENTE) | | |
| 7 | Motivo de rechazo es un input libre con `required` (no hardcodeado) | | |
| 8 | Tab "Documentos" eliminado — nuevo tab "Historial" con logs del taller | | |
| 9 | Badge del tab "Formalizacion" muestra contador de pendientes cuando > 0 | | |
| 10 | `calcularNivel` devuelve niveles correctos para los 3 talleres del seed (BRONCE/PLATA/ORO) | | |
| 11 | Taller registrado post-merge tiene 7 validaciones creadas automaticamente | | |
| 12 | Bucket `documentos` es publico en Supabase | | |
| 13 | Build de TypeScript pasa sin errores | | |
| 14 | 26 tests unitarios pasando | | |

---

## Eje 2 — Navegabilidad

Pasos de navegacion a seguir en orden. Cada paso es una accion concreta.

### Paso 1 — Verificar nombres con tildes en acceso rapido

- **Rol:** Sin login
- **URL de inicio:** https://plataforma-textil.vercel.app/acceso-rapido
- **Accion:** Abrir la pagina y leer los nombres de los 7 usuarios
- **Esperado:** Los nombres muestran tildes correctas: Lucia Fernandez (con tildes), Roberto Gimenez (con tilde en e), Martin Echevarria (con tildes), Ana Belen Torres (con tilde en e), Sofia Martinez (con tildes). Graciela Sosa y Carlos Mendoza sin tildes (correcto asi).
- **Resultado:** [ No aparecen tildes en nombres]
- **Notas:**

### Paso 2 — Checklist de formalizacion con labels legibles (TALLER Bronce)

- **Rol:** TALLER Bronce (Roberto Gimenez)
- **URL de inicio:** https://plataforma-textil.vercel.app/acceso-rapido
- **Accion:**
  1. Click en Roberto Gimenez para hacer login
  2. Ir a `/taller/formalizacion`
  3. Verificar que el checklist muestra exactamente **7 items**
  4. Verificar que los labels son legibles en espanol:
     - "Registrate en ARCA" (no "CUIT_MONOTRIBUTO")
     - "Habilita tu local" (no "HABILITACION_MUNICIPAL")
     - "Asegura a tu equipo" (no "ART")
     - "Registra tus empleados"
     - "Habilitacion de bomberos"
     - "Plan de seguridad"
     - "Libro de sueldos digital"
- **Esperado:** 7 items con labels legibles. El progreso muestra `X/7` (no `X/8`). No aparece "Certificacion ambiental".
- **Resultado:** [no carga panel formalizacion, tira erro:Error en Taller
Ocurrio un error cargando esta seccion. Podes reintentar o volver al inicio. ]
- **Notas:**

> Si ves "CUIT_MONOTRIBUTO" o "HABILITACION_MUNICIPAL" → abrir widget → tipo **bug** → describir "Labels en SCREAMING_SNAKE_CASE en vez de texto legible"

### Paso 3 — Enlace al tramite y costo estimado (TALLER Bronce)

- **Rol:** TALLER Bronce (Roberto Gimenez)
- **URL de inicio:** https://plataforma-textil.vercel.app/taller/formalizacion
- **Accion:**
  1. Verificar que "Registrate en ARCA" tiene un boton "Ir al tramite" que apunta a afip.gob.ar
  2. Verificar que debajo del item aparece la descripcion y el texto "Costo: Gratuito"
  3. Verificar que "Habilita tu local" muestra "Costo: Variable segun municipio"
  4. Verificar que "Registra tus empleados" tiene boton "Ir al tramite" (afip.gob.ar)
  5. Verificar que items como "Asegura a tu equipo" o "Plan de seguridad" no tienen boton "Ir al tramite" (porque su enlace es null)
- **Esperado:** Solo los items con enlaceTramite muestran el boton. Todos los items no completados muestran su costo estimado.
- **Resultado:** [no se epuede probar ]
- **Notas:**

### Paso 4 — Subir documento PDF (TALLER Bronce)

- **Rol:** TALLER Bronce (Roberto Gimenez)
- **URL de inicio:** https://plataforma-textil.vercel.app/taller/formalizacion
- **Accion:**
  1. Buscar "Habilita tu local" (estado NO_INICIADO)
  2. Click en el boton de subir documento
  3. Seleccionar un archivo PDF de prueba
  4. Confirmar la subida
- **Esperado:** El documento se sube sin error. El estado cambia a "PENDIENTE" con el texto "En revision por el equipo de PDT". No debe aparecer "Bucket not found" ni error 403.
- **Resultado:** [ no s epuede probar]
- **Notas:**

> Si ves "Bucket not found" o error de storage → abrir widget → tipo **bug** → describir el error exacto

### Paso 5 — Admin ve labels legibles (ADMIN)

- **Rol:** ADMIN (Lucia Fernandez)
- **URL de inicio:** https://plataforma-textil.vercel.app/acceso-rapido
- **Accion:**
  1. Cerrar sesion anterior. Login como Lucia Fernandez.
  2. Ir a `/admin/talleres`
  3. Click en "Taller La Aguja" (Roberto Gimenez, BRONCE)
  4. Verificar tab Formalizacion activo por defecto
  5. Verificar que los items muestran labels legibles ("Registrate en ARCA", "Habilita tu local", etc.)
  6. Verificar que NO dice "CUIT MONOTRIBUTO" ni "HABILITACION MUNICIPAL"
- **Esperado:** Labels identicos a los que ve el taller. Texto legible en espanol.
- **Resultado:** [los labels son legible, Dice "CUIT MONOTIRBUTO" y "HABILITACION MUNICPAL", las otras listadas son: Plan de seguridad e higiene,art,Empleados registrados, Habilitación bomberos, Nómina digital]
- **Notas:**

### Paso 6 — Aprobar documento y ver link (ADMIN)

- **Rol:** ADMIN (Lucia Fernandez)
- **URL de inicio:** https://plataforma-textil.vercel.app/admin/talleres/[id-de-roberto]
- **Accion:**
  1. En tab Formalizacion, buscar la validacion en estado PENDIENTE (la que Roberto subio en el Paso 4)
  2. Verificar que aparece el link "Ver documento" con el icono de archivo
  3. Click en "Ver documento" — verificar que abre el PDF/imagen sin error 403
  4. Click en "Aprobar"
  5. Verificar que la validacion pasa a estado COMPLETADO
  6. Verificar que **sigue visible** el link "Ver documento" en estado COMPLETADO
- **Esperado:** El link del documento es visible en PENDIENTE y en COMPLETADO. El PDF abre correctamente (bucket publico). Despues de aprobar, la pagina recarga y la validacion aparece como verificada.
- **Resultado:** [ no hay validacion pendiente porque no se puede cargar documento en usuario taller. no s epueden ingreasar al docuemnto, ni ver, tampoco aprobar. Hay un estado completado perpo el resto son "OPCIONAL"]
- **Notas:**

> Si el documento da error 403 → abrir widget → tipo **bug** → describir "Error 403 al ver documento — bucket sigue privado"

### Paso 7 — Verificar tab Historial (ADMIN)

- **Rol:** ADMIN (Lucia Fernandez)
- **URL de inicio:** https://plataforma-textil.vercel.app/admin/talleres/[id-de-roberto]
- **Accion:**
  1. Verificar que los tabs son: **Formalizacion**, **Historial**, **Actividad** (no "Documentos")
  2. Click en tab "Historial"
  3. Verificar que muestra los logs del taller con textos descriptivos:
     - "Lucia Fernandez aprobo una validacion" (del Paso 6)
- **Esperado:** Tab "Documentos" no existe. Tab "Historial" muestra los logs del taller con nombre del admin y descripcion de la accion.
- **Resultado:** [ no hay tab "historial" en admin/talleres/id_taller. figutan Formalizacion, Documentos y Actividad. nose puede prbar panel "Hisotrial"]
- **Notas:**

> Si ves un tab "Documentos" → abrir widget → tipo **bug** → describir "Tab Documentos sigue existiendo, deberia ser Historial"

### Paso 8 — Badge contador en tab Formalizacion (ADMIN)

- **Rol:** ADMIN (Lucia Fernandez)
- **URL de inicio:** https://plataforma-textil.vercel.app/admin/talleres/[id-de-graciela]
- **Accion:**
  1. Ir a `/admin/talleres` y click en "Cooperativa Hilos del Sur" (Graciela Sosa, PLATA)
  2. Verificar si la Cooperativa tiene documentos PENDIENTES con URL
  3. Si tiene documentos pendientes: verificar que el tab dice "Formalizacion (N)" donde N es la cantidad
  4. Si no tiene documentos pendientes: verificar que dice solo "Formalizacion" sin numero
- **Esperado:** El badge solo aparece cuando hay documentos en estado PENDIENTE que tienen URL de documento subido.
- **Resultado:** [ no dice cantidad en el tab "Fomalizacion" a pesar de tener un documento pendiente ]
- **Notas:**

### Paso 9 — Rechazar con motivo libre (ADMIN)

- **Rol:** ADMIN (Lucia Fernandez)
- **URL de inicio:** https://plataforma-textil.vercel.app/admin/talleres/[id-de-graciela]
- **Accion:**
  1. En tab Formalizacion de Graciela, buscar una validacion PENDIENTE con documento
  2. Si no hay una PENDIENTE, primero loguearse como Graciela, subir un documento, y volver como admin
  3. Intentar rechazar **sin escribir motivo** — verificar que el navegador bloquea el envio
  4. Escribir motivo "Fecha vencida en el documento" y rechazar
  5. Verificar que la validacion pasa a RECHAZADO con el motivo escrito
- **Esperado:** El campo motivo es `required` — el navegador no permite enviar vacio. El motivo escrito aparece como detalle del rechazo ("Rechazado: Fecha vencida en el documento"). No dice "Documento ilegible o incorrecto" (el viejo hardcoded).
- **Resultado:** [ no se puede ingrsar al documento pendiente a ver detalle apara aprobacion. no se puede hacer aprobacion, no existe opcion]
- **Notas:**

> Si el rechazo se envia sin motivo o con motivo hardcodeado → abrir widget → tipo **bug** → describir

### Paso 10 — Verificar 7 validaciones sin duplicados (TALLER Plata)

- **Rol:** TALLER Plata (Graciela Sosa)
- **URL de inicio:** https://plataforma-textil.vercel.app/acceso-rapido
- **Accion:**
  1. Cerrar sesion anterior. Login como Graciela Sosa.
  2. Ir a `/taller/formalizacion`
  3. Contar la cantidad de items en el checklist
  4. Verificar que son exactamente **7** items
  5. Verificar que no hay duplicados (por ejemplo, no hay dos "Registrate en ARCA")
  6. Verificar que el progreso dice `X/7` (no `X/13` ni `X/8`)
- **Esperado:** Exactamente 7 items sin duplicados. El progreso muestra el denominador correcto. Esto confirma que el bug de dual naming esta resuelto.
- **Resultado:** [son siete items ( CUIT/Monotributo
Verificado
COMPLETADO
ART
Verificado
COMPLETADO
Habilitación municipal
Verificado
COMPLETADO
Empleados registrados
Pendiente de revisión
PENDIENTE
Habilitación bomberos
No iniciado
OPCIONAL
Plan de seguridad e higiene
No iniciado
OPCIONAL
Nómina digital )no hay indicdor d eproegreso en el panel ]
- **Notas:**

> Si hay mas de 7 items o hay duplicados → abrir widget → tipo **bug** → describir "Validaciones duplicadas — el bug de dual naming no esta resuelto"

### Paso 11 — Registro de taller nuevo crea 7 validaciones

- **Rol:** Sin login
- **URL de inicio:** https://plataforma-textil.vercel.app/registro
- **Accion:**
  1. Registrar un taller nuevo con datos de prueba:
     - Email: `prueba.qa@pdt.org.ar`
     - Password: `pdt2026qa`
     - Nombre: "Taller QA Test"
     - CUIT: `20-12345678-9` (o cualquier CUIT valido)
     - Ubicacion: "CABA"
  2. Despues del registro, ir a `/taller/formalizacion`
  3. Contar los items del checklist
- **Esperado:** El taller nuevo tiene exactamente 7 validaciones, todas en estado NO_INICIADO. El progreso dice `0/7`.
- **Resultado:** [no se puede ingreesar con estos datos  mail: `prueba.qa@pdt.org.ar`
     - Password: `pdt2026qa`]
- **Notas:**

> **Nota:** si el registro falla por CUIT duplicado, probar con otro CUIT. Si AFIP no responde, el registro deberia continuar igual (verificadoAfip queda false).

### Paso 12 — Subida de nivel de BRONCE a PLATA (ADMIN)

- **Rol:** ADMIN (Lucia Fernandez)
- **URL de inicio:** https://plataforma-textil.vercel.app/admin/talleres/[id-de-roberto]
- **Accion:**
  1. Login como admin
  2. Ir al taller de Roberto (BRONCE)
  3. Roberto ya tiene CUIT/Monotributo COMPLETADO en el seed
  4. Necesita: Habilitacion municipal + ART completados + 1 certificado activo + verificadoAfip = true
  5. Roberto ya tiene verificadoAfip = true en el seed
  6. Aprobar las validaciones pendientes de "Habilita tu local" y "Asegura a tu equipo" (necesitan que Roberto haya subido documentos primero)
  7. Verificar si el nivel cambia a PLATA (tambien necesita 1 certificado — si no lo tiene, permanece en BRONCE)
  8. Verificar el nivel en el badge del header del taller
- **Esperado:** Si se cumplen las condiciones de PLATA (3 validaciones PLATA + AFIP + 1 certificado), el nivel sube. Si falta el certificado, queda BRONCE pero el puntaje aumenta. En el tab Historial aparece "Subio de nivel: BRONCE → PLATA".
- **Resultado:** [no se puede aprobar validacion, no existe opcion en el panel de formalizacion ]
- **Notas:**

> **Nota:** Roberto (BRONCE) tiene 0 certificados en el seed. Para llegar a PLATA necesita al menos 1 certificado activo, que solo se obtiene completando una coleccion de capacitacion y aprobando la evaluacion. Si no se puede completar este paso completo, verificar al menos que aprobar validaciones sube el puntaje y que el log de actividad registra la aprobacion.

### Paso 13 — Bajada de nivel registra NIVEL_BAJADO (ADMIN)

- **Rol:** ADMIN (Lucia Fernandez)
- **URL de inicio:** https://plataforma-textil.vercel.app/admin/talleres/[id-de-graciela]
- **Accion:**
  1. Ir al taller de Graciela (PLATA)
  2. Graciela tiene 3 validaciones PLATA completadas + 1 certificado
  3. Rechazar una de las validaciones PLATA (ej: "Habilita tu local") con motivo "Vencido"
  4. Verificar si el nivel baja de PLATA a BRONCE
  5. Ir a tab Historial
  6. Verificar que aparece un log que dice "Bajo de nivel: PLATA → BRONCE" (no "Subio de nivel")
- **Esperado:** Al rechazar una validacion requerida para PLATA, el nivel recalcula y baja. El log dice NIVEL_BAJADO con la direccion correcta. Esto confirma que el fix bidireccional funciona.
- **Resultado:** [no se puede aprobar validacion, no existe opcion en el panel de formalizacion  ]
- **Notas:**

> Si el log dice "Subio de nivel" cuando en realidad bajo → abrir widget → tipo **bug** → describir "NIVEL_BAJADO mal etiquetado como NIVEL_SUBIDO"

---

## Eje 3 — Casos borde

| # | Caso | Accion | Esperado | Resultado |
|---|------|--------|----------|-----------|
| 1 | Certificado ambiental eliminado | Buscar "Certificacion ambiental" en `/taller/formalizacion` de cualquier taller | No debe aparecer en ninguna vista | |
| 2 | Motivo de rechazo vacio | Como admin, intentar rechazar sin escribir motivo | El navegador bloquea el envio (campo `required`) | |
| 3 | Admin aprueba validacion del seed (sin bajadas fantasma) | Como admin, aprobar una validacion de Graciela (PLATA) | Graciela sigue siendo PLATA (no baja a BRONCE) | |
| 4 | Documento visible despues de aprobacion | Aprobar un documento con URL → recargar | Link "Ver documento" sigue visible en estado COMPLETADO | |
| 5 | Taller nuevo tiene 7 validaciones | Registrar taller → ir a formalizacion | Exactamente 7 items, todos NO_INICIADO, progreso 0/7 | |

---

## Eje 4 — Performance

| Verificacion | Metodo | Resultado |
|-------------|--------|-----------|
| `/taller/formalizacion` carga en menos de 3 segundos | Abrir DevTools → Network → recargar | |
| `/admin/talleres/[id]` carga en menos de 3 segundos | Abrir DevTools → Network → recargar | |
| Tab Historial carga sin delay visible | Click en tab, medir tiempo | |
| Sin errores en consola del browser | DevTools → Console → revisar en ambas paginas | |
| Funciona en movil (responsive) | DevTools → Toggle device toolbar → verificar checklist | |

---

## Eje 5 — Consistencia visual

| Verificacion | Resultado | Notas |
|-------------|-----------|-------|
| Labels del checklist en espanol legible (no SCREAMING_SNAKE) | | |
| Labels identicos entre vista taller y vista admin | | |
| Link "Ver documento" usa color brand-blue con underline | | |
| Boton "Ir al tramite" tiene icono ExternalLink | | |
| Tab Historial tiene el mismo estilo que los otros tabs | | |
| Badge contador en tab Formalizacion usa estilo consistente | | |
| Textos del checklist en espanol argentino | | |
| Costos estimados visibles debajo de cada item no completado | | |

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

- [ ] 7 tipos de documento verificados (sin Certificado ambiental)
- [ ] Cada taller del seed tiene 7 validaciones sin duplicados
- [ ] Labels legibles en `/taller/formalizacion` (desde DB)
- [ ] Labels legibles en `/admin/talleres/[id]` (desde DB)
- [ ] Subida de documento funciona (bucket publico)
- [ ] Link "Ver documento" visible en todos los estados con URL
- [ ] Motivo de rechazo libre y obligatorio
- [ ] Tab Documentos eliminado — tab Historial funcional
- [ ] Badge contador en tab Formalizacion
- [ ] Registro de taller nuevo crea 7 validaciones
- [ ] Subida y bajada de nivel funciona correctamente
- [ ] Log NIVEL_BAJADO (no NIVEL_SUBIDO) cuando baja
- [ ] Casos borde probados
- [ ] Performance revisada en desktop y movil
- [ ] Issues abiertos en GitHub con labels correctos
- [ ] Resultado global definido
- [ ] Documento commiteado a develop
