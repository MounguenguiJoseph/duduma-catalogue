import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

const WA_TOKEN = process.env.WHATSAPP_TOKEN!
const WA_PHONE_ID = process.env.WHATSAPP_PHONE_ID!
const DRIVER_PHONE = process.env.DRIVER_PHONE ?? ''

async function sendWhatsApp(to: string, text: string) {
  if (!WA_TOKEN || !WA_PHONE_ID) return
  await fetch(`https://graph.facebook.com/v20.0/${WA_PHONE_ID}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${WA_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
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

  if (fetchErr || !order) {
    return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
  }

  if (order.status !== 'en_attente_paiement') {
    return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
  }

  const { error: updateErr } = await supabase
    .from('orders')
    .update({ status: 'payé', reserved_until: null })
    .eq('id', params.id)

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

  const phone = order.client_phone ?? order.customer_phone
  const name = order.customer_name ?? ''
  const ref = order.payment_reference ?? order.transaction_id
  const pname = order.product_name ?? ''
  const price = (order.total_price ?? order.amount ?? 0).toLocaleString('fr-FR')
  const pcode = order.product_code ?? ''

  const customerMsg =
    `✅ *Paiement confirmé !*\n\n` +
    `Merci ${name} ! Votre commande *${ref}* a été validée.\n\n` +
    `📦 *${pname}* — ${price} FCFA\n\n` +
    `Notre livreur vous contactera très bientôt pour convenir du lieu de livraison. 🛵`

  await sendWhatsApp(phone, customerMsg)

  if (DRIVER_PHONE) {
    const driverMsg =
      `🛵 *Nouvelle livraison à préparer*\n\n` +
      `Réf: *${ref}*\n` +
      `Client: ${name || phone}\nTel: ${phone}\n` +
      `Produit: ${pname} (${pcode})\n` +
      `Montant: ${price} FCFA\n` +
      `Adresse: ${order.delivery_address ?? order.address ?? 'À confirmer avec le client'}`
    await sendWhatsApp(DRIVER_PHONE, driverMsg)
  }

  return NextResponse.json({ ok: true })
}
