-- AlterTable: reemplazar zona por provincia + partido + ubicacionDetalle
ALTER TABLE "talleres" ADD COLUMN "provincia" TEXT;
ALTER TABLE "talleres" ADD COLUMN "partido" TEXT;
ALTER TABLE "talleres" ADD COLUMN "ubicacionDetalle" TEXT;
ALTER TABLE "talleres" DROP COLUMN "zona";
