# Evento demo (martes 11) — acceso y cuentas

Hoja operativa del evento. **Todo en dev** (prod no se toca — freeze).

## URL del QR
**https://dev.plataformatextil.com.ar/demo**

- Cada tarjeta tiene un botón **"Entrar como…"** que loguea directo (sin formulario, sin tipear).
- La página está gateada por `MODO_EVENTO=on` (Vercel → Preview, branch `develop`). Fuera del
  evento la ruta no existe (404). En prod nunca se setea.

## Contraseña de respaldo (solo si una tablet necesita login manual)
Todas las cuentas demo usan la misma: **`pdt2026`**. No aparece en la página; es respaldo.
Las cuentas demo (`@pdt.org.ar`) **no pueden cambiar su contraseña ni correo** (guard):
si un visitante lo intenta, recibe un aviso y la cuenta sigue intacta para la tablet siguiente.

## Las 11 cuentas (solo Talleres y Marcas — público del evento)

> Coordinación/Estado y el usuario multi-rol **no** van en `/demo` (es para el público:
> talleres y marcas). Siguen en el seed: si el presentador quiere mostrarlos, entra por
> `/acceso-rapido` o login normal.

### Talleres
| Cuenta | Email | Uso | Flujo |
|---|---|---|---|
| Confecciones Belgrano | `demo.taller1@pdt.org.ar` | **Tablet 1** (escritura) | Taller verificado — cotiza un pedido |
| Textil Avellaneda | `demo.taller2@pdt.org.ar` | **Tablet 2** (escritura) | Taller verificado — cotiza un pedido |
| Taller Lanús | `demo.taller3@pdt.org.ar` | **Tablet 3** (escritura) | Taller verificado — cotiza un pedido |
| Corte Ramos Mejía | `demo.taller4@pdt.org.ar` | **Tablet 4** (escritura) | Taller verificado — cotiza un pedido |
| Costura del Oeste | `demo.gracia@pdt.org.ar` | showcase | Taller en **período de gracia** (CUIT sin verificar, banner) |
| Corte Sur SRL (Carlos Mendoza) | `carlos.mendoza@pdt.org.ar` | showcase | Taller **consolidado (Oro)** — formalización completa, órdenes en curso |

### Marcas
| Cuenta | Email | Uso | Flujo |
|---|---|---|---|
| Indumentaria Aurora | `demo.marca1@pdt.org.ar` | **Tablet A** (escritura) | Publica pedido y recibe cotizaciones |
| Moda Delta | `demo.marca2@pdt.org.ar` | **Tablet B** (escritura) | Publica pedido y recibe cotizaciones |
| Textiles del Plata | `demo.marca3@pdt.org.ar` | **Tablet C** (escritura) | Publica pedido y recibe cotizaciones |
| Amapola (Valentina Ramos) | `valentina.ramos@pdt.org.ar` | showcase | Marca con pedido publicado recibiendo cotizaciones |
| Urbano Textil (Martín Echevarría) | `martin.echevarria@pdt.org.ar` | showcase | Marca con **producción en curso** (órdenes) |

**7 cuentas de escritura** (4 talleres + 3 marcas, una por tablet → sin pisarse) + **4 showcase** = 11.

Las de escritura vienen con datos presentables: talleres con formalización y vidriera (y varios
con una cotización enviada), marcas con un pedido publicado recibiendo cotizaciones.

## Concurrencia
Las 7 de escritura son independientes: cada tablet opera la suya. Los talleres cotizan los mismos
pedidos publicados sin colisión (cada cotización es por taller); las marcas crean sus propios
pedidos. Las showcase son de lectura → no hay conflicto aunque varias tablets las abran.

## Rollback (miércoles 12)
Quitar la env var: `vercel env rm MODO_EVENTO preview develop --yes` (o dashboard) + redeployar
`develop`. Cierra el registro del preview y oculta `/demo`. Prod nunca se ve afectada.

## Comportamiento en modo evento (`MODO_EVENTO=on`, solo preview)
- **Rate limits relajados:** se saltan los límites por IP de los flujos del evento
  (login, pedidos, cotizaciones, uploads, registro, verificar-CUIT, cuenta, feedback) — el
  venue sale por una sola IP con ~7 tablets. Prod nunca los relaja (no tiene el flag).
- **Logout → `/demo`:** cerrar sesión (en cualquiera de los 3 botones) vuelve a `/demo`, no a `/login`.
- **Timeout de inactividad:** 12 min sin interacción → cierra sesión y vuelve a `/demo` (higiene:
  nadie hereda la sesión del anterior).
- **Emails en preview:** NO se envían (se loguean). El envío real de Resend ocurre solo en producción
  → publicar un pedido no manda correos a los `@pdt.org.ar` del seed.

## Reseed entre tandas (1 comando, idempotente, ~1 min)
Si en una pausa conviene volver las cuentas de escritura al estado limpio (sin pedidos/cotizaciones
creados en la tanda), correr **sin resetear** la base:
```bash
npx tsx scripts/seed-evento.ts
```
Decisión de correrlo queda para el día (lo corre Gerardo si hace falta). **No está automatizado.**

## Imágenes de las cuentas (reseed-safe)
Las 11 cuentas tienen fotos reales (material sintético, 640×640). Los assets viven **en el repo**
(`scripts/seed-evento-assets/`, 1.6 MB) y se suben al Storage de DEV de forma **idempotente por path
determinístico** (`demo/<user_code>/…`: si ya existe, no re-sube). Las URLs se **reasignan en cada
corrida del seed**, así que:
- **Talleres (6):** `portfolioFotos = [foto01, foto02, foto03, LOGO]` — el logo va **último** (la tarjeta
  del directorio muestra `portfolioFotos[0]` en aspect-video; la primera debe ser foto de taller).
- **Marcas (5):** `Pedido.imagenes = [foto01, foto02, foto03]` — los logos de marca **no se usan** (el
  modelo `Marca` no tiene campo de logo; ver `scripts/seed-evento-assets/NOTA_LOGOS_MARCA.md`).

El **reseed liviano** (`scripts/seed-evento.ts`) **no borra** las imágenes (los upsert no tocan
`portfolioFotos`/`imagenes`). El **reseed completo** (`db:seed` / `migrate reset`) las **reasigna**
solo: los objetos de Storage sobreviven al wipe de la DB (probado: 0 subidas, 39 ya estaban). Si alguna
vez faltaran, reasignarlas sin resetear con:
```bash
npx tsx --env-file=.env.local scripts/seed-evento-imagenes.ts
```

## Riesgos aceptados
- **QR escaneable por cualquiera:** riesgo aceptado. Son datos sintéticos, el sistema real no se toca;
  el timeout de 12 min acota la ventana de una sesión abierta, y las cuentas rotuladas "Tablet N"
  desalientan al público de teléfono. Nada más barato lo impide; se declara.

---

## Párrafo para Cecilia / Matías

> Para el evento del martes preparamos una página de acceso — **https://dev.plataformatextil.com.ar/demo** —
> donde cada persona entra a la plataforma con **un solo toque**, sin usuario ni contraseña. La pantalla
> muestra 11 tarjetas separadas en **Talleres** y **Marcas**, y al tocar "Entrar como…" se abre directo el
> panel de esa cuenta: 7 están pensadas para las tablets (4 talleres y 3 marcas, una por dispositivo, para
> que no se pisen entre sí) y 4 son de recorrido (un taller en período de gracia, un taller consolidado, una
> marca con pedido publicado y una marca con producción en curso). Es el entorno de demostración con datos
> de prueba; no toca el sistema real. **El QR debe apuntar a esa URL.**
