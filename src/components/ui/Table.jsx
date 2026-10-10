import React from 'react';
import { ChevronLeft, ChevronRight, Inbox, Loader2 } from 'lucide-react';
import Button from './Button';

export default function Table({
  columns = [],
  data = [],
  keyField = 'id',
  onRowClick,
  isLoading = false,
  emptyMessage = 'Tidak ada data ditemukan.',
  emptySubtext = 'Coba ubah kata kunci pencarian atau filter yang dipilih.',
  emptyAction,
  pagination,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-card flex flex-col overflow-hidden">
      {/* Table Container with Horizontal Scroll */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          {/* Header */}
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  className={`py-3.5 px-4 sm:px-5 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'} ${col.className || ''}`}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
                    <p className="text-xs font-medium text-slate-600">Memuat data...</p>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto px-4 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">{emptyMessage}</p>
                    <p className="text-xs text-slate-400 mt-1">{emptySubtext}</p>
                    {emptyAction && <div className="mt-4">{emptyAction}</div>}
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={row[keyField] || rowIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`hover:bg-slate-50/70 transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={col.key || colIdx}
                      className={`py-3.5 px-4 sm:px-5 align-middle ${
                        col.align === 'center'
                          ? 'text-center'
                          : col.align === 'right'
                          ? 'text-right'
                          : 'text-left'
                      } ${col.cellClassName || ''}`}
                    >
                      {col.render ? col.render(row[col.key], row, rowIdx) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {pagination && (
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Menampilkan{' '}
            <span className="font-bold text-slate-800">
              {data.length > 0 ? (pagination.currentPage - 1) * (pagination.itemsPerPage || 10) + 1 : 0}
            </span>{' '}
            sampai{' '}
            <span className="font-bold text-slate-800">
              {Math.min(
                pagination.currentPage * (pagination.itemsPerPage || 10),
                pagination.totalItems || data.length
              )}
            </span>{' '}
            dari{' '}
            <span className="font-bold text-slate-800">
              {pagination.totalItems || data.length}
            </span>{' '}
            data
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              icon={ChevronLeft}
              disabled={pagination.currentPage <= 1}
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
            >
              Sebelumnya
            </Button>

            <span className="px-3 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg">
              {pagination.currentPage} / {pagination.totalPages || 1}
            </span>

            <Button
              variant="outline"
              size="sm"
              iconRight={ChevronRight}
              disabled={pagination.currentPage >= (pagination.totalPages || 1)}
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
