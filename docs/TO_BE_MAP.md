# TO-BE MAP - PDT

Fecha: 2026-02-20
Fuente objetivo principal: `../mvp_2/PANTALLAS_MVP.md` y `../mvp_v1.3_barreras/NAVEGACION_POR_BARRERAS.md`.

## 1. Objetivo de plataforma

Implementar una plataforma multi-actor que resuelva 7 barreras sectoriales:
- B1 trazabilidad y transparencia.
- B2 desconfianza entre actores.
- B3 formalización compleja/costosa.
- B4 baja capacidad productiva y gestión.
- B5 riesgo en pagos y cumplimiento.
- B6 baja visibilidad comercial para talleres.
- B7 falta de datos agregados para política pública.

## 2. Modelo funcional esperado por actor

## 2.1 Taller

- Onboarding claro y progresivo.
- Perfil productivo completo y persistente (wizard + cálculo de capacidad).
- Formalización por checklist con carga de documentos y validaciones.
- Acceso a academia, progreso y certificaciones.
- Gestión operativa de pedidos/asignaciones.

## 2.2 Marca

- Descubrimiento de talleres con filtros y reputación verificable.
- Creación, seguimiento y trazabilidad de pedidos.
- Comparación objetiva de proveedores (score/certificaciones).
- Gestión de relación y cumplimiento contractual.

## 2.3 Estado

- Dashboard con métricas sectoriales confiables.
- Exportes operativos (PDF/Excel/CSV).
- Visibilidad de evolución de formalización y riesgos.

## 2.4 Admin

- Control operativo total de usuarios, entidades, contenido, auditorías, documentos e integraciones.
- Herramientas para gobernanza, seguridad, logs y configuración.
- Consola utilitaria con funcionalidades reales (no mock).

## 2.5 Público

- Directorio y perfiles públicos.
- Verificación de certificados.
- Contenidos informativos legales y ayuda.

## 3. Inventario de pantallas objetivo (referencia MVP)

- Documento define 70 pantallas + modales.
- Núcleos esperados:
  - Auth/onboarding en múltiples pasos.
  - Taller (dashboard, perfil, formalización, academia).
  - Marca (directorio, pedidos, perfil público).
  - Estado (dashboard + exportes).
  - Admin extendido (contenido, entidades, configuración, operaciones, seguridad, sistema).
  - Wizard de perfil productivo de 12 pasos con resultado accionable.

## 4. Flujos esperados por barrera (síntesis)

## 4.1 B1 Trazabilidad

1. Marca crea pedido con ID trazable.
2. Matching transparente de talleres.
3. Acuerdo registrado y auditable.
4. Ejecución con hitos y evidencia.
5. Verificación por QR público.
6. Logística y pago con trazabilidad.

## 4.2 B2 Confianza

1. Reputación basada en datos verificables.
2. Mecanismos institucionales de garantía.
3. Canal de denuncias seguro y seguible.
4. Auditorías y acciones correctivas con seguimiento.

## 4.3 B3 Formalización

1. Checklist progresivo y comprensible.
2. Validación documental asistida.
3. Camino incremental hacia niveles BRONCE/PLATA/ORO.

## 4.4 B4 Capacidad y calidad

1. Perfil productivo estructurado.
2. Educación/certificación aplicada.
3. Métricas de eficiencia y mejora continua.

## 4.5 B5 Riesgo económico/cumplimiento

1. Estados claros de pedido y manufactura.
2. Reglas de transición válidas.
3. Mecanismos de garantía/pago seguro.

## 4.6 B6 Inserción comercial

1. Descubrimiento por filtros y reputación.
2. Perfil público rico de talleres/marcas.
3. Señales verificables para decisión de compra.

## 4.7 B7 Inteligencia pública

1. Dashboard estatal con indicadores confiables.
2. Exportes y reportabilidad recurrente.
3. Datos útiles para decisiones de política sectorial.

## 5. Capacidades técnicas objetivo

1. Seguridad API homogénea con `auth + role + ownership`.
2. Integraciones productivas: ARCA, email, storage, QR, PDF, notificaciones.
3. Persistencia total de flujos (sin pasos mock).
4. Trazabilidad end-to-end de eventos críticos.
5. Cobertura mínima de pruebas para flujos core.
