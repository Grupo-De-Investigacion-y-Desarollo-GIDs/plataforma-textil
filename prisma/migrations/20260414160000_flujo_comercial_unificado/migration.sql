-- CreateEnum
CREATE TYPE "VisibilidadPedido" AS ENUM ('PUBLICO', 'INVITACION');

-- AlterTable
ALTER TABLE "ordenes_manufactura" ADD COLUMN     "cotizacionId" TEXT;

-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN     "visibilidad" "VisibilidadPedido" NOT NULL DEFAULT 'PUBLICO';

-- CreateTable
CREATE TABLE "pedido_invitaciones" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "tallerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pedido_invitaciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pedido_invitaciones_pedidoId_tallerId_key" ON "pedido_invitaciones"("pedidoId", "tallerId");

-- CreateIndex
CREATE UNIQUE INDEX "ordenes_manufactura_cotizacionId_key" ON "ordenes_manufactura"("cotizacionId");

-- AddForeignKey
ALTER TABLE "ordenes_manufactura" ADD CONSTRAINT "ordenes_manufactura_cotizacionId_fkey" FOREIGN KEY ("cotizacionId") REFERENCES "cotizaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_invitaciones" ADD CONSTRAINT "pedido_invitaciones_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_invitaciones" ADD CONSTRAINT "pedido_invitaciones_tallerId_fkey" FOREIGN KEY ("tallerId") REFERENCES "talleres"("id") ON DELETE CASCADE ON UPDATE CASCADE;
