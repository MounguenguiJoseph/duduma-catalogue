import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id, payment_reference, client_phone, customer_name,
      product_name, product_code, amount, total_price,
      created_at, reserved_until, status,
      customers!orders_client_phone_fkey(is_vip, completed_orders_count)
    `)
    .eq('status', 'en_attente_paiement')
    .not('reserved_until', 'is', null)
    .gt('reserved_until', new Date().toISOString())
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
