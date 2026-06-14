'use client'
import { useEffect, useState } from 'react'
import { Search, Download, Shield, DollarSign, Ban, CheckCircle, ChevronLeft, ChevronRight, ArrowUpDown, Trash2 } from 'lucide-react'
import { adminFetch } from '@/lib/admin-fetch'
import { supabase } from '@/lib/supabase'

export default function AdminUsers() {
  var [users, setUsers] = useState<any[]>([])
  var [loading, setLoading] = useState(true)
  var [search, setSearch] = useState('')
  var [page, setPage] = useState(1)
  var [total, setTotal] = useState(0)
  var [limit] = useState(20)
  var [sortBy, setSortBy] = useState('created_at')
  var [sortDir, setSortDir] = useState('desc')
  var [selected, setSelected] = useState<Set<string>>(new Set())
  var [editUser, setEditUser] = useState<any>(null)
  var [editBalance, setEditBalance] = useState('')
  var [toast, setToast] = useState('')
  var [detailUser, setDetailUser] = useState<any>(null)
  var [userOrders, setUserOrders] = useState<any[]>([])

  function showToast(msg: string) { setToast(msg); setTimeout(function() { setToast('') }, 2000) }

  function loadUsers() {
    setLoading(true)
    var params = new URLSearchParams({ page: String(page), limit: String(limit), sortBy, sortDir })
    if (search) params.set('search', search)
    adminFetch('/api/admin/users?' + params.toString()).then(function(r) { return r.json() }).then(function(d) {
      setUsers(d.users || []); setTotal(d.total || 0); setLoading(false)
    }).catch(function() { setLoading(false) })
  }



  // Real-time subscription: auto-refresh on profiles changes
  useEffect(function() {
    var channel = supabase
      .channel('admin-users-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        function(payload) {
          console.log('[Realtime] profiles changed:', payload.eventType, payload.new?.id?.substring(0, 8));
          loadUsers();
        }
      )
      .subscribe(function(status) {
        console.log('[Realtime] subscription status:', status);
      });
    return function() { supabase.removeChannel(channel); };
  }, [])

  useEffect(function() { loadUsers() }, [page, sortBy, sortDir])
  useEffect(function() {
    if (!search) { page !== 1 && setPage(1); return }
    var timer = setTimeout(function() { setPage(1); loadUsers() }, 300)
    return function() { clearTimeout(timer) }
  }, [search])

  var totalPages = Math.ceil(total / limit) || 1

  function toggleSort(field: string) {
    if (sortBy === field) { setSortDir(sortDir === 'asc' ? 'desc' : 'asc') }
    else { setSortBy(field); setSortDir('desc') }
  }

  function toggleSelect(id: string) {
    var next = new Set(selected)
    if (next.has(id)) next.delete(id); else next.add(id)
    setSelected(next)
  }

  function toggleSelectAll() {
    if (selected.size === users.length && users.length > 0) { setSelected(new Set()); return }
    setSelected(new Set(users.map(function(u: any) { return u.id })))
  }

  function bulkAction(action: string) {
    if (selected.size === 0) { showToast('No users selected'); return }
    var promises = Array.from(selected).map(function(id: string) {
      var updates: any = {}
      if (action === 'ban') updates.banned = true
      if (action === 'unban') updates.banned = false
      if (action === 'make_admin') updates.role = 'admin'
      if (action === 'remove_admin') updates.role = 'user'
      return adminFetch('/api/admin/users', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, updates })
      })
    })
    Promise.all(promises).then(function() {
      showToast('Bulk ' + action + ' completed for ' + selected.size + ' users')
      setSelected(new Set()); loadUsers()
    })
  }

  function exportCSV() {
    var headers = 'ID,Username,Email,Role,VIP,Balance,Status,Created\n'
    var rows = users.map(function(u: any) {
      return [u.id, u.username, u.email, u.role || 'user', u.vip_level ?? 0, u.balance ?? 0, u.banned ? 'Banned' : 'Active', (u.created_at || '').split('T')[0]].join(',')
    }).join('\n')
    var blob = new Blob([headers + rows], { type: 'text/csv' })
    var a = document.createElement('a')
    a.href = URL.createObjectURL(blob); a.download = 'users_export.csv'; a.click()
    showToast('Exported ' + users.length + ' users')
  }

  function updateUser(userId: string, updates: any) {
    adminFetch('/api/admin/users', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, updates })
    }).then(function(r) { return r.json() }).then(function(d) {
      if (d.error) { showToast(d.error); return }
      showToast('Updated successfully')
      setEditUser(null); loadUsers()
    })
  }

  function updateBalance() {
    var amt = parseFloat(editBalance)
    if (isNaN(amt) || !editUser) return
    updateUser(editUser.id, { balance: (editUser.balance || 0) + amt })
  }

  function loadUserDetail(u: any) {
    setDetailUser(u)
    adminFetch('/api/admin/deposits?search=' + u.id + '&limit=10').then(function(r) { return r.json() }).then(function(d) {
      setUserOrders(d.deposits || [])
    }).catch(function() { setUserOrders([]) })
  }

  return (
    <div>
      {toast && <div className="fixed top-4 right-4 z-50 bg-[#00ff88] text-black px-4 py-2 rounded-lg text-sm font-medium shadow-lg">{toast}</div>}
      <h1 className="text-2xl font-bold text-white mb-1">User Management</h1>
      <p className="text-sm text-gray-400 mb-6">Manage user accounts, balances, and permissions ({total} total users)</p>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={function(e) { setSearch(e.target.value) }} placeholder="Search email or username..." className="w-full bg-[#0a0e1a] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]/30" />
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 bg-white/5 text-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-white/10 transition-all"><Download size={14} /> Export CSV</button>
        {selected.size > 0 && <>
          <span className="text-xs text-white/40">{selected.size} selected</span>
          <button onClick={function() { bulkAction('ban') }} className="flex items-center gap-2 bg-red-500/10 text-red-400 px-3 py-2 rounded-lg text-sm hover:bg-red-500/20 transition-all"><Ban size={14} /> Ban</button>
          <button onClick={function() { bulkAction('unban') }} className="flex items-center gap-2 bg-green-500/10 text-green-400 px-3 py-2 rounded-lg text-sm hover:bg-green-500/20 transition-all"><CheckCircle size={14} /> Unban</button>
          <button onClick={function() { bulkAction('make_admin') }} className="flex items-center gap-2 bg-blue-500/10 text-blue-400 px-3 py-2 rounded-lg text-sm hover:bg-blue-500/20 transition-all"><Shield size={14} /> Make Admin</button>
        </>}
      </div>

      <div className="bg-[#0a0e1a] rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-gray-400 text-xs uppercase tracking-wider">
                <th className="p-4 text-left w-10"><input type="checkbox" checked={selected.size === users.length && users.length > 0} onChange={toggleSelectAll} className="accent-[#00ff88]" /></th>
                <th className="p-4 text-left cursor-pointer hover:text-white" onClick={function() { toggleSort('username') }}><span className="flex items-center gap-1">User<ArrowUpDown size={12} /></span></th>
                <th className="p-4 text-left cursor-pointer hover:text-white" onClick={function() { toggleSort('email') }}><span className="flex items-center gap-1">Email<ArrowUpDown size={12} /></span></th>
                <th className="p-4 text-right cursor-pointer hover:text-white" onClick={function() { toggleSort('balance') }}><span className="flex items-center gap-1 justify-end">Balance<ArrowUpDown size={12} /></span></th>
                <th className="p-4 text-center cursor-pointer hover:text-white" onClick={function() { toggleSort('vip_level') }}><span className="flex items-center gap-1 justify-center">VIP<ArrowUpDown size={12} /></span></th>
                <th className="p-4 text-center cursor-pointer hover:text-white" onClick={function() { toggleSort('role') }}><span className="flex items-center gap-1 justify-center">Role<ArrowUpDown size={12} /></span></th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Unlocks</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(function(u: any) { return (
                <tr key={u.id} className={'border-b border-white/5 hover:bg-white/[0.02] transition-colors ' + (u.banned ? 'opacity-60' : '')}>
                  <td className="p-4"><input type="checkbox" checked={selected.has(u.id)} onChange={function() { toggleSelect(u.id) }} className="accent-[#00ff88]" /></td>
                  <td className="p-4">
                    <button onClick={function() { loadUserDetail(u) }} className="flex items-center gap-3 hover:text-[#00ff88] transition-colors">
                      <div className="w-8 h-8 rounded-full bg-[#00ff88]/10 flex items-center justify-center text-[#00ff88] text-xs font-bold">{u.username?.[0] || '?'}</div>
                      <span className="text-white font-medium">{u.username}</span>
                    </button>
                  </td>
                  <td className="p-4 text-gray-400">{u.email}</td>
                  <td className="p-4 text-right text-white font-mono">${(u.balance || 0).toFixed(2)}</td>
                  <td className="p-4 text-center"><span className={"px-2 py-0.5 rounded text-xs " + (u.vip_level > 0 ? "bg-yellow-500/10 text-yellow-400" : "bg-white/5 text-gray-500")}>VIP {u.vip_level ?? 0}</span></td>
                  <td className="p-4 text-center"><span className={"px-2 py-0.5 rounded text-xs " + (u.role === 'admin' || u.role === 'super_admin' ? "bg-[#00ff88]/10 text-[#00ff88]" : "bg-white/5 text-gray-400")}>{u.role || 'user'}</span></td>
                  <td className="p-4 text-center">{u.banned ? <span className="px-2 py-0.5 rounded text-xs bg-red-500/10 text-red-400">Banned</span> : <span className="px-2 py-0.5 rounded text-xs bg-green-500/10 text-green-400">Active</span>}</td>
                  <td className="p-4 text-center text-gray-400">{u.total_unlocks || 0}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={function() { setEditUser(u); setEditBalance('') }} className="p-1.5 rounded text-gray-400 hover:text-[#00ff88] hover:bg-[#00ff88]/10 transition-all" title="Adjust Balance"><DollarSign size={14} /></button>
                      <button onClick={function() { updateUser(u.id, { role: u.role === 'admin' ? 'user' : 'admin' }) }} className="p-1.5 rounded text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all" title="Toggle Admin"><Shield size={14} /></button>
                      <button onClick={function() { updateUser(u.id, { banned: !u.banned }) }} className="p-1.5 rounded text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all" title={u.banned ? 'Unban' : 'Ban'}>{u.banned ? <CheckCircle size={14} /> : <Ban size={14} />}</button>
                    </div>
                  </td>
                </tr>
              )})}
              {users.length === 0 && !loading && <tr><td colSpan={9} className="text-center py-12 text-gray-500 text-sm">No users found</td></tr>}
              {loading && <tr><td colSpan={9} className="text-center py-12"><div className="animate-spin h-6 w-6 border-2 border-[#00ff88] border-t-transparent rounded-full mx-auto"></div></td></tr>}
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

      {/* Balance Edit Modal */}
      {editUser && <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={function(e) { if (e.target === e.currentTarget) setEditUser(null) }}>
        <div className="bg-[#0a0e1a] rounded-xl border border-white/10 p-6 w-full max-w-sm">
          <h3 className="text-white font-semibold mb-1">Adjust Balance</h3>
          <p className="text-sm text-gray-400 mb-4">{editUser.username} — Current: ${(editUser.balance || 0).toFixed(2)}</p>
          <input value={editBalance} onChange={function(e) { setEditBalance(e.target.value) }} type="number" placeholder="Amount (+/-)" className="w-full bg-[#020305] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white mb-4 focus:outline-none focus:border-[#00ff88]/30" />
          <div className="flex gap-3">
            <button onClick={function() { setEditUser(null) }} className="flex-1 bg-white/5 text-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-white/10 transition-all">Cancel</button>
            <button onClick={updateBalance} className="flex-1 bg-[#00ff88] text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#00ff88]/90 transition-all">Apply</button>
          </div>
        </div>
      </div>}

      {/* User Detail Modal */}
      {detailUser && <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={function(e) { if (e.target === e.currentTarget) setDetailUser(null) }}>
        <div className="bg-[#0a0e1a] rounded-xl border border-white/10 p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-lg">{detailUser.username}</h3>
            <button onClick={function() { setDetailUser(null) }} className="text-white/30 hover:text-white">✕</button>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
            <div><span className="text-white/30">Email:</span><span className="text-white ml-2">{detailUser.email}</span></div>
            <div><span className="text-white/30">Role:</span><span className="text-white ml-2">{detailUser.role}</span></div>
            <div><span className="text-white/30">VIP:</span><span className="text-white ml-2">VIP {detailUser.vip_level ?? 0}</span></div>
            <div><span className="text-white/30">Balance:</span><span className="text-white ml-2">${(detailUser.balance || 0).toFixed(2)}</span></div>
            <div><span className="text-white/30">Country:</span><span className="text-white ml-2">{detailUser.country || 'US'}</span></div>
            <div><span className="text-white/30">Unlocks:</span><span className="text-white ml-2">{detailUser.total_unlocks || 0}</span></div>
            <div><span className="text-white/30">Created:</span><span className="text-white ml-2">{detailUser.created_at ? new Date(detailUser.created_at).toLocaleString() : '-'}</span></div>
            <div><span className="text-white/30">Status:</span>{detailUser.banned ? <span className="text-red-400 ml-2">Banned</span> : <span className="text-green-400 ml-2">Active</span>}</div>
          </div>
          <h4 className="text-white text-sm font-semibold mb-2">Recent Orders</h4>
          <div className="space-y-2">
            {userOrders.map(function(d: any) { return (
              <div key={d.id} className="bg-white/[0.02] rounded-lg p-3 flex items-center justify-between text-sm">
                <div><span className="text-white/60 font-mono text-xs">{d.id?.substring(0, 12)}</span><span className="text-white/80 ml-3">{d.coin}</span></div>
                <div className="flex items-center gap-3">
                  <span className="text-white font-mono">${d.amount}</span>
                  <span className={"px-2 py-0.5 rounded text-xs " + (d.status === 'approved' ? 'bg-green-500/10 text-green-400' : d.status === 'rejected' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400')}>{d.status}</span>
                </div>
              </div>
            )})}
            {userOrders.length === 0 && <div className="text-center py-4 text-white/20 text-xs">No orders</div>}
          </div>
        </div>
      </div>}
    </div>
  )
}
