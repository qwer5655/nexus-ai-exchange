'use client'
import { useEffect, useState, useCallback } from 'react'

export default function RechargeRecords() {
  var [recharges, setRecharges] = useState<any[]>([])
  var [loading, setLoading] = useState(true)
  var [search, setSearch] = useState('')
  var [statusFilter, setStatusFilter] = useState('')
  var [actionId, setActionId] = useState<string | null>(null)
  var [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)
  var [actionReason, setActionReason] = useState('')

  async function refreshRecharges() {
    setLoading(true)
    try {
      var params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      var res = await fetch('/api/admin/payment/recharges?' + params.toString(), {
        cache: 'no-store', headers: { 'x-admin-email': 'benjoka912@gmail.com' }
      })
      var data = await res.json()
      setRecharges(data.recharges || [])
      console.log('Recharges refreshed:', (data.recharges || []).length)
    } catch(e) { console.error('Refresh failed:', e) }
    finally { setLoading(false) }
  }

  useEffect(function() { refreshRecharges() }, [])

  async function handleAction() {
    if (!actionId || !actionType) return
    try {
      var res = await fetch('/api/admin/payment/recharges', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-email': 'benjoka912@gmail.com' },
        body: JSON.stringify({
          rechargeId: actionId,
          action: actionType,
          reason: actionType === 'reject' ? actionReason : undefined
        })
      })
      var data = await res.json()
      if (data.success || data.error?.includes('processed')) {
        setActionId(null); setActionType(null); setActionReason('')
        refreshRecharges()
      } else {
        alert('Action failed: ' + (data.error || 'Unknown error'))
      }
    } catch(e: any) { alert('Error: ' + (e as Error).message) }
  }

  function statusStyle(status: string) {
    switch(status) {
      case 'completed': return 'bg-green-500/10 text-green-400'
      case 'pending': return 'bg-yellow-500/10 text-yellow-400'
      case 'processing': return 'bg-blue-500/10 text-blue-400'
      case 'failed': return 'bg-red-500/10 text-red-400'
      case 'cancelled': return 'bg-white/10 text-white/40'
      default: return 'bg-white/10 text-white/40'
    }
  }

  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-xl font-bold text-white'>Recharge Records</h1>
          <p className='text-sm text-white/30 mt-1'>Deposit history management</p>
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-xs text-white/20'>{recharges.length} records</span>
        </div>
      </div>

      <div className='flex gap-3 mb-4'>
        <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && refreshRecharges()}
          className='bg-[#020305] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white outline-none flex-1 max-w-xs' placeholder='Search by ID or user...'/>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setTimeout(refreshRecharges, 100) }}
          className='bg-[#020305] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white outline-none'>
          <option value=''>All Status</option>
          <option value='pending'>Pending</option>
          <option value='processing'>Processing</option>
          <option value='completed'>Completed</option>
          <option value='failed'>Failed</option>
          <option value='cancelled'>Cancelled</option>
        </select>
        <button onClick={refreshRecharges} className='px-3 py-2 text-xs text-white/40 border border-white/[0.06] rounded-lg hover:text-white'>Refresh</button>
      </div>

      {(loading) && <div className='text-white/40 p-8 text-center'>Loading recharges...</div>}
      {!loading && (
        <div className='bg-[#0A0E1A] border border-white/[0.04] rounded-xl overflow-hidden'>
          <table className='w-full text-sm'>
            <thead><tr className='border-b border-white/[0.04] text-white/30 text-xs uppercase'>
              <th className='p-4 text-left'>User</th>
              <th className='p-4 text-left'>Currency</th>
              <th className='p-4 text-right'>Amount</th>
              <th className='p-4 text-center'>Status</th>
              <th className='p-4 text-left'>Transaction</th>
              <th className='p-4 text-right'>Date</th>
              <th className='p-4 text-right'>Actions</th>
            </tr></thead>
            <tbody>{recharges.map(function(r: any, i: number) {
              return <tr key={r.id || i} className='border-b border-white/[0.04] hover:bg-white/[0.02]'>
                <td className='p-4 text-white text-xs'>
                  <div className='font-semibold'>{r.profiles?.username || r.profiles?.email || r.user_id?.substring(0, 8)}</div>
                  <div className='text-white/30'>{r.user_id?.substring(0, 12)}...</div>
                </td>
                <td className='p-4 text-white/80'>{r.currency || 'USDT'}</td>
                <td className='p-4 text-right text-white font-mono'>{r.amount}</td>
                <td className='p-4 text-center'>
                  <span className={'px-2 py-0.5 rounded text-xs ' + statusStyle(r.status)}>{r.status}</span>
                </td>
                <td className='p-4 text-xs text-white/40 font-mono max-w-[120px] truncate'>{r.transaction_id || '-'}</td>
                <td className='p-4 text-right text-white/40 text-xs'>{(r.created_at || '').split('T')[0]}</td>
                <td className='p-4 text-right'>
                  {r.status === 'pending' && <>
                    <button onClick={() => { setActionId(r.id); setActionType('approve') }} className='text-green-400/60 hover:text-green-400 text-xs mr-2'>Approve</button>
                    <button onClick={() => { setActionId(r.id); setActionType('reject') }} className='text-red-400/60 hover:text-red-400 text-xs'>Reject</button>
                  </>}
                </td>
              </tr>
            })}</tbody>
          </table>
          {recharges.length === 0 && <div className='text-white/20 text-sm p-8 text-center'>No recharges found</div>}
        </div>
      )}

      {actionType && (
        <div className='fixed inset-0 bg-black/60 flex items-center justify-center z-50' onClick={function(e){if(e.target===e.currentTarget){setActionId(null);setActionType(null)}}}>
          <div className='bg-[#0A0E1A] border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm mx-4'>
            <h2 className='text-lg font-bold text-white mb-2'>{actionType === 'approve' ? 'Approve Recharge?' : 'Reject Recharge?'}</h2>
            <p className='text-sm text-white/40 mb-4'>ID: {actionId}</p>
            {actionType === 'reject' && (
              <textarea value={actionReason} onChange={e => setActionReason(e.target.value)} className='w-full bg-[#020305] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white outline-none mb-4' rows={2} placeholder='Reason (optional)'/>
            )}
            <div className='flex gap-3'>
              <button onClick={() => { setActionId(null); setActionType(null) }} className='flex-1 border border-white/[0.08] text-white/60 px-4 py-2.5 rounded-lg text-sm'>Cancel</button>
              <button onClick={handleAction} className={'flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold ' + (actionType === 'approve' ? 'bg-[#00ff88] text-black' : 'bg-red-500 text-white')}>
                {actionType === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}