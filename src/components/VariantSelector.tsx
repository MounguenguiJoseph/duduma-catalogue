'use client'

import { ProductVariant } from '@/lib/products'

interface VariantSelectorProps {
  variants: ProductVariant[]
  selectedVariantId: string | null
  onSelect: (variant: ProductVariant) => void
}

export default function VariantSelector({ variants, selectedVariantId, onSelect }: VariantSelectorProps) {
  const sizes = Array.from(new Set(variants.map(v => v.size).filter(Boolean))) as string[]
  const colors = Array.from(new Set(variants.map(v => v.color).filter(Boolean))) as string[]
  const selectedVariant = variants.find(v => v.id === selectedVariantId) ?? null

  function handleSizeClick(size: string) {
    const match = variants.find(v =>
      v.size === size && (selectedVariant?.color ? v.color === selectedVariant.color : true) && v.stock > 0
    ) ?? variants.find(v => v.size === size)
    if (match) onSelect(match)
  }

  function handleColorClick(color: string) {
    const match = variants.find(v =>
      v.color === color && (selectedVariant?.size ? v.size === selectedVariant.size : true) && v.stock > 0
    ) ?? variants.find(v => v.color === color)
    if (match) onSelect(match)
  }

  return (
    <div className="space-y-4">
      {sizes.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Taille</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map(size => {
              const available = variants.some(v => v.size === size && v.stock > 0)
              const selected = selectedVariant?.size === size
              return (
                <button
                  key={size}
                  onClick={() => handleSizeClick(size)}
                  disabled={!available}
                  className={`px-3 py-1.5 rounded border text-sm font-medium transition-colors
                    ${selected ? 'border-black bg-black text-white' : 'border-gray-300 text-gray-700'}
                    ${!available ? 'opacity-40 cursor-not-allowed line-through' : 'hover:border-black'}
                  `}
                >
                  {size}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {colors.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Couleur</p>
          <div className="flex flex-wrap gap-2">
            {colors.map(color => {
              const variantForColor = variants.find(v => v.color === color)
              const hex = variantForColor?.color_hex ?? '#000000'
              const available = variants.some(v => v.color === color && v.stock > 0)
              const selected = selectedVariant?.color === color
              return (
                <button
                  key={color}
                  onClick={() => handleColorClick(color)}
                  disabled={!available}
                  title={color}
                  aria-label={color}
                  className={`w-8 h-8 rounded-full border-2 transition-all
                    ${selected ? 'border-black scale-110' : 'border-gray-200'}
                    ${!available ? 'opacity-40 cursor-not-allowed' : 'hover:border-gray-500'}
                  `}
                  style={{ backgroundColor: hex }}
                />
              )
            })}
          </div>
          {selectedVariant?.color && (
            <p className="text-xs text-gray-500 mt-1">{selectedVariant.color}</p>
          )}
        </div>
      )}
    </div>
  )
}
