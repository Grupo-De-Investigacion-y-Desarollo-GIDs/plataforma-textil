# SPEC K-01 — Habilitar RLS en Supabase

> **Bloque:** K (Seguridad)
> **Prioridad:** Media-alta (no urgente pero si importante)
> **Fecha alerta:** 21-mayo-2026 (Supabase Security Advisor)
> **Estado:** Pendiente

## Contexto y motivacion

### Por que este spec

El Supabase Security Advisor reporto 2 vulnerabilidades criticas
en el proyecto plataforma-textil-dev (fjddgukwydsdcrqoxvns):

1. "Mesa de acceso publico" — RLS deshabilitada
2. "Datos sensibles accesibles al publico"

### Auditoria realizada (21-mayo-2026)

Verificacion empirica en preview (fjddgukwydsdcrqoxvns):

| Metrica | Valor |
|---------|-------|
| Tablas en schema public | 45 |
| Tablas con RLS = ON | 0 |
| Tablas con RLS = OFF | **45** |
| Politicas RLS definidas | 0 |
| Grants a rol `anon` | 0 |
| Grants a rol `authenticated` | 0 |
| `NEXT_PUBLIC_SUPABASE_*` en frontend | 0 |
| Supabase client usado server-side | Si (solo storage.ts) |
| Anon key expuesta en codigo | No |

**Otros schemas:**
- `storage.*`: 8 tablas con RLS ON, 0 politicas definidas
- `auth.*`: 14 tablas ON, 7 OFF (OAuth/WebAuthn recientes)

### Riesgo real

Hoy **NO hay leak tecnico** — la proteccion es accidental por falta de
grants al rol `anon`. PostgREST con la anon key devuelve `[]` en todas
las tablas.

**PERO la arquitectura es fragil:**
- Un solo `GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon` expondria TODO
- Va en contra de la mejor practica de Supabase (defense-in-depth)
- Auditoria OIT podria detectarlo como hallazgo de seguridad
- Cualquier tutorial de Supabase sugiere habilitar grants como primer paso

### Tablas con datos sensibles (prioridad de proteccion)

**Criticas:**
- `users` — emails, nombres, CUITs, datos ARCA
- `sessions`, `accounts` — tokens de autenticacion
- `magic_links`, `verification_tokens` — tokens de acceso
- `consultas_arca` — historial de verificaciones AFIP

**Sensibles:**
- `talleres`, `marcas` — datos comerciales, CUIT, domicilio
- `denuncias` — reportes confidenciales
- `validaciones` — documentos legales (DNI, escrituras AFIP)
- `notas_internas` — notas confidenciales de admin
- `observaciones_campo` — datos de campo de inspectores

**Datos de negocio:**
- `pedidos`, `cotizaciones`, `ordenes_manufactura` — flujo comercial
- `log_actividad` — audit trail completo

**Catalogos (riesgo bajo pero proteger igual):**
- `tipos_prenda`, `procesos_productivos`, `tipos_documento`
- `reglas_nivel`, `configuracion_sistema`

## Que construir

### Fase 1 — Habilitar RLS en todas las tablas (sin politicas)

```sql
-- Esto activa RLS pero como no hay grants a anon/authenticated,
-- el efecto practico es nulo. Es el primer paso seguro.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
-- ... (las 45 tablas)
```

Con RLS habilitada y sin politicas, el comportamiento es:
- `service_role` (usado por la app): sigue teniendo acceso total (bypassa RLS)
- `anon`/`authenticated`: acceso denegado por defecto (ni siquiera con grants)

### Fase 2 — Definir politicas por categoria

**Patron para tablas criticas (users, sessions, etc.):**
```sql
-- Solo service_role puede acceder (la app usa service_role via Prisma)
-- No crear politica = denegado por defecto para anon/authenticated
```

**Patron para datos publicos (novedades publicadas, catalogos):**
```sql
CREATE POLICY "Lectura publica de novedades publicadas"
  ON public.novedades FOR SELECT
  USING (published = true);
```

**Patron para datos del usuario autenticado:**
```sql
CREATE POLICY "Usuario ve sus propios datos"
  ON public.users FOR SELECT
  USING (auth.uid() = id);
```

> Nota: estas politicas solo aplican si en el futuro se agregan grants.
> Hoy la app usa service_role que bypassa RLS.

### Fase 3 — Auditar queries Prisma

Verificar que todas las queries Prisma siguen funcionando con RLS
habilitada. Como Prisma usa la connection string directa con el rol
`postgres` (o `service_role` via Supabase), no deberia haber impacto.

### Fase 4 — Aplicar en produccion

1. Aplicar en preview primero
2. Correr tests E2E completos
3. Verificar manualmente flujos criticos (login, validaciones, pedidos)
4. Aplicar en produccion con monitoreo
5. Verificar Supabase Security Advisor queda verde

## Prescripciones tecnicas

- **Crear migracion Prisma** con los ALTER TABLE statements
- **NO usar el dashboard de Supabase** para crear politicas (no queda en version control)
- Las politicas se crean via SQL en la migracion
- Usar `prisma migrate diff` para generar la migracion sin conexion local
- Testear en preview antes de prod

## Estimacion

| Tarea | Horas |
|-------|-------|
| Investigacion + diseno politicas | 4-6h |
| Implementacion (migracion SQL) | 6-8h |
| Testing intensivo (E2E + manual) | 4h |
| Aplicar a prod con monitoreo | 2h |
| **Total** | **16-20h** |

## Criterio de aceptacion

- [ ] Las 45 tablas del schema public tienen RLS = ON
- [ ] Supabase Security Advisor no muestra alertas de RLS
- [ ] Tests E2E pasan en preview (100%)
- [ ] Flujos criticos verificados manualmente (login, validaciones, pedidos)
- [ ] Migracion versionada en Prisma (no cambios manuales en dashboard)

## Notas

- El bucket "documentos" en prod esta como publico — eso va en K-02
- La app accede a la DB via `service_role`/`postgres` que bypassa RLS,
  por lo que habilitar RLS no deberia romper nada
- Si en el futuro se quiere usar Supabase Realtime o el cliente JS
  directo, las politicas RLS seran esenciales
