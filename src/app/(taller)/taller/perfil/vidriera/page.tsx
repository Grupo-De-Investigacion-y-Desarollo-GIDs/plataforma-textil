export const dynamic = 'force-dynamic'

import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/compartido/componentes/ui/badge'
import { Card } from '@/compartido/componentes/ui/card'
import { Button } from '@/compartido/componentes/ui/button'
import { Award, Download } from 'lucide-react'
import { PortfolioManager } from '@/taller/componentes/portfolio-manager'
import { VerVidrieraModal } from '@/taller/componentes/ver-vidriera-modal'
import { VidrieraPublicaContenido } from '@/taller/componentes/vidriera-publica-contenido'

// Etapa 2.2-A — "Mi vidriera": lo que ven las marcas en el directorio.
// Tercer (último) sub-tab del orden secuencial Datos básicos → gestión → vidriera.
// La cabecera común (nombre + etapa + ARCA) y las sub-tabs viven en el layout.
// Los campos públicos (nombre, descripción, año, ubicación) se EDITAN en "Datos
// básicos" y se LEEN acá: misma fila Taller, sin copia ni sync (spec §3). El
// filtrado por visibilidad (toggles + privacy-by-default) es 2.2-B/C.
export default async function TallerVidrieraPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const taller = await prisma.taller.findFirst({
    where: { userId: session.user.id },
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
      {/* "Ver cómo me ve el directorio": MODAL sobre Mi vidriera (no navega a la
          página pública). El contenido es la vidriera pública filtrada por #437;
          al cerrar, el taller queda en su contexto privado. */}
      <div className="flex justify-end">
        <VerVidrieraModal>
          <VidrieraPublicaContenido taller={taller} />
        </VerVidrieraModal>
      </div>

      {/* NOTA (2.2): "Trabajadores" y "Cap. mensual" salieron del grid destacado de
          marketplace (junto con Rating / On-time / barra de completitud, descartados del
          modelo V4). Su ubicación final es el bloque "Mi capacidad de producción"
          (toggleable) que arma la Etapa 2.2 — no se renderizan acá por ahora. */}

      {taller.descripcion && (
        <Card title="Descripción">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{taller.descripcion}</p>
        </Card>
      )}

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
        <Card title="Certificados de cursos">
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
