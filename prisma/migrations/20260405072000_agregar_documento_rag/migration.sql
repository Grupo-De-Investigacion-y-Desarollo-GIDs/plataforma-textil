-- CreateTable
CREATE TABLE "documentos_rag" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "fuente" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "embedding" vector(512),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documentos_rag_pkey" PRIMARY KEY ("id")
);
