export const INSTITUTIONAL = {
  brandName: 'Plataforma Digital Textil',
  brandSubtitle: 'OIT \u00b7 UNTREF',
  brandDescription: 'Una iniciativa de OIT Argentina y la Universidad Nacional de Tres de Febrero.',
  developedBy: 'Desarrollado por UNTREF con el apoyo de la OIT',
  copyrightHolder: 'Plataforma Digital Textil',
  endorsement: 'Con el respaldo de OIT \u00b7 UNTREF',
} as const

export const FOOTER_LINKS = {
  plataforma: [
    { label: '\u00bfC\u00f3mo funciona?', href: '/#como-funciona' },
    { label: 'Para taller', href: '/taller-info' },
    { label: 'Para marcas', href: '/marca-info' },
    { label: 'Impacto', href: '/impacto' },
  ],
  recursos: [
    { label: 'Centro de ayuda', href: '/ayuda' },
    { label: 'Academia', href: '/academia-publica' },
    { label: 'Novedades', href: '/novedades' },
    { label: 'Contacto', href: '/contacto' },
  ],
  legal: [
    { label: 'T\u00e9rminos y condiciones', href: '/terminos' },
    { label: 'Pol\u00edtica de privacidad', href: '/privacidad' },
    { label: 'Accesibilidad', href: '/accesibilidad' },
  ],
} as const

export const TABS_BY_ROLE = {
  TALLER: [
    { label: 'Tablero', href: '/taller' },
    { label: 'Mis pedidos', href: '/taller/pedidos' },
    { label: 'Mi formalizaci\u00f3n', href: '/taller/formalizacion' },
    { label: 'Mi perfil', href: '/taller/perfil' },
    { label: 'Academia', href: '/taller/aprender' },
  ],
  MARCA: [
    { label: 'Tablero', href: '/marca' },
    { label: 'Directorio', href: '/marca/directorio' },
    { label: 'Mis pedidos', href: '/marca/pedidos' },
    { label: 'Mi perfil', href: '/marca/perfil' },
  ],
  ESTADO: [
    { label: 'Dashboard', href: '/estado' },
    { label: 'Demanda insatisfecha', href: '/estado/demanda-insatisfecha' },
    { label: 'Datos sectoriales', href: '/estado/sector' },
    { label: 'Exportar', href: '/estado/exportar' },
  ],
} as const

// ─── Landing público (X-06) ─────────────────────────────────────

export const LANDING_COPY = {
  hero: {
    titleParts: ['Hacé crecer tu taller.', 'Conectá tu marca.', 'Empezá desde donde estés.'],
    subtitle: 'Plataforma pública de OIT y UNTREF que acompaña a talleres y marcas del sector textil argentino. Capacitaciones gratuitas, perfil profesional y conexión directa entre quienes producen y quienes buscan.',
    ctaTaller: { label: 'Soy taller', href: '/registro?rol=TALLER' },
    ctaMarca: { label: 'Soy marca', href: '/registro?rol=MARCA' },
    imageAlt: 'Trabajadores en taller textil con máquinas de coser',
    cardTrazabilidad: {
      title: 'Acompañamiento institucional',
      subtitle: 'OIT y UNTREF respaldan tu recorrido.',
    },
  },
  actores: {
    eyebrow: 'DOS CAMINOS · UN ECOSISTEMA',
    title: 'Para talleres y marcas del sector textil',
    subtitle: 'El acceso institucional para organismos del Estado se gestiona por convenio con OIT y UNTREF.',
    talleres: {
      title: 'Talleres',
      bullets: [
        'Conseguí clientes formales',
        'Accedé a certificación',
        'Digitalizá tu producción',
        'Capacitate y crecé de nivel',
      ],
      cta: { label: 'Quiero formalizarme', href: '/registro?rol=TALLER' },
    },
    marcas: {
      title: 'Marcas',
      bullets: [
        'Encontrá proveedores verificados',
        'Reducí riesgos legales',
        'Trazabilidad completa',
        'Cumplí con estándares ESG',
      ],
      cta: { label: 'Buscar proveedores', href: '/registro?rol=MARCA' },
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
    subtitle: 'Lo último de la academia y del sector textil argentino',
    verTodas: { label: 'Ver todas las novedades y cursos', href: '/novedades' },
  },
  ctaBanner: {
    titleParts: ['Sumate a la transformación del', 'sector textil'],
    subtitle: 'Empezá hoy. Es gratis.',
    ctaTaller: { label: 'Soy taller', href: '/registro?rol=TALLER' },
    ctaMarca: { label: 'Soy marca', href: '/registro?rol=MARCA' },
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
