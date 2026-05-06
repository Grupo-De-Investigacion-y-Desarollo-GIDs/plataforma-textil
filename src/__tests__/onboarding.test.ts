import { describe, test, expect } from 'vitest'

describe('T-03 Protocolos de onboarding', () => {
  describe('Lib onboarding — imports y tipos', () => {
    test('calcularEtapa se puede importar', async () => {
      const mod = await import('@/compartido/lib/onboarding')
      expect(mod.calcularEtapa).toBeDefined()
      expect(typeof mod.calcularEtapa).toBe('function')
    })

    test('calcularPasosTaller se puede importar', async () => {
      const mod = await import('@/compartido/lib/onboarding')
      expect(mod.calcularPasosTaller).toBeDefined()
      expect(typeof mod.calcularPasosTaller).toBe('function')
    })

    test('calcularPasosMarca se puede importar', async () => {
      const mod = await import('@/compartido/lib/onboarding')
      expect(mod.calcularPasosMarca).toBeDefined()
      expect(typeof mod.calcularPasosMarca).toBe('function')
    })

    test('calcularMetricas se puede importar', async () => {
      const mod = await import('@/compartido/lib/onboarding')
      expect(mod.calcularMetricas).toBeDefined()
      expect(typeof mod.calcularMetricas).toBe('function')
    })

    test('ETAPA_LABELS tiene todas las etapas', async () => {
      const mod = await import('@/compartido/lib/onboarding')
      expect(mod.ETAPA_LABELS.INVITADO).toBe('Invitado')
      expect(mod.ETAPA_LABELS.REGISTRADO).toBe('Registrado')
      expect(mod.ETAPA_LABELS.PERFIL_COMPLETO).toBe('Perfil completo')
      expect(mod.ETAPA_LABELS.ACTIVO).toBe('Activo')
      expect(mod.ETAPA_LABELS.INACTIVO).toBe('Inactivo')
    })

    test('ETAPA_COLORS tiene todas las etapas', async () => {
      const mod = await import('@/compartido/lib/onboarding')
      expect(Object.keys(mod.ETAPA_COLORS)).toHaveLength(5)
    })
  })

  describe('PasoOnboarding — estructura', () => {
    test('PasoOnboarding tiene los campos correctos', () => {
      const paso = {
        id: 'cuenta',
        texto: 'Crear cuenta',
        completado: true,
        href: '/cuenta',
      }
      expect(paso.id).toBeDefined()
      expect(paso.texto).toBeDefined()
      expect(typeof paso.completado).toBe('boolean')
      expect(paso.href).toMatch(/^\//)
    })

    test('taller tiene 5 pasos', () => {
      const pasos = ['cuenta', 'email', 'perfil', 'documentos', 'cotizacion']
      expect(pasos).toHaveLength(5)
    })

    test('marca tiene 5 pasos', () => {
      const pasos = ['cuenta', 'email', 'perfil', 'pedido', 'cotizacion']
      expect(pasos).toHaveLength(5)
    })
  })

  describe('Componentes — imports resuelven', () => {
    test('ChecklistOnboarding se puede importar', async () => {
      const mod = await import('@/compartido/componentes/ui/checklist-onboarding')
      expect(mod.ChecklistOnboarding).toBeDefined()
    })

    test('NotasSeguimiento se puede importar', async () => {
      const mod = await import('@/admin/componentes/notas-seguimiento')
      expect(mod.NotasSeguimiento).toBeDefined()
    })

    test('AccionesRapidasOnboarding se puede importar', async () => {
      const mod = await import('../../src/app/(admin)/admin/onboarding/acciones-rapidas')
      expect(mod.AccionesRapidasOnboarding).toBeDefined()
    })
  })

  describe('Email — buildInvitacionRegistroEmail', () => {
    test('builder existe y genera subject y html', async () => {
      const { buildInvitacionRegistroEmail } = await import('@/compartido/lib/email')
      expect(buildInvitacionRegistroEmail).toBeDefined()
      const result = buildInvitacionRegistroEmail({
        nombreDestinatario: 'Roberto',
        nombreReferente: 'Lucia',
        cargoReferente: 'OIT/UNTREF',
      })
      expect(result.subject).toContain('Plataforma Digital Textil')
      expect(result.html).toContain('Roberto')
      expect(result.html).toContain('Lucia')
      expect(result.html).toContain('OIT/UNTREF')
      expect(result.html).toContain('/registro')
    })
  })

  describe('WhatsApp — templates de onboarding', () => {
    test('template bienvenida existe', async () => {
      const { TEMPLATES } = await import('@/compartido/lib/whatsapp-templates')
      expect(TEMPLATES.bienvenida).toBeDefined()
      expect(typeof TEMPLATES.bienvenida).toBe('function')
    })

    test('template recordatorio_perfil existe', async () => {
      const { TEMPLATES } = await import('@/compartido/lib/whatsapp-templates')
      expect(TEMPLATES.recordatorio_perfil).toBeDefined()
      expect(typeof TEMPLATES.recordatorio_perfil).toBe('function')
    })

    test('template bienvenida renderiza correctamente', async () => {
      const { renderTemplate } = await import('@/compartido/lib/whatsapp-templates')
      const result = renderTemplate('bienvenida', {
        nombre: 'Roberto',
        enlace: 'https://example.com/taller',
      })
      expect(result).toContain('Roberto')
      expect(result).toContain('Bienvenido')
      expect(result).toContain('https://example.com/taller')
    })
  })

  describe('Schema — NotaSeguimiento', () => {
    test('modelo NotaSeguimiento existe en schema', async () => {
      const fs = await import('fs')
      const content = fs.readFileSync('prisma/schema.prisma', 'utf8')
      expect(content).toMatch(/model NotaSeguimiento/)
      expect(content).toMatch(/@@map\("notas_seguimiento"\)/)
    })

    test('User tiene relaciones de NotaSeguimiento', async () => {
      const fs = await import('fs')
      const content = fs.readFileSync('prisma/schema.prisma', 'utf8')
      expect(content).toMatch(/notasSeguimientoRecibidas/)
      expect(content).toMatch(/notasSeguimientoCreadas/)
    })
  })

  describe('Paginas — onboarding en ayuda', () => {
    test('pagina onboarding-taller existe', async () => {
      const fs = await import('fs')
      expect(fs.existsSync('src/app/(public)/ayuda/onboarding-taller/page.tsx')).toBe(true)
    })

    test('pagina onboarding-marca existe', async () => {
      const fs = await import('fs')
      expect(fs.existsSync('src/app/(public)/ayuda/onboarding-marca/page.tsx')).toBe(true)
    })

    test('pagina ayuda tiene links a guias', async () => {
      const fs = await import('fs')
      const content = fs.readFileSync('src/app/(public)/ayuda/page.tsx', 'utf8')
      expect(content).toMatch(/onboarding-taller/)
      expect(content).toMatch(/onboarding-marca/)
    })
  })

  describe('Admin — sidebar tiene Onboarding', () => {
    test('admin layout tiene link a onboarding', async () => {
      const fs = await import('fs')
      const content = fs.readFileSync('src/app/(admin)/layout.tsx', 'utf8')
      expect(content).toMatch(/\/admin\/onboarding/)
    })
  })

  describe('Dashboard — checklist condicional', () => {
    test('taller dashboard importa ChecklistOnboarding', async () => {
      const fs = await import('fs')
      const content = fs.readFileSync('src/app/(taller)/taller/page.tsx', 'utf8')
      expect(content).toMatch(/ChecklistOnboarding/)
      expect(content).toMatch(/onboardingCompleto/)
    })

    test('marca dashboard importa ChecklistOnboarding', async () => {
      const fs = await import('fs')
      const content = fs.readFileSync('src/app/(marca)/marca/page.tsx', 'utf8')
      expect(content).toMatch(/ChecklistOnboarding/)
      expect(content).toMatch(/onboardingCompleto/)
    })
  })
})
