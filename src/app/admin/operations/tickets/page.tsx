'use client'
import { useState, useEffect } from 'react'
export default function Tickets() {
  var [items, setItems] = useState<any[]>([]); var [loading, setLoading] = useState(true)
  useEffect(function() {
    fetch('/api/admin/operations/tickets', { cache: 'no-store' }).then(function(r){return r.json()}).then(function(d){
      setItems(d.tickets || []); setLoading(false)
    }).catch(function(){setLoading(false)})
  }, [])
  if (loading) return <div className="p-6 text-white/40">Loading tickets...</div>
  return <div className='p-6'><h1 className='text-xl font-bold text-white mb-1'>Support Tickets</h1><p className='text-sm text-white/30 mb-6'>Manage support tickets</p><div className='bg-[#0A0E1A] border border-white/[0.04] rounded-xl overflow-hidden'><table className='w-full text-sm'><thead><tr className='border-b border-white/[0.04] text-white/30 text-xs uppercase'><th className='p-4 text-left'>Subject</th><th className='p-4 text-center'>Status</th><th className='p-4 text-center'>Priority</th><th className='p-4 text-right'>Created</th></tr></thead><tbody>{items.map(function(x,i){return <tr key={x.id||i} className='border-b border-white/[0.04]'><td className='p-4 text-white'>{x.subject}</td><td className='p-4 text-center'><span className={'px-2 py-0.5 rounded text-xs '+(x.status==='open'?'bg-blue-500/10 text-blue-400':x.status==='resolved'?'bg-green-500/10 text-green-400':x.status==='closed'?'bg-gray-500/10 text-gray-400':'bg-yellow-500/10 text-yellow-400')}>{x.status}</span></td><td className='p-4 text-center'><span className={'px-2 py-0.5 rounded text-xs '+(x.priority==='urgent'?'bg-red-500/10 text-red-400':x.priority==='high'?'bg-orange-500/10 text-orange-400':'bg-gray-500/10 text-gray-400')}>{x.priority}</span></td><td className='p-4 text-right text-white/40 text-xs'>{(x.created_at||'').split('T')[0]}</td></tr>})}</tbody></table></div></div>
}
