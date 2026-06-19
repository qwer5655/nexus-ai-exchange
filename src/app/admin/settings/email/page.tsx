'use client'
import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
export default function EmailSettings() {
  var [form, setForm] = useState<any>({}); var [saved, setSaved] = useState(false)
  useEffect(function() {
    fetch('/api/admin/settings/email', { headers:{'x-admin-email':'benjoka912@gmail.com'} })
      .then(function(r){return r.json()}).then(function(d){if(d.settings)setForm(d.settings)}).catch(function(){})
  }, [])
  function save() {
    fetch('/api/admin/settings/email', { method:'POST', headers:{'Content-Type':'application/json','x-admin-email':'benjoka912@gmail.com'}, body:JSON.stringify(form) })
      .then(function(){setSaved(true);setTimeout(function(){setSaved(false)},2000)}).catch(function(){})
  }
  return <div><h1 className='text-xl font-bold text-white mb-1'>Email Settings</h1><p className='text-sm text-white/30 mb-6'>Configure SMTP</p>
    {saved&&<div className='fixed top-4 right-4 z-50 bg-[#00ff88] text-black px-4 py-2 rounded-lg text-sm'>Saved!</div>}
    <div className='max-w-md space-y-3 bg-[#0A0E1A] border border-white/[0.04] rounded-xl p-5'>
      {['smtp_host','smtp_port','smtp_user','smtp_password','from_email'].map(function(k){return <div key={k}><label className='text-xs text-white/40 uppercase block mb-1'>{k.replace(/_/g,' ')}</label><input value={form[k]||''} onChange={function(e){setForm({...form,[k]:e.target.value})}} className='w-full bg-[#020305] border border-white/[0.06] rounded-lg px-4 py-2 text-sm text-white outline-none'/></div>})}
      <button onClick={save} className='flex items-center gap-2 bg-[#00ff88] text-black px-5 py-2.5 rounded-lg text-sm font-semibold'><Save size={16}/>Save</button>
    </div></div>
}
