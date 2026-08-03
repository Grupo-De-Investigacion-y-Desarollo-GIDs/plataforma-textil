# Reporte de licencias y componentes SaaS

Documento de handover para la Organizacion Internacional del Trabajo (OIT) y la
Universidad Nacional de Tres de Febrero (UNTREF). Registra la licencia del
proyecto, el inventario de licencias de dependencias de produccion y los
servicios SaaS de terceros de los que depende la Plataforma Digital Textil (PDT).

Fecha de generacion del reporte: 2026-08-03
Alcance: dependencias de **produccion** (`npm --production`) y servicios externos en runtime.

---

## 1. Licencia del proyecto

El repositorio incluye un archivo `LICENSE` en la raiz con licencia **Apache-2.0**:

> Apache License, Version 2.0
> Copyright 2026 Organizacion Internacional del Trabajo (OIT) y
> Universidad Nacional de Tres de Febrero (UNTREF)

La Apache-2.0 es una licencia permisiva que autoriza uso, copia, modificacion,
distribucion y sublicenciamiento, con la obligacion de conservar los avisos de
copyright/atribucion y de señalar los archivos modificados. A diferencia de MIT,
suma una **concesion expresa de patentes** y una clausula de terminacion ante
litigios de patentes. No impone copyleft ni obligaciones de apertura de codigo
derivado.

**Decidido (Sergio, 2026-08-03):** la licencia del **codigo** es **Apache-2.0**
con titularidad OIT + UNTREF (antes MIT). La **documentacion editorial** se
distribuye bajo **CC BY 4.0 IGO** (ver `HANDOVER_PACKAGE.md`). La cesion de
derechos formal (`CESION_DERECHOS`) y la validacion final con las areas legales
de ambas instituciones quedan a coordinar (ver seccion 5); si OIT define otro
encuadre, se ajusta.

---

## 2. Licencias de dependencias (produccion)

Inventario generado con `license-checker` sobre el arbol de dependencias de
produccion. **Total: 434 paquetes.**

| Licencia | Paquetes | Tipo |
|---|---:|---|
| MIT | 349 | Permisiva |
| ISC | 42 | Permisiva |
| Apache-2.0 | 21 | Permisiva (con clausula de patentes) |
| BSD-3-Clause | 6 | Permisiva |
| LGPL-3.0-or-later | 2 | Copyleft debil (ver nota) |
| Unlicense | 2 | Dominio publico |
| MIT* | 2 | Permisiva (declarada, sin archivo formal) |
| MIT-0 | 2 | Permisiva (sin atribucion) |
| CC-BY-4.0 | 1 | Permisiva con atribucion |
| BSD-2-Clause | 1 | Permisiva |
| (MIT OR GPL-3.0-or-later) | 1 | Dual (se puede elegir MIT) |
| (MIT AND Zlib) | 1 | Permisiva combinada |
| 0BSD | 1 | Permisiva (sin atribucion) |
| MIT AND ISC | 1 | Permisiva combinada |
| Custom (node-bufferlist) | 1 | Ver nota |
| UNLICENSED | 1 | Proyecto propio (ver nota) |

### Compatibilidad y observaciones

- **Predominan licencias permisivas** (MIT, ISC, Apache-2.0, BSD, 0BSD,
  Unlicense, MIT-0), que representan la amplia mayoria del arbol (~427 de 434).
  Todas son compatibles con la distribucion del proyecto bajo Apache-2.0 y no
  imponen copyleft.
- **UNLICENSED (1) = `pdt@0.1.0`**: es el **propio paquete del proyecto**
  (`package.json` marcado como privado). No es una dependencia de terceros ni un
  problema de licenciamiento; el campo `UNLICENSED`/`private` evita su
  publicacion accidental en el registro npm. La licencia efectiva del producto es
  la del archivo `LICENSE` (Apache-2.0, seccion 1).
- **LGPL-3.0-or-later (2)** son las unicas licencias con copyleft (debil) del
  arbol. Corresponden a los binarios nativos de **libvips** que empaqueta `sharp`
  (optimizacion de imagenes de Next.js):
  - `@img/sharp-libvips-linux-x64@1.2.4`
  - `@img/sharp-libvips-linuxmusl-x64@1.2.4`

  Son dependencias **transitivas** (via `sharp`, requerido por Next.js) y de
  **enlace dinamico en runtime**. La LGPL permite el uso de la libreria en
  software con otra licencia siempre que se pueda re-enlazar/sustituir la libreria;
  para un despliegue **SaaS** (el software se ejecuta en el servidor y no se
  distribuye el binario al usuario final) no se dispara la obligacion tipica de
  entrega de codigo. **Recomendacion:** dejar la mencion documentada y someterla a
  **revision legal** para confirmar el encuadre segun la politica de UNTREF/OIT.
- **Custom (node-bufferlist)** es una dependencia legacy con texto de licencia no
  estandarizado (historicamente MIT-like); baja prioridad, se puede confirmar en
  revision legal si se requiere exhaustividad.

### Como regenerar el resumen

```bash
npx license-checker --production --summary
# Detalle por paquete (JSON):
npx license-checker --production --json
```

---

## 3. Componentes SaaS

La PDT se apoya en varios servicios gestionados de terceros. A diferencia de un
stack tradicional autohospedado, esta capa es mas gruesa: cada servicio requiere
una cuenta con titular y, para la entrega institucional, la transferencia de esa
titularidad.

> **Importante:** "Titular actual" (quien administra hoy la cuenta durante el
> desarrollo) y "Titularidad institucional" (a quien debe quedar cedida la cuenta
> en la entrega a OIT/UNTREF) son **distintos**. La transferencia institucional
> de cada servicio la coordina **Sergio con OIT/UNTREF**. El detalle de accesos,
> usuarios y credenciales se documenta por separado en
> **`INVENTARIO_ACCESOS.md`** (ver ese documento como fuente de verdad de
> credenciales; este reporte solo lista los servicios).

| Servicio | Rol en la plataforma | Plan (actual/estimado) | Titular actual | Titularidad institucional |
|---|---|---|---|---|
| **Vercel** | Hosting, CI y despliegue (build + funciones serverless + cron) | Hobby o Pro - **confirmar** | Cuenta `gbreard` (gbreard@gmail.com) | **PENDIENTE** definicion OIT/UNTREF |
| **Supabase** | PostgreSQL + Storage + infra de auth (region sa-east-1) | **Confirmar** (Free/Pro) | Cuenta del equipo | **PENDIENTE** |
| **Resend** | Envio de emails transaccionales (dominio `notificaciones@plataformatextil.com.ar`) | **Confirmar** | Cuenta del equipo | **PENDIENTE** |
| **Google Cloud (OAuth)** | Login con Google (OAuth client) | Gratuito (OAuth) - **confirmar** | Proyecto Google Cloud del equipo | **PENDIENTE** |
| **AFIP SDK** (afipsdk.com) | Verificacion de CUIT contra padron ARCA/AFIP | Cuenta con token - **confirmar** | Cuenta con token | **PENDIENTE** |
| **Anthropic** (Claude API) | Pipeline RAG / asistencia | API key - **confirmar** consumo | Cuenta con API key | **PENDIENTE** |
| **Voyage AI** | Embeddings para RAG | API key - **confirmar** consumo | Cuenta con API key | **PENDIENTE** |
| **Upstash** | Redis serverless para rate limiting | **Confirmar** (Free/Pay-as-you-go) | Cuenta del equipo | **PENDIENTE** |
| **GitHub** | Repositorio + Actions (CI) | Org (plan a confirmar) | Org `Grupo-De-Investigacion-y-Desarollo-GIDs` | **PENDIENTE** |

### Dependencias directas destacadas (contexto tecnico)

Principales paquetes que consumen estos servicios o sostienen el runtime, con su licencia:

- `next` 16.1.6 - **MIT** (framework, hosting Vercel)
- `react` / `react-dom` 19.2.3 - **MIT**
- `@prisma/client` + `prisma` 6.19 - **Apache-2.0** (ORM sobre Supabase/PostgreSQL)
- `next-auth` 5.0-beta - **ISC** (auth; NextAuth v5)
- `@supabase/supabase-js` - **MIT** (cliente Supabase)
- `@afipsdk/afip.js` 1.2.3 - verificacion de CUIT (AFIP SDK)
- `@anthropic-ai/sdk` - **MIT** (Claude API)
- `zod` - **MIT** (validacion)
- `tailwindcss`, `recharts`, `exceljs`, `@react-pdf/renderer` - reportes y UI
- `resend`, `nodemailer` - envio de email
- `bcryptjs` - hashing de contrasenas
- `@upstash/ratelimit` + `@upstash/redis` - rate limiting

> Nota: `next-auth` esta en version beta (5.0.0-beta); es una dependencia clave de
> auth a monitorear de cara a su version estable.

---

## 4. Como reproducir el reporte

Desde la raiz del repositorio:

```bash
# Resumen por licencia (produccion)
npx license-checker --production --summary

# Detalle completo por paquete en JSON
npx license-checker --production --json > licencias.json

# Total de paquetes y agrupacion por licencia (script rapido)
npx license-checker --production --json > /tmp/lic.json
node -e "const d=require('/tmp/lic.json');const by={};Object.values(d).forEach(v=>{by[v.licenses]=(by[v.licenses]||0)+1});console.log('TOTAL',Object.keys(d).length);console.log(by)"
```

La lista de servicios SaaS surge de las variables de entorno declaradas en Vercel
(ver `CLAUDE.md` seccion Deploy) y del inventario de accesos.

---

## 5. Gaps pendientes

1. **Decision de licencia del proyecto (Sergio):** confirmar/ratificar la licencia
   MIT del archivo `LICENSE` en coordinacion con las areas legales de UNTREF/OIT.
2. **Documento de cesion de derechos (Sergio):** elaborar el instrumento legal de
   cesion/transferencia de la titularidad del software y de las cuentas SaaS a las
   instituciones.
3. **Confirmar planes SaaS:** relevar y confirmar el plan contratado de cada
   servicio (Vercel, Supabase, Resend, Upstash, etc.), su costo y limites.
4. **Titularidad institucional:** definir y ejecutar la transferencia de cada
   cuenta SaaS de "Titular actual" a la titularidad institucional OIT/UNTREF;
   detalle operativo y credenciales en `INVENTARIO_ACCESOS.md`.
5. **Revision legal de LGPL-3.0:** confirmar el encuadre de los binarios libvips
   (`sharp`) bajo la politica de propiedad intelectual de las instituciones (uso
   transitivo, enlace dinamico, despliegue SaaS - sin obligacion aparente, pero a
   validar).
