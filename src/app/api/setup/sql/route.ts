import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  var sqlPath = path.join(process.cwd(), 'supabase', 'migrations', '001_schema.sql')
  var sql = fs.readFileSync(sqlPath, 'utf-8')
  return NextResponse.json({ sql: sql, length: sql.length })
}
