# Backup, restore y retención — PDT (Plataforma Digital Textil)

> Documento de handover (entregable OIT/UNTREF). Describe la estrategia de backup y
> restore de la base de datos PostgreSQL y del Storage de la plataforma, junto con la
> política de retención. Basado en el mecanismo ya probado y documentado en
> `.claude/specs/RUNBOOK_PROMOCION_PROD.md` (§1).

## Infraestructura relevante

- **Motor:** PostgreSQL 17.6, alojado en Supabase, región `sa-east-1`.
- **Proyectos Supabase:**
  - DEV — ref `fjddgukwydsdcrqoxvns`
  - PROD — ref `nefbhacmjrzynnhvgfnl`
- **Esquema:** ~44 tablas en `public`, versionadas por 37 migraciones Prisma en
  `prisma/migrations/`.
- **Storage:** Supabase Storage con un bucket **privado** de documentos (ver spec
  K-02). Los archivos subidos por los usuarios viven en Supabase Storage, **no** en la
  base de datos: `pg_dump` no los cubre (ver sección 4).

---

## 1. Estrategia de backup (dos capas)

La cobertura de backup se apoya en dos mecanismos complementarios. Ninguno reemplaza al
otro.

### Capa (a) — Backups automáticos de Supabase

- Supabase toma **backups automáticos diarios** del proyecto. La retención depende del
  plan:
  - **Plan Pro:** backups diarios automáticos, retención **7 días**, más **PITR**
    (Point-In-Time Recovery) disponible como add-on.
  - **Plan Free:** sin backup on-demand fiable.
- Sirven para recuperación ante desastre "de granularidad diaria": el punto de
  restauración es el de la madrugada.
- **GAP declarado:** el tier exacto del proyecto PROD (`nefbhacmjrzynnhvgfnl`) **hay que
  confirmarlo en el dashboard** — Supabase → proyecto `nefbhacmjrzynnhvgfnl` → Settings
  → Database → Backups. Toda la política de la capa (a) depende de ese dato.

### Capa (b) — Snapshot on-demand con `pg_dump`

- Los backups automáticos diarios **no alcanzan** para un deploy: se necesita un punto de
  restauración **inmediatamente previo** al cambio, no el de la madrugada.
- Para eso se toma un snapshot manual con `pg_dump` justo antes de cualquier operación
  riesgosa (deploy con migraciones, backfill, cambio destructivo).
- Es el mecanismo **tier-independiente y verificable**: no depende del plan de Supabase y
  deja un artefacto local que se puede inspeccionar y restaurar selectivamente.
- Ya probado: un `pg_dump --schema-only` contra DEV devolvió exit 0 con 80 tablas, sin
  errores.

---

## 2. Procedimiento de backup on-demand (`pg_dump`)

### Prerequisito — versión de `pg_dump` ≥ 17

El servidor Supabase corre **PostgreSQL 17.6**. `pg_dump` debe ser **≥ 17** o aborta con
`server version mismatch`. El cliente por defecto de Ubuntu 22.04 es la v14 y **falla**
(verificado).

- En la WSL de Gerardo ya está instalado `postgresql-client-17` (`pg_dump` 17.10) y
  verificado.
- Para reproducir en otra máquina (instalación desde el repo PGDG):

```bash
sudo install -d /usr/share/postgresql-common/pgdg
sudo curl -fsSL -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc \
  https://www.postgresql.org/media/keys/ACCC4CF8.asc
echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] \
  http://apt.postgresql.org/pub/repos/apt $(. /etc/os-release; echo $VERSION_CODENAME)-pgdg main" \
  | sudo tee /etc/apt/sources.list.d/pgdg.list
sudo apt-get -o Acquire::ForceIPv4=true update && \
  sudo apt-get -o Acquire::ForceIPv4=true install -y postgresql-client-17
# ForceIPv4: en algunas redes apt.postgresql.org no resuelve por IPv6
```

### Connection string — usar el DIRECT_URL (session pooler, 5432)

- Traer las credenciales de prod a un archivo **gitignored** (nunca commitear):

```bash
vercel env pull --environment=production .env.prod   # trae DIRECT_URL de prod
```

- Usar el **`DIRECT_URL`**, que apunta al **session pooler, puerto 5432**.
- **NO** usar el transaction pooler (puerto **6543**): rompe `pg_dump`.

### Comando de dump

```bash
source .env.prod
pg_dump "$DIRECT_URL" --no-owner --no-acl -Fc \
  -f "prod_snapshot_$(date +%Y%m%d_%H%M).dump"
```

- `-Fc` = custom format: comprimido y restaurable selectivamente.
- `--no-owner --no-acl` = portable, sin depender de los roles del servidor origen.

### Verificación de integridad (sin restaurar)

```bash
pg_restore --list prod_snapshot_*.dump | grep -c "TABLE DATA"   # debe ser > 0
pg_restore --list prod_snapshot_*.dump | tail -5                # debe cerrar limpio
```

El listado tiene que abrir sin errores y mostrar las ~44 tablas de `public.*` con sus
datos.

### Destino — fuera del repo, en 2 lugares

- El archivo `.dump` va **fuera del repo** (gitignored).
- Copiarlo a un **segundo lugar** (disco local + nube privada).
- **Nunca** subirlo a un servicio público.

---

## 3. Procedimiento de restore

### Restore de emergencia

```bash
source .env.prod
pg_restore --clean --if-exists -d "$DIRECT_URL" prod_snapshot_YYYYMMDD_HHMM.dump
```

- `--clean --if-exists` = dropea los objetos existentes antes de recrearlos.

### Advertencias

- **Operación destructiva.** `--clean` borra y reemplaza objetos en el destino.
- Ejecutar **solo con un backup verificado** (correr antes la verificación de integridad
  de la sección 2).
- **Confirmar el entorno destino** antes de correr: revisar que el `DIRECT_URL` cargado
  apunta al proyecto correcto (DEV vs PROD). Un restore contra el proyecto equivocado
  sobrescribe datos reales.
- Usar el mismo prerequisito de versión (`pg_restore` ≥ 17, session pooler 5432).

---

## 4. Backup del Storage (documentos en Supabase Storage)

- Los buckets de Supabase Storage **no están cubiertos por `pg_dump`**: este solo respalda
  la base de datos relacional. Los archivos subidos (bucket privado de documentos, spec
  K-02) viven en el object store de Supabase.
- Supabase respalda el Storage **según el plan** del proyecto (misma dependencia de tier
  que la capa (a)).
- Un **export manual** del Storage se hace desde el **dashboard o la CLI de Supabase** si
  se requiere un punto de restauración propio de los archivos.
- **Área a formalizar (GAP):** no hay hoy un procedimiento probado y documentado de
  export/restore del Storage equivalente al de `pg_dump` para la DB. Definir frecuencia,
  destino y verificación queda pendiente.

---

## 5. Política de retención

Distinguir dos cosas que suelen confundirse:

### Retención de BACKUPS (infraestructura)

- Backups automáticos de Supabase: **7 días** en plan Pro (a confirmar el tier de PROD,
  ver GAP en sección 1).
- Snapshots on-demand (`pg_dump`): retención **manual**, la define quien los toma. Se
  recomienda conservar al menos el snapshot pre-deploy hasta validar que el deploy quedó
  estable, y una copia archivada de los hitos mayores.

### Retención de DATOS de usuario (cumplimiento / legal)

- Es un asunto **distinto** de la retención de backups: hace a por cuánto tiempo la
  plataforma conserva datos personales de los usuarios y bajo qué política de borrado.
- **Pendiente — deuda P-07:** política de retención **configurable** de datos de usuario.
  Está en el **Bloque A del roadmap**, sin implementar. Este documento cubre la retención
  de infraestructura; la política de datos de usuario se define en P-07.

---

## 6. Gaps declarados

1. **Confirmar el tier de Supabase PROD** (`nefbhacmjrzynnhvgfnl`) en el dashboard. De
   ahí dependen la retención de la capa (a) y el respaldo del Storage.
2. **Formalizar el backup del Storage:** definir y probar un procedimiento de
   export/restore de los buckets (hoy solo existe el respaldo implícito del plan de
   Supabase).
3. **Automatizar el snapshot pre-deploy:** hoy el `pg_dump` on-demand es **manual**.
   Convendría integrarlo como paso automático previo a cada promoción a producción.
