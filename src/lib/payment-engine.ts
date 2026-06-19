// Payment Engine — centralized business logic for recharges
import { supabaseAdmin } from './supabase'
import { emitEvent } from './business-events'
import { evaluateVip } from './vip-engine'

// 1. Create recharge record
export async function createRecharge(params: {
  user_id: string
  wallet_id?: string
  amount: number
  currency?: string
  transaction_id?: string
}) {
  var { data, error } = await supabaseAdmin.from('payment_recharges').insert({
    user_id: params.user_id,
    wallet_id: params.wallet_id || null,
    amount: params.amount,
    currency: params.currency || 'USDT',
    transaction_id: params.transaction_id || null,
    status: 'pending'
  }).select().single()
  if (error) throw new Error('Create recharge failed: ' + error.message)
  await emitEvent('recharge.created', params.user_id, { recharge_id: data.id, amount: params.amount })
  return data
}

// 2. Approve recharge — credit balance, trigger VIP check, distribute commission
export async function approveRecharge(params: {
  rechargeId: string | number
  adminId: string
}) {
  // Get recharge record
  var { data: recharge, error: fetchErr } = await supabaseAdmin
    .from('payment_recharges').select('*').eq('id', params.rechargeId).single()
  if (fetchErr || !recharge) throw new Error('Recharge not found')
  if (recharge.status !== 'pending') throw new Error('Recharge already processed')

  var userId = recharge.user_id

  // Get current balance
  var { data: profile } = await supabaseAdmin.from('profiles')
    .select('balance').eq('id', userId).single()
  var beforeBal = profile?.balance || 0
  var newBal = beforeBal + recharge.amount

  // Update balance
  var { error: balErr } = await supabaseAdmin.from('profiles')
    .update({ balance: newBal }).eq('id', userId)
  if (balErr) throw new Error('Balance update failed: ' + balErr.message)

  // Mark recharge as completed
  await supabaseAdmin.from('payment_recharges').update({
    status: 'completed', admin_id: params.adminId, completed_at: new Date().toISOString(), updated_at: new Date().toISOString()
  }).eq('id', params.rechargeId)

  // Emit events
  await emitEvent('recharge.approved', userId, { recharge_id: params.rechargeId, amount: recharge.amount, balance_before: beforeBal, balance_after: newBal })

  // Auto VIP evaluation
  try { await evaluateVip(userId) } catch {}

  // Auto commission (5% to referrer)
  try {
    var { data: refBy } = await supabaseAdmin.from('profiles')
      .select('referred_by').eq('id', userId).maybeSingle()
    if (refBy?.referred_by) {
      var commAmt = Math.round(recharge.amount * 0.05 * 100) / 100
      var { data: refProf } = await supabaseAdmin.from('profiles')
        .select('balance').eq('id', refBy.referred_by).single()
      var refBal = refProf?.balance || 0
      await supabaseAdmin.from('profiles').update({ balance: refBal + commAmt })
        .eq('id', refBy.referred_by)
      await emitEvent('commission.earned', refBy.referred_by, {
        amount: commAmt, from_user: userId, source: 'recharge', reference_id: params.rechargeId
      })
    }
  } catch {}

  return { success: true, balance_before: beforeBal, balance_after: newBal }
}

// 3. Reject/cancel recharge
export async function rejectRecharge(params: {
  rechargeId: string | number
  adminId: string
  reason?: string
}) {
  var { error } = await supabaseAdmin.from('payment_recharges').update({
    status: 'failed', admin_id: params.adminId, notes: params.reason || null, updated_at: new Date().toISOString()
  }).eq('id', params.rechargeId)
  if (error) throw new Error('Reject failed: ' + error.message)
  await emitEvent('recharge.rejected', null, { recharge_id: params.rechargeId, reason: params.reason })
  return { success: true }
}

// 4. Get user balance
export async function getUserBalance(userId: string) {
  var { data } = await supabaseAdmin.from('profiles')
    .select('balance').eq('id', userId).single()
  return { balance: data?.balance || 0 }
}

// 5. List recharges (admin)
export async function listRecharges(params: {
  page?: number
  limit?: number
  status?: string
  search?: string
}) {
  var page = params.page || 1
  var limit = params.limit || 50
  var from = (page - 1) * limit
  var to = from + limit - 1

  var query = supabaseAdmin.from('payment_recharges')
    .select('*,profiles!inner(username,email)', { count: 'exact' })
  if (params.search) query = query.or('id.ilike.%' + params.search + '%,user_id.ilike.%' + params.search + '%,currency.ilike.%' + params.search + '%')
  if (params.status) query = query.eq('status', params.status)
  query = query.order('created_at', { ascending: false }).range(from, to)

  var { data, count, error } = await query
  if (error) throw new Error(error.message)
  return { recharges: data || [], total: count || 0 }
}