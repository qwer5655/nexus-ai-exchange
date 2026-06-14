'use client'
import { useEffect, useState } from 'react'
import { adminFetch } from '@/lib/admin-fetch'
import { TrendingUp, Users, Banknote, Target, Activity, UserCheck, UserX } from 'lucide-react'

export default function AdminAnalytics() {
  var [data, setData] = useState<any>({ loading: true })

  useEffect(function() {
    adminFetch('/api/admin/analytics/overview').then(function(r) { return r.json() }).then(function(d) {
      setData({ ...d, loading: false })
    })
  }, [])

  if (data.loading) return <div className='text-center py-20'><div className='animate-spin h-8 w-8 border-2 border-[#00ff88] border-t-transparent rounded-full mx-auto'></div></div>

  var u = data.users || {}
  var r = data.revenue || {}
  var f = data.funnels || {}

  return (
    <div>
      <h1 className='text-2xl font-bold text-white mb-1'>Analytics Dashboard</h1>
      <p className='text-sm text-gray-400 mb-6'>Platform metrics and user behavior data</p>

      {/* KPI Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
        <div className='bg-[#0a0e1a] rounded-xl border border-white/5 p-5'>
          <div className='flex items-center gap-3 mb-3'><div className='w-10 h-10 rounded-lg flex items-center justify-center' style={{backgroundColor: '#00ff8815'}}><Users size={20} style={{color: '#00ff88'}} /></div><span className='text-sm text-gray-400'>Total Users</span></div>
          <div className='text-2xl font-bold text-white'>{u.total || 0}</div>
          <div className='text-xs text-gray-500 mt-1'>{u.active || 0} active / {u.dormant || 0} dormant</div>
        </div>
        <div className='bg-[#0a0e1a] rounded-xl border border-white/5 p-5'>
          <div className='flex items-center gap-3 mb-3'><div className='w-10 h-10 rounded-lg flex items-center justify-center' style={{backgroundColor: '#ffd70015'}}><Banknote size={20} style={{color: '#ffd700'}} /></div><span className='text-sm text-gray-400'>Revenue</span></div>
          <div className='text-2xl font-bold text-white'>${(r.net || 0).toLocaleString()}</div>
          <div className='text-xs text-gray-500 mt-1'>Deposit: ${(r.deposit || 0).toLocaleString()} | Unlock: ${(r.unlock || 0).toLocaleString()}</div>
        </div>
        <div className='bg-[#0a0e1a] rounded-xl border border-white/5 p-5'>
          <div className='flex items-center gap-3 mb-3'><div className='w-10 h-10 rounded-lg flex items-center justify-center' style={{backgroundColor: '#a855f715'}}><Target size={20} style={{color: '#a855f7'}} /></div><span className='text-sm text-gray-400'>Commission Cost</span></div>
          <div className='text-2xl font-bold text-white'>${(r.commission_cost || 0).toLocaleString()}</div>
          <div className='text-xs text-gray-500 mt-1'>{u.referred || 0} referred users</div>
        </div>
        <div className='bg-[#0a0e1a] rounded-xl border border-white/5 p-5'>
          <div className='flex items-center gap-3 mb-3'><div className='w-10 h-10 rounded-lg flex items-center justify-center' style={{backgroundColor: '#00d9ff15'}}><TrendingUp size={20} style={{color: '#00d9ff'}} /></div><span className='text-sm text-gray-400'>Conversion</span></div>
          <div className='text-2xl font-bold text-white'>{f.register_to_deposit_rate || 0}%</div>
          <div className='text-xs text-gray-500 mt-1'>Register → Deposit rate</div>
        </div>
      </div>

      {/* Funnel */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
        <div className='bg-[#0a0e1a] rounded-xl border border-white/5 p-6'>
          <h2 className='text-white font-semibold mb-4'>Conversion Funnel</h2>
          {[
            { label: 'Registered', pct: 100, color: '#00ff88' },
            { label: 'First Login', pct: Math.min(100, Math.round((u.total > 0 ? (u.total - u.dormant) / u.total * 100 : 0) * 100) / 100), color: '#00d9ff' },
            { label: 'First Deposit', pct: f.register_to_deposit_rate, color: '#ffd700' },
            { label: 'Referred Users', pct: f.invite_to_signup_rate, color: '#a855f7' },
          ].map(function(step, i) {
            return <div key={i} className='flex items-center gap-4 mb-3'>
              <span className='text-sm text-gray-400 w-28'>{step.label}</span>
              <div className='flex-1 h-6 bg-[#020305] rounded-full overflow-hidden'>
                <div className='h-full rounded-full transition-all duration-500' style={{width: step.pct + '%', backgroundColor: step.color}}></div>
              </div>
              <span className='text-sm text-white font-mono w-16 text-right'>{step.pct}%</span>
            </div>
          })}
        </div>

        {/* Revenue Breakdown */}
        <div className='bg-[#0a0e1a] rounded-xl border border-white/5 p-6'>
          <h2 className='text-white font-semibold mb-4'>Revenue Breakdown</h2>
          {[
            { label: 'Deposit Revenue', value: r.deposit || 0, color: '#00ff88' },
            { label: 'Unlock Revenue', value: r.unlock || 0, color: '#00d9ff' },
            { label: 'Commission Cost', value: -(r.commission_cost || 0), color: '#ff4d4f' },
            { label: 'Net Revenue', value: r.net || 0, color: '#ffd700' },
          ].map(function(item, i) {
            var maxVal = Math.max(r.deposit || 0, r.unlock || 0, Math.abs(r.commission_cost || 0), r.net || 0, 1)
            var pct = Math.round(Math.abs(item.value) / maxVal * 100)
            return <div key={i} className='flex items-center gap-4 mb-3'>
              <span className='text-sm text-gray-400 w-32'>{item.label}</span>
              <div className='flex-1 h-6 bg-[#020305] rounded-full overflow-hidden'>
                <div className='h-full rounded-full transition-all duration-500' style={{width: pct + '%', backgroundColor: item.color}}></div>
              </div>
              <span className={'text-sm font-mono w-24 text-right ' + (item.value < 0 ? 'text-red-400' : 'text-white')}>${Math.abs(item.value).toLocaleString()}</span>
            </div>
          })}
        </div>
      </div>

      {/* User Segmentation */}
      <div className='bg-[#0a0e1a] rounded-xl border border-white/5 p-6'>
        <h2 className='text-white font-semibold mb-4'>User Segmentation</h2>
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
          <div className='bg-white/5 rounded-xl p-4 text-center'>
            <UserCheck size={24} className='text-[#00ff88] mx-auto mb-2' />
            <div className='text-2xl font-bold text-white'>{u.active || 0}</div>
            <div className='text-xs text-gray-400 mt-1'>Active Users</div>
            <div className='text-[10px] text-gray-500'>{u.total > 0 ? Math.round(u.active / u.total * 100) : 0}% of total</div>
          </div>
          <div className='bg-white/5 rounded-xl p-4 text-center'>
            <UserX size={24} className='text-[#ff4d4f] mx-auto mb-2' />
            <div className='text-2xl font-bold text-white'>{u.dormant || 0}</div>
            <div className='text-xs text-gray-400 mt-1'>Dormant Users</div>
            <div className='text-[10px] text-gray-500'>{u.total > 0 ? Math.round(u.dormant / u.total * 100) : 0}% of total</div>
          </div>
          <div className='bg-white/5 rounded-xl p-4 text-center'>
            <Activity size={24} className='text-[#a855f7] mx-auto mb-2' />
            <div className='text-2xl font-bold text-white'>{u.referred || 0}</div>
            <div className='text-xs text-gray-400 mt-1'>Referred Users</div>
            <div className='text-[10px] text-gray-500'>{f.invite_to_signup_rate}% invite rate</div>
          </div>
        </div>
      </div>
    </div>
  )
}
