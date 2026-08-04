'use client'

import React from 'react'
import { cn } from '@/lib'
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from './primitives'

export interface Column {
  key: string
  title: React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column[]
  data: T[]
  rowKey: (item: T) => string
  renderRow: (item: T, index: number, isExpanded: boolean) => React.ReactNode
  renderExpanded?: (item: T) => React.ReactNode
  expandedId?: string | null
  onRowClick?: (item: T, index: number) => void
  loading?: boolean
  skeletonRows?: number
  emptyMessage?: string
  className?: string
  tableClassName?: string
}

const DataTable = <T,>({
  columns,
  data,
  rowKey,
  renderRow,
  renderExpanded,
  expandedId,
  onRowClick,
  loading = false,
  skeletonRows = 5,
  emptyMessage = 'No data available',
  className,
  tableClassName,
}: DataTableProps<T>) => (
  <div
    className={cn('min-w-0 max-w-full overflow-x-auto rounded-2xl', className)}
    style={{ background: '#2A211A', border: '1px solid rgba(255,255,255,0.07)' }}
  >
    <Table className={tableClassName}>
      <TableHeader>
        <tr>
          {columns.map(col => (
            <TableHead key={col.key} className={col.className}>
              {col.title}
            </TableHead>
          ))}
        </tr>
      </TableHeader>

      <TableBody>
        {loading ? (
          Array.from({ length: skeletonRows }).map((_, i) => (
            <TableRow key={`skeleton-${i}`}>
              {columns.map((_, j) => (
                <TableCell key={j}>
                  <div className="h-4 w-full max-w-[12rem] rounded-md animate-pulse bg-white/[0.08]" />
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="py-20 text-center text-text-grey">
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          data.map((item, index) => {
            const id = rowKey(item)
            const isExpanded = expandedId === id
            return (
              <React.Fragment key={id}>
                <TableRow onClick={onRowClick ? () => onRowClick(item, index) : undefined}>
                  {renderRow(item, index, isExpanded)}
                </TableRow>
                {isExpanded && renderExpanded && (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="px-6 pb-4 pt-0">
                      {renderExpanded(item)}
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            )
          })
        )}
      </TableBody>
    </Table>
  </div>
)

export default DataTable
