// Cursos (colecciones + videos) — contenido REAL curado del piloto.
//
// Reemplaza los 3 cursos placeholder del seed (que apuntaban al rickroll
// dQw4w9WgXcQ) por los 6 cursos reales con sus videos de YouTube. Se recuperaron
// del backup de DEV del 6-ago (backup-dev-piloto-20260806-130637.dump) tras un
// reseed que los había pisado. Viven acá (en el seed) para que un próximo reseed
// NO los vuelva a pisar — mismo criterio reseed-safe que las imágenes del evento.
//
// Standalone contra dev (sin resetear):  npx tsx --env-file=.env.local scripts/seed-cursos.ts
// También lo llama prisma/seed.ts (devuelve un map titulo→coleccionId para cablear
// progreso/certificados). Ids fijos = idempotente y estable entre reseeds.

import { PrismaClient } from '@prisma/client'
import { fileURLToPath } from 'node:url'

interface CursoDef {
  id: string
  titulo: string
  descripcion: string
  categoria: string
  duracion: string
  orden: number
  // Nombres de procesos (se resuelven a ids del catálogo actual en runtime; los ids
  // cambian en cada reseed, por eso NO se hardcodean).
  procesosTargetNombres: string[]
  formalizacionTarget: string[]
  video: { id: string; titulo: string; youtubeUrl: string; duracion: string | null; orden: number }
  evaluacion?: { preguntas: unknown[]; puntajeMinimo: number }
}

export const CURSOS: CursoDef[] = [
  {
    id: 'cmsc5v3hc0008jp04zgv3wbh5',
    titulo: 'Seguridad e higiene en el taller',
    descripcion: 'Aprendé a reconocer los riesgos más frecuentes de un taller textil y a organizar medidas de prevención. El curso aborda el uso de máquinas, el orden del espacio, la electricidad, los incendios y las condiciones de trabajo.',
    categoria: 'Capacitación inicial',
    duracion: '30 minutos',
    orden: 0,
    procesosTargetNombres: [],
    formalizacionTarget: [],
    video: { id: 'cmsc7p7w90001ld04omr38vfj', titulo: 'Plan Seguridad Higiene', youtubeUrl: 'https://youtu.be/27H6Cp8V8as', duracion: null, orden: 1 },
    evaluacion: {
      preguntas: [
        { pregunta: '¿Cuál es la primera medida de seguridad al detectar un principio de incendio?', opciones: ['Usar el extintor', 'Evacuar y dar aviso', 'Llamar a bomberos', 'Apagar las máquinas'], correcta: 1 },
        { pregunta: '¿Cada cuánto debe renovarse la póliza de ART?', opciones: ['Cada 6 meses', 'Anualmente', 'Cada 2 años', 'No se renueva'], correcta: 1 },
        { pregunta: '¿Qué EPP es obligatorio para operarios de corte?', opciones: ['Casco', 'Guante de malla metálica', 'Barbijo', 'Lentes de sol'], correcta: 1 },
      ],
      puntajeMinimo: 60,
    },
  },
  {
    id: 'cmsc5vsob000bjp04n43xe7ki',
    titulo: 'Habilitación del taller textil',
    descripcion: 'Aprendé qué significa habilitar un taller, cómo verificar si la actividad está permitida en el lugar y qué documentación puede solicitarse. El curso te orienta para elegir la vía adecuada e iniciar el trámite.',
    categoria: 'Capacitación inicial',
    duracion: '30 minutos',
    orden: 0,
    procesosTargetNombres: [],
    formalizacionTarget: [],
    video: { id: 'cmsc5z52n000hjp04x9z5yzvf', titulo: 'Habilitación del taller textil', youtubeUrl: 'https://youtu.be/FzDEw_5HUho', duracion: '30 minutos', orden: 1 },
  },
  {
    id: 'cmq7iq5a9003gvobme7c0unc0',
    titulo: 'Inscripción al Monotributo',
    descripcion: 'Conocé para qué sirve el Monotributo, qué información necesitás preparar y cuáles son los pasos principales para registrar tu actividad. Este curso te ayuda a comenzar a facturar y darle identidad formal a tu taller.',
    categoria: 'Formalización',
    duracion: '30 minutos',
    orden: 1,
    procesosTargetNombres: [],
    formalizacionTarget: ['Habilitación bomberos', 'Plan de seguridad e higiene', 'Empleados registrados'],
    video: { id: 'cmsc6cqpo000ljp04qegevfqb', titulo: 'Inscripción al monotributo', youtubeUrl: 'https://youtu.be/ozMRk8YA2rI', duracion: null, orden: 1 },
    evaluacion: {
      preguntas: [
        { pregunta: '¿Qué documento necesitás para inscribirte como monotributista?', opciones: ['Pasaporte', 'CUIL y clave fiscal nivel 3', 'Título universitario', 'Certificado de domicilio'], correcta: 1 },
        { pregunta: '¿Qué es la ART?', opciones: ['Asociación de Registros Textiles', 'Aseguradora de Riesgos del Trabajo', 'Autoridad Regulatoria Tributaria', 'Agencia de Recaudación Textil'], correcta: 1 },
        { pregunta: '¿Cuál es el principal beneficio de formalizar un taller?', opciones: ['Pagar más impuestos', 'Acceso a marcas, crédito y protección legal', 'Tener más empleados', 'Comprar máquinas importadas'], correcta: 1 },
      ],
      puntajeMinimo: 60,
    },
  },
  {
    id: 'cmsc39pxr0000l504wjqw7pde',
    titulo: 'Libro de Sueldos Digital',
    descripcion: 'Conocé para qué sirve el Libro de Sueldos Digital y cómo se relaciona con la liquidación de salarios y las obligaciones laborales. El curso explica qué información se registra, cómo se prepara y qué controles realizar antes de presentarla.',
    categoria: 'Capacitación inicial',
    duracion: '30 minutos',
    orden: 0,
    procesosTargetNombres: [],
    formalizacionTarget: [],
    video: { id: 'cmsc4yh710001la04s3g54pve', titulo: 'Libro sueldo', youtubeUrl: 'https://youtu.be/jEAF5kShTO0', duracion: null, orden: 1 },
  },
  {
    id: 'cmq7iq5tg003mvobm2ipan3ou',
    titulo: 'Alta temprana de trabajadores en ARCA',
    descripcion: 'Aprendé a informar en ARCA el inicio de una relación laboral antes de que la persona comience a trabajar. El curso explica qué datos preparar, cómo realizar el alta y por qué es importante conservar la constancia.',
    categoria: 'Formalización',
    duracion: '30 minutos',
    orden: 2,
    procesosTargetNombres: ['Confección', 'Corte'],
    formalizacionTarget: ['Nómina digital'],
    video: { id: 'cmsc71mu0000vjp0488w47e3i', titulo: 'Alta temprana de trabajadores', youtubeUrl: 'https://youtu.be/R-l-UK0ZdxY', duracion: null, orden: 1 },
  },
  {
    id: 'cmq7iq6cr003tvobm7e9hrila',
    titulo: 'Prevención contra incendios',
    descripcion: 'Conocé los requisitos vinculados con la prevención contra incendios y el registro del plano correspondiente. El curso te ayuda a identificar cuándo necesitás intervención profesional y qué documentación debe prepararse.',
    categoria: 'Otro',
    duracion: '30',
    orden: 3,
    procesosTargetNombres: [],
    formalizacionTarget: ['CUIT/Monotributo', 'Habilitación municipal', 'ART'],
    video: { id: 'cmsc7wmfm0003ld04k8l7cm87', titulo: 'Plan prevención de incendios', youtubeUrl: 'https://youtu.be/L5NPsnzAJrk', duracion: null, orden: 1 },
  },
]

/**
 * Crea los 6 cursos reales (colecciones + videos + 2 evaluaciones). Idempotente por
 * id fijo. Limpia primero lo existente (certificados RESTRINGEN la baja de colección,
 * por eso se borran antes; el resto cae por cascade). Devuelve map titulo→coleccionId.
 */
export async function seedCursos(prisma: PrismaClient): Promise<Map<string, string>> {
  const procesos = await prisma.procesoProductivo.findMany({ select: { id: true, nombre: true } })
  const procId = new Map(procesos.map(p => [p.nombre, p.id]))

  // certificado no tiene onDelete: Cascade → borrarlo antes de las colecciones.
  await prisma.certificado.deleteMany()
  await prisma.coleccion.deleteMany() // cascade: video, evaluacion, progresoCapacitacion

  const map = new Map<string, string>()
  for (const c of CURSOS) {
    const col = await prisma.coleccion.create({
      data: {
        id: c.id,
        titulo: c.titulo,
        descripcion: c.descripcion,
        categoria: c.categoria,
        duracion: c.duracion,
        calificacion: 0,
        institucion: 'PDT',
        orden: c.orden,
        activa: true,
        procesosTarget: c.procesosTargetNombres.map(n => procId.get(n)).filter((x): x is string => Boolean(x)),
        formalizacionTarget: c.formalizacionTarget,
      },
    })
    await prisma.video.create({
      data: { id: c.video.id, coleccionId: col.id, titulo: c.video.titulo, youtubeUrl: c.video.youtubeUrl, duracion: c.video.duracion, orden: c.video.orden },
    })
    if (c.evaluacion) {
      await prisma.evaluacion.create({ data: { coleccionId: col.id, preguntas: c.evaluacion.preguntas as never, puntajeMinimo: c.evaluacion.puntajeMinimo } })
    }
    map.set(c.titulo, col.id)
  }
  const conEval = CURSOS.filter(c => c.evaluacion).length
  console.log(`  ✓ ${CURSOS.length} cursos reales (colecciones + ${CURSOS.length} videos + ${conEval} evaluaciones)`)
  return map
}

// Standalone: npx tsx --env-file=.env.local scripts/seed-cursos.ts
const esMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (esMain) {
  const prisma = new PrismaClient()
  seedCursos(prisma)
    .then(() => prisma.$disconnect())
    .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
}
