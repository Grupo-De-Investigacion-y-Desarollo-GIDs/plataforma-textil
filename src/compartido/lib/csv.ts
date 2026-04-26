/**
 * Genera un string CSV a partir de headers y filas.
 * Escapa comillas y caracteres especiales según RFC 4180.
 */
export function toCsv(headers: string[], rows: string[][]): string {
  const escape = (v: string) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const lines = [headers.map(escape).join(',')]
  for (const row of rows) {
    lines.push(row.map(escape).join(','))
  }
  return lines.join('\n')
}
