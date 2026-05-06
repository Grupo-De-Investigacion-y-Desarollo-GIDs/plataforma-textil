import { prisma } from './prisma'

export type EtapaOnboarding =
  | 'INVITADO'
  | 'REGISTRADO'
  | 'PERFIL_COMPLETO'
  | 'ACTIVO'
  | 'INACTIVO'

export interface PasoOnboarding {
  id: string
  texto: string
  completado: boolean
  href: string
}

function diasDesde(fecha: Date): number {
  return Math.floor((Date.now() - fecha.getTime()) / (1000 * 60 * 60 * 24))
}

export async function calcularEtapa(userId: string, role: string): Promise<EtapaOnboarding> {
  const ultimoLogin = await prisma.logActividad.findFirst({
    where: { userId, accion: 'LOGIN' },
    orderBy: { timestamp: 'desc' },
  })

  if (!ultimoLogin) return 'INVITADO'

  if (role === 'TALLER') {
    const taller = await prisma.taller.findUnique({
      where: { userId },
      include: { _count: { select: { cotizaciones: true } } },
    })
    if (!taller || !taller.capacidadMensual) return 'REGISTRADO'
    if (taller._count.cotizaciones > 0) {
      if (diasDesde(ultimoLogin.timestamp) > 7) return 'INACTIVO'
      return 'ACTIVO'
    }
    if (diasDesde(ultimoLogin.timestamp) > 7) return 'INACTIVO'
    return 'PERFIL_COMPLETO'
  }

  if (role === 'MARCA') {
    const marca = await prisma.marca.findUnique({
      where: { userId },
      include: { _count: { select: { pedidos: true } } },
    })
    if (!marca) return 'REGISTRADO'
    if (marca._count.pedidos > 0) {
      if (diasDesde(ultimoLogin.timestamp) > 7) return 'INACTIVO'
      return 'ACTIVO'
    }
    if (diasDesde(ultimoLogin.timestamp) > 7) return 'INACTIVO'
    return 'PERFIL_COMPLETO'
  }

  return 'ACTIVO'
}

export async function calcularPasosTaller(userId: string): Promise<PasoOnboarding[]> {
  const [user, taller] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { emailVerified: true } }),
    prisma.taller.findUnique({
      where: { userId },
      include: {
        _count: { select: { validaciones: true } },
        cotizaciones: { where: { estado: 'ACEPTADA' }, take: 1, select: { id: true } },
      },
    }),
  ])

  return [
    {
      id: 'cuenta',
      texto: 'Crear cuenta',
      completado: true,
      href: '/cuenta',
    },
    {
      id: 'email',
      texto: 'Verificar email',
      completado: !!user?.emailVerified,
      href: '/cuenta',
    },
    {
      id: 'perfil',
      texto: 'Completar perfil del taller',
      completado: !!(taller?.capacidadMensual && taller.descripcion),
      href: '/taller/perfil',
    },
    {
      id: 'documentos',
      texto: 'Subir tu primer documento',
      completado: (taller?._count.validaciones ?? 0) > 0,
      href: '/taller/formalizacion',
    },
    {
      id: 'cotizacion',
      texto: 'Recibir tu primera cotizacion aceptada',
      completado: (taller?.cotizaciones.length ?? 0) > 0,
      href: '/taller/pedidos/disponibles',
    },
  ]
}

export async function calcularPasosMarca(userId: string): Promise<PasoOnboarding[]> {
  const [user, marca] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { emailVerified: true } }),
    prisma.marca.findUnique({
      where: { userId },
      select: { tipo: true, ubicacion: true, volumenMensual: true, _count: { select: { pedidos: true } } },
    }),
  ])

  const cotizacionesRecibidas = marca
    ? await prisma.cotizacion.count({
        where: { pedido: { marca: { userId } }, estado: 'ENVIADA' },
      })
    : 0

  return [
    {
      id: 'cuenta',
      texto: 'Crear cuenta',
      completado: true,
      href: '/cuenta',
    },
    {
      id: 'email',
      texto: 'Verificar email',
      completado: !!user?.emailVerified,
      href: '/cuenta',
    },
    {
      id: 'perfil',
      texto: 'Completar datos de tu marca',
      completado: !!(marca?.tipo && marca.ubicacion && marca.volumenMensual > 0),
      href: '/marca/perfil',
    },
    {
      id: 'pedido',
      texto: 'Publicar tu primer pedido',
      completado: (marca?._count.pedidos ?? 0) > 0,
      href: '/marca/pedidos/nuevo',
    },
    {
      id: 'cotizacion',
      texto: 'Recibir tu primera cotizacion',
      completado: cotizacionesRecibidas > 0,
      href: '/marca/pedidos',
    },
  ]
}

export interface MetricasOnboarding {
  totalUsuarios: number
  invitados: number
  registrados: number
  perfilCompleto: number
  activos: number
  inactivos: number
}

export async function calcularMetricas(): Promise<MetricasOnboarding> {
  const usuarios = await prisma.user.findMany({
    where: { role: { in: ['TALLER', 'MARCA'] }, active: true },
    select: { id: true, role: true },
  })

  const etapas = await Promise.all(
    usuarios.map(async u => calcularEtapa(u.id, u.role))
  )

  return {
    totalUsuarios: usuarios.length,
    invitados: etapas.filter(e => e === 'INVITADO').length,
    registrados: etapas.filter(e => e === 'REGISTRADO').length,
    perfilCompleto: etapas.filter(e => e === 'PERFIL_COMPLETO').length,
    activos: etapas.filter(e => e === 'ACTIVO').length,
    inactivos: etapas.filter(e => e === 'INACTIVO').length,
  }
}

export const ETAPA_LABELS: Record<EtapaOnboarding, string> = {
  INVITADO: 'Invitado',
  REGISTRADO: 'Registrado',
  PERFIL_COMPLETO: 'Perfil completo',
  ACTIVO: 'Activo',
  INACTIVO: 'Inactivo',
}

export const ETAPA_COLORS: Record<EtapaOnboarding, string> = {
  INVITADO: 'text-gray-500 bg-gray-100',
  REGISTRADO: 'text-blue-700 bg-blue-100',
  PERFIL_COMPLETO: 'text-amber-700 bg-amber-100',
  ACTIVO: 'text-green-700 bg-green-100',
  INACTIVO: 'text-red-700 bg-red-100',
}
