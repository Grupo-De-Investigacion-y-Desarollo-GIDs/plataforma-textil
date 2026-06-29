import { Badge } from '@/compartido/componentes/ui/badge'
import { Card } from '@/compartido/componentes/ui/card'
import { MapPin, Award, ShieldCheck, Milestone, Users, Ruler, Gauge, Workflow, Calendar, FileText } from 'lucide-react'
import { GaleriaFotos } from '@/taller/componentes/galeria-fotos'
import { BadgeArca } from '@/compartido/componentes/badge-arca'
import { bloqueVisibleVidriera, badgeFormacionVisible } from '@/compartido/lib/visibilidad-vidriera'
import { nivelAEtapa } from '@/compartido/lib/formalizacion'
import { labelOrganizacion, labelRegistro, labelEscalabilidad, rangoCapacidad, labelTipoInscripcion } from '@/compartido/lib/taller-formulario'

// Contenido de la vidriera PÚBLICA (lo que ve la marca), en las 4 SECCIONES de V4 2.2
// (Etapa 2.2-C1 2a vuelta), read-only y mostrando SOLO los bloques visibles:
//   S1 Credenciales (forzado-visible): nombre + Etapa + ARCA + validaciones.
//   S2 Datos generales: ubicación (forzado-visible) + tipo de inscripción + año (gated).
//   S3 Descripción: descripción (forzado-visible) → portfolio → procesos → prendas →
//      capacidad (rango, nunca SAM) → equipo → espacio → maquinaria → organización (gated).
//   S4 Formación: Academia (gated, granular por badge).
//
// `bloqueVisibleVidriera` aplica el render condicional: net-new (inscripción, año,
// equipo, espacio, capacidad, organización) son SOLO-OPT-IN; el resto flag-aware (#437).
//
// Compartido por /perfil/[id] (página pública) y el modal "Ver cómo me ve el directorio".
// Invariantes: SAM nunca acá (capacidad = rango). CUIT / responsable / SAM / los 7 son
// forzado-privados: nunca entran a esta consulta.

export interface VidrieraPublicaTaller {
  nombre: string
  nivel: string
  verificadoAfip: boolean
  provincia: string | null
  partido: string | null
  ubicacionDetalle: string | null
  descripcion: string | null
  fundado: number | null
  tipoInscripcionAfip: string | null
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

function SeccionTitulo({ children }: { children: React.ReactNode }) {
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
  // S2
  const tipoInscripcion = labelTipoInscripcion(taller.tipoInscripcionAfip)
  const verInscripcion = tipoInscripcion != null && bloqueVisibleVidriera(taller, 'inscripcion')
  const verAnio = taller.fundado != null && bloqueVisibleVidriera(taller, 'anioFundacion')
  // S3
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
  // S4 — granular por badge
  const certificadosVisibles = taller.certificados.filter((c) => badgeFormacionVisible(taller, c.id))
  const verFormacion = certificadosVisibles.length > 0

  return (
    <div>
      {/* ── S1 CREDENCIALES ── */}
      <div className="mb-2">
        <h1 className="font-overpass font-bold text-3xl text-brand-blue mb-2">{taller.nombre}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default"><Milestone className="w-3 h-3 mr-1" />{nivelAEtapa(taller.nivel)}</Badge>
          {taller.verificadoAfip && <BadgeArca verificado={true} />}
          {taller.validaciones.map((v, i) => (
            <Badge key={i} variant="success"><ShieldCheck className="w-3 h-3 mr-1" />{v.tipoDocumento.nombre}</Badge>
          ))}
        </div>
      </div>

      {/* ── S2 DATOS GENERALES ── */}
      <SeccionTitulo>Datos generales</SeccionTitulo>
      {taller.provincia && (
        <p className="flex items-center gap-1 text-gray-600">
          <MapPin className="w-4 h-4" /> {taller.provincia}{taller.partido ? `, ${taller.partido}` : ''}
          {taller.ubicacionDetalle && <span className="text-gray-400"> · {taller.ubicacionDetalle}</span>}
        </p>
      )}
      {verInscripcion && (
        <p className="flex items-center gap-1 text-gray-600 mt-1">
          <FileText className="w-4 h-4" /> {tipoInscripcion}
        </p>
      )}
      {verAnio && (
        <p className="flex items-center gap-1 text-gray-500 text-sm mt-1">
          <Calendar className="w-4 h-4" /> Fundado en {taller.fundado}
        </p>
      )}

      {/* ── S3 DESCRIPCIÓN ── */}
      <SeccionTitulo>Descripción</SeccionTitulo>
      {taller.descripcion && (
        <p className="text-gray-600 text-sm italic mb-4">&quot;{taller.descripcion}&quot;</p>
      )}

      {verPortfolio && (
        <Card title="Trabajos realizados" className="mb-4">
          <GaleriaFotos fotos={taller.portfolioFotos} />
        </Card>
      )}

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

      {verCapacidad && (
        <Card title="Capacidad productiva" className="mb-4">
          <p className="flex items-center gap-1.5 text-sm text-gray-700">
            <Gauge className="w-4 h-4 text-gray-400" /> {rango}
          </p>
          {taller.escalabilidad && (
            <p className="text-xs text-gray-500 mt-1">Puede escalar: {labelEscalabilidad(taller.escalabilidad)}</p>
          )}
        </Card>
      )}

      {verEquipo && (
        <Card title="Equipo de trabajo" className="mb-4">
          <ul className="space-y-1 text-sm">
            {equipoConDatos.map((p) => (
              <li key={p.categoria} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-gray-400" />{CATEGORIA_LABEL[p.categoria] ?? p.categoria}</span>
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

      {verOrganizacion && (
        <Card title="Organización del trabajo" className="mb-4">
          <p className="flex items-center gap-1.5 text-sm text-gray-700">
            <Workflow className="w-4 h-4 text-gray-400" /> {labelOrganizacion(taller.organizacion)}
          </p>
          {taller.registroProduccion && (
            <p className="text-xs text-gray-500 mt-1">Registro de producción: {labelRegistro(taller.registroProduccion)}</p>
          )}
        </Card>
      )}

      {/* Certificaciones de calidad (externas): fuera del piloto de toggles (D4),
          sin gate como hasta hoy. */}
      {taller.certificaciones.length > 0 && (
        <Card title="Certificaciones" className="mb-4">
          <div className="flex flex-wrap gap-2">
            {taller.certificaciones.map((c) => (
              <Badge key={c.id} variant="success"><Award className="w-3 h-3 mr-1" />{c.nombre}</Badge>
            ))}
          </div>
        </Card>
      )}

      {/* ── S4 FORMACIÓN ── */}
      {verFormacion && (
        <>
          <SeccionTitulo>Formación</SeccionTitulo>
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
                  <a href={`/verificar?code=${cert.codigo}`} className="text-brand-blue underline text-xs">
                    Verificar
                  </a>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
