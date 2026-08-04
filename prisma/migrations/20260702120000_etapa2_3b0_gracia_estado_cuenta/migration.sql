-- Etapa 2.3-B0: gracia de 60 dias para verificar CUIT. Aditiva + backfill (AMNISTIA).
--
-- Crea el enum EstadoCuenta y 4 campos en "talleres" (tabla real, NO el nombre del
-- modelo). NO reusa User.active (inerte en login + colisiona con el baneo de admin).
--
-- Backfill = AMNISTIA (decision Sergio/Gerardo):
--   - Verificados     -> ACTIVA, sin reloj de gracia (inicioGracia NULL).
--   - No verificados  -> EN_GRACIA, reloj arranca AHORA (NOW() = fecha de lanzamiento):
--                        tienen 60 dias desde ESTE deploy, no desde su createdAt.
--   - NADIE queda INACTIVA en el backfill: cero inactivacion retroactiva.
--
-- Solo modelo + datos. La transicion por tiempo (EN_GRACIA -> INACTIVA), los emails y
-- la reactivacion al verificar CUIT son 2.3-B1 (el cron).

-- CreateEnum
CREATE TYPE "EstadoCuenta" AS ENUM ('ACTIVA', 'EN_GRACIA', 'INACTIVA');

-- AlterTable
ALTER TABLE "talleres" ADD COLUMN "estadoCuenta" "EstadoCuenta" NOT NULL DEFAULT 'ACTIVA';
ALTER TABLE "talleres" ADD COLUMN "inicioGracia" TIMESTAMP(3);
ALTER TABLE "talleres" ADD COLUMN "inactivadaAt" TIMESTAMP(3);
ALTER TABLE "talleres" ADD COLUMN "recordatorioCuitEnviadoAt" TIMESTAMP(3);

-- Backfill (amnistia). El DEFAULT 'ACTIVA' ya dejo a todos en ACTIVA; corregimos los
-- no verificados a EN_GRACIA con el reloj arrancando ahora.
UPDATE "talleres"
   SET "estadoCuenta" = 'ACTIVA', "inicioGracia" = NULL
 WHERE "verificadoAfip" = true;

UPDATE "talleres"
   SET "estadoCuenta" = 'EN_GRACIA', "inicioGracia" = NOW()
 WHERE "verificadoAfip" = false;

-- Query de control (ejecutar tras aplicar; NO forma parte de la migracion):
--   SELECT "estadoCuenta", count(*) FROM "talleres" GROUP BY "estadoCuenta";
--   -- Esperado: solo ACTIVA + EN_GRACIA, CERO INACTIVA.
--   SELECT count(*) FILTER (WHERE "verificadoAfip" AND "estadoCuenta" <> 'ACTIVA')      AS verif_no_activa,
--          count(*) FILTER (WHERE NOT "verificadoAfip" AND "estadoCuenta" <> 'EN_GRACIA') AS noverif_no_gracia,
--          count(*) FILTER (WHERE "estadoCuenta" = 'INACTIVA')                          AS inactivas,
--          count(*) FILTER (WHERE NOT "verificadoAfip" AND "inicioGracia" IS NULL)      AS gracia_sin_reloj
--     FROM "talleres";
--   -- Esperado: 0, 0, 0, 0.
