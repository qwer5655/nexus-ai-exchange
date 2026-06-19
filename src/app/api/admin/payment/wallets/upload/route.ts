import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { emitEvent } from '@/lib/business-events'

export async function POST(req: Request) {
  var auth = await verifyAdmin(req); if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    var formData = await req.formData()
    var file = formData.get('file') as File | null
    var walletId = formData.get('wallet_id') as string | null
    if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 })

    // Validate file type
    var allowedTypes = ['image/png', 'image/jpeg', 'image/webp']
    if (!allowedTypes.includes(file.type)) return NextResponse.json({ error: 'Only PNG, JPG, WEBP allowed' }, { status: 400 })
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Max 5MB' }, { status: 400 })

    // Upload to Supabase Storage
    var SU = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dcfwldxwyvvotvfdnywy.supabase.co'
    var SK = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    var fileName = 'wallet-' + (walletId || 'new') + '-' + Date.now() + '.' + file.name.split('.').pop()
    var buffer = await file.arrayBuffer()

    var uploadRes = await fetch(SU + '/storage/v1/object/wallet-qrcodes/' + fileName, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + SK, 'Content-Type': file.type },
      body: buffer
    })
    if (!uploadRes.ok) { var err = await uploadRes.text(); return NextResponse.json({ error: 'Upload failed: ' + err.substring(0, 100) }, { status: 500 }) }

    var qrUrl = SU + '/storage/v1/object/public/wallet-qrcodes/' + fileName
    await emitEvent('wallet.qrcode_uploaded', auth.userId, { wallet_id: walletId, file: fileName })
    return NextResponse.json({ success: true, url: qrUrl })
  } catch(e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
