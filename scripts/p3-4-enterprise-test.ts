export {}
var BASE = "http://localhost:3000"
var ADMIN_EMAIL = "benjoka912@gmail.com"
var testUserId = "00000000-0000-0000-0000-000000000001"
var results: any[] = []

async function check(name: string, fn: () => Promise<boolean>) {
  var ok = false
  try { ok = await fn() } catch {}
  results.push({ name, passed: ok, status: ok ? "PASS" : "FAIL" })
  console.log("  " + (ok ? "✅" : "❌") + " " + name)
}

async function main() {
  console.log("=== P3-4 ENTERPRISE TEST ===\n")

  await check("STEP 1: Create enterprise customer", async function() {
    var r = await fetch(BASE + "/api/admin/enterprise/customers", {
      method: "POST", headers: {"Content-Type":"application/json"},
      body: JSON.stringify({company_name:"Test Corp", admin_user_id:testUserId})
    })
    var d = await r.json()
    return d.customer && d.customer.company_name === "Test Corp"
  })

  await check("STEP 2: Update enterprise customer status", async function() {
    var list = await (await fetch(BASE + "/api/admin/enterprise/customers")).json()
    var id = list.customers?.[0]?.id
    if (!id) return false
    var r = await fetch(BASE + "/api/admin/enterprise/customers", {
      method: "PATCH", headers: {"Content-Type":"application/json"},
      body: JSON.stringify({id, status:"suspended"})
    })
    var d = await r.json()
    return d.customer?.status === "suspended"
  })

  await check("STEP 3: Add user permission", async function() {
    var r = await fetch(BASE + "/api/admin/enterprise/permissions", {
      method: "POST", headers: {"Content-Type":"application/json"},
      body: JSON.stringify({user_id:testUserId, feature:"analytics", level:"admin"})
    })
    var d = await r.json()
    return d.permission?.feature === "analytics" && d.permission?.level === "admin"
  })

  await check("STEP 4: Update permission level", async function() {
    var r = await fetch(BASE + "/api/admin/enterprise/permissions", {
      method: "POST", headers: {"Content-Type":"application/json"},
      body: JSON.stringify({user_id:testUserId, feature:"analytics", level:"write"})
    })
    var d = await r.json()
    return d.permission?.level === "write"
  })

  await check("STEP 5: Delete permission", async function() {
    var list = await (await fetch(BASE + "/api/admin/enterprise/permissions?user_id="+testUserId)).json()
    var permId = list.permissions?.[0]?.id
    if (!permId) return false
    var r = await fetch(BASE + "/api/admin/enterprise/permissions?id="+permId, {method:"DELETE"})
    var d = await r.json()
    return d.success === true
  })

  await check("STEP 6: Write and query audit log", async function() {
    var w = await fetch(BASE + "/api/admin/enterprise/audit", {
      method: "POST", headers: {"Content-Type":"application/json"},
      body: JSON.stringify({user_id:testUserId, action:"test_action", resource:"test_resource", details:{"key":"value"}})
    })
    var wd = await w.json()
    if (!wd.log?.id) return false
    var q = await (await fetch(BASE + "/api/admin/enterprise/audit?user_id="+testUserId+"&action=test_action")).json()
    return (q.logs||[]).length >= 1
  })

  await check("STEP 7: Frontend page accessible", async function() {
    var r = await fetch(BASE + "/admin/enterprise")
    return r.status === 200
  })

  console.log("\n=== SUMMARY ===")
  var passed = results.filter(function(r) { return r.passed }).length
  var failed = results.filter(function(r) { return !r.passed }).length
  console.log("  Passed: " + passed + "/" + results.length)
  console.log("  Failed: " + failed)

  var report = {
    status: passed === results.length ? "P3-4 FINAL LOCKED" : "FAIL",
    timestamp: new Date().toISOString(),
    passed: passed,
    failed: failed,
    checks: results
  }
  var { writeFileSync } = await import("fs")
  writeFileSync("C:\\Users\\benjo\\Documents\\Codex\\2026-06-11\\files-mentioned-by-the-user-txt\\outputs\\p3-4-final-report.json", JSON.stringify(report, null, 2))
  console.log("\n  Report: outputs/p3-4-final-report.json")
  console.log("  Status: " + report.status)
}
main().catch(function(e) { console.error("FATAL:", e) })
