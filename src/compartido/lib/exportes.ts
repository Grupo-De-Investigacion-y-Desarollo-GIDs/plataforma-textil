import ExcelJS from 'exceljs'

export { toCsv } from './csv'

export interface HojaExportable {
  nombre: string
  headers: string[]
  filas: (string | number | Date | null)[][]
  estilos?: {
    columnasFecha?: number[]
    columnasNumericas?: number[]
  }
}

export async function generarXlsx(
  hojas: HojaExportable[],
  metadata?: { titulo?: string; subtitulo?: string }
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Plataforma Digital Textil'
  workbook.created = new Date()

  if (metadata?.titulo) {
    const portada = workbook.addWorksheet('Portada')
    portada.mergeCells('B2:F2')
    const tituloCell = portada.getCell('B2')
    tituloCell.value = metadata.titulo
    tituloCell.font = { size: 18, bold: true, color: { argb: 'FF1E3A5F' } }

    if (metadata.subtitulo) {
      portada.mergeCells('B3:F3')
      const subCell = portada.getCell('B3')
      subCell.value = metadata.subtitulo
      subCell.font = { size: 12, color: { argb: 'FF666666' } }
    }

    portada.mergeCells('B5:F5')
    portada.getCell('B5').value = `Generado: ${new Date().toLocaleDateString('es-AR')}`
    portada.getCell('B5').font = { size: 10, color: { argb: 'FF999999' } }

    portada.getColumn(2).width = 40
  }

  for (const hoja of hojas) {
    const ws = workbook.addWorksheet(hoja.nombre.slice(0, 31))

    // Header row
    const headerRow = ws.addRow(hoja.headers)
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E3A5F' },
    }
    headerRow.alignment = { vertical: 'middle' }

    // Data rows
    for (const fila of hoja.filas) {
      ws.addRow(fila)
    }

    // Auto-fit columns
    ws.columns.forEach((col, idx) => {
      const headerLen = (hoja.headers[idx] || '').length
      let maxLen = headerLen
      for (const fila of hoja.filas) {
        const cellLen = String(fila[idx] ?? '').length
        if (cellLen > maxLen) maxLen = cellLen
      }
      col.width = Math.min(maxLen + 3, 50)
    })

    // Date format
    if (hoja.estilos?.columnasFecha) {
      for (const colIdx of hoja.estilos.columnasFecha) {
        ws.getColumn(colIdx + 1).numFmt = 'dd/mm/yyyy'
      }
    }

    // Alternating row colors for readability
    ws.eachRow((row, rowNumber) => {
      if (rowNumber > 1 && rowNumber % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF9FAFB' },
        }
      }
    })

    // Freeze header row
    ws.views = [{ state: 'frozen', ySplit: 1 }]
  }

  return Buffer.from(await workbook.xlsx.writeBuffer())
}
