export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { prisma } from '@/compartido/lib/prisma'
import { VidrieraPublicaContenido } from '@/taller/componentes/vidriera-publica-contenido'

export default async function PerfilPublicoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const taller = await prisma.taller.findUnique({
    where: { id },
    include: {
      procesos: { include: { proceso: true } },
      prendas: { include: { prenda: true } },
      maquinaria: true,
      plantilla: true,
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

      <VidrieraPublicaContenido taller={taller} />
    </div>
  )
}
