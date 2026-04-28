-- Verificacion post-migracion D-01: campo aprobadoPor en validaciones
-- Ejecutar manualmente despues del deploy a produccion
-- Documentar resultados en REVIEW_v3-redefinicion-roles-estado.md

-- 1. Resumen general
SELECT
  'Total COMPLETADO/RECHAZADO' AS metrica,
  COUNT(*) AS valor
FROM "validaciones"
WHERE "estado" IN ('COMPLETADO', 'RECHAZADO')

UNION ALL

SELECT
  'Con aprobadoPor poblado',
  COUNT(*)
FROM "validaciones"
WHERE "estado" IN ('COMPLETADO', 'RECHAZADO')
  AND "aprobadoPor" IS NOT NULL

UNION ALL

SELECT
  'Sin aprobadoPor (pre-V3)',
  COUNT(*)
FROM "validaciones"
WHERE "estado" IN ('COMPLETADO', 'RECHAZADO')
  AND "aprobadoPor" IS NULL;

-- 2. Detalle de validaciones sin aprobadoPor (revision manual)
SELECT v.id, v."tallerId", v.tipo, v.estado, v."createdAt",
       t.nombre AS taller_nombre
FROM "validaciones" v
JOIN "talleres" t ON t.id = v."tallerId"
WHERE v."estado" IN ('COMPLETADO', 'RECHAZADO')
  AND v."aprobadoPor" IS NULL
ORDER BY v."createdAt";

-- 3. Verificar que la FK funciona correctamente
SELECT v.id, v."aprobadoPor", u.name AS aprobador_nombre, u.role AS aprobador_rol
FROM "validaciones" v
JOIN "users" u ON u.id = v."aprobadoPor"
WHERE v."aprobadoPor" IS NOT NULL
ORDER BY v."aprobadoEn" DESC
LIMIT 10;
