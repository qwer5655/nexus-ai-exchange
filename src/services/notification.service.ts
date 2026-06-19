import { supabase } from '@/lib/supabase'
import type { DBNotification } from '@/types/database'

export async function getNotifications(userId: string) {
  var { data, error } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50)
  if (error) throw error
  return data as DBNotification[]
}

export async function markAsRead(notifId: string) {
  var { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', notifId)
  if (error) throw error
}

export async function markAllRead(userId: string) {
  var { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false)
  if (error) throw error
}

export async function createNotification(userId: string, title: string, message: string) {
  var { data, error } = await supabase.from('notifications').insert({ user_id: userId, title, message }).select().single()
  if (error) throw error
  return data as DBNotification
}