-- CreateEnum
CREATE TYPE "TipoObservacion" AS ENUM ('RESISTENCIA', 'EXPECTATIVA', 'DIFICULTAD_TECNICA', 'DIFICULTAD_PROCESO', 'OPORTUNIDAD', 'EXITO', 'CONTEXTO_TALLER', 'CONTEXTO_MARCA', 'POLITICA_PUBLICA');

-- CreateEnum
CREATE TYPE "FuenteObservacion" AS ENUM ('VISITA', 'LLAMADA', 'WHATSAPP', 'PLATAFORMA', 'ENTREVISTA', 'OTROS');

-- CreateEnum
CREATE TYPE "Sentimiento" AS ENUM ('POSITIVO', 'NEUTRAL', 'NEGATIVO');

-- CreateTable
CREATE TABLE "observaciones_campo" (
    "id" TEXT NOT NULL,
    "autorId" TEXT,
    "userId" TEXT,
    "tipo" "TipoObservacion" NOT NULL,
    "tags" TEXT[],
    "titulo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "fechaEvento" TIMESTAMP(3) NOT NULL,
    "ubicacion" TEXT,
    "fuente" "FuenteObservacion" NOT NULL DEFAULT 'VISITA',
    "sentimiento" "Sentimiento",
    "importancia" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "observaciones_campo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "observaciones_campo_userId_idx" ON "observaciones_campo"("userId");

-- CreateIndex
CREATE INDEX "observaciones_campo_tipo_idx" ON "observaciones_campo"("tipo");

-- CreateIndex
CREATE INDEX "observaciones_campo_fechaEvento_idx" ON "observaciones_campo"("fechaEvento");

-- AddForeignKey
ALTER TABLE "observaciones_campo" ADD CONSTRAINT "observaciones_campo_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "observaciones_campo" ADD CONSTRAINT "observaciones_campo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
