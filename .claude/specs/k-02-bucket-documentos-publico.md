# SPEC K-02 — Bucket "documentos" en prod debe ser privado

> **Bloque:** K (Seguridad)
> **Prioridad:** ALTA (riesgo activo en produccion)
> **Fecha:** 21-mayo-2026
> **Estado:** Pendiente

## Problema

El bucket `documentos` en **produccion** (nefbhacmjrzynnhvgfnl)
esta configurado como `public=true` cuando deberia ser **privado**.

### Auditoria de buckets (21-mayo-2026)

| Bucket | Dev (fjddgukwydsdcrqoxvns) | Prod (nefbhacmjrzynnhvgfnl) |
|--------|---------------------------|------------------------------|
| `documentos` | private (correcto) | **PUBLIC (incorrecto)** |
| `imagenes` | public | public |

### Contenido del bucket documentos

Archivos subidos por talleres durante el proceso de validacion:
- **DNI** de representantes legales
- **Escrituras** y contratos
- **Certificaciones AFIP** (constancias de inscripcion)
- **ART** (Aseguradora de Riesgos del Trabajo)
- **Habilitacion municipal**
- Otros documentos legales

### Impacto

Cualquiera que conozca (o adivine) la URL del archivo puede acceder
sin autenticacion. Las URLs de Supabase Storage siguen el patron:
```
https://{project-ref}.supabase.co/storage/v1/object/public/documentos/{path}
```

El path es predecible si se conoce la estructura de carpetas.

## Que hacer

### Paso 1 — Cambiar bucket a privado en prod

```sql
UPDATE storage.buckets
SET public = false
WHERE id = 'documentos';
```

O via Supabase dashboard: Storage > documentos > Settings > Public = OFF

### Paso 2 — Verificar que signed URLs funcionan

El codigo actual en `src/compartido/lib/storage.ts` ya usa
`createSignedUrl()` para documentos:

```typescript
export async function getSignedUrl(
  path: string,
  expiresIn = 3600,
  bucket: Bucket = 'documentos'
): Promise<string> {
  const { data, error } = await getSupabase().storage
    .from(BUCKETS[bucket])
    .createSignedUrl(path, expiresIn)
  // ...
}
```

Esto funciona correctamente tanto con buckets publicos como privados.
El cambio no deberia romper nada.

### Paso 3 — Verificar URLs existentes

Las URLs publicas ya generadas (almacenadas en DB como `archivoUrl`
en validaciones) dejaran de funcionar al cambiar a privado.

Opciones:
a) Si las URLs se regeneran al acceder (via API route) → no hay impacto
b) Si las URLs estan hardcodeadas en la DB → migrar a signed URLs

Verificar el flujo de visualizacion de documentos antes de aplicar.

### Paso 4 — Test E2E

Correr el flujo completo de validacion de talleres:
1. Taller sube documento
2. Admin/Estado visualiza documento
3. URL funciona correctamente (signed URL)

## Estimacion

| Tarea | Horas |
|-------|-------|
| Cambiar bucket a privado | 0.5h |
| Verificar flujo de URLs | 2h |
| Migrar URLs en DB si necesario | 1-2h |
| Test E2E | 1h |
| **Total** | **3-5h** |

## Criterio de aceptacion

- [ ] Bucket `documentos` en prod tiene `public=false`
- [ ] Documentos accesibles via signed URLs para usuarios autorizados
- [ ] URLs publicas directas devuelven 403/404
- [ ] Flujo de validacion de talleres funciona de punta a punta
- [ ] No hay URLs rotas en la interfaz de admin/estado

## Notas

- Este fix es **mas urgente que K-01** porque hay riesgo activo en prod
- El bucket `imagenes` (portfolio de talleres) puede quedarse publico —
  las imagenes de portfolio son intencionalmente publicas
- Considerar aplicar el fix en prod inmediatamente, sin esperar a K-01
