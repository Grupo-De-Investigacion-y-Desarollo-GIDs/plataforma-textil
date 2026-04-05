-- CreateIndex
CREATE INDEX "validaciones_estado_idx" ON "validaciones"("estado");

-- CreateIndex
CREATE INDEX "validaciones_tallerId_idx" ON "validaciones"("tallerId");

-- CreateIndex
CREATE INDEX "certificados_fecha_idx" ON "certificados"("fecha");

-- CreateIndex
CREATE INDEX "log_actividad_accion_timestamp_idx" ON "log_actividad"("accion", "timestamp");

-- CreateIndex
CREATE INDEX "log_actividad_userId_idx" ON "log_actividad"("userId");

-- CreateIndex
CREATE INDEX "denuncias_estado_idx" ON "denuncias"("estado");
