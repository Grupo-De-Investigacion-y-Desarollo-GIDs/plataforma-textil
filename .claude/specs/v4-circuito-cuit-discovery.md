# Circuito CUIT — Discovery del "limbo" (verificación ARCA vs formalización)

> **Estado:** ⏳ **ESPERANDO decisión de Sergio sobre el enfoque.** Discovery **read-only** — no se implementó nada. Disparador: Sergio planteó el escenario del "limbo" (taller aprobado por COORD pero inactivo para siempre) para análisis. Toda afirmación de "qué existe hoy" está anclada con `archivo:línea`.
>
> **TL;DR:** El limbo **existe y es real**. Para un **CUIT mal tipeado no hay HOY ningún camino de salida dentro del producto** — ni para el taller ni para COORD. Las tres piezas —**CUIT almacenado**, **`verificadoAfip`**, y **la aprobación de la constancia por COORD**— viven **totalmente desacopladas**. Recomendación: **A + D + B** (ver §5). **C descartada** (saltearía el gate ARCA).

---

## 0. El escenario de Sergio

Taller se registra con CUIT mal tipeado (o no inscripto aún) → ARCA no valida → queda `EN_GRACIA`. Durante la gracia se inscribe en ARCA de verdad y sube el PDF de constancia → **COORD OPERATIVO** lo revisa y aprueba el paso de formalización. **Pero:** el CUIT en la base sigue siendo el mal tipeado, `verificadoAfip` sigue `false`, y la reactivación automática de B1 nunca se dispara (re-verificar el CUIT malo contra ARCA sigue fallando). El taller queda **aprobado por COORD pero inactivo para siempre** en el sistema.

**Veredicto del discovery: confirmado.** Con un matiz sobre *cómo se entra* (§3).

---

## 1. El mapa — respuestas a las 5 preguntas (con `archivo:línea`)

### 1. ¿El taller puede EDITAR su CUIT o re-disparar la verificación ARCA hoy? → **NO, ninguna de las dos.**

- **El `cuit` se escribe una sola vez, en el registro:** `src/app/api/auth/registro/route.ts:109` (taller), `:131` (marca). **No existe ningún otro write de `taller.cuit` en toda la app.**
- **El edit de perfil NO incluye CUIT:** `PUT /api/talleres/[id]` arma el update desde un whitelist de campos (`src/app/api/talleres/[id]/route.ts:31-39`) y **`cuit` no está** en la lista — ni para el dueño ni para ADMIN. El `taller.update` es `:97`.
- **El perfil muestra el CUIT read-only:** `src/app/(taller)/taller/perfil/page.tsx:124-125` (`CUIT` + número + "Verificado por ARCA"). El taller **ve** que está mal pero **no puede tocarlo**.
- **No hay acción de "re-verificar mi CUIT" para el taller.** El banner de inactiva dice *"Verificar mi CUIT →"* y **te manda a `/taller/formalizacion`** (`src/taller/componentes/banner-gracia.tsx`, link INACTIVA a `/taller/formalizacion`). Pero esa página **solo tiene el botón de "marcar realizado" de documentos** (`src/app/(taller)/taller/formalizacion/page.tsx:147`, `MarcarRealizadoButton`) — ahí **no hay nada que re-consulte ARCA**. → **El CTA es un callejón sin salida.**

### 2. ¿Qué hace la aprobación de COORD sobre la constancia? → **Solo estado del paso + nivel. NO toca `verificadoAfip`.**

- `PUT /api/validaciones/[id]` (rol ESTADO/COORD): setea `validacion.estado`, `aprobadoPor`, `aprobadoEn` (`src/app/api/validaciones/[id]/route.ts:37-41`) y llama a `aplicarNivel()` (`:74`).
- `aplicarNivel` **solo escribe `{ nivel, puntaje }`** (`src/compartido/lib/nivel.ts:144-147`).
- **En ningún momento la aprobación escribe `verificadoAfip` ni re-consulta ARCA.**

### 3. ¿Hay cruce entre "paso aprobado por COORD" y `verificadoAfip`? → **CERO. Viven separados.**

Dos sistemas independientes:
- **Formalización documental** (validaciones → nivel/puntaje): `validaciones/[id]/route.ts` + `nivel.ts`.
- **Verificación ARCA** (`verificadoAfip`, que gatea directorio / cotizar / gracia): `arca.ts` + `estadoCuentaInicial`/`clasificarGracia` en `gracia.ts`.

Aprobar la constancia **no mueve ni un bit** de la verificación ARCA.

### 4. ¿Existe re-verificación contra ARCA? → **SÍ, pero solo ESTADO/COORD y solo contra el CUIT ALMACENADO.**

Todos los callers de la verificación ARCA:

| Caller | Quién | Qué hace | ¿Persiste en el taller? |
|---|---|---|---|
| `api/auth/registro/route.ts:68` | público (registro) | `consultarPadron(cuitToVerify)` | Sí, al crear el taller |
| `api/auth/verificar-cuit/route.ts:18` | público (on-blur del form) | `consultarPadron(cuit)` | **No** — solo devuelve validación |
| `api/usuarios/me/roles/route.ts:104` | user logueado (agregar 2º rol) | `consultarPadron(cuit)` del rol nuevo | Crea **otra** entidad; no toca el taller existente |
| `api/estado/arca/reverificar/[id]/route.ts:27` | **ESTADO/ADMIN** (`:13`) | `sincronizarTaller(id, force=true)` | Sí, pero con el **CUIT almacenado** |
| `api/estado/arca/route.ts:29` | **ESTADO/ADMIN** (`:10`) | batch `sincronizarTaller` sobre todos | Sí, pero con el **CUIT almacenado** |

- **`sincronizarTaller` siempre re-consulta ARCA con `taller.cuit` de la DB** (`src/compartido/lib/arca.ts:177`). **No acepta un CUIT corregido.** Si el CUIT está mal, re-verificar **falla igual**.
- **El cron de B1 NO re-verifica:** solo corre `planificarAccionGracia` (reloj) → recordatorio o inactivación (`src/app/api/cron/gracia-cuit/route.ts:59`; writes `:70`, `:84`). **Nunca llama a ARCA.**
- **La reactivación automática** ocurre **únicamente** dentro de `sincronizarTaller` cuando una verificación ARCA **tiene éxito** (`arca.ts:180-197`, `datosReactivacion()` en `:189`).

### 5. ¿Qué caminos tiene HOY un taller con CUIT mal tipeado para salir del limbo? → **NINGUNO dentro del producto.**

| Vía | ¿Sirve? | Por qué |
|---|---|---|
| Taller edita su CUIT | ❌ | No existe endpoint (`talleres/[id]` no tiene `cuit` en el whitelist) |
| Taller re-dispara ARCA | ❌ | No existe; el CTA del banner va a formalización, que no tiene esa acción |
| COORD re-verifica (`reverificar/[id]`) | ❌ | Re-consulta el **CUIT malo** → falla igual |
| COORD aprueba la constancia | ❌ | No toca `verificadoAfip` (§1.2) |
| ADMIN edita el taller | ❌ | `cuit` no está en el whitelist de `PUT /api/talleres/[id]` |
| Agregar 2º rol con CUIT corregido | ❌ | Crea otra entidad; no arregla el taller existente |
| **Editar la DB a mano (dev) + reverificar** | ⚠️ | Único camino real, **fuera del producto** |
| **Borrar y re-registrar** | ⚠️ | Requiere otro email (`cuit`/`email` únicos); deja la cuenta vieja huérfana |

→ **Confirmado: queda aprobado por COORD pero inactivo para siempre.**

---

## 2. Diagrama del desacople

```
FORMALIZACIÓN DOCUMENTAL                 VERIFICACIÓN ARCA
(validaciones → nivel)                   (verificadoAfip → directorio/cotizar/gracia)
─────────────────────────                ──────────────────────────────────────────
COORD aprueba constancia                 sincronizarTaller(taller.cuit almacenado)
  → validacion.estado=COMPLETADO           → consultarPadron(cuit)  [ARCA]
  → aplicarNivel() → { nivel, puntaje }     → si OK: verificadoAfip=true + reactiva
                                            → si CUIT malo: falla, sigue inactivo
        │                                          │
        └──────────  NO SE TOCAN  ─────────────────┘
                   (cero cruce entre ambos)
```

El PDF de constancia que COORD tiene en la mano **trae el CUIT real**, pero no hay forma de que ese dato corrija `taller.cuit`.

---

## 3. Matiz importante: *cómo* se entra al limbo

Con **ARCA operativo**, un CUIT mal tipeado / no inscripto **NO deja registrarse**: `errorBloqueaRegistro` corta el registro con **400** para `CUIT_INEXISTENTE / CUIT_INACTIVO / CUIT_SIN_ACTIVIDAD` (`src/app/api/auth/registro/route.ts:72-73`; def en `src/compartido/lib/arca.ts:388-390`).

Se entra al limbo (`EN_GRACIA` con CUIT sin verificar) **solo** cuando:

1. **ARCA estaba caído/erroreando al registrarse** (`ARCA_NO_RESPONDE / AFIPSDK_ERROR` → "te dejamos continuar", `registro/route.ts:75`). Se guarda el CUIT tal cual (correcto **o** mal tipeado), `verificadoAfip=false`, y `estadoCuentaInicial(false)` = `EN_GRACIA` (`gracia.ts:76-83`, seteado en `registro/route.ts:112-115`); **o**
2. **El taller es de la población backfilleada** (existentes pre-ARCA, con `inicioGracia` = fecha de lanzamiento y CUITs viejos posiblemente mal cargados). ← **Probablemente el grueso del limbo.**

**Corolario que agrava el hueco:** un **CUIT correcto pero sin verificar** (registrado con ARCA caído) también depende de que **ESTADO corra la reverificación manual dentro de los 60 días**. Si nadie la corre, **se inactiva un CUIT válido** — no hay reintento automático (el cron solo inactiva, §1.4).

> Para responderle a Sergio: su escenario es correcto, pero el "CUIT mal tipeado → gracia" directo solo pasa con **ARCA caído al registrarse**; el caso más común del limbo son los **existentes backfilleados**.

---

## 4. Los huecos

1. **No hay forma de corregir un CUIT** post-registro (product-wide). Único write de `cuit` = registro.
2. **El CTA "Verificar mi CUIT" del banner de inactiva no verifica nada** — va a `/taller/formalizacion`, que no tiene esa acción.
3. **La aprobación de la constancia por COORD no está conectada a la verificación ARCA** — COORD tiene el CUIT real (en el PDF) y no puede usarlo para corregir/reverificar.
4. **No hay reintento automático de ARCA** para `verificadoAfip=false` en gracia; el cron solo inactiva → un CUIT válido puede inactivarse por una caída de ARCA en el momento del registro.

---

## 5. Opciones de diseño

> Ninguna de las recomendadas toca el **gate ARCA** (mantener `verificadoAfip` como fuente de verdad de la verificación real).

### A — Editar CUIT + reverificar (self-service del taller), gated por ARCA ✅ recomendada
Permitir corregir el CUIT **solo mientras esté sin verificar / `EN_GRACIA` / `INACTIVA`** (no para verificados, para prevenir swap de identidad). Al guardar: `consultarPadron(nuevoCuit)` → si OK, actualizar `taller.cuit` + `verificadoAfip=true` + `datosReactivacion()` (reactiva sola). Reusa toda la maquinaria existente (`consultarPadron` + `datosReactivacion`). Alojarla en `/taller/formalizacion` **arregla de paso el CTA muerto** (hueco #2). *Considerar: `cuit` es `@unique` en `Taller` (`prisma/schema.prisma:175`) → manejar colisión con un CUIT ya usado.*

### B — Acción de COORD "corregir CUIT + reverificar" en el panel ARCA ✅ recomendada (fallback operativo)
COORD ya revisa la constancia (que trae el CUIT real); que pueda **tipear el CUIT corregido y reverificar**. Extiende `reverificar/[id]` con un `cuit` override (persistir + `sincronizarTaller`). Cierra el caso "el taller no se da cuenta / no vuelve a entrar". Cubre huecos #1 y #3.

### C — Cruzar "constancia aprobada" → `verificadoAfip=true` ❌ **DESCARTADA**
**Razón:** saltearía el **gate ARCA** — todo el sentido de `verificadoAfip` es que la verificación la hace ARCA, no un humano aprobando un PDF. Auto-setear el flag desde la aprobación documental rompe esa garantía y abre la puerta a marcar como "verificado" a quien no lo está. Si se quiere conectar la aprobación con la verificación, hacerlo vía **B** (la aprobación/COORD **dispara una reverificación** con el CUIT corregido), nunca seteando el flag a mano.

### D — Reintento automático de ARCA en gracia ✅ recomendada
Que el cron (o un job aparte) **reintente `sincronizarTaller`** para talleres `verificadoAfip=false` durante la gracia, así un **CUIT correcto que falló por ARCA caído se autocura** antes del día 60. Cierra el hueco #4. Bajo costo, reusa `sincronizarTaller`.

### Recomendación
**A + D + B:**
- **A** (self-service) + **D** (autocura) cubren ~90%: el taller se autoservicia y los CUITs correctos-por-ARCA-caído se sanan solos.
- **B** es el fallback operativo para los que igual queden trabados (típicamente los backfilleados que no vuelven a entrar).
- **C descartada** por saltear el gate ARCA.

---

## 6. Próximo paso

**Decisión de Sergio sobre el enfoque** (¿A+D+B? ¿solo A? ¿prioridad?). Con eso Gerardo escribe el spec de implementación V4 correspondiente. **No implementar hasta esa decisión.**
