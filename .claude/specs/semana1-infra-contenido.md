# Spec: Infraestructura rol CONTENIDO

- **Semana:** 1
- **Prioridad:** Primera — todo lo demas depende de este spec
- **Dependencias:** Ninguna

---

## 1. Contexto

Se agrega el rol CONTENIDO al sistema para que el equipo de comunicaciones de OIT/UNTREF gestione la academia y notificaciones sin acceso al panel de administracion tecnica. Gerardo hace los cambios de infraestructura primero y mergea. Sergio implementa la UI despues.

---

## 2. Que construir

- CONTENIDO existe en el enum UserRole
- Usuario CONTENIDO se loguea y llega a `/contenido`
- Usuario CONTENIDO accede a `/contenido/*` pero no a `/admin/*` ni `/estado/*`
- APIs de colecciones, videos y evaluaciones aceptan CONTENIDO ademas de ADMIN
- Admin puede crear usuarios CONTENIDO desde `/admin/usuarios`

---

## 3. Datos

- Agregar `CONTENIDO` al enum `UserRole` en `prisma/schema.prisma`
- Migracion: `npx prisma migrate dev --name agregar_rol_contenido`
- No hay tablas nuevas

---

## 4. Prescripciones tecnicas

### Gerardo (mergear antes de que Sergio arranque)

#### `prisma/schema.prisma`

```prisma
enum UserRole {
  TALLER
  MARCA
  ESTADO
  ADMIN
  CONTENIDO
}
```

Correr: `npx prisma migrate dev --name agregar_rol_contenido`

#### `src/middleware.ts`

Agregar despues del bloque de `/estado`:

```typescript
if (pathname.startsWith('/contenido')) {
  if (userRole !== 'CONTENIDO' && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/unauthorized', nextUrl))
  }
  return NextResponse.next()
}
```

Agregar en el switch de redirect raiz:

```typescript
case 'CONTENIDO':
  return NextResponse.redirect(new URL('/contenido', nextUrl))
```

#### `src/compartido/componentes/ui/logout-button.tsx`

Nuevo. Extraer `AdminLogoutButton` de `src/app/(admin)/layout.tsx` a este archivo como componente generico `LogoutButton`. Actualizar el layout admin para importarlo desde la nueva ubicacion.

#### Endpoints — mismo patron en los 6 metodos:

- `src/app/api/colecciones/route.ts` — POST
- `src/app/api/colecciones/[id]/route.ts` — PUT, DELETE
- `src/app/api/colecciones/[id]/videos/route.ts` — POST, DELETE
- `src/app/api/colecciones/[id]/evaluacion/route.ts` — GET, PUT

Reemplazar en cada uno:

```typescript
if (role !== 'ADMIN') {
```

Por:

```typescript
if (role !== 'ADMIN' && role !== 'CONTENIDO') {
```

---

### ANTES DE ARRANCAR (solo parte Sergio)

Verificar que este commit esta en develop:

- [ ] Parte Gerardo de este mismo spec — commit con mensaje `feat: agregar rol CONTENIDO al schema y middleware`

Si no esta mergeado, NO arrancar. Avisarle a Gerardo.

### Sergio (solo despues de que Gerardo mergee)

#### `src/app/(contenido)/layout.tsx`

Nuevo. Mismo patron que `src/app/(admin)/layout.tsx`. Sidebar con 3 items:

- Colecciones → `/contenido/colecciones`
- Evaluaciones → `/contenido/evaluaciones`
- Notificaciones → `/contenido/notificaciones`

Usar `LogoutButton` desde `src/compartido/componentes/ui/logout-button.tsx`.

#### `src/app/(contenido)/contenido/page.tsx`

Nuevo. Solo redirect a `/contenido/colecciones`.

#### `src/app/(admin)/admin/usuarios/page.tsx`

Agregar `ESTADO` y `CONTENIDO` al select de roles (lineas 84-88). Actualmente solo tiene TALLER, MARCA, ADMIN.

---

## 5. Casos borde

- Usuario ADMIN entra a `/contenido` → debe poder acceder
- Usuario CONTENIDO entra a `/admin` → redirect a `/unauthorized`
- Usuario CONTENIDO llama `POST /api/colecciones` → 201
- Usuario TALLER llama `POST /api/colecciones` → 403

---

## 6. Criterio de aceptacion

- [ ] Migracion corre sin errores
- [ ] Usuario CONTENIDO puede loguearse y llega a `/contenido`
- [ ] Usuario CONTENIDO no puede acceder a `/admin` — ve `/unauthorized`
- [ ] Usuario ADMIN puede acceder a `/contenido`
- [ ] `PUT /api/colecciones/[id]` con token CONTENIDO → 200
- [ ] `PUT /api/colecciones/[id]` con token TALLER → 403
- [ ] Select de roles en `/admin/usuarios` muestra CONTENIDO y ESTADO
- [ ] Build pasa sin errores

---

## 7. Tests (verificacion manual — tests automatizados en semana 4)

1. Crear usuario CONTENIDO desde `/admin/usuarios`
2. Loguearse con ese usuario → verificar redirect a `/contenido`
3. Intentar navegar a `/admin` → debe ver `/unauthorized`
4. Desde Thunder Client: `PUT /api/colecciones/[id]` con token CONTENIDO → 200
5. Desde Thunder Client: `PUT /api/colecciones/[id]` con token TALLER → 403
