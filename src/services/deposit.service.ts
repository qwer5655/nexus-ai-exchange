import { supabase } from '@/lib/supabase'
import type { DBDeposit } from '@/types/database'

export async function createDeposit(userId: string, coin: string, amount: number, walletAddress: string, txHash: string) {
  var { data, error } = await supabase.from('deposits').insert({
    user_id: userId, coin, amount, wallet_address: walletAddress, tx_hash: txHash
  }).select().single()
  if (error) throw error
  return data as DBDeposit
}

export async function getDeposits(userId: string) {
  var { data, error } = await supabase.from('deposits').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (error) throw error
  return data as DBDeposit[]
}

export async function approveDeposit(id: string) {
  var { data: deposit, error: fetchError } = await supabase.from('deposits').select('*').eq('id', id).single()
  if (fetchError) throw fetchError
  if (!deposit) throw new Error('Deposit not found')
  var { error: updateError } = await supabase.from('deposits').update({ status: 'approved', approved_at: new Date().toISOString() }).eq('id', id)
  if (updateError) throw updateError
  var { error: balanceError } = await supabase.rpc('add_balance', { user_id: deposit.user_id, amount: deposit.amount })
  if (balanceError) throw balanceError
  return true
}

export async function rejectDeposit(id: string) {
  var { error } = await supabase.from('deposits').update({ status: 'rejected' }).eq('id', id)
  if (error) throw error
  return true
}