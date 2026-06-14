import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdmin } from '@/lib/admin-auth'
import { emitEvent } from '@/lib/business-events'

export async function GET(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var { data, error } = await supabaseAdmin.from('wallets').select('*').order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ wallets: data || [] })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}

export async function POST(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var body = await req.json()
    var { name, currency, network, address, qr_code_url, provider, enabled, sort_order, description } = body
    if (!address) return NextResponse.json({ error: 'address required' }, { status: 400 })
    var { data, error } = await supabaseAdmin.from('wallets').insert({
      name: name || '', coin: currency || '', network: network || '', address,
      qr_code_url: qr_code_url || '', provider: provider || 'crypto',
      enabled: enabled !== false, sort_order: sort_order || 0, description: description || ''
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await emitEvent('wallet.created', auth.userId, { wallet_id: data.id, coin: data.coin })
    return NextResponse.json({ wallet: data })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}

export async function PATCH(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var body = await req.json(); var { id, name, currency, network, address, qr_code_url, provider, enabled, sort_order, description } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    var updates: any = { updated_at: new Date().toISOString() }
    if (name !== undefined) updates.name = name; if (currency !== undefined) updates.coin = currency
    if (network !== undefined) updates.network = network; if (address !== undefined) updates.address = address
    if (qr_code_url !== undefined) updates.qr_code_url = qr_code_url; if (provider !== undefined) updates.provider = provider
    if (enabled !== undefined) updates.enabled = enabled; if (sort_order !== undefined) updates.sort_order = sort_order
    if (description !== undefined) updates.description = description
    var { data, error } = await supabaseAdmin.from('wallets').update(updates).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await emitEvent(enabled ? 'wallet.updated' : (updates.enabled === false ? 'wallet.disabled' : 'wallet.updated'), auth.userId, { wallet_id: id })
    return NextResponse.json({ wallet: data })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}

export async function DELETE(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var url = new URL(req.url); var id = url.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    var { error } = await supabaseAdmin.from('wallets').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await emitEvent('wallet.deleted', auth.userId, { wallet_id: id })
    return NextResponse.json({ success: true })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}

