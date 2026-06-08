# Deuda técnica conocida — Plataforma Textil

Este archivo lista deudas técnicas pre-existentes que se identificaron
durante el desarrollo pero NO se atacaron en el sprint correspondiente
(por scope). Se mantienen acá para no perder el conocimiento.

Cada ítem incluye: descripción, donde se detectó, impacto estimado,
y prioridad sugerida.

## Frontend / UI

### F-01: Card de perfil muestra Formalización > 100%
- **Detectado en:** QA r2 de #398 (U-09) por Sergio, con Carlos Mendoza
- **Descripción:** la card "Corte Sur SRL" en /cuenta mostraba
  "Formalización: 135%". El cálculo de % suma puntos sin tope al 100%.
- **Impacto:** UI confusa, valor ilegal matemáticamente
- **Prioridad:** baja-media (no rompe funcionalidad, solo UX)
- **Estimación:** 30 min (limitar el % a Math.min(100, ...) en el cálculo)

### F-02: Link a /cuenta no visible para roles operativos
- **Detectado en:** QA r2 de #398 (U-09) por Sergio
- **Descripción:** roles ADMIN/ESTADO/CONTENIDO solo acceden a /cuenta
  escribiendo la URL a mano. No hay link en menú/header/dropdown.
- **Impacto:** los users de equipo no pueden cambiar contraseña o ver
  sus datos sin saber la URL
- **Prioridad:** media (UX rota para roles administrativos)
- **Estimación:** 1h (agregar link al dropdown del avatar para todos
  los roles)

### F-03: on-blur sin debounce dispara N requests a ARCA
- **Detectado en:** Discovery del costo CUIT en #398 (U-09)
- **Descripción:** src/.../registro/page.tsx línea ~251: el input de
  CUIT dispara consultarPadron en cada blur, sin debounce. Editar
  4 veces el campo = 4 requests a AFIP SDK.
- **Impacto:** a escala piloto (250 calls totales) negligible, pero
  consume cuota innecesariamente. A escala mayor podría llegar al
  techo del free tier.
- **Prioridad:** baja (innecesario en piloto, importante post-piloto)
- **Estimación:** 30 min (agregar debounce o cachear último CUIT validado)

## Backend / Arquitectura

### B-01: Tres paths de verificación de CUIT sin unificar
- **Detectado en:** Discovery U-09
- **Descripción:** existen 3 implementaciones paralelas de "verificar
  CUIT contra AFIP SDK":
  - `src/lib/arca.ts::consultarPadron` — RegisterScopeThirteen (A13).
    Usado en registro, verificar-cuit, U-09
  - `src/lib/afip.ts::verificarCuit` — RegisterScopeTen (A10). Usado
    solo en /registro/completar
  - `src/app/api/.../verificar-cuit/route.ts` — endpoint público
- **Impacto:** mantenimiento duplicado, deuda de consistencia
- **Prioridad:** baja (no rompe nada, pero ensucia)
- **Estimación:** 2-3h (unificar en un solo helper)

### B-02: Skip ARCA podría leer User.cuit/verificadoAfip
- **Detectado en:** Fix D r2 de #398 (U-09), nota del agente
- **Descripción:** el skip de ARCA en POST /me/roles compara contra
  CUITs de entidades existentes (Taller.cuit/Marca.cuit). Para users
  con CUIT verificado en User.cuit pero sin entidad (caso registro
  abandonado tipo srodriguezunq), el skip no se dispara y siempre va
  a ARCA.
- **Impacto:** caso borde raro. Genera un request innecesario en muy
  pocos casos.
- **Prioridad:** baja (~2 líneas de código)
- **Estimación:** 15 min

### B-03: Doble query en layout y page de /cuenta
- **Detectado en:** Fix A r2 de #398 (U-09)
- **Descripción:** layout y page de /cuenta consultan taller/marca por
  separado. Una sola consulta podría servir a ambos.
- **Impacto:** performance marginal, no es bottleneck
- **Prioridad:** muy baja (optimización menor)
- **Estimación:** 30 min

## Datos

### D-01: Cuentas con role pero sin entidad asociada
- **Detectado en:** Discovery U-05 + QA #398 (cuentas reales)
- **Descripción:** users con User.role=TALLER pero sin Taller asociado
  en DB. Detectado al menos:
  - srodriguezunq@gmail.com (cuenta real abandonada en registro)
- **Impacto:** si la persona se loguea, su experiencia está rota
  (dashboard sin entidad)
- **Prioridad:** media (afecta a personas reales)
- **Plan:** U-05 los maneja con opción D (loggear y dejar para revisión
  manual)
- **Estimación:** depende de qué se decida para cada caso

### D-02: Talleres sin Validacion (sin checklist)
- **Detectado en:** Discovery U-05
- **Descripción:** algunos talleres pre-existen en DB sin Validacion
  asociada (checklist de formalización). Causa: bug pre-U-09 en
  /registro/completar que NO creaba Validacion NO_INICIADO.
- **Impacto:** los talleres no aparecen con su checklist hasta tener
  Validacion creada
- **Plan:** U-05 incluye script tsx para regenerar las faltantes.
  Dry-run primero.
- **Estimación:** parte de U-05

## Testing / CI

### T-01: Toolchain local roto en WSL
- **Detectado en:** durante todo el sprint
- **Descripción:** node_modules en WSL tiene typescript, vitest, prisma
  faltantes localmente. CI es validador autoritativo. Build local NO
  se corre porque dispararía prisma migrate deploy.
- **Impacto:** Claude Code no puede correr tests localmente, depende
  de CI verde
- **Prioridad:** media (problema de productividad del agente)
- **Estimación:** investigar (puede ser configuración WSL, devcontainer,
  o setup)

### T-02: GitHub Actions outage intermitente selectivo
- **Detectado en:** 2026-06-04 y volvió el 2026-06-07
- **Descripción:** synchronize (commits sobre PR existente) no agenda
  runs; opened/reopened sí. Workaround: cerrar/reabrir PR o admin bypass.
- **Impacto:** ralentiza el ciclo de CI
- **Estado:** ticket abierto a GitHub Support
- **Plan:** monitorear ticket; mientras tanto usar admin bypass

### T-03: Test e2e checklist-sec9-10.spec.ts con labels stale
- **Detectado en:** Discovery narrativa V4 Etapa 1 (2026-06-07)
- **Descripción:** e2e/checklist-sec9-10.spec.ts líneas 236/346
  referencian labels obsoletos ('Mi Tablero', 'Academia', 'Mi Panel',
  'Directorio Talleres') y aria-labels que se eliminaron en #375
  (sidebar refactor).
- **Impacto:** el test está pasando por casualidad o falla en silencio.
  Cualquier renombre de tabs (próximo: narrativa V4 Etapa 1) puede
  destapar el problema.
- **Prioridad:** media — conviene arreglar JUNTO con la Etapa 1
  narrativa V4 para no romper más
- **Estimación:** 30 min (actualizar expectedItems y aria-labels)

### T-05: Test e2e u-09 no es idempotente (muta estado permanente)
- **Detectado en:** Validación de T-04 (2026-06-08)
- **Descripción:** e2e u-09-agregar-segundo-rol muta u09.test de
  single-rol a multi-rol de forma irreversible. La DEV DB persiste
  entre corridas, así que el test pasa la 1ra vez y falla la 2da
  (ya no aparece agregar-rol-card porque el user ya tiene 2 roles).
- **Impacto:** el test NO es CI-confiable sin un reseed previo en cada
  corrida. Bloquea la migración limpia de u-09 a tests/e2e/ (los otros
  3 U-specs no tienen este problema).
- **Prioridad:** media — bloquea cerrar T-04 al 100% (3 de 4 specs
  migran limpio, u-09 queda pendiente de este fix)
- **Soluciones posibles:**
  - Hook de cleanup en afterEach que resetee u09.test a single-rol
    (vía API o DB directa)
  - Usar un user throwaway creado/destruido en el propio test
  - Documentar como "one-shot" (NO recomendado: rompe en 2da corrida)
- **Relación:** ya estaba anticipado en el spec de U-08
  (v4-u-08-tests-e2e-multi-rol.md, §3.3 aislamiento) — esto lo confirma
  en la práctica
- **Estimación:** 1-2h (el cleanup hook es lo más limpio)

## Producto

### P-01: Notificaciones — comportamiento en multi-rol
- **Detectado en:** QA r1 de #398 (U-09) por Sergio
- **Descripción:** /cuenta/notificaciones muestra "98 no leídas" en
  ambos modos. Pregunta abierta: ¿todas / del rol activo / con tabs?
- **Impacto:** producto sin definir
- **Plan:** spec aparte cuando se priorize
- **Estimación:** spec + implementación, escala variable

### P-02: Modelo `PerfilTaller`/`PerfilMarca` vs `Taller`/`Marca`
- **Detectado en:** discovery U-04
- **Descripción:** el MASTER_V4 habla de "PerfilTaller" y "PerfilMarca"
  como sub-entidades del User. La implementación usa `Taller` y `Marca`
  directos. Es nomenclatura, no bug, pero puede confundir.
- **Impacto:** confusión de documentación
- **Prioridad:** muy baja (decidir si renombrar en el master o en código)

## Pendientes administrativos no técnicos (snapshot del sprint)

### A-01: GitHub Pro suscripción accidental
- **Detectado en:** 2026-06-04 durante destrabe del budget de Actions
- **Descripción:** se contrató GitHub Pro USD 4/mes accidentalmente
- **Acción:** cancelar en https://github.com/settings/billing/plans
- **Urgencia:** ALTA (cobro recurrente real)

### A-02: Aviso a 5 cuentas reales del incidente RLS
- **Detectado en:** 2026-06-03 (incidente RLS)
- **Descripción:** 5 cuentas reales (sebanestor83, cp.alanplummer,
  sofia.rojo.sr, plummer.latam, cecilia.lavena) tienen sus hashes
  bcrypt filtrados. Necesitan ser avisadas y se les debe pedir cambio
  de contraseña.
- **Estado:** pendiente desde el miércoles
- **Sexta cuenta posible:** srodriguezunq (registro abandonado, posible
  cuenta real adicional)
- **Urgencia:** ALTA (afecta a personas reales)

---

## Cómo usar este archivo

- Agregar items nuevos cuando se detecten deudas pre-existentes
  durante sprints
- NO agregar acá deudas introducidas por el sprint actual (esas se
  resuelven en el sprint)
- Revisar trimestralmente y priorizar items para sprints de "deuda técnica"
- Items resueltos: mover a sección "Resueltas" con SHA o PR de fix

## Resueltas

(Items mover acá cuando se resuelven, con fecha y referencia al fix)
