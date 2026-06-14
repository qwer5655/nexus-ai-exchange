import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    var entries: any[] = []
    // Activity feed
    var { data: activity } = await supabaseAdmin.from('activity_feed')
      .select('id, type, message, created_at')
      .order('created_at', { ascending: false }).limit(20)
    ;(activity || []).forEach(function(a: any) {
      entries.push({ id: a.id, type: a.type, text: a.message || 'Activity', amount: 0, time: timeAgo(a.created_at) })
    })
    // Recent unlocks with user data
    var { data: unlocks } = await supabaseAdmin.from('unlocks')
      .select('id, user_id, unlock_price, created_at, opportunities!inner(title)')
      .order('created_at', { ascending: false }).limit(10)
    ;(unlocks || []).forEach(function(u: any) {
      entries.push({ id: 'ul-' + u.id, type: 'unlock', text: 'Unlocked: ' + (u.opportunities?.title || 'Arbitrage'), amount: u.unlock_price || 0, time: timeAgo(u.created_at) })
    })
    // Recent deposits approved
    var { data: deposits } = await supabaseAdmin.from('deposits')
      .select('id, user_id, amount, created_at').eq('status', 'approved')
      .order('created_at', { ascending: false }).limit(10)
    ;(deposits || []).forEach(function(d: any) {
      entries.push({ id: 'dep-' + d.id, type: 'deposit', text: 'Deposited', amount: d.amount || 0, time: timeAgo(d.created_at) })
    })
    entries.sort(function(a, b) { return (b._sort || 0) - (a._sort || 0) })
    return NextResponse.json({ entries: entries.slice(0, 20) })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}

function timeAgo(dateStr: string) {
  var diff = Date.now() - new Date(dateStr).getTime()
  var sec = Math.floor(diff / 1000)
  if (sec < 60) return sec + 's ago'
  var min = Math.floor(sec / 60)
  if (min < 60) return min + 'm ago'
  return Math.floor(min / 60) + 'h ago'
}