-- Consentimiento legal en el registro (deuda técnica de auditoría):
-- el checkbox de T&C era solo client-side y no se persistía. Ahora el
-- POST /api/auth/registro exige aceptación y guarda versión + timestamp.
--
-- Ambas columnas son NULLABLE: cuentas previas a esta migración y altas
-- creadas por ADMIN (POST /api/admin/usuarios) no pasan por el flujo de
-- auto-registro y, por tanto, no registran consentimiento.

ALTER TABLE "users" ADD COLUMN "terminosAceptadosVersion" TEXT;
ALTER TABLE "users" ADD COLUMN "terminosAceptadosEn" TIMESTAMP(3);
