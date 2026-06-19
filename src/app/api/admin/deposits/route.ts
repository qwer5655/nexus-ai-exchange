import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { verifyAdmin, logAdminAction } from '@/lib/admin-auth'

export async function GET(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var url = new URL(req.url)
    var page = parseInt(url.searchParams.get('page') || '1')
    var limit = parseInt(url.searchParams.get('limit') || '50')
    var search = url.searchParams.get('search') || ''
    var statusF = url.searchParams.get('status') || ''
    var from = (page - 1) * limit; var to = from + limit - 1
    var query = supabaseAdmin.from('deposits').select('*,profiles!inner(username,email)', { count: 'exact' })
    if (search) query = query.or('id.ilike.%' + search + '%,user_id.ilike.%' + search + '%,coin.ilike.%' + search + '%')
    if (statusF) query = query.eq('status', statusF)
    query = query.order('created_at', { ascending: false }).range(from, to)
    var { data: d, count: c, error: e } = await query
    if (e) return NextResponse.json({ error: e.message }, { status: 500 })
    return NextResponse.json({ deposits: d || [], total: c || 0, page, limit })
  } catch(e2: any) { return NextResponse.json({ error: e2.message }, { status: 500 }) }
}

export async function PUT(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var body = await req.json()
    var { depositId, action } = body
    var idempotencyKey = body.idempotency_key
    if (idempotencyKey) {
      var { data: ek } = await supabaseAdmin.from('idempotency_keys').select('response').eq('key', idempotencyKey).maybeSingle()
      if (ek) return NextResponse.json(ek.response)
    }
    if (!depositId || !action) return NextResponse.json({ error: 'depositId and action required' }, { status: 400 })
    var { data: deposit } = await supabaseAdmin.from('deposits').select('*').eq('id', depositId).single()
    if (!deposit) return NextResponse.json({ error: 'Deposit not found' }, { status: 404 })
    if (deposit.status !== 'pending') return NextResponse.json({ error: 'Deposit already processed' }, { status: 409 })

    if (action === 'approve') {
      var { data: bb } = await supabaseAdmin.from('profiles').select('balance').eq('id', deposit.user_id).single()
      var beforeVal = bb?.balance || 0
      var newBalance = beforeVal + deposit.amount
      var { error: rpcErr } = await supabaseAdmin.rpc('add_balance', { p_user_id: deposit.user_id, p_amount: deposit.amount, p_type: 'deposit', p_reference_type: 'deposit', p_reference_id: depositId })
      if (rpcErr) return NextResponse.json({ error: 'Balance update failed: ' + rpcErr.message }, { status: 500 })
      var { data: ba } = await supabaseAdmin.from('profiles').select('balance').eq('id', deposit.user_id).single()
      var afterVal = ba?.balance || 0
      if (afterVal <= beforeVal) {
        return NextResponse.json({ success: false, error: 'BALANCE_UPDATE_FAILED' }, { status: 500 })
      }
      await supabaseAdmin.from('deposits').update({ status: 'approved', approved_at: new Date().toISOString() }).eq('id', depositId)
      await supabaseAdmin.from('balance_transactions').insert({ user_id: deposit.user_id, type: 'deposit', amount: deposit.amount, balance_before: beforeVal, balance_after: afterVal, reference_type: 'deposit', reference_id: depositId, description: 'Deposit ' + deposit.coin + ' ' + deposit.amount, created_by: auth.userId })
      try { await supabaseAdmin.from('notifications').insert({ user_id: deposit.user_id, title: 'Deposit approved', message: '+' + deposit.amount + ' credited to your account' }) } catch(ex) {}

      // Commission: 5% to referrer
      try {
        var { data: refBy } = await supabaseAdmin.from('profiles').select('referred_by').eq('id', deposit.user_id).maybeSingle()
        if (refBy?.referred_by) {
          var commAmt = Math.round(deposit.amount * 0.05 * 100) / 100
          var { data: refRec } = await supabaseAdmin.from('referrals').select('commission').eq('referred_user_id', deposit.user_id).maybeSingle()
          if (refRec) await supabaseAdmin.from('referrals').update({ commission: (refRec.commission || 0) + commAmt }).eq('referred_user_id', deposit.user_id)
          var { data: refProf } = await supabaseAdmin.from('profiles').select('balance').eq('id', refBy.referred_by).single()
          var refBal = refProf?.balance || 0
          await supabaseAdmin.from('profiles').update({ balance: refBal + commAmt }).eq('id', refBy.referred_by)
          await supabaseAdmin.from('balance_transactions').insert({ user_id: refBy.referred_by, type: 'commission', amount: commAmt, balance_before: refBal, balance_after: refBal + commAmt, reference_type: 'deposit', reference_id: depositId, description: 'Referral commission 5% of ' + deposit.amount, created_by: auth.userId })
          try { await supabaseAdmin.from('notifications').insert({ user_id: refBy.referred_by, title: 'Commission earned', message: '+' + commAmt + ' from referral' }) } catch(ex2) {}
        }
      } catch(ex3) {}

      await logAdminAction(auth.userId!, 'approve_deposit', 'deposit', depositId, { user_id: deposit.user_id, amount: deposit.amount })
      var result = { success: true, action: 'approved' }
      if (idempotencyKey) { try { await supabaseAdmin.from('idempotency_keys').insert({ key: idempotencyKey, user_id: deposit.user_id, action_type: 'deposit_approve', response: result }) } catch(ex4) {} }
      return NextResponse.json(result)
    } else if (action === 'reject') {
      await supabaseAdmin.from('deposits').update({ status: 'rejected' }).eq('id', depositId)
      await logAdminAction(auth.userId!, 'reject_deposit', 'deposit', depositId, { user_id: deposit.user_id, amount: deposit.amount })
      return NextResponse.json({ success: true, action: 'rejected' })
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch(e5: any) { return NextResponse.json({ error: e5.message }, { status: 500 }) }
}


