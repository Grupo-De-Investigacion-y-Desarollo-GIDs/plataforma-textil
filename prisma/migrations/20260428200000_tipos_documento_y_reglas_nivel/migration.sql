-- AlterTable: agregar campos de puntos y orden a tipos_documento
ALTER TABLE "tipos_documento" ADD COLUMN "puntosOtorgados" INTEGER NOT NULL DEFAULT 10;
ALTER TABLE "tipos_documento" ADD COLUMN "ordenVisualizacion" INTEGER NOT NULL DEFAULT 0;

-- CreateTable: reglas de nivel configurables por ESTADO
CREATE TABLE "reglas_nivel" (
    "id" TEXT NOT NULL,
    "nivel" "NivelTaller" NOT NULL,
    "puntosMinimos" INTEGER NOT NULL,
    "requiereVerificadoAfip" BOOLEAN NOT NULL DEFAULT false,
    "certificadosAcademiaMin" INTEGER NOT NULL DEFAULT 0,
    "descripcion" TEXT,
    "beneficios" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reglas_nivel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reglas_nivel_nivel_key" ON "reglas_nivel"("nivel");

-- Backfill: puntos diferenciados por nivel
UPDATE "tipos_documento" SET "puntosOtorgados" = 15 WHERE "nivelMinimo" = 'PLATA';
UPDATE "tipos_documento" SET "puntosOtorgados" = 20 WHERE "nivelMinimo" = 'ORO';
