'use client'
import { useState, useEffect } from 'react'
export default function Banners() {
  var [items, setItems] = useState<any[]>([]); var [loading, setLoading] = useState(true)
  useEffect(function() {
    fetch('/api/admin/operations/banners', { cache: 'no-store' }).then(function(r){return r.json()}).then(function(d){
      setItems(d.banners || []); setLoading(false)
    }).catch(function(){setLoading(false)})
  }, [])
  if (loading) return <div className="p-6 text-white/40">Loading banners...</div>
  return <div className='p-6'><h1 className='text-xl font-bold text-white mb-1'>Banners</h1><p className='text-sm text-white/30 mb-6'>Manage promotional banners</p><div className='bg-[#0A0E1A] border border-white/[0.04] rounded-xl overflow-hidden'><table className='w-full text-sm'><thead><tr className='border-b border-white/[0.04] text-white/30 text-xs uppercase'><th className='p-4 text-left'>Title</th><th className='p-4 text-left'>Position</th><th className='p-4 text-center'>Active</th><th className='p-4 text-right'>Order</th></tr></thead><tbody>{items.map(function(x,i){return <tr key={x.id||i} className='border-b border-white/[0.04]'><td className='p-4 text-white'>{x.title}</td><td className='p-4 text-white/60 text-xs'>{x.position}</td><td className='p-4 text-center'><span className={'px-2 py-0.5 rounded text-xs '+(x.active?'bg-green-500/10 text-green-400':'bg-red-500/10 text-red-400')}>{x.active?'Active':'Inactive'}</span></td><td className='p-4 text-right text-white/40 text-xs'>{x.sort_order}</td></tr>})}</tbody></table></div></div>
}
