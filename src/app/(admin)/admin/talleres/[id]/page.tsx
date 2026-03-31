export const dynamic = 'force-dynamic'

import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { aplicarNivel } from '@/lib/nivel'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChecklistItem } from '@/components/ui/checklist-item'
import { ArrowLeft, MapPin, Mail, Phone } from 'lucide-react'

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

  const taller = await prisma.taller.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, phone: true, name: true, active: true } },
      validaciones: { orderBy: { createdAt: 'asc' } },
      maquinaria: true,
      certificados: { include: { coleccion: { select: { titulo: true } } } },
    },
  })

  if (!taller) notFound()

  const logs = await prisma.logActividad.findMany({
    where: { detalles: { path: ['tallerId'], equals: id } },
    orderBy: { timestamp: 'desc' },
    take: 20,
    include: { user: { select: { name: true } } },
  })

  // Server actions
  async function aprobarValidacion(formData: FormData) {
    'use server'
    const validacionId = formData.get('validacionId') as string
    await prisma.validacion.update({
      where: { id: validacionId },
      data: { estado: 'COMPLETADO' },
    })
    await aplicarNivel(id)
    await prisma.logActividad.create({
      data: {
        userId: session!.user!.id,
        accion: 'VALIDACION_APROBADA',
        detalles: { tallerId: id, validacionId },
      },
    })
    redirect(`/admin/talleres/${id}?tab=formalizacion`)
  }

  async function rechazarValidacion(formData: FormData) {
    'use server'
    const validacionId = formData.get('validacionId') as string
    const motivo = formData.get('motivo') as string
    await prisma.validacion.update({
      where: { id: validacionId },
      data: { estado: 'RECHAZADO', detalle: motivo || 'Documentación insuficiente' },
    })
    await aplicarNivel(id)
    await prisma.logActividad.create({
      data: {
        userId: session!.user!.id,
        accion: 'VALIDACION_RECHAZADA',
        detalles: { tallerId: id, validacionId, motivo },
      },
    })
    redirect(`/admin/talleres/${id}?tab=formalizacion`)
  }

  async function guardarNota(formData: FormData) {
    'use server'
    const texto = formData.get('texto') as string
    if (!texto?.trim()) return
    await prisma.logActividad.create({
      data: {
        userId: session!.user!.id,
        accion: 'NOTA_INTERNA',
        detalles: { tallerId: id, texto: texto.trim() },
      },
    })
    redirect(`/admin/talleres/${id}?tab=${tab}`)
  }

  const nivelVariant = taller.nivel === 'ORO' ? 'success' : taller.nivel === 'PLATA' ? 'default' : 'warning'
  const docsConUrl = taller.validaciones.filter(v => v.documentoUrl && v.estado === 'PENDIENTE')

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
              {taller.zona && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {taller.zona}</span>}
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

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(['formalizacion', 'documentos', 'actividad'] as const).map(t => (
          <Link
            key={t}
            href={`/admin/talleres/${id}?tab=${t}`}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === t ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t === 'formalizacion' ? 'Formalización' : t === 'documentos' ? `Documentos (${docsConUrl.length})` : 'Actividad'}
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
                  title={v.tipo.replace(/_/g, ' ')}
                  status={estadoToStatus[v.estado] || 'optional'}
                  description={
                    v.estado === 'COMPLETADO' ? 'Verificado'
                    : v.estado === 'PENDIENTE' ? 'Pendiente de revisión'
                    : v.estado === 'RECHAZADO' ? `Rechazado: ${v.detalle || ''}`
                    : v.estado === 'VENCIDO' ? 'Documento vencido'
                    : 'No iniciado'
                  }
                />
                {v.estado === 'PENDIENTE' && v.documentoUrl && (
                  <div className="flex gap-2 mt-2 ml-8">
                    <a href={v.documentoUrl} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="secondary">Ver documento</Button>
                    </a>
                    <form action={aprobarValidacion}>
                      <input type="hidden" name="validacionId" value={v.id} />
                      <Button size="sm" type="submit">Aprobar</Button>
                    </form>
                    <form action={rechazarValidacion} className="flex gap-1">
                      <input type="hidden" name="validacionId" value={v.id} />
                      <input type="text" name="motivo" placeholder="Motivo..." className="text-xs border rounded px-2 py-1 w-40" />
                      <Button size="sm" variant="secondary" type="submit">Rechazar</Button>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab: Documentos */}
      {tab === 'documentos' && (
        <Card>
          <h2 className="font-overpass font-bold text-brand-blue mb-3">Documentos Pendientes de Revisión</h2>
          {docsConUrl.length === 0 ? (
            <p className="text-sm text-gray-500">No hay documentos pendientes de revisión.</p>
          ) : (
            <div className="space-y-3">
              {docsConUrl.map(v => (
                <div key={v.id} className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <p className="text-sm font-semibold">{v.tipo.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-500">Subido: {v.updatedAt.toLocaleDateString('es-AR')}</p>
                  </div>
                  <div className="flex gap-2">
                    <a href={v.documentoUrl!} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="secondary">Ver</Button>
                    </a>
                    <form action={aprobarValidacion}>
                      <input type="hidden" name="validacionId" value={v.id} />
                      <Button size="sm" type="submit">Aprobar</Button>
                    </form>
                    <form action={rechazarValidacion}>
                      <input type="hidden" name="validacionId" value={v.id} />
                      <input type="hidden" name="motivo" value="Documento ilegible o incorrecto" />
                      <Button size="sm" variant="secondary" type="submit">Rechazar</Button>
                    </form>
                  </div>
                </div>
              ))}
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
        <div className="space-y-2">
          {logs.filter(l => l.accion === 'NOTA_INTERNA').map(log => (
            <p key={log.id} className="text-sm">
              <span className="text-gray-400">{log.timestamp.toLocaleDateString('es-AR')}</span>
              {' - '}
              <strong>{log.user?.name || 'Admin'}</strong>
              {': &ldquo;'}
              {(log.detalles as Record<string, string>)?.texto || ''}
              {'&rdquo;'}
            </p>
          ))}
        </div>
      </Card>
    </div>
  )
}
