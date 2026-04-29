import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import type { NextRequest } from 'next/server'

// --- Tipo de respuesta de error ---

export interface ApiError {
  error: {
    code: string
    message: string
    details?: unknown
    digest?: string
  }
}

// --- Helper principal ---

interface ErrorOpts {
  code: string
  message: string
  status: number
  details?: unknown
}

export function errorResponse({ code, message, status, details }: ErrorOpts): NextResponse {
  const digest = `err_${randomBytes(4).toString('hex')}`

  console.error('[api error]', { code, message, status, digest, details })

  return NextResponse.json({
    error: { code, message, details, digest }
  }, { status })
}

// --- Helpers específicos ---

export function errorAuthRequired() {
  return errorResponse({
    code: 'AUTH_REQUIRED',
    message: 'Necesitas iniciar sesion',
    status: 401,
  })
}

export function errorForbidden(rolNecesario?: string) {
  return errorResponse({
    code: 'FORBIDDEN',
    message: rolNecesario
      ? `Esta accion requiere rol ${rolNecesario}`
      : 'No tenes permisos para esta accion',
    status: 403,
  })
}

export function errorNotFound(recurso = 'recurso') {
  return errorResponse({
    code: 'NOT_FOUND',
    message: `El ${recurso} no existe`,
    status: 404,
  })
}

export function errorInvalidInput(zodError: { format(): unknown }) {
  return errorResponse({
    code: 'INVALID_INPUT',
    message: 'Los datos enviados no son validos',
    status: 400,
    details: zodError.format(),
  })
}

export function errorConflict(mensaje = 'Ya existe un registro con esos datos') {
  return errorResponse({
    code: 'CONFLICT',
    message: mensaje,
    status: 409,
  })
}

export function errorRateLimited(retryAfter?: number) {
  const res = errorResponse({
    code: 'RATE_LIMITED',
    message: 'Demasiadas solicitudes. Intenta mas tarde.',
    status: 429,
  })
  if (retryAfter) res.headers.set('Retry-After', retryAfter.toString())
  return res
}

export function errorInternal(originalError?: Error) {
  if (originalError) {
    console.error('[internal error]', originalError)
  }
  return errorResponse({
    code: 'INTERNAL_ERROR',
    message: 'Tuvimos un problema procesando tu solicitud',
    status: 500,
  })
}

export function errorExternalService(servicio: string, originalError?: Error) {
  if (originalError) {
    console.error(`[external service: ${servicio}]`, originalError)
  }
  return errorResponse({
    code: 'EXTERNAL_SERVICE_ERROR',
    message: `El servicio ${servicio} no esta disponible en este momento`,
    status: 502,
  })
}

// --- Wrapper para handlers ---

type RouteContext = { params?: Promise<Record<string, string | string[]>> }
type Handler = (req: NextRequest, ctx: RouteContext) => Promise<NextResponse>

export function apiHandler(handler: Handler): Handler {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx)
    } catch (error: unknown) {
      if (error instanceof NextResponse) return error

      const prismaCode = (error as { code?: string })?.code

      // P2002: Unique constraint violation
      if (prismaCode === 'P2002') {
        return errorConflict('Ya existe un registro con esos datos')
      }

      // P2025: Record not found
      if (prismaCode === 'P2025') {
        return errorNotFound()
      }

      // P2003: Foreign key constraint failure
      if (prismaCode === 'P2003') {
        return errorResponse({
          code: 'CONFLICT',
          message: 'No se puede eliminar porque tiene datos vinculados',
          status: 409,
        })
      }

      return errorInternal(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
