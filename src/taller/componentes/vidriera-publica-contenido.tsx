import { Badge } from '@/compartido/componentes/ui/badge'
import { Card } from '@/compartido/componentes/ui/card'
import { MapPin, Award, ShieldCheck, Milestone, Users, Ruler, Gauge, Workflow, Calendar } from 'lucide-react'
import { GaleriaFotos } from '@/taller/componentes/galeria-fotos'
import { BadgeArca } from '@/compartido/componentes/badge-arca'
import { bloqueVisibleVidriera, badgeFormacionVisible } from '@/compartido/lib/visibilidad-vidriera'
import { nivelAEtapa } from '@/compartido/lib/formalizacion'
import { labelOrganizacion, labelRegistro, labelEscalabilidad, rangoCapacidad } from '@/compartido/lib/taller-formulario'

// Contenido de la vidriera PÚBLICA (lo que ve la marca), reorganizado en las 3
// DIMENSIONES de V4 2.2 (Etapa 2.2-B/C1):
//   - Credenciales  → forzado-VISIBLE: etapa + ARCA + validaciones + ubicación + descripción.
//                      (Año de fundación es toggle-libre `anioFundacion`, se gatea acá.)
//   - Formación     → toggle-libre (master `formacion`): badges de Academia, granular por badge.
//   - Descripción   → perfil productivo (toggle-libre): procesos, prendas, portfolio,
//                      maquinaria, equipo, espacio, capacidad (RANGO, nunca SAM), organización.
//
// Render condicional (§5.2): `bloqueVisiblePublico` aplica privacy-by-default según
// `modeloB_revisado`. Existentes (flag=true) ven lo mismo que hoy (#437 null=visible);
// nuevos (flag=false) solo ven Credenciales + lo activado explícito.
//
// Server component compartido por dos superficies:
//   - /perfil/[id] (la página pública real)
//   - el modal "Ver cómo me ve el directorio" en "Mi vidriera" (preview sin navegar)
//
// Invariantes: SAM nunca se expone acá (no es un bloque; capacidad muestra RANGO).
// CUIT / responsable / los 7 del recorrido son forzado-privados: nunca entran a esta consulta.

export interface VidrieraPublicaTaller {
  nombre: string
  nivel: string
  verificadoAfip: boolean
  provincia: string | null
  partido: string | null
  ubicacionDetalle: string | null
  descripcion: string | null
  fundado: number | null
  portfolioFotos: string[]
  metrosCuadrados: number | null
  capacidadMensual: number
  escalabilidad: string | null
  organizacion: string | null
  registroProduccion: string | null
  visibilidadVidriera: unknown
  modeloB_revisado: boolean
  validaciones: { tipoDocumento: { nombre: string } }[]
  procesos: { id: string; proceso: { nombre: string } }[]
  prendas: { id: string; prenda: { nombre: string } }[]
  maquinaria: { id: string; nombre: string; cantidad: number }[]
  plantilla: { categoria: string; cantidad: number }[]
  certificaciones: { id: string; nombre: string }[]
  certificados: { id: string; codigo: string; coleccion: { titulo: string; institucion: string | null } }[]
}

function DimensionTitulo({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-overpass font-bold text-xs uppercase tracking-wide text-gray-400 mt-6 mb-2">
      {children}
    </h2>
  )
}

const CATEGORIA_LABEL: Record<string, string> = {
  APRENDIZ: 'Aprendices',
  MEDIO_OFICIAL: 'Medio oficial',
  OFICIAL: 'Oficial',
  OFICIAL_CALIFICADO: 'Oficial calificado',
}

export function VidrieraPublicaContenido({ taller }: { taller: VidrieraPublicaTaller }) {
  const verAnio = taller.fundado != null && bloqueVisibleVidriera(taller, 'anioFundacion')
  const verProcesos = taller.procesos.length > 0 && bloqueVisibleVidriera(taller, 'procesos')
  const verPrendas = taller.prendas.length > 0 && bloqueVisibleVidriera(taller, 'prendas')
  const verMaquinaria = taller.maquinaria.length > 0 && bloqueVisibleVidriera(taller, 'maquinaria')
  const verPortfolio = taller.portfolioFotos.length > 0 && bloqueVisibleVidriera(taller, 'portfolio')
  const equipoConDatos = taller.plantilla.filter((p) => p.cantidad > 0)
  const verEquipo = equipoConDatos.length > 0 && bloqueVisibleVidriera(taller, 'equipo')
  const verEspacio = (taller.metrosCuadrados ?? 0) > 0 && bloqueVisibleVidriera(taller, 'espacio')
  const rango = rangoCapacidad(taller.capacidadMensual)
  const verCapacidad = rango != null && bloqueVisibleVidriera(taller, 'capacidad')
  const verOrganizacion = !!taller.organizacion && bloqueVisibleVidriera(taller, 'organizacion')
  // Formación granular: master + cada badge filtrado por `badgeFormacionVisible`.
  const certificadosVisibles = taller.certificados.filter((c) => badgeFormacionVisible(taller, c.id))
  const verFormacion = certificadosVisibles.length > 0

  const hayDescripcion =
    verProcesos || verPrendas || verMaquinaria || verPortfolio || verEquipo ||
    verEspacio || verCapacidad || verOrganizacion || taller.certificaciones.length > 0

  return (
    <div>
      {/* DIMENSIÓN 1 — Credenciales (forzado-VISIBLE, nunca se oculta) */}
      <div className="mb-2">
        <h1 className="font-overpass font-bold text-3xl text-brand-blue mb-2">{taller.nombre}</h1>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge variant="default"><Milestone className="w-3 h-3 mr-1" />{nivelAEtapa(taller.nivel)}</Badge>
          {taller.verificadoAfip && <BadgeArca verificado={true} />}
          {taller.validaciones.map((v, i) => (
            <Badge key={i} variant="success"><ShieldCheck className="w-3 h-3 mr-1" />{v.tipoDocumento.nombre}</Badge>
          ))}
        </div>
        {taller.provincia && (
          <p className="flex items-center gap-1 text-gray-600">
            <MapPin className="w-4 h-4" /> {taller.provincia}{taller.partido ? `, ${taller.partido}` : ''}
            {taller.ubicacionDetalle && <span className="text-gray-400"> · {taller.ubicacionDetalle}</span>}
          </p>
        )}
        {verAnio && (
          <p className="flex items-center gap-1 text-gray-500 text-sm mt-1">
            <Calendar className="w-4 h-4" /> Fundado en {taller.fundado}
          </p>
        )}
        {taller.descripcion && (
          <p className="text-gray-600 text-sm italic mt-2">&quot;{taller.descripcion}&quot;</p>
        )}
      </div>

      {/* DIMENSIÓN 2 — Formación (toggle-libre: master `formacion`, granular por badge) */}
      {verFormacion && (
        <>
          <DimensionTitulo>Formación</DimensionTitulo>
          <Card title="Capacitaciones certificadas" className="mb-4">
            <div className="space-y-2">
              {certificadosVisibles.map((cert) => (
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
        </>
      )}

      {/* DIMENSIÓN 3 — Descripción (perfil productivo, toggle-libre por bloque) */}
      {hayDescripcion && <DimensionTitulo>Descripción</DimensionTitulo>}

      {verProcesos && (
        <Card title="Procesos" className="mb-4">
          <div className="flex flex-wrap gap-2">
            {taller.procesos.map((tp) => (
              <Badge key={tp.id} variant="outline">{tp.proceso.nombre}</Badge>
            ))}
          </div>
        </Card>
      )}

      {verPrendas && (
        <Card title="Tipos de prenda" className="mb-4">
          <div className="flex flex-wrap gap-2">
            {taller.prendas.map((tp) => (
              <Badge key={tp.id} variant="outline">{tp.prenda.nombre}</Badge>
            ))}
          </div>
        </Card>
      )}

      {verPortfolio && (
        <Card title="Trabajos realizados" className="mb-4">
          <GaleriaFotos fotos={taller.portfolioFotos} />
        </Card>
      )}

      {verMaquinaria && (
        <Card title="Maquinaria" className="mb-4">
          <ul className="space-y-1 text-sm">
            {taller.maquinaria.map((m) => (
              <li key={m.id} className="flex justify-between">
                <span>{m.nombre}</span>
                <span className="text-gray-500">x{m.cantidad}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {verEquipo && (
        <Card title="Equipo de trabajo" className="mb-4">
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

      {verEspacio && (
        <Card title="Espacio físico" className="mb-4">
          <p className="flex items-center gap-1.5 text-sm text-gray-700">
            <Ruler className="w-4 h-4 text-gray-400" /> {taller.metrosCuadrados} m²
          </p>
        </Card>
      )}

      {/* Capacidad: RANGO bucketizado, NUNCA el SAM ni el número exacto (§4.5). */}
      {verCapacidad && (
        <Card title="Capacidad productiva" className="mb-4">
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

      {verOrganizacion && (
        <Card title="Organización del trabajo" className="mb-4">
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
          se mantienen sin gate como hasta hoy. */}
      {taller.certificaciones.length > 0 && (
        <Card title="Certificaciones" className="mb-4">
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
