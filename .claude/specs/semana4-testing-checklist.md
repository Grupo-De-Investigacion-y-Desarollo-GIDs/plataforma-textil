# Semana 4 — Testing y fixes

**Objetivo:** No se agrega funcionalidad nueva. Solo pruebas, corrección de bugs y preparación para el piloto.

## Regla de la semana

Si encontrás algo que no funciona, abrís un issue en el repo describiendo el bug. No lo resolvés solo sin consultarlo primero. Los fixes críticos los hace Gerardo, los de UI los hace Sergio.

---

## Checklist por rol

### TALLER — flujo completo

**Registro y acceso:**

- [ ] Registro con CUIT válido → auto-login → llega al dashboard
- [ ] Registro con CUIT inválido → mensaje de error claro
- [ ] Login con Google OAuth → flujo completo
- [ ] Login con magic link → recibe email → accede
- [ ] Registro incompleto (OAuth sin completar) → redirige a `/registro/completar`

**Perfil y formalización:**

- [ ] Wizard de perfil productivo — 14 pasos completan sin error
- [ ] Subir documento en `/taller/formalizacion` → estado pasa a PENDIENTE
- [ ] Subir documento con storage caído → error claro (no pasa a PENDIENTE)
- [ ] Los 8 pasos muestran nombres en lenguaje del taller
- [ ] Info contextual aparece en cada paso no completado
- [ ] Barra de progreso muestra próximo beneficio según nivel

**Academia:**

- [ ] Ver colecciones con progreso real
- [ ] Marcar videos como vistos → progreso actualiza
- [ ] Rendir evaluación y aprobar → certificado generado
- [ ] Descargar PDF del certificado → PDF con datos correctos
- [ ] Chat RAG → respuesta relevante a pregunta de formalización
- [ ] Banner de nivel subido aparece cuando corresponde

**Pedidos (Escenario 2):**

- [ ] `/taller/pedidos/disponibles` muestra pedidos PUBLICADOS
- [ ] Enviar cotización → confirmación visible
- [ ] Segundo intento de cotizar el mismo pedido → error 409
- [ ] Ver cotización enviada con estado actualizado
- [ ] Aceptar orden desde `/taller/pedidos/[id]` → pasa a EN_EJECUCION
- [ ] Actualizar progreso con slider → progreso guardado
- [ ] Descargar acuerdo PDF → PDF con datos correctos

---

### MARCA — flujo completo

**Registro y acceso:**

- [ ] Registro → llega al directorio
- [ ] Sin perfil mínimo → modal aparece al intentar contactar taller
- [ ] Completar perfil mínimo → WhatsApp abre con mensaje pre-cargado
- [ ] Taller sin teléfono → alerta clara

**Directorio:**

- [ ] Filtros funcionan: nivel, proceso, prenda, texto
- [ ] Ordenamiento por puntaje (ORO primero)
- [ ] Estado vacío con filtros sin resultados

**Pedidos (Escenario 2):**

- [ ] Crear pedido → estado BORRADOR
- [ ] Publicar pedido → estado PUBLICADO
- [ ] Ver cotizaciones recibidas en el pedido PUBLICADO
- [ ] Aceptar cotización → OrdenManufactura creada, pedido pasa a EN_EJECUCION
- [ ] Rechazar cotización → estado RECHAZADA
- [ ] Descargar acuerdo PDF de la orden

---

### ESTADO — flujo completo

- [ ] Login → llega al dashboard
- [ ] Sección "¿Cómo está el sector?" muestra datos reales
- [ ] Sección "¿Dónde hay que actuar?" muestra validaciones, denuncias, inactivos
- [ ] Sección "¿Qué está funcionando?" muestra certificados y niveles
- [ ] Link "Revisar documentos" lleva a `/admin/talleres`
- [ ] Exportar cada tipo de reporte → descarga CSV con datos
- [ ] Filtro de período funciona en los exportes
- [ ] Usuario TALLER no puede acceder a `/estado` → `/unauthorized`

---

### ADMIN — flujo completo

- [ ] Dashboard con stats reales
- [ ] Lista de talleres con filtros
- [ ] Detalle de taller → aprobar validación → nivel recalcula
- [ ] Notas internas en taller y marca funcionan
- [ ] CRUD de colecciones y videos
- [ ] Evaluaciones: crear quiz → taller puede rendirlo
- [ ] Revocar certificado → estado cambia
- [ ] Lista de auditorías con datos reales
- [ ] Detalle de auditoría → cargar informe → guarda
- [ ] Programar auditoría desde el modal → aparece en lista
- [ ] Registros incompletos (OAuth) visibles en `/admin/usuarios`
- [ ] Crear usuario CONTENIDO desde `/admin/usuarios`
- [ ] `/admin/integraciones/llm` — guardar config → carga al recargar
- [ ] `/admin/integraciones/email` — muestra banner "En construcción"

---

### CONTENIDO — flujo completo

- [ ] Login → llega a `/contenido/colecciones`
- [ ] Crear colección → agregar videos → publicar
- [ ] Crear evaluación para la colección
- [ ] Enviar notificación masiva a talleres
- [ ] No puede acceder a `/admin` → `/unauthorized`

---

### PÚBLICO — sin login

- [ ] Landing carga con stats reales
- [ ] Directorio público con filtros funciona
- [ ] Perfil público de taller muestra prendas y certificados
- [ ] `/verificar` con código válido → muestra datos del certificado
- [ ] `/denunciar` → enviar denuncia → muestra código
- [ ] `/consultar-denuncia` → buscar por código → muestra estado
- [ ] `/ayuda` tiene links a `/denunciar` y `/consultar-denuncia`

---

## Checklist de seguridad

- [ ] TALLER no puede ver pedidos de otro taller
- [ ] TALLER no puede descargar certificados de otro taller
- [ ] MARCA no puede ver pedidos de otra marca
- [ ] TALLER no puede acceder a `/admin`, `/estado`, `/marca`
- [ ] MARCA no puede acceder a `/admin`, `/estado`, `/taller`
- [ ] `GET /api/pedidos/[id]` sin auth → 401
- [ ] `PUT /api/colecciones/[id]` con rol TALLER → 403

---

## Checklist técnico

- [ ] `npm run build` sin errores
- [ ] No hay `console.error` en ningún flujo crítico
- [ ] El seed resetea limpio con `npx prisma db seed`
- [ ] Variables de entorno documentadas en `.env.example`
- [ ] `DAILY.md` actualizado con los cambios de la semana

---

## Criterio de cierre

El piloto está listo cuando:

1. Todos los flujos de TALLER, MARCA y ESTADO pasan sin errores
2. El build está limpio
3. El seed genera datos demo funcionales
4. Al menos un flujo completo de cada rol fue probado manualmente
