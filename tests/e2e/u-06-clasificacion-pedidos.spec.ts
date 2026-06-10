import { test } from '@playwright/test'

// U-06 — Clasificacion automatica de pedidos (COMERCIAL / SUBCONTRATACION).
// La cobertura REAL de la logica esta a nivel unidad en
// src/__tests__/u-06-clasificacion-pedidos.test.ts (ambas ramas, via mock de
// prisma). Aca solo quedan los e2e de extremo a extremo, hoy bloqueados.
// Ver .claude/specs/v4-u-06-clasificacion-pedidos.md

// El campo Pedido.tipo es invisible en UI (la vista de reporte esta diferida a
// Etapa 2/3) y el caso SUBCONTRATACION necesita un User dual (Marca + Taller) que
// el seed single-role actual no tiene. Por eso estos e2e quedan `fixme` hasta
// U-08 (seed dual) + la vista de reporte que exponga el tipo.

test.fixme('e2e: marca pura crea pedido -> tipo COMERCIAL visible en reporte', async () => {
  // TODO(U-08): requiere vista de reporte (diferida) para poder leer el tipo
  // desde la UI tras crear el pedido.
})

test.fixme('e2e: user dual crea pedido -> tipo SUBCONTRATACION visible en reporte', async () => {
  // TODO(U-08): requiere (1) User dual en el seed y (2) vista de reporte que
  // exponga el tipo. La logica ya esta cubierta por el test unitario.
})
