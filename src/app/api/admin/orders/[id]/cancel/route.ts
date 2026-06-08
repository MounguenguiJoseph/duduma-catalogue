import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

async function sendWhatsApp(to: string, text: string) {
  const WA_TOKEN = process.env.WHATSAPP_TOKEN
  const WA_PHONE_ID = process.env.WHATSAPP_PHONE_ID
  if (!WA_TOKEN || !WA_PHONE_ID) return
  await fetch(`https://graph.facebook.com/v20.0/${WA_PHONE_ID}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${WA_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body: text } }),
  })
}

export async function POST(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerClient()

  const { data: order, error: fetchErr } = await supabase
    .from('orders')
    .select('*')
    .eq('id', params.id)
    .single()

  if (fetchErr || !order) return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })

  // Remettre le stock
  await supabase.rpc('increment_stock', { p_code: order.product_code, p_qty: 1 }).maybeSingle()

  await supabase
    .from('orders')
    .update({ status: 'annulé_admin', reserved_until: null })
    .eq('id', params.id)

  await sendWhatsApp(
    order.customer_phone,
    `❌ Votre commande *${order.payment_reference}* a été annulée.\n\nSi vous souhaitez recommander, envoyez simplement *Je veux commander ${order.product_code}*.`
  )

  return NextResponse.json({ ok: true })
}
