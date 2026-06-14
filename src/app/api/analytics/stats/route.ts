import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: Request) {
  try {
    var url = new URL(req.url)
    var days = parseInt(url.searchParams.get('days') || '30')
    var since = new Date(Date.now() - days * 86400000).toISOString()

    // Timeline of events
    var { data: events } = await supabaseAdmin.from('analytics_events')
      .select('event_name, created_at').gte('created_at', since).order('created_at', { ascending: false })

    // Registration stats (from profiles)
    var { data: users } = await supabaseAdmin.from('profiles')
      .select('created_at').gte('created_at', since).order('created_at', { ascending: false })

    // Deposit stats
    var { data: deposits } = await supabaseAdmin.from('deposits')
      .select('status, created_at, amount').gte('created_at', since)

    // Unlock stats
    var { data: unlocks } = await supabaseAdmin.from('unlocks')
      .select('created_at, unlock_price').gte('created_at', since)

    // Referral stats
    var { data: refs } = await supabaseAdmin.from('referrals')
      .select('created_at').gte('created_at', since)

    // Active users (unique user_ids from events)
    var activeUsers = new Set((events || []).map(function(e: any) { return null }).filter(Boolean))

    var today = new Date().toISOString().split('T')[0]
    var yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    var weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]

    return NextResponse.json({
      registrations: {
        today: (users || []).filter(function(u: any) { return (u.created_at || '').startsWith(today) }).length,
        yesterday: (users || []).filter(function(u: any) { return (u.created_at || '').startsWith(yesterday) }).length,
        week: (users || []).filter(function(u: any) { return (u.created_at || '').startsWith(new Date().toISOString().substring(0,7)) })
      },
      deposits: { total: (deposits || []).length, approved: (deposits || []).filter(function(d: any) { return d.status === 'approved' }).length, total_amount: (deposits || []).reduce(function(s: number, d: any) { return s + (d.amount || 0) }, 0) },
      unlocks: { total: (unlocks || []).length, total_revenue: (unlocks || []).reduce(function(s: number, u: any) { return s + (u.unlock_price || 0) }, 0) },
      referrals: { total: (refs || []).length },
      events_count: (events || []).length,
    })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}