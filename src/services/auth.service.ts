import { supabase } from '@/lib/supabase'
import type { DBProfile } from '@/types/database'

export async function signUp(email: string, password: string, username: string, country: string, referralCode?: string) {
  var { data, error } = await supabase.auth.signUp({ email, password, options: { data: { username, country } } })
  if (error) throw error
  if (referralCode) {
    var { data: referrer } = await supabase.from('profiles').select('id').eq('referral_code', referralCode).single()
    if (referrer) {
      await supabase.from('profiles').update({ referred_by: referrer.id }).eq('id', data.user!.id)
    }
  }
  return data
}

export async function signIn(email: string, password: string) {
  var { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  var { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function resetPassword(email: string) {
  var { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: process.env.NEXT_PUBLIC_APP_URL + '/auth/callback' })
  if (error) throw error
}

export async function getSession() {
  var { data } = await supabase.auth.getSession()
  return data.session
}

export async function getCurrentUser() {
  var session = await getSession()
  if (!session) return null
  var { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
  return data as DBProfile | null
}