# Issues conocidos en V4

Bugs y flakies detectados pero no resueltos. Documentados para no perderlos
de vista pero sin bloquear avance del MVP.

## Flaky intermitente: flujo-comercial.spec.ts:9

**Test:** "Marca crea pedido → taller cotiza → marca acepta"
**Comportamiento:** falla en intento 1 (~18s), pasa en retry
**Probable causa:** race condition en test multi-rol (marca + taller)
**Estado:** TODO, no bloquea CI (pasa en retry)
**Descubierto:** durante PR #318 cuando se resolvieron los 20 timeouts de ESTADO que enmascaraban flakies preexistentes
**Proxima accion:** investigar cuando aparezca otro flaky multi-rol o cuando haya tiempo dedicado
