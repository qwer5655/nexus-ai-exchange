import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdmin } from '@/lib/admin-auth'

export async function GET(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var url = new URL(req.url)
    var days = parseInt(url.searchParams.get('days') || '90')
    var since = new Date(Date.now() - days * 86400000).toISOString()

    var { data: users } = await supabaseAdmin.from('profiles').select('created_at').gte('created_at', since).order('created_at', { ascending: true })

    var dailyRegs: Record<string, number> = {}
    for (var i = 0; i < days; i++) { var d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0]; dailyRegs[d] = 0 }
    (users || []).forEach(function(u: any) { var day = (u.created_at || '').split('T')[0]; if (dailyRegs[day] !== undefined) dailyRegs[day]++ })

    var { data: events } = await supabaseAdmin.from('analytics_events').select('utm_source, utm_campaign, referrer').gte('created_at', since).not('utm_source', 'is', null)
    var sources: Record<string, number> = {}; (events || []).forEach(function(e: any) { var src = e.utm_source || 'direct'; sources[src] = (sources[src] || 0) + 1 })

    return NextResponse.json({ daily_registrations: Object.entries(dailyRegs).reverse().map(function(e: any) { return { date: e[0], count: e[1] } }), total_registrations: (users || []).length, acquisition_sources: Object.entries(sources).map(function(e: any) { return { source: e[0], count: e[1] } }) })
  } catch(e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}