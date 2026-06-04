'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Product, ProductVariant, getProductByCode, getProductVariants } from '@/lib/products'
import { buildOrderMessage } from '@/lib/whatsapp'
import VariantSelector from '@/components/VariantSelector'
import StockBadge from '@/components/StockBadge'
import PriceDisplay from '@/components/PriceDisplay'
import SkeletonCard from '@/components/SkeletonCard'

export default function ProductPage() {
  const params = useParams()
  const code = (params.code as string).toUpperCase()

  const [product, setProduct] = useState<Product | null>(null)
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [loading, setLoading] = useState(true)
  const [outOfStockModal, setOutOfStockModal] = useState(false)

  useEffect(() => {
    async function load() {
      const p = await getProductByCode(code)
      setProduct(p)
      if (p) {
        const v = await getProductVariants(p.id)
        setVariants(v)
        const firstAvailable = v.find(x => x.stock > 0) ?? v[0] ?? null
        setSelectedVariant(firstAvailable)
      }
      setLoading(false)
    }
    load()
  }, [code])

  if (loading) {
    return (
      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="w-full aspect-square bg-gray-200 rounded-xl animate-pulse mb-4" />
        <SkeletonCard />
      </main>
    )
  }

  if (!product) {
    return (
      <main className="max-w-lg mx-auto px-4 py-6 text-center">
        <p className="text-gray-500 my-12">Produit introuvable.</p>
        <Link href="/catalogue" className="text-sm underline">← Retour catalogue</Link>
      </main>
    )
  }

  const images: string[] = product.image_urls?.length
    ? product.image_urls
    : product.image_url
      ? [product.image_url]
      : []

  const effectiveStock = selectedVariant ? selectedVariant.stock : product.stock
  const priceAdjustment = selectedVariant?.price_adjustment ?? 0
  const orderSku = selectedVariant?.sku ?? product.code
  const orderHref = buildOrderMessage(product.code, selectedVariant?.sku)
  const hasVariants = variants.length > 0
  const canOrder = effectiveStock > 0

  function handleOrder() {
    if (!canOrder) {
      setOutOfStockModal(true)
      return
    }
    window.open(orderHref, '_blank', 'noopener,noreferrer')
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-6">
      <Link href="/catalogue" className="text-sm text-gray-500 mb-4 inline-flex items-center gap-1">
        <span>←</span> Catalogue
      </Link>

      {/* Galerie */}
      <div className="relative aspect-square w-full bg-gray-50 rounded-xl overflow-hidden mb-4">
        {images.length > 0 ? (
          <Image
            src={images[0]}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Miniatures si plusieurs images */}
      {images.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <div key={i} className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
              <Image src={src} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Infos */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-xl font-bold leading-tight">{product.name}</h1>
          <StockBadge stock={effectiveStock} />
        </div>

        <PriceDisplay price={product.price} adjustment={priceAdjustment} className="text-xl" />

        {product.description && (
          <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
        )}

        <p className="text-xs text-gray-400">Code : {product.code}</p>

        {hasVariants && (
          <VariantSelector
            variants={variants}
            selectedVariantId={selectedVariant?.id ?? null}
            onSelect={setSelectedVariant}
          />
        )}

        {/* Bouton Commander — fallback href direct même sans JS */}
        <a
          href={canOrder ? orderHref : undefined}
          onClick={e => { e.preventDefault(); handleOrder() }}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-white text-sm transition-opacity
            ${canOrder ? 'bg-green-500 hover:opacity-90' : 'bg-gray-300 cursor-not-allowed'}
          `}
          aria-disabled={!canOrder}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Commander sur WhatsApp
        </a>
      </div>

      {/* Modale rupture de stock */}
      {outOfStockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl p-6 max-w-xs w-full text-center space-y-3">
            <p className="font-semibold">Ce produit est en rupture de stock</p>
            <p className="text-sm text-gray-500">Revenez bientôt ou contactez-nous sur WhatsApp.</p>
            <button
              onClick={() => setOutOfStockModal(false)}
              className="w-full py-2 rounded-lg border border-gray-300 text-sm"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
