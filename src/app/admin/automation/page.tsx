'use client'
import { useEffect, useState } from 'react'
import { adminFetch } from '@/lib/admin-fetch'
import { TrendingUp, Zap, Activity, Bell, DollarSign, Users, ChevronUp, ChevronDown } from 'lucide-react'

export default function AutomationPage() {
  var [data, setData] = useState<any>({ loading: true })
  useEffect(function() { adminFetch('/api/admin/automation/optimization').then(function(r) { return r.json() }).then(function(d) { setData({ ...d, loading: false }) }) }, [])

  if (data.loading) return <div className="text-center py-20"><div className="animate-spin h-8 w-8 border-2 border-[#00ff88] border-t-transparent rounded-full mx-auto" /></div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Growth Optimization</h1>
      <p className="text-sm text-gray-400 mb-6">Rule performance analysis and optimization recommendations</p>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#0a0e1a] rounded-xl border border-white/5 p-4 text-center"><Activity size={20} className="text-[#00ff88] mx-auto mb-2" /><div className="text-xl font-bold text-white">{data.summary?.strong_count || 0}</div><div className="text-[10px] text-gray-400">Strong Rules</div></div>
        <div className="bg-[#0a0e1a] rounded-xl border border-white/5 p-4 text-center"><Activity size={20} className="text-[#ffd700] mx-auto mb-2" /><div className="text-xl font-bold text-white">{data.summary?.good_count || 0}</div><div className="text-[10px] text-gray-400">Good Rules</div></div>
        <div className="bg-[#0a0e1a] rounded-xl border border-white/5 p-4 text-center"><Activity size={20} className="text-[#ff4d4f] mx-auto mb-2" /><div className="text-xl font-bold text-white">{data.summary?.weak_count || 0}</div><div className="text-[10px] text-gray-400">Weak Rules</div></div>
        <div className="bg-[#0a0e1a] rounded-xl border border-white/5 p-4 text-center"><Zap size={20} className="text-[#00d9ff] mx-auto mb-2" /><div className="text-xl font-bold text-white truncate">{data.top_performing || '-'}</div><div className="text-[10px] text-gray-400">Top Rule</div></div>
      </div>

      <div className="bg-[#0a0e1a] rounded-xl border border-white/5 overflow-hidden mb-8">
        <div className="p-4 border-b border-white/[0.04]"><h2 className="text-white font-semibold text-sm">Rule Performance Ranking</h2></div>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/[0.04] text-white/30 text-xs uppercase"><th className="p-3 text-left">Rule</th><th className="p-3 text-right">Score</th><th className="p-3 text-center">Status</th><th className="p-3 text-right">Rate</th><th className="p-3 text-right">Revenue</th><th className="p-3 text-left">Recommendation</th></tr></thead>
          <tbody>{(data.rules || []).map(function(r: any, i: number) {
            var statusColor = r.status === 'strong' ? 'text-green-400 bg-green-500/10' : r.status === 'good' ? 'text-yellow-400 bg-yellow-500/10' : 'text-red-400 bg-red-500/10'
            return <tr key={i} className="border-b border-white/[0.04]">
              <td className="p-3 text-white">{r.name}</td>
              <td className="p-3 text-right">
                <div className="flex items-center justify-end gap-1">{r.score > 50 ? <ChevronUp size={14} className="text-green-400" /> : <ChevronDown size={14} className="text-red-400" />}<span className="font-mono">{r.score}</span></div>
              </td>
              <td className="p-3 text-center"><span className={"text-[10px] px-2 py-0.5 rounded-full " + statusColor}>{r.status}</span></td>
              <td className="p-3 text-right font-mono">{r.conversion_rate}%</td>
              <td className="p-3 text-right font-mono text-white/80">${(r.revenue_impact || 0).toLocaleString()}</td>
              <td className="p-3 text-white/60 text-xs">{r.recommendation}</td>
            </tr>
          })}</tbody>
        </table>
      </div>
    </div>
  )
}
