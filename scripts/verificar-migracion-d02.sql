-- Verificacion post-migracion D-02: tipos documento y reglas de nivel
-- Ejecutar despues del deploy a produccion

-- 1. Tipos de documento con puntosOtorgados por nivel
SELECT "nivelMinimo", "puntosOtorgados", COUNT(*) AS cantidad
FROM "tipos_documento"
WHERE activo = true
GROUP BY "nivelMinimo", "puntosOtorgados"
ORDER BY "nivelMinimo", "puntosOtorgados";

-- 2. Reglas de nivel (debe ser 3)
SELECT nivel, "puntosMinimos", "requiereVerificadoAfip",
       "certificadosAcademiaMin", array_length(beneficios, 1) AS num_beneficios
FROM "reglas_nivel"
ORDER BY "puntosMinimos";

-- 3. Resumen de talleres por nivel actual
SELECT nivel, COUNT(*) AS cantidad
FROM "talleres"
GROUP BY nivel
ORDER BY nivel;
