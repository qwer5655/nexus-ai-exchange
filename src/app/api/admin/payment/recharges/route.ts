import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { verifyAdmin, logAdminAction } from '@/lib/admin-auth'
import { emitEvent } from '@/lib/business-events'
import { createRecharge, approveRecharge, rejectRecharge } from '@/lib/payment-engine'

export async function GET(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var url = new URL(req.url)
    var page = parseInt(url.searchParams.get('page') || '1')
    var limit = parseInt(url.searchParams.get('limit') || '50')
    var search = url.searchParams.get('search') || ''
    var statusF = url.searchParams.get('status') || ''
    var from = (page - 1) * limit; var to = from + limit - 1
    var query = supabaseAdmin.from('payment_recharges').select('*,profiles!inner(username,email)', { count: 'exact' })
    if (search) query = query.or('id.ilike.%' + search + '%,user_id.ilike.%' + search + '%,currency.ilike.%' + search + '%')
    if (statusF) query = query.eq('status', statusF)
    query = query.order('created_at', { ascending: false }).range(from, to)
    var { data, count, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ recharges: data || [], total: count || 0, page, limit })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}

export async function POST(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var body = await req.json()
    var { user_id, wallet_id, amount, currency, transaction_id } = body
    if (!user_id || !amount) return NextResponse.json({ error: 'user_id and amount required' }, { status: 400 })
    var recharge = await createRecharge({ user_id, wallet_id, amount, currency: currency || 'USDT', transaction_id })
    await logAdminAction(auth.userId!, 'create_recharge', 'recharge', recharge.id.toString(), { user_id, amount })
    return NextResponse.json({ recharge })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}

export async function PATCH(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var body = await req.json()
    var { rechargeId, action, reason } = body
    if (!rechargeId || !action) return NextResponse.json({ error: 'rechargeId and action required' }, { status: 400 })
    if (action === 'approve') {
      var approveR = await approveRecharge({ rechargeId, adminId: auth.userId! })
      await logAdminAction(auth.userId!, 'approve_recharge', 'recharge', rechargeId, approveR)
      return NextResponse.json(approveR)
    } else if (action === 'reject' || action === 'cancel') {
      var rejectR = await rejectRecharge({ rechargeId, adminId: auth.userId!, reason })
      await logAdminAction(auth.userId!, 'reject_recharge', 'recharge', rechargeId, { reason })
      return NextResponse.json(rejectR)
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}

export async function DELETE(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var url = new URL(req.url)
    var id = url.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    var { error } = await supabaseAdmin.from('payment_recharges').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await emitEvent('recharge.deleted', auth.userId, { recharge_id: id })
    return NextResponse.json({ success: true })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}