# Niveles de Formalizacion

Reglas de negocio para los niveles de formalizacion de talleres textiles en la Plataforma Digital Textil.

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

**Permisos:** puede recibir pedidos basicos, aparecer en directorio con badge "Bronce"

### PLATA

Nivel intermedio que demuestra cumplimiento laboral y capacitacion.

**Condiciones (todas deben cumplirse):**
- Todos los requisitos de BRONCE
- Empleados registrados en el sistema (al menos 1 en modelo `Taller.empleadosRegistrados > 0`)
- Al menos 1 capacitacion completada (tabla `ProgresoCapacitacion` con `completado: true` para algun video/coleccion)
- Sin denuncias abiertas con estado `PENDIENTE` o `EN_INVESTIGACION`

**Permisos:** puede recibir pedidos de marcas verificadas, prioridad en directorio, badge "Plata"

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

**Permisos:** acceso completo, puede participar en licitaciones, badge "Oro", destacado en directorio

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

## Visualizacion en perfil

### Badge en el perfil del taller

- Mostrar en `src/app/(public)/perfil/[id]/page.tsx` y `src/app/(taller)/taller/perfil/page.tsx`
- Usar componente `Badge` con variantes:
  - BRONCE: `variant="bronze"` (color ambar/bronce)
  - PLATA: `variant="silver"` (color gris plata)
  - ORO: `variant="gold"` (color dorado)
- Mostrar junto al nombre del taller en el directorio (`src/app/(public)/directorio/page.tsx`)

### Progreso hacia el siguiente nivel

En la vista del taller (`/taller/dashboard`), mostrar:
- Nivel actual con badge
- Lista de requisitos del siguiente nivel con checkmarks (cumplido/pendiente)
- Porcentaje de progreso hacia el siguiente nivel
- Acciones sugeridas para avanzar (ej: "Completa una capacitacion para alcanzar nivel Plata")

### En el panel admin

En `/admin/talleres/[id]`:
- Nivel actual e historial de cambios de nivel
- Boton para forzar recalculo manual
- Boton para override de nivel (con justificacion obligatoria registrada en log)
