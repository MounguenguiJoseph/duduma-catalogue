import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('products')
    .update({
      name: body.name?.trim(),
      code: body.code?.trim().toUpperCase(),
      description: body.description?.trim() || null,
      price: Number(body.price),
      stock: Number(body.stock ?? 0),
      image_url: body.image_url || null,
      is_active: body.is_active !== false,
    })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('products')
    .update({ is_active: false })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
