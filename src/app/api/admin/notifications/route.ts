import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdmin, logAdminAction } from '@/lib/admin-auth'

export async function GET(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var url = new URL(req.url)
    var page = parseInt(url.searchParams.get('page') || '1')
    var limit = parseInt(url.searchParams.get('limit') || '50')
    var from = (page - 1) * limit; var to = from + limit - 1

    // Notifications with join to profiles for user info
    var { data, count, error } = await supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ notifications: data || [], total: count || 0, page, limit })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}

export async function POST(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var { userId, title, message } = await req.json()
    if (!userId || !title || !message) return NextResponse.json({ error: 'userId, title, message required' }, { status: 400 })

    if (userId === '__all__') {
      var { data: allUsers } = await supabaseAdmin.from('profiles').select('id')
      var notifs = (allUsers || []).map(function(u: any) { return { user_id: u.id, title, message } })
      if (notifs.length > 0) await supabaseAdmin.from('notifications').insert(notifs)
      await logAdminAction(auth.userId!, 'broadcast_notification', null, null, { count: notifs.length })
      return NextResponse.json({ success: true, count: notifs.length })
    }

    await supabaseAdmin.from('notifications').insert({ user_id: userId, title, message })
    await logAdminAction(auth.userId!, 'send_notification', 'user', userId)
    return NextResponse.json({ success: true })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}

export async function DELETE(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var url = new URL(req.url)
    var notificationId = url.searchParams.get('id')
    if (!notificationId) return NextResponse.json({ error: 'notification id required' }, { status: 400 })
    var { error } = await supabaseAdmin.from('notifications').delete().eq('id', notificationId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await logAdminAction(auth.userId!, 'delete_notification', 'notification', notificationId)
    return NextResponse.json({ success: true })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}
