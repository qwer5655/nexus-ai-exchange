import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { getCredits, deductCredits, addCredits } from '@/lib/credits'

export async function GET(req: Request) {
  var authHeader = req.headers.get('authorization')
  var email = req.headers.get('x-admin-email')
  var userId: string | null = null

  if (authHeader?.startsWith('Bearer ')) {
    var token = authHeader.slice(7)
    var { data: { user } } = await supabaseAdmin.auth.getUser(token)
    if (user) userId = user.id
  }
  if (!userId && email) {
    var { data: profile } = await supabaseAdmin.from('profiles').select('id').eq('email', email).maybeSingle()
    if (profile) userId = profile.id
  }
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    var credits = await getCredits(userId)
    // Get recent credit events
    var { data: events } = await supabaseAdmin.from('system_events')
      .select('event_type,metadata,created_at')
      .eq('user_id', userId)
      .in('event_type', ['credits_deducted', 'credits_added'])
      .order('created_at', { ascending: false })
      .limit(20)
    return NextResponse.json({ credits: credits, history: events || [] })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}

export async function POST(req: Request) {
  var authHeader = req.headers.get('authorization')
  var email = req.headers.get('x-admin-email')
  var userId: string | null = null

  if (authHeader?.startsWith('Bearer ')) {
    var token = authHeader.slice(7)
    var { data: { user } } = await supabaseAdmin.auth.getUser(token)
    if (user) userId = user.id
  }
  if (!userId && email) {
    var { data: profile } = await supabaseAdmin.from('profiles').select('id,role').eq('email', email).maybeSingle()
    if (profile) userId = profile.id
  }
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    var body = await req.json()
    var { action, amount, cost } = body

    if (action === 'deduct' && cost) {
      var result = await deductCredits(userId, cost)
      if (!result.success) return NextResponse.json({ error: result.error }, { status: 402 })
      return NextResponse.json({ success: true, remaining: result.remaining })
    }

    if (action === 'add' && amount) {
      var addResult = await addCredits(userId, amount, body.reason || 'api')
      return NextResponse.json(addResult)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}
