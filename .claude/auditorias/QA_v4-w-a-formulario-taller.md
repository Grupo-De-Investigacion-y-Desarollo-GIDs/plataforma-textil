# QA V4 — W-A: Completar formulario de perfil del taller (W-A2 a W-A5)

| Campo | Valor |
|---|---|
| **Versión** | v4 |
| **Spec auditado** | `v4-w-a-formulario-taller.md` |
| **Categoría** | MVP no negociable |
| **Auditor** | Sergio |
| **Fecha** | 2026-05-25 |
| **URL auditada** | `https://dev.plataformatextil.com.ar` (o preview de PR #363) |
| **Commit auditado** | b218e0a |
| **PR vinculado** | #363 |
| **Issue vinculado** | #299, #300, #301, #302, #303, #304 |
| **Tipo de QA** | browser-manual |

---

## Contexto institucional

Plataforma Digital Textil (PDT) — proyecto OIT-UNTREF para formalización del sector textil argentino. Modelo: Showcase + Match con backend institucional invisible. Versión actual: V4. El formulario de completar perfil del taller es donde los talleres del piloto cargan su información productiva.

---

## Objetivo del QA

Verificar que los cuatro ajustes del formulario de perfil del taller (W-A2 a W-A5) funcionan correctamente: nuevas opciones de organización y registro, desdoblamiento de la pregunta de capacidad, y los 10 roles funcionales que ahora se persisten.

---

## Instrucciones de trabajo

1. Iniciar sesión como TALLER: `roberto.gimenez@pdt.org.ar` (contraseña: pdt2026)
2. Ir a completar/editar el perfil del taller
3. Ejecutar cada flujo del Eje 1
4. Verificar los Ejes 2 a 6
5. Reportar cada bug vía el widget de Feedback (se crea issue automático)

---

## Eje 1 — Flujos funcionales

### Flujo 1: W-A2 — Organización mixta

- **Rol:** Taller
- **Pasos:** Ir al paso "Tipo de organización productiva" → verificar que existe la opción "Organización mixta" (además de En línea / Modular / Prenda completa) → seleccionarla → confirmar que aparece un campo de texto para describir → escribir algo → avanzar y guardar → reabrir el formulario.
- **Esperado:** La opción existe; el campo de texto aparece solo al elegir "mixta"; el detalle se guarda y se precarga al reabrir.
- **Resultado:** [✅/⚠️/❌]
- **Notas:**

### Flujo 2: W-A3 — Sin registro sistemático

- **Rol:** Taller
- **Pasos:** Ir al paso "¿Llevan registro de producción diaria?" → verificar que existe la opción "Sin registro sistemático" (entre "No llevamos registro" y "Anotamos en papel/cuaderno").
- **Esperado:** La opción existe y se puede seleccionar y guardar.
- **Resultado:** [✅/⚠️/❌]
- **Notas:**

### Flujo 3: W-A4 — Capacidad desdoblada en dos preguntas

- **Rol:** Taller
- **Pasos:** Ir al paso de capacidad productiva → verificar que ahora hay DOS preguntas separadas:
  - Pregunta 1 "Disponibilidad para tomar nuevos pedidos" con 4 opciones (sin cambios relevantes / algunos con límites / baja disponibilidad / no puede).
  - Pregunta 2 "Cómo podría aumentar capacidad productiva" con 4 opciones (ampliar turnos / contratar / tercerizar / invertir en maquinaria).
- **Esperado:** Las dos preguntas aparecen separadas con sus opciones; ambas se guardan.
- **Resultado:** [✅/⚠️/❌]
- **Notas:**

### Flujo 4: W-A5 — Roles funcionales a 10 (persistidos)

- **Rol:** Taller
- **Pasos:** Ir al paso "Roles del equipo" → verificar que aparecen los 10 roles (moldería, tizado, corte, confección, terminación y planchado, control de calidad, coordinación, administración, compras, logística) → seleccionar varios → guardar → reabrir el formulario.
- **Esperado:** Los 10 roles aparecen; la selección se guarda y se precarga al reabrir (antes se perdía).
- **Resultado:** [✅/⚠️/❌]
- **Notas:**

---

## Eje 2 — Navegabilidad

| # | Rol | URL | Acción | Esperado | Resultado |
|---|---|---|---|---|---|
| 1 | Taller | /taller/perfil/completar | Avanzar por todos los pasos del wizard | Cada paso carga, se puede avanzar y retroceder | [✅/⚠️/❌] |
| 2 | Taller | /taller/perfil/completar | Guardar y salir, volver a entrar | Los datos cargados se mantienen | [✅/⚠️/❌] |

---

## Eje 3 — Casos borde

| # | Caso borde | Acción | Esperado | Resultado |
|---|---|---|---|---|
| 1 | Org. mixta sin completar el detalle | Elegir "mixta", dejar el texto vacío, avanzar | No bloquea; queda vacío | [✅/⚠️/❌] |
| 2 | Taller sin roles previos | Abrir el formulario con un taller que nunca eligió roles | Aparece sin selección, sin error | [✅/⚠️/❌] |
| 3 | Taller con escalabilidad obsoleta | Taller que tenía 'no-puedo'/'horas-extra' antes | El campo aparece sin valor (limpiado por migración) | [✅/⚠️/❌] |

---

## Eje 4 — Performance

| # | Verificación | Resultado | Notas |
|---|---|---|---|
| 1 | El wizard carga sin demoras notorias | [✅/⚠️/❌] | |
| 2 | Sin errores en consola del browser | [✅/⚠️/❌] | |
| 3 | Guardar el perfil responde rápido | [✅/⚠️/❌] | |

---

## Eje 5 — Consistencia visual

| # | Verificación | Resultado | Notas |
|---|---|---|---|
| 1 | Las opciones nuevas usan el mismo estilo que las existentes | [✅/⚠️/❌] | |
| 2 | Español argentino (vos) en labels y opciones | [✅/⚠️/❌] | |
| 3 | El campo de texto de "mixta" se integra bien visualmente | [✅/⚠️/❌] | |
| 4 | Sin texto roto ni opciones duplicadas | [✅/⚠️/❌] | |

---

## Eje 6 — Verificación (no genera nuevo)

| # | Verificación | Resultado | Notas |
|---|---|---|---|
| 1 | Los datos guardados se reflejan en el perfil del taller | [✅/⚠️/❌] | |
| 2 | Los datos llegan a la base (verificable en detalle del taller desde ESTADO/ADMIN) | [✅/⚠️/❌] | |

---

## Verificación de handover

- [ ] Migración aplicada en el entorno auditado (3 campos nuevos)
- [ ] Los 4 flujos del Eje 1 verificados
- [ ] Sin regresiones en el resto del wizard

---

## Resultado global

**Estado:** [✅ Aprobado / ⚠️ Aprobado con fixes / ❌ Rechazado]

**Decisión:** [Mergear / Iterar / Bloquear]

**Resumen ejecutivo:**

**Issues abiertos en este QA:**
-
