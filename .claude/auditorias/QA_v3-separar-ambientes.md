# QA: Separar ambientes — Supabase desarrollo y produccion

**Spec:** `v3-separar-ambientes.md`
**Commit de implementacion:** `pendiente`
**URL de prueba:** https://plataforma-textil.vercel.app (prod) + URL de Preview (develop)
**Fecha:** 2026-04-26
**Auditor:** Sergio

---

## Resultado global

- [ ] Aprobado — todo funciona
- [ ] Aprobado con fixes — funciona pero hay bugs menores
- [ ] Rechazado — falta funcionalidad o hay bugs bloqueantes

**Decision:** [ cerrar v3 / fix inmediato / abrir item v4 ]
**Issues abiertos:** #

---

## Eje 1 — Funcionalidad

Verificar que cada criterio de aceptacion del spec esta implementado.

> **Nota:** Los items marcados **DEV** los verifica Gerardo desde el codigo o la terminal — no son verificables desde el browser. El auditor solo verifica los items marcados **QA**.

| # | Criterio | Verificador | Resultado | Issue |
|---|----------|-------------|-----------|-------|
| 1 | Nueva Supabase `plataforma-textil-dev` existe con el mismo schema que prod | DEV | | |
| 2 | Las 17 migraciones aparecen en `_prisma_migrations` de la nueva DB | DEV | | |
| 3 | Seed corre limpio en la nueva instancia sin errores | DEV | | |
| 4 | Variables de entorno en Vercel: 4 vars DB con scope diferenciado (Preview vs Production) | DEV | | |
| 5 | Variables de entorno en Vercel: vars compartidas con scope "All Environments" | DEV | | |
| 6 | Branch `main` configurada como Production Branch en Vercel | DEV | | |
| 7 | Push a `develop` genera Preview con Supabase dev | QA | | |
| 8 | Push a `main` genera deploy automatico a produccion con Supabase prod | DEV | | |
| 9 | Banner de ambiente visible en Preview | QA | | |
| 10 | Banner de ambiente invisible en Production | QA | | |
| 11 | Build corre `prisma migrate deploy` automaticamente en cada deploy | DEV | | |
| 12 | Seed no se ejecuta en produccion | DEV | | |

---

## Eje 2 — Navegabilidad

### Paso 1 — Verificar banner en Preview

- **Rol:** Cualquiera (sin login)
- **URL de inicio:** URL de Preview de develop (generada por Vercel)
- **Accion:** Abrir la URL de Preview
- **Esperado:** Banner amarillo en la parte superior: "AMBIENTE DE PRUEBAS — este no es el ambiente de produccion"
- **Resultado:** [ ]
- **Notas:**

### Paso 2 — Verificar que no hay banner en Production

- **Rol:** Cualquiera (sin login)
- **URL de inicio:** https://plataforma-textil.vercel.app
- **Accion:** Abrir la URL de produccion
- **Esperado:** No debe haber ningun banner de ambiente
- **Resultado:** [ ]
- **Notas:**

### Paso 3 — Verificar aislamiento de datos (Preview)

- **Rol:** ADMIN
- **URL de inicio:** URL de Preview / admin
- **Accion:** Loguearse como admin en Preview, crear un usuario de prueba
- **Esperado:** El usuario de prueba NO aparece en produccion
- **Resultado:** [ ]
- **Notas:**

### Paso 4 — Verificar datos de produccion intactos

- **Rol:** ADMIN
- **URL de inicio:** https://plataforma-textil.vercel.app/admin
- **Accion:** Loguearse como admin en produccion, verificar que los datos existentes siguen intactos
- **Esperado:** Todos los datos de produccion estan presentes y sin modificaciones
- **Resultado:** [ ]
- **Notas:**

### Paso 5 — Verificar credenciales de seed en Preview

- **Rol:** Cualquier rol de prueba
- **URL de inicio:** URL de Preview / login
- **Accion:** Loguearse con las credenciales de seed (lucia.fernandez@pdt.org.ar / pdt2026)
- **Esperado:** Login exitoso en Preview con datos de seed poblados
- **Resultado:** [ ]
- **Notas:**

---

## Eje 3 — Casos borde

> **Nota:** Los items marcados **DEV** los verifica Gerardo desde el codigo o la terminal — no son verificables desde el browser.

| # | Caso | Accion | Esperado | Verificador | Resultado |
|---|------|--------|----------|-------------|-----------|
| 1 | Seed en produccion | Verificar logs de build de produccion en Vercel | No debe aparecer `prisma db seed` en los logs | DEV | |
| 2 | Migraciones automaticas | Verificar logs de build en Vercel | `prisma migrate deploy` aparece en los logs de build | DEV | |
| 3 | NEXTAUTH_URL en Preview | Loguearse en Preview | Login funciona sin error de callback URL | QA | |
| 4 | Banner en desarrollo local | Correr `npm run dev` localmente | No debe aparecer banner (VERCEL_ENV no existe localmente) | DEV | |
| 5 | Modificar datos en Preview no afecta prod | Crear/editar datos desde Preview | Verificar que los mismos datos en produccion no cambiaron | QA | |

---

## Eje 4 — Performance

| Verificacion | Metodo | Resultado |
|-------------|--------|-----------|
| Preview carga en menos de 3 segundos | Abrir DevTools -> Network -> recargar | |
| Production carga en menos de 3 segundos | Abrir DevTools -> Network -> recargar | |
| Sin errores en consola del browser (Preview) | DevTools -> Console -> revisar | |
| Sin errores en consola del browser (Production) | DevTools -> Console -> revisar | |

---

## Eje 5 — Consistencia visual

| Verificacion | Resultado | Notas |
|-------------|-----------|-------|
| Banner de Preview es amarillo (bg-amber-500) y legible | | |
| Banner no interfiere con el layout del resto de la pagina | | |
| Banner tiene texto centrado y tamano apropiado (text-xs) | | |
| Production se ve identica a como se veia antes del cambio | | |

---

## Resumen de issues abiertos

| Issue | Tipo | Descripcion | Prioridad sugerida |
|-------|------|-------------|-------------------|

---

## Notas del auditor

[Observaciones generales, sugerencias de UX, contexto adicional que no entra en los ejes anteriores]

---

## Checklist de cierre

- [ ] Todos los criterios de aceptacion del spec verificados
- [ ] Casos borde probados
- [ ] Performance revisada en desktop y movil
- [ ] Issues abiertos en GitHub con labels correctos
- [ ] Resultado global definido
- [ ] Documento commiteado a develop
