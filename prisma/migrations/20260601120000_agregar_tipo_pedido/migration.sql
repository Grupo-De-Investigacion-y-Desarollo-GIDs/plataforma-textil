-- CreateEnum
CREATE TYPE "TipoPedido" AS ENUM ('COMERCIAL', 'SUBCONTRATACION');

-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN     "tipo" "TipoPedido" NOT NULL DEFAULT 'COMERCIAL';

-- Backfill U-06: reclasificar como SUBCONTRATACION los pedidos cuyo dueno de
-- marca tambien tiene taller. Idempotente. Hoy cambia 0 filas (no hay usuarios
-- duales aun); deja la data consistente para cuando exista el fixture dual.
UPDATE "pedidos" p
SET "tipo" = 'SUBCONTRATACION'
FROM "marcas" m
JOIN "talleres" t ON t."userId" = m."userId"
WHERE p."marcaId" = m."id";
