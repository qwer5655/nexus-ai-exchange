'use client'
import { useEffect, useState } from 'react'
import { adminFetch } from '@/lib/admin-fetch'
import { Search, ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react'

export default function BalanceFlow() {
  var [txs, setTxs] = useState<any[]>([])
  var [loading, setLoading] = useState(true)
  var [page, setPage] = useState(1)
  var [total, setTotal] = useState(0)
  var [typeFilter, setTypeFilter] = useState('')
  var [summary, setSummary] = useState<any>({})
  var limit = 30

  function load() {
    setLoading(true)
    var params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (typeFilter) params.set('type', typeFilter)
    adminFetch('/api/admin/balance-transactions?' + params.toString()).then(function(r) { return r.json() }).then(function(d) {
      setTxs(d.transactions || []); setTotal(d.total || 0); setSummary(d.summary || {}); setLoading(false)
    }).catch(function() { setLoading(false) })
  }

  useEffect(function() { load() }, [page, typeFilter])

  var totalPages = Math.ceil(total / limit) || 1

  var typeColors: any = { deposit: 'bg-green-500/10 text-green-400', unlock: 'bg-red-500/10 text-red-400', topup: 'bg-blue-500/10 text-blue-400', adjustment: 'bg-yellow-500/10 text-yellow-400', refund: 'bg-purple-500/10 text-purple-400', commission: 'bg-cyan-500/10 text-cyan-400' }

  return (
    <div>
      <h1 className="text-xl font-bold text-white mb-1">Balance Flow</h1>
      <p className="text-sm text-white/30 mb-6">Track all balance changes ({total} transactions)</p>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        {Object.entries(summary).filter(function(e) { return e[1] !== 0 }).map(function(e) {
          var type = e[0]; var val = e[1] as number
          return <div key={type} className="bg-[#0A0E1A] rounded-xl border border-white/[0.04] p-3">
            <div className="text-[10px] text-white/40 uppercase mb-1">{type}</div>
            <div className="flex items-center gap-1">
              {val > 0 ? <TrendingUp size={14} className="text-green-400" /> : <TrendingDown size={14} className="text-red-400" />}
              <span className="text-sm font-mono text-white">${Math.abs(val).toFixed(2)}</span>
            </div>
          </div>
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select value={typeFilter} onChange={function(e) { setTypeFilter(e.target.value); setPage(1) }} className="bg-[#0A0E1A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-[#00ff88]/40">
          <option value="">All Types</option>
          <option value="deposit">Deposit</option>
          <option value="unlock">Unlock</option>
          <option value="topup">Topup</option>
          <option value="adjustment">Adjustment</option>
          <option value="refund">Refund</option>
          <option value="commission">Commission</option>
        </select>
        <span className="text-xs text-white/20">Total: ${(summary.deposit + summary.topup).toFixed(2)} in / ${Math.abs(summary.unlock + summary.adjustment).toFixed(2)} out</span>
      </div>

      <div className="bg-[#0A0E1A] border border-white/[0.04] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.04] text-white/30 text-xs uppercase tracking-wider">
                <th className="p-3 text-left">Time</th>
                <th className="p-3 text-left">User</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3 text-right hidden md:table-cell">Before</th>
                <th className="p-3 text-right hidden md:table-cell">After</th>
                <th className="p-3 text-left hidden lg:table-cell">Description</th>
              </tr>
            </thead>
            <tbody>
              {txs.map(function(t: any) { return (
                <tr key={t.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="p-3 text-white/40 text-xs whitespace-nowrap">{t.created_at ? new Date(t.created_at).toLocaleString() : '-'}</td>
                  <td className="p-3">
                    <div className="text-white/80 text-xs">{t.profiles?.username || t.user_id?.substring(0,8)}</div>
                    {t.profiles?.email && <div className="text-white/30 text-[10px]">{t.profiles.email}</div>}
                  </td>
                  <td className="p-3"><span className={"px-2 py-0.5 rounded text-[10px] " + (typeColors[t.type] || 'bg-white/5 text-white/40')}>{t.type}</span></td>
                  <td className={"p-3 text-right font-mono text-xs " + (t.amount >= 0 ? 'text-green-400' : 'text-red-400')}>{t.amount >= 0 ? '+' : ''}{t.amount.toFixed(2)}</td>
                  <td className="p-3 text-right text-white/40 font-mono text-xs hidden md:table-cell">{t.balance_before?.toFixed(2) || '-'}</td>
                  <td className="p-3 text-right text-white/60 font-mono text-xs hidden md:table-cell">{t.balance_after?.toFixed(2) || '-'}</td>
                  <td className="p-3 text-white/30 text-xs hidden lg:table-cell max-w-[150px] truncate">{t.description || '-'}</td>
                </tr>
              )})}
              {txs.length === 0 && !loading && <tr><td colSpan={7} className="text-center py-12 text-white/20 text-sm">No transactions yet. They appear when users deposit, unlock, or admin adjusts balances.</td></tr>}
              {loading && <tr><td colSpan={7} className="text-center py-12"><div className="animate-spin h-5 w-5 border-2 border-[#00ff88] border-t-transparent rounded-full mx-auto" /></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 text-sm">
        <span className="text-white/30">Page {page} of {totalPages} ({total} total)</span>
        <div className="flex items-center gap-2">
          <button disabled={page <= 1} onClick={function() { setPage(Math.max(1, page - 1)) }} className="p-2 rounded text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-30"><ChevronLeft size={16} /></button>
          <span className="text-white/60 text-xs">{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={function() { setPage(Math.min(totalPages, page + 1)) }} className="p-2 rounded text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-30"><ChevronRight size={16} /></button>
        </div>
      </div>
    </div>
  )
}
