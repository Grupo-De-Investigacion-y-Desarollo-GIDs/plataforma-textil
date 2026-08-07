export const INSTITUTIONAL = {
  brandName: 'Plataforma Digital Textil',
  brandSubtitle: 'Desarrollado por UNTREF con el apoyo de la OIT',
  brandDescription: 'Desarrollado por UNTREF con el apoyo de la OIT',
  developedBy: 'Desarrollado por UNTREF con el apoyo de la OIT',
  copyrightHolder: 'Plataforma Digital Textil',
  endorsement: 'Desarrollado por UNTREF con el apoyo de la OIT',
} as const

export const FOOTER_LINKS = {
  plataforma: [
    { label: '\u00bfC\u00f3mo funciona?', href: '/#como-funciona' },
    { label: 'Impacto', href: '/#impacto' },
  ],
  enlacesUtiles: [
    { label: 'Centro de ayuda', href: '/ayuda' },
    { label: 'Contacto', href: 'mailto:soporte@plataformatextil.com.ar' },
  ],
  legal: [
    { label: 'T\u00e9rminos y condiciones', href: '/terminos' },
    { label: 'Pol\u00edtica de privacidad', href: '/privacidad' },
  ],
} as const

export const TABS_BY_ROLE = {
  TALLER: [
    { label: 'Inicio', href: '/taller' },
    { label: 'Mi taller', href: '/taller/perfil' },
    { label: 'Mi recorrido', href: '/taller/formalizacion' },
    { label: 'Cursos', href: '/taller/aprender' },
    { label: 'Pedidos', href: '/taller/pedidos' },
  ],
  MARCA: [
    { label: 'Inicio', href: '/marca' },
    { label: 'Mi marca', href: '/marca/perfil' },
    { label: 'Explorar talleres', href: '/marca/directorio' },
    { label: 'Pedidos', href: '/marca/pedidos' },
  ],
  ESTADO: [
    { label: 'Dashboard', href: '/estado' },
    { label: 'Talleres', href: '/estado/talleres' },
    { label: 'Tipos de documento', href: '/estado/documentos' },
    { label: 'Etapas', href: '/estado/configuracion-niveles' },
    { label: 'Auditorías', href: '/estado/auditorias' },
    { label: 'Demanda insatisfecha', href: '/estado/demanda-insatisfecha' },
    { label: 'Datos sectoriales', href: '/estado/sector' },
    { label: 'Exportar', href: '/estado/exportar' },
  ],
} as const

// ─── Landing público (X-06) ─────────────────────────────────────

export const LANDING_COPY = {
  hero: {
    titleParts: ['Hacé crecer tu taller.', 'Conectá tu marca.', 'Empezá desde donde estés.'],
    subtitle: 'Plataforma que acompaña a talleres y marcas del sector textil argentino. Capacitaciones gratuitas, perfil profesional y conexión directa entre quienes producen y quienes buscan. Desarrollada por UNTREF con el apoyo de la OIT.',
    ctaTaller: { label: 'Soy taller', href: '/registro?rol=TALLER' },
    ctaMarca: { label: 'Soy marca', href: '/registro?rol=MARCA' },
    imageAlt: 'Trabajadores en taller textil con máquinas de coser',
    cardTrazabilidad: {
      title: 'Acompañamiento institucional',
      subtitle: 'Desarrollado por UNTREF con el apoyo de la OIT.',
    },
  },
  impacto: {
    eyebrow: 'NUESTRO IMPACTO',
    titleParts: ['Impulsamos un sector más', 'justo y transparente'],
    subtitle: 'Trabajamos para reducir la informalidad, mejorar las condiciones laborales y generar oportunidades de desarrollo en talleres y marcas argentinas.',
  },
  carrusel: {
    eyebrow: 'ACADEMIA · SECTOR',
    title: 'Novedades y capacitaciones',
    subtitle: 'Lo ultimo de la academia y del sector textil argentino',
  },
} as const

export const HEADER_PUBLIC_NAV = [
  { label: '¿Cómo funciona?', href: '#como-funciona' },
  { label: 'Impacto', href: '#impacto' },
] as const

export const HEADER_PUBLIC_CTAS = {
  iniciar: { label: 'Iniciar sesión', href: '/login' },
  taller: { label: 'Soy taller', href: '/registro?rol=TALLER' },
  marca: { label: 'Soy marca', href: '/registro?rol=MARCA' },
} as const
