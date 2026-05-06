import { Resend } from 'resend'

interface EmailOptions {
  to: string
  subject: string
  html: string
}

let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<{ exito: boolean; id?: string; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[EMAIL-DEV] To: ${to} | Subject: ${subject}`)
    console.log(`[EMAIL-DEV] Body: ${html.substring(0, 200)}...`)
    return { exito: true }
  }

  const from = `${process.env.EMAIL_FROM_NAME || 'Plataforma Textil'} <${process.env.EMAIL_FROM || 'onboarding@resend.dev'}>`
  const replyTo = process.env.EMAIL_REPLY_TO || undefined

  for (let intento = 0; intento < 2; intento++) {
    try {
      const { data, error } = await getResend().emails.send({
        from,
        to,
        subject,
        html,
        replyTo,
      })

      if (error) {
        if (intento === 0) {
          await new Promise(r => setTimeout(r, 1000))
          continue
        }
        console.error('[EMAIL] Resend error:', error)
        return { exito: false, error: error.message }
      }

      return { exito: true, id: data?.id }
    } catch (err) {
      if (intento === 0) {
        await new Promise(r => setTimeout(r, 1000))
        continue
      }
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[EMAIL] Exception:', msg)
      return { exito: false, error: msg }
    }
  }

  return { exito: false, error: 'Agotados los reintentos' }
}

// Helpers de layout compartido
function emailWrapper(content: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #1e293b;">
      <div style="background: #1e3a5f; padding: 20px 32px; border-radius: 8px 8px 0 0;">
        <span style="color: #fff; font-size: 18px; font-weight: bold; letter-spacing: 0.5px;">Plataforma Digital Textil</span>
      </div>
      <div style="padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
        ${content}
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0;" />
        <p style="color: #94a3b8; font-size: 13px; margin: 0;">Plataforma Digital Textil · CABA, Argentina<br>Si no esperabas este email, podés ignorarlo.</p>
      </div>
    </div>
  `
}

function btnPrimario(url: string, texto: string): string {
  return `<a href="${url}" style="display: inline-block; margin: 20px 0; padding: 12px 28px; background: #1e3a5f; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 600;">${texto}</a>`
}

export function buildComunicacionAdminEmail(data: {
  titulo: string
  mensaje: string
  nombreUsuario: string
}): { subject: string; html: string } {
  const dashUrl = process.env.NEXTAUTH_URL ?? ''
  return {
    subject: data.titulo,
    html: emailWrapper(`
      <h2>Hola ${data.nombreUsuario}</h2>
      <p>${data.mensaje.replace(/\n/g, '<br>')}</p>
      ${btnPrimario(dashUrl, 'Ir a la plataforma')}
    `),
  }
}

export function buildBienvenidaEmail(data: { nombre: string; role: 'TALLER' | 'MARCA' }): { subject: string; html: string } {
  const esTaller = data.role === 'TALLER'
  const dashUrl = `${process.env.NEXTAUTH_URL ?? ''}/${esTaller ? 'taller' : 'marca/directorio'}`
  return {
    subject: 'Bienvenido/a a la Plataforma Digital Textil',
    html: emailWrapper(`
      <h2 style="margin: 0 0 12px;">Hola, ${data.nombre}!</h2>
      <p>Tu cuenta fue creada con éxito como <strong>${esTaller ? 'Taller' : 'Marca'}</strong>.</p>
      ${esTaller
        ? '<p>El siguiente paso es completar tu perfil y cargar tus documentos de formalización para subir de nivel y aparecer en más búsquedas.</p>'
        : '<p>Ya podés explorar el directorio de talleres y publicar tu primer pedido.</p>'
      }
      ${btnPrimario(dashUrl, 'Ir a mi panel')}
    `),
  }
}

export function buildDocAprobadoEmail(data: { nombreTaller: string; tipoDoc: string }): { subject: string; html: string } {
  return {
    subject: `Documento aprobado: ${data.tipoDoc} - PDT`,
    html: emailWrapper(`
      <h2 style="margin: 0 0 12px; color: #16a34a;">Documento aprobado</h2>
      <p>Hola <strong>${data.nombreTaller}</strong>, tu documento <strong>${data.tipoDoc}</strong> fue revisado y aprobado por el equipo de PDT.</p>
      <p>Tu nivel de formalización fue actualizado. Seguí cargando documentos para avanzar hacia el nivel Oro.</p>
      ${btnPrimario(`${process.env.NEXTAUTH_URL ?? ''}/taller/formalizacion`, 'Ver mi formalización')}
    `),
  }
}

export function buildDocRechazadoEmail(data: { nombreTaller: string; tipoDoc: string; motivo: string }): { subject: string; html: string } {
  return {
    subject: `Documento observado: ${data.tipoDoc} - PDT`,
    html: emailWrapper(`
      <h2 style="margin: 0 0 12px; color: #dc2626;">Documento con observaciones</h2>
      <p>Hola <strong>${data.nombreTaller}</strong>, tu documento <strong>${data.tipoDoc}</strong> fue revisado y necesita correcciones.</p>
      <p style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 12px 16px; border-radius: 4px;"><strong>Motivo:</strong> ${data.motivo}</p>
      <p>Podés volver a subir el documento corregido desde tu panel de formalización.</p>
      ${btnPrimario(`${process.env.NEXTAUTH_URL ?? ''}/taller/formalizacion`, 'Volver a cargar el documento')}
    `),
  }
}

export function buildCertificadoEmail(data: { nombreTaller: string; tituloColeccion: string; codigo: string; calificacion: number }): { subject: string; html: string } {
  const verificarUrl = `${process.env.NEXTAUTH_URL ?? ''}/verificar?code=${data.codigo}`
  return {
    subject: `Certificado obtenido: ${data.tituloColeccion} - PDT`,
    html: emailWrapper(`
      <h2 style="margin: 0 0 12px; color: #1e3a5f;">Certificado obtenido</h2>
      <p>Felicitaciones, <strong>${data.nombreTaller}</strong>! Aprobaste la evaluación de <strong>${data.tituloColeccion}</strong> con un puntaje de <strong>${data.calificacion}%</strong>.</p>
      <p>Tu código de verificación es:</p>
      <p style="font-family: monospace; font-size: 20px; font-weight: bold; letter-spacing: 2px; background: #f1f5f9; padding: 12px 20px; border-radius: 6px; display: inline-block;">${data.codigo}</p>
      <p style="margin-top: 8px;">Compartí este código o el link de verificación con marcas para demostrar tu certificación.</p>
      ${btnPrimario(verificarUrl, 'Ver certificado')}
    `),
  }
}

export function buildPasswordResetEmail(resetUrl: string): { subject: string; html: string } {
  return {
    subject: 'Restablecer tu contraseña - PDT',
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #1e293b;">Restablecer contraseña</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña en la Plataforma Digital Textil.</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px;">
            Restablecer contraseña
          </a>
        </p>
        <p style="color: #64748b; font-size: 14px;">Este enlace expira en 1 hora. Si no solicitaste este cambio, ignora este email.</p>
      </div>
    `,
  }
}

export function buildMagicLinkEmail(url: string): { subject: string; html: string } {
  return {
    subject: 'Tu link de acceso a PDT',
    html: emailWrapper(`
      <h2 style="margin: 0 0 12px;">Link de acceso</h2>
      <p>Hace click en el boton para ingresar a la Plataforma Digital Textil. El link expira en 24 horas.</p>
      ${btnPrimario(url, 'Ingresar a PDT')}
      <p style="color: #94a3b8; font-size: 13px; margin-top: 16px;">Si no solicitaste este acceso, podes ignorar este email.</p>
    `),
  }
}

export function buildCotizacionRecibidaEmail(data: {
  nombreMarca: string
  nombreTaller: string
  proceso: string
  precio: number
  plazoDias: number
}): { subject: string; html: string } {
  return {
    subject: `Nueva cotizacion de ${data.nombreTaller} - PDT`,
    html: emailWrapper(`
      <h2 style="margin: 0 0 12px;">Nueva cotizacion recibida</h2>
      <p>Hola <strong>${data.nombreMarca}</strong>, el taller <strong>${data.nombreTaller}</strong> cotizo tu pedido:</p>
      <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <p style="margin: 4px 0;"><strong>Proceso:</strong> ${data.proceso}</p>
        <p style="margin: 4px 0;"><strong>Precio:</strong> $${data.precio.toLocaleString('es-AR')}</p>
        <p style="margin: 4px 0;"><strong>Plazo:</strong> ${data.plazoDias} dias</p>
      </div>
      ${btnPrimario(`${process.env.NEXTAUTH_URL ?? ''}/marca/pedidos`, 'Ver cotizaciones')}
    `),
  }
}

export function buildCotizacionAceptadaEmail(data: {
  nombreTaller: string
  nombreMarca: string
  proceso: string
  precio: number
  plazoDias: number
}): { subject: string; html: string } {
  return {
    subject: 'Tu cotizacion fue aceptada - PDT',
    html: emailWrapper(`
      <h2 style="margin: 0 0 12px; color: #16a34a;">Cotizacion aceptada</h2>
      <p>Felicitaciones <strong>${data.nombreTaller}</strong>, la marca <strong>${data.nombreMarca}</strong> acepto tu cotizacion:</p>
      <div style="background: #f0fdf4; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <p style="margin: 4px 0;"><strong>Proceso:</strong> ${data.proceso}</p>
        <p style="margin: 4px 0;"><strong>Precio:</strong> $${data.precio.toLocaleString('es-AR')}</p>
        <p style="margin: 4px 0;"><strong>Plazo:</strong> ${data.plazoDias} dias</p>
      </div>
      <p>Ya se creo la orden de manufactura. Revisa los detalles en tu panel.</p>
      ${btnPrimario(`${process.env.NEXTAUTH_URL ?? ''}/taller/pedidos`, 'Ver mis pedidos')}
    `),
  }
}

export function buildCotizacionRechazadaEmail(data: {
  nombreTaller: string
  nombreMarca: string
  proceso: string
}): { subject: string; html: string } {
  return {
    subject: 'Actualizacion sobre tu cotizacion - PDT',
    html: emailWrapper(`
      <h2 style="margin: 0 0 12px;">Cotizacion no seleccionada</h2>
      <p>Hola <strong>${data.nombreTaller}</strong>, la marca <strong>${data.nombreMarca}</strong> selecciono otra cotizacion para el proceso <strong>${data.proceso}</strong>.</p>
      <p>Segui cotizando otros pedidos disponibles en la plataforma.</p>
      ${btnPrimario(`${process.env.NEXTAUTH_URL ?? ''}/taller/pedidos`, 'Ver pedidos disponibles')}
    `),
  }
}

export function buildInvitacionCotizarEmail(data: {
  nombreTaller: string
  nombreMarca: string
  tipoPrenda: string
  cantidad: number
  pedidoUrl: string
}): { subject: string; html: string } {
  return {
    subject: `Te invitaron a cotizar: ${data.tipoPrenda}`,
    html: emailWrapper(`
      <h2>Hola ${data.nombreTaller}</h2>
      <p>${data.nombreMarca} te invito a cotizar un pedido de <strong>${data.cantidad} unidades de ${data.tipoPrenda}</strong>.</p>
      <p>Solo vos y los talleres invitados pueden ver este pedido.</p>
      ${btnPrimario(data.pedidoUrl, 'Ver pedido y cotizar')}
    `),
  }
}

export function buildInvitacionRegistroEmail(data: {
  nombreDestinatario: string
  nombreReferente: string
  cargoReferente: string
}): { subject: string; html: string } {
  const registroUrl = `${process.env.NEXTAUTH_URL ?? ''}/registro`
  const guiaUrl = `${process.env.NEXTAUTH_URL ?? ''}/ayuda/onboarding-taller`
  return {
    subject: 'Te invitamos a la Plataforma Digital Textil — OIT',
    html: emailWrapper(`
      <h2 style="margin: 0 0 12px;">Hola ${data.nombreDestinatario}</h2>
      <p>Soy <strong>${data.nombreReferente}</strong> de ${data.cargoReferente}. Estamos lanzando la <strong>Plataforma Digital Textil</strong>, una herramienta gratuita que conecta talleres como el tuyo con marcas formales.</p>
      <p>Tu taller fue identificado por OIT como referente del sector y queremos invitarte a sumarte al piloto.</p>
      <h3 style="color: #1e3a5f; margin: 20px 0 8px;">Que te ofrece la plataforma?</h3>
      <ul style="color: #475569; padding-left: 20px;">
        <li>Acceso a pedidos de marcas formales</li>
        <li>Visibilidad institucional (sello "Verificado por ARCA")</li>
        <li>Acompanamiento gratuito para formalizacion</li>
        <li>Capacitaciones gratuitas</li>
      </ul>
      <h3 style="color: #1e3a5f; margin: 20px 0 8px;">Que necesitas para empezar?</h3>
      <ul style="color: #475569; padding-left: 20px;">
        <li>30 minutos de tu tiempo</li>
        <li>Tu CUIT y un documento que lo respalde</li>
      </ul>
      <p><a href="${guiaUrl}" style="color: #1e3a5f; font-weight: 600;">Lee la guia completa aqui</a></p>
      ${btnPrimario(registroUrl, 'Registrarme en la plataforma')}
      <p style="color: #94a3b8; font-size: 13px; margin-top: 16px;">Estoy disponible para una llamada de 15 minutos para acompanarte en el primer paso si lo necesitas.</p>
      <p style="color: #64748b;"><strong>${data.nombreReferente}</strong><br>${data.cargoReferente}</p>
    `),
  }
}

export function buildPedidoDisponibleEmail(data: {
  nombreTaller: string
  nombreMarca: string
  tipoPrenda: string
  cantidad: number
  pedidoUrl: string
}): { subject: string; html: string } {
  return {
    subject: `Nuevo pedido disponible: ${data.tipoPrenda} - PDT`,
    html: emailWrapper(`
      <h2 style="margin: 0 0 12px;">Nuevo pedido disponible</h2>
      <p>Hola <strong>${data.nombreTaller}</strong>, ${data.nombreMarca} publico un pedido de <strong>${data.cantidad} unidades de ${data.tipoPrenda}</strong>.</p>
      <p>Podes ver el pedido y enviar tu cotizacion desde la plataforma.</p>
      ${btnPrimario(data.pedidoUrl, 'Ver pedido y cotizar')}
      <p style="color: #94a3b8; font-size: 13px; margin-top: 16px;">Solo recibis este email porque tu taller es compatible con este pedido.</p>
    `),
  }
}
