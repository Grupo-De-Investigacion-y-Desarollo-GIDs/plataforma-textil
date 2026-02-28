# AS-IS MAP - PDT

Fecha: 2026-02-20
Base analizada: `src/`, `prisma/schema.prisma`, `CHECKLIST.md`, `mvp_2/PANTALLAS_MVP.md`, `mvp_v1.3_barreras/NAVEGACION_POR_BARRERAS.md`.

## 1. Resumen ejecutivo

- Stack actual: Next.js App Router + TypeScript + Prisma + NextAuth + PostgreSQL (Supabase).
- Cobertura funcional amplia: 64 `page.tsx` y 30 rutas API.
- Estado real: plataforma avanzada en estructura, pero con mezcla de pantallas fully-functional, parciales y mock/stub.
- Hallazgo central: hay desacople entre "inventario funcional esperado" y "grado de implementación real", especialmente en seguridad API, flujos críticos (password reset, wizard persistente) e integraciones externas.

## 2. Arquitectura funcional observada

## 2.1 Capas

- UI por rol y grupos de rutas en `src/app/(admin)`, `src/app/(taller)`, `src/app/(marca)`, `src/app/(estado)`, `src/app/(auth)`, `src/app/(public)`.
- Backend API en `src/app/api/**/route.ts`.
- Lógica transversal en `src/lib/*` (`auth.ts`, `auth.config.ts`, `prisma.ts`, `nivel.ts`, `email.ts`, `storage.ts`).
- Seguridad web en `src/middleware.ts`.
- Modelo de datos en `prisma/schema.prisma`.

## 2.2 Control de acceso

- Middleware define rutas públicas y restricciones por rol: `ADMIN`, `TALLER`, `MARCA`, `ESTADO`.
- Layouts por rol vuelven a validar sesión/rol:
  - `src/app/(taller)/layout.tsx`
  - `src/app/(marca)/layout.tsx`
  - `src/app/(estado)/layout.tsx`
  - `src/app/(admin)/layout.tsx`
- Auth con NextAuth credentials:
  - Config Edge ligera: `src/lib/auth.config.ts`
  - Validación real de credenciales + Prisma adapter: `src/lib/auth.ts`

## 3. Mapa de navegación actual

Conteo observado de páginas:

| Grupo | Cantidad de `page.tsx` |
|---|---:|
| `(admin)` | 30 |
| `(auth)` | 5 |
| `(taller)` | 8 |
| `(marca)` | 7 |
| `(estado)` | 4 |
| `(public)` | 8 |
| root/otros | 2 |
| **Total** | **64** |

Rutas API observadas: **30** (`src/app/api/**/route.ts`).

## 3.1 Rutas por actor (AS-IS)

Taller:
- `/taller`
- `/taller/perfil`
- `/taller/perfil/completar`
- `/taller/formalizacion`
- `/taller/aprender`
- `/taller/aprender/[id]`
- `/taller/pedidos`

Marca:
- `/marca/directorio`
- `/marca/directorio/[id]`
- `/marca/pedidos`
- `/marca/pedidos/nuevo`
- `/marca/pedidos/[id]`
- `/marca/perfil`

Estado:
- `/estado`
- `/estado/reportes`
- `/estado/exportar`

Admin:
- Dashboard y 18+ secciones (`/admin/*`) incluyendo colecciones, usuarios, talleres, marcas, pedidos, auditorías, reportes, notificaciones, integraciones, logs, roles, database, templates.

Públicas/Auth:
- `/`, `/login`, `/registro`, `/olvide-contrasena`, `/restablecer/[token]`, `/directorio`, `/perfil/[id]`, `/verificar`, `/ayuda`, `/terminos`, `/privacidad`, `/cuenta`, `/cuenta/notificaciones`, `/unauthorized`.

## 4. Dominios de negocio implementados en datos

`prisma/schema.prisma` cubre dominios robustos:
- Usuarios/Auth: `User`, `Account`, `Session`, `VerificationToken`.
- Taller/Marca: `Taller`, `Marca`, capacidades, procesos, maquinaria, certificaciones.
- Producción: `Pedido`, `OrdenManufactura`, `EscrowHito`.
- Formalización: `Validacion`, `TipoDocumento`.
- Academia: `Coleccion`, `Video`, `Evaluacion`, `Certificado`, `ProgresoCapacitacion`.
- Gobernanza: `Auditoria`, `AccionCorrectiva`, `Denuncia`, `Notificacion`, `ConfiguracionSistema`, `LogActividad`.

Conclusión AS-IS de datos: el modelo soporta un producto más completo que varias pantallas actuales.

## 5. Flujos críticos AS-IS

## 5.1 Flujo acceso y sesión

1. Usuario accede a `/login`.
2. Credentials valida contra DB (`bcrypt`, `prisma.user`).
3. JWT conserva `id` y `role`.
4. Redirección por rol desde `/` y middleware.

## 5.2 Flujo marca de pedidos

1. Marca crea pedido en `/marca/pedidos/nuevo`.
2. Se persiste `Pedido` con `omId` y estado inicial.
3. Lista y detalle consumen Prisma real.

## 5.3 Flujo taller formalización/perfil

1. Taller ve estado en `/taller/formalizacion` y `/taller/perfil`.
2. Existen componentes y estructura de wizard de completitud.
3. Persistencia final del wizard y subida documental están incompletas.

## 5.4 Flujo academia/certificados

1. Listado de colecciones usa datos reales.
2. Detalle de colección y evaluación tienen componentes con fuerte presencia mock.
3. Verificación pública de certificados existe vía API por código.

## 6. Integraciones y operación (AS-IS)

- Deploy: Vercel.
- DB: Supabase Postgres.
- Integraciones externas (ARCA, SendGrid, WhatsApp, QR, PDF, LLM): principalmente pendientes o mock.
- Testing automatizado: no observado como cobertura sistemática en el árbol auditado.

## 7. Riesgos técnicos principales (AS-IS)

1. Seguridad API inconsistente en algunos endpoints (auth/ownership/role-check).
2. Brecha entre UX disponible y persistencia real en ciertos flujos.
3. Diferencia entre navegación documentada y reglas de negocio efectivas.
4. Dependencia de integraciones no conectadas para cerrar valor de negocio.

## 8. Trazabilidad de archivos clave

- Seguridad y acceso: `src/middleware.ts`, `src/lib/auth.config.ts`, `src/lib/auth.ts`
- Navegación/header: `src/components/layout/header.tsx`, `src/components/layout/user-sidebar.tsx`
- Layouts por rol: `src/app/(admin)/layout.tsx`, `src/app/(taller)/layout.tsx`, `src/app/(marca)/layout.tsx`, `src/app/(estado)/layout.tsx`
- API: `src/app/api/**/route.ts`
- Datos: `prisma/schema.prisma`
- Auditoría previa detallada: `CHECKLIST.md`
