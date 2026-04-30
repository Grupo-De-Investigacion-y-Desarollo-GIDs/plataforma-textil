# REVIEW: Acceso pre-formalizacion y niveles privados

**Fecha:** 2026-04-29
**Autor:** Gerardo (implementacion Claude Code)
**Origen:** Decision directa OIT — talleres informales, niveles internos, credenciales publicas

---

## Resumen ejecutivo

Implementa 3 cambios estructurales decididos por OIT para el piloto:
1. **Niveles internos** — BRONCE/PLATA/ORO visibles solo para el taller y ESTADO/ADMIN
2. **Credenciales publicas** — marcas y publico ven documentos verificados individuales (ART, Monotributo, etc.)
3. **Acceso restringido** — talleres sin CUIT verificado pueden navegar y capacitarse pero no cotizar ni aparecer en directorio

---

## Cambios al codigo

### API Guards (3 archivos)

| Archivo | Cambio |
|---------|--------|
| `src/app/api/cotizaciones/route.ts` | Guard `verificadoAfip` en POST → 403 `TALLER_NO_VERIFICADO` |
| `src/app/api/talleres/route.ts` | `verificadoAfip: true` en where clause de GET |
| `src/app/api/pedidos/[id]/invitaciones/route.ts` | Validacion de talleres verificados antes de invitar |

### Ocultamiento de niveles (8 archivos)

| Archivo | Cambio |
|---------|--------|
| `src/app/(public)/directorio/page.tsx` | Quitar filtro nivel + badge, agregar `verificadoAfip: true` + credenciales |
| `src/app/(public)/perfil/[id]/page.tsx` | Quitar badge nivel, agregar credenciales verificadas |
| `src/app/(marca)/marca/directorio/page.tsx` | Quitar filtro nivel + badge, agregar verificadoAfip + credenciales |
| `src/app/(marca)/marca/directorio/[id]/page.tsx` | Quitar badge nivel, agregar credenciales, limpiar ContactarTaller props |
| `src/app/(marca)/marca/pedidos/[id]/page.tsx` | Quitar nivel de cotizaciones y ordenes display |
| `src/marca/componentes/invitar-a-cotizar.tsx` | Quitar Badge de nivel de busqueda y confirmacion |
| `src/marca/componentes/contactar-taller.tsx` | Quitar `nivel` de interface (dead prop) |
| `src/compartido/componentes/pdf/orden-pdf.tsx` + route | Eliminar "Nivel PDT" del PDF |

### UI taller y ESTADO (4 archivos)

| Archivo | Cambio |
|---------|--------|
| `src/app/(taller)/taller/page.tsx` | Banner amber para talleres no verificados |
| `src/app/(taller)/taller/pedidos/disponibles/page.tsx` | Banner + "Ver detalle" vs "Ver y cotizar" |
| `src/app/(taller)/taller/pedidos/disponibles/[id]/page.tsx` | Banner + link a formalizacion en vez de CotizarForm |
| `src/app/(estado)/estado/talleres/page.tsx` | Filtro verificacion AFIP + stat card + badge en tabla |

### Datos (0 cambios de schema)

No se modifico el schema de Prisma. El campo `verificadoAfip` ya existia en el modelo Taller. Los cambios son puramente de comportamiento (queries, guards, UI).

---

## Decisiones arquitectonicas

### 1. No hay schema changes

`verificadoAfip: Boolean @default(false)` ya existe. Las credenciales se modelan con la relacion existente `Validacion` → `TipoDocumento`. No se necesita ningun campo nuevo.

### 2. Credenciales automaticas (Caso A)

Todas las validaciones con `estado: COMPLETADO` se muestran automaticamente. No hay control granular del taller sobre que credenciales exhibir. Decidido por OIT para el piloto — control granular queda como V4 G-02.

### 3. Cotizaciones existentes no afectadas

Las restricciones aplican solo a NUEVAS acciones. Cotizaciones ya enviadas de talleres que podrian perder verificacion siguen visibles y aceptables. El guard esta en POST, no en GET.

### 4. PDF sin nivel

El PDF de orden de manufactura ya no incluye "Nivel PDT". El nombre + CUIT del taller es suficiente para identificacion comercial y contable.

---

## Riesgos

| Riesgo | Mitigacion | Probabilidad |
|--------|-----------|--------------|
| Talleres del seed sin docs completados → credenciales vacias | Los directorios muestran credenciales solo si existen. No se muestra seccion vacia | Baja |
| Todos los talleres del seed tienen verificadoAfip: true → no se puede testear el flujo restringido en E2E | Instrucciones en PRUEBAS_PENDIENTES para testear via SQL temporal | Media |
| Marcas pierden informacion util (nivel) para evaluar talleres | Credenciales granulares dan mas informacion que un nivel agregado. Decision de OIT | Baja |

---

## Mensaje para OIT

### Implementacion completada: Acceso pre-formalizacion y niveles privados

Se implementaron las 3 decisiones tomadas en la reunion:

**1. Niveles internos**
Los niveles BRONCE/PLATA/ORO ya no son visibles para marcas ni el publico. Se eliminaron de: directorio publico, directorio marca, perfil publico, detalle de taller en marca, cotizaciones, ordenes, modal de invitacion, y PDF de orden. Siguen visibles para: el taller en su propio dashboard, ESTADO en su panel de talleres, y ADMIN.

**2. Credenciales publicas**
En reemplazo del nivel, las marcas y el publico ven credenciales individuales verificadas: "CUIT verificado", "ART", "Monotributo", etc. Cada credencial corresponde a un documento aprobado por ESTADO. Para el piloto, todas las credenciales completadas se muestran automaticamente.

**3. Acceso restringido para talleres sin CUIT verificado**
- Pueden: registrarse, navegar la plataforma, capacitarse, subir documentos para verificacion
- No pueden: cotizar pedidos, aparecer en directorio, ser invitados por marcas
- Ven: banner informativo constructivo ("Tu taller esta en proceso de formalizacion") con link directo a la seccion de formalizacion
- ESTADO: puede filtrar talleres "Sin verificar" en su panel y tiene conteo visible

**Tests:** 6 tests unitarios + 3 E2E + 210/210 suite completo pasando.

**Pendiente para V4 (si el feedback lo justifica):** permitir al taller elegir que credenciales exhibir en su perfil publico.

---

## Checklist de cierre

- [x] Todos los API guards implementados y testeados
- [x] 8 archivos con nivel oculto para marca/publico
- [x] 10 archivos con nivel visible para taller/estado/admin (sin cambios)
- [x] Banners constructivos para talleres no verificados
- [x] Filtro verificacion AFIP en ESTADO
- [x] 6 Vitest tests + 3 E2E tests
- [x] 210/210 tests pasan
- [x] TypeScript 0 errores
- [x] QA HTML con Eje 6 (24 items funcionalidad)
- [x] PRUEBAS_PENDIENTES actualizado (20 items)
- [x] V4_BACKLOG actualizado (G-02 credenciales granulares)
- [ ] CI verde
- [ ] QA visible en GitHub Pages
