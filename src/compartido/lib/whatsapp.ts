import { prisma } from './prisma'
import { generarMagicLink } from './magic-link'
import { renderTemplate, type TemplateName } from './whatsapp-templates'

interface GenerarOpts {
  userId: string
  template: TemplateName
  datos: Record<string, string | string[]>
  destino: string
  notificacionId?: string
}

export async function generarMensajeWhatsapp(opts: GenerarOpts) {
  const user = await prisma.user.findUnique({
    where: { id: opts.userId },
    select: { id: true, phone: true, name: true, notificacionesWhatsapp: true },
  })

  if (!user?.notificacionesWhatsapp) {
    return null
  }

  if (!user.phone) {
    console.warn(`[whatsapp] User ${opts.userId} sin phone — saltado`)
    return null
  }

  const phoneNormalizado = normalizarTelefonoArgentino(user.phone)
  if (!phoneNormalizado) {
    console.warn(`[whatsapp] Phone invalido para user ${opts.userId}: ${user.phone}`)
    return null
  }

  const magicLink = await generarMagicLink({
    userId: opts.userId,
    destino: opts.destino,
  })

  const templateData = {
    ...opts.datos,
    nombre: user.name ?? '',
    enlace: magicLink.url,
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mensaje = renderTemplate(opts.template, templateData as any)

  const proveedor = process.env.WHATSAPP_PROVIDER ?? 'wa-me'

  return prisma.mensajeWhatsapp.create({
    data: {
      userId: user.id,
      phone: phoneNormalizado,
      template: opts.template,
      mensaje,
      enlaceProfundo: magicLink.url,
      estado: 'GENERADO',
      proveedor,
      notificacionId: opts.notificacionId ?? null,
    },
  })
}

export function normalizarTelefonoArgentino(raw: string): string | null {
  const digitos = raw.replace(/\D/g, '')
  // 12 digitos con 54 = codigo de pais completo (54 + 10 digitos)
  if (digitos.length === 12 && digitos.startsWith('54')) return digitos
  // 11 digitos con 54 = formato viejo sin 9 (54 + 9 digitos)
  if (digitos.length === 11 && digitos.startsWith('54')) return digitos
  // 10 digitos = falta codigo de pais, agregar 54
  if (digitos.length === 10) return '54' + digitos
  return null
}

export function generarUrlWaMe(phone: string, mensaje: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(mensaje)}`
}
