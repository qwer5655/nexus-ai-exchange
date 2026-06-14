'use client'
import { useEffect, useState } from 'react'
import { adminFetch } from '@/lib/admin-fetch'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

export default function LoginLogs() {
  var [logs, setLogs] = useState<any[]>([])
  var [loading, setLoading] = useState(true)
  var [search, setSearch] = useState('')
  var [page, setPage] = useState(1)
  var [total, setTotal] = useState(0)
  var limit = 50

  function loadLogs() {
    setLoading(true)
    adminFetch('/api/admin/login-logs?page=' + page + '&limit=' + limit).then(function(r) { return r.json() }).then(function(d) {
      setLogs(d.logs || []); setTotal(d.total || 0); setLoading(false)
    }).catch(function() { setLoading(false) })
  }

  useEffect(function() { loadLogs() }, [page])

  var filtered = search ? logs.filter(function(l) {
    var d = l.details || {}
    return (d.email || '').toLowerCase().includes(search.toLowerCase()) || (d.username || '').toLowerCase().includes(search.toLowerCase()) || (l.ip_address || '').includes(search)
  }) : logs

  var totalPages = Math.ceil(total / limit) || 1

  return (
    <div>
      <h1 className="text-xl font-bold text-white mb-1">Login Logs</h1>
      <p className="text-sm text-white/30 mb-6">All user login records ({total} total)</p>

      <div className="relative mb-4 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
        <input value={search} onChange={function(e) { setSearch(e.target.value) }} placeholder="Search email, username or IP..." className="w-full bg-[#0A0E1A] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#00ff88]/30" />
      </div>

      <div className="bg-[#0A0E1A] border border-white/[0.04] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.04] text-white/30 text-xs uppercase">
                <th className="p-3 text-left">User</th>
                <th className="p-3 text-left">IP</th>
                <th className="p-3 text-left hidden md:table-cell">Device</th>
                <th className="p-3 text-left hidden lg:table-cell">Browser / OS</th>
                <th className="p-3 text-right">Time</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(function(x: any, i: number) {
                var d = x.details || {}
                return <tr key={x.id || i} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="p-3 text-white">{d.email || d.username || (x.target_id || '').substring(0, 8)}</td>
                  <td className="p-3 text-white/60 font-mono text-xs">{x.ip_address || '-'}</td>
                  <td className="p-3 text-white/40 text-xs hidden md:table-cell">{d.device || '-'}</td>
                  <td className="p-3 text-white/40 text-xs hidden lg:table-cell">{(d.browser || '') + ' / ' + (d.os || '')}</td>
                  <td className="p-3 text-right text-white/40 text-xs">{x.created_at ? new Date(x.created_at).toLocaleString() : '-'}</td>
                </tr>
              })}
              {filtered.length === 0 && !loading && <tr><td colSpan={5} className="p-8 text-center text-white/30 text-sm">No login records</td></tr>}
              {loading && <tr><td colSpan={5} className="p-8 text-center"><div className="animate-spin h-5 w-5 border-2 border-[#00ff88] border-t-transparent rounded-full mx-auto" /></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm">
        <span className="text-white/30">Page {page} of {totalPages} ({total} total)</span>
        <div className="flex items-center gap-2">
          <button disabled={page <= 1} onClick={function() { setPage(Math.max(1, page - 1)) }} className="p-2 rounded text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-all"><ChevronLeft size={16} /></button>
          <span className="text-white/60 text-xs">{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={function() { setPage(Math.min(totalPages, page + 1)) }} className="p-2 rounded text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-all"><ChevronRight size={16} /></button>
        </div>
      </div>
    </div>
  )
}
