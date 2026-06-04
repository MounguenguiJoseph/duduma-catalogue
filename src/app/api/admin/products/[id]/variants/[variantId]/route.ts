import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function DELETE(_: NextRequest, { params }: { params: { id: string; variantId: string } }) {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('product_variants')
    .delete()
    .eq('id', params.variantId)
    .eq('product_id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
