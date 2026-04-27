# REVIEW DEV: v3-validacion-archivos (S-03)

**Fecha:** 2026-04-27
**Reviewer:** Gerardo
**Spec:** `.claude/specs/v3-validacion-archivos.md`

---

## Checklist de implementacion

### Modelo y migracion
- [x] Modelo `ConfiguracionUpload` agregado a schema.prisma
- [x] Migracion `20260427100000_agregar_configuracion_upload` creada y aplicada
- [x] Prisma client regenerado

### Seed
- [x] 3 configs iniciales: documentos-formalizacion, imagenes-portfolio, imagenes-pedido
- [x] Limpieza de `configuracionUpload` en seccion de cleanup
- [x] `skipDuplicates: true` para idempotencia

### file-validation.ts
- [x] `MAGIC_BYTES` — 8 detectores por tipo (pdf, jpeg, png, webp, xlsx, docx, mp4, mov)
- [x] `detectarTipoArchivo(buffer, tiposPermitidos)` — funcion pura exportada
- [x] `esNombreSeguro(nombre)` — exportada para testing
- [x] `sanitizarNombreArchivo(nombre)` — exportada
- [x] `validarArchivo(file, contexto)` — lee config de DB con cache
- [x] `invalidarCacheConfigs()` — limpia cache, llamada desde PUT admin
- [x] Cache de 1 minuto (CACHE_TTL_MS = 60000)
- [x] Fail-closed: sin config o activo=false → rechaza
- [x] Valida tamano, magic bytes, nombre seguro en ese orden
- [x] Buffer de 16 bytes para magic bytes (suficiente para todos los tipos)

### Endpoints de upload modificados
- [x] `/api/validaciones/[id]/upload` — reemplazo de ALLOWED_TYPES/MAX_SIZE por validarArchivo('documentos-formalizacion')
- [x] `/api/upload/imagenes` — reemplazo de ALLOWED_TYPES/MAX_SIZE por validarArchivo() con CONTEXTO_CONFIG
- [x] Orden correcto: auth → rate limit → formData → validarArchivo → ownership → upload
- [x] `logActividad('UPLOAD_REJECTED')` en ambos endpoints
- [x] `sanitizarNombreArchivo()` aplicado en ambos endpoints
- [x] Rate limit agregado a `/api/upload/imagenes` (faltaba en S-02)

### Endpoints admin
- [x] `GET /api/admin/configuracion-upload` — lista configs, solo ADMIN
- [x] `PUT /api/admin/configuracion-upload/[id]` — actualiza config, solo ADMIN
- [x] Validacion de tipos contra lista fija TIPOS_VALIDOS
- [x] Validacion de tamano: 1-100 MB
- [x] No permite lista vacia de tipos
- [x] `invalidarCacheConfigs()` despues del update
- [x] `logAccionAdmin('CONFIGURACION_UPLOAD_ACTUALIZADA')` con cambios

### UI admin
- [x] Pagina `/admin/configuracion/archivos` creada
- [x] Tab "Archivos" linkeado desde pagina de configuracion principal
- [x] Tabla con contexto, nombre, tipos (badges), tamano, activo (badge)
- [x] Modal de edicion con select multiple de tipos, input tamano, toggle activo
- [x] Toast de confirmacion al guardar
- [x] Validacion: boton deshabilitado si 0 tipos seleccionados

### Tests
- [x] 20 tests Vitest en `src/__tests__/file-validation.test.ts` — todos pasan
- [x] 5 tests E2E en `tests/e2e/file-validation.spec.ts`

---

## Items post-deploy (verificar en preview/produccion)

- [ ] Seed aplicado en preview (3 configs de upload visibles)
- [ ] UI de archivos accesible desde /admin/configuracion/archivos
- [ ] Upload de PDF real funciona en formalizacion
- [ ] Upload de imagen real funciona en portfolio
- [ ] EXE disfrazado es rechazado (verificar con DevTools)
- [ ] Log UPLOAD_REJECTED aparece en /admin/logs
- [ ] Cambio de config se refleja en uploads (esperar 1 min por cache)

---

## Notas

- El endpoint `/api/colecciones/[id]/evaluacion` usa `uploadFile` pero genera QR server-side (no recibe archivos del usuario), no requiere validacion S-03.
- Cotizaciones usan config `imagenes-pedido` porque comparten los mismos tipos de imagen.
- Rate limit ahora cubre los 2 endpoints de upload del usuario (estaba faltando en imagenes).
