# QA: Fix de tests E2E de seguridad + ampliación de cobertura

**Spec:** `v2-seguridad-tests-e2e.md`
**Commit de implementación:** `2f7407b`
**URL de prueba:** https://plataforma-textil.vercel.app
**Fecha:** 2026-04-14
**Auditor:** Sergio

---

## Cómo trabajar con este documento

1. Abrí este archivo y la plataforma en paralelo
2. Seguí los pasos en orden — cada paso depende del anterior
3. Marcá cada resultado con ✅ (ok), 🐛 (bug menor) o ❌ (bloqueante)
4. Si el resultado no es ✅ → abrí el widget azul "Feedback" en esa página → tipo [bug/falta] → describí qué pasó
5. Quedate en la página donde encontraste el problema antes de abrir el widget (captura la URL automáticamente)
6. Al terminar, completá el resultado global y commiteá este archivo actualizado

**Regla de oro:** un issue por hallazgo, desde la página donde ocurre.

> **IMPORTANTE — Este spec es de seguridad.** Es tan importante verificar que los accesos bloqueados funcionan como que los accesos permitidos funcionan. Reportá como **bug crítico** cualquier caso donde un rol accede a una ruta que no debería. Si un rol puede ver contenido de admin, estado o de otro rol sin autorización, es un issue bloqueante.

> **Nota:** si los hallazgos no aparecen en GitHub Issues, verificar que `GITHUB_TOKEN` y `GITHUB_REPO` están configurados en Vercel. Los hallazgos siempre quedan registrados en la DB aunque el token no esté configurado — se pueden ver en `/admin` desde `LogActividad`.

---

## Credenciales de prueba

| Rol | Email | Password | URL de entrada |
|-----|-------|----------|----------------|
| ADMIN | `lucia.fernandez@pdt.org.ar` | `pdt2026` | `/admin` |
| TALLER Bronce | `roberto.gimenez@pdt.org.ar` | `pdt2026` | `/taller` |
| TALLER Oro | `carlos.mendoza@pdt.org.ar` | `pdt2026` | `/taller` |
| MARCA | `martin.echevarria@pdt.org.ar` | `pdt2026` | `/marca` |
| ESTADO | `anabelen.torres@pdt.org.ar` | `pdt2026` | `/estado` |
| CONTENIDO | `sofia.martinez@pdt.org.ar` | `pdt2026` | `/contenido` |
| Sin login | — | — | `/` |

---

## Resultado global

- [ ] ✅ Aprobado — todo funciona
- [ ] 🔧 Aprobado con fixes — funciona pero hay bugs menores
- [ ] ❌ Rechazado — falta funcionalidad o hay bugs bloqueantes

**Decisión:** [ cerrar v2 / fix inmediato / abrir ítem v3 ]
**Issues abiertos:** #

---

## Eje 1 — Funcionalidad

Verificar que cada criterio de aceptación del spec está implementado.

| # | Criterio | Resultado | Issue |
|---|----------|-----------|-------|
| 1 | Helper `assertAccesoBloqueado` agregado a `e2e/helpers/auth.ts` | | |
| 2 | Union type de `loginAs` extendido con `'contenido'` | | |
| 3 | Credencial `contenido` agregada al record (sin duplicar `estado`) | | |
| 4 | Tests 8.1, 8.2, 8.3 de `e2e/checklist-sec7-8.spec.ts` reescritos usando el helper | | |
| 5 | Archivo nuevo `e2e/seguridad-roles.spec.ts` con 10 tests de ampliación | | |
| 6 | Las 3 rutas asumidas (`/admin/auditorias`, `/admin/usuarios`, `/admin/colecciones`) existen como páginas | | |
| 7 | Build de TypeScript pasa sin errores | | |

---

## Eje 2 — Navegabilidad (verificación manual de seguridad)

> **Instrucciones:** Para cada paso, hacé login con el rol indicado, intentá acceder a la URL, y verificá el resultado. Cerrá sesión entre cada paso (o usá ventana de incógnito) para asegurarte de que estás con el rol correcto.

### Paso 1 — ESTADO bloqueado en /admin/usuarios

- **Rol:** ESTADO (anabelen.torres@pdt.org.ar / pdt2026)
- **URL de destino:** `/admin/usuarios`
- **Acción:**
  1. Login como Ana Belén Torres (ESTADO)
  2. Escribir directamente en la barra de direcciones: `/admin/usuarios`
  3. Presionar Enter
- **Esperado:** El sistema redirige a `/unauthorized` o muestra una página con texto **"Acceso No Autorizado"** y **"No tienes permiso para acceder a esta sección"**. NO se ve la lista de usuarios del admin
- **Resultado:**
- **Notas:** Si se muestra la lista de usuarios, es un bug de seguridad BLOQUEANTE — el middleware no bloquea ESTADO de /admin/usuarios

### Paso 2 — CONTENIDO bloqueado en /admin/usuarios

- **Rol:** CONTENIDO (sofia.martinez@pdt.org.ar / pdt2026)
- **URL de destino:** `/admin/usuarios`
- **Acción:**
  1. Cerrar sesión, login como Sofía Martínez (CONTENIDO)
  2. Navegar a `/admin/usuarios`
- **Esperado:** Redirige a `/unauthorized` o muestra "Acceso No Autorizado". NO se ve la lista de usuarios
- **Resultado:**
- **Notas:**

### Paso 3 — CONTENIDO bloqueado en /taller

- **Rol:** CONTENIDO (sofia.martinez@pdt.org.ar / pdt2026)
- **URL de destino:** `/taller`
- **Acción:**
  1. Sin cerrar sesión (sigue como CONTENIDO)
  2. Navegar a `/taller`
- **Esperado:** Redirige a `/unauthorized` o muestra "Acceso No Autorizado". NO se ve el dashboard de taller
- **Resultado:**
- **Notas:**

### Paso 4 — MARCA bloqueado en /estado

- **Rol:** MARCA (martin.echevarria@pdt.org.ar / pdt2026)
- **URL de destino:** `/estado`
- **Acción:**
  1. Cerrar sesión, login como Martín Echevarría (MARCA)
  2. Navegar a `/estado`
- **Esperado:** Redirige a `/unauthorized` o muestra "Acceso No Autorizado". NO se ve el dashboard del Estado
- **Resultado:**
- **Notas:**

### Paso 5 — MARCA bloqueado en /admin

- **Rol:** MARCA (martin.echevarria@pdt.org.ar / pdt2026)
- **URL de destino:** `/admin`
- **Acción:**
  1. Sin cerrar sesión (sigue como MARCA)
  2. Navegar a `/admin`
- **Esperado:** Redirige a `/unauthorized` o muestra "Acceso No Autorizado". NO se ve el panel de admin
- **Resultado:**
- **Notas:**

### Paso 6 — TALLER bloqueado en /marca

- **Rol:** TALLER Bronce (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de destino:** `/marca`
- **Acción:**
  1. Cerrar sesión, login como Roberto Giménez (TALLER Bronce)
  2. Navegar a `/marca`
- **Esperado:** Redirige a `/unauthorized` o muestra "Acceso No Autorizado". NO se ve el panel de marca
- **Resultado:**
- **Notas:**

### Paso 7 — ESTADO SÍ accede a /admin/auditorias

- **Rol:** ESTADO (anabelen.torres@pdt.org.ar / pdt2026)
- **URL de destino:** `/admin/auditorias`
- **Acción:**
  1. Cerrar sesión, login como Ana Belén Torres (ESTADO)
  2. Navegar a `/admin/auditorias`
- **Esperado:** La página carga normalmente. Se ve el contenido de auditorías (puede ser una tabla, un listado o al menos el layout del admin). La URL sigue siendo `/admin/auditorias`, NO redirige a `/unauthorized`
- **Resultado:**
- **Notas:** ESTADO tiene permiso especial para acceder a rutas específicas de /admin como auditorías

### Paso 8 — CONTENIDO SÍ accede a /admin/colecciones

- **Rol:** CONTENIDO (sofia.martinez@pdt.org.ar / pdt2026)
- **URL de destino:** `/admin/colecciones`
- **Acción:**
  1. Cerrar sesión, login como Sofía Martínez (CONTENIDO)
  2. Navegar a `/admin/colecciones`
- **Esperado:** La página carga normalmente. Se ve el contenido de colecciones. La URL sigue siendo `/admin/colecciones`, NO redirige a `/unauthorized`
- **Resultado:**
- **Notas:** CONTENIDO tiene permiso para gestionar colecciones dentro de /admin

### Paso 9 — ADMIN SÍ accede a /estado

- **Rol:** ADMIN (lucia.fernandez@pdt.org.ar / pdt2026)
- **URL de destino:** `/estado`
- **Acción:**
  1. Cerrar sesión, login como Lucía Fernández (ADMIN)
  2. Navegar a `/estado`
- **Esperado:** La página carga normalmente. Se ve el dashboard del Estado. La URL contiene `/estado`, NO redirige a `/unauthorized`
- **Resultado:**
- **Notas:** ADMIN tiene acceso universal a todas las secciones

### Paso 10 — ADMIN SÍ accede a /contenido

- **Rol:** ADMIN (lucia.fernandez@pdt.org.ar / pdt2026)
- **URL de destino:** `/contenido`
- **Acción:**
  1. Sin cerrar sesión (sigue como ADMIN)
  2. Navegar a `/contenido`
- **Esperado:** La página carga normalmente. Se ve el panel de contenido. La URL contiene `/contenido`, NO redirige a `/unauthorized`
- **Resultado:**
- **Notas:**

### Paso 11 — Sin login: todas las rutas protegidas redirigen a /login

- **Rol:** Sin login (ventana de incógnito o cerrar sesión)
- **URL de destino:** `/taller`, `/marca`, `/admin`, `/estado`
- **Acción:**
  1. Cerrar sesión completamente (o abrir ventana de incógnito)
  2. Intentar acceder a cada una de estas URLs:
     - `/taller`
     - `/marca`
     - `/admin`
     - `/estado`
  3. Verificar adónde redirige cada una
- **Esperado:** Las 4 URLs redirigen a `/login` (posiblemente con un `callbackUrl` en el query string). NO se ve contenido de ninguna sección protegida
- **Resultado:**
- **Notas:** Si alguna ruta carga contenido sin login, es un bug de seguridad BLOQUEANTE

---

## Eje 3 — Casos borde

| # | Caso | Acción | Esperado | Resultado |
|---|------|--------|----------|-----------|
| 1 | Página `/unauthorized` muestra texto correcto | Provocar un bloqueo (ej: TALLER → /admin) y leer la página | Título: "Acceso No Autorizado", párrafo: "No tienes permiso para acceder a esta sección de la plataforma" | |
| 2 | URL se mantiene en `/unauthorized` | Verificar la barra de direcciones cuando se bloquea un acceso | La URL final es `/unauthorized`, no la ruta original ni `/login` | |
| 3 | Acceso bloqueado no muestra flash de contenido | Al navegar a una ruta prohibida, observar si se ve brevemente el contenido antes del redirect | No debe haber flash — la redirección ocurre antes de renderizar contenido | |
| 4 | Doble navegación no bypasea | Desde `/unauthorized`, presionar "Atrás" y volver a la ruta prohibida | Vuelve a redirigir a `/unauthorized` — no se queda en la ruta prohibida | |

---

## Eje 4 — Performance

| Verificación | Método | Resultado |
|-------------|--------|-----------|
| Redirección a `/unauthorized` ocurre en < 2s | Navegar a ruta bloqueada → medir tiempo hasta la página de error | |
| Redirección a `/login` (sin sesión) ocurre en < 2s | Sin login → navegar a ruta protegida → medir tiempo hasta /login | |
| Sin errores en consola del browser | DevTools → Console → revisar durante las navegaciones bloqueadas | |
| `/unauthorized` carga sin errores | DevTools → Console → verificar que la página de error no tiene errores JS | |

---

## Eje 5 — Consistencia visual

| Verificación | Resultado | Notas |
|-------------|-----------|-------|
| Página `/unauthorized` tiene el layout de la plataforma (header, etc.) | | |
| Texto "Acceso No Autorizado" en tipografía consistente | | |
| No hay botones o links rotos en la página de error | | |
| La página de login muestra los campos de email y password correctamente | | |

---

## Resumen de issues abiertos

| Issue | Tipo | Descripción | Prioridad sugerida |
|-------|------|-------------|-------------------|
| — | — | — | — |

---

## Notas del auditor

**Nota sobre la criticidad de estos tests:** Este QA verifica que el sistema de control de acceso por roles funciona correctamente. Un fallo en cualquiera de los pasos 1-6 (accesos que deben ser bloqueados) es un bug de seguridad bloqueante. Un fallo en los pasos 7-10 (accesos que deben ser permitidos) es un bug funcional bloqueante. Ambos tipos requieren fix inmediato.

**Nota sobre los falsos positivos originales (H-22, H-23, H-24):** Los hallazgos originales reportaban que TALLER podía acceder a /admin y /estado, y que MARCA podía acceder a /taller. Eran falsos positivos: el middleware redirigía correctamente a `/unauthorized`, pero los tests buscaban `"No autorizado"` (minúscula) y `"Acceso denegado"` (texto inexistente). La página real dice `"Acceso No Autorizado"` (con N mayúscula). El fix usa `toLowerCase()` para hacer la comparación case-insensitive.

**Nota sobre los tests E2E automatizados:** Además de esta verificación manual, existen 13 tests E2E de Playwright que cubren estos mismos escenarios. Para correrlos contra producción:
```bash
BASE_URL=https://plataforma-textil.vercel.app npx playwright test e2e/checklist-sec7-8.spec.ts e2e/seguridad-roles.spec.ts
```
Los tests NO corren contra localhost por un issue conocido de NextAuth v5 + Next.js 16 en dev mode.

---

## Checklist de cierre

- [ ] 7 criterios de aceptación del spec verificados
- [ ] 11 pasos de navegación probados (6 bloqueos + 4 accesos permitidos + 1 sin login)
- [ ] 4 casos borde probados
- [ ] Performance revisada
- [ ] Issues abiertos en GitHub con labels correctos
- [ ] Resultado global definido
- [ ] Documento commiteado a develop
