-- AlterTable
ALTER TABLE "colecciones" ADD COLUMN "procesosTarget" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "colecciones" ADD COLUMN "formalizacionTarget" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Remove defaults (Prisma convention for String[] with no @default)
ALTER TABLE "colecciones" ALTER COLUMN "procesosTarget" DROP DEFAULT;
ALTER TABLE "colecciones" ALTER COLUMN "formalizacionTarget" DROP DEFAULT;
