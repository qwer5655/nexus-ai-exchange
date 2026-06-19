import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { verifyAuth, logAdminAction } from '@/lib/admin-auth'

export async function GET(req: Request) {
  try {
    var auth = await verifyAuth(req)
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

    var url = new URL(req.url)
    var queryUserId = url.searchParams.get('userId')
    // Admin can view any user; regular users can only view their own deposits
    var userId = (auth.role === 'admin' || auth.role === 'super_admin') && queryUserId ? queryUserId : auth.userId!

    var { data } = await supabaseAdmin.from('deposits').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    return NextResponse.json({ deposits: data || [] })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}

export async function POST(req: Request) {
  try {
    // SECURITY: userId MUST come from session, NOT from request body
    var auth = await verifyAuth(req)
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

    var { coin, amount, walletAddress, txHash, userId: bodyUserId } = await req.json()
    if (!coin || !amount) return NextResponse.json({ error: 'coin and amount are required' }, { status: 400 })

    // Admin can create deposits for other users; regular users deposit to themselves
    var userId = (auth.role === 'admin' || auth.role === 'super_admin') && bodyUserId ? bodyUserId : auth.userId!

    var { data } = await supabaseAdmin.from('deposits').insert({
      user_id: userId, coin, amount, wallet_address: walletAddress || '',
      tx_hash: txHash || '', status: 'pending'
    }).select().single()

    // Audit log for admin-created deposits
    if (auth.userId !== userId) { logAdminAction(auth.userId!, 'create_deposit_for_user', 'deposit', data?.id, { userId, coin, amount }) }

    return NextResponse.json({ deposit: data })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}
