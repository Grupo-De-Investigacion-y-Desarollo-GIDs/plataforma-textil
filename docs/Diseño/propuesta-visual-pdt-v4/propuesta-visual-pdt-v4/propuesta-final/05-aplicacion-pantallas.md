# Aplicación a pantallas — PDT v4

Cómo se aplica el rediseño a las pantallas existentes del app interno. Las que NO están listadas heredan automáticamente vía tokens y componentes.

---

## 1. Dashboard TALLER (`src/app/(taller)/taller/page.tsx`)

**Mockup de referencia:** `mockup/mockup-v6.html` PANTALLA 2.

### Cambios

1. **Saludo:**
   - Antes: `<h1>Bienvenido, Taller La Aguja</h1>` + `Tu nivel actual: 🥉 BRONCE`
   - Después:
     ```jsx
     <p className="text-xs uppercase tracking-widest font-overpass font-bold text-terra-600 mb-2">Tu panel</p>
     <div className="flex items-center gap-3 mb-2">
       <h1 className="font-serif font-bold text-4xl text-ink-primary">Hola, Taller La Aguja</h1>
       <Badge variant="terra">Nivel Bronce</Badge>
     </div>
     <p className="text-ink-secondary">
       Tu progreso de formalización es del <span className="font-bold text-brand-blue">14%</span>.
       Te faltan 6 documentos para subir a Plata.
     </p>
     ```

2. **Card "Próxima acción"** (NUEVA):
   - Reemplaza al actual checklist "Tus primeros pasos"
   - Card destacada con gradient pastel-blue → pastel-terra
   - Icono `IconSpark` + título serif + CTA primario
   - El "qué mostrar" se calcula server-side: el primer ítem PENDIENTE de formalización + un CTA "Continuar"

3. **5 KPIs → 4 KPIs** (eliminar "Certificados" si no aporta):
   - Pedidos activos (con delta `+1 vs abril`)
   - Rating (3.2/5)
   - Capacidad (6,468 prendas/mes)
   - On-time (75% últimos 6 meses)
   - Usar `<KpiCard>` de `03-componentes.md`

4. **3 cards de "Acciones rápidas" → eliminar**. Sus acciones ya están como tabs del header (Mis pedidos, Mi formalización, Academia). Eran redundantes.

5. **Pedidos activos:**
   - Mantener la lista
   - Reemplazar códigos crípticos `MO-2026-A7221043 OM-2026-...` por **nombres humanos**: "Urbano Textil — 500 unidades · Plazo 15 días"
   - El código queda como microdato en gris muy chico debajo
   - Badges semánticos: Pendiente (warning), En producción (info), Por entregar (success)

6. **Capacitaciones recomendadas:**
   - Mantener
   - Mostrar progreso bar (ya existe)
   - Click → `/taller/aprender/[id]`

### Bloque de código de referencia para Pedidos activos

```jsx
{pedidos.map(p => (
  <Link key={p.id} href={`/taller/pedidos/${p.id}`}
    className="block p-4 rounded-xl border border-gray-100 hover:border-brand-blue hover:bg-pastel-blue/30 transition-colors">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-pastel-blue flex items-center justify-center">
          <IconPedido className="w-5 h-5 text-brand-blue" />
        </div>
        <div>
          <p className="font-overpass font-bold text-ink-primary">
            {p.marca.nombre} — {p.cantidad} unidades
          </p>
          <p className="text-xs text-ink-muted mt-0.5">
            {p.proceso} · Plazo {p.plazoDias} días
          </p>
        </div>
      </div>
      <Badge variant={statusToVariant(p.estado)}>{p.estado}</Badge>
    </div>
  </Link>
))}
```

---

## 2. Dashboard MARCA (`src/app/(marca)/marca/page.tsx`)

**Mismo patrón que Dashboard TALLER**, pero más vacío en la versión actual. Ahora se llena.

### Cambios

1. Saludo idéntico al de TALLER pero sin badge de nivel (las marcas no tienen niveles)
2. Card "Próxima acción" — basada en cotizaciones pendientes de revisar
3. 4 KPIs:
   - Pedidos creados
   - Pedidos activos
   - Cotizaciones pendientes (con delta o nota "requiere revisión")
   - Talleres favoritos / recientes
4. Sección NUEVA "Mis pedidos recientes" (tabla compacta como en TALLER) — hoy NO existe
5. Sección NUEVA "Talleres recomendados" (cards de talleres del directorio según perfil) — opcional v4

---

## 3. Dashboard ESTADO (`src/app/(estado)/estado/page.tsx`)

**Es el mejor dashboard del set actual.** Cambios mínimos:

1. Aplicar `<KpiCard>` a los 4 stats arriba ("Cómo está el sector?")
2. Aplicar `<Card accent="terra">` o variantes a los grupos "Donde hay que actuar?" y "Qué está funcionando?"
3. La card "Progreso de formalización" se mantiene pero con la barra de progreso restilizada
4. "Actividad reciente" — mejorar tipografía del timeline

**No cambiar la estructura.** Sirve de modelo para los demás.

---

## 4. Dashboard ADMIN (`src/app/(admin)/admin/page.tsx`)

**No se restructura en v4** (tiene su propio sidebar layout que no se unifica).

Cambios solo cosméticos vía tokens:
- Body color cambia a ink-primary (era azul brand)
- Cards heredan `shadow-card` nuevo
- Botones heredan estilos nuevos
- Sidebar se mantiene

---

## 5. Listados (pedidos, talleres, observaciones)

### Patrón unificado

Todas las páginas de listado deben tener:

1. **Breadcrumb arriba** (`Tablero → Mis pedidos`)
2. **Header de página:**
   - Pre-title pequeño en terracotta uppercase ("Producción activa")
   - H1 serif grande
   - Subtítulo con counts ("3 pedidos activos · 8 completados este mes")
   - CTA secundario a la derecha si aplica (ej: "Buscar pedidos disponibles")
3. **`<FilterPills>`** en lugar de selects
4. **Tabla limpia** con badges semánticos en columna "Estado"
5. **`<EmptyState>`** cuando no hay resultados

### Páginas afectadas

- `/taller/pedidos` y `/taller/pedidos/disponibles`
- `/marca/pedidos`
- `/marca/directorio`
- `/estado/talleres`
- `/admin/talleres`, `/admin/usuarios`, `/admin/observaciones`, `/admin/auditorias`

**Mockup de referencia:** `mockup/mockup-v6.html` PANTALLA 3.

---

## 6. Detalle de pedido (`/taller/pedidos/[id]`, `/marca/pedidos/[id]`)

### Cambios

1. **Header del detalle:**
   - Antes: `<h1>MO-2026-E1D8FA31</h1>` con badge a la derecha
   - Después: `<h1 className="font-serif">Pedido de mayo</h1>` + badge + el código MO-... en microdato gris

2. **Cards de info:**
   - Aplicar `<Card>` consistentemente
   - Headers de sección en uppercase + tracking-widest (estilo "DETALLE DEL PEDIDO")
   - Mantener el patrón de 2 columnas internas (Marca/Prenda, Cantidad/Plazo)

3. **CTAs:**
   - "Aceptar orden" → variant `success` con verde fuerte (ya existe)
   - "Rechazar orden" → variant `danger` con rojo fuerte (ya existe)
   - "Contactar por WhatsApp" → variant `success` también, con icono lucide

4. **Actividad de tu orden:**
   - Convertir en timeline vertical con bullets pastel
   - Cada item: ícono pastel circular + texto + tiempo relativo

---

## 7. Mi Formalización (`/taller/formalizacion`)

**El más complejo de aplicar.** Mantener funcionalidad pero refrescar visual.

### Cambios

1. **Card de progreso 14%:**
   - Donut a la izquierda + tabla "Niveles" a la derecha
   - Mantener el donut pero con stroke `text-brand-blue`
   - "1/7 completados" en serif grande
   - Tabla niveles más limpia: solo 3 filas (Bronce/Plata/Oro) con puntos requeridos vs actuales

2. **Checklist de 7 documentos:**
   - Cada item como `<Card>` chica (no toda la lista en una mega card)
   - Borde izquierdo de color según estado: verde (completado) / amarillo (pendiente) / gris (no iniciado)
   - Badge semántico
   - Sub-pasos (radio buttons como "Asegurá a tu equipo: ya tiene ART/no la hizo") → convertir en sub-cards seleccionables, no radio inputs feos

3. **Banner final** "¿Necesitás ayuda?":
   - Card con `<EmptyState variant="highlighted">` o card terracotta
   - CTA primario "Pedí cuenta"

---

## 8. Login y Registro

**Login** ya está bien diseñado (es de las pantallas mejores del actual). Cambios mínimos:
- Heredar tokens nuevos (body color cambia)
- "Iniciar sesion" → "Iniciar sesión" (tilde)
- Mantener layout de card centrada

**Registro** — aplicar mismo patrón.

---

## 9. Mi Perfil TALLER (`/taller/perfil`)

Está bien organizado actualmente. Cambios:

1. Header del perfil con nombre + badge de nivel terracotta
2. Donut "89% Perfil completo" → mantener, restilizar
3. 4 stat cards → reemplazar por `<KpiCard>` (Rating / Trabajadores / Capacidad / On-time)
4. **DECISIÓN:** unificar las 3 métricas dispersas (14% formalización + 89% perfil + 75% on-time) en un solo widget "Estado del taller" con 3 barras horizontales. Resuelve A12 de la auditoría.

---

## 10. Pantallas que solo heredan tokens

Cambian visualmente sin código nuevo:

- Todas las pantallas de detalle (`/marca/directorio/[id]`, `/admin/talleres/[id]`)
- `/cuenta` y `/cuenta/notificaciones`
- `/perfil/[id]` (perfil público de taller)
- `/ayuda`, `/terminos`, `/privacidad`
- Mensajes y notificaciones

---

## Orden de aplicación recomendado

Ver `06-plan-implementacion.md`. Resumen:

1. Tokens (`globals.css`) → todas las pantallas heredan
2. Componentes UI base (Button, Card, Badge, Input)
3. KpiCard, FilterPills, EmptyState
4. Iconos custom
5. Header app + Footer
6. Header public
7. Landing nueva (`/`)
8. Pantallas internas en orden de prioridad: Dashboard taller → Dashboard marca → Pedidos taller → Mi formalización → resto
