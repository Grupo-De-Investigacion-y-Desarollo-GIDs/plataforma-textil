-- Backfill: popular aprobadoPor desde LogActividad para validaciones historicas
-- Best-effort: si el log fue purgado o no tiene entidadId, queda NULL (pre-V3)
UPDATE "validaciones" v
SET "aprobadoPor" = la."userId",
    "aprobadoEn" = la."timestamp"
FROM "log_actividad" la
WHERE la."accion" IN ('VALIDACION_APROBADA', 'ADMIN_VALIDACION_COMPLETADO')
  AND (la."detalles"->>'entidadId')::text = v."id"
  AND v."estado" IN ('COMPLETADO', 'RECHAZADO')
  AND v."aprobadoPor" IS NULL;
