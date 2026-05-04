import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSend = vi.fn()

vi.mock('resend', () => ({
  Resend: class MockResend {
    emails = { send: mockSend }
  },
}))

import { sendEmail } from '@/compartido/lib/email'

beforeEach(() => {
  vi.clearAllMocks()
  process.env.RESEND_API_KEY = 'test-key'
  process.env.EMAIL_FROM = 'test@resend.dev'
  process.env.EMAIL_FROM_NAME = 'Test PDT'
  process.env.EMAIL_REPLY_TO = 'reply@test.com'
})

describe('sendEmail (Resend)', () => {
  it('envia email exitosamente y retorna id', async () => {
    mockSend.mockResolvedValue({ data: { id: 'msg-123' }, error: null })

    const result = await sendEmail({ to: 'user@test.com', subject: 'Hola', html: '<p>Hola</p>' })

    expect(result.exito).toBe(true)
    expect(result.id).toBe('msg-123')
    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
      to: 'user@test.com',
      subject: 'Hola',
      html: '<p>Hola</p>',
      from: 'Test PDT <test@resend.dev>',
      replyTo: 'reply@test.com',
    }))
  })

  it('retorna exito:false cuando Resend retorna error', async () => {
    mockSend.mockResolvedValue({ data: null, error: { message: 'Invalid API key' } })

    const result = await sendEmail({ to: 'user@test.com', subject: 'Test', html: '<p>Test</p>' })

    expect(result.exito).toBe(false)
    expect(result.error).toBe('Invalid API key')
    // Retry: se llama 2 veces (original + 1 retry)
    expect(mockSend).toHaveBeenCalledTimes(2)
  })

  it('retorna exito:false cuando Resend tira excepcion y reintenta 1 vez', async () => {
    mockSend.mockRejectedValue(new Error('Network error'))

    const result = await sendEmail({ to: 'user@test.com', subject: 'Test', html: '<p>Test</p>' })

    expect(result.exito).toBe(false)
    expect(result.error).toBe('Network error')
    expect(mockSend).toHaveBeenCalledTimes(2)
  })

  it('loggea a consola sin RESEND_API_KEY y retorna exito:true', async () => {
    delete process.env.RESEND_API_KEY
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    const result = await sendEmail({ to: 'user@test.com', subject: 'Dev', html: '<p>Dev</p>' })

    expect(result.exito).toBe(true)
    expect(mockSend).not.toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[EMAIL-DEV]'))
    consoleSpy.mockRestore()
  })

  it('exito en segundo intento despues de error temporal', async () => {
    mockSend
      .mockResolvedValueOnce({ data: null, error: { message: 'Temporary error' } })
      .mockResolvedValueOnce({ data: { id: 'msg-456' }, error: null })

    const result = await sendEmail({ to: 'user@test.com', subject: 'Retry', html: '<p>Retry</p>' })

    expect(result.exito).toBe(true)
    expect(result.id).toBe('msg-456')
    expect(mockSend).toHaveBeenCalledTimes(2)
  })

  it('usa EMAIL_FROM_NAME en el campo from', async () => {
    process.env.EMAIL_FROM_NAME = 'Mi Plataforma'
    process.env.EMAIL_FROM = 'noreply@pdt.ar'
    mockSend.mockResolvedValue({ data: { id: 'msg-789' }, error: null })

    await sendEmail({ to: 'user@test.com', subject: 'Test', html: '<p>Test</p>' })

    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
      from: 'Mi Plataforma <noreply@pdt.ar>',
    }))
  })
})
