import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
export async function GET() {
  var r: any = {}
  var { data: n, count: c, error: e } = await supabaseAdmin.from('notifications').select('user_id,title,message').order('created_at', { ascending: false })
  r.notifications = { total: c, sample: n?.slice(0, 10), error: e?.message }
  return NextResponse.json(r)
}
