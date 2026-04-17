export const dynamic = 'force-dynamic'

import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/compartido/componentes/ui/badge'
import { Card } from '@/compartido/componentes/ui/card'
import { Button } from '@/compartido/componentes/ui/button'
import { ProgressRing } from '@/compartido/componentes/ui/progress-ring'
import { Star, MapPin, Users, TrendingUp, Clock, Award, Download } from 'lucide-react'
import { PortfolioManager } from '@/taller/componentes/portfolio-manager'

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
      certificados: {
        where: { revocado: false },
        include: { coleccion: { select: { titulo: true } } },
        orderBy: { fecha: 'desc' },
      },
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

  const checks = ['nombre', 'cuit', 'ubicacion', 'descripcion', 'provincia', 'fundado'] as const
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
              {taller.provincia && <span className="text-gray-400"> · {taller.provincia}{taller.partido ? `, ${taller.partido}` : ''}</span>}
            </p>
          )}
          <p className="text-sm text-gray-500 mt-1">{taller.user.email} {taller.user.phone && `· ${taller.user.phone}`}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/taller/perfil/editar">
            <Button variant="secondary" size="sm">Editar datos básicos</Button>
          </Link>
          <Link href="/taller/perfil/completar">
            <Button variant="ghost" size="sm">{taller.sam ? 'Actualizar perfil productivo' : 'Completar perfil productivo'}</Button>
          </Link>
        </div>
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

      <Card title="Mi portfolio">
        <PortfolioManager tallerId={taller.id} fotosActuales={taller.portfolioFotos} />
      </Card>

      {taller.organizacion && (
        <Card title="Perfil productivo">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500 text-xs mb-1">Organización</p>
              <p className="font-medium text-gray-800">
                {taller.organizacion === 'linea' ? 'En línea'
                 : taller.organizacion === 'modular' ? 'Modular'
                 : 'Prenda completa'}
              </p>
            </div>

            {(taller.metrosCuadrados ?? 0) > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-1">Espacio</p>
                <p className="font-medium text-gray-800">{taller.metrosCuadrados} m²</p>
              </div>
            )}

            {taller.experienciaPromedio && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-1">Experiencia del equipo</p>
                <p className="font-medium text-gray-800">
                  {taller.experienciaPromedio === '5+' ? 'Más de 5 años'
                   : taller.experienciaPromedio === '3-5' ? '3 a 5 años'
                   : taller.experienciaPromedio === '1-3' ? '1 a 3 años'
                   : 'Menos de 1 año'}
                </p>
              </div>
            )}

            {taller.registroProduccion && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-1">Registro de producción</p>
                <p className="font-medium text-gray-800">
                  {taller.registroProduccion === 'software' ? 'Software'
                   : taller.registroProduccion === 'excel' ? 'Excel/planilla'
                   : taller.registroProduccion === 'papel' ? 'Papel'
                   : 'Sin registro'}
                </p>
              </div>
            )}

            {taller.escalabilidad && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-1">Puede escalar</p>
                <p className="font-medium text-gray-800">
                  {taller.escalabilidad === 'turno' ? 'Segundo turno'
                   : taller.escalabilidad === 'tercerizar' ? 'Tercerización'
                   : taller.escalabilidad === 'contratar' ? 'Contratando personal'
                   : taller.escalabilidad === 'horas-extra' ? 'Horas extra'
                   : 'Sin capacidad de escalar'}
                </p>
              </div>
            )}

            {(taller.sam ?? 0) > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-1">SAM ({taller.prendaPrincipal})</p>
                <p className="font-medium text-gray-800">{taller.sam} min</p>
              </div>
            )}

          </div>

          <p className="text-xs text-gray-400 mt-4">
            Esta información es visible para el equipo de la plataforma y organismos del Estado.
            No afecta tu nivel de formalización.
          </p>
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

      {taller.certificados.length > 0 && (
        <Card title="Certificados de Academia">
          <div className="space-y-2">
            {taller.certificados.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{c.coleccion.titulo}</p>
                    <p className="text-xs text-gray-500">Código: {c.codigo} · Calificación: {c.calificacion}%</p>
                  </div>
                </div>
                <a
                  href={`/api/certificados/${c.id}/pdf`}
                  download
                  className="inline-flex items-center gap-1 text-xs text-brand-blue hover:underline"
                >
                  <Download className="w-3 h-3" /> PDF
                </a>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
