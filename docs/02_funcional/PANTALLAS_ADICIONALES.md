# Pantallas Adicionales - Wireframes

Fecha: 2026-03-01
Complementa: PANTALLAS_MVP.md (70 pantallas originales)
Formato: mismo que PANTALLAS_MVP.md (wireframes ASCII + componentes + estados)

Este documento cubre:
- Sección A: 5 pantallas nuevas que nadie diseñó (GAPS_PANTALLAS.md)
- Sección B: 8 pantallas que Sergio construyó sin wireframe previo (documentación retroactiva)

Numeración continúa desde #70 (última pantalla de PANTALLAS_MVP.md).

---

# SECCIÓN A: PANTALLAS NUEVAS (diseñar + construir)

---

### 71. DENUNCIA PÚBLICA

**Ruta:** `/denuncia`
**Propósito:** Permitir denuncias anónimas de trabajo informal
**Función MVP:** FISCALIZAR (HU-F03)
**API existente:** POST /api/denuncias (Sprint 1, pública)

```
┌─────────────────────────────────────────────────────────────────┐
│  [HEADER PÚBLICO]  Logo PDT                    [Iniciar sesión] │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Canal de Denuncia                                              │
│  Plataforma Digital Textil                                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Esta denuncia es ANÓNIMA. No se registra tu identidad     │ │
│  │  ni tu IP. Recibís un código para consultar el estado.     │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Tipo de denuncia *                                             │
│  ┌─────────────────────────────────────────┐                    │
│  │ ▼ Seleccionar...                        │                    │
│  │   Trabajo no registrado                 │                    │
│  │   Condiciones inseguras                 │                    │
│  │   Trabajo infantil                      │                    │
│  │   Salario por debajo del mínimo         │                    │
│  │   Otro                                  │                    │
│  └─────────────────────────────────────────┘                    │
│                                                                  │
│  Taller o empresa (opcional)                                    │
│  ┌─────────────────────────────────────────┐                    │
│  │ Nombre del taller o CUIT si lo conocés  │                    │
│  └─────────────────────────────────────────┘                    │
│                                                                  │
│  Ubicación aproximada (opcional)                                │
│  ┌─────────────────────────────────────────┐                    │
│  │ Barrio, localidad o dirección           │                    │
│  └─────────────────────────────────────────┘                    │
│                                                                  │
│  Descripción *                                                  │
│  ┌─────────────────────────────────────────┐                    │
│  │                                         │                    │
│  │ Describí la situación con el mayor      │                    │
│  │ detalle posible...                      │                    │
│  │                                         │                    │
│  │                                         │                    │
│  └─────────────────────────────────────────┘                    │
│  Mínimo 20 caracteres                                           │
│                                                                  │
│  [    ENVIAR DENUNCIA    ]  btn primario                        │
│                                                                  │
│  Al enviar aceptás los términos de uso.                         │
│                                                                  │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ¿Ya hiciste una denuncia?                                      │
│  [Consultar estado con mi código]  link                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Estado post-envío (reemplaza el formulario):**

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                                                             │ │
│  │  Denuncia registrada                                       │ │
│  │                                                             │ │
│  │  Tu código de seguimiento:                                 │ │
│  │                                                             │ │
│  │       DEN-2026-A8F3K9                                      │ │
│  │       [Copiar código]                                      │ │
│  │                                                             │ │
│  │  Guardá este código. Es la única forma de consultar        │ │
│  │  el estado de tu denuncia. No se envía por email           │ │
│  │  ni WhatsApp para proteger tu anonimato.                   │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  [Consultar estado]     [Volver al inicio]                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Componentes:**
- Select tipo de denuncia (5 opciones)
- Input texto taller/empresa (opcional)
- Input texto ubicación (opcional)
- Textarea descripción (min 20 chars)
- Button Primary "Enviar denuncia"
- Card éxito con código único

**Validaciones:**
- Tipo: requerido
- Descripción: requerida, min 20 caracteres
- No requiere auth (público intencionalmente)

**API:** POST /api/denuncias → genera código único, retorna { codigo }

---

### 72. CONSULTA ESTADO DENUNCIA

**Ruta:** `/denuncia/consulta`
**Propósito:** Consultar estado de una denuncia por código
**Función MVP:** FISCALIZAR (HU-F03)
**API existente:** GET /api/denuncias/[codigo] (Sprint 1, pública)

```
┌─────────────────────────────────────────────────────────────────┐
│  [HEADER PÚBLICO]  Logo PDT                    [Iniciar sesión] │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Consultar Estado de Denuncia                                   │
│                                                                  │
│  ┌─────────────────────────────────────────┐                    │
│  │ Código de seguimiento                   │  [Consultar]       │
│  └─────────────────────────────────────────┘                    │
│                                                                  │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                                                             │ │
│  │  Denuncia DEN-2026-A8F3K9                                  │ │
│  │                                                             │ │
│  │  Estado:  [BADGE] En investigación                         │ │
│  │                                                             │ │
│  │  Tipo:         Trabajo no registrado                       │ │
│  │  Fecha:        15/02/2026                                  │ │
│  │  Actualizado:  28/02/2026                                  │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  [Hacer nueva denuncia]                                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Estados posibles (badges):**
- RECIBIDA (default/gris) — "Tu denuncia fue registrada"
- EN_INVESTIGACION (warning/amarillo) — "Se está investigando"
- RESUELTA (success/verde) — "Se tomaron medidas"
- DESESTIMADA (error/rojo) — "No se encontró evidencia suficiente"

**Componentes:**
- Input código + Button "Consultar"
- Card resultado con badge de estado
- Solo muestra: código, tipo, estado, fechas (NO descripción ni taller para proteger anonimato)

**API:** GET /api/denuncias/[codigo] → { codigo, tipo, estado, createdAt, updatedAt }

---

### 73. DETALLE ORDEN DE MANUFACTURA (Taller)

**Ruta:** `/taller/pedidos/[id]`
**Propósito:** El taller ve el detalle de una orden asignada y actualiza progreso
**Función MVP:** ENCONTRAR (HU-E07)
**API existente:** GET/PUT /api/ordenes/[id]

```
┌─────────────────────────────────────────────────────────────────┐
│  [HEADER TALLER]  Tablero | Perfil | Formalización | Academia   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  < Volver a pedidos                                             │
│                                                                  │
│  Orden MO-2026-A8F3K9XZ                                        │
│  Proceso: Confección                    [BADGE] En ejecución    │
│                                                                  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │  Marca       │ │  Precio      │ │  Plazo       │            │
│  │  Moda Urbana │ │  $650.000    │ │  25 días     │            │
│  │  SA          │ │              │ │  (18 rest.)  │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Progreso                                                   │ │
│  │                                                             │ │
│  │  ████████████████████░░░░░░░░░░░░░░░░░░  45%               │ │
│  │                                                             │ │
│  │  Actualizar progreso:                                      │ │
│  │  ┌──────────────────┐                                      │ │
│  │  │ 45  %            │  [Actualizar]                        │ │
│  │  └──────────────────┘                                      │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Datos del pedido                                          │ │
│  │                                                             │ │
│  │  ID Pedido:    OM-2026-B7C2D1E4                            │ │
│  │  Prenda:       Remera/Camiseta                             │ │
│  │  Cantidad:     500 unidades                                │ │
│  │  Fecha obj.:   15/03/2026                                  │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Contacto marca                                            │ │
│  │                                                             │ │
│  │  Moda Urbana SA                                            │ │
│  │  [Contactar por WhatsApp]  btn outline                     │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌──────────────────────────────────┐                           │
│  │  Marcar como completada          │  btn success              │
│  └──────────────────────────────────┘                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Componentes:**
- Link "Volver a pedidos"
- Badge estado orden (PENDIENTE/EN_EJECUCION/COMPLETADO/CANCELADO)
- 3 stat cards (marca, precio, plazo con días restantes)
- Progress bar + input numérico para actualizar %
- Card datos del pedido (read-only)
- Card contacto marca con botón wa.me
- Button "Marcar como completada" (solo si estado = EN_EJECUCION)

**Acciones:**
- PUT /api/ordenes/[id] { progreso: N } → actualiza %
- PUT /api/ordenes/[id] { estado: 'COMPLETADO' } → marca completada
- Contactar → abre wa.me con mensaje pre-armado

**Validaciones:**
- Solo el taller asignado puede ver/editar (ownership check)
- No se puede completar si progreso < 100%
- No se puede editar si estado = COMPLETADO o CANCELADO

---

### 74. PERFIL PÚBLICO MARCA

**Ruta:** `/marca/[id]`
**Propósito:** Cómo los talleres ven la información de una marca
**Función MVP:** ENCONTRAR
**Nota:** Diseñada en PANTALLAS_MVP.md como #18 pero nunca construida

```
┌─────────────────────────────────────────────────────────────────┐
│  [HEADER]                                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  < Volver                                                       │
│                                                                  │
│  ┌──────┐  Moda Urbana SA                                      │
│  │  MU  │  Buenos Aires, Argentina                              │
│  │      │  www.modaurbana.com.ar                                │
│  └──────┘                                                       │
│                                                                  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │  Rating      │ │  Pedidos     │ │  Tipo        │            │
│  │  4.2         │ │  15          │ │  Mayorista   │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Sobre la marca                                            │ │
│  │                                                             │ │
│  │  Tipo:                Mayorista                             │ │
│  │  Ubicación:           CABA                                  │ │
│  │  Volumen mensual:     2.000 prendas                        │ │
│  │  Frecuencia:          Mensual                               │ │
│  │  CUIT:                30-12345678-9 (verificado)            │ │
│  │  En la plataforma:    desde Enero 2026                     │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Pedidos recientes                                         │ │
│  │                                                             │ │
│  │  500 Remeras     En ejecución    Feb 2026                  │ │
│  │  200 Buzos       Completado      Ene 2026                  │ │
│  │  300 Camperas    Completado      Dic 2025                  │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  [Contactar por WhatsApp]  btn outline                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Componentes:**
- Avatar con iniciales
- 3 stat cards (rating, pedidos realizados, tipo)
- Card "Sobre la marca" con datos públicos
- Card "Pedidos recientes" (últimos 5, sin montos)
- Button wa.me contacto

**Acceso:** Público (sin auth). Visible desde directorio y desde detalle de orden del taller.

---

### 75. BANDEJA DE NOTIFICACIONES IN-APP

**Ruta:** `/cuenta/notificaciones`
**Propósito:** Ver notificaciones del sistema
**Función:** General (todas las funciones generan notificaciones)

```
┌─────────────────────────────────────────────────────────────────┐
│  [HEADER según rol]                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Notificaciones                          [Marcar todas leídas]  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  ● Nueva orden asignada                        hace 2h     │ │
│  │    Moda Urbana SA te asignó una orden de Confección         │ │
│  │    500 remeras - $650.000                                   │ │
│  │                                              [Ver orden]    │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │  ● Documento aprobado                          hace 1d     │ │
│  │    Tu Monotributo fue aprobado por el administrador         │ │
│  │    Nivel actualizado: PLATA                                 │ │
│  │                                         [Ver formalización] │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │  ○ Certificado emitido                         hace 3d     │ │
│  │    Completaste "Organizá tu Taller" con 85%                │ │
│  │    Código: PDT-CERT-2026-A8F3K9                            │ │
│  │                                         [Ver certificado]  │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │  ○ Bienvenido a la plataforma                  hace 5d     │ │
│  │    Completá tu perfil productivo para que las marcas        │ │
│  │    te encuentren.                                           │ │
│  │                                        [Completar perfil]  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Mostrando 4 de 12                      [Cargar anteriores]     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Componentes:**
- Lista de notificaciones con indicador leída/no leída (● / ○)
- Cada notificación: título, descripción, timestamp relativo, link a acción
- Button "Marcar todas leídas"
- Paginación "Cargar anteriores"

**Estados:**
- Sin notificaciones: "No tenés notificaciones nuevas"
- Con no leídas: badge con cantidad en el header (campana)
- Todas leídas: sin indicadores ●

**API:**
- GET /api/notificaciones?userId=session.user.id (fix pendiente: validar contra session)
- PUT /api/notificaciones { leida: true }

---

# SECCIÓN B: PANTALLAS DE SERGIO (documentación retroactiva)

Sergio construyó estas pantallas sin wireframe previo porque PANTALLAS_MVP.md
no cubrió el flujo de pedidos. Se documentan retroactivamente para que queden
como referencia oficial.

---

### 76. LANDING

**Ruta:** `/`
**Propósito:** Página de entrada para visitantes. Explica qué es la plataforma.
**Construida por:** Sergio (commit 4d3e5f3)

```
┌─────────────────────────────────────────────────────────────────┐
│  [HEADER PÚBLICO]  Logo PDT         [Ingresar]  [Registrarse]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                                                             │ │
│  │  Plataforma Digital Textil                                 │ │
│  │                                                             │ │
│  │  Conectamos talleres formalizados con marcas               │ │
│  │  que valoran el trabajo decente.                           │ │
│  │                                                             │ │
│  │  [Soy Taller]  [Soy Marca]  [Ver directorio]              │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │  Talleres    │ │  Marcas      │ │  Certificados │            │
│  │  registrados │ │  activas     │ │  emitidos     │            │
│  │     XX       │ │     XX       │ │     XX        │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│                                                                  │
│  Cómo funciona:                                                 │
│  1. Registrate y verificá tu CUIT                              │
│  2. Completá tu perfil productivo                              │
│  3. Conectá con marcas o talleres                              │
│                                                                  │
│  [Footer: OIT + UNTREF + Links]                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Componentes:**
- Hero con tagline y CTAs por rol
- Stats públicas reales (GET /api/stats/public)
- Sección "Cómo funciona" (3 pasos)
- Footer institucional

**API:** GET /api/stats/public (counts públicos sin auth)

---

### 77. CREAR PEDIDO (Marca)

**Ruta:** `/marca/pedidos/nuevo`
**Propósito:** La marca crea un pedido especificando prenda, cantidad y fecha
**Función MVP:** ENCONTRAR (HU-E04)
**Construida por:** Sergio

```
┌─────────────────────────────────────────────────────────────────┐
│  [HEADER MARCA]  Directorio | Pedidos | Perfil                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Crear Nuevo Pedido                                             │
│                                                                  │
│  Tipo de prenda *                                               │
│  ┌─────────────────────────────────────────┐                    │
│  │ ▼ Seleccionar tipo de prenda...         │                    │
│  └─────────────────────────────────────────┘                    │
│  (Nota: debe cargar desde catálogo TipoPrenda, ver PLAN_SCHEMA) │
│                                                                  │
│  Cantidad (unidades) *                                          │
│  ┌─────────────────────────────────────────┐                    │
│  │ 500                                     │                    │
│  └─────────────────────────────────────────┘                    │
│                                                                  │
│  Fecha objetivo                                                 │
│  ┌─────────────────────────────────────────┐                    │
│  │ dd/mm/aaaa                              │                    │
│  └─────────────────────────────────────────┘                    │
│                                                                  │
│  Monto total ($)                                                │
│  ┌─────────────────────────────────────────┐                    │
│  │ 650000                                  │                    │
│  └─────────────────────────────────────────┘                    │
│                                                                  │
│  [    CREAR PEDIDO    ]  btn primario                           │
│                                                                  │
│  [Cancelar]  link a /marca/pedidos                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Componentes:**
- Select tipo de prenda (desde catálogo BD — actualmente input texto, ver PLAN_SCHEMA 2.1)
- Input número cantidad
- Input date fecha objetivo
- Input número monto total
- Button Primary "Crear pedido"

**Acción:** Server Action → genera omId (OM-YYYY-UUID), crea Pedido en BORRADOR, redirect a /marca/pedidos?created=1

---

### 78. LISTA DE PEDIDOS (Marca)

**Ruta:** `/marca/pedidos`
**Propósito:** La marca ve todos sus pedidos con filtros y stats
**Función MVP:** ENCONTRAR (HU-E05)
**Construida por:** Sergio

```
┌─────────────────────────────────────────────────────────────────┐
│  [HEADER MARCA]  Directorio | Pedidos | Perfil                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [BANNER SUCCESS]  Pedido creado exitosamente  (si ?created=1)  │
│                                                                  │
│  Mis Pedidos                               [+ Crear pedido]    │
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │  Total   │ │ Borrador │ │ En ejec. │ │ Complet. │          │
│  │    12    │ │    3     │ │    5     │ │    4     │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│                                                                  │
│  ┌─────────────────────────────┐ ┌──────────────┐              │
│  │ Buscar por ID o prenda...   │ │ ▼ Estado     │              │
│  └─────────────────────────────┘ └──────────────┘              │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  OM-2026-A8F3K9XZ                                         │ │
│  │  Remera - 500 unidades          3 órdenes                 │ │
│  │  Creado: 15/02/2026             [BADGE] En ejecución      │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │  OM-2026-B7C2D1E4                                         │ │
│  │  Buzo - 200 unidades            1 orden                   │ │
│  │  Creado: 10/02/2026             [BADGE] Borrador          │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │  OM-2026-C3D4E5F6                                         │ │
│  │  Campera - 300 unidades         2 órdenes                 │ │
│  │  Creado: 05/01/2026             [BADGE] Completado        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Componentes:**
- Banner success condicional (?created=1)
- 4 stat cards con conteos reales
- Input búsqueda + Select filtro estado (searchParams server-side)
- Lista de pedidos como Link clickeables a /marca/pedidos/[id]
- Cada pedido: omId, prenda, cantidad, fecha, conteo órdenes, badge estado

---

### 79. DETALLE PEDIDO (Marca)

**Ruta:** `/marca/pedidos/[id]`
**Propósito:** Ver detalle, asignar talleres, cancelar
**Función MVP:** ENCONTRAR (HU-E06)
**Construida por:** Sergio (commits 8bda346, cfb0ed3)

```
┌─────────────────────────────────────────────────────────────────┐
│  [HEADER MARCA]  Directorio | Pedidos | Perfil                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  < Volver a pedidos                                             │
│                                                                  │
│  OM-2026-A8F3K9XZ                                              │
│  Remera - 500 unidades               [BADGE] En ejecución      │
│  Creado: 15/02/2026                                             │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Flujo del pedido                                          │ │
│  │                                                             │ │
│  │  (1)────────(2)────────(3)                                 │ │
│  │  Borrador   En ejec.   Completado                          │ │
│  │  [verde]    [azul]     [gris]                              │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ Unidades │ │ Progreso │ │ Monto    │ │ Fecha    │          │
│  │   500    │ │   45%    │ │ $650.000 │ │ 15/03/26 │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│                                                                  │
│  [+ Asignar taller]  (solo BORRADOR)    [Cancelar pedido]      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Órdenes de manufactura (2)                                │ │
│  │                                                             │ │
│  │  MO-2026-X1Y2Z3    Textil SM (PLATA)                      │ │
│  │  Confección - $400.000      ████████░░ 60%  [En ejecución] │ │
│  │                                                             │ │
│  │  MO-2026-A4B5C6    Taller Norte (BRONCE)                   │ │
│  │  Corte - $250.000           ███░░░░░░░ 30%  [Pendiente]    │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Modal Asignar Taller (2 pasos):**

```
Paso 1: Buscar taller
┌─────────────────────────────────────────────────────────────────┐
│  Asignar taller                                          [X]   │
│                                                                  │
│  ┌─────────────────────────────────────────┐                    │
│  │ Buscar taller por nombre...             │                    │
│  └─────────────────────────────────────────┘                    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Textil San Martín            [BADGE PLATA]                │ │
│  │  CABA  |  4.8  |  1.500 prendas/mes                       │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │  Taller Norte                 [BADGE BRONCE]               │ │
│  │  GBA Norte  |  3.5  |  800 prendas/mes                    │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

Paso 2: Definir orden
┌─────────────────────────────────────────────────────────────────┐
│  Asignar taller                                          [X]   │
│                                                                  │
│  ┌ Textil San Martín (PLATA) - CABA ────────── [Cambiar] ──┐  │
│                                                                  │
│  Proceso *          Precio ($) *       Plazo (días)            │
│  ┌──────────┐      ┌──────────┐       ┌──────────┐            │
│  │▼ Corte   │      │ 400000   │       │ 25       │            │
│  └──────────┘      └──────────┘       └──────────┘            │
│  (Nota: debe cargar desde catálogo ProcesoProductivo,           │
│   ver PLAN_SCHEMA 2.2. Actualmente hardcodeado.)                │
│                                                                  │
│                    [Cancelar]  [Confirmar asignación]           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Reglas de transición (implementadas por Sergio):**
- BORRADOR → EN_EJECUCION: automático al asignar primer taller
- * → CANCELADO: manual, cascadea a órdenes pendientes
- COMPLETADO/CANCELADO → *: bloqueado

---

### 80. PEDIDOS RECIBIDOS (Taller)

**Ruta:** `/taller/pedidos`
**Propósito:** El taller ve las órdenes de manufactura que le asignaron
**Función MVP:** ENCONTRAR (HU-E07)
**Construida por:** Sergio

```
┌─────────────────────────────────────────────────────────────────┐
│  [HEADER TALLER]  Tablero | Perfil | Formalización | Academia   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Mis Pedidos                                                    │
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │  Total   │ │Pendientes│ │ En ejec. │ │ Complet. │          │
│  │    8     │ │    2     │ │    4     │ │    2     │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  MO-2026-X1Y2Z3                                           │ │
│  │  Pedido: OM-2026-A8F3  |  Marca: Moda Urbana SA           │ │
│  │  Confección - $400.000                                     │ │
│  │  ████████████░░░░░░░░  60%          [BADGE] En ejecución   │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │  MO-2026-A4B5C6                                           │ │
│  │  Pedido: OM-2026-B7C2  |  Marca: TextilCo                 │ │
│  │  Corte - $180.000                                          │ │
│  │  ░░░░░░░░░░░░░░░░░░░░  0%          [BADGE] Pendiente      │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  (Sin detalle clickeable. Falta pantalla 73. Solo lectura.)     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Componentes:**
- 4 stat cards reales (counts por estado)
- Lista de órdenes: moId, pedido, marca, proceso, precio, progress bar, badge estado
- Cada orden debería ser Link a /taller/pedidos/[id] (pantalla 73)

**Nota:** Actualmente solo lectura. Con la pantalla 73 (Detalle Orden) el taller
podrá entrar al detalle y actualizar progreso.

---

### 81. MI PERFIL MARCA (Editable)

**Ruta:** `/marca/perfil`
**Propósito:** La marca edita sus datos comerciales
**Construida por:** Sergio

```
┌─────────────────────────────────────────────────────────────────┐
│  [HEADER MARCA]  Directorio | Pedidos | Perfil                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Mi Perfil                                                      │
│                                                                  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │  CUIT        │ │  Pedidos     │ │  Rating      │            │
│  │  30-1234-9   │ │  realizados  │ │  4.2         │            │
│  │  (verificado)│ │     15       │ │              │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│                                                                  │
│  Nombre de la marca *                                           │
│  ┌─────────────────────────────────────────┐                    │
│  │ Moda Urbana SA                          │                    │
│  └─────────────────────────────────────────┘                    │
│                                                                  │
│  Tipo               Ubicación                                   │
│  ┌─────────────┐   ┌──────────────────────┐                    │
│  │ Mayorista   │   │ Buenos Aires         │                    │
│  └─────────────┘   └──────────────────────┘                    │
│                                                                  │
│  Website            Frecuencia de compra                        │
│  ┌─────────────┐   ┌──────────────────────┐                    │
│  │ www.moda... │   │ ▼ Mensual            │                    │
│  └─────────────┘   └──────────────────────┘                    │
│                                                                  │
│  Volumen mensual (prendas)                                      │
│  ┌─────────────────────────────────────────┐                    │
│  │ 2000                                    │                    │
│  └─────────────────────────────────────────┘                    │
│                                                                  │
│  [    GUARDAR CAMBIOS    ]  btn primario                        │
│  (Falta: toast de éxito después de guardar)                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Acción:** Server Action updateMarca → actualiza nombre, tipo, ubicación, website,
frecuenciaCompra, volumenMensual.

**Pendiente:** Feedback visual post-guardar (toast). Falla silenciosa si nombre vacío.

---

### 82. DIRECTORIO PÚBLICO

**Ruta:** `/directorio`
**Propósito:** Visitantes sin auth pueden ver talleres de la plataforma
**Construida por:** Sergio

```
┌─────────────────────────────────────────────────────────────────┐
│  [HEADER PÚBLICO]  Logo PDT                    [Iniciar sesión] │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Directorio de Talleres                                         │
│                                                                  │
│  (Pendiente: agregar búsqueda, filtros y paginación)            │
│                                                                  │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐│
│  │  Textil SM       │ │  Taller Norte    │ │  Confecciones    ││
│  │  [BADGE PLATA]   │ │  [BADGE BRONCE]  │ │  [BADGE ORO]    ││
│  │  CABA            │ │  GBA Norte       │ │  Córdoba         ││
│  │  4.8 | 1.500/mes │ │  3.5 | 800/mes  │ │  4.9 | 2.000/mes││
│  │  Confección, Corte│ │  Corte          │ │  Full service    ││
│  │  [Ver perfil →]  │ │  [Ver perfil →] │ │  [Ver perfil →] ││
│  └──────────────────┘ └──────────────────┘ └──────────────────┘│
│                                                                  │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐│
│  │  ...             │ │  ...             │ │  ...             ││
│  └──────────────────┘ └──────────────────┘ └──────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Componentes:**
- Grid de 3 columnas
- Card por taller: nombre, nivel badge, zona, rating, capacidad, procesos
- Card entera es Link a /perfil/[id]

**Pendiente:** Sin paginación, sin filtros, sin búsqueda. Usa campo `zona` vs
`ubicacion` (inconsistencia con /marca/directorio).

---

### 83. CUENTA HUB

**Ruta:** `/cuenta`
**Propósito:** Hub de navegación para configuración de cuenta
**Construida por:** Sergio

```
┌─────────────────────────────────────────────────────────────────┐
│  [HEADER según rol]                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Mi Cuenta                                                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Nombre:          Juan Pérez                               │ │
│  │  Email:           juan@taller.com                          │ │
│  │  Teléfono:        +54 11 1234-5678                        │ │
│  │  Rol:             TALLER                                   │ │
│  │  Miembro desde:   Enero 2026                              │ │
│  │  Notificaciones:  3 sin leer                              │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────┐  ┌─────────────────────┐              │
│  │  Editar datos       │  │  Notificaciones     │              │
│  │  Nombre, teléfono,  │  │  Configurar qué     │              │
│  │  contraseña         │  │  recibís             │              │
│  │  → /mi-cuenta       │  │  → /cuenta/notif.   │              │
│  └─────────────────────┘  └─────────────────────┘              │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Servicios externos no integrados todavía.                 │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Componentes:**
- Card resumen con datos del usuario (read-only)
- 2 tiles de navegación: editar datos, notificaciones
- Banner info sobre servicios no integrados

---

## RESUMEN

| # | Pantalla | Sección | Tipo | Prioridad |
|---|----------|---------|------|:---------:|
| 71 | Denuncia pública | A - Nueva | FISCALIZAR | P1 |
| 72 | Consulta estado denuncia | A - Nueva | FISCALIZAR | P2 |
| 73 | Detalle orden (taller) | A - Nueva | ENCONTRAR | P2 |
| 74 | Perfil público marca | A - Nueva | ENCONTRAR | P2 |
| 75 | Bandeja notificaciones | A - Nueva | General | P3 |
| 76 | Landing | B - Retroactiva | General | Ya construida |
| 77 | Crear pedido | B - Retroactiva | ENCONTRAR | Ya construida |
| 78 | Lista pedidos marca | B - Retroactiva | ENCONTRAR | Ya construida |
| 79 | Detalle pedido marca | B - Retroactiva | ENCONTRAR | Ya construida |
| 80 | Pedidos taller | B - Retroactiva | ENCONTRAR | Ya construida |
| 81 | Mi perfil marca | B - Retroactiva | ENCONTRAR | Ya construida |
| 82 | Directorio público | B - Retroactiva | ENCONTRAR | Ya construida |
| 83 | Cuenta hub | B - Retroactiva | General | Ya construida |

**Total inventario actualizado: 83 pantallas + 6 modales**
(70 originales + 13 adicionales)
