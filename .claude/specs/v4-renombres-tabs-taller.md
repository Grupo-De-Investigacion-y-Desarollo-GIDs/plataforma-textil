# Renombres de tabs del rol TALLER

## Contexto

Informe de navegacion de Sergio: los labels actuales de tabs y sidebar del rol TALLER no estan alineados con el modelo Showcase+Match del master V4 (secciones 3.1, 3.7, 3.14). Ademas, la capitalizacion es inconsistente (mezcla de Title Case y sentence case).

## Que cambiar

### Renombres (solo rol TALLER)

| Antes | Despues | Justificacion master |
|---|---|---|
| Tablero / Mi Tablero | Inicio | Coherencia con modelo 3.14 |
| Mis pedidos / Mis Pedidos | Pedidos | Simplificacion |
| Mi formalizacion / Mi Formalizacion | Mi recorrido | Master 3.7 — concepto de recorrido |
| Mi perfil / Mi Perfil | Mi vidriera | Master 3.1 — Showcase+Match |
| Academia | Cursos | Cercanía con el usuario (3.14) |
| Ayuda y Soporte | Ayuda | Simplificacion |

### Capitalizacion

Unificar a sentence case en header Y sidebar (todos los roles).

### aria-label

`"Menu de navegacion personal"` → `"Menu principal"`

## Archivos a modificar

1. `src/compartido/lib/content/institutional.ts` — TABS_BY_ROLE.TALLER (5 labels)
2. `src/compartido/componentes/layout/user-sidebar.tsx`:
   - TALLER: 5 labels renombrados
   - MARCA: capitalizacion (Directorio Talleres, Mis Pedidos, Mi Perfil)
   - ESTADO: capitalizacion (Exportar Datos)
   - Todos: Mi Cuenta → Mi cuenta
   - Footer: Ayuda y Soporte → Ayuda, Cerrar Sesion → Cerrar sesion
   - aria-label sidebar
3. `src/app/(taller)/taller/perfil/page.tsx` — h1 "Mi Perfil" → "Mi vidriera", Card "Certificados de Academia" → "Certificados de cursos"
4. `src/app/(taller)/taller/formalizacion/page.tsx` — h1 "Mi Formalizacion" → "Mi recorrido" (x2)
5. `src/app/(taller)/taller/aprender/page.tsx` — h1 "Academia" → "Cursos"
6. `src/app/(taller)/taller/aprender/[id]/page.tsx` — breadcrumb "Academia" → "Cursos"
7. `src/app/(taller)/taller/perfil/completar/page.tsx` — boton "Guardar e ir a Academia" → "Guardar e ir a Cursos"
8. `src/app/(public)/ayuda/page.tsx` — h1 "Ayuda y Soporte" → "Ayuda"
9. `tests/e2e/smoke.spec.ts` — selectores "Mis pedidos" y "Mi perfil"

## Decision clave

SOLO labels visibles. NO se tocan rutas (`/taller/perfil`), schema (`certificadosAcademiaMin`), ni nombres internos de componentes (`AcademiaCliente`, `AcademiaDetallePage`). Feature flags internos (`academia`) tambien quedan igual.

## Criterio de aceptacion

1. Header TALLER muestra: Inicio | Pedidos | Mi recorrido | Mi vidriera | Cursos
2. Sidebar TALLER muestra los mismos labels en sentence case
3. h1 y breadcrumbs de las paginas del taller reflejan los nuevos nombres
4. Sidebar de MARCA/ESTADO sin errores de capitalizacion
5. Test e2e smoke pasa con los nuevos selectores
6. Build sin errores
