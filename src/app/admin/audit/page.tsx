'use client'
import { useEffect, useState } from 'react'
import { adminFetch } from '@/lib/admin-fetch'
import { Search, Download, Filter } from 'lucide-react'

export default function AdminAudit() {
  var [type, setType] = useState('audit')
  var [rows, setRows] = useState<any[]>([])
  var [loading, setLoading] = useState(false)

  function load() {
    setLoading(true)
    var days = 30; var since = new Date(Date.now() - days * 86400000).toISOString()
    adminFetch('/api/analytics/export?type=' + type + '&since=' + since).then(function(r) { return r.text() }).then(function(csv) {
      var lines = csv.trim().split('\n')
      if (lines.length < 2) { setRows([]); setLoading(false); return }
      var headers = lines[0].split(',').map(function(h) { return h.replace(/"/g, '') })
      var data = lines.slice(1).map(function(line) {
        var vals = line.match(/"([^"]*)"|[^,]+/g) || []
        var obj: any = {}
        headers.forEach(function(h, i) { obj[h] = (vals[i] || '').replace(/"/g, '') })
        return obj
      })
      setRows(data); setLoading(false)
    })
  }

  useEffect(function() { load() }, [type])

  function exportCSV() {
    var csv = rows.length > 0 ? Object.keys(rows[0]).join(',') + '\n' : ''
    csv += rows.map(function(r) { return Object.values(r).map(function(v: any) { return '"' + String(v || '').replace(/"/g, '""') + '"' }).join(',') }).join('\n')
    var blob = new Blob([csv], { type: 'text/csv' })
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = type + '_export.csv'; a.click()
  }

  var types = ['audit', 'users', 'deposits', 'unlocks']

  return (
    <div>
      <div className='flex items-center justify-between mb-6'>
        <div><h1 className='text-2xl font-bold text-white mb-1'>Audit Query System</h1><p className='text-sm text-gray-400'>Search and export platform audit logs</p></div>
        <button onClick={exportCSV} className='flex items-center gap-2 bg-[#00ff88] text-black px-4 py-2.5 rounded-lg text-sm font-semibold'><Download size={16} /> Export CSV</button>
      </div>

      <div className='flex gap-3 mb-6'>
        {types.map(function(t) {
          return <button key={t} onClick={function() { setType(t) }} className={'px-4 py-2 rounded-lg text-sm font-medium transition-all ' + (type === t ? 'bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/30' : 'bg-white/5 text-gray-400 hover:text-white border border-white/5')}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
        })}
      </div>

      <div className='bg-[#0a0e1a] rounded-xl border border-white/5 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-white/5 text-gray-400 text-xs uppercase tracking-wider'>
                {rows.length > 0 && Object.keys(rows[0]).map(function(h, i) {
                  return <th key={i} className='text-left p-4 font-medium'>{h.replace(/_/g, ' ')}</th>
                })}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 50).map(function(r, i) {
                return <tr key={i} className='border-b border-white/5 hover:bg-white/[0.02]'>
                  {Object.values(r).map(function(v: any, j: number) {
                    return <td key={j} className='p-4 text-gray-300 font-mono text-xs'>{String(v || '').substring(0, 40)}</td>
                  })}
                </tr>
              })}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && !loading && <div className='text-center py-12 text-gray-500 text-sm'>No data found. Select a different data source.</div>}
        {loading && <div className='text-center py-12'><div className='animate-spin h-6 w-6 border-2 border-[#00ff88] border-t-transparent rounded-full mx-auto'></div></div>}
      </div>
    </div>
  )
}
