# Migración selectiva dev→prod del piloto

Scripts one-off para migrar ~14 usuarios reales del piloto de DEV a PROD.
**Alcance recortado (1ª tanda):** identidad + entidad (taller/marca) + validaciones + docs de Storage.
Certs y progreso de capacitación = 2ª tanda (`--con-certs`).

## Pre-requisitos
1. **Password de PROD reseteada** y `PROD_DATABASE_URL` = session pooler `:5432` (NO `:6543`).
2. `lista.txt` con la lista **congelada por Sergio** (un email por línea).
3. Env vars (NO commitear):
   - `DEV_DATABASE_URL`, `PROD_DATABASE_URL` (session pooler :5432 de cada uno)
   - `DEV_SUPABASE_URL`, `DEV_SUPABASE_SERVICE_ROLE_KEY`
   - `PROD_SUPABASE_URL`, `PROD_SUPABASE_SERVICE_ROLE_KEY`

## Orden de ejecución
```bash
# 1. DRY-RUN (read-only): qué arrastra cada uno + flags (MOCK/MERGE/COLISIÓN/MULTIROL)
npx tsx scripts/migracion-piloto/dry-run.ts scripts/migracion-piloto/lista.txt

# 2. Migración en DRY (no escribe) — revisar el plan por usuario
npx tsx scripts/migracion-piloto/migrar.ts scripts/migracion-piloto/lista.txt

# 3. Migración REAL (1ª tanda) — tras snapshot (backup diario de Supabase)
npx tsx scripts/migracion-piloto/migrar.ts scripts/migracion-piloto/lista.txt --execute

# 4. 2ª tanda (certs + progreso) si el tiempo lo permite
npx tsx scripts/migracion-piloto/migrar.ts scripts/migracion-piloto/lista.txt --execute --con-certs
```

## Ramas que maneja `migrar.ts`
- **MERGE** (Alan y cualquier email ya en prod): adjunta el taller de dev al user de prod + rol `TALLER`. No duplica identidad.
- **MOCK** (`TALLER MOCK SRL`): `verificadoAfip=false` + `estadoCuenta=EN_GRACIA` + `inicioGracia=NOW()` → re-verificación limpia.
- **Catálogos** (proceso/prenda/tipoDocumento): remap **por nombre** dev→prod (IDs difieren entre seeds).
- **Certs**: `qrCode=NULL` (se regenera on-demand con el `NEXTAUTH_URL` de prod).
- **Idempotente**: saltea el taller ya migrado (por `userId` destino).

## Notas / tradeoffs conocidos
- Preserva los `id` (cuid) de dev → no colisionan con prod y mantienen integridad de FKs.
- **NO migra:** sesiones, notificaciones, logActividad, cotizaciones/órdenes, historial ConsultaArca (ruido).
- Las copias de Storage ocurren dentro de la `$transaction` (I/O de red con la tx abierta). Para 14 users está OK (timeout 60s); si escala, mover la copia fuera de la tx.
- Colisiones `User.email`/`User.cuit` @unique: el dry-run las reporta; hoy sólo Alan (email) colisiona → MERGE.

## Post-mortem — escalar `role` desincronizado (saneado 07-ago-2026)

**Síntoma:** 6 usuarios MARCA migrados quedaron con el escalar `users.role = TALLER`
(pero `roles = {MARCA}`, `activeMode = MARCA`, entidad marca). Emails afectados:
`csamaniego@ciaindumentaria.com.ar`, `gerencia.capucchinotextil@gmail.com`,
`gustavosamuelian@gmail.com`, `info@vaninaf.com`, `monicagodoyleiva@gmail.com`,
`paoguerschuny@gmail.com`.

**Causa raíz:** el `user.create` de `migrar.ts` (rama INSERT) copiaba `roles` y
`activeMode` pero **no** el escalar `role` → caía al `@default(TALLER)` del schema.

**Impacto real: ninguno operativo.** El auth resuelve todo por `activeMode`/`roles`
(`auth.config.ts`: `token.role = activeMode`); el escalar `role` sólo es fallback si
`activeMode` es null (no era el caso). Es dato muerto → cosmético (a lo sumo un panel que
lea `users.role` crudo mostraría "TALLER"). No se le negó acceso a nadie.

**Fix del script (documental, no re-ejecutado):** se agregó `role: u.activeMode ?? u.role`
al create (ver `migrar.ts`, rama INSERT). El script es one-off; no se re-corre.

**Saneo en prod (Gerardo, 07-ago):**
```sql
-- Antes: SELECT email, role, roles, "activeMode" FROM users
--        WHERE "activeMode" IS NOT NULL AND role <> "activeMode";  → 6 filas
UPDATE users SET role = "activeMode"
WHERE "activeMode" IS NOT NULL AND role <> "activeMode";           -- 6 filas afectadas
-- Después: el mismo SELECT → 0 filas (verificado).
```
No tocó al ADMIN (`activeMode` null) ni a los ya alineados (`solve.vtt`, `cp.alanplummer`).
