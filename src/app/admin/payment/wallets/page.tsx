'use client'
import { useState, useEffect, useRef } from 'react'
import { Plus, Edit, Trash2, QrCode, Upload, X } from 'lucide-react'

export default function WalletManagement() {
  var [wallets, setWallets] = useState<any[]>([])
  var [loading, setLoading] = useState(true)
  var [refreshing, setRefreshing] = useState(false)
  var [showModal, setShowModal] = useState(false)
  var [editId, setEditId] = useState<string | null>(null)
  var [deleteId, setDeleteId] = useState<string | null>(null)
  var [uploading, setUploading] = useState(false)
  var [enlargeQr, setEnlargeQr] = useState<string | null>(null)
  var fileInputRef = useRef<HTMLInputElement>(null)
  var [form, setForm] = useState({ name: '', currency: 'USDT', network: 'TRC20', address: '', qr_code_url: '', icon_url: '', provider: 'crypto', enabled: true, sort_order: 0, description: '' })

  async function refreshWallets() {
    setRefreshing(true)
    try {
      var res = await fetch('/api/admin/payment/wallets', { cache: 'no-store', headers: { 'x-admin-email': 'benjoka912@gmail.com' } })
      var data = await res.json()
      setWallets(data.wallets || [])
      console.log('Wallets refreshed:', (data.wallets || []).length)
    } catch(e) { console.error('Wallet refresh failed:', e) }
    finally { setLoading(false); setRefreshing(false) }
  }

  useEffect(function() { refreshWallets() }, [])

  function openAdd() { setEditId(null); setForm({ name: '', currency: 'USDT', network: 'TRC20', address: '', qr_code_url: '', icon_url: '', provider: 'crypto', enabled: true, sort_order: 0, description: '' }); setShowModal(true) }

  function openEdit(w: any) {
    setEditId(w.id); setForm({
      name: w.name || '', currency: w.coin || '', network: w.network || '', address: w.address || '',
      qr_code_url: w.qr_code_url || '', icon_url: w.icon_url || '', provider: w.provider || 'crypto', enabled: w.enabled !== false,
      sort_order: w.sort_order || 0, description: w.description || ''
    }); setShowModal(true)
  }

  function handleFileSelect(e: any) {
    var file = e.target.files?.[0]
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) { alert('Only PNG, JPG, WEBP'); return }
    if (file.size > 5 * 1024 * 1024) { alert('Max 5MB'); return }
    setUploading(true)

    var fd = new FormData()
    fd.append('file', file)
    if (editId) fd.append('wallet_id', editId)

    fetch('/api/admin/payment/wallets/upload', {
      method: 'POST', headers: { 'x-admin-email': 'benjoka912@gmail.com' }, body: fd
    }).then(function(r) { return r.json() })
      .then(function(d) { if (d.url) { setForm({ ...form, qr_code_url: d.url }) }; setUploading(false) })
      .catch(function() { setUploading(false) })
  }

  function handleIconSelect(e: any) {
    var file = e.target.files?.[0]
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) { alert('Only PNG, JPG, WEBP'); return }
    if (file.size > 2 * 1024 * 1024) { alert('Max 2MB'); return }
    setUploading(true)
    var fd = new FormData()
    fd.append('file', file)
    if (editId) fd.append('wallet_id', editId)
    fetch('/api/admin/payment/wallets/icon-upload', { method: 'POST', headers: { 'x-admin-email': 'benjoka912@gmail.com' }, body: fd })
      .then(function(r){return r.json()}).then(function(d){if(d.url){refreshWallets()};setUploading(false)}).catch(function(){setUploading(false)})
  }
  function deleteIcon() {
    if (!editId) { setForm({...form}); return }
    fetch('/api/admin/payment/wallets/icon-delete', { method: 'POST', headers: { 'Content-Type':'application/json','x-admin-email':'benjoka912@gmail.com' }, body: JSON.stringify({wallet_id: editId}) })
      .then(function(r){return r.json()}).then(function(){setForm({...form})}).catch(function(){})
  }
  function removeQr() { setForm({ ...form, qr_code_url: '' }) }

  function save() {
    var url = '/api/admin/payment/wallets'; var method = editId ? 'PATCH' : 'POST'
    var body = editId ? { ...form, id: editId } : form
    fetch(url, { method: method, headers: { 'Content-Type': 'application/json', 'x-admin-email': 'benjoka912@gmail.com' }, body: JSON.stringify(body) })
      .then(function(r) { return r.json() }).then(function() { setShowModal(false); refreshWallets() }).catch(function() {})
  }

  function confirmDelete() {
    if (!deleteId) return
    fetch('/api/admin/payment/wallets?id=' + deleteId, { method: 'DELETE', headers: { 'x-admin-email': 'benjoka912@gmail.com' } })
      .then(function(r) { return r.json() }).then(function() { setDeleteId(null); refreshWallets() }).catch(function() {})
  }

  function toggleWallet(w: any) {
    fetch('/api/admin/payment/wallets', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json', 'x-admin-email': 'benjoka912@gmail.com' },
      body: JSON.stringify({ id: w.id, enabled: !w.enabled })
    }).then(function(r) { return r.json() }).then(function() { refreshWallets() }).catch(function() {})
  }

  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-6'>
        <div><h1 className='text-xl font-bold text-white'>Wallet Management</h1><p className='text-sm text-white/30 mt-1'>Manage crypto deposit addresses</p></div>
        <span className='text-xs text-white/20'>{wallets.length} wallets</span>
          <button onClick={openAdd} className='flex items-center gap-2 bg-[#00ff88] text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#00ff88]/90'><Plus size={16}/>Add Wallet</button>
      </div>

      {(loading || refreshing) && <div className='text-white/40 p-8 text-center'>{loading ? 'Loading wallets...' : 'Refreshing...'}</div>}
      {!loading && <div className='bg-[#0A0E1A] border border-white/[0.04] rounded-xl overflow-hidden'>
        <table className='w-full text-sm'>
          <thead><tr className='border-b border-white/[0.04] text-white/30 text-xs uppercase'>
            <th className='p-4 text-left'>Name</th><th className='p-4 text-left'>Coin</th><th className='p-4 text-center'>Icon</th><th className='p-4 text-left'>Network</th>
            <th className='p-4 text-left'>Address</th><th className='p-4 text-center'>QR</th><th className='p-4 text-center'>Status</th>
            <th className='p-4 text-right'>Actions</th>
          </tr></thead>
          <tbody>{wallets.map(function(w: any, i: number) {
            return <tr key={w.id || i} className='border-b border-white/[0.04] hover:bg-white/[0.02]'>
              <td className='p-4 text-white font-semibold'>{w.name || w.coin}</td>
              <td className='p-4 text-white/80'>{w.coin}</td>
              <td className='p-4 text-center'>{w.icon_url ? <img src={w.icon_url + '?t=' + Date.now()} className='w-7 h-7 rounded-full mx-auto object-cover' onClick={function(){setEnlargeQr(w.icon_url)}} title='Click to enlarge'/> : <span className='text-white/20 text-xs'>—</span>}</td>
              <td className='p-4 text-white/60 text-xs'>{w.network || '-'}</td>
              <td className='p-4 font-mono text-xs text-white/40 max-w-[200px] truncate'>{w.address}</td>
              <td className='p-4 text-center'>
                {w.qr_code_url
                  ? <img src={w.qr_code_url + '?t=' + Date.now()} className='w-8 h-8 rounded cursor-pointer mx-auto object-cover' onClick={function() { setEnlargeQr(w.qr_code_url) }} title='Click to enlarge'/>
                  : <span className='text-white/20 text-xs'>—</span>}
              </td>
              <td className='p-4 text-center'>
                <button onClick={function() { toggleWallet(w) }} className={'px-2 py-0.5 rounded text-xs cursor-pointer ' + (w.enabled ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400')}>{w.enabled ? 'Active' : 'Disabled'}</button>
              </td>
              <td className='p-4 text-right'>
                <button onClick={function() { openEdit(w) }} className='text-white/40 hover:text-white mr-3'><Edit size={14}/></button>
                <button onClick={function() { setDeleteId(w.id) }} className='text-red-400/40 hover:text-red-400'><Trash2 size={14}/></button>
              </td>
            </tr>
          })}</tbody>
        </table>
      </div>}

      {showModal && <div className='fixed inset-0 bg-black/60 flex items-center justify-center z-50' onClick={function(e) { if (e.target === e.currentTarget) setShowModal(false) }}>
        <div className='bg-[#0A0E1A] border border-white/[0.08] rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto'>
          <h2 className='text-lg font-bold text-white mb-1'>{editId ? 'Edit Wallet' : 'Add Wallet'}</h2>
          <p className='text-sm text-white/30 mb-5'>{editId ? 'Update wallet details' : 'Add a new deposit address'}</p>
          <div className='space-y-4'>
            <div><label className='text-xs text-white/40 block mb-1'>Name</label><input value={form.name} onChange={function(e){setForm({...form,name:e.target.value})}} className='w-full bg-[#020305] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#00ff88]/40' placeholder='USDT Main Wallet'/></div>
            <div className='grid grid-cols-2 gap-3'>
              <div><label className='text-xs text-white/40 block mb-1'>Currency</label>
                <select value={form.currency} onChange={function(e){setForm({...form,currency:e.target.value})}} className='w-full bg-[#020305] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white outline-none'>
                  <option>BTC</option><option>ETH</option><option>USDT</option><option>USDC</option><option>BNB</option><option>SOL</option>
                </select>
              </div>
              <div><label className='text-xs text-white/40 block mb-1'>Network</label>
                <select value={form.network} onChange={function(e){setForm({...form,network:e.target.value})}} className='w-full bg-[#020305] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white outline-none'>
                  <option>TRC20</option><option>ERC20</option><option>BEP20</option><option>Bitcoin</option><option>Solana</option>
                </select>
              </div>
            </div>
            <div><label className='text-xs text-white/40 block mb-1'>Address</label><input value={form.address} onChange={function(e){setForm({...form,address:e.target.value})}} className='w-full bg-[#020305] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white outline-none font-mono' placeholder='Wallet address'/></div>
            <div><label className='text-xs text-white/40 block mb-1'>QR Code</label>
              <div className='flex items-center gap-3'>
                <input type='file' ref={fileInputRef} accept='image/png,image/jpeg,image/webp' onChange={handleFileSelect} className='hidden'/>
                <button onClick={function(){fileInputRef.current?.click()}} disabled={uploading} className='flex items-center gap-2 bg-[#020305] border border-white/[0.06] rounded-lg px-4 py-2 text-sm text-white/60 hover:text-white'><Upload size={14}/>{uploading?'Uploading...':'Upload Image'}</button>
                {form.qr_code_url && <button onClick={removeQr} className='text-red-400/60 hover:text-red-400 text-xs'>Remove</button>}
              </div>
              {form.qr_code_url && <div className='mt-3 p-2 bg-[#020305] border border-white/[0.06] rounded-lg inline-block'><img src={form.qr_code_url} className='w-24 h-24 rounded object-cover'/></div>}
              {!form.qr_code_url && <p className='text-xs text-white/20 mt-2'>PNG, JPG, WEBP — Max 5MB</p>}
            </div>
            <div className='grid grid-cols-2 gap-3'>
              <div><label className='text-xs text-white/40 block mb-1'>Provider</label>
                <select value={form.provider} onChange={function(e){setForm({...form,provider:e.target.value})}} className='w-full bg-[#020305] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white outline-none'>
                  <option value='crypto'>Crypto</option><option value='manual'>Manual</option><option value='stripe'>Stripe</option><option value='other'>Other</option>
                </select>
              </div>
              <div><label className='text-xs text-white/40 block mb-1'>Sort Order</label><input type='number' value={form.sort_order} onChange={function(e){setForm({...form,sort_order:parseInt(e.target.value)||0})}} className='w-full bg-[#020305] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white outline-none'/></div>
            </div>
            <div><label className='text-xs text-white/40 block mb-1'>Description</label><textarea value={form.description} onChange={function(e){setForm({...form,description:e.target.value})}} className='w-full bg-[#020305] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white outline-none' rows={2}/></div>
            <div className='flex items-center gap-2'><input type='checkbox' checked={form.enabled} onChange={function(e){setForm({...form,enabled:e.target.checked})}} className='accent-[#00ff88]'/><span className='text-sm text-white/60'>Enabled</span></div>
          </div>
          <div className='flex gap-3 mt-6'>
            <button onClick={function(){setShowModal(false)}} className='flex-1 border border-white/[0.08] text-white/60 px-4 py-2.5 rounded-lg text-sm'>Cancel</button>
            <button onClick={save} className='flex-1 bg-[#00ff88] text-black px-4 py-2.5 rounded-lg text-sm font-semibold'>{editId ? 'Update' : 'Create'}</button>
          </div>
        </div>
      </div>}

      {deleteId && <div className='fixed inset-0 bg-black/60 flex items-center justify-center z-50' onClick={function(e){if(e.target===e.currentTarget)setDeleteId(null)}}>
        <div className='bg-[#0A0E1A] border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm mx-4'>
          <h2 className='text-lg font-bold text-white mb-2'>Delete Wallet?</h2>
          <p className='text-sm text-white/40 mb-6'>This will remove the wallet address permanently.</p>
          <div className='flex gap-3'>
            <button onClick={function(){setDeleteId(null)}} className='flex-1 border border-white/[0.08] text-white/60 px-4 py-2.5 rounded-lg text-sm'>Cancel</button>
            <button onClick={confirmDelete} className='flex-1 bg-red-500 text-white px-4 py-2.5 rounded-lg text-sm font-semibold'>Delete</button>
          </div>
        </div>
      </div>}

      {enlargeQr && <div className='fixed inset-0 bg-black/80 flex items-center justify-center z-50' onClick={function(){setEnlargeQr(null)}}>
        <img src={enlargeQr} className='max-w-[400px] max-h-[400px] rounded-2xl'/>
      </div>}
    </div>
  )
}







