import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"
export async function GET() {
  try {
    var { data } = await supabaseAdmin.from("categories").select("*").order("name", { ascending: true })
    return NextResponse.json({ success: true, data: { categories: data || [] }, error: null, timestamp: new Date().toISOString() })
  } catch(e: any) { return NextResponse.json({ success: false, data: null, error: (e as Error).message, timestamp: new Date().toISOString() }, { status: 500 }) }
}
