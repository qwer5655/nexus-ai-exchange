import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: Request) {
  try {
    var url = new URL(req.url)
    var userId = url.searchParams.get('userId')
    var opportunityId = url.searchParams.get('opportunityId')
    if (!userId || !opportunityId) return NextResponse.json({ error: 'userId and opportunityId are required' }, { status: 400 })
    var { data } = await supabaseAdmin.from('unlocks').select('id,created_at').eq('user_id', userId).eq('opportunity_id', opportunityId).maybeSingle()
    return NextResponse.json({ unlocked: !!data, data: data || null })
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
