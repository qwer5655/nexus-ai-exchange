import { supabaseAdmin } from '@/lib/supabase/server'

export async function createNotification(params: {
  userId: string
  title: string
  description: string
  type?: string
}) {
  var { error } = await supabaseAdmin.from('notifications').insert({
    user_id: params.userId,
    title: params.title,
    description: params.description,
    type: params.type || 'info'
  })
  if (error) throw new Error('Notification failed: ' + error.message)
  return true
}

export async function getUserNotifications(userId: string, limit = 20) {
  var { data } = await supabaseAdmin
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return data || []
}

export async function markRead(notificationIds: string[]) {
  var { error } = await supabaseAdmin
    .from('notifications')
    .update({ is_read: true })
    .in('id', notificationIds)
  if (error) throw new Error('Mark read failed: ' + error.message)
  return true
}
