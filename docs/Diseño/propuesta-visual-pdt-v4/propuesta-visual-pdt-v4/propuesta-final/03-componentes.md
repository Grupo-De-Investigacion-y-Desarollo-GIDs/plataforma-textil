# Componentes UI — PDT v4

Cambios a hacer en `src/compartido/componentes/ui/`. Cada uno es 1 archivo. Aplicar en orden — los siguientes asumen que los anteriores ya están.

---

## 1. Button (`button.tsx`)

**Cambios:**
- Agregar variante `outline-dark` (border ink-primary, no border-blue)
- Hover state más sutil
- Padding por size aumentado en `lg`

```tsx
const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-brand-blue hover:bg-brand-blue-hover text-white shadow-soft',
  secondary: 'bg-white hover:bg-pastel-blue text-brand-blue border-2 border-brand-blue',
  'outline-dark': 'bg-white hover:bg-gray-50 text-ink-primary border border-ink-primary',
  success: 'bg-status-success hover:bg-green-600 text-white',
  danger: 'bg-status-error hover:bg-red-600 text-white',
  terra: 'bg-terra-600 hover:bg-terra-700 text-white',
  ghost: 'bg-transparent hover:bg-pastel-blue text-brand-blue',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3.5 text-base',
}
```

**Ejemplo de uso:**
```jsx
<Button variant="primary" size="lg" icon={<UserIcon />}>Soy taller</Button>
<Button variant="outline-dark" size="lg">Soy marca</Button>
<Button variant="terra" size="md">Buscar pedidos disponibles</Button>
```

---

## 2. Card (`card.tsx`)

**Cambios:**
- `rounded-card` (16px, antes era `rounded-xl` 12px)
- Sombra `shadow-card` nueva
- Padding `p-6` por defecto, `p-8` para cards destacadas
- Borde más sutil (`border-gray-100`)
- Variante con `accent-bar` (barra de color superior)

```tsx
type AccentColor = 'blue' | 'green' | 'purple' | 'terra' | 'yellow' | 'none'

interface CardProps {
  children: React.ReactNode
  title?: React.ReactNode
  description?: string
  footer?: React.ReactNode
  accent?: AccentColor   // NUEVO
  className?: string
}

const accentColors: Record<AccentColor, string> = {
  blue: 'bg-brand-blue',
  green: 'bg-green-700',
  purple: 'bg-purple-700',
  terra: 'bg-terra-600',
  yellow: 'bg-yellow-600',
  none: '',
}

export function Card({ children, title, description, footer, accent = 'none', className }: CardProps) {
  return (
    <div className={cn(
      'bg-white rounded-card shadow-card border border-gray-100 overflow-hidden hover:shadow-card-hover transition-shadow',
      className
    )}>
      {accent !== 'none' && <div className={cn('h-2', accentColors[accent])} />}
      <div className="p-6">
        {title && (
          <div className="mb-4">
            <h3 className="font-overpass font-bold text-ink-primary text-lg">{title}</h3>
            {description && <p className="text-sm text-ink-secondary mt-1">{description}</p>}
          </div>
        )}
        {children}
        {footer && <div className="mt-4 pt-4 border-t border-gray-100">{footer}</div>}
      </div>
    </div>
  )
}
```

**Ejemplo:**
```jsx
<Card accent="blue" title="Talleres">...</Card>
<Card accent="green" title="Marcas">...</Card>
<Card accent="terra">...</Card>
```

---

## 3. Badge (`badge.tsx`)

**Cambios:**
- Variantes con pastel-bg + dark-text (más legibles que solo text-color)
- Tipografía Overpass uppercase tracking-widest

```tsx
type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'terra'

const variants: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-pastel-green text-green-800',
  warning: 'bg-pastel-yellow text-yellow-800',
  error: 'bg-pastel-red text-red-800',
  info: 'bg-pastel-blue text-brand-blue',
  terra: 'bg-pastel-terra text-terra-700',
}

export function Badge({ variant = 'default', children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-overpass font-bold uppercase tracking-widest',
        variants[variant],
      )}
      {...props}
    >
      {children}
    </span>
  )
}
```

**Mapeo semántico de estados de pedido:**
```jsx
<Badge variant="warning">Pendiente</Badge>
<Badge variant="info">En producción</Badge>
<Badge variant="success">Por entregar</Badge>
<Badge variant="success">Completado</Badge>
<Badge variant="error">Rechazado</Badge>
<Badge variant="terra">Nivel Bronce</Badge>
```

---

## 4. Input (`input.tsx`)

**Cambios mínimos:**
- `rounded-input` (8px) en lugar de `rounded-lg` (10px) → más limpio
- Focus ring con `ring-brand-blue/30` en lugar de `ring-blue-500`
- Padding aumentado para mejor tap target

```tsx
className={cn(
  'w-full px-4 py-2.5 rounded-input border border-gray-200 bg-white',
  'text-ink-primary placeholder:text-ink-muted',
  'focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue',
  'disabled:bg-gray-50 disabled:cursor-not-allowed',
  error && 'border-status-error focus:ring-status-error/30',
  className,
)}
```

---

## 5. EmptyState (`empty-state.tsx`)

**Refactor completo.** El actual es minimal. Nuevo patrón:

```tsx
interface EmptyStateProps {
  icon?: React.ReactNode    // SVG o componente
  title: string             // "Aún no tenés pedidos asignados"
  description?: string      // "Te avisaremos por email..."
  action?: {
    label: string           // "Completá tu perfil..."
    href?: string
    onClick?: () => void
  }
  variant?: 'default' | 'highlighted'  // 'highlighted' usa pastel-terra de fondo
}

export function EmptyState({ icon, title, description, action, variant = 'default' }: EmptyStateProps) {
  return (
    <div className={cn(
      'rounded-card p-12 text-center border-2 border-dashed',
      variant === 'highlighted' ? 'bg-pastel-terra border-terra-300/50' : 'bg-white border-gray-200'
    )}>
      {icon && (
        <div className="w-24 h-24 rounded-full bg-pastel-blue mx-auto flex items-center justify-center mb-5">
          {icon}
        </div>
      )}
      <h3 className="font-overpass font-bold text-2xl text-ink-primary mb-2">{title}</h3>
      {description && (
        <p className="text-ink-secondary mb-6 max-w-md mx-auto">{description}</p>
      )}
      {action && (
        <Button variant="primary" {...(action.href ? { as: 'a', href: action.href } : { onClick: action.onClick })}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
```

**Aplicar en TODOS los lugares con listas vacías:**
- `/taller/pedidos` cuando no hay pedidos
- `/marca/directorio` con filtros sin resultados
- `/admin/observaciones` sin observaciones
- `/estado/talleres` sin talleres registrados

---

## 6. KpiCard (NUEVO componente — `kpi-card.tsx`)

Reemplaza el patrón actual de stat cards en dashboards.

```tsx
interface KpiCardProps {
  label: string                          // "Pedidos activos"
  value: string | number                 // 3 / "6,468"
  unit?: string                          // "/ 5", "prendas/mes"
  icon: React.ReactNode
  iconColor: 'blue' | 'green' | 'purple' | 'terra' | 'yellow'
  delta?: { value: string; trend: 'up' | 'down' | 'neutral' }  // "+1 vs abril"
  footnote?: string                      // "últimos 6 meses"
}

const iconBg = {
  blue: 'bg-pastel-blue text-brand-blue',
  green: 'bg-pastel-green text-green-700',
  purple: 'bg-pastel-purple text-purple-700',
  terra: 'bg-pastel-terra text-terra-600',
  yellow: 'bg-pastel-yellow text-yellow-700',
}

const deltaColor = {
  up: 'text-status-success',
  down: 'text-status-error',
  neutral: 'text-ink-muted',
}

export function KpiCard({ label, value, unit, icon, iconColor, delta, footnote }: KpiCardProps) {
  return (
    <div className="bg-white rounded-card p-5 shadow-card border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', iconBg[iconColor])}>
          {icon}
        </div>
        {delta && (
          <span className={cn('text-[10px] font-bold flex items-center gap-1', deltaColor[delta.trend])}>
            {delta.trend === 'up' && <ArrowUpIcon className="w-3 h-3" />}
            {delta.trend === 'down' && <ArrowDownIcon className="w-3 h-3" />}
            {delta.value}
          </span>
        )}
      </div>
      <p className="text-xs uppercase tracking-wider text-ink-muted font-overpass font-bold">{label}</p>
      <p className="font-serif font-bold text-4xl text-ink-primary mt-1">
        {value}
        {unit && <span className="text-lg text-ink-muted font-medium ml-1">{unit}</span>}
      </p>
      {footnote && <p className="text-[10px] text-ink-muted mt-1">{footnote}</p>}
    </div>
  )
}
```

**Uso (reemplaza la grid actual de StatCard en `/taller/page.tsx`):**
```jsx
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  <KpiCard
    label="Pedidos activos"
    value={3}
    icon={<PackageIcon className="w-5 h-5" />}
    iconColor="blue"
    delta={{ value: '+1 vs abril', trend: 'up' }}
  />
  <KpiCard label="Rating" value="3.2" unit="/5" icon={<StarIcon />} iconColor="green" />
  <KpiCard label="Capacidad" value="6,468" footnote="prendas/mes" icon={<ChartIcon />} iconColor="terra" />
  <KpiCard label="On-time" value="75%" footnote="últimos 6 meses" icon={<ClockIcon />} iconColor="yellow" />
</div>
```

---

## 7. Filter pills (NUEVO — `filter-pills.tsx`)

Reemplaza filtros como selects/forms en listados.

```tsx
interface FilterPillsProps {
  options: { value: string; label: string; count?: number }[]
  active: string
  onChange: (value: string) => void
}

export function FilterPills({ options, active, onChange }: FilterPillsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-overpass font-semibold transition-colors',
            active === opt.value
              ? 'bg-ink-primary text-white'
              : 'border border-gray-200 hover:bg-gray-50 text-ink-secondary'
          )}
        >
          {opt.label}{opt.count !== undefined && ` · ${opt.count}`}
        </button>
      ))}
    </div>
  )
}
```

**Uso en `/taller/pedidos/page.tsx`:**
```jsx
<FilterPills
  options={[
    { value: 'todos', label: 'Todos', count: 3 },
    { value: 'pendientes', label: 'Pendientes', count: 1 },
    { value: 'produccion', label: 'En producción', count: 1 },
    { value: 'entregar', label: 'Por entregar', count: 1 },
    { value: 'completados', label: 'Completados', count: 8 },
  ]}
  active={selectedFilter}
  onChange={setSelectedFilter}
/>
```

---

## 8. Iconos custom (NUEVO — `compartido/iconos/`)

Crear archivo `src/compartido/iconos/index.tsx` que exporte el set de 12 iconos custom como componentes React:

- `IconTaller`, `IconMarca`, `IconEstado`
- `IconTrazabilidad`, `IconVerificado`, `IconPedido`
- `IconStats`, `IconCapacitacion`, `IconTiempo`
- `IconSpark`, `IconTrendUp`, `IconBell`

Los SVG están en `mockup/mockup-v6.html` dentro del bloque `<defs>` (líneas ~120-200). Copiar y wrappear cada uno como componente:

```tsx
export function IconTaller({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5"
         strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M3 21l5-5"/>
      <path d="M8 16l10-10c1-1 3-1 4 0s1 3 0 4L12 20"/>
      <circle cx="20" cy="4" r="1.5" fill="currentColor"/>
      <path d="M14 18l4 4" opacity="0.4"/>
    </svg>
  )
}
```

**Decisión:** los iconos custom **complementan**, no reemplazan, a `lucide-react`. Lucide se sigue usando para iconos genéricos (chevrons, search, menu, etc.). Los custom se usan para conceptos PDT-específicos (taller, marca, estado, trazabilidad).

---

## 9. Logo (NUEVO — `compartido/iconos/logo-pdt.tsx`)

**Decisión tomada:** PDT-círculo (PNG generado con IA por Sergio).

```tsx
import Image from 'next/image'
import logoUrl from '/public/logo-pdt.png'

interface LogoPDTProps {
  className?: string
  size?: number  // px
}

export function LogoPDT({ className, size = 48 }: LogoPDTProps) {
  return (
    <Image
      src={logoUrl}
      alt="PDT — Plataforma Digital Textil"
      width={size}
      height={size}
      className={className}
      priority
    />
  )
}
```

**Variantes a generar (Sergio, antes de Fase 11):**
- `public/logo-pdt.png` — versión principal (la que ya está en `mockup/assets/`)
- `public/favicon.ico` — 32×32 derivada del logo
- `public/logo-pdt-og.png` — 1200×630 para `og:image` (con texto "Plataforma Digital Textil" al lado)
- `public/apple-touch-icon.png` — 180×180

Estas variantes se generan a partir del PNG base (Sergio puede pedirlas al mismo proveedor IA o hacerlas con un editor de imágenes).

---

## Componentes que NO cambian

- `Modal`, `DataTable`, `ProgressRing`, `SaveToast`, `Select`, `SectionError`, `SearchInput`, `LogoutButton`, `ImageLightbox`, `FileUpload`, `ChecklistItem`, `InfoCard`, `Breadcrumbs`, `ChecklistOnboarding`, `Loading`, `Skeleton`, `SkeletonPage`, `Toast`

Heredan automáticamente la nueva paleta y tipografía vía tokens. Si alguno se ve raro post-tokens, ajustar puntualmente.
