'use client'
import { useEffect, useState } from 'react'
import { adminFetch } from '@/lib/admin-fetch'
import { Search, Download, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react'

export default function OrderList() {
  var [deposits, setDeposits] = useState<any[]>([])
  var [loading, setLoading] = useState(true)
  var [search, setSearch] = useState('')
  var [statusFilter, setStatusFilter] = useState('')
  var [page, setPage] = useState(1)
  var [total, setTotal] = useState(0)
  var [toast, setToast] = useState('')
  var limit = 20

  function showToast(msg: string) { setToast(msg); setTimeout(function() { setToast('') }, 2000) }

  function load() {
    setLoading(true)
    var params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (search) params.set('search', search)
    if (statusFilter) params.set('status', statusFilter)
    adminFetch('/api/admin/deposits?' + params.toString()).then(function(r) { return r.json() }).then(function(d) {
      setDeposits(d.deposits || []); setTotal(d.total || 0); setLoading(false)
    }).catch(function() { setLoading(false) })
  }

  useEffect(function() { load() }, [page, statusFilter])

  useEffect(function() {
    if (!search) { page !== 1 && setPage(1); return }
    var timer = setTimeout(function() { setPage(1); load() }, 300)
    return function() { clearTimeout(timer) }
  }, [search])

  var totalPages = Math.ceil(total / limit) || 1

  function processOrder(depositId: string, action: string) {
    adminFetch('/api/admin/deposits', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ depositId, action })
    }).then(function(r) { return r.json() }).then(function(d) {
      if (d.error) { showToast(d.error); return }
      showToast('Order ' + action + 'd successfully')
      load()
    })
  }

  function exportCSV() {
    var headers = 'ID,User,Email,Coin,Amount,Status,Created\n'
    var rows = deposits.map(function(d: any) {
      return [d.id, d.profiles?.username || '', d.profiles?.email || '', d.coin, d.amount, d.status, (d.created_at || '').split('T')[0]].join(',')
    }).join('\n')
    var blob = new Blob([headers + rows], { type: 'text/csv' })
    var a = document.createElement('a')
    a.href = URL.createObjectURL(blob); a.download = 'orders_export.csv'; a.click()
    showToast('Exported ' + deposits.length + ' orders')
  }

  return (
    <div>
      {toast && <div className="fixed top-4 right-4 z-50 bg-[#00ff88] text-black px-4 py-2 rounded-lg text-sm font-medium shadow-lg">{toast}</div>}
      <h1 className="text-xl font-bold text-white mb-1">Order List</h1>
      <p className="text-sm text-white/30 mb-6">Manage deposits and payment orders ({total} total)</p>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
          <input value={search} onChange={function(e) { setSearch(e.target.value) }} placeholder="Search orders..." className="w-full bg-[#0A0E1A] border border-white/[0.06] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-[#00ff88]/40" />
        </div>
        <select value={statusFilter} onChange={function(e) { setStatusFilter(e.target.value); setPage(1) }} className="bg-[#0A0E1A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-[#00ff88]/40">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button onClick={exportCSV} className="flex items-center gap-2 bg-white/5 text-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-white/10 transition-all"><Download size={14} /> Export</button>
      </div>

      <div className="bg-[#0A0E1A] border border-white/[0.04] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.04] text-white/30 text-xs uppercase tracking-wider">
                <th className="text-left p-4 font-medium">ID</th>
                <th className="text-left p-4 font-medium">User</th>
                <th className="text-left p-4 font-medium">Coin</th>
                <th className="text-right p-4 font-medium">Amount</th>
                <th className="text-center p-4 font-medium">Status</th>
                <th className="text-right p-4 font-medium">Date</th>
                <th className="text-center p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deposits.map(function(d: any) { return (
                <tr key={d.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="p-4 text-white/60 font-mono text-xs">{d.id?.substring(0, 12)}</td>
                  <td className="p-4">
                    <div className="text-white/80 text-sm">{d.profiles?.username || d.user_id?.substring(0, 12)}</div>
                    {d.profiles?.email && <div className="text-white/30 text-xs">{d.profiles.email}</div>}
                  </td>
                  <td className="p-4 text-white/80">{d.coin}</td>
                  <td className="p-4 text-right text-white font-mono">${d.amount}</td>
                  <td className="p-4 text-center">
                    <span className={"px-2 py-0.5 rounded text-xs " + (d.status === 'approved' ? 'bg-green-500/10 text-green-400' : d.status === 'rejected' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400')}>{d.status}</span>
                  </td>
                  <td className="p-4 text-right text-white/40 text-xs">{d.created_at ? new Date(d.created_at).toLocaleString() : '-'}</td>
                  <td className="p-4 text-center">
                    {d.status === 'pending' && <div className="flex items-center justify-center gap-1">
                      <button onClick={function() { processOrder(d.id, 'approve') }} className="p-1.5 rounded text-green-400 hover:bg-green-500/10 transition-all" title="Approve"><CheckCircle size={14} /></button>
                      <button onClick={function() { processOrder(d.id, 'reject') }} className="p-1.5 rounded text-red-400 hover:bg-red-500/10 transition-all" title="Reject"><XCircle size={14} /></button>
                    </div>}
                    {d.status !== 'pending' && <span className="text-white/20 text-xs">—</span>}
                  </td>
                </tr>
              )})}
              {deposits.length === 0 && !loading && <tr><td colSpan={7} className="text-center py-12 text-white/20 text-sm">No orders found</td></tr>}
              {loading && <tr><td colSpan={7} className="text-center py-12"><div className="animate-spin h-6 w-6 border-2 border-[#00ff88] border-t-transparent rounded-full mx-auto" /></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm">
        <span className="text-white/30">Page {page} of {totalPages} ({total} total)</span>
        <div className="flex items-center gap-2">
          <button disabled={page <= 1} onClick={function() { setPage(Math.max(1, page - 1)) }} className="p-2 rounded text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-all"><ChevronLeft size={16} /></button>
          {Array.from({ length: Math.min(totalPages, 5) }, function(_, i) {
            var p = Math.max(1, Math.min(page - 2 + i, totalPages - 4))
            if (totalPages <= 5) p = i + 1
            return <button key={p} onClick={function() { setPage(p) }} className={"w-8 h-8 rounded text-xs " + (p === page ? "bg-[#00ff88] text-black font-semibold" : "text-white/40 hover:text-white hover:bg-white/5")}>{p}</button>
          })}
          <button disabled={page >= totalPages} onClick={function() { setPage(Math.min(totalPages, page + 1)) }} className="p-2 rounded text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-all"><ChevronRight size={16} /></button>
        </div>
      </div>
    </div>
  )
}
