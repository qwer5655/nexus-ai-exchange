import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: Request) {
  try {
    var url = new URL(req.url)
    var userId = url.searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })
    var unreadOnly = url.searchParams.get('unread') === 'true'
    var page = parseInt(url.searchParams.get('page') || '1')
    var limit = parseInt(url.searchParams.get('limit') || '20')
    var from = (page - 1) * limit; var to = from + limit - 1

    var query = supabaseAdmin.from('notifications').select('*', { count: 'exact' }).eq('user_id', userId).order('created_at', { ascending: false }).range(from, to)
    if (unreadOnly) query = query.eq('is_read', false)
    var { data, count, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    var { count: unreadCount } = await supabaseAdmin.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('is_read', false)

    return NextResponse.json({ notifications: data || [], total: count || 0, unread: unreadCount || 0, page, limit })
  } catch(e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function PATCH(req: Request) {
  try {
    var { notificationIds } = await req.json()
    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return NextResponse.json({ error: 'notificationIds array required' }, { status: 400 })
    }
    await supabaseAdmin.from('notifications').update({ is_read: true }).in('id', notificationIds)
    return NextResponse.json({ success: true })
  } catch(e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
