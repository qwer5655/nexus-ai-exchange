'use client'
import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react'
import { adminFetch } from '@/lib/admin-fetch'

export default function AdminOpps() {
  var [opps, setOpps] = useState<any[]>([])
  var [loading, setLoading] = useState(true)
  var [toast, setToast] = useState('')
  var [showForm, setShowForm] = useState(false)
  var [form, setForm] = useState<any>({})
  function showToast(m: string) { setToast(m); setTimeout(function() { setToast('') }, 2000) }
  function load() { adminFetch('/api/admin/opportunities').then(function(r) { return r.json() }).then(function(d) { setOpps(d.opportunities || []); setLoading(false) }) }
  useEffect(function() { load() }, [])

  function save() {
    var m = form.id ? 'PUT' : 'POST'
    var b: any = {}
    if (form.id) b.id = form.id
    b.title = form.title; b.match_name = form.match_name; b.league = form.league
    b.roi = parseFloat(form.roi) || 0; b.confidence = parseInt(form.confidence) || 85
    b.risk_level = form.risk_level || 'medium'; b.required_capital = parseFloat(form.required_capital) || 0
    b.status = form.status || 'published'
    adminFetch('/api/admin/opportunities', { method: m, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) })
      .then(function(r) { return r.json() }).then(function(d) { if (d.error) { showToast(d.error); return }; showToast(form.id ? 'Updated!' : 'Created!'); setShowForm(false); setForm({}); load() })
  }
  function del(id: string) { adminFetch('/api/admin/opportunities', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }).then(function(r) { return r.json() }).then(function(d) { if (d.error) { showToast(d.error); return }; showToast('Deleted'); load() }) }
  function toggleStatus(o: any) { var ns = o.status === 'published' ? 'hidden' : 'published'; adminFetch('/api/admin/opportunities', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: o.id, status: ns }) }).then(function(r) { return r.json() }).then(function(d) { if (d.error) { showToast(d.error); return }; showToast('Status: ' + ns); load() }) }

  function FormField(props: { label: string; field: string; type?: string }) {
    if (props.type === 'select') {
      var opts = props.field === 'risk_level' ? ['low','medium','high'] : ['published','draft','hidden']
      return <div className='mb-3'><label className='text-xs text-gray-400 uppercase mb-1 block'>{props.label}</label><select value={form[props.field] || opts[0]} onChange={function(e) { setForm({...form, [props.field]: e.target.value }) }} className='w-full bg-[#020305] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white'>{opts.map(function(o) { return <option key={o} value={o}>{o}</option> })}</select></div>
    }
    return <div className='mb-3'><label className='text-xs text-gray-400 uppercase mb-1 block'>{props.label}</label><input value={form[props.field] || ''} onChange={function(e) { setForm({...form, [props.field]: e.target.value }) }} className='w-full bg-[#020305] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white' /></div>
  }

  return (
    <div>
      {toast && <div className='fixed top-4 right-4 z-50 bg-[#00ff88] text-black px-4 py-2 rounded-lg text-sm font-medium shadow-lg'>{toast}</div>}
      <div className='flex items-center justify-between mb-6'>
        <div><h1 className='text-2xl font-bold text-white mb-1'>Opportunity Management</h1><p className='text-sm text-gray-400'>Create, edit, and manage trading opportunities</p></div>
        <button onClick={function() { setForm({}); setShowForm(true) }} className='flex items-center gap-2 bg-[#00ff88] text-black px-4 py-2.5 rounded-lg text-sm font-semibold'><Plus size={16} /> New</button>
      </div>
      <div className='bg-[#0a0e1a] rounded-xl border border-white/5 overflow-hidden'>
        <div className='overflow-x-auto'><table className='w-full text-sm'><thead><tr className='border-b border-white/5 text-gray-400 text-xs uppercase tracking-wider'>
          <th className='text-left p-4 font-medium'>Title</th><th className='text-left p-4 font-medium'>League</th>
          <th className='text-right p-4 font-medium'>ROI</th><th className='text-center p-4 font-medium'>Risk</th><th className='text-center p-4 font-medium'>Status</th><th className='text-right p-4 font-medium'>Actions</th>
        </tr></thead><tbody>
        {opps.map(function(o: any) {
          return <tr key={o.id} className='border-b border-white/5 hover:bg-white/[0.02]'>
            <td className='p-4'><span className='text-white font-medium'>{o.title}</span></td>
            <td className='p-4 text-gray-400'>{o.league}</td>
            <td className='p-4 text-right'><span className='text-[#00ff88] font-mono font-semibold'>{o.roi}%</span></td>
            <td className='p-4 text-center'><span className={'px-2 py-0.5 rounded text-xs ' + (o.risk_level === 'low' ? 'bg-green-500/10 text-green-400' : o.risk_level === 'medium' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400')}>{o.risk_level}</span></td>
            <td className='p-4 text-center'><span className={'px-2 py-0.5 rounded text-xs ' + (o.status === 'published' ? 'bg-[#00ff88]/10 text-[#00ff88]' : 'bg-white/5 text-gray-400')}>{o.status}</span></td>
            <td className='p-4 text-right'><div className='flex items-center justify-end gap-2'>
              <button onClick={function() { setForm(o); setShowForm(true) }} className='p-1.5 rounded text-gray-400 hover:text-[#00d9ff]'><Edit2 size={14} /></button>
              <button onClick={function() { toggleStatus(o) }} className='p-1.5 rounded text-gray-400 hover:text-yellow-400'>{o.status === 'published' ? <EyeOff size={14} /> : <Eye size={14} />}</button>
              <button onClick={function() { if (confirm('Delete?')) del(o.id) }} className='p-1.5 rounded text-gray-400 hover:text-red-400'><Trash2 size={14} /></button>
            </div></td></tr>
        })}
        </tbody></table></div>
        {opps.length === 0 && !loading && <div className='text-center py-12 text-gray-500 text-sm'>No opportunities yet</div>}
        {loading && <div className='text-center py-12'><div className='animate-spin h-6 w-6 border-2 border-[#00ff88] border-t-transparent rounded-full mx-auto'></div></div>}
      </div>
      {showForm && <div className='fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4' onClick={function(e) { if (e.target === e.currentTarget) setShowForm(false) }}>
        <div className='bg-[#0a0e1a] rounded-xl border border-white/10 p-6 w-full max-w-lg'>
          <h3 className='text-white font-semibold mb-4'>{form.id ? 'Edit' : 'New'} Opportunity</h3>
          <FormField label='Title' field='title' />
          <FormField label='Match' field='match_name' />
          <FormField label='League' field='league' />
          <FormField label='ROI %' field='roi' />
          <FormField label='Confidence %' field='confidence' />
          <FormField label='Risk Level' field='risk_level' type='select' />
          <FormField label='Required Capital' field='required_capital' />
          <FormField label='Status' field='status' type='select' />
          <div className='flex gap-3 mt-6'>
            <button onClick={function() { setShowForm(false) }} className='flex-1 bg-white/5 text-gray-300 px-4 py-2.5 rounded-lg text-sm'>Cancel</button>
            <button onClick={save} className='flex-1 bg-[#00ff88] text-black px-4 py-2.5 rounded-lg text-sm font-semibold'>{form.id ? 'Update' : 'Create'}</button>
          </div>
        </div>
      </div>}
    </div>
  )
}
