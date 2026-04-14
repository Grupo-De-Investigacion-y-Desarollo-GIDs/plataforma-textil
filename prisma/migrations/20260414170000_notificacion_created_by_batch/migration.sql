-- AlterTable
ALTER TABLE "notificaciones" ADD COLUMN     "batchId" TEXT,
ADD COLUMN     "createdById" TEXT;

-- CreateIndex
CREATE INDEX "notificaciones_batchId_idx" ON "notificaciones"("batchId");

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
