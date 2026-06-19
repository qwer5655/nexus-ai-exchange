export {}
var SU = "https://dcfwldxwyvvotvfdnywy.supabase.co"
var SK = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZndsZHh3eXZ2b3R2ZmRueXd5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDg1MDcyNiwiZXhwIjoyMDk2NDI2NzI2fQ.dATPuFYs8YF0esN0tk7dATxTEIo_dZambcYJkJ3gEU0"

var tables = [
  "profiles","deposits","referrals","notifications","opportunities","unlocks",
  "admin_logs","analytics_events","automation_metrics","balance_transactions",
  "idempotency_keys","user_credits","system_events","stripe_events",
  "subscription_plans","user_usage","enterprise_customers","enterprise_permissions","enterprise_audit_log"
]

async function main() {
  console.log("=== Migration Check ===\n")
  var results: any[] = []
  for (var t of tables) {
    try {
      var r = await fetch(SU + "/rest/v1/" + t + "?select=id&limit=1", {
        headers: { apikey: SK, Authorization: "Bearer " + SK, Accept: "application/json" }
      })
      if (r.status === 200) {
        results.push({ table: t, status: "PASS" })
        console.log("  ✅ " + t)
      } else {
        results.push({ table: t, status: "MISSING" })
        console.log("  ❌ " + t)
      }
    } catch {
      results.push({ table: t, status: "MISSING" })
      console.log("  ❌ " + t + " (error)")
    }
  }
  var missing = results.filter(function(r) { return r.status === "MISSING" })
  console.log("\n  Passed: " + (results.length - missing.length) + "/" + results.length)
  console.log("  Missing: " + missing.length)
  
  var { writeFileSync } = await import("fs")
  writeFileSync("C:\\Users\\benjo\\Documents\\Codex\\2026-06-11\\files-mentioned-by-the-user-txt\\outputs\\migration-check.json", JSON.stringify({ status: missing.length === 0 ? "ALL_PASS" : "MISSING", timestamp: new Date().toISOString(), tables: results }, null, 2))
  console.log("\n  Migration check saved ✅")
}
main().catch(function(e) { console.error("FATAL:", e) })
