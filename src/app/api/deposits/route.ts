import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyUser, logAdminAction } from '@/lib/admin-auth'

export async function GET(req: Request) {
  try {
    var url = new URL(req.url)
    var userId = url.searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    // Verify auth
    var auth = await verifyUser(req, userId)
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

    var { data } = await supabaseAdmin.from('deposits').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    return NextResponse.json({ deposits: data || [] })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}

export async function POST(req: Request) {
  try {
    var { userId, coin, amount, walletAddress, txHash } = await req.json()
    if (!userId || !coin || !amount) return NextResponse.json({ error: 'userId, coin, and amount are required' }, { status: 400 })

    // Verify authentication and authorization
    var auth = await verifyUser(req, userId)
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

    var { data } = await supabaseAdmin.from('deposits').insert({
      user_id: userId, coin, amount, wallet_address: walletAddress || '',
      tx_hash: txHash || '', status: 'pending'
    }).select().single()

    // Audit log for admin-created deposits
    if (auth.userId !== userId) { logAdminAction(auth.userId!, 'create_deposit_for_user', 'deposit', data?.id, { userId, coin, amount }) }

    return NextResponse.json({ deposit: data })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}