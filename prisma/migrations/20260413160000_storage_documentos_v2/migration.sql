-- DropForeignKey
ALTER TABLE "validaciones" DROP CONSTRAINT "validaciones_tipoDocumentoId_fkey";

-- AlterTable
ALTER TABLE "tipos_documento" ADD COLUMN     "costoEstimado" TEXT,
ADD COLUMN     "enlaceTramite" TEXT,
ADD COLUMN     "label" TEXT NOT NULL,
ADD COLUMN     "nivelMinimo" "NivelTaller" NOT NULL,
ADD COLUMN     "orden" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "validaciones" ALTER COLUMN "tipoDocumentoId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "validaciones" ADD CONSTRAINT "validaciones_tipoDocumentoId_fkey" FOREIGN KEY ("tipoDocumentoId") REFERENCES "tipos_documento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
