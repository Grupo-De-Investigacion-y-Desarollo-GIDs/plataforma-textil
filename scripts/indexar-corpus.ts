// Ejecutar: npx tsx scripts/indexar-corpus.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY
if (!VOYAGE_API_KEY) throw new Error('VOYAGE_API_KEY requerida')

interface Documento {
  titulo: string
  contenido: string
  categoria: string
  fuente?: string
}

// Corpus — Gerardo completa con contenido real antes de correr el script
const corpus: Documento[] = [
  {
    titulo: 'Que es el CUIT y como obtenerlo',
    contenido: 'El CUIT (Clave Unica de Identificacion Tributaria) es el numero que identifica a personas y empresas ante ARCA (ex-AFIP). Para obtenerlo necesitas DNI y domicilio fiscal. Se tramita online en www.afip.gob.ar con clave fiscal nivel 2 o superior. Es gratuito y se obtiene en el momento. Todo taller textil necesita CUIT para operar formalmente.',
    categoria: 'tramites',
    fuente: 'https://www.afip.gob.ar',
  },
  {
    titulo: 'Que es el monotributo y como registrarse',
    contenido: 'El monotributo es un regimen simplificado que unifica el pago de impuestos y aportes para pequenos contribuyentes. Se paga una cuota fija mensual segun la categoria (determinada por ingresos y actividad). Para inscribirte necesitas CUIT y clave fiscal. Se hace online en ARCA. Los talleres textiles pequenos generalmente arrancan en categorias bajas y pueden subir a medida que crecen.',
    categoria: 'tramites',
    fuente: 'https://www.afip.gob.ar/monotributo/',
  },
  {
    titulo: 'Que es la ART y como contratarla',
    contenido: 'La ART (Aseguradora de Riesgos del Trabajo) es un seguro obligatorio que cubre a los trabajadores ante accidentes laborales y enfermedades profesionales. Si tenes empleados, es obligatorio contratar una ART. El costo depende de la cantidad de empleados y el nivel de riesgo de la actividad. Para talleres textiles, el riesgo es medio. Se contrata a traves de empresas aseguradoras habilitadas por la SRT.',
    categoria: 'tramites',
    fuente: 'https://www.srt.gob.ar/',
  },
  {
    titulo: 'Habilitacion municipal — que es y como obtenerla',
    contenido: 'La habilitacion municipal es el permiso que otorga el municipio para que un local comercial o taller pueda funcionar. Cada municipio tiene sus propios requisitos, pero generalmente piden: planos del local, habilitacion de bomberos, certificado de zonificacion, y pago de tasas. El tramite puede demorar entre 30 y 90 dias segun el municipio.',
    categoria: 'tramites',
  },
  {
    titulo: 'Habilitacion de bomberos — que es y como obtenerla',
    contenido: 'La habilitacion de bomberos certifica que tu taller cumple con las condiciones minimas de seguridad contra incendios. Incluye verificacion de matafuegos, salidas de emergencia, senalizacion y plan de evacuacion. Se tramita en el cuartel de bomberos de tu zona. El inspector visita el local y emite el certificado si cumple. Es requisito para la habilitacion municipal.',
    categoria: 'tramites',
  },
  {
    titulo: 'Seguridad e higiene en talleres textiles',
    contenido: 'El plan de seguridad e higiene es un documento que describe las medidas de prevencion de riesgos laborales en tu taller. Debe ser elaborado por un profesional habilitado (tecnico en seguridad e higiene). Incluye: identificacion de riesgos, medidas preventivas, capacitacion del personal, elementos de proteccion personal, y plan de emergencia. Es obligatorio para talleres con empleados.',
    categoria: 'tramites',
  },
  {
    titulo: 'Libro de sueldos digital',
    contenido: 'El libro de sueldos digital es un registro electronico obligatorio para todos los empleadores. Reemplaza al viejo libro de sueldos en papel. Se gestiona a traves del sistema de ARCA con clave fiscal. Registra los sueldos, jornadas, aportes y contribuciones de cada empleado. El plazo para completarlo es mensual, dentro de los primeros dias del mes siguiente.',
    categoria: 'tramites',
    fuente: 'https://www.argentina.gob.ar/trabajo/librodesueldos',
  },
  {
    titulo: 'Inscripcion como empleador',
    contenido: 'Si tenes empleados en relacion de dependencia, necesitas inscribirte como empleador en ARCA. El tramite se hace online con clave fiscal. Una vez inscripto, debes registrar a cada empleado con su alta temprana (antes de que empiece a trabajar), pagar aportes y contribuciones mensuales, y emitir recibos de sueldo. No tener empleados registrados es una falta grave.',
    categoria: 'tramites',
    fuente: 'https://www.afip.gob.ar/empleadores/',
  },
  {
    titulo: 'Niveles BRONCE PLATA ORO — que requiere cada uno',
    contenido: 'La plataforma tiene 3 niveles de formalizacion: BRONCE (nivel inicial al registrarte con CUIT verificado), PLATA (requiere CUIT verificado + habilitacion municipal + ART + al menos 1 certificado de capacitacion), y ORO (requiere todos los documentos de PLATA mas inscripcion como empleador, habilitacion de bomberos, seguridad e higiene, y libro de sueldos). Cada nivel sube tu visibilidad en el directorio y te da acceso a mejores oportunidades comerciales.',
    categoria: 'plataforma',
  },
  {
    titulo: 'Como subir documentos en la plataforma',
    contenido: 'Para subir documentos de formalizacion, anda a Mi Formalizacion en el menu lateral. Cada requisito tiene un boton "Subir documento". Acepta archivos PDF, JPG o PNG de hasta 5MB. Una vez subido, el equipo de PDT lo revisa en 48-72 horas habiles. Si es aprobado, el requisito se marca como completado. Si es rechazado, vas a recibir un email con el motivo y podes volver a subirlo.',
    categoria: 'plataforma',
  },
  {
    titulo: 'Como funciona la verificacion de CUIT via ARCA',
    contenido: 'Al registrarte en la plataforma, ingresás tu CUIT y el sistema lo verifica automaticamente con ARCA (ex-AFIP) usando el servicio de AfipSDK. Si el CUIT es valido y esta activo, se muestra la razon social y tu taller recibe nivel BRONCE inmediatamente. Si el CUIT es invalido o inactivo, no podes completar el registro. La verificacion es instantanea.',
    categoria: 'plataforma',
  },
  {
    titulo: 'Como se calculan los certificados',
    contenido: 'Los certificados se obtienen al completar los cursos de capacitacion de la plataforma. Cada curso tiene una evaluacion final con preguntas de opcion multiple. Si aprobas con el puntaje minimo (generalmente 60%), se genera un certificado con un codigo unico verificable por QR. Los certificados suman puntos para subir de nivel y aparecen en tu perfil publico.',
    categoria: 'capacitacion',
  },
  {
    titulo: 'Como funciona el sistema de capacitacion',
    contenido: 'La plataforma ofrece cursos gratuitos organizados en colecciones. Cada coleccion tiene videos y una evaluacion final. Podes ver los videos a tu ritmo, el sistema guarda tu progreso. Al completar todos los videos, se habilita la evaluacion. Si aprobas, recibis un certificado oficial. Los cursos estan curados por OIT, INTI y UNTREF.',
    categoria: 'capacitacion',
  },
  {
    titulo: 'Preguntas frecuentes sobre pedidos y cotizaciones',
    contenido: 'Las marcas publican pedidos con la prenda, cantidad y plazo. Los talleres compatibles reciben una notificacion y pueden enviar una cotizacion con precio, plazo y proceso. La marca revisa las cotizaciones y acepta la que prefiera. Al aceptar, se crea automaticamente una orden de manufactura y el pedido pasa a estado "En ejecucion". Cada taller puede cotizar una sola vez por pedido.',
    categoria: 'plataforma',
  },
  {
    titulo: 'Beneficios de formalizarse',
    contenido: 'Formalizarse te da acceso a mejores clientes, mayor visibilidad en el directorio, certificaciones oficiales que podes mostrar a tus clientes, proteccion legal para vos y tus empleados, acceso a creditos y programas de apoyo gubernamental, y la posibilidad de trabajar con marcas que exigen proveedores formalizados. El proceso es gradual — no necesitas tener todo desde el dia uno.',
    categoria: 'formalizacion',
  },
  {
    titulo: 'Contacto y soporte de la plataforma',
    contenido: 'Para consultas sobre la plataforma, podes escribir a soporte@plataformatextil.ar o visitar la seccion de Ayuda en el menu. El equipo responde en horario laboral de lunes a viernes de 9 a 18 hs. Para problemas urgentes con tu cuenta, usa el boton "Contactar" en tu panel. La plataforma es una iniciativa de OIT Argentina y UNTREF.',
    categoria: 'plataforma',
  },
  {
    titulo: 'Como completar el perfil de taller',
    contenido: 'Despues de registrarte, completa tu perfil en Mi Perfil. Agrega: ubicacion, descripcion de tu taller, procesos que realizas (corte, costura, estampado, etc.), tipos de prenda que fabricas, capacidad mensual de produccion, y fotos del taller. Un perfil completo aparece mas arriba en las busquedas y genera mas confianza en las marcas.',
    categoria: 'plataforma',
  },
  {
    titulo: 'Como funciona el directorio de talleres',
    contenido: 'El directorio es donde las marcas buscan talleres. Pueden filtrar por ubicacion, nivel de formalizacion, tipo de prenda y proceso productivo. Los talleres con nivel mas alto aparecen primero. Tu perfil muestra tu nombre, ubicacion, nivel, procesos, prendas, capacidad y rating. Las marcas pueden contactarte directamente desde tu perfil.',
    categoria: 'plataforma',
  },
  {
    titulo: 'Que son las auditorias y como prepararse',
    contenido: 'Las auditorias son inspecciones programadas que verifican las condiciones de trabajo en tu taller. El inspector revisa documentacion, condiciones edilicias, seguridad, y cumplimiento laboral. Para prepararte: tene todos los documentos al dia, verifica que los matafuegos esten vigentes, que las salidas de emergencia esten despejadas, y que los empleados tengan sus elementos de proteccion.',
    categoria: 'formalizacion',
  },
  {
    titulo: 'Como registrarse en la plataforma paso a paso',
    contenido: 'Para registrarte: 1) Entra a plataformatextil.ar y hace click en "Soy taller" o "Soy marca". 2) Completa tus datos personales (nombre, email, contrasena). 3) Ingresa el CUIT de tu taller o marca — el sistema lo verifica automaticamente. 4) Si es valido, tu cuenta se crea con nivel BRONCE. 5) Completa tu perfil y subi tus documentos para subir de nivel.',
    categoria: 'plataforma',
  },
]

async function generarEmbedding(texto: string): Promise<number[]> {
  const res = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VOYAGE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input: texto, model: 'voyage-3-lite' }),
  })
  if (!res.ok) throw new Error(`Voyage error: ${res.status}`)
  const data = await res.json()
  return data.data[0].embedding
}

async function main() {
  console.log(`Indexando ${corpus.length} documentos...`)

  for (const [i, doc] of corpus.entries()) {
    const embedding = await generarEmbedding(doc.contenido)
    const embeddingStr = `[${embedding.join(',')}]`

    await prisma.$executeRaw`
      INSERT INTO documentos_rag (id, titulo, contenido, categoria, fuente, activo, embedding, "createdAt", "updatedAt")
      VALUES (
        ${`rag-${String(i + 1).padStart(3, '0')}`},
        ${doc.titulo},
        ${doc.contenido},
        ${doc.categoria},
        ${doc.fuente ?? null},
        true,
        ${embeddingStr}::vector,
        NOW(),
        NOW()
      )
    `

    console.log(`  [${i + 1}/${corpus.length}] ${doc.titulo}`)

    // Esperar 200ms entre requests para no saturar Voyage API
    await new Promise((r) => setTimeout(r, 200))
  }

  console.log('Indexacion completada.')
  await prisma.$disconnect()
}

main().catch(console.error)
