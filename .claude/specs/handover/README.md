# Handover - Entrega OIT

Estructura de documentos requeridos para la entrega formal del proyecto PDT (Plataforma Digital Textil) a la OIT. Cada seccion agrupa los entregables por area.

## 1. Codigo y repositorios

Entregables relacionados al codigo fuente y control de versiones.

- Acceso al repositorio GitHub (permisos, branches, tags de release)
- Instrucciones de clonado, instalacion y ejecucion local
- Descripcion de ramas: main (produccion), develop (desarrollo)
- Historial de releases y changelog

**Cuando se completa:** Al cierre del ultimo sprint, antes de la entrega final.

## 2. Infraestructura y deploy

Documentacion de la infraestructura en produccion.

- Arquitectura de deploy en Vercel (proyecto, dominio, regiones)
- Base de datos Supabase (proyecto, region sa-east-1, plan)
- Proceso de deploy (CI/CD, preview deployments, produccion)
- Dominios y DNS configurados
- Monitoreo y logs disponibles

**Cuando se completa:** Cuando la infraestructura de produccion esta estabilizada.

## 3. Configuracion y variables de entorno

Inventario completo de configuraciones necesarias para operar el sistema.

- Lista de variables de entorno con descripcion de cada una (sin valores secretos)
- Procedimiento para obtener/rotar credenciales (Supabase, SendGrid, etc.)
- Archivo .env.example como referencia
- Configuracion de Vercel (env vars por environment: production, preview, development)

**Cuando se completa:** Junto con la entrega de infraestructura.

## 4. Datos y migraciones

Estado de la base de datos y procedimientos de migracion.

- Schema actual de Prisma (prisma/schema.prisma)
- Historial de migraciones (prisma/migrations/)
- Datos seed iniciales (prisma/seed.ts)
- Procedimiento de backup y restore de Supabase
- Datos de prueba vs datos de produccion

**Cuando se completa:** Cuando el schema de produccion esta estable y validado.

## 5. Documentacion tecnica y funcional

Documentos que explican como funciona el sistema.

- Arquitectura tecnica (stack, estructura de carpetas, patrones)
- Documentacion funcional por modulo (admin, taller, marca, estado)
- Wireframes y specs de pantallas (docs/02_funcional/PANTALLAS_MVP.md)
- Design system (docs/03_tecnico/DESIGN_SYSTEM.md)
- API reference (endpoints, request/response, autenticacion)
- Flujos de usuario por rol y nivel de formalizacion

**Cuando se completa:** Progresivamente durante el desarrollo, revision final antes de entrega.

## 6. Pruebas y seguridad

Evidencia de calidad y seguridad del sistema.

- Tests unitarios y de integracion existentes (src/__tests__/)
- Reporte de cobertura de tests
- Checklist de seguridad (autenticacion, autorizacion, OWASP top 10)
- Politica de roles y permisos implementada
- Validacion de datos en formularios y APIs
- Row Level Security en Supabase

**Cuando se completa:** Al cierre de cada sprint con revision final antes de entrega.

## 7. Licencias

Informacion legal sobre el software utilizado.

- Licencia del proyecto PDT
- Listado de dependencias y sus licencias (npm, fonts, iconos)
- Compatibilidad de licencias con requisitos OIT
- Atribuciones requeridas (Google Fonts, librerias open source)

**Cuando se completa:** Antes de la entrega final, con revision legal.

## 8. Cumplimiento legal

Documentos de cumplimiento normativo y legal.

- Politica de privacidad (implementada en /privacidad)
- Terminos y condiciones (implementados en /terminos)
- Tratamiento de datos personales (Ley 25.326 Argentina)
- Consentimiento informado en registro de usuarios
- Politica de retencion y eliminacion de datos
- Cumplimiento de normativa laboral textil aplicable

**Cuando se completa:** Validado por area legal antes de la entrega formal.

---

## Estado general

| Seccion | Estado | Responsable |
|---------|--------|-------------|
| Codigo y repositorios | Pendiente | Desarrollo |
| Infraestructura y deploy | Pendiente | Desarrollo |
| Configuracion y variables | Pendiente | Desarrollo |
| Datos y migraciones | Pendiente | Desarrollo |
| Documentacion tecnica/funcional | En progreso | Desarrollo |
| Pruebas y seguridad | Pendiente | Desarrollo + QA |
| Licencias | Pendiente | Legal + Desarrollo |
| Cumplimiento legal | Pendiente | Legal |
