-- AlterTable: agregar campos de trazabilidad a validaciones
ALTER TABLE "validaciones" ADD COLUMN "aprobadoPor" TEXT;
ALTER TABLE "validaciones" ADD COLUMN "aprobadoEn" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "validaciones" ADD CONSTRAINT "validaciones_aprobadoPor_fkey"
  FOREIGN KEY ("aprobadoPor") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
