# Auditoría de historia git (F1.5 / PASO 3) — REPORTE, sin acción

> **Estado:** 📋 **REPORTE — no se modificó nada, no se reescribió historia.**
> **Fecha:** 2026-08-25.
> **Alcance:** buscar en TODA la historia del repo (todas las ramas) si alguna vez se commitearon secretos, documentos de canal separado o datos personales del piloto. **La decisión de reescribir historia (`git filter-repo`) vs transferir con nota es de Gerardo** — y cambia el plan de la F2.

## VEREDICTO: **HAY HALLAZGOS**

Ninguna credencial viva fue commiteada jamás. Las decisiones abiertas son: **PII real de participantes del piloto** (en tree e historia) y algunos documentos de reconocimiento de seguridad que persisten en la historia tras ser borrados.

---

## 1. Secretos / credenciales — LIMPIO (nunca se commiteó un valor real)

| Chequeo | Resultado |
|---|---|
| `.env` / `.env.local` / `.env.prod` / `.env.migracion` reales trackeados alguna vez | **No.** Solo `.env.example` (`7a478bb`) y `.env.test.example` (`979cf73`) — plantillas con placeholders (`onboarding@resend.dev`, `AFIP_SDK_ENV=development`, emails `@pdt.org.ar`) |
| JWTs (`eyJ…`) | **Ninguno**, en ninguna rama |
| Claves Resend (`re_…`), OpenAI (`sk-…`), Stripe (`sk_live_…`) | **Ninguna** |
| Connection strings con password (`postgres://user:pass@…`) | **Ninguno** |
| `SUPABASE_SERVICE_ROLE_KEY=` / `NEXTAUTH_SECRET=` / `CRON_SECRET=` con valor | **Ninguno** — solo referenciados por nombre en docs |

### Nota: endpoint `debug-arca` (falso positivo de "PRIVATE KEY")
- El pickaxe encontró `src/app/api/debug-arca/route.ts`, un endpoint de debug temporal.
- Agregado en **`b3f929a`** (2026-05-02) — removido en **`acc0db1`** (2026-05-03).
- El match es el **literal de string** `key.includes('BEGIN PRIVATE KEY')`. El endpoint leía `AFIP_CERT`/`AFIP_KEY`/`AFIP_SDK_TOKEN` del entorno y devolvía solo **longitudes, conteo de líneas, un booleano y `token_first10`** (primeros 10 chars del token AFIP SDK). **No hay valor de secreto en el código.**
- Nota de runtime (no es un secreto commiteado): mientras estuvo desplegado (~1 día) el endpoint habría filtrado longitudes y los primeros 10 chars de `AFIP_SDK_TOKEN` a cualquier llamante. Ya no está en el tree. Desde el punto de vista del **repo**, nada que rotar; como precaución, `AFIP_SDK_TOKEN` de todos modos se rota en la **F3**.

**Implicación:** **ninguna credencial necesita rotación por causa de la historia git.** (Los secretos vivos se rotan en su cronograma normal de transferencia — F3 —, pero ninguno está expuesto por el repo.)

---

## 2. Certificado AFIP — trackeado, pero solo la mitad PÚBLICA

- Archivo: `docs/Otros/Documentacion/plataforma-textil_10d78fb5c073a49.crt` — trackeado hoy.
- Contenido: bloque X.509 `-----BEGIN CERTIFICATE-----` (issuer `CN=Computadores, O=AFIP`). **Sin bloque `PRIVATE KEY`, nunca** (verificado en toda la historia del archivo).
- La clave privada correspondiente (`AFIP_KEY`) **no** está en el repo. `.certs/` nunca existió / nunca se trackeó.

**Implicación:** un certificado público no es un secreto, pero es material de identidad AFIP de la plataforma. Conviene sacarlo del repo transferido por higiene. Sin rotación.

---

## 3. Docs de canal separado — commiteados y luego borrados, siguen en historia (sin valores de secreto)

- `docs/handover/INVENTARIO_ACCESOS.md` y `docs/handover/HALLAZGOS_SEGURIDAD.md`
- Agregados con el Handover Package: `7dfa410` / `ff42a04` (2026-08-03); **borrados** en `58a157f` / `c454135` (#459, "docs sensibles fuera del repo"). Siguen recuperables en historia.
- Chequeo de contenido: ambos **explícitamente no contienen valores de secreto** — INVENTARIO dice *"este archivo no contiene ningún valor de secreto"*. Son descriptivos: qué servicio vive dónde, qué env vars existen, hallazgos de seguridad (K-01 RLS, re-scope de `NEXTAUTH_SECRET`, etc.).

**Implicación:** solo-historia, sensibilidad baja. No filtra credenciales, pero es un mapa de arquitectura/postura de seguridad (valor de reconocimiento). Decisión del dueño: transferir-con-nota es aceptable; un scrub con `filter-repo` es endurecimiento opcional. Nada que rotar.

---

## 4. Datos personales de usuarios del piloto — PRESENTE en tree Y en historia (preocupación principal)

- `scripts/migracion-piloto/lista.txt` — 16 líneas: header (*"Lista del piloto — CONGELADA … 14 migran"*) + **14 emails reales de participantes del piloto**. Agregado en `a7cb8b1` (#464). Trackeado hoy.
- `scripts/migracion-piloto/migrar.ts`, `scripts/migracion-piloto/README.md` — mismas direcciones reales.
- También aparecen en la allowlist de registro / tests (`src/__tests__/registro-gate.test.ts`, `demo-guard.test.ts`) y en el spec `.claude/specs/v4-a-proteger-registro-dev.md`.
- Son **gmail personales de individuos nombrados y emails de empresa** (p. ej. `@ciaindumentaria.com.ar`, `@urbanokids.com.ar`, y varios `@gmail.com` personales). No se encontraron CUITs en `lista.txt`.
- Por contraste, `prisma/seed*` usa solo **datos demo sintéticos** (`@pdt.org.ar`, `a@x.com`) — sin problema.

**Implicación:** es **PII genuina de terceros** (participantes del piloto), presente en el working tree y en toda la historia desde `a7cb8b1`. Para una transferencia a un nuevo dueño, este es el ítem que más probablemente amerita una decisión bajo criterio de protección de datos: si el nuevo dueño tiene derecho a esta lista, y si conviene sanearla (borrado del tree + `filter-repo`) antes/al transferir, o transferir-con-nota. **No involucra rotación de claves — es una decisión de privacidad/consentimiento.**

---

## 5. Dumps de base de datos — LIMPIO

- No hay `.dump` en ninguna parte de la historia. Los únicos `.sql` son `prisma/migrations/**/migration.sql` (DDL de schema) — esperado, sin datos/PII.

---

## Tabla resumen para la decisión del dueño

| # | Hallazgo | Dónde | ¿En tree hoy? | Decisión sugerida (a criterio de Gerardo) |
|---|---|---|---|---|
| 1 | Ningún secreto vivo commiteado jamás | — | — | Nada que rotar por el repo |
| 1b | Endpoint `debug-arca` (longitudes + `token_first10`, sin valores) | `b3f929a`→`acc0db1` | Removido | Ninguna (ya borrado); `AFIP_SDK_TOKEN` se rota igual en F3 |
| 2 | Certificado AFIP **público** `.crt` | `docs/Otros/Documentacion/…crt` | **Sí** | Sacar por higiene; sin rotación |
| 3 | `INVENTARIO_ACCESOS.md`, `HALLAZGOS_SEGURIDAD.md` (sin valores) | agregados `7dfa410`, borrados `c454135` | Solo historia | Transferir-con-nota o `filter-repo` opcional |
| 4 | **PII real del piloto** (14 emails + allowlist) | `scripts/migracion-piloto/*`, allowlist/tests | **Sí** + historia | Decidir scrub vs nota bajo criterio de privacidad |
| 5 | Dumps de DB | — | No | Ninguna |

## Cómo esto cambia la F2 (a decidir por Gerardo)

El comando previsto en `docs/handover/DEUDA_Y_ROADMAP.md` cubría solo los dos docs de canal separado:

```
git filter-repo --path docs/handover/INVENTARIO_ACCESOS.md \
                --path docs/handover/HALLAZGOS_SEGURIDAD.md --invert-paths
```

Si se decide sanear la historia, **el alcance ahora incluye también la PII del piloto** (`scripts/migracion-piloto/lista.txt` y compañía). Dos caminos, según el destino del repo (bloqueante **a** del SPEC):

- **Repo se transfiere tal cual (misma historia):** ejecutar `filter-repo` ampliado (docs de canal separado + PII) + `push --force` coordinado + re-clonado por todas las partes, **antes** de transferir. Sacar además el `.crt` del tree.
- **Repo destino es una organización nueva:** crear el repo destino **desde un estado ya saneado** (sin la historia problemática) es más limpio que reescribir el histórico del repo actual. Recomendado si (a) resuelve "organización de la CIA/nueva".

> Todo lo anterior se inspeccionó en forma redactada/agregada; no se expuso ningún secreto completo. No se modificó ningún archivo ni se reescribió historia — reporte de solo lectura.
