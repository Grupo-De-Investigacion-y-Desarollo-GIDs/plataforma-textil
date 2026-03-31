# PANTALLAS DEL MVP - Plataforma Digital Textil OIT

> Diseño de todas las pantallas para el Escenario 1 (Piloto de Adopción)
> Basado en: PROPUESTA_OIT_REESTRUCTURADA.md + docs/02_FUNCIONES.md + docs/03_CASOS_USO.md

---

## INVENTARIO DE PANTALLAS

### Autenticación (5 pantallas)
| # | Pantalla | Ruta | Qué hace |
|---|----------|------|----------|
| 1 | Login | `/login` | Usuario ingresa con email/contraseña |
| 2 | Registro - Paso 1 | `/registro` | Datos básicos (email + contraseña) |
| 3 | Registro - Paso 2 | `/registro/cuit` | Verifica CUIT en ARCA |
| 4 | Registro - Paso 3 | `/registro/perfil` | Elige rol (Taller/Marca) + WhatsApp |
| 14 | Olvidé contraseña | `/olvide-contraseña` | Ingresa email → recibe link |
| 15 | Restablecer contraseña | `/restablecer/[token]` | Con token, crea nueva contraseña |

### Taller (5 pantallas)
| # | Pantalla | Ruta | Qué hace |
|---|----------|------|----------|
| 5 | Dashboard Taller | `/taller` | Progreso, acciones rápidas, cursos |
| 6 | Mi Perfil Taller | `/taller/perfil` | Edita procesos, prendas, capacidad |
| 7 | Mi Formalización | `/taller/formalizacion` | Checklist de validaciones |
| 8 | Academia - Colecciones | `/taller/aprender` | Catálogo de cursos |
| 9 | Academia - Detalle | `/taller/aprender/[id]` | Videos + evaluación |

### Marca (2 pantallas)
| # | Pantalla | Ruta | Qué hace |
|---|----------|------|----------|
| 10 | Directorio Talleres | `/marca/directorio` | Buscar talleres con filtros |
| 18 | Perfil Público Marca | `/marca/[id]` | Cómo lo ven los talleres |

### Estado (2 pantallas)
| # | Pantalla | Ruta | Qué hace |
|---|----------|------|----------|
| 12 | Dashboard Estado | `/estado` | Métricas, distribución niveles |
| 19 | Exportar Reporte | `/estado/exportar` | Genera PDF/Excel de métricas |

### Públicas (4 pantallas)
| # | Pantalla | Ruta | Qué hace |
|---|----------|------|----------|
| 11 | Perfil Público Taller | `/taller/[id]` | Cómo lo ven las marcas |
| 13 | Verificar Certificado | `/verificar/[codigo]` | Escanear QR → validar |
| 20 | FAQ / Ayuda | `/ayuda` | Preguntas frecuentes |
| 21 | Términos y Condiciones | `/terminos` | Legal |
| 22 | Política de Privacidad | `/privacidad` | Datos personales |

### Sistema (4 pantallas)
| # | Pantalla | Ruta | Qué hace |
|---|----------|------|----------|
| 16 | Mi Cuenta | `/cuenta` | Datos personales |
| 17 | Config Notificaciones | `/cuenta/notificaciones` | Qué recibir (email/WhatsApp) |
| 23 | Página 404 | `/404` | URL no existe |
| 24 | Error Genérico | `/error` | Algo falló |

### Onboarding (1 pantalla)
| # | Pantalla | Ruta | Qué hace |
|---|----------|------|----------|
| 25 | Tour Primer Uso | (modal/overlay) | Guía interactiva primera vez |

### Admin - Contenido (8 pantallas)
| # | Pantalla | Ruta | Qué hace |
|---|----------|------|----------|
| 26 | Admin Dashboard | `/admin` | Métricas generales |
| 27 | Admin Colecciones | `/admin/colecciones` | Lista de colecciones |
| 28 | Admin Crear/Editar Colección | `/admin/colecciones/[id]` | Datos de colección |
| 29 | Admin Agregar Video | `/admin/colecciones/[id]/videos` | Curar de YouTube |
| 30 | Admin Evaluaciones | `/admin/evaluaciones` | Quiz (+modal Pregunta) |
| 31 | Admin Certificados | `/admin/certificados` | Emitidos (+modal Preview) |
| 32 | Admin Usuarios | `/admin/usuarios` | Gestión usuarios |
| 33 | Admin FAQ | `/admin/faq` | Editar preguntas |

### Admin - Entidades (4 pantallas)
| # | Pantalla | Ruta | Qué hace |
|---|----------|------|----------|
| 34 | Admin Talleres | `/admin/talleres` | Listar, filtrar |
| 35 | Admin Marcas | `/admin/marcas` | Listar, aprobar |
| 36 | Admin Detalle Taller | `/admin/talleres/[id]` | Aprobar docs, notas |
| 37 | Admin Detalle Marca | `/admin/marcas/[id]` | Actividad, stats |

### Admin - Configuración (3 pantallas)
| # | Pantalla | Ruta | Qué hace |
|---|----------|------|----------|
| 38 | Admin Procesos Productivos | `/admin/procesos` | Tags del directorio |
| 39 | Admin Tipos Documento | `/admin/documentos` | Requisitos (+modal) |
| 40 | Admin Config General | `/admin/configuracion` | Parámetros sistema |

### Admin - Operaciones (4 pantallas)
| # | Pantalla | Ruta | Qué hace |
|---|----------|------|----------|
| 41 | Admin Pedidos | `/admin/pedidos` | Todos los pedidos |
| 42 | Admin Auditorías | `/admin/auditorias` | Programar (+modal) |
| 43 | Admin Reportes | `/admin/reportes` | Métricas, exportar |
| 44 | Admin Notificaciones | `/admin/notificaciones` | Envíos masivos |

### Admin - Seguridad (2 pantallas)
| # | Pantalla | Ruta | Qué hace |
|---|----------|------|----------|
| 45 | Admin Logs | `/admin/logs` | Auditoría acciones |
| 46 | Admin Roles y Permisos | `/admin/roles` | Accesos (+modal Usuario) |

### Admin - Sistema (4 pantallas)
| # | Pantalla | Ruta | Qué hace |
|---|----------|------|----------|
| 47 | Admin Base de Datos | `/admin/database` | Explorador tablas |
| 48 | Admin Integraciones | `/admin/integraciones` | Estado APIs (+modal Maps) |
| 49 | Admin Config ARCA | `/admin/integraciones/arca` | API AFIP |
| 50 | Admin Config LLM | `/admin/integraciones/llm` | IA/asistente |

### Admin - Integraciones Adicionales (2 pantallas)
| # | Pantalla | Ruta | Qué hace |
|---|----------|------|----------|
| 51 | Admin Config SendGrid | `/admin/integraciones/email` | Config email |
| 52 | Admin Config WhatsApp | `/admin/integraciones/whatsapp` | Config WhatsApp |

### Admin - Pantallas Adicionales (6 pantallas)
| # | Pantalla | Ruta | Qué hace |
|---|----------|------|----------|
| 53 | Admin Crear/Editar Rol | `/admin/roles/[id]` | Matriz permisos |
| 54 | Admin Cargar Informe Auditoría | `/admin/auditorias/[id]/informe` | Checklist, fotos |
| 55 | Admin Detalle Envío | `/admin/notificaciones/[id]` | Métricas email |
| 56 | Admin Ejecutar SQL | `/admin/database/query` | Editor consultas |
| 57 | Admin Gestión Backups | `/admin/database/backups` | Backup/restore |
| 58 | Admin Templates Email | `/admin/configuracion/emails` | Plantillas email |

### Wizard Perfil Productivo (12 pantallas)
| # | Pantalla | Ruta | Qué hace |
|---|----------|------|----------|
| 59 | Wizard Bienvenida | `/taller/perfil/wizard` | Intro pedagógica, beneficios |
| 60 | Wizard Maquinaria | `/taller/perfil/wizard/maquinaria` | Inventario máquinas |
| 61 | Wizard Equipo (Cantidad) | `/taller/perfil/wizard/equipo` | Cantidad y roles |
| 62 | Wizard Equipo (Experiencia) | `/taller/perfil/wizard/equipo/experiencia` | Años y especialización |
| 63 | Wizard Organización | `/taller/perfil/wizard/organizacion` | Tipo producción, división |
| 64 | Wizard Espacio Físico | `/taller/perfil/wizard/espacio` | Metros, áreas |
| 65 | Wizard SAM (Tiempos) | `/taller/perfil/wizard/sam` | Tiempo por prenda |
| 66 | Wizard SAM (Quiz) | `/taller/perfil/wizard/sam/quiz` | Pregunta pedagógica |
| 67 | Wizard Eficiencia | `/taller/perfil/wizard/eficiencia` | Ausentismo, rechazos |
| 68 | Wizard Resultado Capacidad | `/taller/perfil/wizard/resultado` | Cálculo automático |
| 69 | Wizard Gestión | `/taller/perfil/wizard/gestion` | Horarios, registros |
| 70 | Wizard Resumen y Score | `/taller/perfil/wizard/resumen` | Score final, badges |

**TOTAL: 70 pantallas + 6 modales documentados**

### Modales incluidos en wireframes:
- Config Google Maps (en pantalla 48 - Integraciones)
- Crear/Editar Usuario Admin (en pantalla 46 - Roles y Permisos)
- Programar Auditoría (en pantalla 42 - Auditorías)
- Vista Previa Certificado (en pantalla 31 - Certificados)
- Crear/Editar Pregunta (en pantalla 30 - Evaluaciones)
- Crear/Editar Tipo Documento (en pantalla 39 - Tipos Documento)

---

## DISEÑO POR PANTALLA

---

### 1. LOGIN

**Ruta:** `/login`
**Propósito:** Acceso de usuarios registrados

```
┌─────────────────────────────────────────────────────────────────┐
│                    [HEADER MÍNIMO]                               │
│                    Logo PDT + Título                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                    ┌────────────────────┐                       │
│                    │     LOGO PDT       │                       │
│                    │    (circular)      │                       │
│                    └────────────────────┘                       │
│                                                                  │
│                    Plataforma Digital                            │
│                        Textil                                    │
│                                                                  │
│                    ┌────────────────────┐                       │
│                    │ Email              │                       │
│                    └────────────────────┘                       │
│                    ┌────────────────────┐                       │
│                    │ Contraseña         │                       │
│                    └────────────────────┘                       │
│                                                                  │
│                    [    INGRESAR    ]  ← btn primario           │
│                                                                  │
│                    ¿Olvidaste tu contraseña?                     │
│                                                                  │
│                    ─────── o ───────                            │
│                                                                  │
│                    ¿No tenés cuenta?                            │
│                    [  REGISTRATE  ]  ← btn secundario           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Componentes:**
- Input Email (validación email)
- Input Password (toggle visibility)
- Button Primary "Ingresar"
- Link "¿Olvidaste tu contraseña?"
- Button Outline "Registrate"

---

### 2. REGISTRO - Paso 1: Datos Básicos

**Ruta:** `/registro`
**Propósito:** Crear cuenta con email y contraseña

```
┌─────────────────────────────────────────────────────────────────┐
│                    [HEADER MÍNIMO]                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│     Paso 1 de 3                                                 │
│     ● ○ ○                                                       │
│                                                                  │
│     Crear tu cuenta                                             │
│     Registrate en menos de 5 minutos                            │
│                                                                  │
│     ┌────────────────────────────────────────┐                  │
│     │ Email *                                │                  │
│     └────────────────────────────────────────┘                  │
│                                                                  │
│     ┌────────────────────────────────────────┐                  │
│     │ Contraseña *                           │ 👁               │
│     └────────────────────────────────────────┘                  │
│     Mínimo 8 caracteres                                         │
│                                                                  │
│     ┌────────────────────────────────────────┐                  │
│     │ Repetir contraseña *                   │ 👁               │
│     └────────────────────────────────────────┘                  │
│                                                                  │
│     [    CONTINUAR    ]                                         │
│                                                                  │
│     ¿Ya tenés cuenta? Iniciá sesión                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Validaciones:**
- Email formato válido
- Contraseña ≥8 caracteres
- Contraseñas coinciden

---

### 3. REGISTRO - Paso 2: Verificación CUIT

**Ruta:** `/registro/cuit`
**Propósito:** Verificar CUIT en AFIP y asignar nivel

```
┌─────────────────────────────────────────────────────────────────┐
│                    [HEADER MÍNIMO]                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│     Paso 2 de 3                                                 │
│     ● ● ○                                                       │
│                                                                  │
│     Verificá tu CUIT                                            │
│     Consultamos AFIP automáticamente                            │
│                                                                  │
│     ┌────────────────────────────────────────┐                  │
│     │ CUIT (sin guiones) *                   │                  │
│     │ 20-12345678-9                          │                  │
│     └────────────────────────────────────────┘                  │
│                                                                  │
│     [    VERIFICAR    ]                                         │
│                                                                  │
│     ─────────────────────────────────────────                   │
│                                                                  │
│     ┌─────────────────────────────────────────────────────────┐ │
│     │ ✅ CUIT VERIFICADO                                      │ │
│     │                                                         │ │
│     │ Razón Social: TALLER TEXTIL SRL                        │ │
│     │ Condición: MONOTRIBUTISTA                              │ │
│     │ Estado: ACTIVO                                         │ │
│     │                                                         │ │
│     │ Tu nivel inicial: 🥉 BRONCE                            │ │
│     │                                                         │ │
│     │ Para subir a PLATA necesitás:                          │ │
│     │ • Registrar empleados en AFIP                          │ │
│     │ • Completar capacitación básica                        │ │
│     └─────────────────────────────────────────────────────────┘ │
│                                                                  │
│     [    CONTINUAR    ]                                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Estados:**
- Input vacío
- Verificando (loading)
- Verificado OK (muestra datos)
- Error (CUIT inválido o no encontrado)

---

### 4. REGISTRO - Paso 3: Rol y WhatsApp

**Ruta:** `/registro/perfil`
**Propósito:** Elegir rol y confirmar contacto

```
┌─────────────────────────────────────────────────────────────────┐
│                    [HEADER MÍNIMO]                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│     Paso 3 de 3                                                 │
│     ● ● ●                                                       │
│                                                                  │
│     ¿Cómo vas a usar la plataforma?                            │
│                                                                  │
│     ┌───────────────────┐  ┌───────────────────┐               │
│     │                   │  │                   │               │
│     │   🏭 SOY TALLER   │  │   🏷️ SOY MARCA    │               │
│     │                   │  │                   │               │
│     │ Ofrezco servicios │  │ Busco proveedores │               │
│     │ de confección     │  │ de confección     │               │
│     │                   │  │                   │               │
│     └───────────────────┘  └───────────────────┘               │
│                                                                  │
│     ─────────────────────────────────────────                   │
│                                                                  │
│     Contacto por WhatsApp                                       │
│                                                                  │
│     ┌────────────────────────────────────────┐                  │
│     │ +54 9 11 │ Número de WhatsApp *        │                  │
│     └────────────────────────────────────────┘                  │
│     Te enviaremos notificaciones importantes                    │
│                                                                  │
│     ☑ Acepto los términos y condiciones                        │
│                                                                  │
│     [    CREAR CUENTA    ]                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 5. DASHBOARD TALLER

**Ruta:** `/taller`
**Propósito:** Vista principal del taller

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER COMPLETO - ver componente Header.tsx]                   │
│ Logo | Plataforma Digital Textil | TALLER: [NOMBRE]             │
├─────────────────────────────────────────────────────────────────┤
│ Tablero | Mi Perfil | Formalización | Aprender | Directorio    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Bienvenido, [Nombre]                                           │
│  Tu nivel actual: 🥉 BRONCE                                     │
│                                                                  │
│  ┌─────────────────────┐ ┌─────────────────────┐                │
│  │ PROGRESO DE         │ │ TU POSICIÓN         │                │
│  │ FORMALIZACIÓN       │ │                     │                │
│  │                     │ │      41%            │                │
│  │     [ProgressRing]  │ │  Tu progreso actual │                │
│  │        40%          │ │                     │                │
│  │                     │ │ Promedio talleres:  │                │
│  │  7/8  1/8  0/8      │ │ 78%                 │                │
│  │  ✓    ⏳   ○        │ │                     │                │
│  │                     │ │ [Ver detalle]       │                │
│  └─────────────────────┘ └─────────────────────┘                │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🚀 ¡Buen avance! Completá tu capacitación para              ││
│  │    subir a nivel PLATA y aparecer primero en búsquedas.     ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ACCIONES RÁPIDAS                                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │ 📝          │ │ 📚          │ │ 🔍          │               │
│  │ Completar   │ │ Ver cursos  │ │ Explorar    │               │
│  │ mi perfil   │ │ disponibles │ │ marcas      │               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
│                                                                  │
│  CAPACITACIONES RECOMENDADAS                                    │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 📖 Formalización básica     | 5 videos | 45 min | [Empezar]││
│  │ 💰 Cálculo de costos        | 4 videos | 35 min | [Empezar]││
│  │ ✅ Control de calidad       | 5 videos | 40 min | [Empezar]││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 6. MI PERFIL TALLER - Editar

**Ruta:** `/taller/perfil`
**Propósito:** Editar perfil productivo del taller

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER]                                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Mi Perfil Productivo                                           │
│  Esta información es visible para las marcas                    │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  DATOS BÁSICOS                                                  │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────┐                                        │
│  │ Foto/Logo           │  Nombre del taller *                   │
│  │ [Subir imagen]      │  ┌────────────────────────────┐        │
│  └─────────────────────┘  └────────────────────────────┘        │
│                                                                  │
│  CUIT                       Ubicación *                         │
│  20-12345678-9 ✅           ┌────────────────────────────┐      │
│  (verificado)               │ Florencio Varela, Buenos...│      │
│                             └────────────────────────────┘      │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  CAPACIDADES PRODUCTIVAS                                        │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ¿Qué procesos realizás? *                                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ ☑ Corte     │ │ ☑ Confección │ │ ☐ Lavandería │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ ☐ Estampado │ │ ☐ Bordado    │ │ ☑ Terminación│            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│                                                                  │
│  ¿Qué prendas hacés? *                                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ ☑ Remera    │ │ ☑ Jean       │ │ ☐ Camisa     │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ ☑ Pantalón  │ │ ☐ Campera    │ │ ☐ Ropa trabajo│           │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│                                                                  │
│  Capacidad mensual (prendas) *                                  │
│  ┌────────────────────────────┐                                 │
│  │ 500                        │                                 │
│  └────────────────────────────┘                                 │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  EQUIPAMIENTO (opcional)                                        │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  Maquinaria                                                     │
│  ┌──────────────────────────────────────────────────────────────┐
│  │ + Agregar máquina                                            │
│  │ • 3x Máquina recta industrial                                │
│  │ • 1x Overlock 5 hilos                                        │
│  │ • 1x Collareta                                               │
│  └──────────────────────────────────────────────────────────────┘
│                                                                  │
│  Trabajadores registrados                                       │
│  ┌────────────────────────────┐                                 │
│  │ 3                          │                                 │
│  └────────────────────────────┘                                 │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  DESCRIPCIÓN Y PORTFOLIO (opcional)                             │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  Descripción                                                    │
│  ┌──────────────────────────────────────────────────────────────┐
│  │ Contá sobre tu taller, experiencia, especialización...      │
│  │                                                              │
│  └──────────────────────────────────────────────────────────────┘
│                                                                  │
│  Fotos de trabajos                                              │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                   │
│  │ [img]  │ │ [img]  │ │ [img]  │ │ + Add  │                   │
│  └────────┘ └────────┘ └────────┘ └────────┘                   │
│                                                                  │
│  [    GUARDAR CAMBIOS    ]                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 7. MI FORMALIZACIÓN (Checklist)

**Ruta:** `/taller/formalizacion`
**Propósito:** Ver estado de formalización y qué falta

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER]                                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Tu Camino a la Formalización                                   │
│  Checklist de validaciones progresivas                          │
│                                                                  │
│  ┌────────────────────────────────────────────────────┐         │
│  │ ESTADO: EN PROCESO (40%)                           │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Progreso de Formalización                                   ││
│  │ NIVEL ACTUAL: 🥉 BRONCE                                     ││
│  │                                                              ││
│  │     [ProgressRing 40%]     7/8      1/8      0/8            ││
│  │                            COMPLETADAS PENDIENTES NO INIC.   ││
│  │                                                              ││
│  │ 🚀 ¡Excelente! Al superar el 80%, tu taller aparece         ││
│  │    primero en búsquedas de marcas premium.                  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ▼ Checklist de Validaciones                                    │
│    REVISIÓN DE CUMPLIMIENTO NORMATIVO                           │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ✅ CUIT válido                              COMPLETADO      ││
│  │    VERIFICADO CON ARCA - 30-12345678-9                      ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ✅ Habilitación municipal                   COMPLETADO [VER]││
│  │    CERTIFICADO SUBIDO - Vencimiento: 15/08/2026             ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ✅ Alta en ARCA (Registro Laboral)          COMPLETADO      ││
│  │    DOCUMENTACIÓN VALIDADA EXITOSAMENTE                      ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ✅ Certificado de bomberos                  COMPLETADO [VER]││
│  │    APROBADO POR CUERPO DE BOMBEROS LOCAL                    ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ✅ ART (Aseguradora de Riesgos)             COMPLETADO      ││
│  │    PÓLIZA ACTIVA Y AL DÍA                                   ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ✅ Libro de sueldos digital                 COMPLETADO [ABRIR]│
│  │    SISTEMA ACTIVO - ÚLTIMA ACTUALIZACIÓN: HOY               ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ⏳ Capacitación SST                         PENDIENTE       ││
│  │    0/3 cursos completados                   [EMPEZAR]       ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ⚠️ Certificación INTI (opcional)           OPCIONAL        ││
│  │    AUDITORÍA PRESENCIAL PROGRAMADA: 05/11/2025              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ASISTENCIA TÉCNICA                                          ││
│  │                                                              ││
│  │ INTI - Asesoramiento gratuito                               ││
│  │ Te ayudamos a completar la formalización paso a paso.       ││
│  │                                                              ││
│  │ [    📞 AGENDAR LLAMADA    ]                                 ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 8. ACADEMIA - Colecciones

**Ruta:** `/taller/aprender`
**Propósito:** Ver catálogo de cursos/colecciones

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER]                                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Academia                                                       │
│  Capacitaciones, certificaciones y asistente                    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🔍 Buscar cursos...                                         ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐         │
│  │ Todos        │ │ Formalización │ │ Gestión       │         │
│  └───────────────┘ └───────────────┘ └───────────────┘         │
│  ┌───────────────┐ ┌───────────────┐                           │
│  │ Calidad      │ │ Completados   │                           │
│  └───────────────┘ └───────────────┘                           │
│                                                                  │
│  TU PROGRESO                                                    │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 2/6 colecciones completadas  |  3 certificados obtenidos   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  COLECCIONES DISPONIBLES                                        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 📖 Formalización básica                                     ││
│  │                                                              ││
│  │ Aprendé los pasos básicos para formalizar tu taller:        ││
│  │ CUIT, ARCA, habilitaciones y certificaciones.               ││
│  │                                                              ││
│  │ 5 videos  |  45 min  |  🏛️ OIT + INTI                       ││
│  │                                                              ││
│  │ ████████████████░░░░  80% completado          [CONTINUAR]   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 💰 Costos y presupuestación                                 ││
│  │                                                              ││
│  │ Calculá correctamente tus costos, determiná precios         ││
│  │ competitivos y mejorá tu rentabilidad.                      ││
│  │                                                              ││
│  │ 4 videos  |  35 min  |  🏛️ FACTA                            ││
│  │                                                              ││
│  │ ░░░░░░░░░░░░░░░░░░░░  No iniciado             [EMPEZAR]    ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ✅ Control de calidad en confección                         ││
│  │                                                              ││
│  │ Técnicas de inspección, tolerancias, tablas de medidas      ││
│  │ y gestión de no conformidades.                              ││
│  │                                                              ││
│  │ 5 videos  |  40 min  |  🏛️ INTI                             ││
│  │                                                              ││
│  │ ████████████████████  ✓ COMPLETADO            [VER CERT]   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [Ver más colecciones...]                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 9. ACADEMIA - Detalle Colección

**Ruta:** `/taller/aprender/[id]`
**Propósito:** Ver videos de una colección y progreso

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER]                                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ← Volver a Academia                                            │
│                                                                  │
│  📖 Formalización básica                                        │
│  🏛️ Contenido curado por OIT + INTI                             │
│                                                                  │
│  ┌──────────────────────────────────┬───────────────────────────┐
│  │                                  │ TU PROGRESO               │
│  │   [VIDEO PLAYER EMBEBIDO]        │                           │
│  │                                  │ 4/5 videos vistos         │
│  │   YouTube iframe                 │ ████████████████░░░░ 80%  │
│  │                                  │                           │
│  │                                  │ Tiempo restante:          │
│  │                                  │ ~10 minutos               │
│  │                                  │                           │
│  └──────────────────────────────────┴───────────────────────────┘
│                                                                  │
│  CONTENIDO DE LA COLECCIÓN                                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ✅ 1. ¿Qué es la formalización?                   8:32     ││
│  │    Conceptos básicos y beneficios                           ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ✅ 2. CUIT y monotributo paso a paso             12:15     ││
│  │    Cómo inscribirte en ARCA                                 ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ✅ 3. Habilitación municipal                      9:45     ││
│  │    Requisitos y trámites                                    ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ✅ 4. ART y seguro de trabajo                     7:20     ││
│  │    Protegé a tu equipo                                      ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ▶️ 5. Certificaciones opcionales (INTI)          10:08     ││
│  │    Cómo destacarte con certificaciones            [VER]     ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  EVALUACIÓN FINAL                                               │
│  Completá el quiz para obtener tu certificado                   │
│                                                                  │
│  ⚠️ Debés ver todos los videos antes de rendir                  │
│                                                                  │
│  [    RENDIR EVALUACIÓN    ] (deshabilitado)                    │
│                                                                  │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🤖 ASISTENTE                                                ││
│  │                                                              ││
│  │ ¿Tenés dudas sobre el contenido?                            ││
│  │                                                              ││
│  │ ┌─────────────────────────────────────────────────────────┐ ││
│  │ │ Escribí tu pregunta...                                  │ ││
│  │ └─────────────────────────────────────────────────────────┘ ││
│  │                                                              ││
│  │ Preguntas frecuentes:                                       ││
│  │ • ¿Cuánto cuesta formalizarse?                              ││
│  │ • ¿Qué es ARCA?                                             ││
│  │ • ¿Cómo obtengo habilitación municipal?                     ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 10. DIRECTORIO - Buscar Talleres (Vista Marca)

**Ruta:** `/marca/directorio`
**Propósito:** Marca busca talleres por filtros

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER]                                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Explorar Talleres                                              │
│  Registro oficial de unidades productivas acreditadas           │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🔍 Buscar por nombre o ubicación...                         ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  FILTROS                                                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐│
│  │ Nivel ▼    │ │ Proceso ▼  │ │ Prenda ▼   │ │ Ubicación ▼││
│  │ 🥇 Oro     │ │ Confección │ │ Jean       │ │ AMBA       ││
│  │ 🥈 Plata   │ │ Corte      │ │ Remera     │ │ Interior   ││
│  │ 🥉 Bronce  │ │ Lavandería │ │ Pantalón   │ │            ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └────────────┘│
│                                                                  │
│  Mostrando 24 talleres                          [Limpiar filtros]│
│                                                                  │
│  ┌───────────────────────────────┐ ┌───────────────────────────┐│
│  │ 🏭 Corte Sur SRL              │ │ 🏭 Coop. Costura 8 Marzo  ││
│  │                               │ │                           ││
│  │ 📍 Avellaneda, AMBA           │ │ 📍 La Matanza, AMBA       ││
│  │ 🥇 ORO  ⭐ 4.9                │ │ 🥈 PLATA  ⭐ 4.6          ││
│  │                               │ │                           ││
│  │ Procesos: Corte, Confección   │ │ Procesos: Confección      ││
│  │ Prendas: Jean, Pantalón       │ │ Prendas: Remera, Camisa   ││
│  │ Capacidad: 1000 prendas/mes   │ │ Capacidad: 500 prendas/mes││
│  │                               │ │                           ││
│  │ [Ver perfil] [💬 Contactar]   │ │ [Ver perfil] [💬 Contactar]│
│  └───────────────────────────────┘ └───────────────────────────┘│
│                                                                  │
│  ┌───────────────────────────────┐ ┌───────────────────────────┐│
│  │ 🏭 Lavandería BlueDenim       │ │ 🏭 Taller La Aguja        ││
│  │                               │ │                           ││
│  │ 📍 San Martín, AMBA           │ │ 📍 Florencio Varela       ││
│  │ 🥇 ORO  ⭐ 4.8                │ │ 🥉 BRONCE  ⭐ 4.2         ││
│  │                               │ │                           ││
│  │ Procesos: Lavandería, Desgaste│ │ Procesos: Corte, Confección│
│  │ Prendas: Jean                 │ │ Prendas: Remera, Buzo     ││
│  │ Capacidad: 800 prendas/mes    │ │ Capacidad: 200 prendas/mes││
│  │                               │ │                           ││
│  │ [Ver perfil] [💬 Contactar]   │ │ [Ver perfil] [💬 Contactar]│
│  └───────────────────────────────┘ └───────────────────────────┘│
│                                                                  │
│  [Cargar más...]                                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 11. PERFIL PÚBLICO TALLER

**Ruta:** `/taller/[id]` o `/marca/directorio/[id]`
**Propósito:** Ver perfil completo de un taller

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER]                                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ← Volver al directorio                                         │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                           │  │
│  │  [FOTO/LOGO]   Corte Sur SRL                             │  │
│  │                                                           │  │
│  │                📍 Avellaneda, Buenos Aires                │  │
│  │                                                           │  │
│  │                🥇 NIVEL ORO    ⭐ 4.9 (47 valoraciones)   │  │
│  │                                                           │  │
│  │  [💬 Contactar por WhatsApp]  [⭐ Agregar a favoritos]   │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  CAPACIDADES PRODUCTIVAS                                        │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  Procesos que realiza:                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                        │
│  │ ✅ Corte │ │ ✅ Confec│ │ ✅ Termin│                        │
│  └──────────┘ └──────────┘ └──────────┘                        │
│                                                                  │
│  Tipos de prenda:                                               │
│  ┌──────────┐ ┌──────────┐                                     │
│  │ 👖 Jean  │ │ 👔 Pantal│                                     │
│  └──────────┘ └──────────┘                                     │
│                                                                  │
│  Capacidad mensual: 1,000 prendas                               │
│  Trabajadores: 5 registrados                                    │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  CERTIFICACIONES                                                │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌───────────────────────────────┐ ┌───────────────────────────┐│
│  │ 📜 Formalización básica      │ │ 📜 Control de calidad     ││
│  │    OIT + INTI                │ │    INTI                   ││
│  │    Emitido: 15/01/2026       │ │    Emitido: 20/12/2025    ││
│  │    [Verificar QR]            │ │    [Verificar QR]         ││
│  └───────────────────────────────┘ └───────────────────────────┘│
│                                                                  │
│  ─────────────────────────────────────────                      │
│  PORTFOLIO                                                      │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                   │
│  │ [img]  │ │ [img]  │ │ [img]  │ │ [img]  │                   │
│  └────────┘ └────────┘ └────────┘ └────────┘                   │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  SOBRE NOSOTROS                                                 │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  "Somos un taller familiar con 15 años de experiencia           │
│  especializado en jean y pantalones de alta calidad.            │
│  Trabajamos con marcas reconocidas y garantizamos               │
│  entrega en tiempo y forma."                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 12. DASHBOARD ESTADO

**Ruta:** `/estado`
**Propósito:** Panel de control para agentes del Estado

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER - Estado]                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Panel de Acompañamiento                                        │
│  Monitoreo del sector textil                                    │
│                                                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  │    24       │ │     8       │ │     18      │ │     45      │
│  │  Talleres   │ │   Marcas    │ │ Certificados│ │   Cursos    │
│  │ registrados │ │ registradas │ │  emitidos   │ │ completados │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
│                                                                  │
│  DISTRIBUCIÓN POR NIVEL                                         │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🥇 ORO (3)     ████████░░░░░░░░░░░░░░░░░░░░░░░░  12%       ││
│  │ 🥈 PLATA (6)   ████████████████░░░░░░░░░░░░░░░░  25%       ││
│  │ 🥉 BRONCE (15) ██████████████████████████████████████  63% ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌────────────────────────────────┬────────────────────────────┐│
│  │ TALLERES QUE NECESITAN        │ CURSOS MÁS COMPLETADOS     ││
│  │ ACOMPAÑAMIENTO                │                            ││
│  │                               │                            ││
│  │ 5 talleres no completaron     │ 1. Formalización básica    ││
│  │   el registro                 │    (15 talleres)           ││
│  │                               │                            ││
│  │ 3 talleres sin actividad      │ 2. Cálculo de costos       ││
│  │   en 30 días                  │    (12 talleres)           ││
│  │                               │                            ││
│  │ 2 talleres con certificados   │ 3. Control de calidad      ││
│  │   por vencer                  │    (8 talleres)            ││
│  │                               │                            ││
│  │ [Ver listado completo]        │                            ││
│  └────────────────────────────────┴────────────────────────────┘│
│                                                                  │
│  ALERTAS RECIENTES                                              │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ⚠️ 2 talleres con habilitación municipal por vencer        ││
│  │ ⚠️ 1 marca reportó problema con entrega                    ││
│  │ ℹ️ 3 nuevos talleres registrados esta semana               ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ACCIONES RÁPIDAS                                               │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │ 📋 Ver todos    │ │ 📊 Exportar     │ │ 📧 Enviar       │   │
│  │    los talleres │ │    reporte      │ │    recordatorios│   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 13. VERIFICAR CERTIFICADO (Pública)

**Ruta:** `/verificar/[codigo]`
**Propósito:** Verificar autenticidad de certificado

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER MÍNIMO - Logo]                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                    ┌────────────────────┐                       │
│                    │        ✅          │                       │
│                    │    CERTIFICADO     │                       │
│                    │      VÁLIDO        │                       │
│                    └────────────────────┘                       │
│                                                                  │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  DATOS DEL CERTIFICADO                                          │
│                                                                  │
│  Colección: Formalización básica                                │
│  Institución: OIT + INTI                                        │
│                                                                  │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  EMITIDO A                                                      │
│                                                                  │
│  Taller: Corte Sur SRL                                          │
│  CUIT: 30-12345678-9                                            │
│  Fecha: 15 de enero de 2026                                     │
│                                                                  │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  Código de verificación:                                        │
│  PDT-CERT-2026-001234                                           │
│                                                                  │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  [Ver perfil del taller en la plataforma]                       │
│                                                                  │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  Este certificado fue emitido por la Plataforma Digital         │
│  Textil, una iniciativa de OIT Argentina y UNTREF.              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

---

### 14. OLVIDÉ CONTRASEÑA

**Ruta:** `/olvide-contraseña`
**Propósito:** Solicitar recuperación de contraseña

```
┌─────────────────────────────────────────────────────────────────┐
│                    [HEADER MÍNIMO]                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                    ┌────────────────────┐                       │
│                    │     LOGO PDT       │                       │
│                    └────────────────────┘                       │
│                                                                  │
│                    Recuperar contraseña                          │
│                                                                  │
│     Ingresá tu email y te enviaremos un link para              │
│     restablecer tu contraseña.                                  │
│                                                                  │
│                    ┌────────────────────────────┐               │
│                    │ Email                      │               │
│                    └────────────────────────────┘               │
│                                                                  │
│                    [    ENVIAR LINK    ]                        │
│                                                                  │
│                    ← Volver a iniciar sesión                    │
│                                                                  │
│     ─────────────────────────────────────────                   │
│                                                                  │
│     ESTADO: EMAIL ENVIADO (después de enviar)                   │
│     ┌─────────────────────────────────────────────────────────┐ │
│     │ ✅ Te enviamos un email a j***@gmail.com                │ │
│     │                                                         │ │
│     │ Revisá tu bandeja de entrada (y spam).                  │ │
│     │ El link expira en 1 hora.                               │ │
│     │                                                         │ │
│     │ ¿No recibiste el email? [Reenviar]                      │ │
│     └─────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 15. RESTABLECER CONTRASEÑA

**Ruta:** `/restablecer/[token]`
**Propósito:** Crear nueva contraseña con token válido

```
┌─────────────────────────────────────────────────────────────────┐
│                    [HEADER MÍNIMO]                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                    ┌────────────────────┐                       │
│                    │     LOGO PDT       │                       │
│                    └────────────────────┘                       │
│                                                                  │
│                    Crear nueva contraseña                        │
│                                                                  │
│                    ┌────────────────────────────┐               │
│                    │ Nueva contraseña           │ 👁            │
│                    └────────────────────────────┘               │
│                    Mínimo 8 caracteres                          │
│                                                                  │
│                    ┌────────────────────────────┐               │
│                    │ Repetir contraseña         │ 👁            │
│                    └────────────────────────────┘               │
│                                                                  │
│                    [    GUARDAR CONTRASEÑA    ]                 │
│                                                                  │
│     ─────────────────────────────────────────                   │
│                                                                  │
│     ESTADO: TOKEN INVÁLIDO O EXPIRADO                           │
│     ┌─────────────────────────────────────────────────────────┐ │
│     │ ⚠️ Este link expiró o ya fue usado                      │ │
│     │                                                         │ │
│     │ [Solicitar nuevo link]                                  │ │
│     └─────────────────────────────────────────────────────────┘ │
│                                                                  │
│     ESTADO: CONTRASEÑA ACTUALIZADA                              │
│     ┌─────────────────────────────────────────────────────────┐ │
│     │ ✅ Tu contraseña fue actualizada                        │ │
│     │                                                         │ │
│     │ [Iniciar sesión]                                        │ │
│     └─────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 16. MI CUENTA

**Ruta:** `/cuenta`
**Propósito:** Editar datos personales del usuario

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER]                                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Mi Cuenta                                                      │
│  Configuración de tu usuario                                    │
│                                                                  │
│  ┌───────────────────┐ ┌───────────────────┐                   │
│  │ 👤 Datos personales│ │ 🔔 Notificaciones │                   │
│  │    (activo)       │ │                   │                   │
│  └───────────────────┘ └───────────────────┘                   │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  DATOS PERSONALES                                               │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────┐                                        │
│  │ Foto de perfil      │  Nombre *                              │
│  │ [Cambiar]           │  ┌────────────────────────────┐        │
│  └─────────────────────┘  │ Juan Pérez                 │        │
│                           └────────────────────────────┘        │
│                                                                  │
│  Email                                                          │
│  ┌────────────────────────────────────────┐                     │
│  │ juan.perez@gmail.com                   │                     │
│  └────────────────────────────────────────┘                     │
│  ⚠️ Si cambiás el email, tendrás que verificarlo                │
│                                                                  │
│  Teléfono WhatsApp                                              │
│  ┌────────────────────────────────────────┐                     │
│  │ +54 9 11 1234-5678                     │                     │
│  └────────────────────────────────────────┘                     │
│                                                                  │
│  [    GUARDAR CAMBIOS    ]                                      │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  SEGURIDAD                                                      │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  Contraseña                                                     │
│  Última actualización: hace 3 meses                             │
│  [Cambiar contraseña]                                           │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  ZONA DE PELIGRO                                                │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  [🗑️ Eliminar mi cuenta]  ← texto rojo, requiere confirmación   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 17. CONFIGURACIÓN - NOTIFICACIONES

**Ruta:** `/cuenta/notificaciones`
**Propósito:** Elegir qué notificaciones recibir y por qué canal

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER]                                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Mi Cuenta                                                      │
│  Configuración de tu usuario                                    │
│                                                                  │
│  ┌───────────────────┐ ┌───────────────────┐                   │
│  │ 👤 Datos personales│ │ 🔔 Notificaciones │                   │
│  │                   │ │    (activo)       │                   │
│  └───────────────────┘ └───────────────────┘                   │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  CANALES DE NOTIFICACIÓN                                        │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ☑ Recibir notificaciones por Email                         ││
│  │   juan.perez@gmail.com                                      ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ☑ Recibir notificaciones por WhatsApp                      ││
│  │   +54 9 11 1234-5678                                        ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ─────────────────────────────────────────                      │
│  ¿QUÉ QUERÉS RECIBIR?                                           │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  Actividad en la plataforma                                     │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ☑ Nuevas marcas me agregan a favoritos                     ││
│  │ ☑ Nuevas marcas se registran en mi zona                    ││
│  │ ☑ Mi perfil fue visitado                                   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Capacitación                                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ☑ Nuevos cursos disponibles                                ││
│  │ ☑ Recordatorio de cursos sin terminar                      ││
│  │ ☑ Certificado emitido                                      ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Formalización                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ☑ Documentos por vencer                                    ││
│  │ ☑ Cambio de nivel (Bronce → Plata → Oro)                   ││
│  │ ☐ Novedades del sector (newsletter mensual)                ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [    GUARDAR PREFERENCIAS    ]                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 18. PERFIL PÚBLICO MARCA

**Ruta:** `/marca/[id]`
**Propósito:** Talleres ven información de una marca

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER]                                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ← Volver al directorio                                         │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                           │  │
│  │  [LOGO]    Comercial Textil SRL                          │  │
│  │                                                           │  │
│  │            📍 Capital Federal, Buenos Aires               │  │
│  │            🏢 Empresa verificada                          │  │
│  │                                                           │  │
│  │  [💬 Contactar por WhatsApp]                             │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  SOBRE LA EMPRESA                                               │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  "Somos una marca de ropa de trabajo con 20 años en el          │
│  mercado. Buscamos proveedores confiables y formalizados        │
│  para relaciones comerciales de largo plazo."                   │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  QUÉ TERCERIZA                                                  │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  Prendas:                                                       │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ Pantalón     │ │ Camisa       │ │ Ropa trabajo │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│                                                                  │
│  Procesos que necesita:                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ Corte        │ │ Confección   │ │ Terminación  │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│                                                                  │
│  Volumen típico: 500-1000 prendas/mes                           │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  QUÉ BUSCA EN UN PROVEEDOR                                      │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  • Nivel mínimo: 🥈 PLATA                                       │
│  • Ubicación preferida: AMBA                                    │
│  • Con ART y empleados registrados                              │
│  • Experiencia en ropa de trabajo                               │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  INFORMACIÓN DE CONTACTO                                        │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  🌐 www.comercialtextil.com.ar                                  │
│  📍 Av. Corrientes 1234, CABA                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 19. EXPORTAR REPORTE (Estado)

**Ruta:** `/estado/exportar`
**Propósito:** Generar reportes PDF/Excel de métricas

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER - Estado]                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Exportar Reporte                                               │
│  Generá informes del estado del sector                          │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  TIPO DE REPORTE                                                │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ○ Resumen ejecutivo                                        ││
│  │   Métricas principales, distribución por nivel             ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ● Listado completo de talleres                             ││
│  │   Todos los talleres con datos de contacto y nivel         ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ○ Talleres que necesitan acompañamiento                    ││
│  │   Registros incompletos, sin actividad, docs por vencer    ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ○ Reporte de capacitaciones                                ││
│  │   Cursos completados, certificados emitidos                ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ─────────────────────────────────────────                      │
│  FILTROS                                                        │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  Período                                                        │
│  ┌───────────────────┐  ┌───────────────────┐                  │
│  │ Desde: 01/01/2026 │  │ Hasta: 04/02/2026 │                  │
│  └───────────────────┘  └───────────────────┘                  │
│                                                                  │
│  Nivel                         Ubicación                        │
│  ┌───────────────────┐        ┌───────────────────┐            │
│  │ Todos          ▼ │        │ Todas          ▼ │            │
│  └───────────────────┘        └───────────────────┘            │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  FORMATO                                                        │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌───────────────────┐  ┌───────────────────┐                  │
│  │ 📄 PDF           │  │ 📊 Excel          │                  │
│  │    (seleccionado)│  │                   │                  │
│  └───────────────────┘  └───────────────────┘                  │
│                                                                  │
│  [    GENERAR REPORTE    ]                                      │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  REPORTES RECIENTES                                             │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 📄 Resumen ejecutivo - Enero 2026          [Descargar]     ││
│  │    Generado: 01/02/2026                                     ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 📊 Listado talleres - Diciembre 2025       [Descargar]     ││
│  │    Generado: 15/01/2026                                     ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 20. FAQ / AYUDA

**Ruta:** `/ayuda`
**Propósito:** Preguntas frecuentes y contacto de soporte

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER]                                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Centro de Ayuda                                                │
│  Encontrá respuestas a las preguntas más frecuentes             │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🔍 Buscar en preguntas frecuentes...                        ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐         │
│  │ Todas        │ │ Registro      │ │ Formalización │         │
│  └───────────────┘ └───────────────┘ └───────────────┘         │
│  ┌───────────────┐ ┌───────────────┐                           │
│  │ Capacitación │ │ Técnico       │                           │
│  └───────────────┘ └───────────────┘                           │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  PREGUNTAS FRECUENTES                                           │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ▼ ¿Cómo me registro en la plataforma?                         │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Para registrarte necesitás:                                 ││
│  │ 1. Un email válido                                          ││
│  │ 2. Tu CUIT (lo verificamos automáticamente con AFIP)        ││
│  │ 3. Un número de WhatsApp para notificaciones                ││
│  │                                                              ││
│  │ El proceso toma menos de 5 minutos.                         ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ▶ ¿Qué significan los niveles Bronce, Plata y Oro?            │
│                                                                  │
│  ▶ ¿Cómo subo de nivel?                                        │
│                                                                  │
│  ▶ ¿Los certificados tienen validez oficial?                   │
│                                                                  │
│  ▶ ¿Cómo contacto a una marca/taller?                          │
│                                                                  │
│  ▶ ¿Mis datos son privados?                                    │
│                                                                  │
│  ▶ ¿Cómo elimino mi cuenta?                                    │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  ¿NO ENCONTRÁS LO QUE BUSCÁS?                                   │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 📧 Escribinos                                               ││
│  │    soporte@plataformatextil.ar                              ││
│  │                                                              ││
│  │ 💬 WhatsApp                                                 ││
│  │    +54 11 1234-5678 (Lun-Vie 9-18hs)                        ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 21. TÉRMINOS Y CONDICIONES

**Ruta:** `/terminos`
**Propósito:** Documento legal de términos de uso

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER MÍNIMO]                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Términos y Condiciones                                         │
│  Última actualización: 1 de febrero de 2026                     │
│                                                                  │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  1. INTRODUCCIÓN                                                │
│                                                                  │
│  Estos Términos y Condiciones regulan el uso de la              │
│  Plataforma Digital Textil ("la Plataforma"), operada           │
│  por UNTREF en el marco de un proyecto con OIT Argentina.       │
│                                                                  │
│  Al registrarte, aceptás estos términos en su totalidad.        │
│                                                                  │
│  2. DEFINICIONES                                                │
│                                                                  │
│  • "Taller": Unidad productiva que ofrece servicios de          │
│    confección textil.                                           │
│  • "Marca": Empresa que terceriza producción textil.            │
│  • "Usuario": Toda persona registrada en la Plataforma.         │
│                                                                  │
│  3. REGISTRO Y CUENTA                                           │
│                                                                  │
│  [...]                                                          │
│                                                                  │
│  4. USO DE LA PLATAFORMA                                        │
│                                                                  │
│  [...]                                                          │
│                                                                  │
│  5. VERIFICACIÓN DE DATOS                                       │
│                                                                  │
│  [...]                                                          │
│                                                                  │
│  [Contenido legal completo...]                                  │
│                                                                  │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ¿Tenés dudas sobre estos términos?                             │
│  Escribinos a legal@plataformatextil.ar                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 22. POLÍTICA DE PRIVACIDAD

**Ruta:** `/privacidad`
**Propósito:** Documento de protección de datos personales

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER MÍNIMO]                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Política de Privacidad                                         │
│  Última actualización: 1 de febrero de 2026                     │
│                                                                  │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  1. RESPONSABLE DEL TRATAMIENTO                                 │
│                                                                  │
│  Universidad Nacional de Tres de Febrero (UNTREF)               │
│  Dirección: [...]                                               │
│  Email: privacidad@plataformatextil.ar                          │
│                                                                  │
│  2. DATOS QUE RECOLECTAMOS                                      │
│                                                                  │
│  • Datos de registro: email, CUIT, teléfono                     │
│  • Datos de perfil: nombre, ubicación, capacidades              │
│  • Datos de uso: páginas visitadas, cursos completados          │
│                                                                  │
│  3. CÓMO USAMOS TUS DATOS                                       │
│                                                                  │
│  [...]                                                          │
│                                                                  │
│  4. CON QUIÉN COMPARTIMOS                                       │
│                                                                  │
│  [...]                                                          │
│                                                                  │
│  5. TUS DERECHOS                                                │
│                                                                  │
│  Según la Ley 25.326, podés:                                    │
│  • Acceder a tus datos                                          │
│  • Rectificar información incorrecta                            │
│  • Solicitar la eliminación de tus datos                        │
│                                                                  │
│  [Contenido legal completo...]                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 23. PÁGINA 404

**Ruta:** `/404`
**Propósito:** URL no encontrada

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER]                                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                                                                  │
│                                                                  │
│                         🔍                                       │
│                                                                  │
│                    Página no encontrada                          │
│                                                                  │
│     La página que buscás no existe o fue movida.                │
│                                                                  │
│                                                                  │
│     ┌─────────────────┐  ┌─────────────────┐                   │
│     │ ← Volver atrás │  │ Ir al inicio    │                   │
│     └─────────────────┘  └─────────────────┘                   │
│                                                                  │
│                                                                  │
│     ¿Necesitás ayuda? [Contactar soporte]                       │
│                                                                  │
│                                                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 24. ERROR GENÉRICO

**Ruta:** `/error`
**Propósito:** Algo falló en el sistema

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER]                                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                                                                  │
│                                                                  │
│                         ⚠️                                       │
│                                                                  │
│                    Algo salió mal                                │
│                                                                  │
│     Ocurrió un error inesperado. Ya estamos trabajando          │
│     para solucionarlo.                                          │
│                                                                  │
│                                                                  │
│     ┌─────────────────┐  ┌─────────────────┐                   │
│     │ Reintentar     │  │ Ir al inicio    │                   │
│     └─────────────────┘  └─────────────────┘                   │
│                                                                  │
│                                                                  │
│     Si el problema persiste, contactanos:                       │
│     soporte@plataformatextil.ar                                 │
│                                                                  │
│     Código de error: ERR-2026020412345                          │
│                                                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 25. TOUR PRIMER USO (Onboarding)

**Tipo:** Modal/Overlay (no es página completa)
**Propósito:** Guiar al usuario en su primer ingreso

```
┌─────────────────────────────────────────────────────────────────┐
│ [PÁGINA DE FONDO - Dashboard con overlay oscuro]                │
│                                                                  │
│    ┌───────────────────────────────────────────────────────┐    │
│    │                                                       │    │
│    │  👋 ¡Bienvenido a la Plataforma Digital Textil!      │    │
│    │                                                       │    │
│    │  Te vamos a mostrar cómo funciona en 4 pasos.        │    │
│    │                                                       │    │
│    │  ● ○ ○ ○                                             │    │
│    │                                                       │    │
│    │  [    EMPEZAR TOUR    ]     [Saltar]                 │    │
│    │                                                       │    │
│    └───────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

PASO 1: Apunta al sidebar/menú
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ┌───────┐                                                      │
│  │ MENÚ  │ ←────┐                                               │
│  │       │      │                                               │
│  └───────┘   ┌──┴─────────────────────────────────────┐         │
│              │ 📍 Desde acá navegás todas las         │         │
│              │    secciones de la plataforma.         │         │
│              │                                        │         │
│              │    ○ ● ○ ○         [Siguiente →]       │         │
│              └────────────────────────────────────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

PASO 2: Apunta a Formalización
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│              ┌────────────────────────────────────────┐         │
│              │ 📍 Acá ves tu progreso de              │         │
│              │    formalización y qué te falta.       │         │
│              │                                        │         │
│              │    ○ ○ ● ○         [Siguiente →]       │         │
│              └──┬─────────────────────────────────────┘         │
│  ┌──────────────┴──┐                                            │
│  │ FORMALIZACIÓN   │                                            │
│  │ 40% completado  │                                            │
│  └─────────────────┘                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

PASO 3: Apunta a Academia
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ┌─────────────────┐                                            │
│  │ ACADEMIA        │ ←────┐                                     │
│  │ 📚 Cursos       │      │                                     │
│  └─────────────────┘   ┌──┴─────────────────────────────────┐   │
│                        │ 📍 Capacitate con videos curados   │   │
│                        │    y obtené certificados.          │   │
│                        │                                    │   │
│                        │    ○ ○ ○ ●       [Terminar →]      │   │
│                        └────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

FINAL:
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│    ┌───────────────────────────────────────────────────────┐    │
│    │                                                       │    │
│    │  🎉 ¡Listo! Ya podés empezar                         │    │
│    │                                                       │    │
│    │  Te recomendamos:                                    │    │
│    │  1. Completar tu perfil                              │    │
│    │  2. Revisar tu estado de formalización               │    │
│    │  3. Explorar los cursos disponibles                  │    │
│    │                                                       │    │
│    │  [    IR AL DASHBOARD    ]                           │    │
│    │                                                       │    │
│    │  ☐ No volver a mostrar este tour                     │    │
│    │                                                       │    │
│    └───────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 26. ADMIN - DASHBOARD

**Ruta:** `/admin`
**Propósito:** Vista general del backoffice

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER ADMIN]                                                   │
│ Logo | Administración PDT                     [Usuario] [Salir] │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Panel de Administración                                        │
│                                                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  │    24       │ │      8      │ │      6      │ │     45      │
│  │  Talleres   │ │   Marcas    │ │ Colecciones │ │ Certificados│
│  │ registrados │ │ registradas │ │   activas   │ │  emitidos   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
│                                                                  │
│  ACCESOS RÁPIDOS                                                │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │ 📚 Gestionar    │ │ 👥 Ver usuarios │ │ 📜 Certificados │   │
│  │    colecciones  │ │                 │ │                 │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
│                                                                  │
│  ACTIVIDAD RECIENTE                                             │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ • Nuevo taller registrado: "Confecciones López"    hace 2h ││
│  │ • Certificado emitido a "Taller La Aguja"          hace 4h ││
│  │ • Nueva marca registrada: "Moda Express SRL"       hace 1d ││
│  │ • Video agregado a colección "Formalización"       hace 2d ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  MENÚ LATERAL                                                   │
│  ├── Dashboard                                                  │
│  ├── Colecciones (cursos)                                       │
│  ├── Evaluaciones                                               │
│  ├── Certificados                                               │
│  ├── Usuarios                                                   │
│  ├── FAQ                                                        │
│  └── Configuración                                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 27. ADMIN - COLECCIONES

**Ruta:** `/admin/colecciones`
**Propósito:** Listar y gestionar colecciones de cursos

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER ADMIN]                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Colecciones de Cursos                                          │
│  Gestioná las colecciones de videos curados                     │
│                                                                  │
│  [+ NUEVA COLECCIÓN]                                            │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🔍 Buscar colección...                                      ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 📖 Formalización básica                                     ││
│  │    OIT + INTI | 5 videos | 45 min                           ││
│  │    Estado: ✅ Publicada                                     ││
│  │    Completada por: 15 talleres                              ││
│  │                                                              ││
│  │    [Editar] [Ver videos] [Despublicar]                      ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 💰 Costos y presupuestación                                 ││
│  │    FACTA | 4 videos | 35 min                                ││
│  │    Estado: ✅ Publicada                                     ││
│  │    Completada por: 12 talleres                              ││
│  │                                                              ││
│  │    [Editar] [Ver videos] [Despublicar]                      ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ✅ Control de calidad                                       ││
│  │    INTI | 5 videos | 40 min                                 ││
│  │    Estado: ✅ Publicada                                     ││
│  │    Completada por: 8 talleres                               ││
│  │                                                              ││
│  │    [Editar] [Ver videos] [Despublicar]                      ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 🏭 Uso de la plataforma                                     ││
│  │    PDT | 3 videos | 15 min                                  ││
│  │    Estado: 🟡 Borrador                                      ││
│  │    Completada por: -                                        ││
│  │                                                              ││
│  │    [Editar] [Ver videos] [Publicar]                         ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 28. ADMIN - CREAR/EDITAR COLECCIÓN

**Ruta:** `/admin/colecciones/[id]`
**Propósito:** Crear nueva colección o editar existente

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER ADMIN]                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ← Volver a colecciones                                         │
│                                                                  │
│  Editar Colección                                               │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  INFORMACIÓN BÁSICA                                             │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  Nombre de la colección *                                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Formalización básica                                       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Descripción *                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Aprendé los pasos básicos para formalizar tu taller:       │ │
│  │ CUIT, ARCA, habilitaciones y certificaciones.              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Institución que avala *                                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ OIT + INTI                                              ▼ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Categoría *                                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Formalización                                           ▼ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  VIDEOS DE LA COLECCIÓN                                         │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  [+ AGREGAR VIDEO]                                              │
│                                                                  │
│  Arrastrá para reordenar:                                       │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ≡ 1. ¿Qué es la formalización?              8:32   [🗑️]   ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ≡ 2. CUIT y monotributo paso a paso        12:15   [🗑️]   ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ≡ 3. Habilitación municipal                 9:45   [🗑️]   ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ≡ 4. ART y seguro de trabajo                7:20   [🗑️]   ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ≡ 5. Certificaciones opcionales            10:08   [🗑️]   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Duración total: 47 minutos                                     │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  EVALUACIÓN                                                     │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ☑ Requiere evaluación para obtener certificado                │
│                                                                  │
│  [Editar evaluación →]                                          │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  ESTADO                                                         │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ○ Borrador (no visible para usuarios)                         │
│  ● Publicada (visible para usuarios)                           │
│                                                                  │
│  [    GUARDAR CAMBIOS    ]                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 29. ADMIN - AGREGAR VIDEO

**Ruta:** `/admin/colecciones/[id]/videos`
**Propósito:** Curar un video de YouTube y agregarlo a la colección

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER ADMIN]                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ← Volver a colección                                           │
│                                                                  │
│  Agregar Video a "Formalización básica"                         │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  PASO 1: PEGAR URL DE YOUTUBE                                   │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  URL del video *                                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ https://www.youtube.com/watch?v=abc123xyz                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  [CARGAR VIDEO]                                                 │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  PASO 2: VERIFICAR INFORMACIÓN                                  │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌──────────────────────┬──────────────────────────────────────┐│
│  │                      │                                      ││
│  │  [THUMBNAIL VIDEO]   │  Título (del video):                 ││
│  │                      │  "Cómo inscribirte en monotributo"   ││
│  │                      │                                      ││
│  │                      │  Canal: ContadorOnline               ││
│  │                      │  Duración: 12:15                     ││
│  │                      │  Vistas: 125,432                     ││
│  │                      │                                      ││
│  └──────────────────────┴──────────────────────────────────────┘│
│                                                                  │
│  ─────────────────────────────────────────                      │
│  PASO 3: PERSONALIZAR PARA LA PLATAFORMA                        │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  Título en la plataforma *                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ CUIT y monotributo paso a paso                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│  (Podés cambiar el título para que sea más claro)              │
│                                                                  │
│  Descripción corta *                                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Cómo inscribirte en ARCA (ex-AFIP) como monotributista.    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Posición en la colección                                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 2 (después de "¿Qué es la formalización?")              ▼ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  VERIFICACIÓN DE CONTENIDO                                      │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ☑ Verifiqué que el contenido es preciso y actualizado         │
│  ☑ El audio es claro y comprensible                            │
│  ☑ No contiene publicidad invasiva                             │
│                                                                  │
│  [    AGREGAR A LA COLECCIÓN    ]                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 30. ADMIN - EVALUACIONES

**Ruta:** `/admin/evaluaciones`
**Propósito:** Crear y editar quiz de evaluación para colecciones

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER ADMIN]                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Evaluaciones                                                   │
│  Gestioná los quiz de cada colección                            │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Colección: Formalización básica                          ▼ ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ─────────────────────────────────────────                      │
│  CONFIGURACIÓN                                                  │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  Puntaje mínimo para aprobar: 70%                              │
│  Intentos permitidos: 3                                         │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  PREGUNTAS (5)                                                  │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  [+ AGREGAR PREGUNTA]                                           │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 1. ¿Qué significa CUIT?                            [Editar]││
│  │    ○ Código Universal de Identificación Tributaria          ││
│  │    ● Clave Única de Identificación Tributaria ✓            ││
│  │    ○ Código Único de Impuestos y Tributos                   ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 2. ¿Cuál es el primer paso para formalizarse?      [Editar]││
│  │    ● Inscribirse en ARCA (ex-AFIP) ✓                       ││
│  │    ○ Conseguir habilitación municipal                       ││
│  │    ○ Contratar ART                                          ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 3. ¿Qué documento necesitás para la habilitación   [Editar]││
│  │    municipal?                                               ││
│  │    ○ Solo el CUIT                                           ││
│  │    ○ Contrato de alquiler únicamente                        ││
│  │    ● Planos aprobados y certificado de bomberos ✓          ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 4. ¿Qué es la ART?                                 [Editar]││
│  │    [...]                                                    ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 5. ¿Cuál es un beneficio de la formalización?      [Editar]││
│  │    [...]                                                    ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [    GUARDAR EVALUACIÓN    ]                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

─────────────────────────────────────────
MODAL: CREAR/EDITAR PREGUNTA (al presionar + AGREGAR o Editar)
─────────────────────────────────────────

┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Editar Pregunta                                                │
│                                                                  │
│  Pregunta *                                                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ¿Qué significa CUIT?                                       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Opciones de respuesta (mínimo 2, máximo 4)                     │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ○ Código Universal de Identificación Tributaria           │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ● Clave Única de Identificación Tributaria    ← Correcta  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ○ Código Único de Impuestos y Tributos                    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  [+ Agregar opción]                                             │
│                                                                  │
│  Explicación (se muestra al responder incorrectamente)         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ CUIT significa "Clave Única de Identificación Tributaria" │ │
│  │ y es el número que identifica a personas y empresas ante  │ │
│  │ ARCA (ex-AFIP).                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  [🗑️ Eliminar pregunta]                                         │
│                                                                  │
│  [Cancelar]                         [    GUARDAR    ]           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 31. ADMIN - CERTIFICADOS

**Ruta:** `/admin/certificados`
**Propósito:** Ver certificados emitidos y revocar si es necesario

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER ADMIN]                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Certificados Emitidos                                          │
│  Control de certificados de la plataforma                       │
│                                                                  │
│  ┌───────────────────┐  ┌───────────────────┐                  │
│  │ Total: 45         │  │ Este mes: 8       │                  │
│  └───────────────────┘  └───────────────────┘                  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🔍 Buscar por taller o código...                            ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Filtrar por colección:  [Todas ▼]                              │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Código           │ Taller           │ Colección    │ Fecha  ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ PDT-CERT-001234  │ Corte Sur SRL    │ Formalización│ 04/02  ││
│  │ Estado: ✅ Válido                              [Ver] [🗑️]  ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ PDT-CERT-001233  │ Taller La Aguja  │ Calidad      │ 03/02  ││
│  │ Estado: ✅ Válido                              [Ver] [🗑️]  ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ PDT-CERT-001230  │ Coop. 8 de Marzo │ Costos       │ 01/02  ││
│  │ Estado: ❌ Revocado (motivo: datos falsos)     [Ver]        ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ...                                                         ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [Exportar listado CSV]                                         │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  REVOCAR CERTIFICADO                                            │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  Modal al hacer click en 🗑️:                                    │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ⚠️ ¿Revocar certificado PDT-CERT-001234?                   ││
│  │                                                              ││
│  │ Taller: Corte Sur SRL                                       ││
│  │ Colección: Formalización básica                             ││
│  │                                                              ││
│  │ Motivo de revocación *                                      ││
│  │ ┌──────────────────────────────────────────────────────┐    ││
│  │ │ Seleccionar motivo...                             ▼ │    ││
│  │ └──────────────────────────────────────────────────────┘    ││
│  │                                                              ││
│  │ [Cancelar]                    [Revocar certificado]         ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

─────────────────────────────────────────
MODAL: VISTA PREVIA CERTIFICADO (al presionar Ver)
─────────────────────────────────────────

┌─────────────────────────────────────────────────────────────────┐
│                                                              [X] │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                              ││
│  │              PLATAFORMA DIGITAL TEXTIL                      ││
│  │              OIT Argentina - UNTREF                         ││
│  │                                                              ││
│  │  ─────────────────────────────────────────────────────────  ││
│  │                                                              ││
│  │                    CERTIFICADO                               ││
│  │                                                              ││
│  │  Se certifica que                                           ││
│  │                                                              ││
│  │              CORTE SUR SRL                                  ││
│  │              CUIT: 30-12345678-9                            ││
│  │                                                              ││
│  │  ha completado satisfactoriamente el curso                  ││
│  │                                                              ││
│  │         "FORMALIZACIÓN BÁSICA"                              ││
│  │                                                              ││
│  │  con una calificación de 85%                                ││
│  │                                                              ││
│  │  Fecha de emisión: 04 de febrero de 2026                    ││
│  │  Código de verificación: PDT-CERT-001234                    ││
│  │                                                              ││
│  │  ┌─────────┐                                                ││
│  │  │ QR CODE │  Verificar en:                                 ││
│  │  │         │  plataformatextil.ar/verificar/PDT-CERT-001234 ││
│  │  └─────────┘                                                ││
│  │                                                              ││
│  │  ─────────────────────────────────────────────────────────  ││
│  │  Avalado por: OIT Argentina | INTI | UNTREF                 ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [Descargar PDF]  [Copiar link de verificación]  [Cerrar]       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 32. ADMIN - USUARIOS

**Ruta:** `/admin/usuarios`
**Propósito:** Gestionar usuarios de la plataforma

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER ADMIN]                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Usuarios                                                       │
│  Gestión de usuarios de la plataforma                           │
│                                                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │ Total: 32   │ │ Talleres:24 │ │ Marcas: 8   │               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🔍 Buscar por nombre, email o CUIT...                       ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Filtrar: [Todos ▼]  [Activos ▼]  [Verificados ▼]              │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Usuario          │ Rol     │ Nivel  │ Estado   │ Registro  ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ Corte Sur SRL    │ Taller  │ 🥇 Oro │ ✅ Activo│ 15/01/26  ││
│  │ juan@corte.com   │         │        │          │           ││
│  │                                    [Ver] [Editar] [Suspender]│
│  ├─────────────────────────────────────────────────────────────┤│
│  │ Comercial Textil │ Marca   │ -      │ ✅ Activo│ 20/01/26  ││
│  │ ana@comercial.com│         │        │          │           ││
│  │                                    [Ver] [Editar] [Suspender]│
│  ├─────────────────────────────────────────────────────────────┤│
│  │ Taller La Aguja  │ Taller  │ 🥉Bron │ ⚠️ Incom│ 02/02/26  ││
│  │ maria@taller.com │         │        │          │           ││
│  │                                    [Ver] [Editar] [Suspender]│
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ─────────────────────────────────────────                      │
│  DETALLE DE USUARIO (al hacer click en Ver)                     │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Corte Sur SRL                                               ││
│  │                                                              ││
│  │ Email: juan@cortesur.com.ar                                 ││
│  │ CUIT: 30-12345678-9 ✅ Verificado                           ││
│  │ WhatsApp: +54 9 11 1234-5678                                ││
│  │ Registrado: 15/01/2026                                      ││
│  │ Último acceso: hace 2 horas                                 ││
│  │                                                              ││
│  │ Nivel actual: 🥇 ORO                                        ││
│  │ Certificados: 3                                             ││
│  │ Cursos completados: 4                                       ││
│  │                                                              ││
│  │ Acciones:                                                   ││
│  │ [Cambiar rol ▼]  [Resetear contraseña]  [Suspender cuenta] ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 33. ADMIN - FAQ

**Ruta:** `/admin/faq`
**Propósito:** Editar contenido de preguntas frecuentes

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER ADMIN]                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Gestionar FAQ                                                  │
│  Editá las preguntas frecuentes de la plataforma                │
│                                                                  │
│  [+ NUEVA PREGUNTA]                                             │
│                                                                  │
│  Categoría: [Todas ▼]                                           │
│                                                                  │
│  Arrastrá para reordenar:                                       │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ≡ REGISTRO                                                  ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │   ≡ ¿Cómo me registro en la plataforma?            [Editar]││
│  │   ≡ ¿Qué pasa si no tengo CUIT?                    [Editar]││
│  │   ≡ ¿Puedo cambiar de taller a marca?              [Editar]││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ≡ FORMALIZACIÓN                                             ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │   ≡ ¿Qué significan los niveles Bronce/Plata/Oro?  [Editar]││
│  │   ≡ ¿Cómo subo de nivel?                           [Editar]││
│  │   ≡ ¿Qué documentos necesito?                      [Editar]││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ≡ CAPACITACIÓN                                              ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │   ≡ ¿Los certificados tienen validez oficial?      [Editar]││
│  │   ≡ ¿Puedo volver a rendir una evaluación?         [Editar]││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ─────────────────────────────────────────                      │
│  EDITAR PREGUNTA (modal)                                        │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Pregunta *                                                  ││
│  │ ┌────────────────────────────────────────────────────────┐  ││
│  │ │ ¿Qué significan los niveles Bronce, Plata y Oro?      │  ││
│  │ └────────────────────────────────────────────────────────┘  ││
│  │                                                              ││
│  │ Respuesta *                                                 ││
│  │ ┌────────────────────────────────────────────────────────┐  ││
│  │ │ Los niveles reflejan tu grado de formalización:       │  ││
│  │ │                                                        │  ││
│  │ │ 🥉 BRONCE: CUIT verificado                            │  ││
│  │ │ 🥈 PLATA: + empleados registrados + capacitación     │  ││
│  │ │ 🥇 ORO: + habilitaciones completas + certificaciones │  ││
│  │ │                                                        │  ││
│  │ │ (Soporta Markdown)                                    │  ││
│  │ └────────────────────────────────────────────────────────┘  ││
│  │                                                              ││
│  │ Categoría: [Formalización ▼]                                ││
│  │                                                              ││
│  │ [Cancelar]                              [Guardar]           ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 34. ADMIN - TALLERES

**Ruta:** `/admin/talleres`
**Propósito:** Listar, filtrar y gestionar todos los talleres registrados

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER ADMIN]                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Gestión de Talleres                                            │
│  Todos los talleres registrados en la plataforma                │
│                                                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  │    24       │ │      8      │ │     12      │ │      4      │
│  │   Total     │ │   🥇 Oro   │ │  🥈 Plata  │ │  🥉 Bronce │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🔍 Buscar por nombre, CUIT o email...                       ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Filtros:                                                        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ Nivel    ▼  │ │ Estado    ▼ │ │ Ubicación ▼ │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│                                                                  │
│  ☐ Con documentos pendientes de revisión                        │
│  ☐ Inactivos (sin login >30 días)                               │
│                                                                  │
│  [Exportar CSV]  [Exportar Excel]                               │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Nombre           │ CUIT         │ Nivel  │ Estado │ Acciones││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ Corte Sur SRL    │ 30-1234567-9 │ 🥇 Oro│ ✅ Act │[Ver][Ed]││
│  │ Registrado: 15/01/26 | Último acceso: hace 2h               ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ Taller La Aguja  │ 20-9876543-1 │ 🥉 Br │ ⚠️ Inc│[Ver][Ed]││
│  │ Registrado: 02/02/26 | 🔴 3 docs pendientes de revisión     ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ Coop. 8 de Marzo │ 30-5555555-5 │ 🥈 Pl │ 🚫 Sus│[Ver][Ed]││
│  │ Registrado: 10/12/25 | Suspendido: datos inconsistentes     ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Mostrando 1-10 de 24                    [← Anterior] [Siguiente →]│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 35. ADMIN - MARCAS

**Ruta:** `/admin/marcas`
**Propósito:** Listar y gestionar todas las marcas registradas

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER ADMIN]                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Gestión de Marcas                                              │
│  Todas las marcas/empresas registradas                          │
│                                                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │      8      │ │      6      │ │      2      │               │
│  │   Total     │ │  Activas    │ │ Pendientes  │               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🔍 Buscar por nombre, CUIT o email...                       ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Filtros: [Estado ▼]  [Ubicación ▼]  [Verificadas ▼]           │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Empresa            │ CUIT         │ Verificada│ Estado      ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ Comercial Textil   │ 30-7777777-7 │ ✅ Si     │ ✅ Activa   ││
│  │ ana@comercial.com  │              │           │             ││
│  │ Registrada: 20/01/26 | Pedidos realizados: 5  [Ver] [Editar]││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ Moda Express SRL   │ 30-8888888-8 │ ⏳ Pend  │ ⏳ Revisión ││
│  │ info@modaexpress.ar│              │           │             ││
│  │ Registrada: 01/02/26 | CUIT pendiente de verificar    [Ver] ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ─────────────────────────────────────────                      │
│  APROBAR MARCA (al expandir una pendiente)                      │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Moda Express SRL                                            ││
│  │                                                              ││
│  │ CUIT: 30-8888888-8                                          ││
│  │ Estado ARCA: ⚠️ No verificado automáticamente               ││
│  │                                                              ││
│  │ Documentación adjunta:                                       ││
│  │ • Constancia CUIT.pdf [Ver]                                  ││
│  │ • Estatuto social.pdf [Ver]                                  ││
│  │                                                              ││
│  │ [Verificar en ARCA]  [✅ Aprobar]  [❌ Rechazar]            ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 36. ADMIN - DETALLE TALLER

**Ruta:** `/admin/talleres/[id]`
**Propósito:** Ver y gestionar un taller específico en detalle

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER ADMIN]                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ← Volver a talleres                                            │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  [FOTO]   Corte Sur SRL                                   │  │
│  │           CUIT: 30-12345678-9 ✅                          │  │
│  │           📍 La Matanza, Buenos Aires                     │  │
│  │           📧 juan@cortesur.com.ar                         │  │
│  │           📱 +54 9 11 1234-5678                           │  │
│  │                                                           │  │
│  │           Nivel: 🥇 ORO    Estado: ✅ Activo              │  │
│  │                                                           │  │
│  │  [Editar datos]  [Suspender cuenta]  [Eliminar]          │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ Formalización│ │ Documentos   │ │ Actividad    │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  CHECKLIST DE FORMALIZACIÓN                                     │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ✅ CUIT válido              Verificado: 15/01/26            ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ✅ Monotributo activo       Verificado: 15/01/26            ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ✅ Habilitación municipal   Aprobado: 20/01/26   [Ver doc]  ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ⏳ ART                       PENDIENTE REVISIÓN  [Ver doc]  ││
│  │                             Subido: 01/02/26                ││
│  │                             [✅ Aprobar] [❌ Rechazar]      ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ✅ Empleados registrados    3 empleados verificados         ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ─────────────────────────────────────────                      │
│  NOTAS INTERNAS (solo visible para admin)                       │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ [Agregar nota]                                              ││
│  │                                                              ││
│  │ 01/02/26 - Admin: "Llamé por teléfono, van a corregir ART" ││
│  │ 20/01/26 - Sistema: "Documento habilitación aprobado"      ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 37. ADMIN - DETALLE MARCA

**Ruta:** `/admin/marcas/[id]`
**Propósito:** Ver y gestionar una marca específica

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER ADMIN]                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ← Volver a marcas                                              │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  [LOGO]   Comercial Textil SRL                            │  │
│  │           CUIT: 30-7777777-7 ✅                           │  │
│  │           📍 Capital Federal                              │  │
│  │           📧 ana@comercial.com                            │  │
│  │           📱 +54 9 11 9999-8888                           │  │
│  │                                                           │  │
│  │           Estado: ✅ Activa  Verificada: ✅               │  │
│  │                                                           │  │
│  │  [Editar datos]  [Suspender cuenta]  [Eliminar]          │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  ESTADÍSTICAS                                                   │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │      5      │ │      3      │ │     12      │               │
│  │  Pedidos    │ │ Talleres    │ │  Contactos  │               │
│  │ realizados  │ │ favoritos   │ │  iniciados  │               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  ACTIVIDAD RECIENTE                                             │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 03/02/26 - Agregó a favoritos: Taller La Aguja             ││
│  │ 01/02/26 - Visitó perfil: Corte Sur SRL                    ││
│  │ 28/01/26 - Contactó por WhatsApp: Coop. 8 de Marzo         ││
│  │ 20/01/26 - Se registró en la plataforma                    ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ─────────────────────────────────────────                      │
│  NOTAS INTERNAS                                                 │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ [Agregar nota]                                              ││
│  │                                                              ││
│  │ (Sin notas)                                                 ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 38. ADMIN - PROCESOS PRODUCTIVOS

**Ruta:** `/admin/procesos`
**Propósito:** Gestionar los tags de procesos productivos del directorio

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER ADMIN]                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Procesos Productivos                                           │
│  Tags que los talleres usan para indicar sus capacidades        │
│                                                                  │
│  [+ NUEVO PROCESO]                                              │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🔍 Buscar proceso...                                        ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ─────────────────────────────────────────                      │
│  PROCESOS ACTIVOS (12)                                          │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Proceso         │ Descripción              │ Talleres│ Acc. ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ✂️ Corte        │ Corte de tela y moldes   │    18   │[Ed]  ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 🧵 Confección   │ Costura y armado         │    22   │[Ed]  ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 👔 Terminación  │ Planchado, etiquetado    │    15   │[Ed]  ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 🎨 Estampado    │ Serigrafía, sublimación  │     8   │[Ed]  ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 🧶 Tejido       │ Tejido de punto          │     5   │[Ed]  ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 👖 Bordado      │ Bordado industrial       │     6   │[Ed]  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ─────────────────────────────────────────                      │
│  EDITAR/CREAR PROCESO (modal)                                   │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Nombre del proceso *                                        ││
│  │ ┌────────────────────────────────────────────────────────┐  ││
│  │ │ Corte                                                  │  ││
│  │ └────────────────────────────────────────────────────────┘  ││
│  │                                                              ││
│  │ Descripción *                                                ││
│  │ ┌────────────────────────────────────────────────────────┐  ││
│  │ │ Corte de tela según moldes, incluye tizado             │  ││
│  │ └────────────────────────────────────────────────────────┘  ││
│  │                                                              ││
│  │ Emoji/Ícono                                                  ││
│  │ ┌────────────────────────────────────────────────────────┐  ││
│  │ │ ✂️                                                     │  ││
│  │ └────────────────────────────────────────────────────────┘  ││
│  │                                                              ││
│  │ ☐ Proceso activo (visible en el directorio)                 ││
│  │                                                              ││
│  │ [Cancelar]  [🗑️ Eliminar]              [Guardar]           ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 39. ADMIN - TIPOS DE DOCUMENTO

**Ruta:** `/admin/documentos`
**Propósito:** Configurar requisitos de documentación para formalización

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER ADMIN]                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Tipos de Documento                                             │
│  Requisitos para el checklist de formalización                  │
│                                                                  │
│  [+ NUEVO REQUISITO]                                            │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  REQUISITOS POR NIVEL                                           │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  🥉 BRONCE (requisitos mínimos)                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ≡ CUIT válido                                      [Editar] ││
│  │   Tipo: Verificación automática (ARCA)                      ││
│  │   Obligatorio: ✅                                           ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ≡ Monotributo activo                               [Editar] ││
│  │   Tipo: Verificación automática (ARCA)                      ││
│  │   Obligatorio: ✅                                           ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  🥈 PLATA (adicional a Bronce)                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ≡ Habilitación municipal                           [Editar] ││
│  │   Tipo: Documento PDF (requiere aprobación manual)          ││
│  │   Obligatorio: ✅                                           ││
│  │   Vencimiento: Sí (recordar 30 días antes)                  ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ≡ ART vigente                                      [Editar] ││
│  │   Tipo: Documento PDF (requiere aprobación manual)          ││
│  │   Obligatorio: ✅                                           ││
│  │   Vencimiento: Sí (recordar 30 días antes)                  ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ≡ Empleados registrados                            [Editar] ││
│  │   Tipo: Declaración jurada + cantidad                       ││
│  │   Obligatorio: ✅                                           ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  🥇 ORO (adicional a Plata)                                     │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ≡ Certificación de calidad                         [Editar] ││
│  │   Tipo: Documento PDF (requiere aprobación manual)          ││
│  │   Obligatorio: ☐ (opcional pero suma puntos)                ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ≡ Capacitación completa                            [Editar] ││
│  │   Tipo: Automático (verificar certificados Academia)        ││
│  │   Obligatorio: ✅                                           ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

─────────────────────────────────────────
MODAL: CREAR/EDITAR TIPO DE DOCUMENTO (al presionar + NUEVO o Editar)
─────────────────────────────────────────

┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Editar Requisito de Documento                                  │
│                                                                  │
│  Nombre del requisito *                                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Habilitación municipal                                     │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Descripción (se muestra al usuario)                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Certificado de habilitación emitido por el municipio       │ │
│  │ donde está ubicado el taller.                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Nivel requerido *                                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 🥈 Plata                                                ▼ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Tipo de validación *                                           │
│  ○ Verificación automática (API externa)                       │
│  ● Documento PDF (aprobación manual)                           │
│  ○ Declaración jurada                                          │
│  ○ Automático (basado en otros datos)                          │
│                                                                  │
│  ☑ Obligatorio para el nivel                                   │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  VENCIMIENTO                                                    │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ☑ El documento tiene fecha de vencimiento                     │
│                                                                  │
│  Recordar antes de vencer:                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 30 días                                                 ▼ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  [🗑️ Eliminar requisito]                                        │
│                                                                  │
│  [Cancelar]                         [    GUARDAR    ]           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 40. ADMIN - CONFIGURACIÓN GENERAL

**Ruta:** `/admin/configuracion`
**Propósito:** Parámetros generales del sistema

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER ADMIN]                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Configuración General                                          │
│  Parámetros del sistema                                         │
│                                                                  │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐         │
│  │ General       │ │ Emails       │ │ Integraciones │         │
│  │   (activo)    │ │               │ │               │         │
│  └───────────────┘ └───────────────┘ └───────────────┘         │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  INFORMACIÓN DE LA PLATAFORMA                                   │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  Nombre de la plataforma                                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Plataforma Digital Textil                                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Email de soporte                                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ soporte@plataformatextil.ar                                │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  WhatsApp de soporte                                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ +54 11 1234-5678                                           │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  REGISTRO DE USUARIOS                                           │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ☑ Permitir registro de nuevos talleres                        │
│  ☑ Permitir registro de nuevas marcas                          │
│  ☐ Requiere aprobación manual de nuevos registros              │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  CERTIFICADOS                                                   │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  Prefijo de código de certificado                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ PDT-CERT-                                                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Institución que firma certificados                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ OIT Argentina - UNTREF                                     │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  [    GUARDAR CONFIGURACIÓN    ]                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 41. ADMIN - PEDIDOS

**Ruta:** `/admin/pedidos`
**Propósito:** Ver todos los pedidos del sistema

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER ADMIN]                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Gestión de Pedidos                                             │
│  Todos los pedidos realizados en la plataforma                  │
│                                                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  │    45       │ │     32      │ │      8      │ │      5      │
│  │   Total     │ │ Completados │ │ En proceso  │ │  Pendientes │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🔍 Buscar por marca, taller o ID de pedido...               ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Filtros: [Estado ▼]  [Período ▼]  [Marca ▼]  [Taller ▼]       │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ID       │ Marca         │ Taller       │ Estado  │ Fecha   ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ #PED-045 │ Comercial Tex │ Corte Sur    │ ✅ Comp │ 03/02   ││
│  │          │ 500 prendas - Pantalones de trabajo              ││
│  │                                              [Ver detalle]  ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ #PED-044 │ Moda Express  │ Taller Aguja │ 🔄 Proc │ 01/02   ││
│  │          │ 200 prendas - Remeras                            ││
│  │                                              [Ver detalle]  ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ #PED-043 │ Comercial Tex │ Coop. 8 Marzo│ ⏳ Pend │ 30/01   ││
│  │          │ 300 prendas - Camisas                            ││
│  │                                              [Ver detalle]  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [Exportar reporte de pedidos]                                  │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  ESTADÍSTICAS DEL PERÍODO                                       │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  Volumen total: 12,500 prendas                                  │
│  Promedio por pedido: 278 prendas                               │
│  Tiempo promedio de completado: 12 días                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 42. ADMIN - AUDITORÍAS

**Ruta:** `/admin/auditorias`
**Propósito:** Programar y gestionar auditorías presenciales a talleres

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER ADMIN]                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Auditorías                                                     │
│  Programación y seguimiento de auditorías presenciales          │
│                                                                  │
│  [+ PROGRAMAR AUDITORÍA]                                        │
│                                                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │      5      │ │      3      │ │      2      │               │
│  │ Programadas │ │ Realizadas  │ │  Pendientes │               │
│  │  este mes   │ │  este mes   │ │   informe   │               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  CALENDARIO DE AUDITORÍAS                                       │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │     FEBRERO 2026                                            ││
│  │  Lu  Ma  Mi  Ju  Vi  Sa  Do                                 ││
│  │                           1   2                              ││
│  │   3  [4]  5   6   7   8   9   ← Hoy                         ││
│  │  10  11 [12] 13  14  15  16   ← Auditoría programada        ││
│  │  17  18  19  20  21  22  23                                 ││
│  │  24  25  26  27  28                                         ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ─────────────────────────────────────────                      │
│  PRÓXIMAS AUDITORÍAS                                            │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 📅 12/02/26 - 10:00                                         ││
│  │ Taller: Corte Sur SRL                                       ││
│  │ Dirección: Av. Belgrano 1234, La Matanza                    ││
│  │ Auditor: Juan García                                        ││
│  │ Tipo: Verificación de habilitaciones                        ││
│  │                                         [Editar] [Cancelar] ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 📅 18/02/26 - 14:00                                         ││
│  │ Taller: Coop. 8 de Marzo                                    ││
│  │ Dirección: Calle 50 #123, Florencio Varela                  ││
│  │ Auditor: María López                                        ││
│  │ Tipo: Primera visita                                        ││
│  │                                         [Editar] [Cancelar] ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ─────────────────────────────────────────                      │
│  PENDIENTES DE INFORME                                          │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ⚠️ 01/02/26 - Taller La Aguja                               ││
│  │    Auditor: Juan García                                     ││
│  │    Estado: Sin informe (hace 3 días)         [Cargar informe]│
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

─────────────────────────────────────────
MODAL: PROGRAMAR AUDITORÍA (al presionar + PROGRAMAR AUDITORÍA)
─────────────────────────────────────────

┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Programar Nueva Auditoría                                      │
│                                                                  │
│  Taller a auditar *                                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 🔍 Buscar taller...                                     ▼ │ │
│  └────────────────────────────────────────────────────────────┘ │
│  Dirección: Se autocompleta al seleccionar                      │
│                                                                  │
│  Fecha *                           Hora *                       │
│  ┌────────────────────────────┐   ┌────────────────────────┐   │
│  │ 12/02/2026             📅 │   │ 10:00              ▼ │   │
│  └────────────────────────────┘   └────────────────────────┘   │
│                                                                  │
│  Auditor asignado *                                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Juan García                                             ▼ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Tipo de auditoría *                                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Verificación de habilitaciones                          ▼ │ │
│  └────────────────────────────────────────────────────────────┘ │
│  Opciones: Primera visita, Verificación habilitaciones,         │
│            Seguimiento, Re-auditoría                            │
│                                                                  │
│  Notas (opcional)                                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Verificar señalización de emergencia pendiente             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ☑ Notificar al taller por email                               │
│  ☐ Notificar al taller por WhatsApp                            │
│                                                                  │
│  [Cancelar]                  [    PROGRAMAR AUDITORÍA    ]      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 43. ADMIN - REPORTES Y ESTADÍSTICAS

**Ruta:** `/admin/reportes`
**Propósito:** Dashboard de métricas y generación de reportes

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER ADMIN]                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Reportes y Estadísticas                                        │
│  Métricas de la plataforma                                      │
│                                                                  │
│  Período: [Último mes ▼]  [01/01/26] - [04/02/26]              │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  MÉTRICAS PRINCIPALES                                           │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  │    24       │ │      8      │ │     45      │ │     156     │
│  │  Talleres   │ │   Marcas    │ │ Certificados│ │   Videos    │
│  │  (+4 mes)   │ │  (+2 mes)   │ │  (+12 mes)  │ │ vistos/mes  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
│                                                                  │
│  ─────────────────────────────────────────                      │
│  DISTRIBUCIÓN POR NIVEL                                         │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                              ││
│  │  🥇 Oro     ████████████████████████           33% (8)      ││
│  │  🥈 Plata   ████████████████████████████████   50% (12)     ││
│  │  🥉 Bronce  ████████                           17% (4)      ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ─────────────────────────────────────────                      │
│  REGISTROS POR MES                                              │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                              ││
│  │  8 │                                    ██                   ││
│  │  6 │               ██        ██         ██                   ││
│  │  4 │    ██         ██   ██   ██    ██   ██                   ││
│  │  2 │    ██    ██   ██   ██   ██    ██   ██                   ││
│  │    └────Oct───Nov───Dic───Ene───Feb────────                  ││
│  │         Talleres ██   Marcas ██                              ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ─────────────────────────────────────────                      │
│  GENERAR REPORTES                                               │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │ 📄 Resumen      │ │ 📊 Talleres     │ │ 📈 Capacitación │   │
│  │    ejecutivo    │ │    completo     │ │                 │   │
│  │   [Generar PDF] │ │  [Generar Excel]│ │   [Generar PDF] │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 44. ADMIN - NOTIFICACIONES

**Ruta:** `/admin/notificaciones`
**Propósito:** Enviar comunicaciones masivas a usuarios

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER ADMIN]                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Centro de Notificaciones                                       │
│  Envío de comunicaciones a usuarios                             │
│                                                                  │
│  [+ NUEVA NOTIFICACIÓN]                                         │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  ENVÍOS RECIENTES                                               │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 📧 Nuevo curso disponible                                   ││
│  │    Enviado: 01/02/26 | Destinatarios: 24 talleres           ││
│  │    Abiertos: 18 (75%) | Clicks: 12 (50%)                    ││
│  │                                              [Ver detalles] ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 📧 Recordatorio: documentos por vencer                      ││
│  │    Enviado: 28/01/26 | Destinatarios: 5 talleres            ││
│  │    Abiertos: 5 (100%) | Clicks: 3 (60%)                     ││
│  │                                              [Ver detalles] ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ─────────────────────────────────────────                      │
│  CREAR NOTIFICACIÓN                                             │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                              ││
│  │ Asunto *                                                    ││
│  │ ┌────────────────────────────────────────────────────────┐  ││
│  │ │ Nuevo curso disponible: Control de calidad             │  ││
│  │ └────────────────────────────────────────────────────────┘  ││
│  │                                                              ││
│  │ Mensaje *                                                   ││
│  │ ┌────────────────────────────────────────────────────────┐  ││
│  │ │ Hola {nombre},                                         │  ││
│  │ │                                                         │  ││
│  │ │ Te contamos que hay un nuevo curso disponible en la    │  ││
│  │ │ Academia: "Control de calidad" del INTI.               │  ││
│  │ │                                                         │  ││
│  │ │ {boton:Ver curso:/academia/calidad}                    │  ││
│  │ └────────────────────────────────────────────────────────┘  ││
│  │ (Soporta variables: {nombre}, {empresa}, {boton:texto:url})││
│  │                                                              ││
│  │ ─────────────────────────────────────────                   ││
│  │ DESTINATARIOS                                               ││
│  │ ─────────────────────────────────────────                   ││
│  │                                                              ││
│  │ ○ Todos los usuarios                                        ││
│  │ ● Segmento específico:                                      ││
│  │   ☑ Talleres    ☐ Marcas                                   ││
│  │   Nivel: [Todos ▼]    Ubicación: [Todas ▼]                 ││
│  │                                                              ││
│  │ Usuarios que recibirán: 24                                  ││
│  │                                                              ││
│  │ ─────────────────────────────────────────                   ││
│  │ CANAL DE ENVÍO                                              ││
│  │ ─────────────────────────────────────────                   ││
│  │                                                              ││
│  │ ☑ Email    ☐ WhatsApp    ☐ Notificación in-app             ││
│  │                                                              ││
│  │ [Vista previa]            [Programar]  [Enviar ahora]       ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 45. ADMIN - LOGS DE ACTIVIDAD

**Ruta:** `/admin/logs`
**Propósito:** Auditoría de acciones en el sistema

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER ADMIN]                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Logs de Actividad                                              │
│  Registro de acciones en la plataforma                          │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🔍 Buscar en logs...                                        ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Filtros:                                                        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ Tipo      ▼ │ │ Usuario   ▼ │ │ Fecha     ▼ │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│                                                                  │
│  Tipos: [Todos] [Auth] [CRUD] [Admin] [Errores]                │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Timestamp          │ Tipo  │ Usuario      │ Acción         ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 04/02/26 10:32:15  │ AUTH  │ admin@pdt.ar │ Login exitoso  ││
│  │ IP: 190.xxx.xxx.xx │       │              │                ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 04/02/26 10:15:42  │ CRUD  │ juan@corte.. │ Subió documento││
│  │ Detalle: habilitacion_municipal.pdf (2.3MB)                 ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 04/02/26 09:58:11  │ ADMIN │ admin@pdt.ar │ Aprobó documento│
│  │ Taller: Corte Sur | Doc: ART_2026.pdf                       ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 04/02/26 09:45:33  │ AUTH  │ ana@comerci..│ Login exitoso  ││
│  │ IP: 181.xxx.xxx.xx │       │              │                ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 04/02/26 09:30:00  │ SYSTEM│ Cron         │ Backup BD      ││
│  │ Resultado: OK | Tamaño: 45MB                                ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 04/02/26 09:12:55  │ ERROR │ maria@taller │ Upload fallido ││
│  │ Error: Archivo muy grande (>10MB)                           ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Mostrando 1-50 de 1,234            [← Anterior] [Siguiente →] │
│                                                                  │
│  [Exportar logs (CSV)]  [Exportar logs (JSON)]                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 46. ADMIN - ROLES Y PERMISOS

**Ruta:** `/admin/roles`
**Propósito:** Gestionar roles de administración y permisos

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER ADMIN]                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Roles y Permisos                                               │
│  Gestión de accesos administrativos                             │
│                                                                  │
│  [+ NUEVO ROL]   [+ NUEVO ADMIN]                                │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  ROLES DEL SISTEMA                                              │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 👑 SUPER ADMIN                                     [Editar] ││
│  │    Acceso total al sistema                                  ││
│  │    Usuarios: 1                                              ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 🛡️ ADMIN                                           [Editar] ││
│  │    Gestión de usuarios, contenido y configuración           ││
│  │    Usuarios: 2                                              ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 📚 CURADOR                                         [Editar] ││
│  │    Solo gestión de colecciones y videos                     ││
│  │    Usuarios: 3                                              ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 👁️ AUDITOR                                         [Editar] ││
│  │    Solo lectura + cargar informes de auditoría              ││
│  │    Usuarios: 2                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ─────────────────────────────────────────                      │
│  USUARIOS ADMINISTRATIVOS                                       │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Usuario              │ Email              │ Rol     │ Acc. ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ Gerardo Admin        │ gerardo@untref.edu │ Super   │[Ed]  ││
│  │                      │ Último acceso: hoy 10:32             ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ María Contenidos     │ maria@oit.org      │ Curador │[Ed]  ││
│  │                      │ Último acceso: ayer 15:20            ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ Juan Auditor         │ juan@inti.gob.ar   │ Auditor │[Ed]  ││
│  │                      │ Último acceso: 01/02/26              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ─────────────────────────────────────────                      │
│  MATRIZ DE PERMISOS (al editar rol)                             │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Módulo              │ Ver │ Crear │ Editar │ Eliminar      ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ Talleres            │ ☑   │  ☐   │   ☑   │    ☐          ││
│  │ Marcas              │ ☑   │  ☐   │   ☑   │    ☐          ││
│  │ Colecciones         │ ☑   │  ☑   │   ☑   │    ☑          ││
│  │ Evaluaciones        │ ☑   │  ☑   │   ☑   │    ☑          ││
│  │ Certificados        │ ☑   │  ☐   │   ☐   │    ☐          ││
│  │ Configuración       │ ☐   │  ☐   │   ☐   │    ☐          ││
│  │ Logs                │ ☐   │  ☐   │   ☐   │    ☐          ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

─────────────────────────────────────────
MODAL: CREAR/EDITAR USUARIO ADMIN (al presionar + NUEVO ADMIN o Editar)
─────────────────────────────────────────

┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Nuevo Usuario Administrativo                                   │
│                                                                  │
│  Nombre completo *                                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ María García                                               │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Email *                                                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ maria.garcia@oit.org                                       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Rol *                                                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Curador                                                 ▼ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Estado                                                         │
│  ● Activo    ○ Suspendido                                      │
│                                                                  │
│  ☑ Enviar email de bienvenida con instrucciones de acceso      │
│                                                                  │
│  [Cancelar]                    [    CREAR USUARIO    ]          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 47. ADMIN - GESTOR BASE DE DATOS

**Ruta:** `/admin/database`
**Propósito:** Interfaz para consultas y gestión de datos

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER ADMIN]                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ⚠️ Gestor de Base de Datos                                     │
│  Acceso directo a datos del sistema (SOLO SUPER ADMIN)          │
│                                                                  │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐         │
│  │ Explorador    │ │ Consultas     │ │ Backups       │         │
│  │   (activo)    │ │               │ │               │         │
│  └───────────────┘ └───────────────┘ └───────────────┘         │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  TABLAS DE LA BASE DE DATOS                                     │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 📁 usuarios (32 registros)                         [Abrir]  ││
│  │ 📁 talleres (24 registros)                         [Abrir]  ││
│  │ 📁 marcas (8 registros)                            [Abrir]  ││
│  │ 📁 documentos (156 registros)                      [Abrir]  ││
│  │ 📁 colecciones (6 registros)                       [Abrir]  ││
│  │ 📁 videos (45 registros)                           [Abrir]  ││
│  │ 📁 certificados (45 registros)                     [Abrir]  ││
│  │ 📁 evaluaciones (6 registros)                      [Abrir]  ││
│  │ 📁 respuestas_evaluacion (234 registros)           [Abrir]  ││
│  │ 📁 procesos_productivos (12 registros)             [Abrir]  ││
│  │ 📁 pedidos (45 registros)                          [Abrir]  ││
│  │ 📁 logs (1234 registros)                           [Abrir]  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ─────────────────────────────────────────                      │
│  VISTA DE TABLA: talleres                                       │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ id │ nombre        │ cuit         │ nivel │ created_at     ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 1  │ Corte Sur SRL │ 30-12345678-9│ oro   │ 2026-01-15     ││
│  │ 2  │ Taller Aguja  │ 20-98765432-1│ bronce│ 2026-02-02     ││
│  │ 3  │ Coop. 8 Marzo │ 30-55555555-5│ plata │ 2025-12-10     ││
│  │ ...│               │              │       │                ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [Exportar tabla]  [+ Nuevo registro]                           │
│                                                                  │
│  ⚠️ Los cambios directos en la BD pueden afectar la integridad  │
│     del sistema. Usá esta herramienta con precaución.           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 48. ADMIN - INTEGRACIONES API

**Ruta:** `/admin/integraciones`
**Propósito:** Configurar y monitorear integraciones externas

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER ADMIN]                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Integraciones API                                              │
│  Conexiones con servicios externos                              │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  ESTADO DE INTEGRACIONES                                        │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🟢 ARCA (ex-AFIP)                                           ││
│  │    Estado: Conectado | Última verificación: hace 5 min      ││
│  │    Requests hoy: 45 | Errores: 0                            ││
│  │                                               [Configurar]  ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 🟢 OpenAI / LLM                                             ││
│  │    Estado: Conectado | Modelo: gpt-4-turbo                  ││
│  │    Tokens usados (mes): 125,430 / 500,000                   ││
│  │                                               [Configurar]  ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 🟢 SendGrid (Email)                                         ││
│  │    Estado: Conectado | Emails enviados (mes): 234           ││
│  │    Bounce rate: 0.5%                                        ││
│  │                                               [Configurar]  ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 🟡 WhatsApp Business API                                    ││
│  │    Estado: Configuración pendiente                          ││
│  │    Mensajes enviados: 0                                     ││
│  │                                               [Configurar]  ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 🔴 Google Maps API                                          ││
│  │    Estado: API Key expirada                                 ││
│  │    Último uso: 15/01/26                                     ││
│  │                                               [Configurar]  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [+ Agregar integración]                                        │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  LOG DE INTEGRACIONES (últimas 24h)                             │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 10:32 │ ARCA    │ ✅ Verificación CUIT 30-12345678-9       ││
│  │ 10:15 │ OpenAI  │ ✅ Respuesta asistente (1,234 tokens)    ││
│  │ 09:45 │ SendGrid│ ✅ Email enviado a juan@ejemplo.com      ││
│  │ 09:30 │ ARCA    │ ⚠️ Timeout - Reintentando...             ││
│  │ 09:30 │ ARCA    │ ✅ Verificación CUIT (retry exitoso)     ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

─────────────────────────────────────────
MODAL: CONFIGURAR GOOGLE MAPS (al presionar Configurar)
─────────────────────────────────────────

┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Configuración Google Maps API                                  │
│                                                                  │
│  Estado: 🔴 API Key expirada                                    │
│                                                                  │
│  API Key *                                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ AIza••••••••••••••••••••••••••••••••                       │ │
│  └────────────────────────────────────────────────────────────┘ │
│  [Mostrar] [Obtener en Google Cloud →]                          │
│                                                                  │
│  Funcionalidades habilitadas                                    │
│  ☑ Geocoding (convertir direcciones a coordenadas)             │
│  ☑ Mostrar mapa en perfil de taller                            │
│  ☐ Cálculo de distancias (requiere billing activo)             │
│                                                                  │
│  Restricciones de API Key                                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ *.plataformatextil.ar                                      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  [Probar conexión]                                              │
│                                                                  │
│  [Cancelar]                         [    GUARDAR    ]           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 49. ADMIN - CONFIGURACIÓN ARCA

**Ruta:** `/admin/integraciones/arca`
**Propósito:** Configurar conexión con API de ARCA/AFIP

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER ADMIN]                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ← Volver a integraciones                                       │
│                                                                  │
│  Configuración ARCA (ex-AFIP)                                   │
│  Verificación automática de CUIT y estado fiscal                │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  ESTADO DE CONEXIÓN                                             │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  Estado: 🟢 Conectado                                           │
│  Última verificación: 04/02/2026 10:32:15                       │
│  Ambiente: Producción                                           │
│                                                                  │
│  [Probar conexión]                                              │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  CREDENCIALES                                                   │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  CUIT de la organización *                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 30-70123456-7                                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Token de acceso *                                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ••••••••••••••••••••••••••••••••                           │ │
│  └────────────────────────────────────────────────────────────┘ │
│  [Mostrar] [Regenerar token]                                    │
│                                                                  │
│  Certificado digital (.pem)                                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ certificado_pdt.pem               Subido: 01/01/2026       │ │
│  └────────────────────────────────────────────────────────────┘ │
│  [Cambiar certificado]                                          │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  CONFIGURACIÓN DE VERIFICACIÓN                                  │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ☑ Verificar CUIT al registrar nuevo taller                    │
│  ☑ Verificar estado de monotributo                             │
│  ☑ Verificar estado de empleador (si aplica)                   │
│  ☐ Verificar domicilio fiscal (requiere permiso adicional)     │
│                                                                  │
│  Frecuencia de re-verificación                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Mensual                                                 ▼ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  [    GUARDAR CONFIGURACIÓN    ]                                │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  VERIFICACIÓN MANUAL                                            │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  CUIT a verificar:                                              │
│  ┌────────────────────────────────┐                            │
│  │ 30-12345678-9                  │  [Verificar]               │
│  └────────────────────────────────┘                            │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Resultado:                                                  ││
│  │ • CUIT: 30-12345678-9 ✅ Válido                            ││
│  │ • Razón social: CORTE SUR SRL                              ││
│  │ • Estado: ACTIVO                                            ││
│  │ • Monotributo: ACTIVO (Categoría D)                        ││
│  │ • Domicilio fiscal: Av. Belgrano 1234, CABA                ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 50. ADMIN - CONFIGURACIÓN LLM

**Ruta:** `/admin/integraciones/llm`
**Propósito:** Configurar modelo de IA para asistente y procesamiento

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER ADMIN]                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ← Volver a integraciones                                       │
│                                                                  │
│  Configuración LLM / Inteligencia Artificial                    │
│  Configuración del modelo de IA para el asistente               │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  PROVEEDOR Y MODELO                                             │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  Proveedor *                                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ OpenAI                                                  ▼ │ │
│  └────────────────────────────────────────────────────────────┘ │
│  Opciones: OpenAI, Anthropic, Azure OpenAI, Local (Ollama)     │
│                                                                  │
│  Modelo *                                                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ gpt-4-turbo                                             ▼ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  API Key *                                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ sk-••••••••••••••••••••••••••••••••                       │ │
│  └────────────────────────────────────────────────────────────┘ │
│  [Mostrar] [Probar conexión]                                    │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  USO DEL MES                                                    │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Tokens usados: 125,430 / 500,000 (25%)                     ││
│  │ ████████░░░░░░░░░░░░░░░░░░░░░░░░                           ││
│  │                                                              ││
│  │ Costo estimado: $12.54 USD                                  ││
│  │ Consultas realizadas: 342                                   ││
│  │ Promedio tokens/consulta: 367                               ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ─────────────────────────────────────────                      │
│  CONFIGURACIÓN DEL ASISTENTE                                    │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  Prompt del sistema (instrucciones base) *                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Sos un asistente de la Plataforma Digital Textil.         │ │
│  │ Ayudás a talleres y marcas con consultas sobre:            │ │
│  │ - Proceso de formalización                                 │ │
│  │ - Uso de la plataforma                                     │ │
│  │ - Requisitos de documentación                              │ │
│  │                                                             │ │
│  │ Respondé siempre en español rioplatense, de forma clara   │ │
│  │ y concisa. Si no sabés algo, decilo honestamente.         │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Temperatura (creatividad)                                      │
│  0 ─────────●────────── 1                                      │
│  0.3 (más preciso)                                             │
│                                                                  │
│  Máximo de tokens por respuesta                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 500                                                        │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  FUNCIONALIDADES ACTIVAS                                        │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ☑ Asistente de búsqueda (buscar talleres)                     │
│  ☑ Responder preguntas frecuentes                              │
│  ☐ Generar descripciones de perfil (experimental)              │
│  ☐ Analizar documentos subidos (experimental)                  │
│                                                                  │
│  [    GUARDAR CONFIGURACIÓN    ]                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 51. ADMIN - CONFIGURACIÓN SENDGRID (EMAIL)

**Ruta:** `/admin/integraciones/email`
**Propósito:** Configurar servicio de envío de emails

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER ADMIN]                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ← Volver a integraciones                                       │
│                                                                  │
│  Configuración SendGrid (Email)                                 │
│  Servicio de envío de emails transaccionales                    │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  ESTADO DE CONEXIÓN                                             │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  Estado: 🟢 Conectado                                           │
│  Emails enviados (mes): 234                                     │
│  Bounce rate: 0.5% | Spam reports: 0                            │
│                                                                  │
│  [Enviar email de prueba]                                       │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  CREDENCIALES                                                   │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  API Key *                                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ SG.••••••••••••••••••••••••••••••••                        │ │
│  └────────────────────────────────────────────────────────────┘ │
│  [Mostrar] [Regenerar en SendGrid →]                            │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  CONFIGURACIÓN DE REMITENTE                                     │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  Email remitente *                                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ notificaciones@plataformatextil.ar                         │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Nombre remitente *                                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Plataforma Digital Textil                                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Reply-to                                                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ soporte@plataformatextil.ar                                │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  VERIFICACIÓN DE DOMINIO                                        │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  Dominio: plataformatextil.ar                                   │
│  Estado: ✅ Verificado                                          │
│                                                                  │
│  Registros DNS requeridos:                                      │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Tipo  │ Host              │ Valor              │ Estado     ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ CNAME │ em1234.plataforma │ u1234.wl.sendgrid  │ ✅ OK     ││
│  │ CNAME │ s1._domainkey     │ s1.domainkey.u1234 │ ✅ OK     ││
│  │ CNAME │ s2._domainkey     │ s2.domainkey.u1234 │ ✅ OK     ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [Re-verificar DNS]                                             │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  ESTADÍSTICAS (últimos 30 días)                                 │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  │    234      │ │    210      │ │     89      │ │     2       │
│  │  Enviados   │ │  Entregados │ │  Abiertos   │ │  Rebotados  │
│  │             │ │    (90%)    │ │    (42%)    │ │   (0.8%)    │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
│                                                                  │
│  [    GUARDAR CONFIGURACIÓN    ]                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 52. ADMIN - CONFIGURACIÓN WHATSAPP BUSINESS

**Ruta:** `/admin/integraciones/whatsapp`
**Propósito:** Configurar API de WhatsApp Business para notificaciones

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER ADMIN]                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ← Volver a integraciones                                       │
│                                                                  │
│  Configuración WhatsApp Business API                            │
│  Envío de notificaciones por WhatsApp                           │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  ESTADO DE CONEXIÓN                                             │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  Estado: 🟡 Configuración pendiente                             │
│  Mensajes enviados (mes): 0                                     │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  CUENTA DE META BUSINESS                                        │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ID de cuenta de WhatsApp Business *                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 123456789012345                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Token de acceso permanente *                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ EAAx••••••••••••••••••••••••••••••••                       │ │
│  └────────────────────────────────────────────────────────────┘ │
│  [Mostrar] [Obtener en Meta Business →]                         │
│                                                                  │
│  Número de teléfono verificado *                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ +54 11 1234-5678                                           │ │
│  └────────────────────────────────────────────────────────────┘ │
│  Estado: ⏳ Pendiente de verificación                           │
│                                                                  │
│  [Verificar número]                                             │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  WEBHOOK (para respuestas entrantes)                            │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  URL del webhook:                                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ https://api.plataformatextil.ar/webhooks/whatsapp         │ │
│  └────────────────────────────────────────────────────────────┘ │
│  [Copiar URL]                                                   │
│                                                                  │
│  Token de verificación:                                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ pdt_webhook_verify_token_2026                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│  [Regenerar token]                                              │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  TEMPLATES DE MENSAJE (aprobados por Meta)                      │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ documento_por_vencer                              ✅ Aprobado││
│  │ "Hola {{1}}, tu documento {{2}} vence el {{3}}..."          ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ nuevo_curso_disponible                            ✅ Aprobado││
│  │ "Hola {{1}}, hay un nuevo curso disponible: {{2}}"          ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ certificado_emitido                               ⏳ Revisión││
│  │ "Felicitaciones {{1}}, completaste el curso {{2}}..."       ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [+ Solicitar nuevo template]                                   │
│                                                                  │
│  [Probar conexión]        [    GUARDAR CONFIGURACIÓN    ]       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 53. ADMIN - CREAR/EDITAR ROL

**Ruta:** `/admin/roles/[id]`
**Propósito:** Configurar permisos detallados de un rol

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER ADMIN]                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ← Volver a roles y permisos                                    │
│                                                                  │
│  Editar Rol: CURADOR                                            │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  INFORMACIÓN DEL ROL                                            │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  Nombre del rol *                                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Curador                                                    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Descripción                                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Gestión de colecciones de cursos y videos curados          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Nivel de acceso                                                │
│  ○ Super Admin (acceso total - no editable)                    │
│  ○ Admin (gestión completa)                                    │
│  ● Limitado (solo módulos seleccionados)                       │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  MATRIZ DE PERMISOS                                             │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ MÓDULO              │ Ver │Crear│Editar│Eliminar│ Aprobar  ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ USUARIOS                                                    ││
│  │ ├─ Talleres         │ ☑  │  ☐  │  ☐  │   ☐   │    ☐     ││
│  │ ├─ Marcas           │ ☑  │  ☐  │  ☐  │   ☐   │    ☐     ││
│  │ └─ Admins           │ ☐  │  ☐  │  ☐  │   ☐   │    ☐     ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ CONTENIDO                                                   ││
│  │ ├─ Colecciones      │ ☑  │  ☑  │  ☑  │   ☑   │    ☑     ││
│  │ ├─ Videos           │ ☑  │  ☑  │  ☑  │   ☑   │    -     ││
│  │ ├─ Evaluaciones     │ ☑  │  ☑  │  ☑  │   ☑   │    -     ││
│  │ ├─ Certificados     │ ☑  │  ☐  │  ☐  │   ☐   │    ☐     ││
│  │ └─ FAQ              │ ☑  │  ☑  │  ☑  │   ☑   │    -     ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ CONFIGURACIÓN                                               ││
│  │ ├─ Procesos prod.   │ ☑  │  ☐  │  ☐  │   ☐   │    -     ││
│  │ ├─ Tipos documento  │ ☐  │  ☐  │  ☐  │   ☐   │    -     ││
│  │ └─ Config general   │ ☐  │  ☐  │  ☐  │   ☐   │    -     ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ OPERACIONES                                                 ││
│  │ ├─ Pedidos          │ ☐  │  ☐  │  ☐  │   ☐   │    ☐     ││
│  │ ├─ Auditorías       │ ☐  │  ☐  │  ☐  │   ☐   │    ☐     ││
│  │ ├─ Reportes         │ ☑  │  -  │  -  │   -   │    -     ││
│  │ └─ Notificaciones   │ ☐  │  ☐  │  ☐  │   ☐   │    -     ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ SISTEMA                                                     ││
│  │ ├─ Logs             │ ☐  │  -  │  -  │   -   │    -     ││
│  │ ├─ Roles            │ ☐  │  ☐  │  ☐  │   ☐   │    -     ││
│  │ ├─ Base de datos    │ ☐  │  ☐  │  ☐  │   ☐   │    -     ││
│  │ └─ Integraciones    │ ☐  │  ☐  │  ☐  │   ☐   │    -     ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ─────────────────────────────────────────                      │
│  USUARIOS CON ESTE ROL (3)                                      │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  • María Contenidos (maria@oit.org)                             │
│  • Pedro Editor (pedro@untref.edu)                              │
│  • Ana Cursos (ana@inti.gob.ar)                                 │
│                                                                  │
│  ⚠️ Los cambios afectarán a estos 3 usuarios                    │
│                                                                  │
│  [Cancelar]                         [    GUARDAR ROL    ]       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 54. ADMIN - CARGAR INFORME DE AUDITORÍA

**Ruta:** `/admin/auditorias/[id]/informe`
**Propósito:** Documentar resultados de una auditoría presencial

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER ADMIN]                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ← Volver a auditorías                                          │
│                                                                  │
│  Cargar Informe de Auditoría                                    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Taller: Corte Sur SRL                                       ││
│  │ Fecha: 12/02/2026 10:00                                     ││
│  │ Auditor: Juan García                                        ││
│  │ Tipo: Verificación de habilitaciones                        ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ─────────────────────────────────────────                      │
│  CHECKLIST DE VERIFICACIÓN                                      │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  INSTALACIONES                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ☑ Local en condiciones adecuadas de higiene                ││
│  │ ☑ Ventilación apropiada                                    ││
│  │ ☑ Iluminación suficiente                                   ││
│  │ ☐ Salida de emergencia señalizada                          ││
│  │ ☑ Matafuegos vigentes y accesibles                         ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  DOCUMENTACIÓN                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ☑ Habilitación municipal exhibida                          ││
│  │ ☑ Constancia CUIT visible                                  ││
│  │ ☑ Póliza ART disponible                                    ││
│  │ ☑ Libro de sueldos al día                                  ││
│  │ ☐ Certificado de bomberos (no aplica en esta jurisdicción) ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  PERSONAL                                                       │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ☑ Empleados registrados coinciden con declaración          ││
│  │ ☑ Uso de EPP adecuado                                      ││
│  │ ☑ Capacitación en seguridad realizada                      ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ─────────────────────────────────────────                      │
│  OBSERVACIONES                                                  │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  Observaciones generales                                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Taller en muy buenas condiciones. Falta señalización de   │ │
│  │ salida de emergencia, se recomendó colocar cartel antes   │ │
│  │ de próxima visita. Responsable se comprometió a           │ │
│  │ solucionarlo en 15 días.                                   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  EVIDENCIA FOTOGRÁFICA                                          │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────────┐   │
│  │ 📷      │ │ 📷      │ │ 📷      │ │                     │   │
│  │ Frente  │ │ Interior│ │ Matafueg│ │  [+ Agregar foto]   │   │
│  │ [🗑️]    │ │ [🗑️]    │ │ [🗑️]    │ │                     │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────────────────┘   │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  RESULTADO                                                      │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ○ ✅ Aprobado sin observaciones                               │
│  ● ⚠️ Aprobado con observaciones menores                       │
│  ○ 🔄 Requiere nueva visita                                    │
│  ○ ❌ No aprobado                                               │
│                                                                  │
│  Fecha de seguimiento (si aplica)                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 27/02/2026                                                 │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  [Guardar borrador]                 [    ENVIAR INFORME    ]    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 55. ADMIN - DETALLE DE ENVÍO DE NOTIFICACIÓN

**Ruta:** `/admin/notificaciones/[id]`
**Propósito:** Ver métricas y detalles de un envío masivo

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER ADMIN]                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ← Volver a notificaciones                                      │
│                                                                  │
│  Detalle de Envío                                               │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 📧 Nuevo curso disponible: Control de calidad               ││
│  │                                                              ││
│  │ Enviado: 01/02/2026 14:30                                   ││
│  │ Canal: Email                                                 ││
│  │ Segmento: Talleres (todos los niveles)                      ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ─────────────────────────────────────────                      │
│  MÉTRICAS DE ENVÍO                                              │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  │     24      │ │     22      │ │     18      │ │     12      │
│  │  Enviados   │ │ Entregados  │ │  Abiertos   │ │   Clicks    │
│  │             │ │   (92%)     │ │   (75%)     │ │   (50%)     │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
│                                                                  │
│  ┌─────────────┐ ┌─────────────┐                               │
│  │      2      │ │      0      │                               │
│  │  Rebotados  │ │   Spam      │                               │
│  │   (8%)      │ │   (0%)      │                               │
│  └─────────────┘ └─────────────┘                               │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  ENGAGEMENT POR HORA                                            │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Aperturas                                                   ││
│  │  12 │            ████                                       ││
│  │   8 │       ████ ████ ██                                    ││
│  │   4 │  ██   ████ ████ ████ ██                               ││
│  │     └──14h───15h───16h───17h───18h───19h───                 ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ─────────────────────────────────────────                      │
│  DETALLE POR DESTINATARIO                                       │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🔍 Buscar destinatario...                                   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Filtrar: [Todos ▼]  [Abiertos ▼]  [Con click ▼]               │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Destinatario            │ Estado    │ Abierto  │ Clicks    ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ juan@cortesur.com.ar    │ ✅ Entreg │ 14:35    │ 2 clicks  ││
│  │ Corte Sur SRL           │           │ (5 min)  │           ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ maria@talleraguja.com   │ ✅ Entreg │ 15:20    │ 1 click   ││
│  │ Taller La Aguja         │           │ (50 min) │           ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ pedro@coop8marzo.org    │ ✅ Entreg │ -        │ -         ││
│  │ Coop. 8 de Marzo        │           │ No abrió │           ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ana@tallernuevo.com     │ ❌ Rebote │ -        │ -         ││
│  │ Taller Nuevo            │ Email no  │          │           ││
│  │                         │ existe    │          │           ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [Exportar métricas CSV]    [Reenviar a no abiertos]            │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  CONTENIDO ENVIADO                                              │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Asunto: Nuevo curso disponible: Control de calidad          ││
│  │                                                              ││
│  │ Hola {nombre},                                              ││
│  │                                                              ││
│  │ Te contamos que hay un nuevo curso disponible en la         ││
│  │ Academia: "Control de calidad" del INTI.                    ││
│  │                                                              ││
│  │ [Ver curso]                                                  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 56. ADMIN - EJECUTAR CONSULTAS SQL

**Ruta:** `/admin/database/query`
**Propósito:** Ejecutar consultas SQL directas (solo super admin)

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER ADMIN]                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ⚠️ Ejecutar Consultas SQL                                      │
│  SOLO SUPER ADMIN - Usar con precaución                         │
│                                                                  │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐         │
│  │ Explorador    │ │ Consultas     │ │ Backups       │         │
│  │               │ │   (activo)    │ │               │         │
│  └───────────────┘ └───────────────┘ └───────────────┘         │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  EDITOR SQL                                                     │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 1  SELECT                                                   ││
│  │ 2    t.nombre,                                              ││
│  │ 3    t.nivel,                                               ││
│  │ 4    COUNT(c.id) as certificados                            ││
│  │ 5  FROM talleres t                                          ││
│  │ 6  LEFT JOIN certificados c ON c.taller_id = t.id           ││
│  │ 7  GROUP BY t.id                                            ││
│  │ 8  ORDER BY certificados DESC                               ││
│  │ 9  LIMIT 10;                                                ││
│  │ 10 _                                                        ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [▶ Ejecutar (Ctrl+Enter)]  [Formatear SQL]  [Limpiar]         │
│                                                                  │
│  ☑ Modo solo lectura (SELECT únicamente)                       │
│  ☐ Permitir modificaciones (UPDATE, DELETE, INSERT)            │
│     ⚠️ Requiere confirmación adicional                         │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  RESULTADOS (10 filas en 45ms)                                  │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ nombre              │ nivel   │ certificados               ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ Corte Sur SRL       │ oro     │ 4                          ││
│  │ Taller La Aguja     │ plata   │ 3                          ││
│  │ Confecciones López  │ oro     │ 3                          ││
│  │ Coop. 8 de Marzo    │ plata   │ 2                          ││
│  │ Textil Norte        │ bronce  │ 1                          ││
│  │ ...                 │         │                            ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [Exportar CSV]  [Exportar JSON]  [Copiar resultados]          │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  CONSULTAS GUARDADAS                                            │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ⭐ Talleres por nivel                              [Cargar] ││
│  │ ⭐ Certificados del mes                            [Cargar] ││
│  │ ⭐ Usuarios inactivos (>30 días)                   [Cargar] ││
│  │ ⭐ Cursos más completados                          [Cargar] ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [+ Guardar consulta actual]                                    │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  HISTORIAL RECIENTE                                             │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 10:32 │ SELECT * FROM talleres WHERE nivel = 'oro'  [▶]    ││
│  │ 10:28 │ SELECT COUNT(*) FROM certificados           [▶]    ││
│  │ 10:15 │ SELECT * FROM logs ORDER BY created...      [▶]    ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 57. ADMIN - GESTIÓN DE BACKUPS

**Ruta:** `/admin/database/backups`
**Propósito:** Crear, programar y restaurar backups de la base de datos

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER ADMIN]                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Gestión de Backups                                             │
│  Copias de seguridad de la base de datos                        │
│                                                                  │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐         │
│  │ Explorador    │ │ Consultas     │ │ Backups       │         │
│  │               │ │               │ │   (activo)    │         │
│  └───────────────┘ └───────────────┘ └───────────────┘         │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  ESTADO ACTUAL                                                  │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Último backup: 04/02/2026 09:30 ✅                          ││
│  │ Tamaño de la BD: 125 MB                                     ││
│  │ Backups almacenados: 14                                     ││
│  │ Espacio usado: 1.2 GB de 5 GB                               ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [🔄 Crear backup ahora]                                        │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  PROGRAMACIÓN AUTOMÁTICA                                        │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ☑ Backup automático activado                                  │
│                                                                  │
│  Frecuencia                                                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Diario                                                  ▼ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Hora de ejecución                                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 03:00                                                   ▼ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Retención                                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Últimos 14 días                                         ▼ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  [Guardar programación]                                         │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  BACKUPS DISPONIBLES                                            │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Fecha            │ Tamaño │ Tipo      │ Estado  │ Acciones ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 04/02/26 09:30   │ 125 MB │ Automático│ ✅ OK   │[⬇️][🔄][🗑️]│
│  │ 03/02/26 03:00   │ 123 MB │ Automático│ ✅ OK   │[⬇️][🔄][🗑️]│
│  │ 02/02/26 03:00   │ 120 MB │ Automático│ ✅ OK   │[⬇️][🔄][🗑️]│
│  │ 01/02/26 15:45   │ 118 MB │ Manual    │ ✅ OK   │[⬇️][🔄][🗑️]│
│  │ 01/02/26 03:00   │ 118 MB │ Automático│ ✅ OK   │[⬇️][🔄][🗑️]│
│  │ ...              │        │           │         │           ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ⬇️ = Descargar   🔄 = Restaurar   🗑️ = Eliminar                │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  RESTAURAR BACKUP (modal al presionar 🔄)                       │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ⚠️ ¿Restaurar backup del 01/02/26 15:45?                   ││
│  │                                                              ││
│  │ Esta acción:                                                 ││
│  │ • Reemplazará TODOS los datos actuales                      ││
│  │ • Creará un backup del estado actual antes de restaurar     ││
│  │ • Puede tardar varios minutos                               ││
│  │                                                              ││
│  │ Escribí "RESTAURAR" para confirmar:                         ││
│  │ ┌──────────────────────────────────────────────────────┐    ││
│  │ │                                                      │    ││
│  │ └──────────────────────────────────────────────────────┘    ││
│  │                                                              ││
│  │ [Cancelar]                           [Restaurar backup]     ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 58. ADMIN - CONFIGURACIÓN TEMPLATES EMAIL

**Ruta:** `/admin/configuracion/emails`
**Propósito:** Editar plantillas de emails del sistema

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER ADMIN]                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Templates de Email                                             │
│  Plantillas de emails automáticos del sistema                   │
│                                                                  │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐         │
│  │ General       │ │ Emails        │ │ Integraciones │         │
│  │               │ │   (activo)    │ │               │         │
│  └───────────────┘ └───────────────┘ └───────────────┘         │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  TEMPLATES DISPONIBLES                                          │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 📧 Bienvenida - Registro completado             [Editar]   ││
│  │    Se envía cuando un usuario completa el registro          ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 📧 Verificar email                              [Editar]   ││
│  │    Código de verificación de email                          ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 📧 Restablecer contraseña                       [Editar]   ││
│  │    Link para recuperar contraseña                           ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 📧 Documento aprobado                           [Editar]   ││
│  │    Notificación de documento aprobado                       ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 📧 Documento rechazado                          [Editar]   ││
│  │    Notificación con motivo de rechazo                       ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 📧 Documento por vencer                         [Editar]   ││
│  │    Recordatorio de vencimiento próximo                      ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 📧 Certificado emitido                          [Editar]   ││
│  │    Felicitaciones + link de descarga                        ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 📧 Nuevo mensaje de marca                       [Editar]   ││
│  │    Una marca contactó al taller                             ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ─────────────────────────────────────────                      │
│  EDITOR DE TEMPLATE: Bienvenida                                 │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  Asunto del email *                                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ¡Bienvenido/a a la Plataforma Digital Textil, {{nombre}}! │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌──────────────────────┬──────────────────────────────────────┐│
│  │ EDITOR              │ PREVIEW                              ││
│  ├──────────────────────┼──────────────────────────────────────┤│
│  │ Hola **{{nombre}}**, │ Hola Juan,                          ││
│  │                      │                                      ││
│  │ Tu registro en la    │ Tu registro en la Plataforma        ││
│  │ Plataforma Digital   │ Digital Textil fue exitoso.         ││
│  │ Textil fue exitoso.  │                                      ││
│  │                      │ Próximos pasos:                      ││
│  │ Próximos pasos:      │ 1. Completá tu perfil               ││
│  │ 1. Completá tu perfil│ 2. Subí tus documentos              ││
│  │ 2. Subí documentos   │ 3. Explorá los cursos               ││
│  │ 3. Explorá cursos    │                                      ││
│  │                      │ [Ir a mi dashboard]                  ││
│  │ {{boton:Ir a mi      │                                      ││
│  │ dashboard:{{url}}}}  │ ─────────────────────                ││
│  │                      │ Plataforma Digital Textil            ││
│  │ ---                  │ OIT Argentina - UNTREF               ││
│  │ {{firma}}            │                                      ││
│  └──────────────────────┴──────────────────────────────────────┘│
│                                                                  │
│  VARIABLES DISPONIBLES                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ {{nombre}} - Nombre del usuario                             ││
│  │ {{email}} - Email del usuario                               ││
│  │ {{empresa}} - Nombre del taller/marca                       ││
│  │ {{url}} - URL del dashboard                                 ││
│  │ {{boton:texto:url}} - Botón con link                        ││
│  │ {{firma}} - Firma estándar de la plataforma                 ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [Enviar preview a mi email]    [    GUARDAR TEMPLATE    ]      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## WIZARD: COMPLETAR PERFIL PRODUCTIVO (Taller)

> Flujo conversacional y pedagógico para capturar información detallada del taller.
> Se usa en el onboarding inicial y es accesible desde el dashboard.
> Objetivo: Capturar datos reales de capacidad productiva mientras se educa al taller.

---

### 59. WIZARD PERFIL - BIENVENIDA

**Ruta:** `/taller/perfil/completar`
**Propósito:** Introducción al wizard, explicar qué se va a hacer

```
┌─────────────────────────────────────────────────────────────────┐
│ [HEADER MÍNIMO - Logo PDT]                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                                                                  │
│                    ┌────────────────────┐                       │
│                    │     🏭             │                       │
│                    │  PERFIL PRODUCTIVO │                       │
│                    └────────────────────┘                       │
│                                                                  │
│              Vamos a completar tu perfil productivo             │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                              ││
│  │  ⏱️ Duración: ~15 minutos                                   ││
│  │                                                              ││
│  │  📚 Vas a aprender:                                         ││
│  │     • Cómo calcular tu capacidad REAL                       ││
│  │     • Qué es el SAM y por qué importa                       ││
│  │     • Cómo mejorar tu eficiencia                            ││
│  │                                                              ││
│  │  🎯 Al terminar vas a tener:                                ││
│  │     • Tu capacidad calculada con fórmula de industria       ││
│  │     • Un score que te compara con otros talleres            ││
│  │     • Recomendaciones personalizadas para mejorar           ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │
│  │  1  │ │  2  │ │  3  │ │  4  │ │  5  │ │  6  │ │  7  │      │
│  │  ○  │ │  ○  │ │  ○  │ │  ○  │ │  ○  │ │  ○  │ │  ○  │      │
│  │Máq. │ │Equip│ │Org. │ │SAM  │ │Efic.│ │Gest.│ │Resum│      │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 💡 Podés pausar en cualquier momento y retomar después.     ││
│  │    Tu progreso se guarda automáticamente.                   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│              [    EMPEZAR    ]                                  │
│                                                                  │
│              [Completar más tarde]                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 60. WIZARD PERFIL - MAQUINARIA

**Ruta:** `/taller/perfil/completar/maquinaria`
**Propósito:** Capturar máquinas por tipo y cantidad

```
┌─────────────────────────────────────────────────────────────────┐
│  Progreso: ████░░░░░░░░░░░░░░░░░░░░░░░░░░ 10%                   │
│  Módulo 1 de 7: Maquinaria                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ¿Qué máquinas de confección tenés?                            │
│                                                                  │
│  Hacé click en cada tipo y poné la cantidad:                   │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ 🧵 Recta        │  │ 🔄 Overlock     │  │ ⚡ Fileteadora  │ │
│  │    industrial   │  │    5 hilos      │  │                 │ │
│  │                 │  │                 │  │                 │ │
│  │   Cantidad:     │  │   Cantidad:     │  │   Cantidad:     │ │
│  │   ┌─────────┐   │  │   ┌─────────┐   │  │   ┌─────────┐   │ │
│  │   │    3    │   │  │   │    2    │   │  │   │    0    │   │ │
│  │   └─────────┘   │  │   └─────────┘   │  │   └─────────┘   │ │
│  │   ☑ Tengo      │  │   ☑ Tengo      │  │   ☐ Tengo      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ 🎀 Collareta    │  │ ✂️ Cortadora    │  │ 🔥 Plancha      │ │
│  │                 │  │    vertical     │  │    industrial   │ │
│  │   Cantidad:     │  │   Cantidad:     │  │   Cantidad:     │ │
│  │   ┌─────────┐   │  │   ┌─────────┐   │  │   ┌─────────┐   │ │
│  │   │    1    │   │  │   │    1    │   │  │   │    1    │   │ │
│  │   └─────────┘   │  │   └─────────┘   │  │   └─────────┘   │ │
│  │   ☑ Tengo      │  │   ☑ Tengo      │  │   ☑ Tengo      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ [+ Agregar otra máquina que no está en la lista]            ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 💡 APRENDÉ: ¿Por qué importa esto?                          ││
│  │                                                              ││
│  │ Cada máquina contribuye a tu capacidad productiva.          ││
│  │ Con esta información calculamos tu potencial REAL,          ││
│  │ no un número inventado.                                     ││
│  │                                                              ││
│  │ 📊 Dato: El 70% de talleres tiene entre 3-8 máquinas.       ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [← Atrás]                              [Siguiente →]           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Badge al completar:** 🏅 "Perfil técnico iniciado"

---

### 61. WIZARD PERFIL - EQUIPO (Cantidad y Roles)

**Ruta:** `/taller/perfil/completar/equipo`
**Propósito:** Capturar información del equipo humano

```
┌─────────────────────────────────────────────────────────────────┐
│  Progreso: ████████░░░░░░░░░░░░░░░░░░░░░░ 20%                   │
│  Módulo 2 de 7: Tu equipo                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Contanos sobre tu equipo de trabajo                           │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  ¿Cuántas personas trabajan en producción?                     │
│  (sin contar administración)                                   │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                              ││
│  │   1-2        3-5        6-10       11-20       +20          ││
│  │                                                              ││
│  │    ○          ●          ○          ○           ○           ││
│  │                                                              ││
│  │  Micro     Pequeño    Mediano    Grande    Industrial       ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 📊 El 70% de talleres en Argentina tienen 3-10 personas.    ││
│  │    Tu tamaño afecta qué tipo de pedidos podés tomar.        ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ─────────────────────────────────────────                      │
│  ¿Qué roles tenés en tu equipo?                                │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐│
│  │ ✂️ Cortador/a    │ │ 🧵 Costurero/a   │ │ 👔 Terminación   ││
│  │                  │ │                  │ │   / Planchado    ││
│  │ Cantidad: [1]    │ │ Cantidad: [3]    │ │ Cantidad: [1]    ││
│  │ ☑ Tengo         │ │ ☑ Tengo         │ │ ☑ Tengo         ││
│  └──────────────────┘ └──────────────────┘ └──────────────────┘│
│                                                                  │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐│
│  │ 👁️ Control       │ │ 📋 Encargado/a   │ │ 🚚 Logística     ││
│  │    calidad       │ │    / Supervisor  │ │    / Despacho    ││
│  │ Cantidad: [0]    │ │ Cantidad: [1]    │ │ Cantidad: [0]    ││
│  │ ☐ Tengo         │ │ ☑ Tengo         │ │ ☐ Tengo         ││
│  └──────────────────┘ └──────────────────┘ └──────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 📊 Tu estructura: 5 personas + encargado                    ││
│  │    Distribución típica para talleres de tu tamaño ✅        ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [← Atrás]                              [Siguiente →]           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 62. WIZARD PERFIL - EQUIPO (Experiencia)

**Ruta:** `/taller/perfil/completar/equipo-experiencia`
**Propósito:** Capturar experiencia y polivalencia del equipo

```
┌─────────────────────────────────────────────────────────────────┐
│  Progreso: ██████████░░░░░░░░░░░░░░░░░░░░ 28%                   │
│  Módulo 2 de 7: Tu equipo (continuación)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ¿Cuánta experiencia tiene tu equipo?                          │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 💡 La experiencia impacta directamente en velocidad y       ││
│  │    calidad. Un equipo experimentado puede producir          ││
│  │    hasta 30% más que uno nuevo.                             ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Experiencia PROMEDIO del equipo en el rubro textil:           │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                              ││
│  │   Menos de       1-3          3-5         Más de            ││
│  │    1 año        años         años         5 años            ││
│  │                                                              ││
│  │      ○            ○            ●            ○                ││
│  │                                                              ││
│  │   Novato       Junior     Intermedio     Experto            ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ─────────────────────────────────────────                      │
│  ¿Tu equipo puede rotar entre diferentes tareas?               │
│  (polivalencia)                                                │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ○ No, cada uno hace SOLO su tarea específica                  │
│    (especialización total)                                     │
│                                                                  │
│  ● Algunos pueden hacer varias tareas                          │
│    (polivalencia parcial)                                      │
│                                                                  │
│  ○ Sí, todos pueden hacer de todo                              │
│    (polivalencia total)                                        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 💡 La polivalencia te da flexibilidad para:                 ││
│  │    • Adaptarte a diferentes tipos de pedidos                ││
│  │    • Cubrir ausencias sin parar la producción               ││
│  │    • Balancear la carga de trabajo                          ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ─────────────────────────────────────────                      │
│  ¿Cuánto tiempo lleva tu empleado más antiguo?                 │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 4 años                                                  ▼ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ✅ Buena retención de personal (4+ años)                    ││
│  │    Esto indica estabilidad y buen ambiente de trabajo.      ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [← Atrás]                              [Siguiente →]           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Badge al completar:** 🏅 "Equipo identificado"

---

### 63. WIZARD PERFIL - ORGANIZACIÓN

**Ruta:** `/taller/perfil/completar/organizacion`
**Propósito:** Capturar tipo de producción y organización del espacio

```
┌─────────────────────────────────────────────────────────────────┐
│  Progreso: ████████████░░░░░░░░░░░░░░░░░░ 38%                   │
│  Módulo 3 de 7: Organización                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ¿Cómo organizan el trabajo?                                   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 📚 APRENDÉ: Tipos de organización productiva                ││
│  │                                                              ││
│  │ 🔄 EN LÍNEA: Cada persona hace UNA operación y pasa        ││
│  │    la prenda al siguiente. Más rápido para grandes          ││
│  │    volúmenes, menos flexible para cambios.                  ││
│  │                                                              ││
│  │ 📦 MODULAR: Grupos pequeños hacen varias operaciones.       ││
│  │    Balance entre velocidad y flexibilidad. Ideal para       ││
│  │    pedidos medianos con variedad.                           ││
│  │                                                              ││
│  │ 👤 PRENDA COMPLETA: Cada persona hace toda la prenda.       ││
│  │    Más lento pero mayor control de calidad.                 ││
│  │    Típico en talleres muy pequeños o alta costura.          ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ¿Cómo trabajan ustedes principalmente?                        │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  🔄 EN LÍNEA                                               │ │
│  │     Cada uno hace una operación específica                 │ │
│  │     (ej: corte → costura → terminación)                    │ │
│  │     ○                                                      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  📦 MODULAR                                      ← Tu caso │ │
│  │     Grupos hacen varias operaciones juntas                 │ │
│  │     (más común en talleres medianos)                       │ │
│  │     ●                                                      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  👤 PRENDA COMPLETA                                        │ │
│  │     Cada persona hace la prenda de principio a fin         │ │
│  │     (típico en talleres muy chicos)                        │ │
│  │     ○                                                      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ✅ Organización modular con 5 personas es una buena        ││
│  │    combinación para flexibilidad y productividad.          ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [← Atrás]                              [Siguiente →]           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 64. WIZARD PERFIL - ESPACIO FÍSICO

**Ruta:** `/taller/perfil/completar/espacio`
**Propósito:** Capturar información del espacio de trabajo

```
┌─────────────────────────────────────────────────────────────────┐
│  Progreso: ██████████████░░░░░░░░░░░░░░░░ 45%                   │
│  Módulo 3 de 7: Organización (continuación)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ¿Cómo es tu espacio de trabajo?                               │
│                                                                  │
│  Metros cuadrados aproximados del área de producción:          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 80                                                      m² │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 📊 80 m² con 5 personas = 16 m² por persona                 ││
│  │                                                              ││
│  │ Recomendado: 10-15 m² por persona (mínimo)                  ││
│  │ ✅ Tenés espacio adecuado para tu equipo                    ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ─────────────────────────────────────────                      │
│  ¿Tenés áreas separadas para cada proceso?                     │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ☑ Área de corte                                            ││
│  │   Espacio dedicado para cortar tela                        ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ☑ Área de confección                                       ││
│  │   Donde están las máquinas de coser                        ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ☐ Área de terminación / planchado                          ││
│  │   Espacio para terminaciones y planchado final             ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ☑ Almacén de insumos                                       ││
│  │   Espacio para guardar tela, hilos, etc.                   ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ☐ Área de control de calidad                               ││
│  │   Mesa o espacio para revisar prendas terminadas           ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 💡 Tener áreas separadas mejora el flujo de trabajo y      ││
│  │    reduce errores. Las marcas lo valoran al visitarte.     ││
│  │                                                              ││
│  │ 💡 Tip: No tenés área de control de calidad dedicada.      ││
│  │    Considerá asignar una mesa para revisión final.         ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [← Atrás]                              [Siguiente →]           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Badge al completar:** 🏅 "Organización mapeada"

---

### 65. WIZARD PERFIL - SAM (Tiempo por prenda)

**Ruta:** `/taller/perfil/completar/sam`
**Propósito:** Capturar SAM y explicar el concepto

```
┌─────────────────────────────────────────────────────────────────┐
│  Progreso: ████████████████░░░░░░░░░░░░░░ 55%                   │
│  Módulo 4 de 7: SAM - Tiempo por prenda                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ¿Cuánto tardás en promedio en hacer una prenda?               │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 📚 APRENDÉ: ¿Qué es el SAM?                                 ││
│  │                                                              ││
│  │ SAM = "Standard Allowed Minutes"                            ││
│  │ Es el tiempo estándar para confeccionar una prenda.         ││
│  │                                                              ││
│  │ ¿Por qué importa?                                           ││
│  │ • Es la base para calcular tu capacidad REAL                ││
│  │ • Permite compararte con otros talleres                     ││
│  │ • Las marcas lo usan para planificar producción             ││
│  │                                                              ││
│  │ Ejemplos típicos en Argentina:                              ││
│  │ ┌────────────────────────────────────────────────────────┐  ││
│  │ │ 👕 Remera básica:        10-15 min                     │  ││
│  │ │ 👖 Jean con bolsillos:   25-35 min                     │  ││
│  │ │ 👔 Camisa:               20-30 min                     │  ││
│  │ │ 🧥 Campera:              40-60 min                     │  ││
│  │ │ 🩳 Short:                12-18 min                     │  ││
│  │ │ 👗 Vestido simple:       20-30 min                     │  ││
│  │ └────────────────────────────────────────────────────────┘  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ─────────────────────────────────────────                      │
│  Para tu producto PRINCIPAL:                                   │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ¿Qué prenda hacés más?                                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Jean / Pantalón de jean                                 ▼ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ¿Cuántos minutos tardás en promedio? (SAM)                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 28                                                     min │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 📊 Talleres similares al tuyo: 25-32 min para jean          ││
│  │ ✅ Tu tiempo (28 min) está en el rango normal               ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [← Atrás]                              [Siguiente →]           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 66. WIZARD PERFIL - SAM (Quiz pedagógico)

**Ruta:** `/taller/perfil/completar/sam-quiz`
**Propósito:** Validar comprensión del concepto SAM

```
┌─────────────────────────────────────────────────────────────────┐
│  Progreso: ██████████████████░░░░░░░░░░░░ 60%                   │
│  Módulo 4 de 7: SAM - Verificación                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📝 Verificamos que entendiste el concepto                     │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  ¿Qué significa SAM?                                           │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  ○  Salario Anual Mínimo                                   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  ●  Minutos estándar para confeccionar una prenda   ✅     │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  ○  Sistema de Acceso a Maquinaria                         │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ✅ ¡Correcto!                                               ││
│  │                                                              ││
│  │ SAM (Standard Allowed Minutes) es el tiempo estándar        ││
│  │ para confeccionar una prenda. Es clave porque:              ││
│  │                                                              ││
│  │ 📊 Tu capacidad = Minutos disponibles ÷ SAM × Eficiencia   ││
│  │                                                              ││
│  │ Ejemplo con tus datos:                                      ││
│  │ 480 min/día ÷ 28 min/prenda × 50% = 8.5 prendas/máq/día    ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ─────────────────────────────────────────                      │
│  ¿Hacés otros productos además de jean?                        │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ☑ Pantalón de vestir (SAM: 22 min)                           │
│  ☐ Remera                                                      │
│  ☐ Camisa                                                      │
│  ☐ Campera                                                     │
│  ☑ Short / Bermuda (SAM: 15 min)                              │
│  ☐ Otro: __________                                            │
│                                                                  │
│  [← Atrás]                              [Siguiente →]           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Badge al completar:** 🏅 "SAM calculado"

---

### 67. WIZARD PERFIL - EFICIENCIA

**Ruta:** `/taller/perfil/completar/eficiencia`
**Propósito:** Capturar datos para calcular eficiencia real

```
┌─────────────────────────────────────────────────────────────────┐
│  Progreso: ████████████████████░░░░░░░░░░ 70%                   │
│  Módulo 5 de 7: Eficiencia                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Ahora calculemos tu eficiencia real                           │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 📚 APRENDÉ: ¿Por qué importa la eficiencia?                 ││
│  │                                                              ││
│  │ Tener 10 máquinas NO significa producir 10x.                ││
│  │                                                              ││
│  │ La eficiencia real en Argentina promedia 50%.               ││
│  │ Esto significa que si tu capacidad teórica es 100 prendas,  ││
│  │ probablemente produzcas ~50.                                ││
│  │                                                              ││
│  │ Factores que REDUCEN eficiencia:                            ││
│  │ • Cambios de modelo/color durante el día                    ││
│  │ • Paradas por falta de insumos                              ││
│  │ • Capacitación de personal nuevo                            ││
│  │ • Mantenimiento/reparación de máquinas                      ││
│  │ • Ausentismo                                                ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ─────────────────────────────────────────                      │
│  Respondé estas preguntas:                                     │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ¿Cuántas horas por día trabaja tu taller?                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 8 horas                                                 ▼ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ¿Cuántos cambios de modelo/color hacés por día en promedio?   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 2-3 cambios                                             ▼ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ¿Tenés paradas frecuentes? (falta insumos, máquinas, etc.)    │
│                                                                  │
│  ○ Casi nunca (menos de 30 min/día)                            │
│  ● A veces (30-60 min/día)                                     │
│  ○ Frecuentemente (más de 1 hora/día)                          │
│                                                                  │
│  [← Atrás]                              [Siguiente →]           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 68. WIZARD PERFIL - RESULTADO CAPACIDAD

**Ruta:** `/taller/perfil/completar/capacidad-resultado`
**Propósito:** Mostrar cálculo de capacidad con fórmula real

```
┌─────────────────────────────────────────────────────────────────┐
│  Progreso: ██████████████████████░░░░░░░░ 75%                   │
│  Módulo 5 de 7: Tu capacidad calculada                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🎯 TU CAPACIDAD CALCULADA                                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                              ││
│  │  Basado en tus datos:                                       ││
│  │  ┌────────────────────────────────────────────────────────┐ ││
│  │  │ • 6 máquinas de confección                             │ ││
│  │  │ • 5 operarios                                          │ ││
│  │  │ • SAM promedio: 28 min (jean)                          │ ││
│  │  │ • 8 horas/día de trabajo                               │ ││
│  │  │ • 2-3 cambios de modelo/día                            │ ││
│  │  │ • Paradas ocasionales                                  │ ││
│  │  └────────────────────────────────────────────────────────┘ ││
│  │                                                              ││
│  │  ─────────────────────────────────────────                  ││
│  │  FÓRMULA:                                                   ││
│  │  Capacidad = (Min disponibles ÷ SAM) × Eficiencia × Máquinas││
│  │  ─────────────────────────────────────────                  ││
│  │                                                              ││
│  │  Tu cálculo:                                                ││
│  │  (480 min ÷ 28 min) × 52% × 6 máq = 53 prendas/día         ││
│  │                                                              ││
│  │  ┌────────────────────────────────────────────────────────┐ ││
│  │  │                                                        │ ││
│  │  │     📊 TU CAPACIDAD REAL ESTIMADA:                     │ ││
│  │  │                                                        │ ││
│  │  │           53 prendas/día                               │ ││
│  │  │          ≈ 1,100 prendas/mes                           │ ││
│  │  │                                                        │ ││
│  │  │     Eficiencia estimada: 52%                           │ ││
│  │  │                                                        │ ││
│  │  └────────────────────────────────────────────────────────┘ ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 💡 ¿Cómo mejorar?                                           ││
│  │                                                              ││
│  │ Si mejorás tu eficiencia de 52% a 60%:                      ││
│  │ → +8 prendas/día = +170 prendas/mes (+15%)                  ││
│  │                                                              ││
│  │ Formas de mejorar eficiencia:                               ││
│  │ • Reducir cambios de modelo (agrupar pedidos similares)     ││
│  │ • Mantener stock mínimo de insumos                          ││
│  │ • Mantenimiento preventivo de máquinas                      ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ¿Este número te parece correcto para tu taller?               │
│                                                                  │
│  ○ Sí, es bastante preciso                                     │
│  ● Produzco un poco más que esto                               │
│  ○ Produzco un poco menos que esto                             │
│                                                                  │
│  [← Atrás]                              [Siguiente →]           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Badge al completar:** 🏅 "Capacidad calculada"

---

### 69. WIZARD PERFIL - GESTIÓN

**Ruta:** `/taller/perfil/completar/gestion`
**Propósito:** Capturar información de gestión y escalabilidad

```
┌─────────────────────────────────────────────────────────────────┐
│  Progreso: ████████████████████████░░░░░░ 85%                   │
│  Módulo 6 de 7: Gestión y escalabilidad                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Algunas preguntas sobre cómo gestionás tu taller              │
│                                                                  │
│  ─────────────────────────────────────────                      │
│  HORARIOS                                                       │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ¿Cómo es tu horario de trabajo habitual?                      │
│                                                                  │
│  ○ Turno único (8 horas fijas)                                 │
│  ● Turno extendido (10-12 horas cuando hay demanda)            │
│  ○ Doble turno (mañana y tarde con equipos diferentes)         │
│                                                                  │
│  ¿Con qué frecuencia hacen horas extras?                       │
│                                                                  │
│  ○ Nunca / Casi nunca                                          │
│  ● A veces (cuando hay pedidos grandes)                        │
│  ○ Frecuentemente (casi todas las semanas)                     │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 💡 Las horas extras ocasionales son normales.               ││
│  │    Si son MUY frecuentes, puede indicar que necesitás       ││
│  │    más capacidad instalada (más máquinas o personal).       ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ─────────────────────────────────────────                      │
│  REGISTRO DE PRODUCCIÓN                                        │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  ¿Llevan registro de producción diaria?                        │
│                                                                  │
│  ○ No llevamos registro                                        │
│  ○ Anotamos en papel/cuaderno                                  │
│  ● Usamos planilla Excel o similar                             │
│  ○ Tenemos sistema/software especializado                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 📊 El 60% de talleres no lleva registro formal.             ││
│  │    Llevarlo te permite identificar cuellos de botella       ││
│  │    y mejorar tu eficiencia con datos reales.                ││
│  │                                                              ││
│  │ 📥 Descargá nuestra planilla gratuita de control            ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ─────────────────────────────────────────                      │
│  ESCALABILIDAD                                                  │
│  ─────────────────────────────────────────                      │
│                                                                  │
│  Si mañana te piden el DOBLE de producción, ¿cómo responderías?│
│                                                                  │
│  ○ No podría, estoy al máximo de capacidad                     │
│  ○ Podría con horas extras del equipo actual                   │
│  ● Podría contratar más gente temporalmente                    │
│  ○ Podría agregar un turno adicional                           │
│  ○ Podría tercerizar parte a otro taller conocido              │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 💡 Las marcas valoran saber que podés escalar.              ││
│  │    Esto te abre puertas a pedidos más grandes.              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [← Atrás]                              [Siguiente →]           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Badge al completar:** 🏅 "Gestión evaluada"

---

### 70. WIZARD PERFIL - RESUMEN Y SCORE

**Ruta:** `/taller/perfil/completar/resumen`
**Propósito:** Mostrar resumen, score, posición y recomendaciones

```
┌─────────────────────────────────────────────────────────────────┐
│  Progreso: ████████████████████████████ 100% ✅                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🎉 ¡PERFIL COMPLETADO!                                         │
│                                                                  │
│  ═══════════════════════════════════════════════════════════   │
│  TU PERFIL PRODUCTIVO                                          │
│  ═══════════════════════════════════════════════════════════   │
│                                                                  │
│  ┌──────────────────────┐  ┌────────────────────────────────┐  │
│  │                      │  │                                │  │
│  │    ┌──────────┐      │  │ CAPACIDAD                      │  │
│  │   /    78     \      │  │ ─────────────────────────────  │  │
│  │  │     %      │      │  │ Diaria:    53 prendas          │  │
│  │   \          /       │  │ Mensual:   1,100 prendas       │  │
│  │    └──────────┘      │  │ Pico:      1,400 (c/extras)    │  │
│  │                      │  │                                │  │
│  │   SCORE GENERAL      │  │ ESPECIALIDAD                   │  │
│  │                      │  │ ─────────────────────────────  │  │
│  │   Top 22% de         │  │ Jean, Pantalón, Short          │  │
│  │   talleres           │  │ Confección modular             │  │
│  │                      │  │                                │  │
│  └──────────────────────┘  └────────────────────────────────┘  │
│                                                                  │
│  ═══════════════════════════════════════════════════════════   │
│  INDICADORES DE MADUREZ                                        │
│  ═══════════════════════════════════════════════════════════   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                              ││
│  │  Equipo         ████████████████░░░░  80%  Experto, estable ││
│  │  Organización   ██████████████░░░░░░  70%  Modular, áreas   ││
│  │  Maquinaria     ████████████████░░░░  75%  6 máquinas       ││
│  │  Gestión        ██████████░░░░░░░░░░  50%  Registro básico  ││
│  │  Escalabilidad  ████████████████░░░░  80%  Puede crecer     ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ═══════════════════════════════════════════════════════════   │
│  TU POSICIÓN                                                   │
│  ═══════════════════════════════════════════════════════════   │
│                                                                  │
│  📊 #12 entre 156 talleres de confección de jean               │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Peor ─────────────────────────●───── Mejor                  ││
│  │                           Vos #12                           ││
│  │                                                              ││
│  │ Promedio del mercado: Score 62%                             ││
│  │ Tu score: 78% (+16 puntos sobre promedio)                   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ═══════════════════════════════════════════════════════════   │
│  ✅ FORTALEZAS IDENTIFICADAS                                   │
│  ═══════════════════════════════════════════════════════════   │
│                                                                  │
│  • Equipo experimentado (3-5 años promedio)                    │
│  • Buena productividad por persona                             │
│  • Espacio bien organizado con áreas separadas                 │
│  • Capacidad de escalar con demanda                            │
│  • Baja rotación de personal                                   │
│                                                                  │
│  ═══════════════════════════════════════════════════════════   │
│  🚀 OPORTUNIDADES DE MEJORA                                     │
│  ═══════════════════════════════════════════════════════════   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 1. Agregar control de calidad dedicado          +8 puntos  ││
│  │    ─────────────────────────────────────────────────────   ││
│  │    Actualmente no tenés área de QC.                        ││
│  │    Detectar errores temprano ahorra retrabajos.            ││
│  │    📚 Curso: "Control de calidad básico"                   ││
│  │                                                              ││
│  │                                      [Ver curso →]          ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 2. Mejorar registro de producción               +5 puntos  ││
│  │    ─────────────────────────────────────────────────────   ││
│  │    Usás Excel, está bien. Pero un sistema te daría         ││
│  │    más visibilidad de cuellos de botella.                  ││
│  │                                                              ││
│  │                                  [Descargar planilla →]     ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 3. Obtener certificación INTI                  +10 puntos  ││
│  │    ─────────────────────────────────────────────────────   ││
│  │    Algunas marcas lo requieren para trabajar.              ││
│  │    📚 Curso: "Preparación para certificación INTI"         ││
│  │                                                              ││
│  │                                      [Ver curso →]          ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ═══════════════════════════════════════════════════════════   │
│  BADGES DESBLOQUEADOS                                          │
│  ═══════════════════════════════════════════════════════════   │
│                                                                  │
│  🏅 Perfil       🏅 Equipo        🏅 Organización              │
│     técnico         identificado      mapeada                  │
│                                                                  │
│  🏅 SAM          🏅 Capacidad     🏅 Gestión                   │
│     calculado        calculada        evaluada                 │
│                                                                  │
│  ☐ Certificado   ☐ Calidad       ☐ Sostenible                 │
│     INTI            premium          (próximamente)            │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                              ││
│  │  [Editar perfil]   [Ver oportunidades]   [Ir a Academia]    ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## RESUMEN DE COMPONENTES NECESARIOS

### Componentes UI Base
- Button (primary, secondary, outline, ghost)
- Input (text, email, password, number, tel)
- Select / Dropdown
- Checkbox / CheckboxGroup
- Badge (status variants)
- Card
- ProgressRing
- ProgressBar
- StatCard
- Alert / InfoCard
- Modal
- Tabs

### Componentes Layout
- Header (con variantes por rol)
- TabNavigation
- Sidebar (opcional)
- Footer
- PageContainer

### Componentes de Dominio
- ChecklistItem
- CourseCard (colección)
- TallerCard
- CertificadoCard
- VideoPlayer (YouTube embed)
- AsistenteChat (simple search)
- FilterBar
- SearchInput

---

## FLUJOS DE NAVEGACIÓN

### Flujo Taller
```
Login → Dashboard Taller
                ↓
    ┌───────────┼───────────┬───────────┐
    ↓           ↓           ↓           ↓
Mi Perfil   Formalización  Aprender   Directorio
    ↓           ↓           ↓
Editar      Checklist   Colecciones
                ↓           ↓
            Certificados   Detalle
                           Colección
                              ↓
                           Videos +
                           Evaluación
                              ↓
                           Certificado
```

### Flujo Marca
```
Login → Dashboard Marca
                ↓
    ┌───────────┼───────────┐
    ↓           ↓           ↓
Mi Perfil   Directorio   Favoritos
    ↓           ↓
Editar    Buscar Talleres
               ↓
          Ver Perfil
          Taller
               ↓
          Contactar
          (WhatsApp)
```

### Flujo Estado
```
Login → Dashboard Estado
                ↓
    ┌───────────┼───────────┐
    ↓           ↓           ↓
Métricas   Lista Talleres  Exportar
               ↓
          Detalle Taller
```

### Flujo Admin
```
Login → Dashboard Admin
                ↓
    ┌───────────┴───────────────────────────────────────────┐
    │                                                       │
┌───┴───┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────┴────┐
│Usuarios│  │Contenido │  │Operaciones│  │Sistema  │  │Integraciones│
└───┬───┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬────┘
    │           │             │             │              │
    ↓           ↓             ↓             ↓              ↓
├─Talleres  ├─Colecciones  ├─Pedidos     ├─Config      ├─ARCA
│  └→Detalle│  ├→Crear/Ed  ├─Auditorías  ├─Roles       ├─LLM
├─Marcas    │  └→Videos    ├─Reportes    ├─Logs        ├─Email
│  └→Detalle├─Evaluaciones └─Notificac.  └─Base Datos  └─WhatsApp
├─Usuarios  ├─Certificados
└─Aprobar   ├─FAQ
            ├─Procesos
            └─Tipos Doc
```

---

## TOTAL: 58 PANTALLAS + 6 MODALES

### Resumen por sección:
- **Auth (5):** Login, Registro Paso 1-3, Olvidé Contraseña, Restablecer Contraseña
- **Taller (5):** Dashboard, Mi Perfil, Mi Formalización, Academia Colecciones, Academia Detalle
- **Marca (2):** Directorio Talleres, Perfil Público Marca
- **Estado (2):** Dashboard, Exportar Reporte
- **Públicas (5):** Perfil Público Taller, Verificar Certificado, FAQ, Términos, Privacidad
- **Sistema (4):** Mi Cuenta, Config Notificaciones, 404, Error
- **Onboarding (1):** Tour Primer Uso
- **Admin Contenido (8):** Dashboard, Colecciones, Crear/Editar Colección, Agregar Video, Evaluaciones, Certificados, Usuarios, FAQ
- **Admin Entidades (4):** Talleres, Marcas, Detalle Taller, Detalle Marca
- **Admin Config (3):** Procesos Productivos, Tipos Documento, Config General
- **Admin Operaciones (4):** Pedidos, Auditorías, Reportes, Notificaciones
- **Admin Seguridad (2):** Logs, Roles y Permisos
- **Admin Sistema (4):** Base de Datos, Integraciones API, Config ARCA, Config LLM
- **Admin Integraciones (2):** Config SendGrid, Config WhatsApp
- **Admin Adicionales (6):** Crear/Editar Rol, Cargar Informe Auditoría, Detalle Envío, Ejecutar SQL, Gestión Backups, Templates Email

### Modales documentados (6):
- Config Google Maps (en pantalla 48)
- Crear/Editar Usuario Admin (en pantalla 46)
- Programar Auditoría (en pantalla 42)
- Vista Previa Certificado (en pantalla 31)
- Crear/Editar Pregunta (en pantalla 30)
- Crear/Editar Tipo Documento (en pantalla 39)
