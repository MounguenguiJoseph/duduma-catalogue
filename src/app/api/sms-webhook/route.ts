import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

const SMS_WEBHOOK_SECRET = process.env.SMS_WEBHOOK_SECRET ?? ''

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

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-webhook-secret') ?? req.nextUrl.searchParams.get('secret')
  if (SMS_WEBHOOK_SECRET && secret !== SMS_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  // SMS Forwarder apps envoient généralement: { from, body, timestamp }
  const smsText: string = body.body ?? body.message ?? body.sms ?? ''
  const from: string = body.from ?? body.sender ?? ''

  // Extraire référence CEF-XXXX et montant depuis le SMS Airtel/Moov
  const refMatch = smsText.match(/CEF-(\d{4})/i)
  const amountMatch = smsText.match(/(\d[\d\s]+)\s*(?:FCFA|F\s*CFA|XAF)/i)

  if (!refMatch) {
    return NextResponse.json({ ok: false, reason: 'no_reference_found' })
  }

  const reference = `CEF-${refMatch[1]}`
  const smsAmount = amountMatch
    ? parseInt(amountMatch[1].replace(/\s/g, ''), 10)
    : null

  const supabase = createServerClient()

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('payment_reference', reference)
    .eq('status', 'en_attente_paiement')
    .single()

  if (!order) {
    return NextResponse.json({ ok: false, reason: 'order_not_found', reference })
  }

  // Vérifier montant si extrait du SMS
  if (smsAmount !== null && Math.abs(smsAmount - order.total_price) > 100) {
    return NextResponse.json({ ok: false, reason: 'amount_mismatch', expected: order.total_price, received: smsAmount })
  }

  await supabase
    .from('orders')
    .update({ status: 'payé', reserved_until: null, sms_transaction: smsText, payment_phone: from })
    .eq('id', order.id)

  const DRIVER_PHONE = process.env.DRIVER_PHONE ?? ''

  const customerMsg =
    `Paiement reçu — Chic en Friperie\n\n` +
    `Merci ${order.customer_name ?? ''}, votre paiement pour la commande ${reference} a bien été enregistré.\n\n` +
    `${order.product_name} — ${order.total_price?.toLocaleString('fr-FR')} FCFA\n\n` +
    `Un livreur prendra contact avec vous prochainement.`

  await sendWhatsApp(order.customer_phone, customerMsg)

  if (DRIVER_PHONE) {
    const driverMsg =
      `NOUVELLE LIVRAISON — Chic en Friperie\n\nRef : ${reference}\nClient : ${order.customer_name ?? order.customer_phone}\nTel : ${order.customer_phone}\nProduit : ${order.product_name}\nMontant : ${order.total_price?.toLocaleString('fr-FR')} FCFA\nAdresse : ${order.delivery_address ?? 'A confirmer'}`
    await sendWhatsApp(DRIVER_PHONE, driverMsg)
  }

  return NextResponse.json({ ok: true, order_id: order.id, reference })
}
