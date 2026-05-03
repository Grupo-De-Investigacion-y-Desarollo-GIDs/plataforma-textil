# REVIEW: Integracion completa con ARCA/AFIP (INT-01 + INT-02)

**Spec:** v3-arca-completo
**Fecha:** 2026-05-02
**Implemento:** Gerardo (Claude Code)
**Review:** interno

---

## Changelog

### Nuevos archivos
- `src/compartido/lib/arca.ts` — Cliente robusto para ARCA con consultarPadron(), sincronizarTaller(), mock, logging, clasificacion de errores
- `src/compartido/componentes/badge-arca.tsx` — Componente BadgeArca (verificado/pendiente)
- `src/app/(estado)/estado/talleres/sync-arca-button.tsx` — Boton "Sincronizar todos con ARCA"
- `src/app/(estado)/estado/talleres/[id]/reverificar-button.tsx` — Boton "Re-verificar contra ARCA"
- `src/app/api/estado/arca/route.ts` — API masiva sync + stats consultas
- `src/app/api/estado/arca/reverificar/[id]/route.ts` — API re-verificacion individual
- `tools/sincronizar-arca.ts` — Script CLI con --dry-run
- `tests/fixtures/arca-responses/*.json` — 5 fixtures de respuestas ARCA
- `src/__tests__/arca.test.ts` — 17 tests Vitest

### Archivos modificados
- `prisma/schema.prisma` — 9 campos nuevos en Taller, 2 enums (TipoInscripcionAfip, EstadoCuit), modelo ConsultaArca
- `src/app/api/auth/registro/route.ts` — Usa consultarPadron() de arca.ts, guarda datos extendidos
- `src/app/api/auth/verificar-cuit/route.ts` — Reescrito para usar arca.ts con 5 codigos de error
- `src/app/(estado)/estado/talleres/page.tsx` — Card ARCA, BadgeArca en tabla, orderBy verificadoAfip
- `src/app/(estado)/estado/talleres/[id]/page.tsx` — Seccion ARCA en tab datos, boton re-verificar, BadgeArca
- `src/app/(public)/directorio/page.tsx` — BadgeArca, orderBy [verificadoAfip desc, puntaje desc]
- `src/app/(public)/perfil/[id]/page.tsx` — BadgeArca reemplaza badge simple
- `src/app/(marca)/marca/directorio/page.tsx` — BadgeArca, orderBy verificadoAfip
- `.env.example` — ARCA_ENABLED, ARCA_PROVIDER

### Archivos deprecados
- `src/compartido/lib/afip.ts` — Reemplazado por `arca.ts`. El archivo viejo sigue existiendo pero ya no es importado por ningun modulo activo.

---

## Decisiones de arquitectura

1. **Config lazy:** `getConfig()` lee env vars en cada llamada, no al importar el modulo. Permite que tests setteen env vars en `beforeEach` sin problemas de module caching.

2. **5 codigos de error especificos:**
   - CUIT_INEXISTENTE (bloquea) — CUIT no encontrado
   - CUIT_INACTIVO (bloquea) — CUIT dado de baja o inactivo
   - CUIT_SIN_ACTIVIDAD (bloquea) — sin actividades economicas
   - ARCA_NO_RESPONDE (permite continuar) — timeout de ARCA
   - AFIPSDK_ERROR (permite continuar) — error de SDK/token

3. **Modo defensivo conservado:** Si ARCA no responde, el registro continua con verificadoAfip:false. El taller puede usar la plataforma en modo lectura (INT-00).

4. **Trazabilidad dual:** Cada consulta se registra en ConsultaArca (tabla) Y en LogActividad (accion AFIP_VERIFICACION). ConsultaArca tiene datos tecnicos (duracionMs, endpoint, respuesta JSON), LogActividad tiene datos de negocio.

5. **tallerId opcional en pre-registro:** consultarPadron(cuit) sin tallerId crea ConsultaArca huerfana. Aceptable — tiene CUIT y timestamp para referencia.

6. **RegisterScopeTen (A10):** Se mantiene el padron A10 actual. Si no trae campos suficientes, cambiar a A13 en una linea. Pendiente de validar con primera consulta real.

7. **Badge "Verificado por ARCA":** Visible en directorio publico, marca y perfil publico. No reemplaza las credenciales individuales de INT-00 — complementa. ESTADO ve datos completos + badge.

---

## Riesgos y pendientes

| Riesgo | Mitigacion | Pendiente |
|--------|-----------|-----------|
| Campos del response A10 no validados con datos reales | mapearRespuesta() con fallbacks defensivos | Validar primera consulta con plan Pro |
| "10 CUITs/mes" en plan Pro puede no alcanzar | Confirmacion pendiente con soporte AfipSDK | Antes del piloto |
| AFIP_SDK_TOKEN no esta en Production | Decision deliberada — activar antes del 15/5 | Antes del piloto |
| afip.ts sigue existiendo (dead code) | No importado por ningun modulo activo | Eliminar en cleanup post-piloto |
| [contacto-pdt] placeholder en mensajes | Definir WhatsApp/email del punto de contacto | Antes del piloto |

---

## Tests

- 17 tests Vitest nuevos (arca.test.ts)
- 227 tests totales pasando
- 5 fixtures JSON en tests/fixtures/arca-responses/
- Tests cubren: consultarPadron (8 escenarios), mensajes (1), errores bloqueantes (2), mock mode (2), sincronizacion (4)

---

## Variables de entorno nuevas

| Variable | Valor dev | Donde |
|----------|-----------|-------|
| ARCA_ENABLED | true | .env.local + Vercel |
| ARCA_PROVIDER | afipsdk | .env.local + Vercel |

Variables existentes mantenidas: AFIP_SDK_TOKEN, AFIP_SDK_ENV, AFIP_CUIT_PLATAFORMA.
