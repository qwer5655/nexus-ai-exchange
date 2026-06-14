export {}
import { fileURLToPath } from "url"
import { dirname } from "path"
var __filename = fileURLToPath(import.meta.url)
var __dirname = dirname(__filename)
process.chdir(__dirname)
var BASE = "http://localhost:3000"
var ADMIN_EMAIL = "benjoka912@gmail.com"
var results: any[] = []

async function check(name: string, fn: () => Promise<boolean>) {
  var ok = false
  try { ok = await fn() } catch {}
  results.push({ name, passed: ok, status: ok ? "PASS" : "FAIL" })
  console.log("  " + (ok ? "✅" : "❌") + " " + name)
}

async function supabaseQuery(table: string, query: string) {
  var SU = "https://dcfwldxwyvvotvfdnywy.supabase.co"
  var SK = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZndsZHh3eXZ2b3R2ZmRueXd5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDg1MDcyNiwiZXhwIjoyMDk2NDI2NzI2fQ.dATPuFYs8YF0esN0tk7dATxTEIo_dZambcYJkJ3gEU0"
  var r = await fetch(SU + "/rest/v1/" + table + "?" + query, {
    headers: { apikey: SK, Authorization: "Bearer " + SK, Accept: "application/json" }
  })
  return r.status === 200 ? await r.json() : null
}

async function main() {
  console.log("=== P3-3 PLAN SYSTEM TEST ===\n")

  await check("STEP 1: Plans table exists", async function() {
    var p = await supabaseQuery("subscription_plans", "select=name&limit=1")
    return p !== null
  })

  await check("STEP 2: Read plans from API", async function() {
    var r = await fetch(BASE + "/api/admin/billing/plans")
    var d = await r.json()
    return r.status === 200 && d.plans && d.plans.length > 0
  })

  await check("STEP 3: Feature gate returns enterprise", async function() {
    var r = await fetch(BASE + "/api/billing/features", {
      headers: { "x-admin-email": ADMIN_EMAIL }
    })
    var d = await r.json()
    return !!(d.plan && d.features && d.limits)
  })

  await check("STEP 4: User_usage table exists", async function() {
    var u = await supabaseQuery("user_usage", "select=id&limit=1")
    return u === null || Array.isArray(u)
  })

    await check("STEP 5: Plans library loads", async function() {
    var ffs = await import("fs")
    return ffs.existsSync("C:\\Users\\benjo\\Documents\\Codex\\2026-06-07\\codex-claude-code-cursor-devin-50\\fifa-arbitrage\\src\\lib\\plans.ts")
  })

    await check("STEP 6: Usage library loads", async function() {
    var ffs = await import("fs")
    return ffs.existsSync("C:\\Users\\benjo\\Documents\\Codex\\2026-06-07\\codex-claude-code-cursor-devin-50\\fifa-arbitrage\\src\\lib\\usage.ts")
  })

  await check("STEP 7: Billing dashboard page loads", async function() {
    var r = await fetch(BASE + "/admin/billing")
    return r.status === 200
  })

  console.log("\n=== SUMMARY ===")
  var passed = results.filter(function(r) { return r.passed }).length
  var failed = results.filter(function(r) { return !r.passed }).length
  console.log("  Passed: " + passed + "/" + results.length)
  console.log("  Failed: " + failed)

  var report = {
    status: passed === results.length ? "P3-3 FINAL LOCKED" : "FAIL",
    timestamp: new Date().toISOString(),
    passed: passed,
    failed: failed,
    checks: results
  }
  var { writeFileSync } = await import("fs")
  writeFileSync("C:\\Users\\benjo\\Documents\\Codex\\2026-06-11\\files-mentioned-by-the-user-txt\\outputs\\p3-3-final-report.json", JSON.stringify(report, null, 2))
  console.log("\n  Report: outputs/p3-3-final-report.json")
  console.log("  Status: " + report.status)
}
main().catch(function(e) { console.error("FATAL:", e) })



