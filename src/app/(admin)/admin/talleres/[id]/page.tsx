export const dynamic = 'force-dynamic'

import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/compartido/lib/prisma'
import { auth } from '@/compartido/lib/auth'
import { logAccionAdmin } from '@/compartido/lib/log'
import { Card } from '@/compartido/componentes/ui/card'
import { Badge } from '@/compartido/componentes/ui/badge'
import { Button } from '@/compartido/componentes/ui/button'
import { MapPin, Mail, Phone, AlertTriangle, Award } from 'lucide-react'
import { Breadcrumbs } from '@/compartido/componentes/ui/breadcrumbs'
import { BotonEnviarMensaje } from '@/admin/componentes/boton-enviar-mensaje'
import { NotasSeguimiento } from '@/admin/componentes/notas-seguimiento'

export default async function AdminDetalleTallerPage({ params, searchParams }: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const role = (session.user as { role?: string }).role
  if (role !== 'ADMIN') redirect('/login')

  const { id } = await params
  const { tab = 'historial' } = await searchParams

  const [taller, notas, logs, historialLogs] = await Promise.all([
    prisma.taller.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, phone: true, name: true, active: true, createdAt: true } },
        validaciones: { orderBy: { createdAt: 'asc' } },
        maquinaria: true,
        certificados: { include: { coleccion: { select: { titulo: true } } } },
      },
    }),
    prisma.notaInterna.findMany({
      where: { tallerId: id },
      include: { admin: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.logActividad.findMany({
      where: { detalles: { path: ['tallerId'], equals: id } },
      orderBy: { timestamp: 'desc' },
      take: 20,
      include: { user: { select: { name: true } } },
    }),
    prisma.logActividad.findMany({
      where: {
        accion: {
          in: [
            'VALIDACION_APROBADA', 'VALIDACION_RECHAZADA', 'VALIDACION_REVOCADA',
            'ESTADO_VALIDACION_APROBADA', 'ESTADO_VALIDACION_RECHAZADA', 'ESTADO_VALIDACION_REVOCADA',
            'ADMIN_VALIDACION_COMPLETADO', 'ADMIN_VALIDACION_RECHAZADO',
            'NIVEL_SUBIDO', 'NIVEL_BAJADO',
          ],
        },
        detalles: { path: ['tallerId'], equals: id },
      },
      orderBy: { timestamp: 'desc' },
      take: 30,
      include: { user: { select: { name: true } } },
    }),
  ])

  if (!taller) notFound()

  // Server action: notas internas (solo ADMIN)
  async function guardarNota(formData: FormData) {
    'use server'
    const texto = formData.get('texto') as string
    if (!texto?.trim()) return
    const nota = await prisma.notaInterna.create({
      data: {
        texto: texto.trim(),
        adminId: session!.user!.id,
        tallerId: id,
      },
    })
    logAccionAdmin('NOTA_INTERNA_CREADA', session!.user!.id, {
      entidad: 'nota',
      entidadId: nota.id,
      metadata: { tallerId: id },
    })
    redirect(`/admin/talleres/${id}?tab=${tab}`)
  }

  const nivelVariant = taller.nivel === 'ORO' ? 'success' : taller.nivel === 'PLATA' ? 'default' : 'warning'

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <Breadcrumbs items={[
        { label: 'Admin', href: '/admin' },
        { label: 'Talleres', href: '/admin/talleres' },
        { label: taller.nombre },
      ]} />

      {/* Header */}
      <Card className="mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-brand-blue/10 rounded-lg flex items-center justify-center text-brand-blue font-overpass font-bold text-xl">
            {taller.nombre.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="font-overpass font-bold text-xl text-brand-blue">{taller.nombre}</h1>
            <p className="text-sm text-gray-500">CUIT: {taller.cuit} {taller.verificadoAfip && <span className="text-green-500">&#10003;</span>}</p>
            <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
              {taller.provincia && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {taller.provincia}{taller.partido ? `, ${taller.partido}` : ''}</span>}
              {taller.user.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {taller.user.email}</span>}
              {taller.user.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {taller.user.phone}</span>}
            </div>
            <div className="flex items-center gap-3 mt-3">
              <Badge variant={nivelVariant}>{taller.nivel}</Badge>
              <Badge variant="outline">{taller.puntaje} pts</Badge>
              <Badge variant={taller.user.active ? 'success' : 'warning'}>{taller.user.active ? 'Activo' : 'Inactivo'}</Badge>
              <BotonEnviarMensaje
                destinatarioId={taller.user.id}
                destinatarioNombre={taller.user.name ?? taller.nombre}
                destinatarioRol="TALLER"
                destinatarioTienePhone={!!taller.user.phone}
              />
            </div>
          </div>
        </div>
        {taller.sam && (
          <div className="mt-4 pt-4 border-t grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div><span className="text-gray-500">SAM:</span> {taller.sam} min</div>
            <div><span className="text-gray-500">Capacidad:</span> {taller.capacidadMensual}/mes</div>
            <div><span className="text-gray-500">Organizacion:</span> {taller.organizacion || '—'}</div>
            <div><span className="text-gray-500">Trabajadores:</span> {taller.trabajadoresRegistrados}</div>
          </div>
        )}
      </Card>

      {/* Link a vista ESTADO */}
      <div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700">
        Las acciones de formalizacion (aprobar/rechazar documentos) son responsabilidad del Estado.{' '}
        <Link href={`/estado/talleres/${id}`} className="font-semibold text-brand-blue hover:underline">
          Ver vista de formalizacion
        </Link>
      </div>

      {/* Responsable / Contacto */}
      <Card title="Responsable / Contacto" className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Responsable</p>
            <p className="font-medium text-gray-800">
              {taller.user.name ?? (
                <span className="text-gray-400 italic">Sin nombre registrado</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Fecha de registro</p>
            <p className="font-medium text-gray-800">
              {new Date(taller.user.createdAt).toLocaleDateString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Email</p>
            <a
              href={`mailto:${taller.user.email}`}
              className="text-brand-blue hover:underline font-medium break-all"
            >
              {taller.user.email}
            </a>
          </div>
          <div>
            <p className="text-gray-500">Telefono</p>
            {taller.user.phone ? (
              <a
                href={`tel:${taller.user.phone}`}
                className="text-brand-blue hover:underline font-medium"
              >
                {taller.user.phone}
              </a>
            ) : (
              <span className="text-gray-400 italic">Sin telefono</span>
            )}
          </div>
          {taller.website && (
            <div>
              <p className="text-gray-500">Web</p>
              <a
                href={taller.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-blue hover:underline font-medium break-all"
              >
                {taller.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
        </div>

        {(!taller.user.name || !taller.user.phone || !taller.ubicacion) && (
          <div className="mt-3 flex items-center gap-2 text-amber-600 text-xs bg-amber-50 px-3 py-2 rounded-lg">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            Datos de contacto incompletos — el taller puede completarlos desde su perfil
          </div>
        )}
      </Card>

      {/* Desglose de puntaje */}
      <Card title="Desglose de puntaje" className="mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-overpass font-bold text-brand-blue">{taller.puntaje}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-overpass font-bold text-gray-700">{taller.verificadoAfip ? 10 : 0}</p>
            <p className="text-xs text-gray-500">AFIP verificado</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-overpass font-bold text-gray-700">{taller.validaciones.filter(v => v.estado === 'COMPLETADO').length * 10}</p>
            <p className="text-xs text-gray-500">Validaciones ({taller.validaciones.filter(v => v.estado === 'COMPLETADO').length} x 10)</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-overpass font-bold text-gray-700">{taller.certificados.filter(c => !c.revocado).length * 15}</p>
            <p className="text-xs text-gray-500">Certificados ({taller.certificados.filter(c => !c.revocado).length} x 15)</p>
          </div>
        </div>
        {taller.certificados.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">Certificados de academia:</p>
            <div className="flex flex-wrap gap-2">
              {taller.certificados.map(c => (
                <Badge key={c.id} variant={c.revocado ? 'warning' : 'success'}>
                  <Award className="w-3 h-3 mr-1" />{c.coleccion.titulo}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(['historial', 'actividad'] as const).map(t => (
          <Link
            key={t}
            href={`/admin/talleres/${id}?tab=${t}`}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === t ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t === 'historial' ? 'Historial' : 'Actividad'}
          </Link>
        ))}
      </div>

      {/* Tab: Historial */}
      {tab === 'historial' && (
        <Card>
          <h2 className="font-overpass font-bold text-brand-blue mb-3">Historial del taller</h2>
          {historialLogs.length === 0 ? (
            <p className="text-sm text-gray-500">Sin actividad registrada.</p>
          ) : (
            <div className="space-y-2">
              {historialLogs.map(log => {
                const detalles = log.detalles as {
                  nivelAnterior?: string
                  nivelNuevo?: string
                  motivo?: string
                }
                const descripcion =
                  log.accion.includes('APROBADA') || log.accion.includes('COMPLETADO')
                    ? `${log.user?.name ?? 'Admin'} aprobo una validacion`
                  : log.accion.includes('RECHAZADA') || log.accion.includes('RECHAZADO')
                    ? `${log.user?.name ?? 'Admin'} rechazo una validacion${detalles.motivo ? ` — ${detalles.motivo}` : ''}`
                  : log.accion === 'NIVEL_SUBIDO' ? `Subio de nivel: ${detalles.nivelAnterior} -> ${detalles.nivelNuevo}`
                  : log.accion === 'NIVEL_BAJADO' ? `Bajo de nivel: ${detalles.nivelAnterior} -> ${detalles.nivelNuevo}`
                  : log.accion
                return (
                  <div key={log.id} className="text-sm border-b border-gray-50 pb-2">
                    <span className="text-gray-400">
                      {log.timestamp.toLocaleDateString('es-AR')}
                    </span>
                    <p className="text-gray-700">{descripcion}</p>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      )}

      {/* Tab: Actividad */}
      {tab === 'actividad' && (
        <Card>
          <h2 className="font-overpass font-bold text-brand-blue mb-3">Actividad Reciente</h2>
          {logs.length === 0 ? (
            <p className="text-sm text-gray-500">Sin actividad registrada.</p>
          ) : (
            <div className="space-y-2">
              {logs.map(log => (
                <div key={log.id} className="text-sm border-b border-gray-50 pb-2">
                  <span className="text-gray-400">{log.timestamp.toLocaleDateString('es-AR')}</span>
                  {' - '}
                  <strong>{log.user?.name || 'Sistema'}</strong>
                  {': '}
                  {log.accion === 'NOTA_INTERNA'
                    ? `"${(log.detalles as Record<string, string>)?.texto || ''}"`
                    : log.accion.replace(/_/g, ' ').toLowerCase()
                  }
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Notas */}
      <Card className="mt-6">
        <h2 className="font-overpass font-bold text-brand-blue mb-3">Notas Internas</h2>
        <form action={guardarNota} className="flex gap-2 mb-4">
          <input
            type="text"
            name="texto"
            placeholder="Agregar nota..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
          <Button size="sm" type="submit">Agregar</Button>
        </form>
        {notas.length === 0 ? (
          <p className="text-sm text-gray-500">Sin notas internas.</p>
        ) : (
          <div className="space-y-2">
            {notas.map(nota => (
              <p key={nota.id} className="text-sm">
                <span className="text-gray-400">{nota.createdAt.toLocaleDateString('es-AR')}</span>
                {' - '}
                <strong>{nota.admin.name || 'Admin'}</strong>
                {': '}
                {nota.texto}
              </p>
            ))}
          </div>
        )}
      </Card>

      {/* Notas de seguimiento (T-03) */}
      <NotasSeguimiento userId={taller.userId} />
    </div>
  )
}
