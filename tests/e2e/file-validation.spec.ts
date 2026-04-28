import { test, expect } from '@playwright/test'
import { ensureNotProduction } from './_helpers/safety'
import { loginAs } from './_helpers/auth'

// Helpers para crear buffers con magic bytes
function jpegBuffer(sizeBytes = 100): Buffer {
  // FF D8 FF E0 + padding
  const header = Buffer.from([0xff, 0xd8, 0xff, 0xe0])
  const padding = Buffer.alloc(Math.max(0, sizeBytes - 4))
  return Buffer.concat([header, padding])
}

function exeBuffer(): Buffer {
  // MZ header (ejecutable Windows)
  return Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0xff, 0xff, 0x00, 0x00])
}

test.describe('File validation — S-03', () => {
  test('upload JPEG valido a imagenes (portfolio) retorna URL', async ({ page }) => {
    test.setTimeout(30000)
    await ensureNotProduction(page)
    await loginAs(page, 'taller')

    // Obtener tallerId del usuario logueado
    const tallerRes = await page.request.get('/api/talleres/me')
    const tallerData = await tallerRes.json()
    const tallerId = tallerData.id || tallerData.taller?.id

    if (!tallerId) {
      test.skip(true, 'No se encontro tallerId para el usuario de prueba')
      return
    }

    const fileBuffer = jpegBuffer(1024)
    const res = await page.request.post('/api/upload/imagenes', {
      multipart: {
        file: {
          name: 'test-image.jpg',
          mimeType: 'image/jpeg',
          buffer: fileBuffer,
        },
        contexto: 'portfolio',
        entityId: tallerId,
      },
    })

    expect(res.status()).toBe(200)
    const data = await res.json()
    expect(data.url).toBeTruthy()
    expect(typeof data.url).toBe('string')
  })

  test('upload EXE disfrazado como .jpg es rechazado con 400', async ({ page }) => {
    test.setTimeout(30000)
    await ensureNotProduction(page)
    await loginAs(page, 'taller')

    const tallerRes = await page.request.get('/api/talleres/me')
    const tallerData = await tallerRes.json()
    const tallerId = tallerData.id || tallerData.taller?.id

    if (!tallerId) {
      test.skip(true, 'No se encontro tallerId para el usuario de prueba')
      return
    }

    // Enviar un EXE con content-type de imagen (MIME spoofing)
    const fileBuffer = exeBuffer()
    const res = await page.request.post('/api/upload/imagenes', {
      multipart: {
        file: {
          name: 'malicious.jpg',
          mimeType: 'image/jpeg',
          buffer: fileBuffer,
        },
        contexto: 'portfolio',
        entityId: tallerId,
      },
    })

    // Debe rechazar por magic bytes, NO guardarse en storage
    expect(res.status()).toBe(400)
    const data = await res.json()
    expect(data.error).toContain('Formato no soportado')
  })

  test('upload archivo >5MB es rechazado con 400', async ({ page }) => {
    test.setTimeout(30000)
    await ensureNotProduction(page)
    await loginAs(page, 'taller')

    const tallerRes = await page.request.get('/api/talleres/me')
    const tallerData = await tallerRes.json()
    const tallerId = tallerData.id || tallerData.taller?.id

    if (!tallerId) {
      test.skip(true, 'No se encontro tallerId para el usuario de prueba')
      return
    }

    // Crear un JPEG de 6MB (supera el limite de 5MB)
    const fileBuffer = jpegBuffer(6 * 1024 * 1024)
    const res = await page.request.post('/api/upload/imagenes', {
      multipart: {
        file: {
          name: 'huge-image.jpg',
          mimeType: 'image/jpeg',
          buffer: fileBuffer,
        },
        contexto: 'portfolio',
        entityId: tallerId,
      },
    })

    expect(res.status()).toBe(400)
    const data = await res.json()
    expect(data.error).toContain('tamano maximo')
  })

  test('upload con nombre path traversal es rechazado', async ({ page }) => {
    test.setTimeout(30000)
    await ensureNotProduction(page)
    await loginAs(page, 'taller')

    const tallerRes = await page.request.get('/api/talleres/me')
    const tallerData = await tallerRes.json()
    const tallerId = tallerData.id || tallerData.taller?.id

    if (!tallerId) {
      test.skip(true, 'No se encontro tallerId para el usuario de prueba')
      return
    }

    const fileBuffer = jpegBuffer(1024)
    const res = await page.request.post('/api/upload/imagenes', {
      multipart: {
        file: {
          name: '../../etc/passwd.jpg',
          mimeType: 'image/jpeg',
          buffer: fileBuffer,
        },
        contexto: 'portfolio',
        entityId: tallerId,
      },
    })

    // Debe rechazar por nombre inseguro (contiene ../)
    expect(res.status()).toBe(400)
    const data = await res.json()
    expect(data.error).toContain('caracteres no permitidos')
  })

  test('upload a contexto deshabilitado es rechazado', async ({ page }) => {
    test.setTimeout(30000)
    await ensureNotProduction(page)

    // Este test requiere desactivar un contexto desde admin
    // Skip si no podemos hacer el setup admin
    await loginAs(page, 'admin')

    // Obtener configs de upload
    const configsRes = await page.request.get('/api/admin/configuracion-upload')
    if (configsRes.status() !== 200) {
      test.skip(true, 'No se pudo obtener configuraciones de upload')
      return
    }

    const configs = await configsRes.json()
    const portfolioConfig = configs.find((c: { contexto: string }) => c.contexto === 'imagenes-portfolio')
    if (!portfolioConfig) {
      test.skip(true, 'No se encontro config imagenes-portfolio (ejecutar seed)')
      return
    }

    // Desactivar el contexto
    const desactivarRes = await page.request.put(`/api/admin/configuracion-upload/${portfolioConfig.id}`, {
      data: { activo: false },
    })
    expect(desactivarRes.status()).toBe(200)

    try {
      // Ahora loguearse como taller e intentar subir
      await loginAs(page, 'taller')

      const tallerRes = await page.request.get('/api/talleres/me')
      const tallerData = await tallerRes.json()
      const tallerId = tallerData.id || tallerData.taller?.id

      if (!tallerId) {
        test.skip(true, 'No se encontro tallerId')
        return
      }

      const fileBuffer = jpegBuffer(1024)
      const res = await page.request.post('/api/upload/imagenes', {
        multipart: {
          file: {
            name: 'test.jpg',
            mimeType: 'image/jpeg',
            buffer: fileBuffer,
          },
          contexto: 'portfolio',
          entityId: tallerId,
        },
      })

      expect(res.status()).toBe(400)
      const data = await res.json()
      expect(data.error).toContain('no habilitada')
    } finally {
      // Restaurar: reactivar el contexto
      await loginAs(page, 'admin')
      await page.request.put(`/api/admin/configuracion-upload/${portfolioConfig.id}`, {
        data: { activo: true },
      })
    }
  })
})
