-- Etapa 2.2-B (§5): flag privacy-by-default `modeloB_revisado`.
-- Decide como se interpreta el null de visibilidadVidriera en el render publico.
-- Aditiva con backfill:
--   - Columna NOT NULL DEFAULT false  => talleres NUEVOS entran en false (privacy-by-default).
--   - Backfill existentes -> true     => preservan su visibilidad actual (null=visible de #437),
--                                        no se les cambia nada al pasar a 2.2-B.
-- NO incluye logica de render/visibilidad: eso es 2.2-B. Esta migracion solo crea el campo.

-- AlterTable
ALTER TABLE "talleres" ADD COLUMN "modeloB_revisado" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: talleres existentes mantienen su visibilidad actual (revisado = true).
UPDATE "talleres" SET "modeloB_revisado" = true;
