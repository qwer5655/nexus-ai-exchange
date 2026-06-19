import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { plans } from '@/lib/plans'

import { verifyAdmin } from '@/lib/admin-auth'
export async function GET(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var { data: dbPlans } = await supabaseAdmin.from('subscription_plans').select('*').order('price', { ascending: true })
    var { data: userCounts } = await supabaseAdmin.from('profiles').select('vip_level')
    var totalUsers = (userCounts || []).length
    var byPlan: Record<string, number> = { free: 0, pro: 0, enterprise: 0 }
    ;(userCounts || []).forEach(function(u: any) {
      var key = u.vip_level >= 2 ? 'enterprise' : u.vip_level >= 1 ? 'pro' : 'free'
      byPlan[key] = (byPlan[key] || 0) + 1
    })

    return NextResponse.json({
      plans: (dbPlans || []).map(function(p: any) { return { name: p.name, price: p.price, credits: p.credits, features: p.features, limits: p.limits } }),
      users: { total: totalUsers, by_plan: byPlan },
      revenue: { monthly: Object.entries(byPlan).reduce(function(s: number, e: any) { return s + (plans[e[0]]?.monthly_price || 0) * e[1] }, 0) }
    })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}

export async function POST(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var body = await req.json()
    var { name, price, credits, features, limits } = body
    if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })
    var { data } = await supabaseAdmin.from('subscription_plans')
      .upsert({ name, price, credits, features: features || {}, limits: limits || {} }, { onConflict: 'name' })
      .select().single()
    return NextResponse.json({ plan: data })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}



export async function PATCH(req) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var body = await req.json(); var { id, ...updates } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    updates.updated_at = new Date().toISOString()
    var { data, error } = await supabaseAdmin.from('subscription_plans').update(updates).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data: data })
  } catch(e) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}

export async function DELETE(req) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var url = new URL(req.url); var id = url.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    var { error } = await supabaseAdmin.from('subscription_plans').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch(e) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}