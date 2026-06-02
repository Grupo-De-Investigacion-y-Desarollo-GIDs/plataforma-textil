# Narrativa V4 — Documento consolidado para implementación

**Fecha:** 2026-06-01
**De:** Sergio (coordinación + planificación narrativa)
**Para:** Gerardo (desarrollo)
**Estado:** Cerrado. Plan de implementación en 4 etapas.
**Contexto:** Multi-rol U-03..U-08 ya en curso de implementación.

---

## Tabla de contenidos

1. Contexto y alcance
2. Modelo conceptual de la PDT (Nivel 1)
3. Narrativa por rol (Nivel 2)
4. Arquitectura por rol (Nivel 3)
5. Estructura por pantalla (Nivel 4)
6. Las 3 dimensiones de la vidriera (decisión transversal)
7. **Plan de implementación en 4 etapas**
8. Decisiones que quedan abiertas
9. Diferencias con el master V4

---

## 1. Contexto y alcance

### ¿Por qué este documento?

Después de la reunión con OIT del 27/5/2026 (que aprobó la idea conceptual y dejó como pendientes 2 grandes cambios estructurales: multi-rol completo + academia para marcas), se hizo un trabajo de organización de la narrativa de la PDT en 4 niveles:

- **Nivel 1**: filosófico (el qué es la PDT)
- **Nivel 2**: narrativa por rol (quién es cada usuario)
- **Nivel 3**: arquitectura por rol (tabs, orden, jerarquía)
- **Nivel 4**: estructura por pantalla (bloques de cada pantalla)

El **Nivel 5 (copy / micro)** queda pendiente — frases ancla, copy por rol, mensajes de estado, notificaciones, emails. Se trabajará en sub-bloques cuando avance la implementación.

### Estado actual de implementación

- ✅ **Multi-rol U-03..U-08 ya en curso** por Gera
- 🟠 **Etapa 1 (~14-16h)**: lista para arrancar en paralelo a Multi-rol
- 🟡 **Etapa 2 (~20-26h)**: post Multi-rol
- 🟡 **Etapa 3 (~13-18h)**: gobernanza estructural
- 🔴 **Etapa 4**: post-piloto (espera decisión institucional)

### Relación con el master V4

Este documento **respeta el master V4 como base** pero introduce ajustes específicos. Las diferencias están listadas en la **Sección 9**.

### Qué NO cubre

- Implementación técnica detallada (se generan specs aparte cuando arranca cada cambio)
- Copy literal de cada pantalla (Nivel 5 pendiente)
- Decisiones del Bloque O del master que requieren consulta institucional

---

## 2. Modelo conceptual de la PDT

### 2.1 Modelo

La PDT es una plataforma de **3 capas** con **4 dimensiones de valor**, sostenida institucionalmente por una **entidad de gobernanza** (cuya composición tripartita se formaliza post-piloto).

### 2.2 Las 3 capas

| Capa | Quién la percibe | Qué pasa ahí | Quién la administra |
|---|---|---|---|
| **Visible** | Taller + Marca | Vidriera del taller, marcas exploran y descubren, se conectan directo. Lo comercial NO es transacción cerrada — es generar el contacto. | (no se administra, se vive) |
| **Intermedia** | Taller (la vive como "requisitos para ser visible") | Onboarding que premia documentación. Progreso visible sin ranking. Capacitación. Verificación de credenciales. **Self-management** (calculadora SAM, lectura de capacidad). | La gobernanza define los criterios |
| **Institucional** | Solo la entidad de gobernanza | Dashboards de formalización, demanda insatisfecha, observaciones, reportes, datos agregados anónimos. | La entidad de gobernanza |

### 2.3 Las 4 dimensiones de valor

Distribuidas entre las 3 capas:

| Dimensión | En qué capa vive | Función |
|---|---|---|
| **Showcase** | Visible | El taller se exhibe profesionalmente |
| **Match** | Visible | La marca descubre y conecta |
| **Self-management** | Intermedia | El taller usa la plataforma para entenderse a sí mismo |
| **Política pública** | Institucional | La gobernanza obtiene mapa sectorial vivo |

📌 Cada cosa que la plataforma pide cargar tiene un **curso asociado** que enseña a hacerlo. La PDT no solo exige formalización — acompaña a formalizarse.

### 2.4 Entidad de Gobernanza

**Definición conceptual**: la gobernanza es la entidad que sostiene la sustentabilidad operativa de la PDT después de su fase piloto. Conceptualmente es **tripartita público-privada-sociedad civil**.

**Estado en V4**: el rol técnico se implementa como **COORD** (renombre temporal del rol ESTADO actual, siguiendo G-16 del master), **sin** campo "sector" ni workflow tripartito. La formalización institucional de la tripartición queda como decisión post-piloto.

**Función**: sostener la PDT como herramienta del sector textil más allá del piloto.

### 2.5 Dos tipos de usuarios dentro de COORD (V4)

| Tipo | Función | Permisos técnicos |
|---|---|---|
| **POLÍTICO** | Define requisitos de cada etapa, umbrales, catálogo de cursos, indicadores, decisiones políticas | Lee todo, configura políticas, NO toca documentos individuales |
| **OPERATIVO** | Revisa documentación de talleres, aprueba/rechaza, deja observaciones de campo | Aprueba/rechaza documentos, NO toca configuración política |

📌 Esta sub-división **sí entra en V4** (Etapa 3). El campo "sector" tripartito y el workflow bilateral 2 de 3 sectores quedan post-piloto.

### 2.6 Métricas de éxito V4

| Antes (V3) | Ahora (V4) |
|---|---|
| Talleres formalizados | **Encuentros generados** (contactos taller-marca) |
| Documentos verificados | **Vidrieras publicadas** |
| Cotizaciones aceptadas | **Talleres descubiertos por marcas nuevas** |
| Reportes a OIT | **Capacitaciones completadas + perfiles enriquecidos** |

### 2.7 Tono al taller

- **"Acompañamiento" en discurso** (landing, copy aspiracional, frases ancla)
- **"Requisitos para ser visible" en mecánica** (cálculo del recorrido, etiquetas en cards de tareas)
- "Vos", coloquial argentino, sin diferencias regionales
- Logros, no obligaciones
- Sin lenguaje institucional frío

### 2.8 Tono a la marca

- "Descubrí proveedores reales con información rica"
- Profesional pero cercano
- "Vos" también
- Información clara para el match
- Sin presión comercial

### 2.9 Renombre del rol técnico

`ESTADO` → **`COORD`** (Etapa 2 — adelantamos G-16 del master a MVP).

El renombre definitivo a "GOBERNANZA" o similar queda como **decisión institucional post-piloto**.

### 2.10 Política pública reformulada

La PDT no **hace** política pública. **Aporta insumos** para que la política pública del sector sea mejor. La gobernanza decide qué se comparte y con quién.

---

## 3. Narrativa por rol (Nivel 2)

### 3.1 Rol TALLER

#### Persona típica
- Pequeño o mediano taller textil del Conurbano (1 a 20 personas)
- Familiar o cooperativo
- Mezcla de informalidad y formalidad
- Celular como dispositivo principal
- Tiempo escaso — cada cosa que la plataforma pida tiene que tener retorno claro

#### Pregunta de entrada
*"¿Qué hago acá? ¿Esto me va a traer pedidos o me va a complicar la vida con más trámites?"*

#### Viaje (4 etapas)

| Etapa | Tiempo | Logro |
|---|---|---|
| **Llegada y primer reconocimiento** | Día 1 | "Ya tengo un espacio en la PDT, ya existo en la red" |
| **Construcción de la vidriera** | Semana 1-2 | "Mi taller se ve bien, lo que ofrezco está claro" |
| **Avance del recorrido** | Mes 1-3 | "Voy avanzando, cada paso me hace más visible y profesional" |
| **Uso sostenido** | Post 3 meses | "Esto es mi vidriera profesional + mi herramienta de gestión" |

#### Qué se lleva el taller
- Visibilidad: existencia en una red profesional del sector
- Acompañamiento real: alguien le marca qué le falta y le enseña cómo
- Calculadora de capacidad propia: deja de "trabajar a ojo"
- **Cotización justa**: herramienta concreta contra precarización (argumento institucional más fuerte para OIT)
- Conexión con marcas: encuentros reales generados

### 3.2 Tres umbrales escalonados del TALLER

| Umbral | Qué se le pide | Qué le destraba |
|---|---|---|
| **1. Registrado** | Email + CUIT (puede estar pendiente de verificación) | Academia + Recursos + Ver la red. Duración: 60 días de gracia (master 3.11) |
| **2. Visible en directorio** | CUIT verificado por ARCA + Descripción ≥50 caracteres + Ubicación + Al menos 1 rubro o capacidad + Foto del taller | Aparece en directorio público con badge "Etapa inicial" |
| **3. Apto para cotizar** | Etapa intermedia o consolidada + Perfil productivo al 80% | Cotizar pedidos disponibles, aparecer en match calificado |

### 3.3 Rol MARCA

#### Persona típica
- Marca chica, mediana o gran empresa de indumentaria (perfil general, sin segmentar)
- Diseñador independiente o equipo de producción
- Busca proveedores reales verificados
- Baja confianza en "talleres por Instagram"

#### Pregunta de entrada
*"¿Acá hay talleres reales, verificados, que puedo contactar sin intermediarios?"*

#### Viaje (4 etapas)

| Etapa | Tiempo | Logro |
|---|---|---|
| **Llegada y descubrimiento** | Día 1 | "Ya puedo explorar el sector" |
| **Exploración informada** | Semana 1-2 | "Ya identifiqué 3-5 talleres que me interesan" |
| **Publicación de pedidos y match** | Mes 1+ | "Hice un match real, conecté con un taller que coincide" |
| **Uso sostenido + capacitación** | Permanente | "Esto es mi canal profesional + espacio de aprendizaje" |

#### Qué se lleva la marca
- Acceso a talleres reales y verificados (termina la incertidumbre)
- Información rica para decidir (no es Amazon, es descubrimiento profesional)
- Match informado (por prenda, servicio, plazo, organización, etapa)
- Aprendizaje sectorial (academia para marcas con linkeo a requisitos)

### 3.4 Academia para marcas (G-13 ampliado)

**Versión V4 (Etapa 3)**:
- Habilitar tab Cursos para rol MARCA
- Lógica de linkeo curso ↔ requisito en ambas direcciones (desde el curso ver qué requisitos avanza, desde un requisito pendiente ver qué cursos lo apoyan)
- Los **contenidos los carga Sergio progresivamente** (no es catálogo seed — son cursos reales del equipo PDT)
- El catálogo crece según se vayan produciendo cursos

**Temas previstos para el catálogo** (a producir):
- Cursos de formalización para la marca (constitución legal, ARCA, ART, etc.)
- Cursos de gestión productiva (cómo elegir proveedor, cómo escribir orden de pedido, calidad textil, costos, comercio justo)

### 3.5 Rol COORD (ex ESTADO)

#### Persona típica
- Representante de la gobernanza de la PDT
- Mirada estratégica del sector (POLÍTICO) o ejecutiva cotidiana (OPERATIVO)

#### Pregunta de entrada
*"¿Cómo está el sector textil hoy? ¿Qué está pasando con la formalización? ¿Dónde concentrar nuestro esfuerzo?"*

#### Viaje (consulta + decisión recurrente, no lineal)

- **POLÍTICO**: entra semanal/quincenal a tomar la temperatura sectorial y decidir
- **OPERATIVO**: entra diario/regularmente a verificar documentación y dar curso a casos

#### Qué se lleva COORD
- Visibilidad del sector en tiempo real
- Insumos para decisión (dónde poner capacitación, crédito, programas de empleo)
- Trazabilidad institucional (qué se aprobó, cuándo, bajo qué política)

### 3.6 Multi-rol Airbnb (ya en curso — U-03..U-08)

- Una sola cuenta por CUIT
- PerfilTaller + PerfilMarca opcionales que coexisten
- Toggle UI "estás operando como" en el header (al lado del avatar)
- CUIT y verificación ARCA compartidos entre modos
- Membresía vigente única
- Clasificación automática invisible: cada pedido etiquetado COMERCIAL o SUBCONTRATACIÓN según origen
- Regla anti-incesto: un mismo CUIT no puede cotizar pedidos publicados por sí mismo
- Onboarding elige rol primario, segundo se "activa" después
- Notificaciones se filtran por rol activo
- Mi cuenta es única (datos personales del CUIT), independiente del rol activo

---

## 4. Arquitectura por rol (Nivel 3)

### 4.1 ROL TALLER

#### Orden de tabs (header top)
```
[Inicio] [Mi taller ▼] [Mi recorrido] [Cursos] [Pedidos]
              ├─ Mi vidriera (🌐 público)
              └─ Mi gestión productiva (🔒 privado-taller + COORD)
```

#### Sub-tabs Pedidos
- Recibidos (default)
- Disponibles (vitrina de demanda)

#### Lógica del orden
- Inicio = puerta de entrada
- Mi taller = construir presencia (identidad)
- Mi recorrido = avanzar en formalización (proceso)
- Cursos = aprender lo necesario (apoyo)
- **Pedidos al final** = resultado del viaje, no protagonista

#### Sidebar
- Notificaciones · Mi cuenta · Ayuda

### 4.2 ROL MARCA

#### Orden de tabs (header top)
```
[Inicio] [Mi marca] [Explorar talleres] [Cursos] [Pedidos]
```

#### Sub-tabs Pedidos
- Mis publicados (default)
- Cotizaciones recibidas
- Históricos

#### Lógica del orden (simetría con TALLER)
- Inicio = puerta de entrada
- Mi marca = identidad (espejo de Mi taller)
- Explorar talleres = primera acción de la marca
- Cursos = aprender a trabajar mejor con el sector
- **Pedidos al final** = resultado del viaje

#### Sidebar
- Notificaciones · Mi cuenta · Ayuda

### 4.3 ROL COORD

**Una interfaz común con módulos visibles según el `tipo`**:
- POLÍTICO: ve módulo de configuración + reportes estratégicos
- OPERATIVO: ve cola de verificaciones + casos individuales

### 4.4 Multi-rol — UX

#### Toggle
Al lado del avatar (patrón Airbnb), dropdown con los roles activados:
```
Operando como:
  ● Taller (Taller La Aguja)
    Marca (Amapola Indumentaria)
```

#### Diferenciación visual
- Acento de color: azul brand para Taller, terracotta para Marca
- Pill al lado del logo: "Modo Taller" / "Modo Marca"
- Borde inferior del header: 3-4 px de color brand del rol activo
- Avatar con borde del color del rol activo
- Toast al cambiar: *"Ahora estás operando como Marca (Amapola Indumentaria)"*

### 4.5 Decisiones de visibilidad del perfil productivo (Modelo B)

**Control por GRUPO** del propio taller:
- Toggles por bloque del perfil productivo (composición equipo, espacio, capacidad escalado, organización, maquinaria)
- Cada bloque: "Visible en directorio: SI/NO"
- **SAM siempre privado** (no editable a público) — protección de la cotización del taller
- ARCA obligatorio (no negociable para aparecer en directorio)
- Botón "Ver cómo me ve el directorio" — preview

---

## 5. Estructura por pantalla (Nivel 4)

12 pantallas con estructura decidida. Resumen por pantalla:

### 5.1 Inicio TALLER
1. Saludo personal ("Hola Roberto, bienvenido a tu taller en PDT")
2. Estado vivo (etapa actual + indicador chico de vidriera activa/pendiente)
3. Qué hacer ahora (1-2 acciones contextuales reales, no genéricas)
4. Actividad reciente (pedidos recibidos sin responder, pedidos disponibles que coinciden, notificaciones importantes)
5. Recomendaciones lateral (2-3 cursos sugeridos según recorrido)
6. Footer institucional

### 5.2 Mi taller (sub-tabs Vidriera + Gestión productiva)
Cabecera común + toggle de sub-tabs (🌐 / 🔒) + banner contextual en cada sub-tab.

**Sub-tab Vidriera (público)**: descripción + capacidades + credenciales + perfil productivo (cards según Modelo B) + portfolio + contacto + acciones.

**Sub-tab Gestión productiva (privado)**: capacidad real calculada + tiempos SAM + equipo exacto + espacio + configuración de visibilidad + histórico actividad (fase 2).

### 5.3 Pedidos disponibles (vitrina de demanda)
Sub-tab Disponibles dentro de Pedidos. Banner contextual + filtros (rubro / servicios / cantidad / plazo / solo marca verificada) + ordenamiento (default: más recientes) + cards de pedido con info de marca (Opción C híbrida).

### 5.4 Mi recorrido (formalización del taller)
**Privada**. Etapa actual con "X de 7 verificados" (acá SÍ porque es privado) + mapa de etapas (línea horizontal) + requisitos detallados + próximas etapas + cursos relacionados + soporte.

### 5.5 Inicio MARCA
Saludo + estado vivo (pedidos activos, cotizaciones pendientes) + acciones contextuales + actividad reciente + recomendaciones + atajos rápidos (Publicar pedido + Explorar talleres).

### 5.6 Explorar talleres
Cabecera + **3 filtros solamente** (Rubro / Servicios / Ubicación) + ordenamiento + cards de taller con etapa + ARCA + descripción corta + capacidades + badges + "Guardar/Favoritos".

### 5.7 Mi marca
Sin sub-estructura. Cabecera + banner "Esta es tu vidriera ante los talleres" + presentación + qué buscamos + trayectoria + formación + visibilidad de campos + contacto. Botón "Ver cómo me ven los talleres".

### 5.8 Cursos (TALLER y MARCA)
Cabecera con subtítulo por rol + mi recorrido formativo + cursos recomendados según situación + catálogo agrupado por categoría + trayectos completos + búsqueda (fase 2). Cada rol ve solo sus cursos.

### 5.9 Pedidos MARCA
Sub-tabs Mis publicados (default) / Cotizaciones recibidas / Históricos. Botón destacado [+ Publicar nuevo pedido]. Acciones: Aceptar / Rechazar / Pedir info adicional (máx 3 intercambios). Cierre automático al aceptar.

### 5.10 Dashboard COORD
Cabecera con pill rol POLÍTICO/OPERATIVO + estado del sector (común) + módulo POLÍTICO o OPERATIVO según tipo + atajos comunes.

### 5.11 Configuración de etapas (POLÍTICO)
Cabecera con historial + 3 etapas + detalle expandible + catálogo de documentos + vista previa de cambios + aplicación con justificación obligatoria + historial. **Workflow bilateral 2 de 3 sectores: post-piloto.**

### 5.12 Verificaciones / Talleres (OPERATIVO)
Mi agenda + cola de verificaciones + listado de talleres + atajos. Acciones: Aprobar (comentario opcional) / Rechazar (motivo obligatorio ≥50 caracteres con plantillas) / Pedir aclaración (1 intercambio). Auto-asignación + notificación automática al taller.

---

## 6. Las 3 dimensiones de la vidriera (decisión transversal)

Decisión clave del Nivel 4 que atraviesa todo el rol TALLER:

| Dimensión | Naturaleza | Qué hace el taller | Dónde vive en la app | Visibilidad |
|---|---|---|---|---|
| **Credenciales** | Lo regulatorio/legal | Verifica documentos | Mi recorrido (detalle) | En vidriera pública: **solo etapa + ARCA** (sin "X de 7") |
| **Formación** | Lo capacitativo | Aprende (cursos) | Cursos | Badges visibles por default, ocultables |
| **Descripción** | Lo identitario/funcional | Declara (perfil productivo) | Mi taller > Vidriera | Control por grupo del taller (Modelo B) |

**Principio fundamental**: cada dimensión tiene una lógica distinta. **No se mezclan ni se compensan**.

**Implicaciones**:
- Los cursos NO suman al cálculo de etapas (son otra naturaleza)
- "X de 7 verificados" queda **solo en Mi recorrido** (privado), NO en vidriera pública (ajuste al master 3.10)
- Los badges son positivos sin riesgo: el taller los gana, los muestra para destacarse
- La vidriera muestra **resultados agregados**, no procesos

---

## 7. Plan de implementación en 4 etapas

### Resumen ejecutivo

| Etapa | Cuándo | Esfuerzo | Estado |
|---|---|---|---|
| **Multi-rol U-03..U-08** | Ya | 23h | 🟢 En curso |
| **Etapa 1 — Narrativa visible** | En paralelo a Multi-rol | 14-16h | 🟠 Lista para arrancar |
| **Etapa 2 — Reestructuración** | Post Multi-rol | 20-26h | 🟡 Espera Multi-rol |
| **Etapa 3 — Gobernanza estructural** | Post Etapa 2 | 13-18h | 🟡 Espera Etapa 2 |
| **Etapa 4 — Post-piloto** | Después del piloto | — | 🔴 Decisión institucional |

**Total V4 adicional sobre Multi-rol**: ~47-60h

---

### 🟠 ETAPA 1 — En paralelo a Multi-rol (~14-16h)

Cambios narrativos de bajo riesgo, alto impacto visible. Pueden absorberse entre los pasos de Multi-rol.

#### 1.1 Renombres de tabs + reorden (3-4h)
- **TALLER**: `Inicio · Mi taller · Mi recorrido · Cursos · Pedidos`
- **MARCA**: `Inicio · Mi marca · Explorar talleres · Cursos · Pedidos`
- Pedidos al final (es el resultado del viaje, no protagonista)
- Unificar capitalización entre header y sidebar (sentence case)

#### 1.2 Quitar "X de 7 verificados" de la vidriera pública del taller (1h)
- Solo queda Etapa + ARCA visibles públicamente
- El detalle "X de 7" sigue en Mi recorrido (privado del taller)
- Es un ajuste al master 3.10 — protege al taller en la negociación con marcas

#### 1.3 Modelo B de visibilidad del perfil productivo (8-10h)
- Toggles por grupo del perfil productivo en Mi taller
- **SAM siempre privado, no editable** (protección del taller)
- ARCA siempre público, no editable
- Botón **"Ver cómo me ve el directorio"** en Mi taller (preview)
- Botón **"Ver cómo me ven los talleres"** en Mi marca

#### 1.4 Vitrina con info de marca en cada pedido (Opción C híbrida) (2-3h)
- En `/taller/pedidos/disponibles`, cada card de pedido muestra:
  - Nombre de la marca que publicó
  - Badge de verificación ARCA
  - Link a `/perfil-marca/[id]`
- Si la marca eligió no publicar algún dato, esos campos se ocultan

---

### 🟡 ETAPA 2 — Post Multi-rol (~20-26h)

Una vez terminado U-03..U-08 (Multi-rol).

#### 2.1 Sub-tabs Mi taller (6-8h)
- Tab "Mi taller" como paraguas con dos sub-tabs:
  - 🌐 Mi vidriera (público, lo que ven las marcas)
  - 🔒 Mi gestión productiva (privado-taller + COORD operativo)
- Cabecera común + toggle de sub-tabs
- Banner contextual en cada sub-tab

#### 2.2 3 dimensiones de la vidriera (4-6h)
- Reorganizar Mi vidriera en 3 bloques claros:
  - Credenciales (Etapa + ARCA)
  - Formación (badges de cursos)
  - Descripción (perfil productivo según Modelo B)

#### 2.3 3 umbrales escalonados del taller (6-8h)
Lógica de gating:
- **Umbral 1 (Registrado)**: solo email + CUIT pendiente. 60 días de gracia (master 3.11). Acceso a Academia + Recursos.
- **Umbral 2 (Visible en directorio)**: CUIT verificado + descripción + ubicación + 1 capacidad declarada + foto. Aparece en directorio con badge "Etapa inicial".
- **Umbral 3 (Apto para cotizar)**: etapa intermedia/consolidada + perfil productivo al 80%.

#### 2.4 Filtros del directorio reducidos a 3 (~1h)
- Solo: Rubro / Servicios / Ubicación
- Default forzado: solo talleres con ARCA verificado

#### 2.5 Renombre ESTADO → COORD (3-4h)
- Adelantamos G-16 del master (era deseable, ahora MVP)
- Es renombre temporal — el nombre institucional definitivo se decide post-piloto

---

### 🟡 ETAPA 3 — Gobernanza estructural sin tripartismo (~13-18h)

Sub-perfilamiento del rol COORD + academia para marcas.

#### 3.1 Sub-perfil POLÍTICO/OPERATIVO desde V4 (10-14h)
- Schema: campo `tipo` en rol COORD (POLITICO o OPERATIVO)
- Permisos diferenciados:
  - POLITICO: lee todo + configura políticas + reportes estratégicos. NO toca documentos individuales.
  - OPERATIVO: aprueba/rechaza documentos + observaciones de campo. NO toca configuración política.
- UI: dashboard común con módulos visibles según tipo
- Migración: usuarios actuales con rol ESTADO → asignar a OPERATIVO

🚫 **NO incluye** campo "sector" tripartito ni workflow bilateral (eso queda post-piloto).

#### 3.2 Plantillas de rechazo editables por POLÍTICO (3-4h)
- Catálogo de plantillas gestionable desde Configuración del POLÍTICO
- El OPERATIVO al rechazar puede usar plantilla o escribir libre

#### 3.3 Academia para marcas — versión funcional (6-8h)
- Habilitar tab Cursos para rol MARCA
- Lógica de linkeo curso ↔ requisito en ambas direcciones:
  - Desde un curso, ver qué requisitos avanza
  - Desde un requisito pendiente, ver qué cursos lo apoyan
- Los contenidos los carga Sergio progresivamente (no es catálogo seed — son cursos reales del equipo PDT)

---

### 🔴 ETAPA 4 — Post-piloto (espera institucional)

**NO TOCAR EN V4.** Registrado para que esté trazado.

#### 4.1 Tripartismo en COORD
- Campo "sector" (público / privado empresarial / sociedad civil)
- Requiere definición institucional de quiénes integran cada sector

#### 4.2 Workflow bilateral en configuración
- Consenso 2 de 3 sectores para cambios estructurales en etapas
- Bloqueado por 4.1

#### 4.3 Renombre COORD → GOBERNANZA (o como OIT decida)
- Cuando OIT confirme nombre institucional

#### 4.4 Modelo extendido PDT como gestión + cursos por bloque
- Validación OIT pendiente. Si lo aprueban, sumar al roadmap V5.

#### 4.5 Vista mapa del directorio (W-B7 master)
- Geocoding + biblioteca de mapas
- Deseable post-piloto

---

## 8. Decisiones que quedan abiertas

### Para Nivel 5 (copy, pendiente)
- Frases ancla del modelo
- Copy por rol (saludos, banners, descripciones, botones)
- Mensajes de estado (vacío/cargando/error/éxito)
- Notificaciones y emails (texto + asuntos)
- Lenguaje institucional (footer, leyendas, términos, privacidad)

### Para futuras conversaciones / decisiones institucionales
- ¿Cursos cuentan en el cálculo del recorrido? (Opciones A/B/C llevadas a OIT, decisión pendiente)
- ¿Adopción del modelo extendido (Self-management + cursos por bloque) confirmada por OIT?
- ¿Composición concreta de la entidad de gobernanza tripartita?
- ¿Renombre COORD → GOBERNANZA (o nombre que defina OIT)?
- ¿Quién carga el contenido de cursos en producción? (O-05)
- ¿Protocolo ético de observaciones de campo? (O-02)
- ¿Corpus real del asistente IA? (O-04)
- ¿Género como eje transversal? (O-06)
- ¿Denuncias en plataforma sí o no? (G-14)
- ¿Validación sectorial del perfil con talleres reales? (G-18)

---

## 9. Diferencias con el master V4

Ajustes que la narrativa hace respecto al master original.

📌 **Decisión clave**: V4 implementa la mayoría de cambios menos los que requieren validación institucional. Esos van a **Etapa 4 (post-piloto)**.

| # | Decisión narrativa | Sección master | Tipo de cambio | Etapa |
|---|---|---|---|---|
| 1 | Renombre `ESTADO` → `COORD` | G-16 "ESTADO → COORD (deseable)" | Adelantamos a MVP. | V4 (Etapa 2) |
| 2 | Sub-perfil COORD POLÍTICO/OPERATIVO desde V4 | No estaba explícito | Decisión nueva del equipo | V4 (Etapa 3) |
| 3 | Gobernanza tripartita público-privada-sociedad civil | No estaba explícito | Decisión nueva (sustentabilidad post-piloto) | **Post-piloto** |
| 4 | Vidriera pública del taller = solo Etapa + ARCA, sin "X de 7" | Master 3.10 dice "X de 7 + tooltip" | Ajuste: protección del taller en negociación | V4 (Etapa 1) |
| 5 | 3 dimensiones de la vidriera por naturaleza (Credenciales / Formación / Descripción) | No estaba explícito | Decisión nueva del equipo | V4 (Etapa 2) |
| 6 | Modelo extendido: PDT como herramienta de gestión (self-management) | No estaba explícito | Llevado a OIT, espera validación | **Post-piloto** |
| 7 | Cursos asociados a cada bloque del wizard productivo | Master 3.13 menciona INTI para SAM | Extensión del principio | **Post-piloto** |
| 8 | Renombres de tabs (Inicio, Mi taller, Mi recorrido, Mi marca, Cursos) | No estaba explícito | Decisión nueva | V4 (Etapa 1) |
| 9 | Tab "Mi taller" como paraguas con sub-tabs Vidriera + Gestión productiva | No estaba explícito | Decisión nueva | V4 (Etapa 2) |
| 10 | Sidebar visible permanente en desktop (F1) | No estaba explícito | Decisión UX | ✅ Hecho (PR #375) |
| 11 | Avatar header con dropdown estándar (F3 + ajustes) | No estaba explícito | Decisión UX | ✅ Hecho (PR #375) |
| 12 | Toggle multi-rol al lado del avatar con diferenciación visual | Master 3.3 menciona patrón Airbnb sin detalle | Especificación nueva | Multi-rol (U-04) |
| 13 | Control por grupo de visibilidad del perfil productivo (Modelo B) | No estaba explícito | Decisión nueva | V4 (Etapa 1) |
| 14 | SAM siempre privado (no editable a público) | No estaba explícito | Decisión nueva (protección del taller) | V4 (Etapa 1) |
| 15 | Botón "Ver cómo me ve el directorio" / "Ver cómo me ven los talleres" | No estaba explícito | Decisión nueva | V4 (Etapa 1) |
| 16 | 3 umbrales escalonados del taller (Registrado / Visible / Apto cotizar) | Master 3.11 menciona período de gracia | Extensión y formalización | V4 (Etapa 2) |
| 17 | Academia para marcas — tab Cursos + lógica de linkeo a requisitos | G-13 era "deseable 3h" | OIT lo subió a estructural. Contenidos los carga Sergio progresivamente. | V4 (Etapa 3) |
| 18 | Vitrina de demanda con Opción C híbrida (taller conoce a marca vía pedido) | No estaba explícito | Decisión nueva | V4 (Etapa 1) |
| 19 | Configuración de etapas con workflow bilateral (consenso 2 de 3 sectores) | No estaba explícito | Decisión nueva, espera tripartismo | **Post-piloto** |
| 20 | Cantidad de etapas fija en V4 (3, no editable) | No estaba explícito | Decisión nueva | V4 (Etapa 3 — implícito) |
| 21 | Pedidos como último tab del viaje (no segundo) | No estaba explícito | Decisión narrativa (resultado, no protagonista) | V4 (Etapa 1) |
| 22 | Plantillas de rechazo editables por POLÍTICO | No estaba explícito | Decisión nueva | V4 (Etapa 3) |
| 23 | Filtros del directorio reducidos a 3 (Rubro / Servicios / Ubicación) | No estaba explícito | Decisión nueva (simplificación) | V4 (Etapa 2) |
| 24 | Vista mapa: post-piloto (no V4) | W-B7 era deseable | Confirmado fuera de V4 | **Post-piloto** |

### Resumen de distribución

- **V4 (Etapas 1-3)**: 16 cambios → ~47-60h adicionales sobre Multi-rol
- **Post-piloto (Etapa 4)**: 6 cambios → espera decisión institucional
- **Hecho ya**: 2 cambios (sidebar visible + avatar dropdown, PR #375)

📌 La mayoría extiende el master sin contradecirlo. El único cambio que **ajusta una decisión explícita del master** es el #4 (vidriera pública sin "X de 7" — ajuste a master 3.10).

---

## 10. Cómo seguir

### Para Gera
1. **Empezá Etapa 1** en paralelo a Multi-rol cuando puedas. Los 4 cambios son independientes — podés tomarlos por separado.
2. Para cada sub-cambio puntual de las etapas, te paso spec dedicado cuando arranques.
3. Para Etapa 2 y 3, esperá a que cierren Multi-rol respectivamente las etapas anteriores.
4. Etapa 4 NO la implementes hasta que se destrabe institucionalmente.

### Para Sergio
1. Avanzar con **Nivel 5 (copy)** en sub-bloques: frases ancla, copy por rol, mensajes de estado, notificaciones, lenguaje institucional.
2. Generar contenidos reales para los cursos de la academia para marcas.
3. Validar con OIT cuando corresponda:
   - Renombre COORD → GOBERNANZA (post-piloto)
   - Modelo extendido (Self-management + cursos por bloque)
   - Composición tripartita
   - Decisiones del Bloque O pendientes

---

## 11. Referencias

- Capturas analizadas en `C:\Users\Sergio\Downloads\PDT - Plataforma Digital Textil (25_5_2026 *).html`
- Capturas analizadas en `C:\Users\Sergio\Downloads\PDT - Plataforma Digital Textil (26_5_2026 *).html`
- Master V4 v3 (PDF) — secciones citadas en cada decisión
- Documentos relacionados en esta carpeta:
  - `spec-1-PR358-X07c-fase2-estado-admin.md`
  - `spec-2-PR349-X06b-landing-assets.md`
  - `spec-3-navegacion-rol-taller.md`
  - `informe-consolidado-rol-taller-pre-demo.md`
  - `informe-navegacion-roles-taller-marca-pre-demo.md`
  - `referencia-cambios-V3-a-V4-reunion-OIT.md`
  - `speech-reunion-OIT-27may.md`
