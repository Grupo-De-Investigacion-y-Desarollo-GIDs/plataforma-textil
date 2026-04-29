# QA: Validacion server-side de archivos

**Spec:** `v3-validacion-archivos.md`
**Commit de implementacion:** varios (Bloque 2 — S-03)
**Verificacion DEV:** Completada por Gerardo el 2026-04-28
**URL de prueba:** https://plataforma-textil-dev.vercel.app
**Fecha:** 2026-04-27
**Auditor(es):** Sergio (tecnico)
**Incluye Eje 6 de validacion de dominio:** no
**Perfiles aplicables:**

---

## Contexto institucional

La plataforma maneja documentos sensibles: certificados de ART, constancias de AFIP, habilitaciones municipales. Sin validacion server-side, un atacante puede subir un ejecutable disfrazado de PDF, un SVG con scripts maliciosos, o archivos excesivamente grandes que agotan el storage. Este spec valida archivos por magic bytes (no por extension ni MIME type declarado) y permite al admin configurar que tipos acepta cada contexto sin necesidad de deploy.

---

## Objetivo de este QA

Verificar que los archivos subidos son validados por magic bytes en el server, que el admin puede configurar tipos y tamanos desde la UI, y que archivos maliciosos o invalidos son rechazados sin guardarse en storage.

---

## Como trabajar con este documento

1. Abri este archivo y la plataforma en paralelo
2. Los items marcados **DEV** los verifica Gerardo desde codigo o terminal
3. Los items marcados **QA** los verifica Sergio desde el browser
4. Marca cada resultado con ok, bug o bloqueante

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
| 1 | Helper `validarArchivo()` creado en `file-validation.ts` | DEV | ok | |
| 2 | `detectarTipoArchivo()` valida por magic bytes, no por extension | DEV | ok | |
| 3 | 8 tipos soportados: pdf, jpeg, png, webp, xlsx, docx, mp4, mov | DEV | ok | |
| 4 | `esNombreSeguro()` rechaza path traversal (`../`, `\`) | DEV | ok | |
| 5 | `sanitizarNombreArchivo()` limpia caracteres peligrosos | DEV | ok | |
| 6 | Tabla `ConfiguracionUpload` creada con migracion | DEV | ok | |
| 7 | Seed crea 3 configs: documentos-formalizacion, imagenes-portfolio, imagenes-pedido | DEV | ok | |
| 8 | `/api/upload/imagenes` usa `validarArchivo()` con contexto correcto | DEV | ok | |
| 9 | `/api/validaciones/[id]/upload` usa `validarArchivo()` con contexto correcto | DEV | ok | |
| 10 | Rate limit aplicado en `/api/upload/imagenes` (faltaba en S-02) | DEV | ok | |
| 11 | Intentos rechazados logueados con `logActividad('UPLOAD_REJECTED')` | DEV | ok | |
| 12 | Cache de config en memoria con TTL de 1 minuto | DEV | ok | |
| 13 | Fail-closed: sin config para un contexto, upload rechazado | DEV | ok | |
| 14 | `invalidarCacheConfigs()` llamado al actualizar config desde admin | DEV | ok | |
| 15 | Build sin errores de TypeScript | DEV | ok | |

---

## Eje 2 — Navegabilidad

### Paso 1 — Subir documento de formalizacion como taller

- **Rol:** TALLER Bronce (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de inicio:** /taller/formalizacion
- **Verificador:** QA
- **Accion:** Subir un PDF valido como documento de formalizacion
- **Esperado:** Archivo se sube correctamente, estado cambia a PENDIENTE
- **Resultado:** [ ]
- **Notas:**

### Paso 2 — Subir imagen de portfolio como taller

- **Rol:** TALLER Bronce (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de inicio:** /taller/perfil
- **Verificador:** QA
- **Accion:** Subir una imagen JPG/PNG al portfolio del taller
- **Esperado:** Imagen se sube y se muestra en el portfolio
- **Resultado:** [ ]
- **Notas:**

### Paso 3 — Ver configuracion de archivos como admin

- **Rol:** ADMIN (lucia.fernandez@pdt.org.ar / pdt2026)
- **URL de inicio:** /admin/configuracion
- **Verificador:** QA
- **Accion:** Click en tab "Archivos", verificar que se ve la tabla con 3 contextos
- **Esperado:** Tabla con documentos-formalizacion, imagenes-portfolio, imagenes-pedido. Cada uno con badges de tipos y tamano maximo.
- **Resultado:** [ ]
- **Notas:**

### Paso 4 — Editar configuracion de upload como admin

- **Rol:** ADMIN (lucia.fernandez@pdt.org.ar / pdt2026)
- **URL de inicio:** /admin/configuracion/archivos
- **Verificador:** QA
- **Accion:** Click "Editar" en imagenes-portfolio, agregar WebP si no esta, cambiar tamano a 10 MB, guardar
- **Esperado:** Toast de confirmacion, tabla actualizada con nuevos valores
- **Resultado:** [ ]
- **Notas:**

---

## Eje 3 — Casos borde

| # | Caso | Accion | Esperado | Verificador | Resultado |
|---|------|--------|----------|-------------|-----------|
| 1 | EXE disfrazado como PDF rechazado | Subir un .exe renombrado a .pdf | 400 con "Formato no soportado" | DEV | ok |
| 2 | Archivo vacio rechazado | Subir un archivo de 0 bytes | 400 con "archivo esta vacio" | DEV | ok |
| 3 | Nombre con path traversal rechazado | Subir archivo con nombre ../../hack.pdf | 400 con "caracteres no permitidos" | DEV | ok |
| 4 | MIME spoofing: JPEG enviado como application/pdf | Enviar JPEG con content-type de PDF | Rechazado si pdf no esta en tipos, aceptado si jpeg si | DEV | ok |
| 5 | Uso normal no se ve afectado | Subir 2-3 imagenes normales como taller | Todas suben correctamente | QA | |
| 6 | Admin no puede guardar lista vacia de tipos | Intentar desmarcar todos los tipos y guardar | Boton deshabilitado o error de validacion | QA | |

---

## Eje 4 — Performance

| # | Verificacion | Metodo | Verificador | Resultado |
|---|-------------|--------|-------------|-----------|
| 1 | Upload no agrega latencia notable vs antes | DevTools > Network > subir imagen | QA | |
| 2 | Sin errores en consola del browser | DevTools > Console > despues del upload | QA | |

---

## Eje 5 — Consistencia visual

| Verificacion | Resultado | Notas |
|-------------|-----------|-------|
| La plataforma se ve y funciona igual que antes | | |
| Pagina /admin/configuracion/archivos tiene estilo consistente | | |
| No hay mensajes de error nuevos o inesperados en uso normal | | |

---

## Resumen de issues abiertos

| Issue | Tipo | Descripcion | Prioridad |
|-------|------|-------------|-----------|

---

## Notas de los auditores

**Sergio (tecnico):**

---

## Checklist de cierre

- [ ] Todos los criterios de aceptacion del spec verificados
- [ ] Casos borde probados
- [ ] Performance revisada
- [ ] Issues abiertos en GitHub con labels correctos
- [ ] Resultado global definido
- [ ] Documento commiteado a develop
