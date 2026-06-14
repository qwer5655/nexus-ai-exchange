import { createClient } from '@supabase/supabase-js'

var SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
var SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
var SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

var supabaseUrl = SUPABASE_URL
var supabaseAnonKey = SUPABASE_ANON_KEY

export var supabase = createClient(supabaseUrl, supabaseAnonKey)

// supabaseAdmin is only available server-side; browser code must not import it
var serviceRoleKey = typeof window === 'undefined' ? SUPABASE_SERVICE_KEY : ''

export var supabaseAdmin = serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : null as any

export type DbResult<T> = T extends PromiseLike<infer U> ? U : never
export type DbResultOk<T> = T extends PromiseLike<{ data: infer U }> ? Exclude<U, null> : never
