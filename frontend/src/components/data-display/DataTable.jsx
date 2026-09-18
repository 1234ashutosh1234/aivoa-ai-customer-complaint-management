import React from 'react';
import { Loader2, FileSearch } from 'lucide-react';

export const DataTable = ({
  columns = [],
  data = [],
  isLoading = false,
  onRowClick,
  emptyMessage = 'No complaints match the current criteria.',
}) => {
  if (isLoading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600 mb-2" />
        <span className="text-sm font-medium">Querying regulatory complaint records...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-slate-400 text-center px-4">
        <FileSearch className="w-12 h-12 text-slate-300 mb-3" />
        <h4 className="text-sm font-semibold text-slate-700">No Records Found</h4>
        <p className="text-xs text-slate-500 max-w-sm mt-1">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/75">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-600"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, rowIdx) => (
            <tr
              key={row.id || rowIdx}
              onClick={() => onRowClick && onRowClick(row)}
              className={`transition-colors hover:bg-slate-50/80 ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map((col, colIdx) => (
                <td key={colIdx} className="py-3.5 px-4 text-sm text-slate-700">
                  {col.render ? col.render(row) : row[col.accessor] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
