-- CreateEnum
CREATE TYPE "TipoNovedad" AS ENUM ('NOTICIA', 'CASO', 'INDICADOR');

-- CreateTable
CREATE TABLE "novedades" (
    "id" TEXT NOT NULL,
    "tipo" "TipoNovedad" NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "imagenUrl" TEXT,
    "slug" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publicado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "novedades_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "novedades_slug_key" ON "novedades"("slug");

-- CreateIndex
CREATE INDEX "novedades_publicado_fecha_idx" ON "novedades"("publicado", "fecha");
