---
name: spec-v4-implementation
description: |
  Checklist y guía para implementar specs V4 del proyecto PDT.
  Cubre verificaciones previas obligatorias (grep de tokens en uso, schema, etc.),
  estructura de branches y PRs, integración con metodología V4 de 12 secciones,
  y manejo correcto de archivos críticos (globals.css, schema.prisma, workflows).
trigger: |
  Cuando se va a implementar un spec V4 (archivos v4-*.md en .claude/specs/).
  Cuando se va a crear un branch feature/v4-[id]-[slug].
  Cuando se va a modificar archivos críticos compartidos (globals.css, schema, middleware, auth).
  Antes de hacer cambios destructivos en producción o dev.
---

# Spec V4 implementation guide para PDT

Este skill captura el proceso correcto para implementar specs V4 sin romper cosas.

---

## 1. Antes de empezar cualquier spec

### Verificaciones obligatorias

1. **Leer el spec completo**: las 12 secciones de `TEMPLATE_SPEC_V4`
2. **Identificar dependencias**: ¿qué specs deben estar mergeados antes?
3. **Identificar archivos críticos** que se van a tocar
4. **Estimar tiempo realista**: si el spec dice 2h y vos pensás 6h, advertirlo antes

### Estado del repo antes de arrancar

```bash
# Confirmar que develop está actualizado
git checkout develop
git pull origin develop

# Verificar CI verde en último merge a develop
gh run list --branch develop --limit 1

# Crear branch limpio
git checkout -b feature/v4-[id]-[slug]
```

**Convención de naming:**

```
feature/v4-x-01-tokens        ← spec del bloque X
feature/v4-u-03-multi-rol     ← spec del bloque U
chore/qa-v4-publishing        ← infraestructura, no spec
fix/breadcrumb-selectors      ← bugfix puntual
```

---

## 2. Verificaciones previas a modificar archivos críticos

### Antes de tocar `src/app/globals.css`

```bash
# 1. Identificar tokens en uso activo
grep -rn "brand-blue\|brand-red\|brand-bg-light\|brand-topbar\|brand-tabnav\|status-muted\|status-success\|status-warning\|status-error" src/ --include="*.tsx" --include="*.ts" | head -30

# 2. Identificar @keyframes en uso
grep -A 5 "@keyframes" src/app/globals.css

# 3. Identificar usos de @theme inline (tokens Tailwind v4)
grep -n "@theme inline" src/app/globals.css
```

**Regla:** si un token aparece en código, NO eliminarlo de `@theme inline` aunque esté siendo "renombrado". Mantener compatibilidad con un alias.

### Antes de tocar `prisma/schema.prisma`

```bash
# Ver migraciones pendientes
npx prisma migrate status

# Si hay cambios al schema, generar migration:
npx prisma migrate dev --name [nombre_descriptivo]

# NO hacer prisma db push en producción
```

**Regla:** cualquier cambio al schema requiere migration. NO usar `db push` para cambios de producto.

### Antes de tocar `src/middleware.ts`

Verificar el array `publicRoutes`:

```bash
grep -A 20 "publicRoutes" src/middleware.ts
```

Si agregás rutas nuevas al middleware, considerar si deben ser públicas (no requerir auth) y agregarlas a `publicRoutes` si corresponde.

### Antes de tocar workflows

```bash
# Validar YAML antes de pushear
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/[archivo].yml'))" && echo "YAML válido"
```

---

## 3. Comandos destructivos: protocolo de seguridad

### Antes de borrar datos de producción

1. **Confirmar qué base es producción**: `vercel env ls | grep DATABASE_URL`
2. **Hacer backup si es razonable**: snapshot manual en Supabase
3. **Usar transacciones atómicas**: `BEGIN; ... COMMIT;` con verificación intermedia
4. **Documentar antes**: snapshot de qué había antes del borrado

### Plantilla de borrado seguro

```sql
BEGIN;

-- Borrados en orden por foreign keys (hojas → raíces)
DELETE FROM tabla_dependiente_1;
DELETE FROM tabla_dependiente_2;
-- ...
DELETE FROM tabla_principal;

-- Verificación dentro de la transacción
SELECT
  (SELECT COUNT(*) FROM tabla_principal) as principal,
  (SELECT COUNT(*) FROM tabla_que_se_mantiene) as preservada;

-- Si todo OK: COMMIT
-- Si algo raro: ROLLBACK
COMMIT;
```

### Regla

**NUNCA hacer `DELETE` sin `WHERE` ni `TRUNCATE` en producción sin transacción atómica.**

### Bug histórico evitado

Durante la limpieza de producción para piloto OIT, usamos `BEGIN; ... COMMIT;` con verificación intermedia. 1604 rows borradas sin perder configuración institucional (16 flags + 7 tipos doc + 3 reglas).

---

## 4. Estructura de un PR de spec V4

### Commits sugeridos

```
1. feat(visual): tokens v4 (paleta extendida + tipografías)
   - El cambio principal del spec

2. docs(handover): architecture tokens V4 + decisión 22
   - Actualización de .claude/specs/handover/ARCHITECTURE.md
   - Entrada en DECISIONS.md

3. (opcional) fix(e2e): ajustes a tests que rompen con el cambio
   - Si el spec impacta tests existentes
```

### Estructura del PR body

```markdown
## Spec implementado

`v4-x-01-tokens` — Tokens visuales V4

## Cambios principales

- Reemplaza `@theme inline` en `src/app/globals.css` con paleta V4
- Agrega fuentes Inter y Source Serif 4 en `public/fonts/`
- Body color: `#1e2dbe` → `#0F0F1E` (casi-negro)

## Verificaciones

- [x] Build pasa local (`npm run build`)
- [x] Tests E2E pasan en CI
- [x] Tokens legacy preservados (`--brand-blue`, `--brand-red`, etc.)
- [x] Animaciones preservadas (`progress-fill`, `slide-in-right`)

## Validación visual pendiente

- [ ] Body text gris oscuro en `dev.plataformatextil.com.ar`
- [ ] H1 en Source Serif 4 en landing
- [ ] Fuentes cargan correctamente (Network tab)
```

---

## 5. Política de merge

### Criterios para mergear a develop

- [x] CI verde **sin retries enmascarando** (mirar contador "flaky", no solo "passed")
- [x] Verificación visual o funcional en preview URL del PR
- [x] Handover actualizado (`ARCHITECTURE.md`, `DECISIONS.md` si aplica)
- [x] QA V4 creado (si el spec lo requiere)

### Cuándo merge develop → main (producción)

Producción se actualiza por **bloques completos**, no por specs individuales:

- ✅ Bloque X completo (Spec X-01 a X-11) → merge a main
- ❌ Spec X-03 solo → NO merge a main todavía

Excepciones:
- **Bugfixes críticos**: hotfix directo a main
- **Documentación**: handover institucional puede ir a main solo
- **Infrastructure**: puede ir a main si beneficia inmediato

---

## 6. Manejo de fuentes y archivos binarios

### Self-hosting de fuentes

El proyecto usa self-hosting (no Google Fonts CDN). Las fuentes van en `public/fonts/`.

### Para agregar una fuente

```bash
# 1. Descargar la fuente variable .woff2 de su repo oficial
# Para Inter:
curl -L -o public/fonts/Inter-Variable.woff2 \
  "https://github.com/rsms/inter/raw/master/docs/font-files/InterVariable.woff2"

# Para Source Serif 4:
curl -L -o public/fonts/SourceSerif4-Variable.woff2 \
  "https://github.com/adobe-fonts/source-serif/raw/release/WOFF2/VAR/SourceSerif4Variable-Roman.ttf.woff2"

# 2. Verificar que se descargó archivo válido
file public/fonts/Inter-Variable.woff2  # debe decir "Web Open Font Format 2"
ls -lh public/fonts/  # tamaños razonables: 100-500 KB

# 3. Declarar en globals.css
# @font-face { font-family: 'Inter'; src: url('/fonts/Inter-Variable.woff2') format('woff2'); }
```

### Verificar que las fuentes cargan en preview

```bash
curl -I https://[preview-url]/fonts/Inter-Variable.woff2
# Esperado: HTTP/2 200
```

---

## 7. Validación interdisciplinaria

Cada spec V4 tiene sección 3 con perspectivas. Al implementar:

1. Releer las decisiones tomadas en sección 3
2. Asegurar que la implementación las respeta
3. Si hay duda durante implementación: consultar al spec, no improvisar

### Perspectivas comunes

- **Politólogo**: lenguaje no estigmatizante, no SaaS B2B
- **Sociólogo**: identificación visual del sector (terracotta = textil)
- **Economista**: incentivos del modelo (formalización como pathway)
- **Contador**: implicaciones tributarias del CUIT
- **Sectorial**: conocimiento del rubro textil (Sergio en V4)

---

## 8. QA después del spec

Cada spec V4 requiere QA siguiendo `TEMPLATE_QA_V4`. El QA:

- Va en `.claude/auditorias/QA_v4-[id]-[slug].md`
- Sigue los 6 ejes ajustados de la metodología V4
- Reporta items que requieren validación manual de Gerardo
- Se publica en GitHub Pages automáticamente (si el workflow está actualizado)

### Workflow de publicación

`.github/workflows/qa-pages.yml` debe incluir el pattern `QA_v4-*.md` en:
- `paths` del trigger
- Loop de generación de HTML
- Filtro del index

Ver skill `github-workflows-patterns` para detalles.

---

## 9. Checklist completo al terminar un spec

Antes de mergear el PR:

- [ ] CI completamente verde (Vercel + E2E con 0 failed, ≤2 flakies)
- [ ] Mirar contador "flaky" del reporte de Playwright (no solo "passed")
- [ ] Verificación visual en preview URL del PR
- [ ] Handover actualizado:
  - [ ] `ARCHITECTURE.md` si hay cambios estructurales
  - [ ] `DECISIONS.md` si hay decisiones nuevas
  - [ ] `KNOWN_ISSUES.md` si quedaron flakies o bugs documentados
- [ ] QA V4 creado en `.claude/auditorias/`
- [ ] Items manuales del QA validados por Gerardo

Después del merge a develop:

- [ ] `dev.plataformatextil.com.ar` carga correctamente
- [ ] Spec funciona como esperado en dev
- [ ] Branch del PR eliminado

---

## 10. Cuándo NO avanzar y parar

### Señales de que hay que parar y replantear

1. **Llevás 3+ intentos de fix sin progreso claro**: parar, replantear hipótesis
2. **Claude Code está en loop trial-and-error**: pedir reporte de evidencia
3. **El test "pasa en retry" pero querés mergear**: no, investigar primero
4. **El error no encaja con ninguna hipótesis razonable**: pedir reporte completo de logs
5. **Estás cansado o frustrado**: pausar y retomar al día siguiente

### Bug histórico

PR #318: 5 horas debuggeando timeouts de ESTADO. Causa real: un secret mal cargado en GitHub Secrets que estaba ahí desde V3. **Si hubiéramos verificado credenciales al principio, habríamos ahorrado las 5 horas.**

**Lección:** ver skill `debugging-methodology` para la metodología correcta.

---

## 11. Resumen ejecutivo

| Etapa | Acción clave |
|---|---|
| Antes de empezar | Leer spec completo, verificar dependencias, branch limpio |
| Antes de tocar globals.css | Grep tokens y animaciones en uso |
| Antes de schema changes | Migration, NO db push en producción |
| Comandos destructivos | Transacción atómica con verificación |
| Self-hosting fuentes | Verificar `file` + tamaño antes de commit |
| Estructura PR | Spec + handover + (opcional) fix tests |
| Antes de merge | CI verde sin retries, handover actualizado, QA |
| Producción | Solo bloques completos, hotfixes son excepción |
| Cuando algo no anda | Parar a los 3 intentos, ver `debugging-methodology` |
