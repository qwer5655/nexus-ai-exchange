// get-current-user.ts — Single source of truth for user identity + role
// ROLE IS ALWAYS FROM profiles.role (NEVER from JWT, cache, or login response)

import { supabaseAdmin } from '@/lib/supabase/server'

export interface AuthUser {
  id: string
  email: string
  role: string
}

export async function getCurrentUser(req: Request): Promise<AuthUser | null> {
  var authHeader = req.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) return null

  var token = authHeader.slice(7)
  try {
    var { data: { user } } = await supabaseAdmin.auth.getUser(token)
    if (!user) return null

    var { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, email, role")
      .eq("id", user.id)
      .single()

    if (!profile) return null
    return { id: profile.id, email: profile.email, role: profile.role || "user" }
  } catch(e: any) {
    return null
  }
}
