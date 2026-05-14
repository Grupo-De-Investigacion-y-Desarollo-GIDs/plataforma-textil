# Guía de Despliegue — Plataforma Digital Textil

Esta guía documenta el setup completo de infraestructura del proyecto: dominio, DNS, hosting, email, base de datos y variables de entorno.

**Audiencia:** Equipo técnico que necesite reproducir el despliegue desde cero o entender la configuración actual.

**Última actualización:** Mayo 2026.

---

## Arquitectura del despliegue

```
                         ┌────────────────────┐
                         │      NIC.ar        │
                         │   (Registrar       │
                         │    del dominio)    │
                         └─────────┬──────────┘
                                   │
                                   │ Delega DNS a
                                   ▼
                         ┌────────────────────┐
                         │     Cloudflare     │
                         │   (DNS + Email     │
                         │     Routing)       │
                         └────┬────────┬──────┘
                              │        │
                  ┌───────────┘        └───────────┐
                  │ Apunta              │ MX + SPF │
                  │ A / CNAME           │ DKIM     │
                  ▼                     ▼          ▼
        ┌────────────────────┐  ┌────────────────────┐
        │      Vercel        │  │       Resend       │
        │  (Hosting + CI/CD) │  │  (Email enviado    │
        │                    │  │   desde dominio    │
        │  - main → prod     │  │   propio)          │
        │  - develop → dev   │  └────────────────────┘
        └─────────┬──────────┘
                  │
                  │ Conecta a
                  ▼
        ┌────────────────────┐
        │     Supabase       │
        │  (PostgreSQL +     │
        │   Storage)         │
        │   sa-east-1        │
        └────────────────────┘
```

---

## Componentes del despliegue

| Componente | Servicio | Función | Costo |
|---|---|---|---|
| Dominio | NIC.ar | Registro `.com.ar` | ~$8.500 ARS/año |
| DNS | Cloudflare (Free plan) | Resolución DNS + email routing | Gratis |
| Hosting + CI/CD | Vercel | Build automático + deploy + SSL | Gratis (Hobby tier) |
| Base de datos | Supabase | PostgreSQL + Storage (sa-east-1) | Gratis (Free tier) |
| Email transaccional | Resend | Envío de magic links + notificaciones | Gratis hasta 3.000 emails/mes |
| Email forwarding | Cloudflare Email Routing | Reenvía emails recibidos a Gmail | Gratis |
| Verificación CUIT | AfipSDK | Integración con ARCA | Según tier contratado |
| Asistente IA | Claude API + Voyage AI | RAG + embeddings | Pay-per-use |
| Rate limiting | Upstash Redis | Limitar requests por usuario | Gratis (Free tier) |

---

## Ambientes

| Ambiente | Rama Git | URL | Para qué |
|---|---|---|---|
| **Producción** | `main` | https://plataformatextil.com.ar | Usuarios reales |
| **Development** | `develop` | https://dev.plataformatextil.com.ar | Tests, demos, validación previa al merge |
| **Preview** | cada PR | URL única generada por Vercel | Revisión de PRs antes de mergear |

---

## Setup inicial completo (desde cero)

### Paso 1 — Registrar el dominio en NIC.ar

1. Ir a https://nic.ar/
2. Crear cuenta con CUIT/CUIL
3. Buscar disponibilidad de `plataformatextil.com.ar`
4. Registrar por 1 año (renovable)
5. Pagar (~$8.500 ARS/año)
6. Esperar confirmación: 1-3 días hábiles

Estado esperado tras registro: **Registrado · Delegado: NO**

### Paso 2 — Crear cuenta en Cloudflare

1. Ir a https://dash.cloudflare.com/sign-up
2. Registrarse con email institucional
3. Plan: **Free**
4. Verificar email

### Paso 3 — Conectar el dominio a Cloudflare

1. En Cloudflare → **Domains → Overview → Add a Site**
2. Elegir **Connect a domain** (NO transferir ni comprar)
3. Ingresar `plataformatextil.com.ar`
4. Plan: **Free** ($0/mes)
5. Cloudflare escanea DNS (vacío) → Continue
6. Cloudflare asigna 2 nameservers únicos. Ejemplo:
   - `carl.ns.cloudflare.com`
   - `grace.ns.cloudflare.com`
7. Anotar los 2 nameservers

### Paso 4 — Delegar el dominio desde NIC.ar a Cloudflare

1. NIC.ar → **Mis dominios** → click en el dominio
2. Acciones → **Delegar**
3. Agregar 2 delegaciones:
   - Host: `carl.ns.cloudflare.com` (sin IPv4/IPv6)
   - Host: `grace.ns.cloudflare.com` (sin IPv4/IPv6)
4. Confirmar (puede pedir código por email/SMS)

**Tiempo de propagación:** 15 min - 24h. Cloudflare detecta automáticamente y envía email cuando está activo.

Estado esperado tras delegado: **Delegado: SI** en NIC.ar, dominio **Active** en Cloudflare.

### Paso 5 — Crear proyecto en Vercel

1. Ir a https://vercel.com/
2. Importar el repo desde GitHub: `Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil`
3. Configurar:
   - Framework Preset: **Next.js**
   - Root directory: `./` (default)
   - Build command: `npm run build` (default)
   - Output directory: `.next` (default)
4. NO desplegar todavía — primero configurar variables de entorno (paso 8)

### Paso 6 — Crear proyecto en Supabase

1. Ir a https://supabase.com/
2. New project
3. Configurar:
   - Nombre: `pdt-prod` (o el que prefieras)
   - **Region: sa-east-1 (São Paulo)** — la más cercana a Argentina
   - Database password: generar y guardar de manera segura
4. Esperar provisión (~2 min)
5. Obtener:
   - **DATABASE_URL** (con pooling): Project Settings → Database → Connection string → URI (Transaction mode)
   - **DIRECT_URL** (sin pooling): Connection string → URI (Direct connection)
   - **SUPABASE_URL**: Project Settings → API → Project URL
   - **SUPABASE_SERVICE_ROLE_KEY**: Project Settings → API → service_role key

### Paso 7 — Crear cuenta en Resend y verificar dominio

1. Ir a https://resend.com/
2. Crear cuenta
3. Sidebar → **Domains** → Add Domain
4. Configurar:
   - Domain: `plataformatextil.com.ar`
   - Region: la que detecte automáticamente (Resend elige según ubicación, suele ser `sa-east-1`)
5. Resend pregunta si autoriza cargar DNS records automáticamente en Cloudflare
6. Click **Authorize** — esto carga 3 records en Cloudflare:
   - MX para `send.plataformatextil.com.ar`
   - TXT DKIM en `resend._domainkey`
   - TXT SPF en `send.plataformatextil.com.ar`
7. Esperar verificación (5-30 min)
8. Estado esperado: **Domain verified**
9. Crear API Key: sidebar → **API Keys** → Create → `RESEND_API_KEY`

### Paso 8 — Configurar Email Routing en Cloudflare (recibir emails)

Resend solo envía. Para recibir respuestas necesitamos Cloudflare Email Routing.

1. Cloudflare → en el dominio → **Email → Email Routing**
2. Click **Enable Email Routing** o **Get started**
3. Configurar destination address: email personal o institucional (ej: `correo@gmail.com`)
4. Verificar el email destination (Cloudflare manda link de verificación)
5. Crear custom addresses:
   - `notificaciones@plataformatextil.com.ar` → forward a Gmail
   - `soporte@plataformatextil.com.ar` → forward a Gmail
   - `contacto@plataformatextil.com.ar` → forward a Gmail
6. Cloudflare agrega automáticamente:
   - 3 records MX para `plataformatextil.com.ar`
   - 1 TXT SPF
   - 1 TXT DKIM
7. (Opcional pero recomendado) Catch-all address: cualquier alias no configurado se reenvía al email principal

### Paso 9 — Agregar DMARC en Cloudflare

DMARC mejora deliverability y previene spoofing:

1. Cloudflare → DNS → Records → Add record
2. Configurar:
   - Type: `TXT`
   - Name: `_dmarc`
   - Content: `v=DMARC1; p=none; rua=mailto:correo@gmail.com`
   - Proxy status: **DNS only**
3. Save

### Paso 10 — Agregar dominios en Vercel

1. Vercel → proyecto → Settings → **Domains**
2. **Add Domain**: `plataformatextil.com.ar`
   - Asignar a **Production (main branch)**
   - Vercel da DNS records para configurar
3. **Add Domain**: `dev.plataformatextil.com.ar`
   - Asignar a rama **develop** (Preview)
   - Vercel da otro CNAME

### Paso 11 — Agregar DNS records en Cloudflare (apuntar a Vercel)

Cloudflare → DNS → Records → Add record (3 veces):

| Tipo | Name | Value | Proxy |
|---|---|---|---|
| `A` | `@` | `216.150.1.1` (IP que provee Vercel) | DNS only |
| `CNAME` | `www` | `42db99a15e449604.vercel-dns-017.com` (provee Vercel) | DNS only |
| `CNAME` | `dev` | `42db99a15e449604.vercel-dns-017.com` (provee Vercel) | DNS only |

**Crítico:** todos en **DNS only** (nube gris), NO en Proxied (naranja). Vercel hace su propio SSL/CDN.

Esperar propagación: minutos a unas horas. Vercel detecta automáticamente y emite certificados SSL.

### Paso 12 — Configurar variables de entorno en Vercel

Vercel → proyecto → Settings → **Environment Variables**

Las variables se separan por ambiente. Algunas son **shared** (mismas en todos), otras son **per-environment** (distintas según production/preview/development).

#### Variables shared (mismas en Production, Preview, Development)

| Variable | Valor |
|---|---|
| `RESEND_API_KEY` | API key de Resend |
| `ANTHROPIC_API_KEY` | API key de Claude (Anthropic) |
| `VOYAGE_API_KEY` | API key de Voyage AI |
| `AFIP_SDK_TOKEN` | Token de AfipSDK |
| `AFIP_SDK_ENV` | `production` |
| `AFIP_CUIT_PLATAFORMA` | CUIT institucional de la plataforma |
| `ARCA_ENABLED` | `true` |
| `ARCA_PROVIDER` | `afipsdk` |
| `GOOGLE_CLIENT_ID` | OAuth de Google |
| `GOOGLE_CLIENT_SECRET` | OAuth secret de Google |
| `GITHUB_TOKEN` | Token de GitHub (para crear issues desde QA) |
| `GITHUB_REPO` | `Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil` |
| `UPSTASH_REDIS_REST_URL` | URL de Upstash Redis (rate limiting) |
| `UPSTASH_REDIS_REST_TOKEN` | Token de Upstash Redis |

#### Variables específicas de Production (rama main)

| Variable | Valor |
|---|---|
| `NEXTAUTH_URL` | `https://plataformatextil.com.ar` |
| `NEXTAUTH_SECRET` | Secret generado (32+ caracteres, único por ambiente) |
| `DATABASE_URL` | Connection string de Supabase production (con pooling) |
| `DIRECT_URL` | Connection string de Supabase production (sin pooling) |
| `SUPABASE_URL` | URL de Supabase production |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key de Supabase production |
| `EMAIL_FROM` | `notificaciones@plataformatextil.com.ar` |
| `EMAIL_FROM_NAME` | `Plataforma Digital Textil` |
| `EMAIL_SUPPORT` | `soporte@plataformatextil.com.ar` |
| `EMAIL_REPLY_TO` | `soporte@plataformatextil.com.ar` |

#### Variables específicas de Preview/Development (rama develop)

| Variable | Valor |
|---|---|
| `NEXTAUTH_URL` | `https://dev.plataformatextil.com.ar` |
| `NEXTAUTH_SECRET` | Secret distinto al de production |
| `DATABASE_URL` | Connection string de Supabase development |
| `DIRECT_URL` | Connection string de Supabase development |
| `SUPABASE_URL` | URL de Supabase development |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key de Supabase development |
| `EMAIL_FROM` | `notificaciones@plataformatextil.com.ar` |
| `EMAIL_FROM_NAME` | `Plataforma Digital Textil (DEV)` |
| `EMAIL_SUPPORT` | `soporte@plataformatextil.com.ar` |
| `EMAIL_REPLY_TO` | `soporte@plataformatextil.com.ar` |

**Recomendación:** usar dos proyectos Supabase separados (uno para prod, otro para dev) para no contaminar datos.

### Paso 13 — Configurar certificados de AFIP (si aplica)

Para integración con ARCA via AfipSDK:

1. Generar certificado AFIP en https://servicios1.afip.gob.ar/clavefiscal/dvi/Login.aspx
2. Servicios fiscales → Administrador de Relaciones de Clave Fiscal
3. Adherir el servicio "WSAA" y "WSDP" (Padrón de Personas)
4. Generar certificado .crt y .key
5. Subir a Vercel como variables de entorno:
   - `AFIP_CERT`: contenido del .crt (multilínea)
   - `AFIP_KEY`: contenido del .key (multilínea)

### Paso 14 — Desplegar por primera vez

1. Vercel detecta cualquier push a `main` o `develop` y dispara build automáticamente
2. Hacer push inicial:

```bash
git checkout main
git push origin main
```

3. Vercel:
   - Ejecuta `prisma migrate deploy` (corre migraciones en Supabase)
   - Ejecuta `prisma generate` (genera cliente Prisma)
   - Ejecuta `next build`
   - Despliega a `plataformatextil.com.ar`

4. Repetir con `develop` para desplegar al ambiente dev.

### Paso 15 — Verificar end-to-end

Lista de verificación:

- [ ] https://plataformatextil.com.ar carga la app
- [ ] HTTPS funciona (candado verde)
- [ ] https://dev.plataformatextil.com.ar carga la app dev
- [ ] Magic link de login llega al email (verificar Gmail)
- [ ] Email viene de `notificaciones@plataformatextil.com.ar`
- [ ] Link del magic link apunta al dominio correcto
- [ ] Click en magic link loguea correctamente
- [ ] Email a `soporte@plataformatextil.com.ar` se reenvía a Gmail (probar desde otra cuenta)
- [ ] Migraciones de Prisma se aplicaron en Supabase
- [ ] No hay errores en logs de Vercel

---

## Workflow de despliegue continuo

Una vez configurado el setup inicial:

1. **Desarrollo local** en branch feature
2. **Push a feature branch** → Vercel genera preview deploy con URL única
3. **PR contra develop** → CI corre (lint, build, tests)
4. **Merge a develop** → Vercel despliega automáticamente a `dev.plataformatextil.com.ar`
5. **Validación en dev** → manual o por QA
6. **PR de develop a main** → CI corre
7. **Merge a main** → Vercel despliega automáticamente a `plataformatextil.com.ar`

---

## Build script

El `build` de producción está configurado para correr migraciones automáticamente:

```json
"scripts": {
  "build": "prisma migrate deploy && prisma generate && next build"
}
```

Esto significa que cada deploy a Vercel:

1. Aplica migraciones pendientes a la base de datos (`prisma migrate deploy`)
2. Regenera el cliente Prisma (`prisma generate`)
3. Compila la app Next.js (`next build`)

**Riesgo:** si una migración falla, el build falla y no se despliega. Esto es deseable como safeguard.

**Cuidado:** las migraciones se aplican a la base que apunta `DATABASE_URL` del ambiente correspondiente. Asegurarse de que los environments en Vercel apunten a las bases correctas.

---

## Troubleshooting común

### El dominio no resuelve

Verificar:
- En NIC.ar → dominio dice "Delegado: SI"
- Los 2 nameservers son los de Cloudflare (carl.ns + grace.ns o los que asignaron)
- En Cloudflare → dominio dice "Active"
- DNS records en Cloudflare con Proxy status "DNS only"

### Vercel dice "Invalid Configuration" en un dominio

- Esperar 5-30 min (propagación DNS)
- Verificar que los A/CNAME en Cloudflare coincidan con los que Vercel pide
- Verificar que el Proxy status sea **DNS only**

### Magic link no llega al email

Verificar:
- Dominio verificado en Resend (Status: Verified)
- Los 3 DNS records de Resend están en Cloudflare
- `RESEND_API_KEY` configurado en Vercel para ese ambiente
- `EMAIL_FROM` apunta al dominio verificado
- No está en spam de Gmail

### Magic link llega pero el link es a URL vieja

Verificar:
- `NEXTAUTH_URL` en Vercel apunta al dominio correcto
- Redeploy después de cambiar variables de entorno

### Forwarding de email no funciona

Verificar:
- Cloudflare → Email → Email Routing → Routing status: Active
- Destination address verificada
- Custom addresses creadas y Active
- DNS records MX/SPF/DKIM de Cloudflare cargados

### Build falla en Vercel

Verificar:
- Variables de entorno configuradas en el ambiente correcto
- `DATABASE_URL` apunta a Supabase válido
- Migraciones de Prisma no tienen errores
- `next build` funciona localmente

---

## Renovación del dominio

El dominio `.com.ar` se renueva anualmente en NIC.ar:

1. NIC.ar envía email de aviso ~30 días antes del vencimiento
2. Ingresar a NIC.ar → **Mis dominios**
3. Click **Renovar** en el dominio
4. Pagar
5. Confirmación inmediata

**Costo aproximado:** ~$8.500 ARS/año (puede variar).

**Riesgo de no renovar:** después del vencimiento hay un período de gracia de unos meses. Si no se renueva, el dominio queda libre y cualquiera puede tomarlo.

---

## Costos mensuales aproximados

| Servicio | Costo | Comentario |
|---|---|---|
| NIC.ar | ~$700 ARS/mes | Prorrateado del costo anual |
| Cloudflare (Free) | $0 | Suficiente para tráfico actual |
| Vercel (Hobby) | $0 | Hasta 100GB bandwidth/mes |
| Supabase (Free) | $0 | Hasta 500MB DB + 1GB Storage |
| Resend (Free) | $0 | Hasta 3.000 emails/mes |
| Upstash Redis (Free) | $0 | Hasta 10.000 commands/día |
| Claude API | Variable | Pay-per-token |
| Voyage AI | Variable | Pay-per-token |
| AfipSDK | Variable | Según tier contratado |

**Total infraestructura base:** ~$700 ARS/mes
**Total con API consumption:** depende del uso. Estimación piloto: ~$1 USD/mes para Claude+Voyage según consumo proyectado.

---

## Documentos relacionados

- [SETUP.md](SETUP.md) — Setup de desarrollo local (en preparación)
- [KNOWN_ISSUES.md](KNOWN_ISSUES.md) — Bugs conocidos y workarounds (en preparación)
- [HOW_TO_RUN_QA.md](HOW_TO_RUN_QA.md) — Cómo correr una auditoría QA

---

**Última actualización:** Mayo 2026

Si encontrás algo desactualizado o necesitás agregar un componente nuevo, actualizá este documento y avisá al equipo.
