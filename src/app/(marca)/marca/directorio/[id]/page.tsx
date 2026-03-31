export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Star, MapPin, Users, TrendingUp, Clock, Award, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const nivelColor: Record<string, 'warning' | 'default' | 'success'> = { BRONCE: 'warning', PLATA: 'default', ORO: 'success' }

export default async function TallerPerfilMarcaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const taller = await prisma.taller.findUnique({
    where: { id },
    include: {
      procesos: { include: { proceso: true } },
      prendas: { include: { prenda: true } },
      maquinaria: true,
      certificaciones: { where: { activa: true } },
      certificados: { include: { coleccion: true } },
    },
  })

  if (!taller) notFound()

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <Link href="/marca/directorio" className="inline-flex items-center gap-1 text-sm text-brand-blue hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Volver al directorio
      </Link>

      <Card className="mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-blue/10 flex items-center justify-center shrink-0">
            <span className="font-overpass font-bold text-brand-blue text-xl">{taller.nombre.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-overpass font-bold text-2xl text-brand-blue">{taller.nombre}</h1>
              <Badge variant={nivelColor[taller.nivel]}>{taller.nivel}</Badge>
            </div>
            {taller.ubicacion && <p className="flex items-center gap-1 text-gray-600 text-sm"><MapPin className="w-4 h-4" /> {taller.ubicacion}</p>}
            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
              <Star className="w-4 h-4 text-yellow-500" /> {taller.rating.toFixed(1)} ({taller.pedidosCompletados} valoraciones)
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" icon={<MessageCircle className="w-4 h-4" />}>Contactar por WhatsApp</Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="text-center p-3"><Star className="w-5 h-5 text-yellow-500 mx-auto mb-1" /><p className="font-bold text-lg">{taller.rating.toFixed(1)}</p><p className="text-xs text-gray-500">Rating</p></Card>
        <Card className="text-center p-3"><Users className="w-5 h-5 text-brand-blue mx-auto mb-1" /><p className="font-bold text-lg">{taller.trabajadoresRegistrados}</p><p className="text-xs text-gray-500">Trabajadores</p></Card>
        <Card className="text-center p-3"><TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-1" /><p className="font-bold text-lg">{taller.capacidadMensual.toLocaleString()}</p><p className="text-xs text-gray-500">Cap/mes</p></Card>
        <Card className="text-center p-3"><Clock className="w-5 h-5 text-blue-500 mx-auto mb-1" /><p className="font-bold text-lg">{taller.ontimeRate}%</p><p className="text-xs text-gray-500">On-time</p></Card>
      </div>

      {taller.procesos.length > 0 && (
        <Card title="Procesos que realiza" className="mb-4">
          <div className="flex flex-wrap gap-2">
            {taller.procesos.map((tp: { id: string; proceso: { nombre: string } }) => <Badge key={tp.id} variant="outline">{tp.proceso.nombre}</Badge>)}
          </div>
        </Card>
      )}

      {taller.prendas.length > 0 && (
        <Card title="Tipos de prenda" className="mb-4">
          <div className="flex flex-wrap gap-2">
            {taller.prendas.map((tp: { id: string; prenda: { nombre: string } }) => <Badge key={tp.id} variant="outline">{tp.prenda.nombre}</Badge>)}
          </div>
        </Card>
      )}

      {taller.certificados.length > 0 && (
        <Card title="Certificaciones" className="mb-4">
          <div className="space-y-2">
            {taller.certificados.map((c: { id: string; coleccion: { titulo: string }; fecha: Date; codigo: string }) => (
              <div key={c.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold">{c.coleccion.titulo}</span>
                </div>
                <Link href={`/verificar?code=${c.codigo}`} className="text-xs text-brand-blue hover:underline">Verificar QR</Link>
              </div>
            ))}
          </div>
        </Card>
      )}

      {taller.descripcion && (
        <Card title="Sobre nosotros">
          <p className="text-sm text-gray-600 italic">&quot;{taller.descripcion}&quot;</p>
        </Card>
      )}
    </div>
  )
}
