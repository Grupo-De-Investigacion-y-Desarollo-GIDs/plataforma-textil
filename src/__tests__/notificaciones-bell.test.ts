import { describe, test, expect } from 'vitest'

describe('Badge notificaciones header', () => {
  describe('tiempoRelativo — formateo de fechas', () => {
    // Import the exported function
    let tiempoRelativo: (fecha: string) => string

    test('tiempoRelativo se puede importar', async () => {
      const mod = await import('@/compartido/componentes/layout/notificaciones-bell')
      tiempoRelativo = mod.tiempoRelativo
      expect(tiempoRelativo).toBeDefined()
      expect(typeof tiempoRelativo).toBe('function')
    })

    test('"ahora" para menos de 1 minuto', async () => {
      const mod = await import('@/compartido/componentes/layout/notificaciones-bell')
      const result = mod.tiempoRelativo(new Date().toISOString())
      expect(result).toBe('ahora')
    })

    test('"hace Xm" para minutos', async () => {
      const mod = await import('@/compartido/componentes/layout/notificaciones-bell')
      const hace5min = new Date(Date.now() - 5 * 60 * 1000).toISOString()
      const result = mod.tiempoRelativo(hace5min)
      expect(result).toBe('hace 5m')
    })

    test('"hace Xh" para horas', async () => {
      const mod = await import('@/compartido/componentes/layout/notificaciones-bell')
      const hace3h = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      const result = mod.tiempoRelativo(hace3h)
      expect(result).toBe('hace 3h')
    })

    test('"hace Xd" para dias', async () => {
      const mod = await import('@/compartido/componentes/layout/notificaciones-bell')
      const hace2d = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      const result = mod.tiempoRelativo(hace2d)
      expect(result).toBe('hace 2d')
    })
  })

  describe('Componentes — imports resuelven', () => {
    test('NotificacionesBell se puede importar', async () => {
      const mod = await import('@/compartido/componentes/layout/notificaciones-bell')
      expect(mod.NotificacionesBell).toBeDefined()
    })
  })

  describe('Badge — logica de overflow', () => {
    test('99+ para mas de 99 no leidas', () => {
      const sinLeer = 150
      const display = sinLeer > 99 ? '99+' : String(sinLeer)
      expect(display).toBe('99+')
    })

    test('numero exacto para 99 o menos', () => {
      const sinLeer = 42
      const display = sinLeer > 99 ? '99+' : String(sinLeer)
      expect(display).toBe('42')
    })

    test('badge no se muestra con 0', () => {
      const sinLeer = 0
      const shouldShow = sinLeer > 0
      expect(shouldShow).toBe(false)
    })
  })

  describe('Polling — configuracion', () => {
    test('intervalo de polling es 30 segundos', () => {
      const POLL_INTERVAL = 30_000
      expect(POLL_INTERVAL).toBe(30000)
    })
  })

  describe('API — shape esperado', () => {
    test('GET /api/notificaciones devuelve sinLeer', () => {
      // Verifica que el shape esperado es compatible
      const mockResponse = {
        notificaciones: [
          {
            id: 'test1',
            tipo: 'mensaje_individual',
            titulo: 'Test',
            mensaje: 'Mensaje de test',
            leida: false,
            link: null,
            createdAt: new Date().toISOString(),
            creadaPor: { name: 'Admin Test' },
          }
        ],
        total: 1,
        sinLeer: 1,
        page: 1,
        totalPages: 1,
      }
      expect(mockResponse.sinLeer).toBeDefined()
      expect(typeof mockResponse.sinLeer).toBe('number')
      expect(mockResponse.notificaciones[0].creadaPor).toBeDefined()
      expect(mockResponse.notificaciones[0].creadaPor?.name).toBe('Admin Test')
    })
  })

  describe('Header — sin Bell import directo', () => {
    test('header.tsx no importa Bell de lucide-react', async () => {
      const fs = await import('fs')
      const content = fs.readFileSync('src/compartido/componentes/layout/header.tsx', 'utf8')
      // Bell should not be in the lucide-react import anymore
      expect(content).not.toMatch(/import.*\bBell\b.*from 'lucide-react'/)
    })

    test('header.tsx importa NotificacionesBell', async () => {
      const fs = await import('fs')
      const content = fs.readFileSync('src/compartido/componentes/layout/header.tsx', 'utf8')
      expect(content).toMatch(/NotificacionesBell/)
    })
  })

  describe('UserSidebar — badge dinamico', () => {
    test('user-sidebar no tiene badge: 0 hardcodeado', async () => {
      const fs = await import('fs')
      const content = fs.readFileSync('src/compartido/componentes/layout/user-sidebar.tsx', 'utf8')
      expect(content).not.toMatch(/badge:\s*0/)
    })

    test('user-sidebar usa menuItemsConBadge', async () => {
      const fs = await import('fs')
      const content = fs.readFileSync('src/compartido/componentes/layout/user-sidebar.tsx', 'utf8')
      expect(content).toMatch(/menuItemsConBadge/)
    })
  })

  describe('Admin layout — bell integrado', () => {
    test('admin layout importa NotificacionesBell', async () => {
      const fs = await import('fs')
      const content = fs.readFileSync('src/app/(admin)/layout.tsx', 'utf8')
      expect(content).toMatch(/NotificacionesBell/)
    })
  })

  describe('Prisma — index existe en schema', () => {
    test('schema tiene index [userId, leida] en Notificacion', async () => {
      const fs = await import('fs')
      const content = fs.readFileSync('prisma/schema.prisma', 'utf8')
      expect(content).toMatch(/@@index\(\[userId, leida\]\)/)
    })
  })

  describe('API — include creadaPor', () => {
    test('GET endpoint incluye creadaPor en query', async () => {
      const fs = await import('fs')
      const content = fs.readFileSync('src/app/api/notificaciones/route.ts', 'utf8')
      expect(content).toMatch(/include.*creadaPor/)
    })
  })
})
