-- Etapa 2.2 / Modelo B (§1.3): visibilidad por bloque de la vidriera del taller.
-- Aditiva pura: columna nullable, sin default, sin backfill. Filas existentes -> NULL = todo visible.
-- AlterTable
ALTER TABLE "talleres" ADD COLUMN "visibilidadVidriera" JSONB;
