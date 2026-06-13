-- DropIndex
DROP INDEX "talleres_cuit_key";

-- DropIndex
DROP INDEX "marcas_cuit_key";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "activeMode" "UserRole",
ADD COLUMN     "actividadesAfip" TEXT[],
ADD COLUMN     "categoriaMonotributo" TEXT,
ADD COLUMN     "cuit" TEXT,
ADD COLUMN     "domicilioFiscalAfip" JSONB,
ADD COLUMN     "empleadosRegistradosSipa" INTEGER,
ADD COLUMN     "empleadosSipaActualizadoAt" TIMESTAMP(3),
ADD COLUMN     "estadoCuitAfip" "EstadoCuit",
ADD COLUMN     "fechaInscripcionAfip" TIMESTAMP(3),
ADD COLUMN     "roles" "UserRole"[] DEFAULT ARRAY[]::"UserRole"[],
ADD COLUMN     "tipoInscripcionAfip" "TipoInscripcionAfip",
ADD COLUMN     "verificadoAfip" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verificadoAfipAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "users_cuit_key" ON "users"("cuit");

-- Backfill: roles desde role actual
UPDATE "users" SET "roles" = ARRAY["role"::"UserRole"];

-- Backfill: activeMode desde role actual
UPDATE "users" SET "activeMode" = "role";

-- Backfill: CUIT desde Taller (prioridad)
UPDATE "users"
   SET "cuit" = t."cuit"
  FROM "talleres" t
 WHERE t."userId" = "users"."id";

-- Backfill: CUIT desde Marca (si no hay Taller)
UPDATE "users"
   SET "cuit" = m."cuit"
  FROM "marcas" m
 WHERE m."userId" = "users"."id"
   AND "users"."cuit" IS NULL;

-- Backfill: data ARCA desde Taller (10 campos)
UPDATE "users"
   SET "verificadoAfip"             = t."verificadoAfip",
       "verificadoAfipAt"           = t."verificadoAfipAt",
       "tipoInscripcionAfip"        = t."tipoInscripcionAfip",
       "categoriaMonotributo"       = t."categoriaMonotributo",
       "estadoCuitAfip"             = t."estadoCuitAfip",
       "fechaInscripcionAfip"       = t."fechaInscripcionAfip",
       "actividadesAfip"            = t."actividadesAfip",
       "domicilioFiscalAfip"        = t."domicilioFiscalAfip",
       "empleadosRegistradosSipa"   = t."empleadosRegistradosSipa",
       "empleadosSipaActualizadoAt" = t."empleadosSipaActualizadoAt"
  FROM "talleres" t
 WHERE t."userId" = "users"."id";

-- Backfill: verificadoAfip desde Marca (si no hay Taller)
UPDATE "users"
   SET "verificadoAfip" = m."verificadoAfip"
  FROM "marcas" m
 WHERE m."userId" = "users"."id"
   AND "users"."verificadoAfip" = false;
