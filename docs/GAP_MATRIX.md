# GAP MATRIX - TO-BE vs AS-IS

Fecha: 2026-02-20
Escala:
- Estado: `IMPLEMENTADO`, `PARCIAL`, `STUB`, `FALTANTE`
- Severidad: `CRITICO`, `ALTO`, `MEDIO`, `BAJO`

## 1. Gaps funcionales prioritarios

| Área | TO-BE esperado | AS-IS observado | Estado | Severidad | Evidencia |
|---|---|---|---|---|---|
| Seguridad API | Auth+roles+ownership consistente | Endpoints con validación inconsistente | PARCIAL | CRITICO | `CHECKLIST.md`, `src/app/api/**/route.ts` |
| Password reset | Flujo real end-to-end | UI y backend incompletos | FALTANTE | ALTO | `src/app/(auth)/olvide-contrasena/page.tsx`, `src/app/api/auth/password-reset/*` |
| Wizard perfil taller | Persistir 12 pasos + cálculo | Flujo UI amplio, persistencia incompleta | STUB | ALTO | `src/app/(taller)/taller/perfil/completar/page.tsx` |
| Formalización documental | Carga/validación de archivos | Checklist visible, subida incompleta | PARCIAL | ALTO | `src/app/(taller)/taller/formalizacion/page.tsx`, `src/components/ui/file-upload.tsx` |
| Academia detalle | Contenido y progreso reales | Mezcla de datos reales y mock | PARCIAL | ALTO | `src/app/(taller)/taller/aprender/[id]/page.tsx` |
| Admin detalle entidades | Vista real por ID | Secciones con contenido mock | STUB | ALTO | `src/app/(admin)/admin/talleres/[id]/page.tsx`, `src/app/(admin)/admin/marcas/[id]/page.tsx` |
| Integraciones core | ARCA, email, QR, PDF, WA | Mayormente no conectadas | FALTANTE | ALTO | `CHECKLIST.md`, `src/lib/email.ts` |
| Estado exportes | Reportes exportables reales | UI mayormente simulada | STUB | MEDIO | `src/app/(estado)/estado/exportar/page.tsx` |
| Notificaciones | Configuración y envíos reales | UI/API incompleta para campañas | PARCIAL | MEDIO | `src/app/(admin)/admin/notificaciones/page.tsx`, `src/app/api/notificaciones/route.ts` |
| Testing | Cobertura de flujos críticos | Cobertura sistemática insuficiente | FALTANTE | MEDIO | Árbol de proyecto |

## 2. Gaps por barrera (B1-B7)

| Barrera | Capacidad objetivo | Estado actual | Gap principal |
|---|---|---|---|
| B1 Trazabilidad | Pedido→ejecución→QR→pago trazado | PARCIAL | Falta cierre completo de QR, logística y trazas operativas |
| B2 Confianza | Reputación verificable + denuncias/auditorías robustas | PARCIAL | Controles de acceso y persistencia desigual en módulos críticos |
| B3 Formalización | Checklist + documentos + aprobación + nivel | PARCIAL | Upload/approval/nivel automático no cerrados |
| B4 Capacidad | Wizard persistente + academia aplicada | PARCIAL | Wizard y detalle academia con tramos mock |
| B5 Riesgo económico | State machine y garantías | PARCIAL | Reglas de transición y garantías incompletas |
| B6 Inserción comercial | Directorio rico + perfiles verificables | IMPLEMENTADO/PARCIAL | Falta mayor completitud de perfil y acciones de contacto trazables |
| B7 Datos públicos | Dashboard + exportes confiables | PARCIAL | Exportes y métricas avanzadas aún simuladas |

## 3. Gaps técnicos estructurales

| Dominio | Gap | Impacto | Severidad |
|---|---|---|---|
| API governance | Reglas de autorización no uniformes | Riesgo de datos y acciones no autorizadas | CRITICO |
| Persistencia | Flujos UI sin write-path robusto | Pérdida de valor funcional y confianza del usuario | ALTO |
| Integraciones | Dependencias externas pendientes | Funciones clave no operativas | ALTO |
| Operación | Logging/auditoría de mutaciones parcial | Baja trazabilidad operativa | MEDIO |
| Calidad | Testing insuficiente | Mayor riesgo de regresiones | MEDIO |

## 4. Priorización sugerida

1. Seguridad y ownership en API.
2. Flujos críticos de autenticación y formalización.
3. Persistencia de wizard y academia.
4. Integraciones núcleo (email, storage, QR/PDF, ARCA).
5. Reportabilidad estado/admin y automatización de calidad (tests).
