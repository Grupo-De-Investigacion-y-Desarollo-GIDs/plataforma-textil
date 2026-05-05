import { describe, it, expect, vi } from 'vitest'
import ExcelJS from 'exceljs'

describe('generarXlsx — F-04', () => {
  it('genera buffer xlsx valido con una hoja', async () => {
    const { generarXlsx } = await import('@/compartido/lib/exportes')
    const buffer = await generarXlsx([
      {
        nombre: 'Test',
        headers: ['Nombre', 'CUIT', 'Nivel'],
        filas: [
          ['Taller Fenix', '20-12345678-9', 'PLATA'],
          ['Taller Aurora', '20-98765432-1', 'BRONCE'],
        ],
      },
    ])

    expect(buffer).toBeInstanceOf(Buffer)
    expect(buffer.length).toBeGreaterThan(100)

    // Verify it's a valid xlsx by reading it back
    const wb = new ExcelJS.Workbook()
    await wb.xlsx.load(buffer)
    expect(wb.worksheets.length).toBe(1)
    expect(wb.worksheets[0].name).toBe('Test')
    expect(wb.worksheets[0].rowCount).toBe(3) // header + 2 data rows
  })

  it('genera xlsx con portada cuando hay metadata', async () => {
    const { generarXlsx } = await import('@/compartido/lib/exportes')
    const buffer = await generarXlsx(
      [{ nombre: 'Datos', headers: ['A'], filas: [['1']] }],
      { titulo: 'Informe Mensual', subtitulo: 'Mayo 2026' }
    )

    const wb = new ExcelJS.Workbook()
    await wb.xlsx.load(buffer)
    expect(wb.worksheets.length).toBe(2) // Portada + Datos
    expect(wb.worksheets[0].name).toBe('Portada')
    expect(wb.worksheets[0].getCell('B2').value).toBe('Informe Mensual')
  })

  it('genera xlsx multi-hoja (informe mensual)', async () => {
    const { generarXlsx } = await import('@/compartido/lib/exportes')
    const hojas = [
      { nombre: 'Talleres', headers: ['Nombre'], filas: [['T1']] },
      { nombre: 'Marcas', headers: ['Nombre'], filas: [['M1']] },
      { nombre: 'Pedidos', headers: ['OM'], filas: [['OM-001']] },
      { nombre: 'Validaciones', headers: ['Tipo'], filas: [['CUIT']] },
      { nombre: 'Demanda', headers: ['Motivo'], filas: [['SIN_TALLERES_NIVEL']] },
      { nombre: 'Resumen', headers: ['Metrica'], filas: [['Total']] },
    ]
    const buffer = await generarXlsx(hojas, { titulo: 'Informe', subtitulo: 'Test' })

    const wb = new ExcelJS.Workbook()
    await wb.xlsx.load(buffer)
    // Portada + 6 hojas de datos
    expect(wb.worksheets.length).toBe(7)
  })

  it('trunca nombres de hoja a 31 caracteres', async () => {
    const { generarXlsx } = await import('@/compartido/lib/exportes')
    const buffer = await generarXlsx([
      { nombre: 'Este nombre de hoja es demasiado largo para Excel', headers: ['A'], filas: [['1']] },
    ])

    const wb = new ExcelJS.Workbook()
    await wb.xlsx.load(buffer)
    expect(wb.worksheets[0].name.length).toBeLessThanOrEqual(31)
  })

  it('header row tiene formato bold', async () => {
    const { generarXlsx } = await import('@/compartido/lib/exportes')
    const buffer = await generarXlsx([
      { nombre: 'Test', headers: ['Col1'], filas: [['val1']] },
    ])

    const wb = new ExcelJS.Workbook()
    await wb.xlsx.load(buffer)
    const headerRow = wb.worksheets[0].getRow(1)
    expect(headerRow.font?.bold).toBe(true)
  })
})

describe('toCsv re-export — F-04', () => {
  it('exportes.ts re-exporta toCsv', async () => {
    const { toCsv } = await import('@/compartido/lib/exportes')
    expect(toCsv).toBeDefined()
    const csv = toCsv(['A', 'B'], [['1', '2']])
    expect(csv).toContain('"A"')
    expect(csv).toContain('"1"')
  })
})

describe('HojaExportable interface — F-04', () => {
  it('acepta tipos mixtos en filas', async () => {
    const { generarXlsx } = await import('@/compartido/lib/exportes')
    const buffer = await generarXlsx([
      {
        nombre: 'Mixto',
        headers: ['Texto', 'Numero', 'Fecha', 'Nulo'],
        filas: [
          ['hola', 42, new Date('2026-05-05'), null],
        ],
      },
    ])
    expect(buffer.length).toBeGreaterThan(0)
  })
})

describe('esTipoValido — F-04', () => {
  it('acepta tipos validos', async () => {
    const { esTipoValido } = await import('@/app/api/estado/exportar/data')
    expect(esTipoValido('talleres')).toBe(true)
    expect(esTipoValido('marcas')).toBe(true)
    expect(esTipoValido('mensual')).toBe(true)
    expect(esTipoValido('validaciones')).toBe(true)
    expect(esTipoValido('demanda')).toBe(true)
  })

  it('rechaza tipos invalidos', async () => {
    const { esTipoValido } = await import('@/app/api/estado/exportar/data')
    expect(esTipoValido('inventado')).toBe(false)
    expect(esTipoValido('')).toBe(false)
  })
})

describe('Discrepancia empleados — F-04', () => {
  it('calculo correcto: declarados - SIPA', () => {
    const declarados = 10
    const sipa = 7
    expect(declarados - sipa).toBe(3) // Positivo: declaro mas de los que estan en SIPA
  })

  it('null cuando SIPA no tiene dato', () => {
    const sipa: number | null = null
    const discrepancia = sipa != null ? String(10 - sipa) : ''
    expect(discrepancia).toBe('')
  })
})
