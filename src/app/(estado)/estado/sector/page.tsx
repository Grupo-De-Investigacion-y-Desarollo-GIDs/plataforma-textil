export const dynamic = 'force-dynamic'

import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { redirect } from 'next/navigation'
import { Card } from '@/compartido/componentes/ui/card'

const orgLabels: Record<string, string> = {
  linea: 'En línea',
  modular: 'Modular',
  completa: 'Prenda completa',
}

const catLabels: Record<string, string> = {
  APRENDIZ: 'Aprendices',
  MEDIO_OFICIAL: 'Medio oficial',
  OFICIAL: 'Oficial',
  OFICIAL_CALIFICADO: 'Oficial calificado',
}

const regLabels: Record<string, string> = {
  software: 'Software',
  excel: 'Excel/planilla',
  papel: 'Papel',
  ninguno: 'Sin registro',
}

const escLabels: Record<string, string> = {
  turno: 'Segundo turno',
  tercerizar: 'Tercerización',
  contratar: 'Contratando personal',
  'horas-extra': 'Horas extra',
  no: 'Sin capacidad',
}

function BarChart({ items, total, unit = 'talleres' }: { items: { label: string; count: number }[]; total: number; unit?: string }) {
  return (
    <div className="space-y-3">
      {items.map(({ label, count }) => (
        <div key={label}>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-gray-700">{label}</span>
            <span className="text-gray-500">{count} {unit}</span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-blue rounded-full transition-all"
              style={{ width: `${total ? (count / total) * 100 : 0}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function DiagnosticoSectorPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const role = (session.user as { role?: string }).role
  if (role !== 'ESTADO') redirect('/unauthorized')

  const [
    distribucionOrganizacion,
    distribucionPlantilla,
    distribucionRegistro,
    distribucionEscalabilidad,
    capacidadTotalSector,
    distribucionZona,
    procesosComunes,
    prendasComunes,
  ] = await Promise.all([
    prisma.taller.groupBy({
      by: ['organizacion'],
      _count: { _all: true },
      where: { organizacion: { not: null } },
      orderBy: { organizacion: 'asc' },
    }),
    prisma.tallerPlantilla.groupBy({
      by: ['categoria'],
      _sum: { cantidad: true },
    }),
    prisma.taller.groupBy({
      by: ['registroProduccion'],
      _count: { _all: true },
      where: { registroProduccion: { not: null } },
      orderBy: { registroProduccion: 'asc' },
    }),
    prisma.taller.groupBy({
      by: ['escalabilidad'],
      _count: { _all: true },
      where: { escalabilidad: { not: null } },
      orderBy: { escalabilidad: 'asc' },
    }),
    prisma.taller.aggregate({
      _sum: { capacidadMensual: true },
      _avg: { capacidadMensual: true },
      where: { capacidadMensual: { gt: 0 } },
    }),
    prisma.taller.groupBy({
      by: ['provincia'],
      _count: true,
      where: { provincia: { not: null } },
      orderBy: { provincia: 'asc' },
    }),
    prisma.tallerProceso.groupBy({
      by: ['procesoId'],
      _count: { _all: true },
      orderBy: { _count: { procesoId: 'desc' } },
      take: 5,
    }),
    prisma.tallerPrenda.groupBy({
      by: ['prendaId'],
      _count: { _all: true },
      orderBy: { _count: { prendaId: 'desc' } },
      take: 5,
    }),
  ])

  const topProcesoIds = procesosComunes.map(p => p.procesoId)
  const topPrendaIds = prendasComunes.map(p => p.prendaId)

  const [nombresProcesos, nombresPrendas] = await Promise.all([
    prisma.procesoProductivo.findMany({
      where: { id: { in: topProcesoIds } },
      select: { id: true, nombre: true },
    }),
    prisma.tipoPrenda.findMany({
      where: { id: { in: topPrendaIds } },
      select: { id: true, nombre: true },
    }),
  ])

  const topProcesosConNombre = procesosComunes.map(p => ({
    nombre: nombresProcesos.find(n => n.id === p.procesoId)?.nombre ?? p.procesoId,
    count: p._count._all,
  }))

  const topPrendasConNombre = prendasComunes.map(p => ({
    nombre: nombresPrendas.find(n => n.id === p.prendaId)?.nombre ?? p.prendaId,
    count: p._count._all,
  }))

  const totalTalleres = await prisma.taller.count()
  const totalConWizard = distribucionOrganizacion.reduce((sum, d) => sum + d._count._all, 0)
  const totalTrabajadoresPlantilla = distribucionPlantilla.reduce((sum, d) => sum + (d._sum.cantidad ?? 0), 0)
  const talleresConPlantilla = await prisma.tallerPlantilla.groupBy({ by: ['tallerId'] }).then(r => r.length)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-overpass text-brand-blue">Datos sectoriales</h1>
        <p className="text-gray-500 mt-1">Datos productivos agregados de los talleres registrados</p>
        <p className="text-xs text-gray-400 mt-1">
          Basado en el perfil productivo completado por cada taller.
          No refleja la situación de formalización.
          {totalTalleres < 10 && <> · Datos del piloto — {totalTalleres} talleres.</>}
        </p>
      </div>

      {/* Capacidad instalada */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <p className="text-2xl font-bold text-brand-blue">
            {capacidadTotalSector._sum.capacidadMensual?.toLocaleString('es-AR') ?? 0}
          </p>
          <p className="text-sm text-gray-500">Unidades/mes — capacidad total instalada</p>
        </Card>
        <Card>
          <p className="text-2xl font-bold text-brand-blue">
            {Math.round(capacidadTotalSector._avg.capacidadMensual ?? 0).toLocaleString('es-AR')}
          </p>
          <p className="text-sm text-gray-500">Unidades/mes — promedio por taller</p>
        </Card>
      </div>

      {/* Organización productiva */}
      <Card title="Organización productiva">
        <BarChart
          items={distribucionOrganizacion.map(d => ({
            label: orgLabels[d.organizacion ?? ''] ?? d.organizacion ?? 'Desconocido',
            count: d._count._all,
          }))}
          total={totalConWizard}
        />
      </Card>

      {/* Gestión y registro */}
      <Card title="Gestión y registro">
        <BarChart
          items={distribucionRegistro.map(d => ({
            label: regLabels[d.registroProduccion ?? ''] ?? d.registroProduccion ?? 'Desconocido',
            count: d._count._all,
          }))}
          total={totalConWizard}
        />
      </Card>

      {/* Escalabilidad */}
      <Card title="Capacidad de escalar">
        <BarChart
          items={distribucionEscalabilidad.map(d => ({
            label: escLabels[d.escalabilidad ?? ''] ?? d.escalabilidad ?? 'Desconocido',
            count: d._count._all,
          }))}
          total={totalConWizard}
        />
      </Card>

      {/* Distribución de plantilla por categoría */}
      <Card title="Distribución de la plantilla del sector">
        {totalTrabajadoresPlantilla > 0 ? (
          <>
            <BarChart
              items={distribucionPlantilla.map(d => ({
                label: catLabels[d.categoria] ?? d.categoria,
                count: d._sum.cantidad ?? 0,
              }))}
              total={totalTrabajadoresPlantilla}
              unit="personas"
            />
            <p className="text-xs text-gray-400 mt-3">
              {totalTrabajadoresPlantilla} trabajadores en {talleresConPlantilla} talleres con plantilla declarada.
              {talleresConPlantilla < totalTalleres && ` ${talleresConPlantilla} de ${totalTalleres} talleres completaron el desglose.`}
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-400 italic">Ningún taller completó el desglose de plantilla aún.</p>
        )}
      </Card>

      {/* Procesos más comunes */}
      <Card title="Top 5 procesos productivos">
        <ul className="space-y-1 text-sm">
          {topProcesosConNombre.map(p => (
            <li key={p.nombre} className="flex justify-between">
              <span>{p.nombre}</span>
              <span className="text-gray-500">{p.count} talleres</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Prendas más comunes */}
      <Card title="Top 5 tipos de prenda">
        <ul className="space-y-1 text-sm">
          {topPrendasConNombre.map(p => (
            <li key={p.nombre} className="flex justify-between">
              <span>{p.nombre}</span>
              <span className="text-gray-500">{p.count} talleres</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Distribución por provincia */}
      <Card title="Distribución por provincia">
        <ul className="space-y-1 text-sm">
          {distribucionZona.map(z => (
            <li key={z.provincia ?? 'sin-provincia'} className="flex justify-between">
              <span>{z.provincia ?? 'Sin provincia'}</span>
              <span className="text-gray-500">{z._count} talleres</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
