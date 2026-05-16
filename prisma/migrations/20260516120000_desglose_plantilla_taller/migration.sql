-- DropColumn
ALTER TABLE "talleres" DROP COLUMN "experienciaPromedio";

-- CreateEnum
CREATE TYPE "CategoriaOficioTextil" AS ENUM ('APRENDIZ', 'MEDIO_OFICIAL', 'OFICIAL', 'OFICIAL_CALIFICADO');

-- CreateTable
CREATE TABLE "taller_plantilla" (
    "id" TEXT NOT NULL,
    "tallerId" TEXT NOT NULL,
    "categoria" "CategoriaOficioTextil" NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "taller_plantilla_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "taller_plantilla_tallerId_categoria_key" ON "taller_plantilla"("tallerId", "categoria");

-- CreateIndex
CREATE INDEX "taller_plantilla_tallerId_idx" ON "taller_plantilla"("tallerId");

-- AddForeignKey
ALTER TABLE "taller_plantilla" ADD CONSTRAINT "taller_plantilla_tallerId_fkey" FOREIGN KEY ("tallerId") REFERENCES "talleres"("id") ON DELETE CASCADE ON UPDATE CASCADE;
