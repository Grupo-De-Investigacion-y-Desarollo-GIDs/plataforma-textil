export const dynamic = 'force-dynamic'

import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/compartido/lib/prisma'
import { requiereRol } from '@/compartido/lib/permisos'
import { aplicarNivel } from '@/compartido/lib/nivel'
import { logAccionAdmin } from '@/compartido/lib/log'
import { sendEmail, buildDocAprobadoEmail, buildDocRechazadoEmail } from '@/compartido/lib/email'
import { Card } from '@/compartido/componentes/ui/card'
import { Badge } from '@/compartido/componentes/ui/badge'
import { SubmitButton } from '@/compartido/componentes/ui/button'
import { ChecklistItem } from '@/compartido/componentes/ui/checklist-item'
import { ArrowLeft, MapPin, Mail, Phone, FileText, Award } from 'lucide-react'
import { BadgeArca } from '@/compartido/componentes/badge-arca'
import { ReverificarButton } from './reverificar-button'

const estadoToStatus: Record<string, 'completed' | 'pending' | 'warning' | 'optional'> = {
  COMPLETADO: 'completed',
  PENDIENTE: 'pending',
  NO_INICIADO: 'optional',
  VENCIDO: 'warning',
  RECHAZADO: 'warning',
}

export default async function EstadoDetalleTallerPage({ params, searchParams }: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const session = await requiereRol(['ESTADO', 'ADMIN'])
  const role = (session.user as { role?: string }).role as string
  const soloLectura = role === 'ADMIN'

  const { id } = await params
  const { tab = 'formalizacion' } = await searchParams

  const [taller, tiposDocumento, historialLogs] = await Promise.all([
    prisma.taller.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, phone: true, name: true, active: true, createdAt: true } },
        validaciones: {
          orderBy: { createdAt: 'asc' },
          include: { usuarioAprobador: { select: { name: true, email: true } } },
        },
        maquinaria: true,
        certificados: { include: { coleccion: { select: { titulo: true } } } },
      },
    }),
    prisma.tipoDocumento.findMany({
      where: { activo: true },
      orderBy: { orden: 'asc' },
      select: { nombre: true, label: true, enlaceTramite: true },
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

  const labelPorNombre = Object.fromEntries(
    tiposDocumento.map(td => [td.nombre, td.label])
  )
  const enlacePorNombre = Object.fromEntries(
    tiposDocumento.filter(td => td.enlaceTramite).map(td => [td.nombre, td.enlaceTramite])
  )

  // Server actions — solo ESTADO puede ejecutar
  async function aprobarValidacion(formData: FormData) {
    'use server'
    const validacionId = formData.get('validacionId') as string
    const validacion = await prisma.validacion.update({
      where: { id: validacionId },
      data: { estado: 'COMPLETADO', aprobadoPor: session!.user!.id, aprobadoEn: new Date() },
    })
    await aplicarNivel(id, session!.user!.id)
    logAccionAdmin('ESTADO_VALIDACION_APROBADA', session!.user!.id, {
      entidad: 'validacion',
      entidadId: validacionId,
      metadata: { tallerId: id, tipoDocumento: validacion.tipo },
    })
    sendEmail({
      to: taller!.user.email,
      ...buildDocAprobadoEmail({ nombreTaller: taller!.nombre, tipoDoc: validacion.tipo }),
    }).catch(() => {})
    redirect(`/estado/talleres/${id}?tab=formalizacion`)
  }

  async function rechazarValidacion(formData: FormData) {
    'use server'
    const validacionId = formData.get('validacionId') as string
    const motivo = formData.get('motivo') as string
    const validacion = await prisma.validacion.update({
      where: { id: validacionId },
      data: { estado: 'RECHAZADO', detalle: motivo || 'Documentación insuficiente', aprobadoPor: session!.user!.id, aprobadoEn: new Date() },
    })
    await aplicarNivel(id, session!.user!.id)
    logAccionAdmin('ESTADO_VALIDACION_RECHAZADA', session!.user!.id, {
      entidad: 'validacion',
      entidadId: validacionId,
      motivo: motivo || 'Documentacion insuficiente',
      metadata: { tallerId: id, tipoDocumento: validacion.tipo },
    })
    sendEmail({
      to: taller!.user.email,
      ...buildDocRechazadoEmail({ nombreTaller: taller!.nombre, tipoDoc: validacion.tipo, motivo: motivo || 'Documentación insuficiente' }),
    }).catch(() => {})
    redirect(`/estado/talleres/${id}?tab=formalizacion`)
  }

  async function revocarValidacion(formData: FormData) {
    'use server'
    const validacionId = formData.get('validacionId') as string
    const motivo = formData.get('motivo') as string
    if (!motivo?.trim()) return
    await prisma.validacion.update({
      where: { id: validacionId },
      data: { estado: 'NO_INICIADO', documentoUrl: null, detalle: `Revocado: ${motivo}`, aprobadoPor: session!.user!.id, aprobadoEn: new Date() },
    })
    await aplicarNivel(id, session!.user!.id)
    logAccionAdmin('ESTADO_VALIDACION_REVOCADA', session!.user!.id, {
      entidad: 'validacion',
      entidadId: validacionId,
      motivo,
      metadata: { tallerId: id },
    })
    redirect(`/estado/talleres/${id}?tab=formalizacion`)
  }

  const nivelVariant = taller.nivel === 'ORO' ? 'success' : taller.nivel === 'PLATA' ? 'default' : 'warning'
  const docsConUrlPendientes = taller.validaciones.filter(
    v => v.estado === 'PENDIENTE' && v.documentoUrl
  ).length

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <Link href="/estado/talleres" className="inline-flex items-center gap-1 text-sm text-brand-blue hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Volver a talleres
      </Link>

      {soloLectura && (
        <div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700">
          Modo lectura — las acciones de formalizacion son responsabilidad del Estado.
        </div>
      )}

      {/* Header */}
      <Card className="mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-brand-blue/10 rounded-lg flex items-center justify-center text-brand-blue font-overpass font-bold text-xl">
            {taller.nombre.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="font-overpass font-bold text-xl text-brand-blue">{taller.nombre}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-sm text-gray-500">CUIT: {taller.cuit}</p>
              <BadgeArca verificado={taller.verificadoAfip} fecha={taller.verificadoAfipAt} />
            </div>
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
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(['formalizacion', 'historial', 'datos'] as const).map(t => (
          <Link
            key={t}
            href={`/estado/talleres/${id}?tab=${t}`}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === t ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t === 'formalizacion'
              ? `Formalizacion${docsConUrlPendientes > 0 ? ` (${docsConUrlPendientes})` : ''}`
              : t === 'historial'
                ? 'Historial'
                : 'Datos del taller'}
          </Link>
        ))}
      </div>

      {/* Tab: Formalizacion */}
      {tab === 'formalizacion' && (
        <Card>
          <h2 className="font-overpass font-bold text-brand-blue mb-3">Checklist de Formalizacion</h2>
          <div className="divide-y divide-gray-100">
            {taller.validaciones.map(v => (
              <div key={v.id} className="py-3 first:pt-0 last:pb-0">
                <ChecklistItem
                  title={labelPorNombre[v.tipo] ?? v.tipo}
                  status={estadoToStatus[v.estado] || 'optional'}
                  description={
                    v.estado === 'COMPLETADO' ? 'Verificado'
                    : v.estado === 'PENDIENTE' && !v.documentoUrl && enlacePorNombre[v.tipo]
                      ? 'Tramite externo — verificar en ARCA/SIPA'
                    : v.estado === 'PENDIENTE' ? 'Pendiente de revision'
                    : v.estado === 'RECHAZADO' ? `Rechazado: ${v.detalle || ''}`
                    : v.estado === 'VENCIDO' ? 'Documento vencido'
                    : 'No iniciado'
                  }
                />
                {/* Info de quien aprobo */}
                {v.estado === 'COMPLETADO' && (
                  <p className="text-xs text-gray-400 ml-8 mt-1">
                    Aprobado por: {v.usuarioAprobador?.name || v.usuarioAprobador?.email || 'Sistema (pre-V3)'}
                    {v.aprobadoEn && ` — ${new Date(v.aprobadoEn).toLocaleDateString('es-AR')}`}
                  </p>
                )}
                {/* Badge tramite externo */}
                {v.estado === 'PENDIENTE' && !v.documentoUrl && enlacePorNombre[v.tipo] && (
                  <div className="mt-2 ml-8 flex items-center gap-2">
                    <Badge variant="warning">Tramite externo</Badge>
                    <a
                      href={enlacePorNombre[v.tipo]!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-blue underline text-xs"
                    >
                      Verificar en ARCA
                    </a>
                  </div>
                )}
                {/* Link del documento */}
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
                {/* Acciones para PENDIENTE — solo ESTADO */}
                {!soloLectura && v.estado === 'PENDIENTE' && (v.documentoUrl || enlacePorNombre[v.tipo]) && (
                  <div className="flex gap-2 mt-2 ml-8">
                    <form action={aprobarValidacion}>
                      <input type="hidden" name="validacionId" value={v.id} />
                      <SubmitButton size="sm" pendingText="Aprobando...">Aprobar</SubmitButton>
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
                      <SubmitButton size="sm" variant="secondary" pendingText="Rechazando...">Rechazar</SubmitButton>
                    </form>
                  </div>
                )}
                {/* Revocar COMPLETADO — solo ESTADO */}
                {!soloLectura && v.estado === 'COMPLETADO' && (
                  <div className="mt-2 ml-8">
                    <form action={revocarValidacion} className="flex gap-1">
                      <input type="hidden" name="validacionId" value={v.id} />
                      <input
                        type="text"
                        name="motivo"
                        placeholder="Motivo de la revocacion..."
                        required
                        className="text-xs border border-gray-300 rounded px-2 py-1 w-56"
                      />
                      <SubmitButton size="sm" variant="danger" pendingText="Revocando...">Revocar</SubmitButton>
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
          <h2 className="font-overpass font-bold text-brand-blue mb-3">Historial de decisiones</h2>
          {historialLogs.length === 0 ? (
            <p className="text-sm text-gray-500">Sin decisiones registradas.</p>
          ) : (
            <div className="space-y-2">
              {historialLogs.map(log => {
                const detalles = log.detalles as {
                  nivelAnterior?: string
                  nivelNuevo?: string
                  motivo?: string
                  tipoDocumento?: string
                }
                const esEstado = log.accion.startsWith('ESTADO_')
                const actor = log.user?.name ?? (esEstado ? 'Estado' : 'Admin (pre-V3)')
                const descripcion =
                  log.accion.includes('APROBADA') || log.accion.includes('COMPLETADO')
                    ? `${actor} aprobo ${detalles.tipoDocumento || 'una validacion'}`
                  : log.accion.includes('RECHAZADA') || log.accion.includes('RECHAZADO')
                    ? `${actor} rechazo ${detalles.tipoDocumento || 'una validacion'}${detalles.motivo ? ` — ${detalles.motivo}` : ''}`
                  : log.accion.includes('REVOCADA')
                    ? `${actor} revoco ${detalles.tipoDocumento || 'una validacion'}${detalles.motivo ? ` — ${detalles.motivo}` : ''}`
                  : log.accion === 'NIVEL_SUBIDO' ? `Subio de nivel: ${detalles.nivelAnterior} -> ${detalles.nivelNuevo}`
                  : log.accion === 'NIVEL_BAJADO' ? `Bajo de nivel: ${detalles.nivelAnterior} -> ${detalles.nivelNuevo}`
                  : log.accion
                return (
                  <div key={log.id} className="text-sm border-b border-gray-50 pb-2">
                    <span className="text-gray-400">
                      {log.timestamp.toLocaleDateString('es-AR')}
                    </span>
                    {esEstado && <Badge variant="default" className="ml-2 text-xs px-1.5 py-0">ESTADO</Badge>}
                    <p className="text-gray-700">{descripcion}</p>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      )}

      {/* Tab: Datos del taller (solo lectura) */}
      {tab === 'datos' && (
        <Card>
          <h2 className="font-overpass font-bold text-brand-blue mb-3">Datos del Taller</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Responsable</p>
              <p className="font-medium text-gray-800">{taller.user.name || 'Sin nombre registrado'}</p>
            </div>
            <div>
              <p className="text-gray-500">Fecha de registro</p>
              <p className="font-medium text-gray-800">
                {new Date(taller.user.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Ubicacion</p>
              <p className="font-medium text-gray-800">{taller.ubicacion || taller.provincia || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">Capacidad mensual</p>
              <p className="font-medium text-gray-800">{taller.capacidadMensual} unidades</p>
            </div>
            <div>
              <p className="text-gray-500">Trabajadores (autodeclarado)</p>
              <p className="font-medium text-gray-800">{taller.trabajadoresRegistrados}</p>
            </div>
            {taller.empleadosRegistradosSipa != null && (
              <div>
                <p className="text-gray-500">Empleados SIPA (verificado)</p>
                <p className="font-medium text-gray-800">{taller.empleadosRegistradosSipa}</p>
              </div>
            )}
          </div>

          {/* ARCA data */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700">Datos verificados por ARCA</p>
              {!soloLectura && <ReverificarButton tallerId={taller.id} />}
            </div>
            {taller.verificadoAfip ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {taller.tipoInscripcionAfip && (
                  <div>
                    <p className="text-gray-500">Tipo de inscripcion</p>
                    <p className="font-medium text-gray-800">{taller.tipoInscripcionAfip.replace(/_/g, ' ')}</p>
                  </div>
                )}
                {taller.categoriaMonotributo && (
                  <div>
                    <p className="text-gray-500">Categoria monotributo</p>
                    <p className="font-medium text-gray-800">{taller.categoriaMonotributo}</p>
                  </div>
                )}
                {taller.estadoCuitAfip && (
                  <div>
                    <p className="text-gray-500">Estado CUIT</p>
                    <p className="font-medium text-gray-800">{taller.estadoCuitAfip}</p>
                  </div>
                )}
                {taller.actividadesAfip.length > 0 && (
                  <div>
                    <p className="text-gray-500">Actividades AFIP</p>
                    <p className="font-medium text-gray-800">{taller.actividadesAfip.join(', ')}</p>
                  </div>
                )}
                {taller.domicilioFiscalAfip && (
                  <div>
                    <p className="text-gray-500">Domicilio fiscal</p>
                    <p className="font-medium text-gray-800">
                      {(() => {
                        const d = taller.domicilioFiscalAfip as { calle?: string; localidad?: string; provincia?: string }
                        return [d.calle, d.localidad, d.provincia].filter(Boolean).join(', ') || '-'
                      })()}
                    </p>
                  </div>
                )}
                {taller.verificadoAfipAt && (
                  <div>
                    <p className="text-gray-500">Ultima verificacion</p>
                    <p className="font-medium text-gray-800">{new Date(taller.verificadoAfipAt).toLocaleDateString('es-AR')}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-amber-600">Este taller no tiene verificacion de ARCA. Usa el boton para re-verificar.</p>
            )}
          </div>

          {taller.maquinaria.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-semibold text-gray-700 mb-2">Maquinaria</p>
              <div className="flex flex-wrap gap-2">
                {taller.maquinaria.map(m => (
                  <Badge key={m.id} variant="muted">{m.nombre} x{m.cantidad}</Badge>
                ))}
              </div>
            </div>
          )}

          {taller.certificados.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-semibold text-gray-700 mb-2">Certificados de academia</p>
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
      )}
    </div>
  )
}
