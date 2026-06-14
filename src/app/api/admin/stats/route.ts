import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: Request) {
  var auth = await verifyAdmin(req)
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    var today = new Date().toISOString().split('T')[0]
    var yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    var monthStart = today.substring(0, 7)
    var thirtyDaysAgo = new Date(Date.now() - 29 * 86400000).toISOString().split('T')[0]

    // Generate 30 dates for chart
    var thirtyDays = []
    for (var i = 29; i >= 0; i--) {
      thirtyDays.push(new Date(Date.now() - i * 86400000).toISOString().split('T')[0])
    }

    // Run ALL queries in parallel
    var [qTotalUsers, qTodayReg, qYesterdayReg, qVipUsers, qTotalOrders, qTodayOrders,
         qTotalRev, qTodayRev, qMonthRev,
         qRecentProfiles, qRecentDepositsAmt, qRecentOrders,
         qRecentDeposits, qRecentUnlocks] = await Promise.all([
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', today),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', yesterday).lt('created_at', today),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).gt('vip_level', 0),
      supabaseAdmin.from('deposits').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('deposits').select('*', { count: 'exact', head: true }).gte('created_at', today),
      supabaseAdmin.from('deposits').select('amount').eq('status', 'approved'),
      supabaseAdmin.from('deposits').select('amount').eq('status', 'approved').gte('created_at', today),
      supabaseAdmin.from('deposits').select('amount').eq('status', 'approved').gte('created_at', today.substring(0,7) + '-01'),
      supabaseAdmin.from('profiles').select('created_at').gte('created_at', thirtyDaysAgo),
      supabaseAdmin.from('deposits').select('amount, created_at').eq('status', 'approved').gte('created_at', thirtyDaysAgo),
      supabaseAdmin.from('deposits').select('created_at').gte('created_at', thirtyDaysAgo),
      supabaseAdmin.from('deposits').select('id, user_id, amount, coin, status, created_at, profiles!inner(username, email)').order('created_at', { ascending: false }).limit(5),
      supabaseAdmin.from('unlocks').select('id, user_id, unlock_price, created_at, profiles!inner(username)').order('created_at', { ascending: false }).limit(5),
    ])

    // Calculate aggregates
    var totalRevenue = (qTotalRev.data || []).reduce(function(s, d) { return s + (d.amount || 0) }, 0)
    var todayRevenue = (qTodayRev.data || []).reduce(function(s, d) { return s + (d.amount || 0) }, 0)
    var monthRevenue = (qMonthRev.data || []).reduce(function(s, d) { return s + (d.amount || 0) }, 0)

    // Build daily trends from bulk data (JS-side grouping, O(n))
    var profilesByDay = {}
    var revByDay = {}
    var ordersByDay = {}
    ;(qRecentProfiles.data || []).forEach(function(p) {
      var day = (p.created_at || '').split('T')[0]
      profilesByDay[day] = (profilesByDay[day] || 0) + 1
    })
    ;(qRecentDepositsAmt.data || []).forEach(function(d) {
      var day = (d.created_at || '').split('T')[0]
      revByDay[day] = (revByDay[day] || 0) + (d.amount || 0)
    })
    ;(qRecentOrders.data || []).forEach(function(o) {
      var day = (o.created_at || '').split('T')[0]
      ordersByDay[day] = (ordersByDay[day] || 0) + 1
    })

    var dailyRevenue = thirtyDays.map(function(day) { return revByDay[day] || 0 })
    var dailyRegistrations = thirtyDays.map(function(day) { return profilesByDay[day] || 0 })
    var dailyOrders = thirtyDays.map(function(day) { return ordersByDay[day] || 0 })

    return NextResponse.json({
      stats: {
        totalUsers: qTotalUsers.count || 0,
        todayUsers: qTodayReg.count || 0,
        yesterdayUsers: qYesterdayReg.count || 0,
        vipUsers: qVipUsers.count || 0,
        todayOrders: qTodayOrders.count || 0,
        totalOrders: qTotalOrders.count || 0,
        todayRevenue: Math.round(todayRevenue * 100) / 100,
        monthRevenue: Math.round(monthRevenue * 100) / 100,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
      },
      chart: { dates: thirtyDays, revenue: dailyRevenue, registrations: dailyRegistrations, orders: dailyOrders },
      recent: { deposits: qRecentDeposits.data || [], unlocks: qRecentUnlocks.data || [] },
    })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}
