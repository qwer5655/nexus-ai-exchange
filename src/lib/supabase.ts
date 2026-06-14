import { createClient } from '@supabase/supabase-js'

var SUPABASE_URL = 'https://dcfwldxwyvvotvfdnywy.supabase.co'
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZndsZHh3eXZ2b3R2ZmRueXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NTA3MjYsImV4cCI6MjA5NjQyNjcyNn0.hoVRtNWXr0nzYLaQlR3yTlnOXUOlgBTYPMM1WdFBXjk'
var SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZndsZHh3eXZ2b3R2ZmRueXd5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDg1MDcyNiwiZXhwIjoyMDk2NDI2NzI2fQ.dATPuFYs8YF0esN0tk7dATxTEIo_dZambcYJkJ3gEU0'

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
