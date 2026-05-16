# Header, layout y footer — PDT v4

El cambio estructural más visible. Reemplaza las **4 bandas verticales** del header actual por **2 bandas** y agrega un **footer** que hoy no existe.

Hay 2 variantes del header:
- **`HeaderPublic`** — landing y páginas públicas (`/`, `/directorio`, `/ayuda`, `/login`, `/registro`)
- **`HeaderApp`** — páginas autenticadas (todas las de TALLER, MARCA, ESTADO)

ADMIN se queda con su **sidebar lateral propio** (no se unifica con el resto en v4 — decisión consciente: la inconsistencia entre app interno y panel admin no se resuelve en este alcance).

---

## 1. HeaderPublic

**Archivo:** `src/compartido/componentes/layout/header-public.tsx` (NUEVO)

**Anatomía:**
- 1 sola banda blanca con `border-b border-gray-100`
- Logo + título a la izquierda
- Nav central (5 items)
- 2 CTAs a la derecha: "Iniciar sesión" (ghost) + "Soy taller" (primary) + "Soy marca" (outline-dark)
- Sticky en scroll
- Backdrop blur opcional cuando hay scroll

**Items del nav:**
- ¿Cómo funciona? → `/#como-funciona`
- Para taller → `/taller-info`
- Para marcas → `/marca-info`
- Impacto → `/impacto`
- Recursos → `/recursos`

**NO hay item para Estado** — el acceso institucional se gestiona por convenio, no por landing.

**Implementación de referencia:** ver `mockup/mockup-v6.html` líneas ~270-300.

---

## 2. HeaderApp

**Archivo:** `src/compartido/componentes/layout/header.tsx` (REEMPLAZA el actual)

**Anatomía:**
- **Banda 1:** topbar blanca con logo + nombre app + indicador de ambiente piloto + bell + user
- **Banda 2:** tabs por rol (las que ya existen, sin cambios funcionales)
- Total: ~110px de alto (vs ~150px del actual)

**Tabs por rol** (sin cambios respecto al actual, solo renombrar a "Mis X"):

```ts
const tabsByRole: Record<string, Tab[]> = {
  TALLER: [
    { id: 'tablero', label: 'Tablero', href: '/taller' },
    { id: 'pedidos', label: 'Mis pedidos', href: '/taller/pedidos' },
    { id: 'formalizacion', label: 'Mi formalización', href: '/taller/formalizacion' },
    { id: 'perfil', label: 'Mi perfil', href: '/taller/perfil' },
    { id: 'aprender', label: 'Academia', href: '/taller/aprender' },
  ],
  MARCA: [
    { id: 'tablero', label: 'Tablero', href: '/marca' },
    { id: 'directorio', label: 'Directorio', href: '/marca/directorio' },
    { id: 'pedidos', label: 'Mis pedidos', href: '/marca/pedidos' },
    { id: 'perfil', label: 'Mi perfil', href: '/marca/perfil' },
  ],
  ESTADO: [
    { id: 'dashboard', label: 'Dashboard', href: '/estado' },
    { id: 'demanda', label: 'Demanda insatisfecha', href: '/estado/demanda-insatisfecha' },
    { id: 'sector', label: 'Datos sectoriales', href: '/estado/sector' },
    { id: 'exportar', label: 'Exportar', href: '/estado/exportar' },
  ],
}
```

**Cambios respecto al actual:**
- Banner amarillo "AMBIENTE DE PRUEBAS" → pill chiquita en topbar (`Ambiente piloto`)
- Banda azul brand grande con logo → eliminada
- Logo PDT más chico (40px vs 56px actual)
- "MARCA: Urbano Textil" debajo del logo → eliminado (la info del rol ya está en el avatar/menu del usuario)
- Notificaciones bell con dot rojo (mantener)
- Avatar circular del usuario con iniciales en lugar del nombre completo + caret

**Implementación de referencia:** ver `mockup/mockup-v6.html` líneas ~565-600 (PANTALLA 2 header).

---

## 3. Sidebar para mobile (header.tsx)

Mantener el `<UserSidebar>` actual cuando se abre con el botón de menú. Ajustes:
- Quitar el "MARCA: X" del header del sidebar (redundante con el contexto)
- Aplicar paleta nueva (terracotta accent en el badge de nivel)

---

## 4. Footer (NUEVO componente)

**Archivo:** `src/compartido/componentes/layout/footer.tsx` (NUEVO)

**Hoy no existe footer en la app.** Crearlo y montarlo en:
- `src/app/(public)/layout.tsx`
- `src/app/(auth)/layout.tsx`
- `src/app/(taller)/layout.tsx`
- `src/app/(marca)/layout.tsx`
- `src/app/(estado)/layout.tsx`
- (NO en `(admin)` — admin usa su layout propio)

**Anatomía:**
- 4 columnas: Logo+descripción / Plataforma / Recursos / Legal
- Border top sutil
- Fondo `bg-ink-primary` (casi negro), texto gris claro
- Sello "OIT · UNTREF" + año dinámico
- Año dinámico: `{new Date().getFullYear()}`

**Items por columna:**

```ts
const footerNav = {
  plataforma: [
    { label: '¿Cómo funciona?', href: '/#como-funciona' },
    { label: 'Para taller', href: '/taller-info' },
    { label: 'Para marcas', href: '/marca-info' },
    { label: 'Impacto', href: '/impacto' },
  ],
  recursos: [
    { label: 'Centro de ayuda', href: '/ayuda' },
    { label: 'Academia', href: '/academia-publica' },
    { label: 'Novedades', href: '/novedades' },
    { label: 'Contacto', href: '/contacto' },
  ],
  legal: [
    { label: 'Términos y condiciones', href: '/terminos' },
    { label: 'Política de privacidad', href: '/privacidad' },
    { label: 'Accesibilidad', href: '/accesibilidad' },
  ],
}
```

**Decisión P1 (compliance):** la "Política de privacidad" debe existir y reflejar el estado real (transferencia AR→BR a Supabase, política de retención, derechos del titular). Cubre P0.3 del mapeo OIT.

**Implementación de referencia:** `mockup/mockup-v6.html` líneas ~510-555.

---

## 5. Layout pages (sin cambios estructurales)

Los layouts en `src/app/(public)/layout.tsx`, `(taller)/layout.tsx`, etc. **NO cambian su estructura**. Solo:
1. Agregan `<Footer />` antes de cerrar `<body>`
2. El `<Header>` se renombra automáticamente al usar la nueva versión (componente reemplaza al actual)

```tsx
// src/app/(taller)/layout.tsx
export default async function TallerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  // ... validaciones de rol existentes ...

  return (
    <div className="min-h-screen flex flex-col">
      <Header userName={...} userRole="TALLER" userLevel={...} userProgress={...} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
```

---

## 6. Páginas públicas — landing rediseñada

**Archivo afectado:** `src/app/(public)/page.tsx` (la home pública).

Hoy probablemente es muy minimal o redirige a `/directorio`. La nueva landing tiene:
1. Hero con título + foto del taller + CTAs "Soy taller" / "Soy marca"
2. Sección "Para talleres y marcas" — 2 cards (sin Estado)
3. Sección "Impacto" — 4 stats con fuente
4. Sección "Novedades y capacitaciones" — carrusel con cursos + novedades
5. Banner CTA azul brand
6. Footer

**Implementación de referencia completa:** `mockup/mockup-v6.html` PANTALLA 1 (líneas ~270-555).

**Modelo Prisma `Novedad`** necesario para el carrusel — ver `06-plan-implementacion.md` paso 4.

---

## 7. Páginas que NO cambian estructuralmente

| Página | Cambio mínimo | Cambio mayor |
|---|---|---|
| `/login`, `/registro` | Aplicar nueva paleta automáticamente | No |
| `/taller`, `/marca`, `/estado` (dashboards) | Agregar `<KpiCard>` y `<Card accent="X">` | Re-layout dashboards (ver `05-aplicacion-pantallas.md`) |
| `/taller/pedidos`, `/marca/pedidos` | Reemplazar filtros por `<FilterPills>` | No |
| Todas las páginas | Aplicar `EmptyState` cuando lista vacía | No |
| `/admin/*` | Aplicar paleta nueva, sin tocar layout | No (sidebar admin se mantiene) |

---

## 8. Resumen de archivos a tocar

```
SI CAMBIAN:
src/compartido/componentes/layout/
├── header.tsx                    REEMPLAZAR (versión simplificada)
├── header-public.tsx             NUEVO
├── footer.tsx                    NUEVO
└── user-sidebar.tsx              ajustes menores

src/app/(public)/page.tsx          REESCRIBIR (landing nueva)
src/app/(public)/layout.tsx        agregar <Footer />
src/app/(auth)/layout.tsx          agregar <Footer />
src/app/(taller)/layout.tsx        agregar <Footer />
src/app/(marca)/layout.tsx         agregar <Footer />
src/app/(estado)/layout.tsx        agregar <Footer />

NO CAMBIAN ESTRUCTURALMENTE:
src/app/(admin)/layout.tsx         (admin sidebar se mantiene)
todas las páginas internas         (heredan vía tokens y componentes)
```
