import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"
import { verifyAdmin } from "@/lib/admin-auth"

export async function GET(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var { data } = await supabaseAdmin.from("deposit_plans").select("*").order("amount", { ascending: true })
    return NextResponse.json({ plans: data || [] })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}

export async function POST(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var body = await req.json()
    var { data } = await supabaseAdmin.from("deposit_plans").insert({
      amount: body.amount, bonus: body.bonus || "No bonus", popular: body.popular || false
    }).select().single()
    return NextResponse.json({ plan: data })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}

export async function PUT(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var body = await req.json()
    if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 })
    var updates: any = { updated_at: new Date().toISOString() }
    if (body.amount !== undefined) updates.amount = body.amount
    if (body.bonus !== undefined) updates.bonus = body.bonus
    if (body.popular !== undefined) updates.popular = body.popular
    if (body.enabled !== undefined) updates.enabled = body.enabled
    var { data } = await supabaseAdmin.from("deposit_plans").update(updates).eq("id", body.id).select().single()
    return NextResponse.json({ plan: data })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}

export async function DELETE(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var url = new URL(req.url); var id = url.searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
    await supabaseAdmin.from("deposit_plans").delete().eq("id", id)
    return NextResponse.json({ success: true })
  } catch(e: any) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
}
