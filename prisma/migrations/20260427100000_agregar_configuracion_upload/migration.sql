-- CreateTable
CREATE TABLE "configuraciones_upload" (
    "id" TEXT NOT NULL,
    "contexto" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "tiposPermitidos" TEXT[],
    "tamanoMaximoMB" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "actualizadoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuraciones_upload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "configuraciones_upload_contexto_key" ON "configuraciones_upload"("contexto");
