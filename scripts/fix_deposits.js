var fs = require('fs');
var p = 'C:/Users/benjo/Documents/Codex/2026-06-07/codex-claude-code-cursor-devin-50/fifa-arbitrage/src/app/api/admin/deposits/route.ts';
var c = fs.readFileSync(p, 'utf-8');

// Move deposits.update({status:'approved'}) to AFTER balance verification
// Replace: deposit update -> RPC -> fallback -> query balance
// With:    RPC -> fallback -> query balance -> verify -> deposit update

var oldBlock = "      await supabaseAdmin.from('deposits').update({ status: 'approved', approved_at: new Date().toISOString() }).eq('id', depositId)\n" +
"      var { error: rpcErr } = await supabaseAdmin.rpc('add_balance', { p_user_id: deposit.user_id, p_amount: deposit.amount, p_type: 'deposit', p_reference_type: 'deposit', p_reference_id: depositId })\n" +
"      if (rpcErr) await supabaseAdmin.from('profiles').update({ balance: newBalance }).eq('id', deposit.user_id)\n" +
"      var { data: ba } = await supabaseAdmin.from('profiles').select('balance').eq('id', deposit.user_id).single()\n" +
"      var afterVal = ba?.balance || newBalance";

var newBlock = "      var { error: rpcErr } = await supabaseAdmin.rpc('add_balance', { p_user_id: deposit.user_id, p_amount: deposit.amount, p_type: 'deposit', p_reference_type: 'deposit', p_reference_id: depositId })\n" +
"      if (rpcErr) await supabaseAdmin.from('profiles').update({ balance: newBalance }).eq('id', deposit.user_id)\n" +
"      var { data: ba } = await supabaseAdmin.from('profiles').select('balance').eq('id', deposit.user_id).single()\n" +
"      var afterVal = ba?.balance || 0\n" +
"      if (afterVal <= beforeVal) {\n" +
"        return NextResponse.json({ success: false, error: 'BALANCE_UPDATE_FAILED' }, { status: 500 })\n" +
"      }\n" +
"      await supabaseAdmin.from('deposits').update({ status: 'approved', approved_at: new Date().toISOString() }).eq('id', depositId)";

c = c.replace(oldBlock, newBlock);
fs.writeFileSync(p, c, 'utf-8');
console.log('Done');
