export const dynamic = 'force-dynamic'

import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/compartido/componentes/ui/card'
import { Button } from '@/compartido/componentes/ui/button'
import { Lock, Eye } from 'lucide-react'

// Etapa 2.2-A — "Datos básicos": primer sub-tab (ruta índice). Lo obligatorio
// que el taller carga UNA vez: identidad pública del taller (descripción, año,
// ubicación) que SINCRONIZA a la vidriera por lectura del mismo registro Taller
// (spec §3 — sin copia ni trigger), + datos del responsable (privados, sólo el
// taller y la Coordinación). La edición es vía el form existente
// `/taller/perfil/editar` (botón "Editar datos básicos" en la cabecera del layout).
export default async function TallerDatosBasicosPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const taller = await prisma.taller.findFirst({
    where: { userId: session.user.id },
    select: {
      descripcion: true,
      fundado: true,
      provincia: true,
      partido: true,
      ubicacionDetalle: true,
      cuit: true,
      pedidosCompletados: true,
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

  const ubicacion = [taller.provincia, taller.partido, taller.ubicacionDetalle]
    .filter(Boolean)
    .join(', ')

  return (
    <div className="space-y-6">
      {/* Información del taller — campos públicos. Estos se LEEN en la vidriera
          (misma fila Taller): editarlos acá los actualiza también allá, sin copia. */}
      <Card title="Información del taller">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="sm:col-span-2">
            <p className="text-gray-500">Descripción</p>
            {taller.descripcion ? (
              <p className="font-medium whitespace-pre-wrap break-words">{taller.descripcion}</p>
            ) : (
              <p className="text-gray-400 italic">Sin descripción todavía</p>
            )}
          </div>
          <div>
            <p className="text-gray-500">Año de fundación</p>
            <p className="font-medium">{taller.fundado ?? <span className="text-gray-400 italic">Sin completar</span>}</p>
          </div>
          <div>
            <p className="text-gray-500">Ubicación</p>
            <p className="font-medium break-words">{ubicacion || <span className="text-gray-400 italic">Sin completar</span>}</p>
          </div>
        </div>
        <p className="flex items-center gap-1 text-xs text-gray-400 mt-4">
          <Eye className="w-3 h-3 shrink-0" />
          Esta información aparece en tu vidriera pública. Editala desde &ldquo;Editar datos básicos&rdquo;.
        </p>
      </Card>

      {/* Datos del responsable — PII privada, movida desde "Mi gestión productiva"
          (2.2-A). No visible para las marcas (minimización de datos, OIT IGDS 457). */}
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

      {/* Datos de registro — identidad fiscal/operativa. CUIT es privado. */}
      <Card title="Datos de registro">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">CUIT</p>
            <p className="font-medium">{taller.cuit}</p>
          </div>
          <div>
            <p className="text-gray-500">Pedidos completados</p>
            <p className="font-medium">{taller.pedidosCompletados}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
