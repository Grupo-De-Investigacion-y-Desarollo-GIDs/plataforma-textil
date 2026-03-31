export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, Play, Award, Clock } from 'lucide-react'

export default async function TallerAprenderPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const taller = await prisma.taller.findFirst({
    where: { userId: session.user.id },
    select: { id: true },
  })

  const colecciones = await prisma.coleccion.findMany({
    where: { activa: true },
    include: {
      _count: { select: { videos: true } },
      certificados: taller ? { where: { tallerId: taller.id } } : false,
      progreso: taller ? { where: { tallerId: taller.id } } : false,
    },
    orderBy: { orden: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-overpass font-bold text-3xl text-brand-blue">Academia</h1>
          <p className="text-gray-500 mt-1">Cursos gratuitos para mejorar tu taller y ganar puntos de formalización.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center p-4">
          <BookOpen className="w-5 h-5 text-brand-blue mx-auto mb-1" />
          <p className="font-overpass font-bold text-2xl text-brand-blue">{colecciones.length}</p>
          <p className="text-xs text-gray-500">Cursos disponibles</p>
        </Card>
        <Card className="text-center p-4">
          <Play className="w-5 h-5 text-brand-blue mx-auto mb-1" />
          <p className="font-overpass font-bold text-2xl text-brand-blue">
            {colecciones.reduce((sum, c) => sum + c._count.videos, 0)}
          </p>
          <p className="text-xs text-gray-500">Videos totales</p>
        </Card>
        <Card className="text-center p-4">
          <Award className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
          <p className="font-overpass font-bold text-2xl text-brand-blue">
            {colecciones.filter(c => c.certificados && c.certificados.length > 0).length}
          </p>
          <p className="text-xs text-gray-500">Certificados obtenidos</p>
        </Card>
      </div>

      {/* Lista de colecciones */}
      <div className="space-y-4">
        {colecciones.map((col) => {
          const progreso = col.progreso?.[0]
          const certificado = col.certificados?.[0]
          const porcentaje = progreso?.porcentajeCompletado || 0

          return (
            <Card key={col.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-overpass font-bold text-lg text-brand-blue">{col.titulo}</h2>
                    {certificado && !certificado.revocado && (
                      <Badge variant="success">Certificado</Badge>
                    )}
                    {!certificado && porcentaje > 0 && (
                      <Badge variant="warning">En progreso</Badge>
                    )}
                  </div>
                  {col.descripcion && (
                    <p className="text-sm text-gray-600 mb-2">{col.descripcion}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {col.institucion && <span>{col.institucion}</span>}
                    <span className="flex items-center gap-1"><Play className="w-3 h-3" /> {col._count.videos} videos</span>
                    {col.duracion && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {col.duracion}</span>}
                    {col.categoria && <Badge variant="outline">{col.categoria}</Badge>}
                  </div>

                  {/* Barra de progreso */}
                  {porcentaje > 0 && !certificado && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progreso</span>
                        <span>{Math.round(porcentaje)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-blue rounded-full transition-all" style={{ width: `${porcentaje}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                <Link href={`/taller/aprender/${col.id}`} className="ml-4 shrink-0">
                  <Button variant={certificado ? 'secondary' : 'primary'} size="sm">
                    {certificado ? 'Revisar' : porcentaje > 0 ? 'Continuar' : 'Empezar'}
                  </Button>
                </Link>
              </div>
            </Card>
          )
        })}

        {colecciones.length === 0 && (
          <Card className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay cursos disponibles todavía.</p>
          </Card>
        )}
      </div>
    </div>
  )
}
