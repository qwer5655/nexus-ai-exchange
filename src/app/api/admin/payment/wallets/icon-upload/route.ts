import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { emitEvent } from '@/lib/business-events'

var SU = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dcfwldxwyvvotvfdnywy.supabase.co'
var SK = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export async function POST(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var fd = await req.formData(); var file = fd.get('file') as File | null; var walletId = fd.get('wallet_id') as string | null
    if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 })
    var allowed = ['image/png', 'image/jpeg', 'image/webp']
    if (!allowed.includes(file.type)) return NextResponse.json({ error: 'Only PNG, JPG, WEBP' }, { status: 400 })
    if (file.size > 2 * 1024 * 1024) return NextResponse.json({ error: 'Max 2MB' }, { status: 400 })
    var fileName = 'icon-' + (walletId || 'new') + '-' + Date.now() + '.' + file.name.split('.').pop()
    var buf = await file.arrayBuffer()
    var r = await fetch(SU + '/storage/v1/object/wallet-icons/' + fileName, { method: 'POST', headers: {'Authorization':'Bearer '+SK,'Content-Type':file.type}, body: buf })
    if (!r.ok) return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    var url = SU + '/storage/v1/object/public/wallet-icons/' + fileName
    await emitEvent('wallet.icon_uploaded', auth.userId, { wallet_id: walletId, file: fileName })
    return NextResponse.json({ success: true, url: url })
  } catch(e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

