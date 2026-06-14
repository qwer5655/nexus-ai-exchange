import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdmin } from '@/lib/admin-auth'
import { calculateRiskScore, trackAbuse } from '@/lib/abuse-control'
import { updateUserTier } from '@/lib/pricing'

export async function GET(req: Request) {
  var auth = await verifyAdmin(req)
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    var url = new URL(req.url)
    var targetUserId = url.searchParams.get('userId')
    var limit = parseInt(url.searchParams.get('limit') || '10')

    if (targetUserId) {
      var score = await calculateRiskScore(targetUserId)
      var autoAction = score.score > 80 ? 'suspend' : score.score > 50 ? 'throttle' : 'allow'

      // Auto-suspend if risk > 80
      if (score.score > 80) {
        await supabaseAdmin.from('profiles').update({ banned: true }).eq('id', targetUserId)
        await supabaseAdmin.from('system_events').insert({
          user_id: targetUserId, event_type: 'auto_suspended',
          metadata: { risk_score: score.score, reasons: score.reasons, action: 'suspend' }
        })
      }

      // Auto-throttle if risk > 50
      if (score.score > 50 && score.score <= 80) {
        await supabaseAdmin.from('system_events').insert({
          user_id: targetUserId, event_type: 'auto_throttled',
          metadata: { risk_score: score.score, reasons: score.reasons, action: 'throttle' }
        })
      }

      return NextResponse.json({
        user_id: targetUserId,
        risk_score: score.score,
        risk_level: score.level,
        reasons: score.reasons,
        auto_action: autoAction
      })
    }

    // Batch evaluate all users
    var { data: users } = await supabaseAdmin.from('profiles').select('id,email,banned')
      .order('created_at', { ascending: false }).limit(limit)
    var results: any[] = []
    for (var u of (users || [])) {
      if (u.banned) continue
      var s = await calculateRiskScore(u.id)
      if (s.level !== 'low') {
        results.push({ user_id: u.id, email: u.email, risk_score: s.score, risk_level: s.level, reasons: s.reasons })
      }
    }
    return NextResponse.json({ total_flagged: results.length, flagged_users: results })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}

export async function POST(req: Request) {
  var auth = await verifyAdmin(req)
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    var body = await req.json()
    var targetUserId = body.userId
    if (!targetUserId) return NextResponse.json({ error: 'userId is required' }, { status: 400 })

    var score = await calculateRiskScore(targetUserId)
    var action = body.action || (score.score > 80 ? 'suspend' : score.score > 50 ? 'throttle' : 'allow')

    if (action === 'suspend') {
      await supabaseAdmin.from('profiles').update({ banned: true }).eq('id', targetUserId)
      await supabaseAdmin.from('system_events').insert({
        user_id: targetUserId, event_type: 'manual_suspended',
        metadata: { risk_score: score.score, reasons: score.reasons, action_by: auth.userId }
      })
    }

    if (action === 'throttle') {
      await supabaseAdmin.from('system_events').insert({
        user_id: targetUserId, event_type: 'manual_throttled',
        metadata: { risk_score: score.score, reasons: score.reasons, action_by: auth.userId }
      })
    }

    return NextResponse.json({
      user_id: targetUserId,
      risk_score: score.score,
      risk_level: score.level,
      action_taken: action,
      reasons: score.reasons
    })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}
