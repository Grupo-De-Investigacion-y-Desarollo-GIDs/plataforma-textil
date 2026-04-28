-- Insertar configuraciones de upload iniciales (idempotente)
INSERT INTO "configuraciones_upload" ("id", "contexto", "nombre", "descripcion", "tiposPermitidos", "tamanoMaximoMB", "activo", "createdAt", "updatedAt")
VALUES
  ('seed-doc-form', 'documentos-formalizacion', 'Documentos de formalización', 'Documentos que el taller sube para validar su nivel (ART, monotributo, habilitaciones)', ARRAY['pdf', 'jpeg', 'png'], 5, true, NOW(), NOW()),
  ('seed-img-port', 'imagenes-portfolio', 'Imágenes de portfolio del taller', 'Fotos de trabajo y producción del taller', ARRAY['jpeg', 'png', 'webp'], 5, true, NOW(), NOW()),
  ('seed-img-ped', 'imagenes-pedido', 'Imágenes de referencia de pedidos', 'Fotos que la marca adjunta al crear un pedido', ARRAY['jpeg', 'png', 'webp'], 5, true, NOW(), NOW())
ON CONFLICT ("contexto") DO NOTHING;
