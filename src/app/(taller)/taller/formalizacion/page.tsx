export const dynamic = 'force-dynamic'

import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/compartido/componentes/ui/card'
import { Badge } from '@/compartido/componentes/ui/badge'
import { ChecklistItem } from '@/compartido/componentes/ui/checklist-item'
import { Button } from '@/compartido/componentes/ui/button'
import { ExternalLink } from 'lucide-react'
import { UploadButton } from '@/taller/componentes/upload-button'
import { VerDocumentoButton } from '@/taller/componentes/ver-documento-button'
import { MarcarRealizadoButton } from '@/taller/componentes/marcar-realizado-button'
import { nivelAEtapa } from '@/compartido/lib/formalizacion'

const estadoToStatus: Record<string, 'completed' | 'pending' | 'warning' | 'optional'> = {
  COMPLETADO: 'completed',
  PENDIENTE: 'pending',
  VENCIDO: 'warning',
  RECHAZADO: 'warning',
}

export default async function TallerFormalizacionPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const taller = await prisma.taller.findFirst({
    where: { userId: session.user.id },
    select: { id: true, nivel: true, puntaje: true },
  })

  if (!taller) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif font-bold text-3xl text-ink-primary">Mi recorrido</h1>
        <Card className="text-center py-12">
          <p className="text-gray-600 mb-4">Primero completá tu perfil para ver tu checklist de formalización.</p>
          <Link href="/taller/perfil/completar"><Button>Completar Perfil</Button></Link>
        </Card>
      </div>
    )
  }

  const [tiposDocumento, validaciones] = await Promise.all([
    prisma.tipoDocumento.findMany({
      where: { activo: true },
      orderBy: { orden: 'asc' },
    }),
    prisma.validacion.findMany({
      where: { tallerId: taller.id },
      include: { usuarioAprobador: { select: { role: true } } },
      orderBy: { createdAt: 'asc' },
    }),
  ])

  const validacionesPorNombre = Object.fromEntries(
    validaciones.map(v => [v.tipo, v])
  )

  return (
    <div className="space-y-6">
      <h1 className="font-serif font-bold text-3xl text-ink-primary">Mi recorrido</h1>

      {/* Resumen. La V4 descartó el porcentaje/ring de avance como gamificación:
          el recorrido se comunica por requisito (badges COMPLETADO/PENDIENTE más abajo),
          no con una barra de progreso ni un contador "X de N". */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <div>
            <div className="flex gap-2">
              <Badge variant="default">
                {nivelAEtapa(taller.nivel)}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Completá los requisitos de cada etapa para avanzar en tu recorrido de formalización.
            </p>
          </div>
        </Card>
        <Card>
          <p className="font-overpass font-bold text-brand-blue mb-2">Etapas del recorrido</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Etapa inicial</span><span className="text-gray-500">Registro completado</span></div>
            <div className="flex justify-between"><span>En proceso</span><span className="text-gray-500">Documentación en curso</span></div>
            <div className="flex justify-between"><span>Consolidada</span><span className="text-gray-500">Todos los requisitos</span></div>
          </div>
          <Link href="/taller/aprender" className="text-sm text-brand-blue hover:underline mt-3 block font-semibold">
            Capacitate en la academia →
          </Link>
        </Card>
      </div>

      {/* Cards por etapa */}
      {(['BRONCE', 'PLATA', 'ORO'] as const).map(nivel => {
        const docsEtapa = tiposDocumento.filter(td => td.nivelMinimo === nivel)
        if (docsEtapa.length === 0) return null

        return (
          <Card key={nivel}>
            <div className="mb-4">
              <h2 className="font-serif font-bold text-lg text-ink-primary">{nivelAEtapa(nivel)}</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {docsEtapa.map(td => {
                const validacion = validacionesPorNombre[td.nombre]
                const estado = validacion?.estado ?? 'NO_INICIADO'
                const status = estado === 'NO_INICIADO'
                  ? (td.requerido ? 'pending' : 'optional')
                  : (estadoToStatus[estado] || 'optional')

                return (
                  <div key={td.id} className="py-3 first:pt-0 last:pb-0">
                    <ChecklistItem
                      title={td.label}
                      status={status}
                      description={
                        estado === 'COMPLETADO'   ? `Verificado por ${validacion?.usuarioAprobador?.role === 'ESTADO' ? 'la Coordinación' : 'el equipo de PDT'}`
                      : estado === 'PENDIENTE'    ? 'En revisión por el equipo de PDT'
                      : estado === 'VENCIDO'      ? 'Documento vencido — requiere actualización'
                      : estado === 'RECHAZADO'    ? `Rechazado: ${validacion?.detalle || 'Revisá la documentación'}`
                      :                              td.descripcion ?? ''
                      }
                    />
                    {validacion?.documentoUrl && (
                      <div className="mt-2 ml-8">
                        <VerDocumentoButton
                          validacionId={validacion.id}
                          fileName={`Ver documento — ${td.label}`}
                        />
                      </div>
                    )}
                    {estado !== 'COMPLETADO' && (
                      <>
                        <div className="flex gap-2 mt-2 ml-8">
                          {(estado === 'NO_INICIADO' || estado === 'RECHAZADO') && validacion && (
                            <UploadButton validacionId={validacion.id} />
                          )}
                          {td.enlaceTramite && (
                            <a href={td.enlaceTramite} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="secondary" icon={<ExternalLink className="w-3 h-3" />}>
                                Ir al trámite
                              </Button>
                            </a>
                          )}
                          {td.enlaceTramite && estado === 'NO_INICIADO' && validacion && (
                            <MarcarRealizadoButton validacionId={validacion.id} />
                          )}
                        </div>
                        {td.costoEstimado && (
                          <div className="mt-2 ml-8 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                            {td.descripcion && <p>{td.descripcion}</p>}
                            <div className="flex gap-4 mt-2 text-xs text-gray-500">
                              <span className="font-medium">Costo: {td.costoEstimado}</span>
                              {!td.requerido && (
                                <span className="text-gray-400">(Opcional)</span>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>
        )
      })}

      {/* Ayuda */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-overpass font-bold text-brand-blue">¿Necesitás ayuda para formalizarte?</p>
            <p className="text-sm text-gray-500">Nuestros cursos gratuitos te guían paso a paso.</p>
          </div>
          <Link href="/taller/aprender">
            <Button variant="secondary">Ver cursos</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
