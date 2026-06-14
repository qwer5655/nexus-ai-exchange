'use client'
import { useEffect, useState } from 'react'
import { adminFetch } from '@/lib/admin-fetch'
import { DollarSign, TrendingUp, ArrowUpRight, Download } from 'lucide-react'

export default function RevenueCenter() {
  var [data, setData] = useState<any>({ loading: true })
  useEffect(function() {
    adminFetch('/api/admin/stats').then(function(r) { return r.json() }).then(function(d) { setData({ ...d, loading: false }) })
  }, [])
  if (data.loading) return <div className='text-center py-20'><div className='animate-spin h-8 w-8 border-2 border-[#00ff88] border-t-transparent rounded-full mx-auto' /></div>
  var s = data.stats || {}
  var cards = [{l:'Today Revenue',v:'$'+(s.todayRevenue||0).toLocaleString(),c:'#00ff88'},{l:'Month Revenue',v:'$'+(s.monthRevenue||0).toLocaleString(),c:'#ffd700'},{l:'Total Revenue',v:'$'+(s.totalRevenue||0).toLocaleString(),c:'#a855f7'},{l:'Total Orders',v:(s.totalOrders||0).toString(),c:'#00d9ff'}]
  return (
    <div><h1 className='text-xl font-bold text-white mb-1'>Revenue Center</h1><p className='text-sm text-white/30 mb-6'>Platform revenue statistics</p>
    <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>{cards.map(function(c,i){return <div key={i} className='bg-[#0A0E1A] border border-white/[0.04] rounded-xl p-5'><div className='flex items-center justify-between mb-3'><span className='text-xs text-white/40'>{c.l}</span><DollarSign size={16} style={{color:c.c}} /></div><div className='text-xl font-bold' style={{color:c.c}}>{c.v}</div></div>})}</div>
    <div className='bg-[#0A0E1A] border border-white/[0.04] rounded-xl p-6'><h2 className='text-white/70 text-sm font-medium mb-4'>Revenue Breakdown</h2><p className='text-white/20 text-sm'>Revenue from deposits, unlocks, and other sources. Detailed transaction history available in Balance Flow.</p></div>
    </div>
  )
}