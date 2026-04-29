# API Endpoints — Plataforma Digital Textil

## Formato de respuesta de error

### V3 (endpoints migrados)

```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Los datos enviados no son validos",
    "details": { "email": { "_errors": ["Debe ser un email valido"] } },
    "digest": "err_abc123"
  }
}
```

### Legacy (endpoints no migrados)

```json
{ "error": "Los datos enviados no son validos" }
```

## Codigos de error estandar

| Codigo | Status | Significado |
|--------|--------|-------------|
| AUTH_REQUIRED | 401 | No hay sesion |
| AUTH_INVALID | 401 | Credenciales malas |
| FORBIDDEN | 403 | Sin permisos |
| NOT_FOUND | 404 | No existe |
| INVALID_INPUT | 400 | Validacion fallo |
| CONFLICT | 409 | Duplicado o datos vinculados |
| RATE_LIMITED | 429 | Demasiadas solicitudes |
| EXTERNAL_SERVICE_ERROR | 502 | Servicio externo caido |
| INTERNAL_ERROR | 500 | Error inesperado |

## Para agregar un nuevo endpoint

```typescript
import { apiHandler, errorAuthRequired, errorForbidden, errorInvalidInput } from '@/compartido/lib/api-errors'
import { auth } from '@/compartido/lib/auth'

export const POST = apiHandler(async (req) => {
  const session = await auth()
  if (!session?.user) return errorAuthRequired()
  if (session.user.role !== 'ADMIN') return errorForbidden('ADMIN')

  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return errorInvalidInput(parsed.error)

  // ... logica
  return NextResponse.json({ success: true })
})
```

## Para parsear errores en el frontend

```typescript
import { getErrorMessage } from '@/compartido/lib/api-client'

const res = await fetch('/api/...')
if (!res.ok) {
  const data = await res.json()
  setError(getErrorMessage(data))  // Siempre retorna string user-friendly
}
```
