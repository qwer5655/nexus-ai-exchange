var fs = require('fs');
var p = 'C:/Users/benjo/Documents/Codex/2026-06-07/codex-claude-code-cursor-devin-50/fifa-arbitrage/scripts/full-flow-acceptance.ts';
var c = fs.readFileSync(p, 'utf-8');
c = c.split("'autotest_master@example.com'").join("'autotest_master_' + runId + '@example.com'");
c = c.replace('tests.register = !!masterUserId', 'tests.register = !!masterUserId\n  console.log("  TEST EMAIL: autotest_master_" + runId + "@example.com")');
fs.writeFileSync(p, c, 'utf-8');
console.log('Done');
