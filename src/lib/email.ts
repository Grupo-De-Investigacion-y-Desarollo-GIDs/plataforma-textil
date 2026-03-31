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
        from: { email: process.env.EMAIL_FROM || 'noreply@pdt.org.ar', name: 'PDT' },
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
