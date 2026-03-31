'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Column<T> {
  header: string
  accessor: keyof T | ((row: T) => React.ReactNode)
  sortable?: boolean
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  pageSize?: number
  emptyMessage?: string
}

export function DataTable<T extends { id?: string }>({ columns, data, pageSize = 10, emptyMessage = 'No hay datos para mostrar' }: DataTableProps<T>) {
  const [page, setPage] = useState(0)
  const [sortKey, setSortKey] = useState<keyof T | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const sorted = [...data].sort((a, b) => {
    if (!sortKey) return 0
    const aVal = a[sortKey]
    const bVal = b[sortKey]
    if (aVal == null || bVal == null) return 0
    const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    return sortDir === 'asc' ? cmp : -cmp
  })

  const totalPages = Math.ceil(sorted.length / pageSize)
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize)

  function handleSort(col: Column<T>) {
    if (!col.sortable || typeof col.accessor === 'function') return
    if (sortKey === col.accessor) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(col.accessor)
      setSortDir('asc')
    }
  }

  function getCellValue(row: T, col: Column<T>) {
    if (typeof col.accessor === 'function') return col.accessor(row)
    return row[col.accessor] as React.ReactNode
  }

  if (data.length === 0) {
    return <div className="text-center py-12 text-gray-500">{emptyMessage}</div>
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              {columns.map((col, i) => (
                <th
                  key={i}
                  onClick={() => handleSort(col)}
                  className={cn(
                    'text-left px-4 py-3 font-overpass font-semibold text-sm text-gray-600 uppercase tracking-wider',
                    col.sortable && typeof col.accessor !== 'function' && 'cursor-pointer hover:text-brand-blue',
                    col.className
                  )}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && typeof col.accessor !== 'function' && sortKey === col.accessor && (
                      sortDir === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row, rowIdx) => (
              <tr key={row.id || rowIdx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={cn('px-4 py-3 text-sm', col.className)}>
                    {getCellValue(row, col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-4">
          <span className="text-sm text-gray-500">
            {page * pageSize + 1}-{Math.min((page + 1) * pageSize, data.length)} de {data.length}
          </span>
          <div className="flex gap-1">
            <button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 rounded-lg text-sm font-overpass disabled:opacity-50 hover:bg-gray-100"
            >
              Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={cn(
                  'px-3 py-1 rounded-lg text-sm font-overpass',
                  page === i ? 'bg-brand-blue text-white' : 'hover:bg-gray-100'
                )}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 rounded-lg text-sm font-overpass disabled:opacity-50 hover:bg-gray-100"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
