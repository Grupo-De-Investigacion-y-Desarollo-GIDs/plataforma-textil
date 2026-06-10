-- U-05: re-sincroniza roles[]/activeMode con el escalar role.
--
-- Por qué existe: U-02 backfilleó estos campos una vez, pero las fuentes (registro,
-- registro/completar, seed) no los seteaban al crear users → el dato se vuelve a
-- desincronizar (dev en cada seed; prod en cada registro nuevo). Esta migración
-- re-sincroniza el dato histórico; el cierre de la fuente (en el mismo PR) evita que
-- se vuelva a ensuciar.
--
-- Idempotente y guardado: solo toca filas desincronizadas, nunca pisa decisiones
-- deliberadas (dual-role, activeMode elegido por el toggle U-04). Espeja literalmente
-- el backfill de U-02 (20260519200000), agregándole los WHERE de protección.

-- roles[] vacío -> [role]
-- El guard cardinality(roles)=0 protege a los dual (ej. Julieta ["TALLER","MARCA"]).
UPDATE "users"
   SET "roles" = ARRAY["role"::"UserRole"]
 WHERE cardinality("roles") = 0;

-- activeMode null -> role  (invariante role == activeMode para single-rol)
-- El guard activeMode IS NULL protege cualquier modo elegido por el toggle.
UPDATE "users"
   SET "activeMode" = "role"
 WHERE "activeMode" IS NULL;
