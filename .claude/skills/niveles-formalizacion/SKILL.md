# Niveles de Formalizacion

Reglas de negocio para los niveles de formalizacion de talleres textiles en la Plataforma Digital Textil.

> ## ⚠️ REGLA DE PRESENTACION (leer antes de tocar cualquier UI)
>
> Los niveles **BRONCE / PLATA / ORO son INTERNOS** — solo viven en la DB, en la
> logica de recalculo y en las vistas de **ESTADO / ADMIN / OIT** (analitica).
>
> **NUNCA se muestran los nombres crudos del enum al TALLER ni a la MARCA.** Al
> usuario se le muestra siempre la **etapa** via el helper
> `nivelAEtapa()` (`src/compartido/lib/formalizacion.ts`):
>
> | Nivel interno (DB) | Etapa visible al usuario |
> |---|---|
> | `BRONCE` | **Etapa inicial** |
> | `PLATA`  | **En proceso de formalización** |
> | `ORO`    | **Formalización consolidada** |
>
> - **Sin badges de medallas** (bronce/plata/oro) al usuario. Sin lenguaje de
>   ranking ("subí de nivel", "ganá puntos", "sin verificar").
> - La formalizacion es un **recorrido / acompañamiento**, no un ranking — los
>   requisitos son logros, no obligaciones (master 3.7).
> - Cualquier render directo de `taller.nivel`, `nivelAnterior`, `nivelNuevo` (o
>   los strings `BRONCE`/`PLATA`/`ORO`) en una superficie de TALLER o MARCA = **fuga**.
>   Envolver con `nivelAEtapa()`.
> - **Fuente:** master V4 decisiones **3.7-3.10**, Narrativa V4
>   (`narrativa-V4-consolidado-niveles-1-a-4.md`), discovery
>   `.claude/specs/v4-x-07-08-09-discovery.md` (cierre niveles, F-1).
>
> Las **condiciones de cada nivel y el recalculo** (abajo) siguen siendo logica
> interna valida — eso NO cambia. Lo que cambia es **como se presenta**.

## Niveles

### BRONCE

Requisitos minimos para operar en la plataforma.

**Condiciones:**
- CUIT verificado como ACTIVO en ARCA (via verificar-cuit skill o carga manual)
- Perfil del taller creado con datos basicos completos:
  - Razon social
  - Domicilio fiscal
  - Tipo de taller (confeccion, corte, estampado, etc.)
  - Responsable/titular
  - Al menos 1 proceso productivo declarado

**Permisos:** puede recibir pedidos basicos, aparecer en directorio (etapa visible: "Etapa inicial", sin badge de medalla)

### PLATA

Nivel intermedio que demuestra cumplimiento laboral y capacitacion.

**Condiciones (todas deben cumplirse):**
- Todos los requisitos de BRONCE
- Empleados registrados en el sistema (al menos 1 en modelo `Taller.empleadosRegistrados > 0`)
- Al menos 1 capacitacion completada (tabla `ProgresoCapacitacion` con `completado: true` para algun video/coleccion)
- Sin denuncias abiertas con estado `PENDIENTE` o `EN_INVESTIGACION`

**Permisos:** puede recibir pedidos de marcas verificadas, prioridad en directorio (etapa visible: "En proceso de formalización", sin badge de medalla)

### ORO

Nivel maximo de formalizacion y calidad.

**Condiciones (todas deben cumplirse):**
- Todos los requisitos de PLATA
- Habilitaciones completas:
  - Habilitacion municipal vigente (campo en modelo `Taller`)
  - Seguro de ART activo
  - Inscripcion en ARCA al dia (ultima verificacion < 90 dias)
- Certificaciones de calidad:
  - Al menos 1 certificacion activa en tabla `TallerCertificacion` con `estado: 'ACTIVA'`
  - Certificacion vinculada a un `Certificado` valido (no vencido)
- Evaluacion positiva: promedio >= 4.0 en tabla `Evaluacion`

**Permisos:** acceso completo, puede participar en licitaciones, destacado en directorio (etapa visible: "Formalización consolidada", sin badge de medalla)

## Recalculo del nivel

El nivel se recalcula automaticamente en estos eventos:

| Evento | Trigger |
|---|---|
| Verificacion de CUIT completada | Despues de `verificar-cuit` exitoso |
| Capacitacion completada | Al marcar `ProgresoCapacitacion.completado = true` |
| Certificacion agregada/vencida | Al crear/actualizar `TallerCertificacion` |
| Denuncia abierta/cerrada | Al cambiar estado de `Denuncia` |
| Evaluacion recibida | Al crear nueva `Evaluacion` |
| Actualizacion de perfil | Al editar datos del taller |

### Logica de recalculo

```
funcion recalcularNivel(tallerId):
  taller = obtener taller con relaciones
  
  // Verificar ORO (de mayor a menor)
  si cumpleOro(taller):
    retornar 'ORO'
  
  si cumplePlata(taller):
    retornar 'PLATA'
  
  si cumpleBronce(taller):
    retornar 'BRONCE'
  
  retornar null  // no califica para ningun nivel
```

- El nivel solo puede subir o mantenerse por recalculo automatico
- Para bajar de nivel (ej: denuncia abierta) se requiere revision manual del admin
- Cada cambio de nivel se registra en `LogActividad` con tipo `CAMBIO_NIVEL`
- Se envia `Notificacion` al taller cuando cambia su nivel

## Visualizacion (post-narrativa V4 — leer la regla de presentacion de arriba)

> **CAMBIO vs version anterior de esta skill:** antes esta seccion instruia mostrar
> badges de medalla `bronze/silver/gold` al usuario en perfil/directorio/dashboard.
> Eso quedo **OBSOLETO** por master 3.7/3.8 y Narrativa V4: al TALLER/MARCA se le
> muestra siempre la **etapa** (via `nivelAEtapa()`), nunca el nivel crudo ni una medalla.

### Superficies de TALLER / MARCA / PUBLICO (etapa, NO nivel)

- `src/app/(taller)/taller/page.tsx` (dashboard), `taller/formalizacion/page.tsx`
  (Mi recorrido), `src/app/(public)/perfil/[id]/page.tsx`, directorio publico y
  vidriera: **siempre `nivelAEtapa(taller.nivel)`**, nunca el enum.
- El historial de cambios que se muestra al taller usa
  `nivelAEtapa(nivelAnterior) → nivelAEtapa(nivelNuevo)` (heading "Historial de tu
  recorrido", **no** "Historial de nivel"). Ver F-1 del discovery.
- **Sin** componente `Badge` con variantes `bronze/silver/gold` orientado al usuario.
  Sin "X de 7 requisitos" en el directorio **publico** (eso queda solo privado, en
  Mi recorrido — narrativa 3.10, resuelto en #403).

### Progreso del recorrido (vista del taller)

En el dashboard del taller (`/taller`) y en Mi recorrido (`/taller/formalizacion`):
- **Etapa actual** (texto via `nivelAEtapa`), nunca el nombre del nivel ni medalla.
- Lista de requisitos del siguiente tramo con checkmarks (cumplido/pendiente).
- Porcentaje de progreso (`ProgressRing`).
- Acciones sugeridas para avanzar, en lenguaje de acompañamiento (ej:
  "Completá una capacitación para seguir avanzando"), **sin** "subí de nivel a Plata".

### Vistas internas de ESTADO / ADMIN / OIT (nivel permitido para analitica)

En `/admin/talleres/[id]`, `/estado/talleres`, reportes, configuracion-niveles:
- Estas son vistas de **staff/analitica**, no de usuario → pueden operar sobre los
  niveles internos. Aun asi las pantallas ya migradas muestran las **etiquetas de
  etapa** ("Etapa inicial / En proceso / Consolidada") para consistencia; el enum
  crudo queda como `value=` de filtros y logica, no como texto visible al staff salvo
  analitica explicita.
- Recalculo manual, override de nivel (con justificacion registrada en `LogActividad`)
  e historial de cambios: sin cambios — siguen siendo herramientas internas.
