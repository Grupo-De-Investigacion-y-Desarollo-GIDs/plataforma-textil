export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Star, MapPin, Users, TrendingUp, Clock, Award } from 'lucide-react'

const nivelColor: Record<string, 'warning' | 'default' | 'success'> = { BRONCE: 'warning', PLATA: 'default', ORO: 'success' }

export default async function PerfilPublicoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const taller = await prisma.taller.findUnique({
    where: { id },
    include: {
      procesos: { include: { proceso: true } },
      maquinaria: true,
      certificaciones: { where: { activa: true } },
    },
  })

  if (!taller) notFound()

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="font-overpass font-bold text-3xl text-brand-blue">{taller.nombre}</h1>
          <Badge variant={nivelColor[taller.nivel]}>{taller.nivel}</Badge>
        </div>
        {taller.ubicacion && (
          <p className="flex items-center gap-1 text-gray-600">
            <MapPin className="w-4 h-4" /> {taller.ubicacion}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="text-center p-4">
          <Star className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
          <p className="font-overpass font-bold text-2xl text-brand-blue">{taller.rating.toFixed(1)}</p>
          <p className="text-xs text-gray-500">Rating</p>
        </Card>
        <Card className="text-center p-4">
          <Users className="w-5 h-5 text-brand-blue mx-auto mb-1" />
          <p className="font-overpass font-bold text-2xl text-brand-blue">{taller.trabajadoresRegistrados}</p>
          <p className="text-xs text-gray-500">Trabajadores</p>
        </Card>
        <Card className="text-center p-4">
          <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-1" />
          <p className="font-overpass font-bold text-2xl text-brand-blue">{taller.capacidadMensual.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Cap. mensual</p>
        </Card>
        <Card className="text-center p-4">
          <Clock className="w-5 h-5 text-blue-500 mx-auto mb-1" />
          <p className="font-overpass font-bold text-2xl text-brand-blue">{taller.ontimeRate}%</p>
          <p className="text-xs text-gray-500">On-time</p>
        </Card>
      </div>

      {taller.procesos.length > 0 && (
        <Card title="Procesos" className="mb-4">
          <div className="flex flex-wrap gap-2">
            {taller.procesos.map((tp: { id: string; proceso: { nombre: string } }) => (
              <Badge key={tp.id} variant="outline">{tp.proceso.nombre}</Badge>
            ))}
          </div>
        </Card>
      )}

      {taller.maquinaria.length > 0 && (
        <Card title="Maquinaria" className="mb-4">
          <ul className="space-y-1 text-sm">
            {taller.maquinaria.map((m: { id: string; nombre: string; cantidad: number }) => (
              <li key={m.id} className="flex justify-between">
                <span>{m.nombre}</span>
                <span className="text-gray-500">x{m.cantidad}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {taller.certificaciones.length > 0 && (
        <Card title="Certificaciones">
          <div className="flex flex-wrap gap-2">
            {taller.certificaciones.map((c: { id: string; nombre: string }) => (
              <Badge key={c.id} variant="success">
                <Award className="w-3 h-3 mr-1" />{c.nombre}
              </Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
