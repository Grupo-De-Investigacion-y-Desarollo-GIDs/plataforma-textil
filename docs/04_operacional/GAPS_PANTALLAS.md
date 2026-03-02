# Análisis de Gaps entre Wireframes y Código

Fecha: 2026-03-01
Base: PANTALLAS_MVP.md (70 diseñadas), CHECKLIST.md (64 construidas), HISTORIAS_USUARIO.md (31 HU)

---

## Diagnóstico: por qué hay pantallas fuera del plan

### La causa raíz NO es Sergio — es un gap en PANTALLAS_MVP.md

PANTALLAS_MVP.md diseñó 70 pantallas pero tiene un agujero enorme:
**no diseñó el flujo transaccional de la marca ni del taller.**

Para MARCA solo diseñó 2 pantallas:
- #10 Directorio de talleres
- #18 Perfil público de marca

Para TALLER solo diseñó 5 pantallas:
- #5 Dashboard, #6 Perfil, #7 Formalización, #8 Academia, #9 Academia detalle

Pero la función ENCONTRAR (la más importante después de APRENDER) necesita que la
marca pueda CREAR pedidos, VERLOS, ASIGNAR talleres. Y que el taller pueda VER
las órdenes que le asignaron. Nada de esto se diseñó.

El propio documento 03_CASOS_USO.md define 3 casos MVP para ENCONTRAR:
- CU-E01: Taller busca pedidos ← no hay pantalla diseñada
- CU-E02: Marca busca talleres ← solo el directorio (#10)
- CU-E03: Talleres se asocian para pedido grande ← no hay pantalla diseñada

Y el flujo principal del MVP (03_CASOS_USO.md) dice:
```
1. MARCA crea pedido (ENCONTRAR)
2. SISTEMA sugiere talleres compatibles (ENCONTRAR)
```

¿Cómo se crea un pedido si no hay pantalla de crear pedido?

**Sergio llenó el vacío.** No se desvió del plan — el plan estaba incompleto.

---

## Las 14 pantallas que Sergio construyó sin wireframe

### Grupo 1: Flujo de pedidos (4 pantallas) — NECESARIAS, faltaban en el diseño

| Pantalla | Ruta | Por qué era necesaria |
|----------|------|----------------------|
| Crear pedido | `/marca/pedidos/nuevo` | Sin esto ENCONTRAR no funciona. La marca no puede iniciar un pedido. |
| Lista pedidos marca | `/marca/pedidos` | La marca necesita ver sus pedidos. Es el dashboard transaccional. |
| Detalle pedido | `/marca/pedidos/[id]` | Asignar talleres, ver órdenes, cancelar. Es el corazón del flujo. |
| Pedidos taller | `/taller/pedidos` | El taller necesita ver qué le asignaron. Sin esto no sabe que tiene trabajo. |

**Veredicto:** Estas 4 pantallas eran INDISPENSABLES. El diseño las omitió.
Lo que hizo Sergio es correcto y aporta el flujo transaccional que faltaba.

### Grupo 2: Complementos funcionales (4 pantallas) — ÚTILES, mejoran la experiencia

| Pantalla | Ruta | Aporta |
|----------|------|--------|
| Mi perfil marca (editable) | `/marca/perfil` | La marca puede editar sus datos. PANTALLAS_MVP solo diseñó el perfil público. |
| Directorio público | `/directorio` | Visitantes sin auth pueden ver talleres. PANTALLAS_MVP solo diseñó el directorio para marcas logueadas. |
| Landing | `/` | Página de entrada a la plataforma. PANTALLAS_MVP empieza en /login. Sin landing no hay contexto para visitantes nuevos. |
| Cuenta hub | `/cuenta` | Hub de navegación para config de cuenta. PANTALLAS_MVP diseñó Mi Cuenta como form directo. |

**Veredicto:** Aportan valor. La landing y el directorio público son especialmente
importantes para la adopción (un visitante necesita ver qué ofrece la plataforma
antes de registrarse).

### Grupo 3: Sistema (4 pantallas/componentes) — TÉCNICAMENTE NECESARIAS

| Pantalla | Ruta | Aporta |
|----------|------|--------|
| Unauthorized | `/unauthorized` | PANTALLAS_MVP tiene 404 y Error pero no 403. Necesario para el middleware de roles. |
| Reportes Estado | `/estado/reportes` | Separación de exportar vs reportes visuales. |
| Admin crear colección | `/admin/colecciones/nueva` | Decisión de UX: separar crear de editar en vez de compartir pantalla. |
| Loading/Error states (8) | Layouts | Componentes técnicos. No se diseñan en wireframes. |

**Veredicto:** Decisiones de implementación válidas. No requieren wireframe formal.

### Grupo 4: Sin implementar (2 pantallas)

| Pantalla | Ruta | Estado |
|----------|------|--------|
| Dashboard marca | `/marca` | Ruta existe pero sin implementación real |
| Reportes Estado | `/estado/reportes` | Ídem |

---

## 5 pantallas que NADIE diseñó ni construyó

| Pantalla | Función | Por qué falta | Prioridad |
|----------|---------|---------------|:---------:|
| Denuncia pública | FISCALIZAR | API existe (Sprint 1), falta UI para que un trabajador pueda denunciar | P1 |
| Consulta estado denuncia | FISCALIZAR | El denunciante necesita saber qué pasó con su denuncia | P2 |
| Detalle orden (taller) | ENCONTRAR | El taller ve la lista de órdenes pero no puede entrar al detalle ni actualizar progreso | P2 |
| Perfil público marca | ENCONTRAR | Diseñado en PANTALLAS_MVP (#18) pero nunca construido. Los talleres no pueden ver info de la marca. | P2 |
| Bandeja notificaciones | General | Sin esto, las notificaciones in-app no tienen donde mostrarse | P3 |

---

## Qué aporta de nuevo lo que hizo Sergio

### Innovaciones que NO estaban en la planificación

| Innovación | Dónde | Valor |
|------------|-------|-------|
| **Estado derivado de órdenes** | `/api/pedidos/[id]` | El estado del pedido se calcula automáticamente desde sus órdenes. Evita inconsistencias. No estaba en ningún doc. |
| **Modal de asignar taller** | `/marca/pedidos/[id]` | Buscar taller + seleccionar + definir proceso/precio/plazo en un modal de 2 pasos. UX fluida que no estaba diseñada. |
| **Cancelación con cascadeo** | `/api/pedidos/[id]` | Cancelar un pedido cancela automáticamente todas las órdenes pendientes en transacción. No estaba especificado. |
| **Auto-transición de estado** | `/api/pedidos/[id]/ordenes` | BORRADOR → EN_EJECUCION automático al asignar primer taller. Reduce fricción. |
| **Landing pública** | `/` | Visitantes pueden ver qué es la plataforma antes de registrarse. PANTALLAS_MVP empezaba en login. |
| **Directorio público sin auth** | `/directorio` | Cualquier persona puede ver talleres sin registrarse. Reduce barrera de entrada. |

**Conclusión:** El trabajo de Sergio NO solo llena gaps — aporta decisiones de
diseño valiosas (estado derivado, auto-transiciones, cascadeo) que mejoran
la arquitectura y deberían incorporarse como patrón oficial.

---

## Cómo evitar que esto vuelva a pasar

### El problema

No hay un proceso que vincule wireframe → implementación → validación.
Sergio recibió pantallas diseñadas, encontró que faltaban flujos completos,
y las construyó por su cuenta sin documentar. El resultado es bueno pero
genera divergencia entre el diseño y el código.

### Protocolo propuesto

**REGLA 1: No construir pantalla sin diseño previo**

Antes de implementar una pantalla nueva que no esté en PANTALLAS_MVP:
1. Abrir un issue en el repo con: qué pantalla, por qué se necesita, wireframe ASCII básico
2. Esperar validación (o al menos documentar la decisión)
3. Implementar
4. Actualizar PANTALLAS_MVP.md o crear doc de pantallas adicionales

**REGLA 2: Validar cobertura de wireframes por función MVP**

Para cada función MVP, verificar que TODAS las pantallas del flujo completo
están diseñadas antes de empezar a codear. Usar esta checklist:

| Función | Pregunta de validación |
|---------|----------------------|
| REGISTRAR | ¿El usuario puede completar TODO el registro sin salir de la plataforma? |
| ENCONTRAR | ¿La marca puede crear pedido, ver talleres, asignar, y el taller puede ver sus órdenes? |
| APRENDER | ¿El taller puede ver cursos, tomar videos, rendir evaluación, obtener certificado? |
| ACOMPAÑAR | ¿El taller puede ver su checklist, subir documentos, ver progreso? |
| FISCALIZAR | ¿El Estado puede ver métricas, exportar, y un trabajador puede denunciar? |

**REGLA 3: Retrospectiva de wireframes al cerrar cada sprint**

Al terminar un sprint, comparar:
- Pantallas construidas vs pantallas diseñadas
- Pantallas que se necesitaron y no existían
- Actualizar PANTALLAS_MVP.md con las nuevas pantallas

---

## Acciones inmediatas

### 1. Documentar retroactivamente las pantallas de Sergio (P1)

Agregar a PANTALLAS_MVP.md o crear sección "Pantallas Adicionales" con wireframes
ASCII para las 8 pantallas funcionales que Sergio construyó:
- Crear pedido, Lista pedidos marca, Detalle pedido, Pedidos taller
- Mi perfil marca, Directorio público, Landing, Cuenta hub

### 2. Diseñar las 5 pantallas faltantes (P1-P2)

- Denuncia pública (P1)
- Consulta estado denuncia (P2)
- Detalle orden taller (P2)
- Perfil público marca (P2 — ya diseñado en #18, solo construir)
- Bandeja notificaciones (P3)

### 3. Incorporar innovaciones de Sergio al diseño oficial (P2)

Documentar como patrones del sistema:
- Estado derivado (no transiciones manuales)
- Auto-transiciones al completar acciones
- Cancelación con cascadeo en transacción
