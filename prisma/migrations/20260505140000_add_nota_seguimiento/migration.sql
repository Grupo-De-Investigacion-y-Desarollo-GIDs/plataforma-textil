-- CreateTable
CREATE TABLE "notas_seguimiento" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notas_seguimiento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notas_seguimiento_userId_idx" ON "notas_seguimiento"("userId");

-- AddForeignKey
ALTER TABLE "notas_seguimiento" ADD CONSTRAINT "notas_seguimiento_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_seguimiento" ADD CONSTRAINT "notas_seguimiento_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
