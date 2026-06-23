export const dynamic = 'force-dynamic'

import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/compartido/componentes/ui/card'
import { Button } from '@/compartido/componentes/ui/button'
import { Lock } from 'lucide-react'
import { labelOrganizacion, labelRegistro, labelEscalabilidad } from '@/compartido/lib/taller-formulario'

// Etapa 2.1 — "Mi gestión productiva": datos privados del taller (solo el taller
// y el acompañamiento los ven; no aparecen en el directorio). Contenido repartido
// desde la vista única anterior de perfil. El filtrado por visibilidad es 2.2.
export default async function TallerGestionPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const taller = await prisma.taller.findFirst({
    where: { userId: session.user.id },
    include: {
      plantilla: { orderBy: { categoria: 'asc' } },
      user: { select: { name: true, email: true, phone: true } },
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

  return (
    <div className="space-y-6">
      {/* Datos del responsable — PII privada, movida desde la cabecera común.
          No visible para las marcas (minimización de datos, OIT IGDS 457). */}
      <Card title="Datos del responsable">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          {taller.user.name && (
            <div>
              <p className="text-gray-500">Responsable</p>
              <p className="font-medium break-words">{taller.user.name}</p>
            </div>
          )}
          <div>
            <p className="text-gray-500">Email</p>
            <p className="font-medium break-words">{taller.user.email}</p>
          </div>
          {taller.user.phone && (
            <div>
              <p className="text-gray-500">Teléfono</p>
              <p className="font-medium break-words">{taller.user.phone}</p>
            </div>
          )}
        </div>
        <p className="flex items-center gap-1 text-xs text-gray-400 mt-4">
          <Lock className="w-3 h-3 shrink-0" />
          Esta información de contacto es privada. Las marcas no la ven en tu vidriera.
        </p>
      </Card>

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
    </div>
  )
}
