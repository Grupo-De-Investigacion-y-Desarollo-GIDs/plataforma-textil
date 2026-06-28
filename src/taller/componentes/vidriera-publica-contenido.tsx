import { Badge } from '@/compartido/componentes/ui/badge'
import { Card } from '@/compartido/componentes/ui/card'
import { MapPin, Award, ShieldCheck, Milestone } from 'lucide-react'
import { GaleriaFotos } from '@/taller/componentes/galeria-fotos'
import { BadgeArca } from '@/compartido/componentes/badge-arca'
import { bloqueVisiblePublico } from '@/compartido/lib/visibilidad-vidriera'
import { nivelAEtapa } from '@/compartido/lib/formalizacion'

// Contenido de la vidriera PÚBLICA (lo que ve la marca), reorganizado en las 3
// DIMENSIONES de V4 2.2 (Etapa 2.2-B):
//   - Credenciales  → forzado-VISIBLE: etapa + ARCA + validaciones + ubicación + descripción.
//   - Formación     → toggle-libre (master `formacion`): badges de Academia (cursos PDT).
//   - Descripción   → bloques del perfil productivo (toggle-libre): procesos, prendas,
//                      maquinaria, portfolio. Cada uno gateado por `bloqueVisiblePublico`.
//
// Render condicional (§5.2): `bloqueVisiblePublico` aplica privacy-by-default según
// `modeloB_revisado`. Existentes (flag=true) ven lo mismo que hoy (#437 null=visible);
// nuevos (flag=false) solo ven Credenciales + lo activado explícito.
//
// Server component compartido por dos superficies:
//   - /perfil/[id] (la página pública real)
//   - el modal "Ver cómo me ve el directorio" en "Mi vidriera" (preview sin navegar)
// No incluye el link "Volver al directorio" (es específico de la página pública).
//
// Invariantes: SAM nunca se expone acá (no es un bloque). CUIT / responsable /
// los 7 del recorrido son forzado-privados: nunca entran a esta consulta.

export interface VidrieraPublicaTaller {
  nombre: string
  nivel: string
  verificadoAfip: boolean
  provincia: string | null
  partido: string | null
  ubicacionDetalle: string | null
  descripcion: string | null
  portfolioFotos: string[]
  visibilidadVidriera: unknown
  modeloB_revisado: boolean
  validaciones: { tipoDocumento: { nombre: string } }[]
  procesos: { id: string; proceso: { nombre: string } }[]
  prendas: { id: string; prenda: { nombre: string } }[]
  maquinaria: { id: string; nombre: string; cantidad: number }[]
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

export function VidrieraPublicaContenido({ taller }: { taller: VidrieraPublicaTaller }) {
  const verProcesos = taller.procesos.length > 0 && bloqueVisiblePublico(taller, 'procesos')
  const verPrendas = taller.prendas.length > 0 && bloqueVisiblePublico(taller, 'prendas')
  const verMaquinaria = taller.maquinaria.length > 0 && bloqueVisiblePublico(taller, 'maquinaria')
  const verPortfolio = taller.portfolioFotos.length > 0 && bloqueVisiblePublico(taller, 'portfolio')
  const verFormacion = taller.certificados.length > 0 && bloqueVisiblePublico(taller, 'formacion')
  const hayDescripcion = verProcesos || verPrendas || verMaquinaria || verPortfolio || taller.certificaciones.length > 0

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
        {taller.descripcion && (
          <p className="text-gray-600 text-sm italic mt-2">&quot;{taller.descripcion}&quot;</p>
        )}
      </div>

      {/* DIMENSIÓN 2 — Formación (toggle-libre: master `formacion`) */}
      {verFormacion && (
        <>
          <DimensionTitulo>Formación</DimensionTitulo>
          <Card title="Capacitaciones certificadas" className="mb-4">
            <div className="space-y-2">
              {taller.certificados.map((cert) => (
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
