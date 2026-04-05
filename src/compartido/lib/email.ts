interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
  if (process.env.NODE_ENV === 'production' && process.env.SENDGRID_API_KEY) {
    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: process.env.EMAIL_FROM || 'noreply@plataformatextil.ar', name: 'PDT' },
        subject,
        content: [{ type: 'text/html', value: html }],
      }),
    })
    if (!res.ok) {
      throw new Error(`SendGrid error: ${res.status} ${await res.text()}`)
    }
    return
  }

  // Dev stub
  console.log(`[EMAIL] To: ${to} | Subject: ${subject}`)
  console.log(`[EMAIL] Body: ${html.substring(0, 200)}...`)
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
