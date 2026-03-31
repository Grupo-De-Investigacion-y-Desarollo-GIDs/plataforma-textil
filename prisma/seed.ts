import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clean existing data
  await prisma.logActividad.deleteMany()
  await prisma.notificacion.deleteMany()
  await prisma.accionCorrectiva.deleteMany()
  await prisma.auditoria.deleteMany()
  await prisma.denuncia.deleteMany()
  await prisma.certificado.deleteMany()
  await prisma.progresoCapacitacion.deleteMany()
  await prisma.evaluacion.deleteMany()
  await prisma.video.deleteMany()
  await prisma.coleccion.deleteMany()
  await prisma.validacion.deleteMany()
  await prisma.tipoDocumento.deleteMany()
  await prisma.ordenManufactura.deleteMany()
  await prisma.pedido.deleteMany()
  await prisma.maquinaria.deleteMany()
  await prisma.tallerCertificacion.deleteMany()
  await prisma.tallerPrenda.deleteMany()
  await prisma.tallerProceso.deleteMany()
  await prisma.prendaProceso.deleteMany()
  await prisma.tipoPrenda.deleteMany()
  await prisma.procesoProductivo.deleteMany()
  await prisma.taller.deleteMany()
  await prisma.marca.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  const hashedPassword = await bcrypt.hash('password123', 10)

  // ============================================
  // USERS
  // ============================================
  const adminUser = await prisma.user.create({
    data: { email: 'admin@pdt.org.ar', password: hashedPassword, name: 'Administrador PDT', role: 'ADMIN', active: true },
  })

  const tallerUser1 = await prisma.user.create({
    data: { email: 'cortesur@pdt.org.ar', password: hashedPassword, name: 'Corte Sur SRL', role: 'TALLER', phone: '+5491112345678', active: true },
  })

  const tallerUser2 = await prisma.user.create({
    data: { email: 'coop8marzo@pdt.org.ar', password: hashedPassword, name: 'Coop. Costura 8 de Marzo', role: 'TALLER', phone: '+5491198765432', active: true },
  })

  const tallerUser3 = await prisma.user.create({
    data: { email: 'bluedenim@pdt.org.ar', password: hashedPassword, name: 'Lavandería BlueDenim', role: 'TALLER', active: true },
  })

  const marcaUser1 = await prisma.user.create({
    data: { email: 'urbano@pdt.org.ar', password: hashedPassword, name: 'Urbano Kids', role: 'MARCA', active: true },
  })

  const marcaUser2 = await prisma.user.create({
    data: { email: 'consciente@pdt.org.ar', password: hashedPassword, name: 'Marca Consciente', role: 'MARCA', active: true },
  })

  const estadoUser = await prisma.user.create({
    data: { email: 'estado@pdt.org.ar', password: hashedPassword, name: 'Inspector OIT', role: 'ESTADO', active: true },
  })

  // ============================================
  // PROCESOS PRODUCTIVOS
  // ============================================
  const procesos = await Promise.all([
    prisma.procesoProductivo.create({ data: { nombre: 'Corte', descripcion: 'Corte industrial de tela con cortadora vertical o CNC', maquinaria: ['Cortadora vertical', 'Mesa de corte', 'CNC'], tiempoEstimado500u: '2-3 días' } }),
    prisma.procesoProductivo.create({ data: { nombre: 'Confección', descripcion: 'Costura y armado de la prenda', maquinaria: ['Máquina recta', 'Overlock', 'Botonera', 'Ojaladora'], tiempoEstimado500u: '5-7 días' } }),
    prisma.procesoProductivo.create({ data: { nombre: 'Lavandería', descripcion: 'Lavado industrial', maquinaria: ['Lavadora industrial', 'Secadero', 'Centrífuga'], tiempoEstimado500u: '2-3 días' } }),
    prisma.procesoProductivo.create({ data: { nombre: 'Desgaste', descripcion: 'Efectos de desgaste/roturas en jeans', maquinaria: ['Lijadora', 'Cepillo industrial'], tiempoEstimado500u: '2-3 días' } }),
    prisma.procesoProductivo.create({ data: { nombre: 'Acabado', descripcion: 'Control final, etiquetado, embolsado', maquinaria: ['Mesa de revisión', 'Etiquetadora'], tiempoEstimado500u: '1-2 días' } }),
    prisma.procesoProductivo.create({ data: { nombre: 'Estampado', descripcion: 'Estampado serigráfico o digital', maquinaria: ['Mesa de serigrafía', 'Impresora textil'], tiempoEstimado500u: '2-3 días' } }),
    prisma.procesoProductivo.create({ data: { nombre: 'Bordado', descripcion: 'Bordado manual o industrial', maquinaria: ['Bordadora programable'], tiempoEstimado500u: '3-4 días' } }),
    prisma.procesoProductivo.create({ data: { nombre: 'Sublimado', descripcion: 'Estampado por calor para ropa deportiva', maquinaria: ['Plancha de sublimación', 'Impresora'], tiempoEstimado500u: '2-3 días' } }),
  ])

  // ============================================
  // TIPOS DE PRENDA
  // ============================================
  const prendas = await Promise.all([
    prisma.tipoPrenda.create({ data: { nombre: 'Jean/Vaquero', precioReferencia: 1700, variantes: ['Clásico', 'Roturas', 'Stone wash', 'Slim fit'] } }),
    prisma.tipoPrenda.create({ data: { nombre: 'Remera', precioReferencia: 900, variantes: ['Lisa', 'Estampada', 'Bordada', 'Cuello V'] } }),
    prisma.tipoPrenda.create({ data: { nombre: 'Camisa', precioReferencia: 1500, variantes: ['Manga corta', 'Manga larga', 'Formal'] } }),
    prisma.tipoPrenda.create({ data: { nombre: 'Pantalón', precioReferencia: 1600, variantes: ['Vestir', 'Casual', 'Deportivo'] } }),
    prisma.tipoPrenda.create({ data: { nombre: 'Buzo/Sweater', precioReferencia: 1800, variantes: ['Con capucha', 'Sin capucha', 'Cuello alto'] } }),
    prisma.tipoPrenda.create({ data: { nombre: 'Ropa Deportiva', precioReferencia: 1200, variantes: ['Remera técnica', 'Calza', 'Short', 'Conjunto'] } }),
  ])

  // ============================================
  // TALLERES
  // ============================================
  const taller1 = await prisma.taller.create({
    data: {
      userId: tallerUser1.id, nombre: 'Corte Sur SRL', cuit: '30-71234567-8', nivel: 'ORO', puntaje: 95, rating: 4.9,
      ubicacion: 'Avellaneda, AMBA', zona: 'Avellaneda (AMBA)', capacidadMensual: 10000, trabajadoresRegistrados: 12,
      fundado: 2015, verificadoAfip: true, pedidosCompletados: 47, ontimeRate: 96, retrabajoRate: 2,
    },
  })

  const taller2 = await prisma.taller.create({
    data: {
      userId: tallerUser2.id, nombre: 'Coop. Costura 8 de Marzo', cuit: '30-78912345-6', nivel: 'PLATA', puntaje: 78, rating: 4.6,
      ubicacion: 'La Matanza, AMBA', zona: 'La Matanza (AMBA)', capacidadMensual: 5000, trabajadoresRegistrados: 8,
      fundado: 2018, verificadoAfip: true, pedidosCompletados: 23, ontimeRate: 92, retrabajoRate: 3,
    },
  })

  const taller3 = await prisma.taller.create({
    data: {
      userId: tallerUser3.id, nombre: 'Lavandería BlueDenim', cuit: '30-81234567-4', nivel: 'ORO', puntaje: 91, rating: 4.8,
      ubicacion: 'San Martín, AMBA', zona: 'San Martín (AMBA)', capacidadMensual: 8000, trabajadoresRegistrados: 10,
      fundado: 2012, verificadoAfip: true, pedidosCompletados: 38, ontimeRate: 95, retrabajoRate: 1,
    },
  })

  // Taller-Proceso relations
  await prisma.tallerProceso.createMany({
    data: [
      { tallerId: taller1.id, procesoId: procesos[0].id, precio: 1700 },
      { tallerId: taller1.id, procesoId: procesos[1].id, precio: 1700 },
      { tallerId: taller2.id, procesoId: procesos[1].id, precio: 2050 },
      { tallerId: taller3.id, procesoId: procesos[2].id, precio: 1300 },
      { tallerId: taller3.id, procesoId: procesos[3].id, precio: 800 },
    ],
  })

  // Maquinaria
  await prisma.maquinaria.createMany({
    data: [
      { tallerId: taller1.id, nombre: 'Cortadora Eastman vertical', cantidad: 1 },
      { tallerId: taller1.id, nombre: 'Juki recta', cantidad: 5 },
      { tallerId: taller1.id, nombre: 'Overlock', cantidad: 3 },
      { tallerId: taller2.id, nombre: 'Recta', cantidad: 4 },
      { tallerId: taller2.id, nombre: 'Overlock', cantidad: 2 },
      { tallerId: taller3.id, nombre: 'Lavadora industrial 50kg', cantidad: 1 },
      { tallerId: taller3.id, nombre: 'Secadero industrial', cantidad: 2 },
    ],
  })

  // ============================================
  // MARCAS
  // ============================================
  const marca1 = await prisma.marca.create({
    data: {
      userId: marcaUser1.id, nombre: 'Urbano Kids', cuit: '30-91234567-5',
      ubicacion: 'Palermo, CABA', tipo: 'Pequeña', volumenMensual: 1500, rating: 4.8, pedidosRealizados: 12,
    },
  })

  await prisma.marca.create({
    data: {
      userId: marcaUser2.id, nombre: 'Marca Consciente', cuit: '30-82345678-9',
      ubicacion: 'Villa Crespo, CABA', tipo: 'Micro', volumenMensual: 500, rating: 4.9, pedidosRealizados: 8,
    },
  })

  // ============================================
  // TIPOS DE DOCUMENTO
  // ============================================
  const tiposDoc = await Promise.all([
    prisma.tipoDocumento.create({ data: { nombre: 'CUIT', descripcion: 'Clave Única de Identificación Tributaria', requerido: true } }),
    prisma.tipoDocumento.create({ data: { nombre: 'HABILITACION_MUNICIPAL', descripcion: 'Habilitación del municipio correspondiente', requerido: true } }),
    prisma.tipoDocumento.create({ data: { nombre: 'ART', descripcion: 'Aseguradora de Riesgos del Trabajo', requerido: true } }),
    prisma.tipoDocumento.create({ data: { nombre: 'EMPLEADOS_REGISTRADOS', descripcion: 'Nómina de empleados registrados', requerido: true } }),
    prisma.tipoDocumento.create({ data: { nombre: 'CERTIFICACION_INTI', descripcion: 'Certificación de calidad del INTI', requerido: false } }),
  ])
  const tipoDocMap: Record<string, string> = Object.fromEntries(tiposDoc.map(t => [t.nombre, t.id]))

  // ============================================
  // PEDIDO DE EJEMPLO
  // ============================================
  const pedido = await prisma.pedido.create({
    data: {
      omId: 'OM-2025-00045', marcaId: marca1.id,
      tipoPrenda: 'Jean/Vaquero', tipoPrendaId: prendas[0].id,
      cantidad: 500, fechaObjetivo: new Date('2025-07-30'),
      estado: 'EN_EJECUCION', progresoTotal: 60, montoTotal: 2006400,
    },
  })

  const orden = await prisma.ordenManufactura.create({
    data: {
      moId: 'MO-1', pedidoId: pedido.id, tallerId: taller1.id,
      proceso: 'Corte', procesoId: procesos[0].id,
      estado: 'EN_EJECUCION', progreso: 75, precio: 850000, plazoDias: 12, diasTranscurridos: 9, verificacionSst: true,
    },
  })

  // ============================================
  // VALIDACIONES (Formalización)
  // ============================================
  await prisma.validacion.createMany({
    data: [
      { tallerId: taller1.id, tipo: 'CUIT', tipoDocumentoId: tipoDocMap['CUIT'], estado: 'COMPLETADO', detalle: 'Verificado con ARCA - 30-71234567-8' },
      { tallerId: taller1.id, tipo: 'HABILITACION_MUNICIPAL', tipoDocumentoId: tipoDocMap['HABILITACION_MUNICIPAL'], estado: 'COMPLETADO', detalle: 'Certificado vigente' },
      { tallerId: taller1.id, tipo: 'ART', tipoDocumentoId: tipoDocMap['ART'], estado: 'COMPLETADO', detalle: 'ART vigente hasta 15/08/2026' },
      { tallerId: taller1.id, tipo: 'EMPLEADOS_REGISTRADOS', tipoDocumentoId: tipoDocMap['EMPLEADOS_REGISTRADOS'], estado: 'COMPLETADO', detalle: '12 empleados registrados' },
      { tallerId: taller2.id, tipo: 'CUIT', tipoDocumentoId: tipoDocMap['CUIT'], estado: 'COMPLETADO', detalle: 'Verificado con ARCA' },
      { tallerId: taller2.id, tipo: 'HABILITACION_MUNICIPAL', tipoDocumentoId: tipoDocMap['HABILITACION_MUNICIPAL'], estado: 'PENDIENTE' },
      { tallerId: taller2.id, tipo: 'ART', tipoDocumentoId: tipoDocMap['ART'], estado: 'COMPLETADO', detalle: 'ART vigente' },
    ],
  })

  // ============================================
  // COLECCIONES (Academia)
  // ============================================
  const col1 = await prisma.coleccion.create({
    data: {
      titulo: 'Seguridad e Higiene en el Taller',
      descripcion: 'Fundamentos de seguridad laboral para talleres textiles.',
      categoria: 'Seguridad', duracion: '2h 30min', institucion: 'OIT Argentina', orden: 1,
    },
  })

  await prisma.video.createMany({
    data: [
      { coleccionId: col1.id, titulo: 'Introducción a SST', youtubeUrl: 'https://youtube.com/watch?v=example1', duracion: '15:00', orden: 1 },
      { coleccionId: col1.id, titulo: 'Equipos de protección personal', youtubeUrl: 'https://youtube.com/watch?v=example2', duracion: '20:00', orden: 2 },
      { coleccionId: col1.id, titulo: 'Prevención de incendios', youtubeUrl: 'https://youtube.com/watch?v=example3', duracion: '18:00', orden: 3 },
    ],
  })

  await prisma.evaluacion.create({
    data: {
      coleccionId: col1.id,
      preguntas: [
        { pregunta: '¿Cuál es el elemento más importante de SST?', opciones: ['Extintor', 'Prevención', 'Señalización', 'Capacitación'], correcta: 1 },
        { pregunta: '¿Cada cuánto se debe renovar la ART?', opciones: ['Mensualmente', 'Anualmente', 'Cada 2 años', 'Nunca'], correcta: 1 },
      ],
      puntajeMinimo: 60,
    },
  })

  console.log('Seed completed successfully!')
  console.log(`Created: ${await prisma.user.count()} users, ${await prisma.taller.count()} talleres, ${await prisma.marca.count()} marcas`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
