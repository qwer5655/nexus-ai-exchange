import { supabaseAdmin } from '@/lib/supabase/server'
import { supabaseAdmin as sa } from '@/lib/supabase/server'

export async function deductBalance(
  userId: string,
  amount: number,
  referenceType: string,
  referenceId: string,
  description?: string
) {
  var { error } = await sa.rpc('add_balance', {
    p_user_id: userId,
    p_amount: amount,
    p_type: 'adjustment',
    p_reference_type: referenceType,
    p_reference_id: referenceId,
    p_description: description || ''
  })
  if (error) throw new Error('Balance operation failed: ' + error.message)
  return true
}

export async function getBalance(userId: string): Promise<number> {
  var { data } = await sa.from('profiles').select('balance').eq('id', userId).single()
  return data?.balance ?? 0
}

export async function createTransaction(data: {
  userId: string
  type: string
  amount: number
  balanceBefore: number
  balanceAfter: number
  referenceType?: string
  referenceId?: string
  description?: string
}) {
  var { error } = await sa.from('balance_transactions').insert({
    user_id: data.userId,
    type: data.type,
    amount: data.amount,
    balance_before: data.balanceBefore,
    balance_after: data.balanceAfter,
    reference_type: data.referenceType || null,
    reference_id: data.referenceId || null,
    description: data.description || null
  })
  if (error) throw new Error('Transaction record failed: ' + error.message)
  return true
}
