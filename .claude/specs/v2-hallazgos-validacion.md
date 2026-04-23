# Hallazgos de Validacion — Primera Ronda (Sergio)

**Fecha:** 2026-04-07
**Validador:** Sergio Andrade (sergiandat)
**Entorno:** https://plataforma-textil.vercel.app
**Metodo:** Uso del widget de feedback integrado, navegando con distintos roles via `/acceso-rapido`

---

## Resumen ejecutivo

Primera validacion del sistema en produccion con dos metodos:
1. **Manual (Sergio):** Recorrio flujos principales con usuarios del seed. 20 hallazgos via widget de feedback en `LogActividad`.
2. **Automatizada (Playwright):** 61 tests E2E contra produccion. 52 OK, 2 SKIP, 4 hallazgos nuevos.

**Total: 24 hallazgos confirmados** (H-01 a H-24, H-25 descartado)

| Tipo | Sergio | Playwright | Total |
|------|--------|------------|-------|
| Bug | 10 | 0 | 10 |
| Falta funcionalidad | 4 | 0 | 4 |
| Mejora | 3 | 0 | 3 |
| Confusion UX | 1 | 0 | 1 |
| Inconsistencia datos | 2 | 0 | 2 |
| Bug cosmetico | 0 | 1 | 1 |
| Bug de seguridad | 0 | 3 | 3 |

Validacion automatizada adicional: **61 tests E2E**, 56 OK, 2 SKIP, 3 FALLA (seguridad).

---

## Epica 1 — Storage y Documentos

Problemas relacionados con la gestion de documentos de formalizacion: bucket de Supabase, visualizacion de archivos, consistencia entre paneles.

### H-01 [BUG] Bucket not found al ver documentos pendientes
- **Pagina:** `/admin/talleres/[id]` (Graciela Sosa)
- **Rol:** ADMIN
- **Descripcion:** Al querer ver documentos pendientes tira error: `{"statusCode":"404","error":"Bucket not found","message":"Bucket not found"}`
- **Causa probable:** El bucket de Supabase Storage no esta creado en produccion, o el nombre no coincide con lo que espera el codigo.
- **Impacto:** BLOQUEANTE — sin esto no se pueden revisar documentos.

### H-02 [BUG] Documento pendiente desaparece del panel admin
- **Pagina:** `/admin/talleres/[id]` (Graciela Sosa)
- **Rol:** ADMIN
- **Descripcion:** Un documento pendiente de revision desaparecio del panel de admin, aunque sigue marcado en el panel de formalizacion del taller.
- **Causa probable:** Inconsistencia en la query que filtra documentos por estado, o el estado cambia sin accion del admin.
- **Impacto:** ALTO — el admin pierde visibilidad de lo que tiene que revisar.

### H-03 [BUG] "Libro de sueldos digital" no aparece en admin
- **Pagina:** `/admin/documentos`
- **Rol:** ADMIN
- **Descripcion:** Los talleres ven "Libro de sueldos digital" como documento para cargar, pero en el panel admin de documentos no aparece ese tipo.
- **Causa probable:** El catalogo de documentos no esta sincronizado entre la vista taller y la vista admin.
- **Impacto:** MEDIO — confunde al admin que no puede validar algo que el taller cargo.

### H-04 [BUG] Documentos aprobados no se pueden ver ni descargar
- **Pagina:** `/admin/talleres/[id]` (Graciela Sosa)
- **Rol:** ADMIN
- **Descripcion:** Una vez aprobado un documento, no se puede ver el archivo ni hay link de descarga.
- **Causa probable:** La UI solo muestra acciones para documentos pendientes, no para aprobados.
- **Impacto:** MEDIO — pierde trazabilidad de lo que se aprobo.

### H-05 [CONFUSION] Habilitaciones obligatorias para todos los talleres
- **Pagina:** `/admin/documentos`
- **Rol:** ADMIN
- **Descripcion:** "Todos los talleres deben tener estas habilitaciones?" — no queda claro que documentos son obligatorios vs opcionales.
- **Causa probable:** Falta indicador visual de obligatoriedad por nivel.
- **Impacto:** BAJO — UX, no bloquea funcionalidad.

---

## Epica 2 — Flujo Comercial (Pedidos y Cotizaciones)

Problemas en el ciclo pedido > cotizacion > asignacion > ejecucion. Afecta principalmente a MARCA.

### H-06 [BUG] Boton "Ver pedido" no funciona en admin
- **Pagina:** `/admin/pedidos`
- **Rol:** ADMIN
- **Descripcion:** No se puede visualizar el detalle de un pedido desde el panel admin.
- **Causa probable:** Link apunta a ruta inexistente o el componente no renderiza.
- **Impacto:** ALTO — admin no puede supervisar pedidos.

### H-07 [BUG] Asignar taller sin cotizacion (unilateral)
- **Pagina:** `/marca/pedidos/[id]`
- **Rol:** MARCA
- **Descripcion:** Hay un boton "Asignar taller" que permite asignacion unilateral sin cotizacion. Ademas se pueden asignar varios talleres a un mismo pedido.
- **Causa probable:** El boton fue implementado como atajo sin restriccion de flujo.
- **Impacto:** CRITICO — rompe el flujo comercial diseñado (publicar > cotizar > aceptar).

### H-08 [BUG] Cotizacion desaparece al aceptar
- **Pagina:** `/marca/pedidos/[id]`
- **Rol:** MARCA
- **Descripcion:** Al aceptar una cotizacion, esta desaparece de la vista. Los KPIs del pedido en ejecucion no reflejan la cotizacion aceptada. El acuerdo PDF solo se puede descargar en pedidos completados.
- **Causa probable:** La query filtra cotizaciones por estado ENVIADA, excluyendo las aceptadas.
- **Impacto:** CRITICO — pierde trazabilidad completa del acuerdo comercial.

### H-09 [FALTA] Filtros en admin/pedidos
- **Pagina:** `/admin/pedidos`
- **Rol:** ADMIN
- **Descripcion:** Deberia haber filtro por marca, taller o fecha.
- **Impacto:** MEDIO — operabilidad del admin con volumen real de datos.

---

## Epica 3 — Perfiles y Datos de Contacto

Falta informacion clave en los perfiles de talleres y marcas, tanto para admin como para la vinculacion entre actores.

### H-10 [FALTA] Info de responsable/contacto en detalle taller
- **Pagina:** `/admin/talleres/[id]`
- **Rol:** ADMIN
- **Descripcion:** Falta informacion de quien es el responsable o contacto de la empresa.
- **Impacto:** MEDIO — el admin no puede contactar al taller directamente.

### H-11 [FALTA] Info de responsable/contacto en detalle marca
- **Pagina:** `/admin/marcas/[id]`
- **Rol:** ADMIN
- **Descripcion:** Falta informacion de la marca, responsable o contacto.
- **Impacto:** MEDIO — mismo problema que H-10 pero para marcas.

### H-12 [BUG] "Mi perfil" no vinculado a "Editar perfil"
- **Pagina:** `/taller/perfil`
- **Rol:** TALLER (Carlos Mendoza)
- **Descripcion:** La seccion "Mi perfil" no esta vinculada a la funcionalidad de editar perfil.
- **Causa probable:** Falta link o boton que conecte la vista de lectura con el formulario de edicion.
- **Impacto:** ALTO — el taller no puede editar su informacion facilmente.

### H-13 [BUG] Info editada no impacta en Mi Perfil
- **Pagina:** `/taller/perfil`
- **Rol:** TALLER (Roberto Gimenez)
- **Descripcion:** Despues de editar el perfil via el boton "Editar", no toda la informacion editada se refleja en "Mi perfil".
- **Causa probable:** El formulario de edicion y la vista de perfil leen campos distintos, o el formulario no guarda todos los campos.
- **Impacto:** ALTO — datos inconsistentes para el usuario.

### H-14 [MEJORA] KPI de reputacion/valoracion en marcas
- **Pagina:** `/admin/marcas/[id]`
- **Rol:** ADMIN
- **Descripcion:** Faltaria un KPI de desempeño que surja de un sistema de reputacion o valoracion de los talleres.
- **Impacto:** BAJO — mejora futura, no bloquea piloto.

---

## Epica 4 — Academia y Aprendizaje

Problemas en el modulo de aprendizaje: acceso, progreso, evaluaciones, asistente.

### H-15 [FALTA] Academia no disponible para taller BRONCE
- **Pagina:** `/taller/aprender`
- **Rol:** TALLER (Roberto Gimenez — BRONCE)
- **Descripcion:** Muestra "Modulo no disponible" al intentar acceder a la academia.
- **Causa probable:** Feature flag "academia" desactivado, o condicion de acceso por nivel.
- **Impacto:** ALTO — bloquea flujo de capacitacion que es core del sistema.

### H-16 [MEJORA] Videos se marcan completos sin ver
- **Pagina:** `/taller/aprender/[coleccion]`
- **Rol:** TALLER (Carlos Mendoza)
- **Descripcion:** Se puede pasar los videos sin verlos y se marca como completo. Falta evaluacion/quiz obligatorio.
- **Impacto:** MEDIO — la certificacion pierde valor si no hay validacion real.

### H-17 [MEJORA] No figuran cursos disponibles
- **Pagina:** `/taller/aprender`
- **Rol:** TALLER (Carlos Mendoza)
- **Descripcion:** La pagina no muestra cursos disponibles.
- **Causa probable:** Query no retorna colecciones visibles para el taller, o datos del seed incompletos.
- **Impacto:** MEDIO — el taller no sabe que puede aprender.

### H-18 [BUG] Asistente RAG no funciona
- **Pagina:** `/taller/aprender/[coleccion]`
- **Rol:** TALLER (Carlos Mendoza)
- **Descripcion:** El asistente de dudas no responde.
- **Causa probable:** API key de OpenAI no configurada en produccion, o endpoint caido.
- **Impacto:** BAJO para piloto (nice-to-have), pero es feature comprometido.

---

## Epica 5 — Notificaciones y Niveles

### H-19 [BUG] Notificaciones sin leer no accesibles
- **Pagina:** `/admin/notificaciones`
- **Rol:** ADMIN
- **Descripcion:** En el listado hay notificaciones marcadas como sin leer pero no se puede acceder a ellas.
- **Causa probable:** Falta link o accion al hacer click en la notificacion.
- **Impacto:** MEDIO — el admin ve que hay algo pendiente pero no puede actuar.

### H-20 [BUG] Error en log de niveles (subio pero bajo)
- **Pagina:** `/admin/talleres/[id]` (Graciela Sosa)
- **Rol:** ADMIN
- **Descripcion:** La actividad indica que "subio nivel" pero paso de Plata a Bronce. Hay error en la logica de niveles o en el mensaje del log.
- **Causa probable:** El log registra "NIVEL_SUBIDO" sin verificar la direccion del cambio, o la logica de calculo asigno mal el nivel.
- **Impacto:** ALTO — si el calculo esta mal, todo el sistema de formalizacion tiene datos incorrectos.

---

## Hallazgo adicional (detectado en revision de codigo)

### H-21 [BUG] Nombres sin tildes en /acceso-rapido
- **Pagina:** `/acceso-rapido`
- **Descripcion:** Los nombres de usuarios no tienen tildes (ej: "Lucia Fernandez" en vez de "Lucia Fernandez") mientras que en el seed si las tienen.
- **Impacto:** BAJO — cosmetico, solo afecta pagina de desarrollo.

---

## Hallazgos de validacion automatizada (Playwright, 7 abril 2026)

Validacion de 61 tests E2E contra produccion. 52 OK, 2 SKIP, 7 FALLA. Los siguientes son hallazgos nuevos no reportados por Sergio.

### H-22 [BUG CRITICO] Taller puede acceder a /admin
- **Test:** Sec 8, item 8.1
- **Descripcion:** Un usuario con rol TALLER puede navegar a `/admin` sin ser bloqueado. El middleware no redirige ni muestra "No autorizado".
- **Causa probable:** El middleware (`src/middleware.ts`) no valida correctamente el rol del usuario para las rutas admin, o la validacion se ejecuta solo en algunas subrutas.
- **Impacto:** CRITICO — cualquier taller puede ver datos de administracion.

### H-23 [BUG CRITICO] Taller puede acceder a /estado
- **Test:** Sec 8, item 8.2
- **Descripcion:** Un usuario con rol TALLER puede navegar a `/estado` sin ser bloqueado.
- **Causa probable:** Misma raiz que H-22 — el middleware no bloquea acceso cruzado entre roles.
- **Impacto:** CRITICO — un taller puede ver datos del dashboard de Estado.

### H-24 [BUG CRITICO] Marca puede acceder a /taller
- **Test:** Sec 8, item 8.3
- **Descripcion:** Un usuario con rol MARCA puede navegar a `/taller` sin ser bloqueado.
- **Causa probable:** Misma raiz que H-22.
- **Impacto:** CRITICO — una marca puede ver el dashboard y datos de un taller.

### ~~H-25~~ DESCARTADO — Sidebar admin sin 404
- **Test:** Sec 10, item 10.14
- **Resultado:** Falso positivo. Una segunda ejecucion con locators corregidos visito las 17 rutas del sidebar admin y **ninguna dio 404**. El fallo original era un problema del test (strict mode en el locator de `nav`), no de la app.

---

## Priorizacion para v2

### P0 — Bloquean el piloto (resolver antes de cualquier validacion con usuarios reales)
| ID | Descripcion |
|----|-------------|
| H-01 | Bucket not found (Storage) |
| H-07 | Asignar taller sin cotizacion |
| H-08 | Cotizacion desaparece al aceptar |
| H-15 | Academia no disponible |
| H-20 | Calculo de niveles incorrecto |
| H-22 | Taller accede a /admin (SEGURIDAD) |
| H-23 | Taller accede a /estado (SEGURIDAD) |
| H-24 | Marca accede a /taller (SEGURIDAD) |

### P1 — Funcionalidad incompleta (resolver para v2)
| ID | Descripcion |
|----|-------------|
| H-02 | Documento desaparece del panel admin |
| H-03 | Catalogo de documentos inconsistente |
| H-04 | Documentos aprobados sin descarga |
| H-06 | Boton "Ver pedido" admin |
| H-12 | Mi perfil no vinculado a editar |
| H-13 | Edicion no impacta en perfil |
| H-19 | Notificaciones no accesibles |
| ~~H-25~~ | ~~Link 404 sidebar admin~~ (descartado — falso positivo) |

### P2 — Mejoras funcionales (planificar para v2)
| ID | Descripcion |
|----|-------------|
| H-09 | Filtros en admin/pedidos |
| H-10 | Info contacto taller |
| H-11 | Info contacto marca |
| H-16 | Quiz obligatorio para videos |
| H-17 | Cursos no visibles |
| H-18 | Asistente RAG |

### P3 — Nice to have
| ID | Descripcion |
|----|-------------|
| H-05 | Indicador de obligatoriedad |
| H-14 | KPI reputacion |
| H-21 | Tildes acceso rapido |

---

## Nota sobre issues en GitHub

El widget de feedback esta configurado para crear issues en GitHub automaticamente, pero las variables `GITHUB_TOKEN` y `GITHUB_REPO` **no estan configuradas en Vercel**. Los 20 hallazgos quedaron registrados unicamente en la tabla `LogActividad` de la base de datos. Configurar estas variables para que futuros feedbacks generen issues automaticamente.

---

## Proximos pasos

1. Revisar este documento con el equipo OIT
2. Decidir alcance de v1.1 (fixes minimos para piloto) vs v2 (rediseño)
3. Generar specs individuales por epica para lo que se decida implementar
4. Configurar `GITHUB_TOKEN` / `GITHUB_REPO` en Vercel para futuros feedbacks
