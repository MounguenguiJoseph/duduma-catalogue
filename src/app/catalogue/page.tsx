import { getAllProducts, type Product } from '@/lib/products'
import ProductGrid from '@/components/ProductGrid'

export const revalidate = 60

export default async function CataloguePage() {
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME ?? 'Duduma'
  let products: Product[] = []
  try {
    products = await getAllProducts()
  } catch {
    // Affiche grille vide si erreur Supabase
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">{storeName}</h1>
        <p className="text-sm text-gray-500 mt-1">Choisissez votre article et commandez via WhatsApp</p>
      </header>
      <ProductGrid products={products} />
    </main>
  )
}
