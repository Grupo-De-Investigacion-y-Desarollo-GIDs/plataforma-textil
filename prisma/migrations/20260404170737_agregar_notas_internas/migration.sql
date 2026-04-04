-- CreateTable
CREATE TABLE "notas_internas" (
    "id" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "tallerId" TEXT,
    "marcaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notas_internas_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "notas_internas" ADD CONSTRAINT "notas_internas_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_internas" ADD CONSTRAINT "notas_internas_tallerId_fkey" FOREIGN KEY ("tallerId") REFERENCES "talleres"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_internas" ADD CONSTRAINT "notas_internas_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "marcas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
