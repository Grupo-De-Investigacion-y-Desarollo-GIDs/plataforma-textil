/**
 * MIGRACIÓN selectiva dev→prod del piloto. Alcance RECORTADO (1ª tanda):
 *   identidad (User) + entidad (Taller/Marca) + formalización (Validacion +
 *   Maquinaria + TallerProceso + TallerPrenda) + docs de Storage.
 *   Certs y ProgresoCapacitacion = 2ª tanda (flag --con-certs).
 *
 * RAMAS:
 *   - MERGE (Alan y cualquier email ya en prod): NO crea user; adjunta el Taller de
 *     dev al user de prod (userId = prod) y suma el rol TALLER.
 *   - verificadoAfip POR EVIDENCIA (set VERIFICADOS, de consultas_arca reales de dev), NO
 *     por el nombre. Sin evidencia: talleres → EN_GRACIA+inicioGracia=NOW; marcas → solo
 *     verificadoAfip=false (las marcas no tienen reloj de gracia). ROL_FORZADO para Alan.
 *   - Catálogos globales (ProcesoProductivo/TipoPrenda/TipoDocumento): se remapean por
 *     NOMBRE dev→prod (los IDs pueden diferir entre seeds).
 *   - Certs migrados: qrCode=NULL (se regenera on-demand con el NEXTAUTH_URL de prod).
 *
 * SEGURIDAD: DRY-RUN por default. Escribe SOLO con --execute. Idempotente: saltea el
 * user/taller que ya exista en prod. Cada user se migra en una $transaction.
 *
 * Uso:
 *   DEV_DATABASE_URL=<:5432 dev>  PROD_DATABASE_URL=<:5432 prod> \
 *   DEV_SUPABASE_URL=... DEV_SUPABASE_SERVICE_ROLE_KEY=... \
 *   PROD_SUPABASE_URL=... PROD_SUPABASE_SERVICE_ROLE_KEY=... \
 *   npx tsx scripts/migracion-piloto/migrar.ts scripts/migracion-piloto/lista.txt [--execute] [--con-certs]
 */
import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const EXECUTE = process.argv.includes('--execute')
const CON_CERTS = process.argv.includes('--con-certs')
const listaPath = process.argv.find(a => a.endsWith('.txt'))

function reqEnv(k: string) { const v = process.env[k]; if (!v) throw new Error(`Falta env ${k}`); return v }
const dev = new PrismaClient({ datasources: { db: { url: reqEnv('DEV_DATABASE_URL') } } })
const prod = new PrismaClient({ datasources: { db: { url: reqEnv('PROD_DATABASE_URL') } } })
const devStore = createClient(reqEnv('DEV_SUPABASE_URL'), reqEnv('DEV_SUPABASE_SERVICE_ROLE_KEY'))
const prodStore = createClient(reqEnv('PROD_SUPABASE_URL'), reqEnv('PROD_SUPABASE_SERVICE_ROLE_KEY'))

const log = (...a: unknown[]) => console.log(EXECUTE ? '[EXEC]' : '[DRY]', ...a)

// VEREDICTO verificadoAfip POR EVIDENCIA de consultas_arca de dev (consulta real
// exitosa >200ms), NO por el nombre "TALLER MOCK SRL". Aprobado por Gerardo 2026-08-05.
// Los que NO están acá → verificadoAfip=false (talleres además EN_GRACIA+inicioGracia=NOW).
const VERIFICADOS = new Set<string>([
  'monibasterrechea@gmail.com',        // TALLER — 2 consultas reales (1978ms)
  'jointexcooperativa@gmail.com',      // TALLER — 2 reales (1637ms, jurídica/razonSocial)
  'monicagodoyleiva@gmail.com',        // MARCA  — 2 reales (1100ms)
  'csamaniego@ciaindumentaria.com.ar', // MARCA  — 2 reales (1083ms) [contacto sensible: solo copia datos, NO email]
])

// Emails que en el MERGE fuerzan un rol específico (independiente de la entidad de dev).
const ROL_FORZADO: Record<string, string> = {
  'cp.alanplummer@gmail.com': 'TALLER', // SIN-ENTIDAD en dev; solo suma rol TALLER a su user MARCA de prod
}

// ── Remapeo de catálogos globales por nombre (cache) ─────────────────────────
const cache = { proceso: new Map<string, string>(), prenda: new Map<string, string>(), tipoDoc: new Map<string, string>() }
async function remap(kind: 'proceso' | 'prenda' | 'tipoDoc', devId: string): Promise<string | null> {
  // nombre en dev
  const nombre =
    kind === 'proceso' ? (await dev.procesoProductivo.findUnique({ where: { id: devId }, select: { nombre: true } }))?.nombre :
    kind === 'prenda' ? (await dev.tipoPrenda.findUnique({ where: { id: devId }, select: { nombre: true } }))?.nombre :
    (await dev.tipoDocumento.findUnique({ where: { id: devId }, select: { nombre: true } }))?.nombre
  if (!nombre) return null
  if (cache[kind].has(nombre)) return cache[kind].get(nombre)!
  const prodRow =
    kind === 'proceso' ? await prod.procesoProductivo.findFirst({ where: { nombre }, select: { id: true } }) :
    kind === 'prenda' ? await prod.tipoPrenda.findFirst({ where: { nombre }, select: { id: true } }) :
    await prod.tipoDocumento.findFirst({ where: { nombre }, select: { id: true } })
  if (!prodRow) { log(`  ⚠️ catálogo ${kind} "${nombre}" NO existe en prod — se saltea esa fila`); return null }
  cache[kind].set(nombre, prodRow.id)
  return prodRow.id
}

async function copiarArchivo(bucket: 'documentos' | 'imagenes', path: string) {
  const { data, error } = await devStore.storage.from(bucket).download(path)
  if (error || !data) { log(`  ⚠️ no se pudo bajar ${bucket}/${path}: ${error?.message}`); return }
  if (!EXECUTE) { log(`  (dry) copiaría ${bucket}/${path}`); return }
  const buf = Buffer.from(await data.arrayBuffer())
  const { error: upErr } = await prodStore.storage.from(bucket).upload(path, buf, { contentType: data.type, upsert: true })
  if (upErr) log(`  ⚠️ upload ${bucket}/${path}: ${upErr.message}`)
  else log(`  ✓ copiado ${bucket}/${path}`)
}

function pathDeUrl(url: string): string | null {
  // documentoUrl es una publicUrl: .../object/public/<bucket>/<path>
  const m = url.match(/\/object\/public\/[^/]+\/(.+)$/)
  return m ? m[1] : null
}

async function migrarUno(email: string) {
  const u = await dev.user.findUnique({ where: { email }, include: { taller: true, marca: true } })
  if (!u) { log(`✗ ${email}: no existe en dev`); return }

  const prodUser = await prod.user.findUnique({ where: { email } })
  const modo = prodUser ? 'MERGE' : 'INSERT'
  log(`\n● ${email} — modo ${modo}${u.taller?.nombre === 'TALLER MOCK SRL' ? ' [MOCK]' : ''}`)

  // Idempotencia: si el taller ya está en prod (por userId destino), saltear.
  const destUserId = prodUser?.id ?? u.id
  if (u.taller) {
    const yaExiste = await prod.taller.findUnique({ where: { userId: destUserId } })
    if (yaExiste) { log(`  ↷ ya migrado (taller en prod para userId ${destUserId}) — skip`); return }
  }

  await prod.$transaction(async (tx) => {
    // 1. USER — INSERT (preserva id) o MERGE (suma rol al existente)
    if (modo === 'INSERT') {
      if (EXECUTE) await tx.user.create({ data: {
        id: u.id, email: u.email, emailVerified: u.emailVerified, password: u.password,
        name: u.name, phone: u.phone, avatar: u.avatar, active: u.active, registroCompleto: u.registroCompleto,
        // FIX (post-mortem 07-ago): setear el escalar `role`. Sin esta línea el create caía
        // al @default(TALLER) del schema y quedaba desincronizado de activeMode → 6 usuarios
        // MARCA migrados con role=TALLER (saneados en prod el 07-ago; ver README §Saneo).
        role: u.activeMode ?? u.role,
        roles: u.roles, activeMode: u.activeMode, cuit: u.cuit, verificadoAfip: u.verificadoAfip,
      } })
      log(`  user creado (id ${u.id}, roles ${u.roles.join('+')})`)
    } else {
      // ROL_FORZADO: Alan no tiene entidad en dev (registro incompleto) → se le suma
      // TALLER a su user de prod (MARCA) por decisión de Gerardo. El resto: el rol de la
      // entidad que trae de dev.
      const nuevoRol = ROL_FORZADO[email] ?? (u.taller ? 'TALLER' : 'MARCA')
      if (EXECUTE && !prodUser!.roles.includes(nuevoRol as never)) {
        await tx.user.update({ where: { id: prodUser!.id }, data: { roles: { set: [...prodUser!.roles, nuevoRol as never] } } })
      }
      log(`  MERGE: rol ${nuevoRol} → user prod ${prodUser!.email} (roles ${prodUser!.roles.join('+')})`)
    }

    // 2. TALLER — verificadoAfip POR EVIDENCIA (VERIFICADOS). Sin evidencia → EN_GRACIA
    // con reloj nuevo (inicioGracia=NOW) para el circuito de re-verificación real.
    if (u.taller) {
      const t = u.taller
      const verif = VERIFICADOS.has(email)
      const data = {
        id: t.id, userId: destUserId, nombre: t.nombre, cuit: t.cuit, ubicacion: t.ubicacion,
        provincia: t.provincia, capacidadMensual: t.capacidadMensual, nivel: t.nivel, puntaje: t.puntaje,
        verificadoAfip: verif,
        verificadoAfipAt: verif ? (t.verificadoAfipAt ?? new Date()) : null,
        estadoCuenta: verif ? 'ACTIVA' : 'EN_GRACIA',
        inicioGracia: verif ? null : new Date(),
      }
      if (EXECUTE) await tx.taller.create({ data: data as never })
      log(`  taller "${t.nombre}" → ${verif ? 'ACTIVA (verificado)' : 'EN_GRACIA (sin evidencia real)'}`)

      // 2b. Procesos / Prendas (remap por nombre) + Maquinaria
      const procs = await dev.tallerProceso.findMany({ where: { tallerId: t.id } })
      for (const p of procs) {
        const pid = await remap('proceso', p.procesoId)
        if (pid && EXECUTE) await tx.tallerProceso.create({ data: { tallerId: t.id, procesoId: pid } })
      }
      const prendas = await dev.tallerPrenda.findMany({ where: { tallerId: t.id } })
      for (const p of prendas) {
        const pid = await remap('prenda', p.prendaId)
        if (pid && EXECUTE) await tx.tallerPrenda.create({ data: { tallerId: t.id, prendaId: pid } })
      }
      const maqs = await dev.maquinaria.findMany({ where: { tallerId: t.id } })
      if (EXECUTE) for (const m of maqs) await tx.maquinaria.create({ data: { ...m } as never })
      log(`  procesos=${procs.length} prendas=${prendas.length} maquinaria=${maqs.length}`)

      // 2c. Validaciones (remap tipoDocumentoId) + copia de docs
      const vals = await dev.validacion.findMany({ where: { tallerId: t.id } })
      for (const v of vals) {
        const tdId = await remap('tipoDoc', v.tipoDocumentoId)
        if (!tdId) continue
        if (EXECUTE) await tx.validacion.create({ data: { ...v, tipoDocumentoId: tdId } as never })
        if (v.documentoUrl) { const p = pathDeUrl(v.documentoUrl); if (p) await copiarArchivo('documentos', p) }
      }
      log(`  validaciones=${vals.length}`)

      // 2d. Certs + progreso (2ª tanda)
      if (CON_CERTS) {
        const certs = await dev.certificado.findMany({ where: { tallerId: t.id } })
        if (EXECUTE) for (const c of certs) await tx.certificado.create({ data: { ...c, qrCode: null } as never })
        const prog = await dev.progresoCapacitacion.findMany({ where: { tallerId: t.id } })
        if (EXECUTE) for (const p of prog) await tx.progresoCapacitacion.create({ data: { ...p } as never })
        log(`  [2ª tanda] certs=${certs.length} (qrCode=null) progreso=${prog.length}`)
      }
    }

    // 3. MARCA (marca-only o multi-rol como solve). Las marcas NO tienen reloj de gracia:
    // solo verificadoAfip por evidencia.
    if (u.marca) {
      const m = u.marca
      const verif = VERIFICADOS.has(email)
      const yaMarca = await prod.marca.findUnique({ where: { userId: destUserId } })
      if (!yaMarca && EXECUTE) await tx.marca.create({ data: { ...m, userId: destUserId, verificadoAfip: verif } as never })
      log(`  marca "${m.nombre}" → verificadoAfip=${verif}${yaMarca ? ' (ya existía, skip)' : ''}`)
    }

    // 3b. Avatar en storage
    if (u.avatar) { const p = pathDeUrl(u.avatar); if (p) await copiarArchivo('imagenes', p) }
  }, { timeout: 60_000 })
}

async function main() {
  const emails = readFileSync(listaPath ?? 0, 'utf-8').split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'))
  log(`Migración piloto — ${emails.length} emails · ${EXECUTE ? 'EXECUTE (escribe)' : 'DRY-RUN (no escribe)'} · certs=${CON_CERTS}`)
  for (const e of emails) {
    try { await migrarUno(e) } catch (err) { console.error(`✗ ${e}:`, err instanceof Error ? err.message : err) }
  }
  log('\nFin.')
}
main().catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await dev.$disconnect(); await prod.$disconnect() })
