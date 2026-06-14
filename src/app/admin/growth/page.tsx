'use client'
import { useEffect, useState } from 'react'
import { adminFetch } from '@/lib/admin-fetch'
import { TrendingUp, Users, Calendar, BarChart3, Globe, Activity } from 'lucide-react'

export default function AdminGrowth() {
  var [growth, setGrowth] = useState<any>({ loading: true })
  var [retention, setRetention] = useState<any>({ loading: true })
  var [cohorts, setCohorts] = useState<any[]>([])

  useEffect(function() {
    adminFetch('/api/analytics/growth?days=90').then(function(r) { return r.json() }).then(function(d) { setGrowth({ ...d, loading: false }) })
    adminFetch('/api/analytics/retention').then(function(r) { return r.json() }).then(function(d) { setRetention({ ...d, loading: false }) })
    adminFetch('/api/analytics/cohort').then(function(r) { return r.json() }).then(function(d) { setCohorts(d.cohorts || []) })
  }, [])

  var maxReg = Math.max(1, ...(growth.daily_registrations || []).map(function(d: any) { return d.count }))

  return (
    <div>
      <h1 className='text-2xl font-bold text-white mb-1'>Growth Analytics</h1>
      <p className='text-sm text-gray-400 mb-6'>User growth, retention, and acquisition metrics</p>

      {/* Retention Cards */}
      {!retention.loading && <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8'>
        {(retention.retention || []).map(function(r: any, i: number) {
          var color = r.rate >= 50 ? '#00ff88' : r.rate >= 20 ? '#ffd700' : '#ff6b6b'
          return <div key={i} className='bg-[#0a0e1a] rounded-xl border border-white/5 p-5 text-center'>
            <div className='text-sm text-gray-400 mb-1'>{r.period} Retention</div>
            <div className='text-3xl font-bold mb-1' style={{color}}>{r.rate}%</div>
            <div className='text-xs text-gray-500'>{r.retained} / {r.cohort_size} users</div>
          </div>
        })}
      </div>}

      {/* Cards row */}
      {!growth.loading && <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
        <div className='bg-[#0a0e1a] rounded-xl border border-white/5 p-5'><div className='flex items-center gap-3 mb-2'><Users size={18} className='text-[#00ff88]' /><span className='text-sm text-gray-400'>Total (90d)</span></div><div className='text-2xl font-bold text-white'>{growth.total_registrations || 0}</div></div>
        <div className='bg-[#0a0e1a] rounded-xl border border-white/5 p-5'><div className='flex items-center gap-3 mb-2'><Activity size={18} className='text-[#00d9ff]' /><span className='text-sm text-gray-400'>D1 Retention</span></div><div className='text-2xl font-bold text-[#00d9ff]'>{!retention.loading ? ((retention.retention || [])[0]?.rate || 0) + '%' : '...'}</div></div>
        <div className='bg-[#0a0e1a] rounded-xl border border-white/5 p-5'><div className='flex items-center gap-3 mb-2'><Calendar size={18} className='text-[#ffd700]' /><span className='text-sm text-gray-400'>D7 Retention</span></div><div className='text-2xl font-bold text-[#ffd700]'>{!retention.loading ? ((retention.retention || [])[1]?.rate || 0) + '%' : '...'}</div></div>
        <div className='bg-[#0a0e1a] rounded-xl border border-white/5 p-5'><div className='flex items-center gap-3 mb-2'><BarChart3 size={18} className='text-[#a855f7]' /><span className='text-sm text-gray-400'>D30 Retention</span></div><div className='text-2xl font-bold text-[#a855f7]'>{!retention.loading ? ((retention.retention || [])[2]?.rate || 0) + '%' : '...'}</div></div>
      </div>}

      {/* Registration Trend */}
      <div className='bg-[#0a0e1a] rounded-xl border border-white/5 p-6 mb-8'>
        <h2 className='text-white font-semibold mb-4'>Daily Registrations (90 days)</h2>
        <div className='flex items-end gap-0.5 h-32 overflow-x-auto'>
          {(growth.daily_registrations || []).slice(-90).map(function(d: any, i: number) {
            var h = Math.max(4, (d.count / maxReg) * 120)
            return <div key={i} className='flex-shrink-0 w-3 bg-[#00ff88]/30 hover:bg-[#00ff88]/60 rounded-t transition-all relative group' style={{height: h + 'px'}} title={d.date + ': ' + d.count}><div className='absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-gray-400 whitespace-nowrap opacity-0 group-hover:opacity-100'>{d.count}</div></div>
          })}
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
        {/* Acquisition Sources */}
        <div className='bg-[#0a0e1a] rounded-xl border border-white/5 p-6'>
          <h2 className='text-white font-semibold mb-4'>Acquisition Sources</h2>
          {!growth.loading && (growth.acquisition_sources || []).length === 0 && <p className='text-gray-500 text-sm'>No source data yet. UTM tracking will populate after user events are collected.</p>}
          {(growth.acquisition_sources || []).map(function(s: any, i: number) {
            var total = (growth.acquisition_sources || []).reduce(function(a: number, s2: any) { return a + s2.count }, 0) || 1
            var pct = Math.round(s.count / total * 100)
            var colors = ['#00ff88', '#00d9ff', '#ffd700', '#a855f7', '#f97316']
            return <div key={i} className='flex items-center gap-3 mb-2'><span className='text-sm text-gray-300 w-24'>{s.source}</span><div className='flex-1 h-5 bg-[#020305] rounded-full overflow-hidden'><div className='h-full rounded-full transition-all' style={{width: pct + '%', backgroundColor: colors[i % colors.length]}}></div></div><span className='text-sm text-white font-mono w-16 text-right'>{s.count}</span></div>
          })}
        </div>

        {/* Cohort Table */}
        <div className='bg-[#0a0e1a] rounded-xl border border-white/5 p-6 overflow-x-auto'>
          <h2 className='text-white font-semibold mb-4'>Weekly Cohort Analysis</h2>
          {cohorts.length === 0 && <p className='text-gray-500 text-sm'>Cohort data requires analytics_events table with user activity.</p>}
          {cohorts.length > 0 && <table className='w-full text-sm'><thead><tr className='text-gray-400 text-xs uppercase'>
            <th className='text-left p-2 font-medium'>Cohort</th><th className='text-right p-2 font-medium'>Users</th>
            {Array.from({length: 12}, function(_, i) { return <th key={i} className='text-right p-2 font-medium w-10'>W{i}</th> })}
          </tr></thead><tbody>
          {cohorts.map(function(c: any, i: number) {
            return <tr key={i} className='border-b border-white/5'><td className='p-2 text-white font-medium'>{c.week}</td><td className='p-2 text-right text-gray-300'>{c.registered}</td>
              {Array.from({length: 12}, function(_, j) {
                var v = c['w' + j] || 0; var pct = c.registered > 0 ? Math.round(v / c.registered * 100) : 0
                var color = pct >= 50 ? '#00ff88' : pct >= 20 ? '#ffd700' : pct > 0 ? '#ff6b6b' : '#1a1a2e'
                return <td key={j} className='p-2 text-right' style={{backgroundColor: color + '20'}}><span className='text-xs' style={{color}}>{pct > 0 ? pct + '%' : '-'}</span></td>
              })}
            </tr>
          })}
          </tbody></table>}
        </div>
      </div>
    </div>
  )
}
