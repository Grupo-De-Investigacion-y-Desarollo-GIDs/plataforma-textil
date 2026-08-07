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

## Las 13 cuentas

### Talleres
| Cuenta | Email | Uso | Flujo |
|---|---|---|---|
| Confecciones Belgrano | `demo.taller1@pdt.org.ar` | **Tablet 1** (escritura) | Taller verificado — cotiza un pedido |
| Textil Avellaneda | `demo.taller2@pdt.org.ar` | **Tablet 2** (escritura) | Taller verificado — cotiza un pedido |
| Taller Lanús | `demo.taller3@pdt.org.ar` | **Tablet 3** (escritura) | Taller verificado — cotiza un pedido |
| Corte Ramos Mejía | `demo.taller4@pdt.org.ar` | **Tablet 4** (escritura) | Taller verificado — cotiza un pedido |
| Costura del Oeste | `demo.gracia@pdt.org.ar` | showcase | Taller en **período de gracia** (CUIT sin verificar, banner) |
| Corte Sur SRL (Carlos Mendoza) | `carlos.mendoza@pdt.org.ar` | showcase | Taller **consolidado ORO** (validaciones, academia, órdenes) |
| Julieta Benítez | `julieta.benitez@pdt.org.ar` | showcase | **Multi-rol** — toggle taller ↔ marca |

### Marcas
| Cuenta | Email | Uso | Flujo |
|---|---|---|---|
| Indumentaria Aurora | `demo.marca1@pdt.org.ar` | **Tablet A** (escritura) | Publica pedido y recibe cotizaciones |
| Moda Delta | `demo.marca2@pdt.org.ar` | **Tablet B** (escritura) | Publica pedido y recibe cotizaciones |
| Textiles del Plata | `demo.marca3@pdt.org.ar` | **Tablet C** (escritura) | Publica pedido y recibe cotizaciones |
| Amapola (Valentina Ramos) | `valentina.ramos@pdt.org.ar` | showcase | Marca con pedido publicado recibiendo cotizaciones |
| Urbano Textil (Martín Echevarría) | `martin.echevarria@pdt.org.ar` | showcase | Marca con **producción en curso** (órdenes) |

### Coordinación
| Cuenta | Email | Uso | Flujo |
|---|---|---|---|
| Ana Belén Torres | `anabelen.torres@pdt.org.ar` | showcase | **Estado** — dashboard del sector, talleres, auditorías |

**7 cuentas de escritura** (4 talleres + 3 marcas, una por tablet → sin pisarse) + **6 showcase**.

## Concurrencia
Las 7 de escritura son independientes: cada tablet opera la suya. Los talleres cotizan los mismos
pedidos publicados sin colisión (cada cotización es por taller); las marcas crean sus propios
pedidos. Las showcase son de lectura → no hay conflicto aunque varias tablets las abran.

## Rollback (miércoles 12)
Quitar la env var: `vercel env rm MODO_EVENTO preview develop --yes` (o dashboard) + redeployar
`develop`. Cierra el registro del preview y oculta `/demo`. Prod nunca se ve afectada.

## Poblar/repoblar las cuentas en dev
Idempotente, sin resetear: `npx tsx scripts/seed-evento.ts` (o incluido en `npm run db:seed`).

---

## Párrafo para Cecilia / Matías

> Para el evento del martes preparamos una página de acceso — **https://dev.plataformatextil.com.ar/demo** —
> donde cada persona entra a la plataforma con **un solo toque**, sin usuario ni contraseña: la
> pantalla muestra 13 tarjetas separadas en Talleres, Marcas y Coordinación, y al tocar "Entrar como…"
> se abre directo el panel de esa cuenta. Hay 7 cuentas pensadas para las tablets (4 talleres y 3
> marcas, una por dispositivo, para que no se pisen entre sí) y 6 más de recorrido: un taller en
> período de gracia, un taller consolidado, un usuario que opera como taller y marca a la vez, una
> marca con pedido publicado, una marca con producción en curso y el panel del Estado. Es el entorno
> de demostración con datos de prueba; no toca el sistema real. **El QR debe apuntar a esa URL.**
