var fs = require('fs');
var p = 'C:/Users/benjo/Documents/Codex/2026-06-07/codex-claude-code-cursor-devin-50/fifa-arbitrage/src/app/api/admin/deposits/route.ts';
var c = fs.readFileSync(p, 'utf-8');

// Replace the approve block to add diagnostic logs
var oldApprove = '      var { error: rpcErr } = await supabaseAdmin.rpc(\"add_balance\", { p_user_id: deposit.user_id, p_amount: deposit.amount, p_type: \"deposit\", p_reference_type: \"deposit\", p_reference_id: depositId })\n' +
'      if (rpcErr) await supabaseAdmin.from(\"profiles\").update({ balance: newBalance }).eq(\"id\", deposit.user_id)\n' +
'      var { data: ba } = await supabaseAdmin.from(\"profiles\").select(\"balance\").eq(\"id\", deposit.user_id).single()\n' +
'      var afterVal = ba?.balance || 0\n' +
'      if (afterVal <= beforeVal) {\n' +
'        return NextResponse.json({ success: false, error: \"BALANCE_UPDATE_FAILED\" }, { status: 500 })\n' +
'      }';

var newApprove = '      console.log(\"RPC_DIAG balanceBefore=\" + beforeVal + \" amount=\" + deposit.amount)\n' +
'      var { error: rpcErr } = await supabaseAdmin.rpc(\"add_balance\", { p_user_id: deposit.user_id, p_amount: deposit.amount, p_type: \"deposit\", p_reference_type: \"deposit\", p_reference_id: depositId })\n' +
'      console.log(\"RPC_DIAG rpcError=\" + (rpcErr ? rpcErr.message : \"(none)\"))\n' +
'      if (rpcErr) {\n' +
'        console.log(\"RPC_DIAG fallbackExecuted=true newBalance=\" + newBalance)\n' +
'        await supabaseAdmin.from(\"profiles\").update({ balance: newBalance }).eq(\"id\", deposit.user_id)\n' +
'      }\n' +
'      var { data: ba } = await supabaseAdmin.from(\"profiles\").select(\"balance\").eq(\"id\", deposit.user_id).single()\n' +
'      var afterVal = ba?.balance || 0\n' +
'      console.log(\"RPC_DIAG balanceAfter=\" + afterVal + \" delta=\" + (afterVal - beforeVal))\n' +
'      if (afterVal <= beforeVal) {\n' +
'        console.log(\"RPC_DIAG result=BALANCE_UPDATE_FAILED\")\n' +
'        return NextResponse.json({ success: false, error: \"BALANCE_UPDATE_FAILED\" }, { status: 500 })\n' +
'      }\n' +
'      console.log(\"RPC_DIAG result=APPROVED\")';

c = c.replace(oldApprove, newApprove);

// Add commission diagnostic logs
var oldComm = '      // Commission: 5% to referrer\n' +
'      try {\n' +
'        var { data: refBy } = await supabaseAdmin.from(\"profiles\").select(\"referred_by\").eq(\"id\", deposit.user_id).maybeSingle()\n' +
'        if (refBy?.referred_by) {\n' +
'          var commAmt = Math.round(deposit.amount * 0.05 * 100) / 100';

var newComm = '      // Commission: 5% to referrer\n' +
'      try {\n' +
'        var { data: refBy } = await supabaseAdmin.from(\"profiles\").select(\"referred_by\").eq(\"id\", deposit.user_id).maybeSingle()\n' +
'        console.log(\"COMMISSION_DIAG referred_by=\" + (refBy?.referred_by || \"(none)\"))\n' +
'        if (refBy?.referred_by) {\n' +
'          var commAmt = Math.round(deposit.amount * 0.05 * 100) / 100\n' +
'          console.log(\"COMMISSION_DIAG triggered=true amount=\" + commAmt + \" referrer=\" + refBy.referred_by)';

c = c.replace(oldComm, newComm);

// Add commission success log
c = c.replace('          await supabaseAdmin.from(\"balance_transactions\").insert({ user_id: refBy.referred_by, type: \"commission\", amount: commAmt, balance_before: refBal, balance_after: refBal + commAmt, reference_type: \"deposit\", reference_id: depositId, description: \"Referral commission 5% of \" + deposit.amount, created_by: auth.userId })',
'          console.log(\"COMMISSION_DIAG success=true refBal=\" + refBal + \" -> \" + (refBal + commAmt))\n' +
'          await supabaseAdmin.from(\"balance_transactions\").insert({ user_id: refBy.referred_by, type: \"commission\", amount: commAmt, balance_before: refBal, balance_after: refBal + commAmt, reference_type: \"deposit\", reference_id: depositId, description: \"Referral commission 5% of \" + deposit.amount, created_by: auth.userId })');

fs.writeFileSync(p, c, 'utf-8');
console.log('Done');
