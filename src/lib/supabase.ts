import { createClient } from '@supabase/supabase-js'
var supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
var supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
var serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export var supabase = createClient(supabaseUrl, supabaseAnonKey)

export var supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

export type DbResult<T> = T extends PromiseLike<infer U> ? U : never
export type DbResultOk<T> = T extends PromiseLike<{ data: infer U }> ? Exclude<U, null> : never