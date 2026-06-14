'use client'
import { useState } from 'react'
import { Search, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, MoreHorizontal, X, Download } from 'lucide-react'

// Page Header
export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <h1 className="text-xl font-bold text-white">{title}</h1>
      {subtitle && <p className="text-sm text-white/30 mt-1">{subtitle}</p>}
    </div>
  )
}

// Stats Card
export function StatsCard({ label, value, icon: Icon, color = '#00ff88', change, up }: {
  label: string; value: string; icon?: any; color?: string; change?: string; up?: boolean
}) {
  return (
    <div className="bg-[#0A0E1A] border border-white/[0.04] rounded-xl p-4 hover:border-white/[0.08] transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-white/40 tracking-wider">{label}</span>
        {Icon && <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + '15' }}>
          <Icon size={16} style={{ color }} />
        </div>}
      </div>
      <div className="text-xl font-bold text-white">{value}</div>
      {change && (
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs" style={{ color: up ? '#00ff88' : '#ef4444' }}>{up ? '↑' : '↓'} {change}</span>
        </div>
      )}
    </div>
  )
}

// Status Badge
export function StatusBadge({ status, colors }: { status: string; colors?: Record<string, string> }) {
  var defaultColors: Record<string, string> = {
    active: '#00ff88', enabled: '#00ff88', published: '#00ff88', approved: '#00ff88', completed: '#00ff88',
    pending: '#ffd700', draft: '#8b8b8b', paused: '#f97316',
    disabled: '#ef4444', rejected: '#ef4444', banned: '#ef4444', cancelled: '#ef4444',
  };
  var color = colors?.[status] || defaultColors[status] || '#00d9ff';
  return (
    <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: color + '15', color }}>
      {status}
    </span>
  )
}

// Action Buttons
export function ActionButton({ icon: Icon, label, color = '#00ff88', onClick }: { icon?: any; label: string; color?: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-80"
      style={{ backgroundColor: color + '12', color }}>
      {Icon && <Icon size={14} className="inline mr-1" />}
      {label}
    </button>
  )
}

// Table with search, pagination, filters
interface DataTableProps {
  columns: { key: string; label: string; width?: string; render?: (val: any, row: any) => any }[]
  data: any[]
  searchable?: boolean
  pageSize?: number
  emptyText?: string
}

export function DataTable({ columns, data, searchable, pageSize = 15, emptyText = '暂无数据' }: DataTableProps) {
  var [search, setSearch] = useState('');
  var [page, setPage] = useState(1);
  var [sortKey, setSortKey] = useState('');
  var [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  var filtered = data.filter(function(r) {
    if (!search) return true;
    return columns.some(function(c) {
      var val = r[c.key];
      return val && String(val).toLowerCase().includes(search.toLowerCase());
    });
  });

  var sorted = [...filtered].sort(function(a, b) {
    if (!sortKey) return 0;
    var aVal = a[sortKey]; var bVal = b[sortKey];
    if (typeof aVal === 'number' && typeof bVal === 'number') return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    return sortDir === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
  });

  var totalPages = Math.ceil(sorted.length / pageSize);
  var paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="bg-[#0A0E1A] border border-white/[0.04] rounded-xl overflow-hidden">
      {searchable && (
        <div className="p-4 border-b border-white/[0.04]">
          <div className="relative max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
            <input value={search} onChange={function(e) { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-xs text-white/70 placeholder-white/20 outline-none focus:border-[#00ff88]/40 transition-all"
              placeholder="搜索..." />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.04]">
              {columns.map(function(col) {
                var sortable = typeof col.render !== 'function';
                return (
                  <th key={col.key}
                    onClick={function() {
                      if (!sortable) return;
                      if (sortKey === col.key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                      else { setSortKey(col.key); setSortDir('asc'); }
                    }}
                    className="px-5 py-3.5 text-sm text-white/30 font-medium text-left tracking-wider cursor-pointer select-none hover:text-white/50 transition-all"
                    style={{ width: col.width }}
                  >
                    <div className="flex items-center gap-2">
                      {col.label}
                      {sortKey === col.key && (sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-5 py-12 text-center text-white/20 text-xs">{emptyText}</td></tr>
            ) : paged.map(function(row, i) {
              return (
                <tr key={row.id || i} className="border-b border-white/[0.02] hover:bg-white/[0.015] transition-all">
                  {columns.map(function(col) {
                    return (
                      <td key={col.key} className="px-5 py-3.5 text-xs text-white/60">
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/[0.04]">
          <span className="text-xs text-white/20">共 {sorted.length} 条</span>
          <div className="flex items-center gap-2">
            <button onClick={function() { setPage(Math.max(1, page - 1)); }}
              className="p-1.5 rounded-md text-white/30 hover:text-white/70 hover:bg-white/[0.04] disabled:opacity-20 transition-all"
              disabled={page === 1}>
              <ChevronLeft size={15} />
            </button>
            <span className="px-5 text-sm text-white/50">{page} / {totalPages}</span>
            <button onClick={function() { setPage(Math.min(totalPages, page + 1)); }}
              className="p-1.5 rounded-md text-white/30 hover:text-white/70 hover:bg-white/[0.04] disabled:opacity-20 transition-all"
              disabled={page === totalPages}>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Simple Modal
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#0B1220]/95 backdrop-blur-xl border border-white/[0.06] rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="p-1 text-white/30 hover:text-white/70 transition-all"><X size={16} /></button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  )
}

// Export Button
export function ExportButton({ onClick }: { onClick?: () => void }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-2.5 px-5 py-2 rounded-lg text-sm text-white/40 hover:text-white/70 hover:bg-white/[0.04] border border-white/[0.06] transition-all">
      <Download size={14} />
      导出
    </button>
  )
}

// Filter Bar
export function FilterBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {children}
    </div>
  )
}
