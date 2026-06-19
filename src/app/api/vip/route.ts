import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { verifyAuth } from '@/lib/admin-auth'

// GET /api/vip/plans - list available VIP plans
export async function GET() {
  try {
    var { data } = await supabaseAdmin.from('vip_plans').select('*').order('price', { ascending: true })
    return NextResponse.json({ success: true, data: { plans: data || [] } })
  } catch(e: any) {
    return NextResponse.json({ success: false, data: null, error: (e as Error).message }, { status: 500 })
  }
}

// POST /api/vip/purchase - buy VIP with balance
export async function POST(req: Request) {
  try {
    var auth = await verifyAuth(req)
    if (!auth.authorized) return NextResponse.json({ success: false, data: null, error: auth.error }, { status: auth.status })

    var { planId } = await req.json()
    if (!planId) return NextResponse.json({ success: false, data: null, error: 'planId is required' }, { status: 400 })

    var { data: result, error } = await supabaseAdmin.rpc('purchase_vip', {
      p_user_id: auth.userId,
      p_plan_id: planId
    })

    if (error) return NextResponse.json({ success: false, data: null, error: error.message }, { status: 500 })
    if (!result?.success) return NextResponse.json({ success: false, data: null, error: result?.error }, { status: 400 })

    return NextResponse.json({ success: true, data: result })
  } catch(e: any) {
    return NextResponse.json({ success: false, data: null, error: (e as Error).message }, { status: 500 })
  }
}
