-- CreateEnum
CREATE TYPE "EstadoCotizacion" AS ENUM ('ENVIADA', 'ACEPTADA', 'RECHAZADA', 'VENCIDA');

-- AlterEnum
ALTER TYPE "EstadoPedido" ADD VALUE 'PUBLICADO';

-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN     "descripcion" TEXT,
ADD COLUMN     "presupuesto" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "cotizaciones" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "tallerId" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "plazoDias" INTEGER NOT NULL,
    "proceso" TEXT NOT NULL,
    "mensaje" TEXT,
    "estado" "EstadoCotizacion" NOT NULL DEFAULT 'ENVIADA',
    "venceEn" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cotizaciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cotizaciones_pedidoId_tallerId_key" ON "cotizaciones"("pedidoId", "tallerId");

-- AddForeignKey
ALTER TABLE "cotizaciones" ADD CONSTRAINT "cotizaciones_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizaciones" ADD CONSTRAINT "cotizaciones_tallerId_fkey" FOREIGN KEY ("tallerId") REFERENCES "talleres"("id") ON DELETE CASCADE ON UPDATE CASCADE;
