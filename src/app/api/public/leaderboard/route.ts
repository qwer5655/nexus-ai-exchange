import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    var { data: profiles } = await supabaseAdmin.from('profiles')
      .select('id, username, email, avatar_url, total_profit, total_deposit, vip_level, balance, country')
      .order('total_profit', { ascending: false })
      .limit(100)
    var userIds = (profiles || []).map(function(p) { return p.id })
    var unlockCounts: Record<string, number> = {}
    if (userIds.length > 0) {
      var dbUnlocks: any = await supabaseAdmin.rpc('get_unlock_counts', { p_user_ids: userIds })
      // Fallback: count individually
      for (var uid of userIds) {
        var { count } = await supabaseAdmin.from('unlocks').select('*', { count: 'exact', head: true }).eq('user_id', uid)
        unlockCounts[uid] = count || 0
      }
    }
    var leaderboard = (profiles || []).map(function(p, i) {
      var profit = p.total_profit || 0
      var deposit = p.total_deposit || 0
      var todayProfit = Math.floor(profit * 0.01)
      var winRate = Math.min(95, Math.floor(65 + (p.vip_level || 0) * 3 + Math.random() * 10))
      return {
        id: p.id, rank: i + 1,
        avatar: p.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(p.username || p.email) + '&background=00ff88&color=fff&size=128',
        name: p.username || p.email?.split('@')[0] || 'User',
        country: p.country || 'US',
        totalProfit: profit, todayProfit, winRate, unlocks: unlockCounts[p.id] || 0, vip_level: p.vip_level || 0
      }
    })
    return NextResponse.json({ leaderboard })
  } catch(e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}