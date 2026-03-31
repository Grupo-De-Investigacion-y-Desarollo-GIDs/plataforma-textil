export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Star, MapPin, Users, ArrowRight } from 'lucide-react'

const nivelColor: Record<string, 'warning' | 'default' | 'success'> = { BRONCE: 'warning', PLATA: 'default', ORO: 'success' }

export default async function DirectorioPage() {
  const talleres = await prisma.taller.findMany({
    include: { procesos: { include: { proceso: true } } },
    orderBy: { rating: 'desc' },
  })

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="font-overpass font-bold text-3xl text-brand-blue mb-2">Directorio de Talleres</h1>
        <p className="text-gray-600">Encontrá talleres textiles registrados y verificados en la plataforma.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {talleres.map((taller: { id: string; nombre: string; nivel: string; zona: string | null; rating: number; trabajadoresRegistrados: number; capacidadMensual: number; procesos: { id: string; proceso: { nombre: string } }[] }) => (
          <Link key={taller.id} href={`/perfil/${taller.id}`}>
            <Card className="h-full hover:shadow-card-hover transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h2 className="font-overpass font-bold text-lg text-brand-blue">{taller.nombre}</h2>
                <Badge variant={nivelColor[taller.nivel]}>{taller.nivel}</Badge>
              </div>

              {taller.zona && (
                <p className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                  <MapPin className="w-3.5 h-3.5" /> {taller.zona}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-500" /> {taller.rating.toFixed(1)}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {taller.trabajadoresRegistrados}
                </span>
                <span>{taller.capacidadMensual.toLocaleString()} u/mes</span>
              </div>

              {taller.procesos.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {taller.procesos.map((tp: { id: string; proceso: { nombre: string } }) => (
                    <Badge key={tp.id} variant="outline" className="text-xs">{tp.proceso.nombre}</Badge>
                  ))}
                </div>
              )}

              <span className="inline-flex items-center gap-1 text-sm text-brand-blue font-semibold">
                Ver perfil <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Card>
          </Link>
        ))}
      </div>

      {talleres.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No hay talleres registrados aún.
        </div>
      )}
    </div>
  )
}
