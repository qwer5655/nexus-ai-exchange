'use client'
import { useEffect, useState, useRef } from 'react'
import { adminFetch } from '@/lib/admin-fetch'
import { TrendingUp, Users, ShoppingCart, Crown, DollarSign, Activity, ArrowUp, ArrowDown, Loader } from 'lucide-react'

export default function AdminDashboard() {
  var [data, setData] = useState<any>({ loading: true })
  var chartRef1 = useRef<HTMLDivElement>(null); var chartRef2 = useRef<HTMLDivElement>(null); var chartRef3 = useRef<HTMLDivElement>(null)

  useEffect(function() {
    adminFetch('/api/admin/stats').then(function(r) { return r.json() }).then(function(d) {
      setData({ ...d, loading: false })
      setTimeout(function() { renderCharts(d) }, 100)
    })
  }, [])

  function renderCharts(d: any) {
    if (!d.chart || typeof window === 'undefined') return
    try {
      import('echarts').then(function(ech) {
        var dates = d.chart.dates || []; var last7 = dates.slice(-7)
        var last7rev = (d.chart.revenue || []).slice(-7)
        var last30rev = d.chart.revenue || []
        var last30reg = d.chart.registrations || []
        var last30ord = d.chart.orders || []
        var opts = { tooltip: { trigger: 'axis', backgroundColor: '#141C2F', borderColor: 'rgba(255,255,255,0.06)', textStyle: { color: '#fff', fontSize: 11 } }, grid: { left: 40, right: 16, top: 30, bottom: 20 }, xAxis: { type: 'category', data: [], axisLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } }, axisLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 10 } }, yAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(255,255,255,0.03)' } }, axisLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 10 } }, series: [{ type: 'bar', data: [], itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#00ff88' }, { offset: 1, color: '#00ff8820' }] } } }] }
        if (chartRef1.current) { var c1 = ech.init(chartRef1.current); opts.xAxis.data = last7; opts.series[0].data = last7rev; c1.setOption(opts) }
        if (chartRef2.current) { var c2 = ech.init(chartRef2.current); opts.xAxis.data = dates; opts.series[0].data = last30reg; opts.series[0].itemStyle.color = { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#00d9ff' }, { offset: 1, color: '#00d9ff20' }] }; c2.setOption(opts) }
        if (chartRef3.current) { var c3 = ech.init(chartRef3.current); opts.xAxis.data = dates; opts.series[0].data = last30ord; opts.series[0].itemStyle.color = { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#a855f7' }, { offset: 1, color: '#a855f720' }] }; c3.setOption(opts) }
      })
    } catch(e) {}
  }

  if (data.loading) return <div className='flex items-center justify-center h-64'><Loader size={24} className='animate-spin text-white/20' /></div>

  var s = data.stats || {}
  var cards = [
    { label: 'Today Revenue', value: '$' + (s.todayRevenue || 0).toLocaleString(), change: '+' + Math.round((s.todayRevenue || 0) / Math.max(1, (s.todayOrders || 1)) * 100) / 100 + '%', up: true, icon: DollarSign, color: '#00ff88' },
    { label: 'Month Revenue', value: '$' + (s.monthRevenue || 0).toLocaleString(), change: '', up: true, icon: TrendingUp, color: '#ffd700' },
    { label: 'Total Revenue', value: '$' + (s.totalRevenue || 0).toLocaleString(), change: '', up: true, icon: Activity, color: '#a855f7' },
    { label: 'Today Registers', value: (s.todayUsers || 0).toString(), change: '+' + (s.todayUsers || 0) + ' new', up: true, icon: Users, color: '#f97316' },
    { label: 'Total Users', value: (s.totalUsers || 0).toString(), change: s.vipUsers + ' VIP', up: true, icon: Users, color: '#06b6d4' },
    { label: 'Today Orders', value: (s.todayOrders || 0).toString(), change: '+' + (s.todayOrders || 0), up: true, icon: ShoppingCart, color: '#ec4899' },
  ]

  return (
    <div className='p-6 lg:p-8 space-y-5'>
      <div><h1 className='text-xl font-bold text-white'>Dashboard</h1><p className='text-sm text-white/30 mt-1'>Real-time platform operations data</p></div>
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
        {cards.map(function(c) { var Icon = c.icon; return <div className='bg-[#0A0E1A] border border-white/[0.04] rounded-xl p-4'><div className='flex items-center justify-between mb-3'><span className='text-xs text-white/40'>{c.label}</span><div className='w-8 h-8 rounded-lg flex items-center justify-center' style={{backgroundColor: c.color + '15'}}><Icon size={16} style={{color: c.color}} /></div></div><div className='text-lg font-bold text-white mb-1'>{c.value}</div>{c.change && <div className='flex items-center gap-1'><span className='text-xs' style={{color: c.up ? '#00ff88' : '#ef4444'}}>{c.change}</span></div>}</div> })
      }
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
        <div className='bg-[#0A0E1A] border border-white/[0.04] rounded-xl p-4'><div className='flex items-center gap-2 mb-3'><div className='w-2 h-2 rounded-full bg-[#00ff88]' /><h3 className='text-sm font-medium text-white/70'>7 Day Revenue</h3></div><div ref={chartRef1} style={{height:200}} /></div>
        <div className='bg-[#0A0E1A] border border-white/[0.04] rounded-xl p-4'><div className='flex items-center gap-2 mb-3'><div className='w-2 h-2 rounded-full bg-[#00d9ff]' /><h3 className='text-sm font-medium text-white/70'>30 Day Registrations</h3></div><div ref={chartRef2} style={{height:200}} /></div>
        <div className='bg-[#0A0E1A] border border-white/[0.04] rounded-xl p-4'><div className='flex items-center gap-2 mb-3'><div className='w-2 h-2 rounded-full bg-[#a855f7]' /><h3 className='text-sm font-medium text-white/70'>30 Day Orders</h3></div><div ref={chartRef3} style={{height:200}} /></div>
      </div>
    </div>
  )
}