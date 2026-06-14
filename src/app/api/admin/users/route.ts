import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdmin, logAdminAction } from '@/lib/admin-auth'

export async function GET(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var url = new URL(req.url)
    var page = parseInt(url.searchParams.get('page') || '1')
    var limit = parseInt(url.searchParams.get('limit') || '50')
    var search = url.searchParams.get('search') || ''
    var sortBy = url.searchParams.get('sortBy') || 'created_at'
    var sortDir = url.searchParams.get('sortDir') || 'desc'
    var from = (page - 1) * limit; var to = from + limit - 1

    var query = supabaseAdmin.from('profiles').select('*', { count: 'exact' })
    if (search) query = query.or(`email.ilike.%${search}%,username.ilike.%${search}%`)
    query = query.order(sortBy, { ascending: sortDir === 'asc' }).range(from, to)
    var { data, count, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ users: data || [], total: count || 0, page, limit })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}

export async function PATCH(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var body = await req.json()
    var { userId, updates } = body
    if (!userId || !updates) return NextResponse.json({ error: 'userId and updates are required' }, { status: 400 })

    var idempotencyKey = body.idempotency_key

    // Handle ban/unban via auth
    if (updates.banned !== undefined) {
      if (idempotencyKey) {
        var { data: ek } = await supabaseAdmin.from('idempotency_keys').select('response').eq('key', idempotencyKey).maybeSingle()
        if (ek) return NextResponse.json(ek.response)
      }
      await supabaseAdmin.auth.admin.updateUserById(userId, { user_metadata: { banned: updates.banned } })
      var banRes = { success: true }
      if (idempotencyKey) { await supabaseAdmin.from('idempotency_keys').insert({ key: idempotencyKey, user_id: userId, action_type: 'ban_toggle', response: banRes }) }
      await logAdminAction(auth.userId!, updates.banned ? 'ban_user' : 'unban_user', 'profile', userId)
      return NextResponse.json(banRes)
    }

    // Handle balance changes
    var balanceChanging = updates.balance !== undefined
    if (idempotencyKey && balanceChanging) {
      var { data: ek } = await supabaseAdmin.from('idempotency_keys').select('response').eq('key', idempotencyKey).maybeSingle()
      if (ek) return NextResponse.json(ek.response)
    }

    var allowedFields = ['balance', 'vip_level', 'role', 'username', 'country']
    var safeUpdates: any = {}
    var balanceBefore = 0; var balanceDelta = 0

    if (updates.balance !== undefined) {
      var { data: cp } = await supabaseAdmin.from('profiles').select('balance').eq('id', userId).single()
      balanceBefore = cp?.balance || 0
      balanceDelta = updates.balance - balanceBefore
      safeUpdates.balance = updates.balance
    }

    for (var key of allowedFields) { if (updates[key] !== undefined && key !== 'balance') safeUpdates[key] = updates[key] }
    if (Object.keys(safeUpdates).length === 0 && updates.balance === undefined) return NextResponse.json({ error: 'No valid fields' }, { status: 400 })

    if (Object.keys(safeUpdates).length > 0) {
      var { data } = await supabaseAdmin.from('profiles').update(safeUpdates).eq('id', userId).select().single()
      if (balanceChanging && balanceDelta !== 0) {
        var actionType = balanceDelta > 0 ? 'topup' : 'adjustment'
        var { data: ap } = await supabaseAdmin.from('profiles').select('balance').eq('id', userId).single()
        await supabaseAdmin.from('balance_transactions').insert({
          user_id: userId, type: actionType, amount: balanceDelta,
          balance_before: balanceBefore, balance_after: ap?.balance || 0,
          reference_type: 'admin', description: 'Admin adjustment by ' + (auth.userId || 'unknown'), created_by: auth.userId
        })
      }
      var patchRes = { user: data }
      if (idempotencyKey && balanceChanging) { await supabaseAdmin.from('idempotency_keys').insert({ key: idempotencyKey, user_id: userId, action_type: balanceDelta > 0 ? 'topup' : 'adjustment', response: patchRes }) }
      await logAdminAction(auth.userId!, 'update_user', 'profile', userId, safeUpdates)
      return NextResponse.json(patchRes)
    }
    return NextResponse.json({ error: 'No changes applied' }, { status: 400 })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}


export async function POST(req) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var body = await req.json()
    var { data, error } = await supabaseAdmin.from('profiles').insert(body).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data: data })
  } catch(e) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}

export async function DELETE(req) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var url = new URL(req.url); var id = url.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    var { error } = await supabaseAdmin.from('profiles').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch(e) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}