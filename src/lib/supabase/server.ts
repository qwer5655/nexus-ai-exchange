import 'server-only'
import { createClient } from '@supabase/supabase-js'

var supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
var supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Server-only admin client with service role key
// NEVER import this file from client components
export var supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// Safe server-side supabase client using anon key (for public endpoints)
export var supabase = createClient(supabaseUrl, supabaseUrl ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '' : '')

export type DbResult<T> = T extends PromiseLike<infer U> ? U : never
export type DbResultOk<T> = T extends PromiseLike<{ data: infer U }> ? Exclude<U, null> : never
