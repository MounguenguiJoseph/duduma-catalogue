import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, code, description, price, stock, image_url, is_active } = body

  if (!name || !code || price == null) {
    return NextResponse.json({ error: 'Champs obligatoires: name, code, price' }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('products')
    .insert({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description?.trim() || null,
      price: Number(price),
      stock: Number(stock ?? 0),
      image_url: image_url || null,
      is_active: is_active !== false,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
