'use client'
import { useEffect, useState } from 'react'
import { Check, X, ExternalLink } from 'lucide-react'
import { adminFetch } from '@/lib/admin-fetch'

export default function AdminDeposits() {
  var [deposits, setDeposits] = useState<any[]>([])
  var [loading, setLoading] = useState(true)
  var [toast, setToast] = useState('')
  function showToast(m: string) { setToast(m); setTimeout(function() { setToast('') }, 2000) }
  function load() { adminFetch('/api/admin/deposits').then(function(r) { return r.json() }).then(function(d) { setDeposits(d.deposits || []); setLoading(false) }) }
  useEffect(function() { load() }, [])

  function approve(id: string) {
    adminFetch('/api/admin/deposits', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ depositId: id, action: 'approve' }) })
      .then(function(r) { return r.json() }).then(function(d) { if (d.error) { showToast(d.error); return }; showToast('Approved!'); load() })
  }
  function reject(id: string) {
    adminFetch('/api/admin/deposits', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ depositId: id, action: 'reject' }) })
      .then(function(r) { return r.json() }).then(function(d) { if (d.error) { showToast(d.error); return }; showToast('Rejected!'); load() })
  }

  return (
    <div>
      {toast && <div className='fixed top-4 right-4 z-50 bg-[#00ff88] text-black px-4 py-2 rounded-lg text-sm font-medium shadow-lg'>{toast}</div>}
      <h1 className='text-2xl font-bold text-white mb-1'>Deposit Review</h1>
      <p className='text-sm text-gray-400 mb-6'>Approve or reject crypto deposit requests</p>
      <div className='bg-[#0a0e1a] rounded-xl border border-white/5 overflow-hidden'>
        <div className='overflow-x-auto'><table className='w-full text-sm'><thead><tr className='border-b border-white/5 text-gray-400 text-xs uppercase tracking-wider'>
          <th className='text-left p-4 font-medium'>User</th><th className='text-left p-4 font-medium'>Coin</th>
          <th className='text-right p-4 font-medium'>Amount</th><th className='text-center p-4 font-medium'>Status</th>
          <th className='text-right p-4 font-medium'>Date</th><th className='text-right p-4 font-medium'>Actions</th>
        </tr></thead><tbody>
        {deposits.map(function(d: any) {
          return <tr key={d.id} className='border-b border-white/5 hover:bg-white/[0.02]'>
            <td className='p-4'><span className='text-white'>{d.profiles?.username || d.user_id?.slice(0,8)}</span></td>
            <td className='p-4'><span className='text-white font-mono'>{d.coin}</span></td>
            <td className='p-4 text-right text-white font-mono'>${d.amount?.toFixed(2)}</td>
            <td className='p-4 text-center'><span className={'px-2 py-0.5 rounded text-xs ' + (d.status === 'approved' ? 'bg-green-500/10 text-green-400' : d.status === 'rejected' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400')}>{d.status}</span></td>
            <td className='p-4 text-right text-gray-400 text-xs'>{d.created_at?.slice(0,10)}</td>
            <td className='p-4 text-right'><div className='flex items-center justify-end gap-2'>
              {d.status === 'pending' && <><button onClick={function() { approve(d.id) }} className='p-1.5 rounded text-green-400 hover:bg-green-500/10' title='Approve'><Check size={14} /></button><button onClick={function() { reject(d.id) }} className='p-1.5 rounded text-red-400 hover:bg-red-500/10' title='Reject'><X size={14} /></button></>}
              {d.status !== 'pending' && <span className='text-xs text-gray-500'>Done</span>}
            </div></td></tr>
        })}
        </tbody></table></div>
        {deposits.length === 0 && !loading && <div className='text-center py-12 text-gray-500 text-sm'>No deposits yet</div>}
        {loading && <div className='text-center py-12'><div className='animate-spin h-6 w-6 border-2 border-[#00ff88] border-t-transparent rounded-full mx-auto'></div></div>}
      </div>
    </div>
  )
}
