import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

var SUPABASE_URL = 'https://dcfwldxwyvvotvfdnywy.supabase.co'
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZndsZHh3eXZ2b3R2ZmRueXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NTA3MjYsImV4cCI6MjA5NjQyNjcyNn0.hoVRtNWXr0nzYLaQlR3yTlnOXUOlgBTYPMM1WdFBXjk'
var SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZndsZHh3eXZ2b3R2ZmRueXd5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDg1MDcyNiwiZXhwIjoyMDk2NDI2NzI2fQ.dATPuFYs8YF0esN0tk7dATxTEIo_dZambcYJkJ3gEU0'

function parseUA(ua) {
  var b = "Unknown", o = "Unknown", d = "Unknown"
  if (!ua) return { browser: b, os: o, device: d }
  if (ua.includes("Chrome/")) { b = "Chrome"; var m = ua.match(/Chrome\/(\d+)/); if (m) b += " " + m[1] }
  else if (ua.includes("Firefox/")) { b = "Firefox"; var m = ua.match(/Firefox\/(\d+)/); if (m) b += " " + m[1] }
  else if (ua.includes("Safari/") && !ua.includes("Chrome")) { b = "Safari"; var m = ua.match(/Version\/(\d+)/); if (m) b += " " + m[1] }
  else if (ua.includes("Edg/")) { b = "Edge"; var m = ua.match(/Edg\/(\d+)/); if (m) b += " " + m[1] }
  if (ua.includes("Windows NT 10")) o = "Windows 10"
  else if (ua.includes("Windows NT 11")) o = "Windows 11"
  else if (ua.includes("Mac OS X")) o = "macOS"
  else if (ua.includes("iPhone")) { o = "iOS"; d = "Mobile" }
  else if (ua.includes("Android")) { o = "Android"; d = "Mobile" }
  else if (ua.includes("Linux")) o = "Linux"
  if (d === "Unknown" && (ua.includes("Mobile") || ua.includes("Android"))) d = "Mobile"
  else if (d === "Unknown") d = "Desktop"
  return { browser: b, os: o, device: d }
}

export async function POST(req) {
  try {
    var { email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 })

    var { data } = await supabaseAdmin.rpc("verify_login", { p_email: email, p_password: password })
    if (!data || data.length === 0) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    if (!data[0].is_valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })

    var userId = data[0].user_id
    var { data: profile } = await supabaseAdmin.from("profiles").select("*").eq("id", userId).single()
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

    var accessToken = null
    try {
      var tokResp = await fetch(SUPABASE_URL + "/auth/v1/token?grant_type=password", {
        method: "POST",
        headers: { "apikey": SUPABASE_ANON_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })
      var tokData = await tokResp.json()
      if (tokData?.access_token) accessToken = tokData.access_token
    } catch(e: any) {}

    // Record login event
    var clientIp = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown"
    var userAgent = req.headers.get("user-agent") || ""
    var uaInfo = parseUA(userAgent)
    var detailsObj = { email: profile.email, username: profile.username, user_agent: userAgent, browser: uaInfo.browser, os: uaInfo.os, device: uaInfo.device, ip_address: clientIp }

    // Strategy A: Set Prefer header on supabase-js builder (bypasses representation response-building)
    try {
      var builder = supabaseAdmin.from("admin_logs").insert({
        admin_id: userId, action: "user_login", target_type: "user", target_id: userId, details: detailsObj
      })
      if (typeof builder.setHeader === "function") {
        await builder.setHeader("Prefer", "return=minimal").then(function(r) {})
      }
    } catch(e: any) {}

    // Strategy B: RPC function (bypasses PostgREST schema cache)
    try {
      await supabaseAdmin.rpc("log_admin_action", {
        p_admin_id: userId, p_action: "user_login",
        p_target_type: "user", p_target_id: userId, p_details: detailsObj
      })
    } catch(e: any) {}

    // Strategy C: Raw HTTP with Prefer: return=minimal
    try {
      var resp = await fetch(SUPABASE_URL + "/rest/v1/admin_logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_SERVICE_KEY,
          "Authorization": "Bearer " + SUPABASE_SERVICE_KEY,
          "Prefer": "return=minimal"
        },
        body: JSON.stringify({
          admin_id: userId, action: "user_login", target_type: "user", target_id: userId, details: detailsObj
        })
      })
    } catch(e: any) {}

    return NextResponse.json({
      user: { id: userId, email: profile.email, username: profile.username, role: profile.role },
      access_token: accessToken
    })
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}





