import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { verifyAuth } from '@/lib/admin-auth'

export async function GET(req: Request) {
  try {
    var auth = await verifyAuth(req)
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

    var url = new URL(req.url)
    var opportunityId = url.searchParams.get('opportunityId')
    if (!opportunityId) return NextResponse.json({ error: 'opportunityId is required' }, { status: 400 })
    var userId = auth.userId!
    var { data } = await supabaseAdmin.from('unlocks').select('id,created_at').eq('user_id', userId).eq('opportunity_id', opportunityId).maybeSingle()
    return NextResponse.json({ unlocked: !!data, data: data || null })
  } catch(e: any) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
