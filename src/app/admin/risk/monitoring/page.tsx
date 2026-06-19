'use client'
import { useState, useEffect } from 'react'
import { adminFetch } from '@/lib/admin-fetch'
export default function RiskMonitoring() {
  var [metrics, setMetrics] = useState<any[]>([]); var [loading, setLoading] = useState(true)
  useEffect(function() {
    adminFetch('/api/admin/risk/monitoring').then(function(r){return r.json()}).then(function(d){
      setMetrics(d.metrics || []); setLoading(false)
    }).catch(function(){setLoading(false)})
  }, [])
  if (loading) return <div className="p-6 text-white/40">Loading metrics...</div>
  return <div className='p-6'><h1 className='text-xl font-bold text-white mb-1'>Risk Monitoring</h1><p className='text-sm text-white/30 mb-6'>Real-time security monitoring</p><div className='grid grid-cols-1 md:grid-cols-3 gap-4'>{metrics.map(function(x,i){return <div key={i} className='bg-[#0A0E1A] border border-white/[0.04] rounded-xl p-5'><div className='text-sm text-white/60'>{x.type}</div><div className='text-2xl font-bold text-white mt-1'>{x.count}</div><div className={'text-xs mt-1 '+(x.status==='OK'?'text-green-400':x.status==='WARNING'?'text-yellow-400':'text-red-400')}>{x.status}</div></div>})}</div></div>
}


