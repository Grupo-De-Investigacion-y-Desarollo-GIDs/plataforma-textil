import { describe, it, expect, vi, beforeEach } from 'vitest'
import { crearEntidadParaRol } from '@/compartido/lib/crear-entidad-rol'
import type { Prisma } from '@prisma/client'

// U-09: helper de creación de entidad por rol, dentro de una transacción.

function txMock() {
  return {
    taller: { create: vi.fn().mockResolvedValue({ id: 't1' }) },
    marca: { create: vi.fn().mockResolvedValue({ id: 'm1' }) },
    tipoDocumento: {
      findMany: vi.fn().mockResolvedValue([
        { id: 'td1', nombre: 'CUIT/Monotributo' },
        { id: 'td2', nombre: 'ART' },
      ]),
    },
    validacion: { createMany: vi.fn().mockResolvedValue({ count: 2 }) },
  }
}

let tx: ReturnType<typeof txMock>
beforeEach(() => {
  tx = txMock()
})

describe('crearEntidadParaRol', () => {
  it('TALLER: crea el taller + las validaciones NO_INICIADO de los tipos activos', async () => {
    const res = await crearEntidadParaRol(tx as unknown as Prisma.TransactionClient, {
      userId: 'u1',
      rol: 'TALLER',
      nombre: 'Taller La Hormiga',
      cuit: '20-12345678-9',
      verificadoAfip: true,
    })
    expect(res).toEqual({ id: 't1' })
    expect(tx.taller.create).toHaveBeenCalled()
    expect(tx.validacion.createMany).toHaveBeenCalledWith({
      data: [
        { tallerId: 't1', tipo: 'CUIT/Monotributo', tipoDocumentoId: 'td1', estado: 'NO_INICIADO' },
        { tallerId: 't1', tipo: 'ART', tipoDocumentoId: 'td2', estado: 'NO_INICIADO' },
      ],
    })
    expect(tx.marca.create).not.toHaveBeenCalled()
  })

  it('MARCA: crea la marca y NO crea validaciones', async () => {
    const res = await crearEntidadParaRol(tx as unknown as Prisma.TransactionClient, {
      userId: 'u1',
      rol: 'MARCA',
      nombre: 'Mi Marca',
      cuit: '27-99999999-1',
    })
    expect(res).toEqual({ id: 'm1' })
    expect(tx.marca.create).toHaveBeenCalled()
    expect(tx.taller.create).not.toHaveBeenCalled()
    expect(tx.validacion.createMany).not.toHaveBeenCalled()
  })

  it('rol no soportado lanza error', async () => {
    await expect(
      crearEntidadParaRol(tx as unknown as Prisma.TransactionClient, {
        userId: 'u1',
        // @ts-expect-error: probamos un rol fuera de TALLER/MARCA
        rol: 'ADMIN',
        nombre: 'X',
        cuit: '20-1-9',
      })
    ).rejects.toThrow(/rol no soportado/)
  })
})
