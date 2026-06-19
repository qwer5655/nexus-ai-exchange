import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET(req: Request) {
  try {
    var url = new URL(req.url)
    var email = url.searchParams.get('email')
    if (!email) return NextResponse.json({ error: 'Unauthorized', logs: [] }, { status: 401 })

    var { data: profile } = await supabaseAdmin.from('profiles').select('id').eq('email', email).single()
    if (!profile) return NextResponse.json({ error: 'User not found', logs: [] }, { status: 404 })

    var { data: logs } = await supabaseAdmin.from('admin_logs')
      .select('*').eq('action', 'user_login').eq('target_id', profile.id)
      .order('created_at', { ascending: false }).limit(50)

    var { count: totalLogins } = await supabaseAdmin.from('admin_logs')
      .select('*', { count: 'exact', head: true }).eq('action', 'user_login').eq('target_id', profile.id)

    var { data: lastLogin } = await supabaseAdmin.from('admin_logs')
      .select('*').eq('action', 'user_login').eq('target_id', profile.id)
      .order('created_at', { ascending: false }).limit(1)

    var { count: last30Days } = await supabaseAdmin.from('admin_logs')
      .select('*', { count: 'exact', head: true }).eq('action', 'user_login')
      .eq('target_id', profile.id).gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString())

    return NextResponse.json({
      logs: logs || [],
      stats: { totalLogins: totalLogins || 0, lastLogin: lastLogin?.[0] || null, last30Days: last30Days || 0 }
    })
  } catch(e: any) {
    return NextResponse.json({ error: (e as Error).message, logs: [] }, { status: 500 })
  }
}
