-- Seed: reglas de nivel iniciales (ON CONFLICT para idempotencia)
INSERT INTO "reglas_nivel" ("id", "nivel", "puntosMinimos", "requiereVerificadoAfip", "certificadosAcademiaMin", "descripcion", "beneficios", "createdAt", "updatedAt")
VALUES
  ('regla-bronce', 'BRONCE', 0, false, 0, 'Nivel inicial — el taller esta registrado en la plataforma', ARRAY['Aparece en el directorio publico', 'Recibe pedidos compatibles con su capacidad'], NOW(), NOW()),
  ('regla-plata', 'PLATA', 50, true, 1, 'El taller demuestra formalizacion basica y compromiso con la capacitacion', ARRAY['Aparece mas arriba en el directorio', 'Acceso a pedidos de marcas medianas', 'Distintivo PLATA visible'], NOW(), NOW()),
  ('regla-oro', 'ORO', 100, true, 0, 'Taller plenamente formalizado con capacitacion avanzada', ARRAY['Top del directorio', 'Acceso a marcas grandes', 'Invitaciones directas a pedidos premium', 'Distintivo ORO visible'], NOW(), NOW())
ON CONFLICT ("nivel") DO NOTHING;
