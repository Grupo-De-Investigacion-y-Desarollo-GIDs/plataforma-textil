# Matriz Pantallas - Funciones MVP

Fecha: 2026-03-01
Base: CHECKLIST.md (estado real del código), HISTORIAS_USUARIO.md
Funciones MVP: REGISTRAR, ENCONTRAR, APRENDER, ACOMPAÑAR, FISCALIZAR

---

## Resumen

| Categoría | Pantallas | % del total |
|-----------|:---------:|:-----------:|
| Conectadas a función MVP | 23 | 36% |
| Admin (operación) | 27 | 42% |
| Soporte / legales / sistema | 14 | 22% |
| **Total** | **64** | **100%** |

---

## REGISTRAR (7 pantallas)

| Pantalla | Ruta | Estado | HU |
|----------|------|:------:|:--:|
| Login | `/login` | OK | HU-R03 |
| Registro | `/registro` | PARCIAL | HU-R01, HU-R02 |
| Olvide contraseña | `/olvide-contrasena` | OK | HU-R04 |
| Restablecer contraseña | `/restablecer/[token]` | OK | HU-R04 |
| Mi cuenta | `/mi-cuenta` | PARCIAL | HU-R05 |
| Wizard perfil productivo | `/taller/perfil/completar` | OK | HU-R06 |
| Mi perfil taller | `/taller/perfil` | OK | HU-R06 |

**Falta:** Verificación CUIT contra ARCA en registro (HU-R07). Tour primer uso (P3).

---

## ENCONTRAR (11 pantallas)

| Pantalla | Ruta | Estado | HU |
|----------|------|:------:|:--:|
| Directorio talleres (marca) | `/marca/directorio` | OK | HU-E01 |
| Perfil taller (vista marca) | `/marca/directorio/[id]` | OK | HU-E02 |
| Directorio público | `/directorio` | PARCIAL | HU-E03 |
| Perfil público taller | `/perfil/[id]` | PARCIAL | HU-E02 |
| Crear pedido | `/marca/pedidos/nuevo` | OK | HU-E04 |
| Lista pedidos (marca) | `/marca/pedidos` | OK | HU-E05 |
| Detalle pedido | `/marca/pedidos/[id]` | OK | HU-E06 |
| Asignar taller (modal) | `/marca/pedidos/[id]` | OK | HU-E06 |
| Cancelar pedido (acción) | `/marca/pedidos/[id]` | OK | HU-E06 |
| Pedidos recibidos (taller) | `/taller/pedidos` | OK | HU-E07 |
| Mi perfil marca | `/marca/perfil` | OK | — |

**Falta:** Perfil público de marca (FALTA P2). Botón "Contactar" en directorio
muerto (wa.me sin handler). Notificaciones a talleres cuando hay pedido nuevo.

---

## APRENDER (3 pantallas)

| Pantalla | Ruta | Estado | HU |
|----------|------|:------:|:--:|
| Catálogo de cursos | `/taller/aprender` | OK | HU-AP01 |
| Detalle curso + evaluación | `/taller/aprender/[id]` | OK | HU-AP02, HU-AP03 |
| Verificar certificado | `/verificar` | OK | HU-AP04 |

**Falta:** Generación de QR como imagen para certificados.
Función más completa del MVP (3/3 OK).

---

## ACOMPAÑAR (1 pantalla)

| Pantalla | Ruta | Estado | HU |
|----------|------|:------:|:--:|
| Formalización taller | `/taller/formalizacion` | PARCIAL | HU-AC01 |

**ALERTA: Función más débil del MVP.**
- Solo 1 pantalla dedicada
- El botón "Subir documento" no funciona (sin handler)
- El componente `file-upload.tsx` existe pero no está integrado
- La aprobación/rechazo funciona pero solo desde admin (HU-AC03)
- El motor de niveles funciona (HU-AC04) pero el taller no puede avanzar por sí solo

**Falta para que funcione:**
1. Integrar file-upload en la página de formalización
2. Conectar upload a la API existente (`POST /api/validaciones/[id]/upload`)
3. Feedback visual al taller después de subir (toast, cambio de estado)

---

## FISCALIZAR (3 pantallas)

| Pantalla | Ruta | Estado | HU |
|----------|------|:------:|:--:|
| Dashboard Estado | `/estado` | PARCIAL | HU-F01 |
| Exportar reporte | `/estado/exportar` | STUB | HU-F02 |
| Reportes Estado | `/estado/reportes` | — | — |

**Problemas:**
- Dashboard sin guard de rol ESTADO (cualquier logueado puede verlo)
- Exportar es 100% simulado (setTimeout + mensaje fake)
- No hay página de denuncias pública (HU-F03: API existe, UI no)

---

## ADMIN — Sin función MVP formal (27 pantallas)

El admin no es una función MVP, pero opera sobre todas las funciones. Sergio
construyó 27 pantallas de admin de las cuales 20 son STUB (mock in-memory).

### Admin funcional (7 pantallas)

| Pantalla | Ruta | Estado | Función que soporta |
|----------|------|:------:|---------------------|
| Dashboard | `/admin/dashboard` | PARCIAL | General |
| Colecciones lista | `/admin/colecciones` | OK | APRENDER |
| Crear colección | `/admin/colecciones/nueva` | OK | APRENDER |
| Editar colección | `/admin/colecciones/[id]` | OK | APRENDER |
| Agregar video | `/admin/colecciones/[id]/videos` | OK | APRENDER |
| Talleres detalle | `/admin/talleres/[id]` | OK | ACOMPAÑAR |
| Logs | `/admin/logs` | OK | General |

### Admin STUB (20 pantallas)

| Pantalla | Ruta | Estado | Función que soportaría |
|----------|------|:------:|------------------------|
| Evaluaciones | `/admin/evaluaciones` | STUB | APRENDER |
| Certificados | `/admin/certificados` | PARCIAL | APRENDER |
| Usuarios | `/admin/usuarios` | PARCIAL | REGISTRAR |
| Talleres lista | `/admin/talleres` | OK | ACOMPAÑAR |
| Marcas lista | `/admin/marcas` | OK | ENCONTRAR |
| Marcas detalle | `/admin/marcas/[id]` | STUB | ENCONTRAR |
| Procesos | `/admin/procesos` | STUB | ENCONTRAR |
| Documentos | `/admin/documentos` | STUB | ACOMPAÑAR |
| Configuración | `/admin/configuracion` | PARCIAL | General |
| Pedidos | `/admin/pedidos` | OK | ENCONTRAR |
| Auditorías | `/admin/auditorias` | STUB | FISCALIZAR |
| Reportes | `/admin/reportes` | STUB | FISCALIZAR |
| Notificaciones | `/admin/notificaciones` | STUB | General |
| FAQ | `/admin/faq` | STUB | General |
| Roles | `/admin/roles` | STUB | General |
| Database | `/admin/database` | STUB | General |
| Integraciones (4) | `/admin/integraciones/*` | STUB | General |
| Templates | `/admin/templates` | STUB | General |

---

## SOPORTE / LEGALES / SISTEMA (14 pantallas)

| Pantalla | Ruta | Estado | Categoría |
|----------|------|:------:|-----------|
| Landing | `/` | OK | Sistema |
| Ayuda/FAQ | `/ayuda` | OK | Soporte |
| Términos | `/terminos` | OK | Legal |
| Privacidad | `/privacidad` | OK | Legal |
| 404 | — | OK | Sistema |
| Error genérico | — | OK | Sistema |
| Unauthorized | `/unauthorized` | OK | Sistema |
| Cuenta hub | `/cuenta` | OK | Soporte |
| Config notificaciones | `/cuenta/notificaciones` | STUB | Soporte |
| Dashboard taller | `/taller` | PARCIAL | Hub |
| Dashboard marca | `/marca` | — | Hub |
| Loading states (4 layouts) | — | OK | Sistema |
| Error boundaries (4 layouts) | — | OK | Sistema |

---

## Dashboard taller: el hub huérfano

`/taller` (dashboard) es la página principal del taller pero no conecta con
ninguna función de forma útil. Actualmente muestra 3 stat cards estáticas
(nombre, nivel, capacidad) sin acciones ni links.

**Debería ser el hub que conecta:**

| Sección | Función | Qué mostrar |
|---------|---------|-------------|
| Pedidos recientes | ENCONTRAR | Últimas órdenes asignadas con estado |
| Formalización | ACOMPAÑAR | % completado con link a checklist |
| Capacitación | APRENDER | Progreso de cursos, certificados |
| Nivel y puntaje | ACOMPAÑAR | Progreso hacia siguiente nivel |
| Alertas | General | Documentos por vencer, pedidos pendientes |

---

## Prioridades de conexión

### P1 — Funciones MVP incompletas

| Función | Gap | Impacto |
|---------|-----|---------|
| ACOMPAÑAR | Botón "Subir documento" muerto | Taller no puede avanzar en formalización |
| ACOMPAÑAR | Dashboard taller no muestra % formalización | No hay visibilidad del progreso |
| FISCALIZAR | Dashboard sin guard de rol | Cualquier usuario ve datos del Estado |
| FISCALIZAR | Exportar es 100% fake | Estado no puede generar reportes |

### P2 — Pantallas que mejorarían la experiencia

| Pantalla | Gap |
|----------|-----|
| Dashboard taller | Convertir en hub con links a todas las funciones |
| Directorio público | Agregar filtros y paginación |
| Perfil público marca | No existe |
| Contactar (wa.me) | Botón muerto en directorio |

### P3 — Admin stubs (20 pantallas)

Los stubs de admin no bloquean el MVP pero generan mala impresión.
Priorizar: evaluaciones (APRENDER), auditorías (FISCALIZAR),
procesos y documentos (ACOMPAÑAR).
