# Activos visuales de usuarios demo — PDT — versión 2

Paquete listo para carga por código en la Plataforma Digital Textil.

## Contenido

- 11 usuarios demo: 6 talleres y 5 marcas.
- 3 fotos distintas por usuario: 33 fotos JPG.
- 1 logo propio por usuario: 11 logos PNG.
- Total: 44 archivos vinculados a usuarios.
- Todas las imágenes son cuadradas, de 640 × 640 px.
- Las fotos tienen compresión deliberada para funcionar como ejemplos de baja resolución.
- No hay fotos exactamente repetidas entre cuentas.

## Regla de vinculación

Usar siempre `user_code` como clave estable. No vincular por parecido visual ni sólo por el nombre visible.

- `TAL_001` a `TAL_006`: talleres.
- `MAR_001` a `MAR_005`: marcas.
- `*_logo.png`: logo del usuario, `sort_order: 0`.
- `*_01_*.jpg`, `*_02_*.jpg`, `*_03_*.jpg`: galería, `sort_order: 1–3`.

La relación exacta, el tipo de activo, el texto alternativo y el orden están en `manifest.json`.

## Advertencia

Los nombres, logos, escenas y productos son material sintético para demostración. No representan talleres ni marcas reales. El logo de Cooperativa Hilos del Sur no se reutilizó en estas cuentas.
