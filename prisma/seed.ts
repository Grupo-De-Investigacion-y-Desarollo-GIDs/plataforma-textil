import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ============================================
  // LIMPIEZA (orden inverso a dependencias)
  // ============================================
  await prisma.intentoEvaluacion.deleteMany()
  await prisma.escrowHito.deleteMany()
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
  await prisma.configuracionSistema.deleteMany()
  await prisma.taller.deleteMany()
  await prisma.marca.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  const hash = await bcrypt.hash('pdt2026', 10)

  // ============================================
  // USUARIOS
  // ============================================
  const admin = await prisma.user.create({
    data: { email: 'lucia.fernandez@pdt.org.ar', password: hash, name: 'Lucía Fernández', role: 'ADMIN', phone: '+5491150001001', active: true },
  })

  const userBronce = await prisma.user.create({
    data: { email: 'roberto.gimenez@pdt.org.ar', password: hash, name: 'Roberto Giménez', role: 'TALLER', phone: '+5491143567890', active: true },
  })

  const userPlata = await prisma.user.create({
    data: { email: 'graciela.sosa@pdt.org.ar', password: hash, name: 'Graciela Sosa', role: 'TALLER', phone: '+5491154321098', active: true },
  })

  const userOro = await prisma.user.create({
    data: { email: 'carlos.mendoza@pdt.org.ar', password: hash, name: 'Carlos Mendoza', role: 'TALLER', phone: '+5491167890123', active: true },
  })

  const userMarcaChica = await prisma.user.create({
    data: { email: 'valentina.ramos@pdt.org.ar', password: hash, name: 'Valentina Ramos', role: 'MARCA', phone: '+5491178901234', active: true },
  })

  const userMarcaMediana = await prisma.user.create({
    data: { email: 'martin.echevarria@pdt.org.ar', password: hash, name: 'Martín Echevarría', role: 'MARCA', phone: '+5491189012345', active: true },
  })

  await prisma.user.create({
    data: { email: 'anabelen.torres@pdt.org.ar', password: hash, name: 'Ana Belén Torres', role: 'ESTADO', phone: '+5491190123456', active: true },
  })

  await prisma.user.create({
    data: { email: 'sofia.martinez@pdt.org.ar', password: hash, name: 'Sofía Martínez', role: 'CONTENIDO', phone: '+5491101234567', active: true },
  })

  console.log('  ✓ 8 usuarios creados (incl. CONTENIDO)')

  // ============================================
  // PROCESOS PRODUCTIVOS (5)
  // ============================================
  const [pCorte, pConfeccion, pLavanderia, pEstampado, pAcabado] = await Promise.all([
    prisma.procesoProductivo.create({
      data: { nombre: 'Corte', descripcion: 'Corte industrial de tela con cortadora vertical, circular o CNC. Incluye tizado y tendido.', maquinaria: ['Cortadora vertical', 'Cortadora circular', 'Mesa de corte', 'CNC'], tiempoEstimado500u: '2-3 días' },
    }),
    prisma.procesoProductivo.create({
      data: { nombre: 'Confección', descripcion: 'Costura y armado completo de la prenda. Incluye unión de piezas, cierres, botones y ojales.', maquinaria: ['Máquina recta industrial', 'Overlock 5 hilos', 'Collaretera', 'Botonera', 'Ojaladora'], tiempoEstimado500u: '5-7 días' },
    }),
    prisma.procesoProductivo.create({
      data: { nombre: 'Lavandería industrial', descripcion: 'Lavado, suavizado y tratamientos especiales (stone wash, enzyme wash, blanqueo). Para jeans y prendas teñidas.', maquinaria: ['Lavadora industrial 50kg', 'Centrífuga', 'Secadero rotativo', 'Caldera'], tiempoEstimado500u: '2-3 días' },
    }),
    prisma.procesoProductivo.create({
      data: { nombre: 'Estampado', descripcion: 'Aplicación de diseños sobre tela mediante serigrafía, sublimación o DTF (Direct to Film).', maquinaria: ['Pulpo serigráfico 6 colores', 'Plancha de sublimación', 'Impresora DTF'], tiempoEstimado500u: '2-4 días' },
    }),
    prisma.procesoProductivo.create({
      data: { nombre: 'Acabado y control de calidad', descripcion: 'Revisión final, planchado, etiquetado, doblado y embolsado. Control de medidas y defectos.', maquinaria: ['Mesa de revisión', 'Plancha industrial', 'Etiquetadora', 'Detector de agujas'], tiempoEstimado500u: '1-2 días' },
    }),
  ])

  console.log('  ✓ 5 procesos productivos')

  // ============================================
  // TIPOS DE PRENDA (5)
  // ============================================
  const [prJean, prRemera, prCamisa, prPantalon, prBuzo] = await Promise.all([
    prisma.tipoPrenda.create({ data: { nombre: 'Jean/Vaquero', precioReferencia: 1700, variantes: ['Clásico', 'Slim fit', 'Roturas', 'Mom jean'] } }),
    prisma.tipoPrenda.create({ data: { nombre: 'Remera', precioReferencia: 900, variantes: ['Lisa', 'Estampada', 'Oversize', 'Cuello V'] } }),
    prisma.tipoPrenda.create({ data: { nombre: 'Camisa', precioReferencia: 1500, variantes: ['Manga corta', 'Manga larga', 'Leñadora'] } }),
    prisma.tipoPrenda.create({ data: { nombre: 'Pantalón de vestir', precioReferencia: 1600, variantes: ['Pinzado', 'Recto', 'Chino'] } }),
    prisma.tipoPrenda.create({ data: { nombre: 'Buzo/Hoodie', precioReferencia: 1800, variantes: ['Con capucha', 'Canguro', 'Crop', 'Oversize'] } }),
  ])

  console.log('  ✓ 5 tipos de prenda')

  // ============================================
  // TIPOS DE DOCUMENTO (7)
  // ============================================
  const tiposDocData = [
    {
      nombre: 'CUIT/Monotributo',
      label: 'Registrate en ARCA',
      descripcion: 'Inscripción en ARCA (ex-AFIP) como Monotributista o Responsable Inscripto',
      enlaceTramite: 'https://www.afip.gob.ar',
      costoEstimado: 'Gratuito',
      nivelMinimo: 'PLATA' as const,
      requerido: true,
      orden: 1,
    },
    {
      nombre: 'Habilitación municipal',
      label: 'Habilita tu local',
      descripcion: 'Permiso de funcionamiento del municipio correspondiente',
      enlaceTramite: null,
      costoEstimado: 'Variable según municipio',
      nivelMinimo: 'PLATA' as const,
      requerido: true,
      orden: 2,
    },
    {
      nombre: 'ART',
      label: 'Asegura a tu equipo',
      descripcion: 'Póliza de Aseguradora de Riesgos del Trabajo vigente',
      enlaceTramite: null,
      costoEstimado: 'Variable según aseguradora',
      nivelMinimo: 'PLATA' as const,
      requerido: true,
      orden: 3,
    },
    {
      nombre: 'Empleados registrados',
      label: 'Registra tus empleados',
      descripcion: 'Constancia de alta temprana de empleados en ARCA',
      enlaceTramite: 'https://www.afip.gob.ar',
      costoEstimado: 'Gratuito',
      nivelMinimo: 'ORO' as const,
      requerido: true,
      orden: 4,
    },
    {
      nombre: 'Habilitación bomberos',
      label: 'Habilitación de bomberos',
      descripcion: 'Certificado de prevención contra incendios',
      enlaceTramite: null,
      costoEstimado: 'Variable',
      nivelMinimo: 'ORO' as const,
      requerido: true,
      orden: 5,
    },
    {
      nombre: 'Plan de seguridad e higiene',
      label: 'Plan de seguridad',
      descripcion: 'Plan firmado por profesional de SyH matriculado',
      enlaceTramite: null,
      costoEstimado: 'Variable según profesional',
      nivelMinimo: 'ORO' as const,
      requerido: true,
      orden: 6,
    },
    {
      nombre: 'Nómina digital',
      label: 'Libro de sueldos digital',
      descripcion: 'Libro de sueldos digital (LSD) o recibos digitales',
      enlaceTramite: null,
      costoEstimado: 'Gratuito',
      nivelMinimo: 'ORO' as const,
      requerido: true,
      orden: 7,
    },
  ]

  const tiposDoc = await Promise.all(
    tiposDocData.map(td =>
      prisma.tipoDocumento.upsert({
        where: { nombre: td.nombre },
        update: td,
        create: td,
      })
    )
  )
  const tdMap: Record<string, string> = {}
  tiposDoc.forEach(t => { tdMap[t.nombre] = t.id })

  console.log('  ✓ 7 tipos de documento')

  // ============================================
  // TALLER BRONCE — "Taller La Aguja" (Florencio Varela)
  // Perfil ~40%: datos básicos, sin wizard, pocas validaciones
  // ============================================
  const tallerBronce = await prisma.taller.create({
    data: {
      userId: userBronce.id,
      nombre: 'Taller La Aguja',
      cuit: '20-28345672-9',
      nivel: 'BRONCE',
      puntaje: 15,
      rating: 3.2,
      ubicacion: 'Florencio Varela, Buenos Aires',
      zona: 'Florencio Varela',
      descripcion: 'Taller familiar de confección básica. Trabajamos con marcas chicas del sur del conurbano.',
      capacidadMensual: 800,
      trabajadoresRegistrados: 3,
      fundado: 2021,
      verificadoAfip: true,
      pedidosCompletados: 4,
      ontimeRate: 75,
      retrabajoRate: 8,
      portfolioFotos: [
        '/images/portfolio/taller-aguja-1.svg',
        '/images/portfolio/taller-aguja-2.svg',
      ],
    },
  })

  // Bronce: solo 1 proceso, 1 prenda, poca maquinaria
  await prisma.tallerProceso.create({ data: { tallerId: tallerBronce.id, procesoId: pConfeccion.id, precio: 650 } })
  await prisma.tallerPrenda.create({ data: { tallerId: tallerBronce.id, prendaId: prRemera.id } })
  await prisma.maquinaria.createMany({
    data: [
      { tallerId: tallerBronce.id, nombre: 'Recta industrial Juki', cantidad: 2, tipo: 'Costura' },
      { tallerId: tallerBronce.id, nombre: 'Overlock 3 hilos', cantidad: 1, tipo: 'Costura' },
    ],
  })

  // Bronce: solo CUIT completado
  await prisma.validacion.createMany({
    data: [
      { tallerId: tallerBronce.id, tipo: 'CUIT/Monotributo', tipoDocumentoId: tdMap['CUIT/Monotributo'], estado: 'COMPLETADO', detalle: 'Monotributo categoría D verificado' },
      { tallerId: tallerBronce.id, tipo: 'Habilitación municipal', tipoDocumentoId: tdMap['Habilitación municipal'], estado: 'NO_INICIADO' },
      { tallerId: tallerBronce.id, tipo: 'ART', tipoDocumentoId: tdMap['ART'], estado: 'NO_INICIADO' },
      { tallerId: tallerBronce.id, tipo: 'Empleados registrados', tipoDocumentoId: tdMap['Empleados registrados'], estado: 'NO_INICIADO' },
    ],
  })

  console.log('  ✓ Taller BRONCE: Taller La Aguja (Florencio Varela)')

  // ============================================
  // TALLER PLATA — "Cooperativa Hilos del Sur" (La Matanza)
  // Perfil ~75%: wizard completo, maquinaria, 1 certificado
  // ============================================
  const tallerPlata = await prisma.taller.create({
    data: {
      userId: userPlata.id,
      nombre: 'Cooperativa Hilos del Sur',
      cuit: '30-71589234-6',
      nivel: 'PLATA',
      puntaje: 58,
      rating: 4.4,
      ubicacion: 'González Catán, La Matanza',
      zona: 'La Matanza',
      descripcion: 'Cooperativa de trabajo textil formada por 6 costureras. Especialidad en confección de jeans y pantalones. Participamos del programa Marca Registrada.',
      capacidadMensual: 3000,
      trabajadoresRegistrados: 6,
      fundado: 2018,
      verificadoAfip: true,
      pedidosCompletados: 18,
      ontimeRate: 88,
      retrabajoRate: 4,
      portfolioFotos: [
        '/images/portfolio/taller-hilos-1.svg',
        '/images/portfolio/taller-hilos-2.svg',
        '/images/portfolio/taller-hilos-3.svg',
      ],
      // Wizard completo
      sam: 18,
      prendaPrincipal: 'Jean/Vaquero',
      organizacion: 'linea',
      metrosCuadrados: 120,
      areas: ['Corte', 'Costura', 'Planchado', 'Depósito'],
      experienciaPromedio: 'media',
      polivalencia: 'parcial',
      horario: '8',
      registroProduccion: 'planilla_papel',
      escalabilidad: 'limitada',
      paradasFrecuencia: 'ocasional',
    },
  })

  // Plata: 2 procesos, 3 prendas
  await prisma.tallerProceso.createMany({
    data: [
      { tallerId: tallerPlata.id, procesoId: pConfeccion.id, precio: 750 },
      { tallerId: tallerPlata.id, procesoId: pAcabado.id, precio: 300 },
    ],
  })
  await prisma.tallerPrenda.createMany({
    data: [
      { tallerId: tallerPlata.id, prendaId: prJean.id },
      { tallerId: tallerPlata.id, prendaId: prRemera.id },
      { tallerId: tallerPlata.id, prendaId: prPantalon.id },
    ],
  })
  await prisma.maquinaria.createMany({
    data: [
      { tallerId: tallerPlata.id, nombre: 'Recta industrial Brother', cantidad: 4, tipo: 'Costura' },
      { tallerId: tallerPlata.id, nombre: 'Overlock 5 hilos Siruba', cantidad: 2, tipo: 'Costura' },
      { tallerId: tallerPlata.id, nombre: 'Botonera Juki', cantidad: 1, tipo: 'Costura' },
    ],
  })

  // Plata: 3 validaciones completadas, 1 pendiente
  await prisma.validacion.createMany({
    data: [
      { tallerId: tallerPlata.id, tipo: 'CUIT/Monotributo', tipoDocumentoId: tdMap['CUIT/Monotributo'], estado: 'COMPLETADO', detalle: 'Cooperativa inscripta en INAES y AFIP' },
      { tallerId: tallerPlata.id, tipo: 'ART', tipoDocumentoId: tdMap['ART'], estado: 'COMPLETADO', detalle: 'Póliza Experta ART vigente hasta 03/2027', fechaVencimiento: new Date('2027-03-15') },
      { tallerId: tallerPlata.id, tipo: 'Habilitación municipal', tipoDocumentoId: tdMap['Habilitación municipal'], estado: 'COMPLETADO', detalle: 'Habilitación La Matanza expediente 2024-0892' },
      { tallerId: tallerPlata.id, tipo: 'Empleados registrados', tipoDocumentoId: tdMap['Empleados registrados'], estado: 'PENDIENTE', detalle: 'En trámite — alta temprana de 2 nuevas asociadas' },
      { tallerId: tallerPlata.id, tipo: 'Habilitación bomberos', tipoDocumentoId: tdMap['Habilitación bomberos'], estado: 'NO_INICIADO' },
      { tallerId: tallerPlata.id, tipo: 'Plan de seguridad e higiene', tipoDocumentoId: tdMap['Plan de seguridad e higiene'], estado: 'NO_INICIADO' },
    ],
  })

  console.log('  ✓ Taller PLATA: Cooperativa Hilos del Sur (La Matanza)')

  // ============================================
  // TALLER ORO — "Corte Sur SRL" (Avellaneda)
  // Perfil 100%: todo completo, 3 certificados
  // ============================================
  const tallerOro = await prisma.taller.create({
    data: {
      userId: userOro.id,
      nombre: 'Corte Sur SRL',
      cuit: '30-71234567-8',
      nivel: 'ORO',
      puntaje: 92,
      rating: 4.9,
      ubicacion: 'Av. Mitre 1847, Avellaneda, Buenos Aires',
      zona: 'Avellaneda',
      descripcion: 'Taller de corte y confección con 12 años de trayectoria. Proveedor habitual de marcas nacionales. Certificados en SST y calidad. Capacidad para lotes grandes.',
      capacidadMensual: 10000,
      trabajadoresRegistrados: 14,
      fundado: 2012,
      verificadoAfip: true,
      pedidosCompletados: 47,
      ontimeRate: 96,
      retrabajoRate: 2,
      portfolioFotos: [
        '/images/portfolio/taller-cortesur-1.svg',
        '/images/portfolio/taller-cortesur-2.svg',
        '/images/portfolio/taller-cortesur-3.svg',
        '/images/portfolio/taller-cortesur-4.svg',
      ],
      // Wizard completo
      sam: 12,
      prendaPrincipal: 'Jean/Vaquero',
      organizacion: 'modular',
      metrosCuadrados: 280,
      areas: ['Tizado', 'Corte', 'Costura', 'Acabado', 'Control de calidad', 'Depósito', 'Oficina'],
      experienciaPromedio: 'alta',
      polivalencia: 'total',
      horario: '9',
      registroProduccion: 'planilla_digital',
      escalabilidad: 'alta',
      paradasFrecuencia: 'rara_vez',
    },
  })

  // Oro: 4 procesos, 5 prendas
  await prisma.tallerProceso.createMany({
    data: [
      { tallerId: tallerOro.id, procesoId: pCorte.id, precio: 450 },
      { tallerId: tallerOro.id, procesoId: pConfeccion.id, precio: 850 },
      { tallerId: tallerOro.id, procesoId: pAcabado.id, precio: 280 },
      { tallerId: tallerOro.id, procesoId: pEstampado.id, precio: 320 },
    ],
  })
  await prisma.tallerPrenda.createMany({
    data: [
      { tallerId: tallerOro.id, prendaId: prJean.id },
      { tallerId: tallerOro.id, prendaId: prRemera.id },
      { tallerId: tallerOro.id, prendaId: prCamisa.id },
      { tallerId: tallerOro.id, prendaId: prPantalon.id },
      { tallerId: tallerOro.id, prendaId: prBuzo.id },
    ],
  })
  await prisma.maquinaria.createMany({
    data: [
      { tallerId: tallerOro.id, nombre: 'Cortadora vertical Eastman', cantidad: 2, tipo: 'Corte' },
      { tallerId: tallerOro.id, nombre: 'Recta industrial Juki DDL-8700', cantidad: 6, tipo: 'Costura' },
      { tallerId: tallerOro.id, nombre: 'Overlock 5 hilos Pegasus', cantidad: 3, tipo: 'Costura' },
      { tallerId: tallerOro.id, nombre: 'Botonera Brother', cantidad: 2, tipo: 'Costura' },
      { tallerId: tallerOro.id, nombre: 'Ojaladora Juki', cantidad: 1, tipo: 'Costura' },
    ],
  })

  // Oro: todas las validaciones completadas
  await prisma.validacion.createMany({
    data: [
      { tallerId: tallerOro.id, tipo: 'CUIT/Monotributo', tipoDocumentoId: tdMap['CUIT/Monotributo'], estado: 'COMPLETADO', detalle: 'SRL inscripta — Responsable inscripto IVA' },
      { tallerId: tallerOro.id, tipo: 'Habilitación municipal', tipoDocumentoId: tdMap['Habilitación municipal'], estado: 'COMPLETADO', detalle: 'Habilitación Avellaneda exp. 2023-4521', fechaVencimiento: new Date('2027-06-30') },
      { tallerId: tallerOro.id, tipo: 'ART', tipoDocumentoId: tdMap['ART'], estado: 'COMPLETADO', detalle: 'Galeno ART — póliza vigente', fechaVencimiento: new Date('2027-01-15') },
      { tallerId: tallerOro.id, tipo: 'Empleados registrados', tipoDocumentoId: tdMap['Empleados registrados'], estado: 'COMPLETADO', detalle: '14 empleados en libro — alta temprana al día' },
      { tallerId: tallerOro.id, tipo: 'Habilitación bomberos', tipoDocumentoId: tdMap['Habilitación bomberos'], estado: 'COMPLETADO', detalle: 'Inspección aprobada 10/2025' },
      { tallerId: tallerOro.id, tipo: 'Plan de seguridad e higiene', tipoDocumentoId: tdMap['Plan de seguridad e higiene'], estado: 'COMPLETADO', detalle: 'Plan firmado por Ing. Martínez (mat. 4521)' },
      { tallerId: tallerOro.id, tipo: 'Nómina digital', tipoDocumentoId: tdMap['Nómina digital'], estado: 'COMPLETADO', detalle: 'Libro de sueldos digital activo' },
    ],
  })

  // Oro: certificación externa
  await prisma.tallerCertificacion.create({
    data: { tallerId: tallerOro.id, nombre: 'Certificación INTI Calidad Textil', vencimiento: new Date('2027-12-01'), activa: true },
  })

  console.log('  ✓ Taller ORO: Corte Sur SRL (Avellaneda)')

  // Post-seed: garantizar que cada taller tenga las 7 validaciones.
  for (const taller of [tallerBronce, tallerPlata, tallerOro]) {
    const existentes = await prisma.validacion.findMany({
      where: { tallerId: taller.id },
      select: { tipo: true },
    })
    const nombresExistentes = new Set(existentes.map(v => v.tipo))
    const faltantes = tiposDoc.filter(td => !nombresExistentes.has(td.nombre))

    if (faltantes.length > 0) {
      await prisma.validacion.createMany({
        data: faltantes.map(td => ({
          tallerId: taller.id,
          tipo: td.nombre,
          tipoDocumentoId: td.id,
          estado: 'NO_INICIADO' as const,
        })),
      })
    }
  }

  console.log('  ✓ Post-seed: cada taller tiene 7 validaciones')

  // ============================================
  // MARCAS
  // ============================================
  const marcaChica = await prisma.marca.create({
    data: {
      userId: userMarcaChica.id,
      nombre: 'Amapola Indumentaria',
      cuit: '27-32456789-1',
      ubicacion: 'Palermo, CABA',
      tipo: 'Diseño independiente',
      volumenMensual: 300,
      rating: 0,
      pedidosRealizados: 0,
    },
  })

  const marcaMediana = await prisma.marca.create({
    data: {
      userId: userMarcaMediana.id,
      nombre: 'Urbano Textil',
      cuit: '30-71890234-5',
      ubicacion: 'Villa Crespo, CABA',
      tipo: 'Marca comercial',
      website: 'https://urbanotextil.com.ar',
      volumenMensual: 3000,
      frecuenciaCompra: 'mensual',
      rating: 4.6,
      pedidosRealizados: 15,
    },
  })

  console.log('  ✓ 2 marcas creadas')

  // ============================================
  // PEDIDOS
  // ============================================

  // Marca chica: 1 pedido en borrador
  await prisma.pedido.create({
    data: {
      omId: 'OM-2026-00089',
      marcaId: marcaChica.id,
      tipoPrenda: 'Remera',
      tipoPrendaId: prRemera.id,
      cantidad: 500,
      estado: 'BORRADOR',
      montoTotal: 450000,
    },
  })

  // Marca mediana: pedido activo con orden asignada a Corte Sur
  const pedidoActivo = await prisma.pedido.create({
    data: {
      omId: 'OM-2026-00072',
      marcaId: marcaMediana.id,
      tipoPrenda: 'Jean/Vaquero',
      tipoPrendaId: prJean.id,
      cantidad: 1000,
      fechaObjetivo: new Date('2026-05-30'),
      estado: 'EN_EJECUCION',
      progresoTotal: 60,
      montoTotal: 1700000,
    },
  })

  await prisma.ordenManufactura.create({
    data: {
      moId: 'MO-2026-00072-01',
      pedidoId: pedidoActivo.id,
      tallerId: tallerOro.id,
      proceso: 'Corte',
      procesoId: pCorte.id,
      estado: 'EN_EJECUCION',
      progreso: 75,
      precio: 450000,
      plazoDias: 12,
      diasTranscurridos: 9,
      verificacionSst: true,
    },
  })

  await prisma.ordenManufactura.create({
    data: {
      moId: 'MO-2026-00072-02',
      pedidoId: pedidoActivo.id,
      tallerId: tallerPlata.id,
      proceso: 'Confección',
      procesoId: pConfeccion.id,
      estado: 'PENDIENTE',
      progreso: 0,
      precio: 750000,
      plazoDias: 20,
      diasTranscurridos: 0,
      verificacionSst: true,
    },
  })

  // Marca mediana: pedido completado
  const pedidoCompletado = await prisma.pedido.create({
    data: {
      omId: 'OM-2026-00058',
      marcaId: marcaMediana.id,
      tipoPrenda: 'Remera',
      tipoPrendaId: prRemera.id,
      cantidad: 800,
      fechaObjetivo: new Date('2026-02-15'),
      estado: 'COMPLETADO',
      progresoTotal: 100,
      montoTotal: 720000,
    },
  })

  await prisma.ordenManufactura.create({
    data: {
      moId: 'MO-2026-00058-01',
      pedidoId: pedidoCompletado.id,
      tallerId: tallerOro.id,
      proceso: 'Confección',
      procesoId: pConfeccion.id,
      estado: 'COMPLETADO',
      progreso: 100,
      precio: 680000,
      plazoDias: 15,
      diasTranscurridos: 14,
      verificacionSst: true,
    },
  })

  console.log('  ✓ 3 pedidos + 3 órdenes de manufactura')

  // ============================================
  // COLECCIONES DE CAPACITACIÓN (3)
  // ============================================

  // Colección 1: Seguridad e Higiene
  const col1 = await prisma.coleccion.create({
    data: {
      titulo: 'Seguridad e Higiene en el Taller Textil',
      descripcion: 'Fundamentos de seguridad laboral para talleres textiles. Cubre normativa vigente, uso de EPP, prevención de incendios y ergonomía en el puesto de trabajo.',
      categoria: 'Seguridad',
      duracion: '2h 30min',
      institucion: 'OIT Argentina',
      orden: 1,
      procesosTarget: [],
      formalizacionTarget: ['Habilitación bomberos', 'Plan de seguridad e higiene', 'Empleados registrados'],
    },
  })

  await prisma.video.createMany({
    data: [
      { coleccionId: col1.id, titulo: 'Introducción a la SST en la industria textil', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duracion: '15:00', orden: 1 },
      { coleccionId: col1.id, titulo: 'Equipos de protección personal para costureras', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duracion: '20:00', orden: 2 },
      { coleccionId: col1.id, titulo: 'Prevención de incendios y plan de evacuación', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duracion: '18:00', orden: 3 },
    ],
  })

  await prisma.evaluacion.create({
    data: {
      coleccionId: col1.id,
      preguntas: [
        { pregunta: '¿Cuál es la primera medida de seguridad al detectar un principio de incendio?', opciones: ['Usar el extintor', 'Evacuar y dar aviso', 'Llamar a bomberos', 'Apagar las máquinas'], correcta: 1 },
        { pregunta: '¿Cada cuánto debe renovarse la póliza de ART?', opciones: ['Cada 6 meses', 'Anualmente', 'Cada 2 años', 'No se renueva'], correcta: 1 },
        { pregunta: '¿Qué EPP es obligatorio para operarios de corte?', opciones: ['Casco', 'Guante de malla metálica', 'Barbijo', 'Lentes de sol'], correcta: 1 },
      ],
      puntajeMinimo: 60,
    },
  })

  // Colección 2: Cálculo de Costos
  const col2 = await prisma.coleccion.create({
    data: {
      titulo: 'Cálculo de Costos y Presupuestos',
      descripcion: 'Aprende a calcular el costo real de producción de una prenda, elaborar presupuestos para marcas y definir márgenes de ganancia sostenibles.',
      categoria: 'Gestión',
      duracion: '3h',
      institucion: 'INTI Textiles',
      orden: 2,
      procesosTarget: [pConfeccion.id, pCorte.id],
      formalizacionTarget: ['Nómina digital'],
    },
  })

  await prisma.video.createMany({
    data: [
      { coleccionId: col2.id, titulo: 'Estructura de costos en confección textil', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duracion: '22:00', orden: 1 },
      { coleccionId: col2.id, titulo: 'Cálculo de SAM y minuto productivo', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duracion: '25:00', orden: 2 },
      { coleccionId: col2.id, titulo: 'Cómo armar un presupuesto para marcas', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duracion: '18:00', orden: 3 },
      { coleccionId: col2.id, titulo: 'Márgenes de ganancia y punto de equilibrio', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duracion: '20:00', orden: 4 },
    ],
  })

  await prisma.evaluacion.create({
    data: {
      coleccionId: col2.id,
      preguntas: [
        { pregunta: '¿Qué significa SAM en la industria textil?', opciones: ['Sistema de Alta Manufactura', 'Standard Allowed Minutes', 'Servicio de Asistencia Mecánica', 'Seguro de Actividad Manufacturera'], correcta: 1 },
        { pregunta: '¿Qué componente NO forma parte del costo directo de una prenda?', opciones: ['Tela', 'Mano de obra', 'Alquiler del local', 'Avíos (botones, cierres)'], correcta: 2 },
        { pregunta: '¿Cómo se calcula la capacidad mensual de un taller?', opciones: ['Cantidad de máquinas x 100', '(Horas x 60 / SAM) x eficiencia x máquinas x 22', 'Metros cuadrados x 10', 'Empleados x 500'], correcta: 1 },
      ],
      puntajeMinimo: 60,
    },
  })

  // Colección 3: Formalización
  const col3 = await prisma.coleccion.create({
    data: {
      titulo: 'Formalización y Registro del Taller',
      descripcion: 'Guía práctica para formalizar tu taller textil. Inscripción en AFIP, monotributo, ART, habilitaciones municipales y beneficios de estar en regla.',
      categoria: 'Formalización',
      duracion: '1h 45min',
      institucion: 'UNTREF',
      orden: 3,
      procesosTarget: [],
      formalizacionTarget: ['CUIT/Monotributo', 'Habilitación municipal', 'ART'],
    },
  })

  await prisma.video.createMany({
    data: [
      { coleccionId: col3.id, titulo: 'Por qué formalizar tu taller', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duracion: '12:00', orden: 1 },
      { coleccionId: col3.id, titulo: 'Monotributo, ART y habilitaciones paso a paso', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duracion: '20:00', orden: 2 },
      { coleccionId: col3.id, titulo: 'Beneficios del registro en la plataforma PDT', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duracion: '15:00', orden: 3 },
    ],
  })

  await prisma.evaluacion.create({
    data: {
      coleccionId: col3.id,
      preguntas: [
        { pregunta: '¿Qué documento necesitás para inscribirte como monotributista?', opciones: ['Pasaporte', 'CUIL y clave fiscal nivel 3', 'Título universitario', 'Certificado de domicilio'], correcta: 1 },
        { pregunta: '¿Qué es la ART?', opciones: ['Asociación de Registros Textiles', 'Aseguradora de Riesgos del Trabajo', 'Autoridad Regulatoria Tributaria', 'Agencia de Recaudación Textil'], correcta: 1 },
        { pregunta: '¿Cuál es el principal beneficio de formalizar un taller?', opciones: ['Pagar más impuestos', 'Acceso a marcas, crédito y protección legal', 'Tener más empleados', 'Comprar máquinas importadas'], correcta: 1 },
      ],
      puntajeMinimo: 60,
    },
  })

  console.log('  ✓ 3 colecciones con 10 videos y 3 evaluaciones')

  // ============================================
  // PROGRESO + CERTIFICADOS
  // ============================================

  // Plata: completó colección 1 (SST), tiene certificado
  await prisma.progresoCapacitacion.create({
    data: { tallerId: tallerPlata.id, coleccionId: col1.id, porcentajeCompletado: 100, videosVistos: 3 },
  })
  await prisma.certificado.create({
    data: { tallerId: tallerPlata.id, coleccionId: col1.id, codigo: 'PDT-CERT-2026-000041', calificacion: 80 },
  })

  // Plata: empezó colección 2 (50%)
  await prisma.progresoCapacitacion.create({
    data: { tallerId: tallerPlata.id, coleccionId: col2.id, porcentajeCompletado: 50, videosVistos: 2 },
  })

  // Oro: completó las 3 colecciones, tiene 3 certificados
  await prisma.progresoCapacitacion.createMany({
    data: [
      { tallerId: tallerOro.id, coleccionId: col1.id, porcentajeCompletado: 100, videosVistos: 3 },
      { tallerId: tallerOro.id, coleccionId: col2.id, porcentajeCompletado: 100, videosVistos: 4 },
      { tallerId: tallerOro.id, coleccionId: col3.id, porcentajeCompletado: 100, videosVistos: 3 },
    ],
  })
  await prisma.certificado.createMany({
    data: [
      { tallerId: tallerOro.id, coleccionId: col1.id, codigo: 'PDT-CERT-2026-000012', calificacion: 100 },
      { tallerId: tallerOro.id, coleccionId: col2.id, codigo: 'PDT-CERT-2026-000013', calificacion: 90 },
      { tallerId: tallerOro.id, coleccionId: col3.id, codigo: 'PDT-CERT-2026-000014', calificacion: 95 },
    ],
  })

  console.log('  ✓ Progreso y certificados (1 PLATA, 3 ORO)')

  // ============================================
  // LOGS DE ACTIVIDAD
  // ============================================
  await prisma.logActividad.createMany({
    data: [
      { userId: userBronce.id, accion: 'AUTH_REGISTRO', detalles: { role: 'TALLER', nombre: 'Taller La Aguja' } },
      { userId: userPlata.id, accion: 'AUTH_REGISTRO', detalles: { role: 'TALLER', nombre: 'Cooperativa Hilos del Sur' } },
      { userId: userOro.id, accion: 'AUTH_REGISTRO', detalles: { role: 'TALLER', nombre: 'Corte Sur SRL' } },
      { userId: userMarcaChica.id, accion: 'AUTH_REGISTRO', detalles: { role: 'MARCA', nombre: 'Amapola Indumentaria' } },
      { userId: userMarcaMediana.id, accion: 'AUTH_REGISTRO', detalles: { role: 'MARCA', nombre: 'Urbano Textil' } },
      { userId: admin.id, accion: 'VALIDACION_APROBADA', detalles: { taller: 'Corte Sur SRL', tipo: 'CUIT/Monotributo' } },
      { userId: admin.id, accion: 'VALIDACION_APROBADA', detalles: { taller: 'Corte Sur SRL', tipo: 'ART' } },
      { userId: admin.id, accion: 'CERTIFICADO_EMITIDO', detalles: { taller: 'Corte Sur SRL', codigo: 'PDT-CERT-2026-000012' } },
      { userId: admin.id, accion: 'CERTIFICADO_EMITIDO', detalles: { taller: 'Cooperativa Hilos del Sur', codigo: 'PDT-CERT-2026-000041' } },
      { userId: userMarcaMediana.id, accion: 'CRUD_PEDIDO_CREADO', detalles: { omId: 'OM-2026-00072', prenda: 'Jean/Vaquero', cantidad: 1000 } },
    ],
  })

  console.log('  ✓ 10 logs de actividad')

  // ============================================
  // CONFIGURACIÓN INICIAL
  // ============================================
  await prisma.configuracionSistema.createMany({
    data: [
      // Configs generales
      { clave: 'nombre_plataforma', valor: 'Plataforma Digital Textil', grupo: 'general' },
      { clave: 'email_soporte', valor: 'soporte@pdt.org.ar', grupo: 'general' },
      { clave: 'prefijo_certificado', valor: 'PDT-CERT-', grupo: 'certificados' },
      { clave: 'institucion_firma', valor: 'OIT Argentina — UNTREF', grupo: 'certificados' },
      // Feature flags E1
      { clave: 'registro_talleres', valor: 'true', grupo: 'features_e1' },
      { clave: 'registro_marcas', valor: 'true', grupo: 'features_e1' },
      { clave: 'directorio_publico', valor: 'true', grupo: 'features_e1' },
      { clave: 'academia', valor: 'true', grupo: 'features_e1' },
      { clave: 'formalizacion', valor: 'true', grupo: 'features_e1' },
      { clave: 'dashboard_estado', valor: 'true', grupo: 'features_e1' },
      { clave: 'denuncias', valor: 'true', grupo: 'features_e1' },
      // Feature flags E2
      { clave: 'publicacion_pedidos', valor: 'true', grupo: 'features_e2' },
      { clave: 'cotizaciones', valor: 'true', grupo: 'features_e2' },
      { clave: 'acuerdos_pdf', valor: 'true', grupo: 'features_e2' },
      { clave: 'matching_notificaciones', valor: 'true', grupo: 'features_e2' },
      { clave: 'asistente_rag', valor: 'true', grupo: 'features_e2' },
    ],
  })

  console.log('  ✓ Configuración del sistema y feature flags')

  // ============================================
  // PEDIDOS PUBLICADOS (marketplace)
  // ============================================
  const pedidoPublicado1 = await prisma.pedido.create({
    data: {
      omId: 'OM-2026-00090',
      marcaId: marcaChica.id,
      tipoPrenda: 'Buzo/Hoodie',
      tipoPrendaId: prBuzo.id,
      cantidad: 1500,
      fechaObjetivo: new Date('2026-06-15'),
      estado: 'PUBLICADO',
      montoTotal: 0,
      presupuesto: 2700000,
      descripcion: 'Buzos con capucha oversize para coleccion invierno. Tela french terry 280gr. Estampa en frente y espalda.',
    },
  })

  const pedidoPublicado2 = await prisma.pedido.create({
    data: {
      omId: 'OM-2026-00091',
      marcaId: marcaMediana.id,
      tipoPrenda: 'Remera',
      tipoPrendaId: prRemera.id,
      cantidad: 2000,
      fechaObjetivo: new Date('2026-05-20'),
      estado: 'PUBLICADO',
      montoTotal: 0,
      presupuesto: 1800000,
      descripcion: 'Remeras lisas de algodon 24/1 para sublimacion. Colores: blanco, negro, gris melange. Talles S a XXL.',
    },
  })

  await prisma.pedido.create({
    data: {
      omId: 'OM-2026-00092',
      marcaId: marcaMediana.id,
      tipoPrenda: 'Camisa',
      tipoPrendaId: prCamisa.id,
      cantidad: 600,
      fechaObjetivo: new Date('2026-07-01'),
      estado: 'PUBLICADO',
      montoTotal: 0,
      presupuesto: 900000,
      descripcion: 'Camisas manga larga en gabardina. Corte regular. Para uniforme corporativo.',
    },
  })

  // Pedido ESPERANDO_ENTREGA
  await prisma.pedido.create({
    data: {
      omId: 'OM-2026-00085',
      marcaId: marcaMediana.id,
      tipoPrenda: 'Pantalón de vestir',
      tipoPrendaId: prPantalon.id,
      cantidad: 400,
      fechaObjetivo: new Date('2026-04-10'),
      estado: 'ESPERANDO_ENTREGA',
      progresoTotal: 100,
      montoTotal: 640000,
    },
  })

  // Pedido CANCELADO
  await prisma.pedido.create({
    data: {
      omId: 'OM-2026-00075',
      marcaId: marcaChica.id,
      tipoPrenda: 'Jean/Vaquero',
      tipoPrendaId: prJean.id,
      cantidad: 200,
      estado: 'CANCELADO',
      montoTotal: 0,
      descripcion: 'Cancelado por falta de stock de tela.',
    },
  })

  console.log('  ✓ 5 pedidos adicionales (3 PUBLICADOS, 1 ESPERANDO_ENTREGA, 1 CANCELADO)')

  // ============================================
  // COTIZACIONES (para pedidos publicados)
  // ============================================
  await prisma.cotizacion.create({
    data: {
      pedidoId: pedidoPublicado1.id,
      tallerId: tallerOro.id,
      precio: 1600,
      plazoDias: 18,
      proceso: 'Confeccion completa + estampado',
      mensaje: 'Podemos hacer los buzos con el estampado incluido. Tenemos experiencia en french terry pesado.',
      estado: 'ENVIADA',
      venceEn: new Date('2026-04-20'),
    },
  })
  await prisma.cotizacion.create({
    data: {
      pedidoId: pedidoPublicado1.id,
      tallerId: tallerPlata.id,
      precio: 1850,
      plazoDias: 25,
      proceso: 'Confeccion (sin estampado)',
      mensaje: 'Podemos hacer la confeccion. El estampado habria que tercerizarlo.',
      estado: 'ENVIADA',
      venceEn: new Date('2026-04-20'),
    },
  })
  await prisma.cotizacion.create({
    data: {
      pedidoId: pedidoPublicado2.id,
      tallerId: tallerOro.id,
      precio: 750,
      plazoDias: 12,
      proceso: 'Corte y confeccion de remeras',
      mensaje: 'Tenemos capacidad inmediata para este volumen.',
      estado: 'ENVIADA',
      venceEn: new Date('2026-04-18'),
    },
  })

  console.log('  ✓ 3 cotizaciones para pedidos publicados')

  // ============================================
  // AUDITORIAS
  // ============================================
  const auditoria1 = await prisma.auditoria.create({
    data: {
      tallerId: tallerBronce.id,
      inspectorId: admin.id,
      fecha: new Date('2026-04-15T10:00:00'),
      tipo: 'PRIMERA_VISITA',
      estado: 'PROGRAMADA',
      prioridad: 'alta',
    },
  })
  const auditoria2 = await prisma.auditoria.create({
    data: {
      tallerId: tallerPlata.id,
      inspectorId: admin.id,
      fecha: new Date('2026-04-08T14:00:00'),
      tipo: 'VERIFICACION',
      estado: 'EN_CURSO',
    },
  })
  await prisma.auditoria.create({
    data: {
      tallerId: tallerOro.id,
      inspectorId: admin.id,
      fecha: new Date('2026-03-20T09:00:00'),
      tipo: 'SEGUIMIENTO',
      estado: 'COMPLETADA',
      resultado: 'Aprobado con observaciones menores. Recomendacion: mejorar senalizacion de salida de emergencia.',
      hallazgos: { observaciones: ['Senalizacion de emergencia incompleta en sector deposito'], cumplimientos: ['EPP completo', 'ART vigente', 'Matafuegos en fecha'] },
    },
  })
  await prisma.auditoria.create({
    data: {
      tallerId: tallerPlata.id,
      inspectorId: admin.id,
      fecha: new Date('2026-04-22T11:00:00'),
      tipo: 'RE_AUDITORIA',
      estado: 'PROGRAMADA',
    },
  })
  await prisma.auditoria.create({
    data: {
      tallerId: tallerBronce.id,
      inspectorId: admin.id,
      fecha: new Date('2026-02-10T10:00:00'),
      tipo: 'PRIMERA_VISITA',
      estado: 'CANCELADA',
      resultado: 'Cancelada — taller no disponible en la fecha coordinada.',
    },
  })

  // Acciones correctivas para auditoria EN_CURSO
  await prisma.accionCorrectiva.createMany({
    data: [
      { auditoriaId: auditoria2.id, descripcion: 'Instalar matafuegos ABC en sector de planchado', estado: 'PENDIENTE', plazo: new Date('2026-04-30') },
      { auditoriaId: auditoria2.id, descripcion: 'Actualizar carteleria de salida de emergencia', estado: 'EN_PROCESO' },
    ],
  })

  console.log('  ✓ 5 auditorias + 2 acciones correctivas')

  // ============================================
  // DENUNCIAS
  // ============================================
  const denunciaCount = await prisma.denuncia.count()
  await prisma.denuncia.createMany({
    data: [
      { tipo: 'Trabajo no registrado', tallerId: tallerBronce.id, descripcion: 'Se observaron personas trabajando sin registro visible. Turno noche.', estado: 'RECIBIDA', anonima: true, codigo: `DEN-2026-${String(denunciaCount + 1).padStart(5, '0')}` },
      { tipo: 'Condiciones insalubres', tallerId: tallerBronce.id, descripcion: 'Ventilacion insuficiente en el area de corte. Polvo de tela acumulado.', estado: 'EN_INVESTIGACION', anonima: true, codigo: `DEN-2026-${String(denunciaCount + 2).padStart(5, '0')}` },
      { tipo: 'Incumplimiento de normas de seguridad', descripcion: 'Taller sin matafuegos ni senalizacion de emergencia. Ubicado en zona de Florencio Varela.', estado: 'RECIBIDA', anonima: true, codigo: `DEN-2026-${String(denunciaCount + 3).padStart(5, '0')}` },
      { tipo: 'Acoso laboral', descripcion: 'Situacion de maltrato verbal reiterado hacia operarias. Se solicita intervencion urgente.', estado: 'RESUELTA', anonima: true, codigo: `DEN-2026-${String(denunciaCount + 4).padStart(5, '0')}` },
      { tipo: 'No pago de salarios', tallerId: tallerPlata.id, descripcion: 'Retraso de 2 meses en el pago de haberes a 3 trabajadoras.', estado: 'DESESTIMADA', anonima: false, codigo: `DEN-2026-${String(denunciaCount + 5).padStart(5, '0')}` },
    ],
  })

  console.log('  ✓ 5 denuncias con estados variados')

  // ============================================
  // NOTIFICACIONES
  // ============================================
  await prisma.notificacion.createMany({
    data: [
      { userId: userPlata.id, tipo: 'PEDIDO_DISPONIBLE', titulo: 'Nuevo pedido disponible: Buzo/Hoodie', mensaje: 'Amapola Indumentaria publico un pedido de 1500 buzos. Podes cotizar!', canal: 'PLATAFORMA' },
      { userId: userOro.id, tipo: 'PEDIDO_DISPONIBLE', titulo: 'Nuevo pedido disponible: Remera', mensaje: 'Urbano Textil publico un pedido de 2000 remeras. Podes cotizar!', canal: 'PLATAFORMA' },
      { userId: userMarcaChica.id, tipo: 'COTIZACION', titulo: 'Nueva cotizacion recibida', mensaje: 'Corte Sur SRL cotizo tu pedido de buzos: $1600/u en 18 dias.', canal: 'PLATAFORMA' },
      { userId: userMarcaChica.id, tipo: 'COTIZACION', titulo: 'Nueva cotizacion recibida', mensaje: 'Cooperativa Hilos del Sur cotizo tu pedido de buzos: $1850/u en 25 dias.', canal: 'PLATAFORMA' },
      { userId: userMarcaMediana.id, tipo: 'COTIZACION', titulo: 'Nueva cotizacion recibida', mensaje: 'Corte Sur SRL cotizo tu pedido de remeras: $750/u en 12 dias.', canal: 'PLATAFORMA' },
      { userId: admin.id, tipo: 'SISTEMA', titulo: 'Validaciones pendientes', mensaje: 'Hay 1 validacion pendiente de revision.', canal: 'PLATAFORMA' },
    ],
  })

  console.log('  ✓ 6 notificaciones')

  // ============================================
  // LOGS ADICIONALES (NIVEL_SUBIDO, etc.)
  // ============================================
  await prisma.logActividad.createMany({
    data: [
      { userId: admin.id, accion: 'NIVEL_SUBIDO', detalles: { tallerId: tallerPlata.id, nivelAnterior: 'BRONCE', nivelNuevo: 'PLATA', taller: 'Cooperativa Hilos del Sur' } },
      { userId: admin.id, accion: 'NIVEL_SUBIDO', detalles: { tallerId: tallerOro.id, nivelAnterior: 'PLATA', nivelNuevo: 'ORO', taller: 'Corte Sur SRL' } },
      { userId: admin.id, accion: 'VALIDACION_RECHAZADA', detalles: { taller: 'Taller La Aguja', tipo: 'Habilitacion municipal', motivo: 'Documento ilegible' } },
      { userId: admin.id, accion: 'DENUNCIA_RECIBIDA', detalles: { codigo: `DEN-2026-${String(denunciaCount + 1).padStart(5, '0')}`, tipo: 'Trabajo no registrado' } },
    ],
  })

  // Progreso bronce (recien empezo)
  await prisma.progresoCapacitacion.create({
    data: { tallerId: tallerBronce.id, coleccionId: col3.id, porcentajeCompletado: 33, videosVistos: 1 },
  })

  console.log('  ✓ 4 logs adicionales + progreso bronce')

  // ============================================
  // RESUMEN
  // ============================================
  const counts = await prisma.$transaction([
    prisma.user.count(),
    prisma.taller.count(),
    prisma.marca.count(),
    prisma.pedido.count(),
    prisma.ordenManufactura.count(),
    prisma.coleccion.count(),
    prisma.video.count(),
    prisma.certificado.count(),
    prisma.validacion.count(),
    prisma.cotizacion.count(),
    prisma.auditoria.count(),
    prisma.denuncia.count(),
    prisma.notificacion.count(),
  ])

  console.log('\n✅ Seed completado:')
  console.log(`  ${counts[0]} usuarios | ${counts[1]} talleres | ${counts[2]} marcas`)
  console.log(`  ${counts[3]} pedidos | ${counts[4]} ordenes | ${counts[5]} colecciones | ${counts[6]} videos`)
  console.log(`  ${counts[7]} certificados | ${counts[8]} validaciones`)
  console.log(`  ${counts[9]} cotizaciones | ${counts[10]} auditorias | ${counts[11]} denuncias | ${counts[12]} notificaciones`)
  console.log('\n  Feature flags E2: TODOS ACTIVADOS')
  console.log('  Credenciales: todas las cuentas usan password "pdt2026"')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
