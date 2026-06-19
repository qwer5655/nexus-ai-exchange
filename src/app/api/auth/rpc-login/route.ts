// DEPRECATED: Frontend now uses /api/auth/login instead. Keep for backwards compatibility.
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

var SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
var SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function POST(req: Request) {
  try {
    var { email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 })

    // Step 1: Authenticate via standard Supabase Auth
    var { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({ email, password })

    // If email not confirmed, try to confirm and retry
    if (!authData?.user && authError) {
      // Try to find the user via email
      var { data: foundUser } = await supabaseAdmin.from('profiles').select('id').eq('email', email).maybeSingle()
      if (!foundUser) {
        // Try to get user from auth by admin lookup
        var { data: users } = await supabaseAdmin.auth.admin.listUsers()
        var matchUser = users?.users?.find(function(u: any) { return u.email === email })
        if (matchUser) {
          // Confirm email and retry login
          await supabaseAdmin.auth.admin.updateUserById(matchUser.id, { email_confirm: true }).catch(function(){})
          var retry = await supabaseAdmin.auth.signInWithPassword({ email, password })
          if (retry.data?.user) authData = retry.data
        }
      }
    }

    if (!authData?.user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    var userId = authData.user.id

    // Step 2: Get or create profile
    var { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', userId).maybeSingle()
    if (!profile) {
      await supabaseAdmin.from('profiles').upsert({
        id: userId, email, username: email.split('@')[0],
        role: 'user', balance: 0, created_at: new Date().toISOString()
      })
      var { data: newProfile } = await supabaseAdmin.from('profiles').select('*').eq('id', userId).single()
      profile = newProfile
    }

    // Step 3: Get access_token via GoTrue Auth REST API
    var accessToken = null
    try {
      var tokResp = await fetch(SUPABASE_URL + '/auth/v1/token?grant_type=password', {
        method: 'POST',
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      var tokData = await tokResp.json()
      if (tokData?.access_token) accessToken = tokData.access_token
    } catch(e: any) {}

    return NextResponse.json({
      user: { id: userId, email: profile.email, username: profile.username, role: profile.role, vip_level: profile.vip_level ?? 0 },
      access_token: accessToken
    })
  } catch(e: any) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
