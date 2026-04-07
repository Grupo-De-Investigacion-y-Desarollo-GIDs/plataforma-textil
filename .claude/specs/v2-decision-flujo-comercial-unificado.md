# Decision de Arquitectura: Flujo Comercial Unificado

**Fecha:** 2026-04-07
**Estado:** Aprobado por Gerardo
**Contexto:** Hallazgos H-07 y H-08 de la validacion + conflicto entre E1 y E2

---

## Problema

La plataforma tiene dos escenarios (E1 y E2) con flujos de vinculacion marca-taller incompatibles que hoy conviven en la misma UI:

- **E1 (Formalizacion):** Marca busca taller en directorio → lo asigna directamente → crea orden sin cotizacion
- **E2 (Marketplace):** Marca publica pedido → talleres cotizan → marca acepta la mejor

Ambos flags estan activos, generando que el boton "Asignar taller" y "Publicar pedido" coexistan en la misma pantalla. Esto:
- Rompe la trazabilidad (asignacion sin cotizacion no deja registro de condiciones)
- Confunde al usuario (dos caminos para lo mismo)
- Permite asignacion unilateral sin que el taller confirme condiciones

## Decision

**Fusionar E1 y E2 en un flujo unico donde siempre hay cotizacion**, independientemente de si la marca ya sabe con quien quiere trabajar o quiere abrir al mercado.

## Flujo unificado

```
MARCA crea pedido (BORRADOR)
         |
         ├── Opcion A: "Invitar a cotizar"
         |   Marca busca taller en directorio
         |   Selecciona 1 o mas talleres
         |   Cada taller invitado recibe notificacion
         |   Pedido pasa a PUBLICADO (visible solo para invitados)
         |
         ├── Opcion B: "Publicar al mercado"
         |   Pedido pasa a PUBLICADO (visible para todos los talleres compatibles)
         |   Talleres compatibles reciben notificacion
         |
         └──────────────────────────────────┐
                                            v
                              TALLERES COTIZAN
                              (precio, plazo, proceso, mensaje)
                                            |
                                            v
                              MARCA REVISA COTIZACIONES
                              Compara ofertas lado a lado
                                            |
                                            v
                              MARCA ACEPTA UNA COTIZACION
                              - Se crea Orden de Manufactura
                              - Precio y plazo quedan registrados
                              - Se rechazan las demas cotizaciones
                              - Se notifica al taller ganador
                                            |
                                            v
                              EJECUCION → COMPLETADO
                              (progreso, PDF acuerdo, cierre)
```

## Que cambia respecto a hoy

| Aspecto | Antes (E1+E2 mezclados) | Despues (unificado) |
|---------|------------------------|---------------------|
| Asignar taller directo | Si, sin cotizacion | No. Se reemplaza por "Invitar a cotizar" |
| Publicar al mercado | Si | Si, sin cambios |
| Cotizacion obligatoria | Solo en E2 | Siempre. En ambos caminos |
| Taller confirma condiciones | No en E1 | Si. El taller siempre manda precio/plazo |
| Trazabilidad | Parcial | Completa. Toda orden nace de una cotizacion |
| Multiples talleres en un pedido | Si (bug) | No. Una cotizacion aceptada = una orden |

## Cambios tecnicos necesarios

### Eliminar
- Componente `src/marca/componentes/asignar-taller.tsx`
- Boton "Asignar taller" de `src/app/(marca)/marca/pedidos/[id]/page.tsx`
- API `POST /api/pedidos/[id]/ordenes` (crear orden directa) — o restringirla a que solo se invoque internamente al aceptar cotizacion

### Crear
- Componente `InvitarACotizar` — modal que busca taller(es) y les envia invitacion
- Campo `visibilidad` en Pedido: `INVITACION` (solo talleres invitados) o `PUBLICO` (marketplace abierto)
- Tabla o campo `invitados` en Pedido para registrar talleres invitados
- Notificacion de invitacion al taller ("La marca X te invito a cotizar el pedido Y")

### Modificar
- `PublicarPedido` — separar en dos acciones: "Invitar a cotizar" y "Publicar al mercado"
- Vista `/taller/pedidos/disponibles` — mostrar tambien pedidos donde el taller fue invitado
- Vista `/marca/pedidos/[id]` — mostrar cotizaciones en TODOS los estados (no solo PUBLICADO)
- Cotizacion aceptada queda visible con badge verde (no desaparece — fix H-08)

### Feature flags
- Eliminar la distincion E1/E2 para el flujo comercial
- Mantener flags individuales para features ortogonales: `academia`, `denuncias`, `dashboard_estado`, `asistente_rag`
- El flujo comercial unificado esta siempre activo si hay pedidos

## Referencia de mercado

**Alibaba/1688:** El comprador puede contactar un proveedor directamente (equivalente a "Invitar a cotizar") O publicar un RFQ abierto (equivalente a "Publicar al mercado"). En ambos casos, el proveedor envia una propuesta formal con precio, plazo y condiciones. No existe asignacion unilateral.

**SAP Ariba:** Los sourcing events requieren al menos una oferta evaluada antes de adjudicar. La diferencia entre RFQ dirigido y licitacion abierta es solo la visibilidad, no el proceso.

**Faire:** Incluso en ordenes directas, el proveedor confirma condiciones antes de que la orden se active.

## Impacto en otros hallazgos

- **H-07** (asignar taller unilateral): Resuelto — se elimina el boton
- **H-08** (cotizacion desaparece): Resuelto — cotizaciones visibles en todos los estados
- **H-06** (boton ver pedido admin): La vista admin de pedidos debe reflejar el nuevo flujo
- **H-09** (filtros admin pedidos): Se agrega filtro por visibilidad (invitacion/publico)

## Criterio de aceptacion

- [ ] No existe boton "Asignar taller" en ninguna vista
- [ ] Marca puede "Invitar a cotizar" a talleres especificos desde el directorio
- [ ] Marca puede "Publicar al mercado" para recibir cotizaciones abiertas
- [ ] En ambos caminos, el taller envia cotizacion con precio y plazo
- [ ] Toda Orden de Manufactura nace de una cotizacion aceptada
- [ ] Cotizacion aceptada queda visible (no desaparece)
- [ ] Taller invitado ve el pedido en `/taller/pedidos/disponibles`
- [ ] PDF de acuerdo incluye datos de la cotizacion original
