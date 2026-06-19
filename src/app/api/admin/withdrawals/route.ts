import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"
import { verifyAdmin, logAdminAction } from "@/lib/admin-auth"

export async function GET() {
  try {
    var { data, error } = await supabaseAdmin
      .from("balance_transactions")
      .select("*, profiles!inner(id, email, username)")
      .in("type", ["withdrawal", "adjustment"])
      .order("created_at", { ascending: false })
      .limit(100)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    var withdrawals = (data || []).map(function(tx: any) {
      var details: any = {}
      try { details = JSON.parse(tx.description || "{}") } catch(e) {}
      return {
        id: tx.id,
        userId: tx.user_id,
        userEmail: tx.profiles?.email || "",
        username: tx.profiles?.username || "",
        amount: details.status === "pending" ? (details.amount || 0) : Math.abs(tx.amount),
        requestedAmount: details.amount || 0,
        coin: details.coin || "USDT",
        network: details.network || "trc20",
        walletAddress: details.walletAddress || "",
        status: details.status || (tx.amount !== 0 ? "processed" : "pending"),
        adminId: details.adminId || null,
        adminNote: details.adminNote || "",
        balanceBefore: tx.balance_before,
        balanceAfter: tx.balance_after,
        processedAt: details.processedAt || null,
        createdAt: tx.created_at
      }
    })
    return NextResponse.json({ withdrawals })
  } catch(e: any) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  var auth = await verifyAdmin(req)
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    var body = await req.json()
    var { txId, action, adminNote } = body
    if (!txId || !action) {
      return NextResponse.json({ error: "txId, action required" }, { status: 400 })
    }
    if (!["approved", "rejected"].includes(action)) {
      return NextResponse.json({ error: "action must be approved or rejected" }, { status: 400 })
    }

    var { data: tx } = await supabaseAdmin.from("balance_transactions").select("*").eq("id", txId).single()
    if (!tx) return NextResponse.json({ error: "Transaction not found" }, { status: 404 })

    var details: any = {}
    try { details = JSON.parse(tx.description || "{}") } catch(e) {}
    if (details.status !== "pending") {
      return NextResponse.json({ error: "Withdrawal already processed" }, { status: 400 })
    }

    if (action === "approved") {
      var withdrawalAmount = details.amount || 0
      if (withdrawalAmount <= 0) return NextResponse.json({ error: "Invalid withdrawal amount" }, { status: 400 })

      // SINGLE deduction via the safe RPC — no double charge
      var { error: balanceErr } = await supabaseAdmin.rpc("add_balance", {
        p_user_id: tx.user_id,
        p_amount: -withdrawalAmount,
        p_type: "withdrawal",
        p_reference_type: "withdrawal",
        p_reference_id: tx.id,
        p_description: "Withdrawal approved: " + (details.coin || "USDT") + " " + withdrawalAmount
      })
      if (balanceErr) return NextResponse.json({ error: balanceErr.message }, { status: 500 })

      var { data: afterProfile } = await supabaseAdmin.from("profiles").select("balance").eq("id", tx.user_id).single()
      details.status = "approved"
      details.adminId = auth.userId
      details.adminNote = adminNote || ""
      details.processedAt = new Date().toISOString()
      details.balanceAfterApproval = afterProfile?.balance || 0

      await supabaseAdmin.from("balance_transactions").update({
        amount: -withdrawalAmount,
        balance_before: tx.balance_before,
        balance_after: afterProfile?.balance || 0,
        description: JSON.stringify(details)
      }).eq("id", txId)
    } else {
      details.status = "rejected"
      details.adminId = auth.userId
      details.adminNote = adminNote || ""
      details.processedAt = new Date().toISOString()

      await supabaseAdmin.from("balance_transactions").update({
        description: JSON.stringify(details)
      }).eq("id", txId)
    }

    await logAdminAction(auth.userId!, "withdrawal_" + action, "balance_transactions", txId, {
      userId: tx.user_id, amount: details.amount, note: adminNote
    })

    return NextResponse.json({ success: true })
  } catch(e: any) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
