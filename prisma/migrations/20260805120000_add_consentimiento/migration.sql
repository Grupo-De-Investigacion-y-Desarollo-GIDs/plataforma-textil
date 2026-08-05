-- CreateEnum
CREATE TYPE "TipoConsent" AS ENUM ('TERMINOS', 'PRIVACIDAD', 'VISIBILIDAD');

-- CreateTable
CREATE TABLE "consentimientos" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tipo" "TipoConsent" NOT NULL,
    "version" TEXT NOT NULL,
    "aceptadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consentimientos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "consentimientos_userId_idx" ON "consentimientos"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "consentimientos_userId_tipo_version_key" ON "consentimientos"("userId", "tipo", "version");

-- AddForeignKey
ALTER TABLE "consentimientos" ADD CONSTRAINT "consentimientos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
