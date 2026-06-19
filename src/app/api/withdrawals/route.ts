import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"
import { verifyAuth } from "@/lib/admin-auth"

export async function GET(req: Request) {
  try {
    // SECURITY: userId MUST come from session, NOT from query params
    var auth = await verifyAuth(req)
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

    var url = new URL(req.url)
    var queryUserId = url.searchParams.get("userId")
    // Admin can view any user's withdrawals; regular users can only view their own
    var userId = (auth.role === 'admin' || auth.role === 'super_admin') && queryUserId ? queryUserId : auth.userId!

    var { data: withdrawals } = await supabaseAdmin
      .from("balance_transactions")
      .select("*")
      .eq("user_id", userId)
      .in("type", ["withdrawal", "adjustment"])
      .order("created_at", { ascending: false })
    return NextResponse.json({ withdrawals: withdrawals || [] })
  } catch(e: any) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    // SECURITY: userId MUST come from session, NOT from request body
    var auth = await verifyAuth(req)
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

    var body = await req.json()
    var { amount, coin = "USDT", network = "trc20", walletAddress, userId: bodyUserId } = body
    if (!amount || !walletAddress) {
      return NextResponse.json({ error: "amount, walletAddress required" }, { status: 400 })
    }
    if (amount < 10) return NextResponse.json({ error: "Minimum withdrawal is $10" }, { status: 400 })

    // Admin can withdraw for other users; regular users withdraw from their own account
    var userId = (auth.role === 'admin' || auth.role === 'super_admin') && bodyUserId ? bodyUserId : auth.userId!

    var { data: profile } = await supabaseAdmin.from("profiles").select("balance").eq("id", userId).single()
    if (!profile) return NextResponse.json({ error: "User not found" }, { status: 404 })
    if (profile.balance < amount) return NextResponse.json({ error: "Insufficient balance" }, { status: 402 })

    var details = JSON.stringify({ amount, coin, network, walletAddress, status: "pending", createdAt: new Date().toISOString() })

    // Create a pending withdrawal record — NO balance deduction
    // Balance will be deducted by admin on approval
    var { data: tx, error: txErr } = await supabaseAdmin.from("balance_transactions").insert({
      user_id: userId,
      type: "withdrawal",
      amount: 0,
      balance_before: profile.balance,
      balance_after: profile.balance,
      description: details,
      reference_type: "withdrawal",
      reference_id: userId + "_" + Date.now()
    }).select().single()

    if (txErr) return NextResponse.json({ error: txErr.message }, { status: 500 })

    return NextResponse.json({ success: true, withdrawal: tx })
  } catch(e: any) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
