export const dynamic = 'force-dynamic'

import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/compartido/componentes/ui/card'
import { Badge } from '@/compartido/componentes/ui/badge'
import { ChecklistItem } from '@/compartido/componentes/ui/checklist-item'
import { ProgressRing } from '@/compartido/componentes/ui/progress-ring'
import { Button } from '@/compartido/componentes/ui/button'
import { FileText, ExternalLink } from 'lucide-react'
import { UploadButton } from '@/taller/componentes/upload-button'

const estadoToStatus: Record<string, 'completed' | 'pending' | 'warning' | 'optional'> = {
  COMPLETADO: 'completed',
  PENDIENTE: 'pending',
  NO_INICIADO: 'optional',
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
        <h1 className="font-overpass font-bold text-3xl text-brand-blue">Mi Formalización</h1>
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
      orderBy: { createdAt: 'asc' },
    }),
  ])

  const validacionesPorNombre = Object.fromEntries(
    validaciones.map(v => [v.tipo, v])
  )

  const completadas = validaciones.filter(v => v.estado === 'COMPLETADO').length
  const total = tiposDocumento.length
  const progreso = Math.round((completadas / total) * 100)

  return (
    <div className="space-y-6">
      <h1 className="font-overpass font-bold text-3xl text-brand-blue">Mi Formalización</h1>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <div className="flex items-center gap-6">
            <ProgressRing percentage={progreso} size={100} />
            <div>
              <p className="font-overpass font-bold text-2xl text-brand-blue">{completadas}/{total} completadas</p>
              <p className="text-sm text-gray-500 mt-1">
                {progreso === 100
                  ? '¡Felicitaciones! Tu taller está completamente formalizado.'
                  : 'Completá los requisitos para subir de nivel y acceder a más oportunidades.'}
              </p>
              <div className="flex gap-2 mt-3">
                <Badge variant={taller.nivel === 'BRONCE' ? 'warning' : taller.nivel === 'PLATA' ? 'default' : 'success'}>
                  Nivel {taller.nivel}
                </Badge>
                <Badge variant="outline">{taller.puntaje} pts</Badge>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <p className="font-overpass font-bold text-brand-blue mb-2">Niveles</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Bronce</span><span className="text-gray-500">0-39 pts</span></div>
            <div className="flex justify-between"><span>Plata</span><span className="text-gray-500">40-69 pts</span></div>
            <div className="flex justify-between"><span>Oro</span><span className="text-gray-500">70+ pts</span></div>
          </div>
          <Link href="/taller/aprender" className="text-sm text-brand-blue hover:underline mt-3 block font-semibold">
            Ganá más puntos con capacitaciones →
          </Link>
        </Card>
      </div>

      {/* Checklist */}
      <Card title={<span className="inline-flex items-center gap-2"><FileText className="w-5 h-5" />Checklist de Formalización</span>}>
        <div className="divide-y divide-gray-100">
          {tiposDocumento.map(td => {
            const validacion = validacionesPorNombre[td.nombre]
            const estado = validacion?.estado ?? 'NO_INICIADO'
            const status = estadoToStatus[estado] || 'optional'

            return (
              <div key={td.id} className="py-3 first:pt-0 last:pb-0">
                <ChecklistItem
                  title={td.label}
                  status={status}
                  description={
                    estado === 'COMPLETADO'   ? 'Documentación verificada'
                  : estado === 'PENDIENTE'    ? 'En revisión por el equipo de PDT'
                  : estado === 'VENCIDO'      ? 'Documento vencido — requiere actualización'
                  : estado === 'RECHAZADO'    ? `Rechazado: ${validacion?.detalle || 'Revisá la documentación'}`
                  :                              td.descripcion ?? ''
                  }
                />
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
