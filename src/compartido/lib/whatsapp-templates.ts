export const TEMPLATES = {
  pedido_nuevo: ({ marca, resumen, enlace }: { marca: string; resumen: string; enlace: string }) =>
    `PDT — Tenes un pedido nuevo de ${marca}: ${resumen}. Mira los detalles -> ${enlace}`,

  cotizacion_aceptada: ({ marca, pedido, enlace }: { marca: string; pedido: string; enlace: string }) =>
    `Felicitaciones! ${marca} acepto tu cotizacion del pedido "${pedido}". Revisa los proximos pasos -> ${enlace}`,

  documento_aprobado: ({ tipoDocumento, puntos, enlace }: { tipoDocumento: string; puntos: string; enlace: string }) =>
    `El Estado aprobo tu ${tipoDocumento}. Sumaste ${puntos} puntos. Mira tu progreso -> ${enlace}`,

  documento_rechazado: ({ tipoDocumento, motivo, enlace }: { tipoDocumento: string; motivo: string; enlace: string }) =>
    `Tu ${tipoDocumento} necesita correcciones.\nMotivo: ${motivo}\n\nIngresa para corregir -> ${enlace}`,

  nivel_subido: ({ nivel, beneficios, enlace }: { nivel: string; beneficios: string[]; enlace: string }) =>
    `Subiste a nivel ${nivel}!${Array.isArray(beneficios) && beneficios.length > 0 ? `\n\nAhora tenes acceso a:\n${beneficios.map((b: string) => `- ${b}`).join('\n')}` : ''}\n\nEntra a la plataforma -> ${enlace}`,

  mensaje_admin: ({ texto, enlace }: { texto: string; enlace: string }) =>
    `PDT — ${texto}\n\nIngresa -> ${enlace}`,
} as const

export type TemplateName = keyof typeof TEMPLATES

export function renderTemplate<K extends TemplateName>(
  template: K,
  datos: Parameters<(typeof TEMPLATES)[K]>[0]
): string {
  const fn = TEMPLATES[template] as (datos: Parameters<(typeof TEMPLATES)[K]>[0]) => string
  return fn(datos)
}
