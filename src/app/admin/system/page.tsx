'use client'
import { useEffect, useState } from 'react'
import { Server, Clock, Database, Activity, Cpu, Globe } from 'lucide-react'
import { adminFetch } from '@/lib/admin-fetch'

export default function AdminSystem() {
  var [health, setHealth] = useState<any>({ loading: true })

  useEffect(function() {
    adminFetch('/api/health').then(function(r) { return r.json() }).then(function(d) {
      setHealth({ ...d, loading: false })
    })
  }, [])

  if (health.loading) return <div className='text-center py-20'><div className='animate-spin h-8 w-8 border-2 border-[#00ff88] border-t-transparent rounded-full mx-auto'></div></div>

  var cards = [
    { label: 'Server Status', value: health.status === 'ok' ? 'Healthy' : 'Degraded', icon: Server, color: health.status === 'ok' ? '#00ff88' : '#ff6b6b' },
    { label: 'Uptime', value: Math.floor((health.uptime_ms || 0) / 1000) + 's', icon: Clock, color: '#00d9ff' },
    { label: 'Version', value: health.version || '1.0.0', icon: Activity, color: '#a855f7' },
    { label: 'Environment', value: health.environment || 'unknown', icon: Globe, color: '#f97316' },
    { label: 'Supabase', value: health.supabase?.connected ? 'Connected' : 'Disconnected', icon: Database, color: health.supabase?.connected ? '#00ff88' : '#ff6b6b' },
    { label: 'Node Version', value: typeof process !== 'undefined' ? process.version : 'unknown', icon: Cpu, color: '#06b6d4' },
  ]

  return (
    <div>
      <h1 className='text-2xl font-bold text-white mb-1'>System Monitoring</h1>
      <p className='text-sm text-gray-400 mb-6'>Technical infrastructure status and metrics</p>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8'>
        {cards.map(function(c, i) {
          var Icon = c.icon
          return <div key={i} className='bg-[#0a0e1a] rounded-xl border border-white/5 p-5'><div className='flex items-center gap-3 mb-3'><div className='w-10 h-10 rounded-lg flex items-center justify-center' style={{backgroundColor: c.color + '15'}}><Icon size={20} style={{color: c.color}} /></div><span className='text-sm text-gray-400'>{c.label}</span></div><div className='text-lg font-bold' style={{color: c.color}}>{c.value}</div></div>
        })}
      </div>

      <div className='bg-[#0a0e1a] rounded-xl border border-white/5 p-6 mb-8'>
        <h2 className='text-white font-semibold mb-4'>Database Tables</h2>
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3'>
          {(health.database?.tables || []).map(function(t: any, i: number) {
            return <div key={i} className={'flex items-center gap-2 px-3 py-2 rounded-lg text-sm ' + (t.exists ? 'bg-[#00ff88]/10 text-[#00ff88]' : 'bg-red-500/10 text-red-400')}>
              <div className={'w-2 h-2 rounded-full ' + (t.exists ? 'bg-[#00ff88]' : 'bg-red-400')}></div>
              {t.table}
            </div>
          })}
        </div>
      </div>

      <div className='bg-[#0a0e1a] rounded-xl border border-white/5 p-6'>
        <h2 className='text-white font-semibold mb-2'>API Monitoring</h2>
        <p className='text-sm text-gray-400'>Use Uptime Kuma or similar tool to monitor these endpoints every 60 seconds:</p>
        <div className='mt-4 space-y-2'>
          {['/api/health', '/', '/api/auth/me', '/api/opportunities'].map(function(path, i) {
            return <div key={i} className='flex items-center gap-3 px-3 py-2 bg-[#020305] rounded-lg text-sm'><span className='text-[#00ff88] font-mono'>GET</span><span className='text-gray-300 font-mono'>{path}</span></div>
          })}
        </div>
      </div>
    </div>
  )
}
