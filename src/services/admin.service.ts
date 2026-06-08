import { supabaseAdmin } from '@/lib/supabase'

export async function getDashboardStats() {
  var { count: totalUsers } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true })
  var { count: totalDeposits } = await supabaseAdmin.from('deposits').select('*', { count: 'exact', head: true })
  var { count: totalUnlocks } = await supabaseAdmin.from('unlocks').select('*', { count: 'exact', head: true })
  var { data: depositSum } = await supabaseAdmin.from('deposits').select('amount').eq('status', 'approved')
  var totalRevenue = (depositSum || []).reduce(function(s, d) { return s + (d.amount || 0) }, 0)
  var todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  var { count: dailyActive } = await supabaseAdmin.from('activity_feed').select('*', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString())
  return { totalUsers, totalDeposits, totalUnlocks, totalRevenue, dailyActive }
}

export async function getAllUsers(page = 1, limit = 20) {
  var from = (page - 1) * limit; var to = from + limit - 1
  var { data, error, count } = await supabaseAdmin.from('profiles').select('*', { count: 'exact' }).range(from, to).order('created_at', { ascending: false })
  if (error) throw error
  return { users: data, count: count || 0 }
}

export async function updateUser(userId: string, updates: any) {
  var { data, error } = await supabaseAdmin.from('profiles').update(updates).eq('id', userId).select().single()
  if (error) throw error
  return data
}

export async function getAllDeposits(page = 1, limit = 20) {
  var from = (page - 1) * limit; var to = from + limit - 1
  var { data, error, count } = await supabaseAdmin.from('deposits').select('*, user_id!inner(username, email)', { count: 'exact' }).range(from, to).order('created_at', { ascending: false })
  if (error) throw error
  return { deposits: data, count: count || 0 }
}

export async function getAllOpportunities(page = 1, limit = 20) {
  var from = (page - 1) * limit; var to = from + limit - 1
  var { data, error, count } = await supabaseAdmin.from('opportunities').select('*', { count: 'exact' }).range(from, to).order('created_at', { ascending: false })
  if (error) throw error
  return { opportunities: data, count: count || 0 }
}