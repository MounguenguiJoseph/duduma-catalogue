'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ImageUpload from '@/components/ImageUpload'

export default function NouveauProduitPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', code: '', description: '', price: '',
    stock: '0', image_url: '', is_active: true,
  })

  function set(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, price: Number(form.price), stock: Number(form.stock) }),
    })
    const data = await res.json()
    if (res.ok) {
      router.push('/admin/produits')
    } else {
      setError(data.error ?? 'Erreur')
      setSaving(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/produits" className="text-gray-400 hover:text-black text-sm">← Retour</Link>
        <h1 className="text-xl font-bold">Nouveau produit</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
          <ImageUpload value={form.image_url} onChange={url => set('image_url', url)} />
        </div>

        {/* Nom */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom <span className="text-red-500">*</span></label>
          <input
            type="text" required value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="Ex: T-shirt Blanc Logo"
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-black"
          />
        </div>

        {/* Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Code produit <span className="text-red-500">*</span></label>
          <input
            type="text" required value={form.code}
            onChange={e => set('code', e.target.value.toUpperCase())}
            placeholder="Ex: TSH001"
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm font-mono uppercase focus:outline-none focus:border-black"
          />
          <p className="text-xs text-gray-400 mt-1">Le client utilisera ce code pour commander via WhatsApp</p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={form.description} onChange={e => set('description', e.target.value)}
            rows={3} placeholder="Description du produit..."
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-black resize-none"
          />
        </div>

        {/* Prix + Stock */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prix (FCFA) <span className="text-red-500">*</span></label>
            <input
              type="number" required min={0} value={form.price} onChange={e => set('price', e.target.value)}
              placeholder="5000"
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
            <input
              type="number" min={0} value={form.stock} onChange={e => set('stock', e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-black"
            />
          </div>
        </div>

        {/* Actif */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox" checked={form.is_active}
            onChange={e => set('is_active', e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm text-gray-700">Produit visible dans le catalogue</span>
        </label>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit" disabled={saving}
          className="w-full bg-black text-white py-3 rounded-xl font-semibold disabled:opacity-40"
        >
          {saving ? 'Enregistrement...' : 'Créer le produit'}
        </button>
      </form>
    </div>
  )
}
