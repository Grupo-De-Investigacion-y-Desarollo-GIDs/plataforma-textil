-- AlterTable: add imagenes and procesosRequeridos to pedidos
ALTER TABLE "pedidos" ADD COLUMN "imagenes" TEXT[] DEFAULT '{}';
ALTER TABLE "pedidos" ADD COLUMN "procesosRequeridos" TEXT[] DEFAULT '{}';
ALTER TABLE "pedidos" ALTER COLUMN "imagenes" DROP DEFAULT;
ALTER TABLE "pedidos" ALTER COLUMN "procesosRequeridos" DROP DEFAULT;

-- AlterTable: add imagenes to cotizaciones
ALTER TABLE "cotizaciones" ADD COLUMN "imagenes" TEXT[] DEFAULT '{}';
ALTER TABLE "cotizaciones" ALTER COLUMN "imagenes" DROP DEFAULT;
