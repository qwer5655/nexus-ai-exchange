import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"
export async function GET() {
  try {
    var { data } = await supabaseAdmin.from("banners").select("*").eq("active", true).order("sort_order", { ascending: true })
    return NextResponse.json({ success: true, data: { banners: data || [] }, error: null, timestamp: new Date().toISOString() })
  } catch(e: any) { return NextResponse.json({ success: true, data: { banners: [] }, error: null, timestamp: new Date().toISOString() }) }
}
