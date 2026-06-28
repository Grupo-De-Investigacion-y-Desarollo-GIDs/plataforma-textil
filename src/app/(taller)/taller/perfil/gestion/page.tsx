export const dynamic = 'force-dynamic'

import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/compartido/componentes/ui/card'
import { Button } from '@/compartido/componentes/ui/button'
import { labelOrganizacion, labelRegistro, labelEscalabilidad } from '@/compartido/lib/taller-formulario'
import { ConfiguracionVisibilidad } from '@/taller/componentes/configuracion-visibilidad'
import type { BloqueVidriera } from '@/compartido/lib/visibilidad-vidriera'

// Etapa 2.2-A — "Mi gestión productiva": segundo sub-tab (Datos básicos →
// gestión → vidriera). Tiene el Perfil productivo (organización, espacio, equipo,
// registro, escalabilidad, SAM) + el panel "Configuración de visibilidad" (2.2-C1).
// Las cards "Datos del responsable" e "Información General" se movieron a "Datos
// básicos" (dedup, §4).
export default async function TallerGestionPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const taller = await prisma.taller.findFirst({
    where: { userId: session.user.id },
    include: {
      plantilla: { orderBy: { categoria: 'asc' } },
      procesos: { select: { id: true } },
      prendas: { select: { id: true } },
      maquinaria: { select: { id: true } },
      certificados: {
        where: { revocado: false },
        select: { id: true, coleccion: { select: { titulo: true } } },
        orderBy: { fecha: 'desc' },
      },
    },
  })

  if (!taller) {
    return (
      <Card className="text-center py-12">
        <p className="text-gray-600 mb-4">Todavía no completaste tu perfil.</p>
        <Link href="/taller/perfil/completar">
          <Button>Completar Perfil</Button>
        </Link>
      </Card>
    )
  }

  // Bloques toggle-libre (sin `formacion`, que es master granular aparte) + si tienen
  // datos cargados, para el panel de visibilidad (§4.3).
  const bloquesVisibilidad: { key: BloqueVidriera; label: string; tieneDatos: boolean }[] = [
    { key: 'procesos', label: 'Procesos productivos', tieneDatos: taller.procesos.length > 0 },
    { key: 'prendas', label: 'Tipos de prenda / rubros', tieneDatos: taller.prendas.length > 0 },
    { key: 'maquinaria', label: 'Maquinaria', tieneDatos: taller.maquinaria.length > 0 },
    { key: 'portfolio', label: 'Portfolio (trabajos realizados)', tieneDatos: taller.portfolioFotos.length > 0 },
    { key: 'equipo', label: 'Mi equipo de trabajo', tieneDatos: taller.plantilla.some((p) => p.cantidad > 0) },
    { key: 'espacio', label: 'Mi espacio físico', tieneDatos: (taller.metrosCuadrados ?? 0) > 0 },
    { key: 'capacidad', label: 'Capacidad productiva (rango)', tieneDatos: (taller.capacidadMensual ?? 0) > 0 },
    { key: 'organizacion', label: 'Organización del trabajo', tieneDatos: !!taller.organizacion },
    { key: 'anioFundacion', label: 'Año de fundación', tieneDatos: !!taller.fundado },
  ]
  const certificadosVisibilidad = taller.certificados.map((c) => ({
    id: c.id,
    titulo: c.coleccion.titulo,
  }))

  return (
    <div className="space-y-6">
      {/* "Datos del responsable" e "Información General" se movieron a "Datos
          básicos" (2.2-A, dedup §4). Esta vista queda con el Perfil productivo. */}
      {taller.organizacion && (
        <Card title="Perfil productivo">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500 text-xs mb-1">Organización</p>
              <p className="font-medium text-gray-800">
                {labelOrganizacion(taller.organizacion)}
              </p>
            </div>

            {(taller.metrosCuadrados ?? 0) > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-1">Espacio</p>
                <p className="font-medium text-gray-800">{taller.metrosCuadrados} m²</p>
              </div>
            )}

            {taller.plantilla.length > 0 && taller.plantilla.some(p => p.cantidad > 0) ? (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-1">Composición del equipo</p>
                <div className="space-y-1">
                  {taller.plantilla.filter(p => p.cantidad > 0).map(p => (
                    <p key={p.categoria} className="font-medium text-gray-800 text-sm">
                      {p.categoria === 'APRENDIZ' ? 'Aprendices'
                       : p.categoria === 'MEDIO_OFICIAL' ? 'Medio oficial'
                       : p.categoria === 'OFICIAL' ? 'Oficial'
                       : 'Oficial calificado'}: {p.cantidad}
                    </p>
                  ))}
                  <p className="text-xs text-gray-500 mt-1">
                    Total: {taller.plantilla.reduce((sum, p) => sum + p.cantidad, 0)} personas
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-1">Composición del equipo</p>
                <p className="text-sm text-gray-400 italic">Pendiente de completar</p>
              </div>
            )}

            {taller.registroProduccion && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-1">Registro de producción</p>
                <p className="font-medium text-gray-800">
                  {labelRegistro(taller.registroProduccion)}
                </p>
              </div>
            )}

            {taller.escalabilidad && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-1">Puede escalar</p>
                <p className="font-medium text-gray-800">
                  {labelEscalabilidad(taller.escalabilidad)}
                </p>
              </div>
            )}

            {(taller.sam ?? 0) > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-1">Tiempo estándar ({taller.prendaPrincipal})</p>
                <p className="font-medium text-gray-800">{taller.sam} min</p>
              </div>
            )}

          </div>

          <p className="text-xs text-gray-400 mt-4">
            Esta información es visible para el equipo de la plataforma y la Coordinación.
            No afecta tu recorrido de formalización.
          </p>

          <div className="mt-4">
            <Link href="/taller/perfil/completar">
              <Button variant="secondary" size="sm">Actualizar perfil productivo</Button>
            </Link>
          </div>
        </Card>
      )}

      {!taller.organizacion && (
        <Card className="text-center py-10">
          <p className="text-gray-600 mb-4">
            Todavía no cargaste tu perfil productivo (organización, equipo, capacidad).
          </p>
          <Link href="/taller/perfil/completar">
            <Button>Completar perfil productivo</Button>
          </Link>
        </Card>
      )}

      {/* Etapa 2.2-C1 (§7, Opción A): panel de toggles de visibilidad de la vidriera. */}
      <ConfiguracionVisibilidad
        visibilidadInicial={taller.visibilidadVidriera}
        modeloBRevisado={taller.modeloB_revisado}
        bloques={bloquesVisibilidad}
        certificados={certificadosVisibilidad}
        tieneFormacion={taller.certificados.length > 0}
      />
    </div>
  )
}
