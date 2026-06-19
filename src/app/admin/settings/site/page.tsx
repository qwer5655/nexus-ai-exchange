'use client'
import { useState, useEffect } from 'react'
import { adminFetch } from '@/lib/admin-fetch'
import { Save } from 'lucide-react'
export default function SiteSettings() {
  var [form, setForm] = useState<any>({}); var [saved, setSaved] = useState(false)
  useEffect(function() {
    adminFetch('/api/admin/settings/site', { headers:{} })
      .then(function(r){return r.json()}).then(function(d){if(d.settings)setForm(d.settings)}).catch(function(){})
  }, [])
  function save() {
    adminFetch('/api/admin/settings/site', { method:'POST', headers:{'Content-Type':'application/json',}, body:JSON.stringify(form) })
      .then(function(){setSaved(true);setTimeout(function(){setSaved(false)},2000)}).catch(function(){})
  }
  return <div><h1 className='text-xl font-bold text-white mb-1'>Site Settings</h1><p className='text-sm text-white/30 mb-6'>Manage platform configuration</p>
    {saved&&<div className='fixed top-4 right-4 z-50 bg-[#00ff88] text-black px-4 py-2 rounded-lg text-sm'>Settings saved!</div>}
    <div className='max-w-2xl space-y-4'>
      {['site_name','site_desc','contact_email','telegram','twitter','discord'].map(function(field){
        return <div key={field}><label className='text-xs text-white/40 uppercase block mb-1'>{field.replace(/_/g,' ').replace(/\b\w/g,function(s){return s.toUpperCase()})}</label>
        <input value={form[field]||''} onChange={function(e){setForm({...form,[field]:e.target.value})}} className='w-full bg-[#0A0E1A] border border-white/[0.06] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-[#00ff88]/40'/></div>
      })}
      <button onClick={save} className='flex items-center gap-2 bg-[#00ff88] text-black px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#00ff88]/90 transition-all'><Save size={16}/>Save Settings</button>
    </div></div>
}


