import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    var { userId, eventName, eventData } = await req.json()
    if (!eventName) return NextResponse.json({ error: 'eventName required' }, { status: 400 })
    var ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || ''
    var ua = req.headers.get('user-agent') || ''
    await supabaseAdmin.from('analytics_events').insert({
      user_id: userId || null, event_name: eventName,
      event_data: eventData || {}, ip, user_agent: ua
    })
    return NextResponse.json({ success: true })
  } catch(e: any) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}