# Verificar CUIT via ApiArgentina

Skill para verificar CUIT/CUIL de talleres textiles contra el padron de ARCA (ex-AFIP) usando la API publica de ArgentinaDatos.

## API

**Endpoint**: `GET https://api.argentinadatos.com/v1/padron/cuit/{cuit}`

### Request

- `{cuit}` debe ser un numero de 11 digitos sin guiones (ej: `20345678901`)
- Validar formato antes de llamar: regex `^\d{11}$`
- Validar digito verificador con algoritmo modulo 11

### Response exitosa (200)

```json
{
  "cuit": "20345678901",
  "nombre": "GARCIA JUAN CARLOS",
  "tipoPersona": "FISICA",
  "tipoClave": "CUIT",
  "estado": "ACTIVO",
  "categoriaMonotributo": "A",
  "domicilioFiscal": { ... }
}
```

### Normalizacion de la respuesta

Mapear la respuesta al modelo interno `VerificacionCuit`:

```typescript
interface VerificacionCuit {
  cuit: string
  nombre: string              // campo "nombre" de la API
  categoria: string           // campo "categoriaMonotributo" (A-K) o "RESPONSABLE INSCRIPTO"
  estado: 'ACTIVO' | 'INACTIVO' | 'NO_ENCONTRADO'
  verificadoEn: Date          // timestamp de la verificacion
  fuenteDatos: 'ARCA_API' | 'MANUAL'
}
```

### Asignacion de nivel inicial

Segun el resultado de la verificacion:

- `estado === 'ACTIVO'` -> asignar nivel **BRONCE** al taller
- `estado === 'INACTIVO'` -> marcar como pendiente de regularizacion, no asignar nivel
- `estado === 'NO_ENCONTRADO'` -> rechazar registro, solicitar verificacion manual

## Manejo de errores

| Escenario | HTTP Status | Accion |
|---|---|---|
| CUIT no encontrado | 404 | Retornar `estado: 'NO_ENCONTRADO'` |
| CUIT formato invalido | 400 (local) | Retornar error de validacion antes de llamar a la API |
| API caida / timeout | 5xx / timeout | Activar fallback manual |
| Rate limit | 429 | Reintentar con backoff exponencial (max 3 intentos) |

### Fallback manual

Cuando la API no responde (timeout > 5s o error 5xx):

1. Registrar el intento fallido en `LogActividad` con tipo `VERIFICACION_CUIT_FALLBACK`
2. Permitir al admin cargar los datos manualmente desde el panel (ruta: `/admin/talleres/[id]`)
3. Marcar `fuenteDatos: 'MANUAL'` en la verificacion
4. Crear una tarea pendiente para re-verificar cuando la API vuelva
5. Notificar al admin via `Notificacion` con tipo `VERIFICACION_PENDIENTE`

## Implementacion

- Ruta API: `src/app/api/talleres/[id]/verificar-cuit/route.ts`
- Solo accesible por roles `ADMIN` y `ESTADO`
- Guardar resultado en campo `verificacionCuit` del modelo `Taller` en Prisma
- Loguear cada verificacion (exitosa o fallida) en `LogActividad`
