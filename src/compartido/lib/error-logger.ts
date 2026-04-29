import { logActividad } from './log'

interface ContextoError {
  contexto: 'admin' | 'taller' | 'marca' | 'estado' | 'contenido' | 'publico' | 'api'
  ruta?: string
  userId?: string
  digest?: string
}

export function logearError(error: Error, ctx: ContextoError) {
  console.error('[error]', {
    contexto: ctx.contexto,
    ruta: ctx.ruta,
    userId: ctx.userId,
    digest: ctx.digest,
    message: error.message,
    stack: error.stack?.split('\n').slice(0, 5).join('\n'),
  })

  if (ctx.contexto !== 'publico') {
    logActividad('ERROR_RENDER', ctx.userId ?? null, {
      contexto: ctx.contexto,
      ruta: ctx.ruta,
      digest: ctx.digest,
      mensaje: error.message,
    })
  }
}
