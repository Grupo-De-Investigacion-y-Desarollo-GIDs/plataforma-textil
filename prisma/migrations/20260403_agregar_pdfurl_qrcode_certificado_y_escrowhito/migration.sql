-- AlterTable
ALTER TABLE "certificados" ADD COLUMN     "pdfUrl" TEXT,
ADD COLUMN     "qrCode" TEXT;

-- AlterTable
ALTER TABLE "ordenes_manufactura" ADD COLUMN     "procesoId" TEXT;

-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN     "tipoPrendaId" TEXT;

-- AlterTable
ALTER TABLE "talleres" ADD COLUMN     "areas" TEXT[],
ADD COLUMN     "escalabilidad" TEXT,
ADD COLUMN     "experienciaPromedio" TEXT,
ADD COLUMN     "horario" TEXT,
ADD COLUMN     "metrosCuadrados" INTEGER,
ADD COLUMN     "organizacion" TEXT,
ADD COLUMN     "paradasFrecuencia" TEXT,
ADD COLUMN     "polivalencia" TEXT,
ADD COLUMN     "prendaPrincipal" TEXT,
ADD COLUMN     "registroProduccion" TEXT,
ADD COLUMN     "sam" INTEGER;

-- AlterTable
ALTER TABLE "validaciones" ADD COLUMN     "tipoDocumentoId" TEXT;

-- AlterTable
ALTER TABLE "verification_tokens" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'EMAIL_VERIFICATION';

-- CreateTable
CREATE TABLE "intentos_evaluacion" (
    "id" TEXT NOT NULL,
    "tallerId" TEXT NOT NULL,
    "coleccionId" TEXT NOT NULL,
    "respuestas" JSONB NOT NULL,
    "calificacion" INTEGER NOT NULL,
    "aprobado" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "intentos_evaluacion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_tipoPrendaId_fkey" FOREIGN KEY ("tipoPrendaId") REFERENCES "tipos_prenda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_manufactura" ADD CONSTRAINT "ordenes_manufactura_procesoId_fkey" FOREIGN KEY ("procesoId") REFERENCES "procesos_productivos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validaciones" ADD CONSTRAINT "validaciones_tipoDocumentoId_fkey" FOREIGN KEY ("tipoDocumentoId") REFERENCES "tipos_documento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intentos_evaluacion" ADD CONSTRAINT "intentos_evaluacion_tallerId_fkey" FOREIGN KEY ("tallerId") REFERENCES "talleres"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intentos_evaluacion" ADD CONSTRAINT "intentos_evaluacion_coleccionId_fkey" FOREIGN KEY ("coleccionId") REFERENCES "colecciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditorias" ADD CONSTRAINT "auditorias_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

