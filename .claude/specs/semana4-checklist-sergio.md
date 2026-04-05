# Checklist de validación manual — Sergio

**Fecha:** 2026-04-05
**URL:** https://plataforma-textil.vercel.app
**Acceso rápido:** /acceso-rapido (login de un click por rol)
**Credenciales:** todas las cuentas usan password `pdt2026`

---

## Instrucciones

Para cada item: probalo en el browser y marcá OK o FALLA. Si falla, anotá qué pasó y en qué pantalla. No arregles nada — solo reportá.

---

## 1. REGISTRAR — Onboarding

### Como usuario nuevo (sin login)

- [ ] Ir a `/registro?rol=TALLER` → arranca directo en "Datos personales" (sin selección de rol)
- [ ] Ir a `/registro` sin parametros → muestra selección de rol (Taller / Marca)
- [ ] En paso 1 con `?rol=TALLER` → NO hay botón "Atrás"
- [ ] En paso 1 sin `?rol=` (después de elegir rol) → SÍ hay botón "Atrás"
- [ ] Completar paso 1 → avanzar a paso 2 "Datos del taller"
- [ ] Ingresar CUIT `30-68525606-8` (UNTREF) → debe mostrar badge verde "Verificado por ARCA" con razón social
- [ ] Ingresar CUIT `11-11111111-1` (inválido) → debe mostrar error rojo, botón "Crear cuenta" bloqueado

### Login

- [ ] Ir a `/login` → se ve formulario de email+password, botón Google, formulario magic link
- [ ] Login con `carlos.mendoza@pdt.org.ar` / `pdt2026` → llega a `/taller`
- [ ] Login con `martin.echevarria@pdt.org.ar` / `pdt2026` → llega a `/marca/directorio`

### Acceso rápido

- [ ] Ir a `/acceso-rapido` → se ven 7 botones (Admin, 3 Talleres, Marca, Estado, Contenido)
- [ ] Click en cada uno → llega al dashboard correcto

---

## 2. ENCONTRAR — Directorio y contacto

### Como visitante (sin login)

- [ ] Ir a `/directorio` → carga sin pedir login, muestra 3 talleres
- [ ] Filtrar por nivel ORO → solo aparece Corte Sur SRL
- [ ] Buscar "Avellaneda" → aparece Corte Sur SRL
- [ ] Limpiar filtros → vuelven los 3 talleres
- [ ] Click en "Ver perfil" de Corte Sur → llega a `/perfil/[id]`
- [ ] Perfil muestra: prendas, certificados con link "Verificar", descripción en itálica, link "Volver al directorio"

### Como marca (login: Martin Echevarria)

- [ ] Ir a `/marca/directorio` → mismos filtros que el público
- [ ] Click en un taller → ver perfil con botón "Contactar por WhatsApp"
- [ ] Si la marca NO tiene tipo/ubicación/volumen → click en "Contactar" abre modal "Completá tu perfil"
- [ ] Completar el modal → se abre WhatsApp con mensaje pre-cargado que incluye nombre del taller

---

## 3. APRENDER — Academia y certificados

### Como taller (login: Roberto Gimenez — BRONCE)

- [ ] Ir a `/taller/aprender` → se ven 3 colecciones con progreso
- [ ] Click en "Empezar" de una colección → se ve player de video + lista de videos
- [ ] Marcar un video como visto → progreso se actualiza
- [ ] Al final de la página → se ve el chat "¿Tenés dudas? Preguntá al asistente"
- [ ] Abrir el chat → escribir pregunta de más de 10 chars → verificar que responde (puede tardar)

### Como taller ORO (login: Carlos Mendoza)

- [ ] Ir a `/taller/aprender` → las 3 colecciones muestran "Certificado" en badge verde
- [ ] Click en una colección → se ve botón "Descargar certificado PDF"
- [ ] Click en descargar → se baja un PDF con datos del taller, curso y calificación

### Verificación pública (sin login)

- [ ] Ir a `/verificar` → se ve formulario de código
- [ ] Ingresar `PDT-CERT-2026-000012` → debe mostrar "Certificado Válido" con datos de Corte Sur
- [ ] Ingresar `INVALIDO` → debe mostrar "Certificado no encontrado"

---

## 4. ACOMPAÑAR — Formalización

### Como taller BRONCE (login: Roberto Gimenez)

- [ ] Dashboard `/taller` → se ve ProgressRing ROJO (no azul) con porcentaje
- [ ] Debajo del ring → panel amarillo "Te faltan X documentos para ser PLATA"
- [ ] Ir a `/taller/formalizacion` → los 8 pasos tienen nombres en lenguaje del taller:
  - "Registrate en ARCA"
  - "Habilita tu local"
  - "Asegura a tu equipo"
  - etc.
- [ ] Cada paso NO completado muestra panel gris con: descripción, costo, link "Cómo tramitarlo →"
- [ ] El link "Cómo tramitarlo" abre en nueva pestaña

### Como taller ORO (login: Carlos Mendoza)

- [ ] Dashboard `/taller` → panel verde "Estás en el nivel máximo! Sos un taller verificado ORO"
- [ ] `/taller/formalizacion` → todos los pasos en verde "Documentación verificada"

---

## 5. FISCALIZAR — Estado

### Como Estado (login: Ana Belén Torres)

- [ ] Dashboard `/estado` → se ven las 3 secciones con títulos:
  - "Cómo está el sector?" — 4 stats + distribución por nivel
  - "Dónde hay que actuar?" — validaciones, denuncias, inactivos con bordes de color
  - "Qué está funcionando?" — certificados, nivel, cursos con bordes de color
- [ ] Los números NO son todos 0 (deben reflejar los datos del seed)
- [ ] Link "Revisar documentos →" en validaciones lleva a `/admin/talleres`

### Exportar

- [ ] Ir a `/estado/exportar` → se ven 7 tipos de reporte
- [ ] Seleccionar "Listado de marcas" + período "Todo el historial" → click "Generar y Descargar" → se baja CSV
- [ ] Abrir el CSV → tiene datos reales (Amapola, Urbano Textil)
- [ ] Seleccionar "Reporte de denuncias" → descarga CSV → verificar que NO tiene columna de descripción

### Denuncias públicas (sin login)

- [ ] Ir a `/denunciar` → se ve formulario con tipos de denuncia
- [ ] Elegir tipo + escribir descripción (>20 chars) → enviar → muestra código (ej: DEN-2026-00006)
- [ ] Ir a `/consultar-denuncia` → ingresar el código → muestra estado "Recibida"
- [ ] Ir a `/ayuda` → verificar que tiene links a "Hacer una denuncia" y "Consultar estado"

### Auditorías (login: Admin — Lucia Fernandez)

- [ ] Ir a `/admin/auditorias` → stats muestran números > 0 (Programadas, En curso, Completadas)
- [ ] Sección "Próximas Auditorías" muestra al menos 1 auditoría programada
- [ ] Sección "Pendientes de Informe" muestra al menos 1 con botón "Cargar informe"
- [ ] Click en "Cargar informe" → llega a página de detalle con datos del taller y formulario
- [ ] Cambiar estado a "Completada" + escribir resultado → guardar → mensaje de éxito

---

## 6. GOBERNAR — Admin y Contenido

### Como Admin (login: Lucia Fernandez)

- [ ] Dashboard `/admin` → stats con datos reales
- [ ] Sidebar tiene link "Feedback" → click → tabla de feedbacks (puede estar vacía si nadie envió)
- [ ] Ir a `/admin/configuracion` → tab "Features" visible
- [ ] Click en "Features" → se ven 2 secciones: "Escenario 1" (7 toggles) y "Escenario 2" (5 toggles)
- [ ] Todos los toggles de E1 están en "Activo" (verde)
- [ ] Todos los toggles de E2 están en "Activo" (verde)
- [ ] Ir a `/admin/integraciones/email` → banner amarillo "Configuración en construcción"
- [ ] Formulario deshabilitado (inputs con opacity reducida)

### Como Contenido (login: Sofia Martinez)

- [ ] Login → llega a `/contenido/colecciones`
- [ ] Se ven las 3 colecciones del seed (Seguridad, Costos, Formalización)
- [ ] Sidebar tiene 3 items: Colecciones, Evaluaciones, Notificaciones
- [ ] Item activo se resalta en azul
- [ ] Click en "Evaluaciones" → se ve selector de colección + preguntas del quiz
- [ ] Click en "Notificaciones" → se ven stats (Total, Sin leer, Leídas) + historial

### Feedback widget (cualquier usuario logueado)

- [ ] Loguearse con cualquier rol → botón "Feedback" flotante en esquina inferior derecha
- [ ] Click → se abre panel con 4 tipos (Bug, Mejora, Falta, Confusión)
- [ ] Elegir tipo + escribir >10 chars → enviar → mensaje "Gracias por tu feedback!"
- [ ] Sin sesión (visitante) → el botón Feedback NO aparece

---

## 7. MARKETPLACE — Pedidos y cotizaciones

### Como marca (login: Martin Echevarria)

- [ ] Ir a `/marca/pedidos` → se ven pedidos con diferentes estados
- [ ] Click en un pedido BORRADOR → se ve botón "Publicar pedido"
- [ ] Click en un pedido PUBLICADO → se ve sección "Cotizaciones recibidas" con datos
- [ ] Cada cotización muestra: taller, nivel (badge), proceso, precio, plazo
- [ ] Cotizaciones ENVIADA tienen botones "Aceptar" y "Rechazar"

### Como taller (login: Carlos Mendoza — ORO)

- [ ] Sidebar tiene "Pedidos disponibles" → click
- [ ] Se ven 3 pedidos publicados con datos (Buzo, Remera, Camisa)
- [ ] Click en "Ver y cotizar" → detalle del pedido + formulario de cotización
- [ ] Si ya cotizó → muestra "Ya enviaste una cotización" con precio y plazo

### Acuerdo PDF

- [ ] Como taller con orden EN_EJECUCION → ir a `/taller/pedidos/[id]` → link "Descargar acuerdo PDF"
- [ ] Click → se baja PDF con datos del taller, marca y términos

---

## 8. SEGURIDAD — Control de acceso

- [ ] Como TALLER → intentar ir a `/admin` → debe mostrar "No autorizado"
- [ ] Como TALLER → intentar ir a `/estado` → debe mostrar "No autorizado"
- [ ] Como MARCA → intentar ir a `/taller` → debe mostrar "No autorizado"
- [ ] Sin sesión → intentar ir a `/taller` → redirige a `/login`

---

## Resultado

- **Total items:** 82
- **OK:** ___
- **FALLA:** ___
- **Observaciones:**

Firma: _________________ Fecha: _____________
