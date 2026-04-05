import Afip from '@afipsdk/afip.js'

let _afip: InstanceType<typeof Afip> | null = null

function getAfip() {
  if (!_afip) {
    const cuit = process.env.AFIP_CUIT_PLATAFORMA
    const token = process.env.AFIP_SDK_TOKEN
    if (!cuit || !token) throw new Error('AFIP_CUIT_PLATAFORMA y AFIP_SDK_TOKEN son requeridos')
    _afip = new Afip({
      CUIT: cuit,
      production: process.env.AFIP_SDK_ENV === 'production',
      access_token: token,
    })
  }
  return _afip
}

export type AfipResult = {
  valid: boolean
  razonSocial?: string
  domicilio?: string
  esEmpleador?: boolean
  error?: string
}

export async function verificarCuit(cuit: string): Promise<AfipResult> {
  try {
    const cuitNumero = parseInt(cuit.replace(/-/g, ''))
    const data = await getAfip().RegisterScopeTen.getTaxpayerDetails(cuitNumero)

    // ADAPTAR ESTOS CAMPOS despues de verificar el response real (ver nota critica en el spec)
    if (!data) {
      return { valid: false, error: 'CUIT inexistente en ARCA' }
    }

    // Verificar que el CUIT este activo
    // El campo exacto depende del response real — puede ser data.estadoClave o data.datosGenerales.estadoClave
    const estado = data.estadoClave ?? data.datosGenerales?.estadoClave
    if (estado && estado !== 'ACTIVO') {
      return { valid: false, error: 'CUIT inactivo en ARCA' }
    }

    return {
      valid: true,
      razonSocial: data.denominacion ?? data.datosGenerales?.denominacion,
      domicilio: data.domicilioFiscal?.direccion ?? data.datosGenerales?.domicilioFiscal?.direccion,
      esEmpleador: (data.indicadorEmpleador ?? data.datosGenerales?.indicadorEmpleador) === 'S',
    }
  } catch (err) {
    console.error('Error al verificar CUIT en ARCA:', err)
    return { valid: false, error: 'No se pudo verificar el CUIT. Intenta de nuevo.' }
  }
}
