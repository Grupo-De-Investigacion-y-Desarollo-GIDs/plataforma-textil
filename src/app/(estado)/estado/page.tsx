export const dynamic = 'force-dynamic'

import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/compartido/componentes/ui/card'
import { Badge } from '@/compartido/componentes/ui/badge'
import { Factory, Store, FileCheck, Award, Clock, TrendingUp, TrendingDown, AlertCircle, BookOpen, ShoppingBag } from 'lucide-react'

export default async function EstadoDashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const hace30dias = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

  const [
    totalTalleres,
    totalMarcas,
    bronce, plata, oro,
    progresoData,
    pedidosActivos,
    validacionesPendientes,
    denunciasSinResolver,
    talleresInactivos,
    certificadosMes,
    totalCertificados,
    subieronNivelMes,
    cursosCompletados,
  ] = await prisma.$transaction([
    prisma.taller.count(),
    prisma.marca.count(),
    prisma.taller.count({ where: { nivel: 'BRONCE' } }),
    prisma.taller.count({ where: { nivel: 'PLATA' } }),
    prisma.taller.count({ where: { nivel: 'ORO' } }),
    prisma.validacion.groupBy({
      by: ['estado'],
      _count: { estado: true },
      orderBy: { estado: 'asc' },
    }),
    prisma.pedido.count({ where: { estado: 'EN_EJECUCION' } }),
    prisma.validacion.count({ where: { estado: 'PENDIENTE' } }),
    prisma.denuncia.count({
      where: { estado: { in: ['RECIBIDA', 'EN_INVESTIGACION'] } },
    }),
    prisma.taller.count({
      where: {
        createdAt: { lt: hace30dias },
        user: { logs: { none: { timestamp: { gte: hace30dias } } } },
      },
    }),
    prisma.certificado.count({
      where: { fecha: { gte: inicioMes }, revocado: false },
    }),
    prisma.certificado.count({ where: { revocado: false } }),
    prisma.logActividad.count({
      where: { accion: 'NIVEL_SUBIDO', timestamp: { gte: inicioMes } },
    }),
    prisma.progresoCapacitacion.count({
      where: { porcentajeCompletado: 100 },
    }),
  ])

  const progresoArr = (progresoData ?? []) as { estado: string; _count: { estado: number } }[]
  const aprobadas = progresoArr.find(d => d.estado === 'APROBADO')?._count.estado ?? 0
  const totalValidaciones = progresoArr.reduce((acc, d) => acc + d._count.estado, 0)
  const progresoPromedio = totalValidaciones > 0
    ? Math.round((aprobadas / totalValidaciones) * 100)
    : 0

  const ultimasPendientes = await prisma.validacion.findMany({
    where: { estado: 'PENDIENTE' },
    include: { taller: { select: { id: true, nombre: true } } },
    orderBy: { updatedAt: 'desc' },
    take: 5,
  })

  const logsNivel = await prisma.logActividad.findMany({
    where: { accion: { in: ['VALIDACION_APROBADA', 'NIVEL_SUBIDO', 'NIVEL_BAJADO'] } },
    orderBy: { timestamp: 'desc' },
    take: 5,
    include: { user: { select: { name: true } } },
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-overpass font-bold text-3xl text-brand-blue">Dashboard del Sector</h1>
        <p className="text-gray-500 text-sm mt-1">Monitoreo de la Plataforma Digital Textil</p>
      </div>

      {/* ── SECCION 1: Como esta el sector? ── */}
      <div>
        <h2 className="font-overpass font-bold text-lg text-gray-700 mb-4">Como esta el sector?</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <Card className="text-center">
            <Factory className="w-6 h-6 text-brand-blue mx-auto mb-1" />
            <p className="font-overpass font-bold text-3xl text-brand-blue">{totalTalleres}</p>
            <p className="text-xs text-gray-500">Talleres registrados</p>
          </Card>
          <Card className="text-center">
            <Store className="w-6 h-6 text-brand-blue mx-auto mb-1" />
            <p className="font-overpass font-bold text-3xl text-brand-blue">{totalMarcas}</p>
            <p className="text-xs text-gray-500">Marcas registradas</p>
          </Card>
          <Card className="text-center">
            <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-1" />
            <p className="font-overpass font-bold text-3xl text-brand-blue">{progresoPromedio}%</p>
            <p className="text-xs text-gray-500">Progreso promedio formalizacion</p>
          </Card>
          <Card className="text-center">
            <ShoppingBag className="w-6 h-6 text-orange-500 mx-auto mb-1" />
            <p className="font-overpass font-bold text-3xl text-brand-blue">{pedidosActivos}</p>
            <p className="text-xs text-gray-500">Pedidos en ejecucion</p>
          </Card>
        </div>

        <Card title="Distribucion por nivel">
          <div className="space-y-3">
            {[
              { label: 'Bronce', count: bronce, color: 'bg-orange-400', textColor: 'text-orange-600' },
              { label: 'Plata', count: plata, color: 'bg-gray-400', textColor: 'text-gray-500' },
              { label: 'Oro', count: oro, color: 'bg-yellow-400', textColor: 'text-yellow-600' },
            ].map(({ label, count, color, textColor }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className={`font-semibold ${textColor}`}>{label}</span>
                  <span className="font-semibold text-gray-700">{count} talleres</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${color} rounded-full transition-all`}
                    style={{ width: `${totalTalleres ? (count / totalTalleres) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-400">
            <span>{totalTalleres} talleres en total</span>
            <span>{totalTalleres > 0 ? Math.round(((plata + oro) / totalTalleres) * 100) : 0}% formalizados (Plata+Oro)</span>
          </div>
        </Card>
      </div>

      {/* ── SECCION 2: Donde hay que actuar? ── */}
      <div>
        <h2 className="font-overpass font-bold text-lg text-gray-700 mb-4">Donde hay que actuar?</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-amber-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-800">{validacionesPendientes}</p>
                <p className="text-sm text-gray-500">Validaciones pendientes</p>
              </div>
              <Clock className="w-8 h-8 text-amber-400" />
            </div>
            {validacionesPendientes > 0 && (
              <Link href="/estado/talleres" className="text-xs text-brand-blue hover:underline mt-2 block">
                Revisar documentos →
              </Link>
            )}
          </Card>

          <Card className="border-l-4 border-l-red-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-800">{denunciasSinResolver}</p>
                <p className="text-sm text-gray-500">Denuncias sin resolver</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
          </Card>

          <Card className="border-l-4 border-l-gray-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-800">{talleresInactivos}</p>
                <p className="text-sm text-gray-500">Talleres sin actividad (30 dias)</p>
              </div>
              <Factory className="w-8 h-8 text-gray-400" />
            </div>
          </Card>
        </div>

        {validacionesPendientes > 0 && (
          <Card title={
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              Validaciones pendientes de revision
              <Badge variant="warning">{validacionesPendientes}</Badge>
            </span>
          } className="mt-4">
            <div className="divide-y divide-gray-100">
              {ultimasPendientes.map((v) => (
                <div key={v.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{v.taller.nombre}</p>
                    <p className="text-xs text-gray-500">{v.tipo.replace(/_/g, ' ')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {v.updatedAt.toLocaleDateString('es-AR')}
                    </span>
                    <Link href={`/estado/talleres/${v.taller.id}`}>
                      <Badge variant="warning">Revisar</Badge>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            {validacionesPendientes > 5 && (
              <p className="text-xs text-gray-400 mt-2">
                y {validacionesPendientes - 5} mas pendientes.
              </p>
            )}
          </Card>
        )}
      </div>

      {/* ── SECCION 3: Que esta funcionando? ── */}
      <div>
        <h2 className="font-overpass font-bold text-lg text-gray-700 mb-4">Que esta funcionando?</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-green-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-800">{certificadosMes}</p>
                <p className="text-sm text-gray-500">Certificados este mes</p>
                <p className="text-xs text-gray-400">{totalCertificados} total</p>
              </div>
              <Award className="w-8 h-8 text-green-400" />
            </div>
          </Card>

          <Card className="border-l-4 border-l-blue-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-800">{subieronNivelMes}</p>
                <p className="text-sm text-gray-500">Subieron de nivel este mes</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
          </Card>

          <Card className="border-l-4 border-l-purple-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-800">{cursosCompletados}</p>
                <p className="text-sm text-gray-500">Cursos completados</p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-400" />
            </div>
          </Card>
        </div>

        {logsNivel.length > 0 && (() => {
          const textoPorAccion: Record<string, { texto: string; icono: React.ReactNode }> = {
            VALIDACION_APROBADA: {
              texto: 'aprobo una validacion',
              icono: <FileCheck className="w-4 h-4 text-green-500 shrink-0" />,
            },
            NIVEL_SUBIDO: {
              texto: 'subio de nivel',
              icono: <TrendingUp className="w-4 h-4 text-blue-500 shrink-0" />,
            },
            NIVEL_BAJADO: {
              texto: 'bajo de nivel',
              icono: <TrendingDown className="w-4 h-4 text-amber-500 shrink-0" />,
            },
          }
          return (
            <Card title="Actividad reciente" className="mt-4">
              <div className="divide-y divide-gray-100">
                {logsNivel.map((log) => {
                  const info = textoPorAccion[log.accion] ?? textoPorAccion.VALIDACION_APROBADA
                  return (
                    <div key={log.id} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {info.icono}
                        <div>
                          <p className="text-sm">
                            <span className="font-semibold">{log.user?.name || 'Admin'}</span>
                            {' '}{info.texto}
                          </p>
                          <p className="text-xs text-gray-400">{log.timestamp.toLocaleDateString('es-AR')}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          )
        })()}
      </div>
    </div>
  )
}
