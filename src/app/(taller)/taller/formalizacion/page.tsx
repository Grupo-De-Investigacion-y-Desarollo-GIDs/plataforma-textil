export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChecklistItem } from '@/components/ui/checklist-item'
import { ProgressRing } from '@/components/ui/progress-ring'
import { Button } from '@/components/ui/button'
import { FileText, ExternalLink } from 'lucide-react'
import { UploadButton } from './upload-button'

const tiposValidacion = [
  { tipo: 'CUIT_MONOTRIBUTO', label: 'CUIT / Monotributo', descripcion: 'Inscripción en ARCA (ex-AFIP)', enlace: 'https://www.afip.gob.ar' },
  { tipo: 'HABILITACION_MUNICIPAL', label: 'Habilitación Municipal', descripcion: 'Permiso de funcionamiento del municipio', enlace: null },
  { tipo: 'ART', label: 'ART (Aseguradora de Riesgos)', descripcion: 'Seguro para trabajadores', enlace: null },
  { tipo: 'INSCRIPCION_EMPLEADOR', label: 'Inscripción como Empleador', descripcion: 'Registro en ARCA como empleador', enlace: 'https://www.afip.gob.ar' },
  { tipo: 'SEGURIDAD_HIGIENE', label: 'Seguridad e Higiene', descripcion: 'Plan de seguridad e higiene laboral', enlace: null },
  { tipo: 'HABILITACION_BOMBEROS', label: 'Habilitación de Bomberos', descripcion: 'Certificado de prevención contra incendios', enlace: null },
  { tipo: 'LIBRO_SUELDOS', label: 'Libro de Sueldos Digital', descripcion: 'Registro digital de remuneraciones', enlace: null },
  { tipo: 'CERTIFICACION_AMBIENTAL', label: 'Certificación Ambiental', descripcion: 'Gestión de residuos textiles (opcional)', enlace: null },
]

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

  // Ensure a validacion record exists for each type
  for (const tv of tiposValidacion) {
    await prisma.validacion.upsert({
      where: { tallerId_tipo: { tallerId: taller.id, tipo: tv.tipo } },
      create: { tallerId: taller.id, tipo: tv.tipo, estado: 'NO_INICIADO' },
      update: {},
    })
  }

  const validaciones = await prisma.validacion.findMany({
    where: { tallerId: taller.id },
    orderBy: { createdAt: 'asc' },
  })

  const validacionMap = new Map(validaciones.map(v => [v.tipo, v]))

  const completadas = validaciones.filter(v => v.estado === 'COMPLETADO').length
  const total = tiposValidacion.length
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
          {tiposValidacion.map((tipo) => {
            const validacion = validacionMap.get(tipo.tipo)
            const estado = validacion?.estado || 'NO_INICIADO'
            const status = estadoToStatus[estado] || 'optional'

            return (
              <div key={tipo.tipo} className="py-3 first:pt-0 last:pb-0">
                <ChecklistItem
                  title={tipo.label}
                  status={status}
                  description={
                    estado === 'COMPLETADO'
                      ? 'Documentación verificada'
                      : estado === 'PENDIENTE'
                        ? 'En revisión por el equipo de PDT'
                        : estado === 'VENCIDO'
                          ? 'Documento vencido - requiere actualización'
                          : estado === 'RECHAZADO'
                            ? `Rechazado: ${validacion?.detalle || 'Revisá la documentación'}`
                            : tipo.descripcion
                  }
                />
                {estado !== 'COMPLETADO' && (
                  <div className="flex gap-2 mt-2 ml-8">
                    {(estado === 'NO_INICIADO' || estado === 'RECHAZADO') && validacion && (
                      <UploadButton validacionId={validacion.id} />
                    )}
                    {tipo.enlace && (
                      <a href={tipo.enlace} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="secondary" icon={<ExternalLink className="w-3 h-3" />}>
                          Ir al trámite
                        </Button>
                      </a>
                    )}
                  </div>
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


