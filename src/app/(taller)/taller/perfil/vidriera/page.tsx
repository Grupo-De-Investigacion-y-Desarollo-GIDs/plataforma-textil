export const dynamic = 'force-dynamic'

import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/compartido/componentes/ui/badge'
import { Card } from '@/compartido/componentes/ui/card'
import { Button } from '@/compartido/componentes/ui/button'
import { Award, Download, MapPin, Milestone, ShieldCheck, EyeOff, Users, Ruler, Gauge, Workflow, Calendar } from 'lucide-react'
import { PortfolioManager } from '@/taller/componentes/portfolio-manager'
import { VerVidrieraModal } from '@/taller/componentes/ver-vidriera-modal'
import { VidrieraPublicaContenido } from '@/taller/componentes/vidriera-publica-contenido'
import { BadgeArca } from '@/compartido/componentes/badge-arca'
import { nivelAEtapa } from '@/compartido/lib/formalizacion'
import { labelOrganizacion, labelRegistro, labelEscalabilidad, rangoCapacidad } from '@/compartido/lib/taller-formulario'
import { bloqueVisibleVidriera, type BloqueVidriera } from '@/compartido/lib/visibilidad-vidriera'

const CATEGORIA_LABEL: Record<string, string> = {
  APRENDIZ: 'Aprendices',
  MEDIO_OFICIAL: 'Medio oficial',
  OFICIAL: 'Oficial',
  OFICIAL_CALIFICADO: 'Oficial calificado',
}

// Etapa 2.2-B — "Mi vidriera": lo que ven las marcas, reorganizado en las 3
// DIMENSIONES de V4 2.2 (Credenciales / Formación / Descripción).
// Tercer (último) sub-tab del orden secuencial Datos básicos → gestión → vidriera.
// Los campos públicos (nombre, descripción, año, ubicación) se EDITAN en "Datos
// básicos" y se LEEN acá: misma fila Taller, sin copia ni sync (spec §3).
//
// Render FIEL a lo que ve la marca: cada bloque toggle-libre se evalúa con el mismo
// `bloqueVisiblePublico` que la vidriera pública. Como es la vista del taller (no
// se le ocultan sus propios datos), los bloques que la marca NO ve se marcan con
// "No visible para las marcas" en vez de desaparecer. La UI de toggles y el aviso
// al activar son 2.2-C. Para talleres existentes (modeloB_revisado=true) todo está
// visible → no aparece ningún marcador: igual que hoy.
function MarcadorOculto() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
      <EyeOff className="w-3 h-3" /> No visible para las marcas
    </span>
  )
}

// Título de card con marcador opcional "No visible para las marcas" a la derecha.
function TituloConMarcador({ texto, oculto }: { texto: string; oculto: boolean }) {
  return (
    <span className="flex flex-wrap items-center justify-between gap-2">
      <span>{texto}</span>
      {oculto && <MarcadorOculto />}
    </span>
  )
}

export default async function TallerVidrieraPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const taller = await prisma.taller.findFirst({
    where: { userId: session.user.id },
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

  // Fiel a lo que ve la marca (mismo helper que la vidriera pública).
  const visible = (b: BloqueVidriera) => bloqueVisibleVidriera(taller, b)
  const equipoConDatos = taller.plantilla.filter((p) => p.cantidad > 0)
  const rango = rangoCapacidad(taller.capacidadMensual)

  return (
    <div className="space-y-6">
      {/* "Ver cómo me ve el directorio": MODAL sobre Mi vidriera (no navega a la
          página pública). El contenido es la vidriera pública filtrada; al cerrar,
          el taller queda en su contexto privado. */}
      <div className="flex justify-end">
        <VerVidrieraModal>
          <VidrieraPublicaContenido taller={taller} />
        </VerVidrieraModal>
      </div>

      {/* DIMENSIÓN 1 — Credenciales (forzado-VISIBLE: siempre se muestra a la marca) */}
      <h2 className="font-overpass font-bold text-xs uppercase tracking-wide text-gray-400">Credenciales</h2>
      <Card>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="default"><Milestone className="w-3 h-3 mr-1" />{nivelAEtapa(taller.nivel)}</Badge>
          <BadgeArca verificado={taller.verificadoAfip} />
          {taller.validaciones.map((v, i) => (
            <Badge key={i} variant="success"><ShieldCheck className="w-3 h-3 mr-1" />{v.tipoDocumento.nombre}</Badge>
          ))}
        </div>
        {(taller.provincia || taller.ubicacionDetalle) && (
          <p className="flex items-center gap-1 text-sm text-gray-600 mb-2">
            <MapPin className="w-4 h-4" /> {taller.provincia}{taller.partido ? `, ${taller.partido}` : ''}
            {taller.ubicacionDetalle && <span className="text-gray-400"> · {taller.ubicacionDetalle}</span>}
          </p>
        )}
        {taller.fundado != null && (
          <p className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-2">
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Fundado en {taller.fundado}</span>
            {!visible('anioFundacion') && <MarcadorOculto />}
          </p>
        )}
        {taller.descripcion && (
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{taller.descripcion}</p>
        )}
      </Card>

      {/* DIMENSIÓN 2 — Formación (Academia, toggle-libre master `formacion`) */}
      {taller.certificados.length > 0 && (
        <>
          <h2 className="font-overpass font-bold text-xs uppercase tracking-wide text-gray-400">Formación</h2>
          <Card title={<TituloConMarcador texto="Certificados de cursos" oculto={!visible('formacion')} />}>
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
        </>
      )}

      {/* DIMENSIÓN 3 — Descripción (perfil productivo, toggle-libre por bloque) */}
      <h2 className="font-overpass font-bold text-xs uppercase tracking-wide text-gray-400">Descripción</h2>

      {taller.procesos.length > 0 && (
        <Card title={<TituloConMarcador texto="Procesos Productivos" oculto={!visible('procesos')} />}>
          <div className="flex flex-wrap gap-2">
            {taller.procesos.map((tp) => (
              <Badge key={tp.id} variant="outline">{tp.proceso.nombre}</Badge>
            ))}
          </div>
        </Card>
      )}

      {taller.prendas.length > 0 && (
        <Card title={<TituloConMarcador texto="Tipos de Prenda" oculto={!visible('prendas')} />}>
          <div className="flex flex-wrap gap-2">
            {taller.prendas.map((tp) => (
              <Badge key={tp.id} variant="default">{tp.prenda.nombre}</Badge>
            ))}
          </div>
        </Card>
      )}

      <Card title={<TituloConMarcador texto="Mi portfolio" oculto={taller.portfolioFotos.length > 0 && !visible('portfolio')} />}>
        <PortfolioManager tallerId={taller.id} fotosActuales={taller.portfolioFotos} />
      </Card>

      {taller.maquinaria.length > 0 && (
        <Card title={<TituloConMarcador texto="Maquinaria" oculto={!visible('maquinaria')} />}>
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

      {equipoConDatos.length > 0 && (
        <Card title={<TituloConMarcador texto="Equipo de trabajo" oculto={!visible('equipo')} />}>
          <ul className="space-y-1 text-sm">
            {equipoConDatos.map((p) => (
              <li key={p.categoria} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                  {CATEGORIA_LABEL[p.categoria] ?? p.categoria}
                </span>
                <span className="text-gray-500">{p.cantidad}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {(taller.metrosCuadrados ?? 0) > 0 && (
        <Card title={<TituloConMarcador texto="Espacio físico" oculto={!visible('espacio')} />}>
          <p className="flex items-center gap-1.5 text-sm text-gray-700">
            <Ruler className="w-4 h-4 text-gray-400" /> {taller.metrosCuadrados} m²
          </p>
        </Card>
      )}

      {/* Capacidad: RANGO bucketizado, NUNCA el SAM ni el número exacto (§4.5). */}
      {rango != null && (
        <Card title={<TituloConMarcador texto="Capacidad productiva" oculto={!visible('capacidad')} />}>
          <p className="flex items-center gap-1.5 text-sm text-gray-700">
            <Gauge className="w-4 h-4 text-gray-400" /> {rango}
          </p>
          {taller.escalabilidad && (
            <p className="text-xs text-gray-500 mt-1">
              Puede escalar: {labelEscalabilidad(taller.escalabilidad)}
            </p>
          )}
        </Card>
      )}

      {taller.organizacion && (
        <Card title={<TituloConMarcador texto="Organización del trabajo" oculto={!visible('organizacion')} />}>
          <p className="flex items-center gap-1.5 text-sm text-gray-700">
            <Workflow className="w-4 h-4 text-gray-400" /> {labelOrganizacion(taller.organizacion)}
          </p>
          {taller.registroProduccion && (
            <p className="text-xs text-gray-500 mt-1">
              Registro de producción: {labelRegistro(taller.registroProduccion)}
            </p>
          )}
        </Card>
      )}

      {/* Certificaciones de calidad (externas): fuera del piloto de toggles (D4),
          sin gate, como hasta hoy. */}
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
    </div>
  )
}
