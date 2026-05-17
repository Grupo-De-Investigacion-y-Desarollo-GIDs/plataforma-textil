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
