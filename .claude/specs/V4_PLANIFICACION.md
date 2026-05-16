# V4 — Planificacion de version

**Fecha:** 2026-05-08
**Estado:** Borrador para revision de Gerardo
**Objetivo:** Listar los grandes temas que componen V4, su origen y alcance. Este documento es el insumo para armar el inventario de specs.

---

## Fuentes relevadas

| Fuente | Que aporta |
|--------|-----------|
| V4_BACKLOG.md | 16 bloques (A-P) con ~70 items identificados durante V3 y el piloto |
| Propuesta visual de Sergio (propuesta-visual-pdt-v4.zip) | Rediseno visual completo: tokens, componentes, header, footer, landing, mockup HTML navegable, 6 docs de propuesta + 5 notas de analisis + imagenes generadas |
| v4-input-institucional.md | 6 puntos institucionales que surgieron de la auditoria QA Fase 2 |
| Feedback del piloto (issues #211-#296) | 85 issues procesados, 12 enviados a V4, resto resuelto en V3 |
| docs/Otros/ | Documentacion de roles (TALLER, MARCA, ESTADO) + plantilla ISRA de OIT |
| Hallazgos Eje 6 (Bloque N del backlog) | 69 items interdisciplinarios de 4 perfiles (politologo, economista, sociologo, contador) |

---

## Grandes temas de V4

### 1. Rediseno visual

**Origen:** Propuesta de Sergio (8 docs, mockup v6, 16 capturas de produccion analizadas, benchmarking de Better Work / Mi Argentina / Stripe)

**Que abarca:**
- Nueva paleta de tokens: terracotta como acento, pastels semanticos por rol, body text negro en lugar de azul
- 3 fuentes (Source Serif 4 titulares, Inter body, Overpass UI) en lugar de 2
- Componentes actualizados: Button (variantes terra, outline-dark), Card (accent bar), Badge (pastel-bg), Input (radius ajustado)
- Componentes nuevos: KpiCard (con delta %), FilterPills (reemplaza selects en listados), iconografia custom PDT (12 iconos SVG)
- Header simplificado: de 4 bandas (~150px) a 2 bandas (~110px), banner "AMBIENTE DE PRUEBAS" pasa a pill chica
- Header publico nuevo (landing y paginas sin login)
- Footer nuevo (no existe hoy): 4 columnas, sello OIT+UNTREF, links a terminos/privacidad
- Landing publica rediseñada: hero + cards por audiencia + stats con fuente + carrusel de novedades (reemplaza testimonios ficticios)
- Aplicacion a dashboards: saludo "Hola, X", KpiCards, card "Proxima accion", pedidos con nombres humanos en lugar de codigos
- Aplicacion a listados: breadcrumbs + pre-title terracotta + H1 serif + FilterPills + EmptyState
- Renombrar tabs a "Mis X" (primera persona del usuario)

**Que NO abarca:**
- No cambia logica ni flujos funcionales
- No toca layout de ADMIN (sidebar se mantiene)
- No incluye dark mode
- No incluye mobile (eso es tema aparte)

**Modelo de datos nuevo:** tabla `Novedad` (para carrusel del landing)

**Dependencias:**
- Logo PDT: decidido (PNG circulo azul), falta generar variantes (favicon, og:image)
- Autorizacion OIT para uso de logo: bloquea solo deploy publico, no desarrollo
- Imagenes del hero/cards: las actuales son generadas por IA, para produccion hay que definir si se usan o se reemplazan por fotos reales del piloto

**Estimacion de Sergio:** ~34.5h en 11 fases incrementales

---

### 2. Compliance OIT y privacidad de datos

**Origen:** Plantilla ISRA + Privacy Assessment recibida de OIT (abril 2026), V4_BACKLOG Bloque A

**Que abarca:**
- Consentimiento explicito en registro (checkboxes obligatorios: terminos, privacidad, visibilidad de datos)
- Paginas publicas de terminos y privacidad con contenido editable por admin
- Notificacion de proposito al recolectar datos
- Derecho a descargar datos propios (data portability, boton en perfil)
- Derecho a eliminar cuenta y datos (soft delete + hard delete a 30 dias)
- Sistema de reporte de breach (pantalla admin /admin/incidentes)
- Politica de retencion configurable (UI admin para tiempos por tipo de dato, job nocturno)
- Seccion admin "Privacidad y datos" (dashboard con metricas de eliminaciones, breaches, proximas acciones)
- Documento ISRA completado (entregable no-codigo, plantilla en docs/Otros/)
- Documento Privacy Assessment (PIA, entregable no-codigo)

**Dependencias externas:**
- Copia oficial de IGDS 456, IGDS 457 y Risk Management Manual de OIT
- Definicion del dominio para emails (afecta deliverability y compliance)

**Estimacion del backlog:** ~43h + documentacion

---

### 3. Mobile y responsive

**Origen:** V4_BACKLOG Bloque B. En V3 se quito mobile-safari del config de Playwright. Los talleres usan celular.

**Que abarca:**
- Auditoria mobile completa (30+ pantallas en 320px, 375px, 768px)
- Reactivar tests E2E mobile (mobile-safari + mobile-chrome en playwright.config.ts)
- Aplicar fixes detectados en la auditoria

**Relacion con rediseno visual:** El rediseno NO incluye mobile. Se puede hacer en paralelo o inmediatamente despues, y es importante que se haga sobre la nueva UI para no auditar dos veces.

**Estimacion del backlog:** ~22h

---

### 4. Seguridad de endpoints

**Origen:** V4_BACKLOG Bloque K. Hallazgo critico en QA INT-00 (2026-05-06): /api/talleres expuesto sin auth.

**Estado actual:** K-03 y K-04 ya fixeados en V3 (Fase 2 QA). Falta:

**Que abarca:**
- Auditoria de seguridad de TODOS los endpoints (~75 rutas en /api): auth check + role check + datos expuestos
- Test pattern reutilizable de auth (helper que verifica 401/403/200 para cada endpoint)
- Revisitar endpoints con datos sensibles: select explicito en lugar de include para evitar leaks futuros

**Estimacion del backlog:** ~14h (descontando los ya fixeados)

---

### 5. Deuda tecnica de V3

**Origen:** V4_BACKLOG Bloque D. Decisiones tomadas durante V3 que conviene revisar.

**Que abarca:**
- Migrar ~57 endpoints restantes al formato de error consistente (`apiHandler` + `{ error: { code, message, digest } }`) + migrar ~18 frontends que consumen esos endpoints
- Health check de variables de entorno criticas al inicio de la app (leccion aprendida: I-01 dejo vars vacias 8 dias sin detectarse)
- Migrar bypass token a JWT firmado (hoy es secreto compartido)
- Cambiar `redis.keys()` a `redis.scan()` en cleanup de tests
- Reactivar Vercel Authentication con bypass para CI
- Refactor Suspense en /estado/page.tsx (15 queries en una transaccion)
- Migrar 4 `confirm()` nativos a dialogs custom
- Mejorar detalle de logs de auditoria (columna de recurso afectado)
- Filtro por usuario afectado en /admin/logs
- Migrar NotaInterna a NotaSeguimiento (2 sistemas coexisten)
- Refactor E2E tests sin skip silencioso (try/catch { test.skip() } enmascara fallos reales)

**Estimacion del backlog:** ~41.5h (con T-07 y T-10 ya cerrados)

---

### 6. Decisiones institucionales

**Origen:** V4_BACKLOG Bloque O + v4-input-institucional.md. Puntos que requieren decision de negocio/gobernanza, no tecnica.

**Que abarca:**
- O-01: Barrera del CUIT — documentar trade-off formalizacion vs inclusion
- O-02: Protocolo etico de observaciones de campo — consentimiento, transparencia, anonimizacion
- O-03: Dominio propio para emails transaccionales
- O-04: Corpus real para RAG (asistente IA, hoy con placeholder)
- O-05: Definicion funcional del rol CONTENIDO
- O-06: Genero como eje transversal (indicadores + tipo de observacion)
- O-07: Modelo de la PDT — institucional (Estado centrico) vs marketplace (oferta-demanda centrico)

**Impacto:** Estas decisiones condicionan el alcance de varios otros temas (el rediseno visual, el Bloque H de mercado, el Bloque I de servicios, el Bloque J de CONTENIDO).

---

### 7. Gobernanza y dimension interdisciplinaria

**Origen:** V4_BACKLOG Bloques M y N. Hallazgos Eje 6 de la auditoria QA Fase 2 (4 perfiles: politologo, economista, sociologo, contador).

**Que abarca:**
- Protocolo etico de observaciones de campo (M-01, depende de O-02)
- Tipo de observacion GENERO en el enum (M-02, ~1h)
- Guia para el equipo observador (M-03, documento, no codigo)

**Hallazgos transversales relevantes (Bloque N):**
- Politologo: falta etapa FORMALIZADO en funnel onboarding, riesgo de lista negra informal con "talleres cerca"
- Economista: tasa aceptacion sola es insuficiente, faltan monto promedio y tendencias; thresholds conservadores para piloto
- Sociologo: riesgo de extractivismo de conocimiento sin consentimiento; protocolo seguimiento puede sentirse como vigilancia
- Contador: falta IIBB provincial y formulario 960 en tipos de documento; faltan facturacion estimada y tipo comprobante en exportes

---

### 8. Mejoras del piloto (feedback de usuarios)

**Origen:** V4_BACKLOG Bloque G. 16 items identificados del feedback del piloto (issues #211-#296).

**Que abarca:**
- G-03: Opcion "No tengo areas separadas" en evaluacion de infraestructura
- G-04: Explicacion contextual del SAM en onboarding
- G-05: Pedidos con campos adicionales (talles, terminaciones, segmento)
- G-06: Seccion "Molderia y aspectos tecnicos" en pedidos
- G-07: Texto certificado: reemplazar "OIT Argentina"
- G-08: Nomenclatura "Marca" a "Marca/Empresa"
- G-09: Definir campos perfil marca (tipo, frecuencia, volumen)
- G-10: Rediseno sistema niveles a "Progreso de formalizacion"
- G-11: Evaluar quitar seccion wizard perfil taller
- G-12: Upload logo/imagen empresa-taller-marca
- G-13: Academia para marcas
- G-14: Evaluar deshabilitar denuncias
- G-15: Monto transaccionado en dashboard ESTADO
- G-16: Renombrar rol ESTADO a COORD/COORDINACION

**Nota:** Algunos de estos se solapan con el rediseno visual (G-10 con dashboards, G-12 con perfil). Hay que definir cuales se resuelven dentro del rediseno y cuales son specs funcionales separados.

---

### 9. Mercado y transparencia (inteligencia de mercado)

**Origen:** V4_BACKLOG Bloque H.

**Que abarca:**
- Vidriera publica /mercado con datos agregados anonimizados (volumen, precios, distribucion geografica)
- Inteligencia de mercado para TALLER (precios sugeridos, demanda compatible, comparacion con pares)
- Inteligencia de mercado para MARCA (precios de mercado, disponibilidad, tiempos de entrega)
- Analitica institucional para ESTADO/OIT (tendencias de formalizacion, concentracion de mercado, flujo de pedidos)
- Indicadores de mercado justo (precio minimo de referencia social, alertas cuando cotizacion esta muy por debajo)
- Alertas de concentracion y territorio
- Metricas de impacto laboral

**Dependencia critica:** Depende del piloto generando volumen real de transacciones. Sin datos reales los indicadores no tienen sentido.

**Condicionado por:** Decision O-07 (modelo institucional vs marketplace).

**Estimacion del backlog:** ~66h

---

### 10. Servicios y catalogo de talleres

**Origen:** V4_BACKLOG Bloque I.

**Que abarca:**
- Servicios destacados del taller (3-5 servicios con precio, tiempo, fotos)
- Catalogo por categoria de proceso
- Sistema de publicaciones/anuncios (disponibilidad, novedades, promociones temporales)
- Integracion con vidriera publica (Bloque H)
- Filtros avanzados en exploracion (servicio, disponibilidad, precio, zona)
- Moderacion basica + limites antispam
- Recomendaciones de talleres para marcas (matching por proceso, zona, nivel, precio)

**Dependencia critica:** Depende del piloto + depende de Bloque H.

**Decisiones pendientes:** Modelo de precio (fijo vs cotizar vs hibrido), nivel minimo para publicar, moderacion, visibilidad publica, antispam, gamificacion.

**Estimacion del backlog:** ~62h

---

### 11. Rol CONTENIDO

**Origen:** V4_BACKLOG Bloque J + Decision O-05.

**Estado actual:** Parcialmente implementado, oculto en V3. Tiene layout propio y 4 paginas pero con links rotos, sin sidebar correcto, sin notificaciones propias.

**Que abarca:**
- Definicion funcional (analisis: que hace un contenidista, relacion con ADMIN, moderacion vs carga)
- Sidebar dedicado
- Rutas propias /contenido/**
- Permisos granulares
- Dashboard y notificaciones

**Dependencia:** No se puede implementar hasta que O-05 (definicion funcional) se resuelva.

**Estimacion del backlog:** ~14h

---

### 12. Integraciones externas

**Origen:** V4_BACKLOG Bloque E.

**Que abarca:**
- MercadoPago para pagos (taller cobra a marca via plataforma, comision configurable)
- Andreani/Correo Argentino para tracking de envios

**Nota:** ARCA/AFIP ya resuelta en V3 (INT-01). Estas dos integraciones dependen de prioridades del piloto y presupuesto.

**Estimacion del backlog:** ~28h

---

### 13. Internacionalizacion

**Origen:** V4_BACKLOG Bloque F. Posible escalamiento a Uruguay, Paraguay, Bolivia.

**Que abarca:**
- i18n completo (strings hardcodeadas a archivos de traduccion, soportar es-AR/UY/PY/BO)
- Soporte multi-pais (CUIT/monedas/formatos por pais)
- Multi-tenant (una instancia para varios paises, datos aislados)

**Condicional:** Solo aplica si se decide escalar internacionalmente.

**Estimacion del backlog:** ~52h

---

### 14. Capacitacion y protocolos operativos

**Origen:** V4_BACKLOG Bloque P. No es codigo, es documentacion para el equipo humano.

**Que abarca:**
- Guia del equipo de campo (lineamientos para observaciones, etica, "facilitador no inspector")
- FAQ fiscal para talleres (monotributo vs RI, categorias textil, CUIL vs CUIT, IIBB)

**Nota:** Se puede arrancar inmediatamente, no tiene dependencias tecnicas.

**Estimacion del backlog:** ~5h (documentacion)

---

### 15. Mejoras al sistema de QA

**Origen:** V4_BACKLOG Bloque C.

**Que abarca:**
- Renombrar logAccionAdmin a logAccionSensible
- Auto-asignacion de issues por verificador
- Metricas de auditoria en index
- Auditoria en preview de cada PR

**Estimacion del backlog:** ~20h

---

## Temas que se solapan o condicionan entre si

| Tema | Condiciona o se solapa con |
|------|---------------------------|
| Decisiones institucionales (6) | Rediseno (1), Mercado (9), Servicios (10), CONTENIDO (11), Gobernanza (7) |
| Rediseno visual (1) | Feedback piloto G-10/G-12 (8), Mobile (3) |
| Compliance (2) | Rediseno (1) — footer con links a terminos/privacidad |
| Mercado (9) | Decision O-07, Servicios (10) |
| Servicios (10) | Mercado (9) |
| CONTENIDO (11) | Decision O-05 |

---

## Proximos pasos

1. Gerardo revisa este documento y prioriza cuales de los 15 temas entran en V4
2. Para cada tema priorizado, se arma un spec con la estructura de 7 secciones de V3
3. Se define orden de implementacion segun dependencias y prioridad
