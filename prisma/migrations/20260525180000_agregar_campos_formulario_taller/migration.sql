-- W-A2: detalle de organización mixta
ALTER TABLE "talleres" ADD COLUMN "organizacionDetalle" TEXT;

-- W-A4: disponibilidad para tomar nuevos pedidos
ALTER TABLE "talleres" ADD COLUMN "disponibilidad" TEXT;

-- W-A5: roles funcionales del taller
ALTER TABLE "talleres" ADD COLUMN "rolesFuncionales" JSONB;

-- W-A4: limpiar valores de escalabilidad que ya no se ofrecen
UPDATE "talleres" SET "escalabilidad" = NULL
WHERE "escalabilidad" IN ('no-puedo', 'horas-extra');
