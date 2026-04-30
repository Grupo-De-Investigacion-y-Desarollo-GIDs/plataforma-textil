export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { prisma } from '@/compartido/lib/prisma'
import { Badge } from '@/compartido/componentes/ui/badge'
import { Card } from '@/compartido/componentes/ui/card'
import { Star, MapPin, Users, TrendingUp, Clock, Award, ShieldCheck } from 'lucide-react'
import { GaleriaFotos } from '@/taller/componentes/galeria-fotos'

export default async function PerfilPublicoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const taller = await prisma.taller.findUnique({
    where: { id },
    include: {
      procesos: { include: { proceso: true } },
      prendas: { include: { prenda: true } },
      maquinaria: true,
      certificaciones: { where: { activa: true } },
      certificados: {
        where: { revocado: false },
        include: { coleccion: { select: { titulo: true, institucion: true } } },
        orderBy: { fecha: 'desc' },
      },
      validaciones: {
        where: { estado: 'COMPLETADO' },
        select: { tipoDocumento: { select: { nombre: true } } },
      },
    },
  })

  if (!taller) notFound()

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4">
        <a href="/directorio" className="text-brand-blue hover:underline text-sm">
          ← Volver al directorio
        </a>
      </div>

      <div className="mb-6">
        <h1 className="font-overpass font-bold text-3xl text-brand-blue mb-2">{taller.nombre}</h1>
        {(taller.verificadoAfip || taller.validaciones.length > 0) && (
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {taller.verificadoAfip && (
              <Badge variant="success"><ShieldCheck className="w-3 h-3 mr-1" />CUIT verificado</Badge>
            )}
            {taller.validaciones.map((v: { tipoDocumento: { nombre: string } }, i: number) => (
              <Badge key={i} variant="success"><ShieldCheck className="w-3 h-3 mr-1" />{v.tipoDocumento.nombre}</Badge>
            ))}
          </div>
        )}
        {taller.provincia && (
          <p className="flex items-center gap-1 text-gray-600">
            <MapPin className="w-4 h-4" /> {taller.provincia}{taller.partido ? `, ${taller.partido}` : ''}
            {taller.ubicacionDetalle && <span className="text-gray-400"> · {taller.ubicacionDetalle}</span>}
          </p>
        )}
        {taller.descripcion && (
          <p className="text-gray-600 text-sm italic mt-2">&quot;{taller.descripcion}&quot;</p>
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

      {taller.prendas.length > 0 && (
        <Card title="Tipos de prenda" className="mb-4">
          <div className="flex flex-wrap gap-2">
            {taller.prendas.map((tp: { id: string; prenda: { nombre: string } }) => (
              <Badge key={tp.id} variant="outline">{tp.prenda.nombre}</Badge>
            ))}
          </div>
        </Card>
      )}

      {taller.portfolioFotos.length > 0 && (
        <Card title="Trabajos realizados" className="mb-4">
          <GaleriaFotos fotos={taller.portfolioFotos} />
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
        <Card title="Certificaciones" className="mb-4">
          <div className="flex flex-wrap gap-2">
            {taller.certificaciones.map((c: { id: string; nombre: string }) => (
              <Badge key={c.id} variant="success">
                <Award className="w-3 h-3 mr-1" />{c.nombre}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {taller.certificados.length > 0 && (
        <Card title="Capacitaciones certificadas">
          <div className="space-y-2">
            {taller.certificados.map((cert: { id: string; codigo: string; coleccion: { titulo: string; institucion: string | null } }) => (
              <div key={cert.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">{cert.coleccion.titulo}</span>
                  {cert.coleccion.institucion && (
                    <span className="text-gray-500 ml-2">· {cert.coleccion.institucion}</span>
                  )}
                </div>
                <a href={`/verificar?code=${cert.codigo}`}
                  className="text-brand-blue underline text-xs">
                  Verificar
                </a>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
