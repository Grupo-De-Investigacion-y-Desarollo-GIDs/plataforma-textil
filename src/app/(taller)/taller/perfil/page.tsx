export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProgressRing } from '@/components/ui/progress-ring'
import { Star, MapPin, Users, TrendingUp, Clock, Award, Edit } from 'lucide-react'

const nivelColor: Record<string, 'warning' | 'default' | 'success'> = { BRONCE: 'warning', PLATA: 'default', ORO: 'success' }

export default async function TallerPerfilPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const taller = await prisma.taller.findFirst({
    where: { userId: session.user.id },
    include: {
      user: { select: { email: true, phone: true } },
      procesos: { include: { proceso: true } },
      prendas: { include: { prenda: true } },
      maquinaria: true,
      certificaciones: { where: { activa: true } },
    },
  })

  if (!taller) {
    return (
      <div className="space-y-6">
        <h1 className="font-overpass font-bold text-3xl text-brand-blue">Mi Perfil</h1>
        <Card className="text-center py-12">
          <p className="text-gray-600 mb-4">Todavía no completaste tu perfil.</p>
          <Link href="/taller/perfil/completar">
            <Button>Completar Perfil</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const checks = ['nombre', 'cuit', 'ubicacion', 'descripcion', 'zona', 'fundado'] as const
  const campos = checks.length + 4
  let completos = checks.filter(c => (taller as Record<string, unknown>)[c]).length
  if (taller.capacidadMensual > 0) completos++
  if (taller.trabajadoresRegistrados > 0) completos++
  if (taller.procesos.length > 0) completos++
  if (taller.maquinaria.length > 0) completos++
  const completitud = Math.round((completos / campos) * 100)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-overpass font-bold text-3xl text-brand-blue">{taller.nombre}</h1>
            <Badge variant={nivelColor[taller.nivel]}>{taller.nivel}</Badge>
          </div>
          {taller.ubicacion && (
            <p className="flex items-center gap-1 text-gray-600">
              <MapPin className="w-4 h-4" /> {taller.ubicacion}
              {taller.zona && <span className="text-gray-400"> · {taller.zona}</span>}
            </p>
          )}
          <p className="text-sm text-gray-500 mt-1">{taller.user.email} {taller.user.phone && `· ${taller.user.phone}`}</p>
        </div>
        <Link href="/taller/perfil/completar">
          <Button variant="secondary" size="sm" icon={<Edit className="w-4 h-4" />}>Editar</Button>
        </Link>
      </div>

      <Card>
        <div className="flex items-center gap-6">
          <ProgressRing percentage={completitud} size={80} />
          <div>
            <p className="font-overpass font-bold text-brand-blue text-lg">Perfil {completitud}% completo</p>
            <p className="text-sm text-gray-500">
              {completitud < 100
                ? 'Completá tu perfil para mejorar tu visibilidad en el directorio.'
                : 'Tu perfil está completo. Las marcas pueden encontrarte fácilmente.'}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      {taller.descripcion && (
        <Card title="Descripción">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{taller.descripcion}</p>
        </Card>
      )}

      <Card title="Información General">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">CUIT</p>
            <p className="font-medium">{taller.cuit}</p>
          </div>
          {taller.fundado && (
            <div>
              <p className="text-gray-500">Fundado</p>
              <p className="font-medium">{taller.fundado}</p>
            </div>
          )}
          <div>
            <p className="text-gray-500">Pedidos completados</p>
            <p className="font-medium">{taller.pedidosCompletados}</p>
          </div>
          <div>
            <p className="text-gray-500">Puntaje</p>
            <p className="font-medium">{taller.puntaje} pts</p>
          </div>
        </div>
      </Card>

      {taller.procesos.length > 0 && (
        <Card title="Procesos Productivos">
          <div className="flex flex-wrap gap-2">
            {taller.procesos.map((tp) => (
              <Badge key={tp.id} variant="outline">{tp.proceso.nombre}</Badge>
            ))}
          </div>
        </Card>
      )}

      {taller.prendas.length > 0 && (
        <Card title="Tipos de Prenda">
          <div className="flex flex-wrap gap-2">
            {taller.prendas.map((tp) => (
              <Badge key={tp.id} variant="default">{tp.prenda.nombre}</Badge>
            ))}
          </div>
        </Card>
      )}

      {taller.maquinaria.length > 0 && (
        <Card title="Maquinaria">
          <ul className="space-y-1 text-sm">
            {taller.maquinaria.map((m) => (
              <li key={m.id} className="flex justify-between">
                <span>{m.nombre} {m.tipo && <span className="text-gray-400">({m.tipo})</span>}</span>
                <span className="text-gray-500 font-medium">x{m.cantidad}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {taller.certificaciones.length > 0 && (
        <Card title="Certificaciones">
          <div className="flex flex-wrap gap-2">
            {taller.certificaciones.map((c) => (
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
