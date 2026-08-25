# SPEC de Transferencia — PDT → Cámara Industrial Argentina de la Indumentaria (CIA)

> **Estado:** BORRADOR para revisión de Gerardo / Sergio / OIT.
> **Autor:** equipo de desarrollo (Gerardo).
> **Fecha:** 2026-08-25.
> **Alcance:** traspaso completo de la Plataforma Digital Textil (PDT) desde el equipo de desarrollo actual (Gerardo / OIT-UNTREF) hacia el receptor institucional, la **Cámara Industrial Argentina de la Indumentaria (CIA — ciaindumentaria.com.ar)**.

---

## 0. Propósito y contexto

Este documento es el **plan operativo del fin de ciclo**: la mecánica exacta, fase por fase, para transferir la plataforma en producción a la CIA sin pérdida de servicio, sin credenciales huérfanas en manos previas, y con trazabilidad institucional.

No re-documenta la plataforma: **consolida y ordena** lo que ya existe y lo convierte en una secuencia ejecutable. Fuentes que este SPEC integra (no las reemplaza — las referencia):

| Fuente | Qué aporta | Path |
|---|---|---|
| **Handover Package v1.0** | Checklist OIT a–j de lo entregado y sus gaps | `docs/handover/HANDOVER_PACKAGE.md` |
| **Anexo de transferencia (Sergio)** | Estructura a–j origen (Hay / Falta / N-A / Responsable) | `docs/handover-oit-analisis-y-division.md` |
| **Inventario de accesos** | Mapa credencial→proveedor. **Canal seguro separado — NO está en el repo.** Se referencia, no se vuelca acá | (fuera del repo; entregado a OIT/UNTREF) |
| **Deuda y roadmap** | Checklist de transferencia + comando `git filter-repo` | `docs/handover/DEUDA_Y_ROADMAP.md` |
| **Runbook operativo** | Deploy IDs, refs Supabase, §9 contactos de escalamiento | `docs/handover/RUNBOOK_OPERATIVO.md` |
| **Condiciones de producción** | 8 acciones de go-live (7 silenciosas) | `docs/handover/CONDICIONES_PRODUCCION.md` |
| **Especificaciones de continuidad** | Definiciones institucionales pendientes | `docs/handover/ESPECIFICACIONES_CONTINUIDAD.md` |
| **Runbook rescope secrets** | Rotación de secretos por entorno | `.claude/specs/RUNBOOK_RESCOPE_SECRETS.md` |
| **Backlog de pendientes** | Todo lo que queda por delante, priorizado | `docs/transferencia/BACKLOG_PENDIENTES.md` |

**Por qué existe este proceso (riesgo ISRA N° 68).** La ISRA (evaluación de riesgos, canal separado) registra como riesgo abierto la **concentración de la titularidad y las credenciales de la plataforma en cuentas personales del equipo de desarrollo** (hoy la cuenta `gbreard`). La **mitigación de ese riesgo ES exactamente este proceso**: pasar titularidad a la institución receptora y rotar todo secreto que haya pasado por manos previas. El anclaje in-repo de N° 68 aparece en `docs/handover/ESPECIFICACIONES_CONTINUIDAD.md` (definiciones institucionales pendientes, incl. el DPA con Supabase). ⚠️ **Confirmar el enunciado exacto de N° 68 contra la ISRA completa** (canal separado) antes de firmar el acta de cierre.

**Contexto del receptor.** La CIA **ya participa del piloto**: `csamaniego@ciaindumentaria.com.ar` es una **marca verificada en producción** (uno de los 4 con evidencia ARCA real). El receptor no parte de cero: tiene un usuario activo, con contexto de uso real de la plataforma.

---

## Bloqueantes institucionales — resolver ANTES de la F2

> Estas cuatro decisiones **no son técnicas**: las toma OIT/UNTREF con la CIA (Sergio coordina). Ninguna transferencia de titularidad (F2) puede ejecutarse hasta que estén resueltas por escrito. Se listan primero porque son el camino crítico real del proyecto.

| # | Decisión abierta | Por qué bloquea | Quién resuelve |
|---|---|---|---|
| **(a)** | **Destino del repositorio** — ¿organización de la CIA? ¿de OIT? ¿GIDs con la CIA como admin? | El código es **propiedad de OIT por contrato** (LICENSE Apache-2.0, Copyright 2026 OIT+UNTREF). El destino define a qué org se transfiere el repo en F2 y quién queda como owner. | OIT + CIA (Sergio coordina) |
| **(b)** | **Titularidad del dominio en NIC.ar** — ¿CIA u OIT? | `plataformatextil.com.ar` es el dominio institucional. El cambio de titular en NIC.ar es un **trámite formal y lento** (ver F2.5): define el destinatario del traspaso. | OIT + CIA |
| **(c)** | **Quién asume la facturación** de aquí en adelante — AfipSDK (tiene costo/token), Supabase, Vercel, y consumo variable (Anthropic, Voyage, Resend, Upstash). | Sin un responsable de pago designado, los servicios pagos se cortan al desvincular la cuenta/tarjeta actual. AfipSDK y Supabase Pro son los de corte inmediato. | OIT + CIA |
| **(d)** | **Interlocutor técnico designado por la CIA** | Es la contraparte de todo el proceso: recibe accesos, verifica operación, ejecuta la rotación (F3) y firma el acta (F6). Sin esta persona no hay a quién transferir. | CIA |

**Regla:** la F1 (documentos) y la F1.5 (limpieza del repo) pueden avanzar en paralelo a la resolución de los bloqueantes. La **F2 en adelante NO arranca** hasta tener (a)–(d) por escrito.

---

## Fases del proceso

Resumen de la secuencia. El detalle de cada fase está debajo.

| Fase | Qué | Depende de | Responsable |
|---|---|---|---|
| **F0** | Entrega limpia (deploy del miércoles: #478) | — | Gerardo |
| **F1** | Estos dos documentos (SPEC + BACKLOG) | — | Gerardo |
| **F1.5** | Limpieza y curaduría del repo (3 pasos con checkpoint) | F1 | Gerardo (con OK de Gerardo entre pasos) |
| **F2** | Transferencia de titularidad de cuentas | Bloqueantes (a)–(d) | Gerardo + interlocutor CIA |
| **F3** | Rotación integral de credenciales **por el receptor** | F2 | Interlocutor CIA |
| **F4** | Reunión de traspaso (estructura a–j) | F2, F3 | Gerardo + Sergio + CIA |
| **F5** | Acompañamiento acotado (30 días, fin explícito) | F4 | Gerardo |
| **F6** | Acta de cierre formal | F5 | OIT + CIA |

---

### F0 — Entrega limpia (pre-transferencia)

**Objetivo:** que lo que se transfiere sea el estado de producción "definitivo del piloto", sin banderas de evento ni pendientes de go-live abiertos.

El deploy pendiente (**issue #478**) se ejecuta **ANTES** de transferir. Contenido de ese deploy:

1. **Rollback de `MODO_EVENTO`** — quitar la variable de entorno del Preview de Vercel (y de Producción si estuviera). Con ella apagada: se desactiva la página `/demo`, el logout vuelve a `/login` (no a `/demo`), el timeout de inactividad de 12 min y la relajación de rate-limits del evento. Verificar que `/demo` deja de responder y que el login normal funciona.
2. **Fila de Cloudflare en la Política de Privacidad §8** — completar el renglón del subprocesador en `docs/legal/POLITICA_DE_PRIVACIDAD.md` (y la página legal servida).
3. **Rotación de `RESEND_API_KEY`** — la clave estuvo expuesta; rotarla en Resend y actualizar Vercel (Prod + Preview). ⚠️ Coordinar con Sergio: rotarla invalida los emails de verificación en vuelo hasta propagar la nueva.

**Criterio de salida F0:**
- [ ] `MODO_EVENTO` fuera; `/demo` no responde; logout → `/login`.
- [ ] Cloudflare listado como subprocesador en Política §8 (repo + página live).
- [ ] `RESEND_API_KEY` rotada; email de verificación probado end-to-end en prod.
- [ ] `/api/health` = 200 y `/api/health/version` reporta el SHA esperado.
- [ ] Producción corriendo el artefacto objetivo (hoy `v2.1.0` / `b3e4be1`; confirmar el vigente el día del deploy).

> ⚠️ **F0 es opt-in puntual sobre PROD.** Aplica las advertencias de `docs/handover/CONDICIONES_PRODUCCION.md`: 7 de las 8 acciones de go-live fallan en silencio. No ejecutar un reseed de DEV como parte de F0.

---

### F1 — Documentos del proceso

Este SPEC (`SPEC_TRANSFERENCIA.md`) + el `BACKLOG_PENDIENTES.md`, ambos en `docs/transferencia/`. Cierran cuando Gerardo los revisa y se mergean a `develop` con CI verde.

**Criterio de salida F1:**
- [ ] `SPEC_TRANSFERENCIA.md` revisado y aprobado por Gerardo.
- [ ] `BACKLOG_PENDIENTES.md` revisado y aprobado.
- [ ] README raíz actualizado como puerta de entrada (ver F1.5 / README).

---

### F1.5 — Limpieza y curaduría del repositorio

**Objetivo:** entregar un árbol limpio y navegable, sin romper nada y sin borrar historia con valor. Se ejecuta **con red**: 3 pasos con un checkpoint humano obligatorio.

> **Regla de oro:** *nada se borra sin clasificar, nada se clasifica sin verificar que no rompe.*

- **PASO 1 — Inventario clasificado (sin tocar nada).** Recorrer todo el árbol y clasificar cada archivo/carpeta en A (VIVO) / B (HISTÓRICO CON VALOR) / C (DESCARTABLE) / D (NO DEBERÍA ESTAR). **Se presenta el inventario completo y se FRENA**: Gerardo revisa la lista antes de que se borre nada. → *Entregable: inventario A/B/C/D (documento aparte / PR de revisión).*
- **PASO 2 — Verificación de no-rotura (tras el OK de Gerardo).** Por cada candidato C, grep de imports/paths en código, configs (`next.config`, `package.json` scripts, workflows CI, `vercel.json`) y links desde docs vivos. Lo referenciado se reclasifica, no se borra. Luego: eliminar los C, mover los B a `docs/archivo/` con índice, y correr **suite completa + build de producción local + deploy de preview verde** como prueba de no-rotura.
- **PASO 3 — Auditoría de historia git (crítico pre-transferencia).** Buscar en TODA la historia si alguna vez se commitearon secretos, los docs de canal separado (`INVENTARIO_ACCESOS`, `HALLAZGOS_SEGURIDAD`, `ISRA`) o datos personales del piloto. **Se REPORTA sin actuar**: la decisión de reescribir historia (`git filter-repo`) vs transferir con nota es de Gerardo, y cambia el plan de la F2.

**Entregables de la F1.5 (ya en esta PR, sin ejecutar borrados):**
- `docs/transferencia/INVENTARIO_LIMPIEZA.md` — PASO 1: clasificación A/B/C/D de todo el árbol. **⛔ Checkpoint: requiere OK de Gerardo antes del PASO 2.**
- `docs/transferencia/AUDITORIA_HISTORIA_GIT.md` — PASO 3: reporte de historia (solo lectura).

**Resultado de la auditoría (resumen — detalle en `AUDITORIA_HISTORIA_GIT.md`):**
- ✅ **Ningún secreto vivo fue commiteado jamás** (tree ni historia). Ninguna credencial necesita rotación *por causa del repo* (las vivas se rotan igual en F3).
- ⚠️ **PII real del piloto trackeada:** `scripts/migracion-piloto/lista.txt` (+ `migrar.ts`, allowlist/tests) con 14 emails reales de participantes. En tree e historia.
- ⚠️ `INVENTARIO_ACCESOS.md` + `HALLAZGOS_SEGURIDAD.md` viven en historia (borrados del tree, #459); sin valores de secreto, valor de reconocimiento.
- ⚠️ Certificado AFIP **público** `.crt` trackeado en `docs/Otros/Documentacion/` (sin clave privada) — sacar por higiene.

**Vínculo con F2 (git filter-repo).** `docs/handover/DEUDA_Y_ROADMAP.md` dejaba anotado un comando que cubría **solo** los dos docs de canal separado:

```
git filter-repo --path docs/handover/INVENTARIO_ACCESOS.md \
                --path docs/handover/HALLAZGOS_SEGURIDAD.md --invert-paths
```

La auditoría amplía el alcance: si se decide sanear la historia, hay que **incluir también la PII del piloto** (`scripts/migracion-piloto/lista.txt` y compañía) y sacar el `.crt`. Dos caminos, según el bloqueante **(a)**:
- **Transferir el repo tal cual:** ejecutar `filter-repo` ampliado + `push --force` coordinado + re-clonado por todas las partes, **antes** de transferir.
- **Repo destino en organización nueva:** crear el repo destino **desde un estado ya saneado** — más limpio que reescribir el histórico. Recomendado si (a) resuelve "organización nueva de la CIA".

Decisión de Gerardo según `AUDITORIA_HISTORIA_GIT.md`.

**Criterio de salida F1.5:**
- [ ] Inventario A/B/C/D presentado y aprobado por Gerardo (PASO 1).
- [ ] C eliminados y B archivados en `docs/archivo/` con índice; suite + build + preview verdes (PASO 2).
- [ ] Reporte de historia git entregado; decisión filter-repo-vs-nota tomada por Gerardo (PASO 3).

---

### F2 — Transferencia de titularidad de cuentas

> **No arranca hasta tener resueltos los bloqueantes (a)–(d).**

**Mecánica estándar por cuenta** (la misma para todos los servicios que la soportan):

1. **Invitar al receptor como admin** (no como owner todavía).
2. **El receptor verifica que opera** — entra, ve el recurso, confirma que puede administrar.
3. **Transferir el ownership** al receptor.
4. **Gerardo queda como member temporal** durante la F5 (acompañamiento), y se retira en la F6.

**Orden de ejecución.** El trámite de dominio (NIC.ar) es el **más lento** y va **primero de la fila**. El resto puede paralelizarse una vez designado el interlocutor.

#### F2.1 — NIC.ar (dominio) — PRIMERO, es el más lento

`plataformatextil.com.ar`. El cambio de **titular** en NIC Argentina es un trámite formal (no una invitación de plataforma): requiere CUIT del nuevo titular, clave fiscal / usuario NIC, y puede demorar días/semanas. **Iniciarlo apenas se resuelva el bloqueante (b).**
- La **gestión de DNS** hoy vive en Vercel (registros apuntando al proyecto). El cambio de titular en NIC no toca el DNS mientras los nameservers/registros no cambien — planificar para **no cortar la resolución** durante el traspaso.
- Verificar tras el cambio: SPF/DKIM/DMARC siguen válidos (email Resend), el dominio sigue resolviendo a Vercel, HTTPS OK.

#### F2.2 — GitHub (repositorio + Actions)

Org actual `Grupo-De-Investigacion-y-Desarollo-GIDs`, repo `plataforma-textil`.
- Destino según bloqueante **(a)**. Mecánica: `Settings → Transfer ownership` (o recrear en org destino desde estado purgado, ver F1.5/PASO 3).
- Trae consigo: Actions (workflows `e2e.yml`, `qa-pages.yml`, `test.yml`), GitHub Pages (`gh-pages` → QA interactivos), branch protection de `main`/`develop`.
- **Secrets de Actions** (`GITHUB_TOKEN` es automático; revisar secrets del repo: `CI_BYPASS_TOKEN`, tokens de deploy) — se re-crean del lado receptor en F3.
- Verificar post-transfer: CI corre verde en el repo transferido; Pages publica.

#### F2.3 — Vercel (hosting, CI/CD, DNS, cron)

Proyecto en región `gru1`, cuenta actual `gbreard` (gbreard@gmail.com).
- Transferir el **proyecto** a la cuenta/equipo del receptor (Vercel: transfer project, o mover a un Team de la CIA).
- **Trae consigo:** dominios asignados, **env vars** (Prod + Preview), integración con GitHub, cron jobs (gracia CUIT 60d), configuración de deploy (build corre `prisma migrate deploy`).
- ⚠️ Las **env vars viajan como valores** — planificar que **F3 rota todo** después. No confiar en las claves heredadas.
- Confirmar plan (Hobby/Pro) y quién paga (bloqueante **c**).
- Verificar post-transfer: deploy de `main`→Prod y `develop`→Preview funcionan; `/api/health` 200.

#### F2.4 — Supabase (LOS DOS proyectos)

- **PROD** — ref `nefbhacmjrzynnhvgfnl` (`sa-east-1`). Postgres 17.6 + Storage + auth.
- **DEV** — ref `fjddgukwydsdcrqoxvns` (`sa-east-1`). Preview / local.
- Mecánica: transferir **ambos** proyectos a la organización Supabase del receptor (Supabase: transfer project entre orgs; puede requerir que el receptor tenga org con billing configurado → bloqueante **c**).
- **No perder:** los buckets de Storage (`imagenes` público, `documentos` privado) y las políticas RLS viajan con el proyecto. Confirmar que las imágenes demo (reseed-safe) y los documentos siguen accesibles post-transfer.
- Verificar post-transfer: la app en Vercel conecta a ambos (health 200), Storage sirve imágenes, RLS intacta.

#### F2.5 — Cloudflare (zona), si aplica

⚠️ Verificar si hay una **zona Cloudflare** activa (la Política §8 lista Cloudflare como subprocesador — confirmar si es CDN/proxy propio o solo de un proveedor). Si hay zona propia: transferir la zona a la cuenta del receptor y re-apuntar nameservers según lo definido con NIC.ar (F2.1). Si Cloudflare entra solo vía Vercel, no hay zona que transferir — dejarlo documentado.

#### F2.6 — Resend (email transaccional)

From `notificaciones@plataformatextil.com.ar`.
- Transferir la cuenta/team de Resend, o re-crear del lado receptor y re-verificar el dominio (SPF/DKIM). La clave se rota en F3 (y ya se rotó una vez en F0).
- Verificar: email de verificación y de notificaciones sale con el dominio propio.

#### F2.7 — AfipSDK / ARCA (verificación CUIT) — tiene facturación

- Servicio pago (token). Requiere **cambio de responsable de pago** (bloqueante **c**) además del acceso.
- Trae consigo: `AFIP_SDK_TOKEN`, cert/key (`AFIP_CERT`, `AFIP_KEY`), CUIT de plataforma. **Gap conocido:** falta DPA con AfipSDK (ver BACKLOG y riesgo 68 relacionado).
- Verificar: una verificación CUIT de prueba responde OK con la cuenta del receptor.

#### F2.8 — UptimeRobot (monitoreo)

- Monitor keyword sobre `/api/health`, intervalo 5 min. Mover a cuenta con **email institucional** de la CIA (recomendado) para que las alertas lleguen al receptor.

#### F2.9 — Casillas institucionales y servicios de consumo

- **Casillas institucionales** (`notificaciones@…`, soporte, reply-to): definir titularidad y buzón destino del lado CIA.
- **Anthropic (Claude API)** y **Voyage AI** (RAG): consumo variable; transferir cuenta o re-crear keys del lado receptor; asignar billing (bloqueante **c**).
- **Google Cloud OAuth** (`GOOGLE_CLIENT_ID/SECRET`): login social (hoy planificado/no-operativo). Re-crear credenciales en el proyecto GCP del receptor si se activa.
- **Upstash (Redis / rate limiting)**: transferir o re-crear DB; keys se rotan en F3.

**Criterio de salida F2:**
- [ ] Dominio NIC.ar a nombre del titular definido (b); DNS sin corte.
- [ ] GitHub, Vercel, Supabase (×2), Resend, AfipSDK, UptimeRobot, Upstash, Anthropic, Voyage, GCP OAuth: cada uno con el receptor como **owner** y Gerardo como member temporal.
- [ ] Billing reasignado (c) en todos los servicios pagos.
- [ ] App en producción operativa end-to-end con las cuentas del receptor (health, login, Storage, email, verificación CUIT).

---

### F3 — Rotación integral de credenciales (POR EL RECEPTOR)

**Objetivo:** que **ninguna clave que haya pasado por manos previas siga viva.** La rotación la ejecuta el **interlocutor técnico de la CIA** (no Gerardo) — así queda garantizado que el equipo saliente no conserva secretos operativos. Es la mitigación material del riesgo 68.

Guía de referencia: `.claude/specs/RUNBOOK_RESCOPE_SECRETS.md` (rotación por entorno). Lista de qué rotar (fuente de verdad de dónde vive cada una: **INVENTARIO_ACCESOS**, canal separado):

| Secreto | Dónde | Nota |
|---|---|---|
| `NEXTAUTH_SECRET` | Vercel Prod + Preview | **P0** — rotarla invalida las sesiones JWT vivas (avisar). |
| `DATABASE_URL` / `DIRECT_URL` | Supabase PROD + DEV → Vercel | Rotar password de la DB en Supabase y propagar. |
| `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_URL` | Supabase → Vercel | Service role = acceso total; rotar sí o sí. |
| `RESEND_API_KEY` | Resend → Vercel | Ya rotada en F0; re-rotar bajo titularidad del receptor. |
| `AFIP_SDK_TOKEN`, `AFIP_CERT`, `AFIP_KEY` | AfipSDK → Vercel | Re-emitir bajo la cuenta del receptor. |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | Upstash → Vercel | Rotar token (+ variantes `_TEST` en CI). |
| `ANTHROPIC_API_KEY`, `VOYAGE_API_KEY` | Anthropic / Voyage → Vercel | Re-emitir bajo cuentas del receptor. |
| `GOOGLE_CLIENT_ID/SECRET` | GCP → Vercel | Si se activa OAuth. |
| `CRON_SECRET` | Vercel Prod + Preview | Necesario para el cron de gracia CUIT (si falta, no corre — silencioso). |
| `CI_BYPASS_TOKEN` / tokens de Actions | GitHub repo secrets | Re-crear del lado receptor. |
| `NEXTAUTH_URL` | Vercel | Debe apuntar al dominio institucional (no a la URL provisional de Vercel). |

**Criterio de salida F3:**
- [ ] Todos los secretos de la tabla rotados por el receptor; los valores previos revocados/inválidos.
- [ ] App operativa post-rotación (health, login tras `NEXTAUTH_SECRET` nuevo, email, CUIT, cron de gracia).
- [ ] Confirmación escrita del receptor de que el equipo saliente ya no tiene secretos vivos.

---

### F4 — Reunión de traspaso

**Objetivo:** transferencia de conocimiento en vivo, con el receptor operando, sobre la estructura **a–j** del anexo de Sergio (`docs/handover-oit-analisis-y-division.md`). **Idealmente grabada.** Se registra el **deployment ID vigente ese día** (`/api/health/version`).

Agenda (recorrer los a–j, mostrando el doc/artefacto de cada punto):

- **a) Código y repositorios** — repo transferido, historia git, ramas `main`/`develop`, README/CLAUDE/CONTRIBUTING/CHANGELOG, tags.
- **b) Infraestructura y despliegue** — `ARQUITECTURA_DEPLOY.md`, `RUNBOOK_OPERATIVO.md`, `/api/health`. Flujo Vercel (`main`→Prod, `develop`→Preview, `migrate deploy` en build).
- **c) Artefactos ejecutables** — modelo tag+commit (no binario); tags `v1.0.0`/`v2.0.0`/`v2.1.0`; artefacto en prod ese día.
- **d) Configuración, acceso y credenciales** — recorrer INVENTARIO_ACCESOS (canal separado) + confirmar que F2/F3 se ejecutaron; §9 contactos de escalamiento del runbook.
- **e) Datos y migraciones** — `schema.prisma`, migraciones (37 al cierre), `seed.ts` (reseed-safe: cursos + imágenes demo), `BACKUP_RESTORE.md`.
- **f) Documentación técnica y funcional** — `GUIA_DESARROLLO.md`, manuales de operación/administración, CHANGELOG.
- **g) Calidad, pruebas y seguridad** — `COBERTURA_TESTS.md` (suite unit + E2E), CI, HARDENING; ISRA + hallazgos (canal separado).
- **h) Licencias y PI** — LICENSE (Apache-2.0, docs CC BY 4.0 IGO), `REPORTE_LICENCIAS.md` (tabla SaaS), cesión de derechos.
- **i) Cumplimiento y legal** — páginas legales, PIA, RBAC/RLS, Bloque A (P-01..P-10), dependencia de IGDS 456/457 de OIT.
- **j) Transferencia operativa** — el presente SPEC + BACKLOG + contactos + este acto de traspaso.

**Criterio de salida F4:**
- [ ] Reunión realizada (grabada) con el interlocutor técnico de la CIA.
- [ ] a–j recorridos; dudas del receptor registradas y resueltas.
- [ ] Deployment ID del día anotado en el acta.

---

### F5 — Acompañamiento acotado (30 días)

**Objetivo:** ventana de soporte con **fin explícito** para que el receptor tome operación sin dependencia indefinida.

- **Duración:** 30 días corridos desde la F4, con **fecha de fin escrita** en el acta (F6). No se renueva por defecto.
- **Alcance:** dudas de operación/deploy, interpretación de docs y runbooks, apoyo puntual ante incidentes. **No** incluye desarrollo de nuevas features (eso es backlog del receptor).
- **Rol de Gerardo:** member temporal en las cuentas (heredado de F2.4/paso 4), consulta reactiva. Se retira al cierre.
- **Canal:** definir uno (email institucional / ticket) — sin canales personales informales.

**Criterio de salida F5:**
- [ ] Ventana de 30 días transcurrida con fecha de fin explícita.
- [ ] Consultas registradas; ningún bloqueante operativo abierto atribuible al traspaso.
- [ ] Gerardo removido de las cuentas como member temporal.

---

### F6 — Acta de cierre formal

**Objetivo:** documento firmado que da por cerrado el ciclo y transferida la responsabilidad.

Contenido del acta:
- Confirmación de F0–F5 completas (con sus criterios de salida tildados).
- Inventario final de cuentas transferidas + confirmación de rotación (F3) firmada por el receptor.
- Deployment ID / tag vigente al cierre.
- Estado del **BACKLOG_PENDIENTES.md** entregado (qué recibe el receptor por delante).
- Confirmación del cierre del **riesgo ISRA N° 68** (titularidad institucional efectiva).
- Fin de la ventana de acompañamiento (fecha).
- Firmas: OIT/UNTREF (cedente), CIA (receptor), y equipo de desarrollo (constancia).

**Criterio de salida F6:**
- [ ] Acta firmada por las tres partes.
- [ ] Riesgo 68 marcado como mitigado/cerrado en la ISRA.
- [ ] Ciclo cerrado.

---

## Apéndice — Servicios y refs (referencia rápida)

> Solo **identificadores** (nombres/refs), nunca valores secretos. La fuente de verdad de credenciales es **INVENTARIO_ACCESOS** (canal separado).

| Servicio | Rol | Identificadores in-repo |
|---|---|---|
| GitHub | Repo + CI + Pages | Org `Grupo-De-Investigacion-y-Desarollo-GIDs`, repo `plataforma-textil` |
| Vercel | Hosting / CI-CD / DNS / cron | Región `gru1`, cuenta `gbreard` |
| Supabase PROD | DB + Storage + auth | ref `nefbhacmjrzynnhvgfnl` (`sa-east-1`) |
| Supabase DEV | Preview / local | ref `fjddgukwydsdcrqoxvns` (`sa-east-1`) |
| Dominio | Institucional | `plataformatextil.com.ar` — NIC Argentina; DNS en Vercel |
| Resend | Email | `notificaciones@plataformatextil.com.ar` |
| AfipSDK / ARCA | Verificación CUIT (pago) | token + cert/key; DPA gap |
| Upstash | Rate limiting | Redis REST |
| Anthropic | RAG (asistente) | Claude API |
| Voyage AI | RAG (embeddings) | embeddings API |
| Google Cloud | OAuth login | OAuth client (no-operativo) |
| UptimeRobot | Monitoreo | keyword monitor `/api/health`, 5 min |

**Secretos internos a rotar (no son cuentas de terceros):** `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `CRON_SECRET`, `CI_BYPASS_TOKEN`.

---

*Este SPEC se acompaña de `BACKLOG_PENDIENTES.md` (todo lo que queda por delante, priorizado) y del inventario A/B/C/D de la F1.5/PASO 1 (documento de checkpoint).*
