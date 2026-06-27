export const dynamic = 'force-dynamic'

import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ProximoNivelCard } from '@/taller/componentes/proximo-nivel-card'
import { SincronizarNivel } from '@/taller/componentes/sincronizar-nivel'
import { BadgeArca } from '@/compartido/componentes/badge-arca'
import { calcularPasosTaller } from '@/compartido/lib/onboarding'
import { ChecklistOnboarding } from '@/compartido/componentes/ui/checklist-onboarding'
import { nivelAEtapa } from '@/compartido/lib/formalizacion'

export default async function TallerDashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const taller = await prisma.taller.findFirst({
    where: { userId: session.user.id },
    include: {
      certificados: { where: { revocado: false } },
      progresoCapacitacion: {
        include: { coleccion: { select: { titulo: true } } },
      },
      ordenesManufactura: {
        where: { estado: { in: ['PENDIENTE', 'EN_EJECUCION'] } },
        include: { pedido: { select: { omId: true, tipoPrenda: true } } },
        orderBy: { createdAt: 'desc' },
        take: 3,
      },
    },
  })

  // Queries paralelas: logs de nivel + datos para recomendaciones
  const hace24hs = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const [logNivelReciente, historialNiveles, validacionesCompletadas, tiposRequeridos, procesosDelTaller] = await Promise.all([
    taller
      ? prisma.logActividad.findFirst({
          where: {
            accion: { in: ['NIVEL_SUBIDO', 'NIVEL_BAJADO'] },
            timestamp: { gte: hace24hs },
            detalles: { path: ['tallerId'], equals: taller.id },
          },
          orderBy: { timestamp: 'desc' },
        })
      : null,
    taller
      ? prisma.logActividad.findMany({
          where: {
            accion: { in: ['NIVEL_SUBIDO', 'NIVEL_BAJADO'] },
            detalles: { path: ['tallerId'], equals: taller.id },
          },
          orderBy: { timestamp: 'desc' },
          take: 10,
        })
      : [],
    taller
      ? prisma.validacion.findMany({
          where: { tallerId: taller.id, estado: 'COMPLETADO' },
          select: { tipo: true },
        })
      : [],
    prisma.tipoDocumento.findMany({
      where: { requerido: true, activo: true },
      select: { nombre: true, nivelMinimo: true },
    }),
    taller
      ? prisma.tallerProceso.findMany({
          where: { tallerId: taller.id },
          select: { procesoId: true },
        })
      : [],
  ])

  const pasosOnboarding = await calcularPasosTaller(session.user.id!)
  const onboardingCompleto = pasosOnboarding.every(p => p.completado)

  const cambioNivel = logNivelReciente
    ? {
        accion: logNivelReciente.accion as 'NIVEL_SUBIDO' | 'NIVEL_BAJADO',
        nivelNuevo: (logNivelReciente.detalles as { nivelNuevo?: string })?.nivelNuevo,
        nivelAnterior: (logNivelReciente.detalles as { nivelAnterior?: string })?.nivelAnterior,
      }
    : null

  // Colecciones recomendadas — priorización por formalización → procesos → fallback
  const completadasSet = new Set(validacionesCompletadas.map(v => v.tipo))
  const tiposPendientes = tiposRequeridos.map(t => t.nombre).filter(t => !completadasSet.has(t))
  const procesosTaller = procesosDelTaller.map(p => p.procesoId)

  // Card "Tu recorrido" (change 2 QA Sergio): verificados de los requisitos del
  // recorrido. Se computa desde completadasSet + tiposRequeridos (ambos existen
  // también en #439b), NO desde taller.validaciones (que #439b elimina).
  const totalRequisitos = tiposRequeridos.length
  const requisitosVerificados = tiposRequeridos.filter(t => completadasSet.has(t.nombre)).length

  type ColeccionConCount = Awaited<ReturnType<typeof prisma.coleccion.findMany<{ include: { _count: { select: { videos: true } } } }>>>[number]
  let coleccionesRecomendadas: ColeccionConCount[]
  if (taller) {
    // Query 1 — prioridad alta: por formalización pendiente
    const porFormalizacion = await prisma.coleccion.findMany({
      where: {
        activa: true,
        formalizacionTarget: { hasSome: tiposPendientes.length > 0 ? tiposPendientes : ['__none__'] },
        NOT: { certificados: { some: { tallerId: taller.id, revocado: false } } },
      },
      include: { _count: { select: { videos: true } } },
      orderBy: { orden: 'asc' },
      take: 3,
    })

    // Query 2 — prioridad media: por procesos del taller
    const restantes = 3 - porFormalizacion.length
    const idsYaIncluidos = porFormalizacion.map(c => c.id)
    const porProcesos = restantes > 0 && procesosTaller.length > 0
      ? await prisma.coleccion.findMany({
          where: {
            activa: true,
            id: { notIn: idsYaIncluidos },
            procesosTarget: { hasSome: procesosTaller },
            NOT: { certificados: { some: { tallerId: taller.id, revocado: false } } },
          },
          include: { _count: { select: { videos: true } } },
          orderBy: { orden: 'asc' },
          take: restantes,
        })
      : []

    // Query 3 — fallback: cualquier colección no completada
    const totalEncontradas = [...porFormalizacion, ...porProcesos]
    coleccionesRecomendadas = totalEncontradas.length < 3
      ? [
          ...totalEncontradas,
          ...(await prisma.coleccion.findMany({
            where: {
              activa: true,
              id: { notIn: totalEncontradas.map(c => c.id) },
              NOT: { certificados: { some: { tallerId: taller.id, revocado: false } } },
            },
            include: { _count: { select: { videos: true } } },
            orderBy: { orden: 'asc' },
            take: 3 - totalEncontradas.length,
          })),
        ]
      : totalEncontradas
  } else {
    // Sin taller — query simple
    coleccionesRecomendadas = await prisma.coleccion.findMany({
      where: { activa: true },
      include: { _count: { select: { videos: true } } },
      orderBy: { orden: 'asc' },
      take: 3,
    })
  }

  const nivel = taller?.nivel ?? 'BRONCE'
  const etapa = nivelAEtapa(nivel)

  return (
    <div className="space-y-6">
      {/* Encabezado. "Tu recorrido de formalización" se movió desde acá a la card
          "Tus primeros pasos" (ChecklistOnboarding) / ProximoNivelCard (QA #442). */}
      <div>
        <h1 className="font-serif font-bold text-3xl text-ink-primary">
          Bienvenido, {taller?.nombre ?? session.user.name}
        </h1>
      </div>

      {/* Banner taller no verificado */}
      {taller && !taller.verificadoAfip && (
        <div className="border-l-4 border-l-amber-400 bg-amber-50 rounded-card p-4">
          <p className="font-overpass font-bold text-amber-800 mb-1">
            Tu taller esta en proceso de formalizacion
          </p>
          <p className="text-sm text-amber-700">
            Podes navegar la plataforma, capacitarte y subir documentos para avanzar. Una vez que la Coordinación verifique tu CUIT, vas a poder cotizar pedidos y aparecer en el directorio.
          </p>
          <Link
            href="/taller/formalizacion"
            className="inline-flex items-center gap-1 mt-2 text-sm font-semibold text-amber-800 hover:underline"
          >
            Ir a Formalizacion →
          </Link>
        </div>
      )}

      {/* Banner de cambio de etapa de formalización */}
      {cambioNivel && cambioNivel.nivelNuevo && (
        cambioNivel.accion === 'NIVEL_SUBIDO' ? (
          <div className="border-l-4 border-l-green-500 bg-green-50 rounded-card p-4 flex items-center gap-3">
            <div>
              <p className="font-overpass font-bold text-green-800">
                Avanzaste en tu formalización: {nivelAEtapa(cambioNivel.nivelNuevo)}
              </p>
              <p className="text-sm text-green-600">
                Ahora tenes mas visibilidad en el directorio.
              </p>
            </div>
          </div>
        ) : (
          <div className="border-l-4 border-l-amber-500 bg-amber-50 rounded-card p-4 flex items-center gap-3">
            <div>
              <p className="font-overpass font-bold text-amber-800">
                Tu estado de formalización cambió: {nivelAEtapa(cambioNivel.nivelNuevo)}
              </p>
              <p className="text-sm text-amber-600">
                Revisá tus documentos en Formalización para seguir avanzando.
              </p>
            </div>
          </div>
        )
      )}

      {/* Tu recorrido de formalización (change 2, QA Sergio): estado de un vistazo —
          etapa actual + ARCA + requisitos verificados + link al recorrido completo.
          Es el hogar de etapa+ARCA en Inicio (la cabecera de Mi taller ya no los
          muestra). Reemplaza conceptualmente al ring de gamificación que #439b
          elimina. El recorrido salió de la card "Tus primeros pasos" (issue 6):
          ahora vive acá, prominente, sin duplicarse. */}
      {taller && (
        <div className="bg-white rounded-card shadow-card p-6 border border-gray-100">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="font-overpass font-bold text-lg text-brand-blue mb-2">
                Tu recorrido de formalización
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-brand-blue/10 text-brand-blue">
                  {etapa}
                </span>
                <BadgeArca verificado={taller.verificadoAfip} />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {requisitosVerificados} de {totalRequisitos} requisitos verificados
              </p>
            </div>
            <Link
              href="/taller/formalizacion"
              className="inline-flex items-center gap-1 text-sm font-overpass font-semibold text-brand-blue hover:underline shrink-0"
            >
              Ver mi recorrido completo →
            </Link>
          </div>
        </div>
      )}

      {/* Checklist onboarding (T-03) o ProximoNivelCard (F-01).
          El subtítulo de recorrido del issue 6 se quitó de acá: ahora vive en la
          card "Tu recorrido de formalización" de arriba (sin duplicar). */}
      {taller && (
        <>
          {onboardingCompleto ? (
            <ProximoNivelCard tallerId={taller.id} />
          ) : (
            <ChecklistOnboarding pasos={pasosOnboarding} />
          )}
          <SincronizarNivel tallerId={taller.id} nivelActual={taller.nivel} />
        </>
      )}

      {/* Stats del taller. La barra/ring de "Progreso de Formalización", la métrica
          "documentos completados" y "Capacidad (prendas/mes)" se removieron: la V4
          descartó la mecánica de porcentaje/X-de-N como gamificación. El recorrido de
          formalización se ve por requisito (badges COMPLETADO/PENDIENTE) en "Mi recorrido". */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-card shadow-card p-5 border border-gray-100">
          <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Certificados</p>
          <p className="text-3xl font-bold text-brand-blue">{taller?.certificados.length ?? 0}</p>
        </div>
        <div className="bg-white rounded-card shadow-card p-5 border border-gray-100">
          <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Pedidos activos</p>
          <p className="text-3xl font-bold text-gray-700">{taller?.ordenesManufactura.length ?? 0}</p>
        </div>
      </div>

      {/* Historial de tu recorrido (F-1: etapas, no niveles crudos) */}
      {historialNiveles.length > 1 && (
        <div className="bg-white rounded-card border border-gray-100 p-6">
          <h2 className="font-serif font-bold text-gray-800 mb-4">Historial de tu recorrido</h2>
          <div className="space-y-2">
            {historialNiveles.map(log => {
              const detalles = log.detalles as { nivelAnterior?: string; nivelNuevo?: string }
              const subio = log.accion === 'NIVEL_SUBIDO'
              return (
                <div
                  key={log.id}
                  className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span className={subio ? 'text-green-600' : 'text-amber-600'}>
                      {subio ? '↑' : '↓'}
                    </span>
                    <span className="text-gray-600">
                      {nivelAEtapa(detalles.nivelAnterior ?? 'BRONCE')} → {nivelAEtapa(detalles.nivelNuevo ?? 'BRONCE')}
                    </span>
                  </div>
                  <span className="text-gray-400 text-xs">
                    {new Date(log.timestamp).toLocaleDateString('es-AR')}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Acciones rápidas */}
      <div>
        <h2 className="font-serif font-bold text-lg text-gray-800 mb-3">Acciones rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/taller/perfil/gestion"
            className="flex flex-col items-center gap-2 bg-white rounded-card p-5 border border-gray-100 shadow-card hover:shadow-md hover:border-brand-blue transition-all text-center"
          >
            <span className="text-3xl">📝</span>
            <span className="font-overpass font-semibold text-gray-700">{taller?.sam ? 'Actualizar mi perfil' : 'Completar mi perfil'}</span>
            <span className="text-xs text-gray-400">Datos productivos y capacidad</span>
          </Link>
          <Link
            href="/taller/aprender"
            className="flex flex-col items-center gap-2 bg-white rounded-card p-5 border border-gray-100 shadow-card hover:shadow-md hover:border-brand-blue transition-all text-center"
          >
            <span className="text-3xl">📚</span>
            <span className="font-overpass font-semibold text-gray-700">Ver cursos disponibles</span>
            <span className="text-xs text-gray-400">Capacitate y certificate</span>
          </Link>
          <Link
            href="/taller/pedidos/disponibles"
            className="flex flex-col items-center gap-2 bg-white rounded-card p-5 border border-gray-100 shadow-card hover:shadow-md hover:border-brand-blue transition-all text-center"
          >
            <span className="text-3xl">🔍</span>
            <span className="font-overpass font-semibold text-gray-700">Ver qué buscan las marcas</span>
            <span className="text-xs text-gray-400">Conocé quién busca talleres</span>
          </Link>
        </div>
      </div>

      {/* Pedidos activos */}
      {taller && taller.ordenesManufactura.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif font-bold text-lg text-gray-800">Pedidos activos</h2>
            <Link href="/taller/pedidos" className="text-sm text-brand-blue hover:underline">
              Ver todos →
            </Link>
          </div>
          <div className="space-y-3">
            {taller.ordenesManufactura.map((orden) => (
              <Link
                key={orden.id}
                href={`/taller/pedidos/${orden.id}`}
                className="bg-white rounded-card p-4 border border-gray-100 shadow-card flex items-center justify-between hover:border-brand-blue hover:shadow-md transition-all"
              >
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{orden.moId}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{orden.pedido.omId} · {orden.pedido.tipoPrenda}</p>
                </div>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    orden.estado === 'EN_EJECUCION'
                      ? 'bg-pastel-blue text-brand-blue-dark'
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
            <h2 className="font-serif font-bold text-lg text-gray-800">
              Capacitaciones recomendadas
            </h2>
            <Link href="/taller/aprender" className="text-sm text-brand-blue hover:underline">
              Ver todas →
            </Link>
          </div>
          <div className="bg-white rounded-card border border-gray-100 shadow-card divide-y divide-gray-100">
            {coleccionesRecomendadas.map((col) => {
              const progreso = taller?.progresoCapacitacion.find((p) => p.coleccionId === col.id)
              return (
                <Link
                  key={col.id}
                  href={`/taller/aprender/${col.id}`}
                  className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-xl">📖</span>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{col.titulo}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {col._count.videos} videos
                        {col.duracion ? ` · ${col.duracion}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
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
