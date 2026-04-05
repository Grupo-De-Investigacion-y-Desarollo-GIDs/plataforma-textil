import { auth } from '@/compartido/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/compartido/lib/prisma'
import { AuditoriaInformeClient } from './informe-client'

export default async function AuditoriaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const role = (session.user as { role?: string }).role
  if (role !== 'ADMIN' && role !== 'ESTADO') redirect('/unauthorized')

  const { id } = await params
  const auditoria = await prisma.auditoria.findUnique({
    where: { id },
    include: {
      taller: { select: { nombre: true, ubicacion: true, nivel: true, cuit: true } },
      inspector: { select: { name: true, email: true } },
      acciones: true,
    },
  })
  if (!auditoria) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <a href="/admin/auditorias" className="text-brand-blue hover:underline text-sm">
          ← Volver a auditorias
        </a>
      </div>

      <div>
        <h1 className="text-3xl font-bold font-overpass text-brand-blue">
          Auditoria — {auditoria.taller.nombre}
        </h1>
        <p className="text-gray-500 mt-1">
          {auditoria.tipo.replace(/_/g, ' ')} · {auditoria.fecha
            ? new Date(auditoria.fecha).toLocaleDateString('es-AR')
            : 'Sin fecha'}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="font-overpass font-bold text-gray-800 mb-3">Taller auditado</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-gray-500">Nombre:</span> <span className="font-medium">{auditoria.taller.nombre}</span></div>
          <div><span className="text-gray-500">CUIT:</span> <span className="font-medium">{auditoria.taller.cuit}</span></div>
          <div><span className="text-gray-500">Nivel:</span> <span className="font-medium">{auditoria.taller.nivel}</span></div>
          <div><span className="text-gray-500">Ubicacion:</span> <span className="font-medium">{auditoria.taller.ubicacion ?? '—'}</span></div>
        </div>
      </div>

      <AuditoriaInformeClient
        auditoriaId={auditoria.id}
        estadoInicial={auditoria.estado}
        resultadoInicial={auditoria.resultado}
        hallazgosInicial={auditoria.hallazgos}
        acciones={auditoria.acciones.map(a => ({
          id: a.id,
          descripcion: a.descripcion,
          estado: a.estado,
          plazo: a.plazo ? a.plazo.toISOString() : null,
        }))}
      />
    </div>
  )
}
