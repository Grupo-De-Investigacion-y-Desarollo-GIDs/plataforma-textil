import { test } from '@playwright/test'

// U-06 — Clasificacion automatica de pedidos (COMERCIAL / SUBCONTRATACION).
// La cobertura REAL de la logica esta a nivel unidad en
// src/__tests__/u-06-clasificacion-pedidos.test.ts (ambas ramas, via mock de
// prisma). Aca solo quedan los e2e de extremo a extremo, hoy bloqueados.
// Ver .claude/specs/v4-u-06-clasificacion-pedidos.md

// U-08 ya resolvió el seed dual (Julieta + pedidos OM-2026-DUAL1/DUAL2). El único
// bloqueo restante es la VISTA DE REPORTE: el campo Pedido.tipo sigue invisible en
// UI (diferida a Etapa 2/3), así que no hay dónde leer el tipo desde la pantalla.
// Por eso estos e2e siguen `fixme` (NO por el seed). La lógica de clasificación ya
// está cubierta a nivel unidad en src/__tests__/u-06-clasificacion-pedidos.test.ts.

test.fixme('e2e: marca pura crea pedido -> tipo COMERCIAL visible en reporte', async () => {
  // BLOQUEADO por la vista de reporte (diferida Etapa 2/3): falta UI que exponga
  // Pedido.tipo para leerlo tras crear el pedido. Seed ya no es bloqueante.
})

test.fixme('e2e: user dual crea pedido -> tipo SUBCONTRATACION visible en reporte', async () => {
  // BLOQUEADO solo por la vista de reporte (diferida Etapa 2/3). El seed dual ya
  // existe (U-08); la lógica ya está cubierta por el test unitario.
})
