// Cuentas del EVENTO DEMO (martes 11) — idempotente (upsert por email/userId).
// Se puede correr standalone contra dev SIN resetear:  npx tsx scripts/seed-evento.ts
// También lo llama prisma/seed.ts para incluirlas en un reseed completo.
//
// Crea: 4 talleres + 3 marcas de ESCRITURA (una por tablet) + 1 taller en gracia
// (demo.gracia). Todas con password 'pdt2026' y dominio @pdt.org.ar (el guard de demo
// les impide cambiar credenciales). NO toca schema. Requiere que existan los procesos
// (Confección/Corte) y prendas (Remera/Jean) del seed base; si no están, saltea el
// enlace de procesos/prendas (el taller igual queda verificado y visible).

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const TALLERES = [
  { email: 'demo.taller1@pdt.org.ar', persona: 'Confecciones Belgrano', cuit: '30-70111001-1', ubicacion: 'Belgrano, CABA', provincia: 'CABA', partido: 'Comuna 13', nivel: 'PLATA' as const, capacidad: 1500 },
  { email: 'demo.taller2@pdt.org.ar', persona: 'Textil Avellaneda', cuit: '30-70111002-2', ubicacion: 'Avellaneda, Buenos Aires', provincia: 'Buenos Aires', partido: 'Avellaneda', nivel: 'PLATA' as const, capacidad: 1800 },
  { email: 'demo.taller3@pdt.org.ar', persona: 'Taller Lanús', cuit: '30-70111003-3', ubicacion: 'Lanús, Buenos Aires', provincia: 'Buenos Aires', partido: 'Lanús', nivel: 'BRONCE' as const, capacidad: 1000 },
  { email: 'demo.taller4@pdt.org.ar', persona: 'Corte Ramos Mejía', cuit: '30-70111004-4', ubicacion: 'Ramos Mejía, La Matanza', provincia: 'Buenos Aires', partido: 'La Matanza', nivel: 'ORO' as const, capacidad: 2500 },
]

const MARCAS = [
  { email: 'demo.marca1@pdt.org.ar', persona: 'Indumentaria Aurora', cuit: '27-40111001-1', ubicacion: 'Caballito, CABA', tipo: 'Diseño independiente', volumen: 500 },
  { email: 'demo.marca2@pdt.org.ar', persona: 'Moda Delta', cuit: '30-71222002-2', ubicacion: 'San Isidro, Buenos Aires', tipo: 'Marca comercial', volumen: 1200 },
  { email: 'demo.marca3@pdt.org.ar', persona: 'Textiles del Plata', cuit: '30-71222003-3', ubicacion: 'La Plata, Buenos Aires', tipo: 'Marca comercial', volumen: 900 },
]

export async function seedEvento(prisma: PrismaClient) {
  const hash = await bcrypt.hash('pdt2026', 10)
  const veinteDiasAtras = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)

  const procesos = await prisma.procesoProductivo.findMany({ where: { nombre: { in: ['Confección', 'Corte'] } }, select: { id: true, nombre: true } })
  const prendas = await prisma.tipoPrenda.findMany({ where: { nombre: { in: ['Remera', 'Jean/Vaquero'] } }, select: { id: true, nombre: true } })

  for (const t of TALLERES) {
    const u = await prisma.user.upsert({
      where: { email: t.email },
      update: {},
      create: { email: t.email, password: hash, name: t.persona, role: 'TALLER', roles: ['TALLER'], activeMode: 'TALLER', active: true },
    })
    const taller = await prisma.taller.upsert({
      where: { userId: u.id },
      update: { verificadoAfip: true, modeloB_revisado: true, estadoCuenta: 'ACTIVA' },
      create: {
        userId: u.id, nombre: t.persona, cuit: t.cuit, nivel: t.nivel, puntaje: 50, rating: 4.3,
        ubicacion: t.ubicacion, provincia: t.provincia, partido: t.partido,
        descripcion: `Taller demo del evento (${t.persona}). Verificado, con vidriera publicada.`,
        capacidadMensual: t.capacidad, verificadoAfip: true, modeloB_revisado: true,
        estadoCuenta: 'ACTIVA', tipoInscripcionAfip: 'MONOTRIBUTO',
      },
    })
    // Procesos/prendas para el directorio + cotizar (guard por count → idempotente).
    if (procesos.length && (await prisma.tallerProceso.count({ where: { tallerId: taller.id } })) === 0) {
      for (const p of procesos) await prisma.tallerProceso.create({ data: { tallerId: taller.id, procesoId: p.id, precio: p.nombre === 'Corte' ? 400 : 700 } })
      for (const p of prendas) await prisma.tallerPrenda.create({ data: { tallerId: taller.id, prendaId: p.id } })
    }
  }

  for (const m of MARCAS) {
    const u = await prisma.user.upsert({
      where: { email: m.email },
      update: {},
      create: { email: m.email, password: hash, name: m.persona, role: 'MARCA', roles: ['MARCA'], activeMode: 'MARCA', active: true },
    })
    await prisma.marca.upsert({
      where: { userId: u.id },
      update: {},
      create: { userId: u.id, nombre: m.persona, cuit: m.cuit, ubicacion: m.ubicacion, tipo: m.tipo, volumenMensual: m.volumen, rating: 0, pedidosRealizados: 0 },
    })
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
