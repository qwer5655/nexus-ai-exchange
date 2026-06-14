'use client'
import { useEffect, useState } from 'react'
import { adminFetch } from '@/lib/admin-fetch'
import { AlertTriangle, Shield, Ban, Activity } from 'lucide-react'

export default function AdminRisk() {
  var [events, setEvents] = useState<any[]>([])
  var [loading, setLoading] = useState(true)

  useEffect(function() {
    adminFetch('/api/analytics/stats?days=7').then(function(r) { return r.json() }).then(function(d) {
      setEvents([]); setLoading(false)
    })
  }, [])

  return (
    <div>
      <h1 className='text-2xl font-bold text-white mb-1'>Risk Control Center</h1>
      <p className='text-sm text-gray-400 mb-6'>Monitor suspicious activity and platform security</p>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
        <div className='bg-[#0a0e1a] rounded-xl border border-yellow-500/20 p-5'>
          <div className='flex items-center gap-3 mb-2'><AlertTriangle size={18} className='text-yellow-400' /><h3 className='text-white font-medium'>Rate Limit Hits</h3></div>
          <p className='text-2xl font-bold text-yellow-400'>0</p>
          <p className='text-xs text-gray-500 mt-1'>Last 24 hours (via middleware)</p>
        </div>
        <div className='bg-[#0a0e1a] rounded-xl border border-red-500/20 p-5'>
          <div className='flex items-center gap-3 mb-2'><Ban size={18} className='text-red-400' /><h3 className='text-white font-medium'>Blocked Requests</h3></div>
          <p className='text-2xl font-bold text-red-400'>0</p>
          <p className='text-xs text-gray-500 mt-1'>429 responses served</p>
        </div>
        <div className='bg-[#0a0e1a] rounded-xl border border-[#00d9ff]/20 p-5'>
          <div className='flex items-center gap-3 mb-2'><Shield size={18} className='text-[#00d9ff]' /><h3 className='text-white font-medium'>Active Alerts</h3></div>
          <p className='text-2xl font-bold text-[#00d9ff]'>0</p>
          <p className='text-xs text-gray-500 mt-1'>Requires analytics_events data</p>
        </div>
      </div>

      <div className='bg-[#0a0e1a] rounded-xl border border-white/5 p-6'>
        <h2 className='text-white font-semibold mb-4'>Risk Monitoring</h2>
        <p className='text-gray-400 text-sm'>Risk alerts and suspicious activity monitoring require analytics_events table to be populated with real user data. Once events are collected, this dashboard will display:</p>
        <ul className='mt-4 space-y-2 text-sm text-gray-400'>
          <li className='flex items-center gap-2'><Activity size={14} className='text-gray-500' /> Duplicate IP registrations</li>
          <li className='flex items-center gap-2'><Activity size={14} className='text-gray-500' /> High-frequency login attempts</li>
          <li className='flex items-center gap-2'><Activity size={14} className='text-gray-500' /> High-frequency unlock operations</li>
          <li className='flex items-center gap-2'><Activity size={14} className='text-gray-500' /> High-frequency deposit submissions</li>
          <li className='flex items-center gap-2'><Activity size={14} className='text-gray-500' /> Admin action ranking</li>
        </ul>
      </div>
    </div>
  )
}
