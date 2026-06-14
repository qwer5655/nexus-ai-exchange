'use client'
import { useEffect, useState } from 'react'
import { Send, Megaphone, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { adminFetch } from '@/lib/admin-fetch'

export default function AdminNotifications() {
  var [title, setTitle] = useState('')
  var [message, setMessage] = useState('')
  var [userId, setUserId] = useState('')
  var [notifs, setNotifs] = useState<any[]>([])
  var [page, setPage] = useState(1)
  var [total, setTotal] = useState(0)
  var [loading, setLoading] = useState(true)
  var [toast, setToast] = useState('')
  var limit = 20

  function showToast(m: string) { setToast(m); setTimeout(function() { setToast('') }, 2000) }

  function loadNotifs() {
    setLoading(true)
    adminFetch('/api/admin/notifications?page=' + page + '&limit=' + limit)
      .then(function(r) { return r.json() }).then(function(d) {
        setNotifs(d.notifications || []); setTotal(d.total || 0); setLoading(false)
      }).catch(function() { setLoading(false) })
  }

  useEffect(function() { loadNotifs() }, [page])

  function sendAll() {
    if (!title || !message) { showToast('Title and message required'); return }
    adminFetch('/api/admin/notifications', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: '__all__', title, message })
    }).then(function(r) { return r.json() }).then(function(d) {
      if (d.error) { showToast(d.error); return }
      showToast('Broadcast sent to ' + (d.count || 0) + ' users!')
      setTitle(''); setMessage(''); loadNotifs()
    })
  }

  function sendUser() {
    if (!userId || !title || !message) { showToast('User ID, title and message required'); return }
    adminFetch('/api/admin/notifications', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, title, message })
    }).then(function(r) { return r.json() }).then(function(d) {
      if (d.error) { showToast(d.error); return }
      showToast('Sent to user!')
      setTitle(''); setMessage(''); setUserId(''); loadNotifs()
    })
  }

  function deleteNotif(id: string) {
    adminFetch('/api/admin/notifications?id=' + id, { method: 'DELETE' })
      .then(function(r) { return r.json() }).then(function(d) {
        if (d.error) { showToast(d.error); return }
        showToast('Notification deleted'); loadNotifs()
      })
  }

  var totalPages = Math.ceil(total / limit) || 1

  return (
    <div>
      {toast && <div className="fixed top-4 right-4 z-50 bg-[#00ff88] text-black px-4 py-2 rounded-lg text-sm font-medium shadow-lg">{toast}</div>}
      <h1 className="text-2xl font-bold text-white mb-1">Notification Center</h1>
      <p className="text-sm text-gray-400 mb-6">Send platform-wide announcements or targeted notifications ({total} sent)</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#0a0e1a] rounded-xl border border-white/5 p-6">
          <div className="flex items-center gap-3 mb-4"><Megaphone size={20} className="text-[#00ff88]" /><h2 className="text-white font-semibold">Broadcast to All Users</h2></div>
          <input value={title} onChange={function(e) { setTitle(e.target.value) }} placeholder="Notification title" className="w-full bg-[#020305] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white mb-3 focus:outline-none focus:border-[#00ff88]/30" />
          <textarea value={message} onChange={function(e) { setMessage(e.target.value) }} placeholder="Notification message" rows={4} className="w-full bg-[#020305] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white mb-4 focus:outline-none focus:border-[#00ff88]/30 resize-none" />
          <button onClick={sendAll} className="flex items-center gap-2 bg-[#00ff88] text-black px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#00ff88]/90 transition-all"><Send size={16} /> Send Broadcast</button>
        </div>

        <div className="bg-[#0a0e1a] rounded-xl border border-white/5 p-6">
          <div className="flex items-center gap-3 mb-4"><Send size={20} className="text-[#00d9ff]" /><h2 className="text-white font-semibold">Send to Specific User</h2></div>
          <input value={userId} onChange={function(e) { setUserId(e.target.value) }} placeholder="User ID" className="w-full bg-[#020305] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white mb-3 focus:outline-none focus:border-[#00d9ff]/30" />
          <input value={title} onChange={function(e) { setTitle(e.target.value) }} placeholder="Notification title" className="w-full bg-[#020305] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white mb-3 focus:outline-none focus:border-[#00d9ff]/30" />
          <textarea value={message} onChange={function(e) { setMessage(e.target.value) }} placeholder="Notification message" rows={3} className="w-full bg-[#020305] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white mb-4 focus:outline-none focus:border-[#00d9ff]/30 resize-none" />
          <button onClick={sendUser} className="flex items-center gap-2 bg-[#00d9ff] text-black px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#00d9ff]/90 transition-all"><Send size={16} /> Send to User</button>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-white mb-4">Notification History</h2>
      <div className="bg-[#0a0e1a] rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.04] text-white/30 text-xs uppercase">
                <th className="p-4 text-left">Title</th>
                <th className="p-4 text-left hidden md:table-cell">Message</th>
                <th className="p-4 text-left">User ID</th>
                <th className="p-4 text-center">Read</th>
                <th className="p-4 text-right">Date</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {notifs.map(function(n: any) { return (
                <tr key={n.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="p-4 text-white font-medium">{n.title}</td>
                  <td className="p-4 text-white/40 text-xs hidden md:table-cell max-w-[200px] truncate">{n.message}</td>
                  <td className="p-4 text-white/60 text-xs font-mono">{n.user_id?.substring(0, 12)}</td>
                  <td className="p-4 text-center">{n.is_read ? <span className="text-green-400 text-xs">Yes</span> : <span className="text-white/20 text-xs">No</span>}</td>
                  <td className="p-4 text-right text-white/30 text-xs">{n.created_at ? new Date(n.created_at).toLocaleString() : '-'}</td>
                  <td className="p-4 text-center">
                    <button onClick={function() { deleteNotif(n.id) }} className="p-1.5 rounded text-red-400 hover:bg-red-500/10 transition-all" title="Delete"><Trash2 size={14} /></button>
                  </td>
                </tr>
              )})}
              {notifs.length === 0 && !loading && <tr><td colSpan={6} className="text-center py-12 text-white/20 text-sm">No notifications sent yet</td></tr>}
              {loading && <tr><td colSpan={6} className="text-center py-12"><div className="animate-spin h-5 w-5 border-2 border-[#00ff88] border-t-transparent rounded-full mx-auto" /></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

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
