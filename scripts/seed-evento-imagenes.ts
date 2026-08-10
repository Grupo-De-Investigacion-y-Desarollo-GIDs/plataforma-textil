// Imágenes de las cuentas demo del evento (martes 11) — reseed-safe.
//
// Los assets viven en el repo (scripts/seed-evento-assets/, material sintético
// declarado). Este módulo los sube al Storage de DEV de forma IDEMPOTENTE por
// path determinístico (demo/<user_code>/<archivo>: si ya existe, no re-sube) y
// asigna las URLs públicas en la DB EN CADA CORRIDA. Por eso el reseed entre
// tandas del martes NO pierde las imágenes: las URLs se vuelven a setear aunque
// el objeto de Storage ya estuviera arriba.
//
//   - Talleres (6): portfolioFotos = [foto01, foto02, foto03, LOGO].  El logo va
//     ÚLTIMO a propósito: la tarjeta del directorio muestra portfolioFotos[0] en
//     aspect-video/object-cover (un logo cuadrado se recortaría feo); la primera
//     imagen debe ser foto de taller. En la galería aspect-square el logo cierra
//     bien. (Invierte el sort_order del manifiesto, donde el logo es 0.)
//   - Marcas (5): Pedido.imagenes = [foto01, foto02, foto03].  Los 5 logos de
//     marca NO se usan (el modelo Marca no tiene campo de logo; decisión tomada,
//     sin migración pre-evento — ver scripts/seed-evento-assets/NOTA_LOGOS_MARCA.md).
//
// Standalone contra dev (sin resetear):  npx tsx scripts/seed-evento-imagenes.ts
// También lo llama prisma/seed.ts al final del reseed (cuando ya existen todas las
// cuentas y pedidos). Si faltan creds de Storage o una cuenta/pedido, saltea con
// aviso (no rompe el seed): el mismo criterio que seed-evento.ts.

import { PrismaClient } from '@prisma/client'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const ASSETS_DIR = join(dirname(fileURLToPath(import.meta.url)), 'seed-evento-assets')
const BUCKET = 'imagenes'
const PREFIJO = 'demo' // demo/<user_code>/<archivo>

// user_code → destino en la DB. Verificado contra seed-evento.ts y prisma/seed.ts.
// OJO con los 3 que no siguen el patrón demo.*: TAL_006, MAR_004, MAR_005 (cuentas
// showcase del seed base). Los omId de marca resuelven el pedido a enriquecer.
type Objetivo =
  | { email: string; kind: 'taller' }
  | { email: string; kind: 'pedido'; omId: string }

export const OBJETIVOS: Record<string, Objetivo> = {
  TAL_001: { email: 'demo.taller1@pdt.org.ar', kind: 'taller' },
  TAL_002: { email: 'demo.taller2@pdt.org.ar', kind: 'taller' },
  TAL_003: { email: 'demo.taller3@pdt.org.ar', kind: 'taller' },
  TAL_004: { email: 'demo.taller4@pdt.org.ar', kind: 'taller' },
  TAL_005: { email: 'demo.gracia@pdt.org.ar', kind: 'taller' },     // Costura del Oeste (gracia)
  TAL_006: { email: 'carlos.mendoza@pdt.org.ar', kind: 'taller' },  // Corte Sur SRL (Oro)
  MAR_001: { email: 'demo.marca1@pdt.org.ar', kind: 'pedido', omId: 'OM-2026-EVT-A' },
  MAR_002: { email: 'demo.marca2@pdt.org.ar', kind: 'pedido', omId: 'OM-2026-EVT-B' },
  MAR_003: { email: 'demo.marca3@pdt.org.ar', kind: 'pedido', omId: 'OM-2026-EVT-C' },
  MAR_004: { email: 'valentina.ramos@pdt.org.ar', kind: 'pedido', omId: 'OM-2026-00089' }, // Amapola
  MAR_005: { email: 'martin.echevarria@pdt.org.ar', kind: 'pedido', omId: 'OM-2026-00072' }, // Urbano
}

export interface Asset {
  sort_order: number
  asset_type: string
  path: string
  alt_text: string
}
export interface ManifestUser {
  user_code: string
  display_name: string
  assets: Asset[]
}

function contentType(archivo: string): string {
  return archivo.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'
}

/**
 * Orden final de assets según destino:
 *  - taller: fotos (sort_order 1,2,3) y LOGO (0) al final → [foto,foto,foto,logo]
 *  - pedido: solo fotos (el logo de marca no se usa) → [foto,foto,foto]
 * Pura: sin IO, testeable contra el manifiesto real.
 */
export function ordenarAssets(assets: Asset[], kind: 'taller' | 'pedido'): Asset[] {
  const fotos = assets.filter(a => a.sort_order > 0).sort((a, b) => a.sort_order - b.sort_order)
  if (kind === 'pedido') return fotos
  const logo = assets.find(a => a.sort_order === 0)
  return logo ? [...fotos, logo] : fotos
}

/** Carga SUPABASE_URL/KEY desde .env.local si no están en el env (tsx no lo hace solo). */
function asegurarCreds(): void {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) return
  for (const f of ['.env.local', '.env']) {
    try {
      process.loadEnvFile(f)
      if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) return
    } catch {
      // archivo ausente — probar el siguiente
    }
  }
}

/**
 * Sube un asset de forma idempotente. Si ya existe en Storage (según `existentes`),
 * NO lo re-sube. Devuelve siempre la URL pública (exista o no de antes).
 */
async function subir(
  sb: SupabaseClient,
  userCode: string,
  asset: Asset,
  existentes: Set<string>,
): Promise<{ url: string; subido: boolean }> {
  const archivo = basename(asset.path)
  const destino = `${PREFIJO}/${userCode}/${archivo}`
  let subido = false
  if (!existentes.has(archivo)) {
    const buf = readFileSync(join(ASSETS_DIR, asset.path))
    const { error } = await sb.storage
      .from(BUCKET)
      .upload(destino, buf, { contentType: contentType(archivo), upsert: true })
    if (error) throw new Error(`upload ${destino}: ${error.message}`)
    existentes.add(archivo)
    subido = true
  }
  const { data } = sb.storage.from(BUCKET).getPublicUrl(destino)
  return { url: data.publicUrl, subido }
}

export async function seedEventoImagenes(prisma: PrismaClient) {
  asegurarCreds()
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.log('  ⚠ imágenes demo: sin SUPABASE_URL/SERVICE_ROLE_KEY — se saltea (cuentas sin fotos)')
    return { talleres: 0, pedidos: 0, subidas: 0, saltadas: 0, omitidos: 0 }
  }
  const sb = createClient(url, key)

  const manifest = JSON.parse(readFileSync(join(ASSETS_DIR, 'manifest.json'), 'utf-8')) as {
    users: ManifestUser[]
  }

  let talleres = 0, pedidos = 0, subidas = 0, saltadas = 0, omitidos = 0

  for (const u of manifest.users) {
    const obj = OBJETIVOS[u.user_code]
    if (!obj) { console.log(`  ⚠ ${u.user_code}: sin objetivo mapeado — saltea`); omitidos++; continue }

    // Idempotencia: listar lo ya subido para este user_code (una sola llamada).
    const { data: listado } = await sb.storage.from(BUCKET).list(`${PREFIJO}/${u.user_code}`)
    const existentes = new Set((listado ?? []).map(f => f.name))

    const seleccion = ordenarAssets(u.assets, obj.kind) // taller: fotos+logo; pedido: solo fotos
    const urls: string[] = []
    for (const a of seleccion) {
      const { url: publicUrl, subido } = await subir(sb, u.user_code, a, existentes)
      urls.push(publicUrl)
      if (subido) subidas++; else saltadas++
    }

    if (obj.kind === 'taller') {
      const user = await prisma.user.findUnique({ where: { email: obj.email }, select: { id: true } })
      const taller = user && await prisma.taller.findUnique({ where: { userId: user.id }, select: { id: true } })
      if (!taller) { console.log(`  ⚠ ${u.user_code} (${obj.email}): sin taller — saltea asignación`); omitidos++; continue }
      await prisma.taller.update({ where: { id: taller.id }, data: { portfolioFotos: urls } })
      talleres++
      console.log(`  ✓ taller ${u.display_name}: ${urls.length} imágenes (logo al cierre)`)
    } else {
      const pedido = await prisma.pedido.findUnique({ where: { omId: obj.omId }, select: { id: true } })
      if (!pedido) { console.log(`  ⚠ ${u.user_code} (${obj.omId}): sin pedido — saltea asignación`); omitidos++; continue }
      await prisma.pedido.update({ where: { id: pedido.id }, data: { imagenes: urls } })
      pedidos++
      console.log(`  ✓ pedido ${obj.omId} (${u.display_name}): ${urls.length} imágenes`)
    }
  }

  console.log(`  → imágenes demo: ${talleres} talleres, ${pedidos} pedidos; ${subidas} subidas, ${saltadas} ya estaban, ${omitidos} omitidos`)
  return { talleres, pedidos, subidas, saltadas, omitidos }
}

// Standalone: npx tsx scripts/seed-evento-imagenes.ts
const esMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (esMain) {
  const prisma = new PrismaClient()
  seedEventoImagenes(prisma)
    .then(() => prisma.$disconnect())
    .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
}
