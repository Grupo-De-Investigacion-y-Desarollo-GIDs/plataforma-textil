export const dynamic = 'force-dynamic'

import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/compartido/lib/prisma'
import { auth } from '@/compartido/lib/auth'
import { aplicarNivel } from '@/compartido/lib/nivel'
import { sendEmail, buildDocAprobadoEmail, buildDocRechazadoEmail } from '@/compartido/lib/email'
import { Card } from '@/compartido/componentes/ui/card'
import { Badge } from '@/compartido/componentes/ui/badge'
import { Button } from '@/compartido/componentes/ui/button'
import { ChecklistItem } from '@/compartido/componentes/ui/checklist-item'
import { ArrowLeft, MapPin, Mail, Phone, FileText, AlertTriangle, Calendar, Award } from 'lucide-react'

const estadoToStatus: Record<string, 'completed' | 'pending' | 'warning' | 'optional'> = {
  COMPLETADO: 'completed',
  PENDIENTE: 'pending',
  NO_INICIADO: 'optional',
  VENCIDO: 'warning',
  RECHAZADO: 'warning',
}

export default async function AdminDetalleTallerPage({ params, searchParams }: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const role = (session.user as { role?: string }).role
  if (role !== 'ADMIN') redirect('/login')

  const { id } = await params
  const { tab = 'formalizacion' } = await searchParams

  const [taller, tiposDocumento] = await Promise.all([
    prisma.taller.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, phone: true, name: true, active: true, createdAt: true } },
        validaciones: { orderBy: { createdAt: 'asc' } },
        maquinaria: true,
        certificados: { include: { coleccion: { select: { titulo: true } } } },
      },
    }),
    prisma.tipoDocumento.findMany({
      where: { activo: true },
      orderBy: { orden: 'asc' },
      select: { nombre: true, label: true },
    }),
  ])

  if (!taller) notFound()

  const labelPorNombre = Object.fromEntries(
    tiposDocumento.map(td => [td.nombre, td.label])
  )

  const notas = await prisma.notaInterna.findMany({
    where: { tallerId: id },
    include: { admin: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const logs = await prisma.logActividad.findMany({
    where: { detalles: { path: ['tallerId'], equals: id } },
    orderBy: { timestamp: 'desc' },
    take: 20,
    include: { user: { select: { name: true } } },
  })

  const historialLogs = await prisma.logActividad.findMany({
    where: {
      accion: { in: ['VALIDACION_APROBADA', 'VALIDACION_RECHAZADA', 'NIVEL_SUBIDO', 'NIVEL_BAJADO'] },
      detalles: { path: ['tallerId'], equals: id },
    },
    orderBy: { timestamp: 'desc' },
    take: 30,
    include: { user: { select: { name: true } } },
  })

  // Server actions
  async function aprobarValidacion(formData: FormData) {
    'use server'
    const validacionId = formData.get('validacionId') as string
    const validacion = await prisma.validacion.update({
      where: { id: validacionId },
      data: { estado: 'COMPLETADO' },
    })
    await aplicarNivel(id, session!.user!.id)
    await prisma.logActividad.create({
      data: {
        userId: session!.user!.id,
        accion: 'VALIDACION_APROBADA',
        detalles: { tallerId: id, validacionId },
      },
    })
    sendEmail({
      to: taller!.user.email,
      ...buildDocAprobadoEmail({ nombreTaller: taller!.nombre, tipoDoc: validacion.tipo }),
    }).catch(() => {})
    redirect(`/admin/talleres/${id}?tab=formalizacion`)
  }

  async function rechazarValidacion(formData: FormData) {
    'use server'
    const validacionId = formData.get('validacionId') as string
    const motivo = formData.get('motivo') as string
    const validacion = await prisma.validacion.update({
      where: { id: validacionId },
      data: { estado: 'RECHAZADO', detalle: motivo || 'Documentación insuficiente' },
    })
    await aplicarNivel(id, session!.user!.id)
    await prisma.logActividad.create({
      data: {
        userId: session!.user!.id,
        accion: 'VALIDACION_RECHAZADA',
        detalles: { tallerId: id, validacionId, motivo },
      },
    })
    sendEmail({
      to: taller!.user.email,
      ...buildDocRechazadoEmail({ nombreTaller: taller!.nombre, tipoDoc: validacion.tipo, motivo: motivo || 'Documentación insuficiente' }),
    }).catch(() => {})
    redirect(`/admin/talleres/${id}?tab=formalizacion`)
  }

  async function guardarNota(formData: FormData) {
    'use server'
    const texto = formData.get('texto') as string
    if (!texto?.trim()) return
    await prisma.notaInterna.create({
      data: {
        texto: texto.trim(),
        adminId: session!.user!.id,
        tallerId: id,
      },
    })
    redirect(`/admin/talleres/${id}?tab=${tab}`)
  }

  const nivelVariant = taller.nivel === 'ORO' ? 'success' : taller.nivel === 'PLATA' ? 'default' : 'warning'
  const docsConUrlPendientes = taller.validaciones.filter(
    v => v.estado === 'PENDIENTE' && v.documentoUrl
  ).length

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <Link href="/admin/talleres" className="inline-flex items-center gap-1 text-sm text-brand-blue hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Volver a talleres
      </Link>

      {/* Header */}
      <Card className="mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-brand-blue/10 rounded-lg flex items-center justify-center text-brand-blue font-overpass font-bold text-xl">
            {taller.nombre.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="font-overpass font-bold text-xl text-brand-blue">{taller.nombre}</h1>
            <p className="text-sm text-gray-500">CUIT: {taller.cuit} {taller.verificadoAfip && <span className="text-green-500">✓</span>}</p>
            <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
              {taller.provincia && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {taller.provincia}{taller.partido ? `, ${taller.partido}` : ''}</span>}
              {taller.user.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {taller.user.email}</span>}
              {taller.user.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {taller.user.phone}</span>}
            </div>
            <div className="flex items-center gap-3 mt-3">
              <Badge variant={nivelVariant}>{taller.nivel}</Badge>
              <Badge variant="outline">{taller.puntaje} pts</Badge>
              <Badge variant={taller.user.active ? 'success' : 'warning'}>{taller.user.active ? 'Activo' : 'Inactivo'}</Badge>
            </div>
          </div>
        </div>
        {taller.sam && (
          <div className="mt-4 pt-4 border-t grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div><span className="text-gray-500">SAM:</span> {taller.sam} min</div>
            <div><span className="text-gray-500">Capacidad:</span> {taller.capacidadMensual}/mes</div>
            <div><span className="text-gray-500">Organización:</span> {taller.organizacion || '—'}</div>
            <div><span className="text-gray-500">Trabajadores:</span> {taller.trabajadoresRegistrados}</div>
          </div>
        )}
      </Card>

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
            <p className="text-gray-500">Teléfono</p>
            {taller.user.phone ? (
              <a
                href={`tel:${taller.user.phone}`}
                className="text-brand-blue hover:underline font-medium"
              >
                {taller.user.phone}
              </a>
            ) : (
              <span className="text-gray-400 italic">Sin teléfono</span>
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
        {(['formalizacion', 'historial', 'actividad'] as const).map(t => (
          <Link
            key={t}
            href={`/admin/talleres/${id}?tab=${t}`}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === t ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t === 'formalizacion'
              ? `Formalización${docsConUrlPendientes > 0 ? ` (${docsConUrlPendientes})` : ''}`
              : t === 'historial'
                ? 'Historial'
                : 'Actividad'}
          </Link>
        ))}
      </div>

      {/* Tab: Formalización */}
      {tab === 'formalizacion' && (
        <Card>
          <h2 className="font-overpass font-bold text-brand-blue mb-3">Checklist de Formalización</h2>
          <div className="divide-y divide-gray-100">
            {taller.validaciones.map(v => (
              <div key={v.id} className="py-3 first:pt-0 last:pb-0">
                <ChecklistItem
                  title={labelPorNombre[v.tipo] ?? v.tipo}
                  status={estadoToStatus[v.estado] || 'optional'}
                  description={
                    v.estado === 'COMPLETADO' ? 'Verificado'
                    : v.estado === 'PENDIENTE' ? 'Pendiente de revisión'
                    : v.estado === 'RECHAZADO' ? `Rechazado: ${v.detalle || ''}`
                    : v.estado === 'VENCIDO' ? 'Documento vencido'
                    : 'No iniciado'
                  }
                />
                {/* Link del documento visible en cualquier estado si existe URL */}
                {v.documentoUrl && (
                  <div className="mt-2 ml-8">
                    <a
                      href={v.documentoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-blue underline text-sm inline-flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Ver documento
                    </a>
                  </div>
                )}
                {/* Acciones solo para PENDIENTE */}
                {v.estado === 'PENDIENTE' && v.documentoUrl && (
                  <div className="flex gap-2 mt-2 ml-8">
                    <form action={aprobarValidacion}>
                      <input type="hidden" name="validacionId" value={v.id} />
                      <Button size="sm" type="submit">Aprobar</Button>
                    </form>
                    <form action={rechazarValidacion} className="flex gap-1">
                      <input type="hidden" name="validacionId" value={v.id} />
                      <input
                        type="text"
                        name="motivo"
                        placeholder="Motivo del rechazo..."
                        required
                        className="text-xs border border-gray-300 rounded px-2 py-1 w-48"
                      />
                      <Button size="sm" variant="secondary" type="submit">Rechazar</Button>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

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
                  log.accion === 'VALIDACION_APROBADA' ? `${log.user?.name ?? 'Admin'} aprobó una validación`
                : log.accion === 'VALIDACION_RECHAZADA' ? `${log.user?.name ?? 'Admin'} rechazó una validación${detalles.motivo ? ` — ${detalles.motivo}` : ''}`
                : log.accion === 'NIVEL_SUBIDO' ? `Subió de nivel: ${detalles.nivelAnterior} → ${detalles.nivelNuevo}`
                : log.accion === 'NIVEL_BAJADO' ? `Bajó de nivel: ${detalles.nivelAnterior} → ${detalles.nivelNuevo}`
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
    </div>
  )
}
