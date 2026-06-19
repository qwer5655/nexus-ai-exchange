import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { verifyAuth, logAdminAction } from '@/lib/admin-auth'

export async function POST(req: Request) {
  try {
    // SECURITY: userId MUST come from session, NOT from request body
    var auth = await verifyAuth(req)
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

    var body = await req.json()
    var { opportunityId, userId: bodyUserId } = body
    if (!opportunityId) return NextResponse.json({ error: 'opportunityId is required' }, { status: 400 })

    // Admin can specify a target userId; regular users always use their session
    var userId = (auth.role === 'admin' || auth.role === 'super_admin') && bodyUserId ? bodyUserId : auth.userId!

    // Idempotency check (primary: idempotency_keys table)
    var idempotencyKey = body.idempotency_key
    if (idempotencyKey) {
      var { data: ek } = await supabaseAdmin.from('idempotency_keys').select('response').eq('key', idempotencyKey).maybeSingle()
      if (ek) return NextResponse.json(ek.response)
    }

    // Idempotency check (secondary: existing unlock record)
    var { data: existing } = await supabaseAdmin.from('unlocks').select('id,unlock_price').eq('user_id', userId).eq('opportunity_id', opportunityId).maybeSingle()
    if (existing) return NextResponse.json({ success: true, unlock_price: existing.unlock_price })

    var { data: opp } = await supabaseAdmin.from('opportunities').select('required_capital').eq('id', opportunityId).single()
    if (!opp) return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
    var unlockPrice = opp.required_capital || 0

    var { data: profile } = await supabaseAdmin.from('profiles').select('balance').eq('id', userId).single()
    var balanceBefore = profile?.balance || 0
    if (!profile || balanceBefore < unlockPrice) {
      return NextResponse.json({ error: 'Insufficient balance', balance: balanceBefore, required: unlockPrice }, { status: 402 })
    }

    var targetBalance = balanceBefore - unlockPrice
    var { error: balanceError } = await supabaseAdmin.rpc('add_balance', {
      p_user_id: userId, p_amount: -unlockPrice, p_type: 'unlock',
      p_reference_type: 'opportunity', p_reference_id: opportunityId
    })
    if (balanceError) return NextResponse.json({ error: 'Balance update failed: ' + balanceError.message }, { status: 500 })

    var { error: unlockError } = await supabaseAdmin.from('unlocks').insert({
      user_id: userId, opportunity_id: opportunityId, unlock_price: unlockPrice
    })
    if (unlockError) {
      await supabaseAdmin.from('profiles').update({ balance: balanceBefore }).eq('id', userId)
      return NextResponse.json({ error: 'Unlock failed: ' + unlockError.message }, { status: 500 })
    }

    var { data: afterProfile } = await supabaseAdmin.from('profiles').select('balance').eq('id', userId).single()
    var balanceAfter = afterProfile?.balance || targetBalance

    if (auth.userId !== userId) { logAdminAction(auth.userId!, 'unlock_for_user', 'profile', userId, { opportunityId, price: unlockPrice }) }

    await supabaseAdmin.from('activity_feed').insert({ type: 'opportunity_unlock', message: 'User unlocked an opportunity' })
    await supabaseAdmin.from('notifications').insert({ user_id: userId, title: 'Opportunity Unlocked', message: 'You have successfully unlocked a report.' })

    var result = { success: true, unlock_price: unlockPrice }
    await logAdminAction(auth.userId!, 'unlock_opportunity', 'unlocks', opportunityId, { userId, unlockPrice, targetUserId: bodyUserId || null })
    if (idempotencyKey) {
      try { await supabaseAdmin.from('idempotency_keys').insert({ key: idempotencyKey, user_id: userId, action_type: 'unlock', response: result }) } catch(e) {}
    }
    return NextResponse.json(result)
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}


