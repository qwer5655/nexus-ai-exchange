'use client'
import { useState, useEffect } from 'react'
import { adminFetch } from '@/lib/admin-fetch'

export default function BillingDashboard() {
  var [plans, setPlans] = useState<any[]>([])
  var [users, setUsers] = useState<any>({ total: 0, by_plan: {} })
  var [revenue, setRevenue] = useState(0)

  useEffect(function() {
    adminFetch('/api/admin/billing/plans')
      .then(function(r) { return r.json() })
      .then(function(d) { setPlans(d.plans || []); setUsers(d.users || {}); setRevenue(d.revenue?.monthly || 0) })
      .catch(function() {})
  }, [])

  return (
    <div className='p-6'>
      <h1 className='text-xl font-bold text-white mb-1'>Billing Dashboard</h1>
      <p className='text-sm text-white/30 mb-6'>Plan management and revenue overview</p>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
        <div className='bg-[#0A0E1A] border border-white/[0.04] rounded-xl p-5'>
          <div className='text-sm text-white/60'>Total Users</div>
          <div className='text-2xl font-bold text-white mt-1'>{users.total}</div>
        </div>
        <div className='bg-[#0A0E1A] border border-white/[0.04] rounded-xl p-5'>
          <div className='text-sm text-white/60'>Monthly Revenue</div>
          <div className='text-2xl font-bold text-[#00ff88] mt-1'></div>
        </div>
        <div className='bg-[#0A0E1A] border border-white/[0.04] rounded-xl p-5'>
          <div className='text-sm text-white/60'>Plan Distribution</div>
          <div className='text-xs text-white/40 mt-2'>
            {Object.entries(users.by_plan || {}).map(function(e: any) {
              var key = e[0]; var val = e[1]
              return <div key={key} className='flex justify-between py-1'><span>{key}</span><span className='text-white'>{val}</span></div>
            })}
          </div>
        </div>
      </div>
      <div className='bg-[#0A0E1A] border border-white/[0.04] rounded-xl overflow-hidden'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-b border-white/[0.04] text-white/30 text-xs uppercase'>
              <th className='p-4 text-left'>Plan</th>
              <th className='p-4 text-left'>Price</th>
              <th className='p-4 text-left'>Credits</th>
              <th className='p-4 text-left'>Features</th>
              <th className='p-4 text-left'>Limits</th>
            </tr>
          </thead>
          <tbody>
            {plans.map(function(p: any, i: number) {
              return <tr key={i} className='border-b border-white/[0.04]'>
                <td className='p-4 text-white font-semibold'>{p.name}</td>
                <td className='p-4 text-white'><span className='text-white/40'>/mo</span></td>
                <td className='p-4 text-white'>{p.credits}</td>
                <td className='p-4 text-white/60 text-xs'>{JSON.stringify(p.features).slice(0, 60)}</td>
                <td className='p-4 text-white/60 text-xs'>{JSON.stringify(p.limits).slice(0, 60)}</td>
              </tr>
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}


