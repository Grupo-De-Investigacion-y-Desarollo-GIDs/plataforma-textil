export const dynamic = 'force-dynamic'

import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ProgressRing } from '@/compartido/componentes/ui/progress-ring'

const TOTAL_VALIDACIONES = 8

export default async function TallerDashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const taller = await prisma.taller.findFirst({
    where: { userId: session.user.id },
    include: {
      validaciones: true,
      progresoCapacitacion: {
        include: { coleccion: { select: { titulo: true } } },
      },
      certificados: true,
      ordenesManufactura: {
        where: { estado: { in: ['PENDIENTE', 'EN_EJECUCION'] } },
        include: { pedido: { select: { omId: true, tipoPrenda: true } } },
        orderBy: { createdAt: 'desc' },
        take: 3,
      },
    },
  })

  // Detectar si subio de nivel en las ultimas 24hs
  const hace24hs = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const logNivelReciente = taller
    ? await prisma.logActividad.findFirst({
        where: {
          accion: 'NIVEL_SUBIDO',
          timestamp: { gte: hace24hs },
          detalles: { path: ['tallerId'], equals: taller.id },
        },
        orderBy: { timestamp: 'desc' },
      })
    : null
  const nivelNuevo = logNivelReciente
    ? (logNivelReciente.detalles as { nivelNuevo?: string })?.nivelNuevo
    : null

  // Colecciones recomendadas (las que no tienen progreso o están incompletas)
  const coleccionesRecomendadas = await prisma.coleccion.findMany({
    where: {
      activa: true,
      ...(taller
        ? {
            NOT: {
              certificados: { some: { tallerId: taller.id, revocado: false } },
            },
          }
        : {}),
    },
    include: { _count: { select: { videos: true } } },
    orderBy: { orden: 'asc' },
    take: 3,
  })

  // Calcular progreso de formalización
  const validaciones = taller?.validaciones ?? []
  const completadas = validaciones.filter((v) => v.estado === 'COMPLETADO').length
  const pendientes = validaciones.filter((v) => v.estado === 'PENDIENTE').length
  const porcentajeFormal = validaciones.length > 0
    ? Math.round((completadas / TOTAL_VALIDACIONES) * 100)
    : 0

  // Nivel siguiente
  const nivel = taller?.nivel ?? 'BRONCE'
  const nivelSiguiente = nivel === 'BRONCE' ? 'PLATA' : nivel === 'PLATA' ? 'ORO' : null

  // Banner contextual según estado
  let bannerMensaje = ''
  if (!taller) {
    bannerMensaje = 'Completá tu perfil para aparecer en el directorio de talleres.'
  } else if (porcentajeFormal < 50) {
    bannerMensaje = `Subí tus documentos de formalización para avanzar hacia nivel ${nivelSiguiente ?? 'siguiente'}.`
  } else if (nivelSiguiente) {
    bannerMensaje = `¡Buen avance! Completá tu capacitación para subir a nivel ${nivelSiguiente} y aparecer primero en búsquedas.`
  } else {
    bannerMensaje = '¡Sos ORO! Seguí manteniendo tus documentos al día para conservar tu nivel.'
  }

  // Íconos por nivel
  const nivelIcono: Record<string, string> = { BRONCE: '🥉', PLATA: '🥈', ORO: '🥇' }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="font-overpass font-bold text-3xl text-brand-blue">
          Bienvenido, {taller?.nombre ?? session.user.name}
        </h1>
        <p className="text-gray-500 mt-1">
          Tu nivel actual: {nivelIcono[nivel]} <span className="font-semibold">{nivel}</span>
        </p>
      </div>

      {/* Banner de logro al subir de nivel */}
      {nivelNuevo && (
        <div className="p-4 bg-green-50 border-2 border-green-400 rounded-xl text-center">
          <p className="text-2xl mb-1">
            {nivelNuevo === 'ORO' ? '🥇' : '🥈'}
          </p>
          <p className="font-overpass font-bold text-green-800 text-lg">
            Subiste a nivel {nivelNuevo}!
          </p>
          <p className="text-green-600 text-sm mt-1">
            Tu taller ahora tiene mas visibilidad en el directorio
          </p>
        </div>
      )}

      {/* Progreso principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ring formalización */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="font-overpass font-semibold text-gray-700 text-sm uppercase mb-4">
            Progreso de Formalización
          </h3>
          <div className="flex items-center gap-6">
            <ProgressRing percentage={porcentajeFormal} size={120} strokeWidth={10} />
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">✓</span>
                <span className="text-gray-600">{completadas} completadas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center text-xs">⏳</span>
                <span className="text-gray-600">{pendientes} pendientes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs">○</span>
                <span className="text-gray-600">
                  {TOTAL_VALIDACIONES - completadas - pendientes} sin iniciar
                </span>
              </div>
            </div>
          </div>
          <Link
            href="/taller/formalizacion"
            className="mt-4 inline-block text-sm text-brand-blue font-medium hover:underline"
          >
            Ver detalle →
          </Link>
          {taller && taller.nivel === 'BRONCE' && porcentajeFormal < 100 && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
              <p className="font-medium text-amber-800">
                Te faltan {TOTAL_VALIDACIONES - completadas} documentos para ser PLATA
              </p>
              <p className="text-amber-600 text-xs mt-1">
                Con PLATA apareces mas arriba en el directorio y accedes a marcas mas grandes
              </p>
            </div>
          )}
          {taller && taller.nivel === 'PLATA' && porcentajeFormal < 100 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
              <p className="font-medium text-yellow-800">
                Te faltan {TOTAL_VALIDACIONES - completadas} documentos para ser ORO
              </p>
              <p className="text-yellow-600 text-xs mt-1">
                Con ORO apareces primero en el directorio y podes recibir pedidos grandes
              </p>
            </div>
          )}
          {taller && taller.nivel === 'ORO' && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
              <p className="font-medium text-green-800">
                Estas en el nivel maximo! Sos un taller verificado ORO
              </p>
            </div>
          )}
        </div>

        {/* Stats secundarios */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Puntaje</p>
            <p className="text-3xl font-bold text-brand-red">{taller?.puntaje ?? 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Capacidad</p>
            <p className="text-3xl font-bold text-green-600">{taller?.capacidadMensual ?? 0}</p>
            <p className="text-xs text-gray-400 mt-1">prendas/mes</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Certificados</p>
            <p className="text-3xl font-bold text-brand-blue">{taller?.certificados.length ?? 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Pedidos activos</p>
            <p className="text-3xl font-bold text-gray-700">{taller?.ordenesManufactura.length ?? 0}</p>
          </div>
        </div>
      </div>

      {/* Banner contextual */}
      <div className="bg-brand-bg-light rounded-xl p-5 border-l-4 border-brand-blue">
        <p className="text-brand-blue font-medium">🚀 {bannerMensaje}</p>
      </div>

      {/* Acciones rápidas */}
      <div>
        <h2 className="font-overpass font-bold text-lg text-gray-800 mb-3">Acciones rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/taller/perfil/completar"
            className="flex flex-col items-center gap-2 bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-brand-blue transition-all text-center"
          >
            <span className="text-3xl">📝</span>
            <span className="font-overpass font-semibold text-gray-700">Completar mi perfil</span>
            <span className="text-xs text-gray-400">Datos productivos y capacidad</span>
          </Link>
          <Link
            href="/taller/aprender"
            className="flex flex-col items-center gap-2 bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-brand-blue transition-all text-center"
          >
            <span className="text-3xl">📚</span>
            <span className="font-overpass font-semibold text-gray-700">Ver cursos disponibles</span>
            <span className="text-xs text-gray-400">Capacitate y certificate</span>
          </Link>
          <Link
            href="/directorio"
            className="flex flex-col items-center gap-2 bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-brand-blue transition-all text-center"
          >
            <span className="text-3xl">🔍</span>
            <span className="font-overpass font-semibold text-gray-700">Explorar marcas</span>
            <span className="text-xs text-gray-400">Conocé quién busca talleres</span>
          </Link>
        </div>
      </div>

      {/* Pedidos activos */}
      {taller && taller.ordenesManufactura.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-overpass font-bold text-lg text-gray-800">Pedidos activos</h2>
            <Link href="/taller/pedidos" className="text-sm text-brand-blue hover:underline">
              Ver todos →
            </Link>
          </div>
          <div className="space-y-3">
            {taller.ordenesManufactura.map((orden) => (
              <Link
                key={orden.id}
                href={`/taller/pedidos/${orden.id}`}
                className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center justify-between hover:border-brand-blue hover:shadow-md transition-all"
              >
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{orden.moId}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{orden.pedido.omId} · {orden.pedido.tipoPrenda}</p>
                </div>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    orden.estado === 'EN_EJECUCION'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {orden.estado === 'EN_EJECUCION' ? 'En ejecución' : 'Pendiente'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Capacitaciones recomendadas */}
      {coleccionesRecomendadas.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-overpass font-bold text-lg text-gray-800">
              Capacitaciones recomendadas
            </h2>
            <Link href="/taller/aprender" className="text-sm text-brand-blue hover:underline">
              Ver todas →
            </Link>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100">
            {coleccionesRecomendadas.map((col) => {
              const progreso = taller?.progresoCapacitacion.find((p) => p.coleccionId === col.id)
              return (
                <Link
                  key={col.id}
                  href={`/taller/aprender/${col.id}`}
                  className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📖</span>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{col.titulo}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {col._count.videos} videos
                        {col.duracion ? ` · ${col.duracion}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {progreso && progreso.porcentajeCompletado > 0 && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-blue rounded-full"
                            style={{ width: `${progreso.porcentajeCompletado}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {Math.round(progreso.porcentajeCompletado)}%
                        </span>
                      </div>
                    )}
                    <span className="text-xs font-semibold text-brand-blue">
                      {progreso && progreso.porcentajeCompletado > 0 ? 'Continuar' : 'Empezar'} →
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
