'use client'

import { useState } from 'react'
import { Product } from '@/lib/products'
import ProductCard from './ProductCard'
import SkeletonCard from './SkeletonCard'

interface ProductGridProps {
  products: Product[]
  loading?: boolean
}

export default function ProductGrid({ products, loading = false }: ProductGridProps) {
  const [query, setQuery] = useState('')
  const [availableOnly, setAvailableOnly] = useState(false)

  const filtered = products.filter(p => {
    const matchesQuery =
      query === '' ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.code.toLowerCase().includes(query.toLowerCase())
    const matchesStock = !availableOnly || p.stock > 0
    return matchesQuery && matchesStock
  })

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center">
        <input
          type="search"
          placeholder="Rechercher un article..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
        />
        <label className="flex items-center gap-1.5 text-sm text-gray-600 whitespace-nowrap cursor-pointer">
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={e => setAvailableOnly(e.target.checked)}
            className="rounded"
          />
          Dispo
        </label>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-400 py-12 text-sm">Aucun produit trouvé.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {filtered.map(p => (
            <ProductCard key={p.code} {...p} />
          ))}
        </div>
      )}
    </div>
  )
}
