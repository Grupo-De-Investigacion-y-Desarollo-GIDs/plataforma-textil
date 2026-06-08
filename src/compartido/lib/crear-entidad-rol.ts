import type { Prisma } from '@prisma/client'
import type { DatosArca } from './arca'

export type RolEntidad = 'TALLER' | 'MARCA'

interface CrearEntidadInput {
  userId: string
  rol: RolEntidad
  nombre: string
  cuit: string
  verificadoAfip?: boolean
  /** Datos de ARCA para poblar los campos AFIP de un Taller (opcional). */
  datosArca?: DatosArca
}

/**
 * Crea la entidad (Taller o Marca) que corresponde a un rol, DENTRO de una
 * transacción (recibe `tx`, no usa el cliente global). Para TALLER crea además
 * las validaciones NO_INICIADO de los tipos de documento activos.
 *
 * Extraído de la lógica duplicada inline en `/api/auth/registro`; reusado por
 * `/api/auth/registro/completar` y `/api/usuarios/me/roles` (U-09). El formato
 * del CUIT lo decide cada caller (este helper lo guarda verbatim).
 */
export async function crearEntidadParaRol(
  tx: Prisma.TransactionClient,
  { userId, rol, nombre, cuit, verificadoAfip = false, datosArca }: CrearEntidadInput
) {
  if (rol !== 'TALLER' && rol !== 'MARCA') {
    throw new Error(`crearEntidadParaRol: rol no soportado "${rol}" (solo TALLER o MARCA)`)
  }

  if (rol === 'TALLER') {
    const taller = await tx.taller.create({
      data: {
        userId,
        nombre: datosArca?.nombre || nombre,
        cuit,
        verificadoAfip,
        verificadoAfipAt: verificadoAfip ? new Date() : null,
        tipoInscripcionAfip: datosArca?.tipoInscripcion ?? null,
        categoriaMonotributo: datosArca?.categoriaMonotributo ?? null,
        estadoCuitAfip: datosArca?.estadoCuit ?? null,
        fechaInscripcionAfip: datosArca?.fechaInscripcion ?? null,
        actividadesAfip: datosArca?.actividades ?? [],
        domicilioFiscalAfip: datosArca?.domicilioFiscal ?? undefined,
      },
    })

    // Checklist de validaciones inicial (igual que el registro primario).
    const tiposDoc = await tx.tipoDocumento.findMany({
      where: { activo: true },
      select: { id: true, nombre: true },
    })
    if (tiposDoc.length > 0) {
      await tx.validacion.createMany({
        data: tiposDoc.map((td) => ({
          tallerId: taller.id,
          tipo: td.nombre,
          tipoDocumentoId: td.id,
          estado: 'NO_INICIADO' as const,
        })),
      })
    }
    return taller
  }

  // MARCA
  return tx.marca.create({
    data: {
      userId,
      nombre: datosArca?.nombre || nombre,
      cuit,
      verificadoAfip,
    },
  })
}
