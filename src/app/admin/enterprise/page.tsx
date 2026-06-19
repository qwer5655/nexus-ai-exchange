'use client'
import { useState, useEffect } from 'react'

export default function EnterprisePage() {
  var [tab, setTab] = useState('customers')
  var [customers, setCustomers] = useState<any[]>([])
  var [permissions, setPermissions] = useState<any[]>([])
  var [logs, setLogs] = useState<any[]>([])
  var [search, setSearch] = useState('')
  var [companyName, setCompanyName] = useState('')
  var [adminId, setAdminId] = useState('')

  useEffect(function() {
    fetch('/api/admin/enterprise/customers').then(function(r){return r.json()}).then(function(d){setCustomers(d.customers||[])}).catch(function(){})
    fetch('/api/admin/enterprise/audit').then(function(r){return r.json()}).then(function(d){setLogs(d.logs||[])}).catch(function(){})
  }, [])

  function loadPermissions(userId?: string) {
    var url = '/api/admin/enterprise/permissions'
    if (userId) url += '?user_id=' + userId
    fetch(url).then(function(r){return r.json()}).then(function(d){setPermissions(d.permissions||[])}).catch(function(){})
  }

  function createCustomer() {
    fetch('/api/admin/enterprise/customers', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({company_name: companyName, admin_user_id: adminId})
    }).then(function(r){return r.json()}).then(function(d){
      if (d.customer) { setCustomers([d.customer].concat(customers)); setCompanyName(''); setAdminId('') }
    }).catch(function(){})
  }

  return (
    <div className='p-6'>
      <h1 className='text-xl font-bold text-white mb-1'>Enterprise Management</h1>
      <p className='text-sm text-white/30 mb-6'>Manage enterprise customers, permissions, and audit logs</p>

      <div className='flex gap-2 mb-6'>
        <button onClick={function(){setTab('customers')}} className={'px-4 py-2 rounded-lg text-sm '+(tab==='customers'?'bg-[#00ff88] text-black':'bg-[#0A0E1A] text-white/60')}>Customers</button>
        <button onClick={function(){setTab('permissions');loadPermissions()}} className={'px-4 py-2 rounded-lg text-sm '+(tab==='permissions'?'bg-[#00ff88] text-black':'bg-[#0A0E1A] text-white/60')}>Permissions</button>
        <button onClick={function(){setTab('audit')}} className={'px-4 py-2 rounded-lg text-sm '+(tab==='audit'?'bg-[#00ff88] text-black':'bg-[#0A0E1A] text-white/60')}>Audit Log</button>
      </div>

      {tab === 'customers' && <div>
        <div className='flex gap-2 mb-4'>
          <input value={companyName} onChange={function(e){setCompanyName(e.target.value)}} placeholder='Company name' className='bg-[#0A0E1A] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white outline-none' />
          <input value={adminId} onChange={function(e){setAdminId(e.target.value)}} placeholder='Admin user ID' className='bg-[#0A0E1A] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white outline-none' />
          <button onClick={createCustomer} className='bg-[#00ff88] text-black px-4 py-2 rounded-lg text-sm font-semibold'>Add</button>
        </div>
        <div className='bg-[#0A0E1A] border border-white/[0.04] rounded-xl overflow-hidden'>
          <table className='w-full text-sm'>
            <thead><tr className='border-b border-white/[0.04] text-white/30 text-xs uppercase'><th className='p-4 text-left'>Company</th><th className='p-4 text-left'>Admin</th><th className='p-4 text-center'>Status</th><th className='p-4 text-right'>Created</th></tr></thead>
            <tbody>{customers.filter(function(c){return!search||c.company_name.includes(search)}).map(function(c,i){return <tr key={i} className='border-b border-white/[0.04]'><td className='p-4 text-white'>{c.company_name}</td><td className='p-4 text-white/60 text-xs'>{c.admin_user_id?.slice(0,8)}...</td><td className='p-4 text-center'><span className={'px-2 py-0.5 rounded text-xs '+(c.status==='active'?'bg-green-500/10 text-green-400':'bg-red-500/10 text-red-400')}>{c.status}</span></td><td className='p-4 text-right text-white/40 text-xs'>{(c.created_at||'').split('T')[0]}</td></tr>})}</tbody>
          </table>
        </div>
      </div>}

      {tab === 'permissions' && <div>
        <div className='bg-[#0A0E1A] border border-white/[0.04] rounded-xl overflow-hidden'>
          <table className='w-full text-sm'>
            <thead><tr className='border-b border-white/[0.04] text-white/30 text-xs uppercase'><th className='p-4 text-left'>User ID</th><th className='p-4 text-left'>Feature</th><th className='p-4 text-center'>Level</th></tr></thead>
            <tbody>{permissions.map(function(p,i){return <tr key={i} className='border-b border-white/[0.04]'><td className='p-4 text-white/60 text-xs'>{p.user_id?.slice(0,8)}...</td><td className='p-4 text-white'>{p.feature}</td><td className='p-4 text-center'><span className={'px-2 py-0.5 rounded text-xs '+(p.level==='admin'?'bg-purple-500/10 text-purple-400':p.level==='write'?'bg-blue-500/10 text-blue-400':'bg-gray-500/10 text-gray-400')}>{p.level}</span></td></tr>})}</tbody>
          </table>
        </div>
      </div>}

      {tab === 'audit' && <div>
        <div className='bg-[#0A0E1A] border border-white/[0.04] rounded-xl overflow-hidden'>
          <table className='w-full text-sm'>
            <thead><tr className='border-b border-white/[0.04] text-white/30 text-xs uppercase'><th className='p-4 text-left'>User</th><th className='p-4 text-left'>Action</th><th className='p-4 text-left'>Resource</th><th className='p-4 text-right'>Time</th></tr></thead>
            <tbody>{logs.map(function(l,i){return <tr key={i} className='border-b border-white/[0.04]'><td className='p-4 text-white/60 text-xs'>{l.user_id?.slice(0,8)}...</td><td className='p-4 text-white'><span className='px-2 py-0.5 rounded text-xs bg-blue-500/10 text-blue-400'>{l.action}</span></td><td className='p-4 text-white/60 text-xs'>{l.resource}</td><td className='p-4 text-right text-white/40 text-xs'>{(l.created_at||'').split('T')[1]?.slice(0,8)}</td></tr>})}</tbody>
          </table>
        </div>
      </div>}
    </div>
  )
}
