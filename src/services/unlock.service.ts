import { createClient } from '@supabase/supabase-js'

var _u = 'https://dcfwldxwyvvotvfdnywy.supabase.co'
var _k = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZndsZHh3eXZ2b3R2ZmRueXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NTA3MjYsImV4cCI6MjA5NjQyNjcyNn0.hoVRtNWXr0nzYLaQlR3yTlnOXUOlgBTYPMM1WdFBXjk'
var _srvKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZndsZHh3eXZ2b3R2ZmRueXd5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDg1MDcyNiwiZXhwIjoyMDk2NDI2NzI2fQ.dATPuFYs8YF0esN0tk7dATxTEIo_dZambcYJkJ3gEU0'
var supabase = createClient(_u, _k)
var supabaseAdmin = createClient(_u, _srvKey)

export async function checkUnlocked(userId: string, oppId: string): Promise<boolean> {
  var { data } = await supabase.from('unlocks').select('id').eq('user_id', userId).eq('opportunity_id', oppId).maybeSingle()
  return !!data
}

export async function unlockOpportunity(userId: string, oppId: string, price: number) {
  var already = await checkUnlocked(userId, oppId)
  if (already) throw new Error('Already Unlocked')
  var { data: profile, error: pErr } = await supabaseAdmin.from('profiles').select('balance').eq('id', userId).single()
  if (pErr || !profile) throw new Error('User not found')
  if (profile.balance < price) throw new Error("Insufficient Balance")
  var { error: dErr } = await supabaseAdmin.rpc('deduct_balance', { user_id: userId, amount: price })
  if (dErr) throw dErr
  var { data: unlock, error: uErr } = await supabaseAdmin.from('unlocks').insert({ user_id: userId, opportunity_id: oppId, unlock_price: price }).select().single()
  if (uErr) throw uErr
  await supabaseAdmin.from('activity_feed').insert({ type: 'opportunity_unlock', message: 'User unlocked opportunity ' + oppId })
  await supabaseAdmin.from('notifications').insert({ user_id: userId, title: 'Opportunity Unlocked', message: 'You have successfully unlocked a report.' })
  return unlock
}

export async function getMyUnlocks(userId: string) {
  var { data, error } = await supabase.from('unlocks').select('opportunity_id, created_at, unlock_price, opportunities(*)').eq('user_id', userId).order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}