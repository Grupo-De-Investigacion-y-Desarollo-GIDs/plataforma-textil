# Paginas pendientes - fuera del MVP

Archivos movidos desde `src/` porque no corresponden al alcance del MVP actual.
Cada uno conserva su estructura de carpetas original para facilitar la reintegracion.

## Archivos movidos

### Integraciones admin (Fase 2 - Post-MVP)

| Archivo | Motivo | Fase |
|---|---|---|
| `src/app/(admin)/admin/integraciones/arca/page.tsx` | Stub sin implementar. Requiere definir API de ARCA/AFIP y flujo de verificacion de CUIT. | Fase 2: cuando se implemente el skill verificar-cuit con la API de ArgentinaDatos. |
| `src/app/(admin)/admin/integraciones/llm/page.tsx` | Stub sin implementar. Chatbot con LLM no es parte del MVP. | Fase 3: mejoras de UX post-lanzamiento. |
| `src/app/(admin)/admin/integraciones/whatsapp/page.tsx` | Stub sin implementar. Notificaciones por WhatsApp requieren proveedor (Twilio/Meta Business). | Fase 2: cuando se defina canal de notificaciones. |

### Admin - funcionalidades diferidas (Fase 2-3)

| Archivo | Motivo | Fase |
|---|---|---|
| `src/app/(admin)/admin/faq/page.tsx` | No hay modelo FAQ en Prisma ni API endpoint. Pagina sin backend. | Fase 2: agregar modelo FAQ al schema y CRUD. |
| `src/app/(admin)/admin/roles/page.tsx` | Solo existen 4 roles hardcodeados (TALLER, MARCA, ESTADO, ADMIN). No se necesita gestion dinamica en MVP. | Fase 3: solo si se agregan roles custom o permisos granulares. |
| `src/app/(admin)/admin/database/page.tsx` | Operaciones de seed/reset deben ser via CLI, no UI. Riesgo de borrado accidental en produccion. | No reintegrar. Mantener operaciones de DB en scripts CLI (`npm run db:seed`). |
| `src/app/(admin)/admin/templates/page.tsx` | No hay sistema de templates en schema ni API. Proposito no definido. | Fase 3: si se implementa sistema de templates de email o documentos. |

### Estado - paginas duplicadas o incompletas (Corregir en MVP)

| Archivo | Motivo | Fase |
|---|---|---|
| `src/app/(estado)/estado/dashboard/page.tsx` | Duplicado de `/estado/page.tsx`. Este usa client-side fetch a `/api/admin/stats` que rechaza rol ESTADO (bug). El dashboard principal (`/estado/page.tsx`) funciona correctamente con Prisma directo. | No reintegrar. Usar `/estado/page.tsx` como dashboard unico. |
| `src/app/(estado)/estado/reportes/page.tsx` | Botones "Exportar" sin onClick handler. Funcionalidad ya cubierta por `/estado/exportar/page.tsx` que si funciona. | Fase 2: si se necesita una vista de reportes separada de la exportacion. Mergear con exportar. |

## Como reintegrar un archivo

1. Copiar el archivo desde `.claude/pendiente/` a su ubicacion original en `src/`
2. Verificar que las dependencias/imports sigan siendo validos
3. Implementar el backend faltante (API route, modelo Prisma) si corresponde
4. Testear la pagina integrada
5. Eliminar la copia de `.claude/pendiente/`
