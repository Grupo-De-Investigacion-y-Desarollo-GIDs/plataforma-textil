export const dynamic = 'force-dynamic'

import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/compartido/componentes/ui/badge'
import { Card } from '@/compartido/componentes/ui/card'
import { Button } from '@/compartido/componentes/ui/button'
import { Award, Download, MapPin, Milestone, ShieldCheck, Lock, Users, Ruler, Gauge, Workflow, Calendar, FileText, BookOpen } from 'lucide-react'
import { PortfolioManager } from '@/taller/componentes/portfolio-manager'
import { VerVidrieraModal } from '@/taller/componentes/ver-vidriera-modal'
import { VidrieraPublicaContenido } from '@/taller/componentes/vidriera-publica-contenido'
import { TarjetaBloqueVidriera } from '@/taller/componentes/tarjeta-bloque-vidriera'
import { BadgeArca } from '@/compartido/componentes/badge-arca'
import { nivelAEtapa } from '@/compartido/lib/formalizacion'
import { labelOrganizacion, labelRegistro, labelEscalabilidad, rangoCapacidad, labelTipoInscripcion } from '@/compartido/lib/taller-formulario'

const CATEGORIA_LABEL: Record<string, string> = {
  APRENDIZ: 'Aprendices',
  MEDIO_OFICIAL: 'Medio oficial',
  OFICIAL: 'Oficial',
  OFICIAL_CALIFICADO: 'Oficial calificado',
}

// Etapa 2.2-C1 (2a vuelta) — "Mi vidriera": toggles INLINE + descubribilidad.
// Estructura en las 4 SECCIONES de Sergio:
//   S1 Credenciales (forzado-visible, sin toggle): Etapa + ARCA + validaciones
//   S2 Datos generales: ubicación (forzado-visible) + tipo de inscripción (toggle) + año (toggle)
//   S3 Descripción: descripción (forzado-visible) → portfolio → procesos → prendas →
//      capacidad → equipo → espacio → maquinaria → organización (todos toggle excepto descripción)
//   S4 Formación: Academia (toggle único) + placeholder si no hay cursos
// El panel de configuración de gestión se eliminó: cada card toggleable lleva su switch
// (TarjetaBloqueVidriera), que reusa el server action `actualizarVisibilidadVidriera`.
// Caja "Nunca visible" (CUIT/responsable/SAM) al PIE.

function SeccionTitulo({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-overpass font-bold text-xs uppercase tracking-wide text-gray-400 pt-2">
      {children}
    </h2>
  )
}

const WIZARD = '/taller/perfil/completar'
const DATOS_BASICOS = '/taller/perfil'
const EDITAR = '/taller/perfil/editar'

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

  const vis = { visibilidadInicial: taller.visibilidadVidriera, modeloBRevisado: taller.modeloB_revisado }
  const ubicacion = [taller.provincia, taller.partido, taller.ubicacionDetalle].filter(Boolean).join(', ')
  const tipoInscripcion = labelTipoInscripcion(taller.tipoInscripcionAfip)
  const equipoConDatos = taller.plantilla.filter((p) => p.cantidad > 0)
  const rango = rangoCapacidad(taller.capacidadMensual)

  return (
    <div className="space-y-4">
      {/* "Ver cómo me ve el directorio": MODAL con la vidriera pública filtrada. */}
      <div className="flex justify-end">
        <VerVidrieraModal>
          <VidrieraPublicaContenido taller={taller} />
        </VerVidrieraModal>
      </div>

      {/* ── S1 CREDENCIALES (forzado-visible, sin toggle) ── */}
      <SeccionTitulo>Credenciales</SeccionTitulo>
      <Card>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default"><Milestone className="w-3 h-3 mr-1" />{nivelAEtapa(taller.nivel)}</Badge>
          <BadgeArca verificado={taller.verificadoAfip} />
          {taller.validaciones.map((v, i) => (
            <Badge key={i} variant="success"><ShieldCheck className="w-3 h-3 mr-1" />{v.tipoDocumento.nombre}</Badge>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">Siempre visible para las marcas.</p>
      </Card>

      {/* ── S2 DATOS GENERALES ── */}
      <SeccionTitulo>Datos generales</SeccionTitulo>

      {/* Ubicación: forzado-visible, sin switch */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-overpass font-bold text-gray-800">Ubicación</h3>
          <span className="text-xs text-gray-400">Siempre visible</span>
        </div>
        <p className="flex items-center gap-1.5 text-sm text-gray-700 mt-2">
          <MapPin className="w-4 h-4 text-gray-400" /> {ubicacion || <span className="text-gray-400 italic">Sin completar</span>}
        </p>
      </Card>

      {/* Tipo de inscripción: toggle (solo el tipo, nunca la categoría) */}
      <TarjetaBloqueVidriera
        bloque="inscripcion"
        titulo="Tipo de inscripción"
        {...vis}
        tieneDatos={!!tipoInscripcion}
        sinDatosTexto="Verificá tu CUIT en ARCA para mostrar tu tipo de inscripción."
        wizardHref={DATOS_BASICOS}
        wizardCta="Ir a Datos básicos"
      >
        <p className="flex items-center gap-1.5 text-sm text-gray-700">
          <FileText className="w-4 h-4 text-gray-400" /> {tipoInscripcion}
        </p>
      </TarjetaBloqueVidriera>

      {/* Año de fundación: toggle */}
      <TarjetaBloqueVidriera
        bloque="anioFundacion"
        titulo="Año de fundación"
        {...vis}
        tieneDatos={taller.fundado != null}
        sinDatosTexto="Sumá el año en que empezó tu taller."
        wizardHref={EDITAR}
        wizardCta="Agregar año de fundación"
      >
        <p className="flex items-center gap-1.5 text-sm text-gray-700">
          <Calendar className="w-4 h-4 text-gray-400" /> Fundado en {taller.fundado}
        </p>
      </TarjetaBloqueVidriera>

      {/* ── S3 DESCRIPCIÓN ── */}
      <SeccionTitulo>Descripción</SeccionTitulo>

      {/* Descripción: forzado-visible (movida desde Credenciales), sin toggle */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-overpass font-bold text-gray-800">Descripción</h3>
          <span className="text-xs text-gray-400">Siempre visible</span>
        </div>
        {taller.descripcion ? (
          <p className="text-sm text-gray-700 whitespace-pre-wrap mt-2">{taller.descripcion}</p>
        ) : (
          <div className="mt-2">
            <p className="text-sm text-gray-400">Contá a qué se dedica tu taller.</p>
            <Link href={EDITAR} className="text-sm text-brand-blue hover:underline">Agregar descripción</Link>
          </div>
        )}
      </Card>

      {/* Portfolio: editable inline (PortfolioManager), toggle si hay fotos */}
      <TarjetaBloqueVidriera
        bloque="portfolio"
        titulo="Portfolio"
        {...vis}
        tieneDatos={taller.portfolioFotos.length > 0}
        sinDatosTexto=""
        wizardHref=""
        wizardCta=""
        contenidoSiempre
      >
        <PortfolioManager tallerId={taller.id} fotosActuales={taller.portfolioFotos} />
      </TarjetaBloqueVidriera>

      {/* Procesos */}
      <TarjetaBloqueVidriera
        bloque="procesos"
        titulo="Procesos productivos"
        {...vis}
        tieneDatos={taller.procesos.length > 0}
        sinDatosTexto="Declará los procesos que hacés (corte, confección, etc.)."
        wizardHref={WIZARD}
        wizardCta="Cargar procesos"
      >
        <div className="flex flex-wrap gap-2">
          {taller.procesos.map((tp) => (
            <Badge key={tp.id} variant="outline">{tp.proceso.nombre}</Badge>
          ))}
        </div>
      </TarjetaBloqueVidriera>

      {/* Prendas */}
      <TarjetaBloqueVidriera
        bloque="prendas"
        titulo="Tipos de prenda"
        {...vis}
        tieneDatos={taller.prendas.length > 0}
        sinDatosTexto="Sumá los rubros/prendas que producís."
        wizardHref={WIZARD}
        wizardCta="Cargar prendas"
      >
        <div className="flex flex-wrap gap-2">
          {taller.prendas.map((tp) => (
            <Badge key={tp.id} variant="default">{tp.prenda.nombre}</Badge>
          ))}
        </div>
      </TarjetaBloqueVidriera>

      {/* Capacidad: RANGO, nunca SAM */}
      <TarjetaBloqueVidriera
        bloque="capacidad"
        titulo="Capacidad productiva"
        {...vis}
        tieneDatos={rango != null}
        sinDatosTexto="Indicá tu capacidad mensual para mostrar un rango a las marcas."
        wizardHref={WIZARD}
        wizardCta="Cargar capacidad"
      >
        <p className="flex items-center gap-1.5 text-sm text-gray-700">
          <Gauge className="w-4 h-4 text-gray-400" /> {rango}
        </p>
        {taller.escalabilidad && (
          <p className="text-xs text-gray-500 mt-1">Puede escalar: {labelEscalabilidad(taller.escalabilidad)}</p>
        )}
      </TarjetaBloqueVidriera>

      {/* Equipo */}
      <TarjetaBloqueVidriera
        bloque="equipo"
        titulo="Equipo de trabajo"
        {...vis}
        tieneDatos={equipoConDatos.length > 0}
        sinDatosTexto="Mostrá la composición de tu equipo."
        wizardHref={WIZARD}
        wizardCta="Cargar equipo"
      >
        <ul className="space-y-1 text-sm">
          {equipoConDatos.map((p) => (
            <li key={p.categoria} className="flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-gray-400" />{CATEGORIA_LABEL[p.categoria] ?? p.categoria}</span>
              <span className="text-gray-500">{p.cantidad}</span>
            </li>
          ))}
        </ul>
      </TarjetaBloqueVidriera>

      {/* Espacio */}
      <TarjetaBloqueVidriera
        bloque="espacio"
        titulo="Espacio físico"
        {...vis}
        tieneDatos={(taller.metrosCuadrados ?? 0) > 0}
        sinDatosTexto="Sumá los metros cuadrados de tu taller."
        wizardHref={WIZARD}
        wizardCta="Cargar espacio"
      >
        <p className="flex items-center gap-1.5 text-sm text-gray-700">
          <Ruler className="w-4 h-4 text-gray-400" /> {taller.metrosCuadrados} m²
        </p>
      </TarjetaBloqueVidriera>

      {/* Maquinaria */}
      <TarjetaBloqueVidriera
        bloque="maquinaria"
        titulo="Maquinaria"
        {...vis}
        tieneDatos={taller.maquinaria.length > 0}
        sinDatosTexto="Cargá tu maquinaria para mostrarla a las marcas."
        wizardHref={WIZARD}
        wizardCta="Cargar maquinaria"
      >
        <ul className="space-y-1 text-sm">
          {taller.maquinaria.map((m) => (
            <li key={m.id} className="flex justify-between">
              <span>{m.nombre} {m.tipo && <span className="text-gray-400">({m.tipo})</span>}</span>
              <span className="text-gray-500 font-medium">x{m.cantidad}</span>
            </li>
          ))}
        </ul>
      </TarjetaBloqueVidriera>

      {/* Organización */}
      <TarjetaBloqueVidriera
        bloque="organizacion"
        titulo="Organización del trabajo"
        {...vis}
        tieneDatos={!!taller.organizacion}
        sinDatosTexto="Contá cómo organizás la producción."
        wizardHref={WIZARD}
        wizardCta="Cargar organización"
      >
        <p className="flex items-center gap-1.5 text-sm text-gray-700">
          <Workflow className="w-4 h-4 text-gray-400" /> {labelOrganizacion(taller.organizacion)}
        </p>
        {taller.registroProduccion && (
          <p className="text-xs text-gray-500 mt-1">Registro de producción: {labelRegistro(taller.registroProduccion)}</p>
        )}
      </TarjetaBloqueVidriera>

      {/* Certificaciones de calidad (externas): fuera del piloto de toggles (D4),
          se mantienen sin gate como hasta hoy para no ocultar datos ya visibles. */}
      {taller.certificaciones.length > 0 && (
        <Card>
          <h3 className="font-overpass font-bold text-gray-800 mb-3">Certificaciones</h3>
          <div className="flex flex-wrap gap-2">
            {taller.certificaciones.map((c) => (
              <Badge key={c.id} variant="success"><Award className="w-3 h-3 mr-1" />{c.nombre}</Badge>
            ))}
          </div>
        </Card>
      )}

      {/* ── S4 FORMACIÓN ── */}
      <SeccionTitulo>Formación</SeccionTitulo>
      {taller.certificados.length > 0 ? (
        <TarjetaBloqueVidriera
          bloque="formacion"
          titulo="Academia (cursos PDT)"
          {...vis}
          tieneDatos
          sinDatosTexto=""
          wizardHref="/taller/aprender"
          wizardCta=""
        >
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
                <a href={`/api/certificados/${c.id}/pdf`} download className="inline-flex items-center gap-1 text-xs text-brand-blue hover:underline">
                  <Download className="w-3 h-3" /> PDF
                </a>
              </div>
            ))}
          </div>
        </TarjetaBloqueVidriera>
      ) : (
        <Card>
          <h3 className="font-overpass font-bold text-gray-800">Academia (cursos PDT)</h3>
          <p className="text-sm text-gray-400 mt-2">Aún no completaste ningún curso.</p>
          <Link href="/taller/aprender" className="inline-flex items-center gap-1 text-sm text-brand-blue hover:underline mt-1">
            <BookOpen className="w-3.5 h-3.5" /> Explorá el catálogo
          </Link>
        </Card>
      )}

      {/* PIE — "Nunca visible para las marcas" (forzado-privado: CUIT/responsable/SAM) */}
      <div className="rounded-lg bg-gray-50 p-3 mt-2">
        <p className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1">
          <Lock className="w-3.5 h-3.5" /> Nunca visible para las marcas
        </p>
        <p className="text-xs text-gray-400">
          Tu CUIT, los datos del responsable (nombre, email, teléfono) y los tiempos de
          producción (SAM) quedan siempre privados, sin importar tus toggles.
        </p>
      </div>
    </div>
  )
}
