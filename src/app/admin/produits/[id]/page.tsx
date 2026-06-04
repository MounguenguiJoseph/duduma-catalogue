'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import ImageUpload from '@/components/ImageUpload'

interface Variant {
  id: string
  size: string | null
  color: string | null
  color_hex: string
  price_adjustment: number
  stock: number
  sku: string
}

interface ProductFull {
  id: string
  name: string
  code: string
  description: string | null
  price: number
  stock: number
  image_url: string | null
  is_active: boolean
}

export default function EditProduitPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', code: '', description: '', price: '',
    stock: '0', image_url: '', is_active: true,
  })
  const [variants, setVariants] = useState<Variant[]>([])
  const [showVariantForm, setShowVariantForm] = useState(false)
  const [newVariant, setNewVariant] = useState({ size: '', color: '', color_hex: '#000000', price_adjustment: '0', stock: '0', sku: '' })
  const [variantError, setVariantError] = useState('')

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/admin/products')
      const all = await res.json()
      const p: ProductFull = all.find((x: ProductFull) => x.id === id)
      if (p) {
        setForm({
          name: p.name, code: p.code, description: p.description ?? '',
          price: String(p.price), stock: String(p.stock),
          image_url: p.image_url ?? '', is_active: p.is_active,
        })
      }
      // Load variants
      const vRes = await fetch(`/api/admin/products/${id}/variants`)
      if (vRes.ok) setVariants(await vRes.json())
      setLoading(false)
    }
    load()
  }, [id])

  function set(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PUT',
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

  async function addVariant() {
    setVariantError('')
    if (!newVariant.sku) { setVariantError('SKU obligatoire'); return }
    const res = await fetch(`/api/admin/products/${id}/variants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        size: newVariant.size || null,
        color: newVariant.color || null,
        color_hex: newVariant.color_hex,
        price_adjustment: Number(newVariant.price_adjustment),
        stock: Number(newVariant.stock),
        sku: newVariant.sku.toUpperCase(),
      }),
    })
    const data = await res.json()
    if (res.ok) {
      setVariants(v => [...v, data])
      setNewVariant({ size: '', color: '', color_hex: '#000000', price_adjustment: '0', stock: '0', sku: '' })
      setShowVariantForm(false)
    } else {
      setVariantError(data.error ?? 'Erreur')
    }
  }

  async function deleteVariant(variantId: string) {
    await fetch(`/api/admin/products/${id}/variants/${variantId}`, { method: 'DELETE' })
    setVariants(v => v.filter(x => x.id !== variantId))
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin" /></div>

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/produits" className="text-gray-400 hover:text-black text-sm">← Retour</Link>
        <h1 className="text-xl font-bold">Modifier produit</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
          <ImageUpload value={form.image_url} onChange={url => set('image_url', url)} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom <span className="text-red-500">*</span></label>
          <input type="text" required value={form.name} onChange={e => set('name', e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-black" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Code produit <span className="text-red-500">*</span></label>
          <input type="text" required value={form.code} onChange={e => set('code', e.target.value.toUpperCase())}
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm font-mono uppercase focus:outline-none focus:border-black" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-black resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prix (FCFA) <span className="text-red-500">*</span></label>
            <input type="number" required min={0} value={form.price} onChange={e => set('price', e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
            <input type="number" min={0} value={form.stock} onChange={e => set('stock', e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-black" />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} className="w-4 h-4 rounded" />
          <span className="text-sm text-gray-700">Produit visible dans le catalogue</span>
        </label>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" disabled={saving}
          className="w-full bg-black text-white py-3 rounded-xl font-semibold disabled:opacity-40">
          {saving ? 'Enregistrement...' : 'Sauvegarder'}
        </button>
      </form>

      {/* Variantes */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-base">Variantes (taille / couleur)</h2>
          <button onClick={() => setShowVariantForm(v => !v)}
            className="text-sm text-black underline">
            {showVariantForm ? 'Annuler' : '+ Ajouter'}
          </button>
        </div>

        {showVariantForm && (
          <div className="border border-gray-200 rounded-xl p-4 space-y-3 mb-3 bg-gray-50">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500">Taille</label>
                <input type="text" value={newVariant.size} onChange={e => setNewVariant(v => ({...v, size: e.target.value}))}
                  placeholder="S, M, L, XL..." className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Couleur</label>
                <input type="text" value={newVariant.color} onChange={e => setNewVariant(v => ({...v, color: e.target.value}))}
                  placeholder="Rouge, Bleu..." className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Code couleur</label>
                <div className="flex gap-1">
                  <input type="color" value={newVariant.color_hex} onChange={e => setNewVariant(v => ({...v, color_hex: e.target.value}))}
                    className="w-10 h-9 rounded cursor-pointer border border-gray-300" />
                  <input type="text" value={newVariant.color_hex} onChange={e => setNewVariant(v => ({...v, color_hex: e.target.value}))}
                    className="flex-1 border border-gray-300 rounded-lg px-2 text-xs font-mono focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500">SKU <span className="text-red-500">*</span></label>
                <input type="text" value={newVariant.sku} onChange={e => setNewVariant(v => ({...v, sku: e.target.value.toUpperCase()}))}
                  placeholder="TSH001-S-RGE" className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm font-mono focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Ajust. prix (FCFA)</label>
                <input type="number" value={newVariant.price_adjustment} onChange={e => setNewVariant(v => ({...v, price_adjustment: e.target.value}))}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Stock</label>
                <input type="number" min={0} value={newVariant.stock} onChange={e => setNewVariant(v => ({...v, stock: e.target.value}))}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
              </div>
            </div>
            {variantError && <p className="text-red-500 text-xs">{variantError}</p>}
            <button type="button" onClick={addVariant}
              className="w-full bg-black text-white py-2 rounded-lg text-sm font-medium">
              Ajouter la variante
            </button>
          </div>
        )}

        {variants.length === 0 ? (
          <p className="text-sm text-gray-400">Aucune variante — les clients commandent directement avec le code produit.</p>
        ) : (
          <div className="space-y-2">
            {variants.map(v => (
              <div key={v.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-white text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: v.color_hex }} />
                  <span className="font-mono text-xs">{v.sku}</span>
                  {v.size && <span className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{v.size}</span>}
                  {v.color && <span className="text-gray-500 text-xs">{v.color}</span>}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Stock: {v.stock}</span>
                  {v.price_adjustment !== 0 && <span>{v.price_adjustment > 0 ? '+' : ''}{v.price_adjustment} FCFA</span>}
                  <button onClick={() => deleteVariant(v.id)} className="text-red-400 hover:text-red-600">✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
