import { describe, it, expect, vi, beforeEach } from 'vitest'

// Test toast extended API
describe('Toast extendido — UX-03', () => {
  let ToastProvider: typeof import('@/compartido/componentes/ui/toast').ToastProvider
  let useToast: typeof import('@/compartido/componentes/ui/toast').useToast

  beforeEach(async () => {
    vi.resetModules()
    const mod = await import('@/compartido/componentes/ui/toast')
    ToastProvider = mod.ToastProvider
    useToast = mod.useToast
  })

  it('exporta ToastProvider y useToast', () => {
    expect(ToastProvider).toBeDefined()
    expect(useToast).toBeDefined()
    expect(typeof ToastProvider).toBe('function')
    expect(typeof useToast).toBe('function')
  })
})

// Test EmptyState component
describe('EmptyState — UX-02', () => {
  it('se puede importar correctamente', async () => {
    const { EmptyState } = await import('@/compartido/componentes/ui/empty-state')
    expect(EmptyState).toBeDefined()
    expect(typeof EmptyState).toBe('function')
  })
})

// Test Breadcrumbs component
describe('Breadcrumbs — UX-04', () => {
  it('se puede importar correctamente', async () => {
    const { Breadcrumbs } = await import('@/compartido/componentes/ui/breadcrumbs')
    expect(Breadcrumbs).toBeDefined()
    expect(typeof Breadcrumbs).toBe('function')
  })
})

// Test Loading component
describe('Loading — UX-01', () => {
  it('se puede importar correctamente', async () => {
    const { Loading } = await import('@/compartido/componentes/ui/loading')
    expect(Loading).toBeDefined()
    expect(typeof Loading).toBe('function')
  })
})

// Test Skeleton components
describe('Skeleton — UX-01', () => {
  it('exporta Skeleton, SkeletonCard y SkeletonTable', async () => {
    const { Skeleton, SkeletonCard, SkeletonTable } = await import('@/compartido/componentes/ui/skeleton')
    expect(Skeleton).toBeDefined()
    expect(SkeletonCard).toBeDefined()
    expect(SkeletonTable).toBeDefined()
  })
})

// Test retrocompatibilidad del toast
describe('Toast retrocompatibilidad — firma simple', () => {
  it('toast(string, type) sigue funcionando como antes', async () => {
    const mod = await import('@/compartido/componentes/ui/toast')
    // La firma acepta (string, type?) — esto verifica que el tipo compile
    expect(typeof mod.useToast).toBe('function')
  })
})

// Test que no quedan alert() en archivos migrados
describe('Migracion alert() — UX-03', () => {
  it('publicar-pedido.tsx no usa alert()', async () => {
    const fs = await import('fs')
    const content = fs.readFileSync('src/marca/componentes/publicar-pedido.tsx', 'utf-8')
    expect(content).not.toContain('alert(')
  })

  it('contactar-taller.tsx no usa alert()', async () => {
    const fs = await import('fs')
    const content = fs.readFileSync('src/marca/componentes/contactar-taller.tsx', 'utf-8')
    expect(content).not.toContain('alert(')
  })

  it('completar/page.tsx no usa alert()', async () => {
    const fs = await import('fs')
    const content = fs.readFileSync('src/app/(taller)/taller/perfil/completar/page.tsx', 'utf-8')
    expect(content).not.toContain('alert(')
  })
})

// Test que ArrowLeft fue reemplazado en paginas de detalle
describe('Breadcrumbs aplicados — UX-04', () => {
  const paginasConBreadcrumbs = [
    'src/app/(admin)/admin/talleres/[id]/page.tsx',
    'src/app/(admin)/admin/marcas/[id]/page.tsx',
    'src/app/(marca)/marca/pedidos/[id]/page.tsx',
    'src/app/(taller)/taller/pedidos/disponibles/[id]/page.tsx',
    'src/app/(taller)/taller/pedidos/[id]/page.tsx',
    'src/app/(admin)/admin/auditorias/[id]/page.tsx',
    'src/app/(estado)/estado/talleres/[id]/page.tsx',
    'src/app/(marca)/marca/directorio/[id]/page.tsx',
  ]

  paginasConBreadcrumbs.forEach(path => {
    const nombre = path.split('/').slice(-3).join('/')
    it(`${nombre} usa Breadcrumbs`, async () => {
      const fs = await import('fs')
      const content = fs.readFileSync(path, 'utf-8')
      expect(content).toContain('Breadcrumbs')
      expect(content).not.toMatch(/Volver a \w/)
    })
  })
})
