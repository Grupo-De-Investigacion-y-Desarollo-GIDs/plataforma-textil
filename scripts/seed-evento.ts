// Cuentas del EVENTO DEMO (martes 11) — idempotente (upsert por email/userId/omId).
// Se puede correr standalone contra dev SIN resetear:  npx tsx scripts/seed-evento.ts
// También lo llama prisma/seed.ts para incluirlas en un reseed completo.
//
// Crea: 4 talleres + 3 marcas de ESCRITURA (una por tablet) + 1 taller en gracia
// (demo.gracia). Enriquece las cuentas de escritura con datos presentables:
//   - cada taller: validaciones (formalización con progreso, no en cero)
//   - cada marca: 1 pedido publicado + 1 cotización recibida (dashboard con actividad)
// Todas con password 'pdt2026' y dominio @pdt.org.ar (el guard de demo les impide cambiar
// credenciales). NO toca schema. Requiere el seed base (procesos/prendas/tipos de documento);
// si falta algo, saltea ese enriquecimiento (el taller/marca igual queda creado).

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const TALLERES = [
  { email: 'demo.taller1@pdt.org.ar', persona: 'Confecciones Belgrano', cuit: '30-70111001-1', ubicacion: 'Belgrano, CABA', provincia: 'CABA', partido: 'Comuna 13', nivel: 'PLATA' as const, capacidad: 1500 },
  { email: 'demo.taller2@pdt.org.ar', persona: 'Textil Avellaneda', cuit: '30-70111002-2', ubicacion: 'Avellaneda, Buenos Aires', provincia: 'Buenos Aires', partido: 'Avellaneda', nivel: 'PLATA' as const, capacidad: 1800 },
  { email: 'demo.taller3@pdt.org.ar', persona: 'Taller Lanús', cuit: '30-70111003-3', ubicacion: 'Lanús, Buenos Aires', provincia: 'Buenos Aires', partido: 'Lanús', nivel: 'BRONCE' as const, capacidad: 1000 },
  { email: 'demo.taller4@pdt.org.ar', persona: 'Corte Ramos Mejía', cuit: '30-70111004-4', ubicacion: 'Ramos Mejía, La Matanza', provincia: 'Buenos Aires', partido: 'La Matanza', nivel: 'ORO' as const, capacidad: 2500 },
]

const MARCAS = [
  { email: 'demo.marca1@pdt.org.ar', persona: 'Indumentaria Aurora', cuit: '27-40111001-1', ubicacion: 'Caballito, CABA', tipo: 'Diseño independiente', volumen: 500, omId: 'OM-2026-EVT-A', prenda: 'Remera', cantidad: 800, presupuesto: 720000, desc: 'Remeras de algodón 24/1 para colección cápsula. Estampa al frente.' },
  { email: 'demo.marca2@pdt.org.ar', persona: 'Moda Delta', cuit: '30-71222002-2', ubicacion: 'San Isidro, Buenos Aires', tipo: 'Marca comercial', volumen: 1200, omId: 'OM-2026-EVT-B', prenda: 'Jean/Vaquero', cantidad: 500, presupuesto: 900000, desc: 'Jeans slim de gabardina elastizada para temporada.' },
  { email: 'demo.marca3@pdt.org.ar', persona: 'Textiles del Plata', cuit: '30-71222003-3', ubicacion: 'La Plata, Buenos Aires', tipo: 'Marca comercial', volumen: 900, omId: 'OM-2026-EVT-C', prenda: 'Remera', cantidad: 1200, presupuesto: 1080000, desc: 'Remeras lisas para línea de uniformes. Talles S a XXL.' },
]

// Formalización presentable: mezcla realista (no todo en cero, no todo completo).
const MIX_VALIDACIONES: { nombre: string; estado: 'COMPLETADO' | 'PENDIENTE' | 'NO_INICIADO' }[] = [
  { nombre: 'CUIT/Monotributo', estado: 'COMPLETADO' },
  { nombre: 'Habilitación municipal', estado: 'COMPLETADO' },
  { nombre: 'ART', estado: 'PENDIENTE' },
  { nombre: 'Empleados registrados', estado: 'NO_INICIADO' },
]

export async function seedEvento(prisma: PrismaClient) {
  const hash = await bcrypt.hash('pdt2026', 10)
  const veinteDiasAtras = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
  const enCuarentaDias = new Date(Date.now() + 40 * 24 * 60 * 60 * 1000)

  const procesos = await prisma.procesoProductivo.findMany({ where: { nombre: { in: ['Confección', 'Corte'] } }, select: { id: true, nombre: true } })
  const prendas = await prisma.tipoPrenda.findMany({ select: { id: true, nombre: true } })
  const tiposDoc = await prisma.tipoDocumento.findMany({ where: { activo: true }, select: { id: true, nombre: true } })
  const prendaId = (n: string) => prendas.find(p => p.nombre === n)?.id
  const tipoDocId = (n: string) => tiposDoc.find(d => d.nombre === n)?.id

  const talleresCreados: { id: string }[] = []
  for (const t of TALLERES) {
    const u = await prisma.user.upsert({
      where: { email: t.email },
      update: {},
      create: { email: t.email, password: hash, name: t.persona, role: 'TALLER', roles: ['TALLER'], activeMode: 'TALLER', active: true },
    })
    const descTaller = `Taller de confección en ${t.partido}. Verificado, con vidriera publicada.`
    const taller = await prisma.taller.upsert({
      where: { userId: u.id },
      update: { verificadoAfip: true, modeloB_revisado: true, estadoCuenta: 'ACTIVA', descripcion: descTaller },
      create: {
        userId: u.id, nombre: t.persona, cuit: t.cuit, nivel: t.nivel, puntaje: 50, rating: 4.3,
        ubicacion: t.ubicacion, provincia: t.provincia, partido: t.partido,
        descripcion: descTaller,
        capacidadMensual: t.capacidad, verificadoAfip: true, modeloB_revisado: true,
        estadoCuenta: 'ACTIVA', tipoInscripcionAfip: 'MONOTRIBUTO',
      },
    })
    talleresCreados.push({ id: taller.id })
    // Procesos/prendas (directorio + cotizar) y validaciones (formalización) — guard por count.
    if (procesos.length && (await prisma.tallerProceso.count({ where: { tallerId: taller.id } })) === 0) {
      for (const p of procesos) await prisma.tallerProceso.create({ data: { tallerId: taller.id, procesoId: p.id, precio: p.nombre === 'Corte' ? 400 : 700 } })
      const rId = prendaId('Remera'); const jId = prendaId('Jean/Vaquero')
      if (rId) await prisma.tallerPrenda.create({ data: { tallerId: taller.id, prendaId: rId } })
      if (jId) await prisma.tallerPrenda.create({ data: { tallerId: taller.id, prendaId: jId } })
    }
    if (tiposDoc.length && (await prisma.validacion.count({ where: { tallerId: taller.id } })) === 0) {
      for (const v of MIX_VALIDACIONES) {
        const tdId = tipoDocId(v.nombre)
        if (tdId) await prisma.validacion.create({ data: { tallerId: taller.id, tipo: v.nombre, tipoDocumentoId: tdId, estado: v.estado } })
      }
    }
  }

  let idx = 0
  for (const m of MARCAS) {
    const u = await prisma.user.upsert({
      where: { email: m.email },
      update: {},
      create: { email: m.email, password: hash, name: m.persona, role: 'MARCA', roles: ['MARCA'], activeMode: 'MARCA', active: true },
    })
    const marca = await prisma.marca.upsert({
      where: { userId: u.id },
      update: { pedidosRealizados: 1 },
      create: { userId: u.id, nombre: m.persona, cuit: m.cuit, ubicacion: m.ubicacion, tipo: m.tipo, volumenMensual: m.volumen, rating: 0, pedidosRealizados: 1 },
    })
    // 1 pedido publicado (dashboard con actividad) — upsert por omId (idempotente).
    const prId = prendaId(m.prenda)
    if (prId) {
      const pedido = await prisma.pedido.upsert({
        where: { omId: m.omId },
        update: {},
        create: {
          omId: m.omId, marcaId: marca.id, tipoPrenda: m.prenda, tipoPrendaId: prId,
          cantidad: m.cantidad, fechaObjetivo: enCuarentaDias, estado: 'PUBLICADO',
          montoTotal: 0, presupuesto: m.presupuesto, descripcion: m.desc,
        },
      })
      // 1 cotización recibida desde un taller de escritura — guard por count.
      const tallerCotiza = talleresCreados[idx % talleresCreados.length]
      if (tallerCotiza && (await prisma.cotizacion.count({ where: { pedidoId: pedido.id } })) === 0) {
        await prisma.cotizacion.create({
          data: {
            pedidoId: pedido.id, tallerId: tallerCotiza.id,
            precio: Math.round(m.presupuesto / m.cantidad * 0.9), plazoDias: 20,
            proceso: 'Confección completa', mensaje: 'Podemos tomar el pedido completo con este plazo.',
            estado: 'ENVIADA', venceEn: enCuarentaDias,
          },
        })
      }
    }
    idx++
  }

  const graciaUser = await prisma.user.upsert({
    where: { email: 'demo.gracia@pdt.org.ar' },
    update: {},
    create: { email: 'demo.gracia@pdt.org.ar', password: hash, name: 'Costura del Oeste', role: 'TALLER', roles: ['TALLER'], activeMode: 'TALLER', active: true },
  })
  await prisma.taller.upsert({
    where: { userId: graciaUser.id },
    update: { verificadoAfip: false, estadoCuenta: 'EN_GRACIA', inicioGracia: veinteDiasAtras },
    create: {
      userId: graciaUser.id, nombre: 'Costura del Oeste', cuit: '20-35999888-7', nivel: 'BRONCE', puntaje: 8, rating: 0,
      ubicacion: 'Morón, Buenos Aires', provincia: 'Buenos Aires', partido: 'Morón',
      descripcion: 'Taller en período de gracia — CUIT en proceso de verificación.',
      capacidadMensual: 600, verificadoAfip: false, modeloB_revisado: false,
      estadoCuenta: 'EN_GRACIA', inicioGracia: veinteDiasAtras,
    },
  })

  return { talleres: TALLERES.length, marcas: MARCAS.length, gracia: 1 }
}

// CLI standalone: npx tsx scripts/seed-evento.ts
if (process.argv[1] && process.argv[1].endsWith('seed-evento.ts')) {
  const prisma = new PrismaClient()
  seedEvento(prisma)
    .then(r => console.log(`✓ Evento demo: ${r.talleres} talleres + ${r.marcas} marcas de escritura + ${r.gracia} en gracia (demo.gracia)`))
    .catch(e => { console.error(e); process.exit(1) })
    .finally(() => prisma.$disconnect())
}
