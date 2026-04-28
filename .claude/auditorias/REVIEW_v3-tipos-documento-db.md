# REVIEW: v3-tipos-documento-db (D-02)

**Spec:** v3-tipos-documento-db.md
**Implementado por:** Gerardo (Claude Code)
**Fecha:** 2026-04-28
**Branch:** develop

---

## Resumen de cambios

D-02 hace que la logica de niveles y puntos sea configurable desde la DB por el ESTADO, eliminando constantes hardcodeadas. Complementa D-01 (roles ESTADO) cerrando el Bloque 3.

## Archivos creados

| Archivo | Proposito |
|---------|-----------|
| `prisma/migrations/20260428200000_*/migration.sql` | Agrega puntosOtorgados + ordenVisualizacion a TipoDocumento, crea tabla ReglaNivel |
| `prisma/migrations/20260428200001_*/migration.sql` | Seed de 3 reglas de nivel (BRONCE/PLATA/ORO) via INSERT ON CONFLICT |
| `src/app/api/estado/configuracion-niveles/route.ts` | GET reglas de nivel (ESTADO + ADMIN) |
| `src/app/api/estado/configuracion-niveles/[id]/route.ts` | PUT editar regla (solo ESTADO), invalida cache |
| `src/app/api/estado/configuracion-niveles/preview/route.ts` | POST preview de impacto antes de guardar |
| `src/app/(estado)/estado/configuracion-niveles/page.tsx` | UI de configuracion de niveles con preview |
| `tools/recalcular-niveles.ts` | Script admin --dry-run para recalculo masivo |
| `scripts/verificar-migracion-d02.sql` | Verificacion post-migracion |
| `src/__tests__/configuracion-niveles-api.test.ts` | 7 tests API permisos |
| `tests/e2e/configuracion-niveles.spec.ts` | 5 tests E2E |

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `prisma/schema.prisma` | +puntosOtorgados, +ordenVisualizacion en TipoDocumento; +modelo ReglaNivel |
| `prisma/seed.ts` | +reglaNivel cleanup y createMany; puntosOtorgados en tiposDocData |
| `src/compartido/lib/nivel.ts` | Reescrito: constantes PTS_* eliminadas, lee de ReglaNivel + puntosOtorgados, cache 60s, +calcularProximoNivel() |
| `src/app/(taller)/taller/page.tsx` | Reemplaza imports PTS_* por datos de DB (validaciones.tipoDocumento.puntosOtorgados) |
| `src/app/(estado)/estado/documentos/page.tsx` | +campo puntosOtorgados editable, badges puntos y nivel |
| `src/app/api/tipos-documento/route.ts` | +puntosOtorgados en POST/PUT, +invalidarCacheNivel() |
| `src/compartido/componentes/layout/user-sidebar.tsx` | +item "Niveles" en sidebar ESTADO |
| `src/__tests__/nivel.test.ts` | Reescrito: 16 tests con reglas mockeadas (antes 15 con constantes) |

## Decisiones arquitectonicas

### 1. Cache TTL 60s (mismo patron S-03)
In-memory por instancia con TTL 60 segundos. Ventana de inconsistencia entre instancias Vercel de max 1 minuto. Aceptable para 25 talleres con cambios infrecuentes.

### 2. Recalculo lazy (opcion B)
Los niveles se recalculan cuando se dispara un trigger (aprobacion, certificado, etc). No hay recalculo inmediato ni job background. El preview muestra impacto antes de guardar.

### 3. certificadosAcademiaMin: 0 para ORO
Replica el comportamiento pre-V3 (ORO no requeria certificados). Evita bajar talleres ORO al deploy. El ESTADO puede subir este valor cuando quiera desde la UI.

### 4. PTS_VERIFICADO_AFIP y PTS_POR_CERTIFICADO se mantienen fijos
El bonus de AFIP (10 pts) y certificados (15 pts cada uno) se mantienen como constantes locales en taller/page.tsx. No van a ReglaNivel porque son bonificaciones transversales, no criterios de nivel. Si en el futuro se quieren hacer configurables, se puede agregar un campo a ReglaNivel.

## Riesgos no cubiertos

1. **Cambio de regla con efecto diferido**: si ESTADO sube el minimo de PLATA y luego aprueba un documento de un taller con puntos insuficientes, el taller podria bajar de nivel en la misma accion que le aprobo un documento. El preview mitiga esto mostrando el impacto antes.

2. **Sin notificacion al taller**: cuando un taller baja de nivel por cambio de regla, no recibe notificacion automatica. Esto se puede agregar en un spec futuro.

## Migracion de datos

### Resultados del script de verificacion

> **PENDIENTE**: Ejecutar `scripts/verificar-migracion-d02.sql` y `npx tsx tools/recalcular-niveles.ts --dry-run` despues del deploy.

---

## Checklist de verificacion manual D-02

### Login como ESTADO (anabelen.torres@pdt.org.ar / pdt2026)
1. [ ] /estado/documentos muestra puntos por tipo (15 pts PLATA, 20 pts ORO)
2. [ ] Editar un tipo → cambiar puntos → guardar → cambio persistido
3. [ ] /estado/configuracion-niveles muestra 3 cards (BRONCE 0 pts, PLATA 50 pts, ORO 100 pts)
4. [ ] Editar regla PLATA → click "Ver impacto" → muestra preview
5. [ ] Sidebar ESTADO muestra item "Niveles"

### Login como TALLER (roberto.gimenez@pdt.org.ar / pdt2026)
6. [ ] Dashboard muestra desglose de puntaje sin error
7. [ ] Los puntos reflejan los valores de DB (no el fijo de 10)

### Login como ADMIN (lucia.fernandez@pdt.org.ar / pdt2026)
8. [ ] Puede VER /estado/configuracion-niveles (lectura)
