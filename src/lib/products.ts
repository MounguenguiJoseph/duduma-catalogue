import { supabase } from './supabase'

export interface Product {
  id: string
  code: string
  name: string
  description: string | null
  price: number
  stock: number
  image_url: string | null
  image_urls?: string[] | null
  is_active: boolean
}

export interface ProductVariant {
  id: string
  product_id: string
  size: string | null
  color: string | null
  color_hex: string
  price_adjustment: number
  stock: number
  sku: string
}

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('id,code,name,description,price,stock,image_url,image_urls,is_active')
    .eq('is_active', true)
    .order('name')

  if (error) throw error
  return data ?? []
}

export async function getProductByCode(code: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('id,code,name,description,price,stock,image_url,image_urls,is_active')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single()

  if (error) return null
  return data
}

export async function getProductVariants(productId: string): Promise<ProductVariant[]> {
  const { data, error } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', productId)
    .order('size')
    .order('color')

  if (error) return []
  return data ?? []
}
