# Nota — logos de marca (MAR_00X_logo.png)

Los **5 logos de marca** del paquete (`marcas/MAR_00X_*/MAR_00X_logo.png`) quedan
**archivados sin destino** en el modelo actual: `model Marca` no tiene campo de
logo y **no se crea migración pre-evento** (decisión tomada — freeze de prod, sin
cambios de schema antes del martes).

- **Sí se usan** las 3 fotos de cada marca → `Pedido.imagenes` del pedido demo.
- **No se usan** los 5 logos de marca (se conservan acá para trazabilidad).
- **Los 6 logos de taller sí se usan** → van al final de `Taller.portfolioFotos`
  (el modelo Taller no tiene campo de logo dedicado, pero la galería/vidriera los
  muestra bien en aspect-square).

**Mejora Etapa 2 (post-evento):** si se agrega `Marca.logoUrl` (o equivalente),
estos logos ya están en el repo y `scripts/seed-evento-imagenes.ts` puede
asignarlos con un cambio menor (hoy `soloFotos` los excluye a propósito).

Ver `scripts/seed-evento-imagenes.ts` y `manifest.json` para el mapeo completo.
