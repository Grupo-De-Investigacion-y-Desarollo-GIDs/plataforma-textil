# SPEC W-A — Completar formulario de perfil del taller (W-A2 a W-A5)

> **Spec consolidado** que agrupa los cuatro ajustes del formulario de completar perfil del taller definidos en el master V4 (decisiones 3.16, 3.17, 3.18) e issues #299–304.
> Documentado de forma retroactiva: la implementación se realizó en el PR #363. Este documento deja el registro formal según la metodología V4.

---

## 1. Metadata

| Campo | Valor |
|---|---|
| **Tipo** | refactor funcional |
| **Bloque** | W-A |
| **Categoría** | MVP no negociable |
| **Estimación** | 10h (W-A2: 2h · W-A3: 1h · W-A4: 4h · W-A5: 3h) |
| **Riesgo** | Medio (toca schema con 3 campos nuevos + migración) |
| **Dependencias** | Ninguna |
| **Branch** | `feature/v4-w-a-formulario-taller` |
| **Validación sectorial** | N/A — Diferida a validación grupal post-MVP V4 |
| **Perspectivas relevantes** | Sociólogo, Sectorial |
| **Autor** | Gerardo Breard |
| **Fecha de creación** | 2026-05-25 (retroactivo) |
| **Aprobado por** | Equipo PDT |
| **Issue GitHub vinculado** | #299, #300, #301, #302, #303, #304 |
| **PR vinculado** | #363 |

---

## 2. Contexto

### Por qué existe este spec

Los talleres del piloto van a completar su perfil productivo en la plataforma. El formulario actual de completar perfil quedó corto frente a la realidad del sector textil del Conurbano Sur: faltaban opciones que reflejan formas reales de organización y de registro de producción, la pregunta de capacidad mezclaba dos conceptos distintos, y la lista de roles funcionales no cubría toda la cadena de valor de un taller.

Estos ajustes provienen de las decisiones 3.16, 3.17 y 3.18 del master V4, que a su vez recogen observaciones del trabajo de campo previo (issues #299 a #304).

### Qué resuelve

Después de implementar este spec, el formulario de perfil del taller:
- Contempla la organización productiva mixta (no solo línea / modular / prenda completa).
- Permite declarar que no se lleva un registro sistemático de producción.
- Separa la disponibilidad para tomar nuevos pedidos de la estrategia para aumentar capacidad (eran una sola pregunta confusa).
- Ofrece los 10 roles funcionales que cubren la cadena completa, y los persiste en la base de datos (antes se perdían).

### Documentación de referencia

- Master V4, decisiones 3.16 (categorías productivas), 3.17 (desdoblamiento capacidad), 3.18 (roles funcionales)
- Issues #299, #300, #301, #302, #303, #304

---

## 3. Validación interdisciplinaria

**Sociólogo:** APLICA
- Observación: las categorías cerradas de organización y de registro de producción dejaban afuera a talleres reales que funcionan de manera mixta o informal. Forzar una respuesta que no corresponde distorsiona el dato y hace sentir al taller "fuera de lugar".
- Decisión: se agregan "Organización mixta" (con campo abierto para describir) y "Sin registro sistemático", usando lenguaje no estigmatizante.

**Sectorial:** APLICA
- Observación: la cadena de valor textil incluye roles (moldería, tizado, control de calidad, compras de insumos, etc.) que la lista de 6 roles no contemplaba. La pregunta única de capacidad mezclaba "cuánto podés tomar ahora" con "cómo crecerías", que son decisiones distintas.
- Decisión: roles ampliados a 10; pregunta de capacidad desdoblada en disponibilidad actual + estrategia de crecimiento.

---

## 4. Qué construir

### Funcionalidades

1. **W-A2** — En "Tipo de organización productiva", agregar opción "Organización mixta" + campo de texto abierto para describirla.
2. **W-A3** — En "¿Llevan registro de producción diaria?", agregar opción "Sin registro sistemático".
3. **W-A4** — Desdoblar la pregunta de capacidad en dos:
   - Pregunta 1 (nueva): disponibilidad para tomar nuevos pedidos.
   - Pregunta 2 (reusa el campo escalabilidad con opciones nuevas): cómo aumentaría capacidad.
4. **W-A5** — Reemplazar la lista de 6 roles funcionales por los 10 del master, y persistirlos en la base de datos.

### Consideraciones de lenguaje

- "Organización mixta" y "Sin registro sistemático" usan lenguaje neutral, no estigmatizante (alineado con el espíritu de acompañamiento del master).
- Las opciones de disponibilidad describen la situación sin juzgarla ("Tiene baja disponibilidad actual; solo pequeños/simples", no "Taller poco productivo").

---

## 5. Datos (schema, modelos, queries)

### Cambios en schema Prisma

Tres campos nuevos en el modelo `Taller`:

```prisma
model Taller {
  // ... campos existentes
  organizacionDetalle  String?   // W-A2: detalle de organización mixta (campo abierto)
  disponibilidad       String?   // W-A4: disponibilidad para nuevos pedidos
  rolesFuncionales     Json?     // W-A5: roles funcionales del taller (persistidos)
}
```

### Migraciones SQL

Migración `agregar_campos_formulario_taller`:
- `ALTER TABLE talleres ADD COLUMN organizacion_detalle TEXT;`
- `ALTER TABLE talleres ADD COLUMN disponibilidad TEXT;`
- `ALTER TABLE talleres ADD COLUMN roles_funcionales JSONB;`
- Limpieza de valores obsoletos de escalabilidad (W-A4):
  ```sql
  UPDATE talleres SET escalabilidad = NULL
  WHERE escalabilidad IN ('no-puedo', 'horas-extra');
  ```

### Seed o data inicial

N/A — Los campos nuevos son opcionales; los talleres los completan al llenar el formulario.

---

## 6. Prescripciones técnicas

- Los campos nuevos son opcionales (`String?` / `Json?`) para no romper talleres existentes.
- `organizacionDetalle` solo se muestra/persiste cuando `organizacion === 'mixta'`.
- W-A4 reusa el campo existente `escalabilidad` para la Pregunta 2 (no crear campo nuevo para ella); solo `disponibilidad` es campo nuevo.
- Los roles funcionales se incluyen en `buildPayload()` y en el array de campos del PUT `talleres/[id]/route.ts`; al cargar el formulario, precargar `rolesFuncionales` si ya existen.
- Mantener la lógica de scoring existente, agregando los componentes nuevos.

### Scoring (decisión de Gerardo)

| Campo | Valor | Score |
|---|---|---|
| organizacion | mixta | 75 |
| registro | sin-sistematico | 30 |
| disponibilidad | sin-cambios / con-limites / baja / no-puede | 90 / 70 / 40 / 15 |
| escalabilidad | maquinaria / contratar / turnos / tercerizar | 85 / 80 / 70 / 60 |

`scoreGeneral` pasa a promediar 6 componentes (antes 5) al incluir `scoreDisponibilidad`. Los scores de escalabilidad siguen la óptica de "solidez productiva": capacidad propia y formal puntúa más alto que dependencia de terceros.

### Convenciones del proyecto a mantener

- Todo el formulario vive en `src/app/(taller)/taller/perfil/completar/page.tsx` (client component).
- Opciones de radio como `RadioOption` hardcodeadas en el componente (patrón existente).

---

## 7. Edge cases

| # | Caso límite | Comportamiento esperado |
|---|---|---|
| 1 | Talleres existentes con `escalabilidad` obsoleta ('no-puedo'/'horas-extra') | Migración los limpia a NULL; vuelven a responder la pregunta |
| 2 | Taller selecciona "Organización mixta" pero no completa el detalle | El campo de texto queda vacío (`organizacionDetalle = null`); no bloquea el envío |
| 3 | Taller cargado antes de W-A5 sin roles guardados | `rolesFuncionales = null`; el formulario aparece sin selección previa |
| 4 | Taller con roles ya seleccionados | Se precargan al abrir el formulario |

---

## 8. Validación sectorial

**N/A — Diferida a validación grupal post-MVP V4**

> Las opciones nuevas provienen de observaciones de campo recogidas en el master. La validación con talleres reales ocurre en el propio piloto (completan el formulario en vivo).

---

## 9. Criterios de aceptación

- [x] Build de producción pasa sin errores (`npm run build`)
- [x] Tests E2E existentes siguen pasando
- [x] No hay warnings nuevos de TypeScript
- [x] W-A2: opción "Organización mixta" + campo abierto condicional
- [x] W-A3: opción "Sin registro sistemático"
- [x] W-A4: dos preguntas separadas (disponibilidad + escalabilidad con opciones nuevas)
- [x] W-A5: 10 roles funcionales, persistidos en BD
- [x] Migración aplicada (3 campos nuevos + limpieza de escalabilidad obsoleta)
- [x] PR #363 creado, CI verde
- [ ] Verificación visual en `dev.plataformatextil.com.ar` OK
- [ ] Merge a develop
- [ ] Merge a main exitoso

---

## 10. Flujos para QA

1. **W-A2 — Organización mixta:** completar perfil → paso "Tipo de organización" → seleccionar "Organización mixta" → aparece campo de texto → completar y avanzar → verificar que persiste.
2. **W-A3 — Sin registro:** paso "Registro de producción" → verificar que existe la opción "Sin registro sistemático" entre "No llevamos registro" y "Anotamos en papel".
3. **W-A4 — Capacidad desdoblada:** verificar que hay DOS preguntas separadas (disponibilidad para nuevos pedidos + cómo aumentaría capacidad) con las opciones del master.
4. **W-A5 — Roles a 10:** paso "Roles del equipo" → verificar los 10 roles → seleccionar algunos → guardar → reabrir el formulario y verificar que se precargan.

---

## 11. Verificación de handover

- Migración versionada en Prisma (no cambios manuales en dashboard).
- Campos nuevos documentados en este spec (sección 5).
- Scoring documentado en sección 6 para futuras revisiones.

---

## 12. Notas

- Spec documentado de forma retroactiva tras la implementación en PR #363, para mantener el registro formal de la metodología V4.
- Pendiente recordatorio para producción: si se promociona a main, verificar que los campos nuevos y la limpieza de escalabilidad se apliquen también en la base de prod.
