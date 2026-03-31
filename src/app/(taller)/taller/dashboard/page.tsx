'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { FileText, BookOpen, Search, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProgressRing } from '@/components/ui/progress-ring'
import { Button } from '@/components/ui/button'

const nivelLabel: Record<string, { text: string; variant: 'warning' | 'default' | 'success' }> = {
  BRONCE: { text: 'BRONCE', variant: 'warning' },
  PLATA: { text: 'PLATA', variant: 'default' },
  ORO: { text: 'ORO', variant: 'success' },
}

const cursos = [
  { titulo: 'Formalización básica', videos: 5, duracion: '45 min', href: '/taller/aprender' },
  { titulo: 'Cálculo de costos', videos: 4, duracion: '35 min', href: '/taller/aprender' },
  { titulo: 'Control de calidad', videos: 5, duracion: '40 min', href: '/taller/aprender' },
]

export default function DashboardTallerPage() {
  const { data: session } = useSession()
  const nivel = 'BRONCE'
  const progreso = 40

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="font-overpass font-bold text-2xl text-brand-blue">
          Bienvenido, {session?.user?.name || 'Taller'}
        </h1>
        <p className="text-gray-600 flex items-center gap-2 mt-1">
          Tu nivel actual: <Badge variant={nivelLabel[nivel]?.variant || 'default'}>{nivelLabel[nivel]?.text || nivel}</Badge>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card title="Progreso de Formalización">
          <div className="flex items-center gap-6">
            <ProgressRing percentage={progreso} size={100} />
            <div className="text-sm space-y-1">
              <div className="flex items-center gap-2"><span className="text-green-600 font-semibold">7/8</span> Completadas</div>
              <div className="flex items-center gap-2"><span className="text-yellow-600 font-semibold">1/8</span> Pendientes</div>
              <div className="flex items-center gap-2"><span className="text-gray-400 font-semibold">0/8</span> No iniciadas</div>
            </div>
          </div>
        </Card>

        <Card title="Tu Posición">
          <div className="text-center">
            <p className="font-overpass font-bold text-4xl text-brand-blue">{progreso}%</p>
            <p className="text-sm text-gray-500 mt-1">Tu progreso actual</p>
            <p className="text-sm text-gray-400 mt-2">Promedio talleres: 78%</p>
            <Link href="/taller/formalizacion" className="text-sm text-brand-blue font-semibold hover:underline mt-2 inline-block">
              Ver detalle <ArrowRight className="w-3 h-3 inline" />
            </Link>
          </div>
        </Card>
      </div>

      <Card className="mb-6 border-l-4 border-l-brand-red bg-blue-50/50">
        <p className="text-sm">
          <span className="font-semibold">Buen avance!</span> Completá tu capacitación para subir a nivel PLATA y aparecer primero en búsquedas.
        </p>
      </Card>

      <h2 className="font-overpass font-bold text-lg text-brand-blue mb-3">Acciones Rápidas</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <Link href="/taller/perfil">
          <Card className="text-center hover:shadow-card-hover transition-shadow cursor-pointer p-4">
            <FileText className="w-6 h-6 text-brand-blue mx-auto mb-2" />
            <p className="text-sm font-semibold">Completar mi perfil</p>
          </Card>
        </Link>
        <Link href="/taller/aprender">
          <Card className="text-center hover:shadow-card-hover transition-shadow cursor-pointer p-4">
            <BookOpen className="w-6 h-6 text-brand-blue mx-auto mb-2" />
            <p className="text-sm font-semibold">Ver cursos disponibles</p>
          </Card>
        </Link>
        <Link href="/directorio">
          <Card className="text-center hover:shadow-card-hover transition-shadow cursor-pointer p-4">
            <Search className="w-6 h-6 text-brand-blue mx-auto mb-2" />
            <p className="text-sm font-semibold">Explorar marcas</p>
          </Card>
        </Link>
      </div>

      <h2 className="font-overpass font-bold text-lg text-brand-blue mb-3">Capacitaciones Recomendadas</h2>
      <div className="space-y-3">
        {cursos.map((curso) => (
          <Card key={curso.titulo} className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{curso.titulo}</p>
              <p className="text-sm text-gray-500">{curso.videos} videos | {curso.duracion}</p>
            </div>
            <Link href={curso.href}>
              <Button size="sm">Empezar</Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  )
}
