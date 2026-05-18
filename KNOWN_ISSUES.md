# Known Issues

## CI - Tests E2E (RESUELTO 2026-05-18)

### Investigacion del patron de tests "flaky" preexistentes

**Sintoma:** 55% tasa de falla en CI develop (11/20 ultimos runs).
Cada PR tenia tests rojos que aparentemente no tenian relacion con
el cambio. La hipotesis inicial era "tests flaky preexistentes".

**Investigacion (17-18 mayo 2026):** los 4 tests fallidos tenian
causas raiz DISTINTAS entre si, todas arreglables:

| Test | Frecuencia | Causa raiz |
|------|------------|------------|
| smoke admin/logs | 11/11 | Doble navegacion (toHaveURL + goto) genera ERR_ABORTED |
| file-validation JPEG | 6/11 | State leak cross-run: config DB desactivada por otro test sin restaurar |
| demanda-insatisfecha tab | 4/11 | Locator `header` matchea tabs Y sidebar |
| exportes-estado informe | 2/11 | `getByText` matchea h2 Y div padre por substring |

### Fix aplicado (PR #346 + commit 7183d39)

1. **smoke:** simplificar el test (1 sola navegacion, assertions semanticas con getByRole)
2. **file-validation:** beforeAll que restaura config `imagenes-portfolio` al inicio
3. **demanda-insatisfecha:** locator `header nav` en vez de `header`
4. **exportes-estado:** `getByRole('heading')` en vez de `getByText`

### Lecciones operativas

1. **"Tests flaky preexistentes" suele ser bug arreglable, no inevitable.**
   No aceptar "preexistente" como diagnostico final sin investigacion.

2. **`page.goto()` defaultea a `waitUntil: 'load'`.**
   Eliminar el param explicito no cambia el comportamiento.
   La causa del ERR_ABORTED era la doble navegacion, no el param.

3. **Tests deben usar selectores semanticos** (getByRole, getByLabel)
   en vez de getByText cuando el texto puede aparecer en multiples elementos.

4. **`afterEach` con try/catch best-effort no protege contra state leaks.**
   Si el test falla antes del afterEach, el estado queda corrupto en DB compartida.
   Solucion: agregar `beforeAll` que garantice estado limpio al inicio.

### Deuda tecnica pendiente

- **DB compartida entre runs de CI** causa polucion potencial.
  - Mitigacion actual: `beforeAll` en tests mutables (file-validation)
  - Solucion ideal (no urgente): DB por preview o tests stateless

### Como detectar futuros "flaky" similares

```bash
# Listar tests que fallan recurrente en develop
gh run list --branch develop --limit 30 --json conclusion,databaseId --jq '.[] | select(.conclusion=="failure")'

# Para cada run fallido, ver tests fallidos
gh run view <id> --log-failed | grep -E "FAIL|✘"

# Si UN mismo test aparece en >50% de los fallos: bug deterministico
# Si tests DISTINTOS aparecen cada vez: state leak o timing
```
