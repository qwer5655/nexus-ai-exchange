import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
export async function GET(req: Request) {
  try {
    var url = new URL(req.url)
    var userId = url.searchParams.get('userId')
    if (!userId) return NextResponse.json({ achievements: [] })
    
    var { data: profile } = await supabaseAdmin.from('profiles').select('id, balance, total_deposit, total_profit, vip_level, total_unlocks, created_at').eq('id', userId).single()
    if (!profile) return NextResponse.json({ achievements: [] })
    
    var { count: depositCount } = await supabaseAdmin.from('deposits').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'approved')
    var { count: unlockCount } = await supabaseAdmin.from('unlocks').select('*', { count: 'exact', head: true }).eq('user_id', userId)
    var { count: referralCount } = await supabaseAdmin.from('referrals').select('*', { count: 'exact', head: true }).eq('referrer_id', userId)
    var totalDeposit = profile.total_deposit || 0
    var totalProfit = profile.total_profit || 0
    var isVip = (profile.vip_level || 0) > 0
    var hasDeposit = (depositCount || 0) > 0
    var hasProfit = totalProfit > 0
    
    var achievements = [
      { id: 'A1', name: 'First Deposit', description: 'Make your first deposit', icon: '💰', unlocked: hasDeposit },
      { id: 'A2', name: 'First Profit', description: 'Earn your first arbitrage profit', icon: '📱', unlocked: hasProfit },
      { id: 'A3', name: 'Top Trader', description: 'Reach the top 10 on the leaderboard', icon: '🏳', unlocked: totalProfit > 1000 },
      { id: 'A4', name: 'VIP Trader', description: 'Deposit over $1,000 total', icon: '👑', unlocked: totalDeposit > 1000 },
      { id: 'A5', name: 'Legend Trader', description: 'Earn over $10,000 in total profit', icon: '🌟', unlocked: totalProfit > 10000 },
      { id: 'A6', name: 'Referral Pro', description: 'Invite 5 friends', icon: '🔗', unlocked: (referralCount || 0) >= 5 },
      { id: 'A7', name: 'Unlock Master', description: 'Unlock 10 opportunities', icon: '🔓', unlocked: (unlockCount || 0) >= 10 },
      { id: 'A8', name: 'VIP Member', description: 'Reach VIP level 1', icon: '💎', unlocked: isVip },
    ]
    return NextResponse.json({ success: true, data: { achievements }, error: null, timestamp: new Date().toISOString() })
  } catch(e: any) { return NextResponse.json({ success: false, data: null, error: (e as Error).message, timestamp: new Date().toISOString() }, { status: 500 }) }
}