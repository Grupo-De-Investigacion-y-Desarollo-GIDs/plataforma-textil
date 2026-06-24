import { Badge } from '@/compartido/componentes/ui/badge'
import { Card } from '@/compartido/componentes/ui/card'
import { MapPin, Award, ShieldCheck } from 'lucide-react'
import { GaleriaFotos } from '@/taller/componentes/galeria-fotos'
import { BadgeArca } from '@/compartido/componentes/badge-arca'
import { bloqueVisible } from '@/compartido/lib/visibilidad-vidriera'

// Contenido de la vidriera PÚBLICA (lo que ve la marca), filtrado por visibilidad
// (#437). Server component compartido por dos superficies:
//   - /perfil/[id] (la página pública real)
//   - el modal "Ver cómo me ve el directorio" en "Mi vidriera" (preview sin navegar)
// No incluye el link "Volver al directorio" (es específico de la página pública).

export interface VidrieraPublicaTaller {
  nombre: string
  verificadoAfip: boolean
  provincia: string | null
  partido: string | null
  ubicacionDetalle: string | null
  descripcion: string | null
  portfolioFotos: string[]
  visibilidadVidriera: unknown
  validaciones: { tipoDocumento: { nombre: string } }[]
  procesos: { id: string; proceso: { nombre: string } }[]
  prendas: { id: string; prenda: { nombre: string } }[]
  maquinaria: { id: string; nombre: string; cantidad: number }[]
  certificaciones: { id: string; nombre: string }[]
  certificados: { id: string; codigo: string; coleccion: { titulo: string; institucion: string | null } }[]
}

export function VidrieraPublicaContenido({ taller }: { taller: VidrieraPublicaTaller }) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-overpass font-bold text-3xl text-brand-blue mb-2">{taller.nombre}</h1>
        {(taller.verificadoAfip || taller.validaciones.length > 0) && (
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {taller.verificadoAfip && <BadgeArca verificado={true} />}
            {taller.validaciones.map((v, i) => (
              <Badge key={i} variant="success"><ShieldCheck className="w-3 h-3 mr-1" />{v.tipoDocumento.nombre}</Badge>
            ))}
          </div>
        )}
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

      {taller.procesos.length > 0 && (
        <Card title="Procesos" className="mb-4">
          <div className="flex flex-wrap gap-2">
            {taller.procesos.map((tp) => (
              <Badge key={tp.id} variant="outline">{tp.proceso.nombre}</Badge>
            ))}
          </div>
        </Card>
      )}

      {taller.prendas.length > 0 && (
        <Card title="Tipos de prenda" className="mb-4">
          <div className="flex flex-wrap gap-2">
            {taller.prendas.map((tp) => (
              <Badge key={tp.id} variant="outline">{tp.prenda.nombre}</Badge>
            ))}
          </div>
        </Card>
      )}

      {taller.portfolioFotos.length > 0 && (
        <Card title="Trabajos realizados" className="mb-4">
          <GaleriaFotos fotos={taller.portfolioFotos} />
        </Card>
      )}

      {taller.maquinaria.length > 0 && bloqueVisible(taller, 'maquinaria') && (
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

      {taller.certificados.length > 0 && bloqueVisible(taller, 'formacion') && (
        <Card title="Capacitaciones certificadas">
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
      )}
    </div>
  )
}
