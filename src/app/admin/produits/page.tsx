'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/format'

interface Product {
  id: string
  code: string
  name: string
  price: number
  stock: number
  is_active: boolean
  image_url: string | null
}

export default function AdminProduitsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/products')
    const data = await res.json()
    setProducts(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function toggleActive(id: string, current: boolean) {
    await fetch(`/api/admin/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !current }),
    })
    load()
  }

  async function handleLogout() {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    window.location.href = '/admin/login'
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Produits</h1>
          <p className="text-sm text-gray-500">{products.length} article{products.length > 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/produits/nouveau"
            className="bg-black text-white px-4 py-2 rounded-xl text-sm font-semibold"
          >
            + Ajouter
          </Link>
          <button
            onClick={handleLogout}
            className="border border-gray-300 px-3 py-2 rounded-xl text-sm text-gray-500"
          >
            Déco
          </button>
        </div>
      </div>

      {/* Recherche */}
      <input
        type="search"
        placeholder="Rechercher..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:border-black"
      />

      {/* Liste */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-400 py-12 text-sm">Aucun produit.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => (
            <div
              key={p.id}
              className={`flex items-center gap-3 p-3 rounded-xl border ${
                p.is_active ? 'border-gray-100 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'
              }`}
            >
              {/* Image */}
              <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                {p.image_url ? (
                  <Image src={p.image_url} alt={p.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">IMG</div>
                )}
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{p.name}</p>
                <p className="text-xs text-gray-500">{p.code} · {formatPrice(p.price)} · stock: {p.stock}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-1 flex-shrink-0">
                <Link
                  href={`/admin/produits/${p.id}`}
                  className="text-xs px-2 py-1 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Modifier
                </Link>
                <button
                  onClick={() => toggleActive(p.id, p.is_active)}
                  className={`text-xs px-2 py-1 rounded-lg ${
                    p.is_active
                      ? 'bg-red-50 text-red-600 border border-red-100'
                      : 'bg-green-50 text-green-600 border border-green-100'
                  }`}
                >
                  {p.is_active ? 'Désactiver' : 'Activer'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lien catalogue */}
      <div className="mt-8 text-center">
        <Link href="/catalogue" className="text-sm text-gray-400 hover:underline" target="_blank">
          Voir le catalogue public →
        </Link>
      </div>
    </div>
  )
}
