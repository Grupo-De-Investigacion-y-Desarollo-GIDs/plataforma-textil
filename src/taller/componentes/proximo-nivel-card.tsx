import Link from 'next/link'
import { calcularProximoNivel, type ProximoNivelInfo } from '@/compartido/lib/nivel'
import { nivelAEtapa } from '@/compartido/lib/formalizacion'

// --- Tipos internos ---

interface Paso {
  id: string
  titulo: string
  descripcion: string
  puntos: number
  prioridad: number
  requerido: boolean
  accion: {
    texto: string
    href: string
  }
}

// --- Logica de priorizacion ---

function ordenarPasos(info: ProximoNivelInfo): Paso[] {
  const pasos: Paso[] = []

  // 1. CUIT pendiente de verificacion (siempre primero)
  if (info.requiereAfip && !info.tieneAfip) {
    pasos.push({
      id: 'verificar-afip',
      titulo: 'Verifica tu CUIT en ARCA',
      descripcion: 'Tu CUIT esta pendiente de verificacion.',
      puntos: 10,
      prioridad: 1,
      requerido: true,
      accion: { texto: 'Verificar ahora', href: '/taller/formalizacion#verificar-cuit' },
    })
  }

  // 2. Documentos faltantes — ordenados por puntos descendente
  const docsOrdenados = [...info.documentosFaltantes].sort((a, b) => b.puntos - a.puntos)
  for (const doc of docsOrdenados) {
    pasos.push({
      id: `documento-${doc.id}`,
      titulo: `Subi tu ${doc.nombre}`,
      descripcion: doc.requerido
        ? 'Documento requerido para avanzar en tu formalización'
        : 'Documento opcional — suma a tu recorrido',
      puntos: doc.puntos,
      prioridad: doc.requerido ? 2 : 4,
      requerido: doc.requerido,
      accion: { texto: 'Subir documento', href: '/taller/formalizacion' },
    })
  }

  // 3. Certificados de academia faltantes
  if (info.certificadosFaltantes > 0) {
    pasos.push({
      id: 'certificados-academia',
      titulo: info.certificadosFaltantes === 1
        ? 'Completa un curso de la academia'
        : `Completa ${info.certificadosFaltantes} cursos de la academia`,
      descripcion: `Se requieren al menos ${info.certificadosFaltantes} certificado${info.certificadosFaltantes > 1 ? 's' : ''} mas para avanzar`,
      puntos: 0,
      prioridad: 3,
      requerido: true,
      accion: { texto: 'Ver cursos', href: '/taller/aprender' },
    })
  }

  return pasos.sort((a, b) => a.prioridad - b.prioridad)
}

// --- Componentes auxiliares ---

function BarraProgreso({ puntosActuales, puntosObjetivo }: { puntosActuales: number; puntosObjetivo: number }) {
  const porcentaje = Math.min(100, Math.round((puntosActuales / puntosObjetivo) * 100))

  return (
    <div>
      <div className="h-2.5 bg-zinc-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-blue to-blue-500 rounded-full transition-all"
          style={{ width: `${porcentaje}%` }}
        />
      </div>
      <p className="text-xs text-zinc-500 mt-1">
        {porcentaje}% completado
      </p>
    </div>
  )
}

function PasoItem({ paso }: { paso: Paso }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 bg-white">
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm text-gray-800">{paso.titulo}</span>
          {paso.requerido && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
              requerido
            </span>
          )}
          {!paso.requerido && (
            <span className="text-xs text-zinc-500">opcional</span>
          )}
        </div>
        <p className="text-sm text-zinc-600 mt-1">{paso.descripcion}</p>
      </div>
      <Link
        href={paso.accion.href}
        className="text-sm text-brand-blue font-medium hover:underline whitespace-nowrap mt-0.5"
      >
        {paso.accion.texto} &rarr;
      </Link>
    </div>
  )
}

function FormalizacionConsolidada() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-300 rounded-xl p-6">
      <h2 className="font-overpass text-xl font-bold text-brand-blue mb-2">
        Formalización consolidada
      </h2>
      <p className="text-sm text-blue-800">
        Tu taller cumple con todos los requisitos de formalización. Mantenete activo completando
        pedidos y renovando tu documentación cuando corresponda.
      </p>
      <div className="mt-4">
        <p className="text-sm font-semibold text-blue-900 mb-2">Para mantener tu estado:</p>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>Mantene tus documentos al dia</li>
          <li>Segui capacitandote en la academia</li>
          <li>Completa tus pedidos en tiempo</li>
        </ul>
      </div>
    </div>
  )
}

function ListaVaciaMensaje() {
  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
      Cumplís con todos los requisitos de esta etapa — el sistema actualizará tu estado en breve.
    </div>
  )
}

function ProximoNivelFallback() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <p className="text-sm text-zinc-500">
        Estamos cargando tu informacion de formalización. Si esto persiste, contacta al soporte.
      </p>
    </div>
  )
}

// --- Componente principal (server) ---

export async function ProximoNivelCard({ tallerId }: { tallerId: string }) {
  let info: Awaited<ReturnType<typeof calcularProximoNivel>>
  try {
    info = await calcularProximoNivel(tallerId)
  } catch {
    return <ProximoNivelFallback />
  }

  if (info.nivelProximo === null) {
    return <FormalizacionConsolidada />
  }

  const pasos = ordenarPasos(info)
  const etapaProxima = nivelAEtapa(info.nivelProximo)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="mb-4">
        {/* "Próximos pasos para avanzar" (no "Tu recorrido de formalización"): el
            estado del recorrido vive ahora en la card dedicada del dashboard (change 2
            QA Sergio). Esta card es complementaria — los pasos para avanzar de etapa. */}
        <h2 className="font-overpass font-bold text-lg text-brand-blue">
          Próximos pasos para avanzar
        </h2>
        <p className="text-sm text-zinc-500 mt-1">Próxima etapa: {etapaProxima}</p>
        <div className="mt-2">
          <BarraProgreso
            puntosActuales={info.puntosActuales}
            puntosObjetivo={info.puntosObjetivo}
          />
        </div>
      </div>

      {pasos.length === 0 ? (
        <ListaVaciaMensaje />
      ) : (
        <>
          <p className="text-sm text-zinc-600 mb-3">
            Te {pasos.length === 1 ? 'falta' : 'faltan'} {pasos.length} paso{pasos.length > 1 ? 's' : ''} para avanzar:
          </p>

          <div className="space-y-3">
            {pasos.map(paso => (
              <PasoItem key={paso.id} paso={paso} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Exportar para testing
export { ordenarPasos, type Paso }
