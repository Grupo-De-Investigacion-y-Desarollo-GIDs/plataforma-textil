# REVIEW: v3-proximo-nivel-dashboard (F-01)

**Spec:** v3-proximo-nivel-dashboard.md
**Implementado por:** Gerardo (Claude Code)
**Fecha:** 2026-05-04
**Branch:** develop

---

## Resumen de cambios

F-01 reemplaza el banner contextual basico de V2 en el dashboard del taller con una seccion estructurada "Tu proximo nivel" que muestra pasos priorizados, barra de progreso, beneficios y acciones directas. Es la pieza central de la propuesta de valor para OIT (formalizacion guiada).

## Archivos creados

| Archivo | Proposito |
|---------|-----------|
| `src/taller/componentes/proximo-nivel-card.tsx` | Server component principal con ProximoNivelCard, PasoItem, BarraProgreso, BeneficiosNivel, NivelOroCelebracion |
| `src/taller/componentes/sincronizar-nivel.tsx` | Client component que dispara aplicarNivel post-mount y refresca si hubo cambio |
| `src/taller/componentes/sincronizar-nivel-action.ts` | Server action para sincronizacion de nivel |
| `src/__tests__/proximo-nivel-card.test.ts` | 8 tests unitarios para logica de priorizacion |

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `src/app/(taller)/taller/page.tsx` | +imports ProximoNivelCard/SincronizarNivel; -bannerMensaje/bannerLink variables; -mensajes inline BRONCE/PLATA/ORO en card Formalizacion; -banner standalone border-l-4; +render ProximoNivelCard entre banners y grid |

## Decisiones arquitectonicas

### 1. Server component puro (sin side effects)
`ProximoNivelCard` es un server component async que llama `calcularProximoNivel()` directamente. No tiene state, no tiene efectos. Los datos se leen en el server render.

### 2. Side effect separado en client component
`SincronizarNivel` es un client component invisible (return null) que dispara `aplicarNivel()` post-mount via server action. Si el nivel cambio, ejecuta `router.refresh()`. Esto separa lectura (server) de escritura (client).

### 3. Opcion 1 para deteccion de cambio
Se pasa `nivelActual` como prop al client component y se compara con el resultado de `aplicarNivel()`. No se modifica la firma de `aplicarNivel()`.

### 4. Priorizacion de pasos
Orden fijo: AFIP (1) > docs requeridos por puntos desc (2) > certificados (3) > docs opcionales (4). Exportada para testing.

### 5. Convivencia T-03
Cuando T-03 (checklist onboarding) se implemente, tendra prioridad sobre ProximoNivelCard. Por ahora, ProximoNivelCard se muestra siempre que exista `taller`.

## Codigo eliminado

- Variables: `nivelSiguiente`, `tiposPlata`, `tieneDocsPlata`, `faltaCertificado`, `bannerMensaje`, `bannerLink`
- JSX: Banner contextual standalone (bg-brand-bg-light, border-l-4, border-brand-blue)
- JSX: Mensajes inline de nivel en card Formalizacion (3 bloques condicionales BRONCE/PLATA/ORO)

## Dependencias

- `calcularProximoNivel()` de D-02 (ya mergeado)
- `aplicarNivel()` de D-02 (ya mergeado)
- Interface `ProximoNivelInfo` con `puntosActuales`, `puntosObjetivo`, `requerido`, `tieneAfip` (D-02)

## Testing

- 8 tests Vitest cubriendo logica de `ordenarPasos`: array vacio, prioridad CUIT, AFIP ya verificado, requeridos antes que opcionales, certificados, orden completo, porcentaje correcto, cap en 100%
- Tests funcionales manuales pendientes (ver QA)

## Riesgos conocidos

- Si T-03 se implementa sin la condicion de convivencia, ambos componentes se renderizan juntos. Esto esta documentado en el spec seccion 5.4.
- `SincronizarNivel` dispara una escritura en cada visita al dashboard. Con 25 talleres y visitas esporadicas, no es problema. Monitorear si escala.
